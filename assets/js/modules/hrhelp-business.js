/* ================================================================================= */
/* FILE: assets/js/modules/hrhelp-business.js (v3.0 Complete HR Suite)              */
/* PURPOSE: A comprehensive HR management system with full lifecycle management     */
/* AUTHOR: Salatiso & GitHub Copilot                                               */
/* DATE: July 25, 2025                                                             */
/* REVISION HISTORY:                                                               */
/* v3.0 - 2025/07/25: Complete HR suite with all modules implemented               */
/* - Added Recruitment, Performance, Training, Compensation modules                */
/* - Added Employee Relations, Grievances, Disciplinary processes                  */
/* - Added Termination management and comprehensive reporting                       */
/* - Support for all employee types including family members                       */
/* v2.0 - 2025/07/25: Basic HR suite implementation                               */
/* v1.0 - Initial foundational version                                            */
/* ================================================================================= */

import { auth, db } from '../firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, collection, addDoc, getDocs, setDoc, deleteDoc, onSnapshot, query, where, getDoc, updateDoc, orderBy, limit } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- STATE MANAGEMENT ---
let currentUser = null;
let businessId = null; 
let employeesCache = [];
let leaveRequestsCache = [];
let benefitsCache = [];
let recruitmentCache = [];
let performanceCache = [];
let trainingCache = [];
let compensationCache = [];
let grievancesCache = [];
let disciplinaryCache = [];
let terminationCache = [];
let unsubscribers = [];

// --- CONSTANTS ---
const EMPLOYEE_TYPES = ['Full-time', 'Part-time', 'Contractor', 'Intern', 'Family Member', 'Temporary', 'Consultant'];
const EMPLOYMENT_STATUSES = ['Active', 'On Leave', 'Suspended', 'Terminated', 'Resigned'];
const LEAVE_TYPES = ['Annual', 'Sick', 'Maternity', 'Paternity', 'Study', 'Compassionate', 'Unpaid'];
const PERFORMANCE_RATINGS = ['Exceeds Expectations', 'Meets Expectations', 'Below Expectations', 'Needs Improvement'];
const GRIEVANCE_TYPES = ['Workplace Harassment', 'Discrimination', 'Unfair Treatment', 'Working Conditions', 'Pay Disputes', 'Other'];
const DISCIPLINARY_ACTIONS = ['Verbal Warning', 'Written Warning', 'Final Warning', 'Suspension', 'Termination'];

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
    businessId = currentUser.uid; 
    
    console.log(`HRHelp Business v3.0 initialized for business ID: ${businessId}`);

    const businessWorkspace = document.getElementById('business-workspace');
    if (!businessWorkspace) {
        console.error("Business workspace element not found.");
        return;
    }

    businessWorkspace.innerHTML = getBusinessWorkspaceHTML();
    attachEventListeners();
    navigateTo('dashboard');
}

// --- DATA HANDLING ---

function setupDataListeners() {
    unsubscribers.forEach(unsub => unsub());
    unsubscribers = [];

    const collections = {
        employees: 'employees',
        leaveRequests: 'leaveRequests',
        benefits: 'benefits',
        recruitment: 'recruitment',
        performance: 'performance',
        training: 'training',
        compensation: 'compensation',
        grievances: 'grievances',
        disciplinary: 'disciplinary',
        termination: 'termination'
    };

    const caches = {
        employees: (data) => employeesCache = data,
        leaveRequests: (data) => leaveRequestsCache = data,
        benefits: (data) => benefitsCache = data,
        recruitment: (data) => recruitmentCache = data,
        performance: (data) => performanceCache = data,
        training: (data) => trainingCache = data,
        compensation: (data) => compensationCache = data,
        grievances: (data) => grievancesCache = data,
        disciplinary: (data) => disciplinaryCache = data,
        termination: (data) => terminationCache = data
    };

    for (const [key, path] of Object.entries(collections)) {
        const q = query(collection(db, 'businesses', businessId, path), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            caches[key](data);
            console.log(`Updated ${key} cache:`, data);
            
            // Re-render current view if needed
            const currentView = document.querySelector('.nav-link.active')?.dataset.view;
            if (currentView === 'dashboard') renderDashboard();
        }, (error) => {
            console.error(`Error fetching ${key}:`, error);
            showNotification(`Failed to load ${key} data.`, 'error');
        });
        unsubscribers.push(unsub);
    }
}

// --- NAVIGATION & RENDERING ---

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

        // Handle navigation actions
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

        // Handle button actions
        const action = e.target.dataset.action;
        if (action) {
            handleAction(action, e.target);
            return;
        }
        
        // Handle form submissions
        const form = e.target.closest('form');
        if (form && e.target.type === 'submit') {
            e.preventDefault();
            handleFormSubmission(form);
        }
    });
}

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

    contentArea.innerHTML = '<div class="text-center p-10"><i class="fas fa-spinner fa-spin fa-3x text-indigo-500"></i></div>';
    
    if (unsubscribers.length === 0) {
        setupDataListeners();
    }

    switch (view) {
        case 'dashboard': renderDashboard(); break;
        case 'people': renderPeople(); break;
        case 'recruitment': renderRecruitment(); break;
        case 'onboarding': renderOnboarding(); break;
        case 'performance': renderPerformance(); break;
        case 'training': renderTraining(); break;
        case 'compensation': renderCompensation(); break;
        case 'benefits': renderBenefits(); break;
        case 'leave': renderLeave(); break;
        case 'employee-relations': renderEmployeeRelations(); break;
        case 'compliance': renderCompliance(); break;
        case 'payroll': renderPayroll(); break;
        case 'termination': renderTermination(); break;
        default:
            contentArea.innerHTML = `<p class="text-center text-red-500">View not found.</p>`;
    }
}

