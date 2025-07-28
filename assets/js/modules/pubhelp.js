/* ================================================================================= */
/* FILE: assets/js/modules/pubhelp.js - Unified Content Creation & Publishing Hub    */
/* PURPOSE: Combines publications.js and commshub.js into comprehensive platform     */
/* AUTHOR: Salatiso & Claude                                                          */
/* DATE: July 28, 2025                                                               */
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

// --- CONSTANTS ---
const CONTENT_TYPES = {
    QUICK_POST: 'quick_post',
    ARTICLE: 'article',
    ESSAY: 'essay',
    RESEARCH: 'research_paper',
    LETTER: 'open_letter',
    NEWSLETTER: 'newsletter',
    MAGAZINE: 'magazine',
    MEMO: 'memorandum',
    REPORT: 'report',
    BOOK: 'book',
    CREATIVE: 'creative'
};

const PUBLISHING_DESTINATIONS = {
    PRIVATE: 'private',
    GROUP: 'group',
    PUBLIC: 'public',
    MARKETPLACE: 'marketplace'
};

// --- STATE MANAGEMENT ---
let currentUser = null;
let currentView = 'dashboard';
let currentContent = null;
let quillEditor = null;
let selectedContentType = null;
let selectedTemplate = null;
let userPublications = [];
let userGroups = [];
let autoSaveTimer = null;
let unsubscribeListeners = [];

// --- INITIALIZATION ---
document.addEventListener('firebase-ready', () => {
    console.log('PubHelp: Firebase ready, initializing...');
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            console.log('PubHelp: User authenticated:', user.email);
            init();
        } else {
            console.log('PubHelp: No user authenticated');
            showAuthRequired();
        }
    });
});

/**
 * Main initialization function
 */
function init() {
    console.log('PubHelp: Initializing for user:', currentUser.uid);
    
    // Show the app container
    const appContainer = document.getElementById('app-container');
    if (appContainer) {
        appContainer.style.visibility = 'visible';
    }
    
    // Set up event listeners
    attachEventListeners();
    
    // Load user data
    loadUserData();
    
    // Render initial view
    switchView('dashboard');
}

/**
 * Load user data from Firebase
 */
async function loadUserData() {
    try {
        // Load user publications
        const publicationsQuery = query(
            collection(db, 'users', currentUser.uid, 'pubhelpContent'),
            orderBy('updatedAt', 'desc')
        );
        
        const unsubscribePublications = onSnapshot(publicationsQuery, (snapshot) => {
            userPublications = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            }));
            
            // Update dashboard if currently viewing
            if (currentView === 'dashboard') {
                renderDashboard();
            }
        });
        unsubscribeListeners.push(unsubscribePublications);

        // Load user groups
        const groupsQuery = query(
            collection(db, 'pubhelpGroups'),
            where('members', 'array-contains', currentUser.uid)
        );
        
        const unsubscribeGroups = onSnapshot(groupsQuery, (snapshot) => {
            userGroups = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            }));
            
            // Update groups view if currently viewing
            if (currentView === 'groups') {
                renderGroups();
            }
        });
        unsubscribeListeners.push(unsubscribeGroups);

    } catch (error) {
        console.error('PubHelp: Error loading user data:', error);
        showNotification('Failed to load your data. Please refresh the page.', 'error');
    }
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
    // Navigation tabs
    document.querySelectorAll('#pubhelp-nav .nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const view = e.currentTarget.dataset.view;
            switchView(view);
        });
    });

    // Modal close buttons
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if (modal) {
                modal.classList.add('hidden');
            }
        });
    });

    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.add('hidden');
        }
    });

    // Content type selection
    document.getElementById('select-content-type').addEventListener('click', handleContentTypeSelection);
    
    // Template selection
    document.getElementById('select-template').addEventListener('click', handleTemplateSelection);
    
    // Publishing form
    document.getElementById('publishing-form').addEventListener('submit', handlePublishing);
    document.getElementById('publish-visibility').addEventListener('change', handleVisibilityChange);
    document.getElementById('save-draft').addEventListener('click', handleSaveDraft);
    document.getElementById('publish-content').addEventListener('click', handlePublishContent);
}

/**
 * Switch between different views
 */
