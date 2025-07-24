/* ================================================================================= */
/* FILE: assets/js/modules/finhelp-business.js (Fully Functional)                    */
/* PURPOSE: Manages the business finance workspace including contacts, sales,        */
/* and purchases, providing a lightweight accounting solution.                       */
/* ================================================================================= */
import { auth } from '../firebase-config.js';
import { saveDocument, getDocument, deleteDocument } from '../database.js';

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
                        await renderBusinessTabContent('contacts');
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
                        await renderBusinessTabContent('purchases');
                    }
                    break;
                case 'generate-report':
                    generateProfitAndLossReport();
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

    let content = '';
    switch (tabName) {
        case 'dashboard':
            content = renderBusinessDashboard();
            container.innerHTML = content;
            await loadDashboardData();
            break;
        case 'sales':
            content = renderSalesTab();
            container.innerHTML = content;
            await loadInvoicesData();
            break;
        case 'purchases':
            content = renderPurchasesTab();
            container.innerHTML = content;
            await loadBillsData();
            break;
        case 'contacts':
            content = renderContactsTab();
            container.innerHTML = content;
            await loadContactsData();
            break;
        case 'reports':
            content = renderReportsTab();
            container.innerHTML = content;
            break;
        default:
            content = `<div class="text-center py-10">
                <h3 class="font-semibold text-lg text-slate-600">${tabName.charAt(0).toUpperCase() + tabName.slice(1)} Coming Soon</h3>
                <p class="text-slate-500 mt-2">This feature is under development.</p>
            </div>`;
            container.innerHTML = content;
    }
}

// --- DATA LOADING FUNCTIONS ---

async function loadDashboardData() {
    try {
        const invoicesCollection = await getDocument(`users/${currentUser.uid}/business/main`, 'invoices') || {};
        const billsCollection = await getDocument(`users/${currentUser.uid}/business/main`, 'bills') || {};
        
        // Convert object to array if needed
        const invoices = Array.isArray(invoicesCollection) ? invoicesCollection : Object.values(invoicesCollection);
        const bills = Array.isArray(billsCollection) ? billsCollection : Object.values(billsCollection);
        
        updateDashboardMetrics(invoices, bills);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        updateDashboardMetrics([], []); // Show zero values on error
    }
}

async function loadInvoicesData() {
    try {
        const invoicesCollection = await getDocument(`users/${currentUser.uid}/business/main`, 'invoices') || {};
        const invoices = Array.isArray(invoicesCollection) ? invoicesCollection : Object.values(invoicesCollection);
        renderInvoicesList(invoices);
    } catch (error) {
        console.error('Error loading invoices:', error);
        renderInvoicesList([]);
        showNotification('Error loading invoices', 'error');
    }
}

async function loadBillsData() {
    try {
        const billsCollection = await getDocument(`users/${currentUser.uid}/business/main`, 'bills') || {};
        const bills = Array.isArray(billsCollection) ? billsCollection : Object.values(billsCollection);
        renderBillsList(bills);
    } catch (error) {
        console.error('Error loading bills:', error);
        renderBillsList([]);
        showNotification('Error loading bills', 'error');
    }
}

async function loadContactsData() {
    try {
        const contactsCollection = await getDocument(`users/${currentUser.uid}/business/main`, 'contacts') || {};
        const contacts = Array.isArray(contactsCollection) ? contactsCollection : Object.values(contactsCollection);
        contactsCache = contacts; // Update cache
        renderContactsList(contacts);
    } catch (error) {
        console.error('Error loading contacts:', error);
        contactsCache = [];
        renderContactsList([]);
        showNotification('Error loading contacts', 'error');
    }
}

// --- TAB RENDERING FUNCTIONS ---

