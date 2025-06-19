// src/pages/admin-login.tsx

import { useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (username === 'sornkitja' && password === '1234') {
      localStorage.setItem('adminAuth', 'true');
      router.push('/admin');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-purple-200 to-pink-200">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">🔑 Admin Login</h1>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            className="mb-4 w-full border px-3 py-2 rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="mb-4 w-full border px-3 py-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded font-bold"
          >
            เข้าสู่ระบบ
          </button>
        </form>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
    </div>
  );
}