function switchView(viewName, data = null) {
    console.log('PubHelp: Switching to view:', viewName);
    
    currentView = viewName;
    
    // Update navigation
    document.querySelectorAll('#pubhelp-nav .nav-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.view === viewName) {
            tab.classList.add('active');
        }
    });
    
    // Show/hide editor tab based on view
    const editorTab = document.querySelector('[data-view="editor"]');
    if (viewName === 'editor') {
        editorTab.style.display = 'block';
    } else if (viewName !== 'editor') {
        editorTab.style.display = 'none';
    }
    
    // Render the view
    renderCurrentView(data);
}

/**
 * Render the current view
 */
function renderCurrentView(data = null) {
    const contentArea = document.getElementById('pubhelp-content');
    
    switch(currentView) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'create':
            renderCreateView();
            break;
        case 'editor':
            renderEditor(data);
            break;
        case 'groups':
            renderGroups();
            break;
        case 'analytics':
            renderAnalytics();
            break;
        case 'settings':
            renderSettings();
            break;
        default:
            renderDashboard();
    }
}

/**
 * Render the dashboard view
 */
function renderDashboard() {
    const contentArea = document.getElementById('pubhelp-content');
    
    contentArea.innerHTML = `
        <div class="max-w-7xl mx-auto p-6">
            <!-- Header -->
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">PubHelp Dashboard</h1>
                    <p class="text-slate-600 mt-1">Your comprehensive content creation and publishing hub</p>
                </div>
                <button id="create-new-content" class="btn btn-primary">
                    <i class="fas fa-plus mr-2"></i>Create New Content
                </button>
            </div>

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-blue-100 text-blue-600">
                            <i class="fas fa-file-alt text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-slate-600">Total Content</p>
                            <p class="text-2xl font-bold text-slate-900">${userPublications.length}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-green-100 text-green-600">
                            <i class="fas fa-eye text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-slate-600">Published</p>
                            <p class="text-2xl font-bold text-slate-900">${userPublications.filter(p => p.status === 'public').length}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
                            <i class="fas fa-edit text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-slate-600">Drafts</p>
                            <p class="text-2xl font-bold text-slate-900">${userPublications.filter(p => p.status === 'private' || p.status === 'draft').length}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-purple-100 text-purple-600">
                            <i class="fas fa-users text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-slate-600">Groups</p>
                            <p class="text-2xl font-bold text-slate-900">${userGroups.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Content -->
            <div class="bg-white rounded-lg shadow-sm">
                <div class="px-6 py-4 border-b border-slate-200">
                    <h2 class="text-lg font-semibold text-slate-900">Recent Content</h2>
                </div>
                <div class="p-6">
                    <div id="recent-content" class="space-y-4">
                        ${renderRecentContent()}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Attach event listeners
    document.getElementById('create-new-content').addEventListener('click', () => {
        switchView('create');
    });
    
    // Attach content item listeners
    attachContentItemListeners();
}

/**
 * Render recent content items
 */
function renderRecentContent() {
    if (userPublications.length === 0) {
        return `
            <div class="text-center py-12">
                <i class="fas fa-file-alt fa-3x text-slate-300 mb-4"></i>
                <h3 class="text-xl font-bold text-slate-700 mb-2">No content yet</h3>
                <p class="text-slate-500 mb-4">Start creating your first piece of content</p>
                <button class="btn btn-primary" onclick="document.getElementById('create-new-content').click()">
                    <i class="fas fa-plus mr-2"></i>Create Now
                </button>
            </div>
        `;
    }
    
    return userPublications.slice(0, 10).map(content => `
        <div class="publication-card flex items-center justify-between">
            <div class="flex-grow">
                <h4 class="font-semibold text-slate-800">${content.title || 'Untitled'}</h4>
                <div class="flex items-center space-x-3 text-sm text-slate-500 mt-1">
                    <span class="capitalize">${(content.contentType || 'article').replace('_', ' ')}</span>
                    <span>&bull;</span>
                    <span class="status-badge status-${content.status || 'draft'}">${getStatusLabel(content.status)}</span>
                    <span>&bull;</span>
                    <span>${content.updatedAt ? formatDate(content.updatedAt) : 'Just now'}</span>
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <button class="btn btn-secondary btn-sm" data-action="edit" data-id="${content.id}">
                    <i class="fas fa-edit mr-1"></i>Edit
                </button>
                <button class="btn btn-secondary btn-sm" data-action="settings" data-id="${content.id}">
                    <i class="fas fa-cog mr-1"></i>Settings
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Render the create view
 */
function renderCreateView() {
    // Show content type selection modal
    showContentTypeModal();
}

/**
 * Show content type selection modal
 */
function showContentTypeModal() {
    const modal = document.getElementById('content-type-modal');
    const grid = document.getElementById('content-types-grid');
    
    const contentTypes = [
        {
            id: CONTENT_TYPES.QUICK_POST,
            name: 'Quick Post',
            description: 'Short social media posts, tweets, updates',
            icon: 'fas fa-comment',
            color: 'blue'
        },
        {
            id: CONTENT_TYPES.ARTICLE,
            name: 'Article',
            description: 'Blog posts, articles, opinion pieces',
            icon: 'fas fa-newspaper',
            color: 'green'
        },
        {
            id: CONTENT_TYPES.ESSAY,
            name: 'Essay',
            description: 'Long-form essays and thought pieces',
            icon: 'fas fa-scroll',
            color: 'purple'
        },
        {
            id: CONTENT_TYPES.RESEARCH,
            name: 'Research Paper',
            description: 'Academic papers, formal research',
            icon: 'fas fa-microscope',
            color: 'indigo'
        },
        {
            id: CONTENT_TYPES.LETTER,
            name: 'Open Letter',
            description: 'Advocacy letters, public statements',
            icon: 'fas fa-envelope-open-text',
            color: 'red'
        },
        {
            id: CONTENT_TYPES.NEWSLETTER,
            name: 'Newsletter',
            description: 'Email newsletters, bulletins',
            icon: 'fas fa-mail-bulk',
            color: 'yellow'
        },
        {
            id: CONTENT_TYPES.MAGAZINE,
            name: 'Magazine Article',
            description: 'Magazine-style articles and features',
            icon: 'fas fa-book-open',
            color: 'pink'
        },
        {
            id: CONTENT_TYPES.MEMO,
            name: 'Memorandum',
            description: 'Business memos, official communications',
            icon: 'fas fa-file-contract',
            color: 'gray'
        },
        {
            id: CONTENT_TYPES.REPORT,
            name: 'Report',
            description: 'Business reports, analysis documents',
            icon: 'fas fa-chart-bar',
            color: 'teal'
        },
        {
            id: CONTENT_TYPES.BOOK,
            name: 'Book',
            description: 'Books, long-form manuscripts',
            icon: 'fas fa-book',
            color: 'orange'
        },
        {
            id: CONTENT_TYPES.CREATIVE,
            name: 'Creative Writing',
            description: 'Stories, poems, creative content',
            icon: 'fas fa-feather-alt',
            color: 'emerald'
        }
    ];
    
    grid.innerHTML = contentTypes.map(type => `
        <div class="content-type-card" data-type="${type.id}">
            <div class="flex items-start space-x-3">
                <div class="p-3 rounded-lg bg-${type.color}-100 text-${type.color}-600">
                    <i class="${type.icon} text-xl"></i>
                </div>
                <div class="flex-grow">
                    <h3 class="font-semibold text-slate-800">${type.name}</h3>
                    <p class="text-sm text-slate-600 mt-1">${type.description}</p>
                </div>
            </div>
        </div>
    `).join('');
    
    // Attach selection listeners
    grid.querySelectorAll('.content-type-card').forEach(card => {
        card.addEventListener('click', () => {
            // Remove previous selection
            grid.querySelectorAll('.content-type-card').forEach(c => c.classList.remove('selected'));
            
            // Select current card
            card.classList.add('selected');
            selectedContentType = card.dataset.type;
            
            // Enable continue button
            document.getElementById('select-content-type').disabled = false;
        });
    });
    
    modal.classList.remove('hidden');
}

/**
 * Handle content type selection
 */
function handleContentTypeSelection() {
    if (!selectedContentType) return;
    
    // Hide content type modal
    document.getElementById('content-type-modal').classList.add('hidden');
    
    // Show template selection modal
    showTemplateModal();
}

/**
 * Show template selection modal
 */
function showTemplateModal() {
    const modal = document.getElementById('template-modal');
    const grid = document.getElementById('templates-grid');
    
    // Get templates for selected content type
    const templates = getTemplatesForContentType(selectedContentType);
    
    grid.innerHTML = templates.map(template => `
        <div class="template-card" data-template="${template.id}">
            <div class="mb-3">
                <h3 class="font-semibold text-slate-800">${template.name}</h3>
                <p class="text-sm text-slate-600 mt-1">${template.description}</p>
            </div>
            <div class="bg-slate-50 rounded p-3 text-xs text-slate-500">
                <div class="font-mono">${template.preview}</div>
            </div>
        </div>
    `).join('');
    
    // Attach selection listeners
    grid.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', () => {
            // Remove previous selection
            grid.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
            
            // Select current card
            card.classList.add('selected');
            selectedTemplate = card.dataset.template;
            
            // Enable continue button
            document.getElementById('select-template').disabled = false;
        });
    });
    
    modal.classList.remove('hidden');
}

