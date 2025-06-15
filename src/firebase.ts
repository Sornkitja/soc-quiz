// ✅ CORRECT: src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// ✅ DO NOT IMPORT getAnalytics — ใช้แค่ Database

const firebaseConfig = {
  apiKey: "AIzaSyA_5kB0ijtb0JWQmb0wR2QE1euYKBBiOJ8",
  authDomain: "soc-quiz-62c10.firebaseapp.com",
  databaseURL: "https://soc-quiz-62c10-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "soc-quiz-62c10",
  storageBucket: "soc-quiz-62c10.appspot.com",
  messagingSenderId: "620573711439",
  appId: "1:620573711439:web:8cc42492cc9db714499e3a"
};

// ✅ Initialize Firebase once
const app = initializeApp(firebaseConfig);

// ✅ Export ONLY the Database
export const db = getDatabase(app);
