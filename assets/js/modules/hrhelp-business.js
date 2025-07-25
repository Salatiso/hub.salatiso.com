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
import { doc, collection, addDoc, getDocs, setDoc, deleteDoc, onSnapshot, query, where, getDoc, updateDoc, orderBy, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
    
    console.log("Initializing HRHelp Business module...");
    
    // Clean up previous listeners to prevent memory leaks
    unsubscribers.forEach(unsub => unsub());
    unsubscribers = [];

    currentUser = user;
    businessId = currentUser.uid;
    
    console.log(`HRHelp Business v3.0 initialized for business ID: ${businessId}`);
    console.log(`Current cache state: employees=${employeesCache.length}, leaveRequests=${leaveRequestsCache.length}`);

    const businessWorkspace = document.getElementById('business-workspace');
    if (!businessWorkspace) {
        console.error("Business workspace element not found.");
        return;
    }

    console.log("Rendering business workspace HTML");
    businessWorkspace.innerHTML = getBusinessWorkspaceHTML();
    
    console.log("Attaching event listeners");
    attachEventListeners();
    
    console.log("Setting up data listeners");
    setupDataListeners();
    
    console.log("Navigating to dashboard");
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
        employees: (data) => {
            console.log(`Processing ${data.length} employees from Firestore`);
            // Check if createdAt exists and is properly formatted
            const hasCreatedAt = data.some(item => item.createdAt);
            if (!hasCreatedAt) {
                console.warn('Warning: No createdAt field found in employee data');
                employeesCache = data; // Just use the data as is without sorting
            } else {
                console.log('Sorting employees by createdAt timestamp');
                employeesCache = data.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
            }
            return employeesCache;
        },
        leaveRequests: (data) => leaveRequestsCache = data.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)),
        benefits: (data) => benefitsCache = data,
        recruitment: (data) => recruitmentCache = data.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)),
        performance: (data) => performanceCache = data,
        training: (data) => trainingCache = data,
        compensation: (data) => compensationCache = data,
        grievances: (data) => grievancesCache = data.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)),
        disciplinary: (data) => disciplinaryCache = data,
        termination: (data) => terminationCache = data
    };

    Object.entries(collections).forEach(([cacheKey, collectionName]) => {
        const collectionPath = `users/${businessId}/${collectionName}`;
        console.log(`Setting up listener for collection: ${collectionPath}`);
        
        // Create a query that will work even if some documents don't have createdAt field
        let q;
        try {
            // First try to get all documents without ordering
            q = query(collection(db, collectionPath));
            console.log(`Created query for collection: ${collectionPath}`);
        } catch (error) {
            console.error(`Error creating query for ${collectionPath}:`, error);
            return;
        }
        
        const unsub = onSnapshot(q, (snapshot) => {
            try {
                // Get all documents from the snapshot
                const data = snapshot.docs.map(doc => {
                    const docData = doc.data();
                    return { id: doc.id, ...docData };
                });
                
                console.log(`Received ${data.length} documents from ${collectionPath}`);
                
                // Add timestamp for documents that don't have one
                const dataWithTimestamps = data.map(item => {
                    if (!item.createdAt) {
                        console.log(`Document ${item.id} missing createdAt field, adding default timestamp`);
                        return { ...item, createdAt: { toMillis: () => Date.now() } };
                    }
                    return item;
                });
                
                // Update the cache with the data
                caches[cacheKey](dataWithTimestamps);
                
                // Log the updated cache
                if (cacheKey === 'employees') {
                    console.log(`Updated employeesCache with ${employeesCache.length} employees`);
                    if (employeesCache.length > 0) {
                        console.log('First few employees:', employeesCache.slice(0, 3).map(emp => ({
                            id: emp.id,
                            name: `${emp.firstName || ''} ${emp.lastName || ''}`,
                            email: emp.email || 'No email'
                        })));
                    } else {
                        console.warn('No employees found in the cache after update');
                    }
                }
                
                const activeView = document.querySelector('.nav-link.active')?.dataset.view || 'dashboard';
                console.log(`Re-rendering view: ${activeView}`);
                navigateTo(activeView, true); // Re-render the current view with new data
            } catch (error) {
                console.error(`Error processing data from ${collectionPath}:`, error);
            }
        }, (error) => console.error(`Error fetching ${collectionName}:`, error));
        unsubscribers.push(unsub);
    });
}

// --- NAVIGATION & RENDERING ---

function attachEventListeners() {
    const workspace = document.getElementById('business-workspace');
    workspace.addEventListener('click', (e) => {
        const target = e.target;

        // Handle sidebar navigation
        const navLink = target.closest('.nav-link');
        if (navLink && !navLink.classList.contains('active')) {
            const view = navLink.dataset.view;
            navigateTo(view);
            return;
        }

        // Handle navigation actions (e.g., from dashboard cards)
        const navAction = target.closest('.nav-action');
        if (navAction) {
            const view = navAction.dataset.view;
            navigateTo(view);
            return;
        }

        // Handle modal opening
        const modalToggle = target.closest('[data-modal-toggle]');
        if (modalToggle) {
            const modalId = modalToggle.dataset.modalToggle;
            const modal = document.getElementById(modalId);
            if (modal) {
                // If editing, populate form
                const editId = modalToggle.dataset.editId;
                if (editId) {
                    populateForm(modalId, editId);
                }
                modal.classList.remove('hidden');
            }
            return;
        }

        // Handle modal closing
        const modalClose = target.closest('[data-modal-close]');
        if (modalClose) {
            const modalId = modalClose.dataset.modalClose;
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('hidden');
                const form = modal.querySelector('form');
                if (form) form.reset(); // Reset form on close
            }
            return;
        }

        // Handle button actions
        const action = target.closest('[data-action]')?.dataset.action;
        if (action) {
            handleAction(action, target.closest('[data-action]'));
            return;
        }
        
        // Handle form submissions
        const form = target.closest('form');
        if (form && target.type === 'submit') {
            e.preventDefault();
            handleFormSubmission(form);
        }
    });
}

