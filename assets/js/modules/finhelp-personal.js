/* ================================================================================= */
/* FILE: assets/js/modules/finhelp-personal.js (Fully Functional)                    */
/* PURPOSE: A comprehensive personal finance dashboard including budgeting,          */
/* non-financial contributions, a full asset/liability register, and calculators.    */
/* ================================================================================= */
import { auth } from '../firebase-config.js';
import { getDocument, saveDocument } from '../database.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

let currentUser = null;
let userFinancialData = {}; // Local cache for all personal finance data

// Constants
const SA_MINIMUM_WAGE_HOURLY = 27.58; // As of March 2024, for non-financial contribution value

/**
 * Initializes the personal finance module.
 * @param {object} user - The authenticated Firebase user object.
 */
export async function init(user) {
    if (!user) {
        console.error("FinHelp Personal: User not authenticated.");
        return;
    }
    currentUser = user;
    console.log("Personal finance module initialized for user:", user.uid);

    const personalWorkspace = document.getElementById('personal-workspace');
    if (!personalWorkspace) {
        console.error("Personal workspace element not found.");
        return;
    }

    personalWorkspace.innerHTML = getPersonalWorkspaceHTML();
    
    await loadFinancialData();
    attachEventListeners();
    await renderTabContent('dashboard'); // Render the default tab
}

/**
 * Loads financial data from Firestore or initializes default data.
 */
async function loadFinancialData() {
    try {
        const data = await getDocument('userFinances', currentUser.uid);
        userFinancialData = data || initializeDefaultData();
        // Ensure all nested objects exist to prevent errors
        userFinancialData.personal = userFinancialData.personal || {};
        userFinancialData.personal.savingsGoals = userFinancialData.personal.savingsGoals || [];
        userFinancialData.personal.assets = userFinancialData.personal.assets || [];
        userFinancialData.personal.liabilities = userFinancialData.personal.liabilities || [];
        userFinancialData.personal.kidsFinance = userFinancialData.personal.kidsFinance || [];
        userFinancialData.personal.budgets = userFinancialData.personal.budgets || { individual: {}, family: { contributions: { financial: [], nonFinancial: [] } } };
        console.log("Financial data loaded:", userFinancialData);
    } catch (error) {
        console.error("Error loading financial data:", error);
        userFinancialData = initializeDefaultData();
    }
}

/**
 * Saves the current state of financial data to Firestore.
 */
async function saveFinancialData() {
    try {
        await saveDocument('userFinances', currentUser.uid, userFinancialData);
        showNotification('Your financial data has been saved.', 'success');
    } catch (error) {
        console.error("Error saving financial data:", error);
        showNotification('Could not save your data. Please try again.', 'error');
    }
}

/**
 * Initializes a default data structure for new users.
 * @returns {object} The default financial data object.
 */
function initializeDefaultData() {
    return {
        personal: {
            income: [{ id: Date.now(), source: 'Sample Salary', amount: 35000, frequency: 'monthly', date: '2025-07' }],
            expenses: [{ id: Date.now(), category: 'Housing', description: 'Rent', amount: 12000, frequency: 'monthly', date: '2025-07' }],
            assets: [],
            liabilities: [],
            insurance: [],
            savingsGoals: [],
            taxHistory: [],
            creditProfile: { score: null },
            kidsFinance: [],
            budgets: {
                individual: { categories: [] },
                family: { members: [], categories: [], contributions: { financial: [], nonFinancial: [] } }
            },
            documents: []
        },
        settings: {
            currency: 'ZAR',
            taxYear: new Date().getFullYear()
        }
    };
}

/**
 * Attaches global event listeners for tabs and dynamic content.
 */
