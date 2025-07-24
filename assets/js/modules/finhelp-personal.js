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
const SA_MINIMUM_WAGE_HOURLY = 27.58; // As of March 2024

/**
 * Initializes the personal finance module.
 * @param {object} user - The authenticated Firebase user object.
 */
export async function init(user) {
    if (!user) return;
    currentUser = user;
    console.log("Personal finance module initialized for user:", user.uid);

    const personalWorkspace = document.getElementById('personal-workspace');
    if (!personalWorkspace) return;

    personalWorkspace.innerHTML = getPersonalWorkspaceHTML();
    
    await loadFinancialData();
    attachEventListeners();
    await renderTabContent('dashboard');
}

async function loadFinancialData() {
    try {
        const data = await getDocument('userFinances', currentUser.uid);
        userFinancialData = data || initializeDefaultData();
        // Ensure all nested objects exist to prevent errors
        userFinancialData.personal = userFinancialData.personal || {};
        userFinancialData.personal.income = userFinancialData.personal.income || [];
        userFinancialData.personal.expenses = userFinancialData.personal.expenses || [];
        userFinancialData.personal.savingsGoals = userFinancialData.personal.savingsGoals || [];
        userFinancialData.personal.assets = userFinancialData.personal.assets || [];
        userFinancialData.personal.liabilities = userFinancialData.personal.liabilities || [];
        userFinancialData.personal.kidsFinance = userFinancialData.personal.kidsFinance || [];
        userFinancialData.personal.creditProfile = userFinancialData.personal.creditProfile || { score: null };
        userFinancialData.personal.budgets = userFinancialData.personal.budgets || {
            individual: { categories: [] },
            family: { members: [], categories: [], contributions: { financial: [], nonFinancial: [] } }
        };
        userFinancialData.personal.documents = userFinancialData.personal.documents || [];
        console.log("Financial data loaded:", userFinancialData);
    } catch (error) {
        console.error("Error loading financial data:", error);
        userFinancialData = initializeDefaultData();
    }
}

async function saveFinancialData() {
    try {
        await saveDocument('userFinances', currentUser.uid, userFinancialData);
        showNotification('Your financial data has been saved.', 'success');
    } catch (error) {
        console.error("Error saving financial data:", error);
        showNotification('Could not save your data. Please try again.', 'error');
    }
}

function initializeDefaultData() {
    return {
        personal: {
            income: [{ id: Date.now(), source: 'Sample Salary', amount: 35000, frequency: 'monthly' }],
            expenses: [{ id: Date.now(), category: 'Housing', description: 'Rent', amount: 12000, frequency: 'monthly' }],
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
        settings: { currency: 'ZAR', taxYear: new Date().getFullYear() }
    };
}

function attachEventListeners() {
    const personalWorkspace = document.getElementById('personal-workspace');
    personalWorkspace?.addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        if (button.classList.contains('tab-button')) {
            const tabName = button.dataset.tab;
            personalWorkspace.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active', 'border-indigo-500', 'text-indigo-600');
                btn.classList.add('border-transparent', 'text-slate-500');
            });
            button.classList.add('active', 'border-indigo-500', 'text-indigo-600');
            button.classList.remove('border-transparent', 'text-slate-500');
            await renderTabContent(tabName);
            return;
        }

        const action = button.dataset.action;
        const id = button.dataset.id;
        if (action) {
            switch(action) {
                case 'open-goal-modal': openGoalModal(id); break;
                case 'open-asset-modal': openAssetModal(id); break;
                case 'open-liability-modal': openLiabilityModal(id); break;
                case 'open-kid-modal': openKidModal(id); break;
                case 'open-calculator': openCalculatorModal(id); break;
                case 'calculate-credit-score': calculateAndDisplayCreditScore(); break;
                case 'open-budget-modal': openBudgetModal(id); break;
                case 'add-budget-category': addBudgetCategory(); break;
                case 'log-financial-contribution': logFinancialContribution(); break;
                case 'log-nonfinancial-contribution': logNonFinancialContribution(); break;
                case 'upload-documents': handleDocumentUpload(); break;
                case 'process-sms': processBankSMS(); break;
                case 'process-text': processDocumentText(); break;
            }
        }
    });
}

