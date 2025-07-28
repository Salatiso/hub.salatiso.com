/* ================================================================================= */
/* FILE: assets/js/services/life-cv-data-service.js (ENHANCED - Cross-Module)       */
/* ================================================================================= */
import { auth, db } from '../firebase-config.js';
import { doc, updateDoc, serverTimestamp, collection, addDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let lifeCvData = {
    personalInfo: {},
    education: [],
    workExperience: [],
    skills: [],
    certifications: [],
    achievements: [],
    goals: [],
    assessments: [], // For quiz and assessment results
    projects: [],
    references: [],
    languages: [],
    interests: [],
    volunteerWork: [],
    publications: []
};

let dataChangeListeners = [];

// Initialize service
export function initLifeCvDataService() {
    console.log('LifeCV Data Service initialized');
    loadLifeCvData();
}

// Initialize service (alias for compatibility)
export function init(user, dataChangeCallback) {
    console.log('LifeCV Data Service initializing for user:', user?.uid || 'anonymous');
    
    // Store the data change callback if provided
    if (dataChangeCallback && typeof dataChangeCallback === 'function') {
        addDataChangeListener(dataChangeCallback);
    }
    
    // Load the user's data
    return loadLifeCvData();
}

// Load data from localStorage and Firebase
export async function loadLifeCvData() {
    try {
        // Load from localStorage first
        const localData = localStorage.getItem('lifeCvData');
        if (localData) {
            const parsedData = JSON.parse(localData);
            // Migrate old format to new format if needed
            const migratedData = migrateOldDataFormat(parsedData);
            lifeCvData = { ...lifeCvData, ...migratedData };
        }

        // Sync with Firebase if user is authenticated
        if (auth.currentUser) {
            await syncWithFirebase();
        }

        notifyDataChange();
        return lifeCvData;
    } catch (error) {
        console.error('Error loading LifeCV data:', error);
        return lifeCvData;
    }
}

// Save data to localStorage and Firebase
export async function saveLifeCvData(data = null) {
    try {
        if (data) {
            lifeCvData = { ...lifeCvData, ...data };
        }

        // Save to localStorage
        localStorage.setItem('lifeCvData', JSON.stringify(lifeCvData));

        // Save to Firebase if user is authenticated
        if (auth.currentUser) {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, {
                lifeCvData: lifeCvData,
                lastUpdated: serverTimestamp()
            });

            // Log activity
            const activityRef = collection(db, 'users', auth.currentUser.uid, 'activities');
            await addDoc(activityRef, {
                type: 'lifecv_updated',
                title: 'LifeCV Profile Updated',
                description: 'Profile information has been updated',
                module: 'LifeCV',
                timestamp: serverTimestamp()
            });
        }

        notifyDataChange();
        return true;
    } catch (error) {
        console.error('Error saving LifeCV data:', error);
        return false;
    }
}

// Sync with Firebase
async function syncWithFirebase() {
    try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists() && userDoc.data().lifeCv) {
            // Handle old format from Firebase (lifeCv instead of lifeCvData)
            const firebaseData = userDoc.data().lifeCv;
            const migratedData = migrateOldDataFormat({ lifeCv: firebaseData });
            lifeCvData = { ...lifeCvData, ...migratedData };
            localStorage.setItem('lifeCvData', JSON.stringify(lifeCvData));
        } else if (userDoc.exists() && userDoc.data().lifeCvData) {
            // Handle new format
            const firebaseData = userDoc.data().lifeCvData;
            const migratedData = migrateOldDataFormat(firebaseData);
            lifeCvData = { ...lifeCvData, ...migratedData };
            localStorage.setItem('lifeCvData', JSON.stringify(lifeCvData));
        }
    } catch (error) {
        console.error('Error syncing with Firebase:', error);
    }
}

// Get current data
export function getLifeCvData() {
    return lifeCvData;
}

// Add quiz result to assessments
export function addQuizResult(quizData) {
    try {
        const assessmentEntry = {
            id: `quiz_${Date.now()}`,
            type: 'quiz',
            title: quizData.quizTitle || 'Quiz Assessment',
            score: quizData.score,
            totalQuestions: quizData.totalQuestions,
            percentage: Math.round((quizData.score / quizData.totalQuestions) * 100),
            results: quizData.results,
            personalityProfile: quizData.personalityProfile,
            strengths: quizData.strengths,
            recommendations: quizData.recommendations,
            insights: quizData.insights,
            categoryBreakdown: quizData.categoryBreakdown,
            completedAt: quizData.completedAt || new Date().toISOString(),
            timeSpent: quizData.timeSpent
        };

        if (!lifeCvData.assessments) {
            lifeCvData.assessments = [];
        }

        // Remove any existing quiz results and add new one
        lifeCvData.assessments = lifeCvData.assessments.filter(a => a.type !== 'quiz');
        lifeCvData.assessments.push(assessmentEntry);

        saveLifeCvData();

        // Add recommended skills to skills section
        if (quizData.strengths && Array.isArray(quizData.strengths)) {
            addSkillsFromAssessment(quizData.strengths);
        }

        console.log('Quiz result added to LifeCV:', assessmentEntry);
        return assessmentEntry;
    } catch (error) {
        console.error('Error adding quiz result:', error);
        return null;
    }
}

// Add assessment result
export function addAssessmentResult(assessmentData) {
    try {
        const assessmentEntry = {
            id: `assessment_${Date.now()}`,
            type: 'comprehensive_assessment',
            title: 'Comprehensive Life Assessment',
            sections: assessmentData.sections,
            overallScore: assessmentData.overallScore,
            insights: assessmentData.insights,
            recommendations: assessmentData.recommendations,
            strengthsAreas: assessmentData.strengthsAreas,
            developmentAreas: assessmentData.developmentAreas,
            completedAt: assessmentData.completedAt || new Date().toISOString(),
            timeSpent: assessmentData.timeSpent
        };

        if (!lifeCvData.assessments) {
            lifeCvData.assessments = [];
        }

        // Remove any existing comprehensive assessment and add new one
        lifeCvData.assessments = lifeCvData.assessments.filter(a => a.type !== 'comprehensive_assessment');
        lifeCvData.assessments.push(assessmentEntry);

        saveLifeCvData();

        // Add skills from assessment
        if (assessmentData.strengthsAreas) {
            addSkillsFromAssessment(assessmentData.strengthsAreas);
        }

        console.log('Assessment result added to LifeCV:', assessmentEntry);
        return assessmentEntry;
    } catch (error) {
        console.error('Error adding assessment result:', error);
        return null;
    }
}