/**
 * Handle template selection
 */
function handleTemplateSelection() {
    if (!selectedTemplate || !selectedContentType) return;
    
    // Hide template modal
    document.getElementById('template-modal').classList.add('hidden');
    
    // Create new content and switch to editor
    createNewContent();
}

/**
 * Create new content
 */
async function createNewContent() {
    try {
        const newContent = {
            title: '',
            content: '',
            contentType: selectedContentType,
            template: selectedTemplate,
            status: 'draft',
            visibility: 'private',
            metadata: {
                tags: [],
                wordCount: 0,
                readingTime: 0
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(
            collection(db, 'users', currentUser.uid, 'pubhelpContent'),
            newContent
        );
        
        currentContent = { id: docRef.id, ...newContent };
        
        // Switch to editor
        switchView('editor', currentContent);
        
        showNotification('New content created!', 'success');
        
    } catch (error) {
        console.error('PubHelp: Error creating content:', error);
        showNotification('Failed to create content. Please try again.', 'error');
    }
}

/**
 * Render the editor view
 */
function renderEditor(content = null) {
    const contentArea = document.getElementById('pubhelp-content');
    
    if (content) {
        currentContent = content;
    }
    
    if (!currentContent) {
        switchView('dashboard');
        return;
    }
    
    contentArea.innerHTML = `
        <div class="h-full flex flex-col">
            <!-- Editor Header -->
            <div class="bg-white border-b border-slate-200 px-6 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <button id="back-to-dashboard" class="btn btn-secondary">
                            <i class="fas fa-arrow-left mr-2"></i>Back
                        </button>
                        <div>
                            <input type="text" id="content-title" placeholder="Enter your title..." 
                                   class="text-2xl font-bold border-0 focus:ring-0 p-0 w-96" 
                                   value="${currentContent.title || ''}">
                            <div class="flex items-center space-x-4 text-sm text-slate-500 mt-1">
                                <span class="capitalize">${(currentContent.contentType || 'article').replace('_', ' ')}</span>
                                <span>&bull;</span>
                                <span id="word-count">0 words</span>
                                <span>&bull;</span>
                                <span id="reading-time">0 min read</span>
                                <span>&bull;</span>
                                <span id="save-status" class="text-green-600">Saved</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-3">
                        <button id="save-draft-btn" class="btn btn-secondary">
                            <i class="fas fa-save mr-2"></i>Save Draft
                        </button>
                        <button id="publish-btn" class="btn btn-primary">
                            <i class="fas fa-share mr-2"></i>Publish
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Editor Content -->
            <div class="flex-1 overflow-hidden">
                <div class="h-full max-w-4xl mx-auto p-6">
                    <div id="quill-editor" class="h-full bg-white rounded-lg shadow-sm"></div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize Quill editor
    initializeQuillEditor();
    
    // Attach event listeners
    document.getElementById('back-to-dashboard').addEventListener('click', () => {
        switchView('dashboard');
    });
    
    document.getElementById('content-title').addEventListener('input', handleTitleChange);
    document.getElementById('save-draft-btn').addEventListener('click', () => saveContent(false));
    document.getElementById('publish-btn').addEventListener('click', showPublishingModal);
}

/**
 * Initialize Quill editor
 */
function initializeQuillEditor() {
    const toolbarOptions = [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']
    ];

    quillEditor = new Quill('#quill-editor', {
        theme: 'snow',
        modules: {
            toolbar: toolbarOptions,
            history: {
                delay: 1000,
                maxStack: 100,
                userOnly: true
            }
        }
    });

    // Load existing content
    if (currentContent && currentContent.content) {
        try {
            const contentData = JSON.parse(currentContent.content);
            quillEditor.setContents(contentData);
        } catch (error) {
            // If content is not JSON, treat as plain text
            quillEditor.setText(currentContent.content);
        }
    }

    // Set up auto-save
    quillEditor.on('text-change', (delta, oldDelta, source) => {
        if (source === 'user') {
            handleContentChange();
            updateWordCount();
            updateReadingTime();
            setupAutoSave();
        }
    });
    
    // Initial word count and reading time
    updateWordCount();
    updateReadingTime();
}

/**
 * Handle title changes
 */
function handleTitleChange(e) {
    if (currentContent) {
        currentContent.title = e.target.value;
        setupAutoSave();
    }
}

/**
 * Handle content changes
 */
function handleContentChange() {
    document.getElementById('save-status').textContent = 'Unsaved changes';
    document.getElementById('save-status').className = 'text-yellow-600';
}

/**
 * Set up auto-save
 */
function setupAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        saveContent(true); // Silent save
    }, 2000);
}

/**
 * Update word count
 */
function updateWordCount() {
    if (!quillEditor) return;
    
    const text = quillEditor.getText().trim();
    const wordCount = text ? text.split(/\s+/).length : 0;
    
    const wordCountEl = document.getElementById('word-count');
    if (wordCountEl) {
        wordCountEl.textContent = `${wordCount} words`;
    }
    
    if (currentContent) {
        currentContent.metadata = currentContent.metadata || {};
        currentContent.metadata.wordCount = wordCount;
    }
}

/**
 * Update reading time
 */
function updateReadingTime() {
    if (!quillEditor) return;
    
    const text = quillEditor.getText().trim();
    const wordCount = text ? text.split(/\s+/).length : 0;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed
    
    const readingTimeEl = document.getElementById('reading-time');
    if (readingTimeEl) {
        readingTimeEl.textContent = `${readingTime} min read`;
    }
    
    if (currentContent) {
        currentContent.metadata = currentContent.metadata || {};
        currentContent.metadata.readingTime = readingTime;
    }
}

/**
 * Save content
 */
async function saveContent(silent = false) {
    if (!currentContent || !quillEditor) return;
    
    try {
        const title = document.getElementById('content-title')?.value || '';
        const content = JSON.stringify(quillEditor.getContents());
        
        const updateData = {
            title,
            content,
            metadata: currentContent.metadata || {},
            updatedAt: serverTimestamp()
        };
        
        await updateDoc(
            doc(db, 'users', currentUser.uid, 'pubhelpContent', currentContent.id),
            updateData
        );
        
        // Update local content
        currentContent.title = title;
        currentContent.content = content;
        currentContent.metadata = updateData.metadata;
        
        // Update UI
        const saveStatus = document.getElementById('save-status');
        if (saveStatus) {
            saveStatus.textContent = 'Saved';
            saveStatus.className = 'text-green-600';
        }
        
        if (!silent) {
            showNotification('Content saved successfully!', 'success');
        }
        
    } catch (error) {
        console.error('PubHelp: Error saving content:', error);
        if (!silent) {
            showNotification('Failed to save content. Please try again.', 'error');
        }
    }
}

/**
 * Show publishing modal
 */
function showPublishingModal() {
    if (!currentContent) return;
    
    const modal = document.getElementById('publishing-modal');
    
    // Populate form
    document.getElementById('publish-content-id').value = currentContent.id;
    document.getElementById('publish-title').value = currentContent.title || '';
    document.getElementById('publish-visibility').value = currentContent.visibility || 'private';
    
    // Populate groups
    const groupSelect = document.getElementById('publish-group');
    groupSelect.innerHTML = userGroups.map(group => 
        `<option value="${group.id}">${group.name}</option>`
    ).join('');
    
    // Handle visibility change
    handleVisibilityChange();
    
    modal.classList.remove('hidden');
}

/**
 * Handle visibility change
 */
function handleVisibilityChange() {
    const visibility = document.getElementById('publish-visibility').value;
    const groupSelection = document.getElementById('group-selection');
    const marketplaceOptions = document.getElementById('marketplace-options');
    
    groupSelection.classList.toggle('hidden', visibility !== 'group');
    marketplaceOptions.classList.toggle('hidden', visibility !== 'marketplace');
}

/**
 * Handle save as draft
 */
async function handleSaveDraft(e) {
    e.preventDefault();
    await saveContent(false);
    document.getElementById('publishing-modal').classList.add('hidden');
}

/**
 * Handle publish content
 */
async function handlePublishContent(e) {
    e.preventDefault();
    
    if (!currentContent) return;
    
    try {
        const title = document.getElementById('publish-title').value;
        const visibility = document.getElementById('publish-visibility').value;
        const tags = document.getElementById('publish-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const excerpt = document.getElementById('publish-excerpt').value;
        
        let updateData = {
            title,
            visibility,
            status: visibility === 'private' ? 'private' : 'public',
            metadata: {
                ...currentContent.metadata,
                tags,
                excerpt
            },
            updatedAt: serverTimestamp()
        };
        
        // Handle group publishing
        if (visibility === 'group') {
            updateData.groupId = document.getElementById('publish-group').value;
        }
        
        // Handle marketplace publishing
        if (visibility === 'marketplace') {
            const isFree = document.getElementById('publish-free').checked;
            const price = isFree ? 0 : parseFloat(document.getElementById('publish-price').value) || 0;
            
            updateData.pricing = {
                isFree,
                price,
                currency: 'ZAR'
            };
        }
        
        // Generate public URL if publishing publicly
        if (visibility === 'public' || visibility === 'marketplace') {
            updateData.publicUrl = `${window.location.origin}/public/${currentUser.uid}/${currentContent.id}`;
            updateData.publishedAt = serverTimestamp();
        }
        
        await updateDoc(
            doc(db, 'users', currentUser.uid, 'pubhelpContent', currentContent.id),
            updateData
        );
        
        // Update local content
        Object.assign(currentContent, updateData);
        
        // Close modal
        document.getElementById('publishing-modal').classList.add('hidden');
        
        showNotification('Content published successfully!', 'success');
        
    } catch (error) {
        console.error('PubHelp: Error publishing content:', error);
        showNotification('Failed to publish content. Please try again.', 'error');
    }
}

/**
 * Render groups view
 */
function renderGroups() {
    const contentArea = document.getElementById('pubhelp-content');
    
    contentArea.innerHTML = `
        <div class="max-w-7xl mx-auto p-6">
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">Groups</h1>
                    <p class="text-slate-600 mt-1">Collaborate and share content with your groups</p>
                </div>
                <button id="create-group-btn" class="btn btn-primary">
                    <i class="fas fa-plus mr-2"></i>Create Group
                </button>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Groups List -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <h2 class="text-xl font-bold text-slate-800 mb-4">My Groups</h2>
                    <div id="groups-list" class="space-y-3">
                        ${renderGroupsList()}
                    </div>
                </div>
                
                <!-- Group Chat/Content -->
                <div id="group-content" class="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
                    <div class="text-center py-12">
                        <i class="fas fa-users fa-3x text-slate-300 mb-4"></i>
                        <h3 class="text-xl font-bold text-slate-700 mb-2">Select a group</h3>
                        <p class="text-slate-500">Choose a group to view content and chat</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Attach event listeners
    document.getElementById('create-group-btn').addEventListener('click', showCreateGroupModal);
    attachGroupListeners();
}

/**
 * Render groups list
 */
function renderGroupsList() {
    if (userGroups.length === 0) {
        return `
            <div class="text-center py-8">
                <i class="fas fa-users fa-2x text-slate-300 mb-3"></i>
                <p class="text-slate-500 text-sm">No groups yet</p>
            </div>
        `;
    }
    
    return userGroups.map(group => `
        <div class="group-item p-3 rounded-lg hover:bg-slate-50 cursor-pointer border" data-group-id="${group.id}">
            <h4 class="font-semibold text-slate-800">${group.name}</h4>
            <p class="text-sm text-slate-500">${group.members?.length || 0} members</p>
        </div>
    `).join('');
}

/**
 * Render analytics view
 */
function renderAnalytics() {
    const contentArea = document.getElementById('pubhelp-content');
    
    contentArea.innerHTML = `
        <div class="max-w-7xl mx-auto p-6">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-slate-800">Analytics</h1>
                <p class="text-slate-600 mt-1">Track your content performance and engagement</p>
            </div>
            
            <!-- Analytics Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-blue-100 text-blue-600">
                            <i class="fas fa-eye text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-slate-600">Total Views</p>
                            <p class="text-2xl font-bold text-slate-900">0</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-green-100 text-green-600">
                            <i class="fas fa-heart text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-slate-600">Total Likes</p>
                            <p class="text-2xl font-bold text-slate-900">0</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
                            <i class="fas fa-share text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-slate-600">Total Shares</p>
                            <p class="text-2xl font-bold text-slate-900">0</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-purple-100 text-purple-600">
                            <i class="fas fa-dollar-sign text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-slate-600">Revenue</p>
                            <p class="text-2xl font-bold text-slate-900">R0</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Coming Soon -->
            <div class="bg-white rounded-lg shadow-sm p-12 text-center">
                <i class="fas fa-chart-line fa-3x text-slate-300 mb-4"></i>
                <h3 class="text-xl font-bold text-slate-700 mb-2">Advanced Analytics Coming Soon</h3>
                <p class="text-slate-500">Detailed insights, performance metrics, and revenue tracking will be available soon.</p>
            </div>
        </div>
    `;
}

/**
 * Render settings view
 */
function renderSettings() {
    const contentArea = document.getElementById('pubhelp-content');
    
    contentArea.innerHTML = `
        <div class="max-w-4xl mx-auto p-6">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-slate-800">Settings</h1>
                <p class="text-slate-600 mt-1">Manage your PubHelp preferences and account settings</p>
            </div>
            
            <!-- Settings Sections -->
            <div class="space-y-6">
                <!-- Profile Settings -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <h2 class="text-xl font-bold text-slate-800 mb-4">Profile Settings</h2>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Display Name</label>
                            <input type="text" class="input" value="${currentUser?.displayName || ''}" placeholder="Your display name">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                            <textarea class="input" rows="3" placeholder="Tell readers about yourself..."></textarea>
                        </div>
                    </div>
                </div>
                
                <!-- Publishing Preferences -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <h2 class="text-xl font-bold text-slate-800 mb-4">Publishing Preferences</h2>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="font-medium text-slate-800">Auto-save</h3>
                                <p class="text-sm text-slate-600">Automatically save your work while writing</p>
                            </div>
                            <label class="inline-flex relative items-center cursor-pointer">
                                <input type="checkbox" class="sr-only peer" checked>
                                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                        
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="font-medium text-slate-800">Email Notifications</h3>
                                <p class="text-sm text-slate-600">Receive notifications about your content</p>
                            </div>
                            <label class="inline-flex relative items-center cursor-pointer">
                                <input type="checkbox" class="sr-only peer" checked>
                                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
                
                <!-- Export/Import -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <h2 class="text-xl font-bold text-slate-800 mb-4">Data Management</h2>
                    <div class="space-y-4">
                        <div>
                            <h3 class="font-medium text-slate-800 mb-2">Export Your Data</h3>
                            <p class="text-sm text-slate-600 mb-3">Download all your content and data</p>
                            <button class="btn btn-secondary">
                                <i class="fas fa-download mr-2"></i>Export Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- UTILITY FUNCTIONS ---

/**
 * Get templates for content type
 */
function getTemplatesForContentType(contentType) {
    const templates = {
        [CONTENT_TYPES.QUICK_POST]: [
            {
                id: 'quick_simple',
                name: 'Simple Post',
                description: 'Clean, simple format for quick thoughts',
                preview: 'Your thought here...\n\n#hashtags'
            },
            {
                id: 'quick_announcement',
                name: 'Announcement',
                description: 'Format for announcements and updates',
                preview: '📢 ANNOUNCEMENT\n\nYour announcement...'
            }
        ],
        [CONTENT_TYPES.ARTICLE]: [
            {
                id: 'article_standard',
                name: 'Standard Article',
                description: 'Classic blog post format',
                preview: 'Title\n\nIntroduction...\n\nMain content...\n\nConclusion...'
            },
            {
                id: 'article_listicle',
                name: 'Listicle',
                description: 'List-based article format',
                preview: 'Title: X Things About...\n\n1. First point\n2. Second point\n3. Third point'
            }
        ],
        [CONTENT_TYPES.RESEARCH]: [
            {
                id: 'research_academic',
                name: 'Academic Paper',
                description: 'Formal academic research format',
                preview: 'Title\n\nAbstract\n\nIntroduction\n\nMethodology\n\nResults\n\nDiscussion\n\nConclusion\n\nReferences'
            }
        ]
    };
    
    return templates[contentType] || templates[CONTENT_TYPES.ARTICLE];
}

/**
 * Get status label
 */
function getStatusLabel(status) {
    const labels = {
        'draft': 'Draft',
        'private': 'Private',
        'group': 'Group',
        'public': 'Public',
        'marketplace': 'Marketplace'
    };
    return labels[status] || 'Draft';
}

/**
 * Format date
 */
function formatDate(timestamp) {
    if (!timestamp) return 'Unknown';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
}

/**
 * Attach content item listeners
 */
function attachContentItemListeners() {
    document.querySelectorAll('[data-action="edit"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const contentId = e.target.closest('[data-action="edit"]').dataset.id;
            const content = userPublications.find(p => p.id === contentId);
            if (content) {
                switchView('editor', content);
            }
        });
    });
    
    document.querySelectorAll('[data-action="settings"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const contentId = e.target.closest('[data-action="settings"]').dataset.id;
            showContentSettings(contentId);
        });
    });
}

/**
 * Attach group listeners
 */
function attachGroupListeners() {
    document.querySelectorAll('.group-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const groupId = e.currentTarget.dataset.groupId;
            loadGroupContent(groupId);
        });
    });
}

/**
 * Show content settings
 */
function showContentSettings(contentId) {
    const content = userPublications.find(p => p.id === contentId);
    if (!content) return;
    
    const modal = document.getElementById('settings-modal');
    const settingsContent = document.getElementById('settings-content');
    
    settingsContent.innerHTML = `
        <div class="space-y-6">
            <div>
                <h3 class="text-lg font-semibold text-slate-800 mb-2">${content.title || 'Untitled'}</h3>
                <p class="text-sm text-slate-600">Manage settings for this content</p>
            </div>
            
            <div class="space-y-4">
                <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                        <h4 class="font-medium text-slate-800">Visibility</h4>
                        <p class="text-sm text-slate-600">Current: ${getStatusLabel(content.status)}</p>
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="showPublishingModal()">
                        Change
                    </button>
                </div>
                
                <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                        <h4 class="font-medium text-slate-800">Delete Content</h4>
                        <p class="text-sm text-slate-600">Permanently remove this content</p>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="deleteContent('${content.id}')">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

/**
 * Delete content
 */
async function deleteContent(contentId) {
    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
        return;
    }
    
    try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'pubhelpContent', contentId));
        
        // Close modal
        document.getElementById('settings-modal').classList.add('hidden');
        
        showNotification('Content deleted successfully', 'success');
        
    } catch (error) {
        console.error('PubHelp: Error deleting content:', error);
        showNotification('Failed to delete content. Please try again.', 'error');
    }
}

