/* ================================================================================= */
/* FILE: assets/js/modules/life-cv.js (v3.0 - Final Modular Controller)              */
/* PURPOSE: Acts as the main controller for the LifeCV module. Its sole              */
/* responsibility is to initialize and coordinate the various service and UI modules.*/
/* All complex logic has been delegated to specialized modules.                      */
/* ================================================================================= */

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { auth } from '../firebase-config.js';

// Import all specialized modules that make up the LifeCV functionality
import * as DataService from '../services/life-cv-data-service.js';
import * as Renderer from '../ui/lifecv-renderer.js';
import * as Dashboard from '../ui/lifecv-dashboard.js';
import * as Modals from '../ui/lifecv-modals.js';
import * as Events from '../ui/lifecv-events.js';

let currentUser = null;
let isInitialized = false;

/**
 * Main initializer for the LifeCV module. Orchestrates the initialization sequence.
 * This function is the single entry point for the entire LifeCV feature.
 * @param {object} user - The authenticated Firebase user object.
 */
export function init(user) {
    if (!user) {
        console.error("LifeCV Controller: No user provided for initialization.");
        return;
    }
    
    if (isInitialized) {
        console.log("LifeCV Controller: Already initialized.");
        return;
    }
    
    currentUser = user;
    console.log("LifeCV Controller: Initializing for user:", currentUser.uid);

    try {
        // 1. Initialize UI components that don't depend on data first.
        Dashboard.init();
        Modals.init();
        Events.init();

        // 2. Initialize the Data Service with callback
        DataService.init(currentUser, handleDataUpdate);
        
        isInitialized = true;
        console.log("LifeCV Controller: Initialization complete.");
        
    } catch (error) {
        console.error("LifeCV Controller: Initialization failed:", error);
        showInitializationError(error);
    }
}

/**
 * Callback function for data updates
 */
function handleDataUpdate(data) {
    console.log("LifeCV Controller: Data updated, triggering UI refresh.");
    
    try {
        const sectionsConfig = DataService.getLifeCvSections();
        Renderer.renderAllSections(data, sectionsConfig);
        Dashboard.update(data, sectionsConfig);
    } catch (error) {
        console.error("LifeCV Controller: Error updating UI:", error);
    }
}

/**
 * Show initialization error
 */
function showInitializationError(error) {
    const errorBoundary = document.getElementById('error-boundary');
    const errorMessage = document.getElementById('error-message');
    if (errorBoundary && errorMessage) {
        errorMessage.textContent = `Initialization failed: ${error.message}`;
        errorBoundary.classList.remove('hidden');
    }
}

/**
 * Get current user
 */
export function getCurrentUser() {
    return currentUser;
}

// --- Application Entry Point ---
// Remove the firebase-ready dependency and initialize directly
onAuthStateChanged(auth, (user) => {
    if (user) {
        init(user);
    } else {
        console.log("User is not logged in. LifeCV module will not initialize.");
        // Redirect to login if on a protected page
        if (window.location.pathname.includes('life-cv')) {
            window.location.href = '../login.html';
        }
    }
});
