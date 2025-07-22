/* ================================================================================= */
/* FILE: assets/js/modules/legalhelp.js (UPGRADED WITH FLAMEA INTEGRATION)           */
/* ================================================================================= */
import { auth, db } from '../firebase-config.js';
import { saveDocument, getDocumentsRealtime, updateDocument, deleteDocument, getDocument } from '../database.js';

let currentUserId = null;

export function init(user) {
    if (!user || !user.uid) return;
    currentUserId = user.uid;
    console.log("LegalHelp (Flamea) module initialized.");

    injectContentHTML();
    setupTabs();
    
    // Initialize both features
    setupCaseTracker();
    listenForCases();
    setupParentingPlanGenerator();
    listenForParentingPlans();
}

function setupTabs() {
    const tabs = document.querySelectorAll('.tab-button');
    const contents = {
        cases: document.getElementById('tab-content-cases'),
        'parenting-plans': document.getElementById('tab-content-parenting-plans')
    };
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            Object.values(contents).forEach(c => c.classList.add('hidden'));
            tab.classList.add('active');
            const contentKey = tab.id.split('-')[1];
            contents[contentKey].classList.remove('hidden');
        });
    });
}

// --- CASE TRACKER (Logic from v1, now encapsulated) ---
function setupCaseTracker() {
    const caseModal = document.getElementById('case-modal');
    document.getElementById('create-case-btn').addEventListener('click', () => openCaseModal());
    document.getElementById('close-case-modal').addEventListener('click', () => caseModal.classList.add('hidden'));
    document.getElementById('cancel-case-btn').addEventListener('click', () => caseModal.classList.add('hidden'));
    document.getElementById('case-form').addEventListener('submit', saveCase);
    
    const logModal = document.getElementById('log-modal');
    document.getElementById('close-log-modal').addEventListener('click', () => logModal.classList.add('hidden'));
    document.getElementById('log-form').addEventListener('submit', saveLogEntry);
}
// ... All other case tracker functions (listenForCases, openCaseModal, saveCase, renderAllCases, openLogModal, etc.) go here, unchanged from v1.

// --- PARENTING PLAN GENERATOR (New Flamea Integration) ---
let currentStep = 1;
const totalSteps = 4;

function setupParentingPlanGenerator() {
    const modal = document.getElementById('plan-generator-modal');
    document.getElementById('create-plan-btn').addEventListener('click', () => {
        currentStep = 1;
        updateWizardView();
        modal.classList.remove('hidden');
    });
    document.getElementById('close-plan-generator').addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('prev-step-btn').addEventListener('click', () => navigateWizard(-1));
    document.getElementById('next-step-btn').addEventListener('click', () => navigateWizard(1));
    document.getElementById('save-plan-btn').addEventListener('click', saveParentingPlan);
}

function navigateWizard(direction) {
    currentStep += direction;
    updateWizardView();
}

function updateWizardView() {
    document.querySelectorAll('.wizard-step').forEach(step => step.classList.remove('active'));
    document.querySelector(`.wizard-step[data-step="${currentStep}"]`).classList.add('active');

    document.getElementById('prev-step-btn').disabled = currentStep === 1;
    document.getElementById('next-step-btn').style.display = currentStep === totalSteps ? 'none' : 'inline-block';
    document.getElementById('save-plan-btn').style.display = currentStep === totalSteps ? 'inline-block' : 'none';
    document.getElementById('step-indicator').textContent = `Step ${currentStep} of ${totalSteps}`;

    if (currentStep === totalSteps) {
        generatePlanPreview();
    }
}

function generatePlanPreview() {
    const form = document.getElementById('plan-generator-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const previewText = `
        PARENTING PLAN

        This plan is entered into by and between:
        Parent A: ${data.parent_a_name || '[Parent A Name]'}
        Parent B: ${data.parent_b_name || '[Parent B Name]'}

        Regarding the minor child(ren):
        ${data.children_details || '[Child(ren) Details]'}

        1. LIVING ARRANGEMENTS
        ${data.primary_residence || '[Primary Residence Details]'}

        2. CONTACT SCHEDULE
        ${data.contact_schedule || '[Contact Schedule Details]'}

        3. FINANCIAL SUPPORT
        a. Monthly Maintenance: ${data.maintenance || '[Maintenance Details]'}
        b. Medical Expenses: ${data.medical_expenses || '[Medical Expense Details]'}
        c. Educational Expenses: ${data.school_expenses || '[Educational Expense Details]'}

        This plan represents a mutual agreement and is entered into in the best interests of the child(ren).

        Signed: ____________________ (Parent A)
        Signed: ____________________ (Parent B)
    `;
    document.getElementById('plan-preview').textContent = previewText.trim();
}

async function saveParentingPlan() {
    const form = document.getElementById('plan-generator-form');
    const formData = new FormData(form);
    const planData = Object.fromEntries(formData.entries());
    planData.createdAt = new Date().toISOString();
    planData.planText = document.getElementById('plan-preview').textContent;
    
    try {
        await saveDocument(`users/${currentUserId}/parentingPlans`, planData);
        document.getElementById('plan-generator-modal').classList.add('hidden');
        // The realtime listener will update the UI.
    } catch (error) {
        console.error("Error saving parenting plan:", error);
        alert("Failed to save the plan.");
    }
}

function listenForParentingPlans() {
    getDocumentsRealtime(`users/${currentUserId}/parentingPlans`, renderParentingPlans);
}

function renderParentingPlans(plans) {
    const container = document.getElementById('plan-cards-container');
    container.innerHTML = '';
    if (plans.length === 0) {
        container.innerHTML = `<p class="text-slate-500">No parenting plans created yet.</p>`;
        return;
    }
    plans.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    plans.forEach(plan => {
        const card = document.createElement('div');
        card.className = 'bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center';
        card.innerHTML = `
            <div>
                <p class="font-semibold text-slate-800">Plan for: ${plan.children_details.split(',')[0]}</p>
                <p class="text-xs text-slate-500">Created on: ${new Date(plan.createdAt).toLocaleDateString()}</p>
            </div>
            <button class="text-sm font-semibold text-indigo-600">View/Edit</button>
        `;
        container.appendChild(card);
    });
}

// --- HTML INJECTION ---
function injectContentHTML() {
    document.getElementById('tab-content-cases').innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-slate-800">My Cases</h2>
            <button id="create-case-btn" class="bg-indigo-600 text-white font-bold py-2 px-4 rounded-md text-sm"><i class="fas fa-gavel mr-2"></i>Log New Case</button>
        </div>
        <div id="cases-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
    `;
    document.getElementById('tab-content-parenting-plans').innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-slate-800">My Parenting Plans</h2>
            <button id="create-plan-btn" class="bg-indigo-600 text-white font-bold py-2 px-4 rounded-md text-sm"><i class="fas fa-child mr-2"></i>Create New Plan</button>
        </div>
        <div id="plan-cards-container" class="space-y-4"></div>
    `;
    // Inject modal HTML from v1
    document.getElementById('case-modal').innerHTML = `...`; // Full HTML for case modal
    document.getElementById('log-modal').innerHTML = `...`; // Full HTML for log modal
}

// ... All case tracker functions (listenForCases, openCaseModal, etc.) are defined here, same as v1.
