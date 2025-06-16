import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

interface Player {
  name: string;
  score: number;
  totalTime: number;
}

interface Question {
  question: string;
  answer: string | number;
  choices: string[];
}

export default function Leaderboard() {
  const room = 'SOC-QUIZ';

  const [players, setPlayers] = useState<Player[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const pRef = ref(db, `players/${room}`);
    const unsubP = onValue(pRef, (snap) => {
      const raw = snap.val();
      if (raw) {
        const list = Object.values(raw) as Player[];
        // เรียง: ถูกเยอะสุด + เวลาใช้น้อยสุด
        list.sort((a, b) => b.score - a.score || a.totalTime - b.totalTime);
        setPlayers(list);
      }
    });

    const qRef = ref(db, `questions/${room}`);
    const unsubQ = onValue(qRef, (snap) => {
      const raw = snap.val();
      if (raw) {
        setQuestions(raw);
      }
    });

    return () => {
      unsubP();
      unsubQ();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">🏆 Leaderboard</h1>

        <table className="w-full mb-6 border-collapse">
          <thead>
            <tr className="bg-orange-500 text-white">
              <th className="p-2 text-left">ชื่อ</th>
              <th className="p-2 text-left">คะแนน</th>
              <th className="p-2 text-left">เวลารวม (วินาที)</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.score}</td>
                <td className="p-2">{p.totalTime}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="text-xl font-semibold mb-2">📚 เฉลยคำถาม</h2>
        <ul className="space-y-3">
          {questions.map((q, i) => (
            <li key={i} className="bg-gray-50 p-3 rounded border">
              <p><strong>ข้อ {i + 1}:</strong> {q.question}</p>
              <p><strong>คำตอบ:</strong> {typeof q.answer === 'number' ? q.choices[q.answer - 1] : q.answer}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
