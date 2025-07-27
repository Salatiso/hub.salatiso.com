/* ================================================================================= */
/* */
/* FILE: assets/js/firebase-config.js (REVISED AND FINAL)                            */
/* */
/* PURPOSE: This file's ONLY job is to initialize Firebase and export the services.  */
/* It is the single source of truth for your Firebase connection.                    */
/* */
/* ================================================================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// Your web app's Firebase configuration.
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

// Export the initialized services for other files to use
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * Upload file to Firebase Storage
 * @param {File|Blob} file - File or blob to upload
 * @param {string} path - Storage path
 * @returns {Promise<string>} Download URL
 */
export async function uploadFile(file, path) {
    try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error('Upload failed:', error);
        throw new Error(`Upload failed: ${error.message}`);
    }
}


