/* ================================================================================= */
/* FILE: assets/js/modules/publications.js (v1.0 Publications Hub)                   */
/* PURPOSE: A comprehensive publishing platform for creating, managing, and          */
/* sharing various types of documents.                                               */
/* AUTHOR: Salatiso & Gemini                                                         */
/* DATE: July 25, 2025                                                               */
/* ================================================================================= */

import { auth, db } from '../firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
    doc, 
    collection, 
    addDoc, 
    getDocs, 
    setDoc, 
    deleteDoc, 
    onSnapshot, 
    query,
    updateDoc,
    serverTimestamp,
    orderBy,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- STATE MANAGEMENT ---
let currentUser = null;
let publicationsCache = [];
let quillEditor = null;
let currentEditingDocId = null; // The ID of the doc currently in the editor

// --- INITIALIZATION ---
document.addEventListener('firebase-ready', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            // Check if we are on a public page or the main module
            const path = window.location.pathname.split('/');
            if (path[1] === 'public' && path.length >= 4) {
                const userId = path[2];
                const docId = path[3];
                initPublicView(userId, docId);
            } else {
                init();
            }
        } else {
            // Handle not logged in state for the main module
            const container = document.getElementById('publications-module-container');
            if (container) {
                container.innerHTML = `<p class="text-center p-10 text-red-500">You must be logged in to access the Publications Hub.</p>`;
            }
        }
    });
});

/**
 * Initializes the main Publications Hub dashboard.
 */
function init() {
    const container = document.getElementById('publications-module-container');
    if (!container) {
        console.error("Publications module container not found.");
        return;
    }
    console.log("Initializing Publications Hub for user:", currentUser.uid);
    
    // Render the main layout and attach listeners
    container.innerHTML = getModuleLayoutHTML();
    attachEventListeners();
    
    // Set up real-time listener for publications
    const q = query(collection(db, 'users', currentUser.uid, 'publications'), orderBy('lastUpdatedAt', 'desc'));
    onSnapshot(q, (snapshot) => {
        publicationsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderDashboard(); // Re-render the dashboard whenever data changes
    }, error => {
        console.error("Error fetching publications:", error);
        showNotification("Could not load your publications.", 'error');
    });
}

/**
 * Initializes the public-facing view of a single article.
 * @param {string} userId - The ID of the author.
 * @param {string} docId - The ID of the publication.
 */
async function initPublicView(userId, docId) {
    console.log(`Loading public view for user ${userId}, doc ${docId}`);
    try {
        const docRef = doc(db, 'users', userId, 'publications', docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().status === 'public') {
            const publication = { id: docSnap.id, ...docSnap.data() };
            document.title = `${publication.title} | The Hub`;
            document.body.innerHTML = renderTemplate(publication);
        } else {
            document.body.innerHTML = `<p class="text-center p-10">This publication is not available.</p>`;
        }
    } catch (error) {
        console.error("Error loading public view:", error);
        document.body.innerHTML = `<p class="text-center p-10 text-red-500">Could not load this publication.</p>`;
    }
}


// --- VIEW RENDERING ---

/**
 * Renders the list of publications on the dashboard.
 */
