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
// ...existing code...

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
import { auth, db } from '../firebase-config.js';
import { getDocument } from '../database.js';
import { collection, query, where, onSnapshot, limit, orderBy, doc, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getLifeCvData } from '../services/life-cv-data-service.js';
// ...existing code continues from the incomplete part...

                    <div class="flex justify-between mt-8">
                        <button id="prev-section-btn" class="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            Previous Section
                        </button>
                        <button id="next-section-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            Next Section
                        </button>
                    </div>
                </div>
            </div>

            <!-- Assessment Results -->
            <div id="assessment-results" class="hidden">
                <!-- Dynamic results content -->
            </div>
        </div>
    `;
}

function bindAssessmentEvents() {
    const startBtn = document.getElementById('start-assessment-btn');
    const nextBtn = document.getElementById('next-section-btn');
    const prevBtn = document.getElementById('prev-section-btn');

    if (startBtn) {
        startBtn.addEventListener('click', startAssessment);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', nextSection);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', previousSection);
    }
}

function startAssessment() {
    currentAssessment = {
        sections: [...assessmentSections],
        responses: {},
        startTime: new Date()
    };
    
    currentSectionIndex = 0;
    assessmentData = {};

    document.getElementById('assessment-start').classList.add('hidden');
    document.getElementById('assessment-sections').classList.remove('hidden');

    displaySection();
}

function displaySection() {
    const section = currentAssessment.sections[currentSectionIndex];
    const sectionTitle = document.getElementById('section-title');
    const sectionDescription = document.getElementById('section-description');
    const sectionCounter = document.getElementById('section-counter');
    const sectionProgress = document.getElementById('section-progress');
    const sectionContent = document.getElementById('section-content');
    const prevBtn = document.getElementById('prev-section-btn');
    const nextBtn = document.getElementById('next-section-btn');

    // Update progress
    const progress = ((currentSectionIndex + 1) / currentAssessment.sections.length) * 100;
    sectionProgress.style.width = `${progress}%`;
    sectionCounter.textContent = `Section ${currentSectionIndex + 1} of ${currentAssessment.sections.length}`;
    sectionTitle.textContent = section.title;
    sectionDescription.textContent = section.description;

    // Enable/disable navigation buttons
    prevBtn.disabled = currentSectionIndex === 0;
    
    if (currentSectionIndex === currentAssessment.sections.length - 1) {
        nextBtn.textContent = 'Complete Assessment';
    } else {
        nextBtn.textContent = 'Next Section';
    }

    // Display questions
    sectionContent.innerHTML = `
        <div class="space-y-8">
            ${section.questions.map((question, index) => generateQuestionHTML(question, index)).join('')}
        </div>
    `;

    // Bind events for this section
    bindSectionEvents(section);

    // Restore previous answers if exists
    if (assessmentData[section.id]) {
        restoreSectionAnswers(section);
    }
}

function generateQuestionHTML(question, index) {
    switch (question.type) {
        case 'scale':
            return generateScaleQuestion(question, index);
        case 'multiple-choice':
            return generateMultipleChoiceQuestion(question, index);
        case 'multiple-select':
            return generateMultipleSelectQuestion(question, index);
        case 'ranking':
            return generateRankingQuestion(question, index);
        case 'text-input':
            return generateTextInputQuestion(question, index);
        case 'skill-rating':
            return generateSkillRatingQuestion(question, index);
        default:
            return `<div class="text-red-500">Unknown question type: ${question.type}</div>`;
    }
}

function generateScaleQuestion(question, index) {
    const scale = question.scale;
    return `
        <div class="question-container" data-question-id="${question.id}">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">${question.question}</h4>
            <div class="scale-container">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm text-gray-600">${scale.labels[0]}</span>
                    <span class="text-sm text-gray-600">${scale.labels[1]}</span>
                </div>
                <div class="flex justify-between items-center">
                    ${Array.from({length: scale.max - scale.min + 1}, (_, i) => {
                        const value = scale.min + i;
                        return `
                            <label class="flex flex-col items-center cursor-pointer scale-option" data-value="${value}">
                                <input type="radio" name="${question.id}" value="${value}" class="sr-only">
                                <div class="w-8 h-8 border-2 border-gray-300 rounded-full mb-1 scale-radio"></div>
                                <span class="text-xs text-gray-500">${value}</span>
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

function generateMultipleChoiceQuestion(question, index) {
    return `
        <div class="question-container" data-question-id="${question.id}">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">${question.question}</h4>
            <div class="space-y-3">
                ${question.options.map(option => `
                    <label class="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors choice-option" data-value="${option.id}">
                        <input type="radio" name="${question.id}" value="${option.id}" class="sr-only">
                        <div class="w-4 h-4 border-2 border-gray-300 rounded-full mr-4 choice-radio"></div>
                        <span class="text-gray-700">${option.text}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `;
}

function generateMultipleSelectQuestion(question, index) {
    return `
        <div class="question-container" data-question-id="${question.id}">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">${question.question}</h4>
            <div class="space-y-3">
                ${question.options.map(option => `
                    <label class="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors select-option" data-value="${option.id}">
                        <input type="checkbox" name="${question.id}" value="${option.id}" class="sr-only">
                        <div class="w-4 h-4 border-2 border-gray-300 rounded mr-4 select-checkbox"></div>
                        <span class="text-gray-700">${option.text}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `;
}

function generateTextInputQuestion(question, index) {
    return `
        <div class="question-container" data-question-id="${question.id}">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">${question.question}</h4>
            <textarea 
                name="${question.id}" 
                placeholder="${question.placeholder || ''}"
                class="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-input"
                rows="4"
            ></textarea>
        </div>
    `;
}

function generateSkillRatingQuestion(question, index) {
    return `
        <div class="question-container" data-question-id="${question.id}">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">${question.question}</h4>
            <div class="space-y-4">
                ${question.skills.map(skill => `
                    <div class="skill-rating-row" data-skill="${skill}">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-medium text-gray-700">${skill}</span>
                            <span class="skill-level-text text-sm text-gray-500">Not Rated</span>
                        </div>
                        <div class="flex space-x-2">
                            ${['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level, levelIndex) => `
                                <label class="flex-1 cursor-pointer skill-level-option" data-level="${level}" data-value="${levelIndex + 1}">
                                    <input type="radio" name="${question.id}_${skill.replace(/\s+/g, '_')}" value="${levelIndex + 1}" class="sr-only">
                                    <div class="p-2 text-center border-2 border-gray-200 rounded skill-level-button">
                                        <div class="text-xs font-medium">${level}</div>
                                    </div>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function bindSectionEvents(section) {
    // Bind scale questions
    document.querySelectorAll('.scale-option').forEach(option => {
        option.addEventListener('click', () => selectScaleOption(option));
    });

    // Bind multiple choice questions
    document.querySelectorAll('.choice-option').forEach(option => {
        option.addEventListener('click', () => selectChoiceOption(option));
    });

    // Bind multiple select questions
    document.querySelectorAll('.select-option').forEach(option => {
        option.addEventListener('click', () => toggleSelectOption(option));
    });

    // Bind skill rating questions
    document.querySelectorAll('.skill-level-option').forEach(option => {
        option.addEventListener('click', () => selectSkillLevel(option));
    });

    // Bind text inputs
    document.querySelectorAll('.text-input').forEach(input => {
        input.addEventListener('input', () => saveTextInput(input));
    });
}

function selectScaleOption(optionElement) {
    const questionContainer = optionElement.closest('.question-container');
    const questionId = questionContainer.dataset.questionId;
    const value = parseInt(optionElement.dataset.value);

    // Remove previous selection
    questionContainer.querySelectorAll('.scale-radio').forEach(radio => {
        radio.classList.remove('border-blue-500', 'bg-blue-500');
    });

    // Add selection to clicked option
    optionElement.querySelector('.scale-radio').classList.add('border-blue-500', 'bg-blue-500');

    saveAnswer(questionId, value);
}

function selectChoiceOption(optionElement) {
    const questionContainer = optionElement.closest('.question-container');
    const questionId = questionContainer.dataset.questionId;
    const value = optionElement.dataset.value;

    // Remove previous selection
    questionContainer.querySelectorAll('.choice-option').forEach(opt => {
        opt.classList.remove('border-blue-500', 'bg-blue-50');
        opt.querySelector('.choice-radio').classList.remove('border-blue-500', 'bg-blue-500');
    });

    // Add selection to clicked option
    optionElement.classList.add('border-blue-500', 'bg-blue-50');
    optionElement.querySelector('.choice-radio').classList.add('border-blue-500', 'bg-blue-500');

    saveAnswer(questionId, value);
}

function toggleSelectOption(optionElement) {
    const questionContainer = optionElement.closest('.question-container');
    const questionId = questionContainer.dataset.questionId;
    const value = optionElement.dataset.value;

    // Toggle selection
    const isSelected = optionElement.classList.contains('border-blue-500');
    
    if (isSelected) {
        optionElement.classList.remove('border-blue-500', 'bg-blue-50');
        optionElement.querySelector('.select-checkbox').classList.remove('border-blue-500', 'bg-blue-500');
    } else {
        optionElement.classList.add('border-blue-500', 'bg-blue-50');
        optionElement.querySelector('.select-checkbox').classList.add('border-blue-500', 'bg-blue-500');
    }

    // Get all selected values
    const selectedValues = Array.from(questionContainer.querySelectorAll('.select-option.border-blue-500'))
        .map(opt => opt.dataset.value);

    saveAnswer(questionId, selectedValues);
}

function selectSkillLevel(optionElement) {
    const skillRow = optionElement.closest('.skill-rating-row');
    const questionContainer = optionElement.closest('.question-container');
    const questionId = questionContainer.dataset.questionId;
    const skill = skillRow.dataset.skill;
    const level = optionElement.dataset.level;
    const value = parseInt(optionElement.dataset.value);

    // Remove previous selection for this skill
    skillRow.querySelectorAll('.skill-level-button').forEach(btn => {
        btn.classList.remove('border-blue-500', 'bg-blue-500', 'text-white');
        btn.classList.add('border-gray-200');
    });

    // Add selection to clicked option
    const button = optionElement.querySelector('.skill-level-button');
    button.classList.remove('border-gray-200');
    button.classList.add('border-blue-500', 'bg-blue-500', 'text-white');

    // Update level text
    skillRow.querySelector('.skill-level-text').textContent = level;

    // Save answer
    const currentAnswers = assessmentData[questionId] || {};
    currentAnswers[skill] = { level, value };
    saveAnswer(questionId, currentAnswers);
}

function saveTextInput(inputElement) {
    const questionContainer = inputElement.closest('.question-container');
    const questionId = questionContainer.dataset.questionId;
    const value = inputElement.value;

    saveAnswer(questionId, value);
}

function saveAnswer(questionId, value) {
    const sectionId = currentAssessment.sections[currentSectionIndex].id;
    
    if (!assessmentData[sectionId]) {
        assessmentData[sectionId] = {};
    }
    
    assessmentData[sectionId][questionId] = value;
}

function restoreSectionAnswers(section) {
    const sectionData = assessmentData[section.id] || {};
    
    Object.entries(sectionData).forEach(([questionId, value]) => {
        const questionContainer = document.querySelector(`[data-question-id="${questionId}"]`);
        if (!questionContainer) return;

        const question = section.questions.find(q => q.id === questionId);
        if (!question) return;

        switch (question.type) {
            case 'scale':
                const scaleOption = questionContainer.querySelector(`[data-value="${value}"]`);
                if (scaleOption) selectScaleOption(scaleOption);
                break;
                
            case 'multiple-choice':
                const choiceOption = questionContainer.querySelector(`[data-value="${value}"]`);
                if (choiceOption) selectChoiceOption(choiceOption);
                break;
                
            case 'multiple-select':
                if (Array.isArray(value)) {
                    value.forEach(val => {
                        const selectOption = questionContainer.querySelector(`[data-value="${val}"]`);
                        if (selectOption) toggleSelectOption(selectOption);
                    });
                }
                break;
                
            case 'text-input':
                const textInput = questionContainer.querySelector('.text-input');
                if (textInput) textInput.value = value;
                break;
                
            case 'skill-rating':
                if (typeof value === 'object') {
                    Object.entries(value).forEach(([skill, skillData]) => {
                        const skillRow = questionContainer.querySelector(`[data-skill="${skill}"]`);
                        if (skillRow) {
                            const levelOption = skillRow.querySelector(`[data-value="${skillData.value}"]`);
                            if (levelOption) selectSkillLevel(levelOption);
                        }
                    });
                }
                break;
        }
    });
}

function nextSection() {
    if (currentSectionIndex < currentAssessment.sections.length - 1) {
        currentSectionIndex++;
        displaySection();
    } else {
        completeAssessment();
    }
}

function previousSection() {
    if (currentSectionIndex > 0) {
        currentSectionIndex--;
        displaySection();
    }
}

async function completeAssessment() {
    const endTime = new Date();
    const timeSpent = Math.round((endTime - currentAssessment.startTime) / 1000);

    // Calculate results
    const results = calculateAssessmentResults();
    
    // Prepare assessment data for LifeCV
    const assessmentResult = {
        assessmentTitle: 'Comprehensive Life Assessment',
        sections: assessmentData,
        overallScore: results.overallScore,
        insights: results.insights,
        recommendations: results.recommendations,
        strengthsAreas: results.strengthsAreas,
        developmentAreas: results.developmentAreas,
        timeSpent: timeSpent,
        completedAt: endTime.toISOString()
    };

    try {
        // Add to LifeCV
        addAssessmentResult(assessmentResult);
        
        // Save to Firebase
        if (auth.currentUser) {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, {
                assessmentResults: {
                    ...assessmentResult,
                    lastUpdated: serverTimestamp()
                }
            });

            // Log activity
            const activityRef = collection(db, 'users', auth.currentUser.uid, 'activities');
            await addDoc(activityRef, {
                type: 'assessment_completed',
                title: 'Comprehensive Assessment Completed',
                description: `Completed ${currentAssessment.sections.length} sections with overall score of ${results.overallScore}%`,
                module: 'Hub Assessment',
                score: results.overallScore,
                sections: currentAssessment.sections.length,
                timestamp: serverTimestamp()
            });
        }
        
        displayAssessmentResults(results, assessmentResult);
    } catch (error) {
        console.error('Error saving assessment results:', error);
        displayAssessmentResults(results, assessmentResult);
    }
}

function calculateAssessmentResults() {
    const insights = [];
    const recommendations = [];
    const strengthsAreas = [];
    const developmentAreas = [];
    let totalScore = 0;
    let maxScore = 0;

    // Process each section
    Object.entries(assessmentData).forEach(([sectionId, sectionData]) => {
        const section = assessmentSections.find(s => s.id === sectionId);
        if (!section) return;

        Object.entries(sectionData).forEach(([questionId, answer]) => {
            const question = section.questions.find(q => q.id === questionId);
            if (!question) return;

            maxScore++;

            if (question.type === 'scale') {
                totalScore += answer / 10; // Normalize to 1
                if (answer >= 8) {
                    strengthsAreas.push(`High satisfaction in ${section.title}`);
                } else if (answer <= 4) {
                    developmentAreas.push(`Needs attention: ${section.title}`);
                }
            } else if (question.type === 'skill-rating') {
                const skillValues = Object.values(answer);
                const avgSkill = skillValues.reduce((sum, skill) => sum + skill.value, 0) / skillValues.length;
                totalScore += avgSkill / 4; // Normalize to 1
                
                if (avgSkill >= 3) {
                    strengthsAreas.push(`Strong skills in ${section.title}`);
                } else if (avgSkill <= 2) {
                    developmentAreas.push(`Skill development needed: ${section.title}`);
                }
            } else {
                totalScore += 1; // Other question types count as complete
            }
        });
    });

    const overallScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    // Generate insights based on results
    if (overallScore >= 80) {
        insights.push("You demonstrate strong self-awareness and have a clear direction for your personal and professional development.");
    } else if (overallScore >= 60) {
        insights.push("You have good foundations but there are specific areas where focused development could yield significant benefits.");
    } else {
        insights.push("This assessment reveals several opportunities for growth and development across multiple life areas.");
    }

    // Generate recommendations
    if (developmentAreas.length > 0) {
        recommendations.push("Focus on addressing the identified development areas to create a more balanced life approach.");
        recommendations.push("Consider setting specific, measurable goals for your areas of improvement.");
    }

    if (strengthsAreas.length > 0) {
        recommendations.push("Leverage your identified strengths to support your development in weaker areas.");
        recommendations.push("Consider mentoring others in your areas of strength.");
    }

    recommendations.push(
        "Create a personal development plan based on your assessment results.",
        "Regularly reassess your progress and adjust your goals accordingly.",
        "Seek feedback from trusted friends, family, or colleagues to validate your self-assessment."
    );

    return {
        overallScore,
        insights,
        recommendations: recommendations.slice(0, 6),
        strengthsAreas: [...new Set(strengthsAreas)],
        developmentAreas: [...new Set(developmentAreas)]
    };
}

function displayAssessmentResults(results, assessmentData) {
    document.getElementById('assessment-sections').classList.add('hidden');
    
    const resultsContainer = document.getElementById('assessment-results');
    resultsContainer.classList.remove('hidden');
    
    resultsContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-8">
            <!-- Results Header -->
            <div class="text-center mb-8">
                <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-check text-green-600 text-3xl"></i>
                </div>
                <h2 class="text-3xl font-bold text-gray-900 mb-2">Assessment Complete!</h2>
                <p class="text-lg text-gray-600">Your comprehensive results have been added to your LifeCV profile</p>
            </div>

            <!-- Overall Score -->
            <div class="text-center mb-8 p-6 bg-blue-50 rounded-lg">
                <div class="text-4xl font-bold text-blue-600 mb-2">${results.overallScore}%</div>
                <div class="text-lg text-blue-800">Overall Assessment Score</div>
                <div class="text-sm text-blue-600 mt-2">
                    ${Math.round(assessmentData.timeSpent / 60)} minutes completed • ${assessmentSections.length} sections
                </div>
            </div>

            <!-- Key Insights -->
            <div class="mb-8">
                <h3 class="text-xl font-bold text-gray-900 mb-4">Key Insights</h3>
                <div class="space-y-4">
                    ${results.insights.map(insight => `
                        <div class="flex items-start p-4 bg-yellow-50 rounded-lg">
                            <i class="fas fa-lightbulb text-yellow-600 mr-3 mt-1"></i>
                            <span class="text-yellow-800">${insight}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Strengths -->
            ${results.strengthsAreas.length > 0 ? `
                <div class="mb-8">
                    <h3 class="text-xl font-bold text-gray-900 mb-4">Your Strength Areas</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${results.strengthsAreas.map(strength => `
                            <div class="flex items-center p-4 bg-green-50 rounded-lg">
                                <i class="fas fa-star text-green-600 mr-3"></i>
                                <span class="text-green-800">${strength}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- Development Areas -->
            ${results.developmentAreas.length > 0 ? `
                <div class="mb-8">
                    <h3 class="text-xl font-bold text-gray-900 mb-4">Development Opportunities</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${results.developmentAreas.map(area => `
                            <div class="flex items-center p-4 bg-orange-50 rounded-lg">
                                <i class="fas fa-arrow-up text-orange-600 mr-3"></i>
                                <span class="text-orange-800">${area}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- Recommendations -->
            <div class="mb-8">
                <h3 class="text-xl font-bold text-gray-900 mb-4">Personalized Recommendations</h3>
                <div class="space-y-3">
                    ${results.recommendations.map((rec, index) => `
                        <div class="flex items-start p-4 bg-indigo-50 rounded-lg">
                            <span class="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white text-sm font-bold rounded-full flex items-center justify-center mr-3 mt-0.5">${index + 1}</span>
                            <span class="text-indigo-800">${rec}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
                <a href="/modules/life-cv.html" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors">
                    View LifeCV Profile
                </a>
                <a href="/dashboard.html" class="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors">
                    Go to Dashboard
                </a>
                <button onclick="window.location.reload()" class="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                    Retake Assessment
                </button>
            </div>
        </div>
    `;

    // Add goals to LifeCV based on recommendations
    const goalSuggestions = results.recommendations.slice(0, 3).map((rec, index) => ({
        title: `Assessment Goal ${index + 1}`,
        description: rec,
        category: 'Personal Development',
        priority: 'High',
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));

    if (goalSuggestions.length > 0) {
        addGoalsFromAssessment(`assessment_${Date.now()}`, goalSuggestions);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('assessment.html')) {
        initializeAssessment();
    }
});

export { initializeAssessment };