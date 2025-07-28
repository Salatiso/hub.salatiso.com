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

// Load data from localStorage and Firebase
export async function loadLifeCvData() {
    try {
        // Load from localStorage first
        const localData = localStorage.getItem('lifeCvData');
        if (localData) {
            lifeCvData = { ...lifeCvData, ...JSON.parse(localData) };
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
        
        if (userDoc.exists() && userDoc.data().lifeCvData) {
            const firebaseData = userDoc.data().lifeCvData;
            lifeCvData = { ...lifeCvData, ...firebaseData };
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Removed call to initializeAssessment(); as it is not defined here.
});