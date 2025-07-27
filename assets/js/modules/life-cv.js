<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LifeCV - Your Complete Life Profile</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        .accordion-content {
            display: none;
        }
        .accordion-content.show {
            display: block;
        }
        .rotate-180 {
            transform: rotate(180deg);
        }
        .lifecycle-notification {
            z-index: 60;
        }
    </style>
</head>
<body class="bg-slate-100 min-h-screen">
    <!-- Navigation -->
// Define the holistic structure of the LifeCV with enhanced metadata
const lifeCvSections = {
    profilePictures: { 
        title: 'Profile Pictures', 
        icon: 'fa-camera-retro', 
        isCustom: true,
        weight: 10
    },
    
    // Personal & Identity with enhanced privacy controls
    personal: { 
        title: 'Personal & Identity', 
        icon: 'fa-user', 
        isCustomizable: true,
        weight: 20,
        fields: [
            { id: 'fullName', label: 'Full Name', type: 'text', required: true, weight: 5 },
            { id: 'preferredName', label: 'Preferred Name', type: 'text', weight: 2 },
            { id: 'pronouns', label: 'Pronouns', type: 'text', weight: 1 },
            { id: 'dob', label: 'Date of Birth', type: 'date', sensitive: true, weight: 3 },
            { id: 'idNumber', label: 'ID/Passport Number', type: 'text', sensitive: true, weight: 3 },
            { id: 'nationality', label: 'Nationality', type: 'text', weight: 2 },
            { id: 'ethnicity', label: 'Ethnicity/Heritage', type: 'text', weight: 1 }
        ]
    },
    
    // Contact information with array management
    contact: {
        title: 'Contact Information',
        icon: 'fa-address-book',
        isCustom: true,
        weight: 15,
        types: {
            emails: { label: 'Email Addresses', icon: 'fa-envelope', sensitive: false },
            phones: { label: 'Phone Numbers', icon: 'fa-phone', sensitive: false },
            addresses: { label: 'Addresses', icon: 'fa-map-marker-alt', sensitive: true }
        }
    },
    
    // Life Philosophy & Values
    philosophy: { 
        title: 'Life Philosophy & Values', 
        icon: 'fa-heart', 
        weight: 8,
        fields: [
            { id: 'mission', label: 'Personal Mission Statement', type: 'textarea', weight: 3 },
            { id: 'values', label: 'Core Values', type: 'textarea', weight: 3 },
            { id: 'beliefs', label: 'Beliefs & Worldview', type: 'textarea', weight: 2 },
            { id: 'spirituality', label: 'Spiritual/Religious Beliefs', type: 'textarea', weight: 1 },
            { id: 'lifeGoals', label: 'Life Goals & Aspirations', type: 'textarea', weight: 3 }
        ]
    },
    
    // Family & Relationships with Family Hub integration
    family: { 
        title: 'Family & Relationships', 
        icon: 'fa-users', 
        isArray: true, 
        isFamilyIntegrated: true,
        weight: 12,
        fields: [
            { id: 'relationship', label: 'Relationship Type', type: 'select', 
              options: ['Parent', 'Child', 'Sibling', 'Spouse/Partner', 'Extended Family', 'Close Friend', 'Mentor', 'Other'], weight: 2 },
            { id: 'name', label: 'Name', type: 'text', weight: 2 },
            { id: 'significance', label: 'Significance in Your Life', type: 'textarea', weight: 1 },
            { id: 'contact', label: 'Contact Information', type: 'text', sensitive: true, weight: 1 }
        ]
    },
    
    // Professional Journey
    professional: { 
        title: 'Professional Journey', 
        icon: 'fa-briefcase', 
        weight: 10,
        fields: [
            { id: 'summary', label: 'Professional Summary', type: 'textarea', weight: 4 },
            { id: 'careerVision', label: 'Career Vision', type: 'textarea', weight: 3 },
            { id: 'workStyle', label: 'Work Style & Preferences', type: 'textarea', weight: 2 }
        ]
    },
    
    // Work Experience
    experience: { 
        title: 'Work Experience', 
        icon: 'fa-building', 
        isArray: true, 
        weight: 15,
        fields: [
            { id: 'jobTitle', label: 'Job Title', type: 'text', weight: 3 },
            { id: 'company', label: 'Company/Organization', type: 'text', weight: 3 },
            { id: 'industry', label: 'Industry', type: 'text', weight: 2 },
            { id: 'location', label: 'Location', type: 'text', weight: 1 },
            { id: 'startDate', label: 'Start Date', type: 'month', weight: 2 },
            { id: 'endDate', label: 'End Date', type: 'month', weight: 1 },
            { id: 'description', label: 'Key Responsibilities & Achievements', type: 'textarea', weight: 4 },
            { id: 'skills', label: 'Skills Developed', type: 'text', weight: 2 }
        ]
    },
    
    // Education & Learning
    education: { 
        title: 'Education & Qualifications', 
        icon: 'fa-graduation-cap', 
        isArray: true, 
        weight: 12,
        fields: [
            { id: 'qualification', label: 'Qualification/Degree', type: 'text', weight: 3 },
            { id: 'institution', label: 'Institution', type: 'text', weight: 3 },
            { id: 'field', label: 'Field of Study', type: 'text', weight: 2 },
            { id: 'yearCompleted', label: 'Year Completed', type: 'number', weight: 2 },
            { id: 'grade', label: 'Grade/GPA', type: 'text', weight: 1 },
            { id: 'significance', label: 'Key Learning & Impact', type: 'textarea', weight: 2 }
        ]
    },
    
    // Skills & Competencies
    skills: { 
        title: 'Skills & Competencies', 
        icon: 'fa-cogs', 
        isArray: true, 
        weight: 10,
        fields: [
            { id: 'category', label: 'Category', type: 'select', 
              options: ['Technical', 'Creative', 'Communication', 'Leadership', 'Personal', 'Physical', 'Language', 'Other'], weight: 1 },
            { id: 'skillName', label: 'Skill', type: 'text', weight: 3 },
            { id: 'proficiency', label: 'Proficiency Level', type: 'select', 
              options: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'], weight: 2 },
            { id: 'context', label: 'How You Use This Skill', type: 'textarea', weight: 2 }
        ]
    },
    
    // Projects & Portfolio
    projects: { 
        title: 'Creative Works & Projects', 
        icon: 'fa-lightbulb', 
        isArray: true, 
        weight: 8,
        fields: [
            { id: 'name', label: 'Project Name', type: 'text', weight: 3 },
            { id: 'type', label: 'Project Type', type: 'select', 
              options: ['Professional', 'Personal', 'Academic', 'Community', 'Artistic', 'Technical', 'Other'], weight: 1 },
            { id: 'description', label: 'Description', type: 'textarea', weight: 3 },
            { id: 'role', label: 'Your Role', type: 'text', weight: 2 },
            { id: 'technologies', label: 'Tools/Technologies Used', type: 'text', weight: 1 },
            { id: 'outcome', label: 'Outcome & Impact', type: 'textarea', weight: 2 },
            { id: 'url', label: 'Link/Portfolio URL', type: 'url', weight: 1 }
        ]
    },
    
    // Community & Social Impact
    community: { 
        title: 'Community & Social Impact', 
        icon: 'fa-hands-helping', 
        isArray: true, 
        weight: 8,
        fields: [
            { id: 'organization', label: 'Organization/Cause', type: 'text', weight: 3 },
            { id: 'role', label: 'Your Role', type: 'text', weight: 2 },
            { id: 'startDate', label: 'Start Date', type: 'month', weight: 1 },
            { id: 'endDate', label: 'End Date', type: 'month', weight: 1 },
            { id: 'contribution', label: 'Your Contribution', type: 'textarea', weight: 3 },
            { id: 'impact', label: 'Impact Created', type: 'textarea', weight: 3 }
        ]
    },
    
    // Interests & Hobbies
    interests: { 
        title: 'Hobbies & Interests', 
        icon: 'fa-palette', 
        isArray: true, 
        weight: 6,
        fields: [
            { id: 'category', label: 'Category', type: 'select', 
              options: ['Sports & Fitness', 'Arts & Crafts', 'Music', 'Reading & Writing', 'Technology', 'Travel', 'Cooking', 'Gaming', 'Nature & Outdoors', 'Community Service', 'Other'], weight: 1 },
            { id: 'interest', label: 'Interest/Hobby', type: 'text', weight: 2 },
            { id: 'level', label: 'Involvement Level', type: 'select', 
              options: ['Casual', 'Regular', 'Serious', 'Professional'], weight: 1 },
            { id: 'description', label: 'What This Means to You', type: 'textarea', weight: 2 }
        ]
    },
    
    // Digital Presence
    digital: { 
        title: 'Digital Presence & Social Media', 
        icon: 'fa-share-alt', 
        isArray: true, 
        weight: 5,
        fields: [
            { id: 'platform', label: 'Platform', type: 'text', weight: 1 },
            { id: 'username', label: 'Username/Handle', type: 'text', weight: 1 },
            { id: 'url', label: 'Profile URL', type: 'url', weight: 1 },
            { id: 'purpose', label: 'Purpose/Use', type: 'text', weight: 1 },
            { id: 'privacy', label: 'Privacy Level', type: 'select', 
              options: ['Public', 'Friends Only', 'Private', 'Professional'], weight: 1 }
        ]
    },
    
    // Life Milestones & Experiences
    milestones: { 
        title: 'Life Milestones & Experiences', 
        icon: 'fa-star', 
        isArray: true, 
        weight: 6,
        fields: [
            { id: 'title', label: 'Milestone/Experience', type: 'text', weight: 3 },
            { id: 'date', label: 'Date', type: 'date', weight: 1 },
            { id: 'category', label: 'Category', type: 'select', 
              options: ['Personal Achievement', 'Travel', 'Relationship', 'Career', 'Education', 'Health', 'Community', 'Spiritual', 'Other'], weight: 1 },
            { id: 'description', label: 'Description & Impact', type: 'textarea', weight: 3 },
            { id: 'lessons', label: 'Lessons Learned', type: 'textarea', weight: 2 }
        ]
    },
    
    // Travel & Cultural Experiences
    travel: { 
        title: 'Travel & Cultural Experiences', 
        icon: 'fa-globe', 
        isArray: true, 
        weight: 4,
        fields: [
            { id: 'destination', label: 'Destination', type: 'text', weight: 2 },
            { id: 'date', label: 'Date/Period', type: 'text', weight: 1 },
            { id: 'purpose', label: 'Purpose', type: 'select', 
              options: ['Leisure', 'Work', 'Study', 'Volunteer', 'Family', 'Spiritual', 'Adventure', 'Other'], weight: 1 },
            { id: 'experience', label: 'Key Experiences', type: 'textarea', weight: 2 },
            { id: 'cultural', label: 'Cultural Insights Gained', type: 'textarea', weight: 2 },
            { id: 'impact', label: 'How It Changed You', type: 'textarea', weight: 2 }
        ]
    },
    
    // Public Profiles Management
    publicProfiles: { 
        title: 'Public Profiles', 
        icon: 'fa-globe-americas', 
        isCustom: true,
        weight: 5
    },
    
    // Business Cards
    businessCards: { 
        title: 'Business Cards', 
        icon: 'fa-id-card', 
        isCustom: true,
        weight: 3
    },
    
    // Email Signatures
    emailSignatures: { 
        title: 'Email Signatures', 
        icon: 'fa-signature', 
        isCustom: true,
        weight: 2
    },
    
    // LifeSync
    lifeSync: { 
        title: 'LifeSync', 
        icon: 'fa-sync-alt', 
        isCustom: true,
        weight: 5
    }
};

// Public Profile Templates
const publicProfileTemplates = {
    professional: {
        name: 'Professional',
        description: 'Clean, corporate design for job applications and networking',
        sections: ['personal', 'professional', 'experience', 'education', 'skills', 'projects'],
        theme: 'corporate',
        preview: 'professional-preview.png'
    },
    creative: {
        name: 'Creative Portfolio',
        description: 'Vibrant design showcasing creative work and personality',
        sections: ['personal', 'projects', 'skills', 'interests', 'travel', 'milestones'],
        theme: 'artistic',
        preview: 'creative-preview.png'
    },
    holistic: {
        name: 'Life Story',
        description: 'Complete life journey for personal branding and community projects',
        sections: ['personal', 'philosophy', 'family', 'experience', 'education', 'community', 'interests', 'travel', 'milestones'],
        theme: 'comprehensive',
        preview: 'holistic-preview.png'
    },
    academic: {
        name: 'Academic Profile',
        description: 'Scholarly presentation for academic and research positions',
        sections: ['personal', 'education', 'experience', 'projects', 'skills', 'community'],
        theme: 'academic',
        preview: 'academic-preview.png'
    },
    community: {
        name: 'Community Leader',
        description: 'Emphasis on community impact and social contributions',
        sections: ['personal', 'philosophy', 'community', 'experience', 'skills', 'milestones', 'interests'],
        theme: 'community',
        preview: 'community-preview.png'
    }
};

// Business Card Templates
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

// Email Signature Templates
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

// LifeSync purposes
const lifeSyncPurposes = {
    business: {
        name: 'Business Compatibility',
        description: 'Assess professional alignment and collaboration potential',
        comparisonFields: ['professional', 'experience', 'skills', 'education', 'projects'],
        reportType: 'business'
    },
    romantic: {
        name: 'Romantic Interest',
        description: 'Explore compatibility for personal relationships',
        comparisonFields: ['philosophy', 'interests', 'milestones', 'travel', 'personal'],
        reportType: 'romantic'
    },
    family: {
        name: 'Family Relatedness',
        description: 'Discover potential family connections and shared heritage',
        comparisonFields: ['family', 'personal', 'travel', 'milestones'],
        reportType: 'family'
    },
    friendship: {
        name: 'Friendship Potential',
        description: 'Find common ground for meaningful friendships',
        comparisonFields: ['interests', 'philosophy', 'community', 'travel', 'milestones'],
        reportType: 'friendship'
    },
    mentorship: {
        name: 'Mentorship Alignment',
        description: 'Evaluate mentor-mentee compatibility',
        comparisonFields: ['professional', 'experience', 'skills', 'philosophy', 'education'],
        reportType: 'mentorship'
    }
};

// === INITIALIZATION & CORE FUNCTIONS ===

export function init(user) {
    if (!user) return;
    currentUser = user;
    console.log("LifeCV module initialized with enhanced features.");
    
    // Initialize all event listeners
    attachImportListeners();
    attachWebcamListeners();
    attachLifeSyncListeners();
    
    // Set up real-time data sync
    const userDocRef = doc(db, "users", currentUser.uid);
    onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const userData = docSnap.data();
            lifeCvData = userData.lifeCv || {};
            
            // Ensure email is always available
            if (!lifeCvData.personal) lifeCvData.personal = {};
            if (!lifeCvData.personal.email) {
                lifeCvData.personal.email = createFieldObject(currentUser.email, false, false);
            }
            
            // Migrate legacy data if needed
            migrateLegacyData();
            
            // Analyze and render
            analyzeCvCompleteness();
            renderAllSections();
            renderDashboard();
        }
    });
}

