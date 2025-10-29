import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development if configured
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR === 'true') {
  try {
    // Connect Auth to emulator
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    console.info('[Firebase] Connected Auth to emulator at 127.0.0.1:9099');

    // Connect Firestore to emulator
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    console.info('[Firebase] Connected Firestore to emulator at 127.0.0.1:8080');
  } catch (error) {
    console.warn('[Firebase] Failed to connect to emulators:', error);
  }
}
// Lazily get Functions instance to avoid initialization issues during startup
let functionsEmulatorConnected = false;
export const getFunctionsClient = () => {
  const region = import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'us-central1';
  const inst = getFunctions(app, region);
  // Connect to emulator if configured and not already connected
  try {
    const useEmu = import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR === 'true';
    if (useEmu && !functionsEmulatorConnected) {
      connectFunctionsEmulator(inst, '127.0.0.1', 5001);
      functionsEmulatorConnected = true;
      console.info('[Firebase] Connected Functions to emulator at 127.0.0.1:5001');
    }
  } catch {}
  return inst;
};

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { signInWithPopup };

export default app;