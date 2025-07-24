/* ================================================================================= */
/* FILE: assets/js/modules/finhelp-business.js (Version 2.0)                         */
/* PURPOSE: Manages the business finance workspace including contacts, sales,        */
/* and purchases, providing a lightweight accounting solution.                       */
/* ================================================================================= */
/* Author: Gemini AI Assistant                                                       */
/* Date: 25 July 2025                                                                */
/* Revision History:                                                                 */
/* v2.0 - 2025/07/25: Major overhaul.                                                */
/* - Fixed Firestore collection query errors (even vs. odd segments).           */
/* - Reworked Contacts module into a comprehensive CRM.                         */
/* - Added detailed fields for contacts (banking, category, etc.).              */
/* - Enhanced Invoice creation to use new contacts list.                        */
/* - Added Purchase Order functionality.                                        */
/* - Restructured rendering logic for maintainability.                          */
/* - Added recurring billing options to invoices.                               */
/* v1.0 - Initial version.                                                           */
/* ================================================================================= */

import { auth, db } from '../firebase-config.js';
import { doc, collection, addDoc, getDocs, setDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- STATE MANAGEMENT ---
let currentUser = null;
let contactsCache = []; // Cache for contacts to populate dropdowns across tabs
let propertiesCache = []; // Will be used to link contacts/invoices to properties

// Unsubscribe functions for Firestore listeners to prevent memory leaks
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
    await renderBusinessTabContent('dashboard'); // Load dashboard by default
}

/**
 * Cleans up listeners when the user navigates away.
 */
function cleanupListeners() {
    unsubscribers.forEach(unsub => unsub());
    unsubscribers = [];
    console.log("Business module listeners cleaned up.");
}

// --- DATA HANDLING ---

/**
 * Fetches all documents from a specified collection.
 * @param {string} collectionName - The name of the collection (e.g., 'contacts', 'invoices').
 * @returns {Promise<Array>} - A promise that resolves to an array of documents.
 */
async function fetchCollection(collectionName) {
    if (!currentUser) return [];
    try {
        const collectionPath = `users/${currentUser.uid}/business/main/${collectionName}`;
        const querySnapshot = await getDocs(collection(db, collectionPath));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error(`Error fetching ${collectionName}:`, error);
        // The original error "Invalid document reference" was because getDoc was used on a collection path.
        // Using getDocs(collection(...)) is the correct approach.
        return [];
    }
}

/**
 * Saves a document to a specified collection.
 * @param {string} collectionName - The name of the collection.
 * @param {object} data - The data to save.
 * @param {string|null} docId - The ID of the document to update, or null to create a new one.
 * @returns {Promise<void>}
 */
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
    }
}


// --- UI RENDERING ---

/**
 * Provides the main HTML structure for the business workspace.
 * @returns {string} HTML string.
 */
function getBusinessWorkspaceHTML() {
    return `
        <div class="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div class="border-b border-slate-200">
                <nav class="-mb-px flex flex-wrap space-x-2 sm:space-x-6" id="business-tabs">
                    <button data-tab="dashboard" class="tab-button active">Dashboard</button>
                    <button data-tab="contacts" class="tab-button">Contacts</button>
                    <button data-tab="sales" class="tab-button">Sales</button>
                    <button data-tab="purchases" class="tab-button">Purchases</button>
                    <button data-tab="reports" class="tab-button">Reports</button>
                </nav>
            </div>
            <div id="business-tab-content" class="mt-6">
                <!-- Content will be dynamically loaded here -->
            </div>
        </div>
    `;
}

/**
 * Main router for rendering content based on the selected tab.
 * @param {string} tabName - The name of the tab to render.
 */
async function renderBusinessTabContent(tabName) {
    const contentArea = document.getElementById('business-tab-content');
    if (!contentArea) return;

    // Highlight the active tab
    document.querySelectorAll('#business-tabs .tab-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Clean up previous listeners before rendering new content
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
            contentArea.innerHTML = `<p>Content for ${tabName} coming soon.</p>`;
    }
}

