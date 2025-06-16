import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../firebase';
import { ref, onValue, set } from 'firebase/database';

export default function AdminPlay() {
  const router = useRouter();
  const room = 'SOC-QUIZ';

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentQ, setCurrentQ] = useState<any>(null);

  // โหลดทุกอย่าง
  useEffect(() => {
    const unsubQ = onValue(ref(db, `questions/${room}`), (snap) => {
      if (snap.exists()) {
        setQuestions(snap.val());
      }
    });

    const unsubIndex = onValue(ref(db, `adminStatus/${room}/currentIndex`), (snap) => {
      const idx = snap.val() ?? 0;
      setCurrentIndex(idx);
    });

    return () => {
      unsubQ();
      unsubIndex();
    };
  }, []);

  // Sync current question
  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      setCurrentQ(questions[currentIndex]);
    } else if (currentIndex >= questions.length) {
      set(ref(db, `gameStatus/${room}`), 'ended');
      router.push('/leaderboard');
    }
  }, [questions, currentIndex]);

  const handleNext = async () => {
    // ส่ง question ปัจจุบัน
    await set(ref(db, `currentQuestion/${room}`), currentQ);
    await set(ref(db, `gameStatus/${room}`), 'playing');
    // รอเล่นเสร็จ... แล้ว admin ต้องกดปุ่ม Next รอบต่อไปด้วย
  };

  const handleNextIndex = async () => {
    await set(ref(db, `adminStatus/${room}/currentIndex`), currentIndex + 1);
    await set(ref(db, `gameStatus/${room}`), 'waiting');
    await set(ref(db, `currentQuestion/${room}`), null);
  };

  return (
    <div className="min-h-screen bg-red-900 text-white flex flex-col items-center justify-center p-6">
      <div className="bg-white text-black rounded-lg p-6 max-w-md w-full shadow-lg">
        <h1 className="text-xl font-bold mb-4">📢 Admin: ข้อ {currentIndex + 1}</h1>

        {currentQ ? (
          <>
            <p className="mb-4">{currentQ.question}</p>
            <ul className="mb-4">
              {currentQ.choices.map((c: string, i: number) => (
                <li key={i}>
                  {i + 1}. {c} {Number(currentQ.answer) === i + 1 && <strong>✅</strong>}
                </li>
              ))}
            </ul>
            <button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded mb-2"
            >
              ▶️ ปล่อยคำถามนี้
            </button>
            <button
              onClick={handleNextIndex}
              className="bg-green-600 hover:bg-green-700 text-white w-full py-3 rounded"
            >
              ⏭️ ไปข้อถัดไป
            </button>
          </>
        ) : (
          <p>รอโหลดคำถาม...</p>
        )}
      </div>
    </div>
  );
}
