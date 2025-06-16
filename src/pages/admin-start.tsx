import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminStart() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // ตรวจว่าล็อกอินแล้ว
  useEffect(() => {
    if (localStorage.getItem('isAdmin') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    if (username === 'sornkitja' && password === '1234') {
      localStorage.setItem('isAdmin', 'true');
      setIsAuthenticated(true);
    } else {
      alert('❌ Username หรือ Password ไม่ถูกต้อง');
    }
  };

  const handleStartGame = () => {
    router.push('/admin-play');
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center p-6"
      style={{ backgroundImage: "url('/bg-firstpage.png')" }}
    >
      {!isAuthenticated ? (
        <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">🔒 Admin Login</h1>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border p-2 mb-3 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 mb-4 rounded"
          />
          <button
            onClick={handleLogin}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded font-bold w-full"
          >
            ✅ เข้าสู่ระบบ
          </button>
        </div>
      ) : (
        <button
          onClick={handleStartGame}
          className="bg-orange-600 hover:bg-orange-700 text-white text-3xl font-bold px-10 py-6 rounded-xl shadow-xl"
        >
          🚀 เริ่มเกม
        </button>
      )}
    </div>
  );
}