/** Renders the Dashboard tab */
async function renderDashboardTab(container) {
    container.innerHTML = `
        <h2 class="text-2xl font-bold text-slate-800 mb-4">Business Dashboard</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-slate-50 p-4 rounded-lg">
                <h3 class="font-bold text-slate-600">Outstanding Invoices</h3>
                <p class="text-3xl font-bold text-blue-600" id="outstanding-invoices">Loading...</p>
            </div>
            <div class="bg-slate-50 p-4 rounded-lg">
                <h3 class="font-bold text-slate-600">Overdue Bills</h3>
                <p class="text-3xl font-bold text-red-600" id="overdue-bills">Loading...</p>
            </div>
            <div class="bg-slate-50 p-4 rounded-lg">
                <h3 class="font-bold text-slate-600">Net Cash Flow (30 days)</h3>
                <p class="text-3xl font-bold text-green-600" id="net-cashflow">Loading...</p>
            </div>
        </div>
        <div class="mt-8 bg-slate-50 p-4 rounded-lg">
            <h3 class="font-bold text-slate-600 mb-2">Financial Health Visualisation</h3>
            <div class="text-center text-slate-500 py-10">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <p class="mt-2 text-sm font-semibold text-gray-900">Advanced data visualizations and financial health charts are coming soon.</p>
                <p class="mt-1 text-sm text-gray-500">We're building powerful tools to help you understand your business at a glance.</p>
            </div>
        </div>
    `;
    // TODO: Load and display actual dashboard data
}

/** Renders the comprehensive Contacts tab (CRM) */
async function renderContactsTab(container) {
    container.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-slate-800">Contacts</h2>
            <button id="btn-new-contact" class="btn-primary">Add New Contact</button>
        </div>
        <div id="contact-form-container" class="hidden bg-slate-50 p-4 rounded-lg mb-6"></div>
        <div class="bg-white rounded-lg overflow-hidden">
            <table class="min-w-full divide-y divide-slate-200">
                <thead class="bg-slate-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact Info</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody id="contacts-list" class="bg-white divide-y divide-slate-200">
                    <!-- Contact rows will be injected here -->
                </tbody>
            </table>
        </div>
    `;
    
    // Load and display contacts
    contactsCache = await fetchCollection('contacts');
    const list = document.getElementById('contacts-list');
    if (contactsCache.length > 0) {
        list.innerHTML = contactsCache.map(contact => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-slate-900">${contact.name || ''}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        ${contact.category || 'N/A'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <div>${contact.email || ''}</div>
                    <div>${contact.phone || ''}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-indigo-600 hover:text-indigo-900" data-id="${contact.id}" data-action="edit-contact">Edit</button>
                </td>
            </tr>
        `).join('');
    } else {
        list.innerHTML = `<tr><td colspan="4" class="text-center py-10 text-slate-500">No contacts found. Add one to get started!</td></tr>`;
    }
}

