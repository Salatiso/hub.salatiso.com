/* ================================================================================= */
/* FILE: assets/js/modules/finhelp-business.js (ENHANCED WITH PURCHASES)           */
/* ================================================================================= */
import { auth } from '../firebase-config.js';
import { saveDocument, getDocument, deleteDocument, getDocumentsRealtime, updateDocument } from '../database.js';

let currentUserId = null;
let contactsCache = [];

export function init(user) {
    if (!user || !user.uid) return;
    currentUserId = user.uid;
    console.log("Business finance module initialized.");

    injectBusinessHTML();
    setupBusinessTabs();
    
    // Initialize all features
    setupContactForm();
    listenForContacts();
    setupInvoiceModal();
    listenForInvoices();
    setupPurchasesForm();
    listenForPurchases();
}

function injectBusinessHTML() {
    // Inject HTML for all business tabs
    document.getElementById('tab-content-business-dashboard').innerHTML = getDashboardHTML();
    document.getElementById('tab-content-business-sales').innerHTML = getSalesHTML();
    document.getElementById('tab-content-business-purchases').innerHTML = getPurchasesHTML();
    document.getElementById('tab-content-business-contacts').innerHTML = getContactsHTML();
}

function setupBusinessTabs() {
    const tabs = document.querySelectorAll('#business-workspace .tab-button');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('#business-workspace .py-6').forEach(c => c.classList.add('hidden'));
            
            tab.classList.add('active');
            const contentId = tab.id.replace('tab-business-', 'tab-content-business-');
            document.getElementById(contentId).classList.remove('hidden');
        });
    });
    // Set default active tab
    document.getElementById('tab-business-purchases').click();
}

// --- CONTACTS LOGIC (Unchanged) ---
function setupContactForm() { /* ... same as v4 ... */ }
function listenForContacts() { 
    getDocumentsRealtime(`users/${currentUserId}/business/contacts`, (contacts) => {
        contactsCache = contacts;
        renderContactsTable(contacts);
        // Re-populate supplier dropdown when contacts change
        populateSupplierDropdown();
    });
}
function renderContactsTable(contacts) { /* ... same as v4 ... */ }


// --- INVOICE LOGIC (Unchanged) ---
function setupInvoiceModal() { /* ... same as v4 ... */ }
function openInvoiceModal(invoiceData = null) { /* ... same as v4 ... */ }
function addLineItem(item = { description: '', quantity: 1, rate: 0 }) { /* ... same as v4 ... */ }
function updateInvoiceTotals() { /* ... same as v4 ... */ }
async function saveInvoice(e) { /* ... same as v4 ... */ }
function listenForInvoices() { /* ... same as v4 ... */ }
function renderInvoicesTable(invoices) { /* ... same as v4 ... */ }


// --- NEW: PURCHASES LOGIC ---

function setupPurchasesForm() {
    const form = document.getElementById('add-purchase-form');
    if (!form) return;
    const statusEl = document.getElementById('purchase-form-status');
    
    document.getElementById('purchase-date').valueAsDate = new Date();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        statusEl.textContent = 'Saving bill...';
        statusEl.className = 'text-blue-600';
        
        const supplierSelect = document.getElementById('purchase-supplier');
        const purchaseData = {
            date: document.getElementById('purchase-date').value,
            supplierId: supplierSelect.value,
            supplierName: supplierSelect.options[supplierSelect.selectedIndex].text,
            description: document.getElementById('purchase-description').value,
            category: document.getElementById('purchase-category').value,
            amount: parseFloat(document.getElementById('purchase-amount').value),
            status: 'Unpaid'
        };

        try {
            await saveDocument(`users/${currentUserId}/business/purchases`, purchaseData);
            statusEl.textContent = 'Bill saved successfully!';
            statusEl.className = 'text-green-600';
            form.reset();
            document.getElementById('purchase-date').valueAsDate = new Date();
            setTimeout(() => { statusEl.textContent = ''; }, 3000);
        } catch (error) {
            console.error("Error saving purchase:", error);
            statusEl.textContent = 'Failed to save bill.';
            statusEl.className = 'text-red-600';
        }
    });
}

function populateSupplierDropdown() {
    const supplierSelect = document.getElementById('purchase-supplier');
    if (!supplierSelect) return;
    supplierSelect.innerHTML = '<option value="">Select a supplier</option>';
    contactsCache.filter(c => c.type === 'Supplier').forEach(c => {
        supplierSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
    });
}

function listenForPurchases() {
    getDocumentsRealtime(`users/${currentUserId}/business/purchases`, renderPurchasesTable);
}

