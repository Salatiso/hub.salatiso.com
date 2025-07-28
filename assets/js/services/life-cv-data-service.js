/* ================================================================================= */
/* FILE: assets/js/services/life-cv-data-service.js (COMPREHENSIVE)                 */
/* PURPOSE: Complete data management for LifeCV with all sections                   */
/* ================================================================================= */

import { auth, db } from '../firebase-config.js';
import { doc, onSnapshot, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { debounce, getNestedProperty, setNestedProperty } from '../utils/helpers.js';
import { validateField } from '../utils/validators.js';

let currentUser = null;
let lifeCvData = {};
let onDataUpdateCallback = null;

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
                lifeCvData = getDefaultLifeCvData();
                setDoc(userDocRef, { lifeCvData }, { merge: true });
            }
        } else {
            console.log('No user document exists, creating default');
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
 * Migrate existing data structure to comprehensive new format
 */
function migrateExistingData(existingData) {
    console.log('Migrating existing comprehensive data:', existingData);
    
    const migrated = getDefaultLifeCvData();
    
    // Migrate Personal Information
    if (existingData.personal) {
        const personal = existingData.personal;
        migrated.personalInfo = {
            fullName: { value: personal.fullName || '', isPublic: true, lastModified: new Date().toISOString() },
            preferredName: { value: personal.preferredName || '', isPublic: true, lastModified: new Date().toISOString() },
            pronouns: { value: personal.pronouns || '', isPublic: true, lastModified: new Date().toISOString() },
            phone: { value: personal.phone || '', isPublic: false, lastModified: new Date().toISOString() },
            email: { value: personal.email || '', isPublic: true, lastModified: new Date().toISOString() },
            address: { value: personal.address || '', isPublic: false, lastModified: new Date().toISOString() },
            dateOfBirth: { value: personal.dob || '', isPublic: false, lastModified: new Date().toISOString() },
            idNumber: { value: personal.idNumber || '', isPublic: false, lastModified: new Date().toISOString() },
            nationality: { value: personal.nationality || '', isPublic: true, lastModified: new Date().toISOString() },
            ethnicity: { value: personal.ethnicity || '', isPublic: false, lastModified: new Date().toISOString() },
            emergencyContact: { value: personal.emergencyContact || '', isPublic: false, lastModified: new Date().toISOString() }
        };
    }

    // Migrate Professional Summary
    if (existingData.professional) {
        const prof = existingData.professional;
        migrated.professionalSummary = {
            summary: { value: prof.summary || '', isPublic: true, lastModified: new Date().toISOString() },
            careerVision: { value: prof.careerVision || '', isPublic: true, lastModified: new Date().toISOString() },
            workStyle: { value: prof.workStyle || '', isPublic: true, lastModified: new Date().toISOString() }
        };
    }

    // Migrate Life Philosophy
    if (existingData.philosophy) {
        const phil = existingData.philosophy;
        migrated.lifePhilosophy = {
            mission: { value: phil.mission || '', isPublic: true, lastModified: new Date().toISOString() },
            values: { value: phil.values || '', isPublic: true, lastModified: new Date().toISOString() },
            beliefs: { value: phil.beliefs || '', isPublic: true, lastModified: new Date().toISOString() },
            spirituality: { value: phil.spirituality || '', isPublic: false, lastModified: new Date().toISOString() },
            lifeGoals: { value: phil.lifeGoals || '', isPublic: true, lastModified: new Date().toISOString() }
        };
    }

    // Migrate Health Information
    if (existingData.health) {
        const health = existingData.health;
        migrated.healthWellness = {
            physicalHealth: { value: health.physicalHealth || '', isPublic: false, lastModified: new Date().toISOString() },
            mentalHealth: { value: health.mentalHealth || '', isPublic: false, lastModified: new Date().toISOString() },
            medications: { value: health.medications || '', isPublic: false, lastModified: new Date().toISOString() },
            allergies: { value: health.allergies || '', isPublic: false, lastModified: new Date().toISOString() },
            disabilities: { value: health.disabilities || '', isPublic: false, lastModified: new Date().toISOString() },
            healthGoals: { value: health.healthGoals || '', isPublic: false, lastModified: new Date().toISOString() }
        };
    }

    // Migrate array sections with enhanced structure
    const arraySections = [
        'experience', 'education', 'skills', 'certifications', 'projects', 
        'languages', 'interests', 'milestones', 'volunteering', 'publications',
        'digital', 'family', 'community', 'financials'
    ];

    arraySections.forEach(section => {
        if (existingData[section] && Array.isArray(existingData[section])) {
            migrated[section] = existingData[section].map(item => {
                const migratedItem = {};
                Object.keys(item).forEach(key => {
                    migratedItem[key] = {
                        value: item[key] || '',
                        isPublic: getDefaultPrivacyForField(section, key),
                        lastModified: new Date().toISOString()
                    };
                });
                return migratedItem;
            });
        }
    });

    console.log('Migration completed successfully');
    return migrated;
}

/**
 * Returns default privacy setting for specific fields
 */
function getDefaultPrivacyForField(section, field) {
    const sensitiveFields = [
        'phone', 'address', 'dateOfBirth', 'idNumber', 'emergencyContact',
        'medications', 'allergies', 'disabilities', 'healthGoals',
        'salary', 'income', 'financialGoals', 'assets', 'liabilities'
    ];
    
    return !sensitiveFields.includes(field);
}

/**
 * Returns comprehensive default LifeCV data structure
 */
function getDefaultLifeCvData() {
    return {
        personalInfo: {
            fullName: { value: '', isPublic: true, lastModified: new Date().toISOString() },
            preferredName: { value: '', isPublic: true, lastModified: new Date().toISOString() },
            pronouns: { value: '', isPublic: true, lastModified: new Date().toISOString() },
            dateOfBirth: { value: '', isPublic: false, lastModified: new Date().toISOString() },
            idNumber: { value: '', isPublic: false, lastModified: new Date().toISOString() },
            nationality: { value: '', isPublic: true, lastModified: new Date().toISOString() },
            ethnicity: { value: '', isPublic: false, lastModified: new Date().toISOString() }
        },
        contactInfo: [],
        emergencyContacts: [],
        professionalSummary: {
            summary: { value: '', isPublic: true, lastModified: new Date().toISOString() },
            careerVision: { value: '', isPublic: true, lastModified: new Date().toISOString() },
            workStyle: { value: '', isPublic: true, lastModified: new Date().toISOString() }
        },
        lifePhilosophy: {
            mission: { value: '', isPublic: true, lastModified: new Date().toISOString() },
            values: { value: '', isPublic: true, lastModified: new Date().toISOString() },
            beliefs: { value: '', isPublic: true, lastModified: new Date().toISOString() },
            spirituality: { value: '', isPublic: false, lastModified: new Date().toISOString() },
            lifeGoals: { value: '', isPublic: true, lastModified: new Date().toISOString() }
        },
        healthWellness: {
            physicalHealth: { value: '', isPublic: false, lastModified: new Date().toISOString() },
            mentalHealth: { value: '', isPublic: false, lastModified: new Date().toISOString() },
            medications: { value: '', isPublic: false, lastModified: new Date().toISOString() },
            allergies: { value: '', isPublic: false, lastModified: new Date().toISOString() },
            disabilities: { value: '', isPublic: false, lastModified: new Date().toISOString() },
            healthGoals: { value: '', isPublic: false, lastModified: new Date().toISOString() }
        },
        profilePictures: [],
        experience: [],
        education: [],
        skills: [],
        certifications: [],
        projects: [],
        languages: [],
        interests: [],
        milestones: [],
        volunteering: [],
        publications: [],
        digital: [],
        family: [],
        community: [],
        financials: [],
        travel: [],
        references: []
    };
}

/**
 * Returns the comprehensive section configuration
 */
export function getLifeCvSections() {
    return {
        personalInfo: {
            title: "Personal & Identity",
            icon: "fas fa-user",
            isArray: false,
            description: "Core personal information and identity details",
            fields: [
                { id: "fullName", label: "Full Name", type: "text", required: true },
                { id: "preferredName", label: "Preferred Name", type: "text" },
                { id: "pronouns", label: "Pronouns", type: "select", options: ["he/him", "she/her", "they/them", "other"] },
                { id: "dateOfBirth", label: "Date of Birth", type: "date", sensitive: true },
                { id: "idNumber", label: "ID/Passport Number", type: "text", sensitive: true },
                { id: "nationality", label: "Nationality", type: "text" },
                { id: "ethnicity", label: "Ethnicity", type: "text", sensitive: true }
            ]
        },
        contactInfo: {
            title: "Contact Information",
            icon: "fas fa-address-book",
            isArray: true,
            description: "Phone numbers, email addresses, and physical addresses",
            fields: [
                { id: "type", label: "Contact Type", type: "select", options: ["Phone", "Email", "Address"], required: true },
                { id: "subtype", label: "Subtype", type: "select", options: ["Home", "Work", "Mobile", "Personal", "Business", "Other"], required: true },
                { id: "value", label: "Contact Value", type: "text", required: true },
                { id: "label", label: "Custom Label", type: "text" },
                { id: "isPrimary", label: "Primary Contact", type: "checkbox" },
                { id: "coordinates", label: "GPS Coordinates", type: "text", readonly: true, sensitive: true },
                { id: "notes", label: "Notes", type: "textarea" }
            ]
        },
        emergencyContacts: {
            title: "Emergency Contacts",
            icon: "fas fa-phone-alt",
            isArray: true,
            description: "Emergency contact information",
            fields: [
                { id: "name", label: "Contact Name", type: "text", required: true },
                { id: "relationship", label: "Relationship", type: "select", options: ["Spouse", "Parent", "Child", "Sibling", "Friend", "Colleague", "Doctor", "Other"], required: true },
                { id: "phone", label: "Phone Number", type: "tel", required: true },
                { id: "email", label: "Email Address", type: "email" },
                { id: "address", label: "Address", type: "textarea" },
                { id: "notes", label: "Notes", type: "textarea" }
            ]
        },
        profilePictures: {
            title: "Profile Pictures",
            icon: "fas fa-camera",
            isArray: true,
            description: "Manage your profile photos with metadata",
            fields: [
                { id: "url", label: "Image URL", type: "file", fileType: "image" },
                { id: "caption", label: "Caption", type: "text" },
                { id: "context", label: "Context", type: "select", options: ["Professional", "Casual", "Formal", "Social"] },
                { id: "isPrimary", label: "Primary Photo", type: "checkbox" },
                { id: "tags", label: "Tags", type: "text", placeholder: "headshot, business, outdoor" }
            ]
        },
        professionalSummary: {
            title: "Professional Profile",
            icon: "fas fa-briefcase",
            isArray: false,
            description: "Your professional identity and career overview",
            fields: [
                { id: "summary", label: "Professional Summary", type: "textarea", required: true },
                { id: "careerVision", label: "Career Vision", type: "textarea" },
                { id: "workStyle", label: "Work Style", type: "textarea" }
            ]
        },
        lifePhilosophy: {
            title: "Life Philosophy & Values",
            icon: "fas fa-lightbulb",
            isArray: false,
            description: "Your personal philosophy, values, and beliefs",
            fields: [
                { id: "mission", label: "Mission Statement", type: "textarea" },
                { id: "values", label: "Core Values", type: "textarea" },
                { id: "beliefs", label: "Beliefs & Worldview", type: "textarea" },
                { id: "spirituality", label: "Spiritual Beliefs", type: "textarea", sensitive: true },
                { id: "lifeGoals", label: "Life Goals", type: "textarea" }
            ]
        },
        healthWellness: {
            title: "Health & Wellness",
            icon: "fas fa-heart",
            isArray: false,
            description: "Physical and mental health information",
            fields: [
                { id: "physicalHealth", label: "Physical Health Status", type: "textarea", sensitive: true },
                { id: "mentalHealth", label: "Mental Health Status", type: "textarea", sensitive: true },
                { id: "medications", label: "Current Medications", type: "textarea", sensitive: true },
                { id: "allergies", label: "Allergies", type: "textarea", sensitive: true },
                { id: "disabilities", label: "Disabilities", type: "textarea", sensitive: true },
                { id: "healthGoals", label: "Health & Fitness Goals", type: "textarea", sensitive: true }
            ]
        },
        family: {
            title: "Family & Relationships",
            icon: "fas fa-users",
            isArray: true,
            description: "Family members and important relationships",
            fields: [
                { id: "name", label: "Name", type: "text", required: true },
                { id: "relationship", label: "Relationship", type: "select", options: ["Spouse", "Child", "Parent", "Sibling", "Grandparent", "Uncle/Aunt", "Cousin", "Friend", "Colleague", "Mentor", "Other"] },
                { id: "significance", label: "Significance", type: "textarea" },
                { id: "contact", label: "Contact Information", type: "text", sensitive: true }
            ]
        },
        experience: {
            title: "Work Experience",
            icon: "fas fa-briefcase",
            isArray: true,
            description: "Professional work experience and career history",
            fields: [
                { id: "jobTitle", label: "Job Title", type: "text", required: true },
                { id: "company", label: "Company", type: "text", required: true },
                { id: "industry", label: "Industry", type: "text" },
                { id: "location", label: "Location", type: "text" },
                { id: "startDate", label: "Start Date", type: "date" },
                { id: "endDate", label: "End Date", type: "date" },
                { id: "current", label: "Current Position", type: "checkbox" },
                { id: "description", label: "Description", type: "textarea" },
                { id: "skills", label: "Skills Used", type: "textarea" }
            ]
        },
        education: {
            title: "Education & Qualifications",
            icon: "fas fa-graduation-cap",
            isArray: true,
            description: "Educational background and qualifications",
            fields: [
                { id: "qualification", label: "Qualification", type: "text", required: true },
                { id: "institution", label: "Institution", type: "text", required: true },
                { id: "field", label: "Field of Study", type: "text" },
                { id: "yearCompleted", label: "Year Completed", type: "number" },
                { id: "grade", label: "Grade/GPA", type: "text" },
                { id: "significance", label: "Significance", type: "textarea" }
            ]
        },
        skills: {
            title: "Skills & Competencies",
            icon: "fas fa-cogs",
            isArray: true,
            description: "Technical and soft skills with proficiency levels",
            fields: [
                { id: "skillName", label: "Skill Name", type: "text", required: true },
                { id: "category", label: "Category", type: "select", options: ["Technical", "Soft Skills", "Languages", "Creative", "Physical", "Other"] },
                { id: "proficiency", label: "Proficiency Level", type: "select", options: ["Beginner", "Intermediate", "Advanced", "Expert"] },
                { id: "context", label: "Context", type: "textarea" },
                { id: "yearsOfExperience", label: "Years of Experience", type: "number" }
            ]
        },
        certifications: {
            title: "Certifications",
            icon: "fas fa-certificate",
            isArray: true,
            description: "Professional certifications and credentials",
            fields: [
                { id: "name", label: "Certification Name", type: "text", required: true },
                { id: "issuer", label: "Issuing Organization", type: "text", required: true },
                { id: "date", label: "Date Obtained", type: "date" },
                { id: "expires", label: "Expiry Date", type: "date" },
                { id: "credentialId", label: "Credential ID", type: "text" },
                { id: "url", label: "Verification URL", type: "url" }
            ]
        },
        projects: {
            title: "Creative Works & Projects",
            icon: "fas fa-project-diagram",
            isArray: true,
            description: "Personal and professional projects",
            fields: [
                { id: "name", label: "Project Name", type: "text", required: true },
                { id: "type", label: "Project Type", type: "select", options: ["Personal", "Professional", "Academic", "Open Source", "Business", "Creative", "Social Impact"] },
                { id: "description", label: "Description", type: "textarea", required: true },
                { id: "role", label: "Your Role", type: "text" },
                { id: "technologies", label: "Technologies Used", type: "text" },
                { id: "outcome", label: "Outcome/Results", type: "textarea" },
                { id: "url", label: "Project URL", type: "url" }
            ]
        },
        languages: {
            title: "Languages",
            icon: "fas fa-language",
            isArray: true,
            description: "Language skills and proficiency",
            fields: [
                { id: "language", label: "Language", type: "text", required: true },
                { id: "proficiency", label: "Proficiency", type: "select", options: ["Basic", "Conversational", "Fluent", "Native"] },
                { id: "context", label: "Context", type: "textarea" }
            ]
        },
        interests: {
            title: "Hobbies & Interests",
            icon: "fas fa-heart",
            isArray: true,
            description: "Personal interests and hobbies",
            fields: [
                { id: "interest", label: "Interest/Hobby", type: "text", required: true },
                { id: "category", label: "Category", type: "select", options: ["Sports", "Arts", "Technology", "Reading", "Travel", "Music", "Gaming", "Outdoors", "Crafts", "Other"] },
                { id: "level", label: "Level of Interest", type: "select", options: ["Casual", "Moderate", "Serious", "Professional"] },
                { id: "description", label: "Description", type: "textarea" }
            ]
        },
        milestones: {
            title: "Life Milestones & Experiences",
            icon: "fas fa-trophy",
            isArray: true,
            description: "Significant life events and achievements",
            fields: [
                { id: "title", label: "Milestone Title", type: "text", required: true },
                { id: "date", label: "Date", type: "date" },
                { id: "category", label: "Category", type: "select", options: ["Achievement", "Award", "Personal", "Professional", "Education", "Life Event", "Other"] },
                { id: "description", label: "Description", type: "textarea" },
                { id: "lessons", label: "Lessons Learned", type: "textarea" }
            ]
        },
        community: {
            title: "Community & Social Impact",
            icon: "fas fa-hands-helping",
            isArray: true,
            description: "Community involvement and social impact activities",
            fields: [
                { id: "organization", label: "Organization", type: "text", required: true },
                { id: "role", label: "Role/Position", type: "text" },
                { id: "contribution", label: "Contribution", type: "textarea" },
                { id: "impact", label: "Impact Made", type: "textarea" },
                { id: "startDate", label: "Start Date", type: "date" },
                { id: "endDate", label: "End Date", type: "date" }
            ]
        },
        volunteering: {
            title: "Volunteer Work",
            icon: "fas fa-volunteer",
            isArray: true,
            description: "Volunteer experiences and community service",
            fields: [
                { id: "organization", label: "Organization", type: "text", required: true },
                { id: "role", label: "Volunteer Role", type: "text" },
                { id: "cause", label: "Cause/Focus Area", type: "text" },
                { id: "startDate", label: "Start Date", type: "date" },
                { id: "endDate", label: "End Date", type: "date" },
                { id: "description", label: "Description", type: "textarea" },
                { id: "skills", label: "Skills Used/Developed", type: "text" }
            ]
        },
        publications: {
            title: "Publications & Media",
            icon: "fas fa-book",
            isArray: true,
            description: "Written works, publications, and media appearances",
            fields: [
                { id: "title", label: "Title", type: "text", required: true },
                { id: "type", label: "Publication Type", type: "select", options: ["Article", "Blog Post", "Book", "Paper", "Podcast", "Video", "Interview", "Other"] },
                { id: "publisher", label: "Publisher/Platform", type: "text" },
                { id: "date", label: "Publication Date", type: "date" },
                { id: "url", label: "URL", type: "url" },
                { id: "description", label: "Description", type: "textarea" }
            ]
        },
        digital: {
            title: "Digital Presence & Social Media",
            icon: "fas fa-globe",
            isArray: true,
            description: "Online profiles and digital presence",
            fields: [
                { id: "platform", label: "Platform", type: "text", required: true },
                { id: "username", label: "Username", type: "text" },
                { id: "url", label: "Profile URL", type: "url" },
                { id: "purpose", label: "Purpose", type: "select", options: ["Professional", "Personal", "Portfolio", "Business", "Creative", "Academic"] },
                { id: "privacy", label: "Privacy Level", type: "select", options: ["Public", "Private", "Professional Only"] },
                { id: "description", label: "Description", type: "textarea" }
            ]
        },
        travel: {
            title: "Travel & Cultural Experiences",
            icon: "fas fa-plane",
            isArray: true,
            description: "Travel experiences and cultural insights",
            fields: [
                { id: "destination", label: "Destination", type: "text", required: true },
                { id: "country", label: "Country", type: "text" },
                { id: "purpose", label: "Purpose", type: "select", options: ["Leisure", "Business", "Education", "Volunteer", "Cultural Exchange", "Adventure", "Other"] },
                { id: "duration", label: "Duration", type: "text" },
                { id: "year", label: "Year", type: "number" },
                { id: "highlights", label: "Key Highlights", type: "textarea" },
                { id: "culturalInsights", label: "Cultural Insights", type: "textarea" }
            ]
        },
        financials: {
            title: "Financial & Legal Information",
            icon: "fas fa-dollar-sign",
            isArray: true,
            description: "Financial assets, investments, and legal information",
            fields: [
                { id: "assetName", label: "Asset Name", type: "text", required: true },
                { id: "assetType", label: "Asset Type", type: "select", options: ["Property", "Investment", "Business", "Intellectual Property", "Legal Document", "Insurance", "Other"] },
                { id: "details", label: "Details", type: "textarea", sensitive: true },
                { id: "value", label: "Value", type: "number", sensitive: true },
                { id: "period", label: "Period/Date", type: "text" }
            ]
        },
        references: {
            title: "References",
            icon: "fas fa-user-friends",
            isArray: true,
            description: "Professional and personal references",
            fields: [
                { id: "name", label: "Reference Name", type: "text", required: true },
                { id: "title", label: "Job Title", type: "text" },
                { id: "company", label: "Company", type: "text" },
                { id: "relationship", label: "Relationship", type: "text" },
                { id: "contact", label: "Contact Information", type: "text", sensitive: true }
            ]
        }
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
    const timestamp = new Date().toISOString();
    
    // Update the value
    setNestedProperty(lifeCvData, path, value);
    
    // Update the lastModified timestamp
    const pathParts = path.split('.');
    if (pathParts.length >= 2) {
        const timestampPath = pathParts.slice(0, -1).concat('lastModified').join('.');
        setNestedProperty(lifeCvData, timestampPath, timestamp);
    }
    
    debouncedSave();
    
    if (onDataUpdateCallback) {
        onDataUpdateCallback(lifeCvData);
    }
}

/**
 * Export comprehensive data for download
 */
export function exportData(options = {}) {
    const { 
        format = 'json',
        includePrivate = false,
        sections = null 
    } = options;
    
    let exportData = { ...lifeCvData };
    
    // Filter private data if requested
    if (!includePrivate) {
        exportData = filterPrivateData(exportData);
    }
    
    // Filter specific sections if requested
    if (sections && Array.isArray(sections)) {
        const filteredData = {};
        sections.forEach(section => {
            if (exportData[section]) {
                filteredData[section] = exportData[section];
            }
        });
        exportData = filteredData;
    }
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `lifecv-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

/**
 * Filter out private data
 */
function filterPrivateData(data) {
    const filtered = {};
    
    Object.keys(data).forEach(sectionKey => {
        const section = data[sectionKey];
        
        if (Array.isArray(section)) {
            filtered[sectionKey] = section.map(item => {
                const filteredItem = {};
                Object.keys(item).forEach(fieldKey => {
                    const field = item[fieldKey];
                    if (field && typeof field === 'object' && field.isPublic !== false) {
                        filteredItem[fieldKey] = field;
                    }
                });
                return filteredItem;
            });
        } else if (typeof section === 'object' && section !== null) {
            filtered[sectionKey] = {};
            Object.keys(section).forEach(fieldKey => {
                const field = section[fieldKey];
                if (field && typeof field === 'object' && field.isPublic !== false) {
                    filtered[sectionKey][fieldKey] = field;
                }
            });
        } else {
            filtered[sectionKey] = section;
        }
    });
    
    return filtered;
}

/**
 * Import and merge data from external source
 */
export async function importData(importedData, mergeOptions = {}) {
    try {
        const { 
            strategy = 'merge', // 'merge', 'replace', 'custom'
            conflicts = 'prompt' // 'prompt', 'keepExisting', 'useNew'
        } = mergeOptions;
        
        console.log('Importing data with strategy:', strategy);
        
        if (strategy === 'replace') {
            // Complete replacement
            lifeCvData = { ...getDefaultLifeCvData(), ...importedData };
        } else if (strategy === 'merge') {
            // Smart merge with conflict detection
            lifeCvData = await mergeDataSmart(lifeCvData, importedData, conflicts);
        }
        
        // Save to Firestore
        await saveLifeCvData();
        
        if (onDataUpdateCallback) {
            onDataUpdateCallback(lifeCvData);
        }
        
        return { success: true, conflicts: [] };
    } catch (error) {
        console.error('Error importing data:', error);
        throw error;
    }
}

/**
 * Smart merge with conflict detection
 */
async function mergeDataSmart(existing, imported, conflictResolution) {
    const merged = { ...existing };
    const conflicts = [];
    
    Object.keys(imported).forEach(sectionKey => {
        const importedSection = imported[sectionKey];
        const existingSection = existing[sectionKey];
        
        if (!existingSection) {
            // New section, add it
            merged[sectionKey] = importedSection;
        } else if (Array.isArray(importedSection) && Array.isArray(existingSection)) {
            // Merge array sections
            merged[sectionKey] = [...existingSection, ...importedSection];
        } else if (typeof importedSection === 'object' && typeof existingSection === 'object') {
            // Merge object sections
            merged[sectionKey] = { ...existingSection };
            
            Object.keys(importedSection).forEach(fieldKey => {
                const importedField = importedSection[fieldKey];
                const existingField = existingSection[fieldKey];
                
                if (!existingField || !existingField.value || existingField.value.trim() === '') {
                    // No existing value, use imported
                    merged[sectionKey][fieldKey] = {
                        ...importedField,
                        lastModified: new Date().toISOString()
                    };
                } else if (importedField.value && importedField.value !== existingField.value) {
                    // Conflict detected
                    if (conflictResolution === 'useNew') {
                        merged[sectionKey][fieldKey] = {
                            ...importedField,
                            lastModified: new Date().toISOString()
                        };
                    } else if (conflictResolution === 'keepExisting') {
                        // Keep existing value
                    } else {
                        // Store conflict for user resolution
                        conflicts.push({
                            section: sectionKey,
                            field: fieldKey,
                            existing: existingField.value,
                            imported: importedField.value
                        });
                    }
                }
            });
        }
    });
    
    return merged;
}

/**
 * Add new item to array section
 */
export function addArrayItem(sectionKey, itemData) {
    if (!lifeCvData[sectionKey]) {
        lifeCvData[sectionKey] = [];
    }
    
    // Convert flat data to enhanced structure
    const enhancedItem = {};
    Object.keys(itemData).forEach(key => {
        enhancedItem[key] = {
            value: itemData[key],
            isPublic: getDefaultPrivacyForField(sectionKey, key),
            lastModified: new Date().toISOString()
        };
    });
    
    lifeCvData[sectionKey].push(enhancedItem);
    debouncedSave();
    
    if (onDataUpdateCallback) {
        onDataUpdateCallback(lifeCvData);
    }
}

/**
 * Remove item from array section
 */
export function removeArrayItem(sectionKey, index) {
    if (lifeCvData[sectionKey] && Array.isArray(lifeCvData[sectionKey])) {
        lifeCvData[sectionKey].splice(index, 1);
        debouncedSave();
        
        if (onDataUpdateCallback) {
            onDataUpdateCallback(lifeCvData);
        }
    }
}

/**
 * Update privacy setting for a specific field
 */
export function updatePrivacySetting(path, isPublic) {
    const privacyPath = path.includes('.') ? 
        path.replace(/\.([^.]+)$/, '.isPublic') : 
        `${path}.isPublic`;
    
    setNestedProperty(lifeCvData, privacyPath, isPublic);
    debouncedSave();
    
    if (onDataUpdateCallback) {
        onDataUpdateCallback(lifeCvData);
    }
}