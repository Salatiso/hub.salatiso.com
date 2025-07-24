/* ================================================================================= */
/* FILE: assets/js/modules/hrhelp-business.js (Business HR Hub Foundation)           */
/* PURPOSE: Provides a comprehensive HR management system with features like employee */
/* directory, payroll, benefits administration, onboarding, compliance, reports,     */
/* leave, and performance management.                                                */
/* ================================================================================= */
import { auth, db } from '../firebase-config.js';
import { doc, onSnapshot, collection, query, where, getDocs, addDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

let currentUser = null;
let businessId = null; // Using currentUser.uid as businessId for simplicity
let employeesCache = []; // Cache for employee data

export function init(user) {
    if (!user) return;
    currentUser = user;
    businessId = currentUser.uid; // For now, use user UID as business ID
    console.log("Business HR module initialized for business:", businessId);

    const businessWorkspace = document.getElementById('business-workspace');
    if (!businessWorkspace) {
        console.error("Fatal Error: business-workspace element not found.");
        return;
    }
    businessWorkspace.innerHTML = getBusinessWorkspaceHTML();

    attachTabListeners();
    renderTabContent('dashboard'); // Default to dashboard
}

function attachTabListeners() {
    const tabs = document.querySelectorAll('#business-tabs .tab-button');
    tabs.forEach(button => {
        button.addEventListener('click', (e) => {
            const tabName = e.currentTarget.dataset.tab;
            tabs.forEach(btn => btn.classList.remove('active'));
            e.currentTarget.classList.add('active');
            renderTabContent(tabName);
        });
    });
}

function renderTabContent(tabName) {
    const contentContainer = document.getElementById('business-tab-content');
    if (!contentContainer) return;

    switch (tabName) {
        case 'dashboard': renderDashboardTab(contentContainer); break;
        case 'employees': renderEmployeeDirectory(contentContainer); break;
        case 'payroll': renderPayrollTab(contentContainer); break;
        case 'benefits': renderBenefitsTab(contentContainer); break;
        case 'onboarding': renderOnboardingTab(contentContainer); break;
        case 'compliance': renderComplianceTab(contentContainer); break;
        case 'reports': renderReportsTab(contentContainer); break;
        case 'leave': renderLeaveTab(contentContainer); break;
        case 'performance': renderPerformanceTab(contentContainer); break;
        default: contentContainer.innerHTML = `<p class="text-center text-slate-500">Content for ${tabName} coming soon.</p>`;
    }
}

async function renderDashboardTab(container) {
    const employeesCollection = collection(db, `users/${currentUser.uid}/employees`);
    const querySnapshot = await getDocs(employeesCollection);
    const totalEmployees = querySnapshot.size;

    container.innerHTML = `
        <h2 class="text-2xl font-bold text-slate-800 mb-6">HR Dashboard</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-blue-100 border-l-4 border-blue-500 p-6 rounded-lg shadow">
                <h3 class="font-semibold text-blue-800">Total Employees</h3>
                <p class="text-3xl font-bold text-blue-900">${totalEmployees}</p>
            </div>
            <div class="bg-red-100 border-l-4 border-red-500 p-6 rounded-lg shadow">
                <h3 class="font-semibold text-red-800">Employees on Leave</h3>
                <p class="text-3xl font-bold text-red-900">Coming Soon</p>
            </div>
            <div class="bg-green-100 border-l-4 border-green-500 p-6 rounded-lg shadow">
                <h3 class="font-semibold text-green-800">Upcoming Birthdays</h3>
                <p class="text-3xl font-bold text-green-900">Coming Soon</p>
            </div>
            <div class="bg-yellow-100 border-l-4 border-yellow-500 p-6 rounded-lg shadow">
                <h3 class="font-semibold text-yellow-800">Recent Hires</h3>
                <p class="text-3xl font-bold text-yellow-900">Coming Soon</p>
            </div>
        </div>
    `;
}

async function renderEmployeeDirectory(container) {
    employeesCache = await fetchCollection('employees');
    const employeesHtml = employeesCache.map(emp => `
        <tr class="hover:bg-slate-50">
            <td class="px-6 py-4 text-sm font-medium text-slate-900">${emp.name}</td>
            <td class="px-6 py-4 text-sm text-slate-600">${emp.email}</td>
            <td class="px-6 py-4 text-sm text-slate-600">${emp.phone || 'N/A'}</td>
            <td class="px-6 py-4 text-right">
                <button data-action="edit-employee" data-id="${emp.id}" class="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                <button data-action="delete-employee" data-id="${emp.id}" class="text-red-500 hover:text-red-700">Delete</button>
            </td>
        </tr>
    `).join('');

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-slate-800">Employee Directory</h2>
            <button id="add-employee-btn" class="btn-primary">Add Employee</button>
        </div>
        <div class="bg-white rounded-lg shadow overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200">
                <thead class="bg-slate-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Phone</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody id="employees-list" class="divide-y divide-slate-200">
                    ${employeesHtml || '<tr><td colspan="4" class="text-center py-10 text-slate-500">No employees found.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;

    document.getElementById('add-employee-btn').addEventListener('click', () => {
        showAddEmployeeForm(container);
    });

    container.addEventListener('click', async (e) => {
        if (e.target.dataset.action === 'edit-employee') {
            const employeeId = e.target.dataset.id;
            const employee = employeesCache.find(emp => emp.id === employeeId);
            showEditEmployeeForm(container, employeeId, employee);
        } else if (e.target.dataset.action === 'delete-employee') {
            if (confirm('Are you sure you want to delete this employee?')) {
                await deleteDocument('employees', e.target.dataset.id);
                showNotification('Employee deleted', 'success');
                renderEmployeeDirectory(container);
            }
        }
    });
}

function showAddEmployeeForm(container) {
    container.innerHTML = `
        <h2 class="text-2xl font-bold text-slate-800 mb-6">Add New Employee</h2>
        <form id="add-employee-form">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="label">Full Name</label>
                    <input type="text" name="name" class="input" required>
                </div>
                <div>
                    <label class="label">Email</label>
                    <input type="email" name="email" class="input" required>
                </div>
                <div>
                    <label class="label">Phone Number</label>
                    <input type="tel" name="phone" class="input">
                </div>
                <div>
                    <label class="label">Date of Birth</label>
                    <input type="date" name="dob" class="input">
                </div>
                <div class="md:col-span-2">
                    <label class="label">Address</label>
                    <textarea name="address" class="input"></textarea>
                </div>
                <div>
                    <label class="label">Salary (Monthly)</label>
                    <input type="number" name="salary" class="input" min="0" step="0.01">
                </div>
                <div>
                    <label class="label">Currency</label>
                    <select name="currency" class="input">
                        <option value="ZAR">ZAR (South African Rand)</option>
                        <option value="USD">USD (US Dollar)</option>
                        <option value="EUR">EUR (Euro)</option>
                    </select>
                </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
                <button type="button" id="cancel-add-employee" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">Add Employee</button>
            </div>
        </form>
    `;

    document.getElementById('cancel-add-employee').addEventListener('click', () => {
        renderEmployeeDirectory(container);
    });

    document.getElementById('add-employee-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const employeeData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            dob: formData.get('dob'),
            address: formData.get('address'),
            salary: parseFloat(formData.get('salary')) || 0,
            currency: formData.get('currency') || 'ZAR',
            createdAt: new Date().toISOString()
        };
        try {
            await saveDocument('employees', employeeData);
            showNotification('Employee added successfully', 'success');
            renderEmployeeDirectory(container);
        } catch (error) {
            showNotification('Error adding employee', 'error');
        }
    });
}