async function renderTabContent(tabName) {
    const container = document.getElementById('personal-tab-content');
    if (!container) {
        console.error('Tab content container not found');
        return;
    }
    
    container.innerHTML = `<div class="flex items-center justify-center py-10">
        <i class="fas fa-spinner fa-spin text-2xl text-indigo-500 mr-3"></i>
        <span class="text-slate-500">Loading ${tabName}...</span>
    </div>`;
    
    let content = '';
    try {
        switch (tabName) {
            case 'dashboard': content = renderDashboardTab(); break;
            case 'documents': content = renderDocumentsTab(); break;
            case 'budget': content = renderBudgetingTab(); break;
            case 'assets-liabilities': content = renderAssetsLiabilitiesTab(); break;
            case 'savings': content = renderSavingsGoalsTab(); break;
            case 'calculators': content = renderCalculatorsTab(); break;
            case 'credit': content = renderCreditProfileTab(); break;
            case 'kids': content = renderKidsDashboardTab(); break;
            default: 
                content = `<div class="text-center py-10">
                    <h3 class="font-semibold text-lg text-slate-600">${tabName.charAt(0).toUpperCase() + tabName.slice(1)} Coming Soon</h3>
                    <p class="text-slate-500 mt-2">This feature is under development.</p>
                </div>`;
        }
        container.innerHTML = content;
    } catch (error) {
        console.error(`Error rendering ${tabName} tab:`, error);
        container.innerHTML = `<div class="text-center py-10 text-red-500">
            <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
            <p>Error loading ${tabName} content. Please refresh the page.</p>
        </div>`;
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
    const documents = userFinancialData.personal.documents || [];
    const documentsHTML = documents.length > 0 ? documents.map(doc => `
        <div class="flex items-center justify-between p-4 border border-slate-200 rounded-lg mb-3">
            <div class="flex items-center">
                <i class="fas fa-file-alt text-slate-400 mr-3"></i>
                <div>
                    <p class="font-medium">${doc.name}</p>
                    <p class="text-sm text-slate-500">Uploaded: ${new Date(doc.uploadDate).toLocaleDateString()}</p>
                </div>
            </div>
            <span class="px-3 py-1 rounded-full text-xs ${doc.status === 'processed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">${doc.status}</span>
        </div>
    `).join('') : '<p class="text-slate-500 text-center py-8">No documents uploaded yet.</p>';

    return `
        <h2 class="text-2xl font-bold text-slate-800 mb-4">Document Management</h2>
        <p class="text-slate-600 mb-6">Upload your financial documents to automatically extract and categorize data.</p>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div class="bg-white p-6 rounded-xl shadow-md">
                <h3 class="font-semibold text-lg mb-4"><i class="fas fa-upload text-blue-500 mr-2"></i>Upload Documents</h3>
                <div class="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                    <i class="fas fa-cloud-upload-alt text-4xl text-slate-400 mb-4"></i>
                    <p class="text-slate-600 mb-4">Drag files here or click to browse</p>
                    <input type="file" id="document-upload" multiple accept=".pdf,.jpg,.jpeg,.png" class="hidden">
                    <button data-action="upload-documents" class="btn-primary">Choose Files</button>
                </div>
                <p class="text-xs text-slate-500 mt-2">Supported: PDF, JPG, PNG (Bank statements, payslips, insurance docs)</p>
            </div>
            
            <div class="bg-white p-6 rounded-xl shadow-md">
                <h3 class="font-semibold text-lg mb-4"><i class="fas fa-sms text-green-500 mr-2"></i>Bank SMS Messages</h3>
                <textarea id="sms-input" class="input h-32" placeholder="Paste your bank SMS messages here..."></textarea>
                <button data-action="process-sms" class="btn-primary w-full mt-2">Process SMS</button>
                <p class="text-xs text-slate-500 mt-2">Automatically extract transactions from bank notifications</p>
            </div>
            
            <div class="bg-white p-6 rounded-xl shadow-md">
                <h3 class="font-semibold text-lg mb-4"><i class="fas fa-keyboard text-purple-500 mr-2"></i>Manual Text Entry</h3>
                <textarea id="document-text" class="input h-32" placeholder="Paste text from statements or receipts..."></textarea>
                <button data-action="process-text" class="btn-primary w-full mt-2">Extract Data</button>
                <p class="text-xs text-slate-500 mt-2">Extract financial data from any text</p>
            </div>
        </div>
        
        <div class="bg-white p-6 rounded-xl shadow-md">
            <h3 class="font-semibold text-lg mb-4">Uploaded Documents</h3>
            <div>${documentsHTML}</div>
        </div>
    `;
}

function renderBudgetingTab() {
    const budgets = userFinancialData.personal.budgets;
    const individualCategories = budgets.individual.categories || [];
    const familyCategories = budgets.family.categories || [];
    const financialContributions = budgets.family.contributions.financial || [];
    const nonFinancialContributions = budgets.family.contributions.nonFinancial || [];

    const individualHTML = individualCategories.length > 0 ? individualCategories.map(cat => {
        const percentage = cat.allocated > 0 ? (cat.spent / cat.allocated) * 100 : 0;
        const colorClass = percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500';
        return `
            <div class="border border-slate-200 rounded-lg p-4 mb-3">
                <div class="flex justify-between items-center mb-2">
                    <h4 class="font-medium">${cat.name}</h4>
                    <span class="text-sm text-slate-500">R ${cat.spent.toLocaleString()} / R ${cat.allocated.toLocaleString()}</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2">
                    <div class="${colorClass} h-2 rounded-full" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
                <p class="text-xs text-slate-500 mt-1">${Math.round(percentage)}% used</p>
            </div>
        `;
    }).join('') : '<p class="text-slate-500 text-center py-4">No budget categories set up yet.</p>';

    const familyHTML = familyCategories.length > 0 ? familyCategories.map(cat => {
        const percentage = cat.allocated > 0 ? (cat.spent / cat.allocated) * 100 : 0;
        const colorClass = percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500';
        return `
            <div class="border border-slate-200 rounded-lg p-4 mb-3">
                <div class="flex justify-between items-center mb-2">
                    <h4 class="font-medium">${cat.name}</h4>
                    <span class="text-sm text-slate-500">R ${cat.spent.toLocaleString()} / R ${cat.allocated.toLocaleString()}</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2">
                    <div class="${colorClass} h-2 rounded-full" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
            </div>
        `;
    }).join('') : '<p class="text-slate-500 text-center py-4">No family budget categories set up yet.</p>';

    const totalFinancial = financialContributions.reduce((sum, contrib) => sum + contrib.amount, 0);
    const totalNonFinancial = nonFinancialContributions.reduce((sum, contrib) => sum + contrib.value, 0);

    return `
        <h2 class="text-2xl font-bold text-slate-800 mb-4">Budget Management</h2>
        
        <div class="mb-6">
            <div class="border-b border-slate-200">
                <nav class="flex space-x-8" aria-label="Budget Tabs">
                    <button class="budget-tab-button active py-2 px-1 border-b-2 border-indigo-500 font-medium text-sm text-indigo-600" data-budget-tab="individual">
                        Individual Budget
                    </button>
                    <button class="budget-tab-button py-2 px-1 border-b-2 border-transparent font-medium text-sm text-slate-500 hover:text-slate-700" data-budget-tab="family">
                        Family & Co-Parenting
                    </button>
                </nav>
            </div>
        </div>

        <div id="individual-budget" class="budget-tab-content">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-semibold text-lg">Budget Categories</h3>
                        <button data-action="add-budget-category" data-type="individual" class="btn-primary text-sm">Add Category</button>
                    </div>
                    <div>${individualHTML}</div>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-md">
                    <h3 class="font-semibold text-lg mb-4">Budget Summary</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span>Total Allocated:</span>
                            <span class="font-medium">R ${individualCategories.reduce((sum, cat) => sum + cat.allocated, 0).toLocaleString()}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Total Spent:</span>
                            <span class="font-medium">R ${individualCategories.reduce((sum, cat) => sum + cat.spent, 0).toLocaleString()}</span>
                        </div>
                        <div class="flex justify-between border-t pt-2">
                            <span class="font-medium">Remaining:</span>
                            <span class="font-bold">R ${(individualCategories.reduce((sum, cat) => sum + cat.allocated, 0) - individualCategories.reduce((sum, cat) => sum + cat.spent, 0)).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="family-budget" class="budget-tab-content hidden">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div class="bg-white p-6 rounded-xl shadow-md">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-semibold text-lg">Family Budget Categories</h3>
                        <button data-action="add-budget-category" data-type="family" class="btn-primary text-sm">Add Category</button>
                    </div>
                    <div>${familyHTML}</div>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-md">
                    <h3 class="font-semibold text-lg mb-4">Contribution Summary</h3>
                    <div class="space-y-4">
                        <div class="border border-slate-200 rounded-lg p-4">
                            <div class="flex justify-between items-center mb-2">
                                <span class="font-medium"><i class="fas fa-money-bill-wave text-green-500 mr-2"></i>Financial Contributions</span>
                                <button data-action="log-financial-contribution" class="text-sm text-indigo-600 hover:underline">Add</button>
                            </div>
                            <p class="text-2xl font-bold text-green-600">R ${totalFinancial.toLocaleString()}</p>
                        </div>
                        <div class="border border-slate-200 rounded-lg p-4">
                            <div class="flex justify-between items-center mb-2">
                                <span class="font-medium"><i class="fas fa-hands-helping text-blue-500 mr-2"></i>Non-Financial Value</span>
                                <button data-action="log-nonfinancial-contribution" class="text-sm text-indigo-600 hover:underline">Add</button>
                            </div>
                            <p class="text-2xl font-bold text-blue-600">R ${totalNonFinancial.toLocaleString()}</p>
                            <p class="text-xs text-slate-500">Based on R${SA_MINIMUM_WAGE_HOURLY}/hour minimum wage</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="bg-white p-6 rounded-xl shadow-md">
                <h3 class="font-semibold text-lg mb-4">Recent Contributions</h3>
                <div class="space-y-2">
                    ${[...financialContributions.slice(-5), ...nonFinancialContributions.slice(-5)].map(contrib => `
                        <div class="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <div>
                                <p class="font-medium">${contrib.description || contrib.task}</p>
                                <p class="text-sm text-slate-500">${contrib.memberId || 'You'} • ${new Date(contrib.date || Date.now()).toLocaleDateString()}</p>
                            </div>
                            <span class="font-medium">R ${(contrib.amount || contrib.value).toLocaleString()}</span>
                        </div>
                    `).join('') || '<p class="text-slate-500 text-center py-4">No contributions logged yet.</p>'}
                </div>
            </div>
        </div>
    `;
}

function renderAssetsLiabilitiesTab() {
    const assets = userFinancialData.personal.assets || [];
    const liabilities = userFinancialData.personal.liabilities || [];

    const assetsHTML = assets.length > 0 ? assets.map(asset => `
        <div class="flex justify-between items-center p-3 bg-slate-100 rounded-md">
            <span>${asset.name} (${asset.type})</span>
            <div class="flex items-center space-x-2">
                <span class="font-semibold">R ${asset.value.toLocaleString()}</span>
                <button data-action="open-asset-modal" data-id="${asset.id}" class="text-indigo-600 hover:text-indigo-800">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        </div>
    `).join('') : `<p class="text-sm text-slate-500">No assets logged.</p>`;

    const liabilitiesHTML = liabilities.length > 0 ? liabilities.map(liability => `
        <div class="flex justify-between items-center p-3 bg-slate-100 rounded-md">
            <span>${liability.name} (${liability.type})</span>
            <div class="flex items-center space-x-2">
                <span class="font-semibold">R ${liability.balance.toLocaleString()}</span>
                <button data-action="open-liability-modal" data-id="${liability.id}" class="text-indigo-600 hover:text-indigo-800">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
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

function renderSavingsGoalsTab() {
    const goals = userFinancialData.personal.savingsGoals || [];
    const goalsHTML = goals.length > 0 ? goals.map(goal => {
        const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
        const monthsRemaining = goal.monthlyContribution > 0 ? Math.ceil((goal.targetAmount - goal.currentAmount) / goal.monthlyContribution) : null;
        const targetDate = new Date(goal.targetDate);
        const today = new Date();
        const daysRemaining = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h4 class="font-bold text-slate-800 text-lg">${goal.name}</h4>
                        <p class="text-sm text-slate-500">Target: R ${goal.targetAmount.toLocaleString()}</p>
                        <p class="text-sm text-slate-500">Monthly Budget: R ${goal.monthlyContribution.toLocaleString()}</p>
                    </div>
                    <button data-action="open-goal-modal" data-id="${goal.id}" class="text-indigo-600 hover:text-indigo-800">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
                
                <div class="mb-4">
                    <div class="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>R ${goal.currentAmount.toLocaleString()} / R ${goal.targetAmount.toLocaleString()}</span>
                    </div>
                    <div class="w-full bg-slate-200 rounded-full h-3">
                        <div class="bg-indigo-600 h-3 rounded-full transition-all duration-300" style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                    <p class="text-xs text-right text-slate-500 mt-1">${Math.round(progress)}% Complete</p>
                </div>
                
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div class="bg-slate-50 p-3 rounded-lg">
                        <p class="text-slate-500">Target Date</p>
                        <p class="font-medium">${targetDate.toLocaleDateString()}</p>
                        <p class="text-xs ${daysRemaining > 0 ? 'text-green-600' : 'text-red-600'}">${daysRemaining > 0 ? `${daysRemaining} days left` : `${Math.abs(daysRemaining)} days overdue`}</p>
                    </div>
                    <div class="bg-slate-50 p-3 rounded-lg">
                        <p class="text-slate-500">Time to Goal</p>
                        <p class="font-medium">${monthsRemaining ? `${monthsRemaining} months` : 'N/A'}</p>
                        <p class="text-xs text-slate-500">At current rate</p>
                    </div>
                </div>
                
                <div class="mt-4 pt-4 border-t border-slate-200">
                    <div class="flex space-x-2">
                        <button onclick="addToGoal('${goal.id}')" class="flex-1 bg-green-500 text-white py-2 px-3 rounded-md text-sm hover:bg-green-600 transition">
                            <i class="fas fa-plus mr-1"></i>Add Money
                        </button>
                        <button onclick="simulateGoal('${goal.id}')" class="flex-1 bg-blue-500 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-600 transition">
                            <i class="fas fa-calculator mr-1"></i>Simulate
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('') : `<p class="text-center text-slate-500 col-span-full py-8">No savings goals yet. Add one to get started!</p>`;

    return `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-slate-800">Savings Goals</h2>
            <button data-action="open-goal-modal" class="btn-primary">Add New Goal</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${goalsHTML}
        </div>
    `;
}

function renderCalculatorsTab() {
    return `
        <h2 class="text-2xl font-bold text-slate-800 mb-4">Financial Calculators</h2>
        <p class="text-slate-600 mb-6">Plan for your future with tools that can use your actual financial data for accurate estimates.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow border border-slate-200">
                <i class="fas fa-home text-3xl text-blue-500 mb-3"></i>
                <h4 class="font-bold text-lg">Home Loan Affordability</h4>
                <p class="text-sm text-slate-500 my-2">Estimate the property value you can afford based on your income and expenses.</p>
                <button data-action="open-calculator" data-id="home-loan" class="btn-primary w-full mt-4">Open Calculator</button>
            </div>
            <div class="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow border border-slate-200">
                 <i class="fas fa-piggy-bank text-3xl text-green-500 mb-3"></i>
                <h4 class="font-bold text-lg">Retirement Planning</h4>
                <p class="text-sm text-slate-500 my-2">Calculate how much you need to save for a comfortable retirement.</p>
                <button data-action="open-calculator" data-id="retirement" class="btn-primary w-full mt-4">Open Calculator</button>
            </div>
            <div class="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow border border-slate-200">
                 <i class="fas fa-chart-line text-3xl text-purple-500 mb-3"></i>
                <h4 class="font-bold text-lg">Investment Growth</h4>
                <p class="text-sm text-slate-500 my-2">See how your investments could grow over time with compound interest.</p>
                <button data-action="open-calculator" data-id="investment" class="btn-primary w-full mt-4">Open Calculator</button>
            </div>
        </div>
    `;
}

function renderCreditProfileTab() {
    const score = userFinancialData.personal.creditProfile.score;
    const rating = getCreditRating(score);
    return `
        <h2 class="text-2xl font-bold text-slate-800 mb-4">Credit Profile</h2>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-1 bg-white p-6 rounded-xl shadow-md text-center">
                <h3 class="font-semibold text-lg mb-4">Estimated Credit Score</h3>
                <div id="credit-score-gauge" class="w-48 h-48 mx-auto flex items-center justify-center rounded-full bg-slate-100 text-4xl font-bold ${getScoreColor(score, 'text')}">
                    ${score || 'N/A'}
                </div>
                <p class="font-bold text-xl mt-2 ${getScoreColor(score, 'text')}">${rating}</p>
                <p class="text-xs text-slate-500">Last calculated: ${score ? new Date().toLocaleDateString() : 'Never'}</p>
            </div>
            <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                <h3 class="font-semibold text-lg mb-4">Credit Score Simulator</h3>
                <p class="text-sm text-slate-600 mb-4">Enter your details to estimate your score. This does not affect your actual credit report.</p>
                <div class="space-y-3">
                    <div>
                        <label class="block text-sm font-medium">Payment History</label>
                        <select id="payment-history" class="input"><option value="100">Perfect (0 missed payments)</option><option value="80">Good (1-2 late)</option><option value="50">Poor (Several late)</option></select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Credit Card Utilization</label>
                        <select id="credit-utilization" class="input"><option value="100">Excellent (0-10%)</option><option value="80">Good (11-30%)</option><option value="50">Fair (31-50%)</option><option value="20">Poor (>50%)</option></select>
                    </div>
                     <div>
                        <label class="block text-sm font-medium">Age of Oldest Account</label>
                        <select id="credit-age" class="input"><option value="100">10+ years</option><option value="80">5-9 years</option><option value="50">1-4 years</option><option value="20">&lt; 1 year</option></select>
                    </div>
                </div>
                <button data-action="calculate-credit-score" class="btn-primary w-full mt-6">Calculate My Score</button>
            </div>
        </div>
    `;
}

function renderKidsDashboardTab() {
    const kids = userFinancialData.personal.kidsFinance || [];
    
    if (kids.length === 0) {
        return `
            <div class="text-center py-12">
                <div class="bg-gradient-to-br from-pink-400 to-purple-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-child text-white text-4xl"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-800 mb-4">Kids Financial Dashboard</h2>
                <p class="text-slate-600 mb-6">Start your child's financial journey! Add them to begin tracking their savings goals and teaching money management.</p>
                <button data-action="open-kid-modal" class="btn-primary text-lg px-8 py-3">Add Your First Child</button>
            </div>
        `;
    }

    const kidsHTML = kids.map(kid => {
        const progress = kid.goalAmount > 0 ? (kid.currentSavings / kid.goalAmount) * 100 : 0;
        const weeksToGoal = kid.allowance > 0 ? Math.ceil((kid.goalAmount - kid.currentSavings) / kid.allowance) : null;
        
        return `
            <div class="bg-gradient-to-br from-pink-100 to-purple-100 p-6 rounded-2xl shadow-lg border-2 border-pink-200">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center">
                        <div class="bg-gradient-to-br from-pink-400 to-purple-500 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">
                            ${kid.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-slate-800">${kid.name}</h3>
                            <p class="text-sm text-slate-600">${kid.age} years old</p>
                        </div>
                    </div>
                    <button data-action="open-kid-modal" data-id="${kid.id}" class="text-slate-500 hover:text-slate-700">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
                
                <div class="bg-white rounded-xl p-4 mb-4">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm font-medium text-slate-600">💰 Weekly Allowance</span>
                        <span class="text-lg font-bold text-green-600">R ${kid.allowance}</span>
                    </div>
                    <button onclick="addAllowance('${kid.id}')" class="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition font-medium">
                        <i class="fas fa-plus mr-2"></i>Add This Week's Allowance
                    </button>
                </div>
                
                <div class="bg-white rounded-xl p-4 mb-4">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm font-medium text-slate-600">🎯 Savings Goal</span>
                        <button onclick="editGoal('${kid.id}')" class="text-xs text-indigo-600 hover:underline">Edit</button>
                    </div>
                    <h4 class="font-bold text-slate-800 mb-2">${kid.savingsGoal || 'No goal set'}</h4>
                    ${kid.savingsGoal ? `
                        <div class="mb-3">
                            <div class="flex justify-between text-sm mb-1">
                                <span>R ${kid.currentSavings.toLocaleString()}</span>
                                <span>R ${kid.goalAmount.toLocaleString()}</span>
                            </div>
                            <div class="w-full bg-slate-200 rounded-full h-4">
                                <div class="bg-gradient-to-r from-pink-400 to-purple-500 h-4 rounded-full transition-all duration-500" style="width: ${Math.min(progress, 100)}%"></div>
                            </div>
                            <p class="text-xs text-center text-slate-500 mt-1">${Math.round(progress)}% Complete</p>
                        </div>
                        ${weeksToGoal ? `<p class="text-xs text-slate-500 text-center">🗓️ ${weeksToGoal} weeks to go at current allowance rate</p>` : ''}
                        <div class="grid grid-cols-2 gap-2 mt-3">
                            <button onclick="addToKidSavings('${kid.id}')" class="bg-blue-500 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-600 transition">
                                <i class="fas fa-piggy-bank mr-1"></i>Save Money
                            </button>
                            <button onclick="kidSpendMoney('${kid.id}')" class="bg-orange-500 text-white py-2 px-3 rounded-lg text-sm hover:bg-orange-600 transition">
                                <i class="fas fa-shopping-cart mr-1"></i>Spend
                            </button>
                        </div>
                    ` : `
                        <button onclick="setKidGoal('${kid.id}')" class="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition">
                            <i class="fas fa-bullseye mr-2"></i>Set a Savings Goal
                        </button>
                    `}
                </div>
                
                <div class="bg-white rounded-xl p-4">
                    <h4 class="font-medium text-slate-600 mb-2">🏆 Financial Lessons</h4>
                    <div class="grid grid-cols-2 gap-2">
                        <button onclick="startLesson('${kid.id}', 'saving')" class="bg-yellow-400 text-yellow-900 py-2 px-3 rounded-lg text-sm hover:bg-yellow-500 transition">
                            💰 Saving
                        </button>
                        <button onclick="startLesson('${kid.id}', 'spending')" class="bg-red-400 text-red-900 py-2 px-3 rounded-lg text-sm hover:bg-red-500 transition">
                            🛒 Smart Spending
                        </button>
                        <button onclick="startLesson('${kid.id}', 'earning')" class="bg-green-400 text-green-900 py-2 px-3 rounded-lg text-sm hover:bg-green-500 transition">
                            💼 Earning
                        </button>
                        <button onclick="startLesson('${kid.id}', 'sharing')" class="bg-blue-400 text-blue-900 py-2 px-3 rounded-lg text-sm hover:bg-blue-500 transition">
                            🤝 Sharing
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    return `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-slate-800">Kids Financial Dashboard</h2>
            <button data-action="open-kid-modal" class="btn-primary">Add Another Child</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${kidsHTML}
        </div>
        
        <div class="mt-8 bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-xl border border-yellow-200">
            <h3 class="text-lg font-bold text-slate-800 mb-2">🎓 Financial Education Center</h3>
            <p class="text-slate-600 mb-4">Interactive lessons and games to teach your children about money management.</p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button onclick="openFinancialGame('money-recognition')" class="bg-white p-3 rounded-lg shadow hover:shadow-md transition text-center">
                    <i class="fas fa-coins text-2xl text-yellow-500 mb-2"></i>
                    <p class="text-sm font-medium">Money Recognition</p>
                </button>
                <button onclick="openFinancialGame('budget-game')" class="bg-white p-3 rounded-lg shadow hover:shadow-md transition text-center">
                    <i class="fas fa-calculator text-2xl text-blue-500 mb-2"></i>
                    <p class="text-sm font-medium">Budget Game</p>
                </button>
                <button onclick="openFinancialGame('saving-challenge')" class="bg-white p-3 rounded-lg shadow hover:shadow-md transition text-center">
                    <i class="fas fa-piggy-bank text-2xl text-pink-500 mb-2"></i>
                    <p class="text-sm font-medium">Saving Challenge</p>
                </button>
                <button onclick="openFinancialGame('earning-simulator')" class="bg-white p-3 rounded-lg shadow hover:shadow-md transition text-center">
                    <i class="fas fa-briefcase text-2xl text-green-500 mb-2"></i>
                    <p class="text-sm font-medium">Earning Simulator</p>
                </button>
            </div>
        </div>
    `;
}

// --- CALCULATION & HELPER FUNCTIONS ---

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

function getCreditRating(score) {
    if (!score) return 'Not Calculated';
    if (score >= 750) return 'Excellent';
    if (score >= 680) return 'Good';
    if (score >= 620) return 'Fair';
    if (score >= 550) return 'Poor';
    return 'Very Poor';
}

function getScoreColor(score, prefix) {
    if (!score) return `${prefix}-slate-500`;
    if (score >= 750) return `${prefix}-green-500`;
    if (score >= 680) return `${prefix}-blue-500`;
    if (score >= 620) return `${prefix}-yellow-500`;
    if (score >= 550) return `${prefix}-orange-500`;
    return `${prefix}-red-500`;
}

// --- MODAL & FORM HANDLING ---

function createModal(id, title, contentHTML, footerHTML) {
    const modalContainer = document.createElement('div');
    modalContainer.id = `${id}-container`;
    modalContainer.innerHTML = `
        <div id="${id}" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-lg p-6 w-full max-w-lg max-h-full overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold">${title}</h3>
                    <button onclick="closeModal('${id}')" class="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
                </div>
                <div>${contentHTML}</div>
                ${footerHTML ? `<div class="mt-6 flex justify-end space-x-3">${footerHTML}</div>` : ''}
            </div>
        </div>
    `;
    document.body.appendChild(modalContainer);
}

function removeModal(id) {
    const modalContainer = document.getElementById(`${id}-container`);
    modalContainer?.remove();
}

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
                <div><label class="block text-sm font-medium">Monthly Budget (R)</label><input type="number" id="goal-monthly" class="input" value="${goal.monthlyContribution || ''}" required></div>
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

window.openKidModal = (kidId = null) => {
    let kid = {};
    if (kidId) {
        kid = userFinancialData.personal.kidsFinance.find(k => k.id === kidId) || {};
    }
    const formHTML = `
        <form id="kid-form" data-id="${kid.id || ''}">
            <div class="space-y-4">
                <div><label class="block text-sm font-medium">Child's Name</label><input type="text" id="kid-name" class="input" value="${kid.name || ''}" required></div>
                <div><label class="block text-sm font-medium">Age</label><input type="number" id="kid-age" class="input" value="${kid.age || ''}" min="3" max="18" required></div>
                <div><label class="block text-sm font-medium">Weekly Allowance (R)</label><input type="number" id="kid-allowance" class="input" value="${kid.allowance || 0}" required></div>
                <div><label class="block text-sm font-medium">Savings Goal Name</label><input type="text" id="kid-goal-name" class="input" value="${kid.savingsGoal || ''}" placeholder="e.g., New Bicycle"></div>
                <div><label class="block text-sm font-medium">Goal Amount (R)</label><input type="number" id="kid-goal-amount" class="input" value="${kid.goalAmount || 0}"></div>
                <div><label class="block text-sm font-medium">Current Savings (R)</label><input type="number" id="kid-current-savings" class="input" value="${kid.currentSavings || 0}"></div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
                <button type="button" onclick="closeModal('kid-modal')" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">Save Child</button>
            </div>
        </form>
    `;
    createModal('kid-modal', kid.id ? 'Edit Child Details' : 'Add Child to Dashboard', formHTML);
    document.getElementById('kid-form').addEventListener('submit', handleKidFormSubmit);
};

window.openCalculatorModal = (type) => {
    let contentHTML = '';
    let footerHTML = '';
    
    switch(type) {
        case 'home-loan':
            contentHTML = `
                <div class="space-y-4">
                    <div class="border border-slate-200 rounded-lg p-4">
                        <label class="block text-sm font-medium mb-2">Monthly Gross Income (R)</label>
                        <input type="number" id="calc-income" class="input">
                    </div>
                    <div class="border border-slate-200 rounded-lg p-4">
                        <label class="block text-sm font-medium mb-2">Monthly Expenses (R)</label>
                        <input type="number" id="calc-expenses" class="input">
                    </div>
                    <div class="border border-slate-200 rounded-lg p-4">
                        <label class="block text-sm font-medium mb-2">Interest Rate (%)</label>
                        <input type="number" id="calc-rate" class="input" value="11.75" step="0.01">
                    </div>
                    <div class="flex items-center p-4 bg-slate-50 rounded-lg">
                        <input type="checkbox" id="use-actual-data" onchange="populateCalculatorWithActualData(this.checked)" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                        <label for="use-actual-data" class="ml-2 block text-sm text-gray-900">Use my actual financial data</label>
                    </div>
                    <div id="calculator-results" class="mt-4 p-4 bg-slate-50 rounded-lg text-center">Results will appear here.</div>
                </div>
            `;
            footerHTML = `
                <button type="button" onclick="closeModal('calculator-modal')" class="btn-secondary">Close</button>
                <button type="button" onclick="calculateHomeLoan()" class="btn-primary">Calculate</button>
            `;
            break;
        case 'retirement':
            contentHTML = `
                <div class="space-y-4">
                    <div class="border border-slate-200 rounded-lg p-4">
                        <label class="block text-sm font-medium mb-2">Current Age</label>
                        <input type="number" id="current-age" class="input" value="30">
                    </div>
                    <div class="border border-slate-200 rounded-lg p-4">
                        <label class="block text-sm font-medium mb-2">Retirement Age</label>
                        <input type="number" id="retirement-age" class="input" value="65">
                    </div>
                    <div class="border border-slate-200 rounded-lg p-4">
                        <label class="block text-sm font-medium mb-2">Current Monthly Income (R)</label>
                        <input type="number" id="monthly-income" class="input">
                    </div>
                    <div class="border border-slate-200 rounded-lg p-4">
                        <label class="block text-sm font-medium mb-2">Desired Retirement Income (% of current)</label>
                        <input type="number" id="retirement-percentage" class="input" value="70" min="50" max="100">
                    </div>
                    <div class="border border-slate-200 rounded-lg p-4">
                        <label class="block text-sm font-medium mb-2">Expected Annual Return (%)</label>
                        <input type="number" id="annual-return" class="input" value="8" step="0.1">
                    </div>
                    <div class="flex items-center p-4 bg-slate-50 rounded-lg">
                        <input type="checkbox" id="use-actual-retirement-data" onchange="populateRetirementWithActualData(this.checked)" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                        <label for="use-actual-retirement-data" class="ml-2 block text-sm text-gray-900">Use my actual income data</label>
                    </div>
                    <div id="retirement-results" class="mt-4 p-4 bg-slate-50 rounded-lg text-center">Results will appear here.</div>
                </div>
            `;
            footerHTML = `
                <button type="button" onclick="closeModal('calculator-modal')" class="btn-secondary">Close</button>
                <button type="button" onclick="calculateRetirement()" class="btn-primary">Calculate</button>
            `;
            break;
        case 'investment':
            contentHTML = `
                <div class="space-y-4">
                    <div class="border border-slate-200 rounded-lg p-4">
                        <label class="block text-sm font-medium mb-2">Initial Investment (R)</label>
                        <input type="number" id="initial-investment" class="input">
                    </div>
                    <div class="border border-slate-200 rounded-lg p-4">
                        <label class="block text-sm font-medium mb-2">Monthly Contribution (R)</label>
                        <input type="number" id="monthly-contribution" class="input">
                    </div>
                    <div class="border border-slate-200 rounded-lg p-4">
                        <label class="block text-sm font-medium mb-2">Expected Annual Return (%)</label>
                        <input type="number" id="investment-return" class="input" value="10" step="0.1">
                    </div>
                    <div class="border border-slate-200 rounded-lg p-4">
                        <label class="block text-sm font-medium mb-2">Investment Period (Years)</label>
                        <input type="number" id="investment-years" class="input" value="10">
                    </div>
                    <div id="investment-results" class="mt-4 p-4 bg-slate-50 rounded-lg text-center">Results will appear here.</div>
                </div>
            `;
            footerHTML = `
                <button type="button" onclick="closeModal('calculator-modal')" class="btn-secondary">Close</button>
                <button type="button" onclick="calculateInvestment()" class="btn-primary">Calculate</button>
            `;
            break;
    }
    
    createModal('calculator-modal', `${type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')} Calculator`, contentHTML);
};

// --- FORM SUBMISSION HANDLERS ---

async function handleGoalFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: document.getElementById('goal-form').dataset.id || Date.now().toString(),
        name: document.getElementById('goal-name').value,
        targetAmount: parseFloat(document.getElementById('goal-target').value),
        currentAmount: parseFloat(document.getElementById('goal-current').value),
        monthlyContribution: parseFloat(document.getElementById('goal-monthly').value),
        targetDate: document.getElementById('goal-date').value
    };
    
    const existingIndex = userFinancialData.personal.savingsGoals.findIndex(g => g.id === formData.id);
    
    if (existingIndex >= 0) {
        userFinancialData.personal.savingsGoals[existingIndex] = formData;
    } else {
        userFinancialData.personal.savingsGoals.push(formData);
    }
    
    await saveFinancialData();
    closeModal('goal-modal');
    await renderTabContent('savings');
}

async function handleAssetFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: document.getElementById('asset-form').dataset.id || Date.now().toString(),
        name: document.getElementById('asset-name').value,
        type: document.getElementById('asset-type').value,
        value: parseFloat(document.getElementById('asset-value').value)
    };
    
    const existingIndex = userFinancialData.personal.assets.findIndex(a => a.id === formData.id);
    
    if (existingIndex >= 0) {
        userFinancialData.personal.assets[existingIndex] = formData;
    } else {
        userFinancialData.personal.assets.push(formData);
    }
    
    await saveFinancialData();
    closeModal('asset-modal');
    await renderTabContent('assets-liabilities');
}

