/* ================================================================================= */
/* FILE: assets/js/modules/life-cv.js (MAIN MODULE)                                 */
/* PURPOSE: Main LifeCV module that orchestrates all components                     */
/* ================================================================================= */

import { init as initDataService } from '../services/life-cv-data-service.js';
import { init as initUIController } from '../controllers/lifecv-ui-controller.js';
import { init as initImportHandlers } from '../handlers/import-handlers.js';
import { showModal, init as initModals } from '../ui/lifecv-modals.js';
import { showNotification } from '../utils/notifications.js';
import { lifeCVFinHelpIntegration } from '../services/lifecv-finhelp-integration.js';

let isInitialized = false;
let currentUser = null;

/**
 * Initialize the LifeCV module
 */
export async function init(user) {
    if (isInitialized) return;
    
    try {
        showLoadingState();
        
        currentUser = user;
        
        // Initialize all components
        await initDataService(user, handleDataUpdate);
        initUIController();
        initImportHandlers();
        initModals();
        
        // Set up global error handling
        setupErrorHandling();
        
        // Hide loading and show app
        hideLoadingState();
        
        isInitialized = true;
        console.log('LifeCV module initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize LifeCV:', error);
        showErrorState(error);
    }
}

/**
 * Handle data updates from the data service
 */
function handleDataUpdate(newData) {
    if (window.lifeCvUIController) {
        window.lifeCvUIController.updateUI(newData);
    }
    
    // Load the dashboard component
    loadDashboardComponent();
}

/**
 * Load the lifecv-dashboard component
 */
async function loadDashboardComponent() {
    const dashboardPlaceholder = document.getElementById('lifecv-dashboard-placeholder');
    if (!dashboardPlaceholder) return;
    
    try {
        const response = await fetch('../components/lifecv-dashboard.html');
        if (response.ok) {
            const dashboardHTML = await response.text();
            dashboardPlaceholder.innerHTML = dashboardHTML;
            
            // Initialize dashboard functionality
            initializeDashboard();
            
            // Initialize FinHelp integration
            await initializeFinHelpIntegration();
        } else {
            console.warn('Could not load lifecv-dashboard.html');
        }
    } catch (error) {
        console.error('Error loading dashboard component:', error);
    }
}

/**
 * Initialize FinHelp integration
 */
async function initializeFinHelpIntegration() {
    try {
        await lifeCVFinHelpIntegration.initialize();
        setupFinHelpIntegrationUI();
    } catch (error) {
        console.error('Error initializing FinHelp integration:', error);
    }
}

/**
 * Setup FinHelp integration UI
 */
function setupFinHelpIntegrationUI() {
    // Add integration status to dashboard
    updateIntegrationStatus();
    
    // Add sync buttons to financial section
    addFinHelpSyncButtons();
}

/**
 * Update integration status in dashboard
 */
function updateIntegrationStatus() {
    const status = lifeCVFinHelpIntegration.getIntegrationStatus();
    const dashboardPlaceholder = document.getElementById('lifecv-dashboard-placeholder');
    
    if (dashboardPlaceholder) {
        const integrationStatusHTML = `
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6 finhelp-integration">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-slate-900">
                        <i class="fas fa-link mr-2 text-indigo-600"></i>
                        FinHelp Integration
                    </h3>
                    <div class="flex items-center space-x-2">
                        <div class="w-3 h-3 rounded-full ${status.isIntegrated ? 'bg-green-500' : 'bg-gray-400'}"></div>
                        <span class="text-sm text-slate-600">${status.isIntegrated ? 'Connected' : 'Not Connected'}</span>
                    </div>
                </div>
                
                ${status.isIntegrated ? `
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-indigo-600">${status.syncedItems.income}</div>
                            <div class="text-xs text-slate-500">Income Sources</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-green-600">${status.syncedItems.assets}</div>
                            <div class="text-xs text-slate-500">Assets</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-red-600">${status.syncedItems.liabilities}</div>
                            <div class="text-xs text-slate-500">Liabilities</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-blue-600">${status.syncedItems.insurances}</div>
                            <div class="text-xs text-slate-500">Insurance Policies</div>
                        </div>
                    </div>
                    
                    <div class="text-sm text-slate-600 mb-4">
                        Last synced: ${status.lastSync ? status.lastSync.toLocaleDateString() : 'Never'}
                    </div>
                ` : `
                    <p class="text-slate-600 mb-4">Connect your LifeCV financial information with FinHelp for comprehensive financial management.</p>
                `}
                
                <div class="flex space-x-3">
                    <button onclick="window.lifeCvModule.syncToFinHelp()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        <i class="fas fa-sync mr-2"></i>Sync to FinHelp
                    </button>
                    <button onclick="window.lifeCvModule.syncFromFinHelp()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <i class="fas fa-download mr-2"></i>Import from FinHelp
                    </button>
                    <a href="finhelp.html" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-external-link-alt mr-2"></i>Open FinHelp
                    </a>
                </div>
            </div>
        `;
        
        // Insert integration status after dashboard stats
        const existingIntegration = dashboardPlaceholder.querySelector('.finhelp-integration');
        if (existingIntegration) {
            existingIntegration.outerHTML = integrationStatusHTML;
        } else {
            // Find a good place to insert it
            const dashboardContent = dashboardPlaceholder.querySelector('.bg-gradient-to-r');
            if (dashboardContent && dashboardContent.parentNode) {
                dashboardContent.insertAdjacentHTML('afterend', integrationStatusHTML);
            } else {
                dashboardPlaceholder.insertAdjacentHTML('beforeend', integrationStatusHTML);
            }
        }
    }
}

