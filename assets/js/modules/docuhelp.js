/* ================================================================================= */
/* FILE: assets/js/modules/docuhelp.js (Comprehensive Document Management)           */
/* PURPOSE: Manages the full document lifecycle: generation from templates, uploading, */
/* and secure storage and retrieval.                                                 */
/* ================================================================================= */
import { auth, db } from '../firebase-config.js';
import { addDocument, getDocumentsRealtime } from '../database.js';
import { uploadFile } from '../storage.js';

let currentUser = null;
let unsubscribeListeners = [];

// --- TEMPLATE DATABASE (Expanded from previous version) ---
const templates = [
    {
        id: 'general_affidavit',
        title: 'General Affidavit',
        description: 'A sworn statement of fact for legal use.',
        icon: 'fa-gavel',
        fields: [
            { id: 'deponent_name', label: 'Your Full Name (Deponent)', type: 'text' },
            { id: 'deponent_address', label: 'Your Address', type: 'textarea' },
            { id: 'statement', label: 'Statement of Fact', type: 'textarea' },
            { id: 'commissioner_location', label: 'Location of Signing', type: 'text' }
        ],
        template: `...` // Template text omitted for brevity
    },
    {
        id: 'residential_lease',
        title: 'Residential Lease Agreement',
        description: 'Standard agreement for renting property.',
        icon: 'fa-house-user',
        fields: [
            { id: 'landlord_name', label: 'Landlord Full Name', type: 'text' },
            { id: 'tenant_name', label: 'Tenant Full Name', type: 'text' },
            { id: 'property_address', label: 'Rental Property Address', type: 'textarea' },
            { id: 'start_date', label: 'Lease Start Date', type: 'date' },
            { id: 'end_date', label: 'Lease End Date', type: 'date' },
            { id: 'monthly_rent', label: 'Monthly Rent (R)', type: 'number' },
            { id: 'deposit_amount', label: 'Security Deposit (R)', type: 'number' }
        ],
        template: `...` // Template text omitted for brevity
    }
];

export function init(user) {
    if (!user) return;
    currentUser = user;
    console.log("DocuHelp module initialized.");

    attachTabListeners();
    renderTabContent('documents'); // Default to the main document list
}

function attachTabListeners() {
    document.querySelectorAll('#docu-tabs .tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const tabName = e.currentTarget.dataset.tab;
            document.querySelectorAll('#docu-tabs .tab-button').forEach(btn => btn.classList.remove('active'));
            e.currentTarget.classList.add('active');
            renderTabContent(tabName);
        });
    });
}

function renderTabContent(tabName) {
    const contentContainer = document.getElementById('tab-content');
    unsubscribeListeners.forEach(unsub => unsub());
    unsubscribeListeners = [];

    switch (tabName) {
        case 'documents':
            renderMyDocuments(contentContainer);
            break;
        case 'templates':
            renderTemplateLibrary(contentContainer);
            break;
        case 'shared':
            contentContainer.innerHTML = `<p class="text-center text-slate-500">Secure document sharing and digital signature functionality will be available here soon.</p>`;
            break;
    }
}

// --- "MY DOCUMENTS" TAB ---

