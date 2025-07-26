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
    family: { title: 'Family & Relationships', icon: 'fa-users', isArray: true, isFamilyIntegrated: true,
    fields: [
        { id: 'relationship', label: 'Relationship Type', type: 'select', options: ['Parent', 'Child', 'Sibling', 'Spouse/Partner', 'Extended Family', 'Close Friend', 'Mentor', 'Other'] },
        { id: 'name', label: 'Name', type: 'text' },
        { id: 'significance', label: 'Significance in Your Life', type: 'textarea' },
        { id: 'contact', label: 'Contact Information', type: 'text' },
        { id: 'familyHubId', label: 'Family Hub ID', type: 'hidden' },
        { id: 'isFromFamilyHub', label: 'From Family Hub', type: 'hidden' }
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

// Business card templates with different orientations
const businessCardTemplates = {
    executive: {
        name: 'Executive Card',
        orientation: 'landscape',
        description: 'Professional landscape business card for executives',
        theme: 'corporate',
        dimensions: { width: '3.5in', height: '2in' },
        preview: 'executive-card-preview.png'
    },
    creative: {
        name: 'Creative Card',
        orientation: 'portrait',
        description: 'Vibrant portrait card for creative professionals',
        theme: 'artistic',
        dimensions: { width: '2in', height: '3.5in' },
        preview: 'creative-card-preview.png'
    },
    minimal: {
        name: 'Minimal Card',
        orientation: 'landscape',
        description: 'Clean, minimal design for any profession',
        theme: 'minimal',
        dimensions: { width: '3.5in', height: '2in' },
        preview: 'minimal-card-preview.png'
    },
    tech: {
        name: 'Tech Card',
        orientation: 'portrait',
        description: 'Modern portrait card for tech professionals',
        theme: 'tech',
        dimensions: { width: '2in', height: '3.5in' },
        preview: 'tech-card-preview.png'
    },
    networking: {
        name: 'Networking Card',
        orientation: 'landscape',
        description: 'Comprehensive landscape card for networking events',
        theme: 'networking',
        dimensions: { width: '3.5in', height: '2in' },
        preview: 'networking-card-preview.png'
    }
};

// Email signature templates
const emailSignatureTemplates = {
    professional: {
        name: 'Professional Signature',
        description: 'Clean, corporate email signature',
        includePhoto: true,
        includeLogos: true,
        layout: 'horizontal'
    },
    minimal: {
        name: 'Minimal Signature',
        description: 'Simple text-based signature',
        includePhoto: false,
        includeLogos: false,
        layout: 'vertical'
    },
    creative: {
        name: 'Creative Signature',
        description: 'Colorful signature with design elements',
        includePhoto: true,
        includeLogos: true,
        layout: 'horizontal'
    },
    tech: {
        name: 'Tech Signature',
        description: 'Modern signature for tech professionals',
        includePhoto: false,
        includeLogos: true,
        layout: 'vertical'
    },
    executive: {
        name: 'Executive Signature',
        description: 'Premium signature for executives',
        includePhoto: true,
        includeLogos: true,
        layout: 'horizontal'
    }
};

// Add business cards and email signatures to main sections
lifeCvSections.businessCards = { 
    title: 'Business Cards', 
    icon: 'fa-id-card', 
    isCustom: true 
};

lifeCvSections.emailSignatures = { 
    title: 'Email Signatures', 
    icon: 'fa-signature', 
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
            } else if (key === 'businessCards') {
                container.appendChild(createBusinessCardsSection(key, section, lifeCvData.businessCards || {}));
            } else if (key === 'emailSignatures') {
                container.appendChild(createEmailSignaturesSection(key, section, lifeCvData.emailSignatures || {}));
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
    document.getElementById('json-modal-close').addEventListener('click', () => {
        document.getElementById('json-import-modal').classList.add('hidden');
    });
    document.getElementById('json-modal-import').addEventListener('click', handleJsonImport);
    
    // Initialize file import
    initializeFileImport();
    
    // Add tab switching functionality
    document.getElementById('json-tab').addEventListener('click', () => {
        document.getElementById('json-tab').className = 'px-4 py-2 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600';
        document.getElementById('instructions-tab').className = 'px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700';
        document.getElementById('json-import-content').classList.remove('hidden');
        document.getElementById('instructions-content').classList.add('hidden');
    });
    
    document.getElementById('instructions-tab').addEventListener('click', () => {
        document.getElementById('instructions-tab').className = 'px-4 py-2 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600';
        document.getElementById('json-tab').className = 'px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700';
        document.getElementById('instructions-content').classList.remove('hidden');
        document.getElementById('json-import-content').classList.add('hidden');
    });
    
    document.getElementById('instructions-close').addEventListener('click', () => {
        document.getElementById('json-import-modal').classList.add('hidden');
    });
    
    // Copy prompt functionality
    document.getElementById('copy-prompt-btn').addEventListener('click', () => {
        const promptText = document.getElementById('conversion-prompt').value;
        navigator.clipboard.writeText(promptText).then(() => {
            const btn = document.getElementById('copy-prompt-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check mr-1"></i> Copied!';
            btn.className = 'text-sm bg-green-100 text-green-700 px-3 py-1 rounded';
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.className = 'text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200';
            }, 2000);
        });
    });
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

function initializeFileImport() {
    const fileInput = document.getElementById('file-import-input');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileImport);
    }
}

