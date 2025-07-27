/* ================================================================================= */
/* FILE: assets/js/ui/lifecv-modals-core.js                                        */
/* PURPOSE: Core modal system for LifeCV - Basic Import, Export, Privacy           */
/* ================================================================================= */

import { showNotification } from '../utils/notifications.js';
import { sanitizeInput } from '../utils/validators.js';
import { readFileAsText, downloadAsFile, generateId } from '../utils/helpers.js';

let currentConflictCallback = null;
let currentExportOptions = {};

/**
 * Initialize the core modal system
 */
export function init() {
    createModalContainer();
    setupEventListeners();
    console.log('LifeCV Core Modals initialized');
}

/**
 * Create the modal container if it doesn't exist
 */
function createModalContainer() {
    let container = document.getElementById('modal-placeholder');
    if (!container) {
        container = document.createElement('div');
        container.id = 'modal-placeholder';
        document.body.appendChild(container);
    }
}

/**
 * Set up global event listeners for modals
 */
function setupEventListeners() {
    document.addEventListener('click', (e) => {
        // Close modal when clicking backdrop
        if (e.target.classList.contains('modal-backdrop')) {
            hideModal();
        }
        
        // Handle modal close buttons
        if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) {
            hideModal();
        }
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideModal();
        }
    });
}

/**
 * Show a core modal by ID
 */
export function showCoreModal(modalId, data = {}) {
    switch (modalId) {
        case 'json-import':
            showJSONImportModal();
            break;
        case 'export-options':
            showExportModal(data);
            break;
        case 'privacy-settings':
            showPrivacyModal(data);
            break;
        case 'conflict-resolution':
            showConflictResolutionModal(data.conflicts, data.callback);
            break;
        default:
            console.warn(`Unknown core modal ID: ${modalId}`);
            return false;
    }
    return true;
}

/**
 * Hide the currently visible modal
 */
export function hideModal() {
    const container = document.getElementById('modal-placeholder');
    if (container) {
        container.innerHTML = '';
    }
    
    // Reset any active callbacks
    currentConflictCallback = null;
    currentExportOptions = {};
}

/**
 * Show JSON Import Modal
 */