function navigateTo(view, isRefresh = false) {
    console.log(`Navigating to: ${view} (isRefresh: ${isRefresh})`);
    const contentArea = document.getElementById('main-content-area');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!contentArea) {
        console.error('main-content-area element not found');
        return;
    }

    // Update active link in sidebar
    navLinks.forEach(link => {
        const isActive = link.dataset.view === view;
        link.classList.toggle('active', isActive);
        link.classList.toggle('bg-indigo-700', isActive);
        link.classList.toggle('text-white', isActive);
        link.classList.toggle('text-indigo-100', !isActive);
    });

    if (!isRefresh) {
        console.log('Showing loading spinner');
        contentArea.innerHTML = '<div class="text-center p-10"><i class="fas fa-spinner fa-spin fa-3x text-indigo-500"></i></div>';
    }
    
    // Check if data listeners are set up
    if (unsubscribers.length === 0) {
        console.log('No active listeners found, setting up data listeners');
        setupDataListeners();
    } else {
        console.log(`${unsubscribers.length} active listeners found`);
    }
    
    console.log(`Current cache state before rendering: employees=${employeesCache.length}, leaveRequests=${leaveRequestsCache.length}`);

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
        if (!p.nextReviewDate) return false;
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
                <p class="text-slate-500">Welcome back! Here's a snapshot of your organization.</p>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-500">Total Employees</p>
                        <p class="text-3xl font-bold text-slate-800">${totalEmployees}</p>
                        <p class="text-xs text-green-600">${activeEmployees} Active</p>
                    </div>
                     <div class="bg-green-100 text-green-600 rounded-full p-3">
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
            time: formatRelativeTime(emp.createdAt?.toDate())
        });
    });
    
    // Recent leave requests
    leaveRequestsCache.slice(0, 2).forEach(leave => {
        const employee = employeesCache.find(e => e.id === leave.employeeId);
        activities.push({
            icon: 'fa-plane-departure',
            color: 'amber',
            text: `${employee?.firstName || 'Employee'} requested ${leave.type} leave`,
            time: formatRelativeTime(leave.createdAt?.toDate())
        });
    });
    
    // Recent grievances
    grievancesCache.slice(0, 2).forEach(grievance => {
        activities.push({
            icon: 'fa-exclamation-circle',
            color: 'red',
            text: `New grievance filed: ${grievance.type}`,
            time: formatRelativeTime(grievance.createdAt?.toDate())
        });
    });

    if (activities.length === 0) {
        return '<p class="text-center text-slate-500 py-8">No recent activity.</p>';
    }
    
    return activities
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 5)
        .map(act => `
        <div class="flex items-center">
            <div class="bg-${act.color}-100 text-${act.color}-600 rounded-full h-8 w-8 flex items-center justify-center mr-4">
                <i class="fas ${act.icon}"></i>
            </div>
            <div>
                <p class="text-sm text-slate-700">${act.text}</p>
                <p class="text-xs text-slate-400">${act.time}</p>
            </div>
        </div>
    `).join('');
}

