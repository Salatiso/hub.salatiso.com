import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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
// Lazily get Functions instance to avoid initialization issues during startup
let functionsEmulatorConnected = false;
export const getFunctionsClient = () => {
  const region = import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'us-central1';
  const inst = getFunctions(app, region);
  // Connect to emulator if configured and not already connected
  try {
    const useEmu = import.meta.env.DEV && import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === '1';
    if (useEmu && !functionsEmulatorConnected) {
      const host = import.meta.env.VITE_FUNCTIONS_EMULATOR_HOST || 'localhost';
      const port = Number(import.meta.env.VITE_FUNCTIONS_EMULATOR_PORT || 5001);
      connectFunctionsEmulator(inst, host, port);
      functionsEmulatorConnected = true;
      // eslint-disable-next-line no-console
      console.info(`[Firebase] Connected Functions to emulator at ${host}:${port}`);
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