function showJSONImportModal() {
    const modalHTML = `
        <div class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                <!-- Header -->
                <div class="flex items-center justify-between p-6 border-b border-slate-200">
                    <div class="flex items-center space-x-3">
                        <div class="p-2 bg-indigo-100 rounded-lg">
                            <i class="fas fa-code text-indigo-600"></i>
                        </div>
                        <h2 class="text-xl font-bold text-slate-900">Import from JSON</h2>
                    </div>
                    <button class="modal-close text-slate-400 hover:text-slate-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <!-- Content -->
                <div class="p-6 overflow-y-auto max-h-[60vh]">
                    <div class="mb-4">
                        <p class="text-slate-600 mb-4">Paste your LifeCV data in JSON format below. The system will validate and import your information.</p>
                        
                        <label for="json-input" class="block text-sm font-medium text-slate-700 mb-2">JSON Data</label>
                        <textarea id="json-input" 
                                  class="w-full h-64 p-3 border border-slate-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                                  placeholder='{"personalInfo": {"fullName": {"value": "John Doe", "isPublic": true}}, ...}'></textarea>
                        
                        <div id="json-validation-message" class="mt-2 text-sm hidden"></div>
                    </div>
                    
                    <div class="bg-slate-50 rounded-lg p-4">
                        <h4 class="font-medium text-slate-800 mb-2">Import Options</h4>
                        <div class="space-y-2">
                            <label class="flex items-center">
                                <input type="checkbox" id="merge-data" class="rounded border-slate-300" checked>
                                <span class="ml-2 text-sm text-slate-700">Merge with existing data (recommended)</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="preserve-privacy" class="rounded border-slate-300" checked>
                                <span class="ml-2 text-sm text-slate-700">Preserve existing privacy settings</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
                    <button class="modal-close px-4 py-2 text-slate-600 hover:text-slate-800">Cancel</button>
                    <button id="import-json-btn" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        Import Data
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modal-placeholder').innerHTML = modalHTML;
    
    // Setup JSON validation
    const jsonInput = document.getElementById('json-input');
    const importBtn = document.getElementById('import-json-btn');
    const validationMessage = document.getElementById('json-validation-message');
    
    jsonInput.addEventListener('input', () => {
        try {
            const data = JSON.parse(jsonInput.value.trim());
            validationMessage.className = 'mt-2 text-sm text-green-600';
            validationMessage.textContent = 'Valid JSON format';
            validationMessage.classList.remove('hidden');
            importBtn.disabled = false;
        } catch (error) {
            if (jsonInput.value.trim()) {
                validationMessage.className = 'mt-2 text-sm text-red-600';
                validationMessage.textContent = `Invalid JSON: ${error.message}`;
                validationMessage.classList.remove('hidden');
                importBtn.disabled = true;
            } else {
                validationMessage.classList.add('hidden');
                importBtn.disabled = true;
            }
        }
    });
    
    // Handle import
    importBtn.addEventListener('click', async () => {
        try {
            const jsonData = JSON.parse(jsonInput.value.trim());
            const options = {
                merge: document.getElementById('merge-data').checked,
                preservePrivacy: document.getElementById('preserve-privacy').checked
            };
            
            if (window.lifeCvModule && window.lifeCvModule.importLifeCV) {
                await window.lifeCvModule.importLifeCV(jsonData, options);
                hideModal();
                showNotification('JSON data imported successfully!', 'success');
            }
        } catch (error) {
            console.error('Import error:', error);
            showNotification('Failed to import JSON data', 'error');
        }
    });
}

/**
 * Show Export Modal
 */
function showExportModal(options = {}) {
    currentExportOptions = options;
    
    const modalHTML = `
        <div class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                <!-- Header -->
                <div class="flex items-center justify-between p-6 border-b border-slate-200">
                    <div class="flex items-center space-x-3">
                        <div class="p-2 bg-green-100 rounded-lg">
                            <i class="fas fa-download text-green-600"></i>
                        </div>
                        <h2 class="text-xl font-bold text-slate-900">Export LifeCV</h2>
                    </div>
                    <button class="modal-close text-slate-400 hover:text-slate-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <!-- Content -->
                <div class="p-6 overflow-y-auto max-h-[60vh]">
                    <div class="space-y-6">
                        <!-- Export Format -->
                        <div>
                            <h3 class="font-medium text-slate-900 mb-3">Export Format</h3>
                            <div class="grid grid-cols-2 gap-3">
                                <label class="flex items-center p-3 border border-slate-200 rounded-lg hover:border-green-300 cursor-pointer">
                                    <input type="radio" name="export-format" value="json" class="mr-3" checked>
                                    <div>
                                        <div class="font-medium text-slate-900">JSON</div>
                                        <div class="text-sm text-slate-600">Complete data structure</div>
                                    </div>
                                </label>
                                <label class="flex items-center p-3 border border-slate-200 rounded-lg hover:border-green-300 cursor-pointer">
                                    <input type="radio" name="export-format" value="csv" class="mr-3">
                                    <div>
                                        <div class="font-medium text-slate-900">CSV</div>
                                        <div class="text-sm text-slate-600">Spreadsheet format</div>
                                    </div>
                                </label>
                                <label class="flex items-center p-3 border border-slate-200 rounded-lg hover:border-green-300 cursor-pointer">
                                    <input type="radio" name="export-format" value="html" class="mr-3">
                                    <div>
                                        <div class="font-medium text-slate-900">HTML</div>
                                        <div class="text-sm text-slate-600">Web resume</div>
                                    </div>
                                </label>
                                <label class="flex items-center p-3 border border-slate-200 rounded-lg hover:border-green-300 cursor-pointer">
                                    <input type="radio" name="export-format" value="pdf" class="mr-3">
                                    <div>
                                        <div class="font-medium text-slate-900">PDF</div>
                                        <div class="text-sm text-slate-600">Print-ready document</div>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <!-- Privacy Level -->
                        <div>
                            <h3 class="font-medium text-slate-900 mb-3">Privacy Level</h3>
                            <div class="space-y-2">
                                <label class="flex items-center">
                                    <input type="radio" name="privacy-level" value="all" class="mr-3" checked>
                                    <span class="text-slate-700">All data (including private information)</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="radio" name="privacy-level" value="public" class="mr-3">
                                    <span class="text-slate-700">Public information only</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="radio" name="privacy-level" value="custom" class="mr-3">
                                    <span class="text-slate-700">Custom selection</span>
                                </label>
                            </div>
                        </div>
                        
                        <!-- Section Selection -->
                        <div id="section-selection" class="hidden">
                            <h3 class="font-medium text-slate-900 mb-3">Select Sections</h3>
                            <div class="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                <label class="flex items-center">
                                    <input type="checkbox" class="section-checkbox mr-2" value="personalInfo" checked>
                                    <span class="text-sm text-slate-700">Personal Information</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" class="section-checkbox mr-2" value="experience" checked>
                                    <span class="text-sm text-slate-700">Experience</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" class="section-checkbox mr-2" value="education" checked>
                                    <span class="text-sm text-slate-700">Education</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" class="section-checkbox mr-2" value="skills" checked>
                                    <span class="text-sm text-slate-700">Skills</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" class="section-checkbox mr-2" value="certifications" checked>
                                    <span class="text-sm text-slate-700">Certifications</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" class="section-checkbox mr-2" value="projects" checked>
                                    <span class="text-sm text-slate-700">Projects</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
                    <button class="modal-close px-4 py-2 text-slate-600 hover:text-slate-800">Cancel</button>
                    <button id="export-data-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        Export Data
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modal-placeholder').innerHTML = modalHTML;
    
    // Setup export functionality
    setupExportModal();
}