/**
 * Show create group modal
 */
function showCreateGroupModal() {
    // This would show a modal to create a new group
    const groupName = prompt('Enter group name:');
    if (groupName) {
        createGroup(groupName);
    }
}

/**
 * Create group
 */
async function createGroup(groupName) {
    try {
        const groupData = {
            name: groupName,
            creatorId: currentUser.uid,
            members: [currentUser.uid],
            createdAt: serverTimestamp()
        };
        
        await addDoc(collection(db, 'pubhelpGroups'), groupData);
        showNotification('Group created successfully!', 'success');
        
    } catch (error) {
        console.error('PubHelp: Error creating group:', error);
        showNotification('Failed to create group. Please try again.', 'error');
    }
}

/**
 * Load group content
 */
function loadGroupContent(groupId) {
    const group = userGroups.find(g => g.id === groupId);
    if (!group) return;
    
    const contentArea = document.getElementById('group-content');
    contentArea.innerHTML = `
        <div class="h-full flex flex-col">
            <div class="border-b border-slate-200 pb-4 mb-4">
                <h2 class="text-xl font-bold text-slate-800">${group.name}</h2>
                <p class="text-sm text-slate-600">${group.members?.length || 0} members</p>
            </div>
            
            <div class="flex-1 bg-slate-50 rounded-lg p-4 mb-4 overflow-y-auto">
                <div class="text-center py-8">
                    <i class="fas fa-comments fa-2x text-slate-300 mb-3"></i>
                    <p class="text-slate-500">Group chat and content sharing coming soon!</p>
                </div>
            </div>
            
            <div class="flex space-x-2">
                <input type="text" placeholder="Type a message..." class="input flex-1">
                <button class="btn btn-primary">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `;
}

/**
 * Show auth required message
 */
function showAuthRequired() {
    const contentArea = document.getElementById('pubhelp-content');
    if (contentArea) {
        contentArea.innerHTML = `
            <div class="flex items-center justify-center h-full">
                <div class="text-center">
                    <i class="fas fa-lock fa-3x text-slate-300 mb-4"></i>
                    <h2 class="text-2xl font-bold text-slate-700 mb-2">Authentication Required</h2>
                    <p class="text-slate-500 mb-4">Please log in to access PubHelp</p>
                    <a href="login.html" class="btn btn-primary">
                        <i class="fas fa-sign-in-alt mr-2"></i>Log In
                    </a>
                </div>
            </div>
        `;
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const container = document.body;
    const notification = document.createElement('div');
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
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

// --- CLEANUP ---
window.addEventListener('beforeunload', () => {
    unsubscribeListeners.forEach(unsub => unsub());
});