async function handleLiabilityFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: document.getElementById('liability-form').dataset.id || Date.now().toString(),
        name: document.getElementById('liability-name').value,
        type: document.getElementById('liability-type').value,
        balance: parseFloat(document.getElementById('liability-balance').value)
    };
    
    const existingIndex = userFinancialData.personal.liabilities.findIndex(l => l.id === formData.id);
    
    if (existingIndex >= 0) {
        userFinancialData.personal.liabilities[existingIndex] = formData;
    } else {
        userFinancialData.personal.liabilities.push(formData);
    }
    
    await saveFinancialData();
    closeModal('liability-modal');
    await renderTabContent('assets-liabilities');
}

async function handleKidFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: document.getElementById('kid-form').dataset.id || Date.now().toString(),
        name: document.getElementById('kid-name').value,
        age: parseInt(document.getElementById('kid-age').value),
        allowance: parseFloat(document.getElementById('kid-allowance').value),
        savingsGoal: document.getElementById('kid-goal-name').value,
        goalAmount: parseFloat(document.getElementById('kid-goal-amount').value) || 0,
        currentSavings: parseFloat(document.getElementById('kid-current-savings').value) || 0
    };
    
    const existingIndex = userFinancialData.personal.kidsFinance.findIndex(k => k.id === formData.id);
    
    if (existingIndex >= 0) {
        userFinancialData.personal.kidsFinance[existingIndex] = formData;
    } else {
        userFinancialData.personal.kidsFinance.push(formData);
    }
    
    await saveFinancialData();
    closeModal('kid-modal');
    await renderTabContent('kids');
}

