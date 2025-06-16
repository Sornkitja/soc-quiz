// src/pages/register.tsx

import { useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../firebase';
import { ref, set } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [room, setRoom] = useState('SOC-QUIZ'); // กำหนดรหัสห้องตายตัว หรือให้กรอกเองก็ได้

  const handleRegister = async () => {
    if (!name.trim()) return;

    const playerId = uuidv4();
    await set(ref(db, `players/${room}/${playerId}`), {
      name,
      joinedAt: Date.now(),
      score: 0,
      totalTime: 0,
    });

    // Save info local เพื่อใช้งานต่อ
    localStorage.setItem('playerId', playerId);
    localStorage.setItem('playerName', name);
    localStorage.setItem('roomCode', room);

    // ไป waiting room
    router.push(`/waiting-room?room=${room}`);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: "url('/bg-firstpage.png')" }}
    >
      <div className="bg-white bg-opacity-80 rounded-lg p-6 max-w-md w-full text-center shadow-lg">
        <h1 className="text-2xl font-bold mb-4">🎓 เข้าร่วม SOC GAME</h1>
        <input
          type="text"
          placeholder="กรอกชื่อเล่นหรือรหัสนิสิต"
          maxLength={32}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded p-3 mb-4"
        />
        <button
          onClick={handleRegister}
          disabled={!name.trim()}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-lg shadow"
        >
          เข้าสู่ห้องรอ 🚀
        </button>
      </div>
    </div>
  );
}