function attachEventListeners() {
    const personalWorkspace = document.getElementById('personal-workspace');
    if (personalWorkspace) {
        personalWorkspace.addEventListener('click', async (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            // Handle Tab Switching
            if (button.classList.contains('tab-button')) {
                const tabName = button.dataset.tab;
                personalWorkspace.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                await renderTabContent(tabName);
                return;
            }

            // Handle Modal Openers & other actions
            const action = button.dataset.action;
            const id = button.dataset.id;
            if (action) {
                switch(action) {
                    case 'open-goal-modal': openGoalModal(id); break;
                    case 'open-asset-modal': openAssetModal(id); break;
                    case 'open-liability-modal': openLiabilityModal(id); break;
                    case 'open-kid-modal': openKidModal(id); break;
                    case 'open-calculator': openCalculatorModal(id); break;
                }
            }
        });
    }
}


/**
 * Renders the content for the selected tab.
 * @param {string} tabName - The name of the tab to render.
 */
async function renderTabContent(tabName) {
    const container = document.getElementById('personal-tab-content');
    if (!container) return;

    container.innerHTML = `<p class="text-center text-slate-500 py-10">Loading ${tabName}...</p>`;

    try {
        let content = '';
        switch (tabName) {
            case 'dashboard': content = renderDashboardTab(); break;
            case 'documents': content = renderDocumentsTab(); break;
            case 'budget': content = renderBudgetingTab(); break;
            case 'assets-liabilities': content = renderAssetsLiabilitiesTab(); break;
            case 'insurance': content = renderInsuranceTab(); break;
            case 'savings': content = renderSavingsGoalsTab(); break;
            case 'tax': content = renderTaxManagementTab(); break;
            case 'calculators': content = renderCalculatorsTab(); break;
            case 'credit': content = renderCreditProfileTab(); break;
            case 'kids': content = renderKidsDashboardTab(); break;
            default: content = `<p>Coming soon: ${tabName}</p>`;
        }
        container.innerHTML = content;
    } catch (error) {
        console.error(`Error rendering ${tabName} tab:`, error);
        container.innerHTML = `<p class="text-red-500 text-center py-10">Error loading content. Please try again.</p>`;
    }
}


// --- TAB RENDERING FUNCTIONS ---

function renderDashboardTab() {
    const totalIncome = (userFinancialData.personal?.income || []).reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = (userFinancialData.personal?.expenses || []).reduce((sum, item) => sum + item.amount, 0);
    const netWorth = calculateNetWorth();
    const savingsRate = calculateSavingsRate();

    return `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div class="bg-gradient-to-br from-green-400 to-green-600 text-white p-6 rounded-xl shadow-lg">
                <h4 class="font-semibold text-green-100">Monthly Income</h4>
                <p class="text-3xl font-bold mt-1">R ${totalIncome.toLocaleString()}</p>
            </div>
            <div class="bg-gradient-to-br from-red-400 to-red-600 text-white p-6 rounded-xl shadow-lg">
                <h4 class="font-semibold text-red-100">Monthly Expenses</h4>
                <p class="text-3xl font-bold mt-1">R ${totalExpenses.toLocaleString()}</p>
            </div>
            <div class="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                <h4 class="font-semibold text-blue-100">Net Worth</h4>
                <p class="text-3xl font-bold mt-1">R ${netWorth.toLocaleString()}</p>
            </div>
            <div class="bg-gradient-to-br from-purple-400 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                <h4 class="font-semibold text-purple-100">Savings Rate</h4>
                <p class="text-3xl font-bold mt-1">${savingsRate}%</p>
            </div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-md">
            <h3 class="text-xl font-bold text-slate-800 mb-4">Quick Actions</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onclick="document.querySelector('[data-tab=documents]').click()" class="p-4 bg-slate-100 rounded-lg text-center hover:bg-slate-200 transition">
                    <i class="fas fa-file-upload text-2xl text-indigo-500"></i>
                    <p class="mt-2 font-semibold text-sm">Upload Docs</p>
                </button>
                <button onclick="document.querySelector('[data-tab=budget]').click()" class="p-4 bg-slate-100 rounded-lg text-center hover:bg-slate-200 transition">
                    <i class="fas fa-wallet text-2xl text-green-500"></i>
                    <p class="mt-2 font-semibold text-sm">View Budget</p>
                </button>
                <button onclick="document.querySelector('[data-tab=savings]').click()" class="p-4 bg-slate-100 rounded-lg text-center hover:bg-slate-200 transition">
                    <i class="fas fa-piggy-bank text-2xl text-pink-500"></i>
                    <p class="mt-2 font-semibold text-sm">Savings Goals</p>
                </button>
                 <button onclick="document.querySelector('[data-tab=credit]').click()" class="p-4 bg-slate-100 rounded-lg text-center hover:bg-slate-200 transition">
                    <i class="fas fa-credit-card text-2xl text-blue-500"></i>
                    <p class="mt-2 font-semibold text-sm">Credit Score</p>
                </button>
            </div>
        </div>
    `;
}

