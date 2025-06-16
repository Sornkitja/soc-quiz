import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface Question {
  question: string;
  choices: string[];
  answer: number;
}

export default function StartGame() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [roomCode, setRoomCode] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('questions');
    const room = localStorage.getItem('roomCode');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setQuestions(parsed);
      } catch (e) {
        console.error('Failed to parse questions', e);
      }
    }
    if (room) setRoomCode(room);
  }, []);

  const startGame = () => {
    router.push(`/play?index=0&room=${roomCode}`);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-cover bg-center"
      style={{ backgroundImage: "url('/bg-firstpage.png')" }}
    >
      <h1 className="text-2xl font-bold mb-4 bg-white bg-opacity-80 px-4 py-2 rounded">
        🎯 เตรียมเริ่มเกม
      </h1>
      <p className="mb-4 bg-white bg-opacity-80 px-4 py-2 rounded">
        Room Code: <span className="font-mono">{roomCode}</span>
      </p>

      <div className="bg-white p-4 rounded-md shadow-md w-full max-w-md mb-4 bg-opacity-90">
        <h2 className="font-semibold mb-2">รายการคำถาม ({questions.length} ข้อ)</h2>
        <ul className="text-sm list-disc pl-5 space-y-1 max-h-40 overflow-y-auto">
          {questions.map((q, i) => (
            <li key={i}>{q.question}</li>
          ))}
        </ul>
      </div>

      <button
        className="bg-orange-500 text-white px-6 py-2 rounded-xl font-bold shadow hover:bg-orange-600 transition"
        onClick={startGame}
        disabled={questions.length === 0}
      >
       ▶️ เริ่มเกม
      </button>
    </div>
  );
}
