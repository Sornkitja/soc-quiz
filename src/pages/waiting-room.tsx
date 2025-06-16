import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

interface Player {
  name: string;
  correctCount: number;
  totalTime: number;
}

export default function WaitingRoom() {
  const router = useRouter();
  const room = 'SOC-QUIZ';
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameStatus, setGameStatus] = useState('waiting');

  // ✅ Listen players & status
  useEffect(() => {
    const playersRef = ref(db, `players/${room}`);
    const unsubPlayers = onValue(playersRef, (snap) => {
      const val = snap.val() || {};
      const arr = Object.values(val) as any[];
      const sorted = arr
        .map(p => ({
          name: p.name || '',
          correctCount: p.correctCount || 0,
          totalTime: p.totalTime || 0
        }))
        .sort((a, b) => b.correctCount - a.correctCount || a.totalTime - b.totalTime);
      setPlayers(sorted);
    });

    const statusRef = ref(db, `gameStatus/${room}`);
    const unsubStatus = onValue(statusRef, (snap) => {
      const val = snap.val();
      setGameStatus(val || 'waiting');
      // ถ้าเล่นอยู่ → ไปหน้า play
      if (val === 'playing') {
        router.push('/play');
      }
    });

    return () => {
      unsubPlayers();
      unsubStatus();
    };
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-cover bg-center"
      style={{ backgroundImage: "url('/bg-waiting.png')" }}
    >
      <div className="bg-white p-6 rounded shadow-md max-w-md w-full text-center">
        <h1 className="text-xl font-bold mb-4">⏳ คุณอยู่ในห้องรอแล้ว</h1>

        <h2 className="text-lg font-semibold mb-2">🏆 Leaderboard</h2>
        <ul className="text-sm mb-4">
          {players.map((p, i) => (
            <li key={i}>
              {p.name} - {p.correctCount} ถูกต้อง, {p.totalTime}s
            </li>
          ))}
        </ul>

        <p className="mb-4 text-gray-600">
          {gameStatus === 'waiting' && 'รอผู้ดูแลเริ่มเกม หรือข้อถัดไป...'}
          {gameStatus === 'ended' && 'เกมสิ้นสุดแล้ว!'}
        </p>

        {gameStatus === 'ended' && (
          <button
            onClick={() => router.push('/leaderboard')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded font-bold"
          >
            🏅 ดู Leaderboard
          </button>
        )}
      </div>
    </div>
  );
}