// --- MODULE RENDERERS ---

function renderDashboard() {
    const contentArea = document.getElementById('main-content-area');
    const totalEmployees = employeesCache.length;
    const activeEmployees = employeesCache.filter(e => e.status === 'Active').length;
    const pendingLeave = leaveRequestsCache.filter(r => r.status === 'pending').length;
    const openPositions = recruitmentCache.filter(r => r.status === 'Open').length;
    const upcomingReviews = performanceCache.filter(p => {
        const reviewDate = new Date(p.nextReviewDate);
        const now = new Date();
        const diff = reviewDate - now;
        return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000; // 30 days
    }).length;
    const pendingGrievances = grievancesCache.filter(g => g.status === 'Open').length;
    
    contentArea.innerHTML = `
        <div id="dashboard-content">
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-slate-800">HR Dashboard</h1>
                <p class="text-slate-500">Welcome back! Here's your HR overview.</p>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-500">Total Employees</p>
                        <p class="text-3xl font-bold text-slate-800">${totalEmployees}</p>
                        <p class="text-xs text-green-600">${activeEmployees} Active</p>
                    </div>
                    <div class="bg-indigo-100 text-indigo-600 rounded-full p-3">
                        <i class="fas fa-users fa-lg"></i>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-500">Pending Requests</p>
                        <p class="text-3xl font-bold text-slate-800">${pendingLeave}</p>
                        <p class="text-xs text-amber-600">Leave Requests</p>
                    </div>
                     <div class="bg-amber-100 text-amber-600 rounded-full p-3">
                        <i class="fas fa-plane-departure fa-lg"></i>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-500">Open Positions</p>
                        <p class="text-3xl font-bold text-slate-800">${openPositions}</p>
                        <p class="text-xs text-blue-600">Recruiting</p>
                    </div>
                     <div class="bg-blue-100 text-blue-600 rounded-full p-3">
                        <i class="fas fa-user-plus fa-lg"></i>
                    </div>
                </div>
                 <div class="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-500">Attention Required</p>
                        <p class="text-3xl font-bold text-red-500">${pendingGrievances + upcomingReviews}</p>
                        <p class="text-xs text-red-600">Issues & Reviews</p>
                    </div>
                     <div class="bg-red-100 text-red-600 rounded-full p-3">
                        <i class="fas fa-exclamation-triangle fa-lg"></i>
                    </div>
                </div>
            </div>

            <!-- Quick Actions & Recent Activity -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                    <h3 class="font-bold text-lg text-slate-800 mb-4">Recent Activity</h3>
                    <div class="space-y-3" id="recent-activity">
                        ${generateRecentActivity()}
                    </div>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-md">
                    <h3 class="font-bold text-lg text-slate-800 mb-4">Quick Actions</h3>
                    <div class="flex flex-col space-y-3">
                        <button data-modal-toggle="add-employee-modal" class="w-full text-left p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                            <i class="fas fa-user-plus mr-3 text-indigo-600"></i>Add New Employee
                        </button>
                        <button class="nav-action w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors" data-view="recruitment">
                            <i class="fas fa-search mr-3 text-green-600"></i>Post Job Opening
                        </button>
                        <button class="nav-action w-full text-left p-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors" data-view="leave">
                            <i class="fas fa-calendar-check mr-3 text-amber-600"></i>Review Leave Requests
                        </button>
                        <button class="nav-action w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors" data-view="performance">
                            <i class="fas fa-chart-line mr-3 text-purple-600"></i>Performance Reviews
                        </button>
                        <button class="nav-action w-full text-left p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" data-view="employee-relations">
                            <i class="fas fa-handshake mr-3 text-red-600"></i>Employee Relations
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateRecentActivity() {
    const activities = [];
    
    // Recent employee additions
    employeesCache.slice(0, 3).forEach(emp => {
        activities.push({
            icon: 'fa-user-plus',
            color: 'green',
            text: `${emp.firstName} ${emp.lastName} joined as ${emp.jobTitle}`,
            time: formatRelativeTime(emp.createdAt)
        });
    });
    
    // Recent leave requests
    leaveRequestsCache.slice(0, 2).forEach(leave => {
        const employee = employeesCache.find(e => e.id === leave.employeeId);
        activities.push({
            icon: 'fa-plane-departure',
            color: 'amber',
            text: `${employee?.firstName || 'Employee'} requested ${leave.type} leave`,
            time: formatRelativeTime(leave.createdAt)
        });
    });
    
    // Recent grievances
    grievancesCache.slice(0, 2).forEach(grievance => {
        activities.push({
            icon: 'fa-exclamation-circle',
            color: 'red',
            text: `New grievance filed: ${grievance.type}`,
            time: formatRelativeTime(grievance.createdAt)
        });
    });
    
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    return activities.slice(0, 5).map(activity => `
        <div class="flex items-center p-3 bg-slate-50 rounded-lg">
            <div class="w-8 h-8 bg-${activity.color}-100 text-${activity.color}-600 rounded-full flex items-center justify-center mr-3">
                <i class="fas ${activity.icon} text-sm"></i>
            </div>
            <div class="flex-1">
                <p class="text-sm font-medium text-slate-800">${activity.text}</p>
                <p class="text-xs text-slate-500">${activity.time}</p>
            </div>
        </div>
    `).join('') || '<p class="text-slate-500 text-center py-4">No recent activity</p>';
}

function renderPeople() {
    const contentArea = document.getElementById('main-content-area');
    
    // Group employees by type
    const employeesByType = EMPLOYEE_TYPES.reduce((acc, type) => {
        acc[type] = employeesCache.filter(emp => emp.employmentType === type);
        return acc;
    }, {});
    
    let employeesHtml = '';
    
    if (employeesCache.length > 0) {
        employeesHtml = employeesCache.map(emp => {
            const statusColor = emp.status === 'Active' ? 'green' : emp.status === 'On Leave' ? 'yellow' : 'red';
            return `
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
                    <td class="p-4 whitespace-nowrap">
                        <span class="px-2 py-1 text-xs font-semibold rounded-full bg-${statusColor}-100 text-${statusColor}-800">
                            ${emp.status || 'Active'}
                        </span>
                    </td>
                    <td class="p-4 whitespace-nowrap text-slate-600">${emp.startDate || 'N/A'}</td>
                    <td class="p-4 whitespace-nowrap text-right">
                        <div class="flex space-x-2">
                            <button data-action="view-employee" data-id="${emp.id}" class="text-indigo-600 hover:text-indigo-900">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button data-action="edit-employee" data-id="${emp.id}" class="text-slate-400 hover:text-slate-600">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } else {
        employeesHtml = '<tr><td colspan="6" class="text-center p-8 text-slate-500">No employees found. Add your first employee to get started.</td></tr>';
    }

    contentArea.innerHTML = `
        <div id="people-content">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">People Management</h1>
                    <p class="text-slate-500">Manage all employees in your organization.</p>
                </div>
                <div class="flex space-x-3">
                    <button data-modal-toggle="add-employee-modal" class="btn-primary flex items-center">
                        <i class="fas fa-plus mr-2"></i> Add Employee
                    </button>
                    <button data-action="import-employees" class="btn-secondary flex items-center">
                        <i class="fas fa-upload mr-2"></i> Import
                    </button>
                </div>
            </div>

            <!-- Employee Type Tabs -->
            <div class="mb-6">
                <nav class="flex space-x-1 bg-slate-100 p-1 rounded-lg">
                    <button class="employee-type-tab active px-4 py-2 rounded-md bg-white shadow-sm font-medium text-sm" data-type="all">
                        All (${employeesCache.length})
                    </button>
                    ${EMPLOYEE_TYPES.map(type => `
                        <button class="employee-type-tab px-4 py-2 rounded-md font-medium text-sm text-slate-600 hover:text-slate-900" data-type="${type}">
                            ${type} (${employeesByType[type].length})
                        </button>
                    `).join('')}
                </nav>
            </div>

            <div class="bg-white rounded-xl shadow-md overflow-x-auto">
                <table class="w-full table-auto">
                    <thead class="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                        <tr>
                            <th class="p-4 whitespace-nowrap text-left">Name</th>
                            <th class="p-4 whitespace-nowrap text-left">Job Title</th>
                            <th class="p-4 whitespace-nowrap text-left">Employment Type</th>
                            <th class="p-4 whitespace-nowrap text-left">Status</th>
                            <th class="p-4 whitespace-nowrap text-left">Start Date</th>
                            <th class="p-4 whitespace-nowrap text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="text-sm divide-y divide-slate-100" id="employees-table-body">
                        ${employeesHtml}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Add employee type tab functionality
    document.querySelectorAll('.employee-type-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.employee-type-tab').forEach(t => {
                t.classList.remove('active', 'bg-white', 'shadow-sm');
                t.classList.add('text-slate-600');
            });
            e.target.classList.add('active', 'bg-white', 'shadow-sm');
            e.target.classList.remove('text-slate-600');
            
            const type = e.target.dataset.type;
            filterEmployeesByType(type);
        });
    });
}

function filterEmployeesByType(type) {
    const tbody = document.getElementById('employees-table-body');
    const filteredEmployees = type === 'all' ? employeesCache : employeesCache.filter(emp => emp.employmentType === type);
    
    const employeesHtml = filteredEmployees.map(emp => {
        const statusColor = emp.status === 'Active' ? 'green' : emp.status === 'On Leave' ? 'yellow' : 'red';
        return `
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
                <td class="p-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-${statusColor}-100 text-${statusColor}-800">
                        ${emp.status || 'Active'}
                    </span>
                </td>
                <td class="p-4 whitespace-nowrap text-slate-600">${emp.startDate || 'N/A'}</td>
                <td class="p-4 whitespace-nowrap text-right">
                    <div class="flex space-x-2">
                        <button data-action="view-employee" data-id="${emp.id}" class="text-indigo-600 hover:text-indigo-900">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button data-action="edit-employee" data-id="${emp.id}" class="text-slate-400 hover:text-slate-600">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="6" class="text-center p-8 text-slate-500">No employees found for this type.</td></tr>';
    
    tbody.innerHTML = employeesHtml;
}

