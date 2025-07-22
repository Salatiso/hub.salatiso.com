/* ================================================================================= */
/* FILE: assets/js/modules/hrhelp.js (NEW - REPLACES PLACEHOLDER)                  */
/* ================================================================================= */
import { auth } from '../firebase-config.js';
import { saveDocument, getDocumentsRealtime, updateDocument, deleteDocument } from '../database.js';

let currentUserId = null;

export function init(user) {
    if (!user || !user.uid) {
        console.error("HRHelp Error: User not authenticated.");
        return;
    }
    currentUserId = user.uid;
    console.log("HRHelp module initialized for user:", currentUserId);

    setupEventListeners();
    listenForPDPs();
}

function setupEventListeners() {
    const modal = document.getElementById('pdp-modal');
    document.getElementById('create-pdp-btn').addEventListener('click', () => openPdpModal());
    document.getElementById('close-pdp-modal').addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('cancel-pdp-btn').addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('add-goal-btn').addEventListener('click', addGoal);
    document.getElementById('pdp-form').addEventListener('submit', savePdp);
}

function listenForPDPs() {
    getDocumentsRealtime(`users/${currentUserId}/hrhelp-pdps`, renderAllPDPs);
}

function openPdpModal(pdp = null) {
    const modal = document.getElementById('pdp-modal');
    const form = document.getElementById('pdp-form');
    const title = document.getElementById('pdp-modal-title');
    
    form.reset();
    document.getElementById('goals-container').innerHTML = '';
    document.getElementById('pdp-id').value = pdp ? pdp.id : '';

    title.textContent = pdp ? 'Edit Development Plan' : 'Create Development Plan';
    
    if (pdp) {
        document.getElementById('pdp-title').value = pdp.title;
        document.getElementById('pdp-description').value = pdp.description;
        if (pdp.goals && pdp.goals.length > 0) {
            pdp.goals.forEach(goal => addGoal(goal));
        }
    } else {
        // Start with one empty goal for new plans
        addGoal();
    }
    
    modal.classList.remove('hidden');
}

function addGoal(goalData = { title: '', actions: [''] }) {
    const container = document.getElementById('goals-container');
    const goalId = `goal-${Date.now()}`;
    const goalCard = document.createElement('div');
    goalCard.className = 'p-4 bg-white rounded-lg border border-slate-200 goal-card-item';
    goalCard.id = goalId;
    
    goalCard.innerHTML = `
        <div class="flex justify-between items-center">
            <input type="text" class="goal-title-input text-md font-semibold border-b-2 border-slate-200 focus:border-indigo-500 w-full pb-1 outline-none" placeholder="Goal Title (e.g., Learn JavaScript)" value="${goalData.title}" required>
            <button type="button" class="remove-goal-btn text-red-400 hover:text-red-600 ml-4"><i class="fas fa-trash"></i></button>
        </div>
        <div class="mt-3 space-y-2 action-steps-container">
            <!-- Action steps will be here -->
        </div>
        <button type="button" class="add-action-btn mt-2 text-xs text-indigo-500 hover:text-indigo-700 font-semibold"><i class="fas fa-plus-circle mr-1"></i>Add Action Step</button>
    `;

    container.appendChild(goalCard);

    // Add action steps for this goal
    const actionsContainer = goalCard.querySelector('.action-steps-container');
    goalData.actions.forEach(actionText => addActionStep(actionsContainer, actionText));

    // Add event listeners
    goalCard.querySelector('.remove-goal-btn').addEventListener('click', () => goalCard.remove());
    goalCard.querySelector('.add-action-btn').addEventListener('click', () => addActionStep(actionsContainer));
}

