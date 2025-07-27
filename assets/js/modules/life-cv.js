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

/**
 * Main initializer for the LifeCV module. Orchestrates the initialization sequence.
 * This function is the single entry point for the entire LifeCV feature.
 * @param {object} user - The authenticated Firebase user object.
 */
function init(user) {
    if (!user) {
        console.error("LifeCV Controller: No user provided for initialization.");
        return;
    }
    currentUser = user;
    console.log("LifeCV Controller: Initializing for user:", currentUser.uid);

    // 1. Initialize UI components that don't depend on data first.
    //    This sets up the page structure and event listeners immediately.
    Dashboard.init();
    Modals.init();
    Events.init();

    // 2. Initialize the Data Service. We pass it a "callback" function.
    //    The Data Service will call this function (`handleDataUpdate`) every time
    //    it gets new data from the database.
    DataService.init(currentUser, handleDataUpdate);
}

/**
 * Callback function passed to the Data Service. This is the central point
 * for updating the UI in response to data changes from Firestore. It ensures
 * that what the user sees is always in sync with the database.
 * @param {object} data - The updated LifeCV data from the Data Service.
 */
function handleDataUpdate(data) {
    console.log("LifeCV Controller: Data updated, triggering UI refresh.");
    
    // Get the static configuration for sections from the Data Service
    const sectionsConfig = DataService.getLifeCvSections();
    
    // Pass the new data to the UI modules so they can redraw themselves
    Renderer.renderAllSections(data, sectionsConfig);
    Dashboard.update(data, sectionsConfig);
}

/**
 * A function to expose the current user to other modules if needed.
 * @returns {object|null} The current Firebase user object.
 */
export function getCurrentUser() {
    return currentUser;
}

// --- Application Entry Point ---

// Listen for the 'firebase-ready' event which is dispatched from app.js
// This ensures that Firebase is fully initialized before we try to use it.
document.addEventListener('firebase-ready', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Once we have an authenticated user, start the LifeCV module
            init(user);
        } else {
            console.log("User is not logged in. LifeCV module will not initialize.");
            // In a full application, you might redirect to a login page here.
        }
    });
});
