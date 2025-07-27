/* ================================================================================= */
/* FILE: assets/js/ui/lifecv-events.js                                               */
/* PURPOSE: Centralizes all user interaction event listeners for the LifeCV module.  */
/* It acts as the bridge between user actions and the data/UI modules.               */
/* ================================================================================= */

import { updateField, saveLifeCvData, getLifeCvData, exportData, importData } from '../services/life-cv-data-service.js';
import { showPiiConfirmModal } from './lifecv-modals.js';
import { renderAllSections } from './lifecv-renderer.js';

/**
 * Initializes the main event listeners for the LifeCV page.
 */
export function init() {
    const sectionsContainer = document.getElementById('lifecv-sections');
    if (sectionsContainer) {
        sectionsContainer.addEventListener('click', handleSectionClick);
        sectionsContainer.addEventListener('input', handleInputChange);
        sectionsContainer.addEventListener('change', handleSelectChange);
    }

    // Make global functions available
    setupGlobalFunctions();
}

/**
 * Make functions globally available for HTML onclick handlers
 */
function setupGlobalFunctions() {
    // Export/Import functions
    window.exportLifeCvData = exportLifeCvData;
    window.importLifeCvData = importLifeCvData;
    
    // Notification system
    window.showNotification = showNotification;
    
    // List management functions
    window.openItemModal = openItemModal;
    window.saveListItem = saveListItem;
    window.deleteListItem = deleteListItem;
    
    // Profile picture functions
    window.setPrimaryPicture = setPrimaryPicture;
    window.deletePicture = deletePicture;
}

/**
 * Handles all delegated click events within the sections container.
 * @param {Event} e - The click event.
 */
function handleSectionClick(e) {
    const button = e.target.closest('button');
    if (!button) return;

    // Privacy toggle logic
    if (button.classList.contains('privacy-toggle')) {
        const path = button.dataset.path;
        const isSensitive = button.dataset.sensitive === 'true';
        const currentIsPublic = button.classList.contains('public');
        
        const togglePrivacy = () => {
            updateField(path, !currentIsPublic);
            // Update UI immediately
            if (!currentIsPublic) {
                button.classList.add('public');
                button.querySelector('i').className = 'fas fa-lock-open';
                button.title = 'Click to make private';
            } else {
                button.classList.remove('public');
                button.querySelector('i').className = 'fas fa-lock';
                button.title = 'Click to make public';
            }
        };

        if (isSensitive && !currentIsPublic) {
            showPiiConfirmModal(path, togglePrivacy);
        } else {
            togglePrivacy();
        }
        return;
    }

    // Add item buttons for list sections
    if (button.classList.contains('add-item-btn')) {
        const sectionKey = button.dataset.section;
        openItemModal(sectionKey, -1);
        return;
    }

    // Edit item buttons
    if (button.classList.contains('edit-item-btn')) {
        const sectionKey = button.dataset.section;
        const index = parseInt(button.dataset.index);
        openItemModal(sectionKey, index);
        return;
    }

    // Delete item buttons
    if (button.classList.contains('delete-item-btn')) {
        e.preventDefault();
        e.stopPropagation();
        const sectionKey = button.dataset.section;
        const index = parseInt(button.dataset.index);
        deleteListItem(sectionKey, index);
        return;
    }

    // Set primary picture
    if (button.classList.contains('set-primary-btn')) {
        const pictureId = button.dataset.pictureId;
        setPrimaryPicture(pictureId);
        return;
    }

    // Delete picture
    if (button.classList.contains('delete-picture-btn')) {
        const pictureId = button.dataset.pictureId;
        deletePicture(pictureId);
        return;
    }
}

/**
 * Handles input changes with debounced saving
 */
function handleInputChange(e) {
    const input = e.target;
    const path = input.dataset.path;
    if (path) {
        updateField(path, input.value);
    }
}

/**
 * Handles select changes
 */
function handleSelectChange(e) {
    const select = e.target;
    const path = select.dataset.path;
    if (path) {
        updateField(path, select.value);
    }
}

/**
 * Export LifeCV data
 */
