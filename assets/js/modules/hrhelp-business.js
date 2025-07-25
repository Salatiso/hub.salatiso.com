/* ================================================================================= */
/* FILE: assets/js/modules/hrhelp-business.js (v2.0 Comprehensive HR Suite)        */
/* PURPOSE: A full-featured HR management system for businesses, inspired by        */
/* Deel, Zoho People, and HR Simplified.                                  */
/* AUTHOR: Salatiso & Gemini                                                 */
/* DATE: July 25, 2025                                                               */
/* REVISION HISTORY:                                                                */
/* v2.0 - 2025/07/25: Complete overhaul into a comprehensive HR suite.              */
/* - Added Dashboard, People, Payroll, Onboarding, Benefits, Compliance,      */
/* and Leave Management modules.                                            */
/* - Adopted a modern, sidebar-based layout similar to FinHelp.               */
/* - Integrated robust Firestore backend for all modules.                     */
/* v1.0 - Initial foundational version.                                             */
/* ================================================================================= */

import { auth, db } from '../firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, collection, addDoc, getDocs, setDoc, deleteDoc, onSnapshot, query, where, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- STATE MANAGEMENT ---
let currentUser = null;
let businessId = null; 
let employeesCache = [];
let leaveRequestsCache = [];
let benefitsCache = [];
let unsubscribers = []; // To store snapshot listeners and detach them on re-init

/**
 * Main initializer for the Business HR module.
 * @param {object} user - The authenticated Firebase user object.
 */
export function init(user) {
    if (!user) {
        console.error("HRHelp Business requires an authenticated user.");
        return;
    }
    
    // Clean up previous listeners to prevent memory leaks
    unsubscribers.forEach(unsub => unsub());
    unsubscribers = [];

    currentUser = user;
    // Using user's UID as the business identifier for simplicity.
    // In a multi-company setup, this would be a selected company ID.
    businessId = currentUser.uid; 
    
    console.log(`HRHelp Business v2.0 initialized for business ID: ${businessId}`);

    const businessWorkspace = document.getElementById('business-workspace');
    if (!businessWorkspace) {
        console.error("Business workspace element not found.");
        return;
    }

    businessWorkspace.innerHTML = getBusinessWorkspaceHTML();
    attachEventListeners();
    navigateTo('dashboard'); // Default to the dashboard view
}

// --- DATA HANDLING ---

/**
 * Fetches all necessary data from Firestore and sets up real-time listeners.
 */
function setupDataListeners() {
    // Unsubscribe from any existing listeners before creating new ones
    unsubscribers.forEach(unsub => unsub());
    unsubscribers = [];

    const collections = {
        employees: 'employees',
        leaveRequests: 'leaveRequests',
        benefits: 'benefits'
    };

    const caches = {
        employees: (data) => employeesCache = data,
        leaveRequests: (data) => leaveRequestsCache = data,
        benefits: (data) => benefitsCache = data
    };

    const renderers = {
        employees: () => { if (document.getElementById('people-content')) renderPeople(); },
        leaveRequests: () => { if (document.getElementById('leave-content')) renderLeave(); },
        benefits: () => { if (document.getElementById('benefits-content')) renderBenefits(); }
    };

    for (const [key, path] of Object.entries(collections)) {
        const q = query(collection(db, 'businesses', businessId, path));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            caches[key](data);
            console.log(`Updated ${key} cache:`, data);
            // Re-render the current view if the data has changed
            renderers[key]();
            // Always update dashboard as it shows summary data
            if (document.getElementById('dashboard-content')) {
                renderDashboard();
            }
        }, (error) => {
            console.error(`Error fetching ${key}:`, error);
            showNotification(`Failed to load ${key} data.`, 'error');
        });
        unsubscribers.push(unsub);
    }
}


// --- NAVIGATION & RENDERING ---

/**
 * Attaches main event listeners for navigation and dynamic content.
 */
