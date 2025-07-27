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
        if (!response.ok) throw new Error('Dashboard component not found');
        const html = await response.text();
        document.getElementById('lifecv-dashboard-placeholder').innerHTML = html;
    } catch (error) {
        console.error("Dashboard Error:", error);
        document.getElementById('lifecv-dashboard-placeholder').innerHTML = 
            `<p class="text-red-500 text-center">Error loading dashboard.</p>`;
    }
}

/**
 * Updates the dashboard with the latest data.
 * @param {object} data - The user's complete LifeCV data.
 * @param {object} sectionsConfig - The configuration object for all sections.
 */
export function update(data, sectionsConfig) {
    const nameEl = document.getElementById('dashboard-user-name');
    const titleEl = document.getElementById('dashboard-user-title');
    const picEl = document.getElementById('dashboard-profile-pic');
    
    if (nameEl) nameEl.textContent = data.personal?.fullName?.value || 'Your Name';
    if (titleEl) titleEl.textContent = data.career?.[0]?.jobTitle?.value || 'Your Professional Title';
    if (picEl) picEl.src = data.profilePictures?.pictures?.find(p => p.isPrimary)?.url || 'https://placehold.co/128x128/E0E7FF/4F46E5?text=You';

    // Calculate completeness
    let filledFields = 0;
    let totalFields = 0;
    Object.entries(sectionsConfig).forEach(([key, section]) => {
        if (section.fields) {
            totalFields += section.fields.length;
            section.fields.forEach(field => {
                if (getObjectValueByPath(data, `${key}.${field.id}.value`)) {
                    filledFields++;
                }
            });
        }
    });

    const completeness = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
    
    const badgeEl = document.getElementById('dashboard-completeness-badge');
    const barEl = document.getElementById('dashboard-progress-bar');
    if (badgeEl) badgeEl.textContent = `${completeness}%`;
    if (barEl) barEl.style.width = `${completeness}%`;

    // Update stats
    document.getElementById('stat-skills').textContent = data.skills?.length || 0;
    document.getElementById('stat-experiences').textContent = data.career?.length || 0;
    document.getElementById('stat-education').textContent = data.education?.length || 0;
    document.getElementById('stat-projects').textContent = data.projects?.length || 0;
    
    // Update recommendations
    updateRecommendations(data);
}

/**
 * Generates and displays recommendations based on missing data.
 * @param {object} data - The user's LifeCV data.
 */
function updateRecommendations(data) {
    const recommendationsEl = document.getElementById('dashboard-recommendations');
    if (!recommendationsEl) return;

    let recommendationsHTML = '';
    if (!data.career || data.career.length === 0) {
        recommendationsHTML += `<div class="flex items-center p-2 bg-slate-50 rounded-md"><i class="fas fa-plus-circle text-green-500 mr-3"></i><p class="text-sm text-slate-700">Add your work experience to showcase your career path.</p></div>`;
    }
    if (!data.skills || data.skills.length === 0) {
        recommendationsHTML += `<div class="flex items-center p-2 bg-slate-50 rounded-md"><i class="fas fa-plus-circle text-green-500 mr-3"></i><p class="text-sm text-slate-700">List your skills to highlight your capabilities.</p></div>`;
    }
    if(recommendationsHTML === '') {
        recommendationsHTML = `<div class="flex items-center p-2 bg-green-50 rounded-md"><i class="fas fa-check-circle text-green-500 mr-3"></i><p class="text-sm text-slate-700">Your LifeCV is looking great! Keep it updated.</p></div>`;
    }
    recommendationsEl.innerHTML = recommendationsHTML;
}
