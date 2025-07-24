/* ================================================================================= */
/* FILE: assets/js/ekhaya.js (CORRECTED)                                             */
/* ================================================================================= */
import { auth } from './firebase-config.js';
import { saveDocument, getDocuments, deleteDocument } from './database.js';
import { uploadFile } from './storage.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

export function init() {
    const listContainer = document.getElementById('property-list-container');
    if (!listContainer) return;
    
    // ... other element selections
    
    const currentUserId = auth.currentUser.uid;
    if (!currentUserId) return;

    // All previous logic for this page goes inside the init function.

    loadProperties();
}

// Initialize the eKhaya module when Firebase is ready
document.addEventListener('firebase-ready', () => {
    console.log('Firebase ready event received, initializing eKhaya...');
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('User authenticated, initializing eKhaya for:', user.email);
            init(user);
        } else {
            console.log('No user authenticated');
        }
    });
});

// Also listen for auth state changes directly
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('Auth state changed, user authenticated:', user.email);
        init(user);
    }
});
