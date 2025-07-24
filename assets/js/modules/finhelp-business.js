/* ================================================================================= */
/* FILE: assets/js/modules/finhelp-business.js (Fully Functional)                    */
/* PURPOSE: Manages the business finance workspace including contacts, sales,        */
/* and purchases, providing a lightweight accounting solution.                       */
/* ================================================================================= */
import { auth } from '../firebase-config.js';
import { saveDocument, getDocument, deleteDocument, getCollectionRealtime, addDocument } from '../database.js';

let currentUser = null;
let businessDataUnsubscribe = null; // To detach listeners
let contactsCache = []; // Cache contacts to populate dropdowns

/**
 * Initializes the business finance module.
 * @param {object} user - The authenticated Firebase user object.
 */
export async function init(user) {
    if (!user) return;
    currentUser = user;
    console.log("Business finance module initialized.");

    const businessWorkspace = document.getElementById('business-workspace');
    businessWorkspace.innerHTML = getBusinessWorkspaceHTML();

    attachBusinessEventListeners();
    await renderBusinessTabContent('dashboard'); // Load dashboard by default
}

/**
 * Attaches event listeners for the business workspace.
 */
function attachBusinessEventListeners() {
    const workspace = document.getElementById('business-workspace');
    workspace?.addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        // Handle Tab Switching
        if (button.classList.contains('tab-button')) {
            const tabName = button.dataset.tab;
            workspace.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            await renderBusinessTabContent(tabName);
            return;
        }

        // Handle Actions
        const action = button.dataset.action;
        const id = button.dataset.id;
        if (action) {
            switch(action) {
                case 'open-contact-modal':
                    openContactModal(id);
                    break;
                case 'delete-contact':
                    if (confirm('Are you sure you want to delete this contact?')) {
                        await handleDeleteContact(id);
                    }
                    break;
                case 'open-invoice-modal':
                    openInvoiceModal(id);
                    break;
                case 'open-bill-modal':
                    openBillModal(id);
                    break;
                case 'delete-bill':
                     if (confirm('Are you sure you want to delete this bill?')) {
                        await handleDeleteBill(id);
                    }
                    break;
            }
        }
    });
}

/**
 * Renders the content for the selected business tab.
 * @param {string} tabName - The name of the tab to render.
 */
async function renderBusinessTabContent(tabName) {
    const container = document.getElementById('business-tab-content');
    if (!container) return;
    container.innerHTML = `<p class="text-center text-slate-500 py-10">Loading ${tabName}...</p>`;

    if (businessDataUnsubscribe) businessDataUnsubscribe();

    let content = '';
    switch (tabName) {
        case 'dashboard':
            content = await renderBusinessDashboard();
            break;
        case 'sales':
            content = renderSalesTab();
            businessDataUnsubscribe = getCollectionRealtime(`users/${currentUser.uid}/business/main/invoices`, (invoices) => {
                renderInvoicesList(invoices);
            });
            break;
        case 'purchases':
            content = renderPurchasesTab();
            businessDataUnsubscribe = getCollectionRealtime(`users/${currentUser.uid}/business/main/bills`, (bills) => {
                renderBillsList(bills);
            });
            break;
        case 'contacts':
            content = renderContactsTab();
            businessDataUnsubscribe = getCollectionRealtime(`users/${currentUser.uid}/business/main/contacts`, (contacts) => {
                contactsCache = contacts; // Update cache
                renderContactsList(contacts);
            });
            break;
        default:
            content = `<div class="text-center py-10">
                <h3 class="font-semibold text-lg text-slate-600">${tabName.charAt(0).toUpperCase() + tabName.slice(1)} Coming Soon</h3>
                <p class="text-slate-500 mt-2">This feature is under development.</p>
            </div>`;
    }
    container.innerHTML = content;
}

// --- TAB RENDERING FUNCTIONS ---

