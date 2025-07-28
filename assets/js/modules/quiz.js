/* ================================================================================= */
/* FILE: assets/js/modules/quiz.js (ENHANCED - LifeCV Integration)                  */
/* ================================================================================= */
import { auth, db } from '../firebase-config.js';
import { doc, updateDoc, serverTimestamp, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { addQuizResult, addGoalsFromAssessment } from '../services/life-cv-data-service.js';

let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let startTime = null;
let quizTimer = null;

// Quiz questions database
const quizQuestions = [
    {
        id: 1,
        category: 'Personal Development',
        question: "What motivates you most in your personal growth journey?",
        type: 'multiple-choice',
        options: [
            { id: 'a', text: 'Achieving career goals', weight: { career: 3, personal: 1 } },
            { id: 'b', text: 'Building meaningful relationships', weight: { social: 3, personal: 2 } },
            { id: 'c', text: 'Learning new skills and knowledge', weight: { learning: 3, personal: 2 } },
            { id: 'd', text: 'Making a positive impact on others', weight: { social: 2, purpose: 3 } }
        ]
    },
    {
        id: 2,
        category: 'Career Planning',
        question: "How do you prefer to learn new skills?",
        type: 'multiple-choice',
        options: [
            { id: 'a', text: 'Hands-on practice and experimentation', weight: { practical: 3, learning: 2 } },
            { id: 'b', text: 'Structured courses and formal education', weight: { academic: 3, learning: 2 } },
            { id: 'c', text: 'Mentorship and guidance from experts', weight: { social: 2, learning: 3 } },
            { id: 'd', text: 'Self-study and research', weight: { independent: 3, learning: 2 } }
        ]
    },
    {
        id: 3,
        category: 'Communication',
        question: "In group settings, you typically:",
        type: 'multiple-choice',
        options: [
            { id: 'a', text: 'Take charge and lead discussions', weight: { leadership: 3, social: 2 } },
            { id: 'b', text: 'Listen carefully and contribute thoughtfully', weight: { analytical: 2, social: 2 } },
            { id: 'c', text: 'Ask questions to understand better', weight: { curious: 3, learning: 2 } },
            { id: 'd', text: 'Support others and help build consensus', weight: { collaborative: 3, social: 2 } }
        ]
    },
    {
        id: 4,
        category: 'Problem Solving',
        question: "When faced with a complex problem, your first instinct is to:",
        type: 'multiple-choice',
        options: [
            { id: 'a', text: 'Break it down into smaller, manageable parts', weight: { analytical: 3, practical: 2 } },
            { id: 'b', text: 'Research similar problems and solutions', weight: { research: 3, learning: 2 } },
            { id: 'c', text: 'Brainstorm creative alternatives', weight: { creative: 3, innovative: 2 } },
            { id: 'd', text: 'Seek input from others', weight: { collaborative: 3, social: 1 } }
        ]
    },
    {
        id: 5,
        category: 'Work Style',
        question: "What type of work environment energizes you most?",
        type: 'multiple-choice',
        options: [
            { id: 'a', text: 'Fast-paced, dynamic environments', weight: { energetic: 3, adaptable: 2 } },
            { id: 'b', text: 'Quiet, focused workspaces', weight: { analytical: 2, independent: 3 } },
            { id: 'c', text: 'Collaborative, team-oriented settings', weight: { social: 3, collaborative: 2 } },
            { id: 'd', text: 'Flexible, autonomous environments', weight: { independent: 3, adaptable: 2 } }
        ]
    },
    {
        id: 6,
        category: 'Goal Setting',
        question: "How do you approach setting and achieving goals?",
        type: 'multiple-choice',
        options: [
            { id: 'a', text: 'Set detailed plans with specific milestones', weight: { organized: 3, practical: 2 } },
            { id: 'b', text: 'Focus on the big picture and adapt as needed', weight: { visionary: 3, adaptable: 2 } },
            { id: 'c', text: 'Collaborate with others to set shared objectives', weight: { collaborative: 3, social: 1 } },
            { id: 'd', text: 'Set challenging goals that push boundaries', weight: { ambitious: 3, innovative: 2 } }
        ]
    },
    {
        id: 7,
        category: 'Stress Management',
        question: "How do you typically handle stress and pressure?",
        type: 'multiple-choice',
        options: [
            { id: 'a', text: 'Stay calm and work through problems systematically', weight: { resilient: 3, analytical: 2 } },
            { id: 'b', text: 'Take breaks and engage in stress-relief activities', weight: { balanced: 3, self_aware: 2 } },
            { id: 'c', text: 'Talk through challenges with trusted friends', weight: { social: 2, collaborative: 2 } },
            { id: 'd', text: 'Channel stress into motivation and action', weight: { energetic: 3, resilient: 1 } }
        ]
    },
    {
        id: 8,
        category: 'Innovation',
        question: "What's your approach to trying new things?",
        type: 'multiple-choice',
        options: [
            { id: 'a', text: 'Carefully research before making changes', weight: { cautious: 2, research: 3 } },
            { id: 'b', text: 'Embrace new experiences enthusiastically', weight: { adventurous: 3, adaptable: 2 } },
            { id: 'c', text: 'Test new ideas on a small scale first', weight: { practical: 3, analytical: 2 } },
            { id: 'd', text: 'Learn from others who have tried similar things', weight: { social: 2, learning: 3 } }
        ]
    },
    {
        id: 9,
        category: 'Leadership',
        question: "What leadership style resonates most with you?",
        type: 'multiple-choice',
        options: [
            { id: 'a', text: 'Leading by example and setting standards', weight: { leadership: 3, principled: 2 } },
            { id: 'b', text: 'Inspiring and motivating others toward a vision', weight: { inspirational: 3, visionary: 2 } },
            { id: 'c', text: 'Supporting team members to reach their potential', weight: { supportive: 3, collaborative: 2 } },
            { id: 'd', text: 'Making data-driven decisions for the team', weight: { analytical: 3, practical: 2 } }
        ]
    },
    {
        id: 10,
        category: 'Personal Values',
        question: "What matters most to you in your personal and professional life?",
        type: 'multiple-choice',
        options: [
            { id: 'a', text: 'Achievement and recognition for excellence', weight: { ambitious: 3, achievement: 3 } },
            { id: 'b', text: 'Balance and well-being in all aspects of life', weight: { balanced: 3, self_aware: 2 } },
            { id: 'c', text: 'Making meaningful contributions to society', weight: { purpose: 3, social: 2 } },
            { id: 'd', text: 'Continuous learning and personal growth', weight: { learning: 3, growth: 3 } }
        ]
    }
];

// Initialize quiz
export function initializeQuiz() {
    console.log('Quiz module initialized');
    setupQuizInterface();
    bindQuizEvents();
}

function setupQuizInterface() {
    const quizContainer = document.getElementById('quiz-container');
    if (!quizContainer) return;

    quizContainer.innerHTML = `
        <div class="max-w-4xl mx-auto">
            <!-- Quiz Header -->
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-4">Personal Development Assessment</h1>
                <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                    Discover your strengths, learning style, and areas for growth. Your results will be added to your LifeCV profile.
                </p>
            </div>

            <!-- Quiz Start Screen -->
            <div id="quiz-start" class="bg-white rounded-lg shadow-lg p-8 text-center">
                <div class="mb-6">
                    <i class="fas fa-brain text-6xl text-indigo-600 mb-4"></i>
                    <h2 class="text-2xl font-bold text-gray-900 mb-4">Ready to Begin?</h2>
                    <p class="text-gray-600 mb-6">
                        This assessment contains ${quizQuestions.length} questions and should take about 10-15 minutes to complete.
                        Your answers will help us provide personalized recommendations for your development journey.
                    </p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div class="p-4 bg-indigo-50 rounded-lg">
                        <i class="fas fa-clock text-indigo-600 text-2xl mb-2"></i>
                        <h3 class="font-semibold text-gray-900">Duration</h3>
                        <p class="text-sm text-gray-600">10-15 minutes</p>
                    </div>
                    <div class="p-4 bg-green-50 rounded-lg">
                        <i class="fas fa-chart-line text-green-600 text-2xl mb-2"></i>
                        <h3 class="font-semibold text-gray-900">Insights</h3>
                        <p class="text-sm text-gray-600">Personalized recommendations</p>
                    </div>
                    <div class="p-4 bg-purple-50 rounded-lg">
                        <i class="fas fa-id-card text-purple-600 text-2xl mb-2"></i>
                        <h3 class="font-semibold text-gray-900">LifeCV</h3>
                        <p class="text-sm text-gray-600">Results saved to profile</p>
                    </div>
                </div>

                <button id="start-quiz-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
                    Start Assessment
                </button>
            </div>

            <!-- Quiz Questions -->
            <div id="quiz-questions" class="hidden">
                <div class="bg-white rounded-lg shadow-lg p-8">
                    <!-- Progress Bar -->
                    <div class="mb-6">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-sm font-medium text-gray-700">Progress</span>
                            <span id="question-counter" class="text-sm text-gray-500">1 of ${quizQuestions.length}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div id="progress-bar" class="bg-indigo-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                        </div>
                    </div>

                    <!-- Question -->
                    <div id="question-content">
                        <!-- Dynamic question content -->
                    </div>

                    <!-- Navigation -->
                    <div class="flex justify-between mt-8">
                        <button id="prev-btn" class="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            Previous
                        </button>
                        <button id="next-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <!-- Quiz Results -->
            <div id="quiz-results" class="hidden">
                <!-- Dynamic results content -->
            </div>
        </div>
    `;
}

function bindQuizEvents() {
    const startBtn = document.getElementById('start-quiz-btn');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');

    if (startBtn) {
        startBtn.addEventListener('click', startQuiz);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', nextQuestion);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', previousQuestion);
    }
}

