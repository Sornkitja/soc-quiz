import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../firebase';
import { ref, onValue, set } from 'firebase/database';

export default function AdminPlay() {
  const router = useRouter();
  const room = 'SOC-QUIZ';

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQ, setCurrentQ] = useState<any>(null);

  useEffect(() => {
    const qRef = ref(db, `questions/${room}`);
    const unsubQ = onValue(qRef, (snap) => {
      const allQ = snap.val();
      if (allQ) {
        setQuestions(allQ);
      }
    });

    const indexRef = ref(db, `adminStatus/${room}/currentIndex`);
    const unsubIndex = onValue(indexRef, (snap) => {
      const idx = snap.val();
      if (idx !== null) {
        setCurrentIndex(idx);
        setCurrentQ(questions[idx]);
      }
    });

    return () => {
      unsubQ();
      unsubIndex();
    };
  }, [questions]);

  const sendNext = async () => {
    if (currentIndex >= questions.length) {
      // End
      await set(ref(db, `gameStatus/${room}`), 'ended');
      router.push('/leaderboard');
    } else {
      // Send this question
      await set(ref(db, `currentQuestion/${room}`), questions[currentIndex]);
    }
  };

  const handleNext = async () => {
    await sendNext();
    // Next index
    await set(ref(db, `adminStatus/${room}/currentIndex`), currentIndex + 1);
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
              className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded"
            >
              ⏭️ ข้อถัดไป
            </button>
          </>
        ) : (
          <p>รอโหลดคำถาม...</p>
        )}
      </div>
    </div>
  );
}
