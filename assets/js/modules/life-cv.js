/* ================================================================================= */
/* FILE: assets/js/modules/life-cv.js                                                */
/* PURPOSE: Manages all functionality for the LifeCV page, including fetching,       */
/* rendering, and saving user data. This is the master data source.                  */
/* ================================================================================= */
import { auth, db } from '../firebase-config.js';
import { getDocument, updateDocument } from '../database.js';
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let currentUser = null;
let lifeCvData = {}; // Local cache for user's LifeCV data

// Define the structure of the LifeCV
const lifeCvSections = {
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
    // Future sections can be added here (e.g., documents, references)
};

export function init(user) {
    if (!user) return;
    currentUser = user;
    console.log("LifeCV module initialized.");
    
    const userDocRef = doc(db, "users", currentUser.uid);
    onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
            lifeCvData = docSnap.data().lifeCv || {};
            // Ensure email is always up-to-date from auth
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
        container.appendChild(createSectionElement(key, section, sectionData));
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

// --- HTML GENERATORS ---

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

// --- EVENT HANDLERS & LOGIC ---

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
    const formData = new FormData(form);
    
    const dataToSave = {};
    formData.forEach((value, key) => {
        dataToSave[key] = value;
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

    modalTitle.textContent = `${isEditing ? 'Edit' : 'Add'} ${sectionConfig.title.slice(0, -1)}`; // Remove 's'
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