function showEditEmployeeForm(container, employeeId, employee) {
    container.innerHTML = `
        <h2 class="text-2xl font-bold text-slate-800 mb-6">Edit Employee</h2>
        <form id="edit-employee-form" data-id="${employeeId}">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="label">Full Name</label>
                    <input type="text" name="name" class="input" value="${employee.name}" required>
                </div>
                <div>
                    <label class="label">Email</label>
                    <input type="email" name="email" class="input" value="${employee.email}" required>
                </div>
                <div>
                    <label class="label">Phone Number</label>
                    <input type="tel" name="phone" class="input" value="${employee.phone || ''}">
                </div>
                <div>
                    <label class="label">Date of Birth</label>
                    <input type="date" name="dob" class="input" value="${employee.dob || ''}">
                </div>
                <div class="md:col-span-2">
                    <label class="label">Address</label>
                    <textarea name="address" class="input">${employee.address || ''}</textarea>
                </div>
                <div>
                    <label class="label">Salary (Monthly)</label>
                    <input type="number" name="salary" class="input" value="${employee.salary || 0}" min="0" step="0.01">
                </div>
                <div>
                    <label class="label">Currency</label>
                    <select name="currency" class="input">
                        <option value="ZAR" ${employee.currency === 'ZAR' ? 'selected' : ''}>ZAR (South African Rand)</option>
                        <option value="USD" ${employee.currency === 'USD' ? 'selected' : ''}>USD (US Dollar)</option>
                        <option value="EUR" ${employee.currency === 'EUR' ? 'selected' : ''}>EUR (Euro)</option>
                    </select>
                </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
                <button type="button" id="cancel-edit-employee" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">Save Changes</button>
            </div>
        </form>
    `;

    document.getElementById('cancel-edit-employee').addEventListener('click', () => {
        renderEmployeeDirectory(container);
    });

    document.getElementById('edit-employee-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updatedData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            dob: formData.get('dob'),
            address: formData.get('address'),
            salary: parseFloat(formData.get('salary')) || 0,
            currency: formData.get('currency') || 'ZAR',
            createdAt: employee.createdAt
        };
        try {
            await saveDocument('employees', updatedData, employeeId);
            showNotification('Employee updated successfully', 'success');
            renderEmployeeDirectory(container);
        } catch (error) {
            showNotification('Error updating employee', 'error');
        }
    });
}

