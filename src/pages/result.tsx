// src/pages/result.tsx
import { useRouter } from 'next/router';

export default function ResultPage() {
  const router = useRouter();
  const { name, selected, answerTime, correct } = router.query;

  const isCorrect = selected === correct;
  const notAnswered = selected === 'ไม่ได้ตอบ';

  return (
    <div className="min-h-screen bg-[#F0F9FF] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">🎉 ผลลัพธ์ของคุณ</h1>

      {notAnswered ? (
        <p className="text-red-500 text-xl mb-2">คุณไม่ได้ตอบคำถาม</p>
      ) : isCorrect ? (
        <p className="text-green-600 text-xl mb-2">✅ ตอบถูก!</p>
      ) : (
        <p className="text-red-600 text-xl mb-2">❌ ตอบผิด</p>
      )}

      {!notAnswered && (
        <>
          <p className="mb-2">คุณตอบ: <strong>{selected}</strong></p>
          <p className="mb-2">คำตอบที่ถูกต้องคือ: <strong>{correct}</strong></p>
          <p className="mb-4">เวลาที่ใช้ในการตอบ: <strong>{answerTime} วินาที</strong></p>
        </>
      )}

      <button
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
        onClick={() => router.push(`/waiting-room?name=${name}`)}
      >
        🔄 รอคำถามถัดไป
      </button>
    </div>
  );
}