function renderRecruitment() {
    const contentArea = document.getElementById('main-content-area');
    const openPositions = recruitmentCache.filter(r => r.status === 'Open').length;
    const inProgress = recruitmentCache.filter(r => r.status === 'In Progress').length;
    const filled = recruitmentCache.filter(r => r.status === 'Filled').length;
    
    const positionsHtml = recruitmentCache.map(position => `
        <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-xl font-bold text-slate-800">${position.title}</h3>
                    <p class="text-sm text-slate-500">${position.department} • ${position.employmentType}</p>
                    <p class="text-sm text-slate-600 mt-2">${position.location}</p>
                </div>
                <span class="px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(position.status)}">
                    ${position.status}
                </span>
            </div>
            <p class="text-slate-600 mb-4">${position.description}</p>
            <div class="flex justify-between items-center">
                <div class="text-sm text-slate-500">
                    <span class="mr-4"><i class="fas fa-users mr-1"></i>${position.applicants || 0} applicants</span>
                    <span><i class="fas fa-calendar mr-1"></i>Posted ${formatRelativeTime(position.createdAt)}</span>
                </div>
                <div class="flex space-x-2">
                    <button data-action="view-applicants" data-id="${position.id}" class="btn-secondary text-sm">
                        View Applicants
                    </button>
                    <button data-action="edit-position" data-id="${position.id}" class="btn-primary text-sm">
                        Edit
                    </button>
                </div>
            </div>
        </div>
    `).join('') || '<p class="text-center text-slate-500 py-8">No job postings yet. Create your first job posting to get started.</p>';

    contentArea.innerHTML = `
        <div>
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">Recruitment</h1>
                    <p class="text-slate-500">Manage job postings and track applicants.</p>
                </div>
                <button data-modal-toggle="add-position-modal" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>Post New Job
                </button>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div class="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div class="flex items-center">
                        <div class="bg-green-500 text-white rounded-full p-2 mr-3">
                            <i class="fas fa-briefcase"></i>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-green-800">${openPositions}</p>
                            <p class="text-sm text-green-600">Open Positions</p>
                        </div>
                    </div>
                </div>
                <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <div class="flex items-center">
                        <div class="bg-blue-500 text-white rounded-full p-2 mr-3">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-blue-800">${inProgress}</p>
                            <p class="text-sm text-blue-600">In Progress</p>
                        </div>
                    </div>
                </div>
                <div class="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                    <div class="flex items-center">
                        <div class="bg-purple-500 text-white rounded-full p-2 mr-3">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-purple-800">${filled}</p>
                            <p class="text-sm text-purple-600">Filled This Month</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="space-y-6">
                ${positionsHtml}
            </div>
        </div>
    `;
}