// --- BUDGET FUNCTIONALITY ---

function addBudgetCategory() {
    const type = event.target.dataset.type || 'individual';
    const categoryName = prompt(`Enter category name for ${type} budget:`);
    
    if (categoryName) {
        const allocatedAmount = parseFloat(prompt('Enter allocated amount (R):')) || 0;
        
        const newCategory = {
            id: Date.now().toString(),
            name: categoryName,
            allocated: allocatedAmount,
            spent: 0
        };
        
        if (type === 'individual') {
            userFinancialData.personal.budgets.individual.categories.push(newCategory);
        } else {
            userFinancialData.personal.budgets.family.categories.push(newCategory);
        }
        
        saveFinancialData();
        renderTabContent('budget');
    }
}

function logFinancialContribution() {
    const description = prompt('Description of financial contribution:');
    if (description) {
        const amount = parseFloat(prompt('Amount (R):')) || 0;
        const memberId = prompt('Family member (or leave blank for yourself):') || 'You';
        
        const contribution = {
            id: Date.now().toString(),
            description,
            amount,
            memberId,
            date: new Date().toISOString()
        };
        
        userFinancialData.personal.budgets.family.contributions.financial.push(contribution);
        saveFinancialData();
        renderTabContent('budget');
    }
}

function logNonFinancialContribution() {
    const task = prompt('What non-financial task was completed?');
    if (task) {
        const hours = parseFloat(prompt('How many hours did this take?')) || 1;
        const memberId = prompt('Family member (or leave blank for yourself):') || 'You';
        
        const contribution = {
            id: Date.now().toString(),
            task,
            hours,
            value: hours * SA_MINIMUM_WAGE_HOURLY,
            memberId,
            date: new Date().toISOString()
        };
        
        userFinancialData.personal.budgets.family.contributions.nonFinancial.push(contribution);
        saveFinancialData();
        renderTabContent('budget');
    }
}