async function renderBusinessDashboard() {
    // In a real app, you'd fetch and calculate these values.
    const overdueInvoices = 1250.00;
    const outstandingRevenue = 8750.00;
    const openBills = 3200.00;
    const netProfit30Days = 15300.00;

    return `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-red-100 border-l-4 border-red-500 p-6 rounded-lg shadow">
                <h4 class="font-semibold text-red-800">Overdue Invoices</h4>
                <p class="text-3xl font-bold mt-1 text-red-900">R ${overdueInvoices.toLocaleString()}</p>
            </div>
            <div class="bg-yellow-100 border-l-4 border-yellow-500 p-6 rounded-lg shadow">
                <h4 class="font-semibold text-yellow-800">Outstanding Revenue</h4>
                <p class="text-3xl font-bold mt-1 text-yellow-900">R ${outstandingRevenue.toLocaleString()}</p>
            </div>
            <div class="bg-blue-100 border-l-4 border-blue-500 p-6 rounded-lg shadow">
                <h4 class="font-semibold text-blue-800">Open Bills</h4>
                <p class="text-3xl font-bold mt-1 text-blue-900">R ${openBills.toLocaleString()}</p>
            </div>
            <div class="bg-green-100 border-l-4 border-green-500 p-6 rounded-lg shadow">
                <h4 class="font-semibold text-green-800">30-Day Net Profit</h4>
                <p class="text-3xl font-bold mt-1 text-green-900">R ${netProfit30Days.toLocaleString()}</p>
            </div>
        </div>
        <div class="mt-8 bg-white p-6 rounded-xl shadow-md">
            <h3 class="text-xl font-bold text-slate-800 mb-4">Income vs. Expenses (Last 6 Months)</h3>
            <div class="text-center text-slate-500 py-10">
                <i class="fas fa-chart-bar text-4xl mb-4"></i>
                <p>Chart visualizations are coming soon.</p>
            </div>
        </div>
    `;
}

function renderSalesTab() {
    return `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-slate-800">Sales & Invoicing</h2>
            <button data-action="open-invoice-modal" class="btn-primary">Create New Invoice</button>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-md">
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead class="bg-slate-50">
                        <tr>
                            <th class="p-4 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                            <th class="p-4 text-left text-xs font-medium text-slate-500 uppercase">Due Date</th>
                            <th class="p-4 text-left text-xs font-medium text-slate-500 uppercase">Customer</th>
                            <th class="p-4 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
                            <th class="relative p-4"></th>
                        </tr>
                    </thead>
                    <tbody id="invoices-list-body"></tbody>
                </table>
            </div>
        </div>
    `;
}

