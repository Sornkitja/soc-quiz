import { useEffect, useState } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../firebase';
import { useRouter } from 'next/router';

export default function AdminPlay() {
  const router = useRouter();
  const room = 'SOC-QUIZ';

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showAnswer, setShowAnswer] = useState(false);

  // ✅ โหลด questions & currentIndex
  useEffect(() => {
    const qRef = ref(db, `questions/${room}`);
    const unsubQ = onValue(qRef, (snap) => {
      const val = snap.val() || [];
      setQuestions(val);
    });

    const indexRef = ref(db, `adminStatus/${room}/currentIndex`);
    const unsubIdx = onValue(indexRef, (snap) => {
      const val = snap.val() || 0;
      setCurrentIndex(val);
    });

    return () => {
      unsubQ();
      unsubIdx();
    };
  }, []);

  // ✅ เมื่อกด Next หรือโหลด index ใหม่ → set ข้อสอบใหม่
  useEffect(() => {
    if (questions.length && currentIndex < questions.length) {
      const q = questions[currentIndex];
      set(ref(db, `currentQuestion/${room}`), q);
      setCurrentQuestion(q);
      setTimeLeft(30);
      setShowAnswer(false);
    }
  }, [questions, currentIndex]);

  // ✅ Countdown 30 วินาที → หมดเวลาโชว์เฉลย
  useEffect(() => {
    if (!currentQuestion || showAnswer) return;
    if (timeLeft <= 0) {
      setShowAnswer(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, currentQuestion, showAnswer]);

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      alert('✅ คำถามหมดแล้ว!');
      return;
    }
    set(ref(db, `adminStatus/${room}/currentIndex`), currentIndex + 1);
  };

  const handleEnd = () => {
    set(ref(db, `gameStatus/${room}`), 'ended');
    router.push('/leaderboard');
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center p-6"
      style={{ backgroundImage: "url('/bg-firstpage.png')" }}
    >
      <div className="bg-white bg-opacity-90 p-8 rounded shadow text-center max-w-xl w-full">
        <h1 className="text-2xl font-bold mb-4">🗂️ ควบคุมข้อสอบ</h1>

        {currentQuestion ? (
          <>
            <h2 className="text-xl font-bold mb-2">ข้อ {currentIndex + 1} / {questions.length}</h2>
            <p className="mb-4">{currentQuestion.question}</p>
            <div className="grid gap-2 mb-4 text-left">
              {currentQuestion.choices.map((choice: string, idx: number) => (
                <div
                  key={idx}
                  className={`p-3 rounded border ${
                    showAnswer && (idx + 1) === parseInt(currentQuestion.answer)
                      ? 'bg-green-200 border-green-500'
                      : 'bg-white'
                  }`}
                >
                  <strong>{['A', 'B', 'C', 'D'][idx]}.</strong> {choice}
                </div>
              ))}
            </div>
            {!showAnswer ? (
              <p className="font-bold text-red-600 mb-4">⏱️ เวลาที่เหลือ: {timeLeft} วินาที</p>
            ) : (
              <p className="font-bold text-green-600 mb-4">✅ หมดเวลา! เฉลยแสดงแล้ว</p>
            )}
            <button
              onClick={handleNext}
              disabled={!showAnswer || currentIndex + 1 >= questions.length}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-bold mb-4 w-full"
            >
              ⏭️ ข้อถัดไป
            </button>
            <button
              onClick={handleEnd}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded font-bold w-full"
            >
              ⏹️ จบเกม
            </button>
          </>
        ) : (
          <p>📌 กำลังโหลดข้อสอบ...</p>
        )}
      </div>
    </div>
  );
}