function exportLifeCvData() {
    try {
        const dataStr = exportData();
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `lifecv-export-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showNotification('LifeCV data exported successfully!', 'success');
    } catch (error) {
        console.error('Export failed:', error);
        showNotification('Failed to export data. Please try again.', 'error');
    }
}

/**
 * Import LifeCV data
 */
function importLifeCvData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            const success = await importData(importedData);
            if (success) {
                showNotification('LifeCV data imported successfully!', 'success');
            } else {
                showNotification('Failed to import data. Please check the file format.', 'error');
            }
            
        } catch (error) {
            console.error('Error importing data:', error);
            showNotification('Failed to import data. Please check the file format.', 'error');
        }
    };
    
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.lifecycle-notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `lifecycle-notification fixed top-4 right-4 z-[60] px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    
    const typeStyles = {
        success: 'bg-green-600 text-white',
        error: 'bg-red-600 text-white',
        warning: 'bg-yellow-600 text-white',
        info: 'bg-blue-600 text-white'
    };
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    notification.className += ` ${typeStyles[type] || typeStyles.info}`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${icons[type] || icons.info} mr-3"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

/**
 * Open modal for list items
 */
function openItemModal(sectionKey, index = -1) {
    // This will be implemented when modal system is ready
    console.log(`Opening modal for ${sectionKey}, index: ${index}`);
    showNotification('Item editing modal is coming soon!', 'info');
}

/**
 * Save list item
 */
async function saveListItem(sectionKey, index, itemData) {
    try {
        const lifeCvData = getLifeCvData();
        const currentData = lifeCvData[sectionKey] || [];
        
        if (index >= 0) {
            currentData[index] = itemData;
        } else {
            currentData.push(itemData);
        }
        
        updateField(sectionKey, currentData);
        await saveLifeCvData();
        
        showNotification('Item saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving item:', error);
        showNotification('Failed to save item. Please try again.', 'error');
    }
}

/**
 * Delete list item
 */
async function deleteListItem(sectionKey, index) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
        const lifeCvData = getLifeCvData();
        const currentData = lifeCvData[sectionKey] || [];
        currentData.splice(index, 1);
        
        updateField(sectionKey, currentData);
        await saveLifeCvData();
        
        showNotification('Item deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting item:', error);
        showNotification('Failed to delete item. Please try again.', 'error');
    }
}

/**
 * Set primary picture
 */
async function setPrimaryPicture(pictureId) {
    try {
        const lifeCvData = getLifeCvData();
        if (lifeCvData.profilePictures?.pictures) {
            lifeCvData.profilePictures.pictures.forEach(pic => {
                pic.isPrimary = pic.id === pictureId;
            });
            
            updateField('profilePictures', lifeCvData.profilePictures);
            await saveLifeCvData();
            
            showNotification('Primary picture updated!', 'success');
        }
    } catch (error) {
        console.error('Error setting primary picture:', error);
        showNotification('Failed to update primary picture.', 'error');
    }
}

/**
 * Delete picture
 */
async function deletePicture(pictureId) {
    if (!confirm('Are you sure you want to delete this picture?')) return;
    
    try {
        const lifeCvData = getLifeCvData();
        if (lifeCvData.profilePictures?.pictures) {
            const pictureIndex = lifeCvData.profilePictures.pictures.findIndex(pic => pic.id === pictureId);
            if (pictureIndex >= 0) {
                lifeCvData.profilePictures.pictures.splice(pictureIndex, 1);
                
                // If deleted picture was primary, set first remaining as primary
                if (lifeCvData.profilePictures.pictures.length > 0) {
                    const hasNewPrimary = lifeCvData.profilePictures.pictures.some(pic => pic.isPrimary);
                    if (!hasNewPrimary) {
                        lifeCvData.profilePictures.pictures[0].isPrimary = true;
                    }
                }
                
                updateField('profilePictures', lifeCvData.profilePictures);
                await saveLifeCvData();
                
                showNotification('Picture deleted successfully!', 'success');
            }
        }
    } catch (error) {
        console.error('Error deleting picture:', error);
        showNotification('Failed to delete picture.', 'error');
    }
}