async function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    console.log('File selected:', file.name, file.type, file.size);

    // Show AI processing overlay
    const overlay = document.getElementById('ai-processing-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
    }

    try {
        // Extract text based on file type
        let extractedText = '';
        
        if (file.type === 'text/plain') {
            extractedText = await extractTextFromTxt(file);
        } else if (file.type === 'application/pdf') {
            extractedText = await extractTextFromPdf(file);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            extractedText = await extractTextFromDocx(file);
        } else {
            throw new Error('Unsupported file type. Please upload TXT, PDF, or DOCX files.');
        }

        console.log('Extracted text length:', extractedText.length);

        if (!extractedText || extractedText.trim().length < 50) {
            throw new Error('Could not extract sufficient text from the document. Please check the file content.');
        }

        // Process with AI
        const lifeCvData = await processTextWithAI(extractedText);
        
        if (!lifeCvData) {
            throw new Error('AI processing failed. Please try again or use the JSON import method.');
        }

        // Import the processed data
        await importLifeCvData(lifeCvData);

        // Show success message
        showImportSuccessMessage('file');
        
        // Clear file input
        event.target.value = '';

    } catch (error) {
        console.error('AI Import Error:', error);
        showImportErrorMessage(error.message);
    } finally {
        // Hide AI processing overlay
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.classList.remove('flex');
        }
    }
}

// Text extraction functions
async function extractTextFromTxt(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Failed to read text file'));
        reader.readAsText(file);
    });
}

async function extractTextFromPdf(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        return fullText;
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw new Error('Failed to extract text from PDF. The file may be corrupted or protected.');
    }
}

async function extractTextFromDocx(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    } catch (error) {
        console.error('DOCX extraction error:', error);
        throw new Error('Failed to extract text from DOCX. The file may be corrupted.');
    }
}

