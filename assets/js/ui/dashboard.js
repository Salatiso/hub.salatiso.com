/* ================================================================================= */
/* FILE: assets/js/ui/dashboard.js                                                   */
/* PURPOSE: Dashboard functionality for LifeCV overview                             */
/* ================================================================================= */

export async function init() {
    console.log('Dashboard initialized');
}

export function update(data, sectionsConfig) {
    const container = document.getElementById('lifecv-dashboard-placeholder');
    if (!container) return;
    
    const stats = calculateStats(data, sectionsConfig);
    
    container.innerHTML = `
        <div class="lifecv-dashboard mb-8">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                ${renderDashboardCard('Profile Completion', `${stats.completionPercentage}%`, 'fas fa-chart-pie', getCompletionColor(stats.completionPercentage))}
                ${renderDashboardCard('Total Sections', stats.totalSections, 'fas fa-list', 'blue')}
                ${renderDashboardCard('Completed Sections', stats.completedSections, 'fas fa-check-circle', 'green')}
                ${renderDashboardCard('Public Visibility', `${stats.publicPercentage}%`, 'fas fa-eye', 'purple')}
            </div>
            
            <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 class="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <button onclick="exportData()" class="dashboard-action-btn">
                        <i class="fas fa-download mr-2"></i>Export Data
                    </button>
                    <button onclick="importData()" class="dashboard-action-btn">
                        <i class="fas fa-upload mr-2"></i>Import Data
                    </button>
                    <button onclick="previewCV()" class="dashboard-action-btn">
                        <i class="fas fa-eye mr-2"></i>Preview CV
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderDashboardCard(title, value, icon, color) {
    return `
        <div class="dashboard-card bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="dashboard-label text-sm font-medium text-slate-600">${title}</p>
                    <p class="dashboard-metric text-2xl font-bold text-slate-900">${value}</p>
                </div>
                <div class="dashboard-icon">
                    <i class="${icon} text-2xl text-${color}-600"></i>
                </div>
            </div>
        </div>
    `;
}

function calculateStats(data, sectionsConfig) {
    let totalFields = 0;
    let completedFields = 0;
    let totalSections = Object.keys(sectionsConfig).length;
    let completedSections = 0;
    let publicFields = 0;
    let totalPublicableFields = 0;
    
    for (const [sectionKey, sectionConfig] of Object.entries(sectionsConfig)) {
        const sectionData = data[sectionKey];
        let sectionCompleted = false;
        
        if (sectionConfig.isArray) {
            if (Array.isArray(sectionData) && sectionData.length > 0) {
                sectionCompleted = true;
                completedSections++;
            }
        } else {
            let sectionFieldsCompleted = 0;
            for (const field of sectionConfig.fields) {
                totalFields++;
                const fieldData = sectionData?.[field.id];
                if (fieldData?.value) {
                    completedFields++;
                    sectionFieldsCompleted++;
                }
                
                if (field.sensitive !== undefined) {
                    totalPublicableFields++;
                    if (fieldData?.isPublic) {
                        publicFields++;
                    }
                }
            }
            
            if (sectionFieldsCompleted > 0) {
                sectionCompleted = true;
                completedSections++;
            }
        }
    }
    
    const completionPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
    const publicPercentage = totalPublicableFields > 0 ? Math.round((publicFields / totalPublicableFields) * 100) : 0;
    
    return {
        totalSections,
        completedSections,
        completionPercentage,
        publicPercentage
    };
}

function getCompletionColor(percentage) {
    if (percentage >= 80) return 'green';
    if (percentage >= 60) return 'yellow';
    if (percentage >= 40) return 'orange';
    return 'red';
}