// src/pages/admin-start.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../firebase';
import { ref, onValue, set, get } from 'firebase/database';

export default function AdminStart() {
  const router = useRouter();
  const room = 'SOC-QUIZ';

  const [questions, setQuestions] = useState<any[]>([]);
  const [playersCount, setPlayersCount] = useState<number>(0);

  useEffect(() => {
    const qRef = ref(db, `questions/${room}`);
    const unsubQ = onValue(qRef, (snap) => {
      const raw = snap.val();
      if (raw) setQuestions(raw);
    });

    const pRef = ref(db, `players/${room}`);
    const unsubP = onValue(pRef, (snap) => {
      const raw = snap.val();
      if (raw) {
        const list = Object.values(raw);
        setPlayersCount(list.length);
      } else {
        setPlayersCount(0);
      }
    });

    return () => {
      unsubQ();
      unsubP();
    };
  }, []);

  const handleStart = async () => {
    // ✅ ป้องกันกรณีกด Start โดยไม่มีผู้เล่น
    const pSnap = await get(ref(db, `players/${room}`));
    if (!pSnap.exists()) {
      alert('⛔ ต้องมีผู้เล่นอย่างน้อย 1 คนก่อนเริ่มเกม!');
      return;
    }

    await set(ref(db, `gameStatus/${room}`), 'playing');
    await set(ref(db, `adminStatus/${room}/currentIndex`), 0);
    router.push('/admin-play');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-200 to-yellow-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">⚙️ พร้อมเริ่มเกม</h1>
        <p className="mb-2">คำถามทั้งหมด: <strong>{questions.length}</strong> ข้อ</p>
        <p className="mb-4">จำนวนผู้เล่นในห้อง: <strong>{playersCount}</strong> คน</p>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-bold"
          onClick={handleStart}
        >
          ▶️ เริ่มเกม
        </button>
      </div>
    </div>
  );
}
