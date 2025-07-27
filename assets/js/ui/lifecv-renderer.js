/* ================================================================================= */
/* FILE: assets/js/ui/lifecv-renderer.js                                             */
/* PURPOSE: Handles all HTML generation for the LifeCV sections. It takes data       */
/* and configuration, and returns rendered HTML strings.                             */
/* ================================================================================= */

let renderDebounceTimer;

/**
 * Renders all sections and injects them into the DOM.
 * @param {object} data - The user's complete LifeCV data.
 * @param {object} sectionsConfig - The configuration object for all sections.
 */
export function renderAllSections(data, sectionsConfig) {
    // Debounce rapid re-renders
    clearTimeout(renderDebounceTimer);
    renderDebounceTimer = setTimeout(() => {
        performRender(data, sectionsConfig);
    }, 100);
}

function performRender(data, sectionsConfig) {
    const container = document.getElementById('lifecv-sections');
    if (!container) {
        console.error('Container #lifecv-sections not found');
        return;
    }
    
    // Store scroll position
    const scrollPosition = window.scrollY;
    
    container.innerHTML = Object.entries(sectionsConfig).map(([key, section]) => {
        return generateSectionHTML(key, section, data);
    }).join('');

    // Restore scroll position
    window.scrollTo(0, scrollPosition);

    // Reattach event listeners after rendering
    attachSectionEventListeners();
}

/**
 * Generates the HTML for a single accordion section.
 * @param {string} key - The key for the section (e.g., 'personal').
 * @param {object} section - The section definition object.
 * @param {object} allData - The user's complete LifeCV data.
 * @returns {string} The HTML string for the section.
 */
function generateSectionHTML(key, section, allData) {
    const sectionData = allData[key] || {};
    let contentHTML = '';

    if (key === 'profilePictures') {
        contentHTML = generateProfilePicturesHTML(sectionData);
    } else if (section.isList) {
        contentHTML = generateListSectionHTML(key, section, sectionData);
    } else {
        contentHTML = section.fields.map(field => {
            const fieldDataPath = `${key}.${field.id}`;
            let fieldData = allData[key]?.[field.id] || {};
            
            if (typeof fieldData !== 'object' || fieldData === null) {
                fieldData = { value: fieldData || '', isPublic: !field.sensitive, lastModified: '' };
            }
            
            return generateFieldHTML(field, fieldData, fieldDataPath);
        }).join('');
    }

    return `
        <div class="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <button class="accordion-toggle w-full flex justify-between items-center p-5 text-left hover:bg-slate-50 transition-colors">
                <h2 class="text-xl font-bold text-slate-800 flex items-center">
                    <i class="fas ${section.icon} mr-4 text-indigo-500"></i>
                    ${section.title}
                </h2>
                <i class="fas fa-chevron-down transition-transform"></i>
            </button>
            <div class="accordion-content">
                <div class="p-5 border-t border-slate-200">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        ${contentHTML}
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Generates HTML for list-based sections (career, education, etc.)
 */
function generateListSectionHTML(key, section, sectionData) {
    const items = Array.isArray(sectionData) ? sectionData : [];
    
    return `
        <div class="col-span-full">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-slate-800">Your ${section.title}</h3>
                <button class="add-item-btn bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                        data-section="${key}">
                    <i class="fas fa-plus mr-2"></i>Add ${section.title.replace(/s$/, '')}
                </button>
            </div>
            
            <div class="space-y-4">
                ${items.length > 0 ? items.map((item, index) => generateListItemHTML(key, section, item, index)).join('') : 
                  `<div class="text-center py-8 text-slate-500">
                     <i class="fas ${section.icon} text-3xl mb-3"></i>
                     <p>No ${section.title.toLowerCase()} added yet.</p>
                     <p class="text-sm">Click "Add ${section.title.replace(/s$/, '')}" to get started.</p>
                   </div>`}
            </div>
        </div>
    `;
}

/**
 * Generates HTML for individual list items
 */
function generateListItemHTML(sectionKey, section, item, index) {
    const primaryField = section.fields[0];
    const title = item[primaryField.id]?.value || `${section.title.slice(0, -1)} ${index + 1}`;
    
    return `
        <div class="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
            <div class="flex items-center justify-between mb-2">
                <h4 class="font-medium text-slate-800">${title}</h4>
                <div class="flex items-center space-x-2">
                    <button class="edit-item-btn text-indigo-600 hover:text-indigo-800 p-1"
                            data-section="${sectionKey}" data-index="${index}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-item-btn text-red-600 hover:text-red-800 p-1"
                            data-section="${sectionKey}" data-index="${index}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="text-sm text-slate-600">
                ${section.fields.slice(1, 3).map(field => {
                    const fieldValue = item[field.id]?.value;
                    return fieldValue ? `<p><span class="font-medium">${field.label}:</span> ${fieldValue}</p>` : '';
                }).filter(Boolean).join('')}
            </div>
        </div>
    `;
}

/**
 * Generates HTML for a single input field with a privacy toggle.
 * @param {object} field - The field definition from the config.
 * @param {object} fieldData - The data for the field {value, isPublic}.
 * @param {string} path - The data path for the field (e.g., 'personal.fullName').
 * @returns {string} The HTML string for the field.
 */
function generateFieldHTML(field, fieldData, path) {
    const valuePath = `${path}.value`;
    const privacyPath = `${path}.isPublic`;
    
    const inputHtml = field.type === 'textarea' ? 
        `<textarea id="${field.id}" data-path="${valuePath}" rows="3"
                   class="input w-full px-3 py-2 pr-10 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                   placeholder="${field.placeholder || ''}">${fieldData.value || ''}</textarea>` :
        field.type === 'select' ?
        `<select id="${field.id}" data-path="${valuePath}"
                 class="input w-full px-3 py-2 pr-10 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            <option value="">Select ${field.label}</option>
            ${field.options.map(option => `<option value="${option}" ${fieldData.value === option ? 'selected' : ''}>${option}</option>`).join('')}
         </select>` :
        `<input type="${field.type}" id="${field.id}" data-path="${valuePath}"
                class="input w-full px-3 py-2 pr-10 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value="${fieldData.value || ''}" placeholder="${field.placeholder || ''}">`;
    
    return `
        <div class="col-span-1">
            <label for="${field.id}" class="block text-sm font-medium text-slate-700 mb-1">${field.label}</label>
            <div class="relative">
                ${inputHtml}
                ${field.sensitive ? `
                    <button class="privacy-toggle absolute inset-y-0 right-0 flex items-center pr-3 ${fieldData.isPublic ? 'public' : ''}"
                            data-path="${privacyPath}" data-sensitive="true"
                            title="${fieldData.isPublic ? 'Click to make private' : 'Click to make public'}">
                        <i class="fas ${fieldData.isPublic ? 'fa-lock-open' : 'fa-lock'}"></i>
                    </button>
                ` : ''}
            </div>
            ${field.sensitive && fieldData.isPublic ? `
                <p class="text-xs text-amber-600 mt-1">
                    <i class="fas fa-exclamation-triangle mr-1"></i>
                    This sensitive information is currently public
                </p>
            ` : ''}
        </div>
    `;
}