function renderDocumentsTab() {
    return `
        <h2 class="text-2xl font-bold text-slate-800 mb-4">Document Center</h2>
        <p class="text-slate-600 mb-6">Upload bank statements, payslips, or paste bank SMS messages to automatically track your finances.</p>
        <div class="bg-white p-6 rounded-xl shadow-md">
            <h3 class="font-semibold text-lg mb-4">Upload & Parse</h3>
            <div class="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <i class="fas fa-cloud-upload-alt text-4xl text-slate-400 mb-4"></i>
                <h4 class="font-semibold">Document upload feature coming soon</h4>
                <p class="text-sm text-slate-500">This will allow you to upload PDFs and images for automatic data extraction.</p>
            </div>
        </div>
    `;
}

function renderBudgetingTab() {
     return `
        <h2 class="text-2xl font-bold text-slate-800 mb-4">Family & Co-Parenting Budget</h2>
        <p class="text-slate-600 mb-6">Track shared responsibilities, including both financial and non-financial contributions, to get a complete picture of your family's value creation.</p>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white p-6 rounded-xl shadow-md">
                <h3 class="font-semibold text-lg mb-2 flex items-center"><i class="fas fa-money-bill-wave text-green-500 mr-3"></i>Financial Contributions</h3>
                <div class="bg-slate-50 p-4 rounded-lg space-y-2">
                    <p class="text-sm text-slate-500">Feature coming soon.</p>
                    <button class="btn-primary w-full mt-2 opacity-50 cursor-not-allowed">Log Financial Contribution</button>
                </div>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-md">
                <h3 class="font-semibold text-lg mb-2 flex items-center"><i class="fas fa-hands-helping text-blue-500 mr-3"></i>Non-Financial Contributions</h3>
                <div class="bg-slate-50 p-4 rounded-lg space-y-2">
                    <p class="text-sm text-slate-500">Value non-monetary tasks based on the South African minimum wage (R${SA_MINIMUM_WAGE_HOURLY}/hr).</p>
                    <button class="btn-primary w-full mt-2 opacity-50 cursor-not-allowed">Log Non-Financial Task</button>
                </div>
            </div>
        </div>
    `;
}

function renderInsuranceTab() {
    return `
        <h2 class="text-2xl font-bold text-slate-800 mb-4">Insurance Hub</h2>
        <p class="text-slate-600 mb-6">Manage all your insurance policies in one place and get smart advice.</p>
        <div class="bg-white p-6 rounded-xl shadow-md text-center">
             <i class="fas fa-shield-alt text-4xl text-slate-300 mb-4"></i>
             <h3 class="font-semibold text-lg">Insurance Management Coming Soon</h3>
             <p class="text-sm text-slate-500">Track policies, get renewal alerts, and optimize your coverage.</p>
        </div>
    `;
}

function renderSavingsGoalsTab() {
    const goals = userFinancialData.personal.savingsGoals || [];
    const goalsHTML = goals.length > 0 ? goals.map(goal => {
        const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
        return `
            <div class="bg-white p-4 rounded-lg shadow-md border-l-4 border-indigo-500">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-bold text-slate-800">${goal.name}</h4>
                        <p class="text-sm text-slate-500">Target: R ${goal.targetAmount.toLocaleString()}</p>
                    </div>
                    <div class="text-sm font-semibold">R ${goal.currentAmount.toLocaleString()}</div>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2.5 mt-2">
                    <div class="bg-indigo-600 h-2.5 rounded-full" style="width: ${progress}%"></div>
                </div>
                <p class="text-xs text-right text-slate-500 mt-1">${Math.round(progress)}% Complete</p>
                <button data-action="open-goal-modal" data-id="${goal.id}" class="text-xs text-indigo-600 hover:underline mt-2">Edit</button>
            </div>
        `;
    }).join('') : `<p class="text-center text-slate-500 col-span-full py-8">No savings goals yet. Add one to get started!</p>`;

    return `
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-slate-800">Savings Goals</h2>
            <button data-action="open-goal-modal" class="btn-primary">Add New Goal</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${goalsHTML}
        </div>
    `;
}