/**
 * Setup export modal functionality
 */
function setupExportModal() {
    const privacyLevelInputs = document.querySelectorAll('input[name="privacy-level"]');
    const sectionSelection = document.getElementById('section-selection');
    const exportBtn = document.getElementById('export-data-btn');
    
    // Handle privacy level changes
    privacyLevelInputs.forEach(input => {
        input.addEventListener('change', () => {
            if (input.value === 'custom') {
                sectionSelection.classList.remove('hidden');
            } else {
                sectionSelection.classList.add('hidden');
            }
        });
    });
    
    // Handle export
    exportBtn.addEventListener('click', async () => {
        const format = document.querySelector('input[name="export-format"]:checked').value;
        const privacyLevel = document.querySelector('input[name="privacy-level"]:checked').value;
        
        let sections = null;
        if (privacyLevel === 'custom') {
            sections = Array.from(document.querySelectorAll('.section-checkbox:checked')).map(cb => cb.value);
        }
        
        const exportOptions = {
            format,
            includePrivate: privacyLevel === 'all',
            sections
        };
        
        try {
            if (window.lifeCvModule && window.lifeCvModule.exportLifeCV) {
                await window.lifeCvModule.exportLifeCV(exportOptions);
                hideModal();
                showNotification(`LifeCV exported as ${format.toUpperCase()}!`, 'success');
            }
        } catch (error) {
            console.error('Export error:', error);
            showNotification('Failed to export LifeCV', 'error');
        }
    });
}

/**
 * Show Privacy Settings Modal
 */