// Enhanced AI processing function with proper LifeCV mapping
async function processTextWithAI(text) {
    const GEMINI_API_KEY = "AIzaSyBl15V2pM4E6Yeh7YzVEdBjXsH3E2b1Wro";
    
    const prompt = `
You are a professional CV/resume parser. Convert the following resume/document text into a structured JSON object that matches the LifeCV format exactly.

IMPORTANT: Return ONLY valid JSON, no explanations or markdown formatting.

Required LifeCV Structure:
{
  "personal": {
    "fullName": "",
    "preferredName": "",
    "pronouns": "",
    "phone": "",
    "email": "",
    "address": ""
  },
  "professional": {
    "summary": "",
    "careerVision": "",
    "workStyle": ""
  },
  "experience": [
    {
      "jobTitle": "",
      "company": "",
      "industry": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "description": "",
      "skills": ""
    }
  ],
  "education": [
    {
      "qualification": "",
      "institution": "",
      "field": "",
      "yearCompleted": "",
      "grade": "",
      "significance": ""
    }
  ],
  "skills": [
    {
      "category": "",
      "skillName": "",
      "proficiency": "",
      "context": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "type": "",
      "description": "",
      "role": "",
      "technologies": "",
      "outcome": "",
      "url": ""
    }
  ],
  "digital": [
    {
      "platform": "",
      "username": "",
      "url": "",
      "purpose": "",
      "privacy": ""
    }
  ],
  "interests": [
    {
      "category": "",
      "interest": "",
      "level": "",
      "description": ""
    }
  ],
  "milestones": [
    {
      "title": "",
      "date": "",
      "category": "",
      "description": "",
      "lessons": ""
    }
  ]
}

Instructions:
1. Extract personal information (name, contact details)
2. Map work experience to "experience" array
3. Map education to "education" array  
4. Extract skills and categorize them properly
5. Identify any projects, achievements, or notable experiences
6. Look for social media profiles or websites for "digital" section
7. Extract hobbies/interests if mentioned
8. Use appropriate date formats (YYYY-MM-DD for dates, YYYY-MM for months)
9. For arrays, create multiple objects if multiple items exist
10. Fill in reasonable defaults for missing fields

Document Text:
${text}

Return the complete JSON object:`;

    try {
        console.log('Sending text to Gemini API for processing...');
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 4096,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('Gemini API Error:', response.status, errorData);
            
            if (response.status === 403) {
                throw new Error('Gemini API access denied. Please check your API key configuration.');
            } else if (response.status === 429) {
                throw new Error('API rate limit exceeded. Please wait and try again.');
            } else {
                throw new Error(`AI processing failed: ${response.status}`);
            }
        }

        const data = await response.json();
        console.log('Gemini API response received');

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            console.error('Invalid Gemini response structure:', data);
            throw new Error('Invalid response from AI service');
        }

        const generatedText = data.candidates[0].content.parts[0].text.trim();
        console.log('Generated text length:', generatedText.length);

        // Clean up the response - remove markdown formatting if present
        let jsonText = generatedText;
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
        }

        // Parse and validate JSON
        try {
            const parsedData = JSON.parse(jsonText);
            console.log('Successfully parsed JSON from AI response');
            return parsedData;
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            console.error('Generated text:', generatedText);
            throw new Error('AI generated invalid JSON format');
        }

    } catch (error) {
        console.error('AI processing error:', error);
        throw error;
    }
}

// Import function for processed LifeCV data
async function importLifeCvData(importData) {
    try {
        console.log('Importing LifeCV data...');
        
        // Validate required structure
        if (!importData || typeof importData !== 'object') {
            throw new Error('Invalid import data format');
        }

        // Get current LifeCV data
        const currentData = await getLifeCvData();
        
        // Merge with existing data
        const mergedData = { ...currentData };
        
        // Merge each section
        Object.keys(importData).forEach(section => {
            if (importData[section]) {
                if (Array.isArray(importData[section])) {
                    // For array sections, append new items
                    if (!mergedData[section]) mergedData[section] = [];
                    const itemsWithSource = importData[section].map(item => ({
                        ...item,
                        source: 'AI File Import',
                        importedAt: new Date().toISOString()
                    }));
                    mergedData[section] = [...mergedData[section], ...itemsWithSource];
                } else {
                    // For object sections, merge properties
                    mergedData[section] = { ...mergedData[section], ...importData[section] };
                }
            }
        });

        // Save to Firebase with retry logic
        let saveSuccess = false;
        let attempts = 0;
        const maxAttempts = 3;

        while (!saveSuccess && attempts < maxAttempts) {
            try {
                attempts++;
                console.log(`Saving to Firebase (attempt ${attempts}/${maxAttempts})...`);
                
                await updateDocument('users', currentUser.uid, { 'lifeCv': mergedData });
                saveSuccess = true;
                
                console.log('Successfully saved to Firebase');
                
            } catch (saveError) {
                console.error(`Save attempt ${attempts} failed:`, saveError);
                
                if (attempts >= maxAttempts) {
                    throw new Error('Failed to save data after multiple attempts. Please try again.');
                }
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
            }
        }

        // Update local cache
        lifeCvData = mergedData;
        
        // Re-render the LifeCV sections
        renderAllSections();
        
        return mergedData;
        
    } catch (error) {
        console.error('Import error:', error);
        throw error;
    }
}

