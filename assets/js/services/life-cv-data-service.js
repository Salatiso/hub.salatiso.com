/* ================================================================================= */
/* FILE: assets/js/services/life-cv-data-service.js (CORRECTED)                      */
/* PURPOSE: Manages all data interactions for the LifeCV module                     */
/* ================================================================================= */

import { auth, db } from '../firebase-config.js';
import { doc, onSnapshot, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { debounce, getNestedProperty, setNestedProperty } from '../utils/helpers.js';
import { validateField } from '../utils/validators.js';

let currentUser = null;
let lifeCvData = {};
let onDataUpdateCallback = null;
let saveTimeout = null;

/**
 * Initializes the data service and sets up the Firestore listener.
 */
export async function init(user, callback) {
    if (!user) {
        throw new Error('User is required for data service initialization');
    }
    
    currentUser = user;
    onDataUpdateCallback = callback;

    const userDocRef = doc(db, 'users', currentUser.uid);
    
    onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
            const userData = doc.data();
            console.log('Raw user data from Firestore:', userData);
            
            // Check for existing data under different keys
            if (userData.lifeCv) {
                console.log('Found existing data under lifeCv, migrating...');
                lifeCvData = migrateExistingData(userData.lifeCv);
                // Save migrated data
                setDoc(userDocRef, { lifeCvData }, { merge: true });
            } else if (userData.lifeCvData) {
                console.log('Found data under lifeCvData');
                lifeCvData = userData.lifeCvData;
            } else {
                console.log('No existing data found, creating default');
                // Create initial document
                lifeCvData = getDefaultLifeCvData();
                setDoc(userDocRef, { lifeCvData }, { merge: true });
            }
        } else {
            console.log('No user document exists, creating default');
            // Create initial document
            lifeCvData = getDefaultLifeCvData();
            setDoc(userDocRef, { lifeCvData }, { merge: true });
        }
        
        console.log('Final lifeCvData:', lifeCvData);
        
        if (onDataUpdateCallback) {
            onDataUpdateCallback(lifeCvData);
        }
    }, (error) => {
        console.error('Error listening to Firestore:', error);
    });
}

/**
 * Migrate existing data structure to new format
 */
function migrateExistingData(existingData) {
    console.log('Migrating existing data:', existingData);
    
    const migrated = getDefaultLifeCvData();
    
    // Handle different possible data structures
    if (existingData.personalInfo) {
        migrated.personalInfo = existingData.personalInfo;
    }
    
    // Migrate education array
    if (existingData.education && Array.isArray(existingData.education)) {
        migrated.education = existingData.education;
    }
    
    // Migrate experience array
    if (existingData.experience && Array.isArray(existingData.experience)) {
        migrated.experience = existingData.experience;
    }
    
    // Migrate skills array
    if (existingData.skills && Array.isArray(existingData.skills)) {
        migrated.skills = existingData.skills;
    }
    
    // Migrate other arrays
    ['certifications', 'projects', 'languages', 'interests'].forEach(key => {
        if (existingData[key] && Array.isArray(existingData[key])) {
            migrated[key] = existingData[key];
        }
    });
    
    console.log('Migrated data:', migrated);
    return migrated;
}

/**
 * Returns default LifeCV data structure
 */
function getDefaultLifeCvData() {
    return {
        personalInfo: {
            name: { value: '', isPublic: true },
            email: { value: '', isPublic: true },
            phone: { value: '', isPublic: false },
            address: { value: '', isPublic: false },
            dateOfBirth: { value: '', isPublic: false },
            profilePicture: { value: '', isPublic: true }
        },
        education: [],
        experience: [],
        skills: [],
        certifications: [],
        projects: [],
        languages: [],
        interests: []
    };
}

/**
 * Returns the current state of the LifeCV data.
 */
export function getLifeCvData() {
    return lifeCvData;
}

/**
 * Returns the current user
 */
export function getCurrentUser() {
    return currentUser;
}

/**
 * Returns the static section configuration.
 */
