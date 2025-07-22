/* ================================================================================= */
/* FILE: assets/js/modules/finhelp-personal.js (Assets & Budget Complete)            */
/* PURPOSE: A comprehensive personal finance dashboard including budgeting,          */
/* non-financial contributions, a full asset/liability register, and calculators.    */
/* ================================================================================= */
import { auth, db } from '../firebase-config.js';
import { getDocument, setDoc } from '../database.js'; // Using setDoc directly now
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let currentUser = null;
let financeData = {}; // Local cache for all personal finance data

// Constants
const SA_MINIMUM_WAGE_HOURLY = 27.58; // As of March 2024

export function init(user) {
    if (!user) return;
    currentUser = user;
    console.log("Personal finance module initialized.");

    const personalWorkspace = document.getElementById('personal-workspace');
    personalWorkspace.innerHTML = getPersonalWorkspaceHTML();
    
    attachTabListeners();

    const financeDocRef = doc(db, "users", currentUser.uid, "personalFinance", "main");
    onSnapshot(financeDocRef, (docSnap) => {
        if (docSnap.exists()) {
            financeData = docSnap.data();
        } else {
            // Initialize data if it doesn't exist
            financeData = {
                assets: [], liabilities: [],
                budget: { income: [], expenses: [], nonFinancial: [] },
                savingsGoals: [],
            };
        }
        const activeTab = document.querySelector('#personal-workspace .tab-button.active')?.dataset.tab || 'dashboard';
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
        case 'dashboard': renderDashboard(contentContainer); break;
        case 'budget': renderBudget(contentContainer); break;
        case 'assets': renderAssetsLiabilities(contentContainer); break;
        case 'calculators': renderCalculators(contentContainer); break;
    }
}

// --- TAB RENDERERS ---

function renderDashboard(container) {
    const totalAssets = (financeData.assets || []).reduce((sum, a) => sum + Number(a.value), 0);
    const totalLiabilities = (financeData.liabilities || []).reduce((sum, l) => sum + Number(l.balance), 0);
    const netWealth = totalAssets - totalLiabilities;
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="font-bold text-slate-800">Net Wealth</h3>
                <p class="text-4xl font-bold text-indigo-600 mt-2">R ${netWealth.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <div class="mt-4 space-y-2 text-sm">
                    <div class="flex justify-between"><span class="text-slate-500">Total Assets:</span><span class="font-semibold text-green-600">R ${totalAssets.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span></div>
                    <div class="flex justify-between"><span class="text-slate-500">Total Liabilities:</span><span class="font-semibold text-red-600">R ${totalLiabilities.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span></div>
                </div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-sm">
                 <h3 class="font-bold text-slate-800">Savings Goals</h3>
                 <p class="text-slate-500 mt-2">Savings goal tracking will be available here soon.</p>
            </div>
        </div>`;
}

function renderBudget(container) {
    const budget = financeData.budget || { income: [], expenses: [], nonFinancial: [] };
    const totalIncome = (budget.income || []).reduce((sum, item) => sum + Number(item.amount), 0);
    const totalExpenses = (budget.expenses || []).reduce((sum, item) => sum + Number(item.amount), 0);
    const surplus = totalIncome - totalExpenses;
    const totalNonFinancialValue = (budget.nonFinancial || []).reduce((sum, item) => sum + (Number(item.hours) * Number(item.rate)), 0);

    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-6">
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <h3 class="font-semibold text-lg text-slate-800 mb-3">Monthly Income</h3>
                    <div id="income-list" class="space-y-2 mb-4">${renderBudgetItems(budget.income, 'income')}</div>
                    <div class="border-t pt-2 font-bold flex justify-between"><span>Total:</span><span>R ${totalIncome.toFixed(2)}</span></div>
                    <form id="add-income-form" class="mt-4 border-t pt-4">
                        <div class="flex gap-2"><input type="text" id="income-desc" placeholder="Source" class="input w-full" required><input type="number" step="0.01" id="income-amount" placeholder="Amount" class="input w-full" required></div>
                        <button type="submit" class="btn-secondary w-full mt-3 text-sm">Add Income</button>
                    </form>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <h3 class="font-semibold text-lg text-slate-800 mb-3">Recurring Monthly Expenses</h3>
                    <div id="expense-list" class="space-y-2 mb-4">${renderBudgetItems(budget.expenses, 'expenses')}</div>
                    <div class="border-t pt-2 font-bold flex justify-between"><span>Total:</span><span>R ${totalExpenses.toFixed(2)}</span></div>
                     <form id="add-expense-form" class="mt-4 border-t pt-4">
                        <div class="flex gap-2"><input type="text" id="expense-desc" placeholder="Expense" class="input w-full" required><input type="number" step="0.01" id="expense-amount" placeholder="Amount" class="input w-full" required></div>
                        <button type="submit" class="btn-secondary w-full mt-3 text-sm">Add Expense</button>
                    </form>
                </div>
            </div>
            <div class="space-y-6">
                 <div class="bg-white p-6 rounded-lg shadow-sm text-center">
                    <h3 class="font-semibold text-lg text-slate-800">Monthly Surplus / Deficit</h3>
                    <p class="text-3xl font-bold mt-2 ${surplus >= 0 ? 'text-green-600' : 'text-red-600'}">R ${surplus.toFixed(2)}</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <h3 class="font-semibold text-lg text-slate-800 mb-3">Non-Financial Contributions</h3>
                    <div id="non-financial-list" class="space-y-2 mb-4">${renderBudgetItems(budget.nonFinancial, 'nonFinancial')}</div>
                    <div class="border-t pt-2 font-bold flex justify-between"><span>Total Weekly Value:</span><span>R ${totalNonFinancialValue.toFixed(2)}</span></div>
                    <form id="add-non-financial-form" class="mt-4 border-t pt-4">
                        <input type="text" id="nf-task" placeholder="Task" class="input w-full mb-2" required>
                        <div class="flex gap-2"><input type="number" id="nf-hours" placeholder="Hours/Week" class="input w-full" required><input type="number" step="0.01" id="nf-rate" value="${SA_MINIMUM_WAGE_HOURLY}" class="input w-full" required></div>
                        <button type="submit" class="btn-secondary w-full mt-3 text-sm">Add Contribution</button>
                    </form>
                </div>
            </div>
        </div>`;
    
    document.getElementById('add-income-form').addEventListener('submit', (e) => handleAddBudgetItem(e, 'income'));
    document.getElementById('add-expense-form').addEventListener('submit', (e) => handleAddBudgetItem(e, 'expenses'));
    document.getElementById('add-non-financial-form').addEventListener('submit', handleAddNonFinancial);
    attachDeleteListeners('income');
    attachDeleteListeners('expenses');
    attachDeleteListeners('nonFinancial');
}

function renderAssetsLiabilities(container) {
    const assetTypes = ['Immovable Property', 'Vehicles', 'Financial', 'Movable'];
    const liabilityTypes = ['Mortgage Bond', 'Vehicle Finance', 'Personal Loan', 'Credit Card'];

    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white p-6 rounded-lg shadow-sm space-y-4">
                <h3 class="font-semibold text-lg text-slate-800">Asset Register</h3>
                <div id="assets-list">${renderAssetLiabilityGroup(financeData.assets || [], assetTypes, 'asset')}</div>
                <form id="add-asset-form" class="border-t pt-4">
                    <p class="text-sm font-medium mb-2">Add New Asset</p>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input type="text" id="asset-desc" placeholder="Description" class="input" required>
                        <input type="number" step="0.01" id="asset-value" placeholder="Current Value (R)" class="input" required>
                        <select id="asset-type" class="input">${assetTypes.map(t => `<option>${t}</option>`).join('')}</select>
                    </div>
                    <button type="submit" class="btn-secondary w-full mt-3 text-sm">Add Asset</button>
                </form>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-sm space-y-4">
                <h3 class="font-semibold text-lg text-slate-800">Liability Register</h3>
                <div id="liabilities-list">${renderAssetLiabilityGroup(financeData.liabilities || [], liabilityTypes, 'liability')}</div>
                 <form id="add-liability-form" class="border-t pt-4">
                    <p class="text-sm font-medium mb-2">Add New Liability</p>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input type="text" id="liability-desc" placeholder="Description" class="input" required>
                        <input type="number" step="0.01" id="liability-balance" placeholder="Outstanding Balance (R)" class="input" required>
                        <select id="liability-type" class="input">${liabilityTypes.map(t => `<option>${t}</option>`).join('')}</select>
                    </div>
                    <button type="submit" class="btn-secondary w-full mt-3 text-sm">Add Liability</button>
                </form>
            </div>
        </div>`;

    document.getElementById('add-asset-form').addEventListener('submit', handleAddAsset);
    document.getElementById('add-liability-form').addEventListener('submit', handleAddLiability);
    document.querySelectorAll('.delete-asset-btn').forEach(b => b.addEventListener('click', (e) => handleDeleteItem(e, 'assets')));
    document.querySelectorAll('.delete-liability-btn').forEach(b => b.addEventListener('click', (e) => handleDeleteItem(e, 'liabilities')));
}

function renderCalculators(container) { /* ... Unchanged ... */ }
function renderTaxPack(container) { /* ... Unchanged ... */ }

// --- HELPER RENDERERS ---

function renderBudgetItems(items, type) {
    if (!items || items.length === 0) return '<p class="text-xs text-slate-400 px-1">No items added yet.</p>';
    return items.map((item, index) => {
        let value;
        if (type === 'nonFinancial') {
            value = `R ${(item.hours * item.rate).toFixed(2)}/wk`;
        } else {
            value = `R ${Number(item.amount).toFixed(2)}`;
        }
        return `
            <div class="text-sm flex justify-between items-center hover:bg-slate-50 p-1 rounded-md">
                <span>${item.description || item.task}</span>
                <div class="flex items-center">
                  <span class="font-semibold mr-3">${value}</span>
                  <button data-index="${index}" data-type="${type}" class="delete-budget-item-btn text-red-400 hover:text-red-600">&times;</button>
                </div>
            </div>`;
    }).join('');
}

function renderAssetLiabilityGroup(items, types, category) {
    return types.map(type => {
        const filteredItems = items.filter(item => item.type === type);
        if (filteredItems.length === 0) return '';
        return `
            <div class="mb-3">
                <h4 class="text-xs font-bold uppercase text-slate-500">${type}</h4>
                <div class="mt-1 space-y-1">
                    ${filteredItems.map((item, index) => `
                        <div class="text-sm flex justify-between items-center hover:bg-slate-50 p-1 rounded-md">
                            <span>${item.description}</span>
                            <div class="flex items-center">
                                <span class="font-semibold mr-3">R ${Number(item.value || item.balance).toFixed(2)}</span>
                                ${type === 'Immovable Property' ? '<label class="flex items-center text-xs"><input type="checkbox" class="h-3 w-3 rounded-sm mr-1"> eKhaya</label>' : ''}
                                <button data-index="${items.indexOf(item)}" class="delete-${category}-btn text-red-400 hover:text-red-600 ml-2">&times;</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}


// --- LOGIC & EVENT HANDLERS ---

async function saveData() {
    try {
        await setDoc(doc(db, "users", currentUser.uid, "personalFinance", "main"), financeData);
    } catch (error) {
        console.error("Error saving finance data:", error);
        alert("Could not save your changes.");
    }
}

async function handleAddBudgetItem(e, type) {
    e.preventDefault();
    const form = e.target;
    const desc = form.querySelector(`#${type.slice(0, -1)}-desc`).value;
    const amount = form.querySelector(`#${type.slice(0, -1)}-amount`).value;
    
    if (!financeData.budget[type]) financeData.budget[type] = [];
    financeData.budget[type].push({ description: desc, amount: Number(amount) });
    
    await saveData();
    form.reset();
}

async function handleAddNonFinancial(e) {
    e.preventDefault();
    const form = e.target;
    const newItem = {
        task: form.querySelector('#nf-task').value,
        hours: form.querySelector('#nf-hours').value,
        rate: form.querySelector('#nf-rate').value,
    };
    if (!financeData.budget.nonFinancial) financeData.budget.nonFinancial = [];
    financeData.budget.nonFinancial.push(newItem);
    await saveData();
    form.reset();
    document.getElementById('nf-rate').value = SA_MINIMUM_WAGE_HOURLY;
}

function attachDeleteListeners(type) {
    document.querySelectorAll(`.delete-budget-item-btn[data-type="${type}"]`).forEach(button => {
        button.addEventListener('click', async (e) => {
            const index = e.currentTarget.dataset.index;
            financeData.budget[type].splice(index, 1);
            await saveData();
        });
    });
}

async function handleAddAsset(e) {
    e.preventDefault();
    const form = e.target;
    const newItem = {
        description: form.querySelector('#asset-desc').value,
        value: Number(form.querySelector('#asset-value').value),
        type: form.querySelector('#asset-type').value,
    };
    if (!financeData.assets) financeData.assets = [];
    financeData.assets.push(newItem);
    await saveData();
    form.reset();
}

async function handleAddLiability(e) {
    e.preventDefault();
    const form = e.target;
    const newItem = {
        description: form.querySelector('#liability-desc').value,
        balance: Number(form.querySelector('#liability-balance').value),
        type: form.querySelector('#liability-type').value,
    };
    if (!financeData.liabilities) financeData.liabilities = [];
    financeData.liabilities.push(newItem);
    await saveData();
    form.reset();
}

async function handleDeleteItem(e, type) {
    const index = e.currentTarget.dataset.index;
    if (confirm(`Are you sure you want to delete this ${type.slice(0,-1)}?`)) {
        financeData[type].splice(index, 1);
        await saveData();
    }
}

// Unchanged functions
function handleAffordabilityCalc(e) { /* ... */ }
function handleTaxCalc(e) { /* ... */ }

// --- HTML TEMPLATE ---
function getPersonalWorkspaceHTML() {
    return `
        <div class="border-b border-slate-200"><nav class="-mb-px flex flex-wrap space-x-8" id="personal-tabs"><button data-tab="dashboard" class="tab-button active ...">Dashboard</button><button data-tab="budget" class="tab-button ...">Budgeting</button><button data-tab="assets" class="tab-button ...">Assets & Liabilities</button><button data-tab="calculators" class="tab-button ...">Calculators</button></nav></div>
        <div id="personal-tab-content" class="py-6"></div>
    `;
}
