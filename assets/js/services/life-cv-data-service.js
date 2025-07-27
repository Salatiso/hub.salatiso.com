/* ================================================================================= */
/* FILE: assets/js/services/life-cv-data-service.js                                  */
/* PURPOSE: Manages all data interactions for the LifeCV module. It is the single    */
/* source of truth for LifeCV data, handling Firestore communication and caching.    */
/* ================================================================================= */

import { db } from '../firebase-config.js';
import { updateDocument } from '../database.js';
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { setObjectValueByPath } from '../utils/helpers.js';

let lifeCvData = {}; // Local cache for user's LifeCV data
let currentUser = null;
let onDataUpdateCallback = () => {};
let debounceTimer;

// The static configuration for the LifeCV sections.
const lifeCvSections = {
    profilePictures: { title: 'Profile Pictures', icon: 'fa-camera-retro', isCustom: true },
    personal: { title: 'Personal & Identity', icon: 'fa-user', fields: [
        { id: 'fullName', label: 'Full Name', type: 'text', sensitive: false },
        { id: 'preferredName', label: 'Preferred Name/Nickname', type: 'text', sensitive: false },
        { id: 'pronouns', label: 'Pronouns', type: 'text', placeholder: 'they/them, she/her, he/him, etc.', sensitive: false },
        { id: 'idNumber', label: 'ID/Passport Number', type: 'text', sensitive: true },
        { id: 'dateOfBirth', label: 'Date of Birth', type: 'date', sensitive: true },
        { id: 'nationality', label: 'Nationality', type: 'text', sensitive: true },
        { id: 'residentialAddress', label: 'Residential Address', type: 'textarea', sensitive: true },
    ]},
    contact: { title: 'Contact Information', icon: 'fa-envelope', fields: [
        { id: 'primaryEmail', label: 'Primary Email', type: 'email', sensitive: true },
        { id: 'primaryPhone', label: 'Primary Phone', type: 'tel', sensitive: true },
    ]},
    // Other sections will be added here in later phases
};

/**
 * Initializes the data service and sets up the Firestore listener.
 * @param {object} user - The authenticated Firebase user object.
 * @param {function} callback - Function to call when data is updated.
 */
export function init(user, callback) {
    if (!user) return;
    currentUser = user;
    onDataUpdateCallback = callback;

    const userDocRef = doc(db, 'users', currentUser.uid, 'lifecv', 'main');
    
    onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
            lifeCvData = doc.data();
        } else {
            lifeCvData = { createdAt: new Date().toISOString() };
            saveLifeCvData(); // Create the initial document
        }
        console.log("Data service received update from Firestore.");
        onDataUpdateCallback(lifeCvData);
    }, (error) => {
        console.error("Data Service: Error listening to document:", error);
    });
}

/**
 * Returns the current state of the LifeCV data.
 * @returns {object} The local data cache.
 */
export function getLifeCvData() {
    return lifeCvData;
}

/**
 * Returns the static section configuration.
 * @returns {object} The lifeCvSections configuration object.
 */
export function getLifeCvSections() {
    return lifeCvSections;
}

/**
 * Saves the entire local lifeCvData object to Firestore.
 */
export async function saveLifeCvData() {
    if (!currentUser) return;
    try {
        await updateDocument('users', currentUser.uid, 'lifecv', 'main', lifeCvData);
        console.log("Data service saved data to Firestore.");
    } catch (error) {
        console.error("Data service: Error saving data:", error);
    }
}

/**
 * Updates a specific field and debounces the save operation.
 * @param {string} path - The dot-notation path to the field.
 * @param {*} value - The new value for the field.
 */
export function updateField(path, value) {
    setObjectValueByPath(lifeCvData, path, value);
    setObjectValueByPath(lifeCvData, path.replace('.value', '.lastModified'), new Date().toISOString());

    // Debounce Firestore update
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        saveLifeCvData();
    }, 1500); // Wait 1.5 seconds after last input
}
