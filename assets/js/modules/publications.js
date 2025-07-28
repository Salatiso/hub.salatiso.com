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
    getDoc,
    where
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- STATE MANAGEMENT ---
let currentUser = null;
let publicationsCache = [];
let quillEditor = null;
let currentEditingDocId = null;
let autoSaveTimer = null;

// --- INITIALIZATION ---
document.addEventListener('firebase-ready', () => {
    // Load required external libraries
    loadExternalLibraries().then(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                currentUser = user;
                // Check if we are on a public page or the main module
                const path = window.location.pathname.split('/');
                if (path[1] === 'public') {
                    if (path.length >= 4) {
                        const userId = path[2];
                        const docId = path[3];
                        initPublicView(userId, docId);
                    } else if (path.length === 3) {
                        const userId = path[2];
                        initUserPublicPage(userId);
                    }
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
});

/**
 * Loads external libraries required for the module
 */
async function loadExternalLibraries() {
    return new Promise((resolve) => {
        // Load QRCode library if not already loaded
        if (typeof QRCode === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
            script.onload = resolve;
            document.head.appendChild(script);
        } else {
            resolve();
        }
    });
}

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
        renderDashboard();
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
            document.body.innerHTML = `
                <div class="min-h-screen flex items-center justify-center bg-slate-100">
                    <div class="text-center p-10 bg-white rounded-xl shadow-lg">
                        <i class="fas fa-lock fa-3x text-slate-300 mb-4"></i>
                        <h1 class="text-2xl font-bold text-slate-700">Publication Not Available</h1>
                        <p class="text-slate-500 mt-2">This publication may be private or no longer exists.</p>
                        <a href="/" class="btn btn-primary mt-4">Go to The Hub</a>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error("Error loading public view:", error);
        document.body.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-slate-100">
                <div class="text-center p-10 bg-white rounded-xl shadow-lg">
                    <i class="fas fa-exclamation-triangle fa-3x text-red-300 mb-4"></i>
                    <h1 class="text-2xl font-bold text-red-700">Error Loading Publication</h1>
                    <p class="text-slate-500 mt-2">Could not load this publication.</p>
                    <a href="/" class="btn btn-primary mt-4">Go to The Hub</a>
                </div>
            </div>
        `;
    }
}

/**
 * Initializes the user's public page showing all their publications
 * @param {string} userId - The ID of the user
 */
async function initUserPublicPage(userId) {
    console.log(`Loading public page for user ${userId}`);
    try {
        // Get user profile
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        // Get public publications
        const q = query(
            collection(db, 'users', userId, 'publications'),
            where('status', '==', 'public'),
            orderBy('lastUpdatedAt', 'desc')
        );
        const publicationsSnap = await getDocs(q);
        const publications = publicationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const userData = userSnap.exists() ? userSnap.data() : { displayName: 'Unknown Author' };
        
        document.title = `${userData.displayName} | The Hub Publications`;
        document.body.innerHTML = renderUserPublicPage(userData, publications, userId);
    } catch (error) {
        console.error("Error loading user public page:", error);
        document.body.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-slate-100">
                <div class="text-center p-10 bg-white rounded-xl shadow-lg">
                    <i class="fas fa-exclamation-triangle fa-3x text-red-300 mb-4"></i>
                    <h1 class="text-2xl font-bold text-red-700">Error Loading Page</h1>
                    <p class="text-slate-500 mt-2">Could not load this user's publications.</p>
                    <a href="/" class="btn btn-primary mt-4">Go to The Hub</a>
                </div>
            </div>
        `;
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
        quillEditor.setText('');
    }
    clearAutoSave();

    const listContainer = document.getElementById('publications-list');
    if (publicationsCache.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center p-10 bg-white rounded-lg shadow-sm">
                <i class="fas fa-feather-alt fa-3x text-slate-300 mb-4"></i>
                <h3 class="text-xl font-bold text-slate-700">Your canvas is empty.</h3>
                <p class="text-slate-500 mt-2">Click 'Create New Publication' to start writing.</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = publicationsCache.map(pub => `
        <div class="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow">
            <div class="flex-grow">
                <h4 class="font-bold text-lg text-indigo-700">${pub.title || 'Untitled'}</h4>
                <div class="flex items-center space-x-3 text-xs mt-1">
                    <span class="font-semibold uppercase text-slate-500">${(pub.template || 'article').replace('_', ' ')}</span>
                    <span class="text-slate-400">&bull;</span>
                    ${pub.status === 'public' 
                        ? `<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">Public</span>`
                        : `<span class="px-2 py-1 bg-slate-100 text-slate-800 rounded-full font-medium">Private</span>`
                    }
                    <span class="text-slate-400">&bull;</span>
                    <span class="text-slate-500">Updated: ${pub.lastUpdatedAt?.toDate ? new Date(pub.lastUpdatedAt.toDate()).toLocaleDateString() : 'Unknown'}</span>
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <button data-action="edit" data-id="${pub.id}" class="btn btn-secondary px-3 py-1 text-sm">
                    <i class="fas fa-pen mr-1"></i> Edit
                </button>
                <button data-action="settings" data-id="${pub.id}" class="btn btn-secondary px-3 py-1 text-sm">
                    <i class="fas fa-cog mr-1"></i> Settings
                </button>
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

        // Set up auto-save on content change
        quillEditor.on('text-change', () => {
            if (currentEditingDocId) {
                setupAutoSave();
            }
        });
    }

    const titleInput = document.getElementById('editor-title');
    if (docId) {
        const publication = publicationsCache.find(p => p.id === docId);
        if (publication) {
            titleInput.value = publication.title || '';
            quillEditor.root.innerHTML = publication.content || '';
        }
    } else {
        titleInput.value = '';
        quillEditor.setText('');
    }

    // Set up auto-save for title changes
    titleInput.addEventListener('input', () => {
        if (currentEditingDocId) {
            setupAutoSave();
        }
    });

    setupAutoSave();
}

