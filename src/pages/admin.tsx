// src/pages/admin.tsx

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../firebase';
import { ref, set, get } from 'firebase/database';

export default function Admin() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [room] = useState('SOC-QUIZ');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ ป้องกันถ้าเกมกำลังเล่นอยู่
    const statusSnap = await get(ref(db, `gameStatus/${room}`));
    if (statusSnap.exists() && statusSnap.val() === 'playing') {
      alert('🚫 เกมกำลังเล่นอยู่ ไม่สามารถอัปโหลดได้');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
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

      // ✅ ล้างเก่าก่อนอัปใหม่
      set(ref(db, `questions/${room}`), parsed);
      set(ref(db, `players/${room}`), null); // Reset players
      set(ref(db, `gameStatus/${room}`), 'waiting'); // Reset game status

      alert('✅ อัปโหลดสำเร็จ!');
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="min-h-screen bg-red-900 text-white flex flex-col items-center justify-center p-6">
      <div className="bg-white text-black rounded-lg p-6 max-w-md w-full shadow-lg">
        <h1 className="text-2xl font-bold mb-4">🎮 Admin Panel</h1>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="mb-4" />
        <p>✅ เมื่ออัปโหลดแล้วให้กด "เริ่มเกม" ในหน้าถัดไป</p>
      </div>
    </div>
  );
}
