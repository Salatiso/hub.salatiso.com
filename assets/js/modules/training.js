/* ================================================================================= */
/* FILE: assets/js/modules/training.js (NEW - REPLACES PLACEHOLDER)                  */
/* ================================================================================= */
import { auth } from '../firebase-config.js';
// For v2, we'd use:
// import { getDocument, updateDocument } from '../database.js';

// --- LOCAL DATA FOR V1 ---
const coursesData = [
    {
        id: 'course001',
        title: 'Introduction to Financial Literacy',
        category: 'Finance',
        icon: 'fa-chart-pie',
        description: 'Learn the fundamentals of personal budgeting, saving, and investing to build a secure financial future.',
        content: `
            <h2 class="text-3xl font-bold mb-4">Module 1: The Art of Budgeting</h2>
            <p class="mb-4">A budget is not a restriction; it's a plan for your freedom. The first step to building wealth is telling your money where to go, instead of wondering where it went.</p>
            <ul class="space-y-2 mb-6">
                <li><strong>Track Your Spending:</strong> For one month, write down every single cent you spend. Use the FinHelp tool for this.</li>
                <li><strong>Categorize Expenses:</strong> Group your spending into categories like Housing, Transport, Food, and Entertainment.</li>
                <li><strong>Set Goals:</strong> Create a zero-based budget where your income minus your expenses equals zero. Every Rand has a job.</li>
            </ul>
            <h2 class="text-3xl font-bold mb-4">Module 2: Understanding Assets vs. Liabilities</h2>
            <p>In simple terms, assets put money in your pocket, and liabilities take money out. The goal is to acquire more assets.</p>
        `
    },
    {
        id: 'course002',
        title: 'Effective Communication Strategies',
        category: 'Personal Development',
        icon: 'fa-comments',
        description: 'Master the art of clear, confident, and empathetic communication in both personal and professional settings.',
        content: `
            <h2 class="text-3xl font-bold mb-4">Principle 1: Listen to Understand, Not Just to Reply</h2>
            <p class="mb-4">Most people do not listen with the intent to understand; they listen with the intent to reply. Active listening is a skill that requires you to be present and engaged in the conversation.</p>
            <h2 class="text-3xl font-bold mb-4">Principle 2: Non-Verbal Communication</h2>
            <p>Your body language, tone of voice, and eye contact often say more than your words. Be mindful of the signals you are sending.</p>
        `
    },
    {
        id: 'course003',
        title: 'Your Rights: An Introduction to the SA Constitution',
        category: 'Legal',
        icon: 'fa-balance-scale',
        description: 'A foundational overview of the Bill of Rights and how it applies to your daily life as a South African citizen.',
        content: `
            <h2 class="text-3xl font-bold mb-4">Chapter 2: The Bill of Rights</h2>
            <p class="mb-4">The Bill of Rights is the cornerstone of democracy in South Africa. It enshrines the rights of all people in our country and affirms the democratic values of human dignity, equality and freedom.</p>
            <ul class="space-y-2 mb-6">
                <li><strong>Right to Equality (Section 9):</strong> Everyone is equal before the law and has the right to equal protection and benefit of the law.</li>
                <li><strong>Right to Human Dignity (Section 10):</strong> Everyone has inherent dignity and the right to have their dignity respected and protected.</li>
                <li><strong>Right to Freedom and Security of the Person (Section 12):</strong> This includes the right not to be deprived of freedom arbitrarily or without just cause.</li>
            </ul>
             <p>Understanding these rights is the first step to ensuring they are protected. You can use the LegalHelp module to track any matters related to these rights.</p>
        `
    }
];

let currentUserId = null;
let userProgress = {}; // For v1, this is stored in memory. For v2, it will be in Firestore.

export function init(user) {
    if (!user || !user.uid) return;
    currentUserId = user.uid;
    console.log("Training module initialized.");

    // For v2, we would load progress from the database here.
    // E.g., const userData = await getDocument(`users/${currentUserId}`);
    // userProgress = userData.trainingProgress || {};
    
    renderCourseListView();
}

function renderCourseListView() {
    const main = document.getElementById('training-main');
    main.innerHTML = `
        <div class="max-w-7xl mx-auto">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-slate-900">Training Centre</h1>
                <p class="mt-1 text-slate-600">Expand your knowledge and build your skills.</p>
            </div>
            <div id="courses-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
        </div>
    `;

    const listContainer = document.getElementById('courses-list');
    listContainer.innerHTML = '';
    
    coursesData.forEach(course => {
        const isCompleted = userProgress[course.id] === true;
        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-lg shadow-sm border border-slate-200 cursor-pointer course-card flex flex-col';
        card.innerHTML = `
            <div class="flex-grow">
                <div class="flex justify-between items-start">
                    <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <i class="fas ${course.icon} text-2xl text-indigo-600"></i>
                    </div>
                    ${isCompleted ? '<span class="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800">Completed</span>' : ''}
                </div>
                <h3 class="text-lg font-bold text-slate-800 mt-4">${course.title}</h3>
                <p class="text-sm text-slate-500 mt-1">${course.category}</p>
                <p class="text-sm text-slate-600 mt-3">${course.description}</p>
            </div>
            <div class="mt-4 pt-4 border-t">
                <button class="w-full text-center text-sm font-semibold text-indigo-600 hover:text-indigo-800">Start Course</button>
            </div>
        `;
        card.addEventListener('click', () => renderCourseDetailView(course.id));
        listContainer.appendChild(card);
    });
}

function renderCourseDetailView(courseId) {
    const course = coursesData.find(c => c.id === courseId);
    if (!course) return;

    const main = document.getElementById('training-main');
    const isCompleted = userProgress[course.id] === true;

    main.innerHTML = `
        <div class="max-w-4xl mx-auto">
            <button id="back-to-courses-btn" class="text-sm text-indigo-600 font-semibold mb-6"><i class="fas fa-arrow-left mr-2"></i>Back to all courses</button>
            <div class="bg-white p-8 md:p-12 rounded-lg shadow-lg">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-semibold text-indigo-600">${course.category}</p>
                        <h1 class="text-4xl md:text-5xl font-bold text-slate-900 font-serif mt-1">${course.title}</h1>
                    </div>
                    <div id="completion-status-badge" class="${isCompleted ? '' : 'hidden'}">
                        <span class="text-sm font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800 flex items-center"><i class="fas fa-check-circle mr-2"></i>Completed</span>
                    </div>
                </div>
                <div class="border-t my-6"></div>
                <article class="prose lg:prose-xl text-slate-800 course-content">${course.content}</article>
                <div class="border-t mt-8 pt-6 text-center">
                    <button id="mark-complete-btn" class="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-slate-400" ${isCompleted ? 'disabled' : ''}>
                        ${isCompleted ? 'Course Completed' : 'Mark as Complete'}
                    </button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('back-to-courses-btn').addEventListener('click', renderCourseListView);
    document.getElementById('mark-complete-btn').addEventListener('click', () => markCourseAsComplete(course.id));
}

function markCourseAsComplete(courseId) {
    userProgress[courseId] = true;
    
    // In v2, we would save this to Firestore:
    // await updateDocument(`users/${currentUserId}`, { trainingProgress: userProgress });

    // Re-render the detail view to update the button and badge
    renderCourseDetailView(courseId);
}
