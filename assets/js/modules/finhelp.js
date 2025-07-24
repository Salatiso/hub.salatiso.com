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

// Continue with Credit Profile Tab and Kids Dashboard...
// [This is getting quite long - should I continue with the remaining features in the next response?]