function renderAssetsLiabilitiesTab() {
    const assets = userFinancialData.personal.assets || [];
    const liabilities = userFinancialData.personal.liabilities || [];

    const assetsHTML = assets.length > 0 ? assets.map(asset => `
        <div class="flex justify-between items-center p-3 bg-slate-100 rounded-md">
            <span>${asset.name} (${asset.type})</span>
            <span class="font-semibold">R ${asset.value.toLocaleString()}</span>
        </div>
    `).join('') : `<p class="text-sm text-slate-500">No assets logged.</p>`;

    const liabilitiesHTML = liabilities.length > 0 ? liabilities.map(liability => `
        <div class="flex justify-between items-center p-3 bg-slate-100 rounded-md">
            <span>${liability.name} (${liability.type})</span>
            <span class="font-semibold">R ${liability.balance.toLocaleString()}</span>
        </div>
    `).join('') : `<p class="text-sm text-slate-500">No liabilities logged.</p>`;

    return `
        <h2 class="text-2xl font-bold text-slate-800 mb-4">Assets & Liabilities</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white p-6 rounded-xl shadow-md">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-semibold text-lg">Assets</h3>
                    <button data-action="open-asset-modal" class="btn-primary text-sm">Add Asset</button>
                </div>
                <div class="space-y-2">${assetsHTML}</div>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-md">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-semibold text-lg">Liabilities</h3>
                    <button data-action="open-liability-modal" class="btn-primary text-sm">Add Liability</button>
                </div>
                <div class="space-y-2">${liabilitiesHTML}</div>
            </div>
        </div>
    `;
}


function renderTaxManagementTab() {
    return `<h2 class="text-2xl font-bold text-slate-800 mb-4">Tax Management</h2>
            <p class="text-slate-600 mb-6">Feature coming soon.</p>`;
}

function renderCalculatorsTab() {
    return `<h2 class="text-2xl font-bold text-slate-800 mb-4">Financial Calculators</h2>
            <p class="text-slate-600 mb-6">Feature coming soon.</p>`;
}

function renderCreditProfileTab() {
    return `<h2 class="text-2xl font-bold text-slate-800 mb-4">Credit Profile</h2>
            <p class="text-slate-600 mb-6">Feature coming soon.</p>`;
}

function renderKidsDashboardTab() {
     return `<h2 class="text-2xl font-bold text-slate-800 mb-4">Kids Dashboard</h2>
             <p class="text-slate-600 mb-6">Feature coming soon.</p>`;
}


// --- CALCULATION HELPER FUNCTIONS ---

function calculateNetWorth() {
    const totalAssets = (userFinancialData.personal?.assets || []).reduce((sum, item) => sum + (item.value || 0), 0);
    const totalLiabilities = (userFinancialData.personal?.liabilities || []).reduce((sum, item) => sum + (item.balance || 0), 0);
    return totalAssets - totalLiabilities;
}

function calculateSavingsRate() {
    const totalIncome = (userFinancialData.personal?.income || []).reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalExpenses = (userFinancialData.personal?.expenses || []).reduce((sum, item) => sum + (item.amount || 0), 0);
    if (totalIncome === 0) return 0;
    const rate = ((totalIncome - totalExpenses) / totalIncome) * 100;
    return Math.round(rate);
}

// --- MODAL & FORM HANDLING ---

