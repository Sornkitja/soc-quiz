import { useEffect, useState } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../firebase';
import { useRouter } from 'next/router';

export default function AdminPlay() {
  const router = useRouter();
  const room = 'SOC-QUIZ';
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // โหลดคำถามจาก Firebase เมื่อเข้า
  useEffect(() => {
    const qRef = ref(db, `questions/${room}`);
    const unsub = onValue(qRef, (snap) => {
      const val = snap.val() || [];
      setQuestions(val);
    });
    return () => unsub();
  }, []);

  // ปล่อยข้อถัดไป
  const handleNext = () => {
    if (currentIndex >= questions.length) {
      alert('✅ คำถามหมดแล้ว!');
      return;
    }
    const q = questions[currentIndex];
    set(ref(db, `currentQuestion/${room}`), q);
    setCurrentIndex(currentIndex + 1);
  };

  // จบเกม
  const handleEndGame = () => {
    set(ref(db, `gameStatus/${room}`), 'ended');
    router.push('/leaderboard');
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center p-6"
      style={{ backgroundImage: "url('/bg-play.png')" }}
    >
      <div className="bg-white bg-opacity-90 p-8 rounded shadow text-center max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">🗂️ ควบคุมข้อสอบ</h1>
        <p className="mb-6">ข้อปัจจุบัน: {currentIndex} / {questions.length}</p>

        <button
          onClick={handleNext}
          disabled={currentIndex >= questions.length}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 mb-4 rounded font-bold shadow transition w-full"
        >
          ⏭️ ปล่อยข้อถัดไป
        </button>

        <button
          onClick={handleEndGame}
          className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded font-bold shadow transition w-full"
        >
          ⏹️ จบเกม
        </button>
      </div>
    </div>
  );
}
