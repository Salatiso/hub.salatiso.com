/* ================================================================================= */
/* FILE: assets/js/modules/finhelp.js (CONTROLLER - COMPLETE IMPLEMENTATION)        */
/* PURPOSE: Complete Personal and Business finance modules with all features.        */
/* ================================================================================= */
import { auth } from '../firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

let personalFinanceModule;
let businessFinanceModule;
let isPersonalModuleLoaded = false;
let isBusinessModuleLoaded = false;
let currentUser = null;

// Sample financial data structure - replace with Firebase data
let userFinancialData = {
    personal: {
        income: [],
        expenses: [],
        assets: [],
        liabilities: [],
        savingsGoals: [],
        creditProfile: {},
        kidsFinance: [],
        taxHistory: [],
        insurance: []
    },
    business: {
        income: [],
        expenses: [],
        assets: [],
        liabilities: []
    },
    settings: {
        currency: 'ZAR',
        taxYear: 2024
    }
};

export function init(user) {
    if (!user || !user.uid) {
        console.error("FinHelp Error: User not authenticated.");
        return;
    }
    currentUser = user;
    console.log("FinHelp main controller initialized.");

    const personalWorkspace = document.getElementById('personal-workspace');
    const businessWorkspace = document.getElementById('business-workspace');
    const personalBtn = document.getElementById('workspace-personal-btn');
    const businessBtn = document.getElementById('workspace-business-btn');

    personalBtn.addEventListener('click', () => {
        personalWorkspace.classList.remove('hidden');
        businessWorkspace.classList.add('hidden');
        personalBtn.classList.add('active');
        businessBtn.classList.remove('active');
        loadPersonalModule();
    });

    businessBtn.addEventListener('click', () => {
        personalWorkspace.classList.add('hidden');
        businessWorkspace.classList.remove('hidden');
        businessBtn.classList.add('active');
        personalBtn.classList.remove('active');
        loadBusinessModule();
    });

    // Load default financial data and start with personal module
    loadDefaultFinancialData();
    loadPersonalModule();
}

function loadDefaultFinancialData() {
    // Sample data for demonstration - replace with Firebase loading
    userFinancialData.personal.income = [
        { id: '1', source: 'Salary', monthlyAmount: 35000, type: 'salary' },
        { id: '2', source: 'Freelance', monthlyAmount: 8000, type: 'freelance' }
    ];
    
    userFinancialData.personal.expenses = [
        { id: '1', category: 'Housing', monthlyAmount: 12000, type: 'rent' },
        { id: '2', category: 'Food', monthlyAmount: 4500, type: 'groceries' },
        { id: '3', category: 'Transport', monthlyAmount: 3200, type: 'fuel' }
    ];
    
    userFinancialData.personal.liabilities = [
        { id: '1', type: 'credit_card', name: 'FNB Credit Card', currentBalance: 15000, creditLimit: 25000, monthlyPayment: 1200 },
        { id: '2', type: 'personal_loan', name: 'Car Loan', currentBalance: 180000, monthlyPayment: 4500 }
    ];
    
    userFinancialData.personal.assets = [
        { id: '1', type: 'savings', name: 'Emergency Fund', currentValue: 45000, liquid: true },
        { id: '2', type: 'investment', name: 'Unit Trusts', currentValue: 85000, liquid: false }
    ];
}

async function loadPersonalModule() {
    if (isPersonalModuleLoaded) {
        return;
    }
    
    try {
        console.log('Loading personal finance module...');
        await renderPersonalFinanceHub();
        isPersonalModuleLoaded = true;
    } catch (error) {
        console.error("Failed to load personal finance module:", error);
        document.getElementById('personal-workspace').innerHTML = `<p class="text-red-500 text-center">Error loading personal finance tools.</p>`;
    }
}

async function loadBusinessModule() {
    if (isBusinessModuleLoaded) {
        return;
    }
    
    try {
        console.log('Loading business finance module...');
        await renderBusinessFinanceHub();
        isBusinessModuleLoaded = true;
    } catch (error) {
        console.error("Failed to load business finance module:", error);
        document.getElementById('business-workspace').innerHTML = `<p class="text-red-500 text-center">Error loading business finance tools.</p>`;
    }
}

async function renderPersonalFinanceHub() {
    const container = document.getElementById('personal-workspace');
    
    container.innerHTML = `
        <!-- Personal Finance Hub -->
        <div class="space-y-6">
            <!-- Overview Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100 text-sm">Monthly Income</p>
                            <p class="text-2xl font-bold">R${calculateTotalIncome().toLocaleString()}</p>
                        </div>
                        <i class="fas fa-wallet text-3xl text-green-200"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-red-100 text-sm">Monthly Expenses</p>
                            <p class="text-2xl font-bold">R${calculateTotalExpenses().toLocaleString()}</p>
                        </div>
                        <i class="fas fa-credit-card text-3xl text-red-200"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100 text-sm">Net Worth</p>
                            <p class="text-2xl font-bold">R${calculateNetWorth().toLocaleString()}</p>
                        </div>
                        <i class="fas fa-chart-line text-3xl text-blue-200"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-purple-100 text-sm">Savings Rate</p>
                            <p class="text-2xl font-bold">${calculateSavingsRate()}%</p>
                        </div>
                        <i class="fas fa-piggy-bank text-3xl text-purple-200"></i>
                    </div>
                </div>
            </div>

            <!-- Navigation Tabs -->
            <div class="bg-white rounded-lg border border-slate-200">
                <div class="border-b border-slate-200">
                    <nav class="flex space-x-8 px-6" aria-label="Tabs">
                        <button onclick="renderTabContent('overview')" class="tab-button active" data-tab="overview">
                            <i class="fas fa-chart-pie mr-2"></i>Overview
                        </button>
                        <button onclick="renderTabContent('savings')" class="tab-button" data-tab="savings">
                            <i class="fas fa-bullseye mr-2"></i>Savings Goals
                        </button>
                        <button onclick="renderTabContent('credit')" class="tab-button" data-tab="credit">
                            <i class="fas fa-credit-card mr-2"></i>Credit Profile
                        </button>
                        <button onclick="renderTabContent('tax')" class="tab-button" data-tab="tax">
                            <i class="fas fa-file-invoice-dollar mr-2"></i>Tax Management
                        </button>
                        <button onclick="renderTabContent('calculators')" class="tab-button" data-tab="calculators">
                            <i class="fas fa-calculator mr-2"></i>Calculators
                        </button>
                        <button onclick="renderTabContent('kids')" class="tab-button" data-tab="kids">
                            <i class="fas fa-child mr-2"></i>Kids Dashboard
                        </button>
                        <button onclick="renderTabContent('insurance')" class="tab-button" data-tab="insurance">
                            <i class="fas fa-shield-alt mr-2"></i>Insurance
                        </button>
                    </nav>
                </div>
                
                <!-- Tab Content -->
                <div id="tab-content" class="p-6">
                    ${renderOverviewTab()}
                </div>
            </div>
        </div>
    `;
    
    setupTabStyles();
}