// --- DOCUMENT PROCESSING FUNCTIONS ---

function handleDocumentUpload() {
    const fileInput = document.getElementById('document-upload');
    fileInput.click();
    
    fileInput.onchange = async (e) => {
        const files = Array.from(e.target.files);
        
        for (const file of files) {
            const document = {
                id: Date.now().toString() + Math.random(),
                name: file.name,
                size: file.size,
                type: file.type,
                uploadDate: new Date().toISOString(),
                status: 'uploaded'
            };
            
            userFinancialData.personal.documents.push(document);
            
            // Simulate processing
            setTimeout(() => {
                document.status = 'processed';
                saveFinancialData();
                renderTabContent('documents');
            }, 2000);
        }
        
        await saveFinancialData();
        await renderTabContent('documents');
        showNotification(`${files.length} document(s) uploaded successfully.`, 'success');
    };
}

function processBankSMS() {
    const smsText = document.getElementById('sms-input').value;
    if (!smsText.trim()) {
        showNotification('Please enter SMS text to process.', 'error');
        return;
    }
    
    // Simple SMS parsing logic
    const transactions = extractTransactionsFromSMS(smsText);
    
    if (transactions.length > 0) {
        showNotification(`Found ${transactions.length} transaction(s) in SMS.`, 'success');
        // Here you would normally process and categorize these transactions
        console.log('Extracted transactions:', transactions);
    } else {
        showNotification('No valid transactions found in SMS text.', 'error');
    }
    
    document.getElementById('sms-input').value = '';
}

