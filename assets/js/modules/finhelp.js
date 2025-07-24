/* ================================================================================= */
/* FILE: assets/js/modules/finhelp.js (CONTROLLER)                                   */
/* PURPOSE: Manages the main FinHelp workspace, switching between personal and       */
/* business modules. It imports and initializes the specific modules.                */
/* ================================================================================= */
import { auth } from '../firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { init as initPersonalModule } from './finhelp-personal.js';
import { init as initBusinessModule } from './finhelp-business.js';

let currentUser = null;
let isPersonalLoaded = false;
let isBusinessLoaded = false;
let isInitialized = false; // Add this flag

/**
 * Main initializer for the FinHelp module.
 * @param {object} user - The authenticated Firebase user object.
 */
export function init(user) {
    if (!user || isInitialized) {
        return;
    }
    currentUser = user;
    isInitialized = true;
    console.log("FinHelp Controller initialized.");

    setupWorkspaceSwitching();
    
    // Default to loading the personal module
    loadPersonalModule();
}

/**
 * Sets up the event listeners for switching workspaces.
 */
function setupWorkspaceSwitching() {
    const personalBtn = document.getElementById('workspace-personal-btn');
    const businessBtn = document.getElementById('workspace-business-btn');
    const personalWorkspace = document.getElementById('personal-workspace');
    const businessWorkspace = document.getElementById('business-workspace');

    personalBtn?.addEventListener('click', () => {
        personalWorkspace.classList.remove('hidden');
        businessWorkspace.classList.add('hidden');
        personalBtn.classList.add('active');
        businessBtn.classList.remove('active');
        loadPersonalModule();
    });

    businessBtn?.addEventListener('click', () => {
        personalWorkspace.classList.add('hidden');
        businessWorkspace.classList.remove('hidden');
        businessBtn.classList.add('active');
        personalBtn.classList.remove('active');
        loadBusinessModule();
    });
}

/**
 * Loads and initializes the personal finance module.
 */
async function loadPersonalModule() {
    if (isPersonalLoaded) return; // Prevent re-initialization
    try {
        await initPersonalModule(currentUser);
        isPersonalLoaded = true;
    } catch (error) {
        console.error("Failed to load Personal Finance module:", error);
        document.getElementById('personal-workspace').innerHTML = `<p class="text-red-500 text-center">Could not load personal finance tools.</p>`;
    }
}

/**
 * Loads and initializes the business finance module.
 */
async function loadBusinessModule() {
    // For now, this is a placeholder. When finhelp-business.js is ready, this will be fully functional.
    if (isBusinessLoaded) return;
     try {
        await initBusinessModule(currentUser);
        isBusinessLoaded = true;
    } catch (error) {
        console.error("Failed to load Business Finance module:", error);
        document.getElementById('business-workspace').innerHTML = `<p class="text-red-500 text-center">Could not load business finance tools.</p>`;
    }
}

// Initialize the FinHelp Controller when Firebase is ready
document.addEventListener('firebase-ready', () => {
    onAuthStateChanged(auth, (user) => {
        if (user && !isInitialized) {
            init(user);
        }
    });
});