function renderDashboard() {
    const dashboardView = document.getElementById('view-dashboard');
    const editorView = document.getElementById('view-editor');
    if (!dashboardView || !editorView) return;

    // Ensure dashboard is visible and editor is hidden
    dashboardView.classList.remove('hidden');
    editorView.classList.add('hidden');
    currentEditingDocId = null;
    if (quillEditor) {
        quillEditor.setText(''); // Clear editor
    }

    const listContainer = document.getElementById('publications-list');
    if (publicationsCache.length === 0) {
        listContainer.innerHTML = `<div class="text-center p-10 bg-white rounded-lg shadow-sm">
            <i class="fas fa-feather-alt fa-3x text-slate-300 mb-4"></i>
            <h3 class="text-xl font-bold text-slate-700">Your canvas is empty.</h3>
            <p class="text-slate-500 mt-2">Click 'Create New Publication' to start writing.</p>
        </div>`;
        return;
    }

    listContainer.innerHTML = publicationsCache.map(pub => `
        <div class="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
                <h4 class="font-bold text-lg text-indigo-700">${pub.title || 'Untitled'}</h4>
                <div class="flex items-center space-x-3 text-xs mt-1">
                    <span class="font-semibold uppercase text-slate-500">${pub.template.replace('_', ' ')}</span>
                    <span class="text-slate-400">&bull;</span>
                    ${pub.status === 'public' 
                        ? `<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">Public</span>`
                        : `<span class="px-2 py-1 bg-slate-100 text-slate-800 rounded-full font-medium">Private</span>`
                    }
                    <span class="text-slate-400">&bull;</span>
                    <span class="text-slate-500">Updated: ${new Date(pub.lastUpdatedAt?.toDate()).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <button data-action="edit" data-id="${pub.id}" class="btn btn-secondary px-3 py-1 text-sm"><i class="fas fa-pen mr-1"></i> Edit</button>
                <button data-action="settings" data-id="${pub.id}" class="btn btn-secondary px-3 py-1 text-sm"><i class="fas fa-cog mr-1"></i> Settings</button>
            </div>
        </div>
    `).join('');
}

/**
 * Renders the editor view for a new or existing publication.
 * @param {string|null} docId - The ID of the document to edit, or null for a new one.
 */
async function renderEditor(docId) {
    const dashboardView = document.getElementById('view-dashboard');
    const editorView = document.getElementById('view-editor');
    dashboardView.classList.add('hidden');
    editorView.classList.remove('hidden');

    currentEditingDocId = docId;

    // Initialize Quill editor if it doesn't exist
    if (!quillEditor) {
        quillEditor = new Quill('#quill-editor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{'list': 'ordered'}, {'list': 'bullet'}],
                    [{ 'script': 'sub'}, { 'script': 'super' }],
                    [{ 'indent': '-1'}, { 'indent': '+1' }],
                    ['link', 'image'],
                    ['clean']
                ]
            }
        });
    }

    const titleInput = document.getElementById('editor-title');
    if (docId) {
        const publication = publicationsCache.find(p => p.id === docId);
        if (publication) {
            titleInput.value = publication.title;
            quillEditor.root.innerHTML = publication.content;
        }
    } else {
        // New document
        titleInput.value = '';
        quillEditor.setText('');
    }
}


// --- EVENT HANDLING ---

function attachEventListeners() {
    const container = document.getElementById('publications-module-container');
    container.addEventListener('click', e => {
        const actionTarget = e.target.closest('[data-action]');
        if (!actionTarget) return;

        const { action, id } = actionTarget.dataset;
        e.preventDefault();

        switch (action) {
            case 'create-new':
                document.getElementById('create-modal').classList.remove('hidden');
                break;
            case 'start-creating':
                handleCreateNew();
                break;
            case 'edit':
                renderEditor(id);
                break;
            case 'save-draft':
                handleSaveDraft();
                break;
            case 'back-to-dashboard':
                renderDashboard();
                break;
            case 'settings':
                openSettingsModal(id);
                break;
            case 'update-status':
                handleUpdateStatus(e);
                break;
            case 'delete':
                handleDelete(id);
                break;
            case 'copy-link':
                copyToClipboard(document.getElementById('settings-public-url').value);
                break;
            case 'print':
                printPublication(id);
                break;
        }
    });
    
    // Modal close buttons
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal-overlay').classList.add('hidden');
        });
    });
}

/**
 * Handles the creation of a new publication document.
 */
async function handleCreateNew() {
    const title = document.getElementById('create-title').value || 'Untitled';
    const template = document.getElementById('create-template').value;
    document.getElementById('create-modal').classList.add('hidden');

    try {
        const newDoc = {
            title,
            template,
            content: '',
            status: 'private',
            authorName: currentUser.displayName || 'Anonymous',
            createdAt: serverTimestamp(),
            lastUpdatedAt: serverTimestamp(),
            publicUrl: ''
        };
        const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'publications'), newDoc);
        showNotification('Draft created!', 'success');
        renderEditor(docRef.id); // Open the new draft in the editor
    } catch (error) {
        console.error("Error creating new document:", error);
        showNotification('Could not create draft.', 'error');
    }
}

/**
 * Saves the current content in the editor to Firestore.
 */
async function handleSaveDraft() {
    if (!currentEditingDocId || !quillEditor) return;

    const title = document.getElementById('editor-title').value;
    const content = quillEditor.root.innerHTML;

    try {
        const docRef = doc(db, 'users', currentUser.uid, 'publications', currentEditingDocId);
        await updateDoc(docRef, {
            title,
            content,
            lastUpdatedAt: serverTimestamp()
        });
        showNotification('Draft saved successfully!', 'success');
    } catch (error) {
        console.error("Error saving draft:", error);
        showNotification('Could not save draft.', 'error');
    }
}

/**
 * Handles the public/private status toggle.
 */
async function handleUpdateStatus(e) {
    const docId = e.target.dataset.id;
    const isPublic = e.target.checked;
    const status = isPublic ? 'public' : 'private';
    const url = isPublic ? `${window.location.origin}/public/${currentUser.uid}/${docId}` : '';

    try {
        const docRef = doc(db, 'users', currentUser.uid, 'publications', docId);
        await updateDoc(docRef, { status, publicUrl: url });

        // Update the UI in the modal
        const urlContainer = document.getElementById('settings-url-container');
        const urlInput = document.getElementById('settings-public-url');
        urlContainer.classList.toggle('hidden', !isPublic);
        urlInput.value = url;

        showNotification('Visibility updated!', 'success');
    } catch (error) {
        console.error("Error updating status:", error);
        showNotification('Could not update visibility.', 'error');
    }
}

/**
 * Handles deleting a publication.
 */
async function handleDelete(docId) {
    if (confirm('Are you sure you want to permanently delete this publication?')) {
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'publications', docId));
            showNotification('Publication deleted.', 'success');
            document.getElementById('settings-modal').classList.add('hidden');
            // The onSnapshot listener will handle re-rendering the dashboard.
        } catch (error) {
            console.error("Error deleting document:", error);
            showNotification('Could not delete publication.', 'error');
        }
    }
}

// --- MODALS & UTILITIES ---

function openSettingsModal(docId) {
    const publication = publicationsCache.find(p => p.id === docId);
    if (!publication) return;

    const modal = document.getElementById('settings-modal');
    const titleEl = document.getElementById('settings-title');
    const statusToggle = document.getElementById('settings-status-toggle');
    const urlContainer = document.getElementById('settings-url-container');
    const urlInput = document.getElementById('settings-public-url');
    const qrContainer = document.getElementById('settings-qrcode');
    const deleteBtn = document.getElementById('settings-delete-btn');
    const printBtn = document.getElementById('settings-print-btn');
    
    titleEl.textContent = publication.title;
    statusToggle.checked = publication.status === 'public';
    statusToggle.dataset.id = docId;
    deleteBtn.dataset.id = docId;
    printBtn.dataset.id = docId;

    if (publication.status === 'public') {
        urlInput.value = publication.publicUrl;
        urlContainer.classList.remove('hidden');
        
        // Generate QR Code
        qrContainer.innerHTML = '';
        new QRCode(qrContainer, {
            text: publication.publicUrl,
            width: 128,
            height: 128,
        });

    } else {
        urlContainer.classList.add('hidden');
        qrContainer.innerHTML = '';
    }

    modal.classList.remove('hidden');
}

function printPublication(docId) {
    const publication = publicationsCache.find(p => p.id === docId);
    if (!publication) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(renderTemplate(publication));
    printWindow.document.close();
    // Use a timeout to ensure content is loaded before printing
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Link copied to clipboard!', 'success');
    }, () => {
        showNotification('Failed to copy link.', 'error');
    });
}

function showNotification(message, type = 'info') {
    const container = document.body;
    const notification = document.createElement('div');
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };
    notification.className = `fixed bottom-5 right-5 p-4 rounded-lg text-white shadow-lg z-[100] transform transition-transform translate-y-20 ${colors[type] || 'bg-slate-800'}`;
    notification.textContent = message;
    container.appendChild(notification);

    setTimeout(() => {
        notification.classList.remove('translate-y-20');
    }, 10);

    setTimeout(() => {
        notification.classList.add('translate-y-20');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// --- HTML TEMPLATES ---

function getModuleLayoutHTML() {
    return `
        <div class="p-4 sm:p-6 lg:p-8 h-full">
            <!-- Header -->
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">Publications Hub</h1>
                    <p class="text-slate-500">Your personal space to write, manage, and publish.</p>
                </div>
                <button data-action="create-new" class="btn btn-primary flex items-center">
                    <i class="fas fa-plus mr-2"></i> Create New Publication
                </button>
            </div>

            <!-- Dashboard View -->
            <div id="view-dashboard">
                <div id="publications-list" class="space-y-4">
                    <!-- Publication items will be rendered here -->
                </div>
            </div>

            <!-- Editor View -->
            <div id="view-editor" class="hidden">
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <div class="flex justify-between items-center mb-4">
                         <input type="text" id="editor-title" placeholder="Your Title Here..." class="text-3xl font-bold text-slate-800 w-full border-0 focus:ring-0 p-0">
                         <div class="flex space-x-2">
                             <button data-action="save-draft" class="btn btn-secondary">Save Draft</button>
                             <button data-action="back-to-dashboard" class="btn btn-primary">Done</button>
                         </div>
                    </div>
                    <div id="quill-editor" style="height: 500px;"></div>
                </div>
            </div>
        </div>

        ${getCreateModalHTML()}
        ${getSettingsModalHTML()}
    `;
}

function getCreateModalHTML() {
    return `
        <div id="create-modal" class="hidden modal-overlay">
            <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg">
                <h2 class="text-2xl font-bold text-slate-800 mb-2">Create New Publication</h2>
                <p class="text-slate-500 mb-6">Choose a title and a template to get started.</p>
                <div class="space-y-4">
                    <div>
                        <label class="font-medium text-slate-700" for="create-title">Title</label>
                        <input class="input" id="create-title" type="text" placeholder="My Awesome Article">
                    </div>
                    <div>
                        <label class="font-medium text-slate-700" for="create-template">Template</label>
                        <select id="create-template" class="input">
                            <option value="article">Standard Article</option>
                            <option value="research_paper">Formal Research Paper</option>
                            <option value="open_letter">Advocacy / Open Letter</option>
                            <option value="newsletter">Newsletter / Bulletin</option>
                        </select>
                    </div>
                </div>
                <div class="flex justify-end mt-8 space-x-4">
                    <button type="button" data-modal-close class="btn btn-secondary">Cancel</button>
                    <button type="button" data-action="start-creating" class="btn btn-primary">Start Creating</button>
                </div>
            </div>
        </div>
    `;
}

function getSettingsModalHTML() {
    return `
        <div id="settings-modal" class="hidden modal-overlay">
            <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl">
                <h2 class="text-2xl font-bold text-slate-800 mb-2">Publication Settings</h2>
                <p id="settings-title" class="text-slate-500 mb-6">Settings for your article.</p>
                
                <div class="space-y-6">
                    <!-- Visibility -->
                    <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <label for="settings-status-toggle" class="font-medium text-slate-800">Visibility</label>
                        <div class="flex items-center">
                            <span class="mr-3 text-sm font-medium text-slate-900">Private</span>
                            <label class="inline-flex relative items-center cursor-pointer">
                                <input type="checkbox" value="" id="settings-status-toggle" data-action="update-status" class="sr-only peer">
                                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                            <span class="ml-3 text-sm font-medium text-slate-900">Public</span>
                        </div>
                    </div>

                    <!-- Public URL -->
                    <div id="settings-url-container" class="hidden">
                        <label class="font-medium text-slate-700">Shareable Link</label>
                        <div class="flex items-stretch mt-1">
                            <input id="settings-public-url" type="text" readonly class="input rounded-r-none flex-grow">
                            <button data-action="copy-link" class="btn btn-secondary rounded-l-none border border-l-0 border-slate-300 px-4"><i class="fas fa-copy"></i></button>
                        </div>
                    </div>
                    
                    <!-- QR Code -->
                    <div id="settings-qrcode-container" class="text-center">
                         <div id="settings-qrcode" class="inline-block p-4 bg-white border rounded-lg"></div>
                    </div>

                    <!-- Actions -->
                    <div class="flex justify-between items-center pt-6 border-t">
                         <button data-action="delete" id="settings-delete-btn" class="btn btn-danger">Delete Publication</button>
                         <div class="space-x-2">
                             <button data-action="print" id="settings-print-btn" class="btn btn-secondary"><i class="fas fa-print mr-2"></i>Print</button>
                         </div>
                    </div>
                </div>

                <button type="button" data-modal-close class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <i class="fas fa-times fa-lg"></i>
                </button>
            </div>
        </div>
    `;
}


// --- TEMPLATE RENDERING ENGINE ---

function renderTemplate(publication) {
    const templates = {
        'article': renderTemplateArticle,
        'research_paper': renderTemplateResearch,
        'open_letter': renderTemplateOpenLetter,
        'newsletter': renderTemplateNewsletter
    };

    const renderFunction = templates[publication.template] || templates['article'];
    return renderFunction(publication);
}

function getTemplateFooter() {
    return `
        <footer class="mt-16 py-8 bg-slate-100 border-t">
            <div class="max-w-4xl mx-auto px-4 text-center text-slate-500">
                <p class="font-bold">Published with The Hub by Salatiso</p>
                <p class="text-sm mt-2">The Hub is a platform designed to empower individuals and communities by providing tools for finance, career development, communication, and more. It's a space to grow, share, and build a better future.</p>
                <a href="https://hub.salatiso.com" class="text-sm mt-3 inline-block text-indigo-600 hover:underline">Create your own page today &rarr;</a>
            </div>
        </footer>
    `;
}

function renderTemplateArticle(pub) {
    return `
        <!DOCTYPE html><html lang="en"><head>
            <title>${pub.title}</title>
            <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&family=Manrope:wght@400;700&display=swap" rel="stylesheet">
            <style>
                body { background-color: #fff; font-family: 'Lora', serif; }
                .prose { color: #334155; line-height: 1.7; }
                .prose h1 { font-family: 'Manrope', sans-serif; font-weight: 800; color: #1e293b; }
                .prose h2, .prose h3 { font-family: 'Manrope', sans-serif; font-weight: 700; color: #1e293b; }
                .prose a { color: #4f46e5; }
                .prose blockquote { border-left-color: #4f46e5; }
            </style>
        </head><body>
            <main class="py-12 px-4">
                <article class="prose prose-lg max-w-4xl mx-auto">
                    <h1>${pub.title}</h1>
                    <p class="lead text-xl text-slate-600">By ${pub.authorName} &bull; Published on ${new Date(pub.lastUpdatedAt.toDate()).toLocaleDateString()}</p>
                    ${pub.content}
                </article>
            </main>
            ${getTemplateFooter()}
        </body></html>
    `;
}

function renderTemplateResearch(pub) {
    return `
        <!DOCTYPE html><html lang="en"><head>
            <title>${pub.title}</title>
            <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,700&family=Manrope:wght@400;700&display=swap" rel="stylesheet">
            <style>
                body { background-color: #f8fafc; font-family: 'Source Serif 4', serif; }
                .paper-body { background-color: white; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
                .content h1, .content h2, .content h3 { font-family: 'Manrope', sans-serif; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin-top: 2rem; }
            </style>
        </head><body>
            <div class="max-w-4xl mx-auto my-12 p-10 paper-body">
                <header class="text-center pb-8 border-b">
                     <h1 class="text-4xl font-bold text-slate-900">${pub.title}</h1>
                     <p class="mt-4 text-lg text-slate-600">A Formal Research Paper</p>
                     <p class="mt-2 text-md text-slate-500">Author: ${pub.authorName}</p>
                     <p class="text-sm text-slate-400">Date: ${new Date(pub.lastUpdatedAt.toDate()).toLocaleDateString()}</p>
                </header>
                <section class="content mt-8 text-slate-800 leading-relaxed">${pub.content}</section>
            </div>
            ${getTemplateFooter()}
        </body></html>
    `;
}

function renderTemplateOpenLetter(pub) {
    return `
        <!DOCTYPE html><html lang="en"><head>
            <title>${pub.title}</title>
            <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700&display=swap" rel="stylesheet">
            <style> body { font-family: 'Manrope', sans-serif; } </style>
        </head><body>
            <div class="max-w-4xl mx-auto my-12 p-10 bg-white">
                <div class="border-b-4 border-slate-900 pb-4 mb-8">
                    <h1 class="text-3xl font-bold tracking-wider uppercase text-slate-900">${pub.title}</h1>
                    <p class="text-lg text-slate-600 mt-1">An Open Letter for Advocacy</p>
                </div>
                <div class="text-right mb-12">
                    <p>${pub.authorName}</p>
                    <p>${new Date(pub.lastUpdatedAt.toDate()).toLocaleDateString()}</p>
                </div>
                <div class="text-slate-700 leading-loose">${pub.content}</div>
            </div>
            ${getTemplateFooter()}
        </body></html>
    `;
}

function renderTemplateNewsletter(pub) {
     return `
        <!DOCTYPE html><html lang="en"><head>
            <title>${pub.title}</title>
            <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&display=swap" rel="stylesheet">
            <style> body { font-family: 'Manrope', sans-serif; background-color: #e2e8f0; } </style>
        </head><body>
            <div class="max-w-4xl mx-auto my-8">
                <header class="bg-indigo-700 text-white p-8 rounded-t-lg text-center">
                    <h1 class="text-4xl font-extrabold">${pub.title}</h1>
                    <p class="mt-2 opacity-80">Newsletter &bull; ${new Date(pub.lastUpdatedAt.toDate()).toLocaleDateString()}</p>
                </header>
                <div class="bg-white p-8 rounded-b-lg">
                    <div class="prose prose-lg max-w-none">${pub.content}</div>
                </div>
            </div>
            ${getTemplateFooter()}
        </body></html>
    `;
}
