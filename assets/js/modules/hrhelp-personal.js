/* ================================================================================= */
/* FILE: assets/js/modules/hrhelp-personal.js (Personal Career Hub)                  */
/* PURPOSE: A comprehensive toolkit for individuals to manage their career path,     */
/* development plans, and training records.                                          */
/* ================================================================================= */
import { auth, db } from '../firebase-config.js';
import { getDocument, updateDocument, addDocument, deleteDocument } from '../database.js';
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let currentUser = null;
let hrData = {}; // Local cache for all personal HR data

export function init(user) {
    if (!user) return;
    currentUser = user;
    console.log("Personal HR module initialized.");

    const personalWorkspace = document.getElementById('personal-workspace');
    personalWorkspace.innerHTML = getPersonalWorkspaceHTML();
    
    attachTabListeners();

    const hrDocRef = doc(db, "users", currentUser.uid, "personalHR", "main");
    onSnapshot(hrDocRef, (docSnap) => {
        hrData = docSnap.exists() ? docSnap.data() : { careerPlans: [], trainingLog: [] };
        const activeTab = document.querySelector('#personal-workspace .tab-button.active')?.dataset.tab || 'plan';
        renderTabContent(activeTab);
    });
}

function attachTabListeners() {
    document.querySelectorAll('#personal-workspace .tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const tabName = e.currentTarget.dataset.tab;
            document.querySelectorAll('#personal-workspace .tab-button').forEach(btn => btn.classList.remove('active'));
            e.currentTarget.classList.add('active');
            renderTabContent(tabName);
        });
    });
}

function renderTabContent(tabName) {
    const contentContainer = document.getElementById('personal-tab-content');
    if (!contentContainer) return;

    switch (tabName) {
        case 'plan': renderCareerPlan(contentContainer); break;
        case 'training': renderTrainingLog(contentContainer); break;
    }
}

// --- CAREER PLAN TAB ---

function renderCareerPlan(container) {
    const plans = hrData.careerPlans || [];
    const plansHtml = plans.map((plan, index) => `
        <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="flex justify-between items-start">
                <h3 class="text-xl font-bold text-slate-900">${plan.goal}</h3>
                <button class="delete-plan-btn text-red-500 hover:text-red-700" data-index="${index}"><i class="fas fa-trash"></i></button>
            </div>
            <p class="text-sm text-slate-500 mt-1">Target: ${plan.targetDate}</p>
            <div class="mt-4 space-y-3">
                ${(plan.milestones || []).map(m => `
                    <div class="flex items-center">
                        <input type="checkbox" ${m.status === 'Completed' ? 'checked' : ''} class="h-4 w-4 rounded" disabled>
                        <span class="ml-3 text-slate-700">${m.title}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-slate-800">My Career & Development Plans</h2>
            <button id="add-plan-btn" class="btn-primary text-sm">Create New Plan</button>
        </div>
        <div id="career-plans-list" class="space-y-6">${plansHtml || '<p class="text-slate-500">You have not created a career plan yet.</p>'}</div>
    `;
    
    document.getElementById('add-plan-btn').addEventListener('click', () => alert("Creating a new plan will be enabled in the next version."));
}

// --- TRAINING LOG TAB ---

function renderTrainingLog(container) {
    const training = hrData.trainingLog || [];
    const trainingHtml = training.map((item, index) => `
        <tr class="hover:bg-slate-50">
            <td class="p-4">${item.course}</td>
            <td class="p-4">${item.provider}</td>
            <td class="p-4">${item.status}</td>
            <td class="p-4 text-right"><button class="delete-training-btn text-red-500 hover:text-red-700" data-index="${index}"><i class="fas fa-trash"></i></button></td>
        </tr>
    `).join('');

    container.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-sm">
            <h3 class="font-semibold text-lg text-slate-800 mb-4">My Training Log</h3>
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead class="bg-slate-50"><tr>
                        <th class="p-4 text-left text-xs font-medium text-slate-500 uppercase">Course / Qualification</th>
                        <th class="p-4 text-left text-xs font-medium text-slate-500 uppercase">Provider</th>
                        <th class="p-4 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                        <th class="relative p-4"></th>
                    </tr></thead>
                    <tbody id="training-list">${trainingHtml}</tbody>
                </table>
            </div>
            <form id="add-training-form" class="mt-4 border-t pt-4">
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input type="text" id="training-course" placeholder="Course Name" class="input sm:col-span-2" required>
                    <input type="text" id="training-provider" placeholder="Training Provider" class="input" required>
                    <select id="training-status" class="input">
                        <option>In Progress</option>
                        <option>Completed</option>
                        <option>Planned</option>
                    </select>
                </div>
                <button type="submit" class="btn-secondary w-full mt-3 text-sm">Add Training Record</button>
            </form>
        </div>
    `;
    document.getElementById('add-training-form').addEventListener('submit', handleAddTraining);
}

// --- LOGIC & EVENT HANDLERS ---

async function saveData() {
    await setDoc(doc(db, "users", currentUser.uid, "personalHR", "main"), hrData);
}

async function handleAddTraining(e) {
    e.preventDefault();
    const newTraining = {
        course: document.getElementById('training-course').value,
        provider: document.getElementById('training-provider').value,
        status: document.getElementById('training-status').value,
    };
    if (!hrData.trainingLog) hrData.trainingLog = [];
    hrData.trainingLog.push(newTraining);
    await saveData();
    renderTabContent('training');
}

// --- HTML TEMPLATE ---
function getPersonalWorkspaceHTML() {
    return `
        <div class="border-b border-slate-200">
            <nav class="-mb-px flex space-x-8" id="personal-tabs">
                <button data-tab="plan" class="tab-button active ...">My Plan</button>
                <button data-tab="training" class="tab-button ...">My Training</button>
            </nav>
        </div>
        <div id="personal-tab-content" class="py-6"></div>
    `;
}
