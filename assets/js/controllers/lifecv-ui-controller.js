/* ================================================================================= */
/* FILE: assets/js/controllers/lifecv-ui-controller.js (COMPREHENSIVE UI) - CONTINUED */
/* PURPOSE: Complete UI management for LifeCV sections and interactions            */
/* ================================================================================= */

import { getLifeCvData, getLifeCvSections, updateField, addArrayItem, removeArrayItem, updatePrivacySetting } from '../services/life-cv-data-service.js';
import { showModal, hideModal } from '../components/lifecv-modals.js';
import { showNotification } from '../utils/notifications.js';
import { validateField } from '../utils/validators.js';
import { createAddressAutocomplete, getCurrentLocation } from '../utils/google-maps.js';
import { CameraService } from '../utils/camera-service.js';

let currentData = {};
let sectionsConfig = {};
let currentEditingItem = null;
let cameraService = new CameraService();
let activeCamera = null;

/**
 * Initialize the UI Controller
 */
export function init() {
    sectionsConfig = getLifeCvSections();
    currentData = getLifeCvData();
    
    console.log('LifeCV UI Controller initialized');
}

/**
 * Update the UI with new data
 */
export function updateUI(newData) {
    currentData = newData;
    renderAllSections();
    updateCompletionStats();
}

/**
 * Render all LifeCV sections
 */
