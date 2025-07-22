/* ================================================================================= */
/* FILE: assets/js/services/database.js                                              */
/* PURPOSE: To provide reusable functions for interacting with the Firestore       */
/* database. This separates database logic from page-specific code.       */
/* ================================================================================= */

// Import the Firestore database object and specific functions we need.
import { db } from '../firebase-config.js';
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

/**
 * Saves or overwrites a document in a Firestore collection.
 * @param {string} collectionPath - The path to the collection (e.g., 'users').
 * @param {string} documentId - The ID of the document to save.
 * @param {object} data - The JavaScript object to save as the document.
 * @returns {Promise<void>} A promise that resolves when the save is complete.
 */
export const saveDocument = async (collectionPath, documentId, data) => {
    try {
        const docRef = doc(db, collectionPath, documentId);
        // Using setDoc with { merge: true } will create the doc if it doesn't exist,
        // or update it if it does, without overwriting the entire document.
        await setDoc(docRef, data, { merge: true });
        console.log("Document successfully written:", documentId);
    } catch (error) {
        console.error("Error writing document: ", error);
        // Re-throw the error so the calling function can handle it (e.g., show a message to the user)
        throw error;
    }
};

/**
 * Retrieves a single document from Firestore.
 * @param {string} collectionPath - The path to the collection (e.g., 'users').
 * @param {string} documentId - The ID of the document to retrieve.
 * @returns {Promise<object|null>} A promise that resolves with the document data, or null if it doesn't exist.
 */