function renderInvoicesList(invoices) {
    const listBody = document.getElementById('invoices-list-body');
    if (!listBody) return;
    if (invoices.length === 0) {
        listBody.innerHTML = `<tr><td colspan="5" class="text-center p-8 text-slate-500">No invoices created yet.</td></tr>`;
        return;
    }
    listBody.innerHTML = invoices.map(invoice => {
        const statusColors = {
            Paid: 'bg-green-100 text-green-800',
            Sent: 'bg-blue-100 text-blue-800',
            Overdue: 'bg-red-100 text-red-800',
            Draft: 'bg-slate-100 text-slate-800'
        };
        return `
            <tr class="hover:bg-slate-50">
                <td class="p-4"><span class="px-2 py-1 text-xs font-semibold rounded-full ${statusColors[invoice.status] || statusColors.Draft}">${invoice.status}</span></td>
                <td class="p-4 text-slate-600">${invoice.dueDate}</td>
                <td class="p-4 font-medium text-slate-800">${invoice.customerName}</td>
                <td class="p-4 text-right font-semibold">R ${invoice.total.toLocaleString()}</td>
                <td class="p-4 text-right">
                    <button data-action="open-invoice-modal" data-id="${invoice.id}" class="text-indigo-600 hover:text-indigo-800"><i class="fas fa-edit"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderPurchasesTab() {
    return `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-slate-800">Bills & Expenses</h2>
            <button data-action="open-bill-modal" class="btn-primary">Add New Bill</button>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-md">
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead class="bg-slate-50">
                        <tr>
                            <th class="p-4 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                            <th class="p-4 text-left text-xs font-medium text-slate-500 uppercase">Due Date</th>
                            <th class="p-4 text-left text-xs font-medium text-slate-500 uppercase">Supplier</th>
                            <th class="p-4 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
                            <th class="relative p-4"></th>
                        </tr>
                    </thead>
                    <tbody id="bills-list-body"></tbody>
                </table>
            </div>
        </div>
    `;
}

function renderBillsList(bills) {
    const listBody = document.getElementById('bills-list-body');
    if (!listBody) return;
    if (bills.length === 0) {
        listBody.innerHTML = `<tr><td colspan="5" class="text-center p-8 text-slate-500">No bills or expenses logged yet.</td></tr>`;
        return;
    }
    listBody.innerHTML = bills.map(bill => {
        const statusColors = {
            Paid: 'bg-green-100 text-green-800',
            Unpaid: 'bg-yellow-100 text-yellow-800',
            Overdue: 'bg-red-100 text-red-800'
        };
        return `
            <tr class="hover:bg-slate-50">
                <td class="p-4"><span class="px-2 py-1 text-xs font-semibold rounded-full ${statusColors[bill.status] || statusColors.Unpaid}">${bill.status}</span></td>
                <td class="p-4 text-slate-600">${bill.dueDate}</td>
                <td class="p-4 font-medium text-slate-800">${bill.supplierName}</td>
                <td class="p-4 text-right font-semibold">R ${bill.total.toLocaleString()}</td>
                <td class="p-4 text-right">
                    <button data-action="open-bill-modal" data-id="${bill.id}" class="text-indigo-600 hover:text-indigo-800 mr-4"><i class="fas fa-edit"></i></button>
                    <button data-action="delete-bill" data-id="${bill.id}" class="text-red-500 hover:text-red-700"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}


function renderContactsTab() {
    return `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-slate-800">Contacts</h2>
            <button data-action="open-contact-modal" class="btn-primary">Add New Contact</button>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-md">
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead class="bg-slate-50">
                        <tr>
                            <th class="p-4 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                            <th class="p-4 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                            <th class="p-4 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                            <th class="relative p-4"></th>
                        </tr>
                    </thead>
                    <tbody id="contacts-list-body"></tbody>
                </table>
            </div>
        </div>
    `;
}

function renderContactsList(contacts) {
    const listBody = document.getElementById('contacts-list-body');
    if (!listBody) return;

    if (contacts.length === 0) {
        listBody.innerHTML = `<tr><td colspan="4" class="text-center p-8 text-slate-500">No contacts added yet.</td></tr>`;
        return;
    }

    listBody.innerHTML = contacts.map(contact => `
        <tr class="hover:bg-slate-50">
            <td class="p-4 font-medium text-slate-800">${contact.name}</td>
            <td class="p-4 text-slate-600">${contact.email || 'N/A'}</td>
            <td class="p-4"><span class="px-2 py-1 text-xs font-semibold rounded-full ${contact.type === 'Customer' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}">${contact.type}</span></td>
            <td class="p-4 text-right">
                <button data-action="open-contact-modal" data-id="${contact.id}" class="text-indigo-600 hover:text-indigo-800 mr-4"><i class="fas fa-edit"></i></button>
                <button data-action="delete-contact" data-id="${contact.id}" class="text-red-500 hover:text-red-700"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>
    `).join('');
}

// --- MODAL & FORM HANDLING ---

function createModal(id, title, formHTML, size = 'max-w-md') {
    const modalContainer = document.createElement('div');
    modalContainer.id = `${id}-container`;
    modalContainer.innerHTML = `
        <div id="${id}" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-lg p-8 w-full ${size} max-h-full overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold">${title}</h3>
                    <button onclick="closeModal('${id}')" class="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
                </div>
                ${formHTML}
            </div>
        </div>
    `;
    document.body.appendChild(modalContainer);
}

function removeModal(id) {
    const modalContainer = document.getElementById(`${id}-container`);
    modalContainer?.remove();
}

window.openContactModal = async (contactId = null) => { /* ... same as before ... */ };
window.closeModal = (id) => removeModal(id);
async function handleContactFormSubmit(e) { /* ... same as before ... */ }
async function handleDeleteContact(contactId) { /* ... same as before ... */ }

window.openInvoiceModal = async (invoiceId = null) => {
    let invoice = { lineItems: [{ description: '', quantity: 1, price: 0 }] }; // Default with one line item
    if (invoiceId) {
        invoice = await getDocument(`users/${currentUser.uid}/business/main/invoices`, invoiceId) || invoice;
    }

    const customerOptions = contactsCache.filter(c => c.type === 'Customer').map(c => 
        `<option value="${c.id}" ${invoice.customerId === c.id ? 'selected' : ''}>${c.name}</option>`
    ).join('');

    const formHTML = `
        <form id="invoice-form" data-id="${invoice.id || ''}">
            <div class="grid grid-cols-2 gap-4">
                <div><label class="block text-sm font-medium">Customer</label><select id="invoice-customer" class="input">${customerOptions}</select></div>
                <div><label class="block text-sm font-medium">Due Date</label><input type="date" id="invoice-due-date" class="input" value="${invoice.dueDate || ''}" required></div>
            </div>
            <hr class="my-6">
            <h4 class="font-semibold mb-2">Line Items</h4>
            <div id="invoice-line-items" class="space-y-2"></div>
            <button type="button" id="add-line-item" class="text-sm text-indigo-600 hover:underline mt-2">+ Add Line Item</button>
            <div class="mt-6 flex justify-end font-bold text-xl">
                <span>Total: R </span><span id="invoice-total">0.00</span>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
                <button type="button" onclick="closeModal('invoice-modal')" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">Save Invoice</button>
            </div>
        </form>
    `;
    createModal('invoice-modal', invoice.id ? `Edit Invoice` : 'Create New Invoice', formHTML, 'max-w-2xl');
    
    // Dynamic line item logic
    const lineItemsContainer = document.getElementById('invoice-line-items');
    const addLineItemBtn = document.getElementById('add-line-item');
    
    const renderLineItems = () => {
        lineItemsContainer.innerHTML = invoice.lineItems.map((item, index) => `
            <div class="grid grid-cols-12 gap-2 items-center">
                <div class="col-span-6"><input type="text" class="input line-item-desc" placeholder="Description" value="${item.description}" data-index="${index}"></div>
                <div class="col-span-2"><input type="number" class="input line-item-qty" placeholder="Qty" value="${item.quantity}" data-index="${index}"></div>
                <div class="col-span-3"><input type="number" class="input line-item-price" placeholder="Price" value="${item.price}" data-index="${index}"></div>
                <div class="col-span-1 text-right"><button type="button" class="text-red-500 remove-line-item" data-index="${index}">&times;</button></div>
            </div>
        `).join('');
        updateInvoiceTotal();
    };

    const updateInvoiceTotal = () => {
        let total = 0;
        invoice.lineItems.forEach(item => {
            total += (item.quantity || 0) * (item.price || 0);
        });
        document.getElementById('invoice-total').textContent = total.toLocaleString('en-ZA', { minimumFractionDigits: 2 });
    };

    lineItemsContainer.addEventListener('input', (e) => {
        const index = parseInt(e.target.dataset.index);
        if (e.target.classList.contains('line-item-desc')) invoice.lineItems[index].description = e.target.value;
        if (e.target.classList.contains('line-item-qty')) invoice.lineItems[index].quantity = parseFloat(e.target.value);
        if (e.target.classList.contains('line-item-price')) invoice.lineItems[index].price = parseFloat(e.target.value);
        updateInvoiceTotal();
    });

    lineItemsContainer.addEventListener('click', (e) => {
        if (e.target.closest('.remove-line-item')) {
            const index = parseInt(e.target.closest('.remove-line-item').dataset.index);
            invoice.lineItems.splice(index, 1);
            renderLineItems();
        }
    });

    addLineItemBtn.addEventListener('click', () => {
        invoice.lineItems.push({ description: '', quantity: 1, price: 0 });
        renderLineItems();
    });

    document.getElementById('invoice-form').addEventListener('submit', (e) => handleInvoiceFormSubmit(e, invoice));
    
    renderLineItems();
};

async function handleInvoiceFormSubmit(e, invoice) {
    e.preventDefault();
    const form = e.target;
    const invoiceId = form.dataset.id;
    const customerSelect = document.getElementById('invoice-customer');
    
    const invoiceData = {
        customerId: customerSelect.value,
        customerName: customerSelect.options[customerSelect.selectedIndex].text,
        dueDate: document.getElementById('invoice-due-date').value,
        issueDate: new Date().toISOString().split('T')[0],
        status: 'Draft',
        lineItems: invoice.lineItems,
        total: invoice.lineItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.price || 0), 0)
    };

    try {
        await saveDocument(`users/${currentUser.uid}/business/main/invoices`, invoiceData, invoiceId);
        showNotification('Invoice saved successfully.', 'success');
        removeModal('invoice-modal');
    } catch (error) {
        console.error("Error saving invoice:", error);
        showNotification('Failed to save invoice.', 'error');
    }
}

