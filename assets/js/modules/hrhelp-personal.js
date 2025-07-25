/* ================================================================================= */
/* FILE: assets/js/modules/hrhelp-personal.js (v2.0 Lifelong Career Hub)             */
/* PURPOSE: A comprehensive personal development hub that empowers users to manage */
/* their lifelong learning, career, and personal growth, fully integrated with     */
/* the LifeCV concept. Includes a dedicated, gamified module for children.         */
/* AUTHOR: Salatiso & Gemini                                                         */
/* DATE: July 25, 2025                                                               */
/* REVISION HISTORY:                                                                */
/* v2.0 - 2025/07/25: Complete overhaul based on the tech spec.                     */
/* - Implemented sidebar layout, Dashboard, My LifeCV, Goals, and Kid's Corner. */
/* - Added action-oriented credit logic for LifeCV entries.                       */
/* - Created Firestore data models for all features.                              */
/* v1.0 - Initial foundational version.                                             */
/* ================================================================================= */

import { auth, db } from '../firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, collection, addDoc, getDocs, setDoc, deleteDoc, onSnapshot, query, updateDoc, orderBy } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- STATE MANAGEMENT ---
let currentUser = null;
let lifeCvCache = [];
let goalsCache = [];
let childrenCache = [];
let unsubscribers = [];

/**
 * Main initializer for the Personal HR module.
 * @param {object} user - The authenticated Firebase user object.
 */
export function init(user) {
    if (!user) {
        console.error("HRHelp Personal requires an authenticated user.");
        return;
    }

    // Clean up previous listeners to prevent memory leaks and re-initialization issues
    unsubscribers.forEach(unsub => unsub());
    unsubscribers = [];

    currentUser = user;
    console.log(`HRHelp Personal v2.0 initialized for user: ${currentUser.uid}`);

    const personalWorkspace = document.getElementById('personal-workspace');
    if (!personalWorkspace) {
        console.error("Personal workspace element not found.");
        return;
    }

    personalWorkspace.innerHTML = getPersonalWorkspaceHTML();
    attachEventListeners();
    setupDataListeners(); // Set up listeners once
    navigateTo('dashboard'); // Default to the dashboard view
}

// --- DATA HANDLING ---

/**
 * Sets up real-time Firestore listeners for all personal data.
 */
function setupDataListeners() {
    const collectionsToListen = {
        'life-cv-entries': (data) => {
            lifeCvCache = data;
            if (document.getElementById('lifecv-content')) renderMyLifeCV();
            if (document.getElementById('dashboard-content')) renderDashboard();
        },
        'goals': (data) => {
            goalsCache = data;
            if (document.getElementById('goals-content')) renderMyGoals();
        },
        'children': (data) => {
            childrenCache = data;
            if (document.getElementById('kids-corner-content')) renderKidsCorner();
        }
    };

    for (const [path, callback] of Object.entries(collectionsToListen)) {
        const q = query(collection(db, 'users', currentUser.uid, path), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log(`Updated ${path} cache:`, data);
            callback(data);
        }, (error) => {
            console.error(`Error fetching ${path}:`, error);
            showNotification(`Failed to load ${path} data.`, 'error');
        });
        unsubscribers.push(unsub);
    }
}


// --- NAVIGATION & RENDERING ---

/**
 * Attaches main event listeners for the entire personal workspace.
 */
function attachEventListeners() {
    const workspace = document.getElementById('personal-workspace');

    workspace.addEventListener('click', (e) => {
        const navLink = e.target.closest('.nav-link');
        const modalToggle = e.target.closest('[data-modal-toggle]');
        const modalClose = e.target.closest('[data-modal-close]');
        const form = e.target.closest('form');
        const actionButton = e.target.closest('[data-action]');

        if (navLink && !navLink.classList.contains('active')) {
            navigateTo(navLink.dataset.view);
        } else if (modalToggle) {
            const modalId = modalToggle.dataset.modalToggle;
            const presetType = modalToggle.dataset.presetType;
            
            // Pre-fill form if preset type is specified
            if (presetType && modalId === 'add-lifecv-modal') {
                setTimeout(() => {
                    const typeSelect = document.getElementById('lifecv-type');
                    if (typeSelect) {
                        typeSelect.value = presetType;
                    }
                }, 50);
            }
            
            document.getElementById(modalId)?.classList.remove('hidden');
        } else if (modalClose) {
            const modalId = modalClose.dataset.modalClose;
            document.getElementById(modalId)?.classList.add('hidden');
        } else if (form) {
            e.preventDefault();
            handleFormSubmission(form);
        } else if (actionButton) {
            handleAction(actionButton);
        }
    });
}

/**
 * Routes form submissions to the correct handler.
 * @param {HTMLFormElement} form - The form that was submitted.
 */
function handleFormSubmission(form) {
    switch(form.id) {
        case 'add-lifecv-form':
            handleAddLifeCVEntry(form);
            break;
        case 'add-goal-form':
            handleAddGoal(form);
            break;
        case 'add-child-form':
            handleAddChild(form);
            break;
    }
}

/**
 * Routes data-action button clicks to the correct handler.
 * @param {HTMLElement} button - The button that was clicked.
 */
async function handleAction(button) {
    const { action, id, newStatus } = button.dataset;

    if (action === 'update-lifecv-status') {
        try {
            const entryRef = doc(db, 'users', currentUser.uid, 'life-cv-entries', id);
            await updateDoc(entryRef, { status: newStatus });
            showNotification('Entry updated!', 'success');
        } catch (error) {
            console.error("Error updating status:", error);
            showNotification('Failed to update status.', 'error');
        }
    }
}

