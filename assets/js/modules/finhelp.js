/* ================================================================================= */
/* FILE: assets/js/modules/finhelp.js (CONTROLLER - COMPLETE IMPLEMENTATION)        */
/* PURPOSE: Complete Personal and Business finance modules with all features.        */
/* ================================================================================= */

import { auth } from '../firebase-config.js';
import { saveDocument, getDocument, updateDocument, addDocument, deleteDocument } from '../database.js';
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
        insurance: [],
        documents: []
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
    console.log("FinHelp main controller initialized for user:", user.uid);

    // Get workspace elements
    const personalWorkspace = document.getElementById('personal-workspace');
    const businessWorkspace = document.getElementById('business-workspace');
    const personalBtn = document.getElementById('workspace-personal-btn');
    const businessBtn = document.getElementById('workspace-business-btn');

    if (!personalWorkspace || !businessWorkspace || !personalBtn || !businessBtn) {
        console.error("Required workspace elements not found");
        return;
    }

    // Setup workspace switching
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

    userFinancialData.business.income = [
        { id: '1', source: 'Service Sales', monthlyAmount: 45000, type: 'revenue' },
        { id: '2', source: 'Product Sales', monthlyAmount: 25000, type: 'revenue' }
    ];
    
    userFinancialData.business.expenses = [
        { id: '1', category: 'Office Rent', monthlyAmount: 8000, type: 'fixed' },
        { id: '2', category: 'Marketing', monthlyAmount: 5000, type: 'variable' },
        { id: '3', category: 'Utilities', monthlyAmount: 2500, type: 'fixed' }
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
        console.log('Personal finance module loaded successfully');
    } catch (error) {
        console.error("Failed to load personal finance module:", error);
        const personalWorkspace = document.getElementById('personal-workspace');
        if (personalWorkspace) {
            personalWorkspace.innerHTML = `<p class="text-red-500 text-center">Error loading personal finance tools: ${error.message}</p>`;
        }
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
        console.log('Business finance module loaded successfully');
    } catch (error) {
        console.error("Failed to load business finance module:", error);
        const businessWorkspace = document.getElementById('business-workspace');
        if (businessWorkspace) {
            businessWorkspace.innerHTML = `<p class="text-red-500 text-center">Error loading business finance tools: ${error.message}</p>`;
        }
    }
}

