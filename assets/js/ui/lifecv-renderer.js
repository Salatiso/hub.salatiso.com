/* ================================================================================= */
/* FILE: assets/js/ui/lifecv-renderer.js                                             */
/* PURPOSE: Renders LifeCV sections and handles UI interactions                     */
/* ================================================================================= */

import { updateField, getLifeCvData } from '../services/life-cv-data-service.js';
import { showNotification } from '../utils/notifications.js';

/**
 * Render all LifeCV sections
 */
export function renderAllSections(data, sectionsConfig) {
    const container = document.getElementById('lifecv-sections');
    if (!container) {
        console.error('LifeCV sections container not found');
        return;
    }

    let html = '';
    
    for (const [sectionKey, sectionConfig] of Object.entries(sectionsConfig)) {
        html += renderSection(sectionKey, sectionConfig, data[sectionKey]);
    }
    
    const fragment = document.createDocumentFragment();
    const tempDiv = document.createElement('div');
    tempDiv.textContent = html; // Sanitize HTML content here
    while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
    }
    container.replaceChildren(fragment);
    
    // Attach event listeners
    attachEventListeners();
}

/**
 * Render individual section
 */
function renderSection(sectionKey, sectionConfig, sectionData) {
    const isArray = sectionConfig.isArray;
    
    return `
        <div class="lifecv-section bg-white rounded-lg shadow-sm border border-slate-200 mb-4" data-section="${sectionKey}">
            <div class="section-header p-4 border-b border-slate-200 cursor-pointer accordion-toggle" 
                 onclick="toggleSection('${sectionKey}')">
                <div class="flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-slate-800 flex items-center">
                        <i class="section-icon ${getSectionIcon(sectionKey)} mr-3 text-indigo-600"></i>
                        ${sectionConfig.title}
                    </h3>
                    <div class="flex items-center space-x-2">
                        ${isArray ? `
                            <button onclick="event.stopPropagation(); addItem('${sectionKey}')" 
                                    class="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors">
                                <i class="fas fa-plus mr-1"></i>Add
                            </button>
                        ` : ''}
                        <i class="chevron-icon fas fa-chevron-down text-slate-400 transition-transform"></i>
                    </div>
                </div>
            </div>
            <div class="accordion-content" id="content-${sectionKey}">
                <div class="p-4">
                    ${isArray ? renderArraySection(sectionKey, sectionConfig, sectionData) : renderObjectSection(sectionKey, sectionConfig, sectionData)}
                </div>
            </div>
        </div>
    `;
}

/**
 * Render array-type section (education, experience, etc.)
 */
function renderArraySection(sectionKey, sectionConfig, sectionData = []) {
    if (!Array.isArray(sectionData) || sectionData.length === 0) {
        return `
            <div class="text-center py-8 text-slate-500">
                <i class="fas fa-plus-circle text-3xl mb-3"></i>
                <p>No ${sectionConfig.title.toLowerCase()} added yet.</p>
                <button onclick="addItem('${sectionKey}')" 
                        class="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                    Add ${sectionConfig.title.slice(0, -1)}
                </button>
            </div>
        `;
    }
    
    return sectionData.map((item, index) => `
        <div class="border border-slate-200 rounded-lg p-4 mb-3 last:mb-0">
            <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                    ${renderItemSummary(sectionConfig, item)}
                </div>
                <div class="flex space-x-2 ml-4">
                    <button onclick="editItem('${sectionKey}', ${index})" 
                            class="text-indigo-600 hover:text-indigo-800 transition-colors">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteItem('${sectionKey}', ${index})" 
                            class="text-red-600 hover:text-red-800 transition-colors">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            ${renderItemDetails(sectionConfig, item)}
        </div>
    `).join('');
}

/**
 * Render object-type section (personal info)
 */