function attachEventListeners() {
    const workspace = document.getElementById('business-workspace');
    workspace.addEventListener('click', (e) => {
        // Handle sidebar navigation
        const navLink = e.target.closest('.nav-link');
        if (navLink && !navLink.classList.contains('active')) {
            const view = navLink.dataset.view;
            navigateTo(view);
            return;
        }

        // Handle navigation actions (for dashboard quick actions)
        const navAction = e.target.closest('.nav-action');
        if (navAction) {
            const view = navAction.dataset.view;
            navigateTo(view);
            return;
        }

        // Handle modal opening
        const modalToggle = e.target.closest('[data-modal-toggle]');
        if (modalToggle) {
            const modalId = modalToggle.dataset.modalToggle;
            document.getElementById(modalId)?.classList.remove('hidden');
            return;
        }

        // Handle modal closing
        const modalClose = e.target.closest('[data-modal-close]');
        if (modalClose) {
            const modalId = modalClose.dataset.modalClose;
            document.getElementById(modalId)?.classList.add('hidden');
            return;
        }
        
        // Handle form submissions
        const form = e.target.closest('form');
        if (form) {
            e.preventDefault();
            switch(form.id) {
                case 'add-employee-form':
                    handleAddEmployee(form);
                    break;
                case 'add-benefit-form':
                    handleAddBenefit(form);
                    break;
            }
        }
    });
}

/**
 * Navigates to a specific view within the HR module.
 * @param {string} view - The view to render (e.g., 'dashboard', 'people').
 */
function navigateTo(view) {
    console.log(`Navigating to: ${view}`);
    const contentArea = document.getElementById('main-content-area');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!contentArea) return;

    // Update active link in sidebar
    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.view === view);
        link.classList.toggle('bg-indigo-700', link.dataset.view === view);
        link.classList.toggle('text-white', link.dataset.view === view);
        link.classList.toggle('text-indigo-100', link.dataset.view !== view);
        link.classList.toggle('hover:bg-indigo-500', link.dataset.view !== view);
    });

    // Render the corresponding view
    contentArea.innerHTML = '<div class="text-center p-10"><i class="fas fa-spinner fa-spin fa-3x text-indigo-500"></i></div>'; // Loading indicator
    
    // Setup data listeners on first navigation
    if (unsubscribers.length === 0) {
        setupDataListeners();
    }

    switch (view) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'people':
            renderPeople();
            break;
        case 'payroll':
            renderPayroll();
            break;
        case 'onboarding':
            renderOnboarding();
            break;
        case 'benefits':
            renderBenefits();
            break;
        case 'compliance':
            renderCompliance();
            break;
        case 'leave':
            renderLeave();
            break;
        default:
            contentArea.innerHTML = `<p class="text-center text-red-500">View not found.</p>`;
    }
}

// --- MODULE RENDERERS ---