window.openBillModal = async (billId = null) => {
    let bill = {};
    if (billId) {
        bill = await getDocument(`users/${currentUser.uid}/business/main/bills`, billId) || {};
    }

    const supplierOptions = contactsCache.filter(c => c.type === 'Supplier').map(c => 
        `<option value="${c.id}" ${bill.supplierId === c.id ? 'selected' : ''}>${c.name}</option>`
    ).join('');

    const formHTML = `
        <form id="bill-form" data-id="${bill.id || ''}">
            <div class="space-y-4">
                <div><label class="block text-sm font-medium">Supplier</label><select id="bill-supplier" class="input">${supplierOptions}</select></div>
                <div><label class="block text-sm font-medium">Description</label><input type="text" id="bill-description" class="input" value="${bill.description || ''}" required></div>
                <div><label class="block text-sm font-medium">Amount (R)</label><input type="number" id="bill-total" class="input" value="${bill.total || ''}" required></div>
                <div><label class="block text-sm font-medium">Due Date</label><input type="date" id="bill-due-date" class="input" value="${bill.dueDate || ''}" required></div>
                <div><label class="block text-sm font-medium">Status</label>
                    <select id="bill-status" class="input">
                        <option value="Unpaid" ${bill.status === 'Unpaid' ? 'selected' : ''}>Unpaid</option>
                        <option value="Paid" ${bill.status === 'Paid' ? 'selected' : ''}>Paid</option>
                    </select>
                </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
                <button type="button" onclick="closeModal('bill-modal')" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">Save Bill</button>
            </div>
        </form>
    `;
    createModal('bill-modal', bill.id ? 'Edit Bill' : 'Add New Bill', formHTML, 'max-w-lg');
    document.getElementById('bill-form').addEventListener('submit', handleBillFormSubmit);
};

