/* ================================================================================= */
/* FILE: assets/js/ui/lifecv-modals.js                                               */
/* PURPOSE: Complete modal management system for LifeCV                              */
/* ================================================================================= */

import { getLifeCvData, updateField, saveLifeCvData, getLifeCvSections } from '../services/life-cv-data-service.js';
import { uploadFile } from '../firebase-config.js';
import CameraService from '../services/camera-service.js';
import { getCurrentUser } from '../auth/auth-service.js';

let cameraService;
let currentModal = null;

/**
 * Show notification to user
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`;
    
    // Set type-specific styling
    const typeClasses = {
        'success': 'bg-green-500 text-white',
        'error': 'bg-red-500 text-white',
        'warning': 'bg-yellow-500 text-black',
        'info': 'bg-blue-500 text-white'
    };
    
    notification.className += ` ${typeClasses[type] || typeClasses.info}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, duration);
}

/**
 * Initializes modal functionality
 */
function init() {
    cameraService = new CameraService('camera-stream', 'camera-canvas');
    attachModalEventListeners();
    console.log('Modals initialized');
}

/**
 * Attach modal event listeners
 */
function attachModalEventListeners() {
    // Listen for item modal events
    document.addEventListener('openItemModal', handleOpenItemModal);
    
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCurrentModal();
        }
    });
}

/**
 * Handle opening item modal
 */
function handleOpenItemModal(event) {
    const { sectionKey, index } = event.detail;
    const sectionsConfig = getLifeCvSections();
    const sectionConfig = sectionsConfig[sectionKey];
    
    if (!sectionConfig) return;
    
    const data = getLifeCvData();
    const sectionData = data[sectionKey] || [];
    const item = index >= 0 ? sectionData[index] : {};
    
    createItemEditModal(sectionKey, sectionConfig, item, index);
}

/**
 * Create item edit modal
 */
function createItemEditModal(sectionKey, sectionConfig, item, index) {
    const modal = document.createElement('div');
    modal.id = 'item-edit-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-slate-200">
                <div class="flex justify-between items-center">
                    <h2 class="text-xl font-bold text-slate-800">
                        ${index >= 0 ? 'Edit' : 'Add'} ${sectionConfig.title.slice(0, -1)}
                    </h2>
                    <button onclick="closeCurrentModal()" class="text-slate-400 hover:text-slate-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
            </div>
            <form id="item-form" class="p-6">
                <div class="space-y-4">
                    ${sectionConfig.fields.map(field => createFieldHTML(field, item[field.id])).join('')}
                </div>
            </form>
            <div class="p-6 border-t border-slate-200 flex justify-end space-x-3">
                <button type="button" onclick="closeCurrentModal()" 
                        class="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">
                    Cancel
                </button>
                <button type="button" onclick="saveItemFromModal('${sectionKey}', ${index}, this.closest('.fixed'))" 
                        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    ${index >= 0 ? 'Update' : 'Add'} ${sectionConfig.title.slice(0, -1)}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    currentModal = 'item-edit';
}

/**
 * Create field HTML for modal
 */
function createFieldHTML(field, fieldData = {}) {
    const value = fieldData.value || '';
    const isPublic = fieldData.isPublic !== false;
    
    let inputHTML;
    if (field.type === 'textarea') {
        inputHTML = `<textarea name="${field.id}" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" rows="3">${value}</textarea>`;
    } else if (field.type === 'select') {
        inputHTML = `
            <select name="${field.id}" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Select ${field.label}</option>
                ${field.options?.map(option => `<option value="${option}" ${value === option ? 'selected' : ''}>${option}</option>`).join('') || ''}
            </select>
        `;
    } else if (field.type === 'checkbox') {
        inputHTML = `
            <label class="flex items-center">
                <input type="checkbox" name="${field.id}" ${value ? 'checked' : ''} class="mr-2">
                <span>${field.label}</span>
            </label>
        `;
    } else {
        inputHTML = `<input type="${field.type || 'text'}" name="${field.id}" value="${value}" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">`;
    }

    return `
        <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
                ${field.label}
                ${field.required ? '<span class="text-red-500">*</span>' : ''}
            </label>
            ${inputHTML}
            ${field.sensitive ? `
                <div class="mt-2">
                    <label class="flex items-center">
                        <input type="checkbox" name="${field.id}_public" ${isPublic ? 'checked' : ''} class="mr-2">
                        <span class="text-sm text-slate-600">Make this information public</span>
                    </label>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Save item from modal
 */
async function saveItemFromModal(sectionKey, index, modal) {
    try {
        const form = modal.querySelector('#item-form');
        const formData = new FormData(form);
        const sectionsConfig = getLifeCvSections();
        const sectionConfig = sectionsConfig[sectionKey];
        
        const itemData = {};
        sectionConfig.fields.forEach(field => {
            const value = formData.get(field.id);
            const isPublic = formData.get(`${field.id}_public`) === 'on';
            
            itemData[field.id] = {
                value: field.type === 'checkbox' ? (value === 'on') : (value || ''),
                isPublic: field.sensitive ? isPublic : true
            };
        });
        
        const data = getLifeCvData();
        let currentData = data[sectionKey] || [];
        
        if (!Array.isArray(currentData)) {
            currentData = [];
        }
        
        if (index >= 0) {
            currentData[index] = itemData;
        } else {
            currentData.push(itemData);
        }

        updateField(sectionKey, currentData);
        await saveLifeCvData();

        modal.remove();
        currentModal = null;
        
        showNotification(`${sectionConfig.title.slice(0, -1)} ${index >= 0 ? 'updated' : 'added'} successfully!`, 'success');

    } catch (error) {
        console.error('Error saving item:', error);
        showNotification('Failed to save item. Please try again.', 'error');
    }
}

/**
 * Close any open modal
 */
function closeCurrentModal() {
    switch (currentModal) {
        case 'camera':
            closeCameraModal();
            break;
        case 'pii':
            closePiiModal();
            break;
        case 'item-edit':
            const modal = document.getElementById('item-edit-modal');
            if (modal) modal.remove();
            currentModal = null;
            break;
    }
}

/**
 * Show PII confirmation modal
 */
function showPiiConfirmModal() {
    // Implementation for PII modal
    console.log('PII modal opened');
}

/**
 * Close PII modal
 */
function closePiiModal() {
    // Implementation for closing PII modal
    console.log('PII modal closed');
}

/**
 * Close camera modal
 */
function closeCameraModal() {
    // Implementation for closing camera modal
    if (cameraService) {
        cameraService.stop();
    }
    console.log('Camera modal closed');
}

// Create Modals object with all modal functions
const Modals = {
    init,
    closeCurrentModal,
    showPiiConfirmModal,
    createItemEditModal
};

// Make functions globally available
window.closeCurrentModal = closeCurrentModal;
window.saveItemFromModal = saveItemFromModal;

// Export functions and Modals object
export { 
    showNotification, 
    Modals, 
    init, 
    closeCurrentModal, 
    showPiiConfirmModal 
};