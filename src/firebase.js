import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// 🔐 Firebase configuration - with fallbacks
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyA_z8HNFWQFC3BU1WlSd8ikhM5JVywLfhs",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "datemaker-62679.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "datemaker-62679",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "datemaker-62679.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "931513579449",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:931513579449:web:55c2a7915fad4a7771e868",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-LJVXV4GP8W"
};

// Debug: Check if using env vars or fallbacks
const usingEnvVars = !!process.env.REACT_APP_FIREBASE_API_KEY;
console.log(usingEnvVars ? '✅ Using environment variables' : '⚠️ Using fallback config (env vars not loaded)');

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log('✅ Firebase initialized successfully');