/* ================================================================================= */
/* FILE: assets/js/modules/life-cv.js (v3.1 - Robust Controller)                     */
/* PURPOSE: Main controller for the LifeCV module. Initializes and coordinates       */
/* all services and UI components in a safe, sequential order.                       */
/* ================================================================================= */

// --- Static Imports for Reliability ---
// Import Firebase services and authentication functions
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { auth, db, uploadFile } from '../firebase-config.js';

// Import all specialized LifeCV modules
import * as DataService from '../services/life-cv-data-service.js';
import * as renderer from '../ui/lifecv-renderer.js';
import * as Dashboard from '../ui/lifecv-dashboard.js';
import * as Modals from '../ui/lifecv-modals.js';
import * as Events from '../ui/lifecv-events.js';

// --- State Variables ---
let currentUser = null;
let isInitialized = false;

// --- Main Initialization Function (The Entry Point) ---
/**
 * Initializes the entire LifeCV application.
 * This is the single entry point called from life-cv.html.
 */
export async function initLifeCV() {
    if (isInitialized) {
        console.warn("LifeCV module already initialized.");
        return;
    }
    console.log("LifeCV Initializer: Starting...");

    // Show loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    loadingIndicator.classList.remove('hidden');

    try {
        // 1. Wait for Firebase Authentication
        const user = await waitForAuth();
        currentUser = user;
        console.log(`LifeCV Initializer: User authenticated (UID: ${user.uid})`);

        // 2. Initialize all sub-modules in the correct order
        await DataService.init(user, handleDataUpdate);
        await Dashboard.init();
        await Modals.init();
        await Events.init();

        isInitialized = true;
        console.log("LifeCV Initializer: All modules initialized successfully.");

        // 4. Hide loading indicator ONLY after everything is ready
        setTimeout(() => {
            loadingIndicator.classList.add('hidden');
        }, 200);

    } catch (error) {
        console.error("LifeCV Initializer: A critical error occurred during initialization.", error);
        throw error; // Re-throw to be caught by the global handler
    }
}

/**
 * A Promise-based function that waits for the user to be authenticated.
 * @returns {Promise<object>} A promise that resolves with the user object or rejects if auth fails.
 */
function waitForAuth() {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            if (user) {
                resolve(user);
            } else {
                reject(new Error('User not authenticated. Please log in first.'));
            }
        }, (error) => {
            unsubscribe();
            reject(error);
        });
    });
}

/**
 * Callback function passed to the DataService.
 * It's triggered whenever Firestore data changes.
 * @param {object} data - The complete, updated LifeCV data from Firestore.
 */
function handleDataUpdate(data) {
    if (!isInitialized) {
        console.log("LifeCV Controller: Data received, but modules not ready. Buffering.");
        return;
    }
    console.log("LifeCV Controller: Data updated, triggering UI refresh.");

    try {
        // Get the static section configuration
        const sectionsConfig = DataService.getLifeCvSections();

        // Re-render the main content and the dashboard with the new data
        renderer.renderAllSections(data, sectionsConfig);
        Dashboard.update(data, sectionsConfig);
    } catch (error) {
        console.error("LifeCV Controller: Error updating UI.", error);
        // Optionally, show a non-critical error notification to the user
    }
}

/**
 * A utility function to make the current user available to other modules if needed.
 * @returns {object | null} The authenticated user object.
 */
export function getCurrentUser() {
    return currentUser;
}