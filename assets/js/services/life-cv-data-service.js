/* ================================================================================= */
/* FILE: assets/js/services/life-cv-data-service.js                                  */
/* PURPOSE: Manages all data interactions for the LifeCV module. It is the single    */
/* source of truth for LifeCV data, handling Firestore communication and caching.    */
/* ================================================================================= */

import { db } from '../firebase-config.js';
import { doc, onSnapshot, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { setObjectValueByPath } from '../utils/helpers.js';
import { sanitizeInput, validateEmail, validateUrl, validatePhoneNumber } from '../utils/validators.js';

let lifeCvData = {}; // Local cache for user's LifeCV data
let currentUser = null;
let onDataUpdateCallback = () => {};
let debounceTimer;

// The static configuration for the LifeCV sections.
const lifeCvSections = {
    profilePictures: { 
        title: 'Profile Pictures', 
        icon: 'fa-camera-retro', 
        isCustom: true 
    },
    personal: { 
        title: 'Personal & Identity', 
        icon: 'fa-user', 
        fields: [
            { id: 'fullName', label: 'Full Name', type: 'text', sensitive: false },
            { id: 'preferredName', label: 'Preferred Name/Nickname', type: 'text', sensitive: false },
            { id: 'pronouns', label: 'Pronouns', type: 'text', placeholder: 'they/them, she/her, he/him, etc.', sensitive: false },
            { id: 'idNumber', label: 'ID/Passport Number', type: 'text', sensitive: true },
            { id: 'dateOfBirth', label: 'Date of Birth', type: 'date', sensitive: true },
            { id: 'nationality', label: 'Nationality', type: 'text', sensitive: true },
            { id: 'residentialAddress', label: 'Residential Address', type: 'textarea', sensitive: true },
        ]
    },
    contact: { 
        title: 'Contact Information', 
        icon: 'fa-envelope', 
        fields: [
            { id: 'primaryEmail', label: 'Primary Email', type: 'email', sensitive: true },
            { id: 'primaryPhone', label: 'Primary Phone', type: 'tel', sensitive: true },
            { id: 'workEmail', label: 'Work Email', type: 'email', sensitive: true },
            { id: 'workPhone', label: 'Work Phone', type: 'tel', sensitive: true },
            { id: 'linkedin', label: 'LinkedIn Profile', type: 'url', sensitive: false },
            { id: 'website', label: 'Personal Website', type: 'url', sensitive: false },
        ]
    },
    career: {
        title: 'Career & Work Experience',
        icon: 'fa-briefcase',
        isList: true,
        fields: [
            { id: 'jobTitle', label: 'Job Title', type: 'text', sensitive: false },
            { id: 'company', label: 'Company', type: 'text', sensitive: false },
            { id: 'startDate', label: 'Start Date', type: 'date', sensitive: false },
            { id: 'endDate', label: 'End Date', type: 'date', sensitive: false },
            { id: 'description', label: 'Description', type: 'textarea', sensitive: false },
            { id: 'location', label: 'Location', type: 'text', sensitive: false },
        ]
    },
    education: {
        title: 'Education & Qualifications',
        icon: 'fa-graduation-cap',
        isList: true,
        fields: [
            { id: 'institution', label: 'Institution', type: 'text', sensitive: false },
            { id: 'degree', label: 'Degree/Qualification', type: 'text', sensitive: false },
            { id: 'fieldOfStudy', label: 'Field of Study', type: 'text', sensitive: false },
            { id: 'startDate', label: 'Start Date', type: 'date', sensitive: false },
            { id: 'endDate', label: 'End Date', type: 'date', sensitive: false },
            { id: 'grade', label: 'Grade/GPA', type: 'text', sensitive: true },
        ]
    },
    skills: {
        title: 'Skills & Competencies',
        icon: 'fa-cogs',
        isList: true,
        fields: [
            { id: 'skillName', label: 'Skill Name', type: 'text', sensitive: false },
            { id: 'proficiency', label: 'Proficiency Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], sensitive: false },
            { id: 'category', label: 'Category', type: 'select', options: ['Technical', 'Soft Skills', 'Languages', 'Tools', 'Other'], sensitive: false },
            { id: 'yearsOfExperience', label: 'Years of Experience', type: 'number', sensitive: false },
        ]
    },
    projects: {
        title: 'Projects & Achievements',
        icon: 'fa-trophy',
        isList: true,
        fields: [
            { id: 'projectName', label: 'Project Name', type: 'text', sensitive: false },
            { id: 'description', label: 'Description', type: 'textarea', sensitive: false },
            { id: 'role', label: 'Your Role', type: 'text', sensitive: false },
            { id: 'technologies', label: 'Technologies Used', type: 'text', sensitive: false },
            { id: 'startDate', label: 'Start Date', type: 'date', sensitive: false },
            { id: 'endDate', label: 'End Date', type: 'date', sensitive: false },
            { id: 'url', label: 'Project URL', type: 'url', sensitive: false },
        ]
    }
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
    return lifeCvSections;
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