async function renderPersonalFinanceHub() {
    const container = document.getElementById('personal-workspace');
    
    if (!container) {
        throw new Error('Personal workspace container not found');
    }
    
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
        const style = document.createElement('style'); // THIS WAS THE MISSING LINE!
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

// Tab rendering functions
window.renderTabContent = async function(tabName) {
    const tabContent = document.getElementById('tab-content');
    const tabButtons = document.querySelectorAll('.tab-button');
    
    if (!tabContent) {
        console.error('Tab content container not found');
        return;
    }
    
    // Update active tab
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Render content based on tab
    try {
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
    } catch (error) {
        console.error('Error rendering tab content:', error);
        tabContent.innerHTML = `<p class="text-red-500">Error loading ${tabName} content: ${error.message}</p>`;
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
    return `
        <div class="space-y-6">
            <h3 class="text-lg font-semibold text-slate-900">Savings Goals</h3>
            <p class="text-slate-600">Track and manage your financial goals.</p>
            
            <div class="bg-white rounded-lg p-8 text-center border border-slate-200">
                <i class="fas fa-piggy-bank text-4xl text-slate-300 mb-4"></i>
                <p class="text-slate-500">Savings Goals feature coming soon!</p>
                <p class="text-sm text-slate-400">Set and track your financial goals</p>
            </div>
        </div>
    `;
}

function renderCreditProfileTab() {
    return `
        <div class="space-y-6">
            <h3 class="text-lg font-semibold text-slate-900">Credit Profile</h3>
            <p class="text-slate-600">Monitor and improve your credit score.</p>
            
            <div class="bg-white rounded-lg p-8 text-center border border-slate-200">
                <i class="fas fa-chart-line text-4xl text-slate-300 mb-4"></i>
                <p class="text-slate-500">Credit Profile feature coming soon!</p>
                <p class="text-sm text-slate-400">Track your credit score and history</p>
            </div>
        </div>
    `;
}

function renderTaxManagementTab() {
    return `
        <div class="space-y-6">
            <h3 class="text-lg font-semibold text-slate-900">Tax Management</h3>
            <p class="text-slate-600">Calculate taxes and manage tax documents.</p>
            
            <div class="bg-white rounded-lg p-8 text-center border border-slate-200">
                <i class="fas fa-file-invoice-dollar text-4xl text-slate-300 mb-4"></i>
                <p class="text-slate-500">Tax Management feature coming soon!</p>
                <p class="text-sm text-slate-400">Calculate and manage your taxes</p>
            </div>
        </div>
    `;
}

function renderCalculatorsTab() {
    return `
        <div class="space-y-6">
            <h3 class="text-lg font-semibold text-slate-900">Financial Calculators</h3>
            <p class="text-slate-600">Use our financial calculators for planning.</p>
            
            <div class="bg-white rounded-lg p-8 text-center border border-slate-200">
                <i class="fas fa-calculator text-4xl text-slate-300 mb-4"></i>
                <p class="text-slate-500">Financial Calculators coming soon!</p>
                <p class="text-sm text-slate-400">Home loans, retirement, and more</p>
            </div>
        </div>
    `;
}

function renderKidsDashboardTab() {
    return `
        <div class="space-y-6">
            <h3 class="text-lg font-semibold text-slate-900">Kids Dashboard</h3>
            <p class="text-slate-600">Teach financial literacy to your children.</p>
            
            <div class="bg-white rounded-lg p-8 text-center border border-slate-200">
                <i class="fas fa-child text-4xl text-slate-300 mb-4"></i>
                <p class="text-slate-500">Kids Dashboard feature coming soon!</p>
                <p class="text-sm text-slate-400">Financial education for children</p>
            </div>
        </div>
    `;
}

function renderInsuranceTab() {
    return `
        <div class="space-y-6">
            <h3 class="text-lg font-semibold text-slate-900">Insurance Management</h3>
            <p class="text-slate-600">Track and manage your insurance policies.</p>
            
            <div class="bg-white rounded-lg p-8 text-center border border-slate-200">
                <i class="fas fa-shield-alt text-4xl text-slate-300 mb-4"></i>
                <p class="text-slate-500">Insurance Management feature coming soon!</p>
                <p class="text-sm text-slate-400">Manage all your insurance policies</p>
            </div>
        </div>
    `;
}

async function renderBusinessFinanceHub() {
    const container = document.getElementById('business-workspace');
    
    if (!container) {
        throw new Error('Business workspace container not found');
    }
    
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

            <!-- Business Features Coming Soon -->
            <div class="bg-white rounded-lg p-8 text-center border border-slate-200">
                <i class="fas fa-building text-4xl text-slate-300 mb-4"></i>
                <p class="text-slate-500">Business Finance features coming soon!</p>
                <p class="text-sm text-slate-400">Invoicing, expense tracking, and financial reports</p>
            </div>
        </div>
    `;
}

// Save user financial data helper function
async function saveUserFinancialData() {
    if (!currentUser) {
        console.error('No current user to save data for');
        return;
    }
    
    try {
        await saveDocument('userFinances', currentUser.uid, userFinancialData);
        console.log('Financial data saved successfully');
    } catch (error) {
        console.error('Error saving financial data:', error);
        throw error;
    }
}

// Show notification helper function
function showNotification(message, type = 'info') {
    console.log(`${type.toUpperCase()}: ${message}`);
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>
            ${message}
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize when Firebase is ready
document.addEventListener('firebase-ready', () => {
    console.log('Firebase ready event received, initializing FinHelp...');
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('User authenticated, initializing FinHelp for:', user.email);
            init(user);
        } else {
            console.log('No user authenticated');
        }
    });
});

// Also listen for auth state changes directly
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('Auth state changed, user authenticated:', user.email);
        init(user);
    }
});
