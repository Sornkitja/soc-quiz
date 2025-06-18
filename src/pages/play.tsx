// src/pages/play.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../firebase';
import { ref, onValue, update } from 'firebase/database';

export default function PlayPage() {
  const router = useRouter();
  const room = 'SOC-QUIZ';

  const [playerId, setPlayerId] = useState('');
  const [question, setQuestion] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    const p = localStorage.getItem('playerId') || '';
    setPlayerId(p);
  }, []);

  useEffect(() => {
    const gsRef = ref(db, `gameStatus/${room}`);
    const unsubGS = onValue(gsRef, (snap) => {
      const status = snap.val();
      if (status !== 'playing') {
        router.push('/waiting-room');
      }
    });
    return () => unsubGS();
  }, [room]);

  useEffect(() => {
    const qRef = ref(db, `currentQuestion/${room}`);
    const unsubQ = onValue(qRef, (snap) => {
      const q = snap.val();
      if (q) {
        setQuestion(q);
        setCurrentIndex(q.index ?? 0);
        setSelected(null);
        setTimeLeft(30);
        setStartTime(Date.now());
      } else {
        setQuestion(null);
        router.push('/waiting-room');
      }
    });
    return () => unsubQ();
  }, [room]);

  useEffect(() => {
    if (!question) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, question]);

  const handleSubmit = async () => {
    if (!question) return;
    const duration = Math.min(Math.floor((Date.now() - startTime) / 1000), 30);
    const isCorrect = selected === question.choices[Number(question.answer) - 1];

    await update(ref(db, `players/${room}/${playerId}`), {
      lastAnswer: selected || 'NO_ANSWER',
      lastTime: selected ? duration : 30,
      answeredQuestionId: currentIndex,
      scoreIncrement: isCorrect ? 1 : 0,
    });

    // ใช้ Firebase Trigger หรือ update score ที่นี่:
    const playerRef = ref(db, `players/${room}/${playerId}`);
    onValue(playerRef, (snap) => {
      if (snap.exists()) {
        const player = snap.val();
        const newScore = (player.score || 0) + (isCorrect ? 1 : 0);
        const newTotalTime = (player.totalTime || 0) + duration;
        update(playerRef, {
          score: newScore,
          totalTime: newTotalTime,
        });
      }
    }, { onlyOnce: true });

    router.push('/waiting-room');
  };

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <p className="text-lg font-bold">⏳ กำลังรอคำถามจากผู้ดูแล...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-6"
      style={{ backgroundImage: "url('/bg-play.jpg')" }}
    >
      <div className="bg-white bg-opacity-90 rounded-lg p-6 w-full max-w-xl text-center shadow-lg">
        <h2 className="text-xl font-bold mb-2">⏱️ เวลาที่เหลือ: {timeLeft} วินาที</h2>
        <p className="mb-4">{question.question}</p>
        <div className="grid gap-3 mb-4">
          {question.choices.map((choice: string, idx: number) => (
            <button
              key={idx}
              onClick={() => setSelected(choice)}
              className={`flex items-center p-3 rounded border text-left w-full transition ${
                selected === choice ? 'bg-orange-200' : 'bg-white'
              }`}
            >
              <span className="text-red-600 font-bold text-lg mr-3">{['A','B','C','D'][idx]}</span>
              <span>{choice}</span>
            </button>
          ))}
        </div>
        <button
          onClick={handleSubmit}
          disabled={!selected}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded font-bold"
        >
          ส่งคำตอบ
        </button>
      </div>
    </div>
  );
}