// Add goals from assessment
export function addGoalsFromAssessment(sourceId, goalSuggestions) {
    try {
        if (!goalSuggestions || !Array.isArray(goalSuggestions)) return;

        if (!lifeCvData.goals) {
            lifeCvData.goals = [];
        }

        goalSuggestions.forEach((goal, index) => {
            const goalEntry = {
                id: `${sourceId}_goal_${index}`,
                title: goal.title || `Development Goal ${index + 1}`,
                description: goal.description,
                category: goal.category || 'Personal Development',
                priority: goal.priority || 'Medium',
                status: 'Not Started',
                targetDate: goal.targetDate,
                createdAt: new Date().toISOString(),
                source: 'assessment',
                sourceId: sourceId
            };

            // Check if goal already exists
            const existingGoal = lifeCvData.goals.find(g => 
                g.source === 'assessment' && 
                g.sourceId === sourceId && 
                g.title === goal.title
            );

            if (!existingGoal) {
                lifeCvData.goals.push(goalEntry);
            }
        });

        saveLifeCvData();
        console.log('Goals added from assessment:', goalSuggestions.length);
    } catch (error) {
        console.error('Error adding goals from assessment:', error);
    }
}

// Add skills from assessment
function addSkillsFromAssessment(skills) {
    try {
        if (!skills || !Array.isArray(skills)) return;

        if (!lifeCvData.skills) {
            lifeCvData.skills = [];
        }

        skills.forEach(skillName => {
            const existingSkill = lifeCvData.skills.find(s => 
                s.name && s.name.toLowerCase() === skillName.toLowerCase()
            );

            if (!existingSkill) {
                const skillEntry = {
                    id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name: skillName,
                    level: 'Intermediate', // Default level
                    category: 'Soft Skills',
                    source: 'assessment',
                    verified: false,
                    addedAt: new Date().toISOString()
                };

                lifeCvData.skills.push(skillEntry);
            }
        });

        console.log('Skills added from assessment:', skills.length);
    } catch (error) {
        console.error('Error adding skills from assessment:', error);
    }
}

// Get assessment results
export function getAssessmentResults() {
    return lifeCvData.assessments || [];
}

// Get latest quiz result
export function getLatestQuizResult() {
    const assessments = lifeCvData.assessments || [];
    return assessments.find(a => a.type === 'quiz') || null;
}

// Get latest comprehensive assessment
export function getLatestAssessment() {
    const assessments = lifeCvData.assessments || [];
    return assessments.find(a => a.type === 'comprehensive_assessment') || null;
}

// Calculate profile completion percentage
export function calculateProfileCompletion() {
    const sections = [
        'personalInfo',
        'education',
        'workExperience',
        'skills',
        'goals'
    ];

    let completedSections = 0;

    sections.forEach(section => {
        if (lifeCvData[section]) {
            if (Array.isArray(lifeCvData[section])) {
                if (lifeCvData[section].length > 0) completedSections++;
            } else if (typeof lifeCvData[section] === 'object') {
                const hasData = Object.values(lifeCvData[section]).some(value => 
                    value !== null && value !== undefined && value !== ''
                );
                if (hasData) completedSections++;
            }
        }
    });

    return Math.round((completedSections / sections.length) * 100);
}

// Get activity summary for dashboard
export function getActivitySummary() {
    const assessments = lifeCvData.assessments || [];
    const goals = lifeCvData.goals || [];
    const skills = lifeCvData.skills || [];

    return {
        assessmentsCompleted: assessments.length,
        goalsSet: goals.length,
        skillsListed: skills.length,
        profileCompletion: calculateProfileCompletion(),
        lastUpdate: getLastUpdateDate()
    };
}

// Get last update date
function getLastUpdateDate() {
    const allDates = [];
    
    // Check assessments
    if (lifeCvData.assessments) {
        lifeCvData.assessments.forEach(a => {
            if (a.completedAt) allDates.push(new Date(a.completedAt));
        });
    }

    // Check goals
    if (lifeCvData.goals) {
        lifeCvData.goals.forEach(g => {
            if (g.createdAt) allDates.push(new Date(g.createdAt));
        });
    }

    if (allDates.length === 0) return null;

    return allDates.sort((a, b) => b - a)[0]; // Most recent date
}

// Add data change listener
export function addDataChangeListener(callback) {
    dataChangeListeners.push(callback);
}

// Remove data change listener
export function removeDataChangeListener(callback) {
    const index = dataChangeListeners.indexOf(callback);
    if (index > -1) {
        dataChangeListeners.splice(index, 1);
    }
}

// Notify all listeners of data change
function notifyDataChange() {
    dataChangeListeners.forEach(callback => {
        try {
            callback(lifeCvData);
        } catch (error) {
            console.error('Error in data change listener:', error);
        }
    });
}

// Export all data for backup
export function exportLifeCvData() {
    return {
        ...lifeCvData,
        exportedAt: new Date().toISOString(),
        version: '1.0'
    };
}

