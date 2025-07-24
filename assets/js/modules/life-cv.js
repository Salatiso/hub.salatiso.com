/* ================================================================================= */
/* FILE: assets/js/modules/life-cv.js                                                */
/* PURPOSE: Manages all functionality for the LifeCV page, including fetching,       */
/* rendering, saving, and importing user data.                                       */
/* ================================================================================= */
import { auth, db } from '../firebase-config.js';
import { getDocument, updateDocument } from '../database.js';
import { uploadFile, deleteFile } from '../storage.js'; // Import storage functions
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

let currentUser = null;
let lifeCvData = {}; // Local cache for user's LifeCV data

// Define the structure of the LifeCV
const lifeCvSections = {
    profilePictures: { title: 'Profile Pictures', icon: 'fa-camera-retro', isCustom: true }, // Custom rendered section
    personal: { title: 'Personal & Contact Details', icon: 'fa-user', fields: [
        { id: 'fullName', label: 'Full Name', type: 'text' },
        { id: 'idNumber', label: 'ID/Passport Number', type: 'text' },
        { id: 'dob', label: 'Date of Birth', type: 'date' },
        { id: 'nationality', label: 'Nationality', type: 'text' },
        { id: 'phone', label: 'Phone Number', type: 'tel' },
        { id: 'email', label: 'Email Address', type: 'email', readonly: true },
        { id: 'address', label: 'Residential Address', type: 'textarea' },
    ]},
    summary: { title: 'Professional Summary', icon: 'fa-quote-left', fields: [
        { id: 'summary', label: 'Your Summary', type: 'textarea', placeholder: 'A brief summary of your professional background...' }
    ]},
    experience: { title: 'Work Experience', icon: 'fa-briefcase', isArray: true, fields: [
        { id: 'jobTitle', label: 'Job Title', type: 'text' },
        { id: 'company', label: 'Company', type: 'text' },
        { id: 'startDate', label: 'Start Date', type: 'month' },
        { id: 'endDate', label: 'End Date (leave blank if current)', type: 'month' },
        { id: 'description', label: 'Responsibilities', type: 'textarea' },
    ]},
    education: { title: 'Education & Qualifications', icon: 'fa-graduation-cap', isArray: true, fields: [
        { id: 'qualification', label: 'Qualification', type: 'text' },
        { id: 'institution', label: 'Institution', type: 'text' },
        { id: 'yearCompleted', label: 'Year Completed', type: 'number' },
    ]},
    skills: { title: 'Skills', icon: 'fa-cogs', isArray: true, fields: [
        { id: 'skillName', label: 'Skill', type: 'text' },
        { id: 'proficiency', label: 'Proficiency (e.g., Expert, Intermediate)', type: 'text' },
    ]},
};

export function init(user) {
    if (!user) return;
    currentUser = user;
    console.log("LifeCV module initialized.");
    
    attachImportListeners();

    const userDocRef = doc(db, "users", currentUser.uid);
    onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
            lifeCvData = docSnap.data().lifeCv || {};
            if (!lifeCvData.personal) lifeCvData.personal = {};
            lifeCvData.personal.email = currentUser.email;
            renderAllSections();
        }
    });
}

function renderAllSections() {
    const container = document.getElementById('lifecv-container');
    container.innerHTML = ''; // Clear previous content

    for (const key in lifeCvSections) {
        const section = lifeCvSections[key];
        const sectionData = lifeCvData[key] || (section.isArray ? [] : {});
        
        if (section.isCustom) {
            if (key === 'profilePictures') {
                container.appendChild(createProfilePicturesSection(key, section, lifeCvData.profilePictures || {}));
            }
        } else {
            container.appendChild(createSectionElement(key, section, sectionData));
        }
    }
}

