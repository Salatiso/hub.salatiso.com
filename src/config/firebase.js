// Firebase configuration
// Copy this to src/config/firebase.js and update with your Firebase project config

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators if in development mode and enabled
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR === 'true') {
  try {
    // Connect Auth Emulator
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    console.info('[Firebase] Connected to Auth Emulator at http://127.0.0.1:9099');
    
    // Connect Firestore Emulator
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    console.info('[Firebase] Connected to Firestore Emulator at 127.0.0.1:8080');
  } catch (error) {
    console.warn('[Firebase] Emulator connection failed:', error.message);
    console.warn('[Firebase] Make sure emulators are running: firebase emulators:start');
  }
}

// Lazily initialize Functions to avoid provider errors during early module load
let functionsInstance;
let functionsEmulatorConnected = false;
export const getFunctionsClient = () => {
  if (!functionsInstance) {
    const region = import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'us-central1';
    functionsInstance = getFunctions(app, region);
  }
  try {
    const useEmu = import.meta.env.DEV && import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === '1';
    if (useEmu && !functionsEmulatorConnected) {
      const host = import.meta.env.VITE_FUNCTIONS_EMULATOR_HOST || 'localhost';
      const port = Number(import.meta.env.VITE_FUNCTIONS_EMULATOR_PORT || 5001);
      connectFunctionsEmulator(functionsInstance, host, port);
      functionsEmulatorConnected = true;
      // eslint-disable-next-line no-console
      console.info(`[Firebase] Connected Functions to emulator at ${host}:${port}`);
    }
  } catch {}
  return functionsInstance;
};

// Note: Functions emulator connection is handled inside getFunctionsClient() to avoid early initialization.

// Connect to Firestore emulator in dev if enabled
try {
  const useFsEmu = import.meta.env.DEV && import.meta.env.VITE_USE_FIRESTORE_EMULATOR === '1';
  if (useFsEmu) {
    const host = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST || 'localhost';
    const port = Number(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT || 8080);
    connectFirestoreEmulator(db, host, port);
    // eslint-disable-next-line no-console
    console.info(`[Firebase] Connected Firestore to emulator at ${host}:${port}`);
  }
} catch {}

// Connect to Storage emulator in dev if enabled
try {
  const useStEmu = import.meta.env.DEV && import.meta.env.VITE_USE_STORAGE_EMULATOR === '1';
  if (useStEmu) {
    const host = import.meta.env.VITE_STORAGE_EMULATOR_HOST || 'localhost';
    const port = Number(import.meta.env.VITE_STORAGE_EMULATOR_PORT || 9199);
    connectStorageEmulator(storage, host, port);
    // eslint-disable-next-line no-console
    console.info(`[Firebase] Connected Storage to emulator at ${host}:${port}`);
  }
} catch {}

export default app;
