/* ================================================================================= */
/* FILE: assets/js/ui/lifecv-modals.js                                             */
/* PURPOSE: Unified modal system entry point                                       */
/* ================================================================================= */

import { showCoreModal, init as initCore, hideModal } from './lifecv-modals-core.js';
import { showAdvancedModal } from './lifecv-modals-advanced.js';

/**
 * Initialize the complete modal system
 */
export function init() {
    try {
        initCore();
        console.log('Modal system initialized successfully');
    } catch (error) {
        console.error('Modal system initialization failed:', error);
    }
}

/**
 * Show any modal by ID - unified entry point
 */
export function showModal(modalId, data = {}) {
    try {
        // Try core modals first
        if (showCoreModal(modalId, data)) {
            return true;
        }
        
        // Try advanced modals
        if (showAdvancedModal(modalId, data)) {
            return true;
        }
        
        console.warn(`Unknown modal ID: ${modalId}`);
        return false;
    } catch (error) {
        console.error(`Error showing modal ${modalId}:`, error);
        return false;
    }
}

/**
 * Show conflict resolution modal
 */
export function showConflictResolution(data = {}) {
    return showModal('conflict-resolution', data);
}

// Re-export specific functions
export { hideModal };