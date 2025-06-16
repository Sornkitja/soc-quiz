import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../firebase';
import { ref, onValue, update, remove, set } from 'firebase/database';

export default function PlayPage() {
  const router = useRouter();
  const [room, setRoom] = useState('SOC-QUIZ');
  const [playerId, setPlayerId] = useState('');

  const [question, setQuestion] = useState<any>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [startTime, setStartTime] = useState<number>(0);

// ✅ โหลด localStorage ฝั่ง client เท่านั้น
  useEffect(() => {
    const r = localStorage.getItem('roomCode') || 'SOC-QUIZ';
    const p = localStorage.getItem('playerId') || '';
    setRoom(r);
    setPlayerId(p);
  }, []);

  useEffect(() => {
  if (!room) return; // ป้องกันการรันก่อน room พร้อม
  const qRef = ref(db, `currentQuestion/${room}`);
  const unsub = onValue(qRef, (snapshot) => {
    const q = snapshot.val();
    if (q) {
      setQuestion(q);
      setSelected(null);
      setTimeLeft(30);
      setStartTime(Date.now());
    } else {
      router.push(`/waiting-room?room=${room}`);
    }
  });
  return () => unsub();
}, [room, router]);


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
    const duration = Math.floor((Date.now() - startTime) / 1000);
    await update(ref(db, `players/${room}/${playerId}`), {
      lastAnswer: selected || 'NO_ANSWER',
      lastTime: selected ? duration : 30,
    });
    await remove(ref(db, `currentQuestion/${room}`));
    await set(ref(db, `gameStatus/${room}`), 'waiting');
    router.push(`/waiting-room?room=${room}`);
  };

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <p className="text-lg font-bold">⏳ กำลังรอคำถามจากผู้ดูแล...</p>
      </div>
    );
  }

  const labels = ['A', 'B', 'C', 'D'];

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-6"
      style={{ backgroundImage: "url('/bg-play.png')" }}
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
              <span className="text-red-600 font-bold text-lg mr-3">{labels[idx]}</span>
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