function createSectionElement(key, sectionConfig, sectionData) {
    const sectionWrapper = document.createElement('div');
    sectionWrapper.className = 'bg-white rounded-lg shadow-sm';

    let contentHtml = '';
    if (sectionConfig.isArray) {
        contentHtml = sectionData.length > 0
            ? sectionData.map((item, index) => createArrayItemHtml(key, item, index)).join('')
            : '<p class="px-6 text-sm text-slate-500">No items added yet.</p>';
    } else {
        contentHtml = createFormFieldsHtml(key, sectionConfig.fields, sectionData);
    }

    sectionWrapper.innerHTML = `
        <button class="w-full flex justify-between items-center text-left p-4 accordion-toggle">
            <div class="flex items-center">
                <i class="fas ${sectionConfig.icon} w-6 text-center text-indigo-600"></i>
                <h2 class="text-lg font-bold text-slate-800 ml-3">${sectionConfig.title}</h2>
            </div>
            <i class="fas fa-chevron-down transform transition-transform"></i>
        </button>
        <div class="accordion-content">
            <div class="p-6 border-t border-slate-200">
                ${contentHtml}
                <div class="mt-4 text-right">
                    ${sectionConfig.isArray
                        ? `<button class="add-item-btn bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-indigo-700" data-section="${key}">Add New</button>`
                        : `<button class="save-section-btn bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-indigo-700" data-section="${key}">Save Changes</button>`
                    }
                </div>
            </div>
        </div>
    `;

    // Attach event listeners
    sectionWrapper.querySelector('.accordion-toggle').addEventListener('click', toggleAccordion);
    if (sectionConfig.isArray) {
        sectionWrapper.querySelector('.add-item-btn').addEventListener('click', () => openModal(key));
        sectionWrapper.querySelectorAll('.edit-item-btn').forEach(btn => btn.addEventListener('click', (e) => openModal(key, parseInt(e.currentTarget.dataset.index))));
        sectionWrapper.querySelectorAll('.delete-item-btn').forEach(btn => btn.addEventListener('click', (e) => deleteItem(key, parseInt(e.currentTarget.dataset.index))));
    } else {
        sectionWrapper.querySelector('.save-section-btn').addEventListener('click', saveSection);
    }

    return sectionWrapper;
}

// --- PROFILE PICTURES SECTION ---

function createProfilePicturesSection(key, sectionConfig, data) {
    const sectionWrapper = document.createElement('div');
    sectionWrapper.className = 'bg-white rounded-lg shadow-sm';
    const images = data.images || [];
    const primary = data.primary || (images.length > 0 ? images[0] : null);

    const galleryHtml = images.map(url => `
        <div class="relative group">
            <img src="${url}" class="w-24 h-24 rounded-md object-cover cursor-pointer profile-pic ${url === primary ? 'primary' : ''}" data-url="${url}">
            <button class="delete-pic-btn absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" data-url="${url}">&times;</button>
        </div>
    `).join('');

    sectionWrapper.innerHTML = `
        <button class="w-full flex justify-between items-center text-left p-4 accordion-toggle">
            <div class="flex items-center">
                <i class="fas ${sectionConfig.icon} w-6 text-center text-indigo-600"></i>
                <h2 class="text-lg font-bold text-slate-800 ml-3">${sectionConfig.title}</h2>
            </div>
            <i class="fas fa-chevron-down transform transition-transform"></i>
        </button>
        <div class="accordion-content">
            <div class="p-6 border-t border-slate-200">
                <div class="profile-pic-gallery grid grid-cols-3 sm:grid-cols-5 gap-4 mb-4">
                    ${galleryHtml}
                </div>
                <label for="picture-upload" class="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-indigo-700 cursor-pointer">
                    <i class="fas fa-upload mr-2"></i> Upload New Picture
                </label>
                <input type="file" id="picture-upload" class="hidden" accept="image/*">
                <p class="text-xs text-slate-500 mt-2">You can upload up to 5 images. Click an image to set it as your primary avatar.</p>
            </div>
        </div>
    `;
    
    // Event Listeners
    sectionWrapper.querySelector('.accordion-toggle').addEventListener('click', toggleAccordion);
    sectionWrapper.querySelector('#picture-upload').addEventListener('change', handlePictureUpload);
    sectionWrapper.querySelectorAll('.profile-pic').forEach(img => img.addEventListener('click', setPrimaryPicture));
    sectionWrapper.querySelectorAll('.delete-pic-btn').forEach(btn => btn.addEventListener('click', handleDeletePicture));

    return sectionWrapper;
}

async function handlePictureUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const images = lifeCvData.profilePictures?.images || [];
    if (images.length >= 5) {
        alert("You can only upload a maximum of 5 pictures.");
        return;
    }

    const filePath = `users/${currentUser.uid}/profilePictures/${Date.now()}_${file.name}`;
    
    try {
        const downloadURL = await uploadFile(file, filePath);
        const updatedImages = [...images, downloadURL];
        
        let newPrimary = lifeCvData.profilePictures?.primary;
        // If it's the first image, make it the primary one.
        if (updatedImages.length === 1) {
            newPrimary = downloadURL;
        }

        await updateDocument('users', currentUser.uid, { 
            'lifeCv.profilePictures.images': updatedImages,
            'lifeCv.profilePictures.primary': newPrimary
        });
        alert("Picture uploaded successfully!");
    } catch (error) {
        console.error("Error uploading picture:", error);
        alert("Failed to upload picture.");
    }
}