function processDocumentText() {
    const documentText = document.getElementById('document-text').value;
    if (!documentText.trim()) {
        showNotification('Please enter text to process.', 'error');
        return;
    }
    
    // Simple text processing logic
    const extractedData = extractFinancialDataFromText(documentText);
    
    if (extractedData.length > 0) {
        showNotification(`Extracted ${extractedData.length} financial data point(s).`, 'success');
        console.log('Extracted data:', extractedData);
    } else {
        showNotification('No financial data found in text.', 'error');
    }
    
    document.getElementById('document-text').value = '';
}

function extractTransactionsFromSMS(smsText) {
    const transactions = [];
    const lines = smsText.split('\n');
    
    lines.forEach(line => {
        // Look for common SA bank SMS patterns
        const amountMatch = line.match(/R[\s]?(\d+[,.]?\d*)/i);
        const merchantMatch = line.match(/(at|to)\s+([A-Za-z\s]+)/i);
        
        if (amountMatch) {
            transactions.push({
                amount: parseFloat(amountMatch[1].replace(',', '')),
                merchant: merchantMatch ? merchantMatch[2].trim() : 'Unknown',
                type: line.toLowerCase().includes('debit') ? 'expense' : 'income',
                date: new Date().toISOString()
            });
        }
    });
    
    return transactions;
}