/**
 * Navigates to a specific view within the personal HR module.
 * @param {string} view - The name of the view to render.
 */
function navigateTo(view) {
    console.log(`Navigating to: ${view}`);
    const contentArea = document.getElementById('main-content-area-personal');
    const navLinks = document.querySelectorAll('#personal-sidebar .nav-link');

    if (!contentArea) return;

    // Update sidebar active state
    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.view === view);
        link.classList.toggle('bg-indigo-600', link.dataset.view === view);
        link.classList.toggle('text-white', link.dataset.view === view);
        link.classList.toggle('text-indigo-100', link.dataset.view !== view);
        link.classList.toggle('hover:bg-indigo-500', link.dataset.view !== view);
    });

    contentArea.innerHTML = '<div class="text-center p-10"><i class="fas fa-spinner fa-spin fa-3x text-teal-500"></i></div>'; // Loading indicator

    switch (view) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'lifecv':
            renderMyLifeCV();
            break;
        case 'goals':
            renderMyGoals();
            break;
        case 'skills':
            renderSkills();
            break;
        case 'experience':
            renderExperience();
            break;
        case 'education':
            renderEducation();
            break;
        case 'portfolio':
            renderPortfolio();
            break;
        case 'contributions':
            renderContributions();
            break;
        case 'kids':
            renderKidsCorner();
            break;
        case 'resources':
            renderResourceHub();
            break;
        case 'settings':
            renderSettings();
            break;
        default:
            contentArea.innerHTML = `<p class="text-center text-red-500">View not found.</p>`;
    }
}

// --- MODULE RENDERERS ---

function renderDashboard() {
    const contentArea = document.getElementById('main-content-area-personal');
    const completedEntries = lifeCvCache.filter(e => e.status === 'completed' || e.status === 'excellent_pass').length;
    const excellentPasses = lifeCvCache.filter(e => e.status === 'excellent_pass').length;
    
    contentArea.innerHTML = `
        <div id="dashboard-content">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-slate-800">Personal Career Hub</h1>
                <p class="text-slate-500">Your lifelong journey of growth and learning starts here.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-6 rounded-xl shadow-md">
                    <p class="text-sm font-medium text-slate-500">Total LifeCV Entries</p>
                    <p class="text-3xl font-bold text-slate-800">${lifeCvCache.length}</p>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-md">
                    <p class="text-sm font-medium text-slate-500">Completed Learnings</p>
                    <p class="text-3xl font-bold text-slate-800">${completedEntries}</p>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-md">
                    <p class="text-sm font-medium text-slate-500">Excellent Passes</p>
                    <p class="text-3xl font-bold text-teal-600">${excellentPasses}</p>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-md">
                    <p class="text-sm font-medium text-slate-500">Active Goals</p>
                    <p class="text-3xl font-bold text-slate-800">${goalsCache.length}</p>
                </div>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-md">
                <h3 class="font-bold text-lg text-slate-800 mb-4">Recent Activity</h3>
                <div class="space-y-3">
                    ${lifeCvCache.slice(0, 3).map(entry => `
                        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div>
                                <p class="font-semibold text-slate-700">${entry.title}</p>
                                <p class="text-xs text-slate-500">${new Date(entry.createdAt).toLocaleDateString()}</p>
                            </div>
                            ${getStatusBadge(entry.status)}
                        </div>
                    `).join('') || '<p class="text-slate-500 text-center py-4">No recent activity. Add an entry to your LifeCV!</p>'}
                </div>
            </div>
        </div>
    `;
}