function addActionStep(container, actionText = '') {
    const actionId = `action-${Date.now()}`;
    const actionDiv = document.createElement('div');
    actionDiv.className = 'flex items-center gap-2 action-step-item';
    actionDiv.id = actionId;
    actionDiv.innerHTML = `
        <i class="fas fa-check-circle text-slate-300"></i>
        <input type="text" class="action-text-input text-sm border-b border-slate-200 focus:border-indigo-400 w-full py-1 outline-none" placeholder="Action step..." value="${actionText}" required>
        <button type="button" class="remove-action-btn text-slate-400 hover:text-red-500 text-xs"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(actionDiv);
    actionDiv.querySelector('.remove-action-btn').addEventListener('click', () => actionDiv.remove());
}

async function savePdp(e) {
    e.preventDefault();
    const form = e.target;
    const pdpId = document.getElementById('pdp-id').value;

    const goals = [];
    document.querySelectorAll('.goal-card-item').forEach(goalCard => {
        const goalTitle = goalCard.querySelector('.goal-title-input').value;
        const actions = [];
        goalCard.querySelectorAll('.action-text-input').forEach(actionInput => {
            if (actionInput.value.trim() !== '') {
                actions.push(actionInput.value.trim());
            }
        });
        if (goalTitle.trim() !== '') {
            goals.push({ title: goalTitle.trim(), actions });
        }
    });

    const pdpData = {
        title: document.getElementById('pdp-title').value,
        description: document.getElementById('pdp-description').value,
        goals: goals,
        updatedAt: new Date().toISOString()
    };

    try {
        if (pdpId) {
            await updateDocument(`users/${currentUserId}/hrhelp-pdps/${pdpId}`, pdpData);
        } else {
            pdpData.createdAt = new Date().toISOString();
            await saveDocument(`users/${currentUserId}/hrhelp-pdps`, pdpData);
        }
        document.getElementById('pdp-modal').classList.add('hidden');
    } catch (error) {
        console.error("Error saving PDP:", error);
        alert("Failed to save development plan.");
    }
}

function renderAllPDPs(pdps) {
    const container = document.getElementById('pdp-container');
    container.innerHTML = '';

    if (pdps.length === 0) {
        container.innerHTML = `<div class="text-center p-12 bg-white rounded-lg shadow-sm"><h3 class="text-xl font-semibold text-slate-800">No Development Plans Found</h3><p class="text-slate-500 mt-2">Click "Create New Development Plan" to get started on your goals.</p></div>`;
        return;
    }

    pdps.sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    pdps.forEach(pdp => {
        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-xl shadow-md goal-card';
        
        let goalsHtml = '<p class="text-sm text-slate-500">No goals defined for this plan.</p>';
        if (pdp.goals && pdp.goals.length > 0) {
            goalsHtml = pdp.goals.map(goal => `
                <div class="mt-3">
                    <h4 class="font-semibold text-slate-800 flex items-center"><i class="fas fa-bullseye text-indigo-500 mr-3"></i>${goal.title}</h4>
                    <ul class="mt-1 ml-8 list-disc list-inside text-sm text-slate-600 space-y-1">
                        ${goal.actions.map(action => `<li>${action}</li>`).join('')}
                    </ul>
                </div>
            `).join('');
        }

        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-xl font-bold text-slate-900">${pdp.title}</h3>
                    <p class="text-sm text-slate-500 mt-1">${pdp.description}</p>
                </div>
                <div class="flex-shrink-0 ml-4">
                    <button class="edit-pdp-btn text-blue-500 hover:text-blue-700 mr-3" data-id="${pdp.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-pdp-btn text-red-500 hover:text-red-700" data-id="${pdp.id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div class="border-t my-4"></div>
            ${goalsHtml}
        `;
        container.appendChild(card);

        // Attach event listeners
        card.querySelector('.edit-pdp-btn').addEventListener('click', () => openPdpModal(pdp));
        card.querySelector('.delete-pdp-btn').addEventListener('click', async () => {
             if (window.confirm('Are you sure you want to delete this entire plan?')) {
                await deleteDocument(`users/${currentUserId}/hrhelp-pdps/${pdp.id}`);
            }
        });
    });
}
