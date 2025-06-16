// src/pages/upload.tsx

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';

interface Question {
  question: string;
  choices: string[];
  answer: number;
}

export default function UploadPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [fileName, setFileName] = useState('');
  const router = useRouter();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];

      const parsed: Question[] = data.slice(1).map((row) => ({
        question: row[0],
        choices: [row[1], row[2], row[3], row[4]],
        answer: parseInt(row[5]),
      }));
      setQuestions(parsed);
      localStorage.setItem('quiz-questions', JSON.stringify(parsed));
    };
    reader.readAsBinaryString(file);
  };

  const handleStartGame = () => {
    router.push('/start-game');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 to-yellow-100 p-6">
      <h1 className="text-2xl font-bold mb-4">📤 อัปโหลดไฟล์คำถาม (Local)</h1>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        className="mb-4"
      />
      {fileName && (
        <p className="mb-4 text-green-700">✅ โหลดไฟล์แล้ว: {fileName}</p>
      )}
      <button
        className="bg-[#F97316] hover:bg-[#fb923c] text-white px-6 py-2 rounded-xl shadow-md"
        onClick={handleStartGame}
        disabled={!questions.length}
      >
        เริ่มเกม ➡️
      </button>
    </div>
  );
}