/**
 * Add sync buttons to financial section
 */
function addFinHelpSyncButtons() {
    // Add sync buttons to financial section
    const financialSection = document.getElementById('section-financials');
    if (financialSection) {
        const sectionHeader = financialSection.querySelector('.p-6.border-b');
        if (sectionHeader) {
            const syncButton = document.createElement('button');
            syncButton.className = 'p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors ml-2';
            syncButton.innerHTML = '<i class="fas fa-sync text-sm"></i>';
            syncButton.title = 'Sync with FinHelp';
            syncButton.onclick = () => window.lifeCvModule.syncToFinHelp();
            
            const actionButtons = sectionHeader.querySelector('.flex.space-x-2');
            if (actionButtons) {
                actionButtons.appendChild(syncButton);
            }
        }
    }
}

/**
 * Sync LifeCV data to FinHelp
 */
async function syncToFinHelp() {
    try {
        showSyncMessage('Syncing financial data to FinHelp...', 'info');
        
        const result = await lifeCVFinHelpIntegration.syncLifeCVToFinHelp();
        
        if (result.success) {
            const totalSynced = result.syncedItems.income + result.syncedItems.assets + result.syncedItems.liabilities + result.syncedItems.insurances;
            showSyncMessage(`Successfully synced ${totalSynced} items to FinHelp!`, 'success');
            updateIntegrationStatus();
        } else {
            showSyncMessage('Failed to sync data to FinHelp', 'error');
        }
    } catch (error) {
        console.error('Error syncing to FinHelp:', error);
        showSyncMessage('Error syncing to FinHelp: ' + error.message, 'error');
    }
}

/**
 * Sync FinHelp data to LifeCV
 */
async function syncFromFinHelp() {
    try {
        showSyncMessage('Importing financial data from FinHelp...', 'info');
        
        const result = await lifeCVFinHelpIntegration.syncFinHelpToLifeCV();
        
        if (result.success) {
            showSyncMessage('Successfully imported financial data from FinHelp!', 'success');
            
            // Refresh the UI to show updated data
            if (window.lifeCvUIController) {
                const updatedData = window.lifeCvDataService ? window.lifeCvDataService.getLifeCvData() : {};
                window.lifeCvUIController.updateUI(updatedData);
            }
            updateIntegrationStatus();
        } else {
            showSyncMessage('Failed to import data from FinHelp', 'error');
        }
    } catch (error) {
        console.error('Error syncing from FinHelp:', error);
        showSyncMessage('Error importing from FinHelp: ' + error.message, 'error');
    }
}

/**
 * Show sync message
 */
