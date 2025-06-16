import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

export default function WaitingRoom() {
  const router = useRouter();
  const room = 'SOC-QUIZ';
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // ✅ ฟัง Game Status + Question แยก
  useEffect(() => {
    const gsRef = ref(db, `gameStatus/${room}`);
    const qRef = ref(db, `currentQuestion/${room}`);

    const unsubGS = onValue(gsRef, (snap) => {
      const status = snap.val();
      if (status === 'ended') {
        router.push('/leaderboard');
      }
    });

    const unsubQ = onValue(qRef, (snap) => {
      const q = snap.val();
      if (q) {
        router.push('/play');
      }
    });

    return () => {
      unsubGS();
      unsubQ();
    };
  }, []);

  // ✅ แสดง Leaderboard ย่อ (optional)
  useEffect(() => {
    const pRef = ref(db, `players/${room}`);
    const unsub = onValue(pRef, (snap) => {
      const raw = snap.val();
      if (raw) {
        const list = Object.values(raw) as any[];
        list.sort((a, b) => b.score - a.score || a.totalTime - b.totalTime);
        setLeaderboard(list);
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center p-6"
      style={{ backgroundImage: "url('/bg-waiting.png')" }}>
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-2">⏳ คุณอยู่ในห้องรอแล้ว</h1>

        {leaderboard.length > 0 && (
          <div className="text-left mt-4">
            <h2 className="font-semibold mb-2">📊 อันดับปัจจุบัน</h2>
            <ul className="space-y-1 text-sm">
              {leaderboard.slice(0, 5).map((p, i) => (
                <li key={i}>
                  {i + 1}. {p.name} - {p.score} คะแนน, {p.totalTime}s
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-4 text-gray-500 text-sm">
          โปรดรอผู้ดูแลเริ่มคำถาม...
        </p>
      </div>
    </div>
  );
}
