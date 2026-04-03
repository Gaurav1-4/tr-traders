import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// YOUR NEW TR-TRADERS-LIVE PROJECT CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyC3IPiMr-X8QXTBai2t5DdlE6HosU8fyzw",
  authDomain: "tr-traders-live-33109.firebaseapp.com",
  projectId: "tr-traders-live-33109",
  storageBucket: "tr-traders-live-33109.firebasestorage.app",
  messagingSenderId: "457979031307",
  appId: "1:457979031307:web:63e65d66e35e3585d23c0e"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore (default database)
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Mode discovery
export const isMockMode = false; 

console.log("Firebase initialized successfully on TR TRADERS LIVE project.");

export { db, storage, auth };
