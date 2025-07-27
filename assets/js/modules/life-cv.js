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
import LifeCVRenderer from './life-cv-renderer.js';
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
        // Pass necessary dependencies like auth, db, and the user object.
        await DataService.init(user, handleDataUpdate);
        await Dashboard.init();
        const renderer = new LifeCVRenderer();
        await renderer.init();
        await Modals.init({
            currentUser,
            db,
            uploadFile,
            dataService: DataService,
            renderer: renderer
        });
        await Events.init({
            dataService: DataService,
            modals: Modals,
            renderer: renderer
        });

        // 3. The initial data fetch is triggered by the onSnapshot listener
        // in DataService, which then calls handleDataUpdate.

        isInitialized = true;
        console.log("LifeCV Initializer: All modules initialized successfully.");

        // 4. Hide loading indicator ONLY after everything is ready
        // Add a small delay to prevent flickering
        setTimeout(() => {
            loadingIndicator.classList.add('hidden');
        }, 200);

    } catch (error) {
        console.error("LifeCV Initializer: A critical error occurred during initialization.", error);
        // The global error handler in life-cv.html will show the error boundary UI
        throw error; // Re-throw to be caught by the global handler
    }
}

/**
 * A Promise-based function that waits for the user to be authenticated.
 * @returns {Promise<object>} A promise that resolves with the user object or rejects if auth fails.
 */
function waitForAuth() {
    return new Promise((resolve, reject) => {
        // Set a timeout to prevent getting stuck indefinitely
        const authTimeout = setTimeout(() => {
            reject(new Error("Authentication timed out. Please check your connection and try again."));
        }, 10000); // 10-second timeout

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            clearTimeout(authTimeout); // Clear the timeout once we get a response
            unsubscribe(); // Stop listening to further auth changes here
            if (user) {
                resolve(user);
            } else {
                console.log("User is not logged in. Redirecting to login page.");
                // Redirect to login if not authenticated
                window.location.href = './login.html';
                reject(new Error("User not authenticated."));
            }
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
