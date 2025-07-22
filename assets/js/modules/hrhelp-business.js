/* ================================================================================= */
/* FILE: assets/js/modules/hrhelp-business.js (Business HR Hub Foundation)           */
/* PURPOSE: Provides the foundational structure for a full HR management system,     */
/* including employee directory, and placeholders for leave and performance.         */
/* ================================================================================= */
import { auth, db } from '../firebase-config.js';
import { getDocument, updateDocument, addDocument } from '../database.js';
import { doc, onSnapshot, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let currentUser = null;
let businessId = null; // Assuming one business per user for now
let employees = [];

export function init(user) {
    if (!user) return;
    currentUser = user;
    // For simplicity in this version, we'll use the user's UID as the business ID.
    // A real app would have a way to create/select a business.
    businessId = currentUser.uid; 
    console.log("Business HR module initialized for business:", businessId);

    const businessWorkspace = document.getElementById('business-workspace');
    businessWorkspace.innerHTML = getBusinessWorkspaceHTML();

    attachTabListeners();
    renderTabContent('employees'); // Default to employees tab
}

function attachTabListeners() {
    document.querySelectorAll('#business-workspace .tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const tabName = e.currentTarget.dataset.tab;
            document.querySelectorAll('#business-workspace .tab-button').forEach(btn => btn.classList.remove('active'));
            e.currentTarget.classList.add('active');
            renderTabContent(tabName);
        });
    });
}

function renderTabContent(tabName) {
    const contentContainer = document.getElementById('business-tab-content');
    if (!contentContainer) return;

    switch (tabName) {
        case 'employees': renderEmployeeDirectory(contentContainer); break;
        case 'leave': contentContainer.innerHTML = `<p class="text-center text-slate-500">Leave Management System - Coming Soon</p>`; break;
        case 'performance': contentContainer.innerHTML = `<p class="text-center text-slate-500">Performance Review System - Coming Soon</p>`; break;
    }
}

async function renderEmployeeDirectory(container) {
    // In a real app, you'd fetch employees linked to the businessId
    // For now, we'll just show the current user as the only "employee"
    const userDoc = await getDocument('users', currentUser.uid);
    employees = [userDoc];

    const employeesHtml = employees.map(emp => `
        <div class="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
            <div class="flex items-center">
                <img src="${emp.lifeCv?.profilePictures?.primary || 'https://placehold.co/40x40/E2E8F0/475569?text=U'}" class="w-12 h-12 rounded-full object-cover">
                <div class="ml-4">
                    <p class="font-bold text-slate-800">${emp.profile?.displayName}</p>
                    <p class="text-sm text-slate-500">${emp.email}</p>
                </div>
            </div>
            <button class="btn-secondary text-sm">View Profile</button>
        </div>
    `).join('');
    
    container.innerHTML = `
         <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-slate-800">Employee Directory</h2>
            <button id="add-employee-btn" class="btn-primary text-sm">Add Employee</button>
        </div>
        <div class="space-y-4">${employeesHtml}</div>
    `;

    document.getElementById('add-employee-btn').addEventListener('click', () => alert("Inviting employees will be enabled soon."));
}


// --- HTML TEMPLATE ---
function getBusinessWorkspaceHTML() {
    return `
        <div class="border-b border-slate-200">
            <nav class="-mb-px flex space-x-8" id="business-tabs">
                <button data-tab="employees" class="tab-button active ...">Employees</button>
                <button data-tab="leave" class="tab-button ...">Leave</button>
                <button data-tab="performance" class="tab-button ...">Performance</button>
            </nav>
        </div>
        <div id="business-tab-content" class="py-6"></div>
    `;
}