async function setPrimaryPicture(event) {
    const url = event.target.dataset.url;
    try {
        await updateDocument('users', currentUser.uid, { 'lifeCv.profilePictures.primary': url });
    } catch (error) {
        console.error("Error setting primary picture:", error);
        alert("Failed to update primary picture.");
    }
}

async function handleDeletePicture(event) {
    event.stopPropagation(); // Prevent setting as primary
    const url = event.target.dataset.url;
    if (!confirm("Are you sure you want to delete this picture?")) return;

    try {
        // 1. Delete file from Storage
        await deleteFile(url);

        // 2. Remove from Firestore array
        const currentData = lifeCvData.profilePictures || {};
        const updatedImages = (currentData.images || []).filter(imgUrl => imgUrl !== url);
        
        let newPrimary = currentData.primary;
        // If the deleted image was the primary one, pick a new primary
        if (currentData.primary === url) {
            newPrimary = updatedImages.length > 0 ? updatedImages[0] : null;
        }

        await updateDocument('users', currentUser.uid, { 
            'lifeCv.profilePictures.images': updatedImages,
            'lifeCv.profilePictures.primary': newPrimary
        });

        alert("Picture deleted successfully.");
    } catch (error) {
        console.error("Error deleting picture:", error);
        alert("Failed to delete picture.");
    }
}


// --- IMPORT FUNCTIONALITY ---

function attachImportListeners() {
    document.getElementById('json-import-btn').addEventListener('click', () => {
        document.getElementById('json-import-modal').classList.remove('hidden');
    });
    document.getElementById('json-modal-cancel').addEventListener('click', () => {
        document.getElementById('json-import-modal').classList.add('hidden');
    });
    document.getElementById('json-modal-import').addEventListener('click', handleJsonImport);
    document.getElementById('file-import-input').addEventListener('change', handleAiFileImport);
}

async function handleJsonImport() {
    const jsonInput = document.getElementById('json-input-area').value;
    if (!jsonInput) {
        alert("Please paste your JSON data.");
        return;
    }
    try {
        const importedData = JSON.parse(jsonInput);
        const mergedData = { ...lifeCvData, ...importedData };
        
        await updateDocument('users', currentUser.uid, { 'lifeCv': mergedData });
        
        document.getElementById('json-import-modal').classList.add('hidden');
        document.getElementById('json-input-area').value = '';
        alert("LifeCV imported successfully!");
    } catch (error) {
        console.error("JSON Import Error:", error);
        alert("Invalid JSON format. Please check your data and try again.");
    }
}

function handleAiFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const fileContent = e.target.result;
        // In a real scenario, you'd send this content to a backend.
        // Here, we simulate it by sending a prompt with mock content to Gemini.
        const overlay = document.getElementById('ai-processing-overlay');
        overlay.style.display = 'flex';

        try {
            // This is a simplified simulation. A real implementation would extract text.
            const prompt = `Based on the following CV text, convert it into a valid JSON object that matches this structure: { "personal": { "fullName": "", "email": "", "phone": "" }, "summary": { "summary": "" }, "experience": [{ "jobTitle": "", "company": "", "description": "" }], "education": [{ "qualification": "", "institution": "" }], "skills": [{ "skillName": "" }] }. Extract the information accurately. CV Text: "${file.name} - A CV containing professional experience as a software engineer and education from a university."`;
            
            const apiKey = ""; // Provided by the environment
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            
            const payload = { contents: [{ parts: [{ text: prompt }] }] };
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
            
            const result = await response.json();
            const text = result.candidates[0].content.parts[0].text;
            
            // Clean the response to get valid JSON
            const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const importedData = JSON.parse(cleanedJson);

            const mergedData = { ...lifeCvData, ...importedData };
            await updateDocument('users', currentUser.uid, { 'lifeCv': mergedData });
            
            alert("AI has successfully imported data from your file!");

        } catch (error) {
            console.error("AI Import Error:", error);
            alert("The AI could not process your document. Please check the file or try again.");
        } finally {
            overlay.style.display = 'none';
            event.target.value = ''; // Reset file input
        }
    };
    reader.readAsText(file); // Simple text reading for simulation
}


// --- HTML GENERATORS & EVENT HANDLERS (UNCHANGED FROM PREVIOUS VERSION) ---

