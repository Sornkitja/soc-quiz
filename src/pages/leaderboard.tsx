// src/pages/leaderboard.tsx

import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

interface Player {
  name: string;
  score: number;
  totalTime: number;
}

export default function LeaderboardPage() {
  const room = localStorage.getItem('roomCode') || 'SOC-QUIZ';
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const playersRef = ref(db, `players/${room}`);
    return onValue(playersRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list: Player[] = Object.values(data);
      list.sort((a, b) =>
        b.score === a.score ? a.totalTime - b.totalTime : b.score - a.score
      );
      setPlayers(list.slice(0, 10)); // Top 10
    });
  }, [room]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center p-6"
      style={{ backgroundImage: "url('/bg-leaderboard.jpg')" }}
    >
      <div className="bg-white bg-opacity-90 rounded-lg p-6 w-full max-w-xl text-center shadow-lg">
        <h1 className="text-2xl font-bold mb-4">🏆 Leaderboard สรุปผล</h1>
        <div className="w-full text-left text-sm">
          <div className="flex justify-between font-bold border-b pb-2 mb-2">
            <span>ชื่อ</span>
            <span>คะแนน</span>
            <span>เวลารวม</span>
          </div>
          {players.map((p, idx) => (
            <div key={idx} className="flex justify-between py-1">
              <span>{p.name}</span>
              <span>{p.score}</span>
              <span>{p.totalTime}s</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-gray-600 text-sm">
          จัดอันดับ: ข้อถูกมาก → เวลาน้อยสุด
        </p>
      </div>
    </div>
  );
}