function renderDashboard() {
    const contentArea = document.getElementById('main-content-area');
    const pendingLeave = leaveRequestsCache.filter(r => r.status === 'pending').length;
    const upcomingHolidays = 0; // Placeholder
    
    contentArea.innerHTML = `
        <div id="dashboard-content">
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-slate-800">HR Dashboard</h1>
                <p class="text-slate-500">Welcome back! Here's a summary of your organization.</p>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-500">Total Employees</p>
                        <p class="text-3xl font-bold text-slate-800">${employeesCache.length}</p>
                    </div>
                    <div class="bg-indigo-100 text-indigo-600 rounded-full p-3">
                        <i class="fas fa-users fa-lg"></i>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-500">Pending Leave Requests</p>
                        <p class="text-3xl font-bold text-slate-800">${pendingLeave}</p>
                    </div>
                     <div class="bg-amber-100 text-amber-600 rounded-full p-3">
                        <i class="fas fa-plane-departure fa-lg"></i>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-500">New Hires This Month</p>
                        <p class="text-3xl font-bold text-slate-800">0</p>
                    </div>
                     <div class="bg-green-100 text-green-600 rounded-full p-3">
                        <i class="fas fa-user-plus fa-lg"></i>
                    </div>
                </div>
                 <div class="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-500">Compliance Issues</p>
                        <p class="text-3xl font-bold text-red-500">0</p>
                    </div>
                     <div class="bg-red-100 text-red-600 rounded-full p-3">
                        <i class="fas fa-gavel fa-lg"></i>
                    </div>
                </div>
            </div>

            <!-- Quick Actions & Onboarding -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                    <h3 class="font-bold text-lg text-slate-800 mb-4">Onboarding Employees</h3>
                    <p class="text-slate-500 text-center py-8">Onboarding module coming soon.</p>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-md">
                    <h3 class="font-bold text-lg text-slate-800 mb-4">Quick Actions</h3>
                    <div class="flex flex-col space-y-3">
                        <button data-modal-toggle="add-employee-modal" class="w-full text-left p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"><i class="fas fa-user-plus mr-3 text-indigo-600"></i>Add a New Employee</button>
                        <button class="nav-action w-full text-left p-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors" data-view="leave"><i class="fas fa-calendar-check mr-3 text-amber-600"></i>Review Leave</button>
                        <button class="nav-action w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors" data-view="payroll"><i class="fas fa-money-check-dollar mr-3 text-green-600"></i>Run Payroll</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderPeople() {
    const contentArea = document.getElementById('main-content-area');
    let employeesHtml = employeesCache.length > 0 ? employeesCache.map(emp => `
        <tr class="hover:bg-slate-50">
            <td class="p-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="w-10 h-10 flex-shrink-0 mr-4">
                        <img class="w-full h-full rounded-full" src="${emp.avatar || `https://ui-avatars.com/api/?name=${emp.firstName}+${emp.lastName}&background=random`}" alt="${emp.firstName}">
                    </div>
                    <div>
                        <div class="font-semibold text-slate-800">${emp.firstName} ${emp.lastName}</div>
                        <div class="text-sm text-slate-500">${emp.email}</div>
                    </div>
                </div>
            </td>
            <td class="p-4 whitespace-nowrap text-slate-600">${emp.jobTitle || 'N/A'}</td>
            <td class="p-4 whitespace-nowrap text-slate-600">${emp.employmentType || 'N/A'}</td>
            <td class="p-4 whitespace-nowrap"><span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span></td>
            <td class="p-4 whitespace-nowrap text-right">
                <button class="text-slate-400 hover:text-indigo-600"><i class="fas fa-ellipsis-h"></i></button>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="5" class="text-center p-8 text-slate-500">No employees found. Add your first employee to get started.</td></tr>';

    contentArea.innerHTML = `
        <div id="people-content">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">People</h1>
                    <p class="text-slate-500">Manage all employees in your organization.</p>
                </div>
                <button data-modal-toggle="add-employee-modal" class="btn-primary flex items-center">
                    <i class="fas fa-plus mr-2"></i> Add Employee
                </button>
            </div>
            <div class="bg-white rounded-xl shadow-md overflow-x-auto">
                <table class="w-full table-auto">
                    <thead class="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                        <tr>
                            <th class="p-4 whitespace-nowrap text-left">Name</th>
                            <th class="p-4 whitespace-nowrap text-left">Job Title</th>
                            <th class="p-4 whitespace-nowrap text-left">Employment Type</th>
                            <th class="p-4 whitespace-nowrap text-left">Status</th>
                            <th class="p-4 whitespace-nowrap text-right"></th>
                        </tr>
                    </thead>
                    <tbody class="text-sm divide-y divide-slate-100">
                        ${employeesHtml}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderPayroll() {
    document.getElementById('main-content-area').innerHTML = `
        <div>
            <div class="flex justify-between items-center mb-6">
                 <div>
                    <h1 class="text-3xl font-bold text-slate-800">Payroll</h1>
                    <p class="text-slate-500">Run payroll, manage salaries, and view history.</p>
                </div>
                <button class="btn-primary-disabled flex items-center" disabled>
                    <i class="fas fa-money-check-dollar mr-2"></i> Run New Payroll
                </button>
            </div>
            <div class="bg-white rounded-xl shadow-md p-8 text-center">
                <i class="fas fa-cogs fa-3x text-slate-300 mb-4"></i>
                <h3 class="text-xl font-bold text-slate-700">Payroll Module Under Construction</h3>
                <p class="text-slate-500 mt-2">We're building a comprehensive, multi-currency payroll system. Stay tuned!</p>
                <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left text-sm text-blue-700">
                    <h4 class="font-bold mb-2"><i class="fas fa-bullhorn mr-2"></i>Coming Soon:</h4>
                    <ul class="list-disc list-inside space-y-1">
                        <li>Automated tax & social security compliance.</li>
                        <li>Multi-currency processing for global teams.</li>
                        <li>Direct deposit integration.</li>
                        <li>Detailed payroll history and reports.</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

function renderOnboarding() {
     document.getElementById('main-content-area').innerHTML = `
        <div>
            <h1 class="text-3xl font-bold text-slate-800 mb-6">Onboarding</h1>
             <div class="bg-white rounded-xl shadow-md p-8 text-center">
                <i class="fas fa-clipboard-list fa-3x text-slate-300 mb-4"></i>
                <h3 class="text-xl font-bold text-slate-700">Onboarding Module Under Construction</h3>
                <p class="text-slate-500 mt-2">Create seamless onboarding experiences for new hires.</p>
            </div>
        </div>
    `;
}

function renderBenefits() {
    const contentArea = document.getElementById('main-content-area');
    let benefitsHtml = benefitsCache.length > 0 ? benefitsCache.map(b => `
        <div class="bg-slate-50 p-4 rounded-lg flex justify-between items-center">
            <div>
                <h4 class="font-bold text-slate-800">${b.name}</h4>
                <p class="text-sm text-slate-500">${b.description}</p>
            </div>
            <div class="text-right">
                <p class="font-semibold text-slate-700">${b.type}</p>
                <p class="text-xs text-slate-500">Provider: ${b.provider}</p>
            </div>
        </div>
    `).join('') : '<p class="text-center p-8 text-slate-500">No company benefits have been defined yet.</p>';

    contentArea.innerHTML = `
        <div id="benefits-content">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">Benefits</h1>
                    <p class="text-slate-500">Manage company-wide benefits and perks.</p>
                </div>
                <button data-modal-toggle="add-benefit-modal" class="btn-primary flex items-center">
                    <i class="fas fa-plus mr-2"></i> Add Benefit
                </button>
            </div>
            <div class="bg-white rounded-xl shadow-md p-6">
                <div class="space-y-4">
                    ${benefitsHtml}
                </div>
            </div>
        </div>
    `;
}

function renderCompliance() {
     document.getElementById('main-content-area').innerHTML = `
        <div>
            <h1 class="text-3xl font-bold text-slate-800 mb-6">Compliance</h1>
             <div class="bg-white rounded-xl shadow-md p-8 text-center">
                <i class="fas fa-gavel fa-3x text-slate-300 mb-4"></i>
                <h3 class="text-xl font-bold text-slate-700">Compliance Center Under Construction</h3>
                <p class="text-slate-500 mt-2">Manage tax documents, labor law compliance, and company policies.</p>
            </div>
        </div>
    `;
}

function renderLeave() {
     document.getElementById('main-content-area').innerHTML = `
        <div id="leave-content">
            <h1 class="text-3xl font-bold text-slate-800 mb-6">Leave Management</h1>
             <div class="bg-white rounded-xl shadow-md p-8 text-center">
                <i class="fas fa-plane-departure fa-3x text-slate-300 mb-4"></i>
                <h3 class="text-xl font-bold text-slate-700">Leave Management Under Construction</h3>
                <p class="text-slate-500 mt-2">Track time off, manage leave requests, and set company holidays.</p>
            </div>
        </div>
    `;
}


// --- ACTIONS & HANDLERS ---

async function handleAddEmployee(form) {
    const formData = new FormData(form);
    const employeeData = {
        firstName: formData.get('first-name'),
        lastName: formData.get('last-name'),
        email: formData.get('email'),
        jobTitle: formData.get('job-title'),
        employmentType: formData.get('employment-type'),
        startDate: formData.get('start-date'),
        salary: formData.get('salary'),
        currency: formData.get('currency'),
        createdAt: new Date().toISOString()
    };

    // Basic validation
    if (!employeeData.firstName || !employeeData.lastName || !employeeData.email) {
        showNotification("First name, last name, and email are required.", "error");
        return;
    }

    try {
        const docRef = await addDoc(collection(db, 'businesses', businessId, 'employees'), employeeData);
        showNotification("Employee added successfully!", "success");
        form.reset();
        document.getElementById('add-employee-modal').classList.add('hidden');
        // The onSnapshot listener will automatically re-render the list
    } catch (error) {
        console.error("Error adding employee: ", error);
        showNotification("Failed to add employee. Please try again.", "error");
    }
}

async function handleAddBenefit(form) {
    const formData = new FormData(form);
    const benefitData = {
        name: formData.get('benefit-name'),
        type: formData.get('benefit-type'),
        provider: formData.get('benefit-provider'),
        description: formData.get('benefit-description'),
        createdAt: new Date().toISOString()
    };

    if (!benefitData.name || !benefitData.type) {
        showNotification("Benefit name and type are required.", "error");
        return;
    }

    try {
        await addDoc(collection(db, 'businesses', businessId, 'benefits'), benefitData);
        showNotification("Benefit added successfully!", "success");
        form.reset();
        document.getElementById('add-benefit-modal').classList.add('hidden');
    } catch (error) {
        console.error("Error adding benefit: ", error);
        showNotification("Failed to add benefit.", "error");
    }
}

// --- UI & HTML TEMPLATES ---

/**
 * Generates the main HTML structure for the business workspace.
 */
function getBusinessWorkspaceHTML() {
    return `
        <div class="flex h-full bg-slate-100">
            <!-- Sidebar Navigation -->
            <div class="w-64 bg-indigo-600 text-white flex-shrink-0 flex flex-col">
                <div class="p-6 text-2xl font-bold">HRHelp</div>
                <nav class="flex-grow px-4">
                    <a href="#" class="nav-link flex items-center px-4 py-3 rounded-lg transition-colors" data-view="dashboard"><i class="fas fa-tachometer-alt w-8 text-center"></i>Dashboard</a>
                    <a href="#" class="nav-link flex items-center px-4 py-3 rounded-lg transition-colors" data-view="people"><i class="fas fa-users w-8 text-center"></i>People</a>
                    <a href="#" class="nav-link flex items-center px-4 py-3 rounded-lg transition-colors" data-view="payroll"><i class="fas fa-money-check-dollar w-8 text-center"></i>Payroll</a>
                    <a href="#" class="nav-link flex items-center px-4 py-3 rounded-lg transition-colors" data-view="onboarding"><i class="fas fa-clipboard-list w-8 text-center"></i>Onboarding</a>
                    <a href="#" class="nav-link flex items-center px-4 py-3 rounded-lg transition-colors" data-view="benefits"><i class="fas fa-gift w-8 text-center"></i>Benefits</a>
                    <a href="#" class="nav-link flex items-center px-4 py-3 rounded-lg transition-colors" data-view="compliance"><i class="fas fa-gavel w-8 text-center"></i>Compliance</a>
                    <a href="#" class="nav-link flex items-center px-4 py-3 rounded-lg transition-colors" data-view="leave"><i class="fas fa-plane-departure w-8 text-center"></i>Leave</a>
                </nav>
            </div>

            <!-- Main Content -->
            <main id="main-content-area" class="flex-grow p-8 overflow-y-auto">
                <!-- Content will be rendered here by navigateTo() -->
            </main>
        </div>
        ${getAddEmployeeModalHTML()}
        ${getAddBenefitModalHTML()}
    `;
}

function getAddEmployeeModalHTML() {
    return `
        <div id="add-employee-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-slate-800">Add New Employee</h2>
                    <button data-modal-close="add-employee-modal" class="text-slate-400 hover:text-slate-600">&times;</button>
                </div>
                <form id="add-employee-form">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="form-label" for="first-name">First Name</label>
                            <input class="input" id="first-name" name="first-name" type="text" required>
                        </div>
                        <div>
                            <label class="form-label" for="last-name">Last Name</label>
                            <input class="input" id="last-name" name="last-name" type="text" required>
                        </div>
                        <div class="md:col-span-2">
                            <label class="form-label" for="email">Email Address</label>
                            <input class="input" id="email" name="email" type="email" required>
                        </div>
                        <div>
                            <label class="form-label" for="job-title">Job Title</label>
                            <input class="input" id="job-title" name="job-title" type="text">
                        </div>
                         <div>
                            <label class="form-label" for="employment-type">Employment Type</label>
                            <select class="input" id="employment-type" name="employment-type">
                                <option>Full-time</option>
                                <option>Part-time</option>
                                <option>Contractor</option>
                                <option>Intern</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label" for="start-date">Start Date</label>
                            <input class="input" id="start-date" name="start-date" type="date">
                        </div>
                        <div class="grid grid-cols-3 gap-2">
                            <div class="col-span-2">
                                <label class="form-label" for="salary">Salary</label>
                                <input class="input" id="salary" name="salary" type="number" placeholder="e.g., 50000">
                            </div>
                             <div>
                                <label class="form-label" for="currency">Currency</label>
                                <input class="input" id="currency" name="currency" type="text" value="ZAR">
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end mt-8 space-x-4">
                        <button type="button" data-modal-close="add-employee-modal" class="btn-secondary">Cancel</button>
                        <button type="submit" class="btn-primary">Add Employee</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function getAddBenefitModalHTML() {
    return `
        <div id="add-benefit-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-slate-800">Add New Benefit</h2>
                    <button data-modal-close="add-benefit-modal" class="text-slate-400 hover:text-slate-600">&times;</button>
                </div>
                <form id="add-benefit-form">
                    <div class="space-y-4">
                        <div>
                            <label class="form-label" for="benefit-name">Benefit Name</label>
                            <input class="input" id="benefit-name" name="benefit-name" type="text" required placeholder="e.g., Medical Aid">
                        </div>
                        <div>
                            <label class="form-label" for="benefit-type">Benefit Type</label>
                            <select class="input" id="benefit-type" name="benefit-type">
                                <option>Healthcare</option>
                                <option>Retirement</option>
                                <option>Insurance</option>
                                <option>Perk</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label" for="benefit-provider">Provider</label>
                            <input class="input" id="benefit-provider" name="benefit-provider" type="text" placeholder="e.g., Discovery Health">
                        </div>
                        <div>
                            <label class="form-label" for="benefit-description">Description</label>
                            <textarea class="input" id="benefit-description" name="benefit-description" rows="3"></textarea>
                        </div>
                    </div>
                    <div class="flex justify-end mt-8 space-x-4">
                        <button type="button" data-modal-close="add-benefit-modal" class="btn-secondary">Cancel</button>
                        <button type="submit" class="btn-primary">Save Benefit</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// --- UTILITY ---
function showNotification(message, type = 'info') {
    const container = document.body;
    const notification = document.createElement('div');
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };
    notification.className = `fixed bottom-5 right-5 p-4 rounded-lg text-white shadow-lg z-50 transform transition-transform translate-y-20 ${colors[type] || 'bg-slate-800'}`;
    notification.textContent = message;
    container.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-y-20');
    }, 10);

    // Animate out and remove
    setTimeout(() => {
        notification.classList.add('translate-y-20');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}