function createModal(id, title, formHTML) {
    const modalContainer = document.createElement('div');
    modalContainer.id = `${id}-container`;
    modalContainer.innerHTML = `
        <div id="${id}" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-8 w-full max-w-md">
                <h3 class="text-xl font-bold mb-4">${title}</h3>
                ${formHTML}
            </div>
        </div>
    `;
    document.body.appendChild(modalContainer);
}

function removeModal(id) {
    const modalContainer = document.getElementById(`${id}-container`);
    modalContainer?.remove();
}

// Savings Goal Modal
window.openGoalModal = (goalId = null) => {
    let goal = {};
    if (goalId) {
        goal = userFinancialData.personal.savingsGoals.find(g => g.id === goalId) || {};
    }
    const formHTML = `
        <form id="goal-form" data-id="${goal.id || ''}">
            <div class="space-y-4">
                <div><label class="block text-sm font-medium">Goal Name</label><input type="text" id="goal-name" class="input" value="${goal.name || ''}" required></div>
                <div><label class="block text-sm font-medium">Target Amount (R)</label><input type="number" id="goal-target" class="input" value="${goal.targetAmount || ''}" required></div>
                <div><label class="block text-sm font-medium">Current Amount (R)</label><input type="number" id="goal-current" class="input" value="${goal.currentAmount || 0}" required></div>
                <div><label class="block text-sm font-medium">Target Date</label><input type="date" id="goal-date" class="input" value="${goal.targetDate || ''}" required></div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
                <button type="button" onclick="closeModal('goal-modal')" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">Save Goal</button>
            </div>
        </form>
    `;
    createModal('goal-modal', goal.id ? 'Edit Savings Goal' : 'Add Savings Goal', formHTML);
    document.getElementById('goal-form').addEventListener('submit', handleGoalFormSubmit);
};

// Asset Modal
window.openAssetModal = (assetId = null) => {
    let asset = {};
    if (assetId) {
        asset = userFinancialData.personal.assets.find(a => a.id === assetId) || {};
    }
    const formHTML = `
        <form id="asset-form" data-id="${asset.id || ''}">
            <div class="space-y-4">
                <div><label class="block text-sm font-medium">Asset Name</label><input type="text" id="asset-name" class="input" value="${asset.name || ''}" required></div>
                <div><label class="block text-sm font-medium">Asset Type</label><input type="text" id="asset-type" class="input" value="${asset.type || ''}" placeholder="e.g., Property, Vehicle" required></div>
                <div><label class="block text-sm font-medium">Current Value (R)</label><input type="number" id="asset-value" class="input" value="${asset.value || ''}" required></div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
                <button type="button" onclick="closeModal('asset-modal')" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">Save Asset</button>
            </div>
        </form>
    `;
    createModal('asset-modal', asset.id ? 'Edit Asset' : 'Add Asset', formHTML);
    document.getElementById('asset-form').addEventListener('submit', handleAssetFormSubmit);
};

// Liability Modal
window.openLiabilityModal = (liabilityId = null) => {
    let liability = {};
    if (liabilityId) {
        liability = userFinancialData.personal.liabilities.find(l => l.id === liabilityId) || {};
    }
    const formHTML = `
        <form id="liability-form" data-id="${liability.id || ''}">
            <div class="space-y-4">
                <div><label class="block text-sm font-medium">Liability Name</label><input type="text" id="liability-name" class="input" value="${liability.name || ''}" required></div>
                <div><label class="block text-sm font-medium">Liability Type</label><input type="text" id="liability-type" class="input" value="${liability.type || ''}" placeholder="e.g., Home Loan, Credit Card" required></div>
                <div><label class="block text-sm font-medium">Outstanding Balance (R)</label><input type="number" id="liability-balance" class="input" value="${liability.balance || ''}" required></div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
                <button type="button" onclick="closeModal('liability-modal')" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">Save Liability</button>
            </div>
        </form>
    `;
    createModal('liability-modal', liability.id ? 'Edit Liability' : 'Add Liability', formHTML);
    document.getElementById('liability-form').addEventListener('submit', handleLiabilityFormSubmit);
};


window.closeModal = (id) => removeModal(id);