// --- AUTO-SAVE FUNCTIONALITY ---

function setupAutoSave() {
    clearAutoSave();
    autoSaveTimer = setTimeout(() => {
        handleSaveDraft(true); // Silent save
    }, 2000); // Auto-save after 2 seconds of inactivity
}

function clearAutoSave() {
    if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = null;
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
            case 'download':
                downloadPublication(id);
                break;
        }
    });
    
    // Modal close buttons
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal-overlay').classList.add('hidden');
        });
    });

    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.add('hidden');
        }
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
        renderEditor(docRef.id);
    } catch (error) {
        console.error("Error creating new document:", error);
        showNotification('Could not create draft.', 'error');
    }
}

/**
 * Saves the current content in the editor to Firestore.
 */
async function handleSaveDraft(silent = false) {
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
        if (!silent) {
            showNotification('Draft saved successfully!', 'success');
        }
    } catch (error) {
        console.error("Error saving draft:", error);
        if (!silent) {
            showNotification('Could not save draft.', 'error');
        }
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

        // Update QR code
        const qrContainer = document.getElementById('settings-qrcode');
        if (isPublic && url) {
            qrContainer.innerHTML = '';
            QRCode.toCanvas(qrContainer, url, { width: 128 }, function (error) {
                if (error) console.error('QR Code generation error:', error);
            });
        } else {
            qrContainer.innerHTML = '';
        }

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
    const downloadBtn = document.getElementById('settings-download-btn');
    
    titleEl.textContent = publication.title;
    statusToggle.checked = publication.status === 'public';
    statusToggle.dataset.id = docId;
    deleteBtn.dataset.id = docId;
    printBtn.dataset.id = docId;
    downloadBtn.dataset.id = docId;

    if (publication.status === 'public') {
        urlInput.value = publication.publicUrl;
        urlContainer.classList.remove('hidden');
        
        // Generate QR Code
        qrContainer.innerHTML = '';
        QRCode.toCanvas(qrContainer, publication.publicUrl, { width: 128 }, function (error) {
            if (error) console.error('QR Code generation error:', error);
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
    const printHTML = renderTemplate(publication, true); // Pass true for print mode
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

async function downloadPublication(docId) {
    const publication = publicationsCache.find(p => p.id === docId);
    if (!publication) return;

    try {
        // Create a temporary iframe to render the content
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '210mm';
        iframe.style.height = '297mm';
        document.body.appendChild(iframe);

        const doc = iframe.contentDocument;
        doc.open();
        doc.write(renderTemplate(publication, true));
        doc.close();

        // Wait for content to load
        setTimeout(() => {
            iframe.contentWindow.print();
            document.body.removeChild(iframe);
        }, 1000);

        showNotification('Download initiated!', 'success');
    } catch (error) {
        console.error('Download error:', error);
        showNotification('Download failed.', 'error');
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Link copied to clipboard!', 'success');
        }, () => {
            showNotification('Failed to copy link.', 'error');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showNotification('Link copied to clipboard!', 'success');
        } catch (err) {
            showNotification('Failed to copy link.', 'error');
        }
        document.body.removeChild(textArea);
    }
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
        <div id="create-modal" class="hidden modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg">
                <h2 class="text-2xl font-bold text-slate-800 mb-2">Create New Publication</h2>
                <p class="text-slate-500 mb-6">Choose a title and a template to get started.</p>
                <div class="space-y-4">
                    <div>
                        <label class="font-medium text-slate-700" for="create-title">Title</label>
                        <input class="input w-full p-3 border border-slate-300 rounded-lg" id="create-title" type="text" placeholder="My Awesome Article">
                    </div>
                    <div>
                        <label class="font-medium text-slate-700" for="create-template">Template</label>
                        <select id="create-template" class="input w-full p-3 border border-slate-300 rounded-lg">
                            <option value="article">Standard Article</option>
                            <option value="research_paper">Formal Research Paper</option>
                            <option value="open_letter">Advocacy / Open Letter</option>
                            <option value="newsletter">Newsletter / Bulletin</option>
                            <option value="magazine">Magazine Layout</option>
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
        <div id="settings-modal" class="hidden modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                            <input id="settings-public-url" type="text" readonly class="input flex-grow rounded-r-none border-r-0">
                            <button data-action="copy-link" class="btn btn-secondary rounded-l-none border border-l-0 border-slate-300 px-4">
                                <i class="fas fa-copy"></i>
                            </button>
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
                             <button data-action="download" id="settings-download-btn" class="btn btn-secondary">
                                 <i class="fas fa-download mr-2"></i>Download
                             </button>
                             <button data-action="print" id="settings-print-btn" class="btn btn-secondary">
                                 <i class="fas fa-print mr-2"></i>Print
                             </button>
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

// --- USER PUBLIC PAGE RENDERING ---

function renderUserPublicPage(userData, publications, userId) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <title>${userData.displayName || 'Author'} | The Hub Publications</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
            <style>
                body { font-family: 'Inter', sans-serif; }
                .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            </style>
        </head>
        <body class="bg-slate-50">
            <!-- Header -->
            <header class="gradient-bg text-white py-16">
                <div class="max-w-4xl mx-auto px-4 text-center">
                    <div class="w-24 h-24 bg-white rounded-full mx-auto mb-6 flex items-center justify-center">
                        <i class="fas fa-user text-3xl text-slate-600"></i>
                    </div>
                    <h1 class="text-4xl font-bold mb-2">${userData.displayName || 'Author'}</h1>
                    <p class="text-xl opacity-90">Published Articles & Thoughts</p>
                    <div class="mt-6">
                        <span class="inline-block bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">
                            ${publications.length} Publication${publications.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            </header>

            <!-- Publications Grid -->
            <main class="max-w-4xl mx-auto px-4 py-12">
                ${publications.length > 0 ? `
                    <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        ${publications.map(pub => `
                            <article class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                <div class="p-6">
                                    <div class="flex items-center justify-between mb-3">
                                        <span class="px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full ${getTemplateColor(pub.template)}">
                                            ${(pub.template || 'article').replace('_', ' ')}
                                        </span>
                                        <span class="text-xs text-slate-500">
                                            ${pub.lastUpdatedAt?.toDate ? new Date(pub.lastUpdatedAt.toDate()).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                    <h3 class="text-xl font-bold text-slate-800 mb-3">${pub.title}</h3>
                                    <div class="prose prose-sm text-slate-600 mb-4">
                                        ${getExcerpt(pub.content)}
                                    </div>
                                    <a href="public/${userId}/${pub.id}" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                                        Read More
                                        <i class="fas fa-arrow-right ml-2 text-sm"></i>
                                    </a>
                                </div>
                            </article>
                        `).join('')}
                    </div>
                ` : `
                    <div class="text-center py-16">
                        <i class="fas fa-book-open fa-3x text-slate-300 mb-6"></i>
                        <h2 class="text-2xl font-bold text-slate-700 mb-4">No Publications Yet</h2>
                        <p class="text-slate-500">This author hasn't published any articles yet.</p>
                    </div>
                `}
            </main>

            ${getTemplateFooter()}
        </body>
        </html>
    `;
}

function getTemplateColor(template) {
    const colors = {
        'article': 'bg-blue-100 text-blue-800',
        'research_paper': 'bg-purple-100 text-purple-800',
        'open_letter': 'bg-red-100 text-red-800',
        'newsletter': 'bg-green-100 text-green-800',
        'magazine': 'bg-yellow-100 text-yellow-800'
    };
    return colors[template] || colors['article'];
}

function getExcerpt(content, maxLength = 150) {
    // Strip HTML tags and get plain text excerpt
    const div = document.createElement('div');
    div.innerHTML = content || '';
    const text = div.textContent || div.innerText || '';
    return text.length > maxLength ? text.substr(0, maxLength) + '...' : text;
}

// --- TEMPLATE RENDERING ENGINE ---

function renderTemplate(publication, printMode = false) {
    const templates = {
        'article': renderTemplateArticle,
        'research_paper': renderTemplateResearch,
        'open_letter': renderTemplateOpenLetter,
        'newsletter': renderTemplateNewsletter,
        'magazine': renderTemplateMagazine
    };

    const renderFunction = templates[publication.template] || templates['article'];
    return renderFunction(publication, printMode);
}

function getTemplateFooter() {
    return `
        <footer class="mt-16 py-12 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
            <div class="max-w-4xl mx-auto px-4 text-center">
                <div class="mb-6">
                    <h3 class="text-2xl font-bold mb-2">Published with The Hub by Salatiso</h3>
                    <div class="w-16 h-0.5 bg-indigo-400 mx-auto"></div>
                </div>
                <p class="text-slate-300 text-lg leading-relaxed mb-6">
                    The Hub is a comprehensive platform designed to empower individuals and communities by providing tools for financial management, career development, effective communication, and personal growth. It's a space where you can grow, share knowledge, and build a better future for yourself and your community.
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <a href="https://hub.salatiso.com" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-colors inline-flex items-center">
                        <i class="fas fa-rocket mr-2"></i>
                        Create Your Own Page Today
                    </a>
                    <a href="https://hub.salatiso.com/about" class="text-slate-300 hover:text-white underline">
                        Learn More About The Hub
                    </a>
                </div>
            </div>
        </footer>
    `;
}

function getPrintStyles() {
    return `
        <style>
            @media print {
                .no-print { display: none !important; }
                body { font-size: 12pt; line-height: 1.4; }
                h1 { font-size: 20pt; }
                h2 { font-size: 16pt; }
                h3 { font-size: 14pt; }
                .page-break { page-break-before: always; }
                footer { page-break-inside: avoid; }
            }
        </style>
    `;
}

function renderTemplateArticle(pub, printMode = false) {
    return `
        <!DOCTYPE html><html lang="en"><head>
            <title>${pub.title}</title>
            <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            ${printMode ? getPrintStyles() : ''}
            <style>
                body { background-color: #fff; font-family: 'Lora', serif; }
                .prose { color: #334155; line-height: 1.7; }
                .prose h1 { font-family: 'Inter', sans-serif; font-weight: 800; color: #1e293b; }
                .prose h2, .prose h3 { font-family: 'Inter', sans-serif; font-weight: 700; color: #1e293b; }
                .prose a { color: #4f46e5; }
                .prose blockquote { border-left-color: #4f46e5; }
            </style>
        </head><body>
            <main class="py-12 px-4">
                <article class="prose prose-lg max-w-4xl mx-auto">
                    <h1>${pub.title}</h1>
                    <div class="flex items-center space-x-4 text-slate-600 mb-8 not-prose">
                        <span>By ${pub.authorName}</span>
                        <span>&bull;</span>
                        <span>Published on ${pub.lastUpdatedAt?.toDate ? new Date(pub.lastUpdatedAt.toDate()).toLocaleDateString() : ''}</span>
                    </div>
                    ${pub.content}
                </article>
            </main>
            ${printMode ? '' : getTemplateFooter()}
        </body></html>
    `;
}

function renderTemplateResearch(pub, printMode = false) {
    return `
        <!DOCTYPE html><html lang="en"><head>
            <title>${pub.title}</title>
            <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            ${printMode ? getPrintStyles() : ''}
            <style>
                body { background-color: #f8fafc; font-family: 'Source Serif 4', serif; }
                .paper-body { background-color: white; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
                .content h1, .content h2, .content h3 { font-family: 'Inter', sans-serif; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin-top: 2rem; }
            </style>
        </head><body>
            <div class="max-w-4xl mx-auto my-12 p-10 paper-body">
                <header class="text-center pb-8 border-b mb-8">
                     <h1 class="text-4xl font-bold text-slate-900 mb-4">${pub.title}</h1>
                     <p class="text-xl text-slate-600 mb-4">A Formal Research Paper</p>
                     <div class="space-y-1 text-slate-500">
                         <p class="text-lg">Author: ${pub.authorName}</p>
                         <p>Date: ${pub.lastUpdatedAt?.toDate ? new Date(pub.lastUpdatedAt.toDate()).toLocaleDateString() : ''}</p>
                     </div>
                </header>
                <section class="content text-slate-800 leading-relaxed">${pub.content}</section>
            </div>
            ${printMode ? '' : getTemplateFooter()}
        </body></html>
    `;
}

function renderTemplateOpenLetter(pub, printMode = false) {
    return `
        <!DOCTYPE html><html lang="en"><head>
            <title>${pub.title}</title>
            <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            ${printMode ? getPrintStyles() : ''}
            <style> body { font-family: 'Inter', sans-serif; } </style>
        </head><body>
            <div class="max-w-4xl mx-auto my-12 p-10 bg-white">
                <div class="border-b-4 border-slate-900 pb-6 mb-12">
                    <h1 class="text-4xl font-bold tracking-wide uppercase text-slate-900 mb-2">${pub.title}</h1>
                    <p class="text-xl text-slate-600">An Open Letter for Advocacy</p>
                </div>
                <div class="text-right mb-12 text-slate-600">
                    <p class="text-lg font-medium">${pub.authorName}</p>
                    <p>${pub.lastUpdatedAt?.toDate ? new Date(pub.lastUpdatedAt.toDate()).toLocaleDateString() : ''}</p>
                </div>
                <div class="text-slate-700 leading-loose prose prose-lg max-w-none">${pub.content}</div>
            </div>
            ${printMode ? '' : getTemplateFooter()}
        </body></html>
    `;
}

function renderTemplateNewsletter(pub, printMode = false) {
     return `
        <!DOCTYPE html><html lang="en"><head>
            <title>${pub.title}</title>
            <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            ${printMode ? getPrintStyles() : ''}
            <style> 
                body { font-family: 'Inter', sans-serif; background-color: #e2e8f0; } 
                @media print { body { background-color: white; } }
            </style>
        </head><body>
            <div class="max-w-4xl mx-auto my-8">
                <header class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-t-lg text-center">
                    <h1 class="text-4xl font-extrabold mb-2">${pub.title}</h1>
                    <p class="text-xl opacity-90">Newsletter &bull; ${pub.lastUpdatedAt?.toDate ? new Date(pub.lastUpdatedAt.toDate()).toLocaleDateString() : ''}</p>
                </header>
                <div class="bg-white p-8 rounded-b-lg">
                    <div class="prose prose-lg max-w-none">${pub.content}</div>
                </div>
            </div>
            ${printMode ? '' : getTemplateFooter()}
        </body></html>
    `;
}

function renderTemplateMagazine(pub, printMode = false) {
    return `
        <!DOCTYPE html><html lang="en"><head>
            <title>${pub.title}</title>
            <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
            ${printMode ? getPrintStyles() : ''}
            <style>
                body { font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                .magazine-header { font-family: 'Playfair Display', serif; }
                .magazine-body { background-color: white; }
                @media print { body { background: white; } }
            </style>
        </head><body>
            <div class="min-h-screen py-12 px-4">
                <div class="max-w-4xl mx-auto">
                    <header class="magazine-header text-center text-white mb-8">
                        <div class="border-4 border-white p-8 rounded-lg backdrop-blur-sm bg-white bg-opacity-10">
                            <h1 class="text-5xl font-black uppercase tracking-wider mb-4">${pub.title}</h1>
                            <div class="flex items-center justify-center space-x-4 text-lg">
                                <span>${pub.authorName}</span>
                                <span>&bull;</span>
                                <span>${pub.lastUpdatedAt?.toDate ? new Date(pub.lastUpdatedAt.toDate()).toLocaleDateString() : ''}</span>
                            </div>
                        </div>
                    </header>
                    <article class="magazine-body p-12 rounded-lg shadow-2xl">
                        <div class="prose prose-xl max-w-none">
                            ${pub.content}
                        </div>
                    </article>
                </div>
            </div>
            ${printMode ? '' : getTemplateFooter()}
        </body></html>
    `;
}
