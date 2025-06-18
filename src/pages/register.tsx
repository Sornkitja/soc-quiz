// src/pages/register.tsx

import { useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../firebase';
import { ref, set } from 'firebase/database';

export default function RegisterPage() {
  const router = useRouter();
  const room = 'SOC-QUIZ';

  const [name, setName] = useState('');

  const handleRegister = async () => {
    if (name.trim() === '') {
      alert('กรุณากรอกชื่อก่อนเข้าสู่ห้องรอ');
      return;
    }

    const playerId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await set(ref(db, `players/${room}/${playerId}`), {
      name: name.trim(),
      score: 0,
      totalTime: 0,
    });

    localStorage.setItem('playerId', playerId);
    localStorage.setItem('roomCode', room);

    router.push('/waiting-room');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-200 to-blue-200">
      <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold mb-4">📝 ลงทะเบียนเข้าสู่เกม</h1>
        <input
          type="text"
          placeholder="ชื่อของคุณ"
          className="w-full px-4 py-2 border rounded mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-bold w-full"
          onClick={handleRegister}
        >
          ✅ เข้าห้องรอ
        </button>
      </div>
    </div>
  );
}
