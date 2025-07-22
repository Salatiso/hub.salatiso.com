/* ================================================================================= */
/* FILE: /assets/js/storage.js (SERVICE - CORRECTED & COMPLETE)                      */
/* PURPOSE: Provides reusable functions for interacting with Firebase Storage.       */
/* This file now correctly exports both uploadFile and deleteFile.                   */
/* ================================================================================= */
import { storage } from './firebase-config.js';
import { 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

/**
 * Uploads a file to a specified path in Firebase Storage.
 * @param {File} file - The file object to upload.
 * @param {string} filePath - The full path in storage where the file should be saved (e.g., 'users/uid/profile.jpg').
 * @returns {Promise<string>} A promise that resolves with the public download URL of the file.
 */
export const uploadFile = async (file, filePath) => {
    const storageRef = ref(storage, filePath);
    try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Upload failed:", error);
        throw error; // Re-throw the error to be handled by the caller
    }
};

/**
 * Deletes a file from Firebase Storage using its download URL.
 * @param {string} fileUrl - The public download URL of the file to delete.
 * @returns {Promise<void>} A promise that resolves when the file is deleted.
 */
export const deleteFile = async (fileUrl) => {
    try {
        // Create a reference from the full URL
        const storageRef = ref(storage, fileUrl);
        await deleteObject(storageRef);
    } catch (error) {
        // Firebase throws an error if the object doesn't exist, which we can often ignore.
        if (error.code === 'storage/object-not-found') {
            console.warn("Tried to delete a file that doesn't exist:", fileUrl);
        } else {
            console.error("File deletion failed:", error);
            throw error; // Re-throw for more critical errors
        }
    }
};
