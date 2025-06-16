// src/pages/register.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../firebase';
import { ref, onValue, push, set } from 'firebase/database';
import { v4 as uuid } from 'uuid';

export default function Register() {
  const router = useRouter();
  const room = 'SOC-QUIZ';
  const [name, setName] = useState('');

  useEffect(() => {
    const statusRef = ref(db, `gameStatus/${room}`);
    const unsub = onValue(statusRef, (snap) => {
      const status = snap.val();
      if (status === 'playing') {
        alert('🚫 เกมกำลังดำเนินอยู่ ไม่สามารถเข้าร่วมได้');
        router.replace('/');
      } else if (status === 'ended') {
        alert('🚫 เกมจบแล้ว ไม่สามารถเข้าร่วมได้');
        router.replace('/');
      }
    });
    return () => unsub();
  }, []);

  const handleRegister = async () => {
    if (!name.trim()) return;
    const playerId = uuid();
    await set(ref(db, `players/${room}/${playerId}`), {
      name,
      score: 0,
      totalTime: 0,
    });
    localStorage.setItem('playerId', playerId);
    localStorage.setItem('roomCode', room);
    router.push(`/waiting-room?room=${room}`);
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center p-6"
      style={{ backgroundImage: "url('/bg-firstpage.png')" }}>
      <div className="bg-white bg-opacity-90 p-6 rounded shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">📋 ลงทะเบียน</h1>
        <input
          type="text"
          placeholder="ชื่อของคุณ"
          className="border p-3 rounded w-full mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={handleRegister}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded font-bold w-full"
        >
          ✅ เข้าห้องรอ
        </button>
      </div>
    </div>
  );
}