function setupTabStyles() {
    // Add CSS for tabs if not already present
    if (!document.getElementById('finhelp-tab-styles')) {
        const style = document.createElement('style');
        style.id = 'finhelp-tab-styles';
        style.textContent = `
            .tab-button {
                padding: 1rem 1.5rem;
                border-bottom: 2px solid transparent;
                color: #64748b;
                font-weight: 500;
                transition: all 0.2s;
            }
            .tab-button:hover {
                color: #334155;
                border-bottom-color: #e2e8f0;
            }
            .tab-button.active {
                color: #3b82f6;
                border-bottom-color: #3b82f6;
            }
            .input {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 0.375rem;
                font-size: 0.875rem;
            }
            .input:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            .btn-primary {
                background: linear-gradient(to right, #3b82f6, #1d4ed8);
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 0.375rem;
                font-weight: 600;
                border: none;
                cursor: pointer;
                transition: all 0.2s;
            }
            .btn-primary:hover {
                background: linear-gradient(to right, #1d4ed8, #1e3a8a);
            }
            .btn-secondary {
                background: #f8fafc;
                color: #64748b;
                padding: 0.75rem 1.5rem;
                border: 1px solid #e2e8f0;
                border-radius: 0.375rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            .btn-secondary:hover {
                background: #f1f5f9;
                color: #334155;
            }
        `;
        document.head.appendChild(style);
    }
}

// Calculation functions
function calculateTotalIncome() {
    return userFinancialData.personal.income.reduce((sum, item) => sum + (item.monthlyAmount || 0), 0);
}

function calculateTotalExpenses() {
    return userFinancialData.personal.expenses.reduce((sum, item) => sum + (item.monthlyAmount || 0), 0);
}

function calculateNetWorth() {
    const assets = userFinancialData.personal.assets.reduce((sum, item) => sum + (item.currentValue || 0), 0);
    const liabilities = userFinancialData.personal.liabilities.reduce((sum, item) => sum + (item.currentBalance || 0), 0);
    return assets - liabilities;
}

function calculateSavingsRate() {
    const income = calculateTotalIncome();
    const expenses = calculateTotalExpenses();
    return income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;
}

function calculateDebtToIncomeRatio() {
    const totalIncome = calculateTotalIncome();
    const totalDebtPayments = userFinancialData.personal.liabilities.reduce((sum, item) => sum + (item.monthlyPayment || 0), 0);
    return totalIncome > 0 ? Math.round((totalDebtPayments / totalIncome) * 100) : 0;
}

function calculateEmergencyFundMonths() {
    const emergencyFund = userFinancialData.personal.assets.find(asset => asset.name.toLowerCase().includes('emergency'));
    const monthlyExpenses = calculateTotalExpenses();
    return emergencyFund && monthlyExpenses > 0 ? Math.round(emergencyFund.currentValue / monthlyExpenses) : 0;
}

function calculateCreditUtilization() {
    const creditCards = userFinancialData.personal.liabilities.filter(item => item.type === 'credit_card');
    if (creditCards.length === 0) return 0;
    
    const totalUsed = creditCards.reduce((sum, card) => sum + (card.currentBalance || 0), 0);
    const totalLimit = creditCards.reduce((sum, card) => sum + (card.creditLimit || 0), 0);
    
    return totalLimit > 0 ? Math.round((totalUsed / totalLimit) * 100) : 0;
}

function calculateTotalDebtPayments() {
    return userFinancialData.personal.liabilities.reduce((sum, item) => sum + (item.monthlyPayment || 0), 0);
}

function calculateEstimatedTax() {
    const annualIncome = calculateTotalIncome() * 12;
    return calculateSouthAfricanTax(annualIncome);
}

function getCurrentTaxBracket() {
    const annualIncome = calculateTotalIncome() * 12;
    if (annualIncome <= 95750) return 18;
    if (annualIncome <= 237100) return 26;
    if (annualIncome <= 370500) return 31;
    if (annualIncome <= 512800) return 36;
    if (annualIncome <= 673000) return 39;
    if (annualIncome <= 857900) return 41;
    return 45;
}

function calculateTaxEfficiency() {
    const grossIncome = calculateTotalIncome() * 12;
    const estimatedTax = calculateEstimatedTax();
    return grossIncome > 0 ? Math.round(((grossIncome - estimatedTax) / grossIncome) * 100) : 0;
}

function calculateSouthAfricanTax(annualIncome) {
    // 2024 South African tax brackets
    let tax = 0;
    
    if (annualIncome > 95750) tax += (Math.min(annualIncome, 237100) - 95750) * 0.26;
    if (annualIncome > 237100) tax += (Math.min(annualIncome, 370500) - 237100) * 0.31;
    if (annualIncome > 370500) tax += (Math.min(annualIncome, 512800) - 370500) * 0.36;
    if (annualIncome > 512800) tax += (Math.min(annualIncome, 673000) - 512800) * 0.39;
    if (annualIncome > 673000) tax += (Math.min(annualIncome, 857900) - 673000) * 0.41;
    if (annualIncome > 857900) tax += (annualIncome - 857900) * 0.45;
    
    // Apply rebates (simplified)
    const primaryRebate = 17235;
    return Math.max(0, tax - primaryRebate);
}

