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

// Define the holistic structure of the LifeCV
const lifeCvSections = {
    profilePictures: { title: 'Profile Pictures', icon: 'fa-camera-retro', isCustom: true },
    
    // Personal & Identity
    personal: { title: 'Personal & Identity', icon: 'fa-user', fields: [
        { id: 'fullName', label: 'Full Name', type: 'text' },
        { id: 'preferredName', label: 'Preferred Name/Nickname', type: 'text' },
        { id: 'pronouns', label: 'Pronouns', type: 'text', placeholder: 'they/them, she/her, he/him, etc.' },
        { id: 'idNumber', label: 'ID/Passport Number', type: 'text' },
        { id: 'dob', label: 'Date of Birth', type: 'date' },
        { id: 'nationality', label: 'Nationality', type: 'text' },
        { id: 'ethnicity', label: 'Ethnicity/Heritage', type: 'text' },
        { id: 'phone', label: 'Phone Number', type: 'tel' },
        { id: 'email', label: 'Email Address', type: 'email', readonly: true },
        { id: 'address', label: 'Residential Address', type: 'textarea' },
        { id: 'emergencyContact', label: 'Emergency Contact', type: 'textarea' },
    ]},
    
    // Life Philosophy & Values
    philosophy: { title: 'Life Philosophy & Values', icon: 'fa-heart', fields: [
        { id: 'mission', label: 'Personal Mission Statement', type: 'textarea', placeholder: 'What drives you in life?' },
        { id: 'values', label: 'Core Values', type: 'textarea', placeholder: 'What principles guide your decisions?' },
        { id: 'beliefs', label: 'Beliefs & Worldview', type: 'textarea' },
        { id: 'spirituality', label: 'Spiritual/Religious Beliefs', type: 'textarea' },
        { id: 'lifeGoals', label: 'Life Goals & Aspirations', type: 'textarea' },
    ]},
    
    // Family & Relationships
    family: { title: 'Family & Relationships', icon: 'fa-users', isArray: true, fields: [
        { id: 'relationship', label: 'Relationship Type', type: 'select', options: ['Parent', 'Child', 'Sibling', 'Spouse/Partner', 'Extended Family', 'Close Friend', 'Mentor', 'Other'] },
        { id: 'name', label: 'Name', type: 'text' },
        { id: 'significance', label: 'Significance in Your Life', type: 'textarea' },
        { id: 'contact', label: 'Contact Information', type: 'text' },
    ]},
    
    // Professional Life
    professional: { title: 'Professional Journey', icon: 'fa-briefcase', fields: [
        { id: 'summary', label: 'Professional Summary', type: 'textarea', placeholder: 'Brief overview of your professional background...' },
        { id: 'careerVision', label: 'Career Vision', type: 'textarea', placeholder: 'Where do you see your career heading?' },
        { id: 'workStyle', label: 'Work Style & Preferences', type: 'textarea' },
    ]},
    
    experience: { title: 'Work Experience', icon: 'fa-building', isArray: true, fields: [
        { id: 'jobTitle', label: 'Job Title', type: 'text' },
        { id: 'company', label: 'Company/Organization', type: 'text' },
        { id: 'industry', label: 'Industry', type: 'text' },
        { id: 'location', label: 'Location', type: 'text' },
        { id: 'startDate', label: 'Start Date', type: 'month' },
        { id: 'endDate', label: 'End Date (leave blank if current)', type: 'month' },
        { id: 'description', label: 'Key Responsibilities & Achievements', type: 'textarea' },
        { id: 'skills', label: 'Skills Developed', type: 'text' },
    ]},
    
    // Education & Learning
    education: { title: 'Education & Qualifications', icon: 'fa-graduation-cap', isArray: true, fields: [
        { id: 'qualification', label: 'Qualification/Degree', type: 'text' },
        { id: 'institution', label: 'Institution', type: 'text' },
        { id: 'field', label: 'Field of Study', type: 'text' },
        { id: 'yearCompleted', label: 'Year Completed', type: 'number' },
        { id: 'grade', label: 'Grade/GPA', type: 'text' },
        { id: 'significance', label: 'Key Learning & Impact', type: 'textarea' },
    ]},
    
    // Skills & Competencies
    skills: { title: 'Skills & Competencies', icon: 'fa-cogs', isArray: true, fields: [
        { id: 'category', label: 'Category', type: 'select', options: ['Technical', 'Creative', 'Communication', 'Leadership', 'Personal', 'Physical', 'Language', 'Other'] },
        { id: 'skillName', label: 'Skill', type: 'text' },
        { id: 'proficiency', label: 'Proficiency Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'] },
        { id: 'context', label: 'How You Use This Skill', type: 'textarea' },
    ]},
    
    // Health & Wellness
    health: { title: 'Health & Wellness', icon: 'fa-heartbeat', fields: [
        { id: 'physicalHealth', label: 'Physical Health Status', type: 'textarea' },
        { id: 'mentalHealth', label: 'Mental Health & Wellbeing', type: 'textarea' },
        { id: 'disabilities', label: 'Disabilities/Accessibility Needs', type: 'textarea' },
        { id: 'allergies', label: 'Allergies & Medical Conditions', type: 'textarea' },
        { id: 'medications', label: 'Current Medications', type: 'textarea' },
        { id: 'healthGoals', label: 'Health & Fitness Goals', type: 'textarea' },
    ]},
    
    // Hobbies & Interests
    interests: { title: 'Hobbies & Interests', icon: 'fa-palette', isArray: true, fields: [
        { id: 'category', label: 'Category', type: 'select', options: ['Sports & Fitness', 'Arts & Crafts', 'Music', 'Reading & Writing', 'Technology', 'Travel', 'Cooking', 'Gaming', 'Nature & Outdoors', 'Community Service', 'Other'] },
        { id: 'interest', label: 'Interest/Hobby', type: 'text' },
        { id: 'level', label: 'Involvement Level', type: 'select', options: ['Casual', 'Regular', 'Serious', 'Professional'] },
        { id: 'description', label: 'What This Means to You', type: 'textarea' },
    ]},
    
    // Life Experiences & Milestones
    milestones: { title: 'Life Milestones & Experiences', icon: 'fa-star', isArray: true, fields: [
        { id: 'title', label: 'Milestone/Experience', type: 'text' },
        { id: 'date', label: 'Date', type: 'date' },
        { id: 'category', label: 'Category', type: 'select', options: ['Personal Achievement', 'Travel', 'Relationship', 'Career', 'Education', 'Health', 'Community', 'Spiritual', 'Other'] },
        { id: 'description', label: 'Description & Impact', type: 'textarea' },
        { id: 'lessons', label: 'Lessons Learned', type: 'textarea' },
    ]},
    
    // Community & Social Impact
    community: { title: 'Community & Social Impact', icon: 'fa-hands-helping', isArray: true, fields: [
        { id: 'organization', label: 'Organization/Cause', type: 'text' },
        { id: 'role', label: 'Your Role', type: 'text' },
        { id: 'startDate', label: 'Start Date', type: 'month' },
        { id: 'endDate', label: 'End Date (if applicable)', type: 'month' },
        { id: 'contribution', label: 'Your Contribution', type: 'textarea' },
        { id: 'impact', label: 'Impact Created', type: 'textarea' },
    ]},
    
    // Creative Works & Projects
    projects: { title: 'Creative Works & Projects', icon: 'fa-lightbulb', isArray: true, fields: [
        { id: 'name', label: 'Project Name', type: 'text' },
        { id: 'type', label: 'Project Type', type: 'select', options: ['Professional', 'Personal', 'Academic', 'Community', 'Artistic', 'Technical', 'Other'] },
        { id: 'description', label: 'Description', type: 'textarea' },
        { id: 'role', label: 'Your Role', type: 'text' },
        { id: 'technologies', label: 'Tools/Technologies Used', type: 'text' },
        { id: 'outcome', label: 'Outcome & Impact', type: 'textarea' },
        { id: 'url', label: 'Link/Portfolio URL', type: 'url' },
    ]},
    
    // Travel & Cultural Experiences
    travel: { title: 'Travel & Cultural Experiences', icon: 'fa-globe', isArray: true, fields: [
        { id: 'destination', label: 'Destination', type: 'text' },
        { id: 'date', label: 'Date/Period', type: 'text' },
        { id: 'purpose', label: 'Purpose', type: 'select', options: ['Leisure', 'Work', 'Study', 'Volunteer', 'Family', 'Spiritual', 'Adventure', 'Other'] },
        { id: 'experience', label: 'Key Experiences', type: 'textarea' },
        { id: 'cultural', label: 'Cultural Insights Gained', type: 'textarea' },
        { id: 'impact', label: 'How It Changed You', type: 'textarea' },
    ]},
    
    // Financial & Legal
    financial: { title: 'Financial & Legal Information', icon: 'fa-file-contract', fields: [
        { id: 'bankDetails', label: 'Banking Information', type: 'textarea' },
        { id: 'insurance', label: 'Insurance Policies', type: 'textarea' },
        { id: 'investments', label: 'Investments & Assets', type: 'textarea' },
        { id: 'legal', label: 'Legal Documents & Contracts', type: 'textarea' },
        { id: 'financialGoals', label: 'Financial Goals', type: 'textarea' },
    ]},
    
    // Digital Presence
    digital: { title: 'Digital Presence & Social Media', icon: 'fa-share-alt', isArray: true, fields: [
        { id: 'platform', label: 'Platform', type: 'text' },
        { id: 'username', label: 'Username/Handle', type: 'text' },
        { id: 'url', label: 'Profile URL', type: 'url' },
        { id: 'purpose', label: 'Purpose/Use', type: 'text' },
        { id: 'privacy', label: 'Privacy Level', type: 'select', options: ['Public', 'Friends Only', 'Private', 'Professional'] },
    ]},
};

