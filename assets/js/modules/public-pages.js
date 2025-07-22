/* ================================================================================= */
/* FILE: assets/js/modules/public-pages.js (NEW - REPLACES PLACEHOLDER)              */
/* ================================================================================= */
import { auth } from '../firebase-config.js';
import { getDocument, updateDocument } from '../database.js';

let currentUserId = null;

// Define the sections of the LifeCV that can be made public.
const shareableSections = [
    { id: 'summary', label: 'Profile Summary & Headline' },
    { id: 'experience', label: 'Professional Experience' },
    { id: 'education', label: 'Education & Qualifications' },
    { id: 'skills', label: 'Skills & Competencies' },
    { id: 'projects', label: 'Projects & Portfolio' },
    { id: 'publications', label: 'Publications' },
    { id: 'contact', label: 'Contact Information' }
];

export function init(user) {
    if (!user || !user.uid) {
        console.error("Public Pages Error: User not authenticated.");
        return;
    }
    currentUserId = user.uid;
    console.log("Public Pages module initialized.");

    setupPage();
    loadAndRenderSettings();
    setupEventListeners();
}

function setupPage() {
    const linkInput = document.getElementById('public-profile-link');
    if (linkInput) {
        // This is a placeholder URL for now. In a real deployment, this would be the actual domain.
        linkInput.value = `https://hub.sazi.life/u/${currentUserId}`;
    }
}

function setupEventListeners() {
    const form = document.getElementById('public-settings-form');
    form.addEventListener('submit', saveSettings);

    const copyBtn = document.getElementById('copy-link-btn');
    copyBtn.addEventListener('click', copyProfileLink);
}

async function loadAndRenderSettings() {
    const container = document.getElementById('settings-toggles-container');
    container.innerHTML = ''; // Clear loading text

    try {
        const userDoc = await getDocument(`users/${currentUserId}`);
        const settings = userDoc?.publicSettings || {};

        shareableSections.forEach(section => {
            const isChecked = settings[section.id] === true;
            const toggleHtml = `
                <div class="flex items-center justify-between bg-slate-50 p-3 rounded-md border">
                    <span class="font-medium text-slate-700">${section.label}</span>
                    <div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="${section.id}" id="${section.id}-toggle" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" ${isChecked ? 'checked' : ''}/>
                        <label for="${section.id}-toggle" class="toggle-label block overflow-hidden h-6 rounded-full bg-slate-300 cursor-pointer"></label>
                    </div>
                </div>
            `;
            container.innerHTML += toggleHtml;
        });
    } catch (error) {
        console.error("Error loading public settings:", error);
        container.innerHTML = `<p class="text-red-500">Could not load settings. Please try again later.</p>`;
    }
}

async function saveSettings(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const newSettings = {};

    // The FormData object only contains checked checkboxes, so we must build the object carefully.
    shareableSections.forEach(section => {
        newSettings[section.id] = formData.has(section.id);
    });

    try {
        await updateDocument(`users/${currentUserId}`, { publicSettings: newSettings });
        // Provide user feedback
        const saveBtn = form.querySelector('button[type="submit"]');
        saveBtn.textContent = 'Saved!';
        saveBtn.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
        saveBtn.classList.add('bg-green-600');
        setTimeout(() => {
            saveBtn.textContent = 'Save Changes';
            saveBtn.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
            saveBtn.classList.remove('bg-green-600');
        }, 2000);
    } catch (error) {
        console.error("Error saving settings:", error);
        alert("There was an error saving your settings. Please try again.");
    }
}

function copyProfileLink() {
    const linkInput = document.getElementById('public-profile-link');
    const copyStatus = document.getElementById('copy-status');
    
    // Use a temporary textarea to enable copying
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = linkInput.value;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextArea);

    copyStatus.textContent = 'Link copied to clipboard!';
    setTimeout(() => {
        copyStatus.textContent = '';
    }, 2000);
}