function renderObjectSection(sectionKey, sectionConfig, sectionData = {}) {
    return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${sectionConfig.fields.map(field => `
                <div class="field-container">
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                        ${field.label}
                        ${field.required ? '<span class="text-red-500">*</span>' : ''}
                    </label>
                    ${renderField(sectionKey, field, sectionData[field.id])}
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Render individual field
 */
function renderField(sectionKey, field, fieldData = {}) {
    const value = fieldData.value || '';
    const fieldId = `${sectionKey}_${field.id}`;
    
    switch (field.type) {
        case 'textarea':
            return `
                <textarea id="${fieldId}" name="${field.id}"
                         class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                         rows="3" 
                         onchange="updateFieldValue('${sectionKey}.${field.id}.value', this.value)">${value}</textarea>
            `;
        case 'select':
            return `
                <select id="${fieldId}" name="${field.id}"
                        class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        onchange="updateFieldValue('${sectionKey}.${field.id}.value', this.value)">
                    <option value="">Select ${field.label}</option>
                    ${field.options?.map(option => `
                        <option value="${option}" ${value === option ? 'selected' : ''}>${option}</option>
                    `).join('') || ''}
                </select>
            `;
        case 'file':
            return `
                <div class="flex items-center space-x-2">
                    <input type="file" id="${fieldId}" name="${field.id}"
                           class="hidden" 
                           accept="image/*"
                           onchange="handleFileUpload('${sectionKey}', '${field.id}', this)">
                    <button onclick="document.getElementById('${fieldId}').click()" 
                            class="px-3 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors">
                        Choose File
                    </button>
                    ${value ? `<span class="text-sm text-slate-600">File uploaded</span>` : ''}
                </div>
            `;
        default:
            return `
                <input type="${field.type || 'text'}" 
                       id="${fieldId}" name="${field.id}"
                       value="${value}" 
                       class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                       onchange="updateFieldValue('${sectionKey}.${field.id}.value', this.value)">
            `;
    }
}

/**
 * Render item summary for array sections
 */
function renderItemSummary(sectionConfig, item) {
    const primaryField = sectionConfig.fields[0];
    const secondaryField = sectionConfig.fields[1];
    
    const primaryValue = item[primaryField.id]?.value || 'Untitled';
    const secondaryValue = secondaryField ? (item[secondaryField.id]?.value || '') : '';
    
    return `
        <h4 class="font-medium text-slate-800">${primaryValue}</h4>
        ${secondaryValue ? `<p class="text-sm text-slate-600">${secondaryValue}</p>` : ''}
    `;
}

/**
 * Render item details
 */
function renderItemDetails(sectionConfig, item) {
    const details = sectionConfig.fields.slice(2).map(field => {
        const value = item[field.id]?.value;
        if (!value) return '';
        
        return `<span class="text-sm text-slate-600"><strong>${field.label}:</strong> ${value}</span>`;
    }).filter(Boolean);
    
    return details.length > 0 ? `<div class="space-y-1">${details.join('<br>')}</div>` : '';
}

/**
 * Get section icon
 */
function getSectionIcon(sectionKey) {
    const icons = {
        personalInfo: 'fas fa-user',
        education: 'fas fa-graduation-cap',
        experience: 'fas fa-briefcase',
        skills: 'fas fa-tools',
        certifications: 'fas fa-certificate',
        projects: 'fas fa-project-diagram',
        languages: 'fas fa-language',
        interests: 'fas fa-heart'
    };
    return icons[sectionKey] || 'fas fa-circle';
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
    // Toggle section visibility
    window.toggleSection = function(sectionKey) {
        const content = document.getElementById(`content-${sectionKey}`);
        const chevron = content.previousElementSibling.querySelector('.chevron-icon');
        
        // Toggle the show class and chevron rotation
        if (content.style.display === 'none' || content.style.display === '') {
            content.style.display = 'block';
            content.classList.add('show');
            chevron.classList.add('rotate-180');
        } else {
            content.style.display = 'none';
            content.classList.remove('show');
            chevron.classList.remove('rotate-180');
        }
    };
    
    // Update field value
    window.updateFieldValue = function(path, value) {
        updateField(path, value);
    };
    
    // Handle file upload
    window.handleFileUpload = async function(sectionKey, fieldId, input) {
        if (input.files && input.files[0]) {
            const file = input.files[0];
            try {
                // Here you would upload to Firebase Storage
                // For now, we'll just store the file name
                updateField(`${sectionKey}.${fieldId}.value`, file.name);
                showNotification('File uploaded successfully', 'success');
            } catch (error) {
                console.error('Error uploading file:', error);
                showNotification('Error uploading file', 'error');
            }
        }
    };
    
    // Add item to array section
    window.addItem = function(sectionKey) {
        const event = new CustomEvent('openItemModal', { 
            detail: { sectionKey, index: -1 } 
        });
        document.dispatchEvent(event);
    };
    
    // Edit item in array section
    window.editItem = function(sectionKey, index) {
        const event = new CustomEvent('openItemModal', { 
            detail: { sectionKey, index } 
        });
        document.dispatchEvent(event);
    };
    
    // Delete item from array section
    window.deleteItem = function(sectionKey, index) {
        if (confirm('Are you sure you want to delete this item?')) {
            const data = getLifeCvData();
            const currentArray = data[sectionKey] || [];
            currentArray.splice(index, 1);
            updateField(sectionKey, currentArray);
            showNotification('Item deleted successfully', 'success');
        }
    };
}