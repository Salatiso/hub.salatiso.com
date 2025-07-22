/* ================================================================================= */
/* FILE: assets/js/modules/docuhelp.js (NEW - REPLACES PLACEHOLDER)                  */
/* ================================================================================= */
import { auth } from '../firebase-config.js';

// --- TEMPLATE DATABASE ---
// In a real application, this might be fetched from Firestore, but for v1 it's self-contained.
const templates = [
    {
        id: 'general_affidavit',
        title: 'General Affidavit',
        description: 'A sworn statement of fact for use in various legal proceedings.',
        icon: 'fa-gavel',
        fields: [
            { id: 'deponent_name', label: 'Your Full Name (Deponent)', type: 'text', placeholder: 'John Doe' },
            { id: 'deponent_address', label: 'Your Address', type: 'textarea', placeholder: '123 Main Street, Johannesburg' },
            { id: 'statement', label: 'Statement of Fact', type: 'textarea', placeholder: 'Enter the facts you are swearing to, in numbered paragraphs if possible.' },
            { id: 'commissioner_location', label: 'Location of Signing', type: 'text', placeholder: 'Johannesburg' }
        ],
        template: `
            GENERAL AFFIDAVIT

            I, the undersigned,

            [deponent_name]
             residing at [deponent_address]

            do hereby make oath and state that:

            1. The facts deposed to herein are within my own personal knowledge, unless the context indicates otherwise, and are true and correct.

            2. [statement]

            _________________________
            DEPONENT

            I certify that the deponent has acknowledged that he/she knows and understands the contents of this affidavit, that he/she has no objection to taking the prescribed oath, and that he/she considers the prescribed oath to be binding on his/her conscience.

            Thus signed and sworn to before me at [commissioner_location] on this ______ day of _________________ 20____.

            _________________________
            COMMISSIONER OF OATHS
        `
    },
    {
        id: 'residential_lease',
        title: 'Residential Lease Agreement',
        description: 'A standard agreement for renting a residential property.',
        icon: 'fa-house-user',
        fields: [
            { id: 'landlord_name', label: 'Landlord Full Name', type: 'text', placeholder: 'Jane Smith' },
            { id: 'tenant_name', label: 'Tenant Full Name', type: 'text', placeholder: 'John Doe' },
            { id: 'property_address', label: 'Rental Property Address', type: 'textarea', placeholder: '456 Oak Avenue, Sandton' },
            { id: 'start_date', label: 'Lease Start Date', type: 'date' },
            { id: 'end_date', label: 'Lease End Date', type: 'date' },
            { id: 'monthly_rent', label: 'Monthly Rent (R)', type: 'number', placeholder: '8500' },
            { id: 'deposit_amount', label: 'Security Deposit (R)', type: 'number', placeholder: '8500' }
        ],
        template: `
            RESIDENTIAL LEASE AGREEMENT

            1. PARTIES
            The Landlord: [landlord_name]
            The Tenant: [tenant_name]

            2. PROPERTY
            The Landlord agrees to lease to the Tenant the property located at:
            [property_address]

            3. TERM
            This lease shall commence on [start_date] and terminate on [end_date].

            4. RENT
            The monthly rent shall be R [monthly_rent], payable on the 1st day of each month.

            5. DEPOSIT
            A security deposit of R [deposit_amount] shall be paid by the Tenant to the Landlord upon signing this agreement.

            Signed on this ______ day of _________________ 20____.

            _________________________
            LANDLORD

            _________________________
            TENANT
        `
    }
];

export function init(user) {
    if (!user || !user.uid) {
        console.error("DocuHelp Error: User not authenticated.");
        return;
    }
    console.log("DocuHelp module initialized.");

    renderTemplateCards();
    setupEventListeners();
}

function setupEventListeners() {
    const modal = document.getElementById('doc-modal');
    document.getElementById('close-doc-modal').addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('print-doc-btn').addEventListener('click', () => window.print());
}

function renderTemplateCards() {
    const container = document.getElementById('templates-container');
    container.innerHTML = '';
    templates.forEach(template => {
        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-lg shadow-sm border border-slate-200 cursor-pointer template-card flex flex-col items-center text-center';
        card.dataset.templateId = template.id;
        card.innerHTML = `
            <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <i class="fas ${template.icon} text-2xl text-indigo-600"></i>
            </div>
            <h3 class="text-lg font-bold text-slate-800 mt-4">${template.title}</h3>
            <p class="text-sm text-slate-500 mt-1">${template.description}</p>
        `;
        card.addEventListener('click', () => openGeneratorModal(template.id));
        container.appendChild(card);
    });
}

function openGeneratorModal(templateId) {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const modal = document.getElementById('doc-modal');
    const form = document.getElementById('doc-form');
    const title = document.getElementById('doc-modal-title');
    
    title.textContent = `Generate: ${template.title}`;
    form.innerHTML = ''; // Clear previous form fields
    form.dataset.templateId = templateId;

    // Build the form dynamically
    template.fields.forEach(field => {
        const fieldGroup = document.createElement('div');
        let inputHtml = '';
        if (field.type === 'textarea') {
            inputHtml = `<textarea id="${field.id}" name="${field.id}" rows="4" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm" placeholder="${field.placeholder || ''}" required></textarea>`;
        } else {
            inputHtml = `<input type="${field.type}" id="${field.id}" name="${field.id}" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm" placeholder="${field.placeholder || ''}" required>`;
        }
        fieldGroup.innerHTML = `
            <label for="${field.id}" class="block text-sm font-medium text-slate-700">${field.label}</label>
            ${inputHtml}
        `;
        form.appendChild(fieldGroup);
    });
    
    // Attach live update listeners
    form.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', generatePreview);
    });

    generatePreview(); // Initial generation with placeholders
    modal.classList.remove('hidden');
}

function generatePreview() {
    const form = document.getElementById('doc-form');
    const templateId = form.dataset.templateId;
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    let generatedText = template.template;
    const formData = new FormData(form);

    for (const [key, value] of formData.entries()) {
        const placeholder = `[${key}]`;
        // Use a global regex to replace all occurrences
        generatedText = generatedText.replace(new RegExp(placeholder, 'g'), value || placeholder);
    }
    
    // For any fields not filled, keep the placeholder text
    template.fields.forEach(field => {
        const placeholder = `[${field.id}]`;
        if (!formData.has(field.id) || formData.get(field.id) === '') {
             generatedText = generatedText.replace(new RegExp(placeholder, 'g'), placeholder);
        }
    });

    document.getElementById('document-preview').textContent = generatedText.trim();
}