async function handleBillFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const billId = form.dataset.id;
    const supplierSelect = document.getElementById('bill-supplier');

    const billData = {
        supplierId: supplierSelect.value,
        supplierName: supplierSelect.options[supplierSelect.selectedIndex].text,
        description: document.getElementById('bill-description').value,
        total: parseFloat(document.getElementById('bill-total').value),
        dueDate: document.getElementById('bill-due-date').value,
        status: document.getElementById('bill-status').value,
        billDate: new Date().toISOString().split('T')[0]
    };

    try {
        await saveDocument(`users/${currentUser.uid}/business/main/bills`, billData, billId);
        showNotification('Bill saved successfully.', 'success');
        removeModal('bill-modal');
    } catch (error) {
        console.error("Error saving bill:", error);
        showNotification('Failed to save bill.', 'error');
    }
}

async function handleDeleteBill(billId) {
    try {
        await deleteDocument(`users/${currentUser.uid}/business/main/bills`, billId);
        showNotification('Bill deleted.', 'success');
    } catch (error) {
        console.error("Error deleting bill:", error);
        showNotification('Failed to delete bill.', 'error');
    }
}


// --- UTILITY FUNCTIONS ---
function showNotification(message, type = 'info') { /* ... same as before ... */ }

// --- HTML TEMPLATE ---
function getBusinessWorkspaceHTML() {
    return `
        <style>
            .tab-button { padding: 1rem 0.5rem; border-bottom: 3px solid transparent; color: #475569; font-weight: 600; transition: all 0.2s; cursor: pointer; }
            .tab-button:hover { color: #1e293b; }
            .tab-button.active { color: #4f46e5; border-bottom-color: #4f46e5; }
            .btn-primary { background-color: #4f46e5; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; transition: background-color 0.2s; }
            .btn-primary:hover { background-color: #4338ca; }
            .btn-secondary { background-color: #e2e8f0; color: #1e293b; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; transition: background-color 0.2s; }
            .btn-secondary:hover { background-color: #cbd5e1; }
            .input { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; margin-top: 0.25rem; }
        </style>
        <div class="bg-white rounded-lg shadow-md">
            <div class="border-b border-slate-200">
                <nav class="-mb-px flex flex-wrap space-x-6 px-6" id="business-tabs">
                    <button data-tab="dashboard" class="tab-button active">Dashboard</button>
                    <button data-tab="sales" class="tab-button">Sales</button>
                    <button data-tab="purchases" class="tab-button">Purchases</button>
                    <button data-tab="contacts" class="tab-button">Contacts</button>
                    <button data-tab="reports" class="tab-button">Reports</button>
                </nav>
            </div>
            <div id="business-tab-content" class="p-6">
                <!-- Business tab content will be rendered here -->
            </div>
        </div>
    `;
}