function createFormFieldsHtml(sectionKey, fields, data) {
    return fields.map(field => `
        <div class="mb-4">
            <label for="${sectionKey}-${field.id}" class="block text-sm font-medium text-slate-700">${field.label}</label>
            ${field.type === 'textarea'
                ? `<textarea id="${sectionKey}-${field.id}" name="${field.id}" rows="3" class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">${data[field.id] || ''}</textarea>`
                : `<input type="${field.type}" id="${sectionKey}-${field.id}" name="${field.id}" ${field.readonly ? 'readonly' : ''} value="${data[field.id] || ''}" class="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${field.readonly ? 'bg-slate-100' : ''}">`
            }
        </div>
    `).join('');
}

function createArrayItemHtml(sectionKey, item, index) {
    const fields = lifeCvSections[sectionKey].fields;
    const title = item[fields[0].id] || `(No ${fields[0].label})`;
    const subtitle = item[fields[1].id] || '';
    return `
        <div class="flex justify-between items-center p-3 rounded-md hover:bg-slate-50">
            <div>
                <p class="font-semibold text-slate-800">${title}</p>
                <p class="text-sm text-slate-600">${subtitle}</p>
            </div>
            <div>
                <button class="edit-item-btn text-indigo-600 hover:text-indigo-800 mr-3" data-section="${sectionKey}" data-index="${index}"><i class="fas fa-pencil-alt"></i></button>
                <button class="delete-item-btn text-red-500 hover:text-red-700" data-section="${sectionKey}" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
    `;
}

function toggleAccordion(event) {
    const button = event.currentTarget;
    const content = button.nextElementSibling;
    const icon = button.querySelector('.fa-chevron-down');

    if (content.style.maxHeight) {
        content.style.maxHeight = null;
        icon.classList.remove('rotate-180');
    } else {
        content.style.maxHeight = content.scrollHeight + "px";
        icon.classList.add('rotate-180');
    }
}

async function saveSection(event) {
    const sectionKey = event.target.dataset.section;
    const form = event.target.closest('.accordion-content').querySelector('div');
    const dataToSave = {};
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        dataToSave[input.name] = input.value;
    });

    try {
        await updateDocument('users', currentUser.uid, { [`lifeCv.${sectionKey}`]: dataToSave });
        alert(`${lifeCvSections[sectionKey].title} updated successfully!`);
    } catch (error) {
        console.error("Error saving section:", error);
        alert("Failed to save changes.");
    }
}

function openModal(sectionKey, index = -1) {
    const modal = document.getElementById('item-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('modal-form');
    
    const sectionConfig = lifeCvSections[sectionKey];
    const isEditing = index > -1;
    const data = isEditing ? lifeCvData[sectionKey][index] : {};

    modalTitle.textContent = `${isEditing ? 'Edit' : 'Add'} ${sectionConfig.title.slice(0, -1)}`;
    form.innerHTML = createFormFieldsHtml(sectionKey, sectionConfig.fields, data);
    form.dataset.section = sectionKey;
    form.dataset.index = index;

    modal.classList.remove('hidden');

    document.getElementById('modal-cancel').onclick = () => modal.classList.add('hidden');
    form.onsubmit = handleModalSubmit;
}

async function handleModalSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const sectionKey = form.dataset.section;
    const index = parseInt(form.dataset.index);
    const isEditing = index > -1;

    const formData = new FormData(form);
    const newItem = {};
    formData.forEach((value, key) => newItem[key] = value);

    const currentArray = lifeCvData[sectionKey] ? [...lifeCvData[sectionKey]] : [];

    if (isEditing) {
        currentArray[index] = newItem;
    } else {
        currentArray.push(newItem);
    }
    
    try {
        await updateDocument('users', currentUser.uid, { [`lifeCv.${sectionKey}`]: currentArray });
        document.getElementById('item-modal').classList.add('hidden');
        alert('Item saved successfully!');
    } catch (error) {
        console.error("Error saving item:", error);
        alert("Failed to save item.");
    }
}

async function deleteItem(sectionKey, index) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const currentArray = [...lifeCvData[sectionKey]];
    currentArray.splice(index, 1);

    try {
        await updateDocument('users', currentUser.uid, { [`lifeCv.${sectionKey}`]: currentArray });
        alert('Item deleted successfully!');
    } catch (error) {
        console.error("Error deleting item:", error);
        alert("Failed to delete item.");
    }
}

// Initialize the LifeCV when Firebase is ready
document.addEventListener('firebase-ready', () => {
    console.log('Firebase ready event received, initializing LifeCV...');
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('User authenticated, initializing LifeCV for:', user.email);
            init(user);
        } else {
            console.log('No user authenticated');
        }
    });
});

// Also listen for auth state changes directly
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('Auth state changed, user authenticated:', user.email);
        init(user);
    }
});
