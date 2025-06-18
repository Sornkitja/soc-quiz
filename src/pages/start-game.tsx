// src/pages/start-game.tsx

import { useRouter } from 'next/router';
import { db } from '../firebase';
import { ref, set } from 'firebase/database';

export default function StartGamePage() {
  const router = useRouter();
  const room = 'SOC-QUIZ';

  const handleStart = async () => {
    await set(ref(db, `gameStatus/${room}`), 'playing');
    await set(ref(db, `adminStatus/${room}/currentIndex`), 0);
    router.push('/admin-play');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-200 to-yellow-100">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">⚡ เริ่มเกม (โหมดทดสอบ)</h1>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-bold"
          onClick={handleStart}
        >
          ▶️ เริ่มเกมทันที
        </button>
      </div>
    </div>
  );
}
