/* ================================================================================= */
/* */
/* FILE: assets/js/firebase-config.js (CORRECTED - FULLY FUNCTIONAL)                 */
/* */
/* PURPOSE: Initialize Firebase and export all services                              */
/* */
/* ================================================================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_pRVkeVzciCPowxsj44NRVlbyZvFPueI",
  authDomain: "lifecv-d2724.firebaseapp.com",
  projectId: "lifecv-d2724",
  storageBucket: "lifecv-d2724.appspot.com",
  messagingSenderId: "1039752653127",
  appId: "1:1039752653127:web:54afa09b21c98ef231c462",
  measurementId: "G-BDCNHBQTR2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services (legacy - use firebase-config-secure.js for new implementations)
export const legacyAuth = getAuth(app);
export const legacyDb = getFirestore(app);

// For backward compatibility
export const auth = legacyAuth;
export const db = legacyDb;
export const storage = getStorage(app);

// File upload utility function
export async function uploadFile(file, path) {
    try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

console.log('Firebase initialized successfully');


