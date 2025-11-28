import { initializeApp } from 'firebase/app';
import { getAuth, indexedDBLocalPersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Capacitor } from '@capacitor/core';

// 🔐 Firebase configuration - from environment variables only
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Validate config in development
if (process.env.NODE_ENV === 'development') {
  const missing = Object.entries(firebaseConfig)
    .filter(([key, value]) => !value)
    .map(([key]) => key);
  if (missing.length > 0) {
    console.error('❌ Missing Firebase config:', missing.join(', '));
    console.error('Please check your .env file has all REACT_APP_FIREBASE_* variables');
  }
}

const app = initializeApp(firebaseConfig);

// Initialize Auth for Capacitor (prevents gapi iframe issues)
let auth;
if (Capacitor.isNativePlatform()) {
  auth = initializeAuth(app, {
    persistence: indexedDBLocalPersistence
  });
  console.log('✅ Firebase Auth initialized for Capacitor (no popups)');
} else {
  auth = getAuth(app);
  console.log('✅ Firebase Auth initialized for Web');
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log('✅ Firebase initialized successfully');