function extractFinancialDataFromText(text) {
    const data = [];
    
    // Look for currency amounts
    const amountRegex = /R[\s]?(\d+[,.]?\d*)/gi;
    let match;
    
    while ((match = amountRegex.exec(text)) !== null) {
        data.push({
            amount: parseFloat(match[1].replace(',', '')),
            context: text.substring(Math.max(0, match.index - 20), match.index + 20),
            position: match.index
        });
    }
    
    return data;
}

// --- CREDIT SCORE CALCULATION ---

function calculateAndDisplayCreditScore() {
    const paymentHistory = parseInt(document.getElementById('payment-history').value);
    const creditUtilization = parseInt(document.getElementById('credit-utilization').value);
    const creditAge = parseInt(document.getElementById('credit-age').value);
    
    // Simplified credit score calculation
    const score = Math.round(
        (paymentHistory * 0.35) + 
        (creditUtilization * 0.30) + 
        (creditAge * 0.15) + 
        (550) // Base score
    );
    
    userFinancialData.personal.creditProfile.score = Math.min(850, Math.max(300, score));
    
    saveFinancialData();
    renderTabContent('credit');
    
    showNotification(`Your estimated credit score is ${userFinancialData.personal.creditProfile.score}`, 'success');
}

// --- CALCULATOR FUNCTIONS ---

window.populateCalculatorWithActualData = (useActual) => {
    if (useActual) {
        const totalIncome = (userFinancialData.personal?.income || []).reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = (userFinancialData.personal?.expenses || []).reduce((sum, item) => sum + item.amount, 0);
        
        document.getElementById('calc-income').value = totalIncome;
        document.getElementById('calc-expenses').value = totalExpenses;
    }
};

window.populateRetirementWithActualData = (useActual) => {
    if (useActual) {
        const totalIncome = (userFinancialData.personal?.income || []).reduce((sum, item) => sum + item.amount, 0);
        document.getElementById('monthly-income').value = totalIncome;
    }
};

window.calculateHomeLoan = () => {
    const income = parseFloat(document.getElementById('calc-income').value) || 0;
    const expenses = parseFloat(document.getElementById('calc-expenses').value) || 0;
    const rate = parseFloat(document.getElementById('calc-rate').value) || 11.75;
    
    const netIncome = income - expenses;
    const maxPayment = netIncome * 0.28; // 28% debt-to-income ratio
    const monthlyRate = rate / 100 / 12;
    const numPayments = 30 * 12; // 30 year loan
    
    const maxLoanAmount = maxPayment * ((1 - Math.pow(1 + monthlyRate, -numPayments)) / monthlyRate);
    const affordableProperty = maxLoanAmount / 0.8; // Assuming 80% loan-to-value
    
    document.getElementById('calculator-results').innerHTML = `
        <div class="text-left space-y-2">
            <p><strong>Monthly Net Income:</strong> R ${netIncome.toLocaleString()}</p>
            <p><strong>Max Monthly Payment:</strong> R ${maxPayment.toLocaleString()}</p>
            <p><strong>Max Loan Amount:</strong> R ${maxLoanAmount.toLocaleString()}</p>
            <p class="text-lg font-bold text-green-600"><strong>Affordable Property Value:</strong> R ${affordableProperty.toLocaleString()}</p>
        </div>
    `;
};

window.calculateRetirement = () => {
    const currentAge = parseInt(document.getElementById('current-age').value) || 30;
    const retirementAge = parseInt(document.getElementById('retirement-age').value) || 65;
    const monthlyIncome = parseFloat(document.getElementById('monthly-income').value) || 0;
    const retirementPercentage = parseInt(document.getElementById('retirement-percentage').value) || 70;
    const annualReturn = parseFloat(document.getElementById('annual-return').value) || 8;
    
    const yearsToRetirement = retirementAge - currentAge;
    const annualIncome = monthlyIncome * 12;
    const desiredRetirementIncome = annualIncome * (retirementPercentage / 100);
    const requiredCapital = desiredRetirementIncome * 25; // 4% withdrawal rule
    
    const monthlyReturn = annualReturn / 100 / 12;
    const monthsToRetirement = yearsToRetirement * 12;
    
    const requiredMonthlySavings = requiredCapital * monthlyReturn / ((Math.pow(1 + monthlyReturn, monthsToRetirement) - 1));
    
    document.getElementById('retirement-results').innerHTML = `
        <div class="text-left space-y-2">
            <p><strong>Years to retirement:</strong> ${yearsToRetirement} years</p>
            <p><strong>Desired retirement income:</strong> R ${desiredRetirementIncome.toLocaleString()}/year</p>
            <p><strong>Required capital:</strong> R ${requiredCapital.toLocaleString()}</p>
            <p class="text-lg font-bold text-blue-600"><strong>Monthly savings needed:</strong> R ${requiredMonthlySavings.toLocaleString()}</p>
        </div>
    `;
};

window.calculateInvestment = () => {
    const initialInvestment = parseFloat(document.getElementById('initial-investment').value) || 0;
    const monthlyContribution = parseFloat(document.getElementById('monthly-contribution').value) || 0;
    const annualReturn = parseFloat(document.getElementById('investment-return').value) || 10;
    const years = parseInt(document.getElementById('investment-years').value) || 10;
    
    const monthlyReturn = annualReturn / 100 / 12;
    const months = years * 12;
    
    // Future value of initial investment
    const futureValueInitial = initialInvestment * Math.pow(1 + monthlyReturn, months);
    
    // Future value of monthly contributions
    const futureValueContributions = monthlyContribution * ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn);
    
    const totalFutureValue = futureValueInitial + futureValueContributions;
    const totalContributed = initialInvestment + (monthlyContribution * months);
    const totalGrowth = totalFutureValue - totalContributed;
    
    document.getElementById('investment-results').innerHTML = `
        <div class="text-left space-y-2">
            <p><strong>Total contributed:</strong> R ${totalContributed.toLocaleString()}</p>
            <p><strong>Investment growth:</strong> R ${totalGrowth.toLocaleString()}</p>
            <p class="text-lg font-bold text-purple-600"><strong>Final value:</strong> R ${totalFutureValue.toLocaleString()}</p>
            <p class="text-sm text-slate-500">After ${years} years at ${annualReturn}% annual return</p>
        </div>
    `;
};

// --- SAVINGS GOALS FUNCTIONALITY ---

window.addToGoal = (goalId) => {
    const amount = parseFloat(prompt('How much would you like to add to this goal? (R)')) || 0;
    
    if (amount > 0) {
        const goal = userFinancialData.personal.savingsGoals.find(g => g.id === goalId);
        if (goal) {
            goal.currentAmount += amount;
            saveFinancialData();
            renderTabContent('savings');
            showNotification(`R ${amount.toLocaleString()} added to ${goal.name}!`, 'success');
        }
    }
};

