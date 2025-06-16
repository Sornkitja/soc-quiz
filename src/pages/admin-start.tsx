import { useRouter } from 'next/router';
import { ref, set } from 'firebase/database';
import { db } from '../firebase';

export default function AdminStart() {
  const router = useRouter();
  const room = 'SOC-QUIZ';

  const handleStartGame = () => {
    set(ref(db, `gameStatus/${room}`), 'playing');
    router.push('/admin-play');
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center p-6"
      style={{ backgroundImage: "url('/bg-firstpage.png')" }}
    >
      <div className="bg-white bg-opacity-90 p-8 rounded shadow text-center">
        <h1 className="text-3xl font-bold mb-4">🎯 พร้อมเริ่มเกมแล้ว!</h1>
        <button
          onClick={handleStartGame}
          className="bg-green-600 hover:bg-green-700 text-white text-xl px-8 py-4 rounded shadow font-bold transition"
        >
          🚀 เริ่มเกม
        </button>
      </div>
    </div>
  );
}
