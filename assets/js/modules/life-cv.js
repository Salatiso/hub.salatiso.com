/* ================================================================================= */
/* FILE: assets/js/modules/life-cv.js (v3.1 - Robust Controller)                     */
/* PURPOSE: Main controller for the LifeCV module. Initializes and coordinates       */
/* all services and UI components in a safe, sequential order.                       */
/* ================================================================================= */

// --- Static Imports for Reliability ---
// For now, comment out Firebase until it's properly configured
// import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
// import { auth, db, uploadFile } from '../firebase-config.js';

// Import all specialized LifeCV modules
import * as DataService from '../services/life-cv-data-service.js';
import * as renderer from '../ui/lifecv-renderer.js';
import * as Dashboard from '../ui/dashboard.js';
import { showNotification, Modals } from '../ui/lifecv-modals.js';

// --- State Variables ---
let currentUser = null;
let isInitialized = false;

// Mock auth for now
function waitForAuth() {
    return Promise.resolve({ uid: 'mock-user-123', email: 'demo@example.com' });
}

// Create Events object
const Events = {
    async init() {
        console.log('Events initialized');
    }
};

// --- Main Initialization Function (The Entry Point) ---
/**
 * Initializes the entire LifeCV application.
 * This is the single entry point called from life-cv.html.
 */
async function initLifeCV() {
    if (isInitialized) {
        console.warn("LifeCV module already initialized.");
        return;
    }
    console.log("LifeCV Initializer: Starting...");

    // Show loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.classList.remove('hidden');
    }

    try {
        // 1. Wait for Authentication (mocked for now)
        const user = await waitForAuth();
        currentUser = user;
        console.log(`LifeCV Initializer: User authenticated (UID: ${user.uid})`);

        // 2. Initialize all sub-modules in the correct order
        await DataService.init(user, handleDataUpdate);
        await Dashboard.init();
        await Modals.init();
        await Events.init();

        isInitialized = true;
        console.log("LifeCV Initializer: All modules initialized successfully.");

        // 4. Hide loading indicator ONLY after everything is ready
        setTimeout(() => {
            if (loadingIndicator) {
                loadingIndicator.classList.add('hidden');
            }
        }, 200);

    } catch (error) {
        console.error("LifeCV Initializer: A critical error occurred during initialization.", error);
        throw error; // Re-throw to be caught by the global handler
    }
}

/**
 * Add import/export functionality
 */
// Fix the import/export functions that use these variables:
// You need to access these through the DataService module instead