// Import camera and lifesync services
import CameraService from '../services/camera-service.js';
import { lifeSyncService } from '../services/lifesync-service.js';
import { generateQRCode } from '../utils/qr-code-generator.js';

// Initialize camera service
let cameraService = null;

function initializeCameraService() {
    if (!cameraService) {
        cameraService = new CameraService('webcam-video', 'capture-canvas');
    }
    return cameraService;
}

// === DATA MIGRATION & COMPATIBILITY ===

function migrateLegacyData() {
    let needsUpdate = false;
    
    Object.keys(lifeCvData).forEach(sectionKey => {
        const section = lifeCvData[sectionKey];
        const sectionConfig = lifeCvSections[sectionKey];
        
        if (!sectionConfig) return;
        
        if (sectionConfig.isArray && Array.isArray(section)) {
            // Migrate array items
            section.forEach(item => {
                if (sectionConfig.fields) {
                    sectionConfig.fields.forEach(field => {
                        if (item[field.id] && typeof item[field.id] !== 'object') {
                            item[field.id] = createFieldObject(
                                item[field.id], 
                                !field.sensitive, 
                                field.sensitive
                            );
                            needsUpdate = true;
                        }
                    });
                }
            });
        } else if (typeof section === 'object' && !section.value) {
            // Migrate simple object fields
            if (sectionConfig.fields) {
                sectionConfig.fields.forEach(field => {
                    if (section[field.id] && typeof section[field.id] !== 'object') {
                        section[field.id] = createFieldObject(
                            section[field.id], 
                            !field.sensitive, 
                            field.sensitive
                        );
                        needsUpdate = true;
                    }
                });
            }
        }
    });
    
    if (needsUpdate) {
        updateDocument('users', currentUser.uid, { 'lifeCv': lifeCvData });
    }
}

// === COMPLETENESS ANALYSIS & DASHBOARD ===

function analyzeCvCompleteness() {
    let totalPossibleScore = 0;
    let currentScore = 0;
    const recommendations = [];
    const sectionAnalysis = {};
    
    Object.keys(lifeCvSections).forEach(sectionKey => {
        const sectionConfig = lifeCvSections[sectionKey];
        const sectionData = lifeCvData[sectionKey];
        
        if (sectionConfig.isCustom) return; // Skip custom sections
        
        const sectionWeight = sectionConfig.weight || 1;
        totalPossibleScore += sectionWeight;
        
        let sectionScore = 0;
        let sectionCompleteness = 0;
        
        if (sectionConfig.isArray) {
            if (sectionData && Array.isArray(sectionData) && sectionData.length > 0) {
                sectionScore = Math.min(sectionWeight, sectionData.length * (sectionWeight / 5)); // Cap at full weight
                sectionCompleteness = Math.min(100, (sectionData.length / 3) * 100); // Assume 3 items is "complete"
            } else {
                recommendations.push({
                    section: sectionKey,
                    message: `Add some ${sectionConfig.title.toLowerCase()} to enhance your profile`,
                    priority: sectionWeight > 10 ? 'high' : 'medium',
                    action: 'add_items'
                });
            }
        } else if (sectionConfig.fields) {
            const filledFields = sectionConfig.fields.filter(field => {
                const fieldData = sectionData?.[field.id];
                return fieldData && fieldData.value && fieldData.value.trim() !== '';
            });
            
            sectionScore = (filledFields.length / sectionConfig.fields.length) * sectionWeight;
            sectionCompleteness = (filledFields.length / sectionConfig.fields.length) * 100;
            
            if (sectionCompleteness < 50) {
                recommendations.push({
                    section: sectionKey,
                    message: `Complete your ${sectionConfig.title.toLowerCase()} section`,
                    priority: sectionWeight > 15 ? 'high' : 'medium',
                    action: 'complete_section'
                });
            }
        }
        
        currentScore += sectionScore;
        sectionAnalysis[sectionKey] = {
            score: sectionScore,
            maxScore: sectionWeight,
            completeness: sectionCompleteness,
            status: sectionCompleteness > 80 ? 'complete' : sectionCompleteness > 40 ? 'partial' : 'empty'
        };
    });
    
    completenessScore = Math.round((currentScore / totalPossibleScore) * 100);
    
    // Sort recommendations by priority
    recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    analysisData = {
        completenessScore,
        totalSections: Object.keys(lifeCvSections).filter(key => !lifeCvSections[key].isCustom).length,
        completeSections: Object.values(sectionAnalysis).filter(s => s.status === 'complete').length,
        recommendations: recommendations.slice(0, 5), // Top 5 recommendations
        sectionAnalysis
    };
}

