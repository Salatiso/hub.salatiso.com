/* ================================================================================= */
/* FILE: assets/js/modules/hrhelp.js (CONTROLLER)                                    */
/* PURPOSE: This acts as the main controller, loading either the personal or         */
/* business HR modules based on the user's selection.                                */
/* ================================================================================= */
import { auth } from '../firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

let personalModule, businessModule;
let isPersonalLoaded = false, isBusinessLoaded = false;
let currentUser = null;

export function init(user) {
    if (!user) return;
    currentUser = user;
    console.log("HRHelp main controller initialized.");

    const personalBtn = document.getElementById('workspace-personal-btn');
    const businessBtn = document.getElementById('workspace-business-btn');
    const personalWorkspace = document.getElementById('personal-workspace');
    const businessWorkspace = document.getElementById('business-workspace');

    personalBtn.addEventListener('click', () => {
        personalWorkspace.classList.remove('hidden');
        businessWorkspace.classList.add('hidden');
        personalBtn.classList.add('active');
        businessBtn.classList.remove('active');
        loadPersonalModule();
    });

    businessBtn.addEventListener('click', () => {
        personalWorkspace.classList.add('hidden');
        businessWorkspace.classList.remove('hidden');
        businessBtn.classList.add('active');
        personalBtn.classList.remove('active');
        loadBusinessModule();
    });

    // Load the default workspace
    loadPersonalModule();
}

async function loadPersonalModule() {
    if (isPersonalLoaded) return;
    try {
        personalModule = await import('./hrhelp-personal.js');
        personalModule.init(currentUser);
        isPersonalLoaded = true;
    } catch (error) {
        console.error("Failed to load personal HR module:", error);
        document.getElementById('personal-workspace').innerHTML = `<p class="text-red-500 text-center">Error loading Personal Career Hub.</p>`;
    }
}

async function loadBusinessModule() {
    if (isBusinessLoaded) return;
    try {
        // Add cache-busting query parameter to force reload
        businessModule = await import('./hrhelp-business.js?v=' + new Date().getTime());
        businessModule.init(currentUser);
        isBusinessLoaded = true;
    } catch (error) {
        console.error("Failed to load business HR module:", error);
        document.getElementById('business-workspace').innerHTML = `<p class="text-red-500 text-center">Error loading Business HR Hub.</p>`;
    }
}

// Initialize the HRHelp when Firebase is ready
document.addEventListener('firebase-ready', () => {
    console.log('Firebase ready event received, initializing HRHelp...');
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('User authenticated, initializing HRHelp for:', user.email);
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