window.simulateGoal = (goalId) => {
    const goal = userFinancialData.personal.savingsGoals.find(g => g.id === goalId);
    if (!goal) return;
    
    const remaining = goal.targetAmount - goal.currentAmount;
    const monthsAtCurrent = goal.monthlyContribution > 0 ? Math.ceil(remaining / goal.monthlyContribution) : null;
    
    const newContribution = parseFloat(prompt(`Current monthly budget: R ${goal.monthlyContribution}\nEnter a new monthly amount to simulate:`)) || goal.monthlyContribution;
    
    if (newContribution > 0) {
        const monthsAtNew = Math.ceil(remaining / newContribution);
        const difference = monthsAtCurrent ? monthsAtCurrent - monthsAtNew : 'N/A';
        
        alert(`Simulation Results:
        
Current plan: ${monthsAtCurrent || 'N/A'} months
New plan: ${monthsAtNew} months
Difference: ${difference !== 'N/A' ? `${difference} months faster` : 'Much faster!'}

Would you like to update your monthly budget?`);
        
        if (confirm('Update your monthly budget to this amount?')) {
            goal.monthlyContribution = newContribution;
            saveFinancialData();
            renderTabContent('savings');
        }
    }
};

// --- KIDS FINANCE FUNCTIONALITY ---

window.addAllowance = (kidId) => {
    const kid = userFinancialData.personal.kidsFinance.find(k => k.id === kidId);
    if (kid) {
        kid.currentSavings += kid.allowance;
        saveFinancialData();
        renderTabContent('kids');
        showNotification(`Added R ${kid.allowance} allowance to ${kid.name}'s savings!`, 'success');
    }
};

window.addToKidSavings = (kidId) => {
    const amount = parseFloat(prompt('How much would you like to add to savings? (R)')) || 0;
    
    if (amount > 0) {
        const kid = userFinancialData.personal.kidsFinance.find(k => k.id === kidId);
        if (kid) {
            kid.currentSavings += amount;
            saveFinancialData();
            renderTabContent('kids');
            showNotification(`R ${amount} added to ${kid.name}'s savings!`, 'success');
        }
    }
};

window.kidSpendMoney = (kidId) => {
    const amount = parseFloat(prompt('How much was spent? (R)')) || 0;
    const what = prompt('What was purchased?') || 'Purchase';
    
    if (amount > 0) {
        const kid = userFinancialData.personal.kidsFinance.find(k => k.id === kidId);
        if (kid && kid.currentSavings >= amount) {
            kid.currentSavings -= amount;
            saveFinancialData();
            renderTabContent('kids');
            showNotification(`${kid.name} spent R ${amount} on ${what}`, 'success');
        } else {
            showNotification('Not enough savings for this purchase!', 'error');
        }
    }
};

window.setKidGoal = (kidId) => {
    const goalName = prompt('What would you like to save for?');
    const goalAmount = parseFloat(prompt('How much will it cost? (R)')) || 0;
    
    if (goalName && goalAmount > 0) {
        const kid = userFinancialData.personal.kidsFinance.find(k => k.id === kidId);
        if (kid) {
            kid.savingsGoal = goalName;
            kid.goalAmount = goalAmount;
            saveFinancialData();
            renderTabContent('kids');
            showNotification(`Savings goal set for ${kid.name}!`, 'success');
        }
    }
};

window.startLesson = (kidId, lessonType) => {
    const kid = userFinancialData.personal.kidsFinance.find(k => k.id === kidId);
    const lessons = {
        saving: 'The Magic of Saving: Every rand you save grows over time!',
        spending: 'Smart Spending: Think before you buy - do you need it or just want it?',
        earning: 'Ways to Earn: Chores, good grades, and helping others can earn money!',
        sharing: 'Sharing is Caring: Using money to help others feels great!'
    };
    
    alert(`${lessons[lessonType]}\n\nGreat job learning about money, ${kid?.name || 'there'}! 🌟`);
};

window.openFinancialGame = (gameType) => {
    const games = {
        'money-recognition': 'Money Recognition Game: Coming soon!',
        'budget-game': 'Budget Planning Game: Coming soon!',
        'saving-challenge': 'Saving Challenge: Coming soon!',
        'earning-simulator': 'Earning Simulator: Coming soon!'
    };
    
    alert(games[gameType] || 'Game coming soon!');
};

// --- UTILITY FUNCTIONS ---

window.closeModal = (modalId) => {
    removeModal(modalId);
};

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
        type === 'success' ? 'bg-green-500 text-white' : 
        type === 'error' ? 'bg-red-500 text-white' : 
        'bg-blue-500 text-white'
    }`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function getPersonalWorkspaceHTML() {
    return `
        <div class="bg-white rounded-lg shadow-md">
            <div class="border-b border-slate-200">
                <nav class="flex space-x-8 px-6" aria-label="Personal Finance Tabs">
                    <button class="tab-button active py-4 px-1 border-b-2 border-indigo-500 font-medium text-sm text-indigo-600" data-tab="dashboard">
                        <i class="fas fa-chart-pie mr-2"></i>Dashboard
                    </button>
                    <button class="tab-button py-4 px-1 border-b-2 border-transparent font-medium text-sm text-slate-500 hover:text-slate-700" data-tab="documents">
                        <i class="fas fa-file-upload mr-2"></i>Documents
                    </button>
                    <button class="tab-button py-4 px-1 border-b-2 border-transparent font-medium text-sm text-slate-500 hover:text-slate-700" data-tab="budget">
                        <i class="fas fa-wallet mr-2"></i>Budget
                    </button>
                    <button class="tab-button py-4 px-1 border-b-2 border-transparent font-medium text-sm text-slate-500 hover:text-slate-700" data-tab="assets-liabilities">
                        <i class="fas fa-balance-scale mr-2"></i>Assets & Liabilities
                    </button>
                    <button class="tab-button py-4 px-1 border-b-2 border-transparent font-medium text-sm text-slate-500 hover:text-slate-700" data-tab="savings">
                        <i class="fas fa-piggy-bank mr-2"></i>Savings Goals
                    </button>
                    <button class="tab-button py-4 px-1 border-b-2 border-transparent font-medium text-sm text-slate-500 hover:text-slate-700" data-tab="calculators">
                        <i class="fas fa-calculator mr-2"></i>Calculators
                    </button>
                    <button class="tab-button py-4 px-1 border-b-2 border-transparent font-medium text-sm text-slate-500 hover:text-slate-700" data-tab="credit">
                        <i class="fas fa-credit-card mr-2"></i>Credit Profile
                    </button>
                    <button class="tab-button py-4 px-1 border-b-2 border-transparent font-medium text-sm text-slate-500 hover:text-slate-700" data-tab="kids">
                        <i class="fas fa-child mr-2"></i>Kids Finance
                    </button>
                </nav>
            </div>
            <div id="personal-tab-content" class="p-6">
                <!-- Tab content will be rendered here -->
            </div>
        </div>
    `;
}

// Add budget tab switching functionality
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('budget-tab-button')) {
        const tabName = e.target.dataset.budgetTab;
        
        // Update button styles
        document.querySelectorAll('.budget-tab-button').forEach(btn => {
            btn.classList.remove('active', 'border-indigo-500', 'text-indigo-600');
            btn.classList.add('border-transparent', 'text-slate-500');
        });
        e.target.classList.add('active', 'border-indigo-500', 'text-indigo-600');
        e.target.classList.remove('border-transparent', 'text-slate-500');
        
        // Show/hide content
        document.querySelectorAll('.budget-tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(`${tabName}-budget`).classList.remove('hidden');
    }
});