function renderAllSections() {
    const container = document.getElementById('lifecv-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Render sections in a logical order
    const sectionOrder = [
        'personalInfo', 'contactInfo', 'emergencyContacts', 'profilePictures',
        'professionalSummary', 'lifePhilosophy', 'experience', 'education',
        'skills', 'certifications', 'projects', 'languages', 'interests',
        'milestones', 'community', 'volunteering', 'publications', 'digital',
        'travel', 'family', 'healthWellness', 'financials', 'references'
    ];
    
    sectionOrder.forEach(sectionKey => {
        if (sectionsConfig[sectionKey]) {
            const sectionElement = renderSection(sectionKey, sectionsConfig[sectionKey]);
            container.appendChild(sectionElement);
        }
    });
}

/**
 * Render individual section
 */
function renderSection(sectionKey, sectionConfig) {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden';
    sectionDiv.id = `section-${sectionKey}`;
    
    const sectionData = currentData[sectionKey] || (sectionConfig.isArray ? [] : {});
    const isArray = sectionConfig.isArray;
    
    // Calculate completion percentage
    const completionPercentage = calculateSectionCompletion(sectionData, sectionConfig);
    
    sectionDiv.innerHTML = `
        <!-- Section Header -->
        <div class="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <div class="p-3 bg-white rounded-lg shadow-sm mr-4">
                        <i class="${sectionConfig.icon} text-indigo-600 text-xl"></i>
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-slate-800">${sectionConfig.title}</h2>
                        <p class="text-slate-600 text-sm">${sectionConfig.description}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-3">
                    <!-- Completion Badge -->
                    <div class="flex items-center space-x-2">
                        <div class="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500" 
                                 style="width: ${completionPercentage}%"></div>
                        </div>
                        <span class="text-sm font-medium text-slate-600">${completionPercentage}%</span>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex space-x-2">
                        <button onclick="window.lifeCvUIController.toggleSection('${sectionKey}')" 
                                class="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <i id="toggle-icon-${sectionKey}" class="fas fa-chevron-down"></i>
                        </button>
                        ${isArray ? `
                            <button onclick="window.lifeCvUIController.addNewItem('${sectionKey}')" 
                                    class="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                                <i class="fas fa-plus text-sm"></i>
                            </button>
                        ` : ''}
                        <button onclick="window.lifeCvUIController.showPrivacySettings('${sectionKey}')" 
                                class="p-2 text-slate-400 hover:text-slate-600 transition-colors" 
                                title="Privacy Settings">
                            <i class="fas fa-shield-alt text-sm"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Section Content -->
        <div id="content-${sectionKey}" class="section-content">
            ${isArray ? renderArraySection(sectionKey, sectionData, sectionConfig) : renderObjectSection(sectionKey, sectionData, sectionConfig)}
        </div>
    `;
    
    return sectionDiv;
}

/**
 * Render array-based section (experience, skills, etc.)
 */
function renderArraySection(sectionKey, data, config) {
    if (!Array.isArray(data) || data.length === 0) {
        return `
            <div class="p-6 text-center">
                <div class="inline-block p-4 bg-slate-100 rounded-full mb-4">
                    <i class="${config.icon} text-slate-400 text-2xl"></i>
                </div>
                <p class="text-slate-500 mb-4">No ${config.title.toLowerCase()} added yet</p>
                <button onclick="window.lifeCvUIController.addNewItem('${sectionKey}')" 
                        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                    <i class="fas fa-plus mr-2"></i>Add ${config.title.replace(/s$/, '')}
                </button>
            </div>
        `;
    }
    
    let html = '<div class="divide-y divide-slate-200">';
    
    data.forEach((item, index) => {
        html += renderArrayItem(sectionKey, item, index, config);
    });
    
    html += '</div>';
    
    // Add "Add New" button at the bottom
    html += `
        <div class="p-4 border-t border-slate-200 bg-slate-50">
            <button onclick="window.lifeCvUIController.addNewItem('${sectionKey}')" 
                    class="w-full py-2 px-4 border-2 border-dashed border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 rounded-md transition-colors">
                <i class="fas fa-plus mr-2"></i>Add ${config.title.replace(/s$/, '')}
            </button>
        </div>
    `;
    
    return html;
}

/**
 * Render individual array item
 */
function renderArrayItem(sectionKey, item, index, config) {
    const primaryField = config.fields[0];
    const secondaryField = config.fields[1];
    
    const primaryValue = item[primaryField.id]?.value || '';
    const secondaryValue = item[secondaryField?.id]?.value || '';
    
    return `
        <div class="p-4 hover:bg-slate-50 transition-colors">
            <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-slate-800 truncate">${primaryValue || 'Untitled'}</h4>
                    ${secondaryValue ? `<p class="text-sm text-slate-600 truncate mt-1">${secondaryValue}</p>` : ''}
                </div>
                <div class="flex items-center space-x-2 ml-4">
                    <button onclick="window.lifeCvUIController.editArrayItem('${sectionKey}', ${index})" 
                            class="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                        <i class="fas fa-edit text-sm"></i>
                    </button>
                    <button onclick="window.lifeCvUIController.deleteArrayItem('${sectionKey}', ${index})" 
                            class="p-2 text-slate-400 hover:text-red-600 transition-colors">
                        <i class="fas fa-trash text-sm"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render object-based section (personal info, philosophy, etc.)
 */
function renderObjectSection(sectionKey, data, config) {
    let html = '<div class="p-6 space-y-4">';
    
    config.fields.forEach(field => {
        const fieldValue = data[field.id]?.value || '';
        const isPublic = data[field.id]?.isPublic !== false;
        
        html += `
            <div class="form-group">
                <label class="block text-sm font-medium text-slate-700 mb-1">
                    ${field.label}
                    ${field.required ? '<span class="text-red-500">*</span>' : ''}
                    ${field.sensitive ? 
                        `<i class="fas fa-lock text-xs text-amber-500 ml-1" title="Sensitive information"></i>` : 
                        `<i class="fas fa-${isPublic ? 'eye' : 'eye-slash'} text-xs text-slate-400 ml-1" title="${isPublic ? 'Public' : 'Private'}"></i>`
                    }
                </label>
                ${renderFormField(sectionKey, field, fieldValue)}
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

/**
 * Render individual form field
 */
function renderFormField(sectionKey, field, value) {
    const fieldPath = `${sectionKey}.${field.id}.value`;
    const baseClasses = 'w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500';
    const fieldId = `field-${sectionKey}-${field.id}`;
    
    // Special handling for contact info fields
    if (sectionKey === 'contactInfo') {
        return renderContactField(field, value, fieldPath, baseClasses, fieldId);
    }
    
    // Special handling for profile pictures
    if (sectionKey === 'profilePictures') {
        return renderProfilePicturesField(field, value, sectionKey);
    }
    
    switch (field.type) {
        case 'textarea':
            return `<textarea
                        id="${fieldId}"
                        onchange="window.lifeCvUIController.updateFieldValue('${fieldPath}', this.value)"
                        class="${baseClasses} resize-none"
                        rows="3"
                        placeholder="${field.placeholder || ''}">${value}</textarea>`;
        
        case 'select':
            const options = field.options || [];
            return `<select id="${fieldId}" onchange="window.lifeCvUIController.updateFieldValue('${fieldPath}', this.value)" class="${baseClasses}">
                        <option value="">Select ${field.label.toLowerCase()}</option>
                        ${options.map(opt => `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                    </select>`;
        
        case 'checkbox':
            return `<label class="flex items-center">
                        <input type="checkbox"
                               id="${fieldId}"
                               onchange="window.lifeCvUIController.updateFieldValue('${fieldPath}', this.checked)"
                               ${value === 'true' || value === true ? 'checked' : ''}
                               class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                        <span class="ml-2 text-sm text-slate-600">${field.label}</span>
                    </label>`;
        
        case 'date':
            return `<input type="date"
                           id="${fieldId}"
                           onchange="window.lifeCvUIController.updateFieldValue('${fieldPath}', this.value)"
                           value="${value}"
                           class="${baseClasses}">`;
        
        case 'number':
            return `<input type="number"
                           id="${fieldId}"
                           onchange="window.lifeCvUIController.updateFieldValue('${fieldPath}', this.value)"
                           value="${value}"
                           class="${baseClasses}"
                           placeholder="${field.placeholder || ''}">`;
        
        case 'email':
            return `<input type="email"
                           id="${fieldId}"
                           onchange="window.lifeCvUIController.updateFieldValue('${fieldPath}', this.value)"
                           value="${value}"
                           class="${baseClasses}"
                           placeholder="${field.placeholder || ''}">`;
        
        case 'tel':
            return `<input type="tel"
                           id="${fieldId}"
                           onchange="window.lifeCvUIController.updateFieldValue('${fieldPath}', this.value)"
                           value="${value}"
                           class="${baseClasses}"
                           placeholder="${field.placeholder || ''}">`;
        
        case 'url':
            return `<input type="url"
                           id="${fieldId}"
                           onchange="window.lifeCvUIController.updateFieldValue('${fieldPath}', this.value)"
                           value="${value}"
                           class="${baseClasses}"
                           placeholder="${field.placeholder || 'https://'}">`;
        
        default:
            return `<input type="text"
                           id="${fieldId}"
                           onchange="window.lifeCvUIController.updateFieldValue('${fieldPath}', this.value)"
                           value="${value}"
                           class="${baseClasses}"
                           ${field.readonly ? 'readonly' : ''}
                           placeholder="${field.placeholder || ''}">`;
    }
}

/**
 * Render contact field with special handling for addresses
 */
function renderContactField(field, value, fieldPath, baseClasses, fieldId) {
    if (field.id === 'value') {
        // This is the main contact value field - check the type to determine rendering
        return `<div class="relative">
                    <input type="text"
                           id="${fieldId}"
                           onchange="window.lifeCvUIController.updateFieldValue('${fieldPath}', this.value)"
                           value="${value}"
                           class="${baseClasses}"
                           placeholder="Enter contact information">
                    <button type="button"
                            onclick="window.lifeCvUIController.handleAddressSearch('${fieldId}')"
                            class="absolute right-2 top-2 p-1 text-slate-400 hover:text-indigo-600"
                            title="Search address">
                        <i class="fas fa-map-marker-alt"></i>
                    </button>
                </div>`;
    } else if (field.id === 'coordinates') {
        return `<input type="text"
                       id="${fieldId}"
                       value="${value}"
                       class="${baseClasses} bg-slate-50"
                       readonly
                       placeholder="GPS coordinates will be filled automatically">`;
    } else {
        // Regular field rendering
        const options = field.options || [];
        if (field.type === 'select') {
            return `<select id="${fieldId}" onchange="window.lifeCvUIController.updateFieldValue('${fieldPath}', this.value)" class="${baseClasses}">
                        <option value="">Select ${field.label.toLowerCase()}</option>
                        ${options.map(opt => `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                    </select>`;
        } else if (field.type === 'checkbox') {
            return `<label class="flex items-center">
                        <input type="checkbox"
                               id="${fieldId}"
                               onchange="window.lifeCvUIController.updateFieldValue('${fieldPath}', this.checked)"
                               ${value === 'true' || value === true ? 'checked' : ''}
                               class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                        <span class="ml-2 text-sm text-slate-600">${field.label}</span>
                    </label>`;
        } else if (field.type === 'textarea') {
            return `<textarea
                        id="${fieldId}"
                        onchange="window.lifeCvUIController.updateFieldValue('${fieldPath}', this.value)"
                        class="${baseClasses} resize-none"
                        rows="3"
                        placeholder="${field.placeholder || ''}">${value}</textarea>`;
        } else {
            return `<input type="${field.type || 'text'}"
                           id="${fieldId}"
                           onchange="window.lifeCvUIController.updateFieldValue('${fieldPath}', this.value)"
                           value="${value}"
                           class="${baseClasses}"
                           placeholder="${field.placeholder || ''}">`;
        }
    }
}

/**
 * Calculate section completion percentage
 */
function calculateSectionCompletion(data, config) {
    if (!data || !config || !config.fields) return 0;
    
    if (config.isArray) {
        if (!Array.isArray(data) || data.length === 0) return 0;
        
        const totalFields = config.fields.length * data.length;
        let filledFields = 0;
        
        data.forEach(item => {
            if (!item || typeof item !== 'object') return;
            
            config.fields.forEach(field => {
                if (!field || !field.id) return;
                
                const fieldData = item[field.id];
                if (fieldData && typeof fieldData === 'object' && fieldData.value) {
                    const value = fieldData.value.toString().trim();
                    if (value !== '') {
                        filledFields++;
                    }
                } else if (fieldData && typeof fieldData === 'string' && fieldData.trim() !== '') {
                    // Handle legacy data format
                    filledFields++;
                }
            });
        });
        
        return Math.round((filledFields / totalFields) * 100);
    } else {
        const totalFields = config.fields.length;
        let filledFields = 0;
        
        config.fields.forEach(field => {
            if (!field || !field.id) return;
            
            const fieldData = data[field.id];
            if (fieldData && typeof fieldData === 'object' && fieldData.value) {
                const value = fieldData.value.toString().trim();
                if (value !== '') {
                    filledFields++;
                }
            } else if (fieldData && typeof fieldData === 'string' && fieldData.trim() !== '') {
                // Handle legacy data format
                filledFields++;
            }
        });
        
        return Math.round((filledFields / totalFields) * 100);
    }
}

/**
 * Update field value
 */
export function updateFieldValue(path, value) {
    updateField(path, value);
    showNotification('Field updated successfully', 'success');
}

/**
 * Toggle section visibility
 */
export function toggleSection(sectionKey) {
    const content = document.getElementById(`content-${sectionKey}`);
    const icon = document.getElementById(`toggle-icon-${sectionKey}`);
    
    if (content && icon) {
        if (content.classList.contains('hidden')) {
            content.classList.remove('hidden');
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-down');
        } else {
            content.classList.add('hidden');
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-right');
        }
    }
}

/**
 * Add new item to array section
 */
export function addNewItem(sectionKey) {
    const config = sectionsConfig[sectionKey];
    if (!config || !config.isArray) return;
    
    // Create empty item with default structure
    const newItem = {};
    config.fields.forEach(field => {
        newItem[field.id] = '';
    });
    
    // Open edit modal for new item
    currentEditingItem = { sectionKey, index: -1, isNew: true };
    showEditModal(sectionKey, newItem, config, true);
}

/**
 * Edit existing array item
 */
export function editArrayItem(sectionKey, index) {
    const config = sectionsConfig[sectionKey];
    const item = currentData[sectionKey][index];
    
    if (!item || !config) return;
    
    currentEditingItem = { sectionKey, index, isNew: false };
    showEditModal(sectionKey, item, config, false);
}

/**
 * Delete array item
 */
export function deleteArrayItem(sectionKey, index) {
    if (confirm('Are you sure you want to delete this item?')) {
        removeArrayItem(sectionKey, index);
        showNotification('Item deleted successfully', 'success');
    }
}

/**
 * Show edit modal for array items
 */
function showEditModal(sectionKey, item, config, isNew) {
    const modal = document.getElementById('item-edit-modal');
    const title = document.getElementById('item-modal-title');
    const description = document.getElementById('item-modal-description');
    const form = document.getElementById('item-edit-form');
    const deleteBtn = document.getElementById('item-delete');
    
    if (!modal || !title || !form) return;
    
    // Set modal title and description
    title.textContent = isNew ? `Add ${config.title.replace(/s$/, '')}` : `Edit ${config.title.replace(/s$/, '')}`;
    description.textContent = isNew ? `Add a new ${config.title.toLowerCase().replace(/s$/, '')}` : `Edit this ${config.title.toLowerCase().replace(/s$/, '')}`;
    
    // Show/hide delete button
    if (deleteBtn) {
        deleteBtn.style.display = isNew ? 'none' : 'block';
    }
    
    // Build form
    form.innerHTML = '';
    config.fields.forEach(field => {
        const value = item[field.id]?.value || '';
        
        const fieldDiv = document.createElement('div');
        fieldDiv.innerHTML = `
            <label class="block text-sm font-medium text-slate-700 mb-1">
                ${field.label}
                ${field.required ? '<span class="text-red-500">*</span>' : ''}
            </label>
            ${renderModalFormField(field, value)}
        `;
        form.appendChild(fieldDiv);
    });
    
    showModal('item-edit-modal');
}

/**
 * Render form field for modal
 */
function renderModalFormField(field, value) {
    const baseClasses = 'w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500';
    
    switch (field.type) {
        case 'textarea':
            return `<textarea 
                        id="modal-${field.id}"
                        class="${baseClasses} resize-none"
                        rows="3"
                        placeholder="${field.placeholder || ''}">${value}</textarea>`;
        
        case 'select':
            const options = field.options || [];
            return `<select id="modal-${field.id}" class="${baseClasses}">
                        <option value="">Select ${field.label.toLowerCase()}</option>
                        ${options.map(opt => `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                    </select>`;
        
        case 'checkbox':
            return `<label class="flex items-center">
                        <input type="checkbox" 
                               id="modal-${field.id}"
                               ${value === 'true' || value === true ? 'checked' : ''}
                               class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                        <span class="ml-2 text-sm text-slate-600">${field.label}</span>
                    </label>`;
        
        default:
            return `<input type="${field.type || 'text'}" 
                           id="modal-${field.id}"
                           value="${value}"
                           class="${baseClasses}"
                           placeholder="${field.placeholder || ''}">`;
    }
}

/**
 * Show privacy settings modal
 */
export function showPrivacySettings(sectionKey) {
    const config = sectionsConfig[sectionKey];
    const data = currentData[sectionKey];
    
    if (!config) return;
    
    const modal = document.getElementById('privacy-settings-modal');
    const sectionsContainer = document.getElementById('privacy-sections');
    
    if (!modal || !sectionsContainer) return;
    
    sectionsContainer.innerHTML = `
        <div class="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 class="font-semibold text-slate-800 mb-2">${config.title} Privacy Settings</h3>
            <p class="text-sm text-slate-600 mb-4">${config.description}</p>
            
            ${config.isArray ? renderArrayPrivacySettings(sectionKey, data, config) : renderObjectPrivacySettings(sectionKey, data, config)}
        </div>
    `;
    
    showModal('privacy-settings-modal');
}

/**
 * Render privacy settings for array sections
 */
function renderArrayPrivacySettings(sectionKey, data, config) {
    if (!Array.isArray(data) || data.length === 0) {
        return '<p class="text-slate-500 text-sm">No items to configure privacy settings for.</p>';
    }
    
    let html = '<div class="space-y-4">';
    
    data.forEach((item, index) => {
        const primaryField = config.fields[0];
        const itemTitle = item[primaryField.id]?.value || `Item ${index + 1}`;
        
        html += `
            <div class="bg-white border border-slate-200 rounded-lg p-4">
                <h4 class="font-medium text-slate-800 mb-2">${itemTitle}</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    ${config.fields.map(field => {
                        const isPublic = item[field.id]?.isPublic !== false;
                        return `
                            <label class="flex items-center justify-between p-2 bg-slate-50 rounded">
                                <span class="text-sm text-slate-700">${field.label}</span>
                                <input type="checkbox" 
                                       ${isPublic ? 'checked' : ''}
                                       onchange="window.lifeCvUIController.updateItemPrivacy('${sectionKey}', ${index}, '${field.id}', this.checked)"
                                       class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

/**
 * Render privacy settings for object sections
 */
function renderObjectPrivacySettings(sectionKey, data, config) {
    let html = '<div class="grid grid-cols-1 md:grid-cols-2 gap-3">';
    
    config.fields.forEach(field => {
        const isPublic = data[field.id]?.isPublic !== false;
        html += `
            <label class="flex items-center justify-between p-3 bg-white border border-slate-200 rounded">
                <span class="text-sm text-slate-700">${field.label}</span>
                <input type="checkbox" 
                       ${isPublic ? 'checked' : ''}
                       onchange="window.lifeCvUIController.updateFieldPrivacy('${sectionKey}', '${field.id}', this.checked)"
                       class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
            </label>
        `;
    });
    
    html += '</div>';
    return html;
}

/**
 * Update field privacy setting
 */
export function updateFieldPrivacy(sectionKey, fieldId, isPublic) {
    updatePrivacySetting(`${sectionKey}.${fieldId}`, isPublic);
    showNotification('Privacy setting updated', 'success');
}

/**
 * Update item privacy setting
 */
export function updateItemPrivacy(sectionKey, index, fieldId, isPublic) {
    updatePrivacySetting(`${sectionKey}.${index}.${fieldId}`, isPublic);
    showNotification('Privacy setting updated', 'success');
}

/**
 * Update completion stats in dashboard
 */
function updateCompletionStats() {
    const dashboardPlaceholder = document.getElementById('lifecv-dashboard-placeholder');
    if (!dashboardPlaceholder) return;
    
    // Calculate overall completion
    const sectionKeys = Object.keys(sectionsConfig);
    let totalCompletion = 0;
    let completedSections = 0;
    
    sectionKeys.forEach(sectionKey => {
        const config = sectionsConfig[sectionKey];
        const data = currentData[sectionKey];
        const completion = calculateSectionCompletion(data, config);
        
        totalCompletion += completion;
        if (completion > 50) completedSections++;
    });
    
    const averageCompletion = Math.round(totalCompletion / sectionKeys.length);
    
    dashboardPlaceholder.innerHTML = `
        <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 mb-8 text-white">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-bold mb-2">LifeCV Dashboard</h2>
                    <p class="text-indigo-100">Your comprehensive life profile</p>
                </div>
                <div class="text-right">
                    <div class="text-3xl font-bold mb-1">${averageCompletion}%</div>
                    <div class="text-indigo-100 text-sm">Complete</div>
                </div>
            </div>
            
            <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white bg-opacity-20 rounded-lg p-4">
                    <div class="text-2xl font-bold">${completedSections}</div>
                    <div class="text-sm text-indigo-100">Sections Active</div>
                </div>
                <div class="bg-white bg-opacity-20 rounded-lg p-4">
                    <div class="text-2xl font-bold">${sectionKeys.length}</div>
                    <div class="text-sm text-indigo-100">Total Sections</div>
                </div>
                <div class="bg-white bg-opacity-20 rounded-lg p-4">
                    <div class="text-2xl font-bold">${getTotalItems()}</div>
                    <div class="text-sm text-indigo-100">Total Items</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Get total number of items across all sections
 */
function getTotalItems() {
    let total = 0;
    Object.keys(currentData).forEach(sectionKey => {
        const section = currentData[sectionKey];
        if (Array.isArray(section)) {
            total += section.length;
        } else if (typeof section === 'object' && section !== null) {
            total += Object.keys(section).length;
        }
    });
    return total;
}

/**
 * Handle address search with Google Maps
 */
export function handleAddressSearch(fieldId) {
    const inputElement = document.getElementById(fieldId);
    if (!inputElement) return;
    
    // Check if this is an address field
    const parentRow = inputElement.closest('.form-group');
    const typeSelect = parentRow?.parentElement?.querySelector('select[id*="type"]');
    
    if (typeSelect && typeSelect.value === 'Address') {
        // Initialize address autocomplete
        createAddressAutocomplete(inputElement, {
            country: 'za' // South Africa
        });
        
        // Listen for address selection
        inputElement.addEventListener('addressSelected', (event) => {
            const placeData = event.detail;
            
            // Update the main address field
            inputElement.value = placeData.formattedAddress;
            inputElement.dispatchEvent(new Event('change'));
            
            // Update coordinates field if it exists
            const coordinatesField = parentRow?.parentElement?.querySelector('input[id*="coordinates"]');
            if (coordinatesField) {
                const coordsString = `${placeData.coordinates.lat}, ${placeData.coordinates.lng}`;
                coordinatesField.value = coordsString;
                coordinatesField.dispatchEvent(new Event('change'));
            }
            
            showNotification('Address selected and coordinates saved', 'success');
        });
        
        // Add current location button
        if (!parentRow.querySelector('.location-btn')) {
            const locationBtn = document.createElement('button');
            locationBtn.type = 'button';
            locationBtn.className = 'location-btn ml-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600';
            locationBtn.innerHTML = '<i class="fas fa-location-arrow mr-1"></i>Current Location';
            locationBtn.onclick = () => getCurrentLocationAddress(fieldId);
            
            inputElement.parentElement.appendChild(locationBtn);
        }
    }
}

/**
 * Get current location and reverse geocode to address
 */
async function getCurrentLocationAddress(fieldId) {
    const inputElement = document.getElementById(fieldId);
    if (!inputElement) return;
    
    try {
        showNotification('Getting your current location...', 'info');
        
        const location = await getCurrentLocation();
        const { reverseGeocode } = await import('../utils/google-maps.js');
        const addressData = await reverseGeocode(location.lat, location.lng);
        
        // Update the address field
        inputElement.value = addressData.formattedAddress;
        inputElement.dispatchEvent(new Event('change'));
        
        // Update coordinates field if it exists
        const parentRow = inputElement.closest('.form-group');
        const coordinatesField = parentRow?.parentElement?.querySelector('input[id*="coordinates"]');
        if (coordinatesField) {
            const coordsString = `${location.lat}, ${location.lng}`;
            coordinatesField.value = coordsString;
            coordinatesField.dispatchEvent(new Event('change'));
        }
        
        showNotification('Current location address added', 'success');
    } catch (error) {
        console.error('Error getting current location:', error);
        showNotification('Could not get current location: ' + error.message, 'error');
    }
}

/**
 * Render profile pictures field with camera and upload functionality
 */
function renderProfilePicturesField(field, value, sectionKey) {
    const pictures = Array.isArray(value) ? value : [];
    
    return `
        <div class="space-y-4">
            <label class="block text-sm font-medium text-slate-700">${field.label}</label>
            
            <!-- Current Pictures -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4" id="current-pictures-${field.id}">
                ${pictures.map((pic, index) => `
                    <div class="relative group">
                        <img src="${pic.url}" alt="Profile Picture" class="w-full h-32 object-cover rounded-lg border-2 border-slate-200">
                        <button type="button"
                                class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                onclick="window.lifeCvUIController.removeProfilePicture('${sectionKey}', '${field.id}', ${index})">
                            <i class="fas fa-times text-xs"></i>
                        </button>
                        ${pic.isPrimary ? '<div class="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">Primary</div>' : ''}
                        <button type="button"
                                class="absolute bottom-2 right-2 bg-gray-800 bg-opacity-75 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                onclick="window.lifeCvUIController.setPrimaryPicture('${sectionKey}', '${field.id}', ${index})">
                            Set Primary
                        </button>
                    </div>
                `).join('')}
            </div>
            
            <!-- Add Picture Options -->
            <div class="flex flex-wrap gap-2">
                <button type="button"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        onclick="window.lifeCvUIController.openFileUpload('${sectionKey}', '${field.id}')">
                    <i class="fas fa-upload mr-2"></i>Upload Photo
                </button>
                ${CameraService.isCameraSupported() ? `
                    <button type="button"
                            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            onclick="window.lifeCvUIController.openCamera('${sectionKey}', '${field.id}')">
                        <i class="fas fa-camera mr-2"></i>Take Photo
                    </button>
                ` : ''}
            </div>
            
            <!-- Hidden file input -->
            <input type="file"
                   id="file-input-${field.id}"
                   accept="image/*"
                   multiple
                   class="hidden"
                   onchange="window.lifeCvUIController.handleFileUpload(event, '${sectionKey}', '${field.id}')">
        </div>
    `;
}

/**
 * Profile Picture Methods
 */
export function openFileUpload(sectionKey, fieldKey) {
    const fileInput = document.getElementById(`file-input-${fieldKey}`);
    if (fileInput) {
        fileInput.click();
    }
}

export async function handleFileUpload(event, sectionKey, fieldKey) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    try {
        showLoadingMessage('Processing images...');
        
        for (const file of files) {
            const processedImage = await CameraService.processUploadedFile(file);
            const circularCrop = await CameraService.createCircularCrop(processedImage.dataUrl);
            
            // Upload to Firebase
            const uploadResult = await CameraService.uploadToFirebase(
                circularCrop.blob,
                getCurrentUserId(),
                `profile-${Date.now()}.jpg`
            );

            // Add to current data
            await addProfilePicture(sectionKey, fieldKey, {
                url: uploadResult.url,
                path: uploadResult.path,
                isPrimary: false,
                uploadedAt: new Date(),
                size: uploadResult.size
            });
        }

        hideLoadingMessage();
        showNotification('Images uploaded successfully!', 'success');
        
        // Clear file input
        event.target.value = '';
        
    } catch (error) {
        console.error('Error uploading files:', error);
        hideLoadingMessage();
        showNotification(error.message || 'Failed to upload images', 'error');
    }
}

export function openCamera(sectionKey, fieldKey) {
    showCameraModal(sectionKey, fieldKey);
}

function showCameraModal(sectionKey, fieldKey) {
    // Create camera modal
    const modal = document.createElement('div');
    modal.id = 'camera-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">Take Photo</h3>
                <button id="close-camera" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="space-y-4">
                <video id="camera-video" class="w-full rounded-lg bg-black" autoplay playsinline></video>
                
                <div class="flex justify-center space-x-4">
                    <button id="capture-photo" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <i class="fas fa-camera mr-2"></i>Capture
                    </button>
                    <button id="cancel-camera" class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Setup camera
    initializeCameraModal(sectionKey, fieldKey);
}

async function initializeCameraModal(sectionKey, fieldKey) {
    const video = document.getElementById('camera-video');
    const captureBtn = document.getElementById('capture-photo');
    const closeBtn = document.getElementById('close-camera');
    const cancelBtn = document.getElementById('cancel-camera');

    try {
        await cameraService.initializeCamera(video);
        activeCamera = cameraService;

        captureBtn.addEventListener('click', async () => {
            try {
                showLoadingMessage('Processing photo...');
                
                const photo = await cameraService.capturePhoto();
                const circularCrop = await CameraService.createCircularCrop(photo.dataUrl);
                
                // Upload to Firebase
                const uploadResult = await CameraService.uploadToFirebase(
                    circularCrop.blob,
                    getCurrentUserId(),
                    `profile-${Date.now()}.jpg`
                );

                // Add to current data
                await addProfilePicture(sectionKey, fieldKey, {
                    url: uploadResult.url,
                    path: uploadResult.path,
                    isPrimary: false,
                    uploadedAt: new Date(),
                    size: uploadResult.size
                });

                closeCameraModal();
                hideLoadingMessage();
                showNotification('Photo captured successfully!', 'success');
                
            } catch (error) {
                console.error('Error capturing photo:', error);
                hideLoadingMessage();
                showNotification(error.message || 'Failed to capture photo', 'error');
            }
        });

    } catch (error) {
        console.error('Error initializing camera:', error);
        showNotification(error.message || 'Failed to access camera', 'error');
        closeCameraModal();
    }

    // Close handlers
    closeBtn.addEventListener('click', () => closeCameraModal());
    cancelBtn.addEventListener('click', () => closeCameraModal());
}

function closeCameraModal() {
    if (activeCamera) {
        activeCamera.stopCamera();
        activeCamera = null;
    }

    const modal = document.getElementById('camera-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

async function addProfilePicture(sectionKey, fieldKey, pictureData) {
    if (!currentData[sectionKey]) {
        currentData[sectionKey] = {};
    }
    
    if (!currentData[sectionKey][fieldKey]) {
        currentData[sectionKey][fieldKey] = [];
    }

    // If this is the first picture, make it primary
    if (currentData[sectionKey][fieldKey].length === 0) {
        pictureData.isPrimary = true;
    }

    currentData[sectionKey][fieldKey].push(pictureData);
    
    // Save and re-render
    await updateField(`${sectionKey}.${fieldKey}`, currentData[sectionKey][fieldKey]);
    renderAllSections();
}

export async function removeProfilePicture(sectionKey, fieldKey, index) {
    if (!confirm('Are you sure you want to remove this picture?')) {
        return;
    }

    try {
        const pictures = currentData[sectionKey]?.[fieldKey] || [];
        const picture = pictures[index];
        
        if (picture && picture.path) {
            // Delete from Firebase Storage
            await CameraService.deleteFromFirebase(picture.path);
        }

        // Remove from array
        pictures.splice(index, 1);

        // If removed picture was primary, make first remaining picture primary
        if (picture?.isPrimary && pictures.length > 0) {
            pictures[0].isPrimary = true;
        }

        // Save and re-render
        await updateField(`${sectionKey}.${fieldKey}`, pictures);
        renderAllSections();
        showNotification('Picture removed successfully!', 'success');
        
    } catch (error) {
        console.error('Error removing picture:', error);
        showNotification('Failed to remove picture', 'error');
    }
}

export async function setPrimaryPicture(sectionKey, fieldKey, index) {
    const pictures = currentData[sectionKey]?.[fieldKey] || [];
    
    // Remove primary flag from all pictures
    pictures.forEach(pic => pic.isPrimary = false);
    
    // Set selected picture as primary
    if (pictures[index]) {
        pictures[index].isPrimary = true;
    }

    // Save and re-render
    await updateField(`${sectionKey}.${fieldKey}`, pictures);
    renderAllSections();
    showNotification('Primary picture updated!', 'success');
}

// Helper functions
function getCurrentUserId() {
    // This should get the current user ID from your auth system
    // For now, return a placeholder - you'll need to implement this based on your auth setup
    return 'current-user-id';
}

function showLoadingMessage(message) {
    hideAllMessages();
    const loading = document.createElement('div');
    loading.id = 'loading-message';
    loading.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    loading.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>${message}`;
    document.body.appendChild(loading);
}

function hideLoadingMessage() {
    const loading = document.getElementById('loading-message');
    if (loading) loading.remove();
}

function hideAllMessages() {
    const messages = document.querySelectorAll('#loading-message, .fixed.top-4.right-4');
    messages.forEach(msg => msg.remove());
}

// Make functions globally available
window.lifeCvUIController = {
    updateUI,
    updateFieldValue,
    toggleSection,
    addNewItem,
    editArrayItem,
    deleteArrayItem,
    showPrivacySettings,
    updateFieldPrivacy,
    updateItemPrivacy,
    handleAddressSearch,
    openFileUpload,
    handleFileUpload,
    openCamera,
    removeProfilePicture,
    setPrimaryPicture
};

export {
    calculateSectionCompletion,
    renderFormField,
    showEditModal
};