export function getLifeCvSections() {
    return {
        personalInfo: {
            title: "Personal Information",
            isArray: false,
            fields: [
                { id: "name", label: "Full Name", type: "text", required: true },
                { id: "email", label: "Email", type: "email", required: true },
                { id: "phone", label: "Phone", type: "phone", sensitive: true },
                { id: "address", label: "Address", type: "textarea", sensitive: true },
                { id: "dateOfBirth", label: "Date of Birth", type: "date", sensitive: true },
                { id: "profilePicture", label: "Profile Picture", type: "file" }
            ]
        },
        education: {
            title: "Education",
            isArray: true,
            fields: [
                { id: "institution", label: "Institution", type: "text", required: true },
                { id: "degree", label: "Degree", type: "text", required: true },
                { id: "field", label: "Field of Study", type: "text" },
                { id: "startDate", label: "Start Date", type: "date" },
                { id: "endDate", label: "End Date", type: "date" },
                { id: "gpa", label: "GPA", type: "text" },
                { id: "description", label: "Description", type: "textarea" }
            ]
        },
        experience: {
            title: "Work Experience",
            isArray: true,
            fields: [
                { id: "company", label: "Company", type: "text", required: true },
                { id: "position", label: "Position", type: "text", required: true },
                { id: "startDate", label: "Start Date", type: "date" },
                { id: "endDate", label: "End Date", type: "date" },
                { id: "current", label: "Current Position", type: "checkbox" },
                { id: "description", label: "Description", type: "textarea" },
                { id: "achievements", label: "Key Achievements", type: "textarea" }
            ]
        },
        skills: {
            title: "Skills",
            isArray: true,
            fields: [
                { id: "name", label: "Skill Name", type: "text", required: true },
                { id: "level", label: "Proficiency Level", type: "select", options: ["Beginner", "Intermediate", "Advanced", "Expert"] },
                { id: "category", label: "Category", type: "text" },
                { id: "yearsOfExperience", label: "Years of Experience", type: "number" }
            ]
        },
        certifications: {
            title: "Certifications",
            isArray: true,
            fields: [
                { id: "name", label: "Certification Name", type: "text", required: true },
                { id: "issuer", label: "Issuing Organization", type: "text", required: true },
                { id: "dateObtained", label: "Date Obtained", type: "date" },
                { id: "expiryDate", label: "Expiry Date", type: "date" },
                { id: "credentialId", label: "Credential ID", type: "text" },
                { id: "url", label: "Verification URL", type: "url" }
            ]
        },
        projects: {
            title: "Projects",
            isArray: true,
            fields: [
                { id: "name", label: "Project Name", type: "text", required: true },
                { id: "description", label: "Description", type: "textarea", required: true },
                { id: "technologies", label: "Technologies Used", type: "text" },
                { id: "startDate", label: "Start Date", type: "date" },
                { id: "endDate", label: "End Date", type: "date" },
                { id: "url", label: "Project URL", type: "url" },
                { id: "githubUrl", label: "GitHub URL", type: "url" }
            ]
        },
        languages: {
            title: "Languages",
            isArray: true,
            fields: [
                { id: "language", label: "Language", type: "text", required: true },
                { id: "proficiency", label: "Proficiency", type: "select", options: ["Basic", "Conversational", "Fluent", "Native"] },
                { id: "certifications", label: "Certifications", type: "text" }
            ]
        },
        interests: {
            title: "Interests & Hobbies",
            isArray: true,
            fields: [
                { id: "name", label: "Interest/Hobby", type: "text", required: true },
                { id: "description", label: "Description", type: "textarea" },
                { id: "level", label: "Level of Interest", type: "select", options: ["Casual", "Moderate", "Serious", "Professional"] }
            ]
        }
    };
}

/**
 * Saves the entire local lifeCvData object to Firestore.
 */
export async function saveLifeCvData() {
    if (!currentUser) {
        throw new Error('No user authenticated');
    }

    try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, { lifeCvData });
        console.log('LifeCV data saved successfully');
    } catch (error) {
        console.error('Error saving LifeCV data:', error);
        throw error;
    }
}

/**
 * Debounced save function
 */
const debouncedSave = debounce(saveLifeCvData, 1000);

/**
 * Updates a specific field and debounces the save operation.
 */
export function updateField(path, value) {
    setNestedProperty(lifeCvData, path, value);
    debouncedSave();
    
    if (onDataUpdateCallback) {
        onDataUpdateCallback(lifeCvData);
    }
}

/**
 * Validates a field's value based on its type.
 */
function validateFieldValue(field, value) {
    const errors = validateField(field, value);
    return errors.length === 0;
}

/**
 * Export data for download
 */
export function exportData() {
    const dataStr = JSON.stringify(lifeCvData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `lifecv-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

/**
 * Import data from uploaded file
 */
export async function importData(importedData) {
    try {
        // Validate imported data structure
        if (typeof importedData !== 'object') {
            throw new Error('Invalid data format');
        }

        // Merge with existing data
        lifeCvData = { ...lifeCvData, ...importedData };
        
        // Save to Firestore
        await saveLifeCvData();
        
        if (onDataUpdateCallback) {
            onDataUpdateCallback(lifeCvData);
        }
        
        return true;
    } catch (error) {
        console.error('Error importing data:', error);
        throw error;
    }
}