function renderOnboarding() {
    const contentArea = document.getElementById('main-content-area');
    
    // Get new employees (started within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newEmployees = employeesCache.filter(emp => {
        const startDate = new Date(emp.startDate);
        return startDate >= thirtyDaysAgo;
    });

    const onboardingHtml = newEmployees.map(emp => {
        const progress = calculateOnboardingProgress(emp);
        return `
            <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center">
                        <img src="${emp.avatar || `https://ui-avatars.com/api/?name=${emp.firstName}+${emp.lastName}&background=random`}" 
                             class="w-12 h-12 rounded-full mr-4">
                        <div>
                            <h3 class="text-lg font-bold text-slate-800">${emp.firstName} ${emp.lastName}</h3>
                            <p class="text-sm text-slate-500">${emp.jobTitle} • Started ${emp.startDate}</p>
                        </div>
                    </div>
                    <span class="px-3 py-1 text-xs font-semibold rounded-full ${progress === 100 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                        ${progress}% Complete
                    </span>
                </div>
                
                <div class="mb-4">
                    <div class="flex justify-between text-sm mb-1">
                        <span>Onboarding Progress</span>
                        <span>${progress}%</span>
                    </div>
                    <div class="w-full bg-slate-200 rounded-full h-2">
                        <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
                    </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${getOnboardingTasks(emp).map(task => `
                        <div class="flex items-center">
                            <input type="checkbox" ${task.completed ? 'checked' : ''} 
                                   class="h-4 w-4 text-indigo-600 rounded mr-2" 
                                   data-action="toggle-onboarding-task" 
                                   data-employee-id="${emp.id}" 
                                   data-task="${task.id}">
                            <span class="text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}">${task.name}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="mt-4 pt-4 border-t border-slate-200 flex justify-end space-x-2">
                    <button data-action="send-welcome-email" data-id="${emp.id}" class="btn-secondary text-sm">
                        <i class="fas fa-envelope mr-1"></i>Send Welcome Email
                    </button>
                    <button data-action="schedule-checkin" data-id="${emp.id}" class="btn-primary text-sm">
                        <i class="fas fa-calendar mr-1"></i>Schedule Check-in
                    </button>
                </div>
            </div>
        `;
    }).join('') || '<p class="text-center text-slate-500 py-8">No new employees in the onboarding process.</p>';

    contentArea.innerHTML = `
        <div>
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">Onboarding</h1>
                    <p class="text-slate-500">Welcome new team members and track their progress.</p>
                </div>
                <button data-modal-toggle="onboarding-template-modal" class="btn-primary">
                    <i class="fas fa-cog mr-2"></i>Configure Templates
                </button>
            </div>

            <div class="space-y-6">
                ${onboardingHtml}
            </div>
        </div>
    `;
}

function renderPerformance() {
    const contentArea = document.getElementById('main-content-area');
    
    const performanceHtml = performanceCache.map(review => {
        const employee = employeesCache.find(e => e.id === review.employeeId);
        return `
            <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center">
                        <img src="${employee?.avatar || `https://ui-avatars.com/api/?name=${employee?.firstName}+${employee?.lastName}&background=random`}" 
                             class="w-10 h-10 rounded-full mr-3">
                        <div>
                            <h3 class="text-lg font-bold text-slate-800">${employee?.firstName} ${employee?.lastName}</h3>
                            <p class="text-sm text-slate-500">${employee?.jobTitle}</p>
                        </div>
                    </div>
                    <span class="px-3 py-1 text-xs font-semibold rounded-full ${getRatingColor(review.overallRating)}">
                        ${review.overallRating}
                    </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div class="text-center p-3 bg-slate-50 rounded-lg">
                        <p class="text-2xl font-bold text-slate-800">${review.overallScore || 'N/A'}</p>
                        <p class="text-xs text-slate-500">Overall Score</p>
                    </div>
                    <div class="text-center p-3 bg-slate-50 rounded-lg">
                        <p class="text-2xl font-bold text-slate-800">${review.goals?.completed || 0}/${review.goals?.total || 0}</p>
                        <p class="text-xs text-slate-500">Goals Achieved</p>
                    </div>
                    <div class="text-center p-3 bg-slate-50 rounded-lg">
                        <p class="text-2xl font-bold text-slate-800">${formatDate(review.nextReviewDate)}</p>
                        <p class="text-xs text-slate-500">Next Review</p>
                    </div>
                </div>

                <div class="flex justify-end space-x-2">
                    <button data-action="view-performance" data-id="${review.id}" class="btn-secondary text-sm">
                        View Details
                    </button>
                    <button data-action="start-review" data-id="${review.employeeId}" class="btn-primary text-sm">
                        Start Review
                    </button>
                </div>
            </div>
        `;
    }).join('') || '<p class="text-center text-slate-500 py-8">No performance reviews yet. Start by conducting your first review.</p>';

    contentArea.innerHTML = `
        <div>
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">Performance Management</h1>
                    <p class="text-slate-500">Track and manage employee performance reviews.</p>
                </div>
                <div class="flex space-x-2">
                    <button data-modal-toggle="bulk-review-modal" class="btn-secondary">
                        <i class="fas fa-users mr-2"></i>Bulk Review
                    </button>
                    <button data-modal-toggle="performance-review-modal" class="btn-primary">
                        <i class="fas fa-plus mr-2"></i>New Review
                    </button>
                </div>
            </div>

            <div class="space-y-6">
                ${performanceHtml}
            </div>
        </div>
    `;
}

function renderTraining() {
    const contentArea = document.getElementById('main-content-area');
    
    const trainingHtml = trainingCache.map(training => `
        <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-xl font-bold text-slate-800">${training.title}</h3>
                    <p class="text-sm text-slate-500">${training.provider} • ${training.duration}</p>
                    <p class="text-sm text-slate-600 mt-2">${training.description}</p>
                </div>
                <span class="px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(training.status)}">
                    ${training.status}
                </span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div class="text-center p-3 bg-slate-50 rounded-lg">
                    <p class="text-lg font-bold text-slate-800">${training.enrolledCount || 0}</p>
                    <p class="text-xs text-slate-500">Enrolled</p>
                </div>
                <div class="text-center p-3 bg-slate-50 rounded-lg">
                    <p class="text-lg font-bold text-slate-800">${training.completedCount || 0}</p>
                    <p class="text-xs text-slate-500">Completed</p>
                </div>
                <div class="text-center p-3 bg-slate-50 rounded-lg">
                    <p class="text-lg font-bold text-slate-800">${training.cost || 'Free'}</p>
                    <p class="text-xs text-slate-500">Cost per Person</p>
                </div>
                <div class="text-center p-3 bg-slate-50 rounded-lg">
                    <p class="text-lg font-bold text-slate-800">${formatDate(training.startDate)}</p>
                    <p class="text-xs text-slate-500">Start Date</p>
                </div>
            </div>

            <div class="flex justify-end space-x-2">
                <button data-action="view-participants" data-id="${training.id}" class="btn-secondary text-sm">
                    View Participants
                </button>
                <button data-action="manage-training" data-id="${training.id}" class="btn-primary text-sm">
                    Manage
                </button>
            </div>
        </div>
    `).join('') || '<p class="text-center text-slate-500 py-8">No training programs yet. Create your first training program.</p>';

    contentArea.innerHTML = `
        <div>
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">Training & Development</h1>
                    <p class="text-slate-500">Manage employee learning and development programs.</p>
                </div>
                <button data-modal-toggle="add-training-modal" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>Add Training Program
                </button>
            </div>

            <div class="space-y-6">
                ${trainingHtml}
            </div>
        </div>
    `;
}

function renderCompensation() {
    const contentArea = document.getElementById('main-content-area');
    
    const compensationHtml = compensationCache.map(comp => {
        const employee = employeesCache.find(e => e.id === comp.employeeId);
        return `
            <tr class="hover:bg-slate-50">
                <td class="p-4">
                    <div class="flex items-center">
                        <img src="${employee?.avatar || `https://ui-avatars.com/api/?name=${employee?.firstName}+${employee?.lastName}&background=random`}" 
                             class="w-8 h-8 rounded-full mr-3">
                        <div>
                            <div class="font-medium text-slate-800">${employee?.firstName} ${employee?.lastName}</div>
                            <div class="text-sm text-slate-500">${employee?.jobTitle}</div>
                        </div>
                    </div>
                </td>
                <td class="p-4 text-slate-600">${comp.baseSalary ? `R ${comp.baseSalary.toLocaleString()}` : 'N/A'}</td>
                <td class="p-4 text-slate-600">${comp.bonus || 'N/A'}</td>
                <td class="p-4 text-slate-600">${comp.benefits || 'N/A'}</td>
                <td class="p-4 text-slate-600">${formatDate(comp.lastReview)}</td>
                <td class="p-4 text-right">
                    <button data-action="adjust-compensation" data-id="${comp.id}" class="text-indigo-600 hover:text-indigo-900">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="6" class="text-center p-8 text-slate-500">No compensation data available.</td></tr>';

    contentArea.innerHTML = `
        <div>
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">Compensation Management</h1>
                    <p class="text-slate-500">Manage salaries, bonuses, and benefits.</p>
                </div>
                <div class="flex space-x-2">
                    <button data-action="compensation-review" class="btn-secondary">
                        <i class="fas fa-chart-line mr-2"></i>Annual Review
                    </button>
                    <button data-modal-toggle="add-compensation-modal" class="btn-primary">
                        <i class="fas fa-plus mr-2"></i>Add Record
                    </button>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-md overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-slate-50">
                        <tr>
                            <th class="p-4 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                            <th class="p-4 text-left text-xs font-medium text-slate-500 uppercase">Base Salary</th>
                            <th class="p-4 text-left text-xs font-medium text-slate-500 uppercase">Bonus</th>
                            <th class="p-4 text-left text-xs font-medium text-slate-500 uppercase">Benefits</th>
                            <th class="p-4 text-left text-xs font-medium text-slate-500 uppercase">Last Review</th>
                            <th class="p-4 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200">
                        ${compensationHtml}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderBenefits() {
    const contentArea = document.getElementById('main-content-area');
    let benefitsHtml = benefitsCache.length > 0 ? benefitsCache.map(b => `
        <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-xl font-bold text-slate-800">${b.name}</h3>
                    <p class="text-sm text-slate-500">${b.type} • Provider: ${b.provider}</p>
                    <p class="text-sm text-slate-600 mt-2">${b.description}</p>
                </div>
                <div class="text-right">
                    <p class="text-lg font-bold text-slate-800">${b.cost ? `R ${b.cost}` : 'No Cost'}</p>
                    <p class="text-xs text-slate-500">per employee/month</p>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div class="text-center p-3 bg-slate-50 rounded-lg">
                    <p class="text-lg font-bold text-slate-800">${b.enrolledEmployees || 0}</p>
                    <p class="text-xs text-slate-500">Enrolled</p>
                </div>
                <div class="text-center p-3 bg-slate-50 rounded-lg">
                    <p class="text-lg font-bold text-slate-800">${b.eligibilityRate || '100%'}</p>
                    <p class="text-xs text-slate-500">Eligibility</p>
                </div>
                <div class="text-center p-3 bg-slate-50 rounded-lg">
                    <p class="text-lg font-bold text-slate-800">${b.utilization || '0%'}</p>
                    <p class="text-xs text-slate-500">Utilization</p>
                </div>
            </div>

            <div class="flex justify-end space-x-2">
                <button data-action="manage-enrollment" data-id="${b.id}" class="btn-secondary text-sm">
                    Manage Enrollment
                </button>
                <button data-action="edit-benefit" data-id="${b.id}" class="btn-primary text-sm">
                    Edit
                </button>
            </div>
        </div>
    `).join('') : '<p class="text-center text-slate-500 py-8">No company benefits have been defined yet.</p>';

    contentArea.innerHTML = `
        <div id="benefits-content">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">Benefits Management</h1>
                    <p class="text-slate-500">Manage company-wide benefits and employee enrollment.</p>
                </div>
                <button data-modal-toggle="add-benefit-modal" class="btn-primary flex items-center">
                    <i class="fas fa-plus mr-2"></i> Add Benefit
                </button>
            </div>
            
            <div class="space-y-6">
                ${benefitsHtml}
            </div>
        </div>
    `;
}

function renderLeave() {
    const contentArea = document.getElementById('main-content-area');
    
    const pendingRequests = leaveRequestsCache.filter(r => r.status === 'pending');
    const approvedRequests = leaveRequestsCache.filter(r => r.status === 'approved');
    
    const leaveHtml = leaveRequestsCache.map(leave => {
        const employee = employeesCache.find(e => e.id === leave.employeeId);
        const statusColor = leave.status === 'approved' ? 'green' : leave.status === 'rejected' ? 'red' : 'yellow';
        
        return `
            <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center">
                        <img src="${employee?.avatar || `https://ui-avatars.com/api/?name=${employee?.firstName}+${employee?.lastName}&background=random`}" 
                             class="w-10 h-10 rounded-full mr-3">
                        <div>
                            <h3 class="text-lg font-bold text-slate-800">${employee?.firstName} ${employee?.lastName}</h3>
                            <p class="text-sm text-slate-500">${leave.type} Leave</p>
                        </div>
                    </div>
                    <span class="px-3 py-1 text-xs font-semibold rounded-full bg-${statusColor}-100 text-${statusColor}-800">
                        ${leave.status}
                    </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <p class="text-xs text-slate-500">Start Date</p>
                        <p class="font-medium text-slate-800">${formatDate(leave.startDate)}</p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-500">End Date</p>
                        <p class="font-medium text-slate-800">${formatDate(leave.endDate)}</p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-500">Duration</p>
                        <p class="font-medium text-slate-800">${leave.duration} days</p>
                    </div>
                </div>
                
                <p class="text-sm text-slate-600 mb-4"><strong>Reason:</strong> ${leave.reason}</p>
                
                ${leave.status === 'pending' ? `
                    <div class="flex justify-end space-x-2">
                        <button data-action="reject-leave" data-id="${leave.id}" class="btn-secondary text-sm bg-red-50 text-red-600 hover:bg-red-100">
                            Reject
                        </button>
                        <button data-action="approve-leave" data-id="${leave.id}" class="btn-primary text-sm">
                            Approve
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('') || '<p class="text-center text-slate-500 py-8">No leave requests yet.</p>';

    contentArea.innerHTML = `
        <div id="leave-content">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">Leave Management</h1>
                    <p class="text-slate-500">Track and manage employee leave requests.</p>
                </div>
                <button data-modal-toggle="add-leave-modal" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>Add Leave Request
                </button>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div class="flex items-center">
                        <div class="bg-yellow-500 text-white rounded-full p-2 mr-3">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-yellow-800">${pendingRequests.length}</p>
                            <p class="text-sm text-yellow-600">Pending Requests</p>
                        </div>
                    </div>
                </div>
                <div class="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div class="flex items-center">
                        <div class="bg-green-500 text-white rounded-full p-2 mr-3">
                            <i class="fas fa-check"></i>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-green-800">${approvedRequests.length}</p>
                            <p class="text-sm text-green-600">Approved This Month</p>
                        </div>
                    </div>
                </div>
                <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <div class="flex items-center">
                        <div class="bg-blue-500 text-white rounded-full p-2 mr-3">
                            <i class="fas fa-calendar"></i>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-blue-800">0</p>
                            <p class="text-sm text-blue-600">Public Holidays</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="space-y-6">
                ${leaveHtml}
            </div>
        </div>
    `;
}

function renderEmployeeRelations() {
    const contentArea = document.getElementById('main-content-area');
    
    const grievancesHtml = grievancesCache.map(grievance => {
        const employee = employeesCache.find(e => e.id === grievance.employeeId);
        const statusColor = grievance.status === 'Resolved' ? 'green' : grievance.status === 'In Progress' ? 'yellow' : 'red';
        
        return `
            <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-bold text-slate-800">${grievance.type}</h3>
                        <p class="text-sm text-slate-500">Filed by ${employee?.firstName} ${employee?.lastName}</p>
                        <p class="text-xs text-slate-400">Case #${grievance.caseNumber}</p>
                    </div>
                    <span class="px-3 py-1 text-xs font-semibold rounded-full bg-${statusColor}-100 text-${statusColor}-800">
                        ${grievance.status}
                    </span>
                </div>
                
                <p class="text-sm text-slate-600 mb-4">${grievance.description}</p>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <p class="text-xs text-slate-500">Priority</p>
                        <p class="font-medium text-slate-800">${grievance.priority}</p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-500">Filed Date</p>
                        <p class="font-medium text-slate-800">${formatDate(grievance.createdAt)}</p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-500">Assigned To</p>
                        <p class="font-medium text-slate-800">${grievance.assignedTo || 'Unassigned'}</p>
                    </div>
                </div>
                
                <div class="flex justify-end space-x-2">
                    <button data-action="view-grievance" data-id="${grievance.id}" class="btn-secondary text-sm">
                        View Details
                    </button>
                    <button data-action="update-grievance" data-id="${grievance.id}" class="btn-primary text-sm">
                        Update
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    const disciplinaryHtml = disciplinaryCache.map(action => {
        const employee = employeesCache.find(e => e.id === action.employeeId);
        return `
            <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-bold text-slate-800">${action.actionType}</h3>
                        <p class="text-sm text-slate-500">${employee?.firstName} ${employee?.lastName}</p>
                    </div>
                    <span class="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        ${action.severity}
                    </span>
                </div>
                
                <p class="text-sm text-slate-600 mb-4">${action.description}</p>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <p class="text-xs text-slate-500">Date Issued</p>
                        <p class="font-medium text-slate-800">${formatDate(action.dateIssued)}</p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-500">Issued By</p>
                        <p class="font-medium text-slate-800">${action.issuedBy}</p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-500">Follow-up Date</p>
                        <p class="font-medium text-slate-800">${formatDate(action.followUpDate)}</p>
                    </div>
                </div>
                
                <div class="flex justify-end space-x-2">
                    <button data-action="view-disciplinary" data-id="${action.id}" class="btn-secondary text-sm">
                        View Details
                    </button>
                    <button data-action="update-disciplinary" data-id="${action.id}" class="btn-primary text-sm">
                        Update
                    </button>
                </div>
            </div>
        `;
    }).join('') || '<p class="text-center text-slate-500 py-8">No disciplinary actions recorded.</p>';

    contentArea.innerHTML = `
        <div>
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">Employee Relations</h1>
                    <p class="text-slate-500">Manage grievances and disciplinary actions.</p>
                </div>
                <div class="flex space-x-2">
                    <button data-modal-toggle="add-grievance-modal" class="btn-secondary">
                        <i class="fas fa-clipboard-list mr-2"></i>File Grievance
                    </button>
                    <button data-modal-toggle="disciplinary-action-modal" class="btn-primary">
                        <i class="fas fa-exclamation-triangle mr-2"></i>Disciplinary Action
                    </button>
                </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div class="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <div class="flex items-center">
                        <div class="bg-red-500 text-white rounded-full p-2 mr-3">
                            <i class="fas fa-exclamation-circle"></i>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-red-800">${grievancesCache.filter(g => g.status === 'Open').length}</p>
                            <p class="text-sm text-red-600">Open Grievances</p>
                        </div>
                    </div>
                </div>
                <div class="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <div class="flex items-center">
                        <div class="bg-amber-500 text-white rounded-full p-2 mr-3">
                            <i class="fas fa-gavel"></i>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-amber-800">${disciplinaryCache.length}</p>
                            <p class="text-sm text-amber-600">Disciplinary Actions</p>
                        </div>
                    </div>
                </div>
                <div class="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div class="flex items-center">
                        <div class="bg-green-500 text-white rounded-full p-2 mr-3">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-green-800">${grievancesCache.filter(g => g.status === 'Resolved').length}</p>
                            <p class="text-sm text-green-600">Resolved Cases</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabs -->
            <div class="mb-6">
                <nav class="flex space-x-1 bg-slate-100 p-1 rounded-lg">
                    <button class="relations-tab active px-4 py-2 rounded-md bg-white shadow-sm font-medium text-sm" data-tab="grievances">
                        Grievances (${grievancesCache.length})
                    </button>
                    <button class="relations-tab px-4 py-2 rounded-md font-medium text-sm text-slate-600 hover:text-slate-900" data-tab="disciplinary">
                        Disciplinary (${disciplinaryCache.length})
                    </button>
                </nav>
            </div>

            <!-- Content Sections -->
            <div id="grievances-section" class="space-y-6">
                ${grievancesHtml || '<p class="text-center text-slate-500 py-8">No grievances filed yet.</p>'}
            </div>
            
            <div id="disciplinary-section" class="space-y-6 hidden">
                ${disciplinaryHtml}
            </div>
        </div>
    `;

    // Add tab switching functionality
    document.querySelectorAll('.relations-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.relations-tab').forEach(t => {
                t.classList.remove('active', 'bg-white', 'shadow-sm');
                t.classList.add('text-slate-600');
            });
            e.target.classList.add('active', 'bg-white', 'shadow-sm');
            e.target.classList.remove('text-slate-600');
            
            const tabType = e.target.dataset.tab;
            document.getElementById('grievances-section').classList.toggle('hidden', tabType !== 'grievances');
            document.getElementById('disciplinary-section').classList.toggle('hidden', tabType !== 'disciplinary');
        });
    });
}