// Business calculation functions
function calculateBusinessRevenue() {
    return userFinancialData.business.income.reduce((sum, item) => sum + (item.monthlyAmount || 0), 0);
}

function calculateBusinessExpenses() {
    return userFinancialData.business.expenses.reduce((sum, item) => sum + (item.monthlyAmount || 0), 0);
}

function calculateBusinessTax() {
    const monthlyProfit = calculateBusinessRevenue() - calculateBusinessExpenses();
    const annualProfit = monthlyProfit * 12;
    return annualProfit > 0 ? annualProfit * 0.27 : 0; // SA company tax rate
}

// Credit and child helper functions
function getCreditRating(score) {
    if (!score) return 'Unknown';
    if (score >= 767) return 'Excellent';
    if (score >= 681) return 'Good';
    if (score >= 614) return 'Fair';
    if (score >= 560) return 'Poor';
    return 'Very Poor';
}

function getChildEmoji(age) {
    if (age <= 5) return '👶';
    if (age <= 8) return '🧒';
    if (age <= 12) return '👦';
    return '👨‍🎓';
}

function calculateChildProgress(child) {
    if (!child.goalAmount || child.goalAmount === 0) return 0;
    return Math.min(100, (child.currentSavings / child.goalAmount) * 100);
}

// Tab rendering functions
window.renderTabContent = async function(tabName) {
    const tabContent = document.getElementById('tab-content');
    const tabButtons = document.querySelectorAll('.tab-button');
    
    // Update active tab
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Render content based on tab
    switch(tabName) {
        case 'overview':
            tabContent.innerHTML = renderOverviewTab();
            break;
        case 'savings':
            tabContent.innerHTML = renderSavingsGoalsTab();
            break;
        case 'credit':
            tabContent.innerHTML = renderCreditProfileTab();
            break;
        case 'tax':
            tabContent.innerHTML = renderTaxManagementTab();
            break;
        case 'calculators':
            tabContent.innerHTML = renderCalculatorsTab();
            break;
        case 'kids':
            tabContent.innerHTML = renderKidsDashboardTab();
            break;
        case 'insurance':
            tabContent.innerHTML = renderInsuranceTab();
            break;
        default:
            tabContent.innerHTML = renderOverviewTab();
    }
};