// Import data from backup
export function importLifeCvData(importedData) {
    try {
        if (importedData && typeof importedData === 'object') {
            lifeCvData = { ...lifeCvData, ...importedData };
            delete lifeCvData.exportedAt;
            delete lifeCvData.version;
            
            saveLifeCvData();
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error importing LifeCV data:', error);
        return false;
    }
}

// Clear all data
export function clearLifeCvData() {
    lifeCvData = {
        personalInfo: {},
        education: [],
        workExperience: [],
        skills: [],
        certifications: [],
        achievements: [],
        goals: [],
        assessments: [],
        projects: [],
        references: [],
        languages: [],
        interests: [],
        volunteerWork: [],
        publications: []
    };
    
    localStorage.removeItem('lifeCvData');
    notifyDataChange();
}

// Initialize service when imported
if (typeof window !== 'undefined') {
    initLifeCvDataService();
}

async function fetchAllModuleData() {
    try {
        // Get LifeCV data
        const lifeCvData = getLifeCvData();
        const lifeCvStats = calculateLifeCvStats(lifeCvData);

        // Get FinHelp data
        const finHelpDoc = await getDocument('finhelp', currentUser.uid) || {};
        const finHelpStats = calculateFinHelpStats(finHelpDoc);

        // Get Family Hub data
        const familyDoc = await getDocument('family', currentUser.uid) || {};
        const familyStats = calculateFamilyStats(familyDoc);

        // Get eKhaya data
        const ekhayaStats = await calculateEkhayaStats();

        // Get CommsHub data
        const commsStats = calculateCommsStats();

        // Get Assessment data
        const assessmentStats = await calculateAssessmentStats();

        // Get notifications
        const notificationsData = { unreadCount: 0 }; // This will be updated by real-time listener

        // Generate recent activity
        const recentActivity = await generateCrossModuleActivity();

        // Calculate total activities
        const totalActivities = calculateTotalActivities(lifeCvData, finHelpDoc, familyDoc, assessmentStats);

        return {
            lifeCv: lifeCvStats,
            finHelp: finHelpStats,
            familyHub: familyStats,
            ekhaya: ekhayaStats,
            commsHub: commsStats,
            assessments: assessmentStats,
            notifications: notificationsData,
            recentActivity,
            totalActivities
        };
    } catch (error) {
        console.error('Error fetching module data:', error);
        return getDefaultModuleData();
    }
}

async function generateCrossModuleActivity() {
    const activities = [];
    
    try {
        // Get LifeCV activities
        const lifeCvData = getLifeCvData();
        if (lifeCvData.assessments && lifeCvData.assessments.length > 0) {
            const latestAssessment = lifeCvData.assessments[lifeCvData.assessments.length - 1];
            activities.push({
                icon: 'fas fa-brain',
                color: 'indigo',
                title: `${latestAssessment.type === 'quiz' ? 'Quiz' : 'Assessment'} Completed`,
                description: `Scored ${latestAssessment.score || latestAssessment.overallScore || 'N/A'}${latestAssessment.totalQuestions ? `/${latestAssessment.totalQuestions}` : ''}`,
                time: formatTimeAgo(latestAssessment.completedAt),
                module: 'LifeCV'
            });
        }

        if (lifeCvData.goals && lifeCvData.goals.length > 0) {
            const recentGoals = lifeCvData.goals
                .filter(g => g.createdAt)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 2);

            recentGoals.forEach(goal => {
                activities.push({
                    icon: 'fas fa-target',
                    color: 'green',
                    title: 'New Goal Set',
                    description: goal.title,
                    time: formatTimeAgo(goal.createdAt),
                    module: 'LifeCV'
                });
            });
        }

        // Get Firebase activities
        if (currentUser) {
            const activitiesRef = collection(db, 'users', currentUser.uid, 'activities');
            const q = query(activitiesRef, orderBy('timestamp', 'desc'), limit(10));
            
            const snapshot = await getDocs(q);
            snapshot.forEach(doc => {
                const activity = doc.data();
                activities.push({
                    icon: getIconForPlatform(activity.module || 'Hub'),
                    color: getColorForPlatform(activity.module || 'Hub'),
                    title: activity.title || 'Activity',
                    description: activity.description || '',
                    time: formatTimeAgo(activity.timestamp?.toDate?.() || activity.timestamp),
                    module: activity.module || 'Hub'
                });
            });
        }

        // Sort by most recent and limit to 8 activities
        return activities
            .sort((a, b) => {
                const timeA = a.time === 'Recently' ? new Date() : new Date(a.time);
                const timeB = b.time === 'Recently' ? new Date() : new Date(b.time);
                return timeB - timeA;
            })
            .slice(0, 8);

    } catch (error) {
        console.error('Error generating cross-module activity:', error);
        return [];
    }
}

// =================================================================================
// MISSING FUNCTIONS IMPLEMENTATION
// =================================================================================