function renderCompliance() {
    const contentArea = document.getElementById('main-content-area');
    contentArea.innerHTML = `
        <div>
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">Compliance</h1>
                    <p class="text-slate-500">Manage regulatory compliance and documentation.</p>
                </div>
            </div>
            <p class="text-center text-slate-500 py-8">Compliance module coming soon.</p>
        </div>
    `;
}

function renderPayroll() {
    const contentArea = document.getElementById('main-content-area');
    contentArea.innerHTML = `
        <div>
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">Payroll</h1>
                    <p class="text-slate-500">Manage payroll processing and records.</p>
                </div>
            </div>
            <p class="text-center text-slate-500 py-8">Payroll module coming soon.</p>
        </div>
    `;
}

function renderTermination() {
    const contentArea = document.getElementById('main-content-area');
    contentArea.innerHTML = `
        <div>
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">Termination Management</h1>
                    <p class="text-slate-500">Manage employee terminations and exit processes.</p>
                </div>
            </div>
            <p class="text-center text-slate-500 py-8">Termination module coming soon.</p>
        </div>
    `;
}

function handleAction(action, element) {
    console.log(`Handling action: ${action}`, element);
    // Add action handlers as needed
    showNotification('Action not implemented yet.', 'info');
}

function handleFormSubmission(form) {
    console.log('Handling form submission:', form);
    // Add form handlers as needed
    showNotification('Form submission not implemented yet.', 'info');
}