function renderMyLifeCV() {
    const contentArea = document.getElementById('main-content-area-personal');
    contentArea.innerHTML = `
        <div id="lifecv-content">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">Learning & Development</h1>
                    <p class="text-slate-500">Capture every step of your learning journey, formal and informal.</p>
                </div>
                <button data-modal-toggle="add-lifecv-modal" class="btn-primary flex items-center">
                    <i class="fas fa-plus mr-2"></i> Add Entry
                </button>
            </div>
            <div class="space-y-4">
                ${lifeCvCache.length > 0 ? lifeCvCache.map(getLifeCVEntryHTML).join('') : `
                    <div class="text-center p-10 bg-white rounded-xl shadow-md">
                        <i class="fas fa-folder-open fa-3x text-slate-300 mb-4"></i>
                        <h3 class="text-xl font-bold text-slate-700">Your LifeCV is Empty</h3>
                        <p class="text-slate-500 mt-2">Add your first learning, skill, or experience to begin.</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

function renderMyGoals() {
    document.getElementById('main-content-area-personal').innerHTML = `
        <div id="goals-content">
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-3xl font-bold text-slate-800">Career Goals</h1>
                <button data-modal-toggle="add-goal-modal" class="btn-primary flex items-center">
                    <i class="fas fa-plus mr-2"></i> Set New Goal
                </button>
            </div>
            <div class="bg-white rounded-xl shadow-md p-8 text-center">
                 <i class="fas fa-bullseye fa-3x text-slate-300 mb-4"></i>
                <h3 class="text-xl font-bold text-slate-700">Goal Setting Coming Soon</h3>
                <p class="text-slate-500 mt-2">A dedicated space to set, track, and achieve your personal and professional goals.</p>
            </div>
        </div>
    `;
}

function renderSkills() {
    const skillsFromEntries = lifeCvCache
        .filter(entry => entry.type === 'skill')
        .map(entry => ({
            name: entry.title,
            level: entry.status === 'excellent_pass' ? 'Expert' : entry.status === 'completed' ? 'Proficient' : 'Learning',
            tags: entry.tags
        }));

    document.getElementById('main-content-area-personal').innerHTML = `
        <div>
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">Skills Portfolio</h1>
                    <p class="text-slate-500">Your growing collection of skills and competencies.</p>
                </div>
                <button data-modal-toggle="add-lifecv-modal" data-preset-type="skill" class="btn-primary flex items-center">
                    <i class="fas fa-plus mr-2"></i> Add Skill
                </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${skillsFromEntries.length > 0 ? skillsFromEntries.map(skill => `
                    <div class="bg-white p-6 rounded-xl shadow-md">
                        <h3 class="font-bold text-lg text-slate-800 mb-2">${skill.name}</h3>
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-sm font-medium text-slate-600">Proficiency</span>
                            <span class="px-2 py-1 text-xs font-bold rounded-full ${
                                skill.level === 'Expert' ? 'bg-yellow-100 text-yellow-800' : 
                                skill.level === 'Proficient' ? 'bg-green-100 text-green-800' : 
                                'bg-blue-100 text-blue-800'
                            }">${skill.level}</span>
                        </div>
                        <div class="flex flex-wrap gap-1">
                            ${skill.tags.map(tag => `<span class="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-600">${tag}</span>`).join('')}
                        </div>
                    </div>
                `).join('') : `
                    <div class="col-span-full text-center p-10 bg-white rounded-xl shadow-md">
                        <i class="fas fa-cogs fa-3x text-slate-300 mb-4"></i>
                        <h3 class="text-xl font-bold text-slate-700">No Skills Added Yet</h3>
                        <p class="text-slate-500 mt-2">Add skills to your LifeCV to see them here.</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

function renderExperience() {
    const experienceEntries = lifeCvCache.filter(entry => entry.type === 'work_experience');

    document.getElementById('main-content-area-personal').innerHTML = `
        <div>
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">Work Experience</h1>
                    <p class="text-slate-500">Your professional journey and career milestones.</p>
                </div>
                <button data-modal-toggle="add-lifecv-modal" data-preset-type="work_experience" class="btn-primary flex items-center">
                    <i class="fas fa-plus mr-2"></i> Add Experience
                </button>
            </div>
            <div class="space-y-6">
                ${experienceEntries.length > 0 ? experienceEntries.map(entry => `
                    <div class="bg-white p-6 rounded-xl shadow-md">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <h3 class="font-bold text-xl text-slate-800">${entry.title}</h3>
                                <p class="text-slate-600 font-medium">${entry.source || 'Company Name'}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm text-slate-500">${entry.startDate || ''} ${entry.endDate ? `- ${entry.endDate}` : '- Present'}</p>
                                ${getStatusBadge(entry.status)}
                            </div>
                        </div>
                        <p class="text-slate-700 mb-3">${entry.description}</p>
                        ${entry.actionTaken ? `<div class="bg-green-50 p-3 rounded-lg mb-3"><strong class="text-green-700">Key Achievements:</strong> ${entry.actionTaken}</div>` : ''}
                        <div class="flex flex-wrap gap-2">
                            ${entry.tags.map(tag => `<span class="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-600">${tag}</span>`).join('')}
                        </div>
                    </div>
                `).join('') : `
                    <div class="text-center p-10 bg-white rounded-xl shadow-md">
                        <i class="fas fa-briefcase fa-3x text-slate-300 mb-4"></i>
                        <h3 class="text-xl font-bold text-slate-700">No Experience Added Yet</h3>
                        <p class="text-slate-500 mt-2">Add work experience to your LifeCV to see it here.</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

function renderEducation() {
    const educationEntries = lifeCvCache.filter(entry => entry.type === 'formal_education' || entry.type === 'certification');

    document.getElementById('main-content-area-personal').innerHTML = `
        <div>
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">Education & Certifications</h1>
                    <p class="text-slate-500">Your formal learning achievements and qualifications.</p>
                </div>
                <button data-modal-toggle="add-lifecv-modal" data-preset-type="formal_education" class="btn-primary flex items-center">
                    <i class="fas fa-plus mr-2"></i> Add Education
                </button>
            </div>
            <div class="space-y-6">
                ${educationEntries.length > 0 ? educationEntries.map(entry => `
                    <div class="bg-white p-6 rounded-xl shadow-md">
                        <div class="flex items-start justify-between mb-4">
                            <div class="flex items-center">
                                <div class="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                                    <i class="fas ${entry.type === 'certification' ? 'fa-certificate' : 'fa-graduation-cap'} text-indigo-600"></i>
                                </div>
                                <div>
                                    <h3 class="font-bold text-xl text-slate-800">${entry.title}</h3>
                                    <p class="text-slate-600 font-medium">${entry.source || 'Institution'}</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-sm text-slate-500">${entry.endDate || entry.startDate || ''}</p>
                                ${getStatusBadge(entry.status)}
                            </div>
                        </div>
                        <p class="text-slate-700 mb-3">${entry.description}</p>
                        <div class="flex flex-wrap gap-2">
                            ${entry.tags.map(tag => `<span class="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-600">${tag}</span>`).join('')}
                        </div>
                    </div>
                `).join('') : `
                    <div class="text-center p-10 bg-white rounded-xl shadow-md">
                        <i class="fas fa-graduation-cap fa-3x text-slate-300 mb-4"></i>
                        <h3 class="text-xl font-bold text-slate-700">No Education Added Yet</h3>
                        <p class="text-slate-500 mt-2">Add your education and certifications to your LifeCV to see them here.</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

function renderPortfolio() {
    const projectEntries = lifeCvCache.filter(entry => entry.type === 'project');

    document.getElementById('main-content-area-personal').innerHTML = `
        <div>
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">Project Portfolio</h1>
                    <p class="text-slate-500">Showcase your projects, creations, and achievements.</p>
                </div>
                <button data-modal-toggle="add-lifecv-modal" data-preset-type="project" class="btn-primary flex items-center">
                    <i class="fas fa-plus mr-2"></i> Add Project
                </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${projectEntries.length > 0 ? projectEntries.map(entry => `
                    <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                        <div class="flex justify-between items-start mb-4">
                            <h3 class="font-bold text-xl text-slate-800">${entry.title}</h3>
                            ${getStatusBadge(entry.status)}
                        </div>
                        <p class="text-slate-700 mb-4">${entry.description}</p>
                        ${entry.actionTaken ? `<div class="bg-blue-50 p-3 rounded-lg mb-4"><strong class="text-blue-700">What I Built:</strong> ${entry.actionTaken}</div>` : ''}
                        ${entry.outcome ? `<div class="bg-green-50 p-3 rounded-lg mb-4"><strong class="text-green-700">Impact:</strong> ${entry.outcome}</div>` : ''}
                        <div class="flex flex-wrap gap-2">
                            ${entry.tags.map(tag => `<span class="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-600">${tag}</span>`).join('')}
                        </div>
                    </div>
                `).join('') : `
                    <div class="col-span-full text-center p-10 bg-white rounded-xl shadow-md">
                        <i class="fas fa-folder-open fa-3x text-slate-300 mb-4"></i>
                        <h3 class="text-xl font-bold text-slate-700">No Projects Added Yet</h3>
                        <p class="text-slate-500 mt-2">Add projects to your LifeCV to showcase your work here.</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

function renderContributions() {
    const contributionEntries = lifeCvCache.filter(entry => 
        entry.tags.some(tag => ['volunteer', 'community', 'charity', 'giving', 'helping'].includes(tag.toLowerCase()))
    );

    document.getElementById('main-content-area-personal').innerHTML = `
        <div>
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">Community Contributions</h1>
                    <p class="text-slate-500">Your impact through volunteering, mentoring, and giving back.</p>
                </div>
                <button data-modal-toggle="add-lifecv-modal" class="btn-primary flex items-center">
                    <i class="fas fa-plus mr-2"></i> Add Contribution
                </button>
            </div>
            <div class="space-y-6">
                ${contributionEntries.length > 0 ? contributionEntries.map(entry => `
                    <div class="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <h3 class="font-bold text-xl text-slate-800">${entry.title}</h3>
                                <p class="text-slate-600 font-medium">${entry.source || 'Community Service'}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm text-slate-500">${entry.startDate || ''} ${entry.endDate ? `- ${entry.endDate}` : ''}</p>
                                ${getStatusBadge(entry.status)}
                            </div>
                        </div>
                        <p class="text-slate-700 mb-3">${entry.description}</p>
                        ${entry.actionTaken ? `<div class="bg-green-50 p-3 rounded-lg mb-3"><strong class="text-green-700">My Contribution:</strong> ${entry.actionTaken}</div>` : ''}
                        ${entry.outcome ? `<div class="bg-yellow-50 p-3 rounded-lg mb-3"><strong class="text-yellow-700">Impact:</strong> ${entry.outcome}</div>` : ''}
                        <div class="flex flex-wrap gap-2">
                            ${entry.tags.map(tag => `<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">${tag}</span>`).join('')}
                        </div>
                    </div>
                `).join('') : `
                    <div class="text-center p-10 bg-white rounded-xl shadow-md">
                        <i class="fas fa-hands-helping fa-3x text-slate-300 mb-4"></i>
                        <h3 class="text-xl font-bold text-slate-700">No Contributions Added Yet</h3>
                        <p class="text-slate-500 mt-2">Add your volunteer work and community contributions to your LifeCV.</p>
                        <p class="text-slate-400 text-sm mt-1">Tip: Use tags like "volunteer", "community", "charity" to categorize contributions.</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

function renderKidsCorner() {
    const jobs = [
        { name: 'Doctor', icon: 'fa-user-md', color: 'blue' },
        { name: 'Artist', icon: 'fa-paint-brush', color: 'purple' },
        { name: 'Scientist', icon: 'fa-flask', color: 'green' },
        { name: 'Chef', icon: 'fa-utensils', color: 'orange' },
        { name: 'Builder', icon: 'fa-hard-hat', color: 'yellow' },
        { name: 'Pilot', icon: 'fa-plane', color: 'red' },
    ];
    const randomJob = jobs[Math.floor(Math.random() * jobs.length)];

    document.getElementById('main-content-area-personal').innerHTML = `
        <div id="kids-corner-content" class="bg-gradient-to-br from-blue-200 to-purple-200 p-8 rounded-2xl">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-4xl font-bold text-slate-800" style="font-family: 'Comic Sans MS', cursive, sans-serif;">Kid's Corner!</h1>
                    <p class="text-slate-600">Let's explore the world of jobs and learning!</p>
                </div>
                 <button data-modal-toggle="add-child-modal" class="bg-pink-500 text-white font-bold py-2 px-4 rounded-full hover:bg-pink-600 transition-transform hover:scale-110">
                    <i class="fas fa-child mr-2"></i> Add a Child
                </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Job of the Day -->
                <div class="md:col-span-2 bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg text-center">
                     <h2 class="text-2xl font-bold text-slate-700 mb-4">Job of the Day!</h2>
                     <div class="bg-${randomJob.color}-100 text-${randomJob.color}-600 inline-block p-6 rounded-full mb-4">
                        <i class="fas ${randomJob.icon} fa-4x"></i>
                     </div>
                     <h3 class="text-3xl font-bold text-${randomJob.color}-800">${randomJob.name}</h3>
                     <p class="text-slate-600 mt-2">A ${randomJob.name} helps people and does amazing things!</p>
                </div>

                <!-- My Kids -->
                <div class="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
                    <h2 class="text-2xl font-bold text-slate-700 mb-4">My Explorers</h2>
                    <div class="space-y-3">
                        ${childrenCache.length > 0 ? childrenCache.map(child => `
                            <div class="flex items-center bg-white p-3 rounded-xl">
                                <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${child.firstName}" class="w-12 h-12 rounded-full mr-4 bg-teal-100">
                                <div>
                                    <p class="font-bold text-lg text-slate-800">${child.firstName}</p>
                                    <p class="text-sm text-slate-500">${new Date().getFullYear() - child.birthYear} years old</p>
                                </div>
                            </div>
                        `).join('') : '<p class="text-slate-500 text-center py-4">Add a child to start their journey!</p>'}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderResourceHub() {
    const resources = [
        {
            title: "Safety First Help",
            description: "Comprehensive safety and emergency guidance for workplace and personal situations.",
            url: "https://safetyfirst.help/",
            icon: "fa-shield-alt",
            color: "red"
        },
        {
            title: "HR Help Career Module",
            description: "Professional career development tools and guidance for workplace success.",
            url: "https://salatiso.com/hrhelp/modules/career.html",
            icon: "fa-briefcase",
            color: "blue"
        },
        {
            title: "Legal Help",
            description: "Legal guidance and resources for common legal questions and situations.",
            url: "https://salatiso.com/legalhelp/",
            icon: "fa-gavel",
            color: "purple"
        },
        {
            title: "Document Help",
            description: "Templates and guidance for creating professional documents and forms.",
            url: "https://salatiso.com/docuhelp/",
            icon: "fa-file-alt",
            color: "green"
        },
        {
            title: "Flamea Organization",
            description: "Community organization focused on empowerment and social development.",
            url: "https://flamea.org/",
            icon: "fa-users",
            color: "orange"
        }
    ];

    document.getElementById('main-content-area-personal').innerHTML = `
        <div>
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-slate-800">Resource Hub</h1>
                <p class="text-slate-500">Curated resources to support your personal and professional development.</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${resources.map(resource => `
                    <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 rounded-full bg-${resource.color}-100 flex items-center justify-center mr-4">
                                <i class="fas ${resource.icon} text-${resource.color}-600 fa-lg"></i>
                            </div>
                            <h3 class="font-bold text-lg text-slate-800">${resource.title}</h3>
                        </div>
                        <p class="text-slate-600 mb-4">${resource.description}</p>
                        <a href="${resource.url}" target="_blank" rel="noopener noreferrer" 
                           class="inline-flex items-center text-${resource.color}-600 hover:text-${resource.color}-800 font-medium">
                            Visit Resource
                            <i class="fas fa-external-link-alt ml-2 fa-sm"></i>
                        </a>
                    </div>
                `).join('')}
            </div>
            
            <div class="mt-8 bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-xl border border-teal-200">
                <h2 class="text-xl font-bold text-slate-800 mb-3">
                    <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
                    Learning Tip
                </h2>
                <p class="text-slate-700">
                    These resources are carefully selected to complement your LifeCV journey. Bookmark the ones most relevant to your current goals and check back regularly for updates.
                </p>
            </div>
        </div>
    `;
}

function renderSettings() {
    document.getElementById('main-content-area-personal').innerHTML = `
        <div>
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-slate-800">Settings</h1>
                <p class="text-slate-500">Manage your profile, privacy, and preferences.</p>
            </div>
            
            <div class="space-y-6">
                <!-- Profile Settings -->
                <div class="bg-white p-6 rounded-xl shadow-md">
                    <h2 class="text-xl font-bold text-slate-800 mb-4">
                        <i class="fas fa-user-circle text-indigo-600 mr-2"></i>
                        Profile Settings
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="form-label">Display Name</label>
                            <input class="input" type="text" value="${currentUser?.displayName || ''}" placeholder="Your display name">
                        </div>
                        <div>
                            <label class="form-label">Email</label>
                            <input class="input" type="email" value="${currentUser?.email || ''}" disabled class="bg-slate-100">
                        </div>
                    </div>
                    <button class="btn-primary mt-4">Save Profile Changes</button>
                </div>

                <!-- Privacy Settings -->
                <div class="bg-white p-6 rounded-xl shadow-md">
                    <h2 class="text-xl font-bold text-slate-800 mb-4">
                        <i class="fas fa-shield-alt text-green-600 mr-2"></i>
                        Privacy Settings
                    </h2>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="font-medium text-slate-800">Public LifeCV</h3>
                                <p class="text-sm text-slate-500">Allow others to view your public LifeCV entries</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" class="sr-only peer">
                                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="font-medium text-slate-800">Analytics</h3>
                                <p class="text-sm text-slate-500">Help improve the platform with anonymous usage data</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" class="sr-only peer" checked>
                                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Notification Settings -->
                <div class="bg-white p-6 rounded-xl shadow-md">
                    <h2 class="text-xl font-bold text-slate-800 mb-4">
                        <i class="fas fa-bell text-yellow-600 mr-2"></i>
                        Notification Preferences
                    </h2>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="font-medium text-slate-800">Goal Reminders</h3>
                                <p class="text-sm text-slate-500">Get reminded about your goals and milestones</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" class="sr-only peer" checked>
                                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="font-medium text-slate-800">Learning Suggestions</h3>
                                <p class="text-sm text-slate-500">Receive personalized learning recommendations</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" class="sr-only peer" checked>
                                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Data Management -->
                <div class="bg-white p-6 rounded-xl shadow-md">
                    <h2 class="text-xl font-bold text-slate-800 mb-4">
                        <i class="fas fa-database text-slate-600 mr-2"></i>
                        Data Management
                    </h2>
                    <div class="space-y-4">
                        <button class="flex items-center text-blue-600 hover:text-blue-800 font-medium">
                            <i class="fas fa-download mr-2"></i>
                            Export My Data
                        </button>
                        <button class="flex items-center text-red-600 hover:text-red-800 font-medium">
                            <i class="fas fa-trash-alt mr-2"></i>
                            Delete Account
                        </button>
                    </div>
                    <p class="text-xs text-slate-400 mt-4">
                        These actions will affect all your data. Please proceed with caution.
                    </p>
                </div>
            </div>
        </div>
    `;
}


// --- ACTIONS & HANDLERS ---

async function handleAddLifeCVEntry(form) {
    const formData = new FormData(form);
    const entryData = {
        type: formData.get('type'),
        title: formData.get('title'),
        source: formData.get('source'),
        description: formData.get('description'),
        startDate: formData.get('start-date'),
        endDate: formData.get('end-date'),
        tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(Boolean),
        actionTaken: formData.get('action-taken'),
        outcome: formData.get('outcome'),
        isPublic: formData.get('is-public') === 'on',
        status: formData.get('action-taken') ? 'completed' : 'in_progress', // Auto-set status
        createdAt: new Date().toISOString()
    };

    if (!entryData.title || !entryData.type) {
        showNotification("Title and Type are required.", "error");
        return;
    }

    try {
        await addDoc(collection(db, 'users', currentUser.uid, 'life-cv-entries'), entryData);
        showNotification("LifeCV entry added successfully!", "success");
        form.reset();
        document.getElementById('add-lifecv-modal').classList.add('hidden');
    } catch (error) {
        console.error("Error adding LifeCV entry: ", error);
        showNotification("Failed to add entry. Please try again.", "error");
    }
}

async function handleAddChild(form) {
    const formData = new FormData(form);
    const childData = {
        firstName: formData.get('child-name'),
        birthYear: formData.get('birth-year'),
        createdAt: new Date().toISOString()
    };

    if (!childData.firstName || !childData.birthYear) {
        showNotification("Child's name and birth year are required.", "error");
        return;
    }

    try {
        await addDoc(collection(db, 'users', currentUser.uid, 'children'), childData);
        showNotification(`${childData.firstName} added to your explorers!`, "success");
        form.reset();
        document.getElementById('add-child-modal').classList.add('hidden');
    } catch (error) {
        console.error("Error adding child: ", error);
        showNotification("Failed to add child.", "error");
    }
}

async function handleAddGoal(form) {
    const formData = new FormData(form);
    const goalData = {
        title: formData.get('goal-title'),
        description: formData.get('goal-description'),
        targetDate: formData.get('target-date'),
        category: formData.get('goal-category'),
        milestones: formData.get('milestones') ? formData.get('milestones').split('\n').filter(m => m.trim()) : [],
        status: 'active',
        progress: 0,
        createdAt: new Date().toISOString()
    };

    if (!goalData.title) {
        showNotification("Goal title is required.", "error");
        return;
    }

    try {
        await addDoc(collection(db, 'users', currentUser.uid, 'goals'), goalData);
        showNotification("Goal added successfully!", "success");
        form.reset();
        document.getElementById('add-goal-modal').classList.add('hidden');
    } catch (error) {
        console.error("Error adding goal: ", error);
        showNotification("Failed to add goal. Please try again.", "error");
    }
}


// --- UI & HTML TEMPLATES ---

function getPersonalWorkspaceHTML() {
    return `
        <div class="flex h-full bg-slate-100">
            <!-- Sidebar Navigation -->
            <div id="personal-sidebar" class="w-64 bg-indigo-700 text-white flex-shrink-0 flex flex-col">
                <div class="p-6 text-2xl font-bold">Personal Career Hub</div>
                <nav class="flex-grow px-4 space-y-2">
                    <a href="#" class="nav-link flex items-center px-4 py-3 rounded-lg" data-view="dashboard"><i class="fas fa-home w-8 text-center"></i>Dashboard</a>
                    <a href="#" class="nav-link flex items-center px-4 py-3 rounded-lg" data-view="lifecv"><i class="fas fa-book-reader w-8 text-center"></i>Learning & Development</a>
                    <a href="#" class="nav-link flex items-center px-4 py-3 rounded-lg" data-view="goals"><i class="fas fa-bullseye w-8 text-center"></i>Career Goals</a>
                    <a href="#" class="nav-link flex items-center px-4 py-3 rounded-lg" data-view="skills"><i class="fas fa-cogs w-8 text-center"></i>Skills</a>
                    <a href="#" class="nav-link flex items-center px-4 py-3 rounded-lg" data-view="experience"><i class="fas fa-briefcase w-8 text-center"></i>Experience</a>
                    <a href="#" class="nav-link flex items-center px-4 py-3 rounded-lg" data-view="education"><i class="fas fa-graduation-cap w-8 text-center"></i>Education</a>
                    <a href="#" class="nav-link flex items-center px-4 py-3 rounded-lg" data-view="portfolio"><i class="fas fa-folder-open w-8 text-center"></i>Portfolio</a>
                    <a href="#" class="nav-link flex items-center px-4 py-3 rounded-lg" data-view="contributions"><i class="fas fa-hands-helping w-8 text-center"></i>Contributions</a>
                    <a href="#" class="nav-link flex items-center px-4 py-3 rounded-lg" data-view="kids"><i class="fas fa-child w-8 text-center"></i>Kid's Corner</a>
                    <a href="#" class="nav-link flex items-center px-4 py-3 rounded-lg" data-view="resources"><i class="fas fa-book-open w-8 text-center"></i>Resource Hub</a>
                    <a href="#" class="nav-link flex items-center px-4 py-3 rounded-lg" data-view="settings"><i class="fas fa-cog w-8 text-center"></i>Settings</a>
                </nav>
            </div>

            <!-- Main Content -->
            <main id="main-content-area-personal" class="flex-grow p-8 overflow-y-auto">
                <!-- Content will be rendered here -->
            </main>
        </div>
        ${getAddLifeCVEntryModalHTML()}
        ${getAddChildModalHTML()}
        ${getAddGoalModalHTML()}
    `;
}

function getLifeCVEntryHTML(entry) {
    const progress = entry.status === 'in_progress' ? 50 : 100;
    const progressBarColor = entry.status === 'excellent_pass' ? 'bg-yellow-400' : 'bg-teal-500';

    return `
        <div class="bg-white rounded-xl shadow-md p-5">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="font-bold text-lg text-slate-800">${entry.title}</h3>
                    <p class="text-sm text-slate-500">${entry.source || 'Self-taught'}</p>
                    <div class="flex items-center space-x-2 mt-2">
                        ${getStatusBadge(entry.status)}
                        <span class="text-xs font-semibold uppercase text-slate-400">${entry.type.replace(/_/g, ' ')}</span>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-xs text-slate-400">${entry.startDate || ''} ${entry.endDate ? `- ${entry.endDate}` : ''}</p>
                    <div class="mt-2 flex space-x-2">
                        ${entry.tags.map(tag => `<span class="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
            
            <div class="mt-4">
                <p class="text-sm text-slate-600">${entry.description}</p>
                ${entry.actionTaken ? `<p class="mt-2 text-sm text-slate-800 bg-green-50 p-2 rounded-lg"><strong class="font-bold text-green-700">Action Taken:</strong> ${entry.actionTaken}</p>` : ''}
                ${entry.outcome ? `<p class="mt-2 text-sm text-slate-800 bg-yellow-50 p-2 rounded-lg"><strong class="font-bold text-yellow-700">Outcome:</strong> ${entry.outcome}</p>` : ''}
            </div>

            <!-- Action-Oriented Credit System -->
            <div class="mt-4">
                <div class="w-full bg-slate-200 rounded-full h-2.5">
                    <div class="${progressBarColor} h-2.5 rounded-full" style="width: ${progress}%"></div>
                </div>
                <div class="flex justify-between text-xs mt-2">
                    <button data-action="update-lifecv-status" data-id="${entry.id}" data-new-status="in_progress" class="font-semibold ${entry.status === 'in_progress' ? 'text-teal-600' : 'text-slate-400'}">In Progress</button>
                    <button data-action="update-lifecv-status" data-id="${entry.id}" data-new-status="completed" class="font-semibold ${entry.status === 'completed' ? 'text-teal-600' : 'text-slate-400'}">Action Complete</button>
                    <button data-action="update-lifecv-status" data-id="${entry.id}" data-new-status="excellent_pass" class="font-semibold ${entry.status === 'excellent_pass' ? 'text-yellow-500' : 'text-slate-400'}">Excellent Pass</button>
                </div>
            </div>
        </div>
    `;
}

function getAddLifeCVEntryModalHTML() {
    return `
        <div id="add-lifecv-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl max-h-full overflow-y-auto">
                <h2 class="text-2xl font-bold text-slate-800 mb-6">Add to My LifeCV</h2>
                <form id="add-lifecv-form" class="space-y-4">
                    <div>
                        <label class="form-label" for="lifecv-title">Title / Name</label>
                        <input class="input" id="lifecv-title" name="title" type="text" required placeholder="e.g., Learned to Code in Python, Built a Bookshelf">
                    </div>
                    <div>
                        <label class="form-label" for="lifecv-type">Entry Type</label>
                        <select class="input" id="lifecv-type" name="type">
                            <option value="informal_learning">Informal Learning</option>
                            <option value="project">Project</option>
                            <option value="skill">Skill</option>
                            <option value="work_experience">Work Experience</option>
                            <option value="formal_education">Formal Education</option>
                            <option value="certification">Certification</option>
                            <option value="wisdom_insight">Wisdom / Insight</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label" for="lifecv-source">Source / Institution</label>
                        <input class="input" id="lifecv-source" name="source" type="text" placeholder="e.g., YouTube, Udemy, University of Life">
                    </div>
                    <div>
                        <label class="form-label" for="lifecv-description">Description</label>
                        <textarea class="input" id="lifecv-description" name="description" rows="3"></textarea>
                    </div>
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="form-label" for="start-date">Start Date</label>
                            <input class="input" id="start-date" name="start-date" type="date">
                        </div>
                        <div>
                            <label class="form-label" for="end-date">End Date</label>
                            <input class="input" id="end-date" name="end-date" type="date">
                        </div>
                    </div>
                    <div>
                        <label class="form-label" for="lifecv-action-taken">Action Taken (Proof of Doing)</label>
                        <textarea class="input" id="lifecv-action-taken" name="action-taken" rows="2" placeholder="What did you do with the knowledge? e.g., 'I cooked the meal for my family.'"></textarea>
                    </div>
                     <div>
                        <label class="form-label" for="lifecv-outcome">Outcome (For an 'Excellent Pass')</label>
                        <textarea class="input" id="lifecv-outcome" name="outcome" rows="2" placeholder="What was the result? e.g., 'They loved it and asked for the recipe.'"></textarea>
                    </div>
                    <div>
                        <label class="form-label" for="lifecv-tags">Tags (comma-separated)</label>
                        <input class="input" id="lifecv-tags" name="tags" type="text" placeholder="e.g., cooking, web development, gardening">
                    </div>
                    <div class="flex items-center">
                        <input id="is-public" name="is-public" type="checkbox" class="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded">
                        <label for="is-public" class="ml-2 block text-sm text-gray-900">Make this entry visible on my public LifeCV</label>
                    </div>
                    <div class="flex justify-end mt-8 space-x-4">
                        <button type="button" data-modal-close="add-lifecv-modal" class="btn-secondary">Cancel</button>
                        <button type="submit" class="btn-primary">Add Entry</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function getAddChildModalHTML() {
    return `
        <div id="add-child-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
                <h2 class="text-2xl font-bold text-slate-800 mb-6">Add a Young Explorer</h2>
                <form id="add-child-form" class="space-y-4">
                    <div>
                        <label class="form-label" for="child-name">Child's First Name</label>
                        <input class="input" id="child-name" name="child-name" type="text" required>
                    </div>
                    <div>
                        <label class="form-label" for="birth-year">Birth Year</label>
                        <input class="input" id="birth-year" name="birth-year" type="number" required min="1980" max="${new Date().getFullYear()}">
                    </div>
                    <div class="flex justify-end mt-6 space-x-4">
                        <button type="button" data-modal-close="add-child-modal" class="btn-secondary">Cancel</button>
                        <button type="submit" class="btn-primary">Add Child</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function getAddGoalModalHTML() {
    return `
        <div id="add-goal-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl max-h-full overflow-y-auto">
                <h2 class="text-2xl font-bold text-slate-800 mb-6">Set a New Goal</h2>
                <form id="add-goal-form" class="space-y-4">
                    <div>
                        <label class="form-label" for="goal-title">Goal Title</label>
                        <input class="input" id="goal-title" name="goal-title" type="text" required placeholder="e.g., Learn Spanish, Get Promoted, Start a Business">
                    </div>
                    <div>
                        <label class="form-label" for="goal-category">Category</label>
                        <select class="input" id="goal-category" name="goal-category">
                            <option value="career">Career</option>
                            <option value="education">Education</option>
                            <option value="personal">Personal Development</option>
                            <option value="health">Health & Wellness</option>
                            <option value="financial">Financial</option>
                            <option value="creative">Creative</option>
                            <option value="relationship">Relationships</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label" for="goal-description">Description</label>
                        <textarea class="input" id="goal-description" name="goal-description" rows="3" placeholder="Describe your goal and why it's important to you..."></textarea>
                    </div>
                    <div>
                        <label class="form-label" for="target-date">Target Date</label>
                        <input class="input" id="target-date" name="target-date" type="date">
                    </div>
                    <div>
                        <label class="form-label" for="milestones">Milestones (one per line)</label>
                        <textarea class="input" id="milestones" name="milestones" rows="4" placeholder="Research language learning apps&#10;Complete basic course&#10;Have first conversation&#10;Take proficiency test"></textarea>
                    </div>
                    <div class="flex justify-end mt-8 space-x-4">
                        <button type="button" data-modal-close="add-goal-modal" class="btn-secondary">Cancel</button>
                        <button type="submit" class="btn-primary">Set Goal</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function getStatusBadge(status) {
    const badgeStyles = {
        'in_progress': 'bg-blue-100 text-blue-800',
        'completed': 'bg-green-100 text-green-800',
        'excellent_pass': 'bg-yellow-100 text-yellow-800',
    };
    const text = status.replace(/_/g, ' ');
    return `<span class="px-2 py-1 text-xs font-bold rounded-full ${badgeStyles[status] || 'bg-slate-100 text-slate-800'}">${text}</span>`;
}

// --- UTILITY ---
function showNotification(message, type = 'info') {
    const container = document.body;
    const notification = document.createElement('div');
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };
    notification.className = `fixed bottom-5 right-5 p-4 rounded-lg text-white shadow-lg z-50 transform transition-transform translate-y-20 ${colors[type] || 'bg-slate-800'}`;
    notification.textContent = message;
    container.appendChild(notification);

    setTimeout(() => {
        notification.classList.remove('translate-y-20');
    }, 10);

    setTimeout(() => {
        notification.classList.add('translate-y-20');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}