function renderPurchasesTable(purchases) {
    const listElement = document.getElementById('purchases-list');
    if (!listElement) return;
    listElement.innerHTML = '';
    let total = 0;

    if (purchases.length === 0) {
        listElement.innerHTML = `<tr><td colspan="6" class="text-center p-8 text-slate-500">No bills or expenses logged yet.</td></tr>`;
        document.getElementById('purchases-total').textContent = 'R 0.00';
        return;
    }

    purchases.sort((a,b) => new Date(b.date) - new Date(a.date));
    purchases.forEach(p => {
        total += p.amount;
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50';
        row.innerHTML = `
            <td data-label="Status"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">${p.status}</span></td>
            <td data-label="Date">${p.date}</td>
            <td data-label="Supplier">${p.supplierName}</td>
            <td data-label="Description">${p.description}</td>
            <td data-label="Amount" class="text-right font-medium">R ${p.amount.toFixed(2)}</td>
            <td class="text-right"><button class="delete-btn text-red-500 hover:text-red-700" data-id="${p.id}"><i class="fas fa-trash-alt"></i></button></td>
        `;
        listElement.appendChild(row);
    });
    document.getElementById('purchases-total').textContent = `R ${total.toFixed(2)}`;

    listElement.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const id = e.currentTarget.dataset.id;
            if (window.confirm('Are you sure you want to delete this bill?')) {
                await deleteDocument(`users/${currentUserId}/business/purchases/${id}`);
            }
        });
    });
}

// --- HTML TEMPLATE FUNCTIONS ---
function getDashboardHTML() { return `<div class="bg-white p-6 rounded-xl shadow-md"><h2 class="text-xl font-bold text-slate-800">Business Dashboard</h2><p class="mt-2 text-slate-500">Analytics and insights will be displayed here.</p></div>`; }
function getSalesHTML() { return `<div class="bg-white p-6 rounded-xl shadow-md"><div class="flex justify-between items-center mb-4"><h2 class="text-xl font-bold text-slate-800">Invoices</h2><button id="create-new-invoice-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-sm text-sm"><i class="fas fa-plus mr-2"></i>Create New Invoice</button></div><div class="overflow-x-auto"><table class="min-w-full"><thead class="bg-slate-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th><th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th><th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Number</th><th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Customer</th><th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Amount</th><th class="relative px-6 py-3"></th></tr></thead><tbody id="invoices-list"></tbody></table></div></div>`; }
function getContactsHTML() { return `<div class="bg-white p-6 rounded-xl shadow-md mb-8"><h2 class="text-xl font-bold text-slate-800 mb-4">Add New Contact</h2><form id="add-contact-form" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end"><div><label for="contact-name" class="block text-sm font-medium text-slate-700">Name</label><input type="text" id="contact-name" class="mt-1 block w-full rounded-md border-slate-300" required></div><div><label for="contact-email" class="block text-sm font-medium text-slate-700">Email</label><input type="email" id="contact-email" class="mt-1 block w-full rounded-md border-slate-300"></div><div><label for="contact-type" class="block text-sm font-medium text-slate-700">Type</label><select id="contact-type" class="mt-1 block w-full rounded-md border-slate-300"><option>Customer</option><option>Supplier</option></select></div><button type="submit" class="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md"><i class="fas fa-plus mr-2"></i>Add</button></form><div id="contact-form-status" class="mt-4 text-sm"></div></div><div class="bg-white p-6 rounded-xl shadow-md"><h2 class="text-xl font-bold text-slate-800 mb-4">Contact List</h2><div class="overflow-x-auto"><table class="min-w-full"><thead class="bg-slate-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th><th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th><th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th><th class="relative px-6 py-3"></th></tr></thead><tbody id="contacts-list"></tbody></table></div></div>`; }
function getPurchasesHTML() {
    return `
        <div class="bg-white p-6 rounded-xl shadow-md mb-8">
            <h2 class="text-xl font-bold text-slate-800 mb-4">Add New Bill / Expense</h2>
            <form id="add-purchase-form" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div><label for="purchase-date" class="block text-sm font-medium text-slate-700">Date</label><input type="date" id="purchase-date" class="mt-1 block w-full rounded-md border-slate-300" required></div>
                <div><label for="purchase-supplier" class="block text-sm font-medium text-slate-700">Supplier</label><select id="purchase-supplier" class="mt-1 block w-full rounded-md border-slate-300"></select></div>
                <div><label for="purchase-description" class="block text-sm font-medium text-slate-700">Description</label><input type="text" id="purchase-description" class="mt-1 block w-full rounded-md border-slate-300" placeholder="e.g., Office Rent" required></div>
                <div><label for="purchase-amount" class="block text-sm font-medium text-slate-700">Amount (R)</label><input type="number" step="0.01" id="purchase-amount" class="mt-1 block w-full rounded-md border-slate-300" required></div>
                <input type="hidden" id="purchase-category" value="Business"> <!-- Simplified for now -->
                <button type="submit" class="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md"><i class="fas fa-plus mr-2"></i>Add Bill</button>
            </form>
            <div id="purchase-form-status" class="mt-4 text-sm"></div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-md">
            <h2 class="text-xl font-bold text-slate-800 mb-4">Bills & Expenses</h2>
            <div class="overflow-x-auto"><table class="min-w-full"><thead class="bg-slate-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th><th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th><th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Supplier</th><th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th><th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Amount</th><th class="relative px-6 py-3"></th></tr></thead><tbody id="purchases-list"></tbody><tfoot class="bg-slate-50"><tr><td colspan="4" class="px-6 py-4 text-right font-bold text-slate-800">Total Unpaid:</td><td id="purchases-total" class="px-6 py-4 text-right font-bold text-slate-800">R 0.00</td><td></td></tr></tfoot></table></div>
        </div>
    `;
}
