// src/pages/index.tsx

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-orange-200 to-yellow-100">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">🎓 ยินดีต้อนรับสู่ Quiz Game</h1>
        <p className="mb-6">กรุณาเลือกบทบาทของคุณ</p>
        <Link href="/register" className="block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-bold mb-4">
          ✅ นักเรียน: ลงทะเบียนเข้าร่วมเกม
        </Link>
        <Link href="/admin" className="block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-bold">
          🛠️ ผู้ดูแล: จัดการคำถาม
        </Link>
      </div>
    </div>
  );
}