function renderMyDocuments(container) {
    container.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-slate-800">My Documents</h2>
            <label for="doc-upload" class="btn-primary text-sm cursor-pointer">
                <i class="fas fa-upload mr-2"></i> Upload Document
            </label>
            <input type="file" id="doc-upload" class="hidden">
        </div>
        <div class="bg-white rounded-lg shadow-sm">
            <div id="documents-list" class="overflow-x-auto">
                <!-- Document list will be rendered here -->
            </div>
        </div>
    `;

    document.getElementById('doc-upload').addEventListener('change', handleFileUpload);

    const unsub = getDocumentsRealtime(`users/${currentUser.uid}/documents`, (docs) => {
        const listContainer = document.getElementById('documents-list');
        if (!listContainer) return;
        
        if (docs.length === 0) {
            listContainer.innerHTML = `<p class="text-center text-slate-500 p-8">Your document hub is empty. Upload a file or generate one from a template.</p>`;
            return;
        }

        // Sort by date, newest first
        docs.sort((a,b) => b.createdAt.seconds - a.createdAt.seconds);

        listContainer.innerHTML = `
            <table class="min-w-full">
                <thead class="bg-slate-50"><tr>
                    <th class="p-4 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                    <th class="p-4 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                    <th class="p-4 text-left text-xs font-medium text-slate-500 uppercase">Date Added</th>
                    <th class="relative p-4"></th>
                </tr></thead>
                <tbody>
                    ${docs.map(doc => `
                        <tr class="hover:bg-slate-50 border-b last:border-b-0">
                            <td class="p-4 font-medium text-slate-800">${doc.name}</td>
                            <td class="p-4 text-sm text-slate-600">${doc.type}</td>
                            <td class="p-4 text-sm text-slate-600">${new Date(doc.createdAt.seconds * 1000).toLocaleDateString()}</td>
                            <td class="p-4 text-right"><a href="${doc.url}" target="_blank" class="text-indigo-600 hover:underline text-sm">View</a></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    });
    unsubscribeListeners.push(unsub);
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const filePath = `users/${currentUser.uid}/uploads/${Date.now()}_${file.name}`;
    
    try {
        // This would ideally show a loading indicator
        const downloadURL = await uploadFile(file, filePath);
        
        const docData = {
            name: file.name,
            type: file.type || 'Uploaded File',
            url: downloadURL,
            createdAt: new Date(),
            source: 'upload'
        };

        await addDocument(`users/${currentUser.uid}/documents`, docData);
        alert("File uploaded successfully!");

    } catch (error) {
        console.error("Error uploading file:", error);
        alert("File upload failed.");
    } finally {
        event.target.value = ''; // Reset file input
    }
}

// --- "TEMPLATE LIBRARY" TAB ---

function renderTemplateLibrary(container) {
    container.innerHTML = `
        <h2 class="text-2xl font-bold text-slate-800 mb-4">Template Library</h2>
        <div id="templates-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
    `;
    const templatesContainer = document.getElementById('templates-container');
    templates.forEach(template => {
        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-lg shadow-sm border border-slate-200 cursor-pointer hover:shadow-lg transition-shadow flex flex-col items-center text-center';
        card.dataset.templateId = template.id;
        card.innerHTML = `
            <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <i class="fas ${template.icon} text-2xl text-indigo-600"></i>
            </div>
            <h3 class="text-lg font-bold text-slate-800 mt-4">${template.title}</h3>
            <p class="text-sm text-slate-500 mt-1 flex-grow">${template.description}</p>
        `;
        card.addEventListener('click', () => openGeneratorModal(template.id));
        templatesContainer.appendChild(card);
    });
}

function openGeneratorModal(templateId) {
    // This is the logic from your previous file, now integrated
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const modal = document.getElementById('doc-modal');
    const form = document.getElementById('doc-form');
    const title = document.getElementById('doc-modal-title');
    
    title.textContent = `Generate: ${template.title}`;
    form.innerHTML = '';
    form.dataset.templateId = templateId;

    template.fields.forEach(field => {
        const fieldGroup = document.createElement('div');
        let inputHtml = field.type === 'textarea'
            ? `<textarea id="${field.id}" name="${field.id}" rows="4" class="input" required></textarea>`
            : `<input type="${field.type}" id="${field.id}" name="${field.id}" class="input" required>`;
        fieldGroup.innerHTML = `<label for="${field.id}" class="block text-sm font-medium text-slate-700">${field.label}</label>${inputHtml}`;
        form.appendChild(fieldGroup);
    });
    
    form.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', generatePreview);
    });

    document.getElementById('save-doc-btn').onclick = handleSaveGeneratedDoc;
    document.getElementById('close-doc-modal').onclick = () => modal.classList.add('hidden');
    document.getElementById('print-doc-btn').onclick = () => window.print();

    generatePreview();
    modal.classList.remove('hidden');
}

function generatePreview() {
    const form = document.getElementById('doc-form');
    const template = templates.find(t => t.id === form.dataset.templateId);
    if (!template) return;

    let generatedText = template.template;
    template.fields.forEach(field => {
        const input = form.querySelector(`#${field.id}`);
        const placeholder = `[${field.id}]`;
        generatedText = generatedText.replace(new RegExp(placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), input.value || placeholder);
    });
    
    document.getElementById('document-preview').textContent = generatedText.trim();
}

async function handleSaveGeneratedDoc() {
    const form = document.getElementById('doc-form');
    const template = templates.find(t => t.id === form.dataset.templateId);
    const content = document.getElementById('document-preview').textContent;
    
    const docData = {
        name: `${template.title}.txt`,
        type: 'Generated Document',
        content: content,
        createdAt: new Date(),
        source: 'template'
    };

    // In a real app, we'd save the text content as a file in Storage and link it.
    // For now, we'll save the content directly in Firestore (note: this has size limits).
    try {
        await addDocument(`users/${currentUser.uid}/documents`, docData);
        alert("Document saved successfully to 'My Documents'!");
        document.getElementById('doc-modal').classList.add('hidden');
    } catch (error) {
        console.error("Error saving generated document:", error);
        alert("Could not save document.");
    }
}