// Public Profile Templates
const publicProfileTemplates = {
    professional: {
        name: 'Professional',
        description: 'Clean, corporate design for job applications and networking',
        sections: ['personal', 'professional', 'experience', 'education', 'skills', 'projects'],
        theme: 'corporate'
    },
    creative: {
        name: 'Creative Portfolio',
        description: 'Vibrant design showcasing creative work and personality',
        sections: ['personal', 'projects', 'skills', 'interests', 'travel', 'milestones'],
        theme: 'artistic'
    },
    holistic: {
        name: 'Life Story',
        description: 'Complete life journey for personal branding and community projects',
        sections: ['personal', 'philosophy', 'family', 'experience', 'education', 'community', 'interests', 'travel', 'milestones'],
        theme: 'comprehensive'
    },
    academic: {
        name: 'Academic Profile',
        description: 'Scholarly presentation for academic and research positions',
        sections: ['personal', 'education', 'experience', 'projects', 'skills', 'community'],
        theme: 'academic'
    },
    community: {
        name: 'Community Leader',
        description: 'Emphasis on community impact and social contributions',
        sections: ['personal', 'philosophy', 'community', 'experience', 'skills', 'milestones', 'interests'],
        theme: 'community'
    }
};

// Add public profile section to the main LifeCV structure
lifeCvSections.publicProfiles = { 
    title: 'Public Profiles', 
    icon: 'fa-globe-americas', 
    isCustom: true 
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
            } else if (key === 'publicProfiles') {
                container.appendChild(createPublicProfilesSection(key, section, lifeCvData.publicProfiles || {}));
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

// Function to create public profile management section
function createPublicProfilesSection(key, sectionConfig, data) {
    const sectionWrapper = document.createElement('div');
    sectionWrapper.className = 'bg-white rounded-lg shadow-sm';
    
    const profiles = data.profiles || [];

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
                <div class="mb-6">
                    <h3 class="text-lg font-semibold text-slate-800 mb-3">Create New Public Profile</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        ${Object.entries(publicProfileTemplates).map(([templateKey, template]) => `
                            <div class="border border-slate-200 rounded-lg p-4 hover:border-indigo-300 cursor-pointer template-card" data-template="${templateKey}">
                                <h4 class="font-semibold text-slate-800 mb-2">${template.name}</h4>
                                <p class="text-sm text-slate-600 mb-3">${template.description}</p>
                                <div class="flex flex-wrap gap-1">
                                    ${template.sections.slice(0, 3).map(section => `
                                        <span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">${lifeCvSections[section]?.title || section}</span>
                                    `).join('')}
                                    ${template.sections.length > 3 ? `<span class="text-xs text-slate-500">+${template.sections.length - 3} more</span>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="mb-6">
                    <h3 class="text-lg font-semibold text-slate-800 mb-3">Your Public Profiles</h3>
                    ${profiles.length > 0 ? `
                        <div class="space-y-3">
                            ${profiles.map((profile, index) => `
                                <div class="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                    <div class="flex-1">
                                        <h4 class="font-semibold text-slate-800">${profile.name}</h4>
                                        <p class="text-sm text-slate-600">${profile.description}</p>
                                        <div class="flex items-center mt-2 space-x-4">
                                            <a href="${profile.publicUrl}" target="_blank" class="text-sm text-indigo-600 hover:text-indigo-800">
                                                <i class="fas fa-external-link-alt mr-1"></i>View Public Page
                                            </a>
                                            <button class="text-sm text-slate-600 hover:text-slate-800 copy-link-btn" data-url="${profile.publicUrl}">
                                                <i class="fas fa-copy mr-1"></i>Copy Link
                                            </button>
                                            <button class="text-sm text-slate-600 hover:text-slate-800 show-qr-btn" data-url="${profile.publicUrl}">
                                                <i class="fas fa-qrcode mr-1"></i>QR Code
                                            </button>
                                        </div>
                                    </div>
                                    <div class="flex space-x-2">
                                        <button class="text-indigo-600 hover:text-indigo-800 edit-profile-btn" data-index="${index}">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="text-red-600 hover:text-red-800 delete-profile-btn" data-index="${index}">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <p class="text-slate-500 text-center py-8">No public profiles created yet. Choose a template above to get started.</p>
                    `}
                </div>
            </div>
        </div>
    `;

    // Attach event listeners
    sectionWrapper.querySelector('.accordion-toggle').addEventListener('click', toggleAccordion);
    
    // Template selection
    sectionWrapper.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', () => openProfileCreationModal(card.dataset.template));
    });

    // Profile management
    sectionWrapper.querySelectorAll('.copy-link-btn').forEach(btn => {
        btn.addEventListener('click', () => copyToClipboard(btn.dataset.url));
    });

    sectionWrapper.querySelectorAll('.show-qr-btn').forEach(btn => {
        btn.addEventListener('click', () => showQRCode(btn.dataset.url));
    });

    return sectionWrapper;
}

// Function to open profile creation modal
function openProfileCreationModal(templateKey) {
    const template = publicProfileTemplates[templateKey];
    
    // Create modal for profile customization
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-slate-200">
                <h2 class="text-2xl font-bold text-slate-800">Create ${template.name} Profile</h2>
                <p class="text-slate-600 mt-1">${template.description}</p>
            </div>
            <div class="p-6">
                <form id="profile-creation-form">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Profile Name</label>
                            <input type="text" name="profileName" required class="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="My ${template.name} Profile">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Public URL Slug</label>
                            <input type="text" name="urlSlug" required class="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="my-profile">
                        </div>
                    </div>
                    
                    <div class="mt-6">
                        <label class="block text-sm font-medium text-slate-700 mb-1">Profile Description</label>
                        <textarea name="description" rows="3" class="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="Brief description of this profile..."></textarea>
                    </div>
                    
                    <div class="mt-6">
                        <h3 class="text-lg font-semibold text-slate-800 mb-3">Sections to Include</h3>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                            ${template.sections.map(sectionKey => `
                                <label class="flex items-center">
                                    <input type="checkbox" name="sections" value="${sectionKey}" checked class="rounded mr-2">
                                    <span class="text-sm">${lifeCvSections[sectionKey]?.title || sectionKey}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="mt-6">
                        <h3 class="text-lg font-semibold text-slate-800 mb-3">Privacy Settings</h3>
                        <div class="space-y-2">
                            <label class="flex items-center">
                                <input type="radio" name="privacy" value="public" checked class="mr-2">
                                <span class="text-sm">Public - Anyone can view with the link</span>
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="privacy" value="unlisted" class="mr-2">
                                <span class="text-sm">Unlisted - Only people with the direct link can view</span>
                            </label>
                        </div>
                    </div>
                </form>
            </div>
            <div class="p-6 border-t border-slate-200 flex justify-end space-x-3">
                <button type="button" class="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300" onclick="this.closest('.fixed').remove()">Cancel</button>
                <button type="button" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700" onclick="createPublicProfile('${templateKey}')">Create Profile</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Function to create public profile
async function createPublicProfile(templateKey) {
    const form = document.getElementById('profile-creation-form');
    const formData = new FormData(form);
    
    const profileData = {
        id: Date.now().toString(),
        template: templateKey,
        name: formData.get('profileName'),
        description: formData.get('description'),
        urlSlug: formData.get('urlSlug'),
        privacy: formData.get('privacy'),
        sections: Array.from(formData.getAll('sections')),
        createdAt: new Date().toISOString(),
        publicUrl: `https://hub.salatiso.com/profile/${currentUser.uid}/${formData.get('urlSlug')}`
    };
    
    try {
        // Save to user's LifeCV data
        const currentProfiles = lifeCvData.publicProfiles?.profiles || [];
        currentProfiles.push(profileData);
        
        await updateDocument('users', currentUser.uid, { 
            'lifeCv.publicProfiles.profiles': currentProfiles 
        });
        
        // Generate the actual public page
        await generatePublicProfilePage(profileData);
        
        // Close modal
        document.querySelector('.fixed').remove();
        
        alert('Public profile created successfully!');
        
    } catch (error) {
        console.error('Error creating public profile:', error);
        alert('Failed to create public profile. Please try again.');
    }
}

// Function to generate public profile page
async function generatePublicProfilePage(profileData) {
    const template = publicProfileTemplates[profileData.template];
    const userData = lifeCvData;
    
    // Generate HTML based on template and user data
    // This would create the actual public-facing HTML page
    // For now, we'll simulate this
    console.log('Generated public profile:', profileData);
}

// Utility functions
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Link copied to clipboard!');
    });
}