function renderBusinessDashboard() {
    return `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-red-100 border-l-4 border-red-500 p-6 rounded-lg shadow">
                <h4 class="font-semibold text-red-800">Overdue Invoices</h4>
                <p id="db-overdue-invoices" class="text-3xl font-bold mt-1 text-red-900">R 0.00</p>
            </div>
            <div class="bg-yellow-100 border-l-4 border-yellow-500 p-6 rounded-lg shadow">
                <h4 class="font-semibold text-yellow-800">Outstanding Revenue</h4>
                <p id="db-outstanding-revenue" class="text-3xl font-bold mt-1 text-yellow-900">R 0.00</p>
            </div>
            <div class="bg-blue-100 border-l-4 border-blue-500 p-6 rounded-lg shadow">
                <h4 class="font-semibold text-blue-800">Open Bills</h4>
                <p id="db-open-bills" class="text-3xl font-bold mt-1 text-blue-900">R 0.00</p>
            </div>
            <div class="bg-green-100 border-l-4 border-green-500 p-6 rounded-lg shadow">
                <h4 class="font-semibold text-green-800">30-Day Net Profit</h4>
                <p id="db-net-profit" class="text-3xl font-bold mt-1 text-green-900">R 0.00</p>
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

function updateDashboardMetrics(invoices, bills) {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const overdueInvoices = invoices.reduce((sum, inv) => {
        if (!inv.dueDate || !inv.status || !inv.total) return sum;
        const dueDate = new Date(inv.dueDate);
        if (inv.status !== 'Paid' && dueDate < today) {
            return sum + (parseFloat(inv.total) || 0);
        }
        return sum;
    }, 0);

    const outstandingRevenue = invoices.reduce((sum, inv) => {
        if (!inv.status || !inv.total) return sum;
        return inv.status !== 'Paid' ? sum + (parseFloat(inv.total) || 0) : sum;
    }, 0);
    
    const openBills = bills.reduce((sum, bill) => {
        if (!bill.status || !bill.total) return sum;
        return bill.status !== 'Paid' ? sum + (parseFloat(bill.total) || 0) : sum;
    }, 0);

    const income30Days = invoices.reduce((sum, inv) => {
        if (!inv.issueDate || !inv.total) return sum;
        const issueDate = new Date(inv.issueDate);
        if (issueDate >= thirtyDaysAgo) {
            return sum + (parseFloat(inv.total) || 0);
        }
        return sum;
    }, 0);

    const expenses30Days = bills.reduce((sum, bill) => {
        if (!bill.billDate || !bill.total) return sum;
        const billDate = new Date(bill.billDate);
        if (billDate >= thirtyDaysAgo) {
            return sum + (parseFloat(bill.total) || 0);
        }
        return sum;
    }, 0);

    const netProfit30Days = income30Days - expenses30Days;

    // Update DOM elements safely
    const overdueElement = document.getElementById('db-overdue-invoices');
    const outstandingElement = document.getElementById('db-outstanding-revenue');
    const billsElement = document.getElementById('db-open-bills');
    const profitElement = document.getElementById('db-net-profit');

    if (overdueElement) overdueElement.textContent = `R ${overdueInvoices.toLocaleString()}`;
    if (outstandingElement) outstandingElement.textContent = `R ${outstandingRevenue.toLocaleString()}`;
    if (billsElement) billsElement.textContent = `R ${openBills.toLocaleString()}`;
    if (profitElement) profitElement.textContent = `R ${netProfit30Days.toLocaleString()}`;
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
                    <tbody id="invoices-list-body">
                        <tr><td colspan="5" class="text-center p-8 text-slate-500">Loading invoices...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderInvoicesList(invoices) {
    const listBody = document.getElementById('invoices-list-body');
    if (!listBody) return;
    
    if (!invoices || invoices.length === 0) {
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
                <td class="p-4"><span class="px-2 py-1 text-xs font-semibold rounded-full ${statusColors[invoice.status] || statusColors.Draft}">${invoice.status || 'Draft'}</span></td>
                <td class="p-4 text-slate-600">${invoice.dueDate || 'N/A'}</td>
                <td class="p-4 font-medium text-slate-800">${invoice.customerName || 'Unknown'}</td>
                <td class="p-4 text-right font-semibold">R ${(parseFloat(invoice.total) || 0).toLocaleString()}</td>
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
                    <tbody id="bills-list-body">
                        <tr><td colspan="5" class="text-center p-8 text-slate-500">Loading bills...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderBillsList(bills) {
    const listBody = document.getElementById('bills-list-body');
    if (!listBody) return;
    
    if (!bills || bills.length === 0) {
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
                <td class="p-4"><span class="px-2 py-1 text-xs font-semibold rounded-full ${statusColors[bill.status] || statusColors.Unpaid}">${bill.status || 'Unpaid'}</span></td>
                <td class="p-4 text-slate-600">${bill.dueDate || 'N/A'}</td>
                <td class="p-4 font-medium text-slate-800">${bill.supplierName || 'Unknown'}</td>
                <td class="p-4 text-right font-semibold">R ${(parseFloat(bill.total) || 0).toLocaleString()}</td>
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
                    <tbody id="contacts-list-body">
                        <tr><td colspan="4" class="text-center p-8 text-slate-500">Loading contacts...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderContactsList(contacts) {
    const listBody = document.getElementById('contacts-list-body');
    if (!listBody) return;

    if (!contacts || contacts.length === 0) {
        listBody.innerHTML = `<tr><td colspan="4" class="text-center p-8 text-slate-500">No contacts added yet.</td></tr>`;
        return;
    }

    listBody.innerHTML = contacts.map(contact => `
        <tr class="hover:bg-slate-50">
            <td class="p-4 font-medium text-slate-800">${contact.name || 'Unknown'}</td>
            <td class="p-4 text-slate-600">${contact.email || 'N/A'}</td>
            <td class="p-4"><span class="px-2 py-1 text-xs font-semibold rounded-full ${contact.type === 'Customer' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}">${contact.type || 'Customer'}</span></td>
            <td class="p-4 text-right">
                <button data-action="open-contact-modal" data-id="${contact.id}" class="text-indigo-600 hover:text-indigo-800 mr-4"><i class="fas fa-edit"></i></button>
                <button data-action="delete-contact" data-id="${contact.id}" class="text-red-500 hover:text-red-700"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderReportsTab() {
    return `
        <h2 class="text-2xl font-bold text-slate-800 mb-4">Reports</h2>
        <div class="bg-white p-6 rounded-xl shadow-md">
            <h3 class="font-semibold text-lg mb-4">Profit & Loss Statement</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                    <label for="report-start-date" class="block text-sm font-medium text-slate-700">Start Date</label>
                    <input type="date" id="report-start-date" class="input">
                </div>
                <div>
                    <label for="report-end-date" class="block text-sm font-medium text-slate-700">End Date</label>
                    <input type="date" id="report-end-date" class="input">
                </div>
                <button data-action="generate-report" class="btn-primary h-10">Generate Report</button>
            </div>
            <div id="report-results" class="mt-8"></div>
        </div>
    `;
}

async function generateProfitAndLossReport() {
    const startDate = document.getElementById('report-start-date').value;
    const endDate = document.getElementById('report-end-date').value;
    const resultsContainer = document.getElementById('report-results');

    if (!startDate || !endDate) {
        resultsContainer.innerHTML = `<p class="text-red-500">Please select a start and end date.</p>`;
        return;
    }

    resultsContainer.innerHTML = `<p class="text-slate-500">Generating report...</p>`;

    try {
        const invoicesCollection = await getDocument(`users/${currentUser.uid}/business/main`, 'invoices') || {};
        const billsCollection = await getDocument(`users/${currentUser.uid}/business/main`, 'bills') || {};
        
        const invoices = Array.isArray(invoicesCollection) ? invoicesCollection : Object.values(invoicesCollection);
        const bills = Array.isArray(billsCollection) ? billsCollection : Object.values(billsCollection);

        const filteredInvoices = invoices.filter(inv => inv.issueDate >= startDate && inv.issueDate <= endDate);
        const filteredBills = bills.filter(bill => bill.billDate >= startDate && bill.billDate <= endDate);

        const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
        const totalExpenses = filteredBills.reduce((sum, bill) => sum + (parseFloat(bill.total) || 0), 0);
        const netProfit = totalRevenue - totalExpenses;

        resultsContainer.innerHTML = `
            <h4 class="font-bold text-xl mb-4">Profit & Loss from ${startDate} to ${endDate}</h4>
            <div class="space-y-3">
                <div class="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <span class="font-medium text-green-800">Total Revenue (from Invoices)</span>
                    <span class="font-bold text-lg text-green-900">R ${totalRevenue.toLocaleString()}</span>
                </div>
                <div class="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                    <span class="font-medium text-red-800">Total Expenses (from Bills)</span>
                    <span class="font-bold text-lg text-red-900">R ${totalExpenses.toLocaleString()}</span>
                </div>
                <div class="flex justify-between items-center p-4 bg-slate-100 rounded-lg border-t-2 border-slate-800">
                    <span class="font-bold text-slate-900">Net Profit</span>
                    <span class="font-bold text-2xl text-slate-900">R ${netProfit.toLocaleString()}</span>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error generating report:', error);
        resultsContainer.innerHTML = `<p class="text-red-500">Error generating report. Please try again.</p>`;
    }
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

window.openContactModal = async (contactId = null) => {
    let contact = {};
    if (contactId) {
        contact = await getDocument(`users/${currentUser.uid}/business/main/contacts`, contactId) || {};
    }

    const formHTML = `
        <form id="contact-form" data-id="${contact.id || ''}">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700">Name</label>
                    <input type="text" id="contact-name" class="input" value="${contact.name || ''}" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700">Email</label>
                    <input type="email" id="contact-email" class="input" value="${contact.email || ''}">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700">Phone</label>
                    <input type="tel" id="contact-phone" class="input" value="${contact.phone || ''}">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700">Type</label>
                    <select id="contact-type" class="input">
                        <option value="Customer" ${contact.type === 'Customer' ? 'selected' : ''}>Customer</option>
                        <option value="Supplier" ${contact.type === 'Supplier' ? 'selected' : ''}>Supplier</option>
                    </select>
                </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
                <button type="button" onclick="closeModal('contact-modal')" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">Save Contact</button>
            </div>
        </form>
    `;
    
    createModal('contact-modal', contact.id ? 'Edit Contact' : 'Add New Contact', formHTML);
    document.getElementById('contact-form').addEventListener('submit', handleContactFormSubmit);
};

window.closeModal = (id) => removeModal(id);

async function handleContactFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const contactId = form.dataset.id;

    const contactData = {
        name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        phone: document.getElementById('contact-phone').value,
        type: document.getElementById('contact-type').value
    };

    try {
        if (contactId) {
            await saveDocument(`users/${currentUser.uid}/business/main/contacts`, contactId, contactData);
        } else {
            await saveDocument(`users/${currentUser.uid}/business/main/contacts`, Date.now().toString(), contactData);
        }
        showNotification('Contact saved successfully.', 'success');
        removeModal('contact-modal');
        await renderBusinessTabContent('contacts');
    } catch (error) {
        console.error("Error saving contact:", error);
        showNotification('Failed to save contact.', 'error');
    }
}

async function handleDeleteContact(contactId) {
    try {
        await deleteDocument(`users/${currentUser.uid}/business/main/contacts`, contactId);
        showNotification('Contact deleted.', 'success');
    } catch (error) {
        console.error("Error deleting contact:", error);
        showNotification('Failed to delete contact.', 'error');
    }
}

window.openInvoiceModal = async (invoiceId = null) => {
    let invoice = { lineItems: [{ description: '', quantity: 1, price: 0 }] };
    if (invoiceId) {
        invoice = await getDocument(`users/${currentUser.uid}/business/main/invoices`, invoiceId) || invoice;
    }

    const customerOptions = contactsCache
        .filter(c => c.type === 'Customer')
        .map(c => `<option value="${c.id}" ${invoice.customerId === c.id ? 'selected' : ''}>${c.name}</option>`)
        .join('');

    const formHTML = `
        <form id="invoice-form" data-id="${invoice.id || ''}">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium">Customer</label>
                    <select id="invoice-customer" class="input" required>
                        <option value="">Select Customer</option>
                        ${customerOptions}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium">Due Date</label>
                    <input type="date" id="invoice-due-date" class="input" value="${invoice.dueDate || ''}" required>
                </div>
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
    createModal('invoice-modal', invoice.id ? 'Edit Invoice' : 'Create New Invoice', formHTML, 'max-w-2xl');
    
    setupInvoiceModal(invoice);
};

function setupInvoiceModal(invoice) {
    const lineItemsContainer = document.getElementById('invoice-line-items');
    const addLineItemBtn = document.getElementById('add-line-item');
    
    const renderLineItems = () => {
        lineItemsContainer.innerHTML = invoice.lineItems.map((item, index) => `
            <div class="grid grid-cols-12 gap-2 items-center">
                <div class="col-span-6">
                    <input type="text" class="input line-item-desc" placeholder="Description" value="${item.description}" data-index="${index}">
                </div>
                <div class="col-span-2">
                    <input type="number" class="input line-item-qty" placeholder="Qty" value="${item.quantity}" data-index="${index}" min="1">
                </div>
                <div class="col-span-3">
                    <input type="number" class="input line-item-price" placeholder="Price" value="${item.price}" data-index="${index}" min="0" step="0.01">
                </div>
                <div class="col-span-1 text-right">
                    <button type="button" class="text-red-500 remove-line-item" data-index="${index}">&times;</button>
                </div>
            </div>
        `).join('');
        updateInvoiceTotal();
    };

    const updateInvoiceTotal = () => {
        let total = 0;
        invoice.lineItems.forEach(item => {
            total += (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0);
        });
        const totalElement = document.getElementById('invoice-total');
        if (totalElement) {
            totalElement.textContent = total.toLocaleString('en-ZA', { minimumFractionDigits: 2 });
        }
    };

    lineItemsContainer.addEventListener('input', (e) => {
        const index = parseInt(e.target.dataset.index);
        if (e.target.classList.contains('line-item-desc')) {
            invoice.lineItems[index].description = e.target.value;
        }
        if (e.target.classList.contains('line-item-qty')) {
            invoice.lineItems[index].quantity = parseFloat(e.target.value) || 1;
        }
        if (e.target.classList.contains('line-item-price')) {
            invoice.lineItems[index].price = parseFloat(e.target.value) || 0;
        }
        updateInvoiceTotal();
    });

    lineItemsContainer.addEventListener('click', (e) => {
        if (e.target.closest('.remove-line-item')) {
            const index = parseInt(e.target.closest('.remove-line-item').dataset.index);
            if (invoice.lineItems.length > 1) {
                invoice.lineItems.splice(index, 1);
                renderLineItems();
            } else {
                showNotification('Invoice must have at least one line item.', 'error');
            }
        }
    });

    addLineItemBtn.addEventListener('click', () => {
        invoice.lineItems.push({ description: '', quantity: 1, price: 0 });
        renderLineItems();
    });

    document.getElementById('invoice-form').addEventListener('submit', (e) => handleInvoiceFormSubmit(e, invoice));
    
    renderLineItems();
}

async function handleInvoiceFormSubmit(e, invoice) {
    e.preventDefault();
    const form = e.target;
    const invoiceId = form.dataset.id;
    const customerSelect = document.getElementById('invoice-customer');
    
    if (!customerSelect.value) {
        showNotification('Please select a customer.', 'error');
        return;
    }

    const invoiceData = {
        customerId: customerSelect.value,
        customerName: customerSelect.options[customerSelect.selectedIndex].text,
        dueDate: document.getElementById('invoice-due-date').value,
        issueDate: new Date().toISOString().split('T')[0],
        status: 'Draft',
        lineItems: invoice.lineItems,
        total: invoice.lineItems.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0), 0)
    };

    try {
        if (invoiceId) {
            await saveDocument(`users/${currentUser.uid}/business/main/invoices`, invoiceId, invoiceData);
        } else {
            await saveDocument(`users/${currentUser.uid}/business/main/invoices`, Date.now().toString(), invoiceData);
        }
        showNotification('Invoice saved successfully.', 'success');
        removeModal('invoice-modal');
        await renderBusinessTabContent('sales');
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

    const supplierOptions = contactsCache
        .filter(c => c.type === 'Supplier')
        .map(c => `<option value="${c.id}" ${bill.supplierId === c.id ? 'selected' : ''}>${c.name}</option>`)
        .join('');

    const formHTML = `
        <form id="bill-form" data-id="${bill.id || ''}">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium">Supplier</label>
                    <select id="bill-supplier" class="input" required>
                        <option value="">Select Supplier</option>
                        ${supplierOptions}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium">Description</label>
                    <input type="text" id="bill-description" class="input" value="${bill.description || ''}" required>
                </div>
                <div>
                    <label class="block text-sm font-medium">Amount (R)</label>
                    <input type="number" id="bill-total" class="input" value="${bill.total || ''}" required min="0" step="0.01">
                </div>
                <div>
                    <label class="block text-sm font-medium">Due Date</label>
                    <input type="date" id="bill-due-date" class="input" value="${bill.dueDate || ''}" required>
                </div>
                <div>
                    <label class="block text-sm font-medium">Status</label>
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

    if (!supplierSelect.value) {
        showNotification('Please select a supplier.', 'error');
        return;
    }

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
        if (billId) {
            await saveDocument(`users/${currentUser.uid}/business/main/bills`, billId, billData);
        } else {
            await saveDocument(`users/${currentUser.uid}/business/main/bills`, Date.now().toString(), billData);
        }
        showNotification('Bill saved successfully.', 'success');
        removeModal('bill-modal');
        await renderBusinessTabContent('purchases');
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
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// --- HTML TEMPLATE ---
function getBusinessWorkspaceHTML() {
    return `
        <style>
            .tab-button { padding: 1rem 0.5rem; border-bottom: 3px solid transparent; color: #475569; font-weight: 600; transition: all 0.2s; cursor: pointer; }
            .tab-button:hover { color: #1e293b; }
            .tab-button.active { color: #4f46e5; border-bottom-color: #4f46e5; }
            .btn-primary { background-color: #4f46e5; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; transition: background-color 0.2s; cursor: pointer; }
            .btn-primary:hover { background-color: #4338ca; }
            .btn-secondary { background-color: #e2e8f0; color: #1e293b; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; transition: background-color 0.2s; cursor: pointer; }
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
