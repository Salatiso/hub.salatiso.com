/* ================================================================================= */
/* FILE: assets/js/modules/finhelp-business.js (Version 2.0 Revised)                 */
/* PURPOSE: Manages the business finance workspace including contacts, sales,        */
/* and purchases, providing a lightweight accounting solution.                       */
/* AUTHOR: Grok                                                              */
/* DATE: October 2023                                                               */
/* REVISION HISTORY:                                                                */
/* v2.0 Revised - 2023/10: Full integration of v1.0 features with v2.0 enhancements */
/* - Restored dashboard metrics, invoice line items, bills, and profit/loss report  */
/* - Enhanced contacts CRM, added recurring invoices and purchase orders            */
/* - Fixed errors with validation, error handling, and UI feedback                  */
/* v2.0 - 2025/07/25: Major overhaul (original)                                     */
/* v1.0 - Initial version                                                           */
/* ================================================================================= */

import { auth, db } from '../firebase-config.js';
import { doc, collection, addDoc, getDocs, setDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- STATE MANAGEMENT ---
let currentUser = null;
let contactsCache = [];
let unsubscribers = [];

/**
 * Initializes the business finance module.
 * @param {object} user - The authenticated Firebase user object.
 */
export async function init(user) {
    if (!user) return;
    currentUser = user;
    console.log("Business finance module initialized for user:", currentUser.uid);

    const businessWorkspace = document.getElementById('business-workspace');
    if (!businessWorkspace) {
        console.error("Fatal Error: business-workspace element not found.");
        return;
    }
    businessWorkspace.innerHTML = getBusinessWorkspaceHTML();

    attachBusinessEventListeners();
    await renderBusinessTabContent('dashboard');
}

/**
 * Cleans up Firestore listeners.
 */
function cleanupListeners() {
    unsubscribers.forEach(unsub => unsub());
    unsubscribers = [];
    console.log("Business module listeners cleaned up.");
}

// --- DATA HANDLING ---

async function fetchCollection(collectionName) {
    if (!currentUser) return [];
    try {
        const collectionPath = `users/${currentUser.uid}/business/main/${collectionName}`;
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
        const collectionPath = `users/${currentUser.uid}/business/main/${collectionName}`;
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
        const docPath = `users/${currentUser.uid}/business/main/${collectionName}/${docId}`;
        await deleteDoc(doc(db, docPath));
        console.log(`Document ${docId} deleted from ${collectionName}.`);
    } catch (error) {
        console.error(`Error deleting from ${collectionName}:`, error);
        throw error;
    }
}

// --- UI RENDERING ---

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
            .input { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; margin-top: 0.25rem; }
            .label { display: block; text-sm; font-medium; color: #374151; }
        </style>
        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="border-b border-slate-200">
                <nav class="-mb-px flex flex-wrap space-x-6" id="business-tabs">
                    <button data-tab="dashboard" class="tab-button active">Dashboard</button>
                    <button data-tab="contacts" class="tab-button">Contacts</button>
                    <button data-tab="sales" class="tab-button">Sales</button>
                    <button data-tab="purchases" class="tab-button">Purchases</button>
                    <button data-tab="reports" class="tab-button">Reports</button>
                </nav>
            </div>
            <div id="business-tab-content" class="mt-6"></div>
        </div>
    `;
}

async function renderBusinessTabContent(tabName) {
    const contentArea = document.getElementById('business-tab-content');
    if (!contentArea) return;

    document.querySelectorAll('#business-tabs .tab-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    cleanupListeners();

    switch (tabName) {
        case 'dashboard':
            await renderDashboardTab(contentArea);
            break;
        case 'contacts':
            await renderContactsTab(contentArea);
            break;
        case 'sales':
            await renderSalesTab(contentArea);
            break;
        case 'purchases':
            await renderPurchasesTab(contentArea);
            break;
        case 'reports':
            await renderReportsTab(contentArea);
            break;
        default:
            contentArea.innerHTML = `<p class="text-center py-10 text-slate-500">Content for ${tabName} coming soon.</p>`;
    }
}

async function renderDashboardTab(container) {
    container.innerHTML = `
        <h2 class="text-2xl font-bold text-slate-800 mb-6">Business Dashboard</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-red-100 border-l-4 border-red-500 p-6 rounded-lg shadow">
                <h4 class="font-semibold text-red-800">Overdue Invoices</h4>
                <p id="db-overdue-invoices" class="text-3xl font-bold mt-1 text-red-900">Loading...</p>
            </div>
            <div class="bg-yellow-100 border-l-4 border-yellow-500 p-6 rounded-lg shadow">
                <h4 class="font-semibold text-yellow-800">Outstanding Revenue</h4>
                <p id="db-outstanding-revenue" class="text-3xl font-bold mt-1 text-yellow-900">Loading...</p>
            </div>
            <div class="bg-blue-100 border-l-4 border-blue-500 p-6 rounded-lg shadow">
                <h4 class="font-semibold text-blue-800">Open Bills</h4>
                <p id="db-open-bills" class="text-3xl font-bold mt-1 text-blue-900">Loading...</p>
            </div>
            <div class="bg-green-100 border-l-4 border-green-500 p-6 rounded-lg shadow">
                <h4 class="font-semibold text-green-800">30-Day Net Profit</h4>
                <p id="db-net-profit" class="text-3xl font-bold mt-1 text-green-900">Loading...</p>
            </div>
        </div>
    `;
    await loadDashboardData();
}

async function loadDashboardData() {
    const invoices = await fetchCollection('invoices');
    const bills = await fetchCollection('bills');
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const overdueInvoices = invoices.reduce((sum, inv) => {
        const dueDate = new Date(inv.dueDate);
        return (inv.status !== 'paid' && dueDate < today) ? sum + (parseFloat(inv.total) || 0) : sum;
    }, 0);

    const outstandingRevenue = invoices.reduce((sum, inv) => {
        return inv.status !== 'paid' ? sum + (parseFloat(inv.total) || 0) : sum;
    }, 0);

    const openBills = bills.reduce((sum, bill) => {
        return bill.status !== 'paid' ? sum + (parseFloat(bill.total) || 0) : sum;
    }, 0);

    const income30Days = invoices.reduce((sum, inv) => {
        const issueDate = new Date(inv.createdAt);
        return (issueDate >= thirtyDaysAgo) ? sum + (parseFloat(inv.total) || 0) : sum;
    }, 0);

    const expenses30Days = bills.reduce((sum, bill) => {
        const billDate = new Date(bill.billDate);
        return (billDate >= thirtyDaysAgo) ? sum + (parseFloat(bill.total) || 0) : sum;
    }, 0);

    const netProfit30Days = income30Days - expenses30Days;

    document.getElementById('db-overdue-invoices').textContent = `R ${overdueInvoices.toLocaleString()}`;
    document.getElementById('db-outstanding-revenue').textContent = `R ${outstandingRevenue.toLocaleString()}`;
    document.getElementById('db-open-bills').textContent = `R ${openBills.toLocaleString()}`;
    document.getElementById('db-net-profit').textContent = `R ${netProfit30Days.toLocaleString()}`;
}

async function renderContactsTab(container) {
    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-slate-800">Contacts</h2>
            <button id="btn-new-contact" class="btn-primary">Add New Contact</button>
        </div>
        <div id="contact-form-container" class="hidden bg-slate-50 p-6 rounded-lg mb-6"></div>
        <div class="bg-white rounded-lg shadow overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200">
                <thead class="bg-slate-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Phone</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody id="contacts-list" class="divide-y divide-slate-200"></tbody>
            </table>
        </div>
    `;
    await loadContactsData();
}

async function loadContactsData() {
    contactsCache = await fetchCollection('contacts');
    const list = document.getElementById('contacts-list');
    list.innerHTML = contactsCache.length > 0 ? contactsCache.map(c => `
        <tr class="hover:bg-slate-50">
            <td class="px-6 py-4 text-sm font-medium text-slate-900">${c.name || 'N/A'}</td>
            <td class="px-6 py-4"><span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">${c.category || 'N/A'}</span></td>
            <td class="px-6 py-4 text-sm text-slate-600">${c.email || 'N/A'}</td>
            <td class="px-6 py-4 text-sm text-slate-600">${c.phone || 'N/A'}</td>
            <td class="px-6 py-4 text-right">
                <button data-action="edit-contact" data-id="${c.id}" class="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                <button data-action="delete-contact" data-id="${c.id}" class="text-red-500 hover:text-red-700">Delete</button>
            </td>
        </tr>
    `).join('') : `<tr><td colspan="5" class="text-center py-10 text-slate-500">No contacts found.</td></tr>`;
}

async function renderSalesTab(container) {
    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-slate-800">Sales</h2>
            <button id="btn-new-invoice" class="btn-primary">Create New Invoice</button>
        </div>
        <div id="invoice-form-container" class="hidden bg-slate-50 p-6 rounded-lg mb-6"></div>
        <div class="bg-white rounded-lg shadow overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200">
                <thead class="bg-slate-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Due Date</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Customer</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody id="invoices-list" class="divide-y divide-slate-200"></tbody>
            </table>
        </div>
    `;
    await loadInvoicesData();
}

async function loadInvoicesData() {
    contactsCache = await fetchCollection('contacts');
    const invoices = await fetchCollection('invoices');
    const list = document.getElementById('invoices-list');
    const statusColors = { paid: 'bg-green-100 text-green-800', sent: 'bg-blue-100 text-blue-800', draft: 'bg-slate-100 text-slate-800' };
    list.innerHTML = invoices.length > 0 ? invoices.map(inv => `
        <tr class="hover:bg-slate-50">
            <td class="px-6 py-4"><span class="px-2 py-1 text-xs font-semibold rounded-full ${statusColors[inv.status] || statusColors.draft}">${inv.status || 'Draft'}</span></td>
            <td class="px-6 py-4 text-sm text-slate-600">${inv.dueDate || 'N/A'}</td>
            <td class="px-6 py-4 text-sm font-medium text-slate-800">${contactsCache.find(c => c.id === inv.customerId)?.name || 'Unknown'}</td>
            <td class="px-6 py-4 text-right text-sm font-semibold">R ${(parseFloat(inv.total) || 0).toLocaleString()}</td>
            <td class="px-6 py-4 text-right">
                <button data-action="edit-invoice" data-id="${inv.id}" class="text-indigo-600 hover:text-indigo-900">Edit</button>
            </td>
        </tr>
    `).join('') : `<tr><td colspan="5" class="text-center py-10 text-slate-500">No invoices yet.</td></tr>`;
}

async function renderPurchasesTab(container) {
    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-slate-800">Purchases</h2>
            <div class="space-x-3">
                <button id="btn-new-bill" class="btn-secondary">Add Bill</button>
                <button id="btn-new-po" class="btn-primary">Create Purchase Order</button>
            </div>
        </div>
        <div id="purchase-form-container" class="hidden bg-slate-50 p-6 rounded-lg mb-6"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white rounded-lg shadow overflow-x-auto">
                <h3 class="text-lg font-semibold text-slate-700 p-4">Bills</h3>
                <table class="min-w-full divide-y divide-slate-200">
                    <thead class="bg-slate-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Due Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Supplier</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="bills-list" class="divide-y divide-slate-200"></tbody>
                </table>
            </div>
            <div class="bg-white rounded-lg shadow overflow-x-auto">
                <h3 class="text-lg font-semibold text-slate-700 p-4">Purchase Orders</h3>
                <table class="min-w-full divide-y divide-slate-200">
                    <thead class="bg-slate-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">PO Number</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Supplier</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="po-list" class="divide-y divide-slate-200"></tbody>
                </table>
            </div>
        </div>
    `;
    await loadPurchasesData();
}

async function loadPurchasesData() {
    contactsCache = await fetchCollection('contacts');
    const bills = await fetchCollection('bills');
    const purchaseOrders = await fetchCollection('purchaseOrders');
    const billsList = document.getElementById('bills-list');
    const poList = document.getElementById('po-list');
    const statusColors = { paid: 'bg-green-100 text-green-800', unpaid: 'bg-yellow-100 text-yellow-800' };

    billsList.innerHTML = bills.length > 0 ? bills.map(b => `
        <tr class="hover:bg-slate-50">
            <td class="px-6 py-4"><span class="px-2 py-1 text-xs font-semibold rounded-full ${statusColors[b.status] || statusColors.unpaid}">${b.status || 'Unpaid'}</span></td>
            <td class="px-6 py-4 text-sm text-slate-600">${b.dueDate || 'N/A'}</td>
            <td class="px-6 py-4 text-sm font-medium text-slate-800">${contactsCache.find(c => c.id === b.supplierId)?.name || 'Unknown'}</td>
            <td class="px-6 py-4 text-right text-sm font-semibold">R ${(parseFloat(b.total) || 0).toLocaleString()}</td>
            <td class="px-6 py-4 text-right">
                <button data-action="edit-bill" data-id="${b.id}" class="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                <button data-action="delete-bill" data-id="${b.id}" class="text-red-500 hover:text-red-700">Delete</button>
            </td>
        </tr>
    `).join('') : `<tr><td colspan="5" class="text-center py-10 text-slate-500">No bills yet.</td></tr>`;

    poList.innerHTML = purchaseOrders.length > 0 ? purchaseOrders.map(po => `
        <tr class="hover:bg-slate-50">
            <td class="px-6 py-4 text-sm text-slate-600">${po.poNumber || 'N/A'}</td>
            <td class="px-6 py-4 text-sm font-medium text-slate-800">${contactsCache.find(c => c.id === po.supplierId)?.name || 'Unknown'}</td>
            <td class="px-6 py-4 text-right text-sm font-semibold">R ${(parseFloat(po.total) || 0).toLocaleString()}</td>
            <td class="px-6 py-4 text-right">
                <button data-action="edit-po" data-id="${po.id}" class="text-indigo-600 hover:text-indigo-900">Edit</button>
            </td>
        </tr>
    `).join('') : `<tr><td colspan="4" class="text-center py-10 text-slate-500">No purchase orders yet.</td></tr>`;
}

async function renderReportsTab(container) {
    container.innerHTML = `
        <h2 class="text-2xl font-bold text-slate-800 mb-6">Reports</h2>
        <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="font-semibold text-lg mb-4">Profit & Loss Statement</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                    <label for="report-start-date" class="label">Start Date</label>
                    <input type="date" id="report-start-date" class="input">
                </div>
                <div>
                    <label for="report-end-date" class="label">End Date</label>
                    <input type="date" id="report-end-date" class="input">
                </div>
                <button id="btn-generate-report" class="btn-primary h-10">Generate Report</button>
            </div>
            <div id="report-results" class="mt-8"></div>
        </div>
    `;
}

// --- FORM RENDERING ---

function renderContactForm(contact = null) {
    const container = document.getElementById('contact-form-container');
    container.classList.remove('hidden');
    const categories = ['Tenant', 'Contractor', 'Service Provider', 'Client', 'Supplier', 'Buyer', 'Seller'];
    const isOther = contact?.category && !categories.includes(contact.category);
    container.innerHTML = `
        <h3 class="text-lg font-bold mb-4">${contact ? 'Edit Contact' : 'Add New Contact'}</h3>
        <form id="contact-form" data-id="${contact?.id || ''}">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="label">Full Name</label>
                    <input type="text" name="name" class="input" value="${contact?.name || ''}" required>
                </div>
                <div>
                    <label class="label">Email Address</label>
                    <input type="email" name="email" class="input" value="${contact?.email || ''}">
                </div>
                <div>
                    <label class="label">Phone Number</label>
                    <input type="tel" name="phone" class="input" value="${contact?.phone || ''}">
                </div>
                <div>
                    <label class="label">Category</label>
                    <select name="category" class="input">
                        ${categories.map(c => `<option value="${c}" ${contact?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                        <option value="Other" ${isOther ? 'selected' : ''}>Other</option>
                    </select>
                    <input type="text" name="category_other" class="input mt-2 ${isOther ? '' : 'hidden'}" value="${isOther ? contact.category : ''}" placeholder="Specify category">
                </div>
                <div class="md:col-span-2">
                    <label class="label">Address</label>
                    <textarea name="address" class="input">${contact?.address || ''}</textarea>
                </div>
                <div>
                    <label class="label">Bank Name</label>
                    <input type="text" name="bankName" class="input" value="${contact?.bankName || ''}">
                </div>
                <div>
                    <label class="label">Account Number</label>
                    <input type="text" name="bankAccountNumber" class="input" value="${contact?.bankAccountNumber || ''}">
                </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
                <button type="button" id="btn-cancel-contact" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">Save Contact</button>
            </div>
        </form>
    `;
    const categorySelect = container.querySelector('select[name="category"]');
    const otherInput = container.querySelector('input[name="category_other"]');
    categorySelect.addEventListener('change', () => otherInput.classList.toggle('hidden', categorySelect.value !== 'Other'));
}

function renderInvoiceForm(invoice = null) {
    const container = document.getElementById('invoice-form-container');
    container.classList.remove('hidden');
    const customerOptions = contactsCache.length > 0 ? 
        contactsCache.map(c => `<option value="${c.id}" ${invoice?.customerId === c.id ? 'selected' : ''}>${c.name}</option>`).join('') : 
        '<option value="" disabled>No contacts available</option>';
    const lineItems = invoice?.lineItems || [{ description: '', quantity: 1, price: 0 }];
    container.innerHTML = `
        <h3 class="text-lg font-bold mb-4">${invoice ? 'Edit Invoice' : 'Create New Invoice'}</h3>
        <form id="invoice-form" data-id="${invoice?.id || ''}">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="label">Customer</label>
                    <select name="customer" class="input" required>${customerOptions}</select>
                </div>
                <div>
                    <label class="label">Due Date</label>
                    <input type="date" name="dueDate" class="input" value="${invoice?.dueDate || ''}" required>
                </div>
            </div>
            <hr class="my-6">
            <h4 class="font-semibold mb-2">Line Items</h4>
            <div id="invoice-line-items" class="space-y-2"></div>
            <button type="button" id="add-line-item" class="text-sm text-indigo-600 hover:underline mt-2">+ Add Line Item</button>
            <div class="mt-4">
                <label class="label font-semibold">Recurring Invoice</label>
                <div class="flex items-center mt-2">
                    <input id="is-recurring" type="checkbox" name="isRecurring" class="h-4 w-4 text-indigo-600" ${invoice?.isRecurring ? 'checked' : ''}>
                    <label for="is-recurring" class="ml-2 text-sm text-gray-900">Set up recurring billing</label>
                </div>
                <div id="recurring-options" class="mt-2 space-y-2 ${invoice?.isRecurring ? '' : 'hidden'}">
                    <select name="frequency" class="input">
                        <option value="daily" ${invoice?.frequency === 'daily' ? 'selected' : ''}>Daily</option>
                        <option value="weekly" ${invoice?.frequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                        <option value="monthly" ${invoice?.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                        <option value="annually" ${invoice?.frequency === 'annually' ? 'selected' : ''}>Annually</option>
                    </select>
                </div>
            </div>
            <div class="mt-6 flex justify-end font-bold text-xl">
                <span>Total: R </span><span id="invoice-total">0.00</span>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
                <button type="button" id="btn-cancel-invoice" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">Save Invoice</button>
            </div>
        </form>
    `;
    setupInvoiceForm(lineItems);
}

function setupInvoiceForm(lineItems) {
    const container = document.getElementById('invoice-line-items');
    const addBtn = document.getElementById('add-line-item');
    const renderLines = () => {
        container.innerHTML = lineItems.map((item, i) => `
            <div class="grid grid-cols-12 gap-2 items-center">
                <div class="col-span-6">
                    <input type="text" class="input line-item-desc" data-index="${i}" value="${item.description}" placeholder="Description">
                </div>
                <div class="col-span-2">
                    <input type="number" class="input line-item-qty" data-index="${i}" value="${item.quantity}" min="1">
                </div>
                <div class="col-span-3">
                    <input type="number" class="input line-item-price" data-index="${i}" value="${item.price}" min="0" step="0.01">
                </div>
                <div class="col-span-1 text-right">
                    <button type="button" class="text-red-500 remove-line-item" data-index="${i}">&times;</button>
                </div>
            </div>
        `).join('');
        updateInvoiceTotal(lineItems);
    };

    const updateInvoiceTotal = (items) => {
        const total = items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0), 0);
        document.getElementById('invoice-total').textContent = total.toLocaleString('en-ZA', { minimumFractionDigits: 2 });
    };

    container.addEventListener('input', (e) => {
        const i = parseInt(e.target.dataset.index);
        if (e.target.classList.contains('line-item-desc')) lineItems[i].description = e.target.value;
        if (e.target.classList.contains('line-item-qty')) lineItems[i].quantity = parseFloat(e.target.value) || 1;
        if (e.target.classList.contains('line-item-price')) lineItems[i].price = parseFloat(e.target.value) || 0;
        updateInvoiceTotal(lineItems);
    });

    container.addEventListener('click', (e) => {
        const btn = e.target.closest('.remove-line-item');
        if (btn && lineItems.length > 1) {
            lineItems.splice(parseInt(btn.dataset.index), 1);
            renderLines();
        }
    });

    addBtn.addEventListener('click', () => {
        lineItems.push({ description: '', quantity: 1, price: 0 });
        renderLines();
    });

    document.getElementById('is-recurring').addEventListener('change', (e) => {
        document.getElementById('recurring-options').classList.toggle('hidden', !e.target.checked);
    });

    renderLines();
}

function renderBillForm(bill = null) {
    const container = document.getElementById('purchase-form-container');
    container.classList.remove('hidden');
    const supplierOptions = contactsCache.filter(c => c.category === 'Supplier').map(c => `
        <option value="${c.id}" ${bill?.supplierId === c.id ? 'selected' : ''}>${c.name}</option>
    `).join('') || '<option value="" disabled>No suppliers available</option>';
    container.innerHTML = `
        <h3 class="text-lg font-bold mb-4">${bill ? 'Edit Bill' : 'Add New Bill'}</h3>
        <form id="bill-form" data-id="${bill?.id || ''}">
            <div class="space-y-4">
                <div>
                    <label class="label">Supplier</label>
                    <select name="supplier" class="input" required>${supplierOptions}</select>
                </div>
                <div>
                    <label class="label">Description</label>
                    <input type="text" name="description" class="input" value="${bill?.description || ''}" required>
                </div>
                <div>
                    <label class="label">Amount (R)</label>
                    <input type="number" name="total" class="input" value="${bill?.total || ''}" min="0" step="0.01" required>
                </div>
                <div>
                    <label class="label">Due Date</label>
                    <input type="date" name="dueDate" class="input" value="${bill?.dueDate || ''}" required>
                </div>
                <div>
                    <label class="label">Status</label>
                    <select name="status" class="input">
                        <option value="unpaid" ${bill?.status === 'unpaid' ? 'selected' : ''}>Unpaid</option>
                        <option value="paid" ${bill?.status === 'paid' ? 'selected' : ''}>Paid</option>
                    </select>
                </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
                <button type="button" id="btn-cancel-purchase" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">Save Bill</button>
            </div>
        </form>
    `;
}

function renderPOForm(po = null) {
    const container = document.getElementById('purchase-form-container');
    container.classList.remove('hidden');
    const supplierOptions = contactsCache.filter(c => c.category === 'Supplier').map(c => `
        <option value="${c.id}" ${po?.supplierId === c.id ? 'selected' : ''}>${c.name}</option>
    `).join('') || '<option value="" disabled>No suppliers available</option>';
    container.innerHTML = `
        <h3 class="text-lg font-bold mb-4">${po ? 'Edit Purchase Order' : 'Create Purchase Order'}</h3>
        <form id="po-form" data-id="${po?.id || ''}">
            <div class="space-y-4">
                <div>
                    <label class="label">Supplier</label>
                    <select name="supplier" class="input" required>${supplierOptions}</select>
                </div>
                <div>
                    <label class="label">PO Number</label>
                    <input type="text" name="poNumber" class="input" value="${po?.poNumber || `PO-${Date.now()}`}" required>
                </div>
                <div>
                    <label class="label">Total Amount (R)</label>
                    <input type="number" name="total" class="input" value="${po?.total || ''}" min="0" step="0.01" required>
                </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
                <button type="button" id="btn-cancel-purchase" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">Save PO</button>
            </div>
        </form>
    `;
}

// --- EVENT LISTENERS ---

function attachBusinessEventListeners() {
    const workspace = document.getElementById('business-workspace');
    workspace.addEventListener('click', async (e) => {
        const target = e.target;
        if (target.matches('.tab-button')) {
            await renderBusinessTabContent(target.dataset.tab);
            return;
        }

        const action = target.dataset.action || target.id;
        switch (action) {
            case 'btn-new-contact':
                renderContactForm();
                break;
            case 'btn-cancel-contact':
            case 'btn-cancel-invoice':
            case 'btn-cancel-purchase':
                target.closest('.hidden')?.classList.add('hidden') || 
                document.getElementById('contact-form-container')?.classList.add('hidden') ||
                document.getElementById('invoice-form-container')?.classList.add('hidden') ||
                document.getElementById('purchase-form-container')?.classList.add('hidden');
                break;
            case 'edit-contact':
                const contact = contactsCache.find(c => c.id === target.dataset.id);
                renderContactForm(contact);
                break;
            case 'delete-contact':
                if (confirm('Delete this contact?')) {
                    await deleteDocument('contacts', target.dataset.id);
                    showNotification('Contact deleted', 'success');
                    await renderBusinessTabContent('contacts');
                }
                break;
            case 'btn-new-invoice':
                renderInvoiceForm();
                break;
            case 'edit-invoice':
                const invoice = (await fetchCollection('invoices')).find(i => i.id === target.dataset.id);
                renderInvoiceForm(invoice);
                break;
            case 'btn-new-bill':
                renderBillForm();
                break;
            case 'edit-bill':
                const bill = (await fetchCollection('bills')).find(b => b.id === target.dataset.id);
                renderBillForm(bill);
                break;
            case 'delete-bill':
                if (confirm('Delete this bill?')) {
                    await deleteDocument('bills', target.dataset.id);
                    showNotification('Bill deleted', 'success');
                    await renderBusinessTabContent('purchases');
                }
                break;
            case 'btn-new-po':
                renderPOForm();
                break;
            case 'edit-po':
                const po = (await fetchCollection('purchaseOrders')).find(p => p.id === target.dataset.id);
                renderPOForm(po);
                break;
            case 'btn-generate-report':
                await generateProfitAndLossReport();
                break;
        }
    });

    workspace.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        try {
            if (form.id === 'contact-form') await handleSaveContact(form);
            if (form.id === 'invoice-form') await handleSaveInvoice(form);
            if (form.id === 'bill-form') await handleSaveBill(form);
            if (form.id === 'po-form') await handleSavePO(form);
        } catch (error) {
            showNotification('Error saving data', 'error');
        }
    });
}

async function handleSaveContact(form) {
    const formData = new FormData(form);
    const docId = form.dataset.id;
    const category = formData.get('category') === 'Other' ? formData.get('category_other') : formData.get('category');
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        category,
        address: formData.get('address'),
        bankName: formData.get('bankName'),
        bankAccountNumber: formData.get('bankAccountNumber'),
    };
    await saveDocument('contacts', contactData, docId);
    showNotification('Contact saved', 'success');
    form.closest('#contact-form-container').classList.add('hidden');
    form.reset();
    await renderBusinessTabContent('contacts');
}

async function handleSaveInvoice(form) {
    const formData = new FormData(form);
    const docId = form.dataset.id;
    const customerId = formData.get('customer');
    if (!customerId) {
        showNotification('Please select a customer', 'error');
        return;
    }
    const lineItems = Array.from(document.querySelectorAll('#invoice-line-items > div')).map(div => ({
        description: div.querySelector('.line-item-desc').value,
        quantity: parseFloat(div.querySelector('.line-item-qty').value) || 1,
        price: parseFloat(div.querySelector('.line-item-price').value) || 0,
    }));
    const total = lineItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const invoiceData = {
        customerId,
        customerName: contactsCache.find(c => c.id === customerId)?.name || 'Unknown',
        dueDate: formData.get('dueDate'),
        createdAt: docId ? (await fetchCollection('invoices')).find(i => i.id === docId)?.createdAt || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: docId ? (await fetchCollection('invoices')).find(i => i.id === docId)?.status || 'draft' : 'draft',
        lineItems,
        total,
        isRecurring: formData.get('isRecurring') === 'on',
        frequency: formData.get('isRecurring') === 'on' ? formData.get('frequency') : null,
    };
    await saveDocument('invoices', invoiceData, docId);
    showNotification('Invoice saved', 'success');
    form.closest('#invoice-form-container').classList.add('hidden');
    form.reset();
    await renderBusinessTabContent('sales');
}

async function handleSaveBill(form) {
    const formData = new FormData(form);
    const docId = form.dataset.id;
    const supplierId = formData.get('supplier');
    if (!supplierId) {
        showNotification('Please select a supplier', 'error');
        return;
    }
    const billData = {
        supplierId,
        supplierName: contactsCache.find(c => c.id === supplierId)?.name || 'Unknown',
        description: formData.get('description'),
        total: parseFloat(formData.get('total')) || 0,
        dueDate: formData.get('dueDate'),
        status: formData.get('status'),
        billDate: docId ? (await fetchCollection('bills')).find(b => b.id === docId)?.billDate || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    };
    await saveDocument('bills', billData, docId);
    showNotification('Bill saved', 'success');
    form.closest('#purchase-form-container').classList.add('hidden');
    form.reset();
    await renderBusinessTabContent('purchases');
}

async function handleSavePO(form) {
    const formData = new FormData(form);
    const docId = form.dataset.id;
    const supplierId = formData.get('supplier');
    if (!supplierId) {
        showNotification('Please select a supplier', 'error');
        return;
    }
    const poData = {
        supplierId,
        supplierName: contactsCache.find(c => c.id === supplierId)?.name || 'Unknown',
        poNumber: formData.get('poNumber'),
        total: parseFloat(formData.get('total')) || 0,
        createdAt: docId ? (await fetchCollection('purchaseOrders')).find(p => p.id === docId)?.createdAt || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    };
    await saveDocument('purchaseOrders', poData, docId);
    showNotification('Purchase Order saved', 'success');
    form.closest('#purchase-form-container').classList.add('hidden');
    form.reset();
    await renderBusinessTabContent('purchases');
}

async function generateProfitAndLossReport() {
    const startDate = document.getElementById('report-start-date').value;
    const endDate = document.getElementById('report-end-date').value;
    const results = document.getElementById('report-results');
    if (!startDate || !endDate) {
        results.innerHTML = `<p class="text-red-500">Please select start and end dates.</p>`;
        return;
    }

    results.innerHTML = `<p class="text-slate-500">Generating report...</p>`;
    const invoices = await fetchCollection('invoices');
    const bills = await fetchCollection('bills');
    const filteredInvoices = invoices.filter(inv => inv.createdAt >= startDate && inv.createdAt <= endDate);
    const filteredBills = bills.filter(b => b.billDate >= startDate && b.billDate <= endDate);
    const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
    const totalExpenses = filteredBills.reduce((sum, b) => sum + (parseFloat(b.total) || 0), 0);
    const netProfit = totalRevenue - totalExpenses;

    results.innerHTML = `
        <h4 class="font-bold text-xl mb-4">Profit & Loss from ${startDate} to ${endDate}</h4>
        <div class="space-y-3">
            <div class="flex justify-between p-4 bg-green-50 rounded-lg">
                <span class="font-medium text-green-800">Total Revenue</span>
                <span class="font-bold text-lg text-green-900">R ${totalRevenue.toLocaleString()}</span>
            </div>
            <div class="flex justify-between p-4 bg-red-50 rounded-lg">
                <span class="font-medium text-red-800">Total Expenses</span>
                <span class="font-bold text-lg text-red-900">R ${totalExpenses.toLocaleString()}</span>
            </div>
            <div class="flex justify-between p-4 bg-slate-100 rounded-lg border-t-2 border-slate-800">
                <span class="font-bold text-slate-900">Net Profit</span>
                <span class="font-bold text-2xl text-slate-900">R ${netProfit.toLocaleString()}</span>
            </div>
        </div>
    `;
}

// --- UTILITY ---

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' : type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}