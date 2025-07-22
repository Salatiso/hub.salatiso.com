/* ================================================================================= */
/* FILE: assets/js/modules/finhelp-personal.js (New & Robust)                        */
/* PURPOSE: A comprehensive personal finance dashboard including budgeting,          */
/* non-financial contributions, calculators, and tax tools.                          */
/* ================================================================================= */
import { auth, db } from '../firebase-config.js';
import { getDocument, updateDocument } from '../database.js';
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
                assets: [],
                liabilities: [],
                budget: { income: [], expenses: [], nonFinancial: [] },
                savingsGoals: [],
            };
        }
        // Always render the default tab after data is loaded/initialized
        renderTabContent('dashboard');
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
        case 'tax': renderTaxPack(contentContainer); break;
    }
}

// --- TAB RENDERERS ---

function renderDashboard(container) {
    const totalAssets = (financeData.assets || []).reduce((sum, a) => sum + Number(a.value), 0);
    const totalLiabilities = (financeData.liabilities || []).reduce((sum, l) => sum + Number(l.balance), 0);
    const netWealth = totalAssets - totalLiabilities;
    
    // Example savings goal
    const savingsGoal = financeData.savingsGoals?.[0] || { name: 'Emergency Fund', target: 20000, current: 5000 };
    const goalProgress = (savingsGoal.current / savingsGoal.target) * 100;

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="font-bold text-slate-800">Net Wealth</h3>
                <p class="text-3xl font-bold text-indigo-600 mt-2">R ${netWealth.toFixed(2)}</p>
                <p class="text-sm text-slate-500 mt-1">Assets: R ${totalAssets.toFixed(2)}</p>
                <p class="text-sm text-slate-500">Liabilities: R ${totalLiabilities.toFixed(2)}</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-sm md:col-span-2">
                <h3 class="font-bold text-slate-800">${savingsGoal.name}</h3>
                <div class="w-full bg-slate-200 rounded-full h-4 mt-3">
                    <div class="bg-green-500 h-4 rounded-full" style="width: ${goalProgress}%"></div>
                </div>
                <div class="flex justify-between items-center mt-2 text-sm">
                    <span class="font-semibold">R ${savingsGoal.current.toFixed(2)}</span>
                    <span class="text-slate-500">Target: R ${savingsGoal.target.toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;
}

function renderBudget(container) {
    const budget = financeData.budget || { income: [], expenses: [], nonFinancial: [] };
    const totalNonFinancialValue = budget.nonFinancial.reduce((sum, item) => sum + (Number(item.hours) * Number(item.rate)), 0);

    container.innerHTML = `
        <h2 class="text-2xl font-bold text-slate-800 mb-4">Household & Children's Budget</h2>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Financial Contributions -->
            <div class="bg-white p-6 rounded-lg shadow-sm lg:col-span-2">
                <h3 class="font-semibold text-lg text-slate-800 mb-3">Financial Contributions</h3>
                <!-- Income & Expenses would be listed here -->
                <p class="text-slate-600">Detailed income and expense tracking will be built here.</p>
            </div>
            <!-- Non-Financial Contributions -->
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="font-semibold text-lg text-slate-800 mb-3">Non-Financial Contributions</h3>
                <p class="text-sm text-slate-500 mb-4">Value the essential work that supports the household.</p>
                <div id="non-financial-list" class="space-y-2 mb-4">
                    ${budget.nonFinancial.map((item, i) => `
                        <div class="text-sm flex justify-between"><span>${item.task}</span><span class="font-semibold">R ${(item.hours * item.rate).toFixed(2)}/wk</span></div>
                    `).join('')}
                </div>
                <div class="border-t pt-2 font-bold flex justify-between">
                    <span>Total Weekly Value:</span>
                    <span>R ${totalNonFinancialValue.toFixed(2)}</span>
                </div>
                <form id="add-non-financial-form" class="mt-4 border-t pt-4">
                    <input type="text" id="nf-task" placeholder="Task (e.g., Childcare)" class="input w-full mb-2" required>
                    <div class="flex gap-2">
                        <input type="number" id="nf-hours" placeholder="Hours/Week" class="input w-full" required>
                        <input type="number" id="nf-rate" value="${SA_MINIMUM_WAGE_HOURLY}" class="input w-full" required>
                    </div>
                    <button type="submit" class="btn-secondary w-full mt-3 text-sm">Add Contribution</button>
                </form>
            </div>
        </div>
    `;
    document.getElementById('add-non-financial-form').addEventListener('submit', handleAddNonFinancial);
}

function renderAssetsLiabilities(container) { /* ... UI for Assets/Liabilities ... */ }
function renderCalculators(container) {
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Home Loan Affordability -->
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="font-semibold text-lg text-slate-800 mb-4">Home Loan Affordability</h3>
                <form id="affordability-form" class="space-y-4">
                    <div><label class="text-sm font-medium">Gross Monthly Income (R)</label><input type="number" id="calc-income" class="input" required></div>
                    <div><label class="text-sm font-medium">Total Monthly Expenses (R)</label><input type="number" id="calc-expenses" class="input" required></div>
                    <div><label class="text-sm font-medium">Interest Rate (%)</label><input type="number" id="calc-rate" value="11.75" class="input" required></div>
                    <div><label class="text-sm font-medium">Loan Term (Years)</label><input type="number" id="calc-term" value="20" class="input" required></div>
                    <button type="submit" class="btn-primary w-full">Calculate</button>
                </form>
                <div id="affordability-result" class="mt-4 text-center"></div>
            </div>
            <!-- SARS Tax Estimator -->
            <div class="bg-white p-6 rounded-lg shadow-sm">
                 <h3 class="font-semibold text-lg text-slate-800 mb-4">SARS Tax Estimator (2025)</h3>
                 <p class="text-xs text-slate-500 mb-4">For individuals under 65. This is an estimate for planning purposes only.</p>
                 <form id="tax-calc-form" class="space-y-4">
                    <div><label class="text-sm font-medium">Total Annual Income (R)</label><input type="number" id="tax-income" class="input" required></div>
                    <button type="submit" class="btn-primary w-full">Calculate Estimated Tax</button>
                 </form>
                 <div id="tax-result" class="mt-4 text-center"></div>
            </div>
        </div>
    `;
    document.getElementById('affordability-form').addEventListener('submit', handleAffordabilityCalc);
    document.getElementById('tax-calc-form').addEventListener('submit', handleTaxCalc);
}
function renderTaxPack(container) { /* ... UI for Tax Pack ... */ }

// --- LOGIC & EVENT HANDLERS ---

async function saveData() {
    try {
        await updateDocument('users', currentUser.uid, { 'personalFinance.main': financeData });
    } catch (error) {
        console.error("Error saving finance data:", error);
        alert("Could not save your changes.");
    }
}

async function handleAddNonFinancial(e) {
    e.preventDefault();
    const newItem = {
        task: document.getElementById('nf-task').value,
        hours: document.getElementById('nf-hours').value,
        rate: document.getElementById('nf-rate').value,
    };
    if (!financeData.budget.nonFinancial) financeData.budget.nonFinancial = [];
    financeData.budget.nonFinancial.push(newItem);
    await saveData();
    renderTabContent('budget'); // Re-render the tab
}

function handleAffordabilityCalc(e) {
    e.preventDefault();
    const income = parseFloat(document.getElementById('calc-income').value);
    const expenses = parseFloat(document.getElementById('calc-expenses').value);
    const interestRate = parseFloat(document.getElementById('calc-rate').value) / 100 / 12;
    const termMonths = parseInt(document.getElementById('calc-term').value) * 12;

    const disposableIncome = income - expenses;
    const maxRepayment = disposableIncome * 0.30; // Standard bank rule: 30% of disposable income

    // Bond calculation formula
    const bondAmount = maxRepayment * ( (Math.pow(1 + interestRate, termMonths) - 1) / (interestRate * Math.pow(1 + interestRate, termMonths)) );
    
    const resultEl = document.getElementById('affordability-result');
    if (bondAmount > 0) {
        resultEl.innerHTML = `
            <p class="text-slate-600">You can likely afford a bond of around:</p>
            <p class="text-3xl font-bold text-green-600 mt-1">R ${bondAmount.toFixed(0)}</p>
            <p class="text-sm text-slate-500 mt-1">Estimated monthly repayment: R ${maxRepayment.toFixed(2)}</p>
        `;
    } else {
        resultEl.innerHTML = `<p class="text-red-500">Your expenses are too high to qualify for a bond with this income.</p>`;
    }
}

function handleTaxCalc(e) {
    e.preventDefault();
    const income = parseFloat(document.getElementById('tax-income').value);
    
    // SARS Tax Brackets for 2024/2025 (under 65)
    const brackets = [
        { limit: 237100, rate: 0.18, base: 0 },
        { limit: 370500, rate: 0.26, base: 42678 },
        { limit: 512800, rate: 0.31, base: 77362 },
        { limit: 673000, rate: 0.36, base: 121475 },
        { limit: 857900, rate: 0.39, base: 179147 },
        { limit: 1817000, rate: 0.41, base: 255329 },
        { limit: Infinity, rate: 0.45, base: 644489 }
    ];
    const primaryRebate = 17235;
    
    let tax = 0;
    for (const bracket of brackets) {
        if (income <= bracket.limit) {
            tax = bracket.base + (income - (brackets[brackets.indexOf(bracket)-1]?.limit || 0)) * bracket.rate;
            break;
        }
    }
    const finalTax = Math.max(0, tax - primaryRebate);

    const resultEl = document.getElementById('tax-result');
    resultEl.innerHTML = `
        <p class="text-slate-600">Estimated annual tax liability:</p>
        <p class="text-3xl font-bold text-red-600 mt-1">R ${finalTax.toFixed(2)}</p>
        <p class="text-sm text-slate-500 mt-1">Effective tax rate: ${(finalTax / income * 100).toFixed(2)}%</p>
    `;
}


// --- HTML TEMPLATE ---
function getPersonalWorkspaceHTML() {
    return `
        <div class="border-b border-slate-200"><nav class="-mb-px flex space-x-8" id="personal-tabs"><button data-tab="dashboard" class="tab-button active ...">Dashboard</button><button data-tab="budget" class="tab-button ...">Budgeting</button><button data-tab="assets" class="tab-button ...">Assets & Liabilities</button><button data-tab="calculators" class="tab-button ...">Calculators</button><button data-tab="tax" class="tab-button ...">Tax Pack</button></nav></div>
        <div id="personal-tab-content" class="py-6"></div>
    `;
}
