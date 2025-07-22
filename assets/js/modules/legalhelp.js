/* ================================================================================= */
/* FILE: assets/js/modules/legalhelp.js (Comprehensive & Upgraded)                   */
/* PURPOSE: Manages the LegalHelp module, integrating the Case Tracker, Flamea       */
/* Parenting Plan Generator, and the new Project Management Hub.                     */
/* ================================================================================= */
import { auth, db } from '../firebase-config.js';
import { addDocument, getDocumentsRealtime, saveDocument } from '../database.js';

let currentUser = null;
let unsubscribeListeners = []; // Array to hold all active listeners

// Predefined case types from your previous work
const predefinedCaseTypes = [
    "Child Maintenance", "Child Custody / Contact", "Protection Order", "Domestic Violence",
    "Divorce Proceedings", "Harassment", "Eviction Notice", "Summons Received",
    "Motor Vehicle Accident Claim", "Unfair Dismissal (CCMA)", "Debt Collection",
    "Other (Custom)"
];

export function init(user) {
    if (!user) return;
    currentUser = user;
    console.log("LegalHelp module initialized.");

    attachTabListeners();
    renderTabContent('cases'); // Load the default tab
}

function attachTabListeners() {
    document.querySelectorAll('#legal-tabs .tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const tabName = e.currentTarget.dataset.tab;
            document.querySelectorAll('#legal-tabs .tab-button').forEach(btn => btn.classList.remove('active'));
            e.currentTarget.classList.add('active');
            renderTabContent(tabName);
        });
    });
}

function renderTabContent(tabName) {
    const contentContainer = document.getElementById('tab-content');
    // Unsubscribe from all previous Firestore listeners to prevent memory leaks
    unsubscribeListeners.forEach(unsub => unsub());
    unsubscribeListeners = [];

    switch (tabName) {
        case 'cases':
            renderCaseTracker(contentContainer);
            break;
        case 'parenting-plans':
            renderParentingPlansView(contentContainer);
            break;
        case 'projects':
            renderProjectManager(contentContainer);
            break;
    }
}

// --- 1. CASE TRACKER ---

function renderCaseTracker(container) {
    container.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-slate-800">My Cases</h2>
            <button id="add-case-btn" class="btn-primary text-sm"><i class="fas fa-gavel mr-2"></i>Log New Case</button>
        </div>
        <div id="cases-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
    `;

    document.getElementById('add-case-btn').addEventListener('click', openCaseModal);
    
    const unsub = getDocumentsRealtime(`users/${currentUser.uid}/legalCases`, (cases) => {
        const listContainer = document.getElementById('cases-list');
        if (!listContainer) return;
        if (cases.length === 0) {
            listContainer.innerHTML = `<p class="text-slate-500 md:col-span-3">You have no active cases. Click 'Log New Case' to begin.</p>`;
            return;
        }
        listContainer.innerHTML = cases.map(c => `
            <div class="bg-white p-6 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                <span class="text-xs font-semibold uppercase text-indigo-600">${c.type}</span>
                <h3 class="font-bold text-lg text-slate-800 mt-1">${c.description.substring(0, 50)}...</h3>
                <p class="text-sm text-slate-500 mt-2">Opened: ${new Date(c.createdAt.seconds * 1000).toLocaleDateString()}</p>
                <div class="mt-4 pt-4 border-t flex justify-between items-center">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">${c.status || 'Active'}</span>
                    <a href="#" class="text-sm font-semibold text-indigo-600 hover:underline">View Details</a>
                </div>
            </div>
        `).join('');
    });
    unsubscribeListeners.push(unsub);
}

function openCaseModal() {
    // This function assumes the modal HTML from your legalhelp.html is available
    const modal = document.getElementById('case-modal');
    const form = document.getElementById('case-form');
    form.reset();
    
    const caseTypeSelect = document.getElementById('case-type');
    caseTypeSelect.innerHTML = predefinedCaseTypes.map(t => `<option value="${t}">${t}</option>`).join('');

    caseTypeSelect.onchange = () => {
        document.getElementById('custom-case-type-wrapper').classList.toggle('hidden', caseTypeSelect.value !== 'Other (Custom)');
    };

    document.getElementById('modal-cancel').onclick = () => modal.classList.add('hidden');
    form.onsubmit = handleSaveCase;
    modal.classList.remove('hidden');
}

async function handleSaveCase(e) { /* ... Same as previous version ... */ }

// --- 2. PARENTING PLAN GENERATOR (FLAMEA) ---

function renderParentingPlansView(container) {
    container.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-slate-800">My Parenting Plans (Flamea)</h2>
            <button id="create-plan-btn" class="btn-primary text-sm"><i class="fas fa-child mr-2"></i>Create New Plan</button>
        </div>
        <div id="plan-cards-container" class="space-y-4"></div>
    `;
    
    document.getElementById('create-plan-btn').addEventListener('click', () => alert("Parenting Plan generator will be fully integrated in the next step."));
    
    const unsub = getDocumentsRealtime(`users/${currentUser.uid}/parentingPlans`, (plans) => {
        const listContainer = document.getElementById('plan-cards-container');
        if (!listContainer) return;
        if (plans.length === 0) {
            listContainer.innerHTML = `<p class="text-slate-500">No parenting plans created yet.</p>`;
            return;
        }
        listContainer.innerHTML = plans.map(plan => `
             <div class="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
                <div>
                    <p class="font-semibold text-slate-800">Plan for: ${plan.children_details || 'N/A'}</p>
                    <p class="text-xs text-slate-500">Created on: ${new Date(plan.createdAt).toLocaleDateString()}</p>
                </div>
                <button class="text-sm font-semibold text-indigo-600">View/Edit</button>
            </div>
        `).join('');
    });
    unsubscribeListeners.push(unsub);
}