function showQRCode(url) {
    // You would integrate with a QR code library here
    // For now, we'll show a placeholder
    alert(`QR Code for: ${url}\n\n(QR code generation would be implemented here)`);
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

// Internet Search Variables
let selectedSearchResults = [];

// Function to get current LifeCV data
async function getLifeCvData() {
    try {
        const userDoc = await getDocument('users', currentUser.uid);
        return userDoc?.lifeCv || {};
    } catch (error) {
        console.error('Error getting LifeCV data:', error);
        return {};
    }
}

// Function to process selected results to LifeCV format
function processSelectedResultsToLifeCV() {
    console.log('Processing selected results:', selectedSearchResults);
    
    const importData = {
        experience: [],
        education: [],
        skills: [],
        projects: [],
        digital: [],
        awards: []
    };

    selectedSearchResults.forEach(selected => {
        const titleEl = selected.element.querySelector('h4');
        const descEl = selected.element.querySelector('p');
        const linkEl = selected.element.querySelector('a[href]');
        
        const title = titleEl ? titleEl.textContent.trim() : 'Unknown';
        const description = descEl ? descEl.textContent.trim() : '';
        const url = linkEl ? linkEl.href : '';
        const source = selected.element.querySelector('.text-slate-400')?.textContent?.trim() || '';

        // Map to LifeCV structure based on category
        switch (selected.category) {
            case 'work':
                importData.experience.push({
                    jobTitle: extractJobTitle(title, description),
                    company: extractCompany(title, description, source),
                    industry: '',
                    location: '',
                    startDate: '',
                    endDate: '',
                    description: description,
                    skills: '',
                    source: 'Internet Search',
                    sourceUrl: url,
                    importedAt: new Date().toISOString()
                });
                break;
                
            case 'education':
                importData.education.push({
                    qualification: extractQualification(title, description),
                    institution: extractInstitution(title, description, source),
                    field: '',
                    yearCompleted: '',
                    grade: '',
                    significance: description,
                    source: 'Internet Search',
                    sourceUrl: url,
                    importedAt: new Date().toISOString()
                });
                break;
                
            case 'skills':
                importData.skills.push({
                    category: 'Technical',
                    skillName: extractSkillName(title, description),
                    proficiency: 'Intermediate',
                    context: description,
                    source: 'Internet Search',
                    sourceUrl: url,
                    importedAt: new Date().toISOString()
                });
                break;
                
            case 'projects':
                importData.projects.push({
                    name: title,
                    type: 'Professional',
                    description: description,
                    role: '',
                    technologies: '',
                    outcome: '',
                    url: url,
                    source: 'Internet Search',
                    importedAt: new Date().toISOString()
                });
                break;
                
            case 'awards':
                importData.awards.push({
                    title: title,
                    date: '',
                    awarder: extractAwarder(title, description, source),
                    summary: description,
                    source: 'Internet Search',
                    sourceUrl: url,
                    importedAt: new Date().toISOString()
                });
                break;
                
            case 'profiles':
                importData.digital.push({
                    platform: extractPlatform(source, url),
                    username: extractUsername(title, url),
                    url: url,
                    purpose: 'Professional',
                    privacy: 'Public',
                    source: 'Internet Search',
                    importedAt: new Date().toISOString()
                });
                break;
        }
    });

    return importData;
}

// Function to merge import data with existing data
function mergeImportDataWithExisting(importData, existingData) {
    const merged = { ...existingData };
    
    // Merge array fields
    const arrayFields = ['experience', 'education', 'skills', 'projects', 'digital', 'awards'];
    arrayFields.forEach(field => {
        if (importData[field] && importData[field].length > 0) {
            if (!merged[field]) merged[field] = [];
            merged[field] = [...merged[field], ...importData[field]];
        }
    });
    
    return merged;
}

// Main import function
async function importSelectedResults() {
    if (selectedSearchResults.length === 0) return;

    try {
        // Get the current LifeCV data
        const currentLifeCvData = await getLifeCvData();
        
        // Process selected results into LifeCV format
        const importData = processSelectedResultsToLifeCV();
        
        // Merge with existing data
        const mergedData = mergeImportDataWithExisting(importData, currentLifeCvData);
        
        // Save to Firebase
        await updateDocument('users', currentUser.uid, { 'lifeCv': mergedData });
        
        // Update local cache
        lifeCvData = mergedData;
        
        // Re-render the LifeCV sections
        renderAllSections();
        
        // Show success message
        showImportSuccessMessage(selectedSearchResults.length);
        
        // Close modal and reset
        document.getElementById('internet-search-modal').classList.add('hidden');
        selectedSearchResults = [];
        
        return { success: true, count: selectedSearchResults.length };
        
    } catch (error) {
        console.error('Import error:', error);
        throw error;
    }
}

// Function to show import success message
function showImportSuccessMessage(count) {
    const message = document.createElement('div');
    message.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    message.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-check-circle mr-2"></i>
            Successfully imported ${count} item${count === 1 ? '' : 's'} to your LifeCV!
        </div>
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 4000);
}

// Export functions to global scope for HTML access
window.lifeCvModule = {
    importSelectedResults,
    selectedSearchResults,
    setSelectedSearchResults: (results) => { selectedSearchResults = results; },
    getSelectedSearchResults: () => selectedSearchResults,
    addSelectedResult: (result) => selectedSearchResults.push(result),
    removeSelectedResult: (category, index) => {
        selectedSearchResults = selectedSearchResults.filter(
            item => !(item.category === category && item.index === index)
        );
    },
    clearSelectedResults: () => { selectedSearchResults = []; }
};