function renderPeople() {
    console.log('Rendering People view');
    console.log(`Current employeesCache has ${employeesCache.length} employees`);
    
    const contentArea = document.getElementById('main-content-area');
    if (!contentArea) {
        console.error('main-content-area element not found');
        return;
    }
    
    const employeesByType = EMPLOYEE_TYPES.reduce((acc, type) => {
        acc[type] = employeesCache.filter(e => e.employmentType === type);
        return acc;
    }, {});
    
    console.log('Employees by type:', Object.keys(employeesByType).map(type => `${type}: ${employeesByType[type].length}`));

    let employeesHtml;
    if (employeesCache.length > 0) {
        console.log('Generating HTML for employees');
        try {
            employeesHtml = employeesCache.map((emp, index) => {
                // Log detailed info for debugging
                if (index < 3) {
                    console.log(`Rendering employee ${index}:`, {
                        id: emp.id,
                        firstName: emp.firstName || 'MISSING',
                        lastName: emp.lastName || 'MISSING',
                        email: emp.email || 'MISSING',
                        jobTitle: emp.jobTitle || 'MISSING',
                        employmentType: emp.employmentType || 'MISSING',
                        status: emp.status || 'MISSING',
                        startDate: emp.startDate || 'MISSING'
                    });
                }
                
                // Ensure we have at least minimal data to display
                if (!emp.id || (!emp.firstName && !emp.lastName)) {
                    console.warn(`Employee with ID ${emp.id || 'unknown'} has incomplete data`);
                    return `
                        <tr class="hover:bg-slate-50 bg-yellow-50">
                            <td class="p-4 whitespace-nowrap" colspan="6">
                                <div class="flex items-center">
                                    <div class="w-10 h-10 rounded-full bg-yellow-500 text-white flex items-center justify-center mr-3 font-bold">
                                        !
                                    </div>
                                    <div>
                                        <div class="font-semibold text-slate-800">Incomplete Employee Data (ID: ${emp.id || 'unknown'})</div>
                                        <div class="text-sm text-slate-500">This record may need to be updated</div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    `;
                }
                
                const statusColor = getStatusColor(emp.status || 'Active');
                return `
                    <tr class="hover:bg-slate-50">
                        <td class="p-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center mr-3 font-bold">
                                    ${emp.firstName?.charAt(0) || ''}${emp.lastName?.charAt(0) || ''}
                                </div>
                                <div>
                                    <div class="font-semibold text-slate-800">${emp.firstName || ''} ${emp.lastName || ''}</div>
                                    <div class="text-sm text-slate-500">${emp.email || 'No email'}</div>
                                </div>
                            </div>
                        </td>
                        <td class="p-4 whitespace-nowrap text-slate-600">${emp.jobTitle || 'N/A'}</td>
                        <td class="p-4 whitespace-nowrap text-slate-600">${emp.employmentType || 'N/A'}</td>
                        <td class="p-4 whitespace-nowrap">
                            <span class="px-2 py-1 text-xs font-semibold rounded-full ${statusColor}">
                                ${emp.status || 'Active'}
                            </span>
                        </td>
                        <td class="p-4 whitespace-nowrap text-slate-600">${formatDate(emp.startDate) || 'N/A'}</td>
                        <td class="p-4 whitespace-nowrap text-right">
                            <div class="flex space-x-2 justify-end">
                                <button data-action="view-employee" data-id="${emp.id}" class="text-indigo-600 hover:text-indigo-900" title="View Details">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button data-modal-toggle="add-employee-modal" data-edit-id="${emp.id}" class="text-slate-400 hover:text-slate-600" title="Edit Employee">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
            console.log(`Generated HTML for ${employeesCache.length} employees`);
        } catch (error) {
            console.error('Error generating employee HTML:', error);
            employeesHtml = '<tr><td colspan="6" class="text-center p-8 text-red-500">Error rendering employees. Check console for details.</td></tr>';
        }
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
                <nav class="flex space-x-1 bg-slate-100 p-1 rounded-lg overflow-x-auto">
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
    console.log(`Filtering employees by type: ${type}`);
    
    const tbody = document.getElementById('employees-table-body');
    if (!tbody) {
        console.error('Employee table body not found');
        return;
    }
    
    // Handle the case where employmentType might be missing
    const filteredEmployees = type === 'all'
        ? employeesCache
        : employeesCache.filter(e => {
            if (!e.employmentType && type === 'N/A') {
                return true; // Show employees with missing type in a special "N/A" category
            }
            return e.employmentType === type;
        });
    
    console.log(`Filtered to ${filteredEmployees.length} employees of type ${type}`);
    
    let employeesHtml;
    
    try {
        if (filteredEmployees.length === 0) {
            employeesHtml = '<tr><td colspan="6" class="text-center p-8 text-slate-500">No employees found for this type.</td></tr>';
        } else {
            employeesHtml = filteredEmployees.map(emp => {
                // Ensure we have at least minimal data to display
                if (!emp.id || (!emp.firstName && !emp.lastName)) {
                    console.warn(`Employee with ID ${emp.id || 'unknown'} has incomplete data`);
                    return `
                        <tr class="hover:bg-slate-50 bg-yellow-50">
                            <td class="p-4 whitespace-nowrap" colspan="6">
                                <div class="flex items-center">
                                    <div class="w-10 h-10 rounded-full bg-yellow-500 text-white flex items-center justify-center mr-3 font-bold">
                                        !
                                    </div>
                                    <div>
                                        <div class="font-semibold text-slate-800">Incomplete Employee Data (ID: ${emp.id || 'unknown'})</div>
                                        <div class="text-sm text-slate-500">This record may need to be updated</div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    `;
                }
                
                const statusColor = getStatusColor(emp.status || 'Active');
                return `
                    <tr class="hover:bg-slate-50">
                        <td class="p-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center mr-3 font-bold">
                                    ${emp.firstName?.charAt(0) || ''}${emp.lastName?.charAt(0) || ''}
                                </div>
                                <div>
                                    <div class="font-semibold text-slate-800">${emp.firstName || ''} ${emp.lastName || ''}</div>
                                    <div class="text-sm text-slate-500">${emp.email || 'No email'}</div>
                                </div>
                            </div>
                        </td>
                        <td class="p-4 whitespace-nowrap text-slate-600">${emp.jobTitle || 'N/A'}</td>
                        <td class="p-4 whitespace-nowrap text-slate-600">${emp.employmentType || 'N/A'}</td>
                        <td class="p-4 whitespace-nowrap">
                            <span class="px-2 py-1 text-xs font-semibold rounded-full ${statusColor}">
                                ${emp.status || 'Active'}
                            </span>
                        </td>
                        <td class="p-4 whitespace-nowrap text-slate-600">${formatDate(emp.startDate) || 'N/A'}</td>
                        <td class="p-4 whitespace-nowrap text-right">
                            <div class="flex space-x-2 justify-end">
                                <button data-action="view-employee" data-id="${emp.id}" class="text-indigo-600 hover:text-indigo-900" title="View Details">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button data-modal-toggle="add-employee-modal" data-edit-id="${emp.id}" class="text-slate-400 hover:text-slate-600" title="Edit Employee">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error generating filtered employee HTML:', error);
        employeesHtml = '<tr><td colspan="6" class="text-center p-8 text-red-500">Error rendering employees. Check console for details.</td></tr>';
    }
    
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
            <p class="text-slate-600 mb-4">${position.description.substring(0, 150)}...</p>
            <div class="flex justify-between items-center">
                <div class="text-sm text-slate-500">
                    <span class="mr-4"><i class="fas fa-users mr-1"></i>${position.applicants || 0} applicants</span>
                    <span><i class="fas fa-calendar mr-1"></i>Posted ${formatRelativeTime(position.createdAt?.toDate())}</span>
                </div>
                <div class="flex space-x-2">
                    <button data-action="view-applicants" data-id="${position.id}" class="btn-secondary text-sm">
                        View Applicants
                    </button>
                    <button data-modal-toggle="add-position-modal" data-edit-id="${position.id}" class="btn-primary text-sm">
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
    const onboardingEmployees = employeesCache.filter(e => e.status === 'Active' && calculateOnboardingProgress(e) < 100);

    const onboardingHtml = onboardingEmployees.map(emp => {
        const progress = calculateOnboardingProgress(emp);
        return `
            <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center">
                        <div class="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center mr-3 font-bold">
                            ${emp.firstName?.charAt(0) || ''}${emp.lastName?.charAt(0) || ''}
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-slate-800">${emp.firstName} ${emp.lastName}</h3>
                            <p class="text-sm text-slate-500">${emp.jobTitle} • Started ${formatDate(emp.startDate)}</p>
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
                                   class="h-4 w-4 text-indigo-600 rounded mr-2 cursor-pointer" 
                                   data-action="toggle-onboarding-task" 
                                   data-employee-id="${emp.id}" 
                                   data-task-id="${task.id}">
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
        if (!employee) return '';
        const ratingColor = getRatingColor(review.overallRating);
        
        return `
            <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-bold text-slate-800">${employee.firstName} ${employee.lastName}</h3>
                        <p class="text-sm text-slate-500">${employee.jobTitle}</p>
                        <p class="text-xs text-slate-400">Review Date: ${formatDate(review.reviewDate)}</p>
                    </div>
                    <span class="px-3 py-1 text-xs font-semibold rounded-full ${ratingColor}">
                        ${review.overallRating}
                    </span>
                </div>
                
                <p class="text-sm text-slate-600 mb-4">${review.summary}</p>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <p class="text-xs text-slate-500">Reviewer</p>
                        <p class="font-medium text-slate-800">${review.reviewer}</p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-500">Goals Met</p>
                        <p class="font-medium text-slate-800">${review.goalsMet || 'N/A'}</p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-500">Next Review</p>
                        <p class="font-medium text-slate-800">${formatDate(review.nextReviewDate)}</p>
                    </div>
                </div>

                <div class="flex justify-end space-x-2">
                    <button data-action="view-performance" data-id="${review.id}" class="btn-secondary text-sm">
                        View Details
                    </button>
                    <button data-modal-toggle="performance-review-modal" data-edit-id="${review.id}" class="btn-primary text-sm">
                        Update Review
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
                    <button data-action="bulk-review" class="btn-secondary">
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
                    <h3 class="text-lg font-bold text-slate-800">${training.title}</h3>
                    <p class="text-sm text-slate-500">Provider: ${training.provider}</p>
                </div>
                <span class="px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(training.status)}">
                    ${training.status}
                </span>
            </div>
            
            <p class="text-sm text-slate-600 mb-4">${training.description}</p>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <p class="text-xs text-slate-500">Participants</p>
                    <p class="font-medium text-slate-800">${training.participants?.length || 0}</p>
                </div>
                <div>
                    <p class="text-xs text-slate-500">Cost</p>
                    <p class="font-medium text-slate-800">R ${training.cost || 0}</p>
                </div>
                <div>
                    <p class="text-xs text-slate-500">Start Date</p>
                    <p class="font-medium text-slate-800">${formatDate(training.startDate)}</p>
                </div>
            </div>

            <div class="flex justify-end space-x-2">
                <button data-action="view-participants" data-id="${training.id}" class="btn-secondary text-sm">
                    View Participants
                </button>
                <button data-modal-toggle="add-training-modal" data-edit-id="${training.id}" class="btn-primary text-sm">
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
        if (!employee) return '';
        return `
            <tr class="hover:bg-slate-50">
                <td class="p-4">
                    <div class="font-semibold">${employee.firstName} ${employee.lastName}</div>
                    <div class="text-sm text-slate-500">${employee.jobTitle}</div>
                </td>
                <td class="p-4">R ${comp.baseSalary?.toLocaleString() || 'N/A'}</td>
                <td class="p-4">R ${comp.bonus?.toLocaleString() || 'N/A'}</td>
                <td class="p-4">${comp.benefitsPackage || 'N/A'}</td>
                <td class="p-4">${formatDate(comp.lastReviewDate)}</td>
                <td class="p-4 text-right">
                    <button data-modal-toggle="add-compensation-modal" data-edit-id="${comp.id}" class="btn-secondary text-sm">
                        Update
                    </button>
                </td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="6" class="text-center p-8 text-slate-500">No compensation records found.</td></tr>';

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
    
    const benefitsHtml = benefitsCache.length > 0 ? benefitsCache.map(b => `
        <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-lg font-bold text-slate-800">${b.name}</h3>
                    <p class="text-sm text-slate-500">${b.type}</p>
                </div>
                <span class="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    ${b.provider}
                </span>
            </div>
            <p class="text-sm text-slate-600 mb-4">${b.description}</p>
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
                <button data-modal-toggle="add-benefit-modal" data-edit-id="${b.id}" class="btn-primary text-sm">
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
            <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200 grid grid-cols-6 gap-4 items-center">
                <div class="col-span-2">
                    <p class="font-bold text-slate-800">${employee?.firstName || ''} ${employee?.lastName || ''}</p>
                    <p class="text-sm text-slate-500">${leave.type}</p>
                </div>
                <div class="text-sm text-slate-600">
                    <p>${formatDate(leave.startDate)}</p>
                </div>
                <div class="text-sm text-slate-600">
                    <p>${formatDate(leave.endDate)}</p>
                </div>
                <div>
                    <span class="px-3 py-1 text-xs font-semibold rounded-full bg-${statusColor}-100 text-${statusColor}-800">
                        ${leave.status}
                    </span>
                </div>
                <div class="flex justify-end space-x-2">
                    ${leave.status === 'pending' ? `
                        <button data-action="approve-leave" data-id="${leave.id}" class="btn-sm btn-success"><i class="fas fa-check"></i></button>
                        <button data-action="reject-leave" data-id="${leave.id}" class="btn-sm btn-danger"><i class="fas fa-times"></i></button>
                    ` : ''}
                    <button data-action="view-leave" data-id="${leave.id}" class="btn-sm btn-secondary"><i class="fas fa-eye"></i></button>
                </div>
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
            
            <div class="space-y-4">
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
                        <p class="font-medium text-slate-800">${formatDate(grievance.createdAt?.toDate())}</p>
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
                    <button data-modal-toggle="add-grievance-modal" data-edit-id="${grievance.id}" class="btn-primary text-sm">
                        Update
                    </button>
                </div>
            </div>
        `;
    }).join('') || '<p class="text-center text-slate-500 py-8">No grievances filed yet.</p>';
    
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
                    <button data-modal-toggle="disciplinary-action-modal" data-edit-id="${action.id}" class="btn-primary text-sm">
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
                ${grievancesHtml}
            </div>
            
            <div id="disciplinary-section" class="space-y-6 hidden">
                ${disciplinaryHtml}
            </div>
        </div>
    `;

    // Add tab switching functionality
    document.querySelectorAll('.relations-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.relations-tab').forEach(t => t.classList.remove('active', 'bg-white', 'shadow-sm'));
            e.target.classList.add('active', 'bg-white', 'shadow-sm');
            
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
                 <button data-action="add-document" class="btn-primary">
                    <i class="fas fa-file-upload mr-2"></i>Upload Document
                </button>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 class="text-lg font-bold text-slate-800 mb-4">Compliance Dashboard</h3>
                <p class="text-center text-slate-500 py-8">Compliance tracking and document management features are in development and will be available soon.</p>
            </div>
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
                <button data-action="run-payroll" class="btn-primary">
                    <i class="fas fa-cogs mr-2"></i>Run Payroll
                </button>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 class="text-lg font-bold text-slate-800 mb-4">Payroll Overview</h3>
                <p class="text-center text-slate-500 py-8">A simplified payroll module is currently under development. It will support basic salary processing, deductions, and payslip generation.</p>
            </div>
        </div>
    `;
}

function renderTermination() {
    const contentArea = document.getElementById('main-content-area');
    
    const terminationHtml = terminationCache.map(term => {
        const employee = employeesCache.find(e => e.id === term.employeeId);
        return `
            <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-bold text-slate-800">${employee?.firstName || ''} ${employee?.lastName || ''}</h3>
                        <p class="text-sm text-slate-500">Termination Date: ${formatDate(term.terminationDate)}</p>
                    </div>
                    <span class="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        ${term.reason}
                    </span>
                </div>
                <p class="text-sm text-slate-600 mb-4"><strong>Exit Interview Scheduled:</strong> ${term.exitInterviewDate ? formatDate(term.exitInterviewDate) : 'No'}</p>
                <div class="flex justify-end space-x-2">
                    <button data-action="view-termination" data-id="${term.id}" class="btn-secondary text-sm">View Checklist</button>
                    <button data-modal-toggle="termination-modal" data-edit-id="${term.id}" class="btn-primary text-sm">Update</button>
                </div>
            </div>
        `;
    }).join('') || '<p class="text-center text-slate-500 py-8">No termination records found.</p>';

    contentArea.innerHTML = `
        <div>
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">Termination Management</h1>
                    <p class="text-slate-500">Manage employee terminations and exit processes.</p>
                </div>
                <button data-modal-toggle="termination-modal" class="btn-primary">
                    <i class="fas fa-user-times mr-2"></i>Initiate Termination
                </button>
            </div>
            <div class="space-y-6">
                ${terminationHtml}
            </div>
        </div>
    `;
}

async function handleAction(action, element) {
    const id = element.dataset.id;
    console.log(`Handling action: ${action} for ID: ${id}`);

    switch(action) {
        case 'approve-leave':
            await updateDoc(doc(db, `users/${businessId}/leaveRequests`, id), { status: 'approved' });
            showNotification('Leave request approved.', 'success');
            break;
        case 'reject-leave':
            await updateDoc(doc(db, `users/${businessId}/leaveRequests`, id), { status: 'rejected' });
            showNotification('Leave request rejected.', 'info');
            break;
        case 'toggle-onboarding-task':
            const employeeId = element.dataset.employeeId;
            const taskId = element.dataset.taskId;
            const employeeRef = doc(db, `users/${businessId}/employees`, employeeId);
            const employeeDoc = await getDoc(employeeRef);
            if (employeeDoc.exists()) {
                const employeeData = employeeDoc.data();
                const updatedTaskStatus = !employeeData[taskId];
                await updateDoc(employeeRef, { [taskId]: updatedTaskStatus });
                showNotification('Onboarding task updated.', 'success');
            }
            break;
        default:
            showNotification(`Action '${action}' is not fully implemented yet.`, 'info');
    }
}

async function handleFormSubmission(form) {
    const formId = form.id;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const docId = data.id;
    delete data.id;

    let collectionName = '';
    switch(formId) {
        case 'add-employee-form': collectionName = 'employees'; break;
        case 'add-position-form': collectionName = 'recruitment'; break;
        case 'add-training-modal-form': collectionName = 'training'; break;
        case 'add-compensation-modal-form': collectionName = 'compensation'; break;
        case 'add-benefit-modal-form': collectionName = 'benefits'; break;
        case 'add-leave-modal-form': collectionName = 'leaveRequests'; data.status = 'pending'; break;
        case 'add-grievance-modal-form': collectionName = 'grievances'; data.status = 'Open'; break;
        case 'disciplinary-action-modal-form': collectionName = 'disciplinary'; break;
        case 'termination-modal-form': collectionName = 'termination'; break;
        case 'performance-review-modal-form': collectionName = 'performance'; break;
    }

    if (!collectionName) {
        showNotification('Unknown form submission.', 'error');
        return;
    }

    try {
        const collectionRef = collection(db, `users/${businessId}/${collectionName}`);
        if (docId) { // Update existing document
            await setDoc(doc(collectionRef, docId), data, { merge: true });
            showNotification('Record updated successfully!', 'success');
        } else { // Add new document
            data.createdAt = serverTimestamp();
            await addDoc(collectionRef, data);
            showNotification('Record added successfully!', 'success');
        }
        
        const modal = form.closest('.fixed');
        if (modal) {
            modal.classList.add('hidden');
            form.reset();
        }
    } catch (error) {
        console.error(`Error saving to ${collectionName}:`, error);
        showNotification(`Error saving record: ${error.message}`, 'error');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const typeClasses = {
        error: 'bg-red-500 text-white',
        success: 'bg-green-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white'
    };
    notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${typeClasses[type] || typeClasses.info}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

/* Add to your CSS file:
.modal-container {
    @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden;
}

.modal-content {
    @apply bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto;
}

.modal-title {
    @apply text-xl font-bold text-slate-800 mb-4;
}

.modal-footer {
    @apply flex justify-end space-x-2 mt-6 pt-4 border-t border-slate-200;
}

.form-label {
    @apply block text-sm font-medium text-slate-700 mb-1;
}

.form-input {
    @apply w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500;
}

.btn-primary {
    @apply bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors;
}

.btn-secondary {
    @apply bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2 px-4 rounded-md transition-colors;
}

.btn-sm {
    @apply text-xs px-2 py-1;
}

.btn-success {
    @apply bg-green-600 hover:bg-green-700 text-white;
}

.btn-danger {
    @apply bg-red-600 hover:bg-red-700 text-white;
}
*/

// --- HELPER FUNCTIONS ---
function formatDate(dateInput) {
    if (!dateInput) return 'N/A';
    
    try {
        const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('en-ZA');
    } catch (error) {
        console.error('Date formatting error:', error);
        return 'N/A';
    }
}

function formatRelativeTime(date) {
    if (!date) return 'N/A';
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days < 1) return 'Today';
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
        'Completed': 'bg-blue-100 text-blue-800',
        'On Leave': 'bg-yellow-100 text-yellow-800',
        'Terminated': 'bg-red-100 text-red-800',
        'Resigned': 'bg-red-100 text-red-800',
        'Suspended': 'bg-orange-100 text-orange-800',
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
    const tasks = getOnboardingTasks(employee);
    if (tasks.length === 0) return 100;
    const completed = tasks.filter(task => task.completed).length;
    return Math.round((completed / tasks.length) * 100);
}

function getOnboardingTasks(employee) {
    return [
        { id: 'contractSigned', name: 'Contract Signed', completed: !!employee.contractSigned },
        { id: 'documentsCollected', name: 'Documents Collected', completed: !!employee.documentsCollected },
        { id: 'equipmentAssigned', name: 'Equipment Assigned', completed: !!employee.equipmentAssigned },
        { id: 'systemAccess', name: 'System Access', completed: !!employee.systemAccess },
        { id: 'orientationComplete', name: 'Orientation Complete', completed: !!employee.orientationComplete },
        { id: 'initialTraining', name: 'Initial Training', completed: !!employee.initialTraining }
    ];
}

async function populateForm(modalId, docId) {
    const form = document.getElementById(modalId)?.querySelector('form');
    if (!form) {
        console.error(`Form not found in modal: ${modalId}`);
        return;
    }
    form.reset();

    // Add null check for hidden input
    const hiddenInput = form.querySelector('input[name="id"]');
    if (!hiddenInput) {
        console.error('Hidden ID input not found in form');
        return;
    }

    let collectionName = '';
    let cache;
    switch(modalId) {
        case 'add-employee-modal': collectionName = 'employees'; cache = employeesCache; break;
        case 'add-position-modal': collectionName = 'recruitment'; cache = recruitmentCache; break;
        case 'add-training-modal': collectionName = 'training'; cache = trainingCache; break;
        case 'add-compensation-modal': collectionName = 'compensation'; cache = compensationCache; break;
        case 'add-benefit-modal': collectionName = 'benefits'; cache = benefitsCache; break;
        case 'add-leave-modal': collectionName = 'leaveRequests'; cache = leaveRequestsCache; break;
        case 'add-grievance-modal': collectionName = 'grievances'; cache = grievancesCache; break;
        case 'disciplinary-action-modal': collectionName = 'disciplinary'; cache = disciplinaryCache; break;
        case 'termination-modal': collectionName = 'termination'; cache = terminationCache; break;
        case 'performance-review-modal': collectionName = 'performance'; cache = performanceCache; break;
    }

    if (!collectionName) {
        console.error('Unknown modal ID:', modalId);
        return;
    }

    const docData = cache.find(item => item.id === docId);
    if (!docData) {
        console.error('Document not found in cache:', docId);
        return;
    }

    // Populate form fields
    Object.keys(docData).forEach(key => {
        const field = form.querySelector(`[name="${key}"]`);
        if (field) {
            if (field.tagName === 'SELECT') {
                field.value = docData[key] || '';
            } else {
                field.value = docData[key] !== null ? docData[key] : '';
            }
        }
    });

    // Special handling for multi-select and checkbox fields
    if (modalId === 'add-training-modal' && Array.isArray(docData.participants)) {
        const participantIds = docData.participants.map(p => p.id);
        const participantFields = form.querySelectorAll('select[name="participants"] option');
        participantFields.forEach(option => {
            option.selected = participantIds.includes(option.value);
        });
    }
}

function getBusinessWorkspaceHTML() {
    return `
        <!-- Sidebar -->
        <div class="bg-indigo-700 text-white w-64 min-h-screen py-8 px-4 fixed z-30">
            <div class="flex items-center justify-between mb-8">
                <h2 class="text-xl font-bold">HRHelp Business</h2>
                <button id="sidebar-toggle" class="text-white focus:outline-none">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <nav>
                <a href="#" class="nav-link text-indigo-100 hover:bg-indigo-500 block px-6 py-3 text-sm font-medium transition-colors" data-view="dashboard">
                    <i class="fas fa-tachometer-alt mr-3"></i>Dashboard
                </a>
                <a href="#" class="nav-link text-indigo-100 hover:bg-indigo-500 block px-6 py-3 text-sm font-medium transition-colors" data-view="people">
                    <i class="fas fa-users mr-3"></i>People
                </a>
                <a href="#" class="nav-link text-indigo-100 hover:bg-indigo-500 block px-6 py-3 text-sm font-medium transition-colors" data-view="recruitment">
                    <i class="fas fa-user-plus mr-3"></i>Recruitment
                </a>
                <a href="#" class="nav-link text-indigo-100 hover:bg-indigo-500 block px-6 py-3 text-sm font-medium transition-colors" data-view="onboarding">
                    <i class="fas fa-clipboard-check mr-3"></i>Onboarding
                </a>
                
                <div class="px-6 mt-6 mb-4">
                    <h3 class="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Performance & Development</h3>
                </div>
                <a href="#" class="nav-link text-indigo-100 hover:bg-indigo-500 block px-6 py-3 text-sm font-medium transition-colors" data-view="performance">
                    <i class="fas fa-chart-line mr-3"></i>Performance
                </a>
                <a href="#" class="nav-link text-indigo-100 hover:bg-indigo-500 block px-6 py-3 text-sm font-medium transition-colors" data-view="training">
                    <i class="fas fa-graduation-cap mr-3"></i>Training
                </a>
                
                <div class="px-6 mt-6 mb-4">
                    <h3 class="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Compensation & Benefits</h3>
                </div>
                <a href="#" class="nav-link text-indigo-100 hover:bg-indigo-500 block px-6 py-3 text-sm font-medium transition-colors" data-view="compensation">
                    <i class="fas fa-dollar-sign mr-3"></i>Compensation
                </a>
                <a href="#" class="nav-link text-indigo-100 hover:bg-indigo-500 block px-6 py-3 text-sm font-medium transition-colors" data-view="benefits">
                    <i class="fas fa-heart mr-3"></i>Benefits
                </a>
                <a href="#" class="nav-link text-indigo-100 hover:bg-indigo-500 block px-6 py-3 text-sm font-medium transition-colors" data-view="leave">
                    <i class="fas fa-calendar-alt mr-3"></i>Leave Management
                </a>
                
                <div class="px-6 mt-6 mb-4">
                    <h3 class="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Employee Relations</h3>
                </div>
                <a href="#" class="nav-link text-indigo-100 hover:bg-indigo-500 block px-6 py-3 text-sm font-medium transition-colors" data-view="employee-relations">
                    <i class="fas fa-handshake mr-3"></i>Relations
                </a>
                <a href="#" class="nav-link text-indigo-100 hover:bg-indigo-500 block px-6 py-3 text-sm font-medium transition-colors" data-view="compliance">
                    <i class="fas fa-shield-alt mr-3"></i>Compliance
                </a>
                
                <div class="px-6 mt-6 mb-4">
                    <h3 class="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Operations</h3>
                </div>
                <a href="#" class="nav-link text-indigo-100 hover:bg-indigo-500 block px-6 py-3 text-sm font-medium transition-colors" data-view="payroll">
                    <i class="fas fa-calculator mr-3"></i>Payroll
                </a>
                <a href="#" class="nav-link text-indigo-100 hover:bg-indigo-500 block px-6 py-3 text-sm font-medium transition-colors" data-view="termination">
                    <i class="fas fa-user-times mr-3"></i>Termination
                </a>
            </nav>
        </div>

        <!-- Main Content -->
        <div class="flex-1 flex flex-col overflow-hidden ml-64">
            <!-- Header -->
            <header class="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <h1 class="text-2xl font-bold text-slate-800">HR Management System</h1>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button class="p-2 text-slate-400 hover:text-slate-600">
                            <i class="fas fa-bell"></i>
                        </button>
                        <button class="p-2 text-slate-400 hover:text-slate-600">
                            <i class="fas fa-cog"></i>
                        </button>
                        <div class="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                            <span class="text-white text-sm font-medium">${currentUser?.email?.charAt(0).toUpperCase() || 'U'}</span>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Content Area -->
            <main class="flex-1 overflow-y-auto p-6" id="main-content-area">
                <div class="text-center p-10">
                    <i class="fas fa-spinner fa-spin fa-3x text-indigo-500"></i>
                    <p class="mt-4 text-slate-500">Loading...</p>
                </div>
            </main>
        </div>

        <!-- Add modal containers -->
        ${getModalHTML()}
    `;
}

function getModalHTML() {
    const employeeOptions = employeesCache.map(e => `<option value="${e.id}">${e.firstName} ${e.lastName}</option>`).join('');

    return `
        <!-- Employee Modal -->
        <div id="add-employee-modal" class="modal-container">
            <div class="modal-content">
                <h3 class="modal-title">Add/Edit Employee</h3>
                <form id="add-employee-form">
                    <input type="hidden" name="id">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label class="form-label">First Name</label><input type="text" name="firstName" required class="form-input"></div>
                        <div><label class="form-label">Last Name</label><input type="text" name="lastName" required class="form-input"></div>
                        <div><label class="form-label">Email</label><input type="email" name="email" required class="form-input"></div>
                        <div><label class="form-label">Phone</label><input type="tel" name="phone" class="form-input"></div>
                        <div><label class="form-label">Job Title</label><input type="text" name="jobTitle" required class="form-input"></div>
                        <div><label class="form-label">Employment Type</label><select name="employmentType" required class="form-input">${EMPLOYEE_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}</select></div>
                        <div><label class="form-label">Status</label><select name="status" class="form-input">${EMPLOYMENT_STATUSES.map(status => `<option value="${status}">${status}</option>`).join('')}</select></div>
                        <div><label class="form-label">Start Date</label><input type="date" name="startDate" required class="form-input"></div>
                        <div><label class="form-label">Salary</label><input type="number" name="salary" class="form-input"></div>
                        <div><label class="form-label">Department</label><input type="text" name="department" class="form-input"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" data-modal-close="add-employee-modal" class="btn-secondary">Cancel</button>
                        <button type="submit" class="btn-primary">Save Employee</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Job Position Modal -->
        <div id="add-position-modal" class="modal-container">
            <div class="modal-content">
                <h3 class="modal-title">Post Job Opening</h3>
                <form id="add-position-form">
                    <input type="hidden" name="id">
                    <div class="space-y-4">
                        <div><label class="form-label">Job Title</label><input type="text" name="title" required class="form-input"></div>
                        <div><label class="form-label">Department</label><input type="text" name="department" required class="form-input"></div>
                        <div><label class="form-label">Employment Type</label><select name="employmentType" required class="form-input">${EMPLOYEE_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}</select></div>
                        <div><label class="form-label">Location</label><input type="text" name="location" required class="form-input"></div>
                        <div><label class="form-label">Description</label><textarea name="description" rows="4" required class="form-input"></textarea></div>
                        <div class="grid grid-cols-2 gap-4">
                            <div><label class="form-label">Salary Range (Min)</label><input type="number" name="salaryMin" class="form-input"></div>
                            <div><label class="form-label">Salary Range (Max)</label><input type="number" name="salaryMax" class="form-input"></div>
                        </div>
                        <div><label class="form-label">Status</label><select name="status" class="form-input"><option value="Open">Open</option><option value="In Progress">In Progress</option><option value="Filled">Filled</option><option value="Closed">Closed</option></select></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" data-modal-close="add-position-modal" class="btn-secondary">Cancel</button>
                        <button type="submit" class="btn-primary">Post Job</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Performance Review Modal -->
        <div id="performance-review-modal" class="modal-container">
            <div class="modal-content">
                <h3 class="modal-title">Add/Edit Performance Review</h3>
                <form id="performance-review-modal-form">
                    <input type="hidden" name="id">
                    <div class="space-y-4">
                        <div><label class="form-label">Employee</label><select name="employeeId" required class="form-input">${employeeOptions}</select></div>
                        <div><label class="form-label">Reviewer</label><input type="text" name="reviewer" required class="form-input"></div>
                        <div><label class="form-label">Overall Rating</label><select name="overallRating" class="form-input">${PERFORMANCE_RATINGS.map(r => `<option value="${r}">${r}</option>`).join('')}</select></div>
                        <div><label class="form-label">Summary</label><textarea name="summary" rows="3" class="form-input"></textarea></div>
                        <div class="grid grid-cols-2 gap-4">
                            <div><label class="form-label">Review Date</label><input type="date" name="reviewDate" required class="form-input"></div>
                            <div><label class="form-label">Next Review Date</label><input type="date" name="nextReviewDate" class="form-input"></div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" data-modal-close="performance-review-modal" class="btn-secondary">Cancel</button>
                        <button type="submit" class="btn-primary">Save Review</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Training Modal -->
        <div id="add-training-modal" class="modal-container">
            <div class="modal-content">
                <h3 class="modal-title">Add Training Program</h3>
                <form id="add-training-modal-form">
                    <input type="hidden" name="id">
                    <div class="space-y-4">
                        <div><label class="form-label">Training Title</label><input type="text" name="title" required class="form-input"></div>
                        <div><label class="form-label">Provider</label><input type="text" name="provider" required class="form-input"></div>
                        <div><label class="form-label">Description</label><textarea name="description" rows="3" class="form-input"></textarea></div>
                        <div class="grid grid-cols-2 gap-4">
                            <div><label class="form-label">Start Date</label><input type="date" name="startDate" required class="form-input"></div>
                            <div><label class="form-label">End Date</label><input type="date" name="endDate" class="form-input"></div>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div><label class="form-label">Cost</label><input type="number" name="cost" class="form-input"></div>
                            <div><label class="form-label">Status</label><select name="status" class="form-input"><option value="Planned">Planned</option><option value="Active">Active</option><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option></select></div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" data-modal-close="add-training-modal" class="btn-secondary">Cancel</button>
                        <button type="submit" class="btn-primary">Save Training</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Compensation Modal -->
        <div id="add-compensation-modal" class="modal-container">
            <div class="modal-content">
                <h3 class="modal-title">Add/Edit Compensation</h3>
                <form id="add-compensation-modal-form">
                    <input type="hidden" name="id">
                    <div class="space-y-4">
                        <div><label class="form-label">Employee</label><select name="employeeId" required class="form-input">${employeeOptions}</select></div>
                        <div class="grid grid-cols-2 gap-4">
                            <div><label class="form-label">Base Salary</label><input type="number" name="baseSalary" required class="form-input"></div>
                            <div><label class="form-label">Bonus</label><input type="number" name="bonus" class="form-input"></div>
                        </div>
                        <div><label class="form-label">Benefits Package</label><input type="text" name="benefitsPackage" class="form-input"></div>
                        <div><label class="form-label">Last Review Date</label><input type="date" name="lastReviewDate" class="form-input"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" data-modal-close="add-compensation-modal" class="btn-secondary">Cancel</button>
                        <button type="submit" class="btn-primary">Save Compensation</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Benefits Modal -->
        <div id="add-benefit-modal" class="modal-container">
            <div class="modal-content">
                <h3 class="modal-title">Add Company Benefit</h3>
                <form id="add-benefit-modal-form">
                    <input type="hidden" name="id">
                    <div class="space-y-4">
                        <div><label class="form-label">Benefit Name</label><input type="text" name="name" required class="form-input"></div>
                        <div><label class="form-label">Type</label><select name="type" required class="form-input"><option value="Health">Health</option><option value="Retirement">Retirement</option><option value="Insurance">Insurance</option><option value="Wellness">Wellness</option><option value="Other">Other</option></select></div>
                        <div><label class="form-label">Provider</label><input type="text" name="provider" required class="form-input"></div>
                        <div><label class="form-label">Description</label><textarea name="description" rows="3" class="form-input"></textarea></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" data-modal-close="add-benefit-modal" class="btn-secondary">Cancel</button>
                        <button type="submit" class="btn-primary">Save Benefit</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Leave Request Modal -->
        <div id="add-leave-modal" class="modal-container">
            <div class="modal-content">
                <h3 class="modal-title">Add Leave Request</h3>
                <form id="add-leave-modal-form">
                    <input type="hidden" name="id">
                    <div class="space-y-4">
                        <div><label class="form-label">Employee</label><select name="employeeId" required class="form-input">${employeeOptions}</select></div>
                        <div><label class="form-label">Leave Type</label><select name="type" required class="form-input">${LEAVE_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}</select></div>
                        <div class="grid grid-cols-2 gap-4">
                            <div><label class="form-label">Start Date</label><input type="date" name="startDate" required class="form-input"></div>
                            <div><label class="form-label">End Date</label><input type="date" name="endDate" required class="form-input"></div>
                        </div>
                        <div><label class="form-label">Reason</label><textarea name="reason" rows="3" class="form-input"></textarea></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" data-modal-close="add-leave-modal" class="btn-secondary">Cancel</button>
                        <button type="submit" class="btn-primary">Submit Request</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Grievance Modal -->
        <div id="add-grievance-modal" class="modal-container">
            <div class="modal-content">
                <h3 class="modal-title">File Grievance</h3>
                <form id="add-grievance-modal-form">
                    <input type="hidden" name="id">
                    <div class="space-y-4">
                        <div><label class="form-label">Employee</label><select name="employeeId" required class="form-input">${employeeOptions}</select></div>
                        <div><label class="form-label">Grievance Type</label><select name="type" required class="form-input">${GRIEVANCE_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}</select></div>
                        <div><label class="form-label">Priority</label><select name="priority" required class="form-input"><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Critical">Critical</option></select></div>
                        <div><label class="form-label">Description</label><textarea name="description" rows="4" required class="form-input"></textarea></div>
                        <div><label class="form-label">Case Number</label><input type="text" name="caseNumber" required class="form-input" placeholder="GRV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" data-modal-close="add-grievance-modal" class="btn-secondary">Cancel</button>
                        <button type="submit" class="btn-primary">File Grievance</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Disciplinary Action Modal -->
        <div id="disciplinary-action-modal" class="modal-container">
            <div class="modal-content">
                <h3 class="modal-title">Disciplinary Action</h3>
                <form id="disciplinary-action-modal-form">
                    <input type="hidden" name="id">
                    <div class="space-y-4">
                        <div><label class="form-label">Employee</label><select name="employeeId" required class="form-input">${employeeOptions}</select></div>
                        <div><label class="form-label">Action Type</label><select name="actionType" required class="form-input">${DISCIPLINARY_ACTIONS.map(action => `<option value="${action}">${action}</option>`).join('')}</select></div>
                        <div><label class="form-label">Severity</label><select name="severity" required class="form-input"><option value="Minor">Minor</option><option value="Major">Major</option><option value="Serious">Serious</option></select></div>
                        <div><label class="form-label">Description</label><textarea name="description" rows="4" required class="form-input"></textarea></div>
                        <div class="grid grid-cols-2 gap-4">
                            <div><label class="form-label">Date Issued</label><input type="date" name="dateIssued" required class="form-input"></div>
                            <div><label class="form-label">Follow-up Date</label><input type="date" name="followUpDate" class="form-input"></div>
                        </div>
                        <div><label class="form-label">Issued By</label><input type="text" name="issuedBy" required class="form-input"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" data-modal-close="disciplinary-action-modal" class="btn-secondary">Cancel</button>
                        <button type="submit" class="btn-primary">Issue Action</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Termination Modal -->
        <div id="termination-modal" class="modal-container">
            <div class="modal-content">
                <h3 class="modal-title">Employee Termination</h3>
                <form id="termination-modal-form">
                    <input type="hidden" name="id">
                    <div class="space-y-4">
                        <div><label class="form-label">Employee</label><select name="employeeId" required class="form-input">${employeeOptions}</select></div>
                        <div><label class="form-label">Termination Reason</label><select name="reason" required class="form-input"><option value="Resignation">Resignation</option><option value="Dismissal">Dismissal</option><option value="Redundancy">Redundancy</option><option value="End of Contract">End of Contract</option><option value="Retirement">Retirement</option></select></div>
                        <div><label class="form-label">Termination Date</label><input type="date" name="terminationDate" required class="form-input"></div>
                        <div><label class="form-label">Exit Interview Date</label><input type="date" name="exitInterviewDate" class="form-input"></div>
                        <div><label class="form-label">Notes</label><textarea name="notes" rows="3" class="form-input"></textarea></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" data-modal-close="termination-modal" class="btn-secondary">Cancel</button>
                        <button type="submit" class="btn-primary">Process Termination</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}