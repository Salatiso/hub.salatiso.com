/* ================================================================================= */
/* FILE: assets/js/ui/lifecv-modals.js                                               */
/* PURPOSE: Complete modal management system for LifeCV                              */
/* ================================================================================= */

import CameraService from '../services/camera-service.js';
import { getLifeCvData, saveLifeCvData, updateField, getLifeCvSections } from '../services/life-cv-data-service.js';
import { uploadFile } from '../firebase-config.js';
import { getCurrentUser } from '../auth/auth-service.js';
import { lifeCvData, lifeCvSections, updateDocument } from '../modules/life-cv.js';

let cameraService;
let currentModal = null;

/**
 * Initializes modal functionality
 */
export function init() {
    cameraService = new CameraService('camera-stream', 'camera-canvas');
    attachModalEventListeners();
    console.log("Modals initialized.");
}

/**
 * Attach global modal event listeners
 */
function attachModalEventListeners() {
    document.body.addEventListener('click', handleModalClick);
    document.body.addEventListener('change', handleFileUpload);
}

/**
 * Handle modal-related clicks
 */
function handleModalClick(e) {
    const target = e.target;
    const targetId = target.id;
    const classList = target.classList;

    // Camera modal triggers
    if (targetId === 'open-camera-btn') {
        e.preventDefault();
        showCameraModal();
        return;
    }

    // File upload for profile pictures
    if (targetId === 'upload-pic') {
        // This is handled by handleFileUpload
        return;
    }

    // Modal close buttons
    if (targetId === 'cancel-capture-btn') {
        closeCameraModal();
        return;
    }

    if (targetId === 'pii-cancel-btn') {
        closePiiModal();
        return;
    }

    if (targetId === 'public-presence-close-btn') {
        closePublicPresenceModal();
        return;
    }

    // Camera capture
    if (targetId === 'capture-btn') {
        capturePhoto();
        return;
    }

    // List item modals
    if (classList.contains('add-item-btn')) {
        const sectionKey = target.dataset.section;
        openItemEditModal(sectionKey, -1);
        return;
    }

    if (classList.contains('edit-item-btn')) {
        const sectionKey = target.dataset.section;
        const index = parseInt(target.dataset.index);
        openItemEditModal(sectionKey, index);
        return;
    }
}

/**
 * Handle file upload for profile pictures
 */
async function handleFileUpload(e) {
    if (e.target.id === 'upload-pic') {
        const file = e.target.files[0];
        if (file) {
            await uploadProfilePicture(file);
        }
        // Reset input
        e.target.value = '';
    }
}

/**
 * Upload profile picture (file or blob)
 */
async function uploadProfilePicture(fileOrBlob, source = 'upload') {
    try {
        const user = getCurrentUser();
        if (!user) throw new Error('No authenticated user');

        // Validate file size (max 5MB)
        if (fileOrBlob.size > 5 * 1024 * 1024) {
            throw new Error('File size must be less than 5MB');
        }

        // Validate file type for uploads
        if (source === 'upload' && !fileOrBlob.type.startsWith('image/')) {
            throw new Error('Please select a valid image file');
        }

        showNotification('Uploading picture...', 'info');

        const fileName = `profile-picture-${Date.now()}.${source === 'camera' ? 'png' : fileOrBlob.name.split('.').pop() || 'jpg'}`;
        const downloadURL = await uploadFile(fileOrBlob, `profile-pictures/${user.uid}/${fileName}`);

        const lifeCvData = getLifeCvData();
        if (!lifeCvData.profilePictures) {
            lifeCvData.profilePictures = { pictures: [] };
        }

        const newPicture = {
            id: Date.now().toString(),
            url: downloadURL,
            filename: fileName,
            uploadedAt: new Date().toISOString(),
            type: source,
            isPrimary: lifeCvData.profilePictures.pictures.length === 0
        };

        lifeCvData.profilePictures.pictures.push(newPicture);
        updateField('profilePictures', lifeCvData.profilePictures);
        await saveLifeCvData();

        showNotification('Profile picture uploaded successfully!', 'success');

    } catch (error) {
        console.error('Error uploading picture:', error);
        showNotification(`Upload failed: ${error.message}`, 'error');
    }
}

/**
 * Show camera modal
 */
