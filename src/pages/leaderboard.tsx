import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

interface Player {
  name: string;
  correctCount: number;
  totalTime: number;
}

export default function Leaderboard() {
  const room = 'SOC-QUIZ';
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const playersRef = ref(db, `players/${room}`);
    const unsub = onValue(playersRef, (snap) => {
      const val = snap.val() || {};
      const arr = Object.values(val) as any[];
      const sorted = arr
        .map(p => ({
          name: p.name || '',
          correctCount: p.correctCount || 0,
          totalTime: p.totalTime || 0
        }))
        .sort((a, b) => b.correctCount - a.correctCount || a.totalTime - b.totalTime)
        .slice(0, 10);
      setPlayers(sorted);
    });

    return () => unsub();
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-cover bg-center"
      style={{ backgroundImage: "url('/bg-leaderboard.png')" }}
    >
      <div className="bg-white bg-opacity-90 p-6 rounded shadow max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">🏆 Leaderboard</h1>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">ชื่อ</th>
              <th className="py-2">ถูก</th>
              <th className="py-2">เวลา (วินาที)</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => (
              <tr key={i} className="border-b">
                <td className="py-1">{p.name}</td>
                <td className="py-1">{p.correctCount}</td>
                <td className="py-1">{p.totalTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