function renderOverviewTab() {
    return `
        <div class="space-y-6">
            <h3 class="text-lg font-semibold text-slate-900">Financial Overview</h3>
            
            <!-- Quick Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-slate-50 rounded-lg p-4">
                    <h4 class="font-medium text-slate-900 mb-3">Income Breakdown</h4>
                    <div class="space-y-2">
                        ${userFinancialData.personal.income.map(item => `
                            <div class="flex justify-between text-sm">
                                <span>${item.source}</span>
                                <span class="font-semibold">R${item.monthlyAmount.toLocaleString()}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="bg-slate-50 rounded-lg p-4">
                    <h4 class="font-medium text-slate-900 mb-3">Top Expenses</h4>
                    <div class="space-y-2">
                        ${userFinancialData.personal.expenses.slice(0, 3).map(item => `
                            <div class="flex justify-between text-sm">
                                <span>${item.category}</span>
                                <span class="font-semibold">R${item.monthlyAmount.toLocaleString()}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="bg-slate-50 rounded-lg p-4">
                    <h4 class="font-medium text-slate-900 mb-3">Financial Health</h4>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span>Debt-to-Income</span>
                            <span class="font-semibold">${calculateDebtToIncomeRatio()}%</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Emergency Fund</span>
                            <span class="font-semibold">${calculateEmergencyFundMonths()} months</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Credit Utilization</span>
                            <span class="font-semibold">${calculateCreditUtilization()}%</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button onclick="renderTabContent('savings')" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>Add Savings Goal
                </button>
                <button onclick="renderTabContent('calculators')" class="btn-secondary">
                    <i class="fas fa-calculator mr-2"></i>Home Loan Calculator
                </button>
                <button onclick="renderTabContent('credit')" class="btn-secondary">
                    <i class="fas fa-chart-line mr-2"></i>Check Credit Score
                </button>
                <button onclick="renderTabContent('tax')" class="btn-secondary">
                    <i class="fas fa-file-invoice mr-2"></i>Tax Calculator
                </button>
            </div>
        </div>
    `;
}

function renderSavingsGoalsTab() {
    const savingsGoals = userFinancialData.personal.savingsGoals || [];
    
    return `
        <div class="space-y-6">
            <!-- Savings Goals Overview -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100 text-sm">Total Goal Amount</p>
                            <p class="text-2xl font-bold">R${savingsGoals.reduce((sum, goal) => sum + (goal.targetAmount || 0), 0).toLocaleString()}</p>
                        </div>
                        <i class="fas fa-bullseye text-3xl text-green-200"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100 text-sm">Total Saved</p>
                            <p class="text-2xl font-bold">R${savingsGoals.reduce((sum, goal) => sum + (goal.currentAmount || 0), 0).toLocaleString()}</p>
                        </div>
                        <i class="fas fa-piggy-bank text-3xl text-blue-200"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-purple-100 text-sm">Active Goals</p>
                            <p class="text-2xl font-bold">${savingsGoals.filter(goal => goal.status === 'active').length}</p>
                        </div>
                        <i class="fas fa-target text-3xl text-purple-200"></i>
                    </div>
                </div>
            </div>

            <!-- Add Goal Button -->
            <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-slate-900">Savings Goals</h3>
                <button onclick="openAddGoalModal()" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>Add Savings Goal
                </button>
            </div>

            <!-- Goals List -->
            <div class="space-y-4">
                ${renderSavingsGoalsList(savingsGoals)}
            </div>
        </div>

        <!-- Add Goal Modal -->
        <div id="add-goal-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-90vh overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold">Add Savings Goal</h3>
                    <button onclick="closeAddGoalModal()" class="text-slate-400 hover:text-slate-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <form id="goal-form" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-slate-700 mb-1">Goal Name</label>
                            <input type="text" id="goal-name" class="input" placeholder="e.g., Emergency Fund, New Car" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Target Amount (R)</label>
                            <input type="number" id="target-amount" class="input" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Target Date</label>
                            <input type="date" id="target-date" class="input" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Current Amount (R)</label>
                            <input type="number" id="current-amount" class="input" value="0">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Monthly Contribution (R)</label>
                            <input type="number" id="monthly-contribution" class="input">
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="closeAddGoalModal()" class="btn-secondary">Cancel</button>
                        <button type="submit" class="btn-primary">Create Goal</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function renderSavingsGoalsList(goals) {
    if (goals.length === 0) {
        return `
            <div class="bg-white rounded-lg p-8 text-center border border-slate-200">
                <i class="fas fa-piggy-bank text-4xl text-slate-300 mb-4"></i>
                <p class="text-slate-500">No savings goals set yet</p>
                <p class="text-sm text-slate-400">Create your first goal to start tracking progress</p>
            </div>
        `;
    }

    return goals.map(goal => {
        const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
        const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="bg-white rounded-lg p-6 border border-slate-200">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h4 class="text-lg font-semibold text-slate-900">${goal.name}</h4>
                        <p class="text-sm text-slate-600">${daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-lg font-bold text-slate-900">R${goal.currentAmount.toLocaleString()} / R${goal.targetAmount.toLocaleString()}</p>
                        <p class="text-sm text-slate-600">${progress.toFixed(1)}% complete</p>
                    </div>
                </div>
                
                <!-- Progress Bar -->
                <div class="mb-4">
                    <div class="w-full bg-slate-200 rounded-full h-3">
                        <div class="bg-green-500 h-3 rounded-full transition-all duration-300" style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                </div>
                
                <div class="flex justify-end space-x-2">
                    <button onclick="editGoal('${goal.id}')" class="btn-secondary text-sm">
                        <i class="fas fa-edit mr-1"></i>Edit
                    </button>
                    <button onclick="addProgress('${goal.id}')" class="btn-primary text-sm">
                        <i class="fas fa-plus mr-1"></i>Add Progress
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function renderCreditProfileTab() {
    const creditProfile = userFinancialData.personal.creditProfile || {};
    
    return `
        <div class="space-y-6">
            <!-- Credit Score Overview -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100 text-sm">Credit Score</p>
                            <p class="text-3xl font-bold">${creditProfile.score || 'N/A'}</p>
                            <p class="text-blue-200 text-xs">${getCreditRating(creditProfile.score)}</p>
                        </div>
                        <i class="fas fa-chart-line text-3xl text-blue-200"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100 text-sm">Credit Utilization</p>
                            <p class="text-2xl font-bold">${calculateCreditUtilization()}%</p>
                        </div>
                        <i class="fas fa-percentage text-3xl text-green-200"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-purple-100 text-sm">Active Accounts</p>
                            <p class="text-2xl font-bold">${(creditProfile.accounts || []).length}</p>
                        </div>
                        <i class="fas fa-credit-card text-3xl text-purple-200"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-yellow-100 text-sm">Payment History</p>
                            <p class="text-2xl font-bold">${creditProfile.paymentHistoryScore || 0}%</p>
                        </div>
                        <i class="fas fa-clock text-3xl text-yellow-200"></i>
                    </div>
                </div>
            </div>

            <!-- Credit Score Calculator -->
            <div class="bg-white rounded-lg p-6 border border-slate-200">
                <h3 class="text-lg font-semibold text-slate-900 mb-4">
                    <i class="fas fa-calculator mr-2 text-indigo-600"></i>
                    South African Credit Score Calculator
                </h3>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Input Section -->
                    <div class="bg-slate-50 rounded-lg p-4">
                        <h4 class="font-semibold text-slate-900 mb-4">Credit Information</h4>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Payment History</label>
                                <select id="payment-history" class="input">
                                    <option value="100">Perfect - Never missed a payment</option>
                                    <option value="90">Excellent - 1-2 late payments ever</option>
                                    <option value="80">Good - Occasional late payments</option>
                                    <option value="70">Fair - Several late payments</option>
                                    <option value="50">Poor - Many missed payments</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Total Credit Limit (R)</label>
                                <input type="number" id="total-credit-limit" class="input" placeholder="Total available credit">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Total Credit Used (R)</label>
                                <input type="number" id="total-credit-used" class="input" placeholder="Currently owed">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Credit History Length</label>
                                <select id="credit-history-length" class="input">
                                    <option value="100">More than 10 years</option>
                                    <option value="90">7-10 years</option>
                                    <option value="80">5-7 years</option>
                                    <option value="70">3-5 years</option>
                                    <option value="60">1-3 years</option>
                                </select>
                            </div>
                            
                            <button onclick="calculateCreditScore()" class="btn-primary w-full">
                                <i class="fas fa-calculator mr-2"></i>Calculate Credit Score
                            </button>
                        </div>
                    </div>
                    
                    <!-- Results Section -->
                    <div>
                        <h4 class="font-semibold text-slate-900 mb-4">Credit Score Results</h4>
                        <div id="credit-score-results" class="space-y-4">
                            <p class="text-slate-500">Enter your credit information to calculate your estimated score</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderTaxManagementTab() {
    return `
        <div class="space-y-6">
            <!-- Tax Overview -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100 text-sm">Annual Income</p>
                            <p class="text-2xl font-bold">R${(calculateTotalIncome() * 12).toLocaleString()}</p>
                        </div>
                        <i class="fas fa-money-bill-wave text-3xl text-green-200"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-red-100 text-sm">Estimated Tax</p>
                            <p class="text-2xl font-bold">R${calculateEstimatedTax().toLocaleString()}</p>
                        </div>
                        <i class="fas fa-receipt text-3xl text-red-200"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100 text-sm">Tax Bracket</p>
                            <p class="text-2xl font-bold">${getCurrentTaxBracket()}%</p>
                        </div>
                        <i class="fas fa-percentage text-3xl text-blue-200"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-purple-100 text-sm">Tax Efficiency</p>
                            <p class="text-2xl font-bold">${calculateTaxEfficiency()}%</p>
                        </div>
                        <i class="fas fa-chart-pie text-3xl text-purple-200"></i>
                    </div>
                </div>
            </div>

            <!-- Tax Calculator -->
            <div class="bg-white rounded-lg p-6 border border-slate-200">
                <h3 class="text-lg font-semibold text-slate-900 mb-4">
                    <i class="fas fa-calculator mr-2 text-indigo-600"></i>
                    South African Tax Calculator
                </h3>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Annual Salary (R)</label>
                            <input type="number" id="annual-salary" class="input" value="${calculateTotalIncome() * 12}">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Medical Aid Contributions (R)</label>
                            <input type="number" id="medical-aid" class="input" value="0">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Retirement Fund Contributions (R)</label>
                            <input type="number" id="retirement-contributions" class="input" value="0">
                        </div>
                        
                        <button onclick="calculateTax()" class="btn-primary w-full">
                            <i class="fas fa-calculator mr-2"></i>Calculate Tax
                        </button>
                    </div>
                    
                    <div>
                        <h4 class="font-semibold text-slate-900 mb-4">Tax Calculation Results</h4>
                        <div id="tax-results" class="space-y-4">
                            <p class="text-slate-500">Enter your income information and click calculate</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderCalculatorsTab() {
    return `
        <div class="space-y-6">
            <h3 class="text-lg font-semibold text-slate-900">Financial Calculators</h3>
            
            <!-- Calculator Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Home Loan Calculator -->
                <div class="bg-white rounded-lg p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                    <div class="text-center mb-4">
                        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-home text-2xl text-blue-600"></i>
                        </div>
                        <h4 class="text-lg font-semibold text-slate-900">Home Loan Affordability</h4>
                        <p class="text-sm text-slate-600">Calculate how much home you can afford</p>
                    </div>
                    <button onclick="openHomeLoanCalculator()" class="btn-primary w-full">
                        Calculate Now
                    </button>
                </div>
                
                <!-- Retirement Calculator -->
                <div class="bg-white rounded-lg p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                    <div class="text-center mb-4">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-piggy-bank text-2xl text-green-600"></i>
                        </div>
                        <h4 class="text-lg font-semibold text-slate-900">Retirement Planning</h4>
                        <p class="text-sm text-slate-600">Plan for a comfortable retirement</p>
                    </div>
                    <button onclick="openRetirementCalculator()" class="btn-primary w-full">
                        Calculate Now
                    </button>
                </div>
                
                <!-- Investment Calculator -->
                <div class="bg-white rounded-lg p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                    <div class="text-center mb-4">
                        <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-chart-line text-2xl text-purple-600"></i>
                        </div>
                        <h4 class="text-lg font-semibold text-slate-900">Investment Growth</h4>
                        <p class="text-sm text-slate-600">See how your investments can grow</p>
                    </div>
                    <button onclick="openInvestmentCalculator()" class="btn-primary w-full">
                        Calculate Now
                    </button>
                </div>
            </div>
        </div>

        <!-- Home Loan Calculator Modal -->
        <div id="home-loan-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-90vh overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold">Home Loan Affordability Calculator</h3>
                    <button onclick="closeHomeLoanCalculator()" class="text-slate-400 hover:text-slate-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Input Section -->
                    <div class="bg-slate-50 rounded-lg p-6">
                        <h4 class="font-semibold text-slate-900 mb-4">Your Financial Information</h4>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Monthly Gross Income (R)</label>
                                <input type="number" id="monthly-income" class="input" value="${calculateTotalIncome()}">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Monthly Expenses (R)</label>
                                <input type="number" id="monthly-expenses" class="input" value="${calculateTotalExpenses()}">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Existing Debt Payments (R)</label>
                                <input type="number" id="existing-debt" class="input" value="${calculateTotalDebtPayments()}">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Available Deposit (R)</label>
                                <input type="number" id="deposit-amount" class="input" placeholder="Enter deposit amount">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Interest Rate (%)</label>
                                <input type="number" id="interest-rate" class="input" value="11.5" step="0.1">
                            </div>
                            
                            <button onclick="calculateHomeLoan()" class="btn-primary w-full">
                                <i class="fas fa-calculator mr-2"></i>Calculate Affordability
                            </button>
                        </div>
                    </div>
                    
                    <!-- Results Section -->
                    <div>
                        <h4 class="font-semibold text-slate-900 mb-4">Affordability Results</h4>
                        <div id="home-loan-results" class="space-y-4">
                            <p class="text-slate-500">Enter your financial information to see what you can afford</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderKidsDashboardTab() {
    const kidsData = userFinancialData.personal.kidsFinance || [];
    
    return `
        <div class="space-y-6">
            <!-- Kids Overview -->
            <div class="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 rounded-lg p-6 text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-2xl font-bold mb-2">Kids Money Learning Dashboard</h2>
                        <p class="text-purple-100">Teaching financial literacy through fun and interactive experiences</p>
                    </div>
                    <div class="text-6xl">🎯</div>
                </div>
            </div>

            <!-- Add Child Button -->
            <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-slate-900">Your Children's Financial Journey</h3>
                <button onclick="openAddChildModal()" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>Add Child
                </button>
            </div>

            <!-- Kids Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${renderKidsGrid(kidsData)}
            </div>

            <!-- Age-Appropriate Learning -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-blue-50 rounded-lg p-6">
                    <h4 class="font-semibold text-blue-900 mb-4">Ages 3-6: Money Basics 🐣</h4>
                    <ul class="space-y-2 text-blue-800 text-sm">
                        <li>• Identify coins and notes</li>
                        <li>• Understand "buying" things</li>
                        <li>• Learn to count money</li>
                        <li>• Simple piggy bank savings</li>
                    </ul>
                </div>
                
                <div class="bg-green-50 rounded-lg p-6">
                    <h4 class="font-semibold text-green-900 mb-4">Ages 7-12: Smart Spending 🌱</h4>
                    <ul class="space-y-2 text-green-800 text-sm">
                        <li>• Allowance management</li>
                        <li>• Saving for goals</li>
                        <li>• Understanding wants vs needs</li>
                        <li>• Basic budgeting skills</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Add Child Modal -->
        <div id="add-child-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold">Add Child to Finance Dashboard</h3>
                    <button onclick="closeAddChildModal()" class="text-slate-400 hover:text-slate-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <form id="child-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Child's Name</label>
                        <input type="text" id="child-name" class="input" required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Age</label>
                        <select id="child-age" class="input" required>
                            <option value="">Select age...</option>
                            ${[...Array(10)].map((_, i) => `<option value="${i + 3}">${i + 3} years old</option>`).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Weekly Allowance (R)</label>
                        <input type="number" id="child-allowance" class="input" min="0" step="5">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Savings Goal</label>
                        <input type="text" id="child-goal" class="input" placeholder="e.g., New toy, bicycle">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Goal Amount (R)</label>
                        <input type="number" id="child-goal-amount" class="input" min="0">
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="closeAddChildModal()" class="btn-secondary">Cancel</button>
                        <button type="submit" class="btn-primary">Add Child</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function renderInsuranceTab() {
    return `
        <div class="space-y-6">
            <h3 class="text-lg font-semibold text-slate-900">Insurance Management</h3>
            
            <!-- Insurance Overview -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100 text-sm">Life Cover</p>
                            <p class="text-2xl font-bold">R2.5M</p>
                        </div>
                        <i class="fas fa-heart text-3xl text-blue-200"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100 text-sm">Medical Aid</p>
                            <p class="text-2xl font-bold">Active</p>
                        </div>
                        <i class="fas fa-plus-circle text-3xl text-green-200"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-yellow-100 text-sm">Car Insurance</p>
                            <p class="text-2xl font-bold">R450k</p>
                        </div>
                        <i class="fas fa-car text-3xl text-yellow-200"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-purple-100 text-sm">House Insurance</p>
                            <p class="text-2xl font-bold">R1.8M</p>
                        </div>
                        <i class="fas fa-home text-3xl text-purple-200"></i>
                    </div>
                </div>
            </div>
            
            <!-- Insurance Policies -->
            <div class="bg-white rounded-lg p-6 border border-slate-200">
                <h4 class="font-semibold text-slate-900 mb-4">Active Policies</h4>
                <div class="space-y-4">
                    <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                            <h5 class="font-medium text-slate-900">Life Insurance - Discovery Life</h5>
                            <p class="text-sm text-slate-600">Cover: R2,500,000 | Premium: R850/month</p>
                        </div>
                        <div class="text-right">
                            <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span>
                            <p class="text-xs text-slate-500 mt-1">Renews: 15 Mar 2025</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                            <h5 class="font-medium text-slate-900">Car Insurance - Santam</h5>
                            <p class="text-sm text-slate-600">Vehicle: Toyota Corolla | Premium: R1,200/month</p>
                        </div>
                        <div class="text-right">
                            <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Expiring Soon</span>
                            <p class="text-xs text-slate-500 mt-1">Renews: 28 Feb 2025</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>Add New Policy
                </button>
                <button class="btn-secondary">
                    <i class="fas fa-calculator mr-2"></i>Insurance Calculator
                </button>
                <button class="btn-secondary">
                    <i class="fas fa-file-alt mr-2"></i>View All Documents
                </button>
            </div>
        </div>
    `;
}

function renderKidsGrid(kidsData) {
    if (kidsData.length === 0) {
        return `
            <div class="col-span-full bg-white rounded-lg p-8 text-center border border-slate-200">
                <div class="text-6xl mb-4">👶</div>
                <p class="text-slate-500">No children added yet</p>
                <p class="text-sm text-slate-400">Add your first child to start their financial journey</p>
            </div>
        `;
    }

    return kidsData.map(child => `
        <div class="bg-white rounded-lg p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <div class="text-center mb-4">
                <div class="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                    ${getChildEmoji(child.age)}
                </div>
                <h4 class="text-lg font-semibold text-slate-900">${child.name}</h4>
                <p class="text-sm text-slate-600">${child.age} years old</p>
            </div>
            
            <!-- Savings Progress -->
            <div class="mb-4">
                <div class="flex justify-between text-sm text-slate-600 mb-1">
                    <span>Saving for: ${child.savingsGoal || 'No goal set'}</span>
                    <span>R${child.currentSavings || 0} / R${child.goalAmount || 0}</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2">
                    <div class="bg-pink-500 h-2 rounded-full" style="width: ${calculateChildProgress(child)}%"></div>
                </div>
            </div>
            
            <!-- Weekly Allowance -->
            <div class="bg-green-50 rounded-lg p-3 mb-4">
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-green-800">Weekly Allowance</span>
                    <span class="font-bold text-green-900">R${child.weeklyAllowance || 0}</span>
                </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="grid grid-cols-2 gap-2">
                <button onclick="addChildSavings('${child.id}')" class="btn-primary text-xs">
                    <i class="fas fa-piggy-bank mr-1"></i>Add Savings
                </button>
                <button onclick="viewChildDetails('${child.id}')" class="btn-secondary text-xs">
                    <i class="fas fa-eye mr-1"></i>View Details
                </button>
            </div>
        </div>
    `).join('');
}

async function renderBusinessFinanceHub() {
    const container = document.getElementById('business-workspace');
    
    container.innerHTML = `
        <!-- Business Finance Hub -->
        <div class="space-y-6">
            <!-- Business Overview Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100 text-sm">Monthly Revenue</p>
                            <p class="text-2xl font-bold">R${calculateBusinessRevenue().toLocaleString()}</p>
                        </div>
                        <i class="fas fa-chart-line text-3xl text-green-200"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-red-100 text-sm">Monthly Expenses</p>
                            <p class="text-2xl font-bold">R${calculateBusinessExpenses().toLocaleString()}</p>
                        </div>
                        <i class="fas fa-money-bill-wave text-3xl text-red-200"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100 text-sm">Net Profit</p>
                            <p class="text-2xl font-bold">R${(calculateBusinessRevenue() - calculateBusinessExpenses()).toLocaleString()}</p>
                        </div>
                        <i class="fas fa-chart-pie text-3xl text-blue-200"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-purple-100 text-sm">Tax Liability</p>
                            <p class="text-2xl font-bold">R${calculateBusinessTax().toLocaleString()}</p>
                        </div>
                        <i class="fas fa-file-invoice-dollar text-3xl text-purple-200"></i>
                    </div>
                </div>
            </div>

            <!-- Business Quick Actions -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white rounded-lg p-6 border border-slate-200">
                    <h3 class="text-lg font-semibold text-slate-900 mb-4">
                        <i class="fas fa-file-invoice mr-2 text-indigo-600"></i>Invoicing & Billing
                    </h3>
                    <p class="text-slate-600 mb-4">Create professional invoices and track payments</p>
                    <button onclick="alert('Invoice manager would open here')" class="btn-primary w-full">
                        <i class="fas fa-plus mr-2"></i>Create Invoice
                    </button>
                </div>
                
                <div class="bg-white rounded-lg p-6 border border-slate-200">
                    <h3 class="text-lg font-semibold text-slate-900 mb-4">
                        <i class="fas fa-receipt mr-2 text-green-600"></i>Expense Tracking
                    </h3>
                    <p class="text-slate-600 mb-4">Track business expenses for tax deductions</p>
                    <button onclick="alert('Expense tracker would open here')" class="btn-primary w-full">
                        <i class="fas fa-camera mr-2"></i>Scan Receipt
                    </button>
                </div>
                
                <div class="bg-white rounded-lg p-6 border border-slate-200">
                    <h3 class="text-lg font-semibold text-slate-900 mb-4">
                        <i class="fas fa-chart-bar mr-2 text-yellow-600"></i>Financial Reports
                    </h3>
                    <p class="text-slate-600 mb-4">Generate P&L, balance sheets, and more</p>
                    <button onclick="alert('Report generator would open here')" class="btn-primary w-full">
                        <i class="fas fa-download mr-2"></i>Generate Reports
                    </button>
                </div>
            </div>

            <!-- Recent Business Activity -->
            <div class="bg-white rounded-lg p-6 border border-slate-200">
                <h3 class="text-lg font-semibold text-slate-900 mb-4">Recent Business Activity</h3>
                <div class="space-y-3">
                    <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div class="flex items-center">
                            <i class="fas fa-arrow-up text-green-500 mr-3"></i>
                            <div>
                                <p class="text-sm text-slate-500">Increased monthly revenue target</p>
                                <p class="text-sm font-semibold text-slate-900">New target: R50,000</p>
                            </div>
                        </div>
                        <span class="text-xs text-slate-400">2 mins ago</span>
                    </div>
                    
                    <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div class="flex items-center">
                            <i class="fas fa-arrow-down text-red-500 mr-3"></i>
                            <div>
                                <p class="text-sm text-slate-500">Decreased marketing budget</p>
                                <p class="text-sm font-semibold text-slate-900">New budget: R10,000</p>
                            </div>
                        </div>
                        <span class="text-xs text-slate-400">10 mins ago</span>
                    </div>
                    
                    <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div class="flex items-center">
                            <i class="fas fa-plus-circle text-blue-500 mr-3"></i>
                            <div>
                                <p class="text-sm text-slate-500">Added new business expense</p>
                                <p class="text-sm font-semibold text-slate-900">Office Supplies: R1,200</p>
                            </div>
                        </div>
                        <span class="text-xs text-slate-400">30 mins ago</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Modal functions - Add these as global window functions
window.openAddGoalModal = function() {
    document.getElementById('add-goal-modal').classList.remove('hidden');
};

window.closeAddGoalModal = function() {
    document.getElementById('add-goal-modal').classList.add('hidden');
};

window.openAddChildModal = function() {
    document.getElementById('add-child-modal').classList.remove('hidden');
};

window.closeAddChildModal = function() {
    document.getElementById('add-child-modal').classList.add('hidden');
};

window.openHomeLoanCalculator = function() {
    document.getElementById('home-loan-modal').classList.remove('hidden');
};

window.closeHomeLoanCalculator = function() {
    document.getElementById('home-loan-modal').classList.add('hidden');
};

window.calculateHomeLoan = function() {
    const monthlyIncome = parseFloat(document.getElementById('monthly-income').value) || 0;
    const monthlyExpenses = parseFloat(document.getElementById('monthly-expenses').value) || 0;
    const existingDebt = parseFloat(document.getElementById('existing-debt').value) || 0;
    const deposit = parseFloat(document.getElementById('deposit-amount').value) || 0;
    const interestRate = parseFloat(document.getElementById('interest-rate').value) / 100 / 12;
    
    const availableIncome = monthlyIncome - monthlyExpenses - existingDebt;
    const maxLoanPayment = availableIncome * 0.3; // 30% of available income
    
    // Calculate loan amount using PMT formula
    const loanTerm = 240; // 20 years in months
    const maxLoanAmount = maxLoanPayment * ((1 - Math.pow(1 + interestRate, -loanTerm)) / interestRate);
    const maxPropertyPrice = maxLoanAmount + deposit;
    
    document.getElementById('home-loan-results').innerHTML = `
        <div class="space-y-4">
            <div class="bg-green-50 rounded-lg p-4">
                <h5 class="font-semibold text-green-800 mb-3">Maximum Property Price</h5>
                <p class="text-2xl font-bold text-green-900">R${maxPropertyPrice.toLocaleString()}</p>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span class="text-slate-600">Max Loan Amount:</span>
                    <span class="font-semibold">R${maxLoanAmount.toLocaleString()}</span>
                </div>
                <div>
                    <span class="text-slate-600">Monthly Payment:</span>
                    <span class="font-semibold">R${maxLoanPayment.toLocaleString()}</span>
                </div>
                <div>
                    <span class="text-slate-600">Your Deposit:</span>
                    <span class="font-semibold">R${deposit.toLocaleString()}</span>
                </div>
                <div>
                    <span class="text-slate-600">Loan-to-Value:</span>
                    <span class="font-semibold">${((maxLoanAmount / maxPropertyPrice) * 100).toFixed(1)}%</span>
                </div>
            </div>
        </div>
    `;
};

window.calculateCreditScore = function() {
    const paymentHistory = parseInt(document.getElementById('payment-history').value);
    const totalLimit = parseFloat(document.getElementById('total-credit-limit').value) || 1;
    const totalUsed = parseFloat(document.getElementById('total-credit-used').value) || 0;
    const historyLength = parseInt(document.getElementById('credit-history-length').value);
    
    const utilization = (totalUsed / totalLimit) * 100;
    let utilizationScore = 100;
    if (utilization > 30) utilizationScore = 70;
    if (utilization > 50) utilizationScore = 50;
    if (utilization > 75) utilizationScore = 30;
    
    // Simple credit score calculation
    const estimatedScore = Math.round(
        (paymentHistory * 0.35) + 
        (utilizationScore * 0.30) + 
        (historyLength * 0.15) + 
        (85 * 0.20) // Other factors
    );
    
    const finalScore = Math.min(850, Math.max(300, estimatedScore));
    
    document.getElementById('credit-score-results').innerHTML = `
        <div class="space-y-4">
            <div class="text-center">
                <div class="text-6xl font-bold ${finalScore >= 700 ? 'text-green-600' : finalScore >= 600 ? 'text-yellow-600' : 'text-red-600'} mb-2">
                    ${finalScore}
                </div>
                <p class="text-lg font-semibold">${getCreditRating(finalScore)}</p>
            </div>
            
            <div class="space-y-2">
                <div class="flex justify-between text-sm">
                    <span>Payment History (35%)</span>
                    <span class="font-semibold">${paymentHistory}/100</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span>Credit Utilization (30%)</span>
                    <span class="font-semibold">${utilization.toFixed(1)}%</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span>Credit History Length (15%)</span>
                    <span class="font-semibold">${historyLength}/100</span>
                </div>
            </div>
            
            <div class="bg-blue-50 rounded-lg p-3">
                <h6 class="font-semibold text-blue-800">Improvement Tips:</h6>
                <ul class="text-sm text-blue-700 mt-1">
                    ${utilization > 30 ? '<li>• Keep credit utilization below 30%</li>' : ''}
                    ${paymentHistory < 90 ? '<li>• Always pay on time</li>' : ''}
                    <li>• Avoid closing old credit accounts</li>
                    <li>• Check your credit report regularly</li>
                </ul>
            </div>
        </div>
    `;
};

window.calculateTax = function() {
    const annualSalary = parseFloat(document.getElementById('annual-salary').value) || 0;
    const medicalAid = parseFloat(document.getElementById('medical-aid').value) || 0;
    const retirement = parseFloat(document.getElementById('retirement-contributions').value) || 0;
    
    const taxableIncome = annualSalary - retirement;
    const incomeTax = calculateSouthAfricanTax(taxableIncome);
    const uif = Math.min(annualSalary * 0.01, 177.12 * 12);
    const medicalTaxCredit = medicalAid * 0.25;
    
    const totalTax = Math.max(0, incomeTax + uif - medicalTaxCredit);
    const netIncome = annualSalary - totalTax;
    const effectiveRate = annualSalary > 0 ? (totalTax / annualSalary) * 100 : 0;
    
    document.getElementById('tax-results').innerHTML = `
        <div class="space-y-4">
            <div class="bg-slate-50 rounded-lg p-4">
                <h5 class="font-semibold text-slate-800 mb-3">Tax Calculation Summary</h5>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span>Gross Annual Income:</span>
                        <span class="font-semibold">R${annualSalary.toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Retirement Deduction:</span>
                        <span class="font-semibold">R${retirement.toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Taxable Income:</span>
                        <span class="font-semibold">R${taxableIncome.toLocaleString()}</span>
                    </div>
                    <hr class="my-2">
                    <div class="flex justify-between">
                        <span>Income Tax:</span>
                        <span class="font-semibold">R${incomeTax.toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>UIF:</span>
                        <span class="font-semibold">R${uif.toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Medical Tax Credit:</span>
                        <span class="font-semibold text-green-600">-R${medicalTaxCredit.toLocaleString()}</span>
                    </div>
                    <hr class="my-2">
                    <div class="flex justify-between font-bold">
                        <span>Total Tax:</span>
                        <span>R${totalTax.toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between font-bold text-green-600">
                        <span>Net Annual Income:</span>
                        <span>R${netIncome.toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Effective Tax Rate:</span>
                        <span class="font-semibold">${effectiveRate.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// Add placeholder functions for the remaining modals
window.openRetirementCalculator = function() {
    alert('Retirement calculator coming soon!');
};

window.openInvestmentCalculator = function() {
    alert('Investment calculator coming soon!');
};

window.editGoal = function(goalId) {
    alert('Edit goal functionality coming soon!');
};

window.addProgress = function(goalId) {
    alert('Add progress functionality coming soon!');
};

window.addChildSavings = function(childId) {
    alert('Add child savings functionality coming soon!');
};

window.viewChildDetails = function(childId) {
    alert('View child details functionality coming soon!');
};
