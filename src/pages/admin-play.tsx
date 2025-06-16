// src/pages/admin-play.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../firebase';
import { ref, onValue, set } from 'firebase/database';

export default function AdminPlay() {
  const router = useRouter();
  const room = 'SOC-QUIZ';

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentQ, setCurrentQ] = useState<any>(null);

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // ✅ โหลด questions + currentIndex จาก Firebase
  useEffect(() => {
    const unsubQ = onValue(ref(db, `questions/${room}`), (snap) => {
      if (snap.exists()) {
        setQuestions(snap.val());
      }
    });

    const unsubIndex = onValue(ref(db, `adminStatus/${room}/currentIndex`), (snap) => {
      const idx = snap.val() ?? 0;
      setCurrentIndex(idx);
    });

    return () => {
      unsubQ();
      unsubIndex();
    };
  }, []);

  // ✅ Sync current question
  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      setCurrentQ(questions[currentIndex]);
    } else if (currentIndex >= questions.length) {
      set(ref(db, `gameStatus/${room}`), 'ended');
      router.push('/leaderboard');
    }
  }, [questions, currentIndex]);

  // ✅ Countdown timer for display
  useEffect(() => {
    if (!timerRunning) return;
    if (timeLeft <= 0) {
      setTimerRunning(false);
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, timerRunning]);

  const handleNext = async () => {
    await set(ref(db, `currentQuestion/${room}`), currentQ);
    await set(ref(db, `gameStatus/${room}`), 'playing');
    setTimeLeft(30);
    setTimerRunning(true);
  };

  const handleNextIndex = async () => {
    await set(ref(db, `adminStatus/${room}/currentIndex`), currentIndex + 1);
    await set(ref(db, `gameStatus/${room}`), 'waiting');
    await set(ref(db, `currentQuestion/${room}`), null);
    setTimerRunning(false);
  };

  return (
    <div className="min-h-screen bg-red-900 text-white flex flex-col items-center justify-center p-6">
      <div className="bg-white text-black rounded-lg p-6 max-w-md w-full shadow-lg text-center">
        <h1 className="text-xl font-bold mb-4">📢 Admin: ข้อ {currentIndex + 1}</h1>

        {timerRunning && (
          <h2 className="text-lg font-bold mb-4 text-red-600">⏱️ เวลาที่เหลือ: {timeLeft} วินาที</h2>
        )}

        {currentQ ? (
          <>
            <p className="mb-4 font-semibold">{currentQ.question}</p>
            <ul className="mb-4 text-left">
              {currentQ.choices.map((c: string, i: number) => (
                <li key={i} className="mb-1">
                  {['A', 'B', 'C', 'D'][i]}. {c}{' '}
                  {Number(currentQ.answer) === i + 1 && <strong>✅</strong>}
                </li>
              ))}
            </ul>
            <button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded mb-2"
              disabled={timerRunning}
            >
              ▶️ ปล่อยคำถามนี้
            </button>
            <button
              onClick={handleNextIndex}
              className="bg-green-600 hover:bg-green-700 text-white w-full py-3 rounded"
              disabled={!timerRunning}
            >
              ⏭️ ไปข้อถัดไป
            </button>
          </>
        ) : (
          <p>รอโหลดคำถาม...</p>
        )}
      </div>
    </div>
  );
}