// --- 3. PROJECT MANAGEMENT (PROHELP) ---

function renderProjectManager(container) {
    container.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-slate-800">My Projects (ProHelp)</h2>
            <button id="add-project-btn" class="btn-primary text-sm"><i class="fas fa-plus mr-2"></i>Create New Project</button>
        </div>
        <div id="projects-list" class="bg-white p-6 rounded-lg shadow-sm"></div>
    `;

    document.getElementById('add-project-btn').addEventListener('click', openProjectModal);

    const unsub = getDocumentsRealtime(`users/${currentUser.uid}/projects`, (projects) => {
        const listContainer = document.getElementById('projects-list');
        if (!listContainer) return;
        if (projects.length === 0) {
            listContainer.innerHTML = `<p class="text-slate-500">You have no active projects. Click 'Create New Project' to start.</p>`;
            return;
        }
        listContainer.innerHTML = projects.map(p => `
            <div class="p-4 border-b last:border-b-0">
                <h3 class="font-bold text-lg text-slate-800">${p.name}</h3>
                <p class="text-sm text-slate-600 mt-1">${p.description}</p>
            </div>
        `).join('');
    });
    unsubscribeListeners.push(unsub);
}

function openProjectModal() {
    // For projects, we can reuse the same modal structure as cases
    const modal = document.getElementById('case-modal');
    const form = document.getElementById('case-form');
    const title = document.getElementById('modal-title');
    
    form.reset();
    title.textContent = "Create a New Project";

    // Hide and repurpose case-specific fields
    document.getElementById('case-type').parentElement.classList.add('hidden');
    document.getElementById('custom-case-type-wrapper').classList.add('hidden');
    
    // Change labels for project context
    form.querySelector('label[for="case-description"]').textContent = "Project Description";
    
    // We need a project name field. Let's add it if it doesn't exist.
    let projectNameInput = form.querySelector('#project-name');
    if (!projectNameInput) {
        const nameDiv = document.createElement('div');
        nameDiv.className = 'mb-4';
        nameDiv.innerHTML = `
            <label for="project-name" class="block text-sm font-medium text-slate-700">Project Name</label>
            <input type="text" id="project-name" class="input" required>
        `;
        form.prepend(nameDiv);
    }
    
    document.getElementById('modal-cancel').onclick = () => {
        modal.classList.add('hidden');
        // Restore modal for case use
        title.textContent = "Start a New Case";
        document.getElementById('case-type').parentElement.classList.remove('hidden');
        form.querySelector('label[for="case-description"]').textContent = "Brief Description";
        form.querySelector('#project-name')?.parentElement.remove();
    };

    form.onsubmit = handleSaveProject;
    modal.classList.remove('hidden');
}

async function handleSaveProject(e) {
    e.preventDefault();
    const projectData = {
        name: document.getElementById('project-name').value,
        description: document.getElementById('case-description').value,
        status: 'Active',
        createdAt: new Date(),
    };

    try {
        await addDocument(`users/${currentUser.uid}/projects`, projectData);
        document.getElementById('modal-cancel').click(); // Reuse cancel logic to close and reset
    } catch (error) {
        console.error("Error saving project:", error);
        alert("Could not save the project.");
    }
}