function renderDashboard() {
    const dashboardContainer = document.getElementById('lifecv-dashboard');
    if (!dashboardContainer) return;
    
    const { completenessScore, totalSections, completeSections, recommendations, sectionAnalysis } = analysisData;
    
    dashboardContainer.innerHTML = `
        <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white mb-6">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-bold mb-2">Your LifeCV Dashboard</h2>
                    <p class="text-indigo-100">Track your profile completeness and get personalized recommendations</p>
                </div>
                <div class="text-center">
                    <div class="relative inline-block">
                        <svg class="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="8" fill="transparent" class="text-indigo-300 opacity-30"/>
                            <circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="8" fill="transparent" 
                                    stroke-dasharray="${2 * Math.PI * 40}" 
                                    stroke-dashoffset="${2 * Math.PI * 40 * (1 - completenessScore / 100)}"
                                    class="text-white transition-all duration-1000"/>
                        </svg>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <span class="text-2xl font-bold">${completenessScore}%</span>
                        </div>
                    </div>
                    <div class="mt-2 text-sm text-indigo-100">Profile Complete</div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div class="bg-white bg-opacity-20 rounded-lg p-4">
                    <div class="text-2xl font-bold">${completeSections}</div>
                    <div class="text-sm text-indigo-100">Complete Sections</div>
                </div>
                <div class="bg-white bg-opacity-20 rounded-lg p-4">
                    <div class="text-2xl font-bold">${Object.keys(lifeCvData.publicProfiles?.profiles || {}).length || 0}</div>
                    <div class="text-sm text-indigo-100">Public Profiles</div>
                </div>
                <div class="bg-white bg-opacity-20 rounded-lg p-4">
                    <div class="text-2xl font-bold">${Object.keys(lifeCvData.lifeSync?.connections || {}).length || 0}</div>
                    <div class="text-sm text-indigo-100">LifeSync Connections</div>
                </div>
                <div class="bg-white bg-opacity-20 rounded-lg p-4 flex flex-col space-y-2">
                    <button onclick="exportLifeCvData()" class="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-colors">
                        <i class="fas fa-download mr-1"></i>Export
                    </button>
                    <label class="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded cursor-pointer transition-colors">
                        <i class="fas fa-upload mr-1"></i>Import
                        <input type="file" accept=".json" onchange="importLifeCvData(event)" class="hidden">
                    </label>
                </div>
            </div>
        </div>
        
        ${recommendations.length > 0 ? `
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 class="text-lg font-semibold text-slate-800 mb-4">
                    <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
                    Recommendations to Improve Your Profile
                </h3>
                <div class="space-y-3">
                    ${recommendations.map(rec => `
                        <div class="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                            <div class="flex items-center">
                                <div class="w-2 h-2 rounded-full mr-3 ${rec.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'}"></div>
                                <span class="text-slate-700">${rec.message}</span>
                            </div>
                            <button class="text-indigo-600 hover:text-indigo-800 text-sm font-medium" 
                                    onclick="scrollToSection('${rec.section}')">
                                Take Action
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${Object.keys(lifeCvSections).filter(key => !lifeCvSections[key].isCustom).map(sectionKey => {
                const config = lifeCvSections[sectionKey];
                const analysis = sectionAnalysis[sectionKey];
                if (!analysis) return '';
                
                return `
                    <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 ${
                        analysis.status === 'complete' ? 'border-green-500' : 
                        analysis.status === 'partial' ? 'border-yellow-500' : 'border-red-500'
                    }">
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="font-medium text-slate-800">${config.title}</h4>
                            <i class="fas ${config.icon} text-slate-400"></i>
                        </div>
                        <div class="w-full bg-slate-200 rounded-full h-2 mb-2">
                            <div class="h-2 rounded-full transition-all duration-500 ${
                                analysis.status === 'complete' ? 'bg-green-500' : 
                                analysis.status === 'partial' ? 'bg-yellow-500' : 'bg-red-500'
                            }" style="width: ${analysis.completeness}%"></div>
                        </div>
                        <div class="text-sm text-slate-600">${Math.round(analysis.completeness)}% complete</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function scrollToSection(sectionKey) {
    const sectionElement = document.querySelector(`[data-section="${sectionKey}"]`);
    if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Add a highlight effect
        sectionElement.classList.add('ring-2', 'ring-indigo-500', 'ring-opacity-50');
        setTimeout(() => {
            sectionElement.classList.remove('ring-2', 'ring-indigo-500', 'ring-opacity-50');
        }, 3000);
    }
}

// === MAIN RENDERING FUNCTIONS ===

function renderAllSections() {
    const container = document.getElementById('lifecv-container');
    if (!container) return;
    
    container.innerHTML = ''; // Clear previous content

    for (const key in lifeCvSections) {
        const section = lifeCvSections[key];
        const sectionData = lifeCvData[key] || (section.isArray ? [] : {});
        
        let sectionElement;
        
        if (section.isCustom) {
            switch (key) {
                case 'profilePictures':
                    sectionElement = createProfilePicturesSection(key, section, lifeCvData.profilePictures || {});
                    break;
                case 'contact':
                    sectionElement = createContactSection(key, section, lifeCvData.contact || {});
                    break;
                case 'family':
                    sectionElement = createFamilySection(key, section, sectionData);
                    break;
                case 'publicProfiles':
                    sectionElement = createPublicProfilesSection(key, section, lifeCvData.publicProfiles || {});
                    break;
                case 'businessCards':
                    sectionElement = createBusinessCardsSection(key, section, lifeCvData.businessCards || {});
                    break;
                case 'emailSignatures':
                    sectionElement = createEmailSignaturesSection(key, section, lifeCvData.emailSignatures || {});
                    break;
                case 'lifeSync':
                    sectionElement = createLifeSyncSection(key, section, lifeCvData.lifeSync || {});
                    break;
                default:
                    sectionElement = createStandardSection(key, section, sectionData);
            }
        } else {
            sectionElement = createStandardSection(key, section, sectionData);
        }
        
        if (sectionElement) {
            sectionElement.setAttribute('data-section', key);
            container.appendChild(sectionElement);
        }
    }
}

function createStandardSection(key, sectionConfig, sectionData) {
    const sectionWrapper = document.createElement('div');
    sectionWrapper.className = 'bg-white rounded-lg shadow-sm mb-4';

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
                ${getCompletenessIndicator(key)}
            </div>
            <i class="fas fa-chevron-down transform transition-transform"></i>
        </button>
        <div class="accordion-content">
            <div class="p-6 border-t border-slate-200">
                ${contentHtml}
                <div class="mt-4 text-right">
                    ${sectionConfig.isArray
                        ? `<button class="add-item-btn bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-indigo-700" data-section="${key}">
                             <i class="fas fa-plus mr-1"></i>Add New
                           </button>`
                        : `<button class="save-section-btn bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-indigo-700" data-section="${key}">
                             <i class="fas fa-save mr-1"></i>Save Changes
                           </button>`
                    }
                </div>
            </div>
        </div>
    `;

    // Attach event listeners
    sectionWrapper.querySelector('.accordion-toggle').addEventListener('click', toggleAccordion);
    
    if (sectionConfig.isArray) {
        sectionWrapper.querySelector('.add-item-btn').addEventListener('click', () => openModal(key));
        sectionWrapper.querySelectorAll('.edit-item-btn').forEach(btn => 
            btn.addEventListener('click', (e) => openModal(key, parseInt(e.currentTarget.dataset.index)))
        );
        sectionWrapper.querySelectorAll('.delete-item-btn').forEach(btn => 
            btn.addEventListener('click', (e) => deleteItem(key, parseInt(e.currentTarget.dataset.index)))
        );
    } else {
        sectionWrapper.querySelector('.save-section-btn').addEventListener('click', saveSection);
    }

    return sectionWrapper;
}

function getCompletenessIndicator(sectionKey) {
    const analysis = analysisData.sectionAnalysis?.[sectionKey];
    if (!analysis) return '';
    
    const color = analysis.status === 'complete' ? 'green' : 
                 analysis.status === 'partial' ? 'yellow' : 'red';
    
    return `<span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800">
        ${Math.round(analysis.completeness)}%
    </span>`;
}

// === CONTACT SECTION ===

function createContactSection(key, sectionConfig, data) {
    const sectionWrapper = document.createElement('div');
    sectionWrapper.className = 'bg-white rounded-lg shadow-sm mb-4';
    
    const contactData = data || { emails: [], phones: [], addresses: [] };
    
    sectionWrapper.innerHTML = `
        <button class="w-full flex justify-between items-center text-left p-4 accordion-toggle">
            <div class="flex items-center">
                <i class="fas ${sectionConfig.icon} w-6 text-center text-indigo-600"></i>
                <h2 class="text-lg font-bold text-slate-800 ml-3">${sectionConfig.title}</h2>
                <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ${Object.values(contactData).flat().length} items
                </span>
            </div>
            <i class="fas fa-chevron-down transform transition-transform"></i>
        </button>
        <div class="accordion-content">
            <div class="p-6 border-t border-slate-200">
                ${generateContactManagementHTML(contactData)}
            </div>
        </div>
    `;
    
    // Event listeners
    sectionWrapper.querySelector('.accordion-toggle').addEventListener('click', toggleAccordion);
    setupContactEventListeners(sectionWrapper);
    
    return sectionWrapper;
}

function generateContactManagementHTML(contactData) {
    return `
        <div class="space-y-8">
            ${Object.entries(lifeCvSections.contact.types).map(([type, config]) => {
                const items = contactData[type] || [];
                return `
                    <div class="contact-type-section" data-type="${type}">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-slate-800 flex items-center">
                                <i class="fas ${config.icon} mr-2 text-indigo-600"></i>
                                ${config.label}
                            </h3>
                            <button type="button" class="add-contact-btn px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200" 
                                    data-type="${type}">
                                <i class="fas fa-plus mr-1"></i>Add ${config.label.slice(0, -1)}
                            </button>
                        </div>
                        <div class="contact-items space-y-3" data-type="${type}">
                            ${items.length > 0 ? items.map((item, index) => generateContactItemHTML(type, item, index)).join('') : 
                              `<div class="text-sm text-slate-500 text-center py-4 border-2 border-dashed border-slate-200 rounded-lg">
                                 No ${config.label.toLowerCase()} added yet. Click "Add ${config.label.slice(0, -1)}" to get started.
                               </div>`}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function generateContactItemHTML(type, item, index) {
    const templates = {
        emails: {
            fields: [
                { id: 'value', label: 'Email Address', type: 'email' },
                { id: 'type', label: 'Type', type: 'select', options: ['Personal', 'Work', 'Business', 'Other'] },
                { id: 'primary', label: 'Primary Email', type: 'checkbox' }
            ]
        },
        phones: {
            fields: [
                { id: 'value', label: 'Phone Number', type: 'tel' },
                { id: 'type', label: 'Type', type: 'select', options: ['Mobile', 'Home', 'Work', 'Fax', 'Other'] },
                { id: 'countryCode', label: 'Country Code', type: 'text', placeholder: '+27' },
                { id: 'primary', label: 'Primary Phone', type: 'checkbox' }
            ]
        },
        addresses: {
            fields: [
                { id: 'type', label: 'Address Type', type: 'select', options: ['Home', 'Work', 'Postal', 'Temporary', 'Family', 'Weekend'] },
                { id: 'street', label: 'Street Address', type: 'text' },
                { id: 'city', label: 'City', type: 'text' },
                { id: 'province', label: 'Province/State', type: 'text' },
                { id: 'postalCode', label: 'Postal Code', type: 'text' },
                { id: 'country', label: 'Country', type: 'text' }
            ]
        }
    };
    
    const template = templates[type];
    const isAddress = type === 'addresses';
    
    return `
        <div class="contact-item border border-slate-200 rounded-lg p-4 ${isAddress ? 'bg-purple-50' : type === 'emails' ? 'bg-green-50' : 'bg-blue-50'}">
            <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-slate-800 flex items-center">
                    ${lifeCvSections.contact.types[type].label.slice(0, -1)} ${index + 1}
                    ${item.primary ? '<span class="ml-2 px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">Primary</span>' : ''}
                </h4>
                <div class="flex items-center space-x-2">
                    <button type="button" class="privacy-toggle-btn text-sm ${item.isPublic ? 'text-green-600' : 'text-slate-400'}" 
                            data-type="${type}" data-index="${index}" title="${item.isPublic ? 'Public' : 'Private'}">
                        <i class="fas ${item.isPublic ? 'fa-eye' : 'fa-eye-slash'}"></i>
                    </button>
                    <button type="button" class="edit-contact-btn text-indigo-600 hover:text-indigo-800" 
                            data-type="${type}" data-index="${index}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="delete-contact-btn text-red-600 hover:text-red-800" 
                            data-type="${type}" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="contact-display text-sm text-slate-700">
                ${type === 'emails' ? `
                    <div class="font-medium">${item.value || 'No email'}</div>
                    <div class="text-slate-500">${item.type || 'No type specified'}</div>
                ` : type === 'phones' ? `
                    <div class="font-medium">${item.countryCode || ''}${item.value || 'No phone'}</div>
                    <div class="text-slate-500">${item.type || 'No type specified'}</div>
                ` : `
                    <div class="font-medium">${item.type || 'Address'}</div>
                    <div class="text-slate-600">
                        ${[item.street, item.city, item.province, item.postalCode, item.country].filter(Boolean).join(', ') || 'No address details'}
                    </div>
                `}
            </div>
        </div>
    `;
}

function setupContactEventListeners(container) {
    // Add contact buttons
    container.querySelectorAll('.add-contact-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            openContactModal(type);
        });
    });
    
    // Edit contact buttons
    container.querySelectorAll('.edit-contact-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const index = parseInt(btn.dataset.index);
            openContactModal(type, index);
        });
    });
    
    // Delete contact buttons
    container.querySelectorAll('.delete-contact-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const index = parseInt(btn.dataset.index);
            deleteContactItem(type, index);
        });
    });
    
    // Privacy toggle buttons
    container.querySelectorAll('.privacy-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const index = parseInt(btn.dataset.index);
            toggleContactPrivacy(type, index);
        });
    });
}

function openContactModal(type, index = -1) {
    const isEditing = index > -1;
    const contactData = lifeCvData.contact || {};
    const items = contactData[type] || [];
    const item = isEditing ? items[index] : {};
    
    const templates = {
        emails: {
            fields: [
                { id: 'value', label: 'Email Address', type: 'email' },
                { id: 'type', label: 'Type', type: 'select', options: ['Personal', 'Work', 'Business', 'Other'] },
                { id: 'primary', label: 'Primary Email', type: 'checkbox' }
            ]
        },
        phones: {
            fields: [
                { id: 'value', label: 'Phone Number', type: 'tel' },
                { id: 'type', label: 'Type', type: 'select', options: ['Mobile', 'Home', 'Work', 'Fax', 'Other'] },
                { id: 'countryCode', label: 'Country Code', type: 'text', placeholder: '+27' },
                { id: 'primary', label: 'Primary Phone', type: 'checkbox' }
            ]
        },
        addresses: {
            fields: [
                { id: 'type', label: 'Address Type', type: 'select', options: ['Home', 'Work', 'Postal', 'Temporary', 'Family', 'Weekend'] },
                { id: 'street', label: 'Street Address', type: 'text' },
                { id: 'city', label: 'City', type: 'text' },
                { id: 'province', label: 'Province/State', type: 'text' },
                { id: 'postalCode', label: 'Postal Code', type: 'text' },
                { id: 'country', label: 'Country', type: 'text' }
            ]
        }
    };
    
    const template = templates[type];
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-slate-200">
                <h2 class="text-xl font-bold text-slate-800">
                    ${isEditing ? 'Edit' : 'Add'} ${lifeCvSections.contact.types[type].label.slice(0, -1)}
                </h2>
            </div>
            <div class="p-6">
                <form id="contact-form">
                    ${template.fields.map(field => `
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-slate-700 mb-1">${field.label}</label>
                            ${field.type === 'select' ? `
                                <select name="${field.id}" class="w-full px-3 py-2 border border-slate-300 rounded-md">
                                    <option value="">Select ${field.label}</option>
                                    ${field.options.map(option => `
                                        <option value="${option}" ${item[field.id] === option ? 'selected' : ''}>${option}</option>
                                    `).join('')}
                                </select>
                            ` : field.type === 'checkbox' ? `
                                <label class="flex items-center">
                                    <input type="checkbox" name="${field.id}" ${item[field.id] ? 'checked' : ''} class="mr-2">
                                    <span class="text-sm text-slate-600">Set as ${field.label.toLowerCase()}</span>
                                </label>
                            ` : `
                                <input type="${field.type}" name="${field.id}" 
                                       value="${item[field.id] || ''}" 
                                       placeholder="${field.placeholder || ''}"
                                       class="w-full px-3 py-2 border border-slate-300 rounded-md">
                            `}
                        </div>
                    `).join('')}
                    
                    <div class="mb-4 p-3 bg-slate-50 rounded-lg">
                        <label class="flex items-center">
                            <input type="checkbox" name="isPublic" ${item.isPublic ? 'checked' : ''} class="mr-2">
                            <span class="text-sm text-slate-700">Make this information public</span>
                        </label>
                        ${template.sensitive ? `
                            <p class="text-xs text-amber-600 mt-1">
                                <i class="fas fa-exclamation-triangle mr-1"></i>
                                This information is considered sensitive and requires confirmation to make public.
                            </p>
                        ` : ''}
                    </div>
                </form>
            </div>
            <div class="p-6 border-t border-slate-200 flex justify-end space-x-3">
                <button type="button" class="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300" 
                        onclick="this.closest('.fixed').remove()">Cancel</button>
                <button type="button" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700" 
                        onclick="saveContactItem('${type}', ${index})">Save</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

async function saveContactItem(type, index) {
    const form = document.getElementById('contact-form');
    const formData = new FormData(form);
    const config = lifeCvSections.contact.types[type];
    
    const itemData = {};
    for (const [key, value] of formData.entries()) {
        if (key === 'isPublic' || key === 'primary') {
            itemData[key] = formData.get(key) !== null;
        } else {
            itemData[key] = value;
        }
    }
    
    // Add metadata
    itemData.lastModified = new Date().toISOString();
    itemData.sensitive = config.sensitive || false;
    
    // Handle sensitive data confirmation
    if (itemData.isPublic && config.sensitive) {
        const confirmed = await confirmSensitiveDataSharing();
        if (!confirmed) {
            return;
        }
    }
    
    try {
        const currentContact = lifeCvData.contact || { emails: [], phones: [], addresses: [] };
        const items = currentContact[type] || [];
        
        // Handle primary selection
        if (itemData.primary) {
            items.forEach(item => item.primary = false);
        }
        
        if (index > -1) {
            items[index] = itemData;
        } else {
            items.push(itemData);
        }
        
        currentContact[type] = items;
        
        await updateDocument('users', currentUser.uid, { 'lifeCv.contact': currentContact });
        
        // Close modal and refresh
        document.querySelector('.fixed').remove();
        renderAllSections();
        
    } catch (error) {
        console.error('Error saving contact item:', error);
        alert('Failed to save contact information. Please try again.');
    }
}

async function deleteContactItem(type, index) {
    if (!confirm('Are you sure you want to delete this contact information?')) return;
    
    try {
        const currentContact = lifeCvData.contact || {};
        const items = currentContact[type] || [];
        
        items.splice(index, 1);
        currentContact[type] = items;
        
        await updateDocument('users', currentUser.uid, { 'lifeCv.contact': currentContact });
        renderAllSections();
        
    } catch (error) {
        console.error('Error deleting contact item:', error);
        alert('Failed to delete contact information. Please try again.');
    }
}

async function toggleContactPrivacy(type, index) {
    const currentContact = lifeCvData.contact || {};
    const items = currentContact[type] || [];
    const item = items[index];
    
    if (!item) return;
    
    const config = lifeCvSections.contact.types[type];
    
    if (!item.isPublic && config.sensitive) {
        const confirmed = await confirmSensitiveDataSharing();
        if (!confirmed) return;
    }
    
    item.isPublic = !item.isPublic;
    item.lastModified = new Date().toISOString();
    
    try {
        await updateDocument('users', currentUser.uid, { 'lifeCv.contact': currentContact });
        renderAllSections();
    } catch (error) {
        console.error('Error updating privacy:', error);
        alert('Failed to update privacy settings.');
    }
}

// === PROFILE PICTURES SECTION ===

function createProfilePicturesSection(key, sectionConfig, data) {
    const sectionWrapper = document.createElement('div');
    sectionWrapper.className = 'bg-white rounded-lg shadow-sm mb-4';
    const images = data.images || [];
    const primary = data.primary || (images.length > 0 ? images[0] : null);

    const galleryHtml = images.map(url => `
        <div class="relative group">
            <img src="${url}" class="w-24 h-24 rounded-md object-cover cursor-pointer profile-pic ${url === primary ? 'primary ring-2 ring-indigo-500' : ''}" data-url="${url}">
            <button class="delete-pic-btn absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" data-url="${url}">&times;</button>
            ${url === primary ? '<div class="absolute bottom-1 left-1 bg-indigo-600 text-white text-xs px-1 rounded">Primary</div>' : ''}
        </div>
    `).join('');

    sectionWrapper.innerHTML = `
        <button class="w-full flex justify-between items-center text-left p-4 accordion-toggle">
            <div class="flex items-center">
                <i class="fas ${sectionConfig.icon} w-6 text-center text-indigo-600"></i>
                <h2 class="text-lg font-bold text-slate-800 ml-3">${sectionConfig.title}</h2>
                <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ${images.length}/5
                </span>
            </div>
            <i class="fas fa-chevron-down transform transition-transform"></i>
        </button>
        <div class="accordion-content">
            <div class="p-6 border-t border-slate-200">
                <div class="profile-pic-gallery grid grid-cols-3 sm:grid-cols-5 gap-4 mb-6">
                    ${galleryHtml}
                </div>
                <div class="flex flex-wrap gap-3">
                    <label for="picture-upload" class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 cursor-pointer">
                        <i class="fas fa-upload mr-2"></i> Upload Picture
                    </label>
                    <button type="button" class="webcam-btn inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                        <i class="fas fa-camera mr-2"></i> Use Camera
                    </button>
                    <input type="file" id="picture-upload" accept="image/*" multiple class="hidden" />
                </div>
                ${images.length === 0 ? `
                    <div class="text-center py-8 text-slate-500">
                        <i class="fas fa-camera-retro text-4xl mb-4"></i>
                        <p>No profile pictures yet. Upload or capture your first photo!</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    // Event listeners
    sectionWrapper.querySelector('.accordion-toggle').addEventListener('click', toggleAccordion);
    
    const uploadInput = sectionWrapper.querySelector('#picture-upload');
    uploadInput.addEventListener('change', handlePictureUpload);
    
    sectionWrapper.querySelector('.webcam-btn').addEventListener('click', openWebcamModal);
    
    sectionWrapper.querySelectorAll('.profile-pic').forEach(img => {
        img.addEventListener('click', () => setPrimaryPicture(img.dataset.url));
    });
    
    sectionWrapper.querySelectorAll('.delete-pic-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deletePicture(btn.dataset.url);
        });
    });

    return sectionWrapper;
}

async function handlePictureUpload(event) {
    const files = Array.from(event.target.files);
    const existingImages = lifeCvData.profilePictures?.images || [];
    
    if (existingImages.length + files.length > 5) {
        alert('You can upload a maximum of 5 profile pictures.');
        return;
    }
    
    try {
        for (const file of files) {
            const fileName = `profile-pics/${currentUser.uid}/${Date.now()}-${file.name}`;
            const downloadURL = await uploadFile(fileName, file);
            
            if (!lifeCvData.profilePictures) {
                lifeCvData.profilePictures = { images: [], primary: null };
            }
            
            lifeCvData.profilePictures.images.push(downloadURL);
            
            // Set as primary if it's the first image
            if (!lifeCvData.profilePictures.primary) {
                lifeCvData.profilePictures.primary = downloadURL;
            }
        }
        
        await updateDocument('users', currentUser.uid, { 'lifeCv.profilePictures': lifeCvData.profilePictures });
        renderAllSections();
        
    } catch (error) {
        console.error('Error uploading pictures:', error);
        alert('Failed to upload pictures. Please try again.');
    }
}

async function setPrimaryPicture(url) {
    if (!lifeCvData.profilePictures) return;
    
    lifeCvData.profilePictures.primary = url;
    
    try {
        await updateDocument('users', currentUser.uid, { 'lifeCv.profilePictures': lifeCvData.profilePictures });
        renderAllSections();
    } catch (error) {
        console.error('Error setting primary picture:', error);
        alert('Failed to set primary picture.');
    }
}

async function deletePicture(url) {
    if (!confirm('Are you sure you want to delete this picture?')) return;
    
    try {
        await deleteFile(url);
        
        const images = lifeCvData.profilePictures.images.filter(img => img !== url);
        const primary = lifeCvData.profilePictures.primary === url ? 
                       (images.length > 0 ? images[0] : null) : 
                       lifeCvData.profilePictures.primary;
        
        lifeCvData.profilePictures = { images, primary };
        
        await updateDocument('users', currentUser.uid, { 'lifeCv.profilePictures': lifeCvData.profilePictures });
        renderAllSections();
        
    } catch (error) {
        console.error('Error deleting picture:', error);
        alert('Failed to delete picture.');
    }
}

// === WEBCAM FUNCTIONALITY ===

// Enhanced webcam modal with proper camera service integration
function openWebcamModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div class="p-6 border-b border-slate-200">
                <h2 class="text-xl font-bold text-slate-800">
                    <i class="fas fa-camera mr-2"></i>Take Profile Picture
                </h2>
            </div>
            <div class="p-6">
                <div class="relative bg-slate-100 rounded-lg overflow-hidden mb-4" id="camera-container">
                    <video id="webcam-video-modal" autoplay muted playsinline 
                           class="w-full h-64 object-cover rounded-lg"></video>
                    <canvas id="capture-canvas-modal" class="w-full h-64 object-cover rounded-lg hidden"></canvas>
                    
                    <!-- Camera controls overlay -->
                    <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                        <button id="capture-btn" 
                                class="bg-white bg-opacity-90 hover:bg-opacity-100 text-slate-800 px-4 py-2 rounded-full shadow-lg transition-all">
                            <i class="fas fa-camera"></i>
                        </button>
                        <button id="switch-camera-btn" 
                                class="bg-white bg-opacity-90 hover:bg-opacity-100 text-slate-800 px-4 py-2 rounded-full shadow-lg transition-all">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Photo preview area -->
                <div id="photo-preview" class="hidden">
                    <div class="relative">
                        <img id="captured-photo" class="w-full h-64 object-cover rounded-lg" src="">
                        <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                            <button onclick="retakePhoto()" 
                                    class="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-full shadow-lg transition-all">
                                <i class="fas fa-redo mr-2"></i>Retake
                            </button>
                            <button onclick="saveCapturedPhoto()" 
                                    class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-lg transition-all">
                                <i class="fas fa-check mr-2"></i>Use Photo
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Status messages -->
                <div id="camera-status" class="hidden mt-4 p-3 rounded-lg">
                    <p class="text-sm"></p>
                </div>
            </div>
            <div class="p-6 border-t border-slate-200 flex justify-end">
                <button type="button" onclick="closeWebcamModal()" 
                        class="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition-colors">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize camera
    initializeWebcam();
}

async function initializeWebcam() {
    const statusDiv = document.getElementById('camera-status');
    const videoElement = document.getElementById('webcam-video-modal');
    const captureBtn = document.getElementById('capture-btn');
    
    try {
        statusDiv.className = 'mt-4 p-3 rounded-lg bg-blue-50';
        statusDiv.innerHTML = '<p class="text-sm text-blue-800">Initializing camera...</p>';
        statusDiv.classList.remove('hidden');
        
        // Initialize camera service with modal elements
        cameraService = new CameraService('webcam-video-modal', 'capture-canvas-modal');
        await cameraService.start();
        
        statusDiv.classList.add('hidden');
        
        // Attach capture event
        captureBtn.addEventListener('click', capturePhoto);
        
    } catch (error) {
        console.error('Camera initialization failed:', error);
        statusDiv.className = 'mt-4 p-3 rounded-lg bg-red-50';
        statusDiv.innerHTML = `

            <p class="text-sm text-red-800">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                Camera access failed: ${error.message}
            </p>
        `;
        statusDiv.classList.remove('hidden');
    }
}

async function capturePhoto() {
    try {
        const blob = await cameraService.capture();
        
        // Convert blob to data URL for preview
        const reader = new FileReader();
        reader.onload = function(e) {
            const capturedPhoto = document.getElementById('captured-photo');
            capturedPhoto.src = e.target.result;
            
            // Store blob for later use
            window.capturedPhotoBlob = blob;
            
            // Show preview, hide camera
            document.getElementById('camera-container').classList.add('hidden');
            document.getElementById('photo-preview').classList.remove('hidden');
        };
        reader.readAsDataURL(blob);
        
    } catch (error) {
        console.error('Photo capture failed:', error);
        showNotification('Failed to capture photo. Please try again.', 'error');
    }
}

function retakePhoto() {
    // Hide preview, show camera
    document.getElementById('photo-preview').classList.add('hidden');
    document.getElementById('camera-container').classList.remove('hidden');
    
    // Clear stored blob
    window.capturedPhotoBlob = null;
}

async function saveCapturedPhoto() {
    if (!window.capturedPhotoBlob) {
        showNotification('No photo captured. Please take a photo first.', 'error');
        return;
    }
    
    try {
        const fileName = `profile-picture-${Date.now()}.png`;
        const downloadURL = await uploadFile(window.capturedPhotoBlob, `profile-pictures/${currentUser.uid}/${fileName}`);
        
        // Add to profile pictures
        if (!lifeCvData.profilePictures) {
            lifeCvData.profilePictures = { pictures: [], primaryPicture: null };
        }
        
        const newPicture = {
            id: Date.now().toString(),
            url: downloadURL,
            filename: fileName,
            uploadedAt: new Date().toISOString(),
            type: 'webcam'
        };
        
        lifeCvData.profilePictures.pictures.push(newPicture);
        
        // Set as primary if it's the first picture
        if (!lifeCvData.profilePictures.primaryPicture) {
            lifeCvData.profilePictures.primaryPicture = newPicture.id;
        }
        
        await updateDocument('users', currentUser.uid, { 'lifeCv.profilePictures': lifeCvData.profilePictures });
        
        closeWebcamModal();
        renderAllSections();
        showNotification('Profile picture saved successfully!', 'success');
        
    } catch (error) {
        console.error('Error saving photo:', error);
        showNotification('Failed to save photo. Please try again.', 'error');
    }
}

function closeWebcamModal() {
    // Stop camera stream
    if (cameraService) {
        cameraService.stop();
        cameraService = null;
    }
    
    // Remove modal
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
        modal.remove();
    }
    
    // Clear stored blob
    window.capturedPhotoBlob = null;
}

// === FAMILY SECTION WITH FAMILY HUB INTEGRATION ===

function createFamilySection(key, sectionConfig, data) {
    const sectionWrapper = document.createElement('div');
    sectionWrapper.className = 'bg-white rounded-lg shadow-sm mb-4';
    
    const familyData = Array.isArray(data) ? data : [];
    
    sectionWrapper.innerHTML = `
        <button class="w-full flex justify-between items-center text-left p-4 accordion-toggle">
            <div class="flex items-center">
                <i class="fas ${sectionConfig.icon} w-6 text-center text-indigo-600"></i>
                <h2 class="text-lg font-bold text-slate-800 ml-3">${sectionConfig.title}</h2>
                <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ${familyData.length} members
                </span>
            </div>
            <i class="fas fa-chevron-down transform transition-transform"></i>
        </button>
        <div class="accordion-content">
            <div class="p-6 border-t border-slate-200">
                <div class="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-lg font-semibold text-purple-800">Family Hub Integration</h3>
                        <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Coming Soon</span>
                    </div>
                    <p class="text-purple-700 text-sm mb-3">
                        Connect with family members who also have LifeCV profiles to create a shared family tree and sync important family information.
                    </p>
                    <button class="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50" disabled>
                        <i class="fas fa-link mr-2"></i>Connect to Family Hub
                    </button>
                </div>
                
                ${generateFamilyMembersHTML(familyData)}
                
                <div class="mt-6 text-right">
                    <button class="add-family-member-btn bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-indigo-700">
                        <i class="fas fa-plus mr-1"></i>Add Family Member
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Event listeners
    sectionWrapper.querySelector('.accordion-toggle').addEventListener('click', toggleAccordion);
    sectionWrapper.querySelector('.add-family-member-btn').addEventListener('click', () => openFamilyMemberModal());
    setupFamilyEventListeners(sectionWrapper);
    
    return sectionWrapper;
}

function generateFamilyMembersHTML(familyData) {
    if (familyData.length === 0) {
        return `
            <div class="text-center py-8 text-slate-500">
                <i class="fas fa-users text-4xl mb-4"></i>
                <p>No family members added yet. Start building your family tree!</p>
            </div>
        `;
    }
    
    // Group by relationship type
    const groupedFamily = familyData.reduce((groups, member, index) => {
        const relationship = member.relationship?.value || 'Other';
        if (!groups[relationship]) groups[relationship] = [];
        groups[relationship].push({...member, index});
        return groups;
    }, {});
    
    return `
        <div class="space-y-6">
            ${Object.entries(groupedFamily).map(([relationship, members]) => `
                <div class="family-group">
                    <h4 class="text-md font-semibold text-slate-700 mb-3 flex items-center">
                        <i class="fas fa-heart text-red-500 mr-2"></i>
                        ${relationship} (${members.length})
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${members.map(member => `
                            <div class="family-member-card border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                                <div class="flex items-center justify-between mb-3">
                                    <h5 class="font-medium text-slate-800">${member.name?.value || 'Unnamed'}</h5>
                                    <div class="flex items-center space-x-2">
                                        <button type="button" class="edit-family-btn text-indigo-600 hover:text-indigo-800" 
                                                data-index="${member.index}">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button type="button" class="delete-family-btn text-red-600 hover:text-red-800" 
                                                data-index="${member.index}">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="text-sm text-slate-600">
                                    <p class="mb-2">${member.significance?.value || 'No description provided'}</p>
                                    ${member.contact?.value ? `
                                        <p class="text-xs text-slate-500">
                                            <i class="fas fa-phone mr-1"></i>
                                            ${member.contact.isPublic ? member.contact.value : 'Contact info (private)'}
                                        </p>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function setupFamilyEventListeners(container) {
    container.querySelectorAll('.edit-family-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            openFamilyMemberModal(index);
        });
    });
    
    container.querySelectorAll('.delete-family-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            deleteFamilyMember(index);
        });
    });
}

function openFamilyMemberModal(index = -1) {
    const isEditing = index > -1;
    const familyData = lifeCvData.family || [];
    const member = isEditing ? familyData[index] : {};
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-slate-200">
                <h2 class="text-xl font-bold text-slate-800">
                    ${isEditing ? 'Edit' : 'Add'} Family Member
                </h2>
            </div>
            <div class="p-6">
                <form id="family-form">
                    ${lifeCvSections.family.fields.map(field => `
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-slate-700 mb-1">${field.label}</label>
                            ${field.type === 'select' ? `
                                <select name="${field.id}" class="w-full px-3 py-2 border border-slate-300 rounded-md">
                                    <option value="">Select ${field.label}</option>
                                    ${field.options.map(option => `
                                        <option value="${option}" ${member[field.id]?.value === option ? 'selected' : ''}>${option}</option>
                                    `).join('')}
                                </select>
                            ` : field.type === 'textarea' ? `
                                <textarea name="${field.id}" rows="3" 
                                          class="w-full px-3 py-2 border border-slate-300 rounded-md"
                                          placeholder="Enter ${field.label.toLowerCase()}">${member[field.id]?.value || ''}</textarea>
                            ` : `
                                <input type="${field.type}" name="${field.id}" 
                                       value="${member[field.id]?.value || ''}" 
                                       placeholder="Enter ${field.label.toLowerCase()}"
                                       class="w-full px-3 py-2 border border-slate-300 rounded-md">
                            `}
                            ${field.sensitive ? `
                                <div class="mt-2">
                                    <label class="flex items-center">
                                        <input type="checkbox" name="${field.id}_public" ${member[field.id]?.isPublic ? 'checked' : ''} class="mr-2">
                                        <span class="text-sm text-slate-600">Make this information public</span>
                                    </label>
                                    <p class="text-xs text-amber-600 mt-1">
                                        <i class="fas fa-exclamation-triangle mr-1"></i>
                                        This information is considered sensitive.
                                    </p>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </form>
            </div>
            <div class="p-6 border-t border-slate-200 flex justify-end space-x-3">
                <button type="button" class="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300" 
                        onclick="this.closest('.fixed').remove()">Cancel</button>
                <button type="button" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700" 
                        onclick="saveFamilyMember(${index})">Save</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

async function saveFamilyMember(index) {
    const form = document.getElementById('family-form');
    const formData = new FormData(form);
    
    const memberData = {};
    
    lifeCvSections.family.fields.forEach(field => {
        const value = formData.get(field.id);
        const isPublic = field.sensitive ? formData.get(`${field.id}_public`) !== null : true;
        
        if (value) {
            memberData[field.id] = createFieldObject(value, isPublic, field.sensitive);
        }
    });
    
    try {
        const currentFamily = lifeCvData.family || [];
        
        if (index > -1) {
            currentFamily[index] = memberData;
        } else {
            currentFamily.push(memberData);
        }
        
        await updateDocument('users', currentUser.uid, { 'lifeCv.family': currentFamily });
        
        document.querySelector('.fixed').remove();
        renderAllSections();
        
    } catch (error) {
        console.error('Error saving family member:', error);
        alert('Failed to save family member. Please try again.');
    }
}

async function deleteFamilyMember(index) {
    if (!confirm('Are you sure you want to remove this family member?')) return;
    
    try {
        const currentFamily = lifeCvData.family || {};
        currentFamily.splice(index, 1);
        
        await updateDocument('users', currentUser.uid, { 'lifeCv.family': currentFamily });
        renderAllSections();
        
    } catch (error) {
        console.error('Error deleting family member:', error);
        alert('Failed to remove family member. Please try again.');
    }
}

// === PUBLIC PROFILES SECTION ===

function createPublicProfilesSection(key, sectionConfig, data) {
    const sectionWrapper = document.createElement('div');
    sectionWrapper.className = 'bg-white rounded-lg shadow-sm mb-4';
    
    const profiles = data.profiles || {};
    const userSlug = data.slug || generateSlug(lifeCvData.personal?.fullName?.value || 'user');
    
    sectionWrapper.innerHTML = `
        <button class="w-full flex justify-between items-center text-left p-4 accordion-toggle">
            <div class="flex items-center">
                <i class="fas ${sectionConfig.icon} w-6 text-center text-indigo-600"></i>
                <h2 class="text-lg font-bold text-slate-800 ml-3">${sectionConfig.title}</h2>
                <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ${Object.keys(profiles).length}/5
                </span>
            </div>
            <i class="fas fa-chevron-down transform transition-transform"></i>
        </button>
        <div class="accordion-content">
            <div class="p-6 border-t border-slate-200">
                <div class="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <h3 class="text-lg font-semibold text-blue-800 mb-2">Your Public URL</h3>
                    <div class="flex items-center space-x-2">
                        <input type="text" value="https://hub.salatiso.com/profile/${userSlug}" 
                               readonly class="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-md text-sm">
                        <button onclick="copyToClipboard(this.previousElementSibling.value)" 
                                class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <p class="text-blue-700 text-sm mt-2">
                        Share this URL to let others view your public profiles.
                    </p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    ${Object.entries(publicProfileTemplates).map(([templateId, template]) => {
                        const isActive = profiles[templateId];
                        return `
                            <div class="profile-template-card border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow ${isActive ? 'ring-2 ring-indigo-500' : ''}">
                                <div class="flex items-center justify-between mb-3">
                                    <h4 class="font-semibold text-slate-800">${template.name}</h4>
                                    ${isActive ? '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>' : ''}
                                </div>
                                <p class="text-sm text-slate-600 mb-4">${template.description}</p>
                                <div class="flex space-x-2">
                                    <button onclick="configureProfile('${templateId}')" 
                                            class="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">
                                        ${isActive ? 'Edit' : 'Create'}
                                    </button>
                                    ${isActive ? `
                                        <button onclick="viewProfile('${templateId}')" 
                                                class="px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button onclick="deleteProfile('${templateId}')" 
                                                class="px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                ${Object.keys(profiles).length > 0 ? `
                    <div class="border-t border-slate-200 pt-6">
                        <h4 class="font-semibold text-slate-800 mb-4">Profile Analytics</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="bg-slate-50 p-4 rounded-lg">
                                <div class="text-2xl font-bold text-slate-800">0</div>
                                <div class="text-sm text-slate-600">Profile Views</div>
                            </div>
                            <div class="bg-slate-50 p-4 rounded-lg">
                                <div class="text-2xl font-bold text-slate-800">0</div>
                                <div class="text-sm text-slate-600">QR Code Scans</div>
                            </div>
                            <div class="bg-slate-50 p-4 rounded-lg">
                                <div class="text-2xl font-bold text-slate-800">0</div>
                                <div class="text-sm text-slate-600">Contact Downloads</div>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    sectionWrapper.querySelector('.accordion-toggle').addEventListener('click', toggleAccordion);
    
    return sectionWrapper;
}

function generateSlug(fullName) {
    const baseSlug = fullName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 30);
    
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${baseSlug}-${randomSuffix}`;
}

function configureProfile(templateId) {
    const template = publicProfileTemplates[templateId];
    const existingProfile = lifeCvData.publicProfiles?.profiles?.[templateId] || {};
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-slate-200">
                <h2 class="text-xl font-bold text-slate-800">Configure ${template.name} Profile</h2>
                <p class="text-slate-600 mt-1">${template.description}</p>
            </div>
            <div class="p-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h3 class="text-lg font-semibold text-slate-800 mb-4">Select Sections to Include</h3>
                        <div class="space-y-3">
                            ${template.sections.map(sectionKey => {
                                const sectionConfig = lifeCvSections[sectionKey];
                                if (!sectionConfig) return '';
                                
                                const isIncluded = existingProfile.includedSections?.includes(sectionKey) ?? true;
                                return `
                                    <label class="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                                        <input type="checkbox" class="section-checkbox mr-3" 
                                               data-section="${sectionKey}" ${isIncluded ? 'checked' : ''}>
                                        <div class="flex-1">
                                            <div class="flex items-center">
                                                <i class="fas ${sectionConfig.icon} text-indigo-600 mr-2"></i>
                                                <span class="font-medium text-slate-800">${sectionConfig.title}</span>
                                            </div>
                                            <div class="text-sm text-slate-600 mt-1">
                                                Include your ${sectionConfig.title.toLowerCase()} information
                                            </div>
                                        </div>
                                    </label>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-slate-800 mb-4">Customization Options</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Profile Title</label>
                                <input type="text" id="profile-title" 
                                       value="${existingProfile.title || template.name + ' Profile'}"
                                       class="w-full px-3 py-2 border border-slate-300 rounded-md">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Theme Color</label>
                                <select id="profile-theme" class="w-full px-3 py-2 border border-slate-300 rounded-md">
                                    <option value="indigo" ${existingProfile.theme === 'indigo' ? 'selected' : ''}>Indigo</option>
                                    <option value="blue" ${existingProfile.theme === 'blue' ? 'selected' : ''}>Blue</option>
                                    <option value="green" ${existingProfile.theme === 'green' ? 'selected' : ''}>Green</option>
                                    <option value="purple" ${existingProfile.theme === 'purple' ? 'selected' : ''}>Purple</option>
                                    <option value="red" ${existingProfile.theme === 'red' ? 'selected' : ''}>Red</option>
                                </select>
                            </div>
                            <div>
                                <label class="flex items-center">
                                    <input type="checkbox" id="include-photo" 
                                           ${existingProfile.includePhoto !== false ? 'checked' : ''} class="mr-2">
                                    <span class="text-sm text-slate-700">Include profile photo</span>
                                </label>
                            </div>
                            <div>
                                <label class="flex items-center">
                                    <input type="checkbox" id="include-contact" 
                                           ${existingProfile.includeContact !== false ? 'checked' : ''} class="mr-2">
                                    <span class="text-sm text-slate-700">Include contact information</span>
                                </label>
                            </div>
                            <div>
                                <label class="flex items-center">
                                    <input type="checkbox" id="include-social" 
                                           ${existingProfile.includeSocial !== false ? 'checked' : ''} class="mr-2">
                                    <span class="text-sm text-slate-700">Include social media links</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-6 border-t border-slate-200 flex justify-end space-x-3">
                <button type="button" class="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300" 
                        onclick="this.closest('.fixed').remove()">Cancel</button>
                <button type="button" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700" 
                        onclick="saveProfileConfiguration('${templateId}')">Save Profile</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

async function saveProfileConfiguration(templateId) {
    const modal = document.querySelector('.fixed');
    const includedSections = Array.from(modal.querySelectorAll('.section-checkbox:checked'))
                                  .map(cb => cb.dataset.section);
    
    const profileConfig = {
        templateId,
        title: modal.querySelector('#profile-title').value,
        theme: modal.querySelector('#profile-theme').value,
        includePhoto: modal.querySelector('#include-photo').checked,
        includeContact: modal.querySelector('#include-contact').checked,
        includeSocial: modal.querySelector('#include-social').checked,
        includedSections,
        lastModified: new Date().toISOString(),
        isActive: true
    };
    
    try {
        if (!lifeCvData.publicProfiles) {
            lifeCvData.publicProfiles = { 
                profiles: {}, 
                slug: generateSlug(lifeCvData.personal?.fullName?.value || 'user') 
            };
        }
        
        lifeCvData.publicProfiles.profiles[templateId] = profileConfig;
        
        await updateDocument('users', currentUser.uid, { 'lifeCv.publicProfiles': lifeCvData.publicProfiles });
        
        modal.remove();
        renderAllSections();
        
        // Show success message
        showNotification('Profile saved successfully!', 'success');
        
    } catch (error) {
        console.error('Error saving profile configuration:', error);
        alert('Failed to save profile. Please try again.');
    }
}

function viewProfile(templateId) {
    const slug = lifeCvData.publicProfiles?.slug || 'preview';
    window.open(`https://hub.salatiso.com/profile/${slug}?template=${templateId}`, '_blank');
}

async function deleteProfile(templateId) {
    if (!confirm('Are you sure you want to delete this profile? This action cannot be undone.')) return;
    
    try {
        if (lifeCvData.publicProfiles?.profiles) {
            delete lifeCvData.publicProfiles.profiles[templateId];
            
            await updateDocument('users', currentUser.uid, { 'lifeCv.publicProfiles': lifeCvData.publicProfiles });
            renderAllSections();
            
            showNotification('Profile deleted successfully!', 'success');
        }
    } catch (error) {
        console.error('Error deleting profile:', error);
        alert('Failed to delete profile. Please try again.');
    }
}

// === BUSINESS CARDS SECTION ===

function createBusinessCardsSection(key, sectionConfig, data) {
    const sectionWrapper = document.createElement('div');
    sectionWrapper.className = 'bg-white rounded-lg shadow-sm mb-4';
    
    const cards = data.cards || {};
    
    sectionWrapper.innerHTML = `
        <button class="w-full flex justify-between items-center text-left p-4 accordion-toggle">
            <div class="flex items-center">
                <i class="fas ${sectionConfig.icon} w-6 text-center text-indigo-600"></i>
                <h2 class="text-lg font-bold text-slate-800 ml-3">${sectionConfig.title}</h2>
                <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ${Object.keys(cards).length}/5
                </span>
            </div>
            <i class="fas fa-chevron-down transform transition-transform"></i>
        </button>
        <div class="accordion-content">
            <div class="p-6 border-t border-slate-200">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    ${Object.entries(businessCardTemplates).map(([templateId, template]) => {
                        const isActive = cards[templateId];
                        return `
                            <div class="card-template border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow ${isActive ? 'ring-2 ring-indigo-500' : ''}">
                                <div class="flex items-center justify-between mb-3">
                                    <h4 class="font-semibold text-slate-800">${template.name}</h4>
                                    <span class="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">${template.orientation}</span>
                                </div>
                                <div class="mb-3">
                                    <div class="w-full h-24 bg-slate-100 rounded-lg flex items-center justify-center">
                                        <span class="text-slate-500 text-sm">Signature Preview</span>
                                    </div>
                                </div>
                                <p class="text-sm text-slate-600 mb-4">${template.description}</p>
                                <div class="flex space-x-2">
                                    <button onclick="configureBusinessCard('${templateId}')" 
                                            class="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">
                                        ${isActive ? 'Edit' : 'Create'}
                                    </button>
                                    ${isActive ? `
                                        <button onclick="downloadBusinessCard('${templateId}')" 
                                                class="px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
                                            <i class="fas fa-download"></i>
                                        </button>
                                        <button onclick="deleteBusinessCard('${templateId}')" 
                                                class="px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                ${Object.keys(cards).length > 0 ? `
                    <div class="border-t border-slate-200 pt-6">
                        <h4 class="font-semibold text-slate-800 mb-4">Quick Actions</h4>
                        <div class="flex flex-wrap gap-3">
                            <button onclick="downloadAllBusinessCards()" 
                                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                <i class="fas fa-download mr-2"></i>Download All Cards
                            </button>
                            <button onclick="shareBusinessCards()" 
                                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                <i class="fas fa-share mr-2"></i>Share Collection
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    sectionWrapper.querySelector('.accordion-toggle').addEventListener('click', toggleAccordion);
    
    return sectionWrapper;
}

function configureBusinessCard(templateId) {
    const template = businessCardTemplates[templateId];
    const existingCard = lifeCvData.businessCards?.cards?.[templateId] || {};
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-slate-200">
                <h2 class="text-xl font-bold text-slate-800">Configure ${template.name}</h2>
                <p class="text-slate-600 mt-1">${template.description}</p>
            </div>
            <div class="p-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h3 class="text-lg font-semibold text-slate-800 mb-4">Card Information</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Card Title</label>
                                <input type="text" id="card-title" 
                                       value="${existingCard.title || ''}"
                                       placeholder="e.g., Professional Network Card"
                                       class="w-full px-3 py-2 border border-slate-300 rounded-md">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Tagline/Position</label>
                                <input type="text" id="card-tagline" 
                                       value="${existingCard.tagline || ''}"
                                       placeholder="e.g., Senior Developer & Tech Lead"
                                       class="w-full px-3 py-2 border border-slate-300 rounded-md">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Company/Organization</label>
                                <input type="text" id="card-company" 
                                       value="${existingCard.company || ''}"
                                       placeholder="Your company or organization"
                                       class="w-full px-3 py-2 border border-slate-300 rounded-md">
                            </div>
                        </div>
                        
                        <h3 class="text-lg font-semibold text-slate-800 mb-4 mt-6">Design Options</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Color Scheme</label>
                                <select id="card-color" class="w-full px-3 py-2 border border-slate-300 rounded-md">
                                    <option value="blue" ${existingCard.colorScheme === 'blue' ? 'selected' : ''}>Professional Blue</option>
                                    <option value="gray" ${existingCard.colorScheme === 'gray' ? 'selected' : ''}>Classic Gray</option>
                                    <option value="green" ${existingCard.colorScheme === 'green' ? 'selected' : ''}>Nature Green</option>
                                    <option value="purple" ${existingCard.colorScheme === 'purple' ? 'selected' : ''}>Creative Purple</option>
                                    <option value="black" ${existingCard.colorScheme === 'black' ? 'selected' : ''}>Elegant Black</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Font Style</label>
                                <select id="card-font" class="w-full px-3 py-2 border border-slate-300 rounded-md">
                                    <option value="default" ${existingCard.font === 'default' ? 'selected' : ''}>Default</option>
                                    <option value="arial" ${existingCard.font === 'arial' ? 'selected' : ''}>Arial</option>
                                    <option value="times" ${existingCard.font === 'times' ? 'selected' : ''}>Times New Roman</option>
                                    <option value="courier" ${existingCard.font === 'courier' ? 'selected' : ''}>Courier New</option>
                                    <option value="georgia" ${existingCard.font === 'georgia' ? 'selected' : ''}>Georgia</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Font Size</label>
                                <input type="number" id="card-fontsize" min="8" max="24" step="1" 
                                       value="${existingCard.fontSize || 12}"
                                       class="w-full px-3 py-2 border border-slate-300 rounded-md">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Signature Color</label>
                                <input type="color" id="card-color" 
                                       value="${existingCard.color || '#000000'}"
                                       class="w-full h-10 p-0 border border-slate-300 rounded-md">
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-slate-800 mb-4">Contact Information</h3>
                        <div class="space-y-3">
                            <label class="flex items-center p-3 border border-slate-200 rounded-lg">
                                <input type="checkbox" class="contact-field mr-3" data-field="email" 
                                       ${existingCard.contactFields?.includes('email') !== false ? 'checked' : ''}>
                                <span class="text-sm text-slate-700">Email Address</span>
                            </label>
                            <label class="flex items-center p-3 border border-slate-200 rounded-lg">
                                <input type="checkbox" class="contact-field mr-3" data-field="phone" 
                                       ${existingCard.contactFields?.includes('phone') !== false ? 'checked' : ''}>
                                <span class="text-sm text-slate-700">Phone Number</span>
                            </label>
                            <label class="flex items-center p-3 border border-slate-200 rounded-lg">
                                <input type="checkbox" class="contact-field mr-3" data-field="website" 
                                       ${existingCard.contactFields?.includes('website') ? 'checked' : ''}>
                                <span class="text-sm text-slate-700">Website/Portfolio</span>
                            </label>
                            <label class="flex items-center p-3 border border-slate-200 rounded-lg">
                                <input type="checkbox" class="contact-field mr-3" data-field="address" 
                                       ${existingCard.contactFields?.includes('address') ? 'checked' : ''}>
                                <span class="text-sm text-slate-700">Business Address</span>
                            </label>
                        </div>
                        
                        <div class="mt-6 p-4 bg-slate-50 rounded-lg">
                            <h4 class="font-medium text-slate-800 mb-2">Preview</h4>
                            <div class="bg-white border rounded-lg p-4 text-center">
                                <div class="text-lg font-bold text-slate-800">Business Card Preview</div>
                                <div class="text-sm text-slate-600 mt-1">${template.orientation} • ${template.dimensions.width} × ${template.dimensions.height}</div>
                                <div class="text-xs text-slate-500 mt-2">Live preview coming soon</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-6 border-t border-slate-200 flex justify-end space-x-3">
                <button type="button" class="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300" 
                        onclick="this.closest('.fixed').remove()">Cancel</button>
                <button type="button" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700" 
                        onclick="saveBusinessCard('${templateId}')">Save Card</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

async function saveBusinessCard(templateId) {
    const modal = document.querySelector('.fixed');
    const contactFields = Array.from(modal.querySelectorAll('.contact-field:checked'))
                               .map(cb => cb.dataset.field);
    
    const cardConfig = {
        templateId,
        title: modal.querySelector('#card-title').value,
        tagline: modal.querySelector('#card-tagline').value,
        company: modal.querySelector('#card-company').value,
        colorScheme: modal.querySelector('#card-color').value,
        includePhoto: modal.querySelector('#card-include-photo').checked,
        includeQR: modal.querySelector('#card-include-qr').checked,
        contactFields,
        lastModified: new Date().toISOString(),
        isActive: true
    };
    
    try {
        if (!lifeCvData.businessCards) {
            lifeCvData.businessCards = { cards: {} };
        }
        
        lifeCvData.businessCards.cards[templateId] = cardConfig;
        
        await updateDocument('users', currentUser.uid, { 'lifeCv.businessCards': lifeCvData.businessCards });
        
        modal.remove();
        renderAllSections();
        
        showNotification('Business card saved successfully!', 'success');
        
    } catch (error) {
        console.error('Error saving business card:', error);
        alert('Failed to save business card. Please try again.');
    }
}

function downloadBusinessCard(templateId) {
    // This would integrate with a PDF generation service
    showNotification('Business card download will be available soon!', 'info');
}

function downloadAllBusinessCards() {
    showNotification('Bulk download will be available soon!', 'info');
}

function shareBusinessCards() {
    const url = `${window.location.origin}/cards/${lifeCvData.publicProfiles?.slug || 'user'}`;
    copyToClipboard(url);
    showNotification('Business cards URL copied to clipboard!', 'success');
}

async function deleteBusinessCard(templateId) {
    if (!confirm('Are you sure you want to delete this business card?')) return;
    
    try {
        if (lifeCvData.businessCards?.cards) {
            delete lifeCvData.businessCards.cards[templateId];
            
            await updateDocument('users', currentUser.uid, { 'lifeCv.businessCards': lifeCvData.businessCards });
            renderAllSections();
            
            showNotification('Business card deleted successfully!', 'success');
        }
    } catch (error) {
        console.error('Error deleting business card:', error);
        alert('Failed to delete business card. Please try again.');
    }
}

// === EMAIL SIGNATURES SECTION ===

function createEmailSignaturesSection(key, sectionConfig, data) {
    const sectionWrapper = document.createElement('div');
    sectionWrapper.className = 'bg-white rounded-lg shadow-sm mb-4';
    
    const signatures = data.signatures || {};
    
    sectionWrapper.innerHTML = `
        <button class="w-full flex justify-between items-center text-left p-4 accordion-toggle">
            <div class="flex items-center">
                <i class="fas ${sectionConfig.icon} w-6 text-center text-indigo-600"></i>
                <h2 class="text-lg font-bold text-slate-800 ml-3">${sectionConfig.title}</h2>
                <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ${Object.keys(signatures).length}/5
                </span>
            </div>
            <i class="fas fa-chevron-down transform transition-transform"></i>
        </button>
        <div class="accordion-content">
            <div class="p-6 border-t border-slate-200">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    ${Object.entries(emailSignatureTemplates).map(([templateId, template]) => {
                        const isActive = signatures[templateId];
                        return `
                            <div class="signature-template border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow ${isActive ? 'ring-2 ring-indigo-500' : ''}">
                                <div class="flex items-center justify-between mb-3">
                                    <h4 class="font-semibold text-slate-800">${template.name}</h4>
                                    ${isActive ? '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>' : ''}
                                </div>
                                <div class="mb-3">
                                    <div class="w-full h-24 bg-slate-100 rounded-lg flex items-center justify-center">
                                        <span class="text-slate-500 text-sm">Signature Preview</span>
                                    </div>
                                </div>
                                <p class="text-sm text-slate-600 mb-4">${template.description}</p>
                                <div class="flex space-x-2">
                                    <button onclick="configureEmailSignature('${templateId}')" 
                                            class="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">
                                        ${isActive ? 'Edit' : 'Create'}
                                    </button>
                                    ${isActive ? `
                                        <button onclick="copyEmailSignature('${templateId}')" 
                                                class="px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
                                            <i class="fas fa-copy"></i>
                                        </button>
                                        <button onclick="deleteEmailSignature('${templateId}')" 
                                                class="px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                ${Object.keys(signatures).length > 0 ? `
                    <div class="border-t border-slate-200 pt-6">
                        <h4 class="font-semibold text-slate-800 mb-4">Usage Instructions</h4>
                        <div class="bg-blue-50 p-4 rounded-lg">
                            <div class="flex items-start">
                                <i class="fas fa-info-circle text-blue-600 mt-1 mr-3"></i>
                                <div class="text-sm text-blue-800">
                                    <p class="font-medium mb-2">How to use your email signatures:</p>
                                    <ol class="list-decimal list-inside space-y-1">
                                        <li>Click the copy button on any signature</li>
                                        <li>Open your email client settings</li>
                                        <li>Navigate to signature settings</li>
                                        <li>Paste your signature into the signature field</li>
                                        <li>Save your settings</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    sectionWrapper.querySelector('.accordion-toggle').addEventListener('click', toggleAccordion);
    
    return sectionWrapper;
}

function configureEmailSignature(templateId) {
    const template = emailSignatureTemplates[templateId];
    const existingSignature = lifeCvData.emailSignatures?.signatures?.[templateId] || {};
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-slate-200">
                <h2 class="text-xl font-bold text-slate-800">Configure ${template.name}</h2>
                <p class="text-slate-600 mt-1">${template.description}</p>
            </div>
            <div class="p-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h3 class="text-lg font-semibold text-slate-800 mb-4">Signature Content</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Sign-off Message</label>
                                <input type="text" id="signature-signoff" 
                                       value="${existingSignature.signoff || 'Best regards,'}"
                                       placeholder="e.g., Best regards, Sincerely,"
                                       class="w-full px-3 py-2 border border-slate-300 rounded-md">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Disclaimer Text (Optional)</label>
                                <textarea id="signature-disclaimer" rows="3" 
                                          placeholder="Add any legal disclaimers or confidentiality notices"
                                          class="w-full px-3 py-2 border border-slate-300 rounded-md">${existingSignature.disclaimer || ''}</textarea>
                            </div>
                        </div>
                        
                        <h3 class="text-lg font-semibold text-slate-800 mb-4 mt-6">Design Options</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Font Style</label>
                                <select id="signature-font" class="w-full px-3 py-2 border border-slate-300 rounded-md">
                                    <option value="default" ${existingSignature.font === 'default' ? 'selected' : ''}>Default</option>
                                    <option value="arial" ${existingSignature.font === 'arial' ? 'selected' : ''}>Arial</option>
                                    <option value="times" ${existingSignature.font === 'times' ? 'selected' : ''}>Times New Roman</option>
                                    <option value="courier" ${existingSignature.font === 'courier' ? 'selected' : ''}>Courier New</option>
                                    <option value="georgia" ${existingSignature.font === 'georgia' ? 'selected' : ''}>Georgia</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Font Size</label>
                                <input type="number" id="signature-fontsize" min="8" max="24" step="1" 
                                       value="${existingSignature.fontSize || 12}"
                                       class="w-full px-3 py-2 border border-slate-300 rounded-md">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Signature Color</label>
                                <input type="color" id="signature-color" 
                                       value="${existingSignature.color || '#000000'}"
                                       class="w-full h-10 p-0 border border-slate-300 rounded-md">
                            </div>
                            <div class="space-y-2">
                                <label class="flex items-center">
                                    <input type="checkbox" id="include-photo" ${existingSignature.includePhoto !== false ? 'checked' : ''} class="mr-2">
                                    <span class="text-sm text-slate-700">Include profile photo</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" id="include-contact" ${existingSignature.includeContact !== false ? 'checked' : ''} class="mr-2">
                                    <span class="text-sm text-slate-700">Include contact information</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" id="include-social" ${existingSignature.includeSocial !== false ? 'checked' : ''} class="mr-2">
                                    <span class="text-sm text-slate-700">Include social media links</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-slate-800 mb-4">Preview</h3>
                        <div class="bg-slate-50 p-4 rounded-lg border">
                            <div class="bg-white p-4 rounded-lg shadow">
                                <div class="text-lg font-bold text-slate-800 mb-2" id="preview-signoff">${existingSignature.signoff || 'Best regards,'}</div>
                                <div class="text-sm text-slate-600 mb-4" id="preview-disclaimer">${existingSignature.disclaimer || ''}</div>
                                <div class="flex items-center mb-2">
                                    <img src="${currentUser.photoURL || '/assets/images/default-profile.png'}"
                                         class="w-16 h-16 rounded-full border-2 border-indigo-500 mr-4" 
                                         id="preview-photo">
                                    <div class="text-sm text-slate-700" id="preview-contact">
                                        <div><strong>${lifeCvData.personal?.fullName?.value || 'Your Name'}</strong></div>
                                        <div>${lifeCvData.personal?.email?.value || currentUser.email}</div>
                                        <div>Your Company</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-6 border-t border-slate-200 flex justify-end space-x-3">
                <button type="button" class="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300" 
                        onclick="this.closest('.fixed').remove()">Cancel</button>
                <button type="button" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700" 
                        onclick="saveEmailSignature('${templateId}')">Save Signature</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Privacy confirmation for sensitive data
async function confirmSensitiveDataSharing() {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div class="p-6 border-b border-slate-200">
                    <h2 class="text-xl font-bold text-red-800">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        Sensitive Information Warning
                    </h2>
                </div>
                <div class="p-6">
                    <p class="text-slate-700 mb-4">
                        You are about to make sensitive personal information public. This action should be carefully considered.
                    </p>
                    <p class="text-slate-600 text-sm mb-4">
                        To confirm, please type your full name exactly as it appears in your profile:
                    </p>
                    <p class="font-medium text-slate-800 mb-2">"${lifeCvData.personal?.fullName?.value || 'Unknown'}"</p>
                    <input type="text" id="confirmation-input" 
                           class="w-full px-3 py-2 border border-slate-300 rounded-md"
                           placeholder="Type your full name here">
                    <div id="confirmation-error" class="hidden mt-2 text-sm text-red-600">
                        The name you entered doesn't match. Please try again.
                    </div>
                </div>
                <div class="p-6 border-t border-slate-200 flex justify-end space-x-3">
                    <button type="button" class="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300" 
                            onclick="this.closest('.fixed').remove(); window.confirmResolve(false)">Cancel</button>
                    <button type="button" id="confirm-btn" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                        Confirm & Make Public
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        window.confirmResolve = resolve;
        
        const confirmBtn = modal.querySelector('#confirm-btn');
        const input = modal.querySelector('#confirmation-input');
        const errorDiv = modal.querySelector('#confirmation-error');
        
        confirmBtn.addEventListener('click', () => {
            const enteredName = input.value.trim();
            const expectedName = lifeCvData.personal?.fullName?.value || '';
            
            if (enteredName === expectedName) {
                modal.remove();
                delete window.confirmResolve;
                resolve(true);
            } else {
                errorDiv.classList.remove('hidden');
                input.focus();
            }
        });
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                confirmBtn.click();
            }
        });
    });
}

// Copy to clipboard utility
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Copied to clipboard!', 'success');
        }).catch(() => {
            fallbackCopyTextToClipboard(text);
        });
    } else {
        fallbackCopyTextToClipboard(text);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('Copied to clipboard!', 'success');
    } catch (err) {
        showNotification('Failed to copy to clipboard', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Accordion toggle functionality
function toggleAccordion(event) {
    const button = event.currentTarget;
    const content = button.nextElementSibling;
    const chevron = button.querySelector('i:last-child');
    
    if (content.style.display === 'none' || !content.style.display) {
        content.style.display = 'block';
        chevron.classList.add('rotate-180');
    } else {
        content.style.display = 'none';
        chevron.classList.remove('rotate-180');
    }
}

// === NOTIFICATION SYSTEM ===
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.lifecycle-notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `lifecycle-notification fixed top-4 right-4 z-[60] px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    
    const typeStyles = {
        success: 'bg-green-600 text-white',
        error: 'bg-red-600 text-white',
        warning: 'bg-yellow-600 text-white',
        info: 'bg-blue-600 text-white'
    };
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    notification.className += ` ${typeStyles[type] || typeStyles.info}`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${icons[type] || icons.info} mr-3"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Create form fields for standard sections
function createFormFieldsHtml(sectionKey, fields, sectionData) {
    if (!fields) return '<p class="text-slate-500">No fields configured for this section.</p>';
    
    return fields.map(field => {
        const fieldData = sectionData[field.id] || createFieldObject('', !field.sensitive, field.sensitive);
        const value = fieldData.value || '';
        const isPublic = fieldData.isPublic || false;
        
        return `
            <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                    <label class="block text-sm font-medium text-slate-700">${field.label}</label>
                    <div class="flex items-center space-x-2">
                        ${field.sensitive ? `
                            <button type="button" class="privacy-toggle text-sm ${isPublic ? 'text-green-600' : 'text-slate-400'}" 
                                    data-field="${field.id}" title="${isPublic ? 'Public' : 'Private'}">
                                <i class="fas ${isPublic ? 'fa-eye' : 'fa-eye-slash'}"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                ${field.type === 'textarea' ? `
                    <textarea name="${field.id}" rows="4" 
                              class="w-full px-3 py-2 border border-slate-300 rounded-md"
                              placeholder="Enter ${field.label.toLowerCase()}">${value}</textarea>
                ` : field.type === 'select' ? `
                    <select name="${field.id}" class="w-full px-3 py-2 border border-slate-300 rounded-md">
                        <option value="">Select ${field.label}</option>
                        ${field.options.map(option => `
                            <option value="${option}" ${value === option ? 'selected' : ''}>${option}</option>
                        `).join('')}
                    </select>
                ` : `
                    <input type="${field.type}" name="${field.id}" 
                           value="${value}" 
                           class="w-full px-3 py-2 border border-slate-300 rounded-md"
                           placeholder="Enter ${field.label.toLowerCase()}">
                `}
                ${field.sensitive && isPublic ? `
                    <p class="text-xs text-amber-600 mt-1">
                        <i class="fas fa-exclamation-triangle mr-1"></i>
                        This sensitive information is currently public
                    </p>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Create array item HTML for display
function createArrayItemHtml(sectionKey, item, index) {
    const sectionConfig = lifeCvSections[sectionKey];
    if (!sectionConfig || !sectionConfig.fields) return '';
    
    const primaryField = sectionConfig.fields[0];
    const title = item[primaryField.id]?.value || `${sectionConfig.title.slice(0, -1)} ${index + 1}`;
    
    return `
        <div class="border border-slate-200 rounded-lg p-4 mb-3 hover:bg-slate-50">
            <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-slate-800">${title}</h4>
                <div class="flex items-center space-x-2">
                    <button type="button" class="edit-item-btn text-indigo-600 hover:text-indigo-800" 
                            data-index="${index}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="delete-item-btn text-red-600 hover:text-red-800" 
                            data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="text-sm text-slate-600">
                ${sectionConfig.fields.slice(1, 3).map(field => {
                    const fieldValue = item[field.id]?.value;
                    return fieldValue ? `<p><span class="font-medium">${field.label}:</span> ${fieldValue}</p>` : '';
                }).filter(Boolean).join('')}
            </div>
        </div>
    `;
}

// Open modal for array items
function openModal(sectionKey, index = -1) {
    const sectionConfig = lifeCvSections[sectionKey];
    const isEditing = index > -1;
    const sectionData = lifeCvData[sectionKey] || [];
    const item = isEditing ? sectionData[index] : {};
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-slate-200">
                <h2 class="text-xl font-bold text-slate-800">
                    ${isEditing ? 'Edit' : 'Add'} ${sectionConfig.title.slice(0, -1)}
                </h2>
            </div>
            <div class="p-6">
                <form id="item-form">
                    ${sectionConfig.fields.map(field => {
                        const fieldData = item[field.id] || createFieldObject('', !field.sensitive, field.sensitive);
                        const value = fieldData.value || '';
                        
                        return `
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-slate-700 mb-2">${field.label}</label>
                                ${field.type === 'select' ? `
                                    <select name="${field.id}" class="w-full px-3 py-2 border border-slate-300 rounded-md">
                                        <option value="">Select ${field.label}</option>
                                        ${field.options.map(option => `
                                            <option value="${option}" ${value === option ? 'selected' : ''}>${option}</option>
                                        `).join('')}
                                    </select>
                                ` : field.type === 'textarea' ? `
                                    <textarea name="${field.id}" rows="3" 
                                              class="w-full px-3 py-2 border border-slate-300 rounded-md"
                                              placeholder="Enter ${field.label.toLowerCase()}">${value}</textarea>
                                ` : `
                                    <input type="${field.type}" name="${field.id}" 
                                           value="${value}" 
                                           class="w-full px-3 py-2 border border-slate-300 rounded-md"
                                           placeholder="Enter ${field.label.toLowerCase()}">
                                `}
                                ${field.sensitive ? `
                                    <div class="mt-2">
                                        <label class="flex items-center">
                                            <input type="checkbox" name="${field.id}_public" ${fieldData.isPublic ? 'checked' : ''} class="mr-2">
                                            <span class="text-sm text-slate-600">Make this information public</span>
                                        </label>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </form>
            </div>
            <div class="p-6 border-t border-slate-200 flex justify-end space-x-3">
                <button type="button" class="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300" 
                        onclick="this.closest('.fixed').remove()">Cancel</button>
                <button type="button" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700" 
                        onclick="saveItem('${sectionKey}', ${index})">Save</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Save array item
async function saveItem(sectionKey, index) {
    const form = document.getElementById('item-form');
    const formData = new FormData(form);
    const sectionConfig = lifeCvSections[sectionKey];
    
    const itemData = {};
    
    for (const field of sectionConfig.fields) {
        const value = formData.get(field.id);
        const isPublic = field.sensitive ? formData.get(`${field.id}_public`) !== null : true;
        
        if (value) {
            itemData[field.id] = createFieldObject(value, isPublic, field.sensitive);
        }
    }
    
    try {
        const currentData = lifeCvData[sectionKey] || [];
        
        if (index > -1) {
            currentData[index] = itemData;
        } else {
            currentData.push(itemData);
        }
        
        await updateDocument('users', currentUser.uid, { [`lifeCv.${sectionKey}`]: currentData });
        
        document.querySelector('.fixed').remove();
        renderAllSections();
        
    } catch (error) {
        console.error('Error saving item:', error);
        alert('Failed to save item. Please try again.');
    }
}

// Delete array item
async function deleteItem(sectionKey, index) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
        const currentData = lifeCvData[sectionKey] || {};
        currentData.splice(index, 1);
        
        await updateDocument('users', currentUser.uid, { [`lifeCv.${sectionKey}`]: currentData });
        renderAllSections();
        
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item. Please try again.');
    }
}

// Save section (for non-array sections)
async function saveSection(event) {
    const button = event.currentTarget;
    const sectionKey = button.dataset.section;
    const sectionConfig = lifeCvSections[sectionKey];
    
    const form = button.closest('.accordion-content').querySelector('form') || 
                 button.closest('.accordion-content');
    
    const formData = new FormData();
    
    // Collect form data
    form.querySelectorAll('input, textarea, select').forEach(input => {
        if (input.name) {
            if (input.type === 'checkbox') {
                formData.set(input.name, input.checked);
            } else {
                formData.set(input.name, input.value);
            }
        }
    });
    
    const sectionData = {};
    
    for (const field of sectionConfig.fields) {
        const value = formData.get(field.id);
        const isPublic = field.sensitive ? formData.get(`${field.id}_public`) !== null : true;
        
        if (value) {
            sectionData[field.id] = createFieldObject(value, isPublic, field.sensitive);
        }
    }
    
    try {
        await updateDocument('users', currentUser.uid, { [`lifeCv.${sectionKey}`]: sectionData });
        showNotification('Section saved successfully!', 'success');
        
    } catch (error) {
        console.error('Error saving section:', error);
        alert('Failed to save section. Please try again.');
    }
}

// Cleanup function for when user leaves page
window.addEventListener('beforeunload', () => {
    // Stop camera if active
    if (cameraService) {
        cameraService.stop();
    }
    
    // Clean up sync listeners
    if (window.activeSyncListeners) {
        window.activeSyncListeners.forEach(unsubscribe => unsubscribe());
    }
});

// Enhanced error handling for async functions
function withErrorHandling(asyncFn) {
    return async function(...args) {
        try {
            return await asyncFn.apply(this, args);
        } catch (error) {
            console.error(`Error in ${asyncFn.name}:`, error);
            showNotification(`Operation failed: ${error.message}`, 'error');
            throw error;
        }
    };
}

// Wrap critical functions with error handling
window.saveSection = withErrorHandling(saveSection);
window.saveItem = withErrorHandling(saveItem);
window.deleteItem = withErrorHandling(deleteItem);
window.saveCapturedPhoto = withErrorHandling(saveCapturedPhoto);

// Make export function globally available
window.exportLifeCvData = exportLifeCvData;
window.importLifeCvData = importLifeCvData;

// Make functions globally available
window.confirmSensitiveDataSharing = confirmSensitiveDataSharing;
window.copyToClipboard = copyToClipboard;
window.toggleAccordion = toggleAccordion;
window.openModal = openModal;
window.saveItem = saveItem;
window.deleteItem = deleteItem;
window.saveSection = saveSection;
window.configureProfile = configureProfile;
window.saveProfileConfiguration = saveProfileConfiguration;
window.viewProfile = viewProfile;
window.deleteProfile = deleteProfile;
window.configureBusinessCard = configureBusinessCard;
window.saveBusinessCard = saveBusinessCard;
window.downloadBusinessCard = downloadBusinessCard;
window.downloadAllBusinessCards = downloadAllBusinessCards;
window.shareBusinessCards = shareBusinessCards;
window.deleteBusinessCard = deleteBusinessCard;
window.configureEmailSignature = configureEmailSignature;
window.saveEmailSignature = saveEmailSignature;
window.copyEmailSignature = copyEmailSignature;
window.deleteEmailSignature = deleteEmailSignature;
window.startLifeSync = startLifeSync;
window.initiateSync = initiateSync;
window.scrollToSection = scrollToSection;
window.openContactModal = openContactModal;
window.saveContactItem = saveContactItem;
window.deleteContactItem = deleteContactItem;
window.toggleContactPrivacy = toggleContactPrivacy;
window.openFamilyMemberModal = openFamilyMemberModal;
window.saveFamilyMember = saveFamilyMember;
window.deleteFamilyMember = deleteFamilyMember;
window.setPrimaryPicture = setPrimaryPicture;
window.deletePicture = deletePicture;
window.openWebcamModal = openWebcamModal;
window.closeWebcamModal = closeWebcamModal;
window.capturePhoto = capturePhoto;
window.retakePhoto = retakePhoto;
window.saveCapturedPhoto = saveCapturedPhoto;

// Export the init function and other necessary functions
export { 
    init, 
    renderAllSections, 
    analyzeCvCompleteness, 
    renderDashboard,
    lifeCvSections,
    publicProfileTemplates,
    businessCardTemplates,
    emailSignatureTemplates,
    lifeSyncPurposes
};