function showSyncMessage(message, type = 'info') {
    // Remove existing sync messages
    const existingMessages = document.querySelectorAll('.sync-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `sync-message fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    
    messageDiv.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(messageDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

/**
 * Initialize dashboard functionality
 */
function initializeDashboard() {
    // Update dashboard with current data
    updateDashboardStats();
    
    // Set up periodic updates
    setInterval(updateDashboardStats, 30000); // Update every 30 seconds
}

/**
 * Update dashboard statistics
 */
function updateDashboardStats() {
    const data = window.lifeCvDataService ? window.lifeCvDataService.getLifeCvData() : {};
    
    // Update profile picture
    const profilePic = document.getElementById('dashboard-profile-pic');
    if (profilePic && data.profilePictures && data.profilePictures.length > 0) {
        const primaryPic = data.profilePictures.find(pic => pic.isPrimary?.value) || data.profilePictures[0];
        if (primaryPic && primaryPic.url?.value) {
            profilePic.src = primaryPic.url.value;
        }
    }
    
    // Update user name
    const userName = document.getElementById('dashboard-user-name');
    if (userName && data.personalInfo) {
        const name = data.personalInfo.preferredName?.value || data.personalInfo.fullName?.value || 'Your Name';
        userName.textContent = name;
    }
    
    // Update user title
    const userTitle = document.getElementById('dashboard-user-title');
    if (userTitle && data.professionalSummary) {
        const title = data.professionalSummary.summary?.value || 'Your Professional Title';
        userTitle.textContent = title.split('.')[0]; // First sentence only
    }
    
    // Calculate and update completeness
    const completeness = calculateOverallCompleteness(data);
    const completenessElements = document.querySelectorAll('#dashboard-completeness-badge, #dashboard-progress-bar');
    completenessElements.forEach(el => {
        if (el.id === 'dashboard-completeness-badge') {
            el.textContent = `${completeness}%`;
        } else if (el.id === 'dashboard-progress-bar') {
            el.style.width = `${completeness}%`;
        }
    });
    
    // Update stats
    updateDashboardCounts(data);
    
    // Update recommendations
    updateDashboardRecommendations(data, completeness);
}

/**
 * Calculate overall completeness percentage
 */
function calculateOverallCompleteness(data) {
    const sections = window.lifeCvDataService ? window.lifeCvDataService.getLifeCvSections() : {};
    const sectionKeys = Object.keys(sections);
    
    if (sectionKeys.length === 0) return 0;
    
    let totalCompletion = 0;
    sectionKeys.forEach(sectionKey => {
        const config = sections[sectionKey];
        const sectionData = data[sectionKey];
        
        if (config && config.fields) {
            const completion = calculateSectionCompleteness(sectionData, config);
            totalCompletion += completion;
        }
    });
    
    return Math.round(totalCompletion / sectionKeys.length);
}

/**
 * Calculate section completeness (simplified version)
 */
function calculateSectionCompleteness(data, config) {
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
                    if (value !== '') filledFields++;
                } else if (fieldData && typeof fieldData === 'string' && fieldData.trim() !== '') {
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
                if (value !== '') filledFields++;
            } else if (fieldData && typeof fieldData === 'string' && fieldData.trim() !== '') {
                filledFields++;
            }
        });
        
        return Math.round((filledFields / totalFields) * 100);
    }
}

/**
 * Update dashboard counts
 */
function updateDashboardCounts(data) {
    // Count skills
    const skillsCount = document.getElementById('stat-skills');
    if (skillsCount) {
        const count = (data.skills && Array.isArray(data.skills)) ? data.skills.length : 0;
        skillsCount.textContent = count;
    }
    
    // Count experiences
    const experiencesCount = document.getElementById('stat-experiences');
    if (experiencesCount) {
        const count = (data.experience && Array.isArray(data.experience)) ? data.experience.length : 0;
        experiencesCount.textContent = count;
    }
    
    // Count education
    const educationCount = document.getElementById('stat-education');
    if (educationCount) {
        const count = (data.education && Array.isArray(data.education)) ? data.education.length : 0;
        educationCount.textContent = count;
    }
    
    // Count projects
    const projectsCount = document.getElementById('stat-projects');
    if (projectsCount) {
        const count = (data.projects && Array.isArray(data.projects)) ? data.projects.length : 0;
        projectsCount.textContent = count;
    }
}

/**
 * Update dashboard recommendations
 */