export const getDocument = async (collectionPath, documentId) => {
    try {
        const docRef = doc(db, collectionPath, documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
            return docSnap.data();
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error getting document:", error);
        throw error;
    }
};


/* ================================================================================= */
/* FILE: assets/js/modules/life-cv.js                                                */
/* PURPOSE: The main controller script for the life-cv.html page.                  */
/* It handles data loading, saving, and dynamic form interactions.        */
/* ================================================================================= */

import { auth } from '../firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { saveDocument, getDocument } from '../services/database.js';

// Check if we are on the LifeCV page
if (document.getElementById('lifecv-form')) {
    
    // --- DOM Element References ---
    const form = document.getElementById('lifecv-form');
    const saveButton = document.getElementById('save-cv-button');
    const statusBox = document.getElementById('status-box');
    const addExperienceBtn = document.getElementById('add-experience-btn');
    const experienceList = document.getElementById('experience-list');
    const addEducationBtn = document.getElementById('add-education-btn');
    const educationList = document.getElementById('education-list');

    let currentUserId = null;

    // --- Helper function to show status messages ---
    const showStatus = (message, isError = false) => {
        statusBox.textContent = message;
        statusBox.className = `p-3 mb-6 text-center text-sm rounded-lg ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
        statusBox.classList.remove('hidden');
        setTimeout(() => statusBox.classList.add('hidden'), 3000); // Hide after 3 seconds
    };

    // --- Dynamic Form Functions ---

    // Creates the HTML for a single work experience entry
    const createExperienceEntry = (exp = {}) => {
        const entryId = `exp-${Date.now()}`;
        const entryDiv = document.createElement('div');
        entryDiv.className = 'p-4 border rounded-lg space-y-2 relative';
        entryDiv.id = entryId;
        entryDiv.innerHTML = `
            <input type="text" placeholder="Job Title" class="input-field font-bold" value="${exp.title || ''}">
            <input type="text" placeholder="Company" class="input-field" value="${exp.company || ''}">
            <div class="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Start Date (e.g., Jan 2020)" class="input-field text-sm" value="${exp.startDate || ''}">
                <input type="text" placeholder="End Date (e.g., Present)" class="input-field text-sm" value="${exp.endDate || ''}">
            </div>
            <textarea placeholder="Description of your role and achievements..." class="input-field w-full text-sm" rows="3">${exp.description || ''}</textarea>
            <button type="button" class="btn btn-danger btn-sm absolute top-2 right-2" onclick="document.getElementById('${entryId}').remove()">
                <i class="fas fa-trash"></i>
            </button>
        `;
        experienceList.appendChild(entryDiv);
    };

     // Creates the HTML for a single education entry
    const createEducationEntry = (edu = {}) => {
        const entryId = `edu-${Date.now()}`;
        const entryDiv = document.createElement('div');
        entryDiv.className = 'p-4 border rounded-lg space-y-2 relative';
        entryDiv.id = entryId;
        entryDiv.innerHTML = `
            <input type="text" placeholder="Degree or Certificate" class="input-field font-bold" value="${edu.degree || ''}">
            <input type="text" placeholder="Institution" class="input-field" value="${edu.institution || ''}">
            <input type="text" placeholder="Year of Completion" class="input-field text-sm" value="${edu.year || ''}">
            <button type="button" class="btn btn-danger btn-sm absolute top-2 right-2" onclick="document.getElementById('${entryId}').remove()">
                <i class="fas fa-trash"></i>
            </button>
        `;
        educationList.appendChild(entryDiv);
    };

    // --- Data Handling Functions ---

    // Loads CV data from Firestore and populates the form
    const loadCvData = async (userId) => {
        try {
            const cvData = await getDocument('lifecv', userId);
            if (cvData) {
                // Populate personal details
                form['cv-name'].value = cvData.personal?.name || '';
                form['cv-email'].value = cvData.personal?.email || '';
                form['cv-phone'].value = cvData.personal?.phone || '';
                form['cv-linkedin'].value = cvData.personal?.linkedin || '';
                form['cv-summary'].value = cvData.personal?.summary || '';

                // Populate work experience
                experienceList.innerHTML = ''; // Clear existing
                if (cvData.experience) {
                    cvData.experience.forEach(createExperienceEntry);
                }

                 // Populate education
                educationList.innerHTML = ''; // Clear existing
                if (cvData.education) {
                    cvData.education.forEach(createEducationEntry);
                }
            } else {
                 // If no data, add one empty entry to get them started
                createExperienceEntry();
                createEducationEntry();
            }
        } catch (error) {
            showStatus("Failed to load your CV data. Please try again.", true);
        }
    };

    // Gathers all data from the form and prepares it for saving
    const collectCvData = () => {
        const data = {
            personal: {
                name: form['cv-name'].value,
                email: form['cv-email'].value,
                phone: form['cv-phone'].value,
                linkedin: form['cv-linkedin'].value,
                summary: form['cv-summary'].value,
            },
            experience: [],
            education: []
        };

        // Collect all experience entries
        experienceList.querySelectorAll('.p-4').forEach(entry => {
            data.experience.push({
                title: entry.children[0].value,
                company: entry.children[1].value,
                startDate: entry.children[2].children[0].value,
                endDate: entry.children[2].children[1].value,
                description: entry.children[3].value,
            });
        });

        // Collect all education entries
        educationList.querySelectorAll('.p-4').forEach(entry => {
            data.education.push({
                degree: entry.children[0].value,
                institution: entry.children[1].value,
                year: entry.children[2].value,
            });
        });

        return data;
    };

    // --- Event Listeners ---

    // Add new experience entry
    addExperienceBtn.addEventListener('click', () => createExperienceEntry());
    
    // Add new education entry
    addEducationBtn.addEventListener('click', () => createEducationEntry());

    // Save the entire CV
    saveButton.addEventListener('click', async () => {
        if (!currentUserId) {
            showStatus("You must be logged in to save.", true);
            return;
        }
        saveButton.disabled = true;
        saveButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...';
        
        const cvData = collectCvData();
        try {
            await saveDocument('lifecv', currentUserId, cvData);
            showStatus("LifeCV saved successfully!", false);
        } catch (error) {
            showStatus("Error saving your LifeCV. Please try again.", true);
        } finally {
            saveButton.disabled = false;
            saveButton.innerHTML = '<i class="fas fa-save mr-2"></i>Save LifeCV';
        }
    });

    // --- Initialization ---
    // Listen for authentication state changes to get the user ID
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in.
            currentUserId = user.uid;
            console.log("LifeCV page loaded for user:", currentUserId);
            // Now that we have the user ID, load their CV data.
            loadCvData(currentUserId);
        } else {
            // User is signed out. Redirect them.
            console.log("User not logged in on LifeCV page. Redirecting...");
            window.location.replace('/login.html');
        }
    });
}
