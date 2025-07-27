/* ================================================================================= */
/* FILE: assets/js/ui/lifecv-events.js                                               */
/* PURPOSE: Centralizes all user interaction event listeners for the LifeCV module.  */
/* It acts as the bridge between user actions and the data/UI modules.               */
/* ================================================================================= */

import { updateField, saveLifeCvData, getLifeCvData } from '../services/life-cv-data-service.js';
import { showPiiConfirmModal } from './lifecv-modals.js';
import { uploadFile } from '../storage.js';

/**
 * Initializes the main event listeners for the LifeCV page.
 */
export function init() {
    const sectionsContainer = document.getElementById('lifecv-sections');
    if (!sectionsContainer) return;
    
    sectionsContainer.addEventListener('click', handleSectionClick);
    sectionsContainer.addEventListener('input', (e) => {
        const input = e.target;
        const path = input.dataset.path;
        if (path) {
            updateField(path, input.value);
        }
    });
}

/**
 * Handles all delegated click events within the sections container.
 * @param {Event} e - The click event.
 */
function handleSectionClick(e) {
    const button = e.target.closest('button');
    if (!button) return;

    // Accordion toggle logic
    if (button.classList.contains('accordion-toggle')) {
        const content = button.nextElementSibling;
        const icon = button.querySelector('i');
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
            icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
            icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
        }
        return;
    }

    // Privacy toggle logic
    if (button.classList.contains('privacy-toggle')) {
        const path = button.dataset.path;
        const isSensitive = button.dataset.sensitive === 'true';
        const currentIsPublic = button.classList.contains('public');
        
        const togglePrivacy = () => {
            updateField(path, !currentIsPublic);
        };

        if (isSensitive && !currentIsPublic) {
            showPiiConfirmModal(path, togglePrivacy);
        } else {
            togglePrivacy();
        }
        return;
    }
}
