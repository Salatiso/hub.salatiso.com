/* ================================================================================= */
/* FILE: assets/js/ui/lifecv-renderer.js                                             */
/* PURPOSE: Handles all HTML generation for the LifeCV sections. It takes data       */
/* and configuration, and returns rendered HTML strings.                             */
/* ================================================================================= */

/**
 * Renders all sections and injects them into the DOM.
 * @param {object} data - The user's complete LifeCV data.
 * @param {object} sectionsConfig - The configuration object for all sections.
 */
export function renderAllSections(data, sectionsConfig) {
    const container = document.getElementById('lifecv-sections');
    if (!container) return;
    
    container.innerHTML = Object.entries(sectionsConfig).map(([key, section]) => {
        return generateSectionHTML(key, section, data);
    }).join('');
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
        contentHTML = '<p class="col-span-full text-slate-500">List-based sections will be implemented in a future phase.</p>';
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
        <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <button class="accordion-toggle w-full flex justify-between items-center p-5 text-left">
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
 * Generates HTML for a single input field with a privacy toggle.
 * @param {object} field - The field definition from the config.
 * @param {object} fieldData - The data for the field {value, isPublic}.
 * @param {string} path - The data path for the field (e.g., 'personal.fullName').
 * @returns {string} The HTML string for the field.
 */
function generateFieldHTML(field, fieldData, path) {
    const valuePath = `${path}.value`;
    const privacyPath = `${path}.isPublic`;
    
    return `
        <div class="col-span-1">
            <label for="${field.id}" class="block text-sm font-medium text-slate-700 mb-1">${field.label}</label>
            <div class="relative">
                <input type="${field.type}" id="${field.id}" data-path="${valuePath}"
                       class="input w-full px-3 py-2 pr-10 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                       value="${fieldData.value || ''}" placeholder="${field.placeholder || ''}">
                <button class="privacy-toggle absolute inset-y-0 right-0 flex items-center pr-3 ${fieldData.isPublic ? 'public' : ''}"
                        data-path="${privacyPath}" data-sensitive="${field.sensitive}"
                        title="${fieldData.isPublic ? 'Click to make private' : 'Click to make public'}">
                    <i class="fas ${fieldData.isPublic ? 'fa-lock-open' : 'fa-lock'}"></i>
                </button>
            </div>
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
    const primaryPicUrl = pictures.find(p => p.isPrimary)?.url || 'https://placehold.co/150x150/E0E7FF/4F46E5?text=You';

    return `
        <div class="col-span-full">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-1 flex flex-col items-center">
                    <img src="${primaryPicUrl}" alt="Primary Profile Picture" class="w-40 h-40 rounded-full object-cover mb-4 shadow-lg">
                    <div class="flex space-x-2">
                         <label for="upload-pic" class="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 cursor-pointer">
                            <i class="fas fa-upload mr-2"></i>Upload
                         </label>
                         <input type="file" id="upload-pic" class="hidden" accept="image/*">
                         <button id="open-camera-btn" class="bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-lg hover:bg-slate-300">
                            <i class="fas fa-camera mr-2"></i>Use Camera
                         </button>
                    </div>
                </div>
                <div class="md:col-span-2">
                    <h4 class="font-semibold mb-2">Photo Gallery</h4>
                    <div class="profile-pic-gallery grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        ${pictures.map(p => `
                            <img src="${p.url}" alt="Profile picture" class="w-full h-24 object-cover rounded-lg cursor-pointer ${p.isPrimary ? 'primary' : ''}" data-path="${p.path}">
                        `).join('') || '<p class="col-span-full text-slate-500">Upload pictures to create your gallery.</p>'}
                    </div>
                </div>
            </div>
        </div>
    `;
}