// Enhanced import function with version comparison
async function importLifeCvDataWithComparison(importData) {
    try {
        console.log('Starting import with version comparison...');
        
        if (!importData || typeof importData !== 'object') {
            throw new Error('Invalid import data format');
        }

        const currentData = await getLifeCvData();
        
        // Check if there's existing data to compare
        const hasExistingData = Object.keys(currentData).some(key => 
            currentData[key] && (Array.isArray(currentData[key]) ? currentData[key].length > 0 : Object.keys(currentData[key]).length > 0)
        );

        if (hasExistingData) {
            // Show comparison modal
            await showVersionComparisonModal(currentData, importData);
        } else {
            // No existing data, proceed with direct import
            await directImport(importData);
        }
        
    } catch (error) {
        console.error('Import with comparison error:', error);
        throw error;
    }
}

function showVersionComparisonModal(currentData, importData) {
    return new Promise((resolve, reject) => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-y-auto">
                <div class="p-6 border-b border-slate-200">
                    <h2 class="text-2xl font-bold text-slate-800 mb-2">Import Data Comparison</h2>
                    <p class="text-slate-600">Review the differences between your current data and the imported data. Choose which version to keep for each section.</p>
                </div>
                
                <div class="p-6">
                    <div id="comparison-sections" class="space-y-6">
                        <!-- Comparison content will be generated here -->
                    </div>
                </div>
                
                <div class="p-6 border-t border-slate-200 flex justify-between items-center">
                    <div class="flex space-x-3">
                        <button id="select-all-current" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Keep All Current
                        </button>
                        <button id="select-all-imported" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                            Use All Imported
                        </button>
                        <button id="merge-all" class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                            Merge All (Combine Both)
                        </button>
                    </div>
                    <div class="flex space-x-3">
                        <button id="cancel-comparison" class="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">
                            Cancel
                        </button>
                        <button id="apply-changes" class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold">
                            Apply Selected Changes
                        </button>
                    </div>
                </div>
            </div>
        `;

        generateComparisonContent(currentData, importData, modal);
        document.body.appendChild(modal);

        // Event handlers
        modal.querySelector('#cancel-comparison').onclick = () => {
            modal.remove();
            reject(new Error('Import cancelled by user'));
        };

        modal.querySelector('#apply-changes').onclick = async () => {
            try {
                const mergedData = collectSelectedChanges(modal, currentData, importData);
                await directImport(mergedData);
                modal.remove();
                resolve();
            } catch (error) {
                reject(error);
            }
        };

        // Bulk selection handlers
        modal.querySelector('#select-all-current').onclick = () => selectAllVersion(modal, 'current');
        modal.querySelector('#select-all-imported').onclick = () => selectAllVersion(modal, 'imported');
        modal.querySelector('#merge-all').onclick = () => selectAllVersion(modal, 'merge');
    });
}

function generateComparisonContent(currentData, importData, modal) {
    const container = modal.querySelector('#comparison-sections');
    const allSections = new Set([...Object.keys(currentData), ...Object.keys(importData)]);
    
    allSections.forEach(sectionKey => {
        const currentSection = currentData[sectionKey];
        const importedSection = importData[sectionKey];
        
        if (!currentSection && !importedSection) return;
        
        const sectionConfig = lifeCvSections[sectionKey];
        const sectionTitle = sectionConfig?.title || sectionKey;
        
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'border border-slate-200 rounded-lg p-4';
        sectionDiv.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-slate-800">${sectionTitle}</h3>
                <div class="flex space-x-2">
                    <button class="section-choice-btn px-3 py-1 text-sm rounded border" 
                            data-section="${sectionKey}" data-choice="current" 
                            ${!currentSection ? 'disabled' : ''}>
                        Keep Current
                    </button>
                    <button class="section-choice-btn px-3 py-1 text-sm rounded border"
                            data-section="${sectionKey}" data-choice="imported"
                            ${!importedSection ? 'disabled' : ''}>
                        Use Imported
                    </button>
                    <button class="section-choice-btn px-3 py-1 text-sm rounded border"
                            data-section="${sectionKey}" data-choice="merge"
                            ${(!currentSection || !importedSection) ? 'disabled' : ''}>
                        Merge Both
                    </button>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-blue-50 border border-blue-200 rounded p-3">
                    <h4 class="font-medium text-blue-800 mb-2">Current Data</h4>
                    <div class="text-sm text-blue-700">
                        ${formatDataPreview(currentSection, sectionConfig)}
                    </div>
                </div>
                <div class="bg-green-50 border border-green-200 rounded p-3">
                    <h4 class="font-medium text-green-800 mb-2">Imported Data</h4>
                    <div class="text-sm text-green-700">
                        ${formatDataPreview(importedSection, sectionConfig)}
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(sectionDiv);
    });
    
    // Add choice handlers
    container.querySelectorAll('.section-choice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            const choice = btn.dataset.choice;
            
            // Update button states
            container.querySelectorAll(`[data-section="${section}"]`).forEach(b => {
                b.classList.remove('bg-indigo-600', 'text-white');
                b.classList.add('bg-white', 'text-slate-700');
            });
            
            btn.classList.remove('bg-white', 'text-slate-700');
            btn.classList.add('bg-indigo-600', 'text-white');
            
            // Store choice
            btn.closest('.border').dataset.selectedChoice = choice;
        });
    });
}

function formatDataPreview(data, sectionConfig) {
    if (!data) return '<i class="text-slate-400">No data available</i>';
    
    const fields = sectionConfig.fields || [];
    const isArray = Array.isArray(data);
    
    if (isArray) {
        return data.map(item => `
            <div class="mb-2">
                ${fields.map(field => `
                    <div class="flex">
                        <span class="font-semibold text-slate-800 mr-2">${field.label}:</span>
                        <span class="text-slate-700">${item[field.id] || '-'}</span>
                    </div>
                `).join('')}
            </div>
        `).join('');
    } else {
        return fields.map(field => `
            <div class="flex">
                <span class="font-semibold text-slate-800 mr-2">${field.label}:</span>
                <span class="text-slate-700">${data[field.id] || '-'}</span>
            </div>
        `).join('');
    }
}

// Direct import function (after version comparison)
async function directImport(importData) {
    try {
        console.log('Direct importing LifeCV data...');
        
        // Validate required structure
        if (!importData || typeof importData !== 'object') {
            throw new Error('Invalid import data format');
        }

        // Get current LifeCV data
        const currentData = await getLifeCvData();
        
        // Merge with existing data
        const mergedData = { ...currentData };
        
        // Merge each section
        Object.keys(importData).forEach(section => {
            if (importData[section]) {
                if (Array.isArray(importData[section])) {
                    // For array sections, replace existing items
                    mergedData[section] = importData[section].map(item => ({
                        ...item,
                        source: 'AI File Import',
                        importedAt: new Date().toISOString()
                    }));
                } else {
                    // For object sections, merge properties
                    mergedData[section] = { ...mergedData[section], ...importData[section] };
                }
            }
        });

        // Save to Firebase
        await updateDocument('users', currentUser.uid, { 'lifeCv': mergedData });
        
        // Update local cache
        lifeCvData = mergedData;
        
        // Re-render the LifeCV sections
        renderAllSections();
        
        alert("Data imported successfully!");
        
    } catch (error) {
        console.error('Direct import error:', error);
        alert('Failed to import data. Please try again.');
    }
}

// Error message for file import
function showImportErrorMessage(errorMessage) {
    const message = document.createElement('div');
    message.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md';
    message.innerHTML = `
        <div class="flex items-start">
            <i class="fas fa-exclamation-triangle mr-2 mt-1"></i>
            <div>
                <div class="font-semibold">Import Failed</div>
                <div class="text-sm mt-1">${errorMessage}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 8000);
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
                                            <button class="text-sm text-slate-600 hover:text-slate-800 mr-3 copy-link-btn" data-url="${profile.publicUrl}">
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
            <div class="p-6 border-t border-slate-200 flex justify-between">
                <button type="button" class="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300" onclick="this.closest('.fixed').remove()">Cancel</button>
                <div class="flex space-x-3">
                    <button type="button" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" onclick="previewPublicProfile()">Preview</button>
                    <button type="button" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700" onclick="createPublicProfile('${templateKey}')">Create Profile</button>
                </div>
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
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="p-6 border-b border-slate-200">
                <h2 class="text-xl font-bold text-slate-800">QR Code</h2>
                <p class="text-slate-600 text-sm mt-1">Scan to view profile</p>
            </div>
            <div class="p-6 text-center">
                <div id="qr-code-container" class="inline-block p-4 bg-white border-2 border-slate-200 rounded-lg">
                    <!-- QR code will be generated here -->
                </div>
                <p class="text-xs text-slate-500 mt-3 break-all">${url}</p>
            </div>
            <div class="p-6 border-t border-slate-200 flex justify-between">
                <button type="button" class="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300" onclick="this.closest('.fixed').remove()">Close</button>
                <div class="flex space-x-2">
                    <button type="button" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" onclick="downloadQRCode('${url}')">
                        <i class="fas fa-download mr-1"></i>Download
                    </button>
                    <button type="button" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700" onclick="shareQRCode('${url}')">
                        <i class="fas fa-share mr-1"></i>Share
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Generate QR code using qrcode.js library
    generateQRCodeImage(url, modal.querySelector('#qr-code-container'));
}

