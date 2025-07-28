/* ================================================================================= */
/* FILE: assets/js/components/lifecv-modals.js (COMPREHENSIVE MODALS)               */
/* PURPOSE: All modal dialogs for LifeCV import, export, and conflict resolution    */
/* ================================================================================= */

let modalsInitialized = false;
let currentModal = null;
let conflictResolutionCallback = null;

/**
 * Initialize all LifeCV modals
 */
export function init() {
    if (modalsInitialized) return;
    
    createModalPlaceholder();
    createModalStructures();
    attachModalEventListeners();
    
    modalsInitialized = true;
    console.log('LifeCV Modals initialized');
}

/**
 * Create modal placeholder if it doesn't exist
 */
function createModalPlaceholder() {
    let placeholder = document.getElementById('modal-placeholder');
    if (!placeholder) {
        placeholder = document.createElement('div');
        placeholder.id = 'modal-placeholder';
        document.body.appendChild(placeholder);
    }
}

/**
 * Create all modal HTML structures
 */
function createModalStructures() {
    const placeholder = document.getElementById('modal-placeholder');
    if (!placeholder) return;
    
    placeholder.innerHTML = `
        ${createJsonImportModal()}
        ${createFileProcessingModal()}
        ${createInternetSearchModal()}
        ${createConflictResolutionModal()}
        ${createPrivacySettingsModal()}
        ${createItemEditModal()}
        ${createExportOptionsModal()}
    `;
}

/**
 * JSON Import Modal with comprehensive AI instructions
 */
function createJsonImportModal() {
    return `
    <!-- JSON Import Modal -->
    <div id="json-import-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-start p-6 border-b border-slate-200">
                <div>
                    <h2 class="text-xl font-bold">Import LifeCV from JSON</h2>
                    <p class="text-sm text-slate-500 mt-1">Paste your JSON data below or use our conversion prompt with AI.</p>
                </div>
                <button onclick="window.lifeCvModals.hideModal('json-import-modal')" class="text-slate-400 hover:text-slate-600">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>

            <!-- Tabs -->
            <div class="flex border-b border-slate-200">
                <button id="json-tab" onclick="window.lifeCvModals.switchTab('json')" class="px-4 py-2 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600">
                    Import JSON
                </button>
                <button id="instructions-tab" onclick="window.lifeCvModals.switchTab('instructions')" class="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700">
                    AI Conversion Instructions
                </button>
            </div>

            <!-- JSON Import Tab -->
            <div id="json-import-content" class="p-6">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-slate-700 mb-2">Import Strategy</label>
                    <select id="import-strategy" class="w-full px-3 py-2 border border-slate-300 rounded-md">
                        <option value="merge">Smart Merge (Recommended)</option>
                        <option value="replace">Complete Replace</option>
                        <option value="custom">Custom Merge</option>
                    </select>
                    <p class="text-xs text-slate-500 mt-1">Smart merge will detect conflicts and let you resolve them.</p>
                </div>
                
                <textarea id="json-input-area" class="w-full h-64 p-3 border border-slate-300 rounded-md font-mono text-sm" 
                          placeholder='{ "personalInfo": { "fullName": { "value": "John Doe", "isPublic": true } }, "experience": [ ... ] }'></textarea>
                
                <div class="mt-4 flex justify-end space-x-3">
                    <button onclick="window.lifeCvModals.hideModal('json-import-modal')" type="button" 
                            class="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
                    <button id="json-modal-import" type="button" 
                            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Import Data</button>
                </div>
            </div>

            <!-- Instructions Tab -->
            <div id="instructions-content" class="hidden p-6">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div class="flex items-start">
                        <i class="fas fa-info-circle text-blue-500 mt-1 mr-3"></i>
                        <div>
                            <h3 class="font-semibold text-blue-800">How to Convert Your Resume</h3>
                            <p class="text-sm text-blue-700 mt-1">Copy the prompt below and paste it into any AI assistant (ChatGPT, Claude, Gemini, etc.) along with your resume text.</p>
                        </div>
                    </div>
                </div>

                <div class="space-y-4">
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <h3 class="font-semibold text-slate-800">AI Conversion Prompt</h3>
                            <button onclick="window.lifeCvModals.copyToClipboard('conversion-prompt')" 
                                    class="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200">
                                <i class="fas fa-copy mr-1"></i> Copy Prompt
                            </button>
                        </div>
                        <textarea id="conversion-prompt" readonly class="w-full h-96 p-3 border border-slate-300 rounded-md font-mono text-xs bg-slate-50 resize-none">${getAiConversionPrompt()}</textarea>
                    </div>
                </div>

                <div class="mt-6 flex justify-end">
                    <button onclick="window.lifeCvModals.hideModal('json-import-modal')" type="button" 
                            class="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Close</button>
                </div>
            </div>
        </div>
    </div>
    `;
}