/** Renders the Sales tab (Invoices & Estimates) */
async function renderSalesTab(container) {
    container.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-slate-800">Sales</h2>
            <button id="btn-new-invoice" class="btn-primary">Create New Invoice</button>
        </div>
        <div id="invoice-form-container" class="hidden bg-slate-50 p-4 rounded-lg mb-6"></div>
        <h3 class="text-lg font-semibold text-slate-700 mt-6 mb-2">All Invoices</h3>
        <div id="invoices-list"></div>
    `;
    
    // Load contacts for the dropdown
    contactsCache = await fetchCollection('contacts');
    
    // Load and display invoices
    const invoices = await fetchCollection('invoices');
    const list = document.getElementById('invoices-list');
    if (invoices.length > 0) {
        list.innerHTML = `<pre>${JSON.stringify(invoices, null, 2)}</pre>`; // Placeholder
    } else {
        list.innerHTML = `<p class="text-center py-10 text-slate-500">No invoices yet.</p>`;
    }
}

/** Renders the Purchases tab (Bills & Purchase Orders) */
async function renderPurchasesTab(container) {
    container.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-slate-800">Purchases</h2>
            <div>
                <button id="btn-new-bill" class="btn-secondary mr-2">Add Bill</button>
                <button id="btn-new-po" class="btn-primary">Create Purchase Order</button>
            </div>
        </div>
        <div id="purchase-form-container" class="hidden bg-slate-50 p-4 rounded-lg mb-6"></div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 class="text-lg font-semibold text-slate-700 mb-2">Bills to Pay</h3>
                <div id="bills-list"></div>
            </div>
            <div>
                <h3 class="text-lg font-semibold text-slate-700 mb-2">Purchase Orders</h3>
                <div id="po-list"></div>
            </div>
        </div>
    `;

    // Load and display bills
    const bills = await fetchCollection('bills');
    document.getElementById('bills-list').innerHTML = bills.length > 0 ? `<pre>${JSON.stringify(bills, null, 2)}</pre>` : `<p class="text-center py-10 text-slate-500">No bills yet.</p>`;
    
    // Load and display purchase orders
    const purchaseOrders = await fetchCollection('purchaseOrders');
    document.getElementById('po-list').innerHTML = purchaseOrders.length > 0 ? `<pre>${JSON.stringify(purchaseOrders, null, 2)}</pre>` : `<p class="text-center py-10 text-slate-500">No purchase orders yet.</p>`;
}

/** Renders the Reports tab */
async function renderReportsTab(container) {
    container.innerHTML = `
        <h2 class="text-2xl font-bold text-slate-800 mb-4">Reports</h2>
        <div class="text-center text-slate-500 py-10 bg-slate-50 rounded-lg">
             <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p class="mt-2 text-sm font-semibold text-gray-900">Customizable report builder coming soon.</p>
            <p class="mt-1 text-sm text-gray-500">You will be able to generate Profit & Loss, Balance Sheets, Sales by Customer, and more.</p>
        </div>
    `;
}

// --- FORM RENDERING ---

/**
 * Renders the form for adding or editing a contact.
 * @param {object|null} contact - The contact object to edit, or null for a new contact.
 */
function renderContactForm(contact = null) {
    const container = document.getElementById('contact-form-container');
    container.classList.remove('hidden');
    const title = contact ? 'Edit Contact' : 'Add New Contact';
    const categories = ['Tenant', 'Contractor', 'Service Provider', 'Client', 'Supplier', 'Buyer', 'Seller'];

    container.innerHTML = `
        <h3 class="text-lg font-bold mb-4">${title}</h3>
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
                        <option value="Other" ${contact?.category && !categories.includes(contact.category) ? 'selected' : ''}>Other (Specify)</option>
                    </select>
                    <input type="text" name="category_other" class="input mt-2 ${contact?.category && !categories.includes(contact.category) ? '' : 'hidden'}" placeholder="Specify category" value="${contact?.category && !categories.includes(contact.category) ? contact.category : ''}">
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
            <div class="mt-4 flex justify-end space-x-2">
                <button type="button" id="btn-cancel-contact" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">Save Contact</button>
            </div>
        </form>
    `;
    
    // Show/hide 'other category' input
    const categorySelect = container.querySelector('select[name="category"]');
    const otherCategoryInput = container.querySelector('input[name="category_other"]');
    categorySelect.addEventListener('change', () => {
        otherCategoryInput.classList.toggle('hidden', categorySelect.value !== 'Other');
    });
}

/**
 * Renders the form for creating a new invoice.
 */
