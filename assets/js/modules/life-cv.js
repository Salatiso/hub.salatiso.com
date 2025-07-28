/* ================================================================================= */
/* FILE: assets/js/modules/life-cv.js (MAIN MODULE)                                 */
/* PURPOSE: Main LifeCV module that orchestrates all components                     */
/* ================================================================================= */

import { init as initDataService } from '../services/life-cv-data-service.js';
import { init as initUIController } from '../controllers/lifecv-ui-controller.js';
import { init as initImportHandlers } from '../handlers/import-handlers.js';
import { showModal, init as initModals } from '../ui/lifecv-modals-v2.js';
import { showNotification } from '../utils/notifications.js';

let isInitialized = false;
let currentUser = null;

/**
 * Initialize the LifeCV module
 */
export async function init(user) {
    if (isInitialized) return;
    
    try {
        showLoadingState();
        
        currentUser = user;
        
        // Initialize all components
        await initDataService(user, handleDataUpdate);
        initUIController();
        initImportHandlers();
        initModals();
        
        // Set up global error handling
        setupErrorHandling();
        
        // Hide loading and show app
        hideLoadingState();
        
        isInitialized = true;
        console.log('LifeCV module initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize LifeCV:', error);
        showErrorState(error);
    }
}

/**
 * Handle data updates from the data service
 */
function handleDataUpdate(newData) {
    if (window.lifeCvUIController) {
        window.lifeCvUIController.updateUI(newData);
    }
}

/**
 * Show loading state
 */
function showLoadingState() {
    const loadingEl = document.getElementById('loading-indicator');
    const appEl = document.getElementById('app-container');
    
    if (loadingEl) loadingEl.style.display = 'flex';
    if (appEl) appEl.style.visibility = 'hidden';
}

/**
 * Hide loading state and show app
 */
function hideLoadingState() {
    const loadingEl = document.getElementById('loading-indicator');
    const appEl = document.getElementById('app-container');
    
    if (loadingEl) loadingEl.style.display = 'none';
    if (appEl) appEl.style.visibility = 'visible';
}

/**
 * Show error state
 */
function showErrorState(error) {
    const errorEl = document.getElementById('error-boundary');
    const loadingEl = document.getElementById('loading-indicator');
    const appEl = document.getElementById('app-container');
    
    if (loadingEl) loadingEl.style.display = 'none';
    if (appEl) appEl.style.visibility = 'hidden';
    if (errorEl) errorEl.classList.remove('hidden');
    
    showNotification(`Initialization failed: ${error.message}`, 'error', 10000);
}

/**
 * Set up global error handling
 */
function setupErrorHandling() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
        if (event.message && (
            event.message.includes('Extension context invalidated') || 
            event.message.includes('message channel closed')
        )) {
            return; // Ignore browser extension errors
        }
        
        console.error('Global error:', event.error);
        showNotification('An unexpected error occurred', 'error');
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        if (event.reason && event.reason.message && 
            event.reason.message.includes('message channel closed')) {
            event.preventDefault();
            return;
        }
        
        console.error('Unhandled promise rejection:', event.reason);
        showNotification('An unexpected error occurred', 'error');
    });
}

/**
 * Export functionality for external use
 */
export function exportLifeCV(options = {}) {
    if (window.lifeCvDataService) {
        return window.lifeCvDataService.exportData(options);
    }
}

/**
 * Import functionality for external use
 */
export async function importLifeCV(data, options = {}) {
    if (window.lifeCvDataService) {
        return await window.lifeCvDataService.importData(data, options);
    }
}

// Make main functions globally available
window.lifeCvModule = {
    exportLifeCV,
    importLifeCV,
    init
};

/* --- End of LifeCV Module --- */