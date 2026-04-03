import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration 
const firebaseConfig = {
  apiKey: "AIzaSyAjn-agEClov6wuxAPDWS_AFakWEDB9ORg",
  authDomain: "gen-lang-client-0494313442.firebaseapp.com",
  projectId: "gen-lang-client-0494313442",
  storageBucket: "gen-lang-client-0494313442.firebasestorage.app",
  messagingSenderId: "795033785414",
  appId: "1:795033785414:web:584a196393d0872fd76647"
};

// Mode discovery
export const isMockMode = false; 

const app = initializeApp(firebaseConfig);

// CRITICAL FIX: Connecting to your custom database ID from the screenshot
const db = getFirestore(app, "ai-studio-6346c158-1d00-4f25-93a5-8e7e79edd8cd");

const storage = getStorage(app);
const auth = getAuth(app);

console.log("Firebase initialized successfully on custom Database ID.");

export { db, storage, auth };
