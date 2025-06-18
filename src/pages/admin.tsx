// src/pages/admin.tsx

import { useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../firebase';
import { ref, set } from 'firebase/database';
import * as XLSX from 'xlsx';

export default function AdminPage() {
  const room = 'SOC-QUIZ';
  const router = useRouter();

  const [status, setStatus] = useState('');

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatus('⏳ กำลังอ่านไฟล์...');

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    const newQuestions = jsonData.slice(1).map((row: any[]) => ({
      question: row[0],
      choices: [row[1], row[2], row[3], row[4]],
      answer: row[5],
    }));

    await set(ref(db, `questions/${room}`), newQuestions);
    await set(ref(db, `players/${room}`), null);
    await set(ref(db, `gameStatus/${room}`), 'waiting');

    setStatus('✅ อัปโหลดสำเร็จ! กำลังไปหน้าเริ่มเกม...');

    // ✅ Auto Redirect หลัง Upload
    setTimeout(() => {
      router.push('/admin-start');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-200 to-pink-200">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">📂 อัปโหลดไฟล์คำถาม</h1>
        <input
          type="file"
          accept=".xlsx"
          onChange={handleUpload}
          className="mb-4"
        />
        {status && <p className="text-green-600 font-semibold">{status}</p>}
      </div>
    </div>
  );
}