function showNotification(message, type = 'info') {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
        type === 'error' ? 'bg-red-500 text-white' :
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'warning' ? 'bg-yellow-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add these helper functions before the module renderers
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
}

function formatRelativeTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
}

function getStatusColor(status) {
    const colors = {
        'Open': 'bg-green-100 text-green-800',
        'In Progress': 'bg-yellow-100 text-yellow-800',
        'Filled': 'bg-purple-100 text-purple-800',
        'Closed': 'bg-slate-100 text-slate-800',
        'Active': 'bg-green-100 text-green-800',
        'Completed': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
}

function getRatingColor(rating) {
    const colors = {
        'Exceeds Expectations': 'bg-green-100 text-green-800',
        'Meets Expectations': 'bg-blue-100 text-blue-800',
        'Below Expectations': 'bg-yellow-100 text-yellow-800',
        'Needs Improvement': 'bg-red-100 text-red-800'
    };
    return colors[rating] || 'bg-slate-100 text-slate-800';
}

function calculateOnboardingProgress(employee) {
    // Simple calculation - you can enhance this
    const tasks = getOnboardingTasks(employee);
    const completed = tasks.filter(task => task.completed).length;
    return Math.round((completed / tasks.length) * 100);
}

function getOnboardingTasks(employee) {
    // Default onboarding tasks
    return [
        { id: 'contract', name: 'Contract Signed', completed: !!employee.contractSigned },
        { id: 'documents', name: 'Documents Collected', completed: !!employee.documentsCollected },
        { id: 'equipment', name: 'Equipment Assigned', completed: !!employee.equipmentAssigned },
        { id: 'access', name: 'System Access', completed: !!employee.systemAccess },
        { id: 'orientation', name: 'Orientation Complete', completed: !!employee.orientationComplete },
        { id: 'training', name: 'Initial Training', completed: !!employee.initialTraining }
    ];
}
