// src/pages/admin-start.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../firebase';
import { ref, onValue, set } from 'firebase/database';

export default function AdminStart() {
  const room = 'SOC-QUIZ';
  const router = useRouter();

  // ✅ Block Auth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('adminAuth');
      if (auth !== 'true') {
        router.push('/admin-login');
      }
    }
  }, []);

  const [playerCount, setPlayerCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => {
    const pRef = ref(db, `players/${room}`);
    const unsubP = onValue(pRef, (snap) => {
      const raw = snap.val();
      if (raw) {
        setPlayerCount(Object.keys(raw).length);
      } else {
        setPlayerCount(0);
      }
    });

    const qRef = ref(db, `questions/${room}`);
    const unsubQ = onValue(qRef, (snap) => {
      const raw = snap.val();
      if (raw) {
        setQuestionCount(raw.length);
      } else {
        setQuestionCount(0);
      }
    });

    return () => {
      unsubP();
      unsubQ();
    };
  }, [room]);

  const handleStart = async () => {
    await set(ref(db, `gameStatus/${room}`), 'playing');
    await set(ref(db, `adminStatus/${room}/currentIndex`), 0);
    router.push('/admin-play');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-200 to-pink-200">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">▶️ เริ่มเกม</h1>
        <p className="mb-2">ผู้เล่น: {playerCount} คน</p>
        <p className="mb-4">จำนวนคำถาม: {questionCount} ข้อ</p>
        <button
          onClick={handleStart}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-bold"
        >
          เริ่มเกม
        </button>
      </div>
    </div>
  );
}
