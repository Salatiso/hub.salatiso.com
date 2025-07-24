/* ================================================================================= */
/* FILE: assets/js/modules/finhelp.js (CONTROLLER - CORRECTED)                     */
/* PURPOSE: Loads and switches between the Personal and Business finance modules.    */
/* FIX: Ensures modules load correctly and handles potential errors gracefully.      */
/* ================================================================================= */
import { auth } from '../firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

let personalFinanceModule;
let businessFinanceModule;
let isPersonalModuleLoaded = false;
let isBusinessModuleLoaded = false;
let currentUser = null;

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

    // Load the default module
    loadPersonalModule();
}

async function loadPersonalModule() {
    if (isPersonalModuleLoaded) return;
    try {
        personalFinanceModule = await import('./finhelp-personal.js');
        personalFinanceModule.init(currentUser);
        isPersonalModuleLoaded = true;
    } catch (error) {
        console.error("Failed to load personal finance module:", error);
        document.getElementById('personal-workspace').innerHTML = `<p class="text-red-500 text-center">Error loading personal finance tools.</p>`;
    }
}

async function loadBusinessModule() {
    if (isBusinessModuleLoaded) return;
    try {
        businessFinanceModule = await import('./finhelp-business.js');
        // The business module will create its own HTML inside the business-workspace div
        businessFinanceModule.init(currentUser);
        isBusinessModuleLoaded = true;
    } catch (error) {
        console.error("Failed to load business finance module:", error);
        document.getElementById('business-workspace').innerHTML = `<p class="text-red-500 text-center">Error loading business finance tools.</p>`;
    }
}

// Initialize the FinHelp when Firebase is ready
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

async function renderSavingsGoalsTab(container) {
    const savingsGoals = userFinancialData.personal.savingsGoals || [];
    
    container.innerHTML = `
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

            <!-- Goal Tracking Intelligence -->
            <div class="bg-yellow-50 rounded-lg p-6">
                <h3 class="text-lg font-semibold text-yellow-900 mb-4">
                    <i class="fas fa-chart-line mr-2"></i>Goal Progress Intelligence
                </h3>
                ${renderGoalAdvice(savingsGoals)}
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
                            <input type="text" id="goal-name" class="input" placeholder="e.g., Emergency Fund, New Car, House Deposit" required>
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
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Priority Level</label>
                            <select id="priority-level" class="input">
                                <option value="high">High Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="low">Low Priority</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Goal Category</label>
                            <select id="goal-category" class="input">
                                <option value="emergency">Emergency Fund</option>
                                <option value="house">House/Property</option>
                                <option value="car">Vehicle</option>
                                <option value="education">Education</option>
                                <option value="retirement">Retirement</option>
                                <option value="vacation">Vacation</option>
                                <option value="investment">Investment</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea id="goal-description" rows="3" class="input" placeholder="Describe your goal and why it's important..."></textarea>
                    </div>
                    
                    <div class="flex items-center">
                        <input type="checkbox" id="auto-save" class="mr-2">
                        <label for="auto-save" class="text-sm text-slate-700">Enable automatic savings tracking from budget</label>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="closeAddGoalModal()" class="btn-secondary">Cancel</button>
                        <button type="submit" class="btn-primary">Create Goal</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Setup form submission
    document.getElementById('goal-form').addEventListener('submit', handleAddGoal);
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
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
        const monthlyNeeded = daysLeft > 0 ? (goal.targetAmount - goal.currentAmount) / (daysLeft / 30) : 0;
        
        return `
            <div class="bg-white rounded-lg p-6 border border-slate-200">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h4 class="text-lg font-semibold text-slate-900">${goal.name}</h4>
                        <p class="text-sm text-slate-600">${goal.category} • ${goal.priority} priority</p>
                    </div>
                    <div class="text-right">
                        <p class="text-lg font-bold text-slate-900">R${goal.currentAmount.toLocaleString()} / R${goal.targetAmount.toLocaleString()}</p>
                        <p class="text-sm text-slate-600">${daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}</p>
                    </div>
                </div>
                
                <!-- Progress Bar -->
                <div class="mb-4">
                    <div class="flex justify-between text-sm text-slate-600 mb-1">
                        <span>Progress</span>
                        <span>${progress.toFixed(1)}%</span>
                    </div>
                    <div class="w-full bg-slate-200 rounded-full h-2">
                        <div class="bg-green-500 h-2 rounded-full" style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                </div>
                
                <!-- Goal Insights -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div class="bg-blue-50 p-3 rounded-lg">
                        <p class="text-blue-600 font-medium">Monthly Needed</p>
                        <p class="text-blue-900 font-bold">R${monthlyNeeded.toLocaleString()}</p>
                    </div>
                    <div class="bg-green-50 p-3 rounded-lg">
                        <p class="text-green-600 font-medium">Current Contribution</p>
                        <p class="text-green-900 font-bold">R${goal.monthlyContribution || 0}</p>
                    </div>
                    <div class="bg-purple-50 p-3 rounded-lg">
                        <p class="text-purple-600 font-medium">Target Date</p>
                        <p class="text-purple-900 font-bold">${new Date(goal.targetDate).toLocaleDateString()}</p>
                    </div>
                </div>
                
                <div class="flex justify-end space-x-2 mt-4">
                    <button onclick="updateGoalProgress('${goal.id}')" class="btn-secondary text-sm">
                        <i class="fas fa-plus mr-1"></i>Add Progress
                    </button>
                    <button onclick="editGoal('${goal.id}')" class="btn-secondary text-sm">
                        <i class="fas fa-edit mr-1"></i>Edit
                    </button>
                    <button onclick="deleteGoal('${goal.id}')" class="btn-secondary text-sm text-red-600">
                        <i class="fas fa-trash mr-1"></i>Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function renderGoalAdvice(goals) {
    const advice = [];
    
    // Check for goals behind schedule
    const behindSchedule = goals.filter(goal => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        const timeElapsed = (new Date() - new Date(goal.startDate)) / (new Date(goal.targetDate) - new Date(goal.startDate)) * 100;
        return progress < timeElapsed - 10; // 10% tolerance
    });
    
    if (behindSchedule.length > 0) {
        advice.push(`
            <div class="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-4">
                <h4 class="font-medium text-yellow-800 mb-2">
                    <i class="fas fa-exclamation-triangle mr-2"></i>Goals Behind Schedule
                </h4>
                <p class="text-yellow-700">You have ${behindSchedule.length} goals behind schedule. Consider increasing monthly contributions or adjusting timelines.</p>
            </div>
        `);
    }
    
    // Check for conflicting spending
    const totalMonthlyGoals = goals.reduce((sum, goal) => sum + (goal.monthlyContribution || 0), 0);
    const monthlyIncome = userFinancialData.personal.income.reduce((sum, item) => sum + (item.monthlyAmount || 0), 0);
    const monthlyExpenses = userFinancialData.personal.expenses.reduce((sum, item) => sum + (item.monthlyAmount || 0), 0);
    const availableForSavings = monthlyIncome - monthlyExpenses;
    
    if (totalMonthlyGoals > availableForSavings) {
        advice.push(`
            <div class="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
                <h4 class="font-medium text-red-800 mb-2">
                    <i class="fas fa-exclamation-circle mr-2"></i>Budget Conflict
                </h4>
                <p class="text-red-700">Your savings goals require R${totalMonthlyGoals.toLocaleString()} monthly, but you only have R${availableForSavings.toLocaleString()} available. Review your budget or adjust goals.</p>
            </div>
        `);
    }
    
    if (advice.length === 0) {
        advice.push(`
            <div class="bg-green-100 border border-green-300 rounded-lg p-4">
                <h4 class="font-medium text-green-800 mb-2">
                    <i class="fas fa-check-circle mr-2"></i>On Track
                </h4>
                <p class="text-green-700">Your savings goals are well-aligned with your budget. Keep up the great work!</p>
            </div>
        `);
    }
    
    return advice.join('');
}

