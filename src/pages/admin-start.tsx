// src/pages/admin-start.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../firebase';
import { ref, get, set } from 'firebase/database';

export default function AdminStart() {
  const router = useRouter();
  const room = 'SOC-QUIZ';
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const snap = await get(ref(db, `questions/${room}`));
      if (snap.exists()) {
        setQuestions(snap.val());
      }
    };
    fetchQuestions();
  }, []);

  const handleStart = async () => {
    await set(ref(db, `gameStatus/${room}`), 'playing');
    await set(ref(db, `adminStatus/${room}`), { currentIndex: 0 });
    router.push('/admin-play');
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center p-6"
      style={{ backgroundImage: "url('/bg-firstpage.png')" }}>
      <div className="bg-white bg-opacity-90 p-6 rounded shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">🎮 พร้อมเริ่มเกม</h1>
        <p className="mb-4">จำนวนคำถาม: {questions.length} ข้อ</p>
        <button
          onClick={handleStart}
          disabled={!questions.length}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-bold w-full"
        >
          ▶️ เริ่มเกม
        </button>
      </div>
    </div>
  );
}
