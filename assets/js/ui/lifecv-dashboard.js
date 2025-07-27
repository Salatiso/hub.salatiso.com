/* ================================================================================= */
/* FILE: assets/js/ui/lifecv-dashboard.js                                            */
/* PURPOSE: Manages the LifeCV dashboard component. It handles fetching the HTML,    */
/* calculating stats, and updating the DOM elements within the dashboard.            */
/* ================================================================================= */

import { getObjectValueByPath } from '../utils/helpers.js';

/**
 * Fetches and injects the dashboard HTML component into the main page.
 * @returns {Promise<void>}
 */
export async function init() {
    try {
        const response = await fetch('../components/lifecv-dashboard.html');
        if (!response.ok) {
            // If component file doesn't exist, create inline dashboard
            createInlineDashboard();
            return;
        }
        const html = await response.text();
        const placeholder = document.getElementById('lifecv-dashboard-placeholder');
        if (placeholder) {
            placeholder.innerHTML = html;
        }
    } catch (error) {
        console.error("Dashboard Error:", error);
        createInlineDashboard();
    }
}

/**
 * Creates an inline dashboard when external component isn't available
 */
function createInlineDashboard() {
    const placeholder = document.getElementById('lifecv-dashboard-placeholder');
    if (!placeholder) return;
    
    placeholder.innerHTML = `
        <div id="lifecv-dashboard" class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <!-- Left Column: Profile & Completeness -->
            <div class="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center text-center">
                <div class="relative">
                    <img id="dashboard-profile-pic" src="https://placehold.co/128x128/E0E7FF/4F46E5?text=You" alt="Profile Picture" class="w-32 h-32 rounded-full object-cover border-4 border-indigo-200">
                    <span id="dashboard-completeness-badge" class="absolute -bottom-2 -right-2 bg-indigo-600 text-white text-sm font-bold px-3 py-1 rounded-full border-4 border-white">
                        0%
                    </span>
                </div>
                <h2 id="dashboard-user-name" class="text-2xl font-bold text-slate-800 mt-4">Loading...</h2>
                <p id="dashboard-user-title" class="text-slate-500">Your Professional Title</p>

                <div class="w-full mt-6">
                    <h3 class="font-semibold text-slate-700 mb-2">LifeCV Completeness</h3>
                    <div class="w-full bg-slate-200 rounded-full h-2.5">
                        <div id="dashboard-progress-bar" class="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style="width: 0%"></div>
                    </div>
                    <p class="text-xs text-slate-500 mt-1">Complete more sections to improve your score.</p>
                </div>
            </div>

            <!-- Right Column: Stats & Recommendations -->
            <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
                <h2 class="text-2xl font-bold text-slate-800 mb-4">Dashboard</h2>
                
                <!-- Key Stats -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div class="bg-blue-50 p-4 rounded-lg text-center">
                        <p class="text-3xl font-bold text-blue-600" id="stat-skills">0</p>
                        <p class="text-sm font-medium text-blue-800">Skills</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg text-center">
                        <p class="text-3xl font-bold text-green-600" id="stat-experiences">0</p>
                        <p class="text-sm font-medium text-green-800">Experiences</p>
                    </div>
                    <div class="bg-purple-50 p-4 rounded-lg text-center">
                        <p class="text-3xl font-bold text-purple-600" id="stat-education">0</p>
                        <p class="text-sm font-medium text-purple-800">Education</p>
                    </div>
                    <div class="bg-pink-50 p-4 rounded-lg text-center">
                        <p class="text-3xl font-bold text-pink-600" id="stat-projects">0</p>
                        <p class="text-sm font-medium text-pink-800">Projects</p>
                    </div>
                </div>

                <!-- Recommendations -->
                <div>
                    <h3 class="font-semibold text-slate-700 mb-3 flex items-center">
                        <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
                        Recommendations
                    </h3>
                    <div id="dashboard-recommendations" class="space-y-2">
                        <!-- Recommendations will be populated here -->
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Add caching to prevent unnecessary recalculations
let lastDataHash = '';
let cachedAnalysis = null;

export function update(data, sectionsConfig) {
    // Create a simple hash of the data
    const dataHash = JSON.stringify(data).length + Object.keys(data).length;
    
    // Only recalculate if data has changed
    if (dataHash !== lastDataHash) {
        cachedAnalysis = calculateCompleteness(data, sectionsConfig);
        lastDataHash = dataHash;
    }
    
    const nameEl = document.getElementById('dashboard-user-name');
    const titleEl = document.getElementById('dashboard-user-title');
    const picEl = document.getElementById('dashboard-profile-pic');
    
    // Update basic info with null checks
    if (nameEl && nameEl.textContent !== (data.personal?.fullName?.value || 'Your Name')) {
        nameEl.textContent = data.personal?.fullName?.value || 'Your Name';
    }
    if (titleEl) titleEl.textContent = getFirstCareerTitle(data) || 'Your Professional Title';
    if (picEl) {
        const newSrc = getPrimaryPictureUrl(data);
        if (picEl.src !== newSrc) {
            picEl.src = newSrc;
        }
    }

    const { completeness, recommendations } = cachedAnalysis;
    
    const badgeEl = document.getElementById('dashboard-completeness-badge');
    const barEl = document.getElementById('dashboard-progress-bar');
    if (badgeEl) badgeEl.textContent = `${completeness}%`;
    if (barEl) barEl.style.width = `${completeness}%`;

    updateStats(data);
    updateRecommendations(recommendations);
}

/**
 * Get first career title from data
 */
function getFirstCareerTitle(data) {
    if (data.career && Array.isArray(data.career) && data.career.length > 0) {
        return data.career[0].jobTitle?.value;
    }
    return null;
}

/**
 * Get primary picture URL
 */
function getPrimaryPictureUrl(data) {
    if (data.profilePictures?.pictures) {
        const primaryPic = data.profilePictures.pictures.find(p => p.isPrimary);
        if (primaryPic) return primaryPic.url;
    }
    return 'https://placehold.co/128x128/E0E7FF/4F46E5?text=You';
}

/**
 * Calculate completeness score and generate recommendations
 */
function calculateCompleteness(data, sectionsConfig) {
    let filledFields = 0;
    let totalFields = 0;
    let recommendations = [];
    
    Object.entries(sectionsConfig).forEach(([key, section]) => {
        if (section.fields) {
            totalFields += section.fields.length;
            
            let sectionFilledFields = 0;
            section.fields.forEach(field => {
                if (getObjectValueByPath(data, `${key}.${field.id}.value`)) {
                    filledFields++;
                    sectionFilledFields++;
                }
            });
            
            // Generate recommendations for incomplete sections
            if (sectionFilledFields === 0) {
                recommendations.push({
                    section: key,
                    priority: 'high',
                    message: `Add your ${section.title.toLowerCase()} information to improve your profile`
                });
            } else if (sectionFilledFields < section.fields.length) {
                recommendations.push({
                    section: key,
                    priority: 'medium',
                    message: `Complete your ${section.title.toLowerCase()} section`
                });
            }
        } else if (section.isList) {
            // For list sections, check if there are any items
            const sectionData = data[key];
            if (!sectionData || !Array.isArray(sectionData) || sectionData.length === 0) {
                recommendations.push({
                    section: key,
                    priority: 'medium',
                    message: `Add items to your ${section.title.toLowerCase()} section`
                });
            }
        }
    });

    const completeness = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
    
    // Sort recommendations by priority
    recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    return { completeness, recommendations: recommendations.slice(0, 5) }; // Limit to 5 recommendations
}

/**
 * Update statistics counters
 */
function updateStats(data) {
    const skillsEl = document.getElementById('stat-skills');
    const experiencesEl = document.getElementById('stat-experiences');
    const educationEl = document.getElementById('stat-education');
    const projectsEl = document.getElementById('stat-projects');
    
    if (skillsEl) skillsEl.textContent = Array.isArray(data.skills) ? data.skills.length : 0;
    if (experiencesEl) experiencesEl.textContent = Array.isArray(data.career) ? data.career.length : 0;
    if (educationEl) educationEl.textContent = Array.isArray(data.education) ? data.education.length : 0;
    if (projectsEl) projectsEl.textContent = Array.isArray(data.projects) ? data.projects.length : 0;
}

/**
 * Generates and displays recommendations based on missing data.
 * @param {Array} recommendations - Array of recommendation objects.
 */
function updateRecommendations(recommendations) {
    const recommendationsEl = document.getElementById('dashboard-recommendations');
    if (!recommendationsEl) return;

    if (recommendations.length === 0) {
        recommendationsEl.innerHTML = `
            <div class="flex items-center p-3 bg-green-50 rounded-md border border-green-200">
                <i class="fas fa-check-circle text-green-500 mr-3"></i>
                <p class="text-sm text-green-700">Your LifeCV is looking great! Keep it updated with new achievements.</p>
            </div>
        `;
        return;
    }

    recommendationsEl.innerHTML = recommendations.map(rec => `
        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-200 hover:bg-slate-100 transition-colors">
            <div class="flex items-center">
                <div class="w-2 h-2 rounded-full mr-3 ${getPriorityColor(rec.priority)}"></div>
                <span class="text-sm text-slate-700">${rec.message}</span>
            </div>
            <button class="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors" 
                    onclick="scrollToSection('${rec.section}')">
                <i class="fas fa-arrow-right mr-1"></i>Fix
            </button>
        </div>
    `).join('');
}

/**
 * Get priority color class
 */
function getPriorityColor(priority) {
    const colors = {
        high: 'bg-red-500',
        medium: 'bg-yellow-500',
        low: 'bg-blue-500'
    };
    return colors[priority] || colors.medium;
}

/**
 * Scroll to a specific section
 */
window.scrollToSection = function(sectionKey) {
    const container = document.getElementById('lifecv-sections');
    if (!container) return;
    
    // Find the section and open it
    const sections = container.querySelectorAll('.accordion-toggle');
    sections.forEach(section => {
        const content = section.nextElementSibling;
        const chevron = section.querySelector('i:last-child');
        
        // Check if this is the target section
        if (section.textContent.toLowerCase().includes(sectionKey.toLowerCase()) || 
            section.querySelector('h2').textContent.toLowerCase().includes(sectionKey.toLowerCase())) {
            
            // Open the accordion
            content.classList.add('show');
            chevron.classList.add('rotate-180');
            
            // Scroll to it
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
};
