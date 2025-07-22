/* ================================================================================= */
/* FILE: assets/js/modules/finhelp.js (CONTROLLER - CORRECTED)                     */
/* PURPOSE: Loads and switches between the Personal and Business finance modules.    */
/* FIX: Ensures modules load correctly and handles potential errors gracefully.      */
/* ================================================================================= */
import { auth } from '../firebase-config.js';

let personalFinanceModule;
let businessFinanceModule;
let isPersonalModuleLoaded = false;
let isBusinessModuleLoaded = false;
let currentUser = null;

export function init(user) {
    if (!user || !user.uid) {
        console.error("FinHelp Error: User not authenticated.");
        return;
    }
    currentUser = user;
    console.log("FinHelp main controller initialized.");

    const personalWorkspace = document.getElementById('personal-workspace');
    const businessWorkspace = document.getElementById('business-workspace');
    const personalBtn = document.getElementById('workspace-personal-btn');
    const businessBtn = document.getElementById('workspace-business-btn');

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

    // Load the default module
    loadPersonalModule();
}

async function loadPersonalModule() {
    if (isPersonalModuleLoaded) return;
    try {
        personalFinanceModule = await import('./finhelp-personal.js');
        personalFinanceModule.init(currentUser);
        isPersonalModuleLoaded = true;
    } catch (error) {
        console.error("Failed to load personal finance module:", error);
        document.getElementById('personal-workspace').innerHTML = `<p class="text-red-500 text-center">Error loading personal finance tools.</p>`;
    }
}

async function loadBusinessModule() {
    if (isBusinessModuleLoaded) return;
    try {
        businessFinanceModule = await import('./finhelp-business.js');
        // The business module will create its own HTML inside the business-workspace div
        businessFinanceModule.init(currentUser);
        isBusinessModuleLoaded = true;
    } catch (error) {
        console.error("Failed to load business finance module:", error);
        document.getElementById('business-workspace').innerHTML = `<p class="text-red-500 text-center">Error loading business finance tools.</p>`;
    }
}
