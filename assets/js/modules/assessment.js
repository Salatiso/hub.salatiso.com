/* ================================================================================= */
/* FILE: assets/js/modules/assessment.js (ENHANCED - LifeCV Integration)            */
/* ================================================================================= */
import { auth, db } from '../firebase-config.js';
import { doc, updateDoc, serverTimestamp, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { addAssessmentResult, addGoalsFromAssessment } from '../services/life-cv-data-service.js';

let currentAssessment = null;
let currentSectionIndex = 0;
let assessmentData = {};

// Assessment configuration
const assessmentSections = [
    {
        id: 'career',
        title: 'Career & Professional Development',
        description: 'Assess your career goals, professional skills, and workplace preferences',
        questions: [
            {
                id: 'career_satisfaction',
                type: 'scale',
                question: 'How satisfied are you with your current career path?',
                scale: { min: 1, max: 10, labels: ['Very Dissatisfied', 'Very Satisfied'] }
            },
            {
                id: 'skill_development',
                type: 'multiple-choice',
                question: 'Which area would you most like to develop professionally?',
                options: [
                    { id: 'technical', text: 'Technical/Hard Skills', weight: { technical: 3 } },
                    { id: 'leadership', text: 'Leadership & Management', weight: { leadership: 3 } },
                    { id: 'communication', text: 'Communication & Interpersonal', weight: { communication: 3 } },
                    { id: 'creative', text: 'Creative & Innovation', weight: { creative: 3 } }
                ]
            },
            {
                id: 'work_environment',
                type: 'multiple-select',
                question: 'What work environment characteristics are important to you? (Select all that apply)',
                options: [
                    { id: 'flexibility', text: 'Flexible schedule/remote work' },
                    { id: 'collaboration', text: 'Collaborative team environment' },
                    { id: 'autonomy', text: 'Independence and autonomy' },
                    { id: 'growth', text: 'Opportunities for advancement' },
                    { id: 'innovation', text: 'Cutting-edge technology/innovation' },
                    { id: 'stability', text: 'Job security and stability' }
                ]
            }
        ]
    },
    {
        id: 'personal',
        title: 'Personal Growth & Life Balance',
        description: 'Evaluate your personal development goals and life satisfaction',
        questions: [
            {
                id: 'life_satisfaction',
                type: 'scale',
                question: 'Overall, how satisfied are you with your current life situation?',
                scale: { min: 1, max: 10, labels: ['Very Dissatisfied', 'Very Satisfied'] }
            },
            {
                id: 'personal_priorities',
                type: 'ranking',
                question: 'Rank these life areas by importance to you (1 = most important)',
                options: [
                    { id: 'family', text: 'Family & Relationships' },
                    { id: 'career', text: 'Career & Professional Growth' },
                    { id: 'health', text: 'Health & Wellness' },
                    { id: 'financial', text: 'Financial Security' },
                    { id: 'personal', text: 'Personal Development' },
                    { id: 'recreation', text: 'Hobbies & Recreation' }
                ]
            },
            {
                id: 'stress_management',
                type: 'multiple-choice',
                question: 'How do you typically manage stress and challenges?',
                options: [
                    { id: 'problem_solving', text: 'Focus on problem-solving and action', weight: { practical: 3 } },
                    { id: 'social_support', text: 'Seek support from friends and family', weight: { social: 3 } },
                    { id: 'self_care', text: 'Engage in self-care activities', weight: { balanced: 3 } },
                    { id: 'professional_help', text: 'Seek professional guidance', weight: { proactive: 3 } }
                ]
            }
        ]
    },
    {
        id: 'skills',
        title: 'Skills & Competencies Assessment',
        description: 'Rate your current skills and identify areas for improvement',
        questions: [
            {
                id: 'technical_skills',
                type: 'skill-rating',
                question: 'Rate your proficiency in these technical areas:',
                skills: [
                    'Computer/Digital Literacy',
                    'Data Analysis',
                    'Project Management',
                    'Research & Information Gathering',
                    'Financial Management',
                    'Time Management'
                ]
            },
            {
                id: 'soft_skills',
                type: 'skill-rating',
                question: 'Rate your proficiency in these interpersonal skills:',
                skills: [
                    'Communication',
                    'Leadership',
                    'Teamwork',
                    'Problem Solving',
                    'Adaptability',
                    'Emotional Intelligence'
                ]
            },
            {
                id: 'learning_style',
                type: 'multiple-choice',
                question: 'How do you prefer to learn new skills?',
                options: [
                    { id: 'hands_on', text: 'Hands-on practice and experimentation', weight: { practical: 3 } },
                    { id: 'structured', text: 'Structured courses and formal training', weight: { academic: 3 } },
                    { id: 'mentoring', text: 'Mentoring and one-on-one guidance', weight: { social: 3 } },
                    { id: 'self_directed', text: 'Self-directed research and study', weight: { independent: 3 } }
                ]
            }
        ]
    },
    {
        id: 'goals',
        title: 'Goals & Future Planning',
        description: 'Define your short-term and long-term objectives',
        questions: [
            {
                id: 'short_term_goals',
                type: 'text-input',
                question: 'What are your main goals for the next 6-12 months?',
                placeholder: 'Describe 2-3 specific goals you want to achieve...'
            },
            {
                id: 'long_term_vision',
                type: 'text-input',
                question: 'Where do you see yourself in 5-10 years?',
                placeholder: 'Describe your long-term vision for your career and life...'
            },
            {
                id: 'goal_obstacles',
                type: 'multiple-select',
                question: 'What obstacles might prevent you from achieving your goals? (Select all that apply)',
                options: [
                    { id: 'time', text: 'Lack of time' },
                    { id: 'resources', text: 'Limited financial resources' },
                    { id: 'skills', text: 'Need to develop new skills' },
                    { id: 'confidence', text: 'Self-confidence or motivation' },
                    { id: 'support', text: 'Lack of support system' },
                    { id: 'opportunities', text: 'Limited opportunities' }
                ]
            },
            {
                id: 'success_measurement',
                type: 'multiple-choice',
                question: 'How do you primarily measure success?',
                options: [
                    { id: 'achievement', text: 'Achieving specific goals and milestones', weight: { achievement: 3 } },
                    { id: 'growth', text: 'Personal growth and learning', weight: { learning: 3 } },
                    { id: 'impact', text: 'Positive impact on others', weight: { social: 3 } },
                    { id: 'balance', text: 'Maintaining work-life balance', weight: { balanced: 3 } }
                ]
            }
        ]
    }
];

// Initialize assessment
export function initializeAssessment() {
    console.log('Assessment module initialized');
    setupAssessmentInterface();
    bindAssessmentEvents();
}

function setupAssessmentInterface() {
    const assessmentContainer = document.getElementById('assessment-container');
    if (!assessmentContainer) return;

    assessmentContainer.innerHTML = `
        <div class="max-w-4xl mx-auto">
            <!-- Assessment Header -->
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-4">Comprehensive Life Assessment</h1>
                <p class="text-lg text-gray-600 max-w-3xl mx-auto">
                    A comprehensive evaluation of your career, personal development, skills, and future goals. 
                    Results will be integrated into your LifeCV profile with personalized recommendations.
                </p>
            </div>

            <!-- Assessment Start Screen -->
            <div id="assessment-start" class="bg-white rounded-lg shadow-lg p-8">
                <div class="text-center mb-8">
                    <i class="fas fa-clipboard-list text-6xl text-blue-600 mb-4"></i>
                    <h2 class="text-2xl font-bold text-gray-900 mb-4">Ready to Begin Your Assessment?</h2>
                    <p class="text-gray-600 mb-6">
                        This comprehensive assessment consists of ${assessmentSections.length} sections and should take about 20-30 minutes to complete.
                    </p>
                </div>

                <!-- Section Overview -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    ${assessmentSections.map((section, index) => `
                        <div class="p-6 border-2 border-gray-200 rounded-lg">
                            <div class="flex items-center mb-3">
                                <span class="w-8 h-8 bg-blue-600 text-white font-bold rounded-full flex items-center justify-center mr-3">${index + 1}</span>
                                <h3 class="font-semibold text-gray-900">${section.title}</h3>
                            </div>
                            <p class="text-sm text-gray-600">${section.description}</p>
                            <div class="mt-3">
                                <span class="text-xs text-gray-500">${section.questions.length} questions</span>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Benefits -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div class="text-center p-4 bg-blue-50 rounded-lg">
                        <i class="fas fa-chart-line text-blue-600 text-2xl mb-2"></i>
                        <h4 class="font-semibold text-gray-900">Personalized Insights</h4>
                        <p class="text-sm text-gray-600">Get detailed analysis of your strengths and areas for growth</p>
                    </div>
                    <div class="text-center p-4 bg-green-50 rounded-lg">
                        <i class="fas fa-bullseye text-green-600 text-2xl mb-2"></i>
                        <h4 class="font-semibold text-gray-900">Goal Setting</h4>
                        <p class="text-sm text-gray-600">Receive specific, actionable goals based on your responses</p>
                    </div>
                    <div class="text-center p-4 bg-purple-50 rounded-lg">
                        <i class="fas fa-id-card text-purple-600 text-2xl mb-2"></i>
                        <h4 class="font-semibold text-gray-900">LifeCV Integration</h4>
                        <p class="text-sm text-gray-600">Results automatically added to your profile</p>
                    </div>
                </div>

                <div class="text-center">
                    <button id="start-assessment-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
                        Start Assessment
                    </button>
                </div>
            </div>

            <!-- Assessment Sections -->
            <div id="assessment-sections" class="hidden">
                <div class="bg-white rounded-lg shadow-lg p-8">
                    <!-- Progress Indicator -->
                    <div class="mb-8">
                        <div class="flex justify-between items-center mb-4">
                            <h2 id="section-title" class="text-2xl font-bold text-gray-900"></h2>
                            <span id="section-counter" class="text-sm text-gray-500">Section 1 of ${assessmentSections.length}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div id="section-progress" class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                        </div>
                        <p id="section-description" class="text-gray-600 mt-2"></p>
                    </div>

                    <!-- Section Content -->
                    <div id="section-content">
                        <!-- Dynamic section content -->
                    </div>

                    <!-- Navigation -->
                    <div class="flex justify-between mt-8">
                // filepath: e:\Google Drive\@Work\Web Development\GitHub\hub.salatiso.com\assets\js\modules\assessment.js