async function exportLifeCvData() {
    try {
        const lifeCvData = DataService.getLifeCvData();
        const currentUser = DataService.getCurrentUser();
        
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            userData: {
                uid: currentUser?.uid,
                email: currentUser?.email
            },
            lifeCvData: lifeCvData
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `lifecv-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        // Now this will work
        showNotification('LifeCV data exported successfully!', 'success');
        
    } catch (error) {
        console.error('Export failed:', error);
        showNotification('Export failed. Please try again.', 'error');
    }
}

async function importLifeCvData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/json') {
        showNotification('Please select a valid JSON file.', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const importData = JSON.parse(e.target.result);
            
            if (!importData.lifeCvData) {
                throw new Error('Invalid LifeCV backup file format.');
            }
            
            const confirmed = await confirmImport(importData);
            if (!confirmed) return;
            
            const mergeMode = await chooseMergeMode();
            
            let newData;
            if (mergeMode === 'replace') {
                newData = importData.lifeCvData;
            } else {
                const existingData = DataService.getLifeCvData();
                newData = mergeLifeCvData(existingData, importData.lifeCvData);
            }
            
            // Save through the data service
            await DataService.saveLifeCvData(newData);
            
            showNotification('Data imported successfully!', 'success');
            
        } catch (error) {
            console.error('Import failed:', error);
            showNotification('Import failed. Please try again.', 'error');
        }
    };
    
    reader.readAsText(file);
}

function confirmImport(importData) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div class="p-6 border-b border-slate-200">
                    <h2 class="text-xl font-bold text-slate-800">
                        <i class="fas fa-upload mr-2"></i>
                        Confirm Data Import
                    </h2>
                </div>
                <div class="p-6">
                    <div class="mb-4">
                        <h3 class="font-semibold text-slate-800 mb-2">Import Details:</h3>
                        <div class="bg-slate-50 p-3 rounded-lg text-sm">
                            <p><strong>Export Date:</strong> ${new Date(importData.exportDate).toLocaleString()}</p>
                            <p><strong>Sections:</strong> ${Object.keys(importData.lifeCvData).length}</p>
                            <p><strong>User:</strong> ${importData.userData?.email || 'Unknown'}</p>
                        </div>
                    </div>
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div class="flex items-start">
                            <i class="fas fa-exclamation-triangle text-yellow-600 mt-1 mr-2"></i>
                            <div class="text-sm text-yellow-800">
                                <p class="font-medium mb-1">Important:</p>
                                <p>This will modify your current LifeCV data. Make sure you have a recent backup before proceeding.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="p-6 border-t border-slate-200 flex justify-end space-x-3">
                    <button type="button" class="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300" 
                            onclick="resolveImport(false)">Cancel</button>
                    <button type="button" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" 
                            onclick="resolveImport(true)">Continue Import</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        window.resolveImport = (result) => {
            modal.remove();
            delete window.resolveImport;
            resolve(result);
        };
    });
}

function chooseMergeMode() {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div class="p-6 border-b border-slate-200">
                    <h2 class="text-xl font-bold text-slate-800">Choose Import Mode</h2>
                </div>
                <div class="p-6">
                    <div class="space-y-4">
                        <label class="flex items-start p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                            <input type="radio" name="mergeMode" value="merge" checked class="mt-1 mr-3">
                            <div>
                                <div class="font-medium text-slate-800">Merge Data</div>
                                <div class="text-sm text-slate-600">Combine imported data with existing data. Existing entries will be preserved.</div>
                            </div>
                        </label>
                        <label class="flex items-start p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                            <input type="radio" name="mergeMode" value="replace" class="mt-1 mr-3">
                            <div>
                                <div class="font-medium text-slate-800">Replace Data</div>
                                <div class="text-sm text-slate-600">Replace all existing data with imported data. This cannot be undone.</div>
                            </div>
                        </label>
                    </div>
                </div>
                <div class="p-6 border-t border-slate-200 flex justify-end space-x-3">
                    <button type="button" class="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300" 
                            onclick="resolveMergeMode('merge')">Cancel</button>
                    <button type="button" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" 
                            onclick="resolveMergeMode(document.querySelector('input[name=mergeMode]:checked').value)">Proceed</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        window.resolveMergeMode = (result) => {
            modal.remove();
            delete window.resolveMergeMode;
            resolve(result);
        };
    });
}

function mergeLifeCvData(existing, imported) {
    const merged = { ...existing };
    const lifeCvSections = DataService.getLifeCvSections();
    
    Object.keys(imported).forEach(sectionKey => {
        const sectionConfig = lifeCvSections[sectionKey];
        if (!sectionConfig) return;
        
        if (sectionConfig.isArray) {
            if (!merged[sectionKey]) merged[sectionKey] = [];
            merged[sectionKey] = [...merged[sectionKey], ...imported[sectionKey]];
        } else {
            if (!merged[sectionKey]) merged[sectionKey] = {};
            merged[sectionKey] = { ...merged[sectionKey], ...imported[sectionKey] };
        }
    });
    
    return merged;
}

function searchData(query) {
    const searchResults = document.getElementById('search-results');
    const searchResultsList = document.getElementById('search-results-list');
    
    if (!query.trim()) {
        searchResults?.classList.add('hidden');
        clearSearchHighlights();
        return;
    }
    
    const results = performDataSearch(query.toLowerCase());
    
    if (results.length === 0) {
        searchResults?.classList.remove('hidden');
        if (searchResultsList) {
            searchResultsList.innerHTML = '<p class="text-sm text-slate-500">No results found.</p>';
        }
        return;
    }
    
    searchResults?.classList.remove('hidden');
    if (searchResultsList) {
        searchResultsList.innerHTML = results.map(result => `
            <div class="search-result-item" onclick="navigateToSearchResult('${result.sectionKey}', '${result.fieldId || ''}')">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="font-medium text-slate-800">${result.sectionTitle}</div>
                        <div class="text-sm text-slate-600">${result.context}</div>
                    </div>
                    <i class="fas fa-arrow-right text-slate-400"></i>
                </div>
            </div>
        `).join('');
    }
}

function performDataSearch(query) {
    const results = [];
    const lifeCvData = DataService.getLifeCvData();
    const lifeCvSections = DataService.getLifeCvSections();
    
    Object.keys(lifeCvData).forEach(sectionKey => {
        const sectionConfig = lifeCvSections[sectionKey];
        const sectionData = lifeCvData[sectionKey];
        
        if (!sectionConfig || !sectionData) return;
        
        if (sectionConfig.title.toLowerCase().includes(query)) {
            results.push({
                sectionKey,
                sectionTitle: sectionConfig.title,
                context: 'Section title match',
                type: 'section'
            });
        }
        
        if (sectionConfig.isArray && Array.isArray(sectionData)) {
            sectionData.forEach((item, index) => {
                searchInItem(item, sectionKey, sectionConfig, query, results, `Item ${index + 1}`);
            });
        } else if (typeof sectionData === 'object') {
            searchInItem(sectionData, sectionKey, sectionConfig, query, results, 'Section data');
        }
    });
    
    return results;
}

function searchInItem(item, sectionKey, sectionConfig, query, results, contextPrefix) {
    Object.keys(item).forEach(fieldKey => {
        const fieldData = item[fieldKey];
        const fieldValue = fieldData?.value || fieldData;
        
        if (typeof fieldValue === 'string' && fieldValue.toLowerCase().includes(query)) {
            const field = sectionConfig.fields?.find(f => f.id === fieldKey);
            results.push({
                sectionKey,
                fieldId: fieldKey,
                sectionTitle: sectionConfig.title,
                context: `${contextPrefix}: ${field?.label || fieldKey} - "${fieldValue.substring(0, 50)}${fieldValue.length > 50 ? '...' : ''}"`,
                type: 'field'
            });
        }
    });
}

function clearSearchHighlights() {
    document.querySelectorAll('.search-highlight').forEach(el => {
        el.outerHTML = el.innerHTML;
    });
    
    document.querySelectorAll('.accordion-section.search-matched').forEach(el => {
        el.classList.remove('search-matched');
    });
}

window.navigateToSearchResult = function(sectionKey, fieldId) {
    const sectionElement = document.querySelector(`[data-section="${sectionKey}"]`);
    if (!sectionElement) return;
    
    // Open accordion if closed
    const accordionContent = sectionElement.querySelector('.accordion-content');
    const chevron = sectionElement.querySelector('.accordion-toggle i:last-child');
    
    if (accordionContent && accordionContent.style.display === 'none') {
        accordionContent.style.display = 'block';
        chevron?.classList.add('rotate-180');
    }
    
    // Highlight section
    sectionElement.classList.add('search-matched');
    
    // Scroll to section
    sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Highlight specific field if provided
    if (fieldId) {
        setTimeout(() => {
            const fieldElement = sectionElement.querySelector(`[name="${fieldId}"]`);
            if (fieldElement) {
                fieldElement.focus();
                fieldElement.style.border = '2px solid #3b82f6';
                setTimeout(() => {
                    fieldElement.style.border = '';
                }, 3000);
            }
        }, 500);
    }
};

// Fix the handleDataUpdate function:
function handleDataUpdate(data) {
    if (!isInitialized) {
        console.log("LifeCV Controller: Data received, but modules not ready. Buffering.");
        return;
    }
    console.log("LifeCV Controller: Data updated, triggering UI refresh.");

    try {
        // Get the static section configuration
        const sectionsConfig = DataService.getLifeCvSections();

        // Re-render the main content and the dashboard with the new data
        renderer.renderAllSections(data, sectionsConfig);
        Dashboard.update(data, sectionsConfig);
    } catch (error) {
        console.error("LifeCV Controller: Error updating UI.", error);
        // Optionally, show a non-critical error notification to the user
    }
}

// Keep only the exports that are actually defined in this file:
export {
    initLifeCV,
    exportLifeCvData,
    importLifeCvData,
    searchData,
    clearSearchHighlights
};

// Make functions globally available
window.exportLifeCvData = exportLifeCvData;
window.importLifeCvData = importLifeCvData;
window.searchData = searchData;
window.clearSearchHighlights = clearSearchHighlights;
window.lifecvModule = {
    exportData: exportLifeCvData,
    importData: importLifeCvData,
    searchData: searchData,
    clearSearchHighlights: clearSearchHighlights
};

// Make the main function globally available
window.initLifeCV = initLifeCV;

/* --- End of LifeCV Module --- */