async function renderTaxManagementTab(container) {
    const taxHistory = userFinancialData.personal.taxHistory || [];
    const currentTaxYear = userFinancialData.settings.taxYear;
    
    container.innerHTML = `
        <div class="space-y-6">
            <!-- Tax Overview -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100 text-sm">Annual Income</p>
                            <p class="text-2xl font-bold">R${calculateAnnualIncome().toLocaleString()}</p>
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

            <!-- Tax Actions -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white rounded-lg p-6 border border-slate-200">
                    <h3 class="text-lg font-semibold text-slate-900 mb-4">
                        <i class="fas fa-file-export mr-2 text-indigo-600"></i>SARS eFiling Ready
                    </h3>
                    <p class="text-slate-600 mb-4">Generate tax-ready documents for easy eFiling submission</p>
                    <button onclick="generateTaxDocuments()" class="btn-primary w-full">
                        <i class="fas fa-download mr-2"></i>Generate Tax Documents
                    </button>
                </div>
                
                <div class="bg-white rounded-lg p-6 border border-slate-200">
                    <h3 class="text-lg font-semibold text-slate-900 mb-4">
                        <i class="fas fa-calculator mr-2 text-green-600"></i>Tax Calculator
                    </h3>
                    <p class="text-slate-600 mb-4">Calculate your tax liability and potential refunds</p>
                    <button onclick="openTaxCalculator()" class="btn-primary w-full">
                        <i class="fas fa-calculator mr-2"></i>Calculate Tax
                    </button>
                </div>
                
                <div class="bg-white rounded-lg p-6 border border-slate-200">
                    <h3 class="text-lg font-semibold text-slate-900 mb-4">
                        <i class="fas fa-lightbulb mr-2 text-yellow-600"></i>Tax Optimization
                    </h3>
                    <p class="text-slate-600 mb-4">Discover ways to reduce your tax liability legally</p>
                    <button onclick="showTaxOptimization()" class="btn-primary w-full">
                        <i class="fas fa-magic mr-2"></i>Optimize Tax
                    </button>
                </div>
            </div>

            <!-- Tax History -->
            <div class="bg-white rounded-lg border border-slate-200">
                <div class="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-slate-900">Tax History</h3>
                    <button onclick="addTaxYear()" class="btn-secondary">
                        <i class="fas fa-plus mr-2"></i>Add Tax Year
                    </button>
                </div>
                <div class="p-6">
                    ${renderTaxHistory(taxHistory)}
                </div>
            </div>

            <!-- Tax Impact Simulator -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <h3 class="text-lg font-semibold text-slate-900 mb-4">
                    <i class="fas fa-globe-africa mr-2 text-blue-600"></i>Your Tax Impact on South Africa
                </h3>
                ${renderTaxImpactSimulator()}
            </div>
        </div>

        <!-- Tax Calculator Modal -->
        <div id="tax-calculator-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-90vh overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold">Tax Calculator</h3>
                    <button onclick="closeTaxCalculator()" class="text-slate-400 hover:text-slate-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Input Section -->
                    <div>
                        <h4 class="font-semibold text-slate-900 mb-4">Income Information</h4>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Annual Salary (R)</label>
                                <input type="number" id="annual-salary" class="input" value="${calculateAnnualIncome()}">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Other Income (R)</label>
                                <input type="number" id="other-income" class="input" value="0">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Medical Aid Contributions (R)</label>
                                <input type="number" id="medical-aid" class="input" value="0">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Retirement Fund Contributions (R)</label>
                                <input type="number" id="retirement-contributions" class="input" value="0">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Tax Year</label>
                                <select id="tax-year-select" class="input">
                                    <option value="2024">2024</option>
                                    <option value="2023">2023</option>
                                    <option value="2022">2022</option>
                                    <option value="2021">2021</option>
                                </select>
                            </div>
                            
                            <button onclick="calculateTax()" class="btn-primary w-full">
                                <i class="fas fa-calculator mr-2"></i>Calculate Tax
                            </button>
                        </div>
                    </div>
                    
                    <!-- Results Section -->
                    <div>
                        <h4 class="font-semibold text-slate-900 mb-4">Tax Calculation Results</h4>
                        <div id="tax-results" class="space-y-4">
                            <p class="text-slate-500">Enter your income information and click calculate to see results</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function calculateAnnualIncome() {
    const monthlyIncome = userFinancialData.personal.income.reduce((sum, item) => sum + (item.monthlyAmount || 0), 0);
    return monthlyIncome * 12;
}

function calculateEstimatedTax() {
    const annualIncome = calculateAnnualIncome();
    return calculateTaxLiability(annualIncome, 2024);
}

function getCurrentTaxBracket() {
    const annualIncome = calculateAnnualIncome();
    const brackets = getTaxBrackets(2024);
    
    for (let bracket of brackets.reverse()) {
        if (annualIncome > bracket.min) {
            return bracket.rate;
        }
    }
    return 18;
}

function calculateTaxEfficiency() {
    const grossIncome = calculateAnnualIncome();
    const estimatedTax = calculateEstimatedTax();
    return Math.round((1 - (estimatedTax / grossIncome)) * 100);
}

function getTaxBrackets(year) {
    // South African tax brackets for 2024
    const brackets = {
        2024: [
            { min: 0, max: 237100, rate: 18, rebate: 17235 },
            { min: 237100, max: 370500, rate: 26, rebate: 17235 },
            { min: 370500, max: 512800, rate: 31, rebate: 17235 },
            { min: 512800, max: 673000, rate: 36, rebate: 17235 },
            { min: 673000, max: 857900, rate: 39, rebate: 17235 },
            { min: 857900, max: 1817000, rate: 41, rebate: 17235 },
            { min: 1817000, max: Infinity, rate: 45, rebate: 17235 }
        ],
        2023: [
            { min: 0, max: 226000, rate: 18, rebate: 16425 },
            { min: 226000, max: 353100, rate: 26, rebate: 16425 },
            { min: 353100, max: 488700, rate: 31, rebate: 16425 },
            { min: 488700, max: 641400, rate: 36, rebate: 16425 },
            { min: 641400, max: 817600, rate: 39, rebate: 16425 },
            { min: 817600, max: 1731600, rate: 41, rebate: 16425 },
            { min: 1731600, max: Infinity, rate: 45, rebate: 16425 }
        ]
    };
    
    return brackets[year] || brackets[2024];
}

function calculateTaxLiability(income, year) {
    const brackets = getTaxBrackets(year);
    let tax = 0;
    let remainingIncome = income;
    
    for (let bracket of brackets) {
        if (remainingIncome <= 0) break;
        
        const taxableInThisBracket = Math.min(remainingIncome, bracket.max - bracket.min);
        tax += (taxableInThisBracket * bracket.rate) / 100;
        remainingIncome -= taxableInThisBracket;
    }
    
    // Apply rebate
    tax -= brackets[0].rebate;
    
    return Math.max(0, tax);
}

function renderTaxImpactSimulator() {
    const annualTax = calculateEstimatedTax();
    const lifetimeTax = annualTax * 40; // Assume 40 year working career
    
    // Simulated government budget allocations (approximate SA budget percentages)
    const allocations = {
        health: 0.14,
        education: 0.20,
        socialServices: 0.34,
        defense: 0.04,
        infrastructure: 0.08,
        other: 0.20
    };
    
    return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 class="font-semibold text-slate-900 mb-4">Your Tax Contribution Impact</h4>
                <div class="space-y-3">
                    <div class="bg-white rounded-lg p-4">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-medium text-green-600">Health Services</span>
                            <span class="font-bold">R${(annualTax * allocations.health).toLocaleString()}/year</span>
                        </div>
                        <div class="text-xs text-slate-500">Lifetime: R${(lifetimeTax * allocations.health).toLocaleString()}</div>
                    </div>
                    
                    <div class="bg-white rounded-lg p-4">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-medium text-blue-600">Education</span>
                            <span class="font-bold">R${(annualTax * allocations.education).toLocaleString()}/year</span>
                        </div>
                        <div class="text-xs text-slate-500">Lifetime: R${(lifetimeTax * allocations.education).toLocaleString()}</div>
                    </div>
                    
                    <div class="bg-white rounded-lg p-4">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-medium text-purple-600">Social Services</span>
                            <span class="font-bold">R${(annualTax * allocations.socialServices).toLocaleString()}/year</span>
                        </div>
                        <div class="text-xs text-slate-500">Lifetime: R${(lifetimeTax * allocations.socialServices).toLocaleString()}</div>
                    </div>
                </div>
            </div>
            
            <div>
                <h4 class="font-semibold text-slate-900 mb-4">Economic Impact Simulator</h4>
                <div class="bg-white rounded-lg p-4">
                    <p class="text-sm text-slate-600 mb-3">Explore how national debt affects your taxes:</p>
                    <div class="space-y-2">
                        <div class="flex justify-between text-sm">
                            <span>Current tax rate:</span>
                            <span class="font-semibold">${getCurrentTaxBracket()}%</span>
                        </div>
                        <div class="flex justify-between text-sm text-orange-600">
                            <span>If debt increases 10%:</span>
                            <span class="font-semibold">+2% tax burden</span>
                        </div>
                        <div class="flex justify-between text-sm text-red-600">
                            <span>IMF loan scenario:</span>
                            <span class="font-semibold">+5% over 10 years</span>
                        </div>
                    </div>
                    <button onclick="showDebtImpactDetail()" class="btn-secondary w-full mt-3 text-sm">
                        <i class="fas fa-chart-line mr-2"></i>See Detailed Impact
                    </button>
                </div>
            </div>
        </div>
    `;
}