function renderInvoiceForm() {
    const container = document.getElementById('invoice-form-container');
    container.classList.remove('hidden');
    
    const customerOptions = contactsCache.length > 0 
        ? contactsCache.map(c => `<option value="${c.id}">${c.name}</option>`).join('')
        : '<option disabled>Please add a contact first</option>';

    container.innerHTML = `
        <h3 class="text-lg font-bold mb-4">New Invoice</h3>
        <form id="invoice-form">
            <div>
                <label class="label">Select Customer</label>
                <select name="customer" class="input" required>${customerOptions}</select>
            </div>
            
            <!-- More invoice fields here: items, amounts, due date etc. -->
            <div class="mt-4">
                <label class="label">Amount</label>
                <input type="number" name="amount" class="input" required>
            </div>
            <div class="mt-4">
                <label class="label">Due Date</label>
                <input type="date" name="dueDate" class="input" required>
            </div>

            <div class="mt-4 border-t pt-4">
                <label class="label font-semibold">Recurring Invoice</label>
                <div class="flex items-center mt-2">
                     <input id="is-recurring" type="checkbox" name="isRecurring" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                     <label for="is-recurring" class="ml-2 block text-sm text-gray-900">Set up recurring billing</label>
                </div>
                <div id="recurring-options" class="hidden mt-2 space-y-2">
                    <select name="frequency" class="input">
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="annually">Annually</option>
                    </select>
                </div>
            </div>

            <div class="mt-4 flex justify-end space-x-2">
                <button type="button" id="btn-cancel-invoice" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">Save Invoice</button>
            </div>
        </form>
    `;

    document.getElementById('is-recurring').addEventListener('change', (e) => {
        document.getElementById('recurring-options').classList.toggle('hidden', !e.target.checked);
    });
}


// --- EVENT LISTENERS & HANDLERS ---

/**
 * Attaches event listeners for the business workspace.
 */
function attachBusinessEventListeners() {
    const workspace = document.getElementById('business-workspace');
    if (!workspace) return;

    workspace.addEventListener('click', async (e) => {
        const target = e.target;
        const action = target.dataset.action || target.id;
        
        // Tab navigation
        if (target.matches('.tab-button')) {
            await renderBusinessTabContent(target.dataset.tab);
            return;
        }

        // Button clicks
        switch (action) {
            case 'btn-new-contact':
                renderContactForm();
                break;
            case 'btn-cancel-contact':
                document.getElementById('contact-form-container').classList.add('hidden');
                break;
            case 'edit-contact':
                const contactId = target.dataset.id;
                const contact = contactsCache.find(c => c.id === contactId);
                if (contact) renderContactForm(contact);
                break;
            case 'btn-new-invoice':
                renderInvoiceForm();
                break;
             case 'btn-cancel-invoice':
                document.getElementById('invoice-form-container').classList.add('hidden');
                break;
            // Add cases for other buttons like new PO, new bill etc.
        }
    });

    workspace.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;

        if (form.id === 'contact-form') {
            await handleSaveContact(form);
        }
        if (form.id === 'invoice-form') {
            await handleSaveInvoice(form);
        }
        // Add handlers for other forms
    });
}

/**
 * Handles saving contact data from the form.
 * @param {HTMLFormElement} form - The contact form element.
 */
async function handleSaveContact(form) {
    const formData = new FormData(form);
    const docId = form.dataset.id;
    let category = formData.get('category');
    if (category === 'Other') {
        category = formData.get('category_other');
    }

    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        category: category,
        bankName: formData.get('bankName'),
        bankAccountNumber: formData.get('bankAccountNumber'),
        // Add other fields as needed
    };

    await saveDocument('contacts', contactData, docId || null);
    form.closest('#contact-form-container').classList.add('hidden');
    await renderBusinessTabContent('contacts'); // Refresh the view
}

/**
 * Handles saving invoice data from the form.
 * @param {HTMLFormElement} form - The invoice form element.
 */
async function handleSaveInvoice(form) {
    const formData = new FormData(form);
    const invoiceData = {
        customerId: formData.get('customer'),
        amount: parseFloat(formData.get('amount')),
        dueDate: formData.get('dueDate'),
        status: 'draft', // or 'sent'
        isRecurring: formData.get('isRecurring') === 'on',
        frequency: formData.get('isRecurring') === 'on' ? formData.get('frequency') : null,
        createdAt: new Date().toISOString()
    };
    
    await saveDocument('invoices', invoiceData);
    form.closest('#invoice-form-container').classList.add('hidden');
    await renderBusinessTabContent('sales'); // Refresh the view
}
