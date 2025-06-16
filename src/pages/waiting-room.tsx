import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

interface PlayerScore {
  name: string;
  score: number;
  totalTime: number;
}

export default function WaitingRoom() {
  const router = useRouter();
  const [room, setRoom] = useState('SOC-QUIZ'); // ✅ ใช้ useState แทน
  const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([]);
  const [gameStatus, setGameStatus] = useState('');

  // ✅ โหลดค่า room จาก localStorage เฉพาะฝั่ง client
  useEffect(() => {
    const r = localStorage.getItem('roomCode') || 'SOC-QUIZ';
    setRoom(r);
  }, []);

  useEffect(() => {
    if (!room) return;

    const statusRef = ref(db, `gameStatus/${room}`);
    const unsubStatus = onValue(statusRef, (snapshot) => {
      const status = snapshot.val() || '';
      setGameStatus(status);

      if (status === 'playing') {
        router.push('/play');
      }
    });

    const lbRef = ref(db, `players/${room}`);
    const unsubLB = onValue(lbRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list: PlayerScore[] = Object.values(data);
      list.sort((a, b) =>
        b.score === a.score ? a.totalTime - b.totalTime : b.score - a.score
      );
      setLeaderboard(list.slice(0, 10));
    });

    return () => {
      unsubStatus();
      unsubLB();
    };
  }, [room, router]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center p-6"
      style={{ backgroundImage: "url('/bg-waiting.png')" }}
    >
      <div className="bg-white px-6 py-3 rounded shadow mb-4">
        <h1 className="text-2xl font-bold">🌟 คุณอยู่ในห้องรอแล้ว 🌟</h1>
      </div>

      <div className="bg-white p-4 rounded shadow-md w-full max-w-md mb-6">
        <h2 className="text-lg font-semibold mb-2">
          {gameStatus === 'ended' ? '🏆 Final Leaderboard' : '🏆 Leaderboard'}
        </h2>
        <ul className="text-sm">
          {leaderboard.map((p, idx) => (
            <li key={idx}>
              {idx + 1}. {p.name} — {p.score} ถูก, {p.totalTime}s
            </li>
          ))}
        </ul>
      </div>

      {gameStatus === 'ended' ? (
        <p className="text-xl font-bold text-green-700">🎉 ขอบคุณที่ร่วมเล่น SOC QUIZ!</p>
      ) : (
        <p className="text-gray-800 font-medium">⏳ รอผู้ดูแลเริ่มเกม หรือข้อถัดไป...</p>
      )}
    </div>
  );
}