async function renderCalculatorsTab(container) {
    container.innerHTML = `
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
                
                <!-- Debt Consolidation -->
                <div class="bg-white rounded-lg p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                    <div class="text-center mb-4">
                        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-credit-card text-2xl text-red-600"></i>
                        </div>
                        <h4 class="text-lg font-semibold text-slate-900">Debt Consolidation</h4>
                        <p class="text-sm text-slate-600">Optimize your debt repayment</p>
                    </div>
                    <button onclick="openDebtCalculator()" class="btn-primary w-full">
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
                
                <!-- Emergency Fund -->
                <div class="bg-white rounded-lg p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                    <div class="text-center mb-4">
                        <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-shield-alt text-2xl text-yellow-600"></i>
                        </div>
                        <h4 class="text-lg font-semibold text-slate-900">Emergency Fund</h4>
                        <p class="text-sm text-slate-600">Calculate your emergency fund needs</p>
                    </div>
                    <button onclick="openEmergencyFundCalculator()" class="btn-primary w-full">
                        Calculate Now
                    </button>
                </div>
                
                <!-- Insurance Needs -->
                <div class="bg-white rounded-lg p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                    <div class="text-center mb-4">
                        <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-umbrella text-2xl text-indigo-600"></i>
                        </div>
                        <h4 class="text-lg font-semibold text-slate-900">Insurance Needs</h4>
                        <p class="text-sm text-slate-600">Calculate your insurance requirements</p>
                    </div>
                    <button onclick="openInsuranceCalculator()" class="btn-primary w-full">
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
                        
                        <div class="flex items-center mb-4">
                            <input type="checkbox" id="use-actual-data" class="mr-2">
                            <label for="use-actual-data" class="text-sm text-slate-700">Use my actual financial data</label>
                        </div>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Monthly Gross Income (R)</label>
                                <input type="number" id="monthly-income" class="input" placeholder="Enter monthly income">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Monthly Expenses (R)</label>
                                <input type="number" id="monthly-expenses" class="input" placeholder="Enter monthly expenses">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Existing Debt Payments (R)</label>
                                <input type="number" id="existing-debt" class="input" placeholder="Car loan, credit cards, etc.">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Available Deposit (R)</label>
                                <input type="number" id="deposit-amount" class="input" placeholder="Enter deposit amount">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Interest Rate (%)</label>
                                <input type="number" id="interest-rate" class="input" value="11.5" step="0.1">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Loan Term (Years)</label>
                                <select id="loan-term" class="input">
                                    <option value="20">20 years</option>
                                    <option value="25" selected>25 years</option>
                                    <option value="30">30 years</option>
                                </select>
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

    // Setup actual data toggle
    document.getElementById('use-actual-data').addEventListener('change', (e) => {
        if (e.target.checked) {
            populateActualFinancialData();
        }
    });
}

function populateActualFinancialData() {
    const monthlyIncome = userFinancialData.personal.income.reduce((sum, item) => sum + (item.monthlyAmount || 0), 0);
    const monthlyExpenses = userFinancialData.personal.expenses.reduce((sum, item) => sum + (item.monthlyAmount || 0), 0);
    const existingDebt = userFinancialData.personal.liabilities.reduce((sum, item) => sum + (item.monthlyPayment || 0), 0);
    const availableDeposit = userFinancialData.personal.assets.filter(asset => asset.liquid).reduce((sum, item) => sum + (item.currentValue || 0), 0);
    
    document.getElementById('monthly-income').value = monthlyIncome;
    document.getElementById('monthly-expenses').value = monthlyExpenses;
    document.getElementById('existing-debt').value = existingDebt;
    document.getElementById('deposit-amount').value = availableDeposit;
    
    // Make fields readonly when using actual data
    document.getElementById('monthly-income').readOnly = true;
    document.getElementById('monthly-expenses').readOnly = true;
    document.getElementById('existing-debt').readOnly = true;
    document.getElementById('deposit-amount').readOnly = true;
}

async function renderCreditProfileTab(container) {
    const creditProfile = userFinancialData.personal.creditProfile || {};
    
    container.innerHTML = `
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
                <p class="text-slate-600 mb-6">Calculate your estimated credit score based on TransUnion's South African scoring model</p>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Input Section -->
                    <div class="bg-slate-50 rounded-lg p-4">
                        <h4 class="font-semibold text-slate-900 mb-4">Credit Information</h4>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Payment History (35%)</label>
                                <select id="payment-history" class="input">
                                    <option value="100">Perfect - Never missed a payment</option>
                                    <option value="90">Excellent - 1-2 late payments ever</option>
                                    <option value="80">Good - Occasional late payments</option>
                                    <option value="70">Fair - Several late payments</option>
                                    <option value="50">Poor - Many missed payments</option>
                                    <option value="30">Very Poor - Defaults/judgments</option>
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
                                    <option value="40">Less than 1 year</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Number of Credit Accounts</label>
                                <input type="number" id="credit-accounts" class="input" min="0" max="20">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Recent Credit Inquiries (last 6 months)</label>
                                <input type="number" id="credit-inquiries" class="input" min="0" max="10">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Monthly Income (R)</label>
                                <input type="number" id="monthly-income-credit" class="input" placeholder="Gross monthly income">
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
                        
                        <!-- Credit Improvement Tips -->
                        <div class="mt-6 bg-blue-50 rounded-lg p-4">
                            <h5 class="font-semibold text-blue-900 mb-2">Credit Improvement Tips</h5>
                            <ul class="text-sm text-blue-800 space-y-1">
                                <li>• Pay all bills on time</li>
                                <li>• Keep credit utilization below 30%</li>
                                <li>• Don't close old credit accounts</li>
                                <li>• Limit new credit applications</li>
                                <li>• Monitor your credit report regularly</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Credit Monitoring -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-white rounded-lg p-6 border border-slate-200">
                    <h3 class="text-lg font-semibold text-slate-900 mb-4">Credit Monitoring</h3>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div>
                                <p class="font-medium text-green-900">TransUnion Report</p>
                                <p class="text-sm text-green-600">Last checked: ${creditProfile.lastTransUnionCheck || 'Never'}</p>
                            </div>
                            <button onclick="checkTransUnion()" class="btn-secondary text-sm">Check Now</button>
                        </div>
                        
                        <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div>
                                <p class="font-medium text-blue-900">Experian Report</p>
                                <p class="text-sm text-blue-600">Last checked: ${creditProfile.lastExperianCheck || 'Never'}</p>
                            </div>
                            <button onclick="checkExperian()" class="btn-secondary text-sm">Check Now</button>
                        </div>
                        
                        <div class="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <div>
                                <p class="font-medium text-purple-900">Compuscan Report</p>
                                <p class="text-sm text-purple-600">Last checked: ${creditProfile.lastCompuscanCheck || 'Never'}</p>
                            </div>
                            <button onclick="checkCompuscan()" class="btn-secondary text-sm">Check Now</button>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg p-6 border border-slate-200">
                    <h3 class="text-lg font-semibold text-slate-900 mb-4">Credit Alerts</h3>
                    <div class="space-y-3">
                        ${renderCreditAlerts(creditProfile)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getCreditRating(score) {
    if (!score) return 'Unknown';
    if (score >= 767) return 'Excellent';
    if (score >= 681) return 'Good';
    if (score >= 614) return 'Fair';
    if (score >= 487) return 'Poor';
    return 'Very Poor';
}

function calculateCreditUtilization() {
    const liabilities = userFinancialData.personal.liabilities || [];
    const creditCards = liabilities.filter(l => l.type === 'credit_card');
    
    if (creditCards.length === 0) return 0;
    
    const totalUsed = creditCards.reduce((sum, card) => sum + (card.currentBalance || 0), 0);
    const totalLimit = creditCards.reduce((sum, card) => sum + (card.creditLimit || 0), 0);
    
    return totalLimit > 0 ? Math.round((totalUsed / totalLimit) * 100) : 0;
}

function calculateCreditScore() {
    const paymentHistory = parseInt(document.getElementById('payment-history').value);
    const totalLimit = parseFloat(document.getElementById('total-credit-limit').value) || 0;
    const totalUsed = parseFloat(document.getElementById('total-credit-used').value) || 0;
    const historyLength = parseInt(document.getElementById('credit-history-length').value);
    const accounts = parseInt(document.getElementById('credit-accounts').value) || 0;
    const inquiries = parseInt(document.getElementById('credit-inquiries').value) || 0;
    const income = parseFloat(document.getElementById('monthly-income-credit').value) || 0;
    
    // South African credit scoring (300-850 scale similar to TransUnion)
    let score = 300;
    
    // Payment History (35% weight)
    score += (paymentHistory / 100) * 192.5; // Max 192.5 points
    
    // Credit Utilization (30% weight)
    const utilization = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0;
    let utilizationScore = 0;
    if (utilization === 0) utilizationScore = 165; // Perfect score
    else if (utilization <= 10) utilizationScore = 150;
    else if (utilization <= 30) utilizationScore = 120;
    else if (utilization <= 50) utilizationScore = 90;
    else if (utilization <= 75) utilizationScore = 60;
    else utilizationScore = 30;
    score += utilizationScore;
    
    // Credit History Length (15% weight)
    score += (historyLength / 100) * 82.5; // Max 82.5 points
    
    // Credit Mix and New Credit (10% each)
    const mixScore = Math.min(accounts * 8, 55); // Up to 55 points for good mix
    score += mixScore;
    
    const inquiryPenalty = Math.min(inquiries * 5, 25); // Penalty for inquiries
    score += (55 - inquiryPenalty);
    
    // Income factor (bonus points)
    if (income > 50000) score += 15;
    else if (income > 25000) score += 10;
    else if (income > 15000) score += 5;
    
    score = Math.round(Math.max(300, Math.min(850, score)));
    
    const rating = getCreditRating(score);
    const resultContainer = document.getElementById('credit-score-results');
    
    resultContainer.innerHTML = `
        <div class="text-center">
            <div class="w-32 h-32 mx-auto mb-4 relative">
                <div class="w-32 h-32 rounded-full border-8 border-slate-200 relative">
                    <div class="absolute inset-0 rounded-full border-8 border-transparent ${getScoreColor(score)}" 
                         style="border-right-color: transparent; border-bottom-color: transparent; transform: rotate(${(score - 300) / 550 * 180}deg);"></div>
                    <div class="absolute inset-4 rounded-full bg-white flex items-center justify-center">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-slate-900">${score}</div>
                            <div class="text-xs text-slate-500">${rating}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="space-y-3">
            <div class="bg-slate-50 rounded-lg p-3">
                <div class="flex justify-between text-sm">
                    <span>Payment History (35%)</span>
                    <span class="font-semibold">${Math.round((paymentHistory / 100) * 35)}%</span>
                </div>
            </div>
            
            <div class="bg-slate-50 rounded-lg p-3">
                <div class="flex justify-between text-sm">
                    <span>Credit Utilization (30%)</span>
                    <span class="font-semibold">${utilization.toFixed(1)}%</span>
                </div>
            </div>
            
            <div class="bg-slate-50 rounded-lg p-3">
                <div class="flex justify-between text-sm">
                    <span>Credit History Length</span>
                    <span class="font-semibold">${getHistoryLengthText(historyLength)}</span>
                </div>
            </div>
        </div>
        
        <div class="mt-4 p-4 rounded-lg ${score >= 650 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}">
            <p class="text-sm font-medium ${score >= 650 ? 'text-green-800' : 'text-yellow-800'}">
                ${score >= 650 ? 
                    'Good credit score! You should qualify for competitive interest rates.' : 
                    'Your credit score could be improved. Focus on payment history and reducing credit utilization.'}
            </p>
        </div>
    `;
    
    // Save the calculated score
    if (!userFinancialData.personal.creditProfile) {
        userFinancialData.personal.creditProfile = {};
    }
    userFinancialData.personal.creditProfile.score = score;
    userFinancialData.personal.creditProfile.lastCalculated = new Date().toISOString();
    saveUserFinancialData();
}

function getScoreColor(score) {
    if (score >= 767) return 'border-green-500';
    if (score >= 681) return 'border-blue-500';
    if (score >= 614) return 'border-yellow-500';
    if (score >= 487) return 'border-orange-500';
    return 'border-red-500';
}

function getHistoryLengthText(value) {
    const options = {
        100: '10+ years',
        90: '7-10 years',
        80: '5-7 years',
        70: '3-5 years',
        60: '1-3 years',
        40: '< 1 year'
    };
    return options[value] || 'Unknown';
}

function renderCreditAlerts(creditProfile) {
    const alerts = creditProfile.alerts || [];
    
    if (alerts.length === 0) {
        return `
            <div class="text-center py-4">
                <i class="fas fa-shield-check text-2xl text-green-500 mb-2"></i>
                <p class="text-sm text-slate-500">No credit alerts</p>
            </div>
        `;
    }
    
    return alerts.map(alert => `
        <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div>
                <p class="font-medium text-red-900">${alert.title}</p>
                <p class="text-sm text-red-600">${alert.message}</p>
            </div>
            <button onclick="dismissAlert('${alert.id}')" class="text-red-400 hover:text-red-600">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

async function renderKidsDashboardTab(container) {
    const kidsData = userFinancialData.personal.kidsFinance || [];
    
    container.innerHTML = `
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

            <!-- Family Finance Goals -->
            <div class="bg-white rounded-lg p-6 border border-slate-200">
                <h3 class="text-lg font-semibold text-slate-900 mb-4">
                    <i class="fas fa-family mr-2 text-green-600"></i>
                    Family Financial Goals
                </h3>
                ${renderFamilyGoals()}
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

    // Setup form submission
    document.getElementById('child-form').addEventListener('submit', handleAddChild);
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

function getChildEmoji(age) {
    if (age <= 4) return '👶';
    if (age <= 7) return '🧒';
    if (age <= 10) return '👦';
    return '👧';
}

function calculateChildProgress(child) {
    if (!child.goalAmount || child.goalAmount === 0) return 0;
    return Math.min(100, ((child.currentSavings || 0) / child.goalAmount) * 100);
}

function renderFamilyGoals() {
    const familyGoals = [
        { name: 'Family Vacation', target: 25000, current: 8500, icon: '✈️' },
        { name: 'Kids Education Fund', target: 100000, current: 35000, icon: '🎓' },
        { name: 'New Family Car', target: 300000, current: 45000, icon: '🚗' }
    ];

    return `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${familyGoals.map(goal => `
                <div class="bg-slate-50 rounded-lg p-4">
                    <div class="flex items-center mb-2">
                        <span class="text-2xl mr-2">${goal.icon}</span>
                        <h5 class="font-semibold text-slate-900">${goal.name}</h5>
                    </div>
                    <div class="mb-2">
                        <div class="flex justify-between text-sm text-slate-600 mb-1">
                            <span>Progress</span>
                            <span>R${goal.current.toLocaleString()} / R${goal.target.toLocaleString()}</span>
                        </div>
                        <div class="w-full bg-slate-200 rounded-full h-2">
                            <div class="bg-indigo-500 h-2 rounded-full" style="width: ${(goal.current / goal.target) * 100}%"></div>
                        </div>
                    </div>
                    <p class="text-xs text-slate-500">${Math.round((goal.current / goal.target) * 100)}% complete</p>
                </div>
            `).join('')}
        </div>
    `;
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
                    <button onclick="openInvoiceManager()" class="btn-primary w-full">
                        <i class="fas fa-plus mr-2"></i>Create Invoice
                    </button>
                </div>
                
                <div class="bg-white rounded-lg p-6 border border-slate-200">
                    <h3 class="text-lg font-semibold text-slate-900 mb-4">
                        <i class="fas fa-receipt mr-2 text-green-600"></i>Expense Tracking
                    </h3>
                    <p class="text-slate-600 mb-4">Track business expenses for tax deductions</p>
                    <button onclick="openExpenseTracker()" class="btn-primary w-full">
                        <i class="fas fa-camera mr-2"></i>Scan Receipt
                    </button>
                </div>
                
                <div class="bg-white rounded-lg p-6 border border-slate-200">
                    <h3 class="text-lg font-semibold text-slate-900 mb-4">
                        <i class="fas fa-chart-bar mr-2 text-yellow-600"></i>Financial Reports
                    </h3>
                    <p class="text-slate-600 mb-4">Generate P&L, balance sheets, and more</p>
                    <button onclick="generateReports()" class="btn-primary w-full">
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
                            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-file-invoice text-green-600"></i>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm font-medium text-slate-900">Invoice #001 Paid</p>
                                <p class="text-xs text-slate-500">Client ABC Ltd - 2 days ago</p>
                            </div>
                        </div>
                        <span class="text-green-600 font-semibold">+R5,500</span>
                    </div>
                    
                    <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-receipt text-red-600"></i>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm font-medium text-slate-900">Office Supplies</p>
                                <p class="text-xs text-slate-500">Staples - 3 days ago</p>
                            </div>
                        </div>
                        <span class="text-red-600 font-semibold">-R450</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function calculateBusinessRevenue() {
    const businessIncome = userFinancialData.business?.income || [];
    return businessIncome.reduce((sum, item) => sum + (item.monthlyAmount || 0), 0);
}

function calculateBusinessExpenses() {
    const businessExpenses = userFinancialData.business?.expenses || [];
    return businessExpenses.reduce((sum, item) => sum + (item.monthlyAmount || 0), 0);
}

function calculateBusinessTax() {
    const profit = calculateBusinessRevenue() - calculateBusinessExpenses();
    return profit > 0 ? profit * 0.28 : 0; // South African company tax rate
}

// Family/Co-parenting Budget Features
async function renderFamilyBudgetTab(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <!-- Family Budget Overview -->
            <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
                <h2 class="text-2xl font-bold mb-2">Family & Co-Parenting Budget</h2>
                <p class="text-indigo-100">Track shared responsibilities, financial and non-financial contributions</p>
            </div>

            <!-- Contribution Types -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Financial Contributions -->
                <div class="bg-white rounded-lg p-6 border border-slate-200">
                    <h3 class="text-lg font-semibold text-slate-900 mb-4">
                        <i class="fas fa-money-bill-wave mr-2 text-green-600"></i>
                        Financial Contributions
                    </h3>
                    ${renderFinancialContributions()}
                </div>
                
                <!-- Non-Financial Contributions -->
                <div class="bg-white rounded-lg p-6 border border-slate-200">
                    <h3 class="text-lg font-semibold text-slate-900 mb-4">
                        <i class="fas fa-hands-helping mr-2 text-blue-600"></i>
                        Non-Financial Contributions
                    </h3>
                    ${renderNonFinancialContributions()}
                </div>
            </div>

            <!-- Contribution Tracking -->
            <div class="bg-white rounded-lg p-6 border border-slate-200">
                <h3 class="text-lg font-semibold text-slate-900 mb-4">Monthly Contribution Summary</h3>
                ${renderContributionSummary()}
            </div>
        </div>
    `;
}

function renderFinancialContributions() {
    return `
        <div class="space-y-3">
            <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span class="text-sm font-medium">School Fees</span>
                <div class="text-right">
                    <div class="text-lg font-bold text-green-900">R2,500</div>
                    <div class="text-xs text-green-600">You: 60% | Partner: 40%</div>
                </div>
            </div>
            
            <div class="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span class="text-sm font-medium">Medical Expenses</span>
                <div class="text-right">
                    <div class="text-lg font-bold text-blue-900">R800</div>
                    <div class="text-xs text-blue-600">You: 50% | Partner: 50%</div>
                </div>
            </div>
            
            <button onclick="addFinancialContribution()" class="btn-primary w-full text-sm">
                <i class="fas fa-plus mr-2"></i>Add Contribution
            </button>
        </div>
    `;
}

function renderNonFinancialContributions() {
    return `
        <div class="space-y-3">
            <div class="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span class="text-sm font-medium">School Pickup/Drop-off</span>
                <div class="text-right">
                    <div class="text-lg font-bold text-purple-900">20 hrs/month</div>
                    <div class="text-xs text-purple-600">Value: R400</div>
                </div>
            </div>
            
            <div class="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span class="text-sm font-medium">Homework Help</span>
                <div class="text-right">
                    <div class="text-lg font-bold text-yellow-900">15 hrs/month</div>
                    <div class="text-xs text-yellow-600">Value: R750</div>
                </div>
            </div>
            
            <button onclick="addNonFinancialContribution()" class="btn-primary w-full text-sm">
                <i class="fas fa-plus mr-2"></i>Add Contribution
            </button>
        </div>
    `;
}

function renderContributionSummary() {
    return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="text-center">
                <h4 class="font-semibold text-slate-900 mb-4">Your Total Contribution</h4>
                <div class="space-y-2">
                    <div class="bg-green-50 rounded-lg p-4">
                        <div class="text-2xl font-bold text-green-900">R4,150</div>
                        <div class="text-sm text-green-600">Financial (65%)</div>
                    </div>
                    <div class="bg-purple-50 rounded-lg p-4">
                        <div class="text-2xl font-bold text-purple-900">R1,150</div>
                        <div class="text-sm text-purple-600">Non-Financial Value (35%)</div>
                    </div>
                </div>
                <div class="mt-4 p-4 bg-indigo-50 rounded-lg">
                    <div class="text-xl font-bold text-indigo-900">R5,300</div>
                    <div class="text-sm text-indigo-600">Total Monthly Value</div>
                </div>
            </div>
            
            <div class="text-center">
                <h4 class="font-semibold text-slate-900 mb-4">Partner's Total Contribution</h4>
                <div class="space-y-2">
                    <div class="bg-green-50 rounded-lg p-4">
                        <div class="text-2xl font-bold text-green-900">R2,200</div>
                        <div class="text-sm text-green-600">Financial (45%)</div>
                    </div>
                    <div class="bg-purple-50 rounded-lg p-4">
                        <div class="text-2xl font-bold text-purple-900">R2,700</div>
                        <div class="text-sm text-purple-600">Non-Financial Value (55%)</div>
                    </div>
                </div>
                <div class="mt-4 p-4 bg-indigo-50 rounded-lg">
                    <div class="text-xl font-bold text-indigo-900">R4,900</div>
                    <div class="text-sm text-indigo-600">Total Monthly Value</div>
                </div>
            </div>
        </div>
    `;
}

// Global functions for modal and button interactions
window.openAddGoalModal = function() {
    document.getElementById('add-goal-modal').classList.remove('hidden');
};

window.closeAddGoalModal = function() {
    document.getElementById('add-goal-modal').classList.add('hidden');
    document.getElementById('goal-form').reset();
};

window.handleAddGoal = async function(event) {
    event.preventDefault();
    
    const goalData = {
        id: Date.now().toString(),
        name: document.getElementById('goal-name').value,
        targetAmount: parseFloat(document.getElementById('target-amount').value),
        targetDate: document.getElementById('target-date').value,
        currentAmount: parseFloat(document.getElementById('current-amount').value) || 0,
        monthlyContribution: parseFloat(document.getElementById('monthly-contribution').value) || 0,
        priority: document.getElementById('priority-level').value,
        category: document.getElementById('goal-category').value,
        description: document.getElementById('goal-description').value,
        autoSave: document.getElementById('auto-save').checked,
        startDate: new Date().toISOString(),
        status: 'active'
    };
    
    try {
        if (!userFinancialData.personal.savingsGoals) {
            userFinancialData.personal.savingsGoals = [];
        }
        
        userFinancialData.personal.savingsGoals.push(goalData);
        await saveUserFinancialData();
        
        closeAddGoalModal();
        await renderTabContent('savings');
        
        showNotification('Savings goal created successfully!', 'success');
    } catch (error) {
        console.error('Error adding goal:', error);
        showNotification('Error creating savings goal', 'error');
    }
};

window.openAddChildModal = function() {
    document.getElementById('add-child-modal').classList.remove('hidden');
};

window.closeAddChildModal = function() {
    document.getElementById('add-child-modal').classList.add('hidden');
    document.getElementById('child-form').reset();
};

window.handleAddChild = async function(event) {
    event.preventDefault();
    
    const childData = {
        id: Date.now().toString(),
        name: document.getElementById('child-name').value,
        age: parseInt(document.getElementById('child-age').value),
        weeklyAllowance: parseFloat(document.getElementById('child-allowance').value) || 0,
        savingsGoal: document.getElementById('child-goal').value,
        goalAmount: parseFloat(document.getElementById('child-goal-amount').value) || 0,
        currentSavings: 0,
        transactions: [],
        addedDate: new Date().toISOString()
    };
    
    try {
        if (!userFinancialData.personal.kidsFinance) {
            userFinancialData.personal.kidsFinance = [];
        }
        
        userFinancialData.personal.kidsFinance.push(childData);
        await saveUserFinancialData();
        
        closeAddChildModal();
        await renderTabContent('kids');
        
        showNotification(`${childData.name} added to kids dashboard!`, 'success');
    } catch (error) {
        console.error('Error adding child:', error);
        showNotification('Error adding child to dashboard', 'error');
    }
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
    const interestRate = parseFloat(document.getElementById('interest-rate').value) || 11.5;
    const loanTerm = parseInt(document.getElementById('loan-term').value) || 25;
    
    // Calculate affordability (banks typically use 30-32% of gross income for bond payments)
    const maxBondPayment = monthlyIncome * 0.30;
    const availableForBond = monthlyIncome - monthlyExpenses - existingDebt;
    const affordableBondPayment = Math.min(maxBondPayment, availableForBond);
    
    // Calculate loan amount based on payment
    const monthlyRate = (interestRate / 100) / 12;
    const numberOfPayments = loanTerm * 12;
    const loanAmount = affordableBondPayment * ((Math.pow(1 + monthlyRate, numberOfPayments) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)));
    
    // Total property value including deposit
    const propertyValue = loanAmount + deposit;
    
    const resultContainer = document.getElementById('home-loan-results');
    resultContainer.innerHTML = `
        <div class="space-y-4">
            <div class="bg-green-50 rounded-lg p-4">
                <h5 class="font-semibold text-green-900 mb-2">Property Affordability</h5>
                <div class="text-2xl font-bold text-green-800">R${propertyValue.toLocaleString()}</div>
                <p class="text-sm text-green-600">Maximum property value you can afford</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-blue-50 rounded-lg p-3">
                    <p class="text-sm text-blue-600">Loan Amount</p>
                    <p class="font-bold text-blue-900">R${loanAmount.toLocaleString()}</p>
                </div>
                <div class="bg-purple-50 rounded-lg p-3">
                    <p class="text-sm text-purple-600">Monthly Payment</p>
                    <p class="font-bold text-purple-900">R${affordableBondPayment.toLocaleString()}</p>
                </div>
            </div>
            
            <div class="bg-yellow-50 rounded-lg p-4">
                <h6 class="font-medium text-yellow-800 mb-2">Important Notes:</h6>
                <ul class="text-sm text-yellow-700 space-y-1">
                    <li>• This is an estimate - banks have additional criteria</li>
                    <li>• Consider transfer costs, bond registration fees</li>
                    <li>• Factor in property insurance and rates</li>
                    <li>• Interest rates may change</li>
                </ul>
            </div>
        </div>
    `;
};

window.openTaxCalculator = function() {
    document.getElementById('tax-calculator-modal').classList.remove('hidden');
};

window.closeTaxCalculator = function() {
    document.getElementById('tax-calculator-modal').classList.add('hidden');
};

// Export the main functions for external access
export { 
    init, 
    renderPersonalFinanceHub, 
    renderBusinessFinanceHub,
    saveUserFinancialData,
    showNotification 
};