/**
 * Generates the HTML for the profile pictures section.
 * @param {object} data - The data for the profilePictures section.
 * @returns {string} The HTML string.
 */
function generateProfilePicturesHTML(data) {
    const pictures = data?.pictures || [];
    const primaryPicture = pictures.find(p => p.isPrimary);
    const primaryPicUrl = primaryPicture?.url || 'https://placehold.co/150x150/E0E7FF/4F46E5?text=You';

    return `
        <div class="col-span-full">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-1 flex flex-col items-center">
                    <img src="${primaryPicUrl}" alt="Primary Profile Picture" 
                         class="w-40 h-40 rounded-full object-cover mb-4 shadow-lg border-4 border-indigo-200">
                    <div class="flex space-x-2">
                         <label for="upload-pic" class="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors">
                            <i class="fas fa-upload mr-2"></i>Upload
                         </label>
                         <input type="file" id="upload-pic" class="hidden" accept="image/*">
                         <button id="open-camera-btn" class="bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors">
                            <i class="fas fa-camera mr-2"></i>Use Camera
                         </button>
                    </div>
                </div>
                <div class="md:col-span-2">
                    <h4 class="font-semibold mb-3 text-slate-800">Photo Gallery</h4>
                    <div class="profile-pic-gallery grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        ${pictures.length > 0 ? pictures.map((p, index) => `
                            <div class="relative group">
                                <img src="${p.url}" alt="Profile picture ${index + 1}" 
                                     class="w-full h-24 object-cover rounded-lg cursor-pointer border-2 ${p.isPrimary ? 'border-indigo-500' : 'border-transparent'} hover:border-indigo-300 transition-colors" 
                                     data-picture-id="${p.id}">
                                <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                                    <button class="set-primary-btn text-white text-xs bg-indigo-600 px-2 py-1 rounded" 
                                            data-picture-id="${p.id}" title="Set as Primary">
                                        <i class="fas fa-star"></i>
                                    </button>
                                    <button class="delete-picture-btn text-white text-xs bg-red-600 px-2 py-1 rounded" 
                                            data-picture-id="${p.id}" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('') : '<p class="col-span-full text-slate-500 text-center py-8">No pictures uploaded yet. Add your first profile picture above.</p>'}
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Attaches event listeners to rendered sections
 */
function attachSectionEventListeners() {
    const container = document.getElementById('lifecv-sections');
    if (!container) return;

    // Accordion toggles
    container.querySelectorAll('.accordion-toggle').forEach(button => {
        button.addEventListener('click', (e) => {
            const content = button.nextElementSibling;
            const chevron = button.querySelector('i:last-child');
            
            if (content.classList.contains('show')) {
                content.classList.remove('show');
                chevron.classList.remove('rotate-180');
            } else {
                content.classList.add('show');
                chevron.classList.add('rotate-180');
            }
        });
    });
}