/* ================================================================================= */
/* FILE: /assets/js/storage.js (CORRECTED)                                           */
/* ================================================================================= */
import { storage, auth } from "./firebase-config.js"; // CORRECTED PATH
import { ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

export const uploadFile = (file, path, progressCallback) => {
    return new Promise((resolve, reject) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return reject("User not authenticated.");
        const storageRef = ref(storage, `${path}/${userId}/${Date.now()}-${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on('state_changed', 
            (snapshot) => progressCallback((snapshot.bytesTransferred / snapshot.totalBytes) * 100), 
            (error) => reject(error), 
            () => getDownloadURL(uploadTask.snapshot.ref).then(resolve)
        );
    });
};

