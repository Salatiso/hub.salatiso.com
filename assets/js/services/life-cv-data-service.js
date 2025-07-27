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
            
            // Check for existing data under different keys
            if (userData.lifeCv) {
                console.log('Found existing data under lifeCv, migrating...');
                lifeCvData = migrateExistingData(userData.lifeCv);
                // Save migrated data
                setDoc(userDocRef, { lifeCvData }, { merge: true });
            } else if (userData.lifeCvData) {
                lifeCvData = userData.lifeCvData;
            } else {
                // Create initial document
                lifeCvData = getDefaultLifeCvData();
                setDoc(userDocRef, { lifeCvData }, { merge: true });
            }
        } else {
            // Create initial document
            lifeCvData = getDefaultLifeCvData();
            setDoc(userDocRef, { lifeCvData }, { merge: true });
        }
        
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
    console.log('Migrating existing data structure...');
    
    const migrated = {
        personalInfo: {
            name: { value: existingData.personal?.fullName || '', isPublic: true },
            email: { value: existingData.personal?.email || '', isPublic: true },
            phone: { value: existingData.personal?.phone || '', isPublic: false },
            address: { value: existingData.personal?.address || '', isPublic: false },
            dateOfBirth: { value: existingData.personal?.dob || '', isPublic: false },
            profilePicture: { value: '', isPublic: true }
        },
        education: migrateArraySection(existingData.education, {
            institution: 'institution',
            degree: 'qualification',
            field: 'field',
            startDate: '',
            endDate: 'yearCompleted',
            gpa: 'grade',
            description: 'significance'
        }),
        experience: migrateArraySection(existingData.experience, {
            company: 'company',
            position: 'jobTitle',
            startDate: 'startDate',
            endDate: 'endDate',
            current: false,
            description: 'description',
            achievements: 'skills'
        }),
        skills: migrateArraySection(existingData.skills, {
            name: 'skillName',
            level: 'proficiency',
            category: 'category',
            yearsOfExperience: ''
        }),
        certifications: migrateArraySection(existingData.certifications, {
            name: 'name',
            issuer: 'issuer',
            dateObtained: 'date',
            expiryDate: 'expires',
            credentialId: 'credentialId',
            url: 'url'
        }),
        projects: migrateArraySection(existingData.projects, {
            name: 'name',
            description: 'description',
            technologies: 'technologies',
            startDate: '',
            endDate: '',
            url: 'url',
            githubUrl: ''
        }),
        languages: migrateArraySection(existingData.languages, {
            language: 'language',
            proficiency: 'proficiency',
            certifications: 'context'
        }),
        interests: migrateArraySection(existingData.interests, {
            name: 'interest',
            description: 'description',
            level: 'level'
        })
    };
    
    console.log('Data migration completed');
    return migrated;
}

/**
 * Helper function to migrate array sections
 */
function migrateArraySection(sourceArray, fieldMapping) {
    if (!Array.isArray(sourceArray)) return [];
    
    return sourceArray.map(item => {
        const migratedItem = {};
        
        for (const [newField, oldField] of Object.entries(fieldMapping)) {
            const value = typeof oldField === 'string' && oldField ? item[oldField] : '';
            migratedItem[newField] = {
                value: value || '',
                isPublic: true
            };
        }
        
        return migratedItem;
    });
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