/* ================================================================================= */
/* FILE: assets/js/quiz.js (RE-ENGINEERED)                                           */
/* PURPOSE: A data-driven engine that reads from quiz-database.js to run the quiz.   */
/* ================================================================================= */
import { quizDatabase } from './quiz-database.js';
import { auth } from './firebase-config.js';
import { updateDocument } from './database.js';

let currentUserId = null;
let userState = {};

export function init(user) {
    if (!user || !user.uid) return;
    currentUserId = user.uid;
    console.log("Quiz Engine Initialized.");
    
    document.getElementById('start-quiz-btn').addEventListener('click', startQuiz);
    document.getElementById('retake-quiz-btn').addEventListener('click', startQuiz);
}

function startQuiz() {
    userState = {
        levelIndex: 0,
        categoryIndex: 0,
        questionIndex: 0,
        answers: [],
    };
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('results-screen').style.display = 'none';
    document.getElementById('quiz-questions').style.display = 'block';
    renderCurrentQuestion();
}

function renderCurrentQuestion() {
    const quizContainer = document.getElementById('quiz-questions');
    
    const level = quizDatabase.levels[userState.levelIndex];
    if (!level) { renderCompletion(); return; }

    const category = level.categories[userState.categoryIndex];
    if (!category) {
        userState.levelIndex++;
        userState.categoryIndex = 0;
        renderLevelUp(level);
        return;
    }

    const question = category.questions[userState.questionIndex];
    if (!question) {
        userState.categoryIndex++;
        userState.questionIndex = 0;
        renderCurrentQuestion(); // Move to next category
        return;
    }

    const answersHtml = question.a.map(answer => 
        `<button class="answer-btn block w-full text-left p-4 my-2 bg-slate-100 hover:bg-indigo-100 rounded-lg transition-colors" data-answer-text="${answer}">${answer}</button>`
    ).join('');

    quizContainer.innerHTML = `
        <div class="p-2">
            <p class="text-sm font-semibold text-indigo-600">${level.title} - ${category.name}</p>
            <h2 class="text-xl md:text-2xl font-bold text-slate-800 mt-2">${question.q}</h2>
            <div class="mt-6 space-y-3">${answersHtml}</div>
        </div>
    `;
    
    quizContainer.querySelectorAll('.answer-btn').forEach(btn => {
        btn.addEventListener('click', () => handleAnswer(question.q, btn.dataset.answerText));
    });
}

function handleAnswer(questionText, answerText) {
    userState.answers.push({
        question: questionText,
        answer: answerText,
        level: quizDatabase.levels[userState.levelIndex].title,
        category: quizDatabase.levels[userState.levelIndex].categories[userState.categoryIndex].name,
        timestamp: new Date().toISOString()
    });
    userState.questionIndex++;
    renderCurrentQuestion();
}

function renderLevelUp(completedLevel) {
    const quizContainer = document.getElementById('quiz-questions');
    quizContainer.innerHTML = `
        <div class="text-center p-6">
            <i class="fas fa-trophy text-5xl text-yellow-400"></i>
            <h2 class="text-3xl font-bold mt-4">Level Complete!</h2>
            <p class="text-slate-600 mt-2">You've completed the "${completedLevel.title}" level.</p>
            <button id="next-level-btn" class="mt-6 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg w-full">Continue to Next Level</button>
        </div>
    `;
    document.getElementById('next-level-btn').addEventListener('click', renderCurrentQuestion);
}

async function renderCompletion() {
    const quizContainer = document.getElementById('quiz-questions');
    const resultsScreen = document.getElementById('results-screen');
    const summaryEl = document.getElementById('quiz-results-summary');

    summaryEl.innerHTML = userState.answers.map(ans => 
        `<div class="p-3 bg-slate-50 rounded-md"><p class="text-xs text-slate-500">${ans.category}</p><p class="font-semibold">${ans.question}</p><p class="text-indigo-700">${ans.answer}</p></div>`
    ).join('');
    
    quizContainer.style.display = 'none';
    resultsScreen.style.display = 'block';

    try {
        await updateDocument(`users/${currentUserId}`, {
            quizResults: {
                answers: userState.answers,
                completedAt: new Date().toISOString()
            }
        });
        console.log("Quiz results saved to user profile.");
    } catch (error) {
        console.error("Failed to save quiz results:", error);
    }
}