async function renderPayrollTab(container) {
    employeesCache = await fetchCollection('employees');
    const payrollHtml = employeesCache.map(emp => `
        <tr class="hover:bg-slate-50">
            <td class="px-6 py-4 text-sm font-medium text-slate-900">${emp.name}</td>
            <td class="px-6 py-4 text-sm text-slate-600">${emp.email}</td>
            <td class="px-6 py-4 text-sm font-semibold text-green-600">${emp.currency} ${emp.salary?.toLocaleString() || '0.00'}</td>
        </tr>
    `).join('');

    container.innerHTML = `
        <h2 class="text-2xl font-bold text-slate-800 mb-6">Payroll</h2>
        <div class="bg-white rounded-lg shadow overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200">
                <thead class="bg-slate-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Salary</th>
                    </tr>
                </thead>
                <tbody id="payroll-list" class="divide-y divide-slate-200">
                    ${payrollHtml || '<tr><td colspan="3" class="text-center py-10 text-slate-500">No employees found.</td></tr>'}
                </tbody>
            </table>
        </div>
        <button id="process-payroll-btn" class="btn-primary mt-6">Process Payroll</button>
    `;

    document.getElementById('process-payroll-btn').addEventListener('click', () => {
        showNotification('Payroll processing coming soon.', 'info');
    });
}

function renderBenefitsTab(container) {
    container.innerHTML = `
        <h2 class="text-2xl font-bold text-slate-800 mb-6">Benefits Administration</h2>
        <div class="text-center text-slate-500 py-10 bg-slate-50 rounded-lg">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <p class="mt-2 text-sm font-semibold text-gray-900">Benefits administration coming soon.</p>
            <p class="mt-1 text-sm text-gray-500">Manage employee benefits, including healthcare and perks, with ease.</p>
        </div>
    `;
}

function renderOnboardingTab(container) {
    container.innerHTML = `
        <h2 class="text-2xl font-bold text-slate-800 mb-6">Onboarding Support</h2>
        <div class="text-center text-slate-500 py-10 bg-slate-50 rounded-lg">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="mt-2 text-sm font-semibold text-gray-900">Onboarding support coming soon.</p>
            <p class="mt-1 text-sm text-gray-500">Streamline new hire onboarding with checklists and document management.</p>
        </div>
    `;
}

