/* ================================================================================= */
/* FILE: assets/js/services/life-cv-data-service.js                                  */
/* PURPOSE: Manages all data interactions for the LifeCV module. It is the single    */
/* source of truth for LifeCV data, handling Firestore communication and caching.    */
/* ================================================================================= */

import { db } from '../firebase-config.js';
import { doc, onSnapshot, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { setObjectValueByPath } from '../utils/helpers.js';
import { sanitizeInput, validateEmail, validateUrl, validatePhoneNumber } from '../utils/validators.js';

let currentUser = null;
let lifeCvData = {};

/**
 * Initializes the data service and sets up the Firestore listener.
 * @param {object} user - The authenticated Firebase user object.
 * @param {function} callback - Function to call when data is updated.
 */
export function init(user, callback) {
    if (!user) return;
    currentUser = user;
    onDataUpdateCallback = callback;

    const userDocRef = doc(db, 'users', currentUser.uid);
    
    onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
            const userData = doc.data();
            lifeCvData = userData.lifeCv || {};
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
    return {
        personalInfo: {
            title: "Personal Information",
            isArray: false,
            fields: [
                { id: "name", label: "Full Name" },
                { id: "email", label: "Email" }
            ]
        }
    };
}

/**
 * Saves the entire local lifeCvData object to Firestore.
 */
export async function saveLifeCvData() {
    if (!currentUser) return;
    try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, { 
            lifeCv: lifeCvData,
            lastModified: new Date().toISOString()
        });
        console.log("Data service saved data to Firestore.");
    } catch (error) {
        console.error("Data service: Error saving data:", error);
        // If document doesn't exist, create it
        if (error.code === 'not-found') {
            await setDoc(userDocRef, { 
                lifeCv: lifeCvData,
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString()
            });
        }
    }
}

/**
 * Validates a field's value based on its type.
 * @param {object} field - The field configuration object.
 * @param {*} value - The value to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function validateFieldValue(field, value) {
    if (!value) return true; // Allow empty values
    
    switch (field.type) {
        case 'email':
            return validateEmail(value);
        case 'url':
            return validateUrl(value);
        case 'tel':
            return validatePhoneNumber(value);
        default:
            return true;
    }
}

/**
 * Updates a specific field and debounces the save operation.
 * @param {string} path - The dot-notation path to the field.
 * @param {*} value - The new value for the field.
 */
export function updateField(path, value) {
    // Sanitize string inputs
    if (typeof value === 'string') {
        value = sanitizeInput(value);
    }
    
    // Validate based on field type if available
    const pathParts = path.split('.');
    if (pathParts.length >= 2) {
        const sectionKey = pathParts[0];
        const fieldId = pathParts[1];
        const section = lifeCvSections[sectionKey];
        
        if (section?.fields) {
            const field = section.fields.find(f => f.id === fieldId);
            if (field && !validateFieldValue(field, value)) {
                console.warn(`Invalid value for field ${field.label}: ${value}`);
                return; // Don't save invalid data
            }
        }
    }
    
    setObjectValueByPath(lifeCvData, path, value);
    setObjectValueByPath(lifeCvData, path.replace('.value', '.lastModified'), new Date().toISOString());

    // Debounce Firestore update
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        saveLifeCvData();
    }, 1500); // Wait 1.5 seconds after last input
}

/**
 * Export data for download
 */
export function exportData() {
    return JSON.stringify(lifeCvData, null, 2);
}

/**
 * Import data from uploaded file
 */
export async function importData(importedData) {
    try {
        // Validate and merge data
        const mergedData = { ...lifeCvData, ...importedData };
        lifeCvData = mergedData;
        await saveLifeCvData();
        onDataUpdateCallback(lifeCvData);
        return true;
    } catch (error) {
        console.error('Import failed:', error);
        return false;
    }
}