import { useState } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../firebase';
import { ref, set, remove } from 'firebase/database';
import { useRouter } from 'next/router';

export default function Admin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();
  const room = 'SOC-QUIZ';

  const handleLogin = () => {
    if (username === 'sornkitja' && password === '1234') {
      setLoggedIn(true);
    } else {
      alert('❌ Username หรือ Password ไม่ถูกต้อง');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ Clear questions & players เก่า
    await remove(ref(db, `questions/${room}`));
    await remove(ref(db, `players/${room}`));

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

      // ✅ Save to Firebase
      set(ref(db, `questions/${room}`), parsed);

      alert('✅ อัปโหลดคำถามแล้ว!');
      router.push('/admin-start');
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="min-h-screen bg-red-900 text-white flex flex-col items-center justify-center p-6">
      {!loggedIn ? (
        <div className="bg-white text-black rounded-lg p-6 max-w-md w-full shadow-lg">
          <h1 className="text-2xl font-bold mb-4">🔑 Admin Login</h1>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />
          <button
            onClick={handleLogin}
            className="bg-green-600 hover:bg-green-700 text-white w-full py-3 rounded"
          >
            ✅ เข้าสู่ระบบ
          </button>
        </div>
      ) : (
        <div className="bg-white text-black rounded-lg p-6 max-w-md w-full shadow-lg">
          <h1 className="text-2xl font-bold mb-4">📤 Upload File</h1>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
