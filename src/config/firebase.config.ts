import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Demo/mock mode activates when no real Firebase API key is present or when forced
export const isMockMode =
  import.meta.env.VITE_USE_MOCK_DATA === 'true' ||
  !firebaseConfig.apiKey ||
  firebaseConfig.apiKey === 'undefined' ||
  firebaseConfig.apiKey.startsWith('YOUR_');

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (!isMockMode) {
  try {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.info('✅ Redemption OS connected to Firebase');
  } catch (error) {
    console.warn('⚠️ Firebase initialization failed, running in demo mode:', error);
  }
} else {
  console.info('🎭 Redemption OS running in Demo Mode');
}

export { app, auth, db, storage };