// LifeCV Sections Configuration
const lifeCvSections = {
    personalInfo: {
        title: 'Personal Information',
        description: 'Basic personal details and identity information',
        icon: 'fas fa-user',
        isArray: false,
        fields: [
            { id: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter your full name' },
            { id: 'preferredName', label: 'Preferred Name', type: 'text', placeholder: 'What would you like to be called?' },
            { id: 'dateOfBirth', label: 'Date of Birth', type: 'date', sensitive: true },
            { id: 'nationality', label: 'Nationality', type: 'text', placeholder: 'e.g., South African' },
            { id: 'idNumber', label: 'ID Number', type: 'text', sensitive: true, placeholder: 'Identity number' },
            { id: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'] },
            { id: 'maritalStatus', label: 'Marital Status', type: 'select', options: ['Single', 'Married', 'Divorced', 'Widowed', 'In a relationship'] }
        ]
    },
    contactInfo: {
        title: 'Contact Information',
        description: 'Ways to reach you - phone, email, addresses',
        icon: 'fas fa-address-book',
        isArray: true,
        fields: [
            { id: 'type', label: 'Contact Type', type: 'select', required: true, options: ['Phone', 'Email', 'Address', 'Website', 'Social Media'] },
            { id: 'value', label: 'Contact Value', type: 'text', required: true, placeholder: 'Enter contact information' },
            { id: 'label', label: 'Label', type: 'text', placeholder: 'e.g., Home, Work, Personal' },
            { id: 'isPrimary', label: 'Primary Contact', type: 'checkbox' },
            { id: 'coordinates', label: 'GPS Coordinates', type: 'text', readonly: true, placeholder: 'Auto-filled for addresses' }
        ]
    },
    emergencyContacts: {
        title: 'Emergency Contacts',
        description: 'People to contact in case of emergency',
        icon: 'fas fa-phone-alt',
        isArray: true,
        fields: [
            { id: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Contact person name' },
            { id: 'relationship', label: 'Relationship', type: 'text', required: true, placeholder: 'e.g., Spouse, Parent, Friend' },
            { id: 'phone', label: 'Phone Number', type: 'tel', required: true, placeholder: 'Primary phone number' },
            { id: 'alternatePhone', label: 'Alternate Phone', type: 'tel', placeholder: 'Secondary phone number' },
            { id: 'email', label: 'Email', type: 'email', placeholder: 'Email address' },
            { id: 'address', label: 'Address', type: 'textarea', placeholder: 'Physical address' }
        ]
    },
    profilePictures: {
        title: 'Profile Pictures',
        description: 'Professional photos and profile images',
        icon: 'fas fa-camera',
        isArray: false,
        fields: [
            { id: 'pictures', label: 'Profile Pictures', type: 'file-gallery', accept: 'image/*' }
        ]
    },
    professionalSummary: {
        title: 'Professional Summary',
        description: 'Your career overview and professional identity',
        icon: 'fas fa-briefcase',
        isArray: false,
        fields: [
            { id: 'summary', label: 'Professional Summary', type: 'textarea', required: true, placeholder: 'Describe your professional background and goals' },
            { id: 'currentTitle', label: 'Current Job Title', type: 'text', placeholder: 'Your current position' },
            { id: 'industry', label: 'Industry', type: 'text', placeholder: 'Your industry or field' },
            { id: 'yearsExperience', label: 'Years of Experience', type: 'number', placeholder: 'Total years of professional experience' },
            { id: 'careerObjective', label: 'Career Objective', type: 'textarea', placeholder: 'Your career goals and aspirations' }
        ]
    },
    lifePhilosophy: {
        title: 'Life Philosophy',
        description: 'Your values, beliefs, and life principles',
        icon: 'fas fa-heart',
        isArray: false,
        fields: [
            { id: 'personalMission', label: 'Personal Mission Statement', type: 'textarea', placeholder: 'Your personal mission in life' },
            { id: 'coreValues', label: 'Core Values', type: 'textarea', placeholder: 'The values that guide your decisions' },
            { id: 'lifeGoals', label: 'Life Goals', type: 'textarea', placeholder: 'Your major life aspirations' },
            { id: 'inspiration', label: 'Sources of Inspiration', type: 'textarea', placeholder: 'What motivates and inspires you' }
        ]
    },
    experience: {
        title: 'Work Experience',
        description: 'Your employment history and professional roles',
        icon: 'fas fa-building',
        isArray: true,
        fields: [
            { id: 'jobTitle', label: 'Job Title', type: 'text', required: true, placeholder: 'Your position title' },
            { id: 'company', label: 'Company', type: 'text', required: true, placeholder: 'Company name' },
            { id: 'location', label: 'Location', type: 'text', placeholder: 'City, Country' },
            { id: 'startDate', label: 'Start Date', type: 'date', required: true },
            { id: 'endDate', label: 'End Date', type: 'date', placeholder: 'Leave blank if current' },
            { id: 'isCurrent', label: 'Current Position', type: 'checkbox' },
            { id: 'description', label: 'Job Description', type: 'textarea', placeholder: 'Describe your responsibilities and achievements' },
            { id: 'achievements', label: 'Key Achievements', type: 'textarea', placeholder: 'Notable accomplishments in this role' }
        ]
    },
    education: {
        title: 'Education',
        description: 'Your academic qualifications and learning history',
        icon: 'fas fa-graduation-cap',
        isArray: true,
        fields: [
            { id: 'institution', label: 'Institution', type: 'text', required: true, placeholder: 'School, university, or training center' },
            { id: 'degree', label: 'Degree/Qualification', type: 'text', required: true, placeholder: 'Degree, diploma, or certificate' },
            { id: 'fieldOfStudy', label: 'Field of Study', type: 'text', placeholder: 'Major, specialization, or subject area' },
            { id: 'startDate', label: 'Start Date', type: 'date' },
            { id: 'endDate', label: 'End Date', type: 'date' },
            { id: 'grade', label: 'Grade/GPA', type: 'text', placeholder: 'Final grade or GPA' },
            { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Additional details about your studies' }
        ]
    },
    skills: {
        title: 'Skills',
        description: 'Your technical and soft skills',
        icon: 'fas fa-cogs',
        isArray: true,
        fields: [
            { id: 'name', label: 'Skill Name', type: 'text', required: true, placeholder: 'Name of the skill' },
            { id: 'category', label: 'Category', type: 'select', options: ['Technical', 'Soft Skills', 'Language', 'Creative', 'Management', 'Other'] },
            { id: 'level', label: 'Proficiency Level', type: 'select', required: true, options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
            { id: 'yearsExperience', label: 'Years of Experience', type: 'number', placeholder: 'How many years using this skill' },
            { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe your experience with this skill' }
        ]
    },
    certifications: {
        title: 'Certifications',
        description: 'Professional certifications and licenses',
        icon: 'fas fa-certificate',
        isArray: true,
        fields: [
            { id: 'name', label: 'Certification Name', type: 'text', required: true, placeholder: 'Name of certification' },
            { id: 'issuingOrganization', label: 'Issuing Organization', type: 'text', required: true, placeholder: 'Who issued this certification' },
            { id: 'issueDate', label: 'Issue Date', type: 'date' },
            { id: 'expiryDate', label: 'Expiry Date', type: 'date', placeholder: 'Leave blank if no expiry' },
            { id: 'credentialId', label: 'Credential ID', type: 'text', placeholder: 'Certificate number or ID' },
            { id: 'credentialUrl', label: 'Credential URL', type: 'url', placeholder: 'Link to verify certification' },
            { id: 'description', label: 'Description', type: 'textarea', placeholder: 'What this certification covers' }
        ]
    },
    projects: {
        title: 'Projects',
        description: 'Notable projects and portfolio items',
        icon: 'fas fa-project-diagram',
        isArray: true,
        fields: [
            { id: 'name', label: 'Project Name', type: 'text', required: true, placeholder: 'Name of the project' },
            { id: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'What the project was about' },
            { id: 'role', label: 'Your Role', type: 'text', placeholder: 'Your role in the project' },
            { id: 'startDate', label: 'Start Date', type: 'date' },
            { id: 'endDate', label: 'End Date', type: 'date' },
            { id: 'technologies', label: 'Technologies Used', type: 'textarea', placeholder: 'Tools, technologies, or methods used' },
            { id: 'url', label: 'Project URL', type: 'url', placeholder: 'Link to project or demo' },
            { id: 'achievements', label: 'Key Achievements', type: 'textarea', placeholder: 'What you accomplished' }
        ]
    },
    languages: {
        title: 'Languages',
        description: 'Languages you speak and your proficiency levels',
        icon: 'fas fa-language',
        isArray: true,
        fields: [
            { id: 'language', label: 'Language', type: 'text', required: true, placeholder: 'Language name' },
            { id: 'proficiency', label: 'Proficiency Level', type: 'select', required: true, options: ['Basic', 'Conversational', 'Fluent', 'Native'] },
            { id: 'canRead', label: 'Can Read', type: 'checkbox' },
            { id: 'canWrite', label: 'Can Write', type: 'checkbox' },
            { id: 'canSpeak', label: 'Can Speak', type: 'checkbox' },
            { id: 'certifications', label: 'Language Certifications', type: 'textarea', placeholder: 'Any language certifications or tests' }
        ]
    },
    interests: {
        title: 'Interests & Hobbies',
        description: 'Your personal interests and recreational activities',
        icon: 'fas fa-heart',
        isArray: true,
        fields: [
            { id: 'name', label: 'Interest/Hobby', type: 'text', required: true, placeholder: 'Name of interest or hobby' },
            { id: 'category', label: 'Category', type: 'select', options: ['Sports', 'Arts', 'Technology', 'Music', 'Reading', 'Travel', 'Volunteering', 'Other'] },
            { id: 'level', label: 'Involvement Level', type: 'select', options: ['Casual', 'Regular', 'Serious', 'Professional'] },
            { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe your involvement and passion' }
        ]
    },
    milestones: {
        title: 'Life Milestones',
        description: 'Significant events and achievements in your life',
        icon: 'fas fa-flag-checkered',
        isArray: true,
        fields: [
            { id: 'title', label: 'Milestone Title', type: 'text', required: true, placeholder: 'Name of the milestone' },
            { id: 'date', label: 'Date', type: 'date', required: true },
            { id: 'category', label: 'Category', type: 'select', options: ['Personal', 'Professional', 'Educational', 'Family', 'Health', 'Financial', 'Other'] },
            { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe this milestone and its significance' },
            { id: 'impact', label: 'Impact on Life', type: 'textarea', placeholder: 'How this milestone affected your life' }
        ]
    },
    community: {
        title: 'Community Involvement',
        description: 'Your involvement in community activities and organizations',
        icon: 'fas fa-users',
        isArray: true,
        fields: [
            { id: 'organization', label: 'Organization', type: 'text', required: true, placeholder: 'Name of organization or community' },
            { id: 'role', label: 'Your Role', type: 'text', placeholder: 'Your position or involvement' },
            { id: 'startDate', label: 'Start Date', type: 'date' },
            { id: 'endDate', label: 'End Date', type: 'date', placeholder: 'Leave blank if ongoing' },
            { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe your involvement and contributions' },
            { id: 'achievements', label: 'Achievements', type: 'textarea', placeholder: 'Notable accomplishments or impact' }
        ]
    },
    volunteering: {
        title: 'Volunteer Work',
        description: 'Your volunteer experiences and community service',
        icon: 'fas fa-hands-helping',
        isArray: true,
        fields: [
            { id: 'organization', label: 'Organization', type: 'text', required: true, placeholder: 'Volunteer organization name' },
            { id: 'role', label: 'Volunteer Role', type: 'text', required: true, placeholder: 'Your volunteer position' },
            { id: 'cause', label: 'Cause/Focus Area', type: 'text', placeholder: 'What cause or area you supported' },
            { id: 'startDate', label: 'Start Date', type: 'date' },
            { id: 'endDate', label: 'End Date', type: 'date', placeholder: 'Leave blank if ongoing' },
            { id: 'hoursPerWeek', label: 'Hours per Week', type: 'number', placeholder: 'Average hours volunteered per week' },
            { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe your volunteer work and impact' }
        ]
    },
    publications: {
        title: 'Publications & Media',
        description: 'Articles, books, media appearances, and other publications',
        icon: 'fas fa-book-open',
        isArray: true,
        fields: [
            { id: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Title of publication or media' },
            { id: 'type', label: 'Type', type: 'select', options: ['Article', 'Book', 'Blog Post', 'Research Paper', 'Interview', 'Podcast', 'Video', 'Other'] },
            { id: 'publisher', label: 'Publisher/Platform', type: 'text', placeholder: 'Where it was published' },
            { id: 'date', label: 'Publication Date', type: 'date' },
            { id: 'url', label: 'URL', type: 'url', placeholder: 'Link to publication' },
            { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Brief description of the content' }
        ]
    },
    digital: {
        title: 'Digital Presence',
        description: 'Your online profiles and digital footprint',
        icon: 'fas fa-globe',
        isArray: true,
        fields: [
            { id: 'platform', label: 'Platform', type: 'text', required: true, placeholder: 'e.g., LinkedIn, GitHub, Twitter' },
            { id: 'username', label: 'Username/Handle', type: 'text', placeholder: 'Your username on this platform' },
            { id: 'url', label: 'Profile URL', type: 'url', required: true, placeholder: 'Link to your profile' },
            { id: 'description', label: 'Description', type: 'textarea', placeholder: 'What you use this platform for' },
            { id: 'followers', label: 'Followers/Connections', type: 'number', placeholder: 'Number of followers or connections' }
        ]
    },
    travel: {
        title: 'Travel Experience',
        description: 'Places you have visited and travel experiences',
        icon: 'fas fa-plane',
        isArray: true,
        fields: [
            { id: 'destination', label: 'Destination', type: 'text', required: true, placeholder: 'City, Country or Region' },
            { id: 'purpose', label: 'Purpose', type: 'select', options: ['Tourism', 'Business', 'Education', 'Volunteer', 'Family', 'Other'] },
            { id: 'startDate', label: 'Start Date', type: 'date' },
            { id: 'endDate', label: 'End Date', type: 'date' },
            { id: 'duration', label: 'Duration', type: 'text', placeholder: 'How long you stayed' },
            { id: 'highlights', label: 'Highlights', type: 'textarea', placeholder: 'Memorable experiences or learnings' },
            { id: 'culturalImpact', label: 'Cultural Impact', type: 'textarea', placeholder: 'How this travel experience influenced you' }
        ]
    },
    family: {
        title: 'Family Information',
        description: 'Information about your family members',
        icon: 'fas fa-home',
        isArray: true,
        fields: [
            { id: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Family member name' },
            { id: 'relationship', label: 'Relationship', type: 'select', required: true, options: ['Spouse', 'Child', 'Parent', 'Sibling', 'Grandparent', 'Grandchild', 'Other'] },
            { id: 'age', label: 'Age', type: 'number', placeholder: 'Current age' },
            { id: 'occupation', label: 'Occupation', type: 'text', placeholder: 'What they do for work' },
            { id: 'location', label: 'Location', type: 'text', placeholder: 'Where they live' },
            { id: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional information' }
        ]
    },
    healthWellness: {
        title: 'Health & Wellness',
        description: 'Health information and wellness practices',
        icon: 'fas fa-heartbeat',
        isArray: false,
        fields: [
            { id: 'bloodType', label: 'Blood Type', type: 'select', sensitive: true, options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'] },
            { id: 'allergies', label: 'Allergies', type: 'textarea', sensitive: true, placeholder: 'List any known allergies' },
            { id: 'medications', label: 'Current Medications', type: 'textarea', sensitive: true, placeholder: 'List current medications' },
            { id: 'medicalConditions', label: 'Medical Conditions', type: 'textarea', sensitive: true, placeholder: 'Any ongoing medical conditions' },
            { id: 'fitnessLevel', label: 'Fitness Level', type: 'select', options: ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active'] },
            { id: 'wellnessPractices', label: 'Wellness Practices', type: 'textarea', placeholder: 'Exercise routines, meditation, etc.' }
        ]
    },
    financials: {
        title: 'Financial Information',
        description: 'Financial overview and goals (private by default)',
        icon: 'fas fa-chart-line',
        isArray: false,
        fields: [
            { id: 'summary', label: 'Financial Summary', type: 'textarea', sensitive: true, placeholder: 'Overview of your financial situation' },
            { id: 'income', label: 'Income Sources', type: 'textarea', sensitive: true, placeholder: 'Primary sources of income' },
            { id: 'assets', label: 'Major Assets', type: 'textarea', sensitive: true, placeholder: 'Property, investments, etc.' },
            { id: 'liabilities', label: 'Major Liabilities', type: 'textarea', sensitive: true, placeholder: 'Loans, debts, etc.' },
            { id: 'financialGoals', label: 'Financial Goals', type: 'textarea', placeholder: 'Your financial aspirations and plans' },
            { id: 'insurances', label: 'Insurance Coverage', type: 'textarea', sensitive: true, placeholder: 'Types of insurance you have' }
        ]
    },
    references: {
        title: 'References',
        description: 'Professional and personal references',
        icon: 'fas fa-user-friends',
        isArray: true,
        fields: [
            { id: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Reference name' },
            { id: 'title', label: 'Job Title', type: 'text', placeholder: 'Their current position' },
            { id: 'company', label: 'Company', type: 'text', placeholder: 'Where they work' },
            { id: 'relationship', label: 'Relationship', type: 'text', required: true, placeholder: 'How you know them' },
            { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'Contact phone number' },
            { id: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Contact email' },
            { id: 'yearsKnown', label: 'Years Known', type: 'number', placeholder: 'How long you have known them' },
            { id: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional context about this reference' }
        ]
    }
};

// Export the sections configuration
export function getLifeCvSections() {
    return lifeCvSections;
}

// Update a specific field in the LifeCV data
export function updateField(path, value) {
    try {
        const pathParts = path.split('.');
        let current = lifeCvData;
        
        // Navigate to the parent object
        for (let i = 0; i < pathParts.length - 1; i++) {
            const part = pathParts[i];
            if (!current[part]) {
                current[part] = {};
            }
            current = current[part];
        }
        
        // Set the final value
        const finalKey = pathParts[pathParts.length - 1];
        
        // Handle the structured format with value and isPublic
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            current[finalKey] = value;
        } else {
            // Create structured format if it doesn't exist
            if (!current[finalKey] || typeof current[finalKey] !== 'object') {
                current[finalKey] = { value: '', isPublic: true };
            }
            current[finalKey].value = value;
        }
        
        // Save the updated data
        saveLifeCvData();
        notifyDataChange();
        
        return true;
    } catch (error) {
        console.error('Error updating field:', error);
        return false;
    }
}

// Add an item to an array section
export function addArrayItem(sectionKey, itemData) {
    try {
        if (!lifeCvData[sectionKey]) {
            lifeCvData[sectionKey] = [];
        }
        
        if (!Array.isArray(lifeCvData[sectionKey])) {
            lifeCvData[sectionKey] = [];
        }
        
        // Ensure the item has the proper structure
        const structuredItem = {};
        if (typeof itemData === 'object' && itemData !== null) {
            Object.keys(itemData).forEach(key => {
                if (typeof itemData[key] === 'object' && itemData[key] !== null && 'value' in itemData[key]) {
                    // Already in structured format
                    structuredItem[key] = itemData[key];
                } else {
                    // Convert to structured format
                    structuredItem[key] = {
                        value: itemData[key],
                        isPublic: true
                    };
                }
            });
        }
        
        lifeCvData[sectionKey].push(structuredItem);
        saveLifeCvData();
        notifyDataChange();
        
        return lifeCvData[sectionKey].length - 1; // Return the index of the added item
    } catch (error) {
        console.error('Error adding array item:', error);
        return -1;
    }
}

// Remove an item from an array section
export function removeArrayItem(sectionKey, index) {
    try {
        if (!lifeCvData[sectionKey] || !Array.isArray(lifeCvData[sectionKey])) {
            return false;
        }
        
        if (index >= 0 && index < lifeCvData[sectionKey].length) {
            lifeCvData[sectionKey].splice(index, 1);
            saveLifeCvData();
            notifyDataChange();
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error removing array item:', error);
        return false;
    }
}

// Update privacy setting for a specific field
export function updatePrivacySetting(path, isPublic) {
    try {
        const pathParts = path.split('.');
        let current = lifeCvData;
        
        // Navigate to the parent object
        for (let i = 0; i < pathParts.length - 1; i++) {
            const part = pathParts[i];
            if (!current[part]) {
                current[part] = {};
            }
            current = current[part];
        }
        
        // Set the privacy setting
        const finalKey = pathParts[pathParts.length - 1];
        if (!current[finalKey] || typeof current[finalKey] !== 'object') {
            current[finalKey] = { value: '', isPublic: true };
        }
        
        current[finalKey].isPublic = isPublic;
        
        // Save the updated data
        saveLifeCvData();
        notifyDataChange();
        
        return true;
    } catch (error) {
        console.error('Error updating privacy setting:', error);
        return false;
    }
}

// Export data for backup or sharing
export function exportData(options = {}) {
    try {
        const exportedData = {
            ...lifeCvData,
            exportedAt: new Date().toISOString(),
            version: '2.0',
            exportOptions: options
        };
        
        // Remove sensitive data if requested
        if (options.excludeSensitive) {
            const sensitiveFields = ['healthWellness', 'financials'];
            sensitiveFields.forEach(field => {
                if (exportedData[field]) {
                    delete exportedData[field];
                }
            });
        }
        
        // Include only public data if requested
        if (options.publicOnly) {
            const publicData = {};
            Object.keys(exportedData).forEach(sectionKey => {
                const section = exportedData[sectionKey];
                if (Array.isArray(section)) {
                    publicData[sectionKey] = section.map(item => {
                        const publicItem = {};
                        Object.keys(item).forEach(fieldKey => {
                            const field = item[fieldKey];
                            if (field && typeof field === 'object' && field.isPublic !== false) {
                                publicItem[fieldKey] = field;
                            }
                        });
                        return publicItem;
                    });
                } else if (typeof section === 'object' && section !== null) {
                    publicData[sectionKey] = {};
                    Object.keys(section).forEach(fieldKey => {
                        const field = section[fieldKey];
                        if (field && typeof field === 'object' && field.isPublic !== false) {
                            publicData[sectionKey][fieldKey] = field;
                        }
                    });
                } else {
                    publicData[sectionKey] = section;
                }
            });
            return publicData;
        }
        
        return exportedData;
    } catch (error) {
        console.error('Error exporting data:', error);
        return null;
    }
}

// Import data from backup or external source
export async function importData(importedData, options = {}) {
    try {
        if (!importedData || typeof importedData !== 'object') {
            throw new Error('Invalid import data format');
        }
        
        const strategy = options.strategy || 'merge'; // 'merge', 'overwrite', 'skip'
        const conflicts = [];
        
        // Clean the imported data (remove export metadata)
        const cleanData = { ...importedData };
        delete cleanData.exportedAt;
        delete cleanData.version;
        delete cleanData.exportOptions;
        
        if (strategy === 'overwrite') {
            // Replace all data
            lifeCvData = { ...getDefaultLifeCvData(), ...cleanData };
        } else if (strategy === 'merge') {
            // Merge data, handling conflicts
            Object.keys(cleanData).forEach(sectionKey => {
                const importedSection = cleanData[sectionKey];
                const existingSection = lifeCvData[sectionKey];
                
                if (Array.isArray(importedSection)) {
                    // Handle array sections (experience, skills, etc.)
                    if (!lifeCvData[sectionKey]) {
                        lifeCvData[sectionKey] = [];
                    }
                    
                    importedSection.forEach(importedItem => {
                        // Check for duplicates based on key fields
                        const isDuplicate = lifeCvData[sectionKey].some(existingItem => {
                            return checkItemDuplicate(existingItem, importedItem, sectionKey);
                        });
                        
                        if (isDuplicate) {
                            conflicts.push({
                                section: sectionKey,
                                type: 'duplicate',
                                existing: existingSection,
                                imported: importedItem
                            });
                        } else {
                            lifeCvData[sectionKey].push(importedItem);
                        }
                    });
                } else if (typeof importedSection === 'object' && importedSection !== null) {
                    // Handle object sections (personalInfo, etc.)
                    if (!lifeCvData[sectionKey]) {
                        lifeCvData[sectionKey] = {};
                    }
                    
                    Object.keys(importedSection).forEach(fieldKey => {
                        const importedField = importedSection[fieldKey];
                        const existingField = lifeCvData[sectionKey][fieldKey];
                        
                        if (existingField && existingField.value && importedField.value &&
                            existingField.value !== importedField.value) {
                            conflicts.push({
                                section: sectionKey,
                                field: fieldKey,
                                type: 'field_conflict',
                                existing: existingField,
                                imported: importedField
                            });
                        } else {
                            lifeCvData[sectionKey][fieldKey] = importedField;
                        }
                    });
                }
            });
        }
        
        // Save the updated data
        await saveLifeCvData();
        notifyDataChange();
        
        return {
            success: true,
            conflicts: conflicts,
            importedSections: Object.keys(cleanData).length,
            conflictCount: conflicts.length
        };
        
    } catch (error) {
        console.error('Error importing data:', error);
        return {
            success: false,
            error: error.message,
            conflicts: [],
            importedSections: 0,
            conflictCount: 0
        };
    }
}

// Helper function to check if two items are duplicates
function checkItemDuplicate(existing, imported, sectionKey) {
    // Define key fields for different sections to check for duplicates
    const keyFields = {
        experience: ['jobTitle', 'company'],
        education: ['institution', 'degree'],
        skills: ['name'],
        certifications: ['name', 'issuingOrganization'],
        projects: ['name'],
        languages: ['language'],
        contactInfo: ['type', 'value'],
        emergencyContacts: ['name', 'phone'],
        references: ['name', 'email']
    };
    
    const fields = keyFields[sectionKey] || ['name', 'title'];
    
    return fields.some(field => {
        const existingValue = existing[field]?.value || existing[field];
        const importedValue = imported[field]?.value || imported[field];
        return existingValue && importedValue &&
               existingValue.toLowerCase() === importedValue.toLowerCase();
    });
}

// Get default LifeCV data structure
function getDefaultLifeCvData() {
    return {
        personalInfo: {},
        education: [],
        workExperience: [],
        skills: [],
        certifications: [],
        achievements: [],
        goals: [],
        assessments: [],
        projects: [],
        references: [],
        languages: [],
        interests: [],
        volunteerWork: [],
        publications: []
    };
}

/**
 * Migrate old data format to new structured format
 */
function migrateOldDataFormat(data) {
    if (!data || typeof data !== 'object') {
        return data;
    }

    // Check if this is old format data (has lifeCv property or flat structure)
    const oldData = data.lifeCv || data;
    
    // If data is already in new format, return as is
    if (isNewFormat(oldData)) {
        return data;
    }

    console.log('Migrating old data format to new format...');
    
    const migratedData = {};

    // Migrate personal information
    if (oldData.personal) {
        migratedData.personalInfo = migrateObjectFields(oldData.personal, {
            fullName: 'fullName',
            preferredName: 'preferredName',
            dob: 'dateOfBirth',
            nationality: 'nationality',
            idNumber: 'idNumber',
            ethnicity: 'ethnicity',
            pronouns: 'pronouns'
        });
    }

    // Migrate contact information - handle both old flat structure and array
    if (oldData.contactNumber || oldData.email || oldData.address) {
        migratedData.contactInfo = [];
        
        if (oldData.contactNumber) {
            migratedData.contactInfo.push({
                type: { value: 'Phone', isPublic: false },
                value: { value: oldData.contactNumber, isPublic: false },
                label: { value: 'Primary', isPublic: false },
                isPrimary: { value: true, isPublic: false }
            });
        }
        
        if (oldData.email) {
            migratedData.contactInfo.push({
                type: { value: 'Email', isPublic: true },
                value: { value: oldData.email, isPublic: true },
                label: { value: 'Primary', isPublic: true },
                isPrimary: { value: true, isPublic: true }
            });
        }
        
        if (oldData.address) {
            migratedData.contactInfo.push({
                type: { value: 'Address', isPublic: false },
                value: { value: oldData.address, isPublic: false },
                label: { value: 'Home', isPublic: false },
                isPrimary: { value: true, isPublic: false },
                coordinates: { value: '', isPublic: false }
            });
        }
    }

    // Migrate array sections
    const arrayMappings = {
        certifications: 'certifications',
        community: 'community',
        digital: 'digital',
        education: 'education',
        experience: 'experience',
        skills: 'skills',
        interests: 'interests',
        languages: 'languages',
        milestones: 'milestones',
        projects: 'projects',
        publications: 'publications',
        volunteering: 'volunteering',
        references: 'references',
        family: 'family',
        financials: 'financials'
    };

    Object.entries(arrayMappings).forEach(([oldKey, newKey]) => {
        if (oldData[oldKey] && Array.isArray(oldData[oldKey])) {
            migratedData[newKey] = oldData[oldKey].map(item => migrateArrayItem(item));
        }
    });

    // Migrate object sections
    if (oldData.philosophy) {
        migratedData.lifePhilosophy = migrateObjectFields(oldData.philosophy, {
            mission: 'personalMission',
            values: 'coreValues',
            lifeGoals: 'lifeGoals',
            beliefs: 'inspiration',
            spirituality: 'spirituality'
        });
    }

    if (oldData.professional) {
        migratedData.professionalSummary = migrateObjectFields(oldData.professional, {
            summary: 'summary',
            careerVision: 'careerObjective',
            workStyle: 'currentTitle'
        });
    }

    if (oldData.health) {
        migratedData.healthWellness = migrateObjectFields(oldData.health, {
            physicalHealth: 'fitnessLevel',
            mentalHealth: 'wellnessPractices',
            allergies: 'allergies',
            medications: 'medications',
            disabilities: 'medicalConditions',
            healthGoals: 'wellnessPractices'
        });
    }

    // Handle special case for financials array to object conversion
    if (oldData.financials && Array.isArray(oldData.financials)) {
        migratedData.financials = {
            summary: { value: 'Financial overview from imported data', isPublic: false },
            income: { value: '', isPublic: false },
            assets: { value: '', isPublic: false },
            liabilities: { value: '', isPublic: false },
            financialGoals: { value: '', isPublic: false },
            insurances: { value: '', isPublic: false }
        };
        
        // Try to extract financial info from array items
        oldData.financials.forEach(item => {
            if (item.assetType) {
                const currentAssets = migratedData.financials.assets.value;
                migratedData.financials.assets.value = currentAssets ?
                    `${currentAssets}; ${item.assetName}: ${item.details}` :
                    `${item.assetName}: ${item.details}`;
            }
        });
    }

    console.log('Data migration completed');
    return migratedData;
}

/**
 * Check if data is already in new format
 */
function isNewFormat(data) {
    if (!data || typeof data !== 'object') return false;
    
    // Check if any field has the new structure with value and isPublic
    const sampleFields = ['personalInfo', 'contactInfo', 'experience', 'skills'];
    
    for (const field of sampleFields) {
        if (data[field]) {
            if (Array.isArray(data[field])) {
                // Check first item in array
                if (data[field].length > 0) {
                    const firstItem = data[field][0];
                    const firstFieldKey = Object.keys(firstItem)[0];
                    if (firstItem[firstFieldKey] && typeof firstItem[firstFieldKey] === 'object' &&
                        'value' in firstItem[firstFieldKey]) {
                        return true;
                    }
                }
            } else if (typeof data[field] === 'object') {
                // Check object fields
                const firstFieldKey = Object.keys(data[field])[0];
                if (data[field][firstFieldKey] && typeof data[field][firstFieldKey] === 'object' &&
                    'value' in data[field][firstFieldKey]) {
                    return true;
                }
            }
        }
    }
    
    return false;
}

/**
 * Migrate object fields to new format
 */
function migrateObjectFields(oldObj, fieldMapping) {
    const newObj = {};
    
    Object.entries(fieldMapping).forEach(([oldField, newField]) => {
        if (oldObj[oldField] !== undefined) {
            newObj[newField] = {
                value: oldObj[oldField],
                isPublic: true, // Default to public, user can change later
                lastModified: new Date().toISOString()
            };
        }
    });
    
    // Handle any unmapped fields
    Object.keys(oldObj).forEach(key => {
        if (!Object.keys(fieldMapping).includes(key) && !newObj[key]) {
            newObj[key] = {
                value: oldObj[key],
                isPublic: true,
                lastModified: new Date().toISOString()
            };
        }
    });
    
    return newObj;
}

/**
 * Migrate array item to new format
 */
function migrateArrayItem(oldItem) {
    if (!oldItem || typeof oldItem !== 'object') {
        return oldItem;
    }
    
    const newItem = {};
    
    Object.entries(oldItem).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            newItem[key] = {
                value: value,
                isPublic: true, // Default to public, user can change later
                lastModified: new Date().toISOString()
            };
        }
    });
    
    return newItem;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Removed call to initializeAssessment(); as it is not defined here.
});