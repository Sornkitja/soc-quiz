// src/pages/admin.tsx

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../firebase';
import { ref, set, remove } from 'firebase/database';

export default function Admin() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const room = 'SOC-QUIZ'; // รหัสห้องตายตัว หรือให้ Admin กำหนดก็ได้

  // ✅ Upload & Save questions
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];

      const parsed = data.slice(1).map((row) => ({
        question: row[0],
        choices: [row[1], row[2], row[3], row[4]],
        answer: row[5],
      }));

      setQuestions(parsed);

      // ✅ ล้างคำถามเก่าแล้วเซฟใหม่
      await remove(ref(db, `questions/${room}`));
      await set(ref(db, `questions/${room}`), parsed);

      alert('📤 อัปโหลดคำถามสำเร็จแล้ว!');
    };
    reader.readAsBinaryString(file);
  };

  // ✅ Start Game: Reset Players + เริ่มข้อแรก
  const handleStartGame = async () => {
    if (!questions.length) {
      alert('❌ กรุณาอัปโหลดคำถามก่อน');
      return;
    }

    // ล้าง players และ currentQuestion ก่อน
    await remove(ref(db, `players/${room}`));
    await remove(ref(db, `currentQuestion/${room}`));

    // สถานะเป็น playing
    await set(ref(db, `gameStatus/${room}`), 'playing');

    // ปล่อยข้อแรก
    sendNextQuestion();
  };

  // ✅ ปล่อยข้อถัดไป
  const sendNextQuestion = () => {
    if (currentIndex >= questions.length) {
      alert('✅ คำถามหมดแล้ว!');
      return;
    }
    const q = questions[currentIndex];
    set(ref(db, `currentQuestion/${room}`), q);
    setCurrentIndex(currentIndex + 1);
  };

  // ✅ End Game
  const handleEndGame = async () => {
    await set(ref(db, `gameStatus/${room}`), 'ended');
    alert('🚦 เกมจบแล้ว!');
  };

  return (
    <div className="min-h-screen bg-red-900 text-white flex flex-col items-center justify-center p-6">
      <div className="bg-white text-black rounded-lg p-6 max-w-md w-full shadow-lg">
        <h1 className="text-2xl font-bold mb-4">🎮 Admin Panel</h1>

        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="mb-4"
        />

        <button
          onClick={handleStartGame}
          disabled={!questions.length}
          className="bg-green-600 hover:bg-green-700 text-white w-full py-3 mb-2 rounded"
        >
          ▶️ เริ่มเกม
        </button>

        <button
          onClick={sendNextQuestion}
          disabled={!questions.length}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 mb-2 rounded"
        >
          ⏭️ ข้อถัดไป
        </button>

        <button
          onClick={handleEndGame}
          className="bg-gray-600 hover:bg-gray-700 text-white w-full py-3 rounded"
        >
          ⏹️ จบเกม
        </button>
      </div>
    </div>
  );
}