async function showCameraModal() {
    const modal = document.getElementById('camera-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    currentModal = 'camera';

    try {
        await cameraService.start();
        showNotification('Camera ready. Click capture when ready.', 'info');
    } catch (error) {
        console.error('Camera failed:', error);
        showNotification(`Camera error: ${error.message}`, 'error');
        closeCameraModal();
    }
}

/**
 * Close camera modal
 */
function closeCameraModal() {
    const modal = document.getElementById('camera-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    
    if (cameraService) {
        cameraService.stop();
    }
    
    currentModal = null;
}

/**
 * Capture photo from camera
 */
async function capturePhoto() {
    try {
        const blob = await cameraService.capture();
        closeCameraModal();
        await uploadProfilePicture(blob, 'camera');
    } catch (error) {
        console.error('Photo capture failed:', error);
        showNotification('Failed to capture photo. Please try again.', 'error');
    }
}

/**
 * Show PII confirmation modal
 */
export function showPiiConfirmModal(path, onConfirm) {
    const modal = document.getElementById('pii-confirm-modal');
    const nameDisplay = document.getElementById('pii-user-fullname');
    const input = document.getElementById('pii-confirm-input');
    const confirmBtn = document.getElementById('pii-confirm-btn');

    if (!modal || !nameDisplay || !input || !confirmBtn) {
        console.error('PII modal elements not found');
        return;
    }

    const lifeCvData = getLifeCvData();
    const userFullName = lifeCvData.personal?.fullName?.value || '';

    if (!userFullName) {
        showNotification("Please enter your full name in the 'Personal & Identity' section first.", 'warning');
        return;
    }

    nameDisplay.textContent = `"${userFullName}"`;
    input.value = '';
    confirmBtn.disabled = true;
    modal.classList.remove('hidden');
    currentModal = 'pii';

    // Input validation
    const handleInput = () => {
        confirmBtn.disabled = input.value.trim() !== userFullName;
    };

    // Confirm action
    const handleConfirm = () => {
        if (input.value.trim() === userFullName) {
            onConfirm();
            closePiiModal();
        }
    };

    // Cleanup function
    const cleanup = () => {
        input.removeEventListener('input', handleInput);
        confirmBtn.removeEventListener('click', handleConfirm);
    };

    input.addEventListener('input', handleInput);
    confirmBtn.addEventListener('click', handleConfirm);

    // Store cleanup for modal close
    modal._cleanup = cleanup;

    // Focus input
    setTimeout(() => input.focus(), 100);
}

/**
 * Close PII modal
 */
function closePiiModal() {
    const modal = document.getElementById('pii-confirm-modal');
    if (modal) {
        modal.classList.add('hidden');
        if (modal._cleanup) {
            modal._cleanup();
            delete modal._cleanup;
        }
    }
    currentModal = null;
}

/**
 * Close public presence modal
 */
function closePublicPresenceModal() {
    const modal = document.getElementById('public-presence-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    currentModal = null;
}

/**
 * Open item edit modal for list sections
 */
function openItemEditModal(sectionKey, index = -1) {
    const sectionsConfig = getLifeCvSections();
    const sectionConfig = sectionsConfig[sectionKey];
    
    if (!sectionConfig || !sectionConfig.isList) {
        showNotification('Invalid section for item editing', 'error');
        return;
    }

    const lifeCvData = getLifeCvData();
    const sectionData = lifeCvData[sectionKey] || [];
    const isEditing = index >= 0;
    const item = isEditing ? sectionData[index] : {};

    const modal = createItemEditModal(sectionKey, sectionConfig, item, index);
    document.body.appendChild(modal);
    currentModal = 'item-edit';
}

/**
 * Create item edit modal
 */
function createItemEditModal(sectionKey, sectionConfig, item, index) {
    const isEditing = index >= 0;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.id = 'item-edit-modal';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-slate-200">
                <h2 class="text-xl font-bold text-slate-800">
                    ${isEditing ? 'Edit' : 'Add'} ${sectionConfig.title.slice(0, -1)}
                </h2>
            </div>
            <div class="p-6">
                <form id="item-edit-form" class="space-y-4">
                    ${sectionConfig.fields.map(field => createFieldHTML(field, item[field.id])).join('')}
                </form>
            </div>
            <div class="p-6 border-t border-slate-200 flex justify-end space-x-3">
                <button type="button" id="cancel-item-edit" 
                        class="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition-colors">
                    Cancel
                </button>
                <button type="button" id="save-item-edit" 
                        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                    ${isEditing ? 'Update' : 'Add'} ${sectionConfig.title.slice(0, -1)}
                </button>
            </div>
        </div>
    `;

    // Attach event listeners
    modal.querySelector('#cancel-item-edit').addEventListener('click', () => {
        modal.remove();
        currentModal = null;
    });

    modal.querySelector('#save-item-edit').addEventListener('click', () => {
        saveItemFromModal(sectionKey, index, modal);
    });

    return modal;
}

/**
 * Create field HTML for modal
 */
function createFieldHTML(field, fieldData = {}) {
    const value = fieldData.value || '';
    const isPublic = fieldData.isPublic !== undefined ? fieldData.isPublic : !field.sensitive;

    let inputHTML = '';
    
    if (field.type === 'textarea') {
        inputHTML = `<textarea name="${field.id}" rows="3" 
                               class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                               placeholder="${field.placeholder || ''}">${value}</textarea>`;
    } else if (field.type === 'select') {
        inputHTML = `
            <select name="${field.id}" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Select ${field.label}</option>
                ${field.options.map(option => `
                    <option value="${option}" ${value === option ? 'selected' : ''}>${option}</option>
                `).join('')}
            </select>
        `;
    } else {
        inputHTML = `<input type="${field.type}" name="${field.id}" 
                           value="${value}" 
                           class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                           placeholder="${field.placeholder || ''}">`;
    }

    return `
        <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">${field.label}</label>
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
        const form = modal.querySelector('#item-edit-form');
        const formData = new FormData(form);
        const sectionsConfig = getLifeCvSections();
        const sectionConfig = sectionsConfig[sectionKey];
        
        const itemData = {};
        
        for (const field of sectionConfig.fields) {
            const value = formData.get(field.id);
            const isPublic = field.sensitive ? formData.get(`${field.id}_public`) !== null : true;
            
            if (value) {
                itemData[field.id] = {
                    value: value,
                    isPublic: isPublic,
                    lastModified: new Date().toISOString()
                };
            }
        }

        const lifeCvData = getLifeCvData();
        const currentData = lifeCvData[sectionKey] || [];
        
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
 * Check if already declared to prevent redeclaration
 */
if (typeof showNotification === 'undefined') {
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
}

// Export the function
export { showNotification };

/**
 * Close any open modal
 */
export function closeCurrentModal() {
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