/**
 * File Processing Modal for document uploads
 */
function createFileProcessingModal() {
    return `
    <!-- File Processing Modal -->
    <div id="file-processing-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="p-6">
                <div class="text-center">
                    <div class="inline-block p-4 bg-indigo-100 rounded-full mb-4">
                        <i class="fas fa-file-import text-indigo-600 text-2xl"></i>
                    </div>
                    <h2 class="text-xl font-bold text-slate-800 mb-2">Processing Document</h2>
                    <p class="text-slate-600 mb-6">AI is analyzing your document and extracting information...</p>
                    
                    <!-- Progress Bar -->
                    <div class="w-full bg-slate-200 rounded-full h-2 mb-4">
                        <div id="processing-progress" class="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500" style="width: 0%"></div>
                    </div>
                    
                    <!-- Status Text -->
                    <p id="processing-status" class="text-sm text-slate-500">Initializing...</p>
                </div>
            </div>
        </div>
    </div>
    `;
}

/**
 * Internet Search Modal with enhanced features
 */
function createInternetSearchModal() {
    return `
    <!-- Internet Search Modal -->
    <div id="internet-search-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <!-- Modal Header -->
            <div class="p-6 border-b border-slate-200">
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-800 mb-1">Internet Search & Security Audit</h2>
                        <p class="text-slate-600">Discover your professional presence and monitor your digital footprint</p>
                    </div>
                    <button onclick="window.lifeCvModals.hideModal('internet-search-modal')" class="text-slate-400 hover:text-slate-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
            </div>

            <!-- Search Form -->
            <div class="p-6 border-b border-slate-200 bg-slate-50">
                <form id="search-form" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                            <input type="text" id="search-name" name="name" required 
                                   class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
                                   placeholder="John Doe">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <input type="email" id="search-email" name="email" 
                                   class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
                                   placeholder="john@example.com">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                            <input type="tel" id="search-phone" name="phone" 
                                   class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
                                   placeholder="+1234567890">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Location</label>
                            <input type="text" id="search-location" name="location" 
                                   class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
                                   placeholder="New York, NY">
                        </div>
                    </div>
                    
                    <!-- Advanced Options -->
                    <div class="border-t border-slate-200 pt-4">
                        <h3 class="text-sm font-medium text-slate-700 mb-2">Search Options</h3>
                        <div class="flex flex-wrap gap-4">
                            <label class="flex items-center">
                                <input type="checkbox" id="deep-search" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                                <span class="ml-2 text-sm text-slate-600">Deep Search (more queries)</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="security-audit" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                                <span class="ml-2 text-sm text-slate-600">Security Audit (flag potential issues)</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="flex justify-end">
                        <button type="submit" class="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-medium">
                            <i class="fas fa-search mr-2"></i>Search Internet
                        </button>
                    </div>
                </form>
            </div>

            <!-- Search Results -->
            <div class="flex-1 overflow-y-auto p-6" style="max-height: 60vh;">
                <!-- Information Container for Data Removal Guidance -->
                <div id="search-info-container"></div>
                
                <div id="search-results-placeholder" class="text-center py-16">
                    <div class="inline-block p-4 bg-purple-100 rounded-full mb-4">
                        <i class="fas fa-globe text-purple-600 text-2xl"></i>
                    </div>
                    <p class="text-slate-500">Enter your details above and click "Search Internet" to discover your online presence</p>
                </div>

                <div id="search-loading" class="hidden text-center py-16">
                    <div class="inline-block p-4 bg-indigo-100 rounded-full mb-4">
                        <i class="fas fa-sync-alt text-indigo-600 text-2xl animate-spin"></i>
                    </div>
                    <p class="text-slate-600 font-medium">Searching across the internet...</p>
                    <p class="text-sm text-slate-500 mt-1">This may take a few moments</p>
                </div>

                <div id="search-results" class="hidden space-y-4">
                    <!-- Results will be populated here -->
                </div>
            </div>

            <!-- Modal Footer -->
            <div class="p-6 border-t border-slate-200 bg-slate-50">
                <div class="flex justify-between items-center">
                    <div class="text-sm text-slate-500">
                        <i class="fas fa-shield-alt mr-1"></i>
                        Your privacy is protected. Search data is processed securely.
                    </div>
                    <div class="flex space-x-3">
                        <button onclick="window.lifeCvModals.hideModal('internet-search-modal')" type="button" 
                                class="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
                        <button id="import-selected-btn" type="button" 
                                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed" 
                                disabled>
                            Import Selected (<span id="selected-count">0</span>)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}


/**
 * Conflict Resolution Modal
 */
function createConflictResolutionModal() {
    return `
    <!-- Conflict Resolution Modal -->
    <div id="conflict-resolution-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-start p-6 border-b border-slate-200">
                <div>
                    <h2 class="text-xl font-bold">Resolve Import Conflicts</h2>
                    <p class="text-sm text-slate-500 mt-1">Choose how to handle conflicting information</p>
                </div>
                <button onclick="window.lifeCvModals.hideModal('conflict-resolution-modal')" class="text-slate-400 hover:text-slate-600">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="p-6">
                <div id="conflicts-container" class="space-y-4">
                    <!-- Conflicts will be populated dynamically -->
                </div>
                
                <div class="mt-6 flex justify-end space-x-3">
                    <button onclick="window.lifeCvModals.hideModal('conflict-resolution-modal')" type="button" 
                            class="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
                    <button id="apply-resolutions" type="button" 
                            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Apply Resolutions</button>
                </div>
            </div>
        </div>
    </div>
    `;
}

/**
 * Privacy Settings Modal
 */
function createPrivacySettingsModal() {
    return `
    <!-- Privacy Settings Modal -->
    <div id="privacy-settings-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-start p-6 border-b border-slate-200">
                <div>
                    <h2 class="text-xl font-bold">Privacy Settings</h2>
                    <p class="text-sm text-slate-500 mt-1">Control which information is public or private</p>
                </div>
                <button onclick="window.lifeCvModals.hideModal('privacy-settings-modal')" class="text-slate-400 hover:text-slate-600">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="p-6">
                <div id="privacy-sections" class="space-y-4">
                    <!-- Privacy settings will be populated dynamically -->
                </div>
                
                <div class="mt-6 flex justify-end">
                    <button onclick="window.lifeCvModals.hideModal('privacy-settings-modal')" type="button" 
                            class="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Close</button>
                </div>
            </div>
        </div>
    </div>
    `;
}

/**
 * Item Edit Modal for array items
 */
function createItemEditModal() {
    return `
    <!-- Item Edit Modal -->
    <div id="item-edit-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-start p-6 border-b border-slate-200">
                <div>
                    <h2 id="item-modal-title" class="text-xl font-bold">Edit Item</h2>
                    <p id="item-modal-description" class="text-sm text-slate-500 mt-1">Edit this item</p>
                </div>
                <button onclick="window.lifeCvModals.hideModal('item-edit-modal')" class="text-slate-400 hover:text-slate-600">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="p-6">
                <form id="item-edit-form" class="space-y-4">
                    <!-- Form fields will be populated dynamically -->
                </form>
                
                <div class="mt-6 flex justify-between">
                    <button id="item-delete" type="button" 
                            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                        <i class="fas fa-trash mr-1"></i>Delete
                    </button>
                    <div class="flex space-x-3">
                        <button onclick="window.lifeCvModals.hideModal('item-edit-modal')" type="button" 
                                class="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
                        <button id="item-save" type="button" 
                                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

/**
 * Export Options Modal
 */
function createExportOptionsModal() {
    return `
    <!-- Export Options Modal -->
    <div id="export-options-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div class="flex justify-between items-start p-6 border-b border-slate-200">
                <div>
                    <h2 class="text-xl font-bold">Export LifeCV</h2>
                    <p class="text-sm text-slate-500 mt-1">Choose export format and privacy options</p>
                </div>
                <button onclick="window.lifeCvModals.hideModal('export-options-modal')" class="text-slate-400 hover:text-slate-600">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="p-6 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Export Format</label>
                    <select id="export-format" class="w-full px-3 py-2 border border-slate-300 rounded-md">
                        <option value="json">JSON (Complete Data)</option>
                        <option value="pdf">PDF Resume</option>
                        <option value="html">HTML Portfolio</option>
                        <option value="csv">CSV Spreadsheet</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Privacy Level</label>
                    <div class="space-y-2">
                        <label class="flex items-center">
                            <input type="radio" name="privacy-level" value="all" checked class="text-indigo-600">
                            <span class="ml-2 text-sm">Include all data (private & public)</span>
                        </label>
                        <label class="flex items-center">
                            <input type="radio" name="privacy-level" value="public" class="text-indigo-600">
                            <span class="ml-2 text-sm">Public data only</span>
                        </label>
                        <label class="flex items-center">
                            <input type="radio" name="privacy-level" value="custom" class="text-indigo-600">
                            <span class="ml-2 text-sm">Custom selection</span>
                        </label>
                    </div>
                </div>
                
                <div class="mt-6 flex justify-end space-x-3">
                    <button onclick="window.lifeCvModals.hideModal('export-options-modal')" type="button" 
                            class="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
                    <button id="export-data" type="button" 
                            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                        <i class="fas fa-download mr-1"></i>Export
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;
}

/**
 * Attach modal event listeners
 */
function attachModalEventListeners() {
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('fixed') && e.target.classList.contains('inset-0')) {
            hideModal();
        }
    });
    
    // Close modals with escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && currentModal) {
            hideModal();
        }
    });
}

/**
 * Show modal
 */
export function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        currentModal = modalId;
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Hide modal
 */
export function hideModal(modalId = null) {
    const targetModal = modalId || currentModal;
    if (targetModal) {
        const modal = document.getElementById(targetModal);
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    currentModal = null;
    document.body.style.overflow = 'auto';
}

/**
 * Switch tabs in JSON import modal
 */
export function switchTab(tab) {
    const jsonTab = document.getElementById('json-tab');
    const instructionsTab = document.getElementById('instructions-tab');
    const jsonContent = document.getElementById('json-import-content');
    const instructionsContent = document.getElementById('instructions-content');
    
    if (tab === 'json') {
        jsonTab.className = 'px-4 py-2 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600';
        instructionsTab.className = 'px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700';
        jsonContent.classList.remove('hidden');
        instructionsContent.classList.add('hidden');
    } else {
        instructionsTab.className = 'px-4 py-2 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600';
        jsonTab.className = 'px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700';
        instructionsContent.classList.remove('hidden');
        jsonContent.classList.add('hidden');
    }
}

/**
 * Copy text to clipboard
 */
export function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        showNotification('Failed to copy text', 'error');
    });
}

/**
 * Show conflict resolution modal
 */
export function showConflictResolution(conflicts, callback) {
    conflictResolutionCallback = callback;
    
    const container = document.getElementById('conflicts-container');
    if (!container) {
        console.error('Conflict container not found in the modal.');
        return;
    }
    
    container.innerHTML = conflicts.map((conflict, index) => `
        <div class="border border-slate-200 rounded-lg p-4 mb-4">
            <h3 class="font-medium text-slate-800 mb-2">
                Conflict in: <span class="font-bold">${conflict.section} &rarr; ${conflict.field}</span>
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-blue-50 border border-blue-200 rounded p-3">
                    <h4 class="text-sm font-medium text-blue-800 mb-1">Existing Value</h4>
                    <p class="text-sm text-blue-700 break-words">${conflict.existing || '<em>(empty)</em>'}</p>
                    <label class="flex items-center mt-2">
                        <input type="radio" name="conflict-${index}" value="existing" class="text-indigo-600" checked>
                        <span class="ml-2 text-sm">Keep existing</span>
                    </label>
                </div>
                <div class="bg-green-50 border border-green-200 rounded p-3">
                    <h4 class="text-sm font-medium text-green-800 mb-1">New Value</h4>
                    <p class="text-sm text-green-700 break-words">${conflict.imported || '<em>(empty)</em>'}</p>
                    <label class="flex items-center mt-2">
                        <input type="radio" name="conflict-${index}" value="imported" class="text-indigo-600">
                        <span class="ml-2 text-sm">Use new value</span>
                    </label>
                </div>
            </div>
        </div>
    `).join('');
    
    showModal('conflict-resolution-modal');
}

/**
 * Update processing status
 */
export function updateProcessingStatus(status, percentage) {
    const statusElement = document.getElementById('processing-status');
    const progressElement = document.getElementById('processing-progress');
    
    if (statusElement) statusElement.textContent = status;
    if (progressElement) progressElement.style.width = `${percentage}%`;
}

/**
 * Get AI conversion prompt
 */
function getAiConversionPrompt() {
    return `You are an expert CV/resume parser and data extraction specialist. Convert the following document text into a comprehensive JSON object that follows the LifeCV structure exactly.

CRITICAL INSTRUCTIONS:
1. Extract ALL relevant personal and professional information from the document
2. Return ONLY valid JSON - no explanations, comments, or markdown formatting
3. If information is missing, use empty strings "" or empty arrays []
4. Be thorough - extract everything that could be relevant to a person's life and career

REQUIRED LifeCV JSON STRUCTURE:

{
  "personalInfo": {
    "fullName": { "value": "string", "isPublic": true, "lastModified": "ISO-date" },
    "preferredName": { "value": "string", "isPublic": true, "lastModified": "ISO-date" },
    "pronouns": { "value": "string", "isPublic": true, "lastModified": "ISO-date" },
    "phone": { "value": "string", "isPublic": false, "lastModified": "ISO-date" },
    "email": { "value": "string", "isPublic": true, "lastModified": "ISO-date" },
    "address": { "value": "string", "isPublic": false, "lastModified": "ISO-date" },
    "dateOfBirth": { "value": "string", "isPublic": false, "lastModified": "ISO-date" },
    "nationality": { "value": "string", "isPublic": true, "lastModified": "ISO-date" }
  },
  "professionalSummary": {
    "summary": { "value": "string", "isPublic": true, "lastModified": "ISO-date" },
    "careerVision": { "value": "string", "isPublic": true, "lastModified": "ISO-date" },
    "workStyle": { "value": "string", "isPublic": true, "lastModified": "ISO-date" }
  },
  "experience": [
    {
      "jobTitle": { "value": "string", "isPublic": true, "lastModified": "ISO-date" },
      "company": { "value": "string", "isPublic": true, "lastModified": "ISO-date" },
      "industry": { "value": "string", "isPublic": true, "lastModified": "ISO-date" },
      "location": { "value": "string", "isPublic": true, "lastModified": "ISO-date" },
      "startDate": { "value": "YYYY-MM-DD", "isPublic": true, "lastModified": "ISO-date" },
      "endDate": { "value": "YYYY-MM-DD or Present", "isPublic": true, "lastModified": "ISO-date" },
      "description": { "value": "string", "isPublic": true, "lastModified": "ISO-date" },
      "skills": { "value": "string", "isPublic": true, "lastModified": "ISO-date" }
    }
  ],
  "education": [
    {
      "qualification": { "value": "string", "isPublic": true, "lastModified": "ISO-date" },
      "institution": { "value": "string", "isPublic": true, "lastModified": "ISO-date" },
      "field": { "value": "string", "isPublic": true, "lastModified": "ISO-date" },
      "yearCompleted": { "value": "YYYY", "isPublic": true, "lastModified": "ISO-date" },
      "grade": { "value": "string", "isPublic": true, "lastModified": "ISO-date" }
    }
  ],
  "skills": [
    {
      "skillName": { "value": "string", "isPublic": true, "lastModified": "ISO-date" },
      "category": { "value": "Technical|Soft Skills|Languages|Creative|Other", "isPublic": true, "lastModified": "ISO-date" },
      "proficiency": { "value": "Beginner|Intermediate|Advanced|Expert", "isPublic": true, "lastModified": "ISO-date" },
      "context": { "value": "string", "isPublic": true, "lastModified": "ISO-date" }
    }
  ],
  "certifications": [
    {
      "name": { "value": "string", "isPublic": true, "lastModified": "ISO-date" },
      "issuer": { "value": "string", "isPublic": true, "lastModified": "ISO-date" },
      "date": { "value": "YYYY-MM-DD", "isPublic": true, "lastModified": "ISO-date" },
      "expires": { "value": "YYYY-MM-DD", "isPublic": true, "lastModified": "ISO-date" }
    }
  ],
  "projects": [
    {
      "name": { "value": "string", "isPublic": true, "lastModified": "ISO-date" },
      "type": { "value": "Personal|Professional|Academic|Open Source", "isPublic": true, "lastModified": "ISO-date" },
      "description": { "value": "string", "isPublic": true, "lastModified": "ISO-date" },
      "technologies": { "value": "string", "isPublic": true, "lastModified": "ISO-date" },
      "url": { "value": "string", "isPublic": true, "lastModified": "ISO-date" }
    }
  ],
  "languages": [
    {
      "language": { "value": "string", "isPublic": true, "lastModified": "ISO-date" },
      "proficiency": { "value": "Basic|Conversational|Fluent|Native", "isPublic": true, "lastModified": "ISO-date" }
    }
  ],
  "digital": [
    {
      "platform": { "value": "LinkedIn|GitHub|Twitter|Portfolio|etc", "isPublic": true, "lastModified": "ISO-date" },
      "username": { "value": "string", "isPublic": true, "lastModified": "ISO-date" },
      "url": { "value": "string", "isPublic": true, "lastModified": "ISO-date" },
      "purpose": { "value": "Professional|Personal|Portfolio", "isPublic": true, "lastModified": "ISO-date" }
    }
  ]
}

EXTRACTION GUIDELINES:
- Use current ISO date for lastModified: "${new Date().toISOString()}"
- Set isPublic: false for sensitive data (phone, address, dateOfBirth, financial info)
- Set isPublic: true for professional/public information
- Extract dates in YYYY-MM-DD format when possible
- Be comprehensive - don't skip information because it seems minor
- Look for information in headers, footers, margins, contact sections

---

DOCUMENT TEXT TO ANALYZE:
[PASTE YOUR FULL DOCUMENT TEXT HERE]`;
}

// Make functions globally available for use in HTML onclick attributes
window.lifeCvModals = {
    showModal,
    hideModal,
    switchTab,
    copyToClipboard,
    updateProcessingStatus
};