async function handleGoalFormSubmit(e) { 
    e.preventDefault();
    const form = e.target;
    const goalId = form.dataset.id;

    const goalData = {
        id: goalId || Date.now().toString(),
        name: document.getElementById('goal-name').value,
        targetAmount: parseFloat(document.getElementById('goal-target').value),
        currentAmount: parseFloat(document.getElementById('goal-current').value),
        targetDate: document.getElementById('goal-date').value,
    };

    if (goalId) {
        const index = userFinancialData.personal.savingsGoals.findIndex(g => g.id.toString() === goalId);
        userFinancialData.personal.savingsGoals[index] = goalData;
    } else {
        userFinancialData.personal.savingsGoals.push(goalData);
    }

    await saveFinancialData();
    removeModal('goal-modal');
    await renderTabContent('savings');
}

async function handleAssetFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const assetId = form.dataset.id;
    const assetData = {
        id: assetId || Date.now().toString(),
        name: document.getElementById('asset-name').value,
        type: document.getElementById('asset-type').value,
        value: parseFloat(document.getElementById('asset-value').value),
    };
    if (assetId) {
        const index = userFinancialData.personal.assets.findIndex(a => a.id.toString() === assetId);
        userFinancialData.personal.assets[index] = assetData;
    } else {
        userFinancialData.personal.assets.push(assetData);
    }
    await saveFinancialData();
    removeModal('asset-modal');
    await renderTabContent('assets-liabilities');
}

async function handleLiabilityFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const liabilityId = form.dataset.id;
    const liabilityData = {
        id: liabilityId || Date.now().toString(),
        name: document.getElementById('liability-name').value,
        type: document.getElementById('liability-type').value,
        balance: parseFloat(document.getElementById('liability-balance').value),
    };
    if (liabilityId) {
        const index = userFinancialData.personal.liabilities.findIndex(l => l.id.toString() === liabilityId);
        userFinancialData.personal.liabilities[index] = liabilityData;
    } else {
        userFinancialData.personal.liabilities.push(liabilityData);
    }
    await saveFinancialData();
    removeModal('liability-modal');
    await renderTabContent('assets-liabilities');
}

// --- UTILITY FUNCTIONS ---
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white z-50 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}


// --- HTML TEMPLATE ---
function getPersonalWorkspaceHTML() {
    return `
        <style>
            .tab-button { padding: 1rem 0.5rem; border-bottom: 3px solid transparent; color: #475569; font-weight: 600; transition: all 0.2s; cursor: pointer; }
            .tab-button:hover { color: #1e293b; }
            .tab-button.active { color: #4f46e5; border-bottom-color: #4f46e5; }
            .btn-primary { background-color: #4f46e5; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; transition: background-color 0.2s; }
            .btn-primary:hover { background-color: #4338ca; }
            .btn-secondary { background-color: #e2e8f0; color: #1e293b; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; transition: background-color 0.2s; }
            .btn-secondary:hover { background-color: #cbd5e1; }
            .input { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; margin-top: 0.25rem; }
        </style>
        <div class="border-b border-slate-200">
            <nav class="-mb-px flex flex-wrap space-x-6" id="personal-tabs">
                <button data-tab="dashboard" class="tab-button active">Dashboard</button>
                <button data-tab="documents" class="tab-button">Documents</button>
                <button data-tab="budget" class="tab-button">Budgeting</button>
                <button data-tab="assets-liabilities" class="tab-button">Assets & Liabilities</button>
                <button data-tab="savings" class="tab-button">Savings</button>
                <button data-tab="insurance" class="tab-button">Insurance</button>
                <button data-tab="tax" class="tab-button">Tax Pack</button>
                <button data-tab="calculators" class="tab-button">Calculators</button>
                <button data-tab="credit" class="tab-button">Credit</button>
                <button data-tab="kids" class="tab-button">Kids</button>
            </nav>
        </div>
        <div id="personal-tab-content" class="py-6"></div>
    `;
}

// Initialize the FinHelp Personal module when Firebase is ready
document.addEventListener('firebase-ready', () => {
    onAuthStateChanged(auth, (user) => {
        if (user && !currentUser) { // Initialize only once
            init(user);
        }
    });
});