function generateQRCodeImage(url, container) {
    // Using QRCode.js library (would need to be included in HTML)
    if (typeof QRCode !== 'undefined') {
        new QRCode(container, {
            text: url,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    } else {
        // Fallback to online QR code service
        const qrImg = document.createElement('img');
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
        qrImg.alt = 'QR Code';
        qrImg.className = 'mx-auto';
        container.appendChild(qrImg);
    }
}

// --- MISSING HELPER FUNCTIONS ---

function collectSelectedChanges(modal, currentData, importData) {
    const sections = modal.querySelectorAll('[data-selected-choice]');
    const mergedData = { ...currentData };
    
    sections.forEach(section => {
        const sectionKey = section.querySelector('[data-section]').dataset.section;
        const choice = section.dataset.selectedChoice;
        
        switch (choice) {
            case 'current':
                // Keep current data (no change needed)
                break;
            case 'imported':
                mergedData[sectionKey] = importData[sectionKey];
                break;
            case 'merge':
                if (Array.isArray(currentData[sectionKey]) && Array.isArray(importData[sectionKey])) {
                    mergedData[sectionKey] = [...currentData[sectionKey], ...importData[sectionKey]];
                } else {
                    mergedData[sectionKey] = { ...currentData[sectionKey], ...importData[sectionKey] };
                }
                break;
        }
    });
    
    return mergedData;
}

function selectAllVersion(modal, version) {
    const buttons = modal.querySelectorAll('.section-choice-btn');
    buttons.forEach(btn => {
        if (btn.dataset.choice === version && !btn.disabled) {
            btn.click();
        }
    });
}

function generateUrlSlug(fullName, profileType) {
    const cleanName = fullName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    
    const cleanType = profileType
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
    
    return `${cleanName}-${cleanType}-${Date.now().toString().slice(-6)}`;
}

function checkSensitiveData(modal) {
    const selectedSections = Array.from(modal.querySelectorAll('input[name="sections"]:checked')).map(cb => cb.value);
    const sensitiveDataSection = modal.querySelector('#sensitive-data-section');
    
    // Define which sections contain sensitive data
    const sensitiveSections = ['personal', 'financial', 'health'];
    const hasSensitiveData = selectedSections.some(section => sensitiveSections.includes(section));
    
    if (hasSensitiveData) {
        sensitiveDataSection.classList.remove('hidden');
    } else {
        sensitiveDataSection.classList.add('hidden');
    }
}

function generateContactSelectionHTML() {
    const contactData = lifeCvData.contact || {};
    
    return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <h4 class="font-medium text-slate-700 mb-2">Email Addresses</h4>
                ${(contactData.emails || []).map((email, index) => `
                    <label class="flex items-center mb-1">
                        <input type="checkbox" name="selectedEmails" value="${index}" class="mr-2">
                        <span class="text-sm">${email.value} (${email.type})</span>
                    </label>
                `).join('') || '<p class="text-sm text-slate-500">No email addresses found</p>'}
            </div>
            <div>
                <h4 class="font-medium text-slate-700 mb-2">Phone Numbers</h4>
                                                                                                                         ${(contactData.phones || []).map((phone, index) => `
                    <label class="flex items-center mb-1">
                        <input type="checkbox" name="selectedPhones" value="${index}" class="mr-2">
                        <span class="text-sm">${phone.value} (${phone.type})</span>
                    </label>
                `).join('') || '<p class="text-sm text-slate-500">No phone numbers found</p>'}
            </div>
        </div>
    `;
}

// --- PUBLIC PROFILE BRANDING SYSTEM ---

function generatePublicProfileHTML(profileData, userData) {
    const hubBranding = generateHubBranding();
    const profileContent = generateProfileContent(profileData, userData);
    
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${userData.personal?.fullName || 'Professional Profile'} | The Hub by Salatiso</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
            <style>
                body { font-family: 'Inter', sans-serif; }
                .hub-branding { min-height: 20vh; }
                .profile-content { min-height: 80vh; }
            </style>
        </head>
        <body class="bg-slate-50">
            <div class="min-h-screen">
                <!-- Profile Content (80%) -->
                <div class="profile-content">
                    ${profileContent}
                </div>
                
                <!-- Hub Branding (20%) -->
                <div class="hub-branding">
                    ${hubBranding}
                </div>
            </div>
            
            <!-- Share & Download Actions -->
            <div class="fixed bottom-4 right-4 flex space-x-2">
                <button onclick="shareProfile()" class="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700">
                    <i class="fas fa-share"></i>
                </button>
                <button onclick="showQRCode('${profileData.publicUrl}')" class="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700">
                    <i class="fas fa-qrcode"></i>
                </button>
                <button onclick="downloadProfile()" class="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        </body>
        </html>
    `;
}

function generateHubBranding() {
    return `
        <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
            <div class="max-w-4xl mx-auto px-6">
                <div class="text-center">
                    <div class="flex items-center justify-center mb-4">
                        <i class="fas fa-sitemap text-3xl mr-3"></i>
                        <h2 class="text-2xl font-bold">The Hub by Salatiso</h2>
                    </div>
                    <p class="text-sm max-w-md mx-auto">
                        Connect, share, and grow your professional presence. Your journey, your story.
                    </p>
                </div>
            </div>
        </div>
    `;
}

function generateProfileContent(profileData, userData) {
    const sections = profileData.sections || [];
    let content = '';
    
    sections.forEach(sectionKey => {
        const sectionData = profileData[sectionKey];
        const sectionConfig = lifeCvSections[sectionKey];
        
        if (sectionConfig) {
            content += `
                <div class="mb-8">
                    <h3 class="text-lg font-semibold text-slate-800 mb-4">${sectionConfig.title}</h3>
                    ${generateSectionContent(sectionKey, sectionData, userData)}
                </div>
            `;
        }
    });
    
    return content;
}

function generateSectionContent(sectionKey, sectionData, userData) {
    const sectionConfig = lifeCvSections[sectionKey];
    
    if (sectionConfig.isArray) {
        // For array sections, generate list items
        return `
            <div class="space-y-4">
                ${sectionData.length > 0 
                    ? sectionData.map((item, index) => `
                        <div class="p-4 bg-white rounded-lg shadow border">
                            ${generateItemContent(sectionKey, item, userData)}
                        </div>
                    `).join('')
                    : '<p class="text-slate-500 text-center py-4">No items to display</p>'
                }
            </div>
        `;
    } else {
        // For object sections, generate form-like layout
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${sectionConfig.fields.map(field => `
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">${field.label}</label>
                        <div class="text-sm text-slate-600">
                            ${field.type === 'textarea' 
                                ? `<p>${sectionData[field.id] || '-'}</p>` 
                                : `<span>${sectionData[field.id] || '-'}</span>`
                            }
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

function generateItemContent(sectionKey, item, userData) {
    const fields = lifeCvSections[sectionKey].fields;
    
    return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${fields.map(field => `
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">${field.label}</label>
                    <div class="text-sm text-slate-600">
                        ${field.type === 'textarea' 
                            ? `<p>${item[field.id] || '-'}</p>` 
                            : `<span>${item[field.id] || '-'}</span>`
                        }
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// --- END OF FILE ---
