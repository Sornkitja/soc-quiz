import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, onValue, get } from 'firebase/database';

export default function LeaderboardPage() {
  const room = 'SOC-QUIZ';
  const [players, setPlayers] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [myPlayer, setMyPlayer] = useState<any>(null);

  useEffect(() => {
    const pRef = ref(db, `players/${room}`);
    const unsubP = onValue(pRef, (snap) => {
      const raw = snap.val();
      if (raw) {
        const list = Object.entries(raw).map(([id, data]) => ({
          id,
          ...data,
        }));
        list.sort((a, b) => b.score - a.score || a.totalTime - b.totalTime);
        setPlayers(list);

        const id = localStorage.getItem('playerId') || '';
        const me = raw[id];
        if (me) {
          setMyPlayer({ id, ...me });
        } else {
          setMyPlayer(null);
        }
      }
    });

    get(ref(db, `questions/${room}`)).then((snap) => {
      if (snap.exists()) {
        setQuestions(snap.val());
      }
    });

    return () => unsubP();
  }, [room]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-orange-200 p-6 flex flex-col items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">

        {myPlayer && (
          <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded text-green-800 text-center">
            ✅ คุณตอบถูกทั้งหมด <strong>{myPlayer.score}</strong> ข้อ
            ⏱️ ใช้เวลา <strong>{myPlayer.totalTime}</strong> วินาที
          </div>
        )}

        <h1 className="text-2xl font-bold mb-4">🏆 สรุปผลคะแนน</h1>

        <ol className="list-decimal list-inside mb-6">
          {players.slice(0, 10).map((p, i) => (
            <li key={i} className="mb-1">
              {p.name} — {p.score} คะแนน, เวลา {p.totalTime}s
            </li>
          ))}
        </ol>

        <h2 className="text-xl font-bold mb-3">📜 เฉลยคำถาม</h2>
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={i} className="pb-2 border-b border-gray-300">
              <hr className="mb-2 border-t border-gray-400" />
              <p className="font-semibold mb-2">
                {i + 1}. {q.question}
              </p>
              <ul className="list-disc list-inside ml-6 space-y-1">
                {q.choices.map((c: string, idx: number) => (
                  <li
                    key={idx}
                    className={
                      Number(q.answer) === idx + 1
                        ? 'text-green-600 font-bold'
                        : ''
                    }
                  >
                    {['A', 'B', 'C', 'D'][idx]}. {c}
                  </li>
                ))}
              </ul>
              <hr className="mt-2 border-t border-gray-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