function showPrivacyModal(data = {}) {
    const modalHTML = `
        <div class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <!-- Header -->
                <div class="flex items-center justify-between p-6 border-b border-slate-200">
                    <div class="flex items-center space-x-3">
                        <div class="p-2 bg-amber-100 rounded-lg">
                            <i class="fas fa-shield-alt text-amber-600"></i>
                        </div>
                        <h2 class="text-xl font-bold text-slate-900">Privacy Settings</h2>
                    </div>
                    <button class="modal-close text-slate-400 hover:text-slate-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <!-- Content -->
                <div class="p-6 overflow-y-auto max-h-[70vh]">
                    <div class="mb-6">
                        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                            <h3 class="font-medium text-amber-900 mb-2">Privacy Control</h3>
                            <p class="text-amber-800 text-sm">Control the visibility of your information. Private information is only visible to you, while public information can be shared when exporting or generating resumes.</p>
                        </div>
                        
                        <div class="space-y-6" id="privacy-sections">
                            <!-- Privacy sections will be generated here -->
                            <div class="text-center py-8">
                                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
                                <p class="text-slate-600">Loading privacy settings...</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
                    <div class="flex items-center space-x-4">
                        <button id="make-all-public" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                            Make All Public
                        </button>
                        <button id="make-all-private" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                            Make All Private
                        </button>
                    </div>
                    <button class="modal-close px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modal-placeholder').innerHTML = modalHTML;
    
    // Load privacy settings
    loadPrivacySettings();
}

/**
 * Load and display privacy settings
 */
function loadPrivacySettings() {
    const privacySections = document.getElementById('privacy-sections');
    
    // This would integrate with your data service to get current privacy settings
    setTimeout(() => {
        privacySections.innerHTML = `
            <div class="border border-slate-200 rounded-lg p-4">
                <h4 class="font-medium text-slate-900 mb-3">Personal Information</h4>
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="text-slate-700">Full Name</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" class="privacy-toggle sr-only" data-field="personalInfo.fullName" checked>
                            <div class="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-slate-700">Email Address</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" class="privacy-toggle sr-only" data-field="personalInfo.email">
                            <div class="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-slate-700">Phone Number</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" class="privacy-toggle sr-only" data-field="personalInfo.phone">
                            <div class="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                    </div>
                </div>
            </div>
        `;
        
        setupPrivacyToggleHandlers();
    }, 500);
}

/**
 * Setup privacy toggle handlers
 */
function setupPrivacyToggleHandlers() {
    const toggles = document.querySelectorAll('.privacy-toggle');
    const makeAllPublicBtn = document.getElementById('make-all-public');
    const makeAllPrivateBtn = document.getElementById('make-all-private');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('change', () => {
            const field = toggle.dataset.field;
            const isPublic = toggle.checked;
            
            // This would integrate with your data service to update privacy settings
            if (window.lifeCvDataService && window.lifeCvDataService.updatePrivacy) {
                window.lifeCvDataService.updatePrivacy(field, isPublic);
            }
        });
    });
    
    makeAllPublicBtn.addEventListener('click', () => {
        toggles.forEach(toggle => {
            toggle.checked = true;
            toggle.dispatchEvent(new Event('change'));
        });
        showNotification('All fields set to public', 'success');
    });
    
    makeAllPrivateBtn.addEventListener('click', () => {
        toggles.forEach(toggle => {
            toggle.checked = false;
            toggle.dispatchEvent(new Event('change'));
        });
        showNotification('All fields set to private', 'success');
    });
}

/**
 * Show Conflict Resolution Modal
 */
export function showConflictResolution(conflicts, callback) {
    currentConflictCallback = callback;
    
    const modalHTML = `
        <div class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
                <!-- Header -->
                <div class="flex items-center justify-between p-6 border-b border-slate-200">
                    <div class="flex items-center space-x-3">
                        <div class="p-2 bg-orange-100 rounded-lg">
                            <i class="fas fa-exclamation-triangle text-orange-600"></i>
                        </div>
                        <h2 class="text-xl font-bold text-slate-900">Resolve Data Conflicts</h2>
                    </div>
                    <button class="modal-close text-slate-400 hover:text-slate-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <!-- Content -->
                <div class="p-6 overflow-y-auto max-h-[60vh]">
                    <div class="mb-4">
                        <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                            <h3 class="font-medium text-orange-900 mb-2">Data Conflicts Detected</h3>
                            <p class="text-orange-800 text-sm">Some imported data conflicts with your existing information. Please choose how to resolve each conflict.</p>
                        </div>
                        
                        <div class="space-y-4" id="conflicts-list">
                            ${conflicts.map((conflict, index) => `
                                <div class="border border-slate-200 rounded-lg p-4">
                                    <div class="mb-3">
                                        <h4 class="font-medium text-slate-900">${conflict.field}</h4>
                                        <p class="text-sm text-slate-600">${conflict.section}</p>
                                    </div>
                                    
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <!-- Existing Value -->
                                        <div class="border border-slate-200 rounded-lg p-3">
                                            <div class="flex items-center justify-between mb-2">
                                                <span class="text-sm font-medium text-slate-700">Current Value</span>
                                                <label class="flex items-center">
                                                    <input type="radio" name="conflict-${index}" value="existing" class="mr-2" checked>
                                                    <span class="text-sm text-slate-600">Keep</span>
                                                </label>
                                            </div>
                                            <div class="text-slate-900 bg-slate-50 rounded p-2 text-sm">
                                                ${conflict.existing || '<em class="text-slate-500">No existing value</em>'}
                                            </div>
                                        </div>
                                        
                                        <!-- New Value -->
                                        <div class="border border-green-200 rounded-lg p-3">
                                            <div class="flex items-center justify-between mb-2">
                                                <span class="text-sm font-medium text-green-700">Imported Value</span>
                                                <label class="flex items-center">
                                                    <input type="radio" name="conflict-${index}" value="imported" class="mr-2">
                                                    <span class="text-sm text-green-600">Use</span>
                                                </label>
                                            </div>
                                            <div class="text-slate-900 bg-green-50 rounded p-2 text-sm">
                                                ${conflict.imported}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="mt-3">
                                        <label class="flex items-center">
                                            <input type="radio" name="conflict-${index}" value="merge" class="mr-2">
                                            <span class="text-sm text-slate-600">Combine both values</span>
                                        </label>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
                    <div class="flex items-center space-x-4">
                        <button id="keep-all-existing" class="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm">
                            Keep All Existing
                        </button>
                        <button id="use-all-imported" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                            Use All Imported
                        </button>
                    </div>
                    <button id="resolve-conflicts-btn" class="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                        Apply Resolutions
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modal-placeholder').innerHTML = modalHTML;
    
    // Setup conflict resolution handlers
    setupConflictResolution(conflicts);
}

/**
 * Show Conflict Resolution Modal (internal version)
 */
function showConflictResolutionModal(conflicts, callback) {
    showConflictResolution(conflicts, callback);
}

/**
 * Setup conflict resolution handlers
 */
function setupConflictResolution(conflicts) {
    const keepAllBtn = document.getElementById('keep-all-existing');
    const useAllBtn = document.getElementById('use-all-imported');
    const resolveBtn = document.getElementById('resolve-conflicts-btn');
    
    keepAllBtn.addEventListener('click', () => {
        conflicts.forEach((conflict, index) => {
            const existingRadio = document.querySelector(`input[name="conflict-${index}"][value="existing"]`);
            if (existingRadio) existingRadio.checked = true;
        });
    });
    
    useAllBtn.addEventListener('click', () => {
        conflicts.forEach((conflict, index) => {
            const importedRadio = document.querySelector(`input[name="conflict-${index}"][value="imported"]`);
            if (importedRadio) importedRadio.checked = true;
        });
    });
    
    resolveBtn.addEventListener('click', () => {
        const resolutions = conflicts.map((conflict, index) => {
            const selectedOption = document.querySelector(`input[name="conflict-${index}"]:checked`);
            return {
                field: conflict.field,
                section: conflict.section,
                resolution: selectedOption ? selectedOption.value : 'existing',
                existing: conflict.existing,
                imported: conflict.imported
            };
        });
        
        if (currentConflictCallback) {
            currentConflictCallback(resolutions);
        }
        
        hideModal();
        showNotification('Conflicts resolved successfully!', 'success');
    });
}