function updateDashboardRecommendations(data, completeness) {
    const recommendationsContainer = document.getElementById('dashboard-recommendations');
    if (!recommendationsContainer) return;
    
    const recommendations = [];
    
    // Check for missing essential sections
    if (!data.personalInfo || !data.personalInfo.fullName?.value) {
        recommendations.push({
            icon: 'fas fa-user',
            text: 'Complete your personal information',
            action: 'Add your basic details to get started',
            priority: 'high'
        });
    }
    
    if (!data.contactInfo || !Array.isArray(data.contactInfo) || data.contactInfo.length === 0) {
        recommendations.push({
            icon: 'fas fa-phone',
            text: 'Add contact information',
            action: 'Include phone numbers, emails, and addresses',
            priority: 'high'
        });
    }
    
    if (!data.professionalSummary || !data.professionalSummary.summary?.value) {
        recommendations.push({
            icon: 'fas fa-briefcase',
            text: 'Write your professional summary',
            action: 'Describe your career goals and expertise',
            priority: 'medium'
        });
    }
    
    if (!data.experience || !Array.isArray(data.experience) || data.experience.length === 0) {
        recommendations.push({
            icon: 'fas fa-building',
            text: 'Add work experience',
            action: 'Include your employment history',
            priority: 'medium'
        });
    }
    
    if (!data.skills || !Array.isArray(data.skills) || data.skills.length === 0) {
        recommendations.push({
            icon: 'fas fa-cogs',
            text: 'List your skills',
            action: 'Add technical and soft skills',
            priority: 'medium'
        });
    }
    
    if (completeness > 80) {
        recommendations.push({
            icon: 'fas fa-star',
            text: 'Great progress!',
            action: 'Your LifeCV is looking comprehensive',
            priority: 'low'
        });
    }
    
    // Render recommendations
    if (recommendations.length === 0) {
        recommendationsContainer.innerHTML = '<p class="text-slate-500 text-sm">No recommendations at this time.</p>';
    } else {
        recommendationsContainer.innerHTML = recommendations.slice(0, 4).map(rec => `
            <div class="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                <div class="flex-shrink-0">
                    <i class="${rec.icon} text-${rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'green'}-500"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-900">${rec.text}</p>
                    <p class="text-xs text-slate-600">${rec.action}</p>
                </div>
            </div>
        `).join('');
    }
}

/**
 * Show loading state
 */
function showLoadingState() {
    const loadingEl = document.getElementById('loading-indicator');
    const appEl = document.getElementById('app-container');
    
    if (loadingEl) loadingEl.style.display = 'flex';
    if (appEl) appEl.style.visibility = 'hidden';
}

/**
 * Hide loading state and show app
 */
function hideLoadingState() {
    const loadingEl = document.getElementById('loading-indicator');
    const appEl = document.getElementById('app-container');
    
    if (loadingEl) loadingEl.style.display = 'none';
    if (appEl) appEl.style.visibility = 'visible';
}

/**
 * Show error state
 */
function showErrorState(error) {
    const errorEl = document.getElementById('error-boundary');
    const loadingEl = document.getElementById('loading-indicator');
    const appEl = document.getElementById('app-container');
    
    if (loadingEl) loadingEl.style.display = 'none';
    if (appEl) appEl.style.visibility = 'hidden';
    if (errorEl) errorEl.classList.remove('hidden');
    
    showNotification(`Initialization failed: ${error.message}`, 'error', 10000);
}

/**
 * Set up global error handling
 */
function setupErrorHandling() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
        if (event.message && (
            event.message.includes('Extension context invalidated') || 
            event.message.includes('message channel closed')
        )) {
            return; // Ignore browser extension errors
        }
        
        console.error('Global error:', event.error);
        showNotification('An unexpected error occurred', 'error');
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        if (event.reason && event.reason.message && 
            event.reason.message.includes('message channel closed')) {
            event.preventDefault();
            return;
        }
        
        console.error('Unhandled promise rejection:', event.reason);
        showNotification('An unexpected error occurred', 'error');
    });
}

/**
 * Export functionality for external use
 */
export function exportLifeCV(options = {}) {
    if (window.lifeCvDataService) {
        return window.lifeCvDataService.exportData(options);
    }
}

/**
 * Import functionality for external use
 */
export async function importLifeCV(data, options = {}) {
    if (window.lifeCvDataService) {
        return await window.lifeCvDataService.importData(data, options);
    }
}

// Make main functions globally available
window.lifeCvModule = {
    exportLifeCV,
    importLifeCV,
    init,
    syncToFinHelp,
    syncFromFinHelp
};

/* --- End of LifeCV Module --- */