import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../firebase';
import { ref, set, get } from 'firebase/database';

export default function AdminPlay() {
  const router = useRouter();
  const room = 'SOC-QUIZ';
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ ตรวจสิทธิ์ admin
  useEffect(() => {
    if (localStorage.getItem('isAdmin') !== 'true') {
      router.push('/admin-start');
    }
  }, []);

  // ✅ โหลดคำถามจาก DB
  useEffect(() => {
    const fetchQuestions = async () => {
      const snapshot = await get(ref(db, `questions/${room}`));
      if (snapshot.exists()) {
        setQuestions(snapshot.val());
      } else {
        alert('ไม่พบคำถาม!');
        router.push('/admin-start');
      }
    };
    fetchQuestions();
  }, []);

  const sendNextQuestion = async () => {
    if (currentIndex >= questions.length) {
      alert('✅ คำถามหมดแล้ว!');
      await set(ref(db, `gameStatus/${room}`), 'ended');
      router.push('/leaderboard');
      return;
    }
    const q = questions[currentIndex];
    await set(ref(db, `currentQuestion/${room}`), q);
    await set(ref(db, `gameStatus/${room}`), 'playing');
    setCurrentIndex(currentIndex + 1);

    // หลังส่งรอ 30 วินาที แล้วล้างกลับ waiting room
    setTimeout(async () => {
      await set(ref(db, `currentQuestion/${room}`), null);
      await set(ref(db, `gameStatus/${room}`), 'waiting');
    }, 30 * 1000);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center p-6"
      style={{ backgroundImage: "url('/bg-firstpage.png')" }}
    >
      <button
        onClick={sendNextQuestion}
        disabled={!questions.length}
        className="bg-green-600 hover:bg-green-700 text-white text-3xl font-bold px-12 py-6 rounded-xl shadow-xl"
      >
        ⏭️ ข้อถัดไป
      </button>
    </div>
  );
}
