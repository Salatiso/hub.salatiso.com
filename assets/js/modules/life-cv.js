/* ================================================================================= */
/* FILE: assets/js/modules/life-cv.js (UPGRADED & DEDICATED)                         */
/* PURPOSE: Contains all logic for the LifeCV page. Exported as a module.            */
/* ================================================================================= */
import { auth } from '../firebase-config.js';
import { saveDocument, getDocument } from '../database.js';

export function init() {
    // --- ELEMENT SELECTIONS ---
    const form = document.getElementById('lifecv-form');
    if (!form) return; // Exit if not on the correct page

    const saveButton = document.getElementById('save-cv-button');
    const statusBox = document.getElementById('status-box');
    const addExperienceBtn = document.getElementById('add-experience-btn');
    const experienceList = document.getElementById('experience-list');
    const addEducationBtn = document.getElementById('add-education-btn');
    const educationList = document.getElementById('education-list');
    const jsonImportArea = document.getElementById('json-import-area');
    const importJsonBtn = document.getElementById('import-json-btn');
    
    const currentUserId = auth.currentUser.uid;

    // --- HELPER FUNCTIONS ---
    const showStatus = (message, isError = false) => {
        statusBox.textContent = message;
        statusBox.className = `p-3 mb-6 text-center text-sm rounded-lg ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
        statusBox.classList.remove('hidden');
        setTimeout(() => statusBox.classList.add('hidden'), 4000);
    };

    // --- DYNAMIC FORM ENTRY CREATION ---
    const createExperienceEntry = (exp = {}) => {
        const entryId = `exp-${Date.now()}`;
        const entryDiv = document.createElement('div');
        entryDiv.className = 'p-4 border rounded-lg space-y-2 relative';
        entryDiv.id = entryId;
        entryDiv.innerHTML = `<input type="text" placeholder="Job Title" class="input-field font-bold" value="${exp.title || ''}"><input type="text" placeholder="Company" class="input-field" value="${exp.company || ''}"><div class="grid grid-cols-2 gap-2"><input type="text" placeholder="Start Date" class="input-field text-sm" value="${exp.startDate || ''}"><input type="text" placeholder="End Date" class="input-field text-sm" value="${exp.endDate || ''}"></div><textarea placeholder="Description..." class="input-field w-full text-sm" rows="3">${exp.description || ''}</textarea><button type="button" class="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"><i class="fas fa-trash"></i></button>`;
        entryDiv.querySelector('button').addEventListener('click', () => entryDiv.remove());
        experienceList.appendChild(entryDiv);
    };

    const createEducationEntry = (edu = {}) => {
        const entryId = `edu-${Date.now()}`;
        const entryDiv = document.createElement('div');
        entryDiv.className = 'p-4 border rounded-lg space-y-2 relative';
        entryDiv.id = entryId;
        entryDiv.innerHTML = `<input type="text" placeholder="Degree or Certificate" class="input-field font-bold" value="${edu.degree || ''}"><input type="text" placeholder="Institution" class="input-field" value="${edu.institution || ''}"><input type="text" placeholder="Year of Completion" class="input-field text-sm" value="${edu.year || ''}"><button type="button" class="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"><i class="fas fa-trash"></i></button>`;
        entryDiv.querySelector('button').addEventListener('click', () => entryDiv.remove());
        educationList.appendChild(entryDiv);
    };

    // --- DATA HANDLING ---
    const populateForm = (cvData) => {
        if (!cvData) return;
        form['cv-name'].value = cvData.personal?.name || '';
        form['cv-email'].value = cvData.personal?.email || '';
        form['cv-phone'].value = cvData.personal?.phone || '';
        form['cv-linkedin'].value = cvData.personal?.linkedin || '';
        form['cv-summary'].value = cvData.personal?.summary || '';
        experienceList.innerHTML = '';
        if (cvData.experience && Array.isArray(cvData.experience)) {
            cvData.experience.forEach(createExperienceEntry);
        }
        educationList.innerHTML = '';
        if (cvData.education && Array.isArray(cvData.education)) {
            cvData.education.forEach(createEducationEntry);
        }
    };

    const loadCvData = async (userId) => {
        try {
            const cvData = await getDocument('lifecv', userId);
            if (cvData) {
                populateForm(cvData);
            } else {
                createExperienceEntry();
                createEducationEntry();
            }
        } catch (error) {
            showStatus("Failed to load your CV data.", true);
        }
    };

    const collectCvData = () => {
        const data = { personal: {}, experience: [], education: [] };
        data.personal = { name: form['cv-name'].value, email: form['cv-email'].value, phone: form['cv-phone'].value, linkedin: form['cv-linkedin'].value, summary: form['cv-summary'].value };
        experienceList.querySelectorAll('.p-4').forEach(entry => data.experience.push({ title: entry.children[0].value, company: entry.children[1].value, startDate: entry.children[2].children[0].value, endDate: entry.children[2].children[1].value, description: entry.children[3].value }));
        educationList.querySelectorAll('.p-4').forEach(entry => data.education.push({ degree: entry.children[0].value, institution: entry.children[1].value, year: entry.children[2].value }));
        return data;
    };

    // --- NEW: AI IMPORT LOGIC ---
    const handleJsonImport = () => {
        const jsonString = jsonImportArea.value;
        if (!jsonString.trim()) {
            showStatus("Please paste the JSON from the AI into the text area first.", true);
            return;
        }
        try {
            const cvData = JSON.parse(jsonString);
            if (!cvData.personal || !cvData.experience || !cvData.education) {
                throw new Error("JSON is missing required keys.");
            }
            populateForm(cvData);
            showStatus("Data imported successfully! Review and click 'Save LifeCV'.", false);
            jsonImportArea.value = '';
        } catch (error) {
            showStatus(`Invalid JSON format. Error: ${error.message}`, true);
        }
    };

    addExperienceBtn.addEventListener('click', () => createExperienceEntry());
    addEducationBtn.addEventListener('click', () => createEducationEntry());
    importJsonBtn.addEventListener('click', handleJsonImport);
    saveButton.addEventListener('click', async () => {
        saveButton.disabled = true;
        saveButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...';
        try {
            await saveDocument('lifecv', currentUserId, collectCvData());
            showStatus("LifeCV saved successfully!", false);
        } catch (error) {
            showStatus("Error saving LifeCV.", true);
        } finally {
            saveButton.disabled = false;
            saveButton.innerHTML = '<i class="fas fa-save mr-2"></i>Save LifeCV';
        }
    });

    loadCvData(currentUserId);
}