function renderComplianceTab(container) {
    container.innerHTML = `
        <h2 class="text-2xl font-bold text-slate-800 mb-6">Compliance Management</h2>
        <div class="text-center text-slate-500 py-10 bg-slate-50 rounded-lg">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p class="mt-2 text-sm font-semibold text-gray-900">Compliance management coming soon.</p>
            <p class="mt-1 text-sm text-gray-500">Ensure compliance with tax, social security, and labor regulations.</p>
        </div>
    `;
}

function renderReportsTab(container) {
    container.innerHTML = `
        <h2 class="text-2xl font-bold text-slate-800 mb-6">HR Reports</h2>
        <div class="text-center text-slate-500 py-10 bg-slate-50 rounded-lg">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p class="mt-2 text-sm font-semibold text-gray-900">HR reports coming soon.</p>
            <p class="mt-1 text-sm text-gray-500">Generate insights on employee performance, payroll, and more.</p>
        </div>
    `;
}

function renderLeaveTab(container) {
    container.innerHTML = `
        <h2 class="text-2xl font-bold text-slate-800 mb-6">Leave Management</h2>
        <div class="text-center text-slate-500 py-10 bg-slate-50 rounded-lg">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p class="mt-2 text-sm font-semibold text-gray-900">Leave management coming soon.</p>
            <p class="mt-1 text-sm text-gray-500">Track and manage employee leave requests and balances.</p>
        </div>
    `;
}

function renderPerformanceTab(container) {
    container.innerHTML = `
        <h2 class="text-2xl font-bold text-slate-800 mb-6">Performance Reviews</h2>
        <div class="text-center text-slate-500 py-10 bg-slate-50 rounded-lg">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/>
            </svg>
            <p class="mt-2 text-sm font-semibold text-gray-900">Performance reviews coming soon.</p>
            <p class="mt-1 text-sm text-gray-500">Conduct performance evaluations and set employee goals.</p>
        </div>
    `;
}

async function fetchCollection(collectionName) {
    if (!currentUser) return [];
    try {
        const collectionPath = `users/${currentUser.uid}/${collectionName}`;
        const querySnapshot = await getDocs(collection(db, collectionPath));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error(`Error fetching ${collectionName}:`, error);
        showNotification(`Error loading ${collectionName}`, 'error');
        return [];
    }
}

async function saveDocument(collectionName, data, docId = null) {
    if (!currentUser) return;
    try {
        const collectionPath = `users/${currentUser.uid}/${collectionName}`;
        if (docId) {
            await setDoc(doc(db, collectionPath, docId), data, { merge: true });
            console.log(`Document ${docId} updated in ${collectionName}.`);
        } else {
            await addDoc(collection(db, collectionPath), data);
            console.log(`New document added to ${collectionName}.`);
        }
    } catch (error) {
        console.error(`Error saving to ${collectionName}:`, error);
        throw error;
    }
}

async function deleteDocument(collectionName, docId) {
    if (!currentUser) return;
    try {
        const docPath = `users/${currentUser.uid}/${collectionName}/${docId}`;
        await deleteDoc(doc(db, docPath));
        console.log(`Document ${docId} deleted from ${collectionName}.`);
    } catch (error) {
        console.error(`Error deleting from ${collectionName}:`, error);
        throw error;
    }
}

function getBusinessWorkspaceHTML() {
    return `
        <style>
            .tab-button { padding: 1rem; border-bottom: 3px solid transparent; color: #475569; font-weight: 600; transition: all 0.2s; cursor: pointer; }
            .tab-button:hover { color: #1e293b; }
            .tab-button.active { color: #4f46e5; border-bottom-color: #4f46e5; }
            .btn-primary { background-color: #4f46e5; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; transition: background-color 0.2s; cursor: pointer; }
            .btn-primary:hover { background-color: #4338ca; }
            .btn-secondary { background-color: #e2e8f0; color: #1e293b; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; transition: background-color 0.2s; cursor: pointer; }
            .btn-secondary:hover { background-color: #cbd5e1; }
            .input {