function startQuiz() {
    currentQuiz = {
        questions: [...quizQuestions],
        answers: [],
        startTime: new Date()
    };
    
    currentQuestionIndex = 0;
    userAnswers = [];
    startTime = new Date();

    document.getElementById('quiz-start').classList.add('hidden');
    document.getElementById('quiz-questions').classList.remove('hidden');

    displayQuestion();
}

function displayQuestion() {
    const question = currentQuiz.questions[currentQuestionIndex];
    const questionContent = document.getElementById('question-content');
    const questionCounter = document.getElementById('question-counter');
    const progressBar = document.getElementById('progress-bar');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    // Update progress
    const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;
    progressBar.style.width = `${progress}%`;
    questionCounter.textContent = `${currentQuestionIndex + 1} of ${currentQuiz.questions.length}`;

    // Enable/disable navigation buttons
    prevBtn.disabled = currentQuestionIndex === 0;
    
    // Check if current question is answered
    const isAnswered = userAnswers[currentQuestionIndex] !== undefined;
    nextBtn.disabled = !isAnswered;
    
    if (currentQuestionIndex === currentQuiz.questions.length - 1) {
        nextBtn.textContent = 'Complete Assessment';
    } else {
        nextBtn.textContent = 'Next';
    }

    // Display question
    questionContent.innerHTML = `
        <div class="mb-6">
            <div class="text-sm text-indigo-600 font-medium mb-2">${question.category}</div>
            <h3 class="text-xl font-semibold text-gray-900 mb-6">${question.question}</h3>
            
            <div class="space-y-3">
                ${question.options.map((option, index) => `
                    <label class="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors question-option" data-option="${option.id}">
                        <input type="radio" name="question-${question.id}" value="${option.id}" class="sr-only">
                        <div class="w-4 h-4 border-2 border-gray-300 rounded-full mr-4 option-radio"></div>
                        <span class="text-gray-700">${option.text}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `;

    // Bind option selection
    const options = questionContent.querySelectorAll('.question-option');
    options.forEach(option => {
        option.addEventListener('click', () => selectOption(option));
    });

    // Restore previous answer if exists
    if (userAnswers[currentQuestionIndex]) {
        const selectedOption = questionContent.querySelector(`[data-option="${userAnswers[currentQuestionIndex]}"]`);
        if (selectedOption) {
            selectOption(selectedOption, false);
        }
    }
}

function selectOption(optionElement, updateAnswer = true) {
    // Remove previous selection
    const allOptions = document.querySelectorAll('.question-option');
    allOptions.forEach(opt => {
        opt.classList.remove('border-indigo-500', 'bg-indigo-50');
        opt.querySelector('.option-radio').classList.remove('border-indigo-500', 'bg-indigo-500');
    });

    // Add selection to clicked option
    optionElement.classList.add('border-indigo-500', 'bg-indigo-50');
    optionElement.querySelector('.option-radio').classList.add('border-indigo-500', 'bg-indigo-500');

    if (updateAnswer) {
        userAnswers[currentQuestionIndex] = optionElement.dataset.option;
        document.getElementById('next-btn').disabled = false;
    }
}

function nextQuestion() {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        completeQuiz();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

async function completeQuiz() {
    const endTime = new Date();
    const timeSpent = Math.round((endTime - startTime) / 1000); // in seconds

    // Calculate results
    const results = calculateQuizResults();
    
    // Prepare quiz data for LifeCV
    const quizData = {
        quizTitle: 'Personal Development Assessment',
        score: results.score,
        totalQuestions: currentQuiz.questions.length,
        timeSpent: timeSpent,
        answers: userAnswers,
        results: results,
        categoryBreakdown: results.categoryBreakdown,
        personalityProfile: results.personalityProfile,
        strengths: results.strengths,
        recommendations: results.recommendations,
        insights: results.insights,
        completedAt: endTime.toISOString()
    };

    try {
        // Add to LifeCV
        addQuizResult(quizData);
        
        // Save to Firebase user document
        if (auth.currentUser) {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, {
                quizResults: {
                    ...quizData,
                    lastUpdated: serverTimestamp()
                }
            });

            // Log activity
            const activityRef = collection(db, 'users', auth.currentUser.uid, 'activities');
            await addDoc(activityRef, {
                type: 'quiz_completed',
                title: 'Assessment Quiz Completed',
                description: `Scored ${results.score}/${currentQuiz.questions.length} on Personal Development Assessment`,
                module: 'Hub Quiz',
                score: results.score,
                maxScore: currentQuiz.questions.length,
                percentage: Math.round((results.score / currentQuiz.questions.length) * 100),
                timestamp: serverTimestamp()
            });
        }
        
        displayResults(results, quizData);
    } catch (error) {
        console.error('Error saving quiz results:', error);
        displayResults(results, quizData);
    }
}

function calculateQuizResults() {
    const traitScores = {};
    const categoryScores = {};
    let totalScore = 0;

    // Process each answer
    userAnswers.forEach((answerKey, questionIndex) => {
        const question = currentQuiz.questions[questionIndex];
        const selectedOption = question.options.find(opt => opt.id === answerKey);
        
        if (selectedOption) {
            totalScore++;
            
            // Count category
            categoryScores[question.category] = (categoryScores[question.category] || 0) + 1;
            
            // Add trait weights
            if (selectedOption.weight) {
                Object.entries(selectedOption.weight).forEach(([trait, weight]) => {
                    traitScores[trait] = (traitScores[trait] || 0) + weight;
                });
            }
        }
    });

    // Determine dominant traits
    const sortedTraits = Object.entries(traitScores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

    // Generate personality profile
    const personalityProfile = generatePersonalityProfile(sortedTraits);
    
    // Generate strengths based on top traits
    const strengths = generateStrengths(sortedTraits);
    
    // Generate recommendations
    const recommendations = generateRecommendations(sortedTraits, categoryScores);
    
    // Generate insights
    const insights = generateInsights(sortedTraits, categoryScores);

    return {
        score: totalScore,
        traitScores,
        categoryBreakdown: categoryScores,
        personalityProfile,
        strengths,
        recommendations,
        insights,
        dominantTraits: sortedTraits.map(([trait]) => trait)
    };
}

function generatePersonalityProfile(sortedTraits) {
    const topTrait = sortedTraits[0]?.[0];
    const profiles = {
        leadership: "Natural Leader - You have strong leadership qualities and enjoy guiding others toward success.",
        analytical: "Analytical Thinker - You approach challenges methodically and value data-driven decisions.",
        creative: "Creative Innovator - You think outside the box and bring fresh perspectives to problems.",
        collaborative: "Team Player - You excel in collaborative environments and value group harmony.",
        learning: "Lifelong Learner - You have an insatiable curiosity and love acquiring new knowledge.",
        adaptable: "Adaptable Professional - You thrive in changing environments and embrace new challenges.",
        independent: "Independent Worker - You work best with autonomy and self-direction.",
        social: "People Person - You energize from interactions and build strong relationships.",
        practical: "Practical Problem-Solver - You focus on realistic, actionable solutions.",
        ambitious: "Achievement-Oriented - You set high goals and work persistently to achieve them."
    };
    
    return profiles[topTrait] || "Balanced Individual - You demonstrate a well-rounded approach to personal and professional development.";
}

function generateStrengths(sortedTraits) {
    const strengthMap = {
        leadership: ["Leading teams and projects", "Strategic thinking", "Decision making under pressure"],
        analytical: ["Problem analysis", "Data interpretation", "Logical reasoning"],
        creative: ["Innovation and ideation", "Artistic expression", "Finding unique solutions"],
        collaborative: ["Team building", "Conflict resolution", "Communication"],
        learning: ["Knowledge acquisition", "Skill development", "Research and analysis"],
        adaptable: ["Change management", "Flexibility", "Resilience"],
        independent: ["Self-motivation", "Autonomous work", "Initiative taking"],
        social: ["Relationship building", "Networking", "Emotional intelligence"],
        practical: ["Implementation", "Resource management", "Efficiency"],
        ambitious: ["Goal setting", "Persistence", "Achievement drive"]
    };
    
    const strengths = [];
    sortedTraits.slice(0, 3).forEach(([trait]) => {
        if (strengthMap[trait]) {
            strengths.push(...strengthMap[trait]);
        }
    });
    
    return [...new Set(strengths)].slice(0, 6);
}

function generateRecommendations(sortedTraits, categoryScores) {
    const recommendations = [];
    const topTrait = sortedTraits[0]?.[0];
    
    // Trait-based recommendations
    const traitRecommendations = {
        leadership: [
            "Consider taking on leadership roles in projects or organizations",
            "Develop management and delegation skills",
            "Seek mentorship opportunities to guide others"
        ],
        analytical: [
            "Explore data analysis or research-oriented roles",
            "Develop proficiency in analytical tools and software",
            "Consider advanced education in quantitative fields"
        ],
        creative: [
            "Pursue creative projects and artistic endeavors",
            "Explore design thinking and innovation methodologies",
            "Consider roles that allow for creative expression"
        ],
        collaborative: [
            "Seek team-based work environments",
            "Develop facilitation and group dynamics skills",
            "Consider human resources or organizational development"
        ],
        learning: [
            "Pursue continuous education and certification programs",
            "Explore teaching or training opportunities",
            "Consider research or academic career paths"
        ]
    };
    
    if (traitRecommendations[topTrait]) {
        recommendations.push(...traitRecommendations[topTrait]);
    }
    
    // Add general growth recommendations
    recommendations.push(
        "Set specific, measurable goals for personal development",
        "Seek feedback regularly to identify blind spots",
        "Build a diverse professional network"
    );
    
    return recommendations.slice(0, 6);
}

function generateInsights(sortedTraits, categoryScores) {
    const insights = [];
    const topCategories = Object.entries(categoryScores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2);
    
    insights.push(
        `Your strongest trait is ${sortedTraits[0]?.[0]?.replace('_', ' ') || 'balanced approach'}, indicating a natural inclination toward this area.`,
        `You show particular interest in ${topCategories[0]?.[0] || 'various areas'}, suggesting this could be a focus area for development.`
    );
    
    if (sortedTraits.length >= 3) {
        insights.push(
            `Your combination of ${sortedTraits[0][0]}, ${sortedTraits[1][0]}, and ${sortedTraits[2][0]} traits creates a unique professional profile.`
        );
    }
    
    return insights;
}

function displayResults(results, quizData) {
    document.getElementById('quiz-questions').classList.add('hidden');
    
    const resultsContainer = document.getElementById('quiz-results');
    resultsContainer.classList.remove('hidden');
    
    const percentage = Math.round((results.score / currentQuiz.questions.length) * 100);
    
    resultsContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-8">
            <!-- Results Header -->
            <div class="text-center mb-8">
                <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-check text-green-600 text-3xl"></i>
                </div>
                <h2 class="text-3xl font-bold text-gray-900 mb-2">Assessment Complete!</h2>
                <p class="text-lg text-gray-600">Your results have been added to your LifeCV profile</p>
            </div>

            <!-- Score Summary -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="text-center p-6 bg-indigo-50 rounded-lg">
                    <div class="text-3xl font-bold text-indigo-600 mb-2">${results.score}/${currentQuiz.questions.length}</div>
                    <div class="text-sm text-gray-600">Questions Answered</div>
                </div>
                <div class="text-center p-6 bg-green-50 rounded-lg">
                    <div class="text-3xl font-bold text-green-600 mb-2">${percentage}%</div>
                    <div class="text-sm text-gray-600">Completion Rate</div>
                </div>
                <div class="text-center p-6 bg-purple-50 rounded-lg">
                    <div class="text-3xl font-bold text-purple-600 mb-2">${Math.round(quizData.timeSpent / 60)}</div>
                    <div class="text-sm text-gray-600">Minutes Spent</div>
                </div>
            </div>

            <!-- Personality Profile -->
            <div class="mb-8">
                <h3 class="text-xl font-bold text-gray-900 mb-4">Your Personality Profile</h3>
                <div class="p-6 bg-blue-50 rounded-lg">
                    <p class="text-lg text-blue-900 font-medium">${results.personalityProfile}</p>
                </div>
            </div>

            <!-- Strengths -->
            <div class="mb-8">
                <h3 class="text-xl font-bold text-gray-900 mb-4">Your Key Strengths</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${results.strengths.map(strength => `
                        <div class="flex items-center p-4 bg-green-50 rounded-lg">
                            <i class="fas fa-star text-green-600 mr-3"></i>
                            <span class="text-green-800">${strength}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Insights -->
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

            <!-- Recommendations -->
            <div class="mb-8">
                <h3 class="text-xl font-bold text-gray-900 mb-4">Development Recommendations</h3>
                <div class="space-y-3">
                    ${results.recommendations.map((rec, index) => `
                        <div class="flex items-start p-4 bg-indigo-50 rounded-lg">
                            <span class="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white text-sm font-bold rounded-full flex items-center justify-center mr-3 mt-0.5">${index + 1}</span>
                            <span class="text-indigo-800">${rec}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Category Breakdown -->
            <div class="mb-8">
                <h3 class="text-xl font-bold text-gray-900 mb-4">Focus Areas</h3>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    ${Object.entries(results.categoryBreakdown).map(([category, count]) => `
                        <div class="text-center p-4 bg-gray-50 rounded-lg">
                            <div class="text-2xl font-bold text-gray-900">${count}</div>
                            <div class="text-sm text-gray-600">${category}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
                <a href="modules/life-cv.html" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors">
                    View LifeCV Profile
                </a>
                <a href="dashboard.html" class="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors">
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
        title: `Development Goal ${index + 1}`,
        description: rec,
        category: 'Personal Development',
        priority: 'Medium',
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 90 days from now
    }));

    if (goalSuggestions.length > 0) {
        addGoalsFromAssessment(`quiz_${Date.now()}`, goalSuggestions);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('quiz.html')) {
        initializeQuiz();
    }
});

export { initializeQuiz };