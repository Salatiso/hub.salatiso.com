/* ================================================================================= */
/* FILE: assets/js/modules/dashboard.js (ENHANCED - Cross-Module Activity)          */
/* ================================================================================= */
import { auth, db } from '../firebase-config.js';
import { getDocument } from '../database.js';
import { collection, query, where, onSnapshot, limit, orderBy, doc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getLifeCvData } from '../services/life-cv-data-service.js';

let currentUser = null;
let isInitialized = false;

export async function init(user) {
    if (!user || !user.uid) {
        console.error("Dashboard Error: User not authenticated.");
        isInitialized = false;
        return;
    }
    if (isInitialized && currentUser.uid === user.uid) {
        return; // Avoid re-initialization
    }
    
    currentUser = user;
    isInitialized = true;
    console.log("Dynamic Dashboard module initialized.");

    const greetingEl = document.getElementById('dashboard-greeting');
    if (greetingEl) {
        greetingEl.textContent = `Welcome, ${user.displayName || 'Friend'}`;
    }
    
    setupStyleSwitcher();
    await renderDashboard('default'); 
    listenForNotifications();
    listenForActivityUpdates();
}

function setupStyleSwitcher() {
    const buttons = document.querySelectorAll('.style-selector button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            if (!button.classList.contains('active')) {
                buttons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                renderDashboard(button.dataset.style);
            }
        });
    });
}

async function renderDashboard(style) {
    const container = document.getElementById('dashboard-container');
    if (!container) return;

    container.innerHTML = `<p class="text-center text-slate-500 py-10">Loading dashboard...</p>`;

    let dashboardHTML = '';
    if (style === 'kids') {
        dashboardHTML = getKidsDashboardHTML();
    } else {
        dashboardHTML = await getDefaultDashboardHTML();
    }
    container.innerHTML = dashboardHTML;
}

async function getDefaultDashboardHTML() {
    // Fetch data from all modules
    const moduleData = await fetchAllModuleData();
    
    return `
        <!-- Module Status Overview -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="dashboard-card bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-lg shadow-sm text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="font-semibold text-indigo-100">LifeCV Strength</h3>
                        <p class="text-3xl font-bold">${moduleData.lifeCv.completeness}%</p>
                        <p class="text-sm text-indigo-200">${moduleData.lifeCv.sectionsCompleted}/${moduleData.lifeCv.totalSections} sections</p>
                    </div>
                    <i class="fas fa-id-card text-3xl text-indigo-200"></i>
                </div>
            </div>
            
            <div class="dashboard-card bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-lg shadow-sm text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="font-semibold text-green-100">FinHelp Status</h3>
                        <p class="text-3xl font-bold">R${moduleData.finHelp.netWorth.toLocaleString()}</p>
                        <p class="text-sm text-green-200">Net Worth</p>
                    </div>
                    <i class="fas fa-chart-pie text-3xl text-green-200"></i>
                </div>
            </div>
            
            <div class="dashboard-card bg-gradient-to-r from-blue-500 to-cyan-600 p-6 rounded-lg shadow-sm text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="font-semibold text-blue-100">Family Hub</h3>
                        <p class="text-3xl font-bold">${moduleData.familyHub.memberCount}</p>
                        <p class="text-sm text-blue-200">${moduleData.familyHub.status}</p>
                    </div>
                    <i class="fas fa-users text-3xl text-blue-200"></i>
                </div>
            </div>
            
            <div class="dashboard-card bg-gradient-to-r from-orange-500 to-red-600 p-6 rounded-lg shadow-sm text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="font-semibold text-orange-100">Total Activities</h3>
                        <p class="text-3xl font-bold" id="total-activities">${moduleData.totalActivities}</p>
                        <p class="text-sm text-orange-200">This month</p>
                    </div>
                    <i class="fas fa-chart-line text-3xl text-orange-200"></i>
                </div>
            </div>
        </div>

        <!-- Module Quick Access -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div class="dashboard-card bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-500">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-slate-900">LifeCV</h3>
                    <span class="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                        ${moduleData.lifeCv.status}
                    </span>
                </div>
                <p class="text-sm text-slate-600 mb-4">${moduleData.lifeCv.lastUpdated}</p>
                <div class="flex justify-between items-center">
                    <a href="modules/life-cv.html" class="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                        View Profile →
                    </a>
                    ${moduleData.lifeCv.hasRecommendations ? '<span class="w-2 h-2 bg-red-500 rounded-full"></span>' : ''}
                </div>
            </div>
            
            <div class="dashboard-card bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-slate-900">FinHelp</h3>
                    <span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        ${moduleData.finHelp.status}
                    </span>
                </div>
                <p class="text-sm text-slate-600 mb-4">Monthly savings: R${moduleData.finHelp.monthlySavings.toLocaleString()}</p>
                <div class="flex justify-between items-center">
                    <a href="modules/finhelp.html" class="text-green-600 hover:text-green-700 font-medium text-sm">
                        Manage Finances →
                    </a>
                    ${moduleData.finHelp.hasAlerts ? '<span class="w-2 h-2 bg-yellow-500 rounded-full"></span>' : ''}
                </div>
            </div>
            
            <div class="dashboard-card bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-slate-900">Family Hub</h3>
                    <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        ${moduleData.familyHub.status}
                    </span>
                </div>
                <p class="text-sm text-slate-600 mb-4">${moduleData.familyHub.memberCount} family members</p>
                <div class="flex justify-between items-center">
                    <a href="modules/family-hub.html" class="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        View Family →
                    </a>
                    ${moduleData.familyHub.hasPendingInvitations ? '<span class="w-2 h-2 bg-yellow-500 rounded-full"></span>' : ''}
                </div>
            </div>
            
            <div class="dashboard-card bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-slate-900">eKhaya</h3>
                    <span class="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                        ${moduleData.ekhaya.status}
                    </span>
                </div>
                <p class="text-sm text-slate-600 mb-4">${moduleData.ekhaya.propertyCount} properties</p>
                <div class="flex justify-between items-center">
                    <a href="modules/ekhaya.html" class="text-purple-600 hover:text-purple-700 font-medium text-sm">
                        Manage Properties →
                    </a>
                    ${moduleData.ekhaya.hasMaintenanceDue ? '<span class="w-2 h-2 bg-red-500 rounded-full"></span>' : ''}
                </div>
            </div>
            
            <div class="dashboard-card bg-white p-6 rounded-lg shadow-sm border-l-4 border-teal-500">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-slate-900">CommsHub</h3>
                    <span class="px-2 py-1 text-xs font-medium bg-teal-100 text-teal-800 rounded-full">
                        ${moduleData.commsHub.status}
                    </span>
                </div>
                <p class="text-sm text-slate-600 mb-4">${moduleData.commsHub.unreadMessages} unread messages</p>
                <div class="flex justify-between items-center">
                    <a href="modules/commshub.html" class="text-teal-600 hover:text-teal-700 font-medium text-sm">
                        View Messages →
                    </a>
                    ${moduleData.commsHub.hasUnread ? '<span class="w-2 h-2 bg-red-500 rounded-full"></span>' : ''}
                </div>
            </div>
            
            <div class="dashboard-card bg-white p-6 rounded-lg shadow-sm border-l-4 border-amber-500">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-slate-900">Assessments</h3>
                    <span class="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                        ${moduleData.assessments.status}
                    </span>
                </div>
                <p class="text-sm text-slate-600 mb-4">${moduleData.assessments.completedCount} assessments completed</p>
                <div class="flex justify-between items-center">
                    <a href="quiz.html" class="text-amber-600 hover:text-amber-700 font-medium text-sm">
                        Take Quiz →
                    </a>
                    ${moduleData.assessments.hasNewRecommendations ? '<span class="w-2 h-2 bg-green-500 rounded-full"></span>' : ''}
                </div>
            </div>
        </div>

        <!-- Enhanced Recent Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-slate-900">Recent Activity</h3>
                    <span class="text-xs text-slate-500">Live updates</span>
                </div>
                <div id="recent-activity" class="space-y-4">
                    ${renderRecentActivity(moduleData.recentActivity)}
                </div>
                <div class="mt-4 text-center">
                    <a href="modules/activity.html" class="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                        View All Activity →
                    </a>
                </div>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="font-semibold text-slate-900 mb-4">Cross-Module Insights</h3>
                <div id="cross-module-insights" class="space-y-4">
                    ${renderCrossModuleInsights(moduleData)}
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="mt-8 bg-white p-6 rounded-lg shadow-sm">
            <h3 class="font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <button onclick="window.location.href='/modules/life-cv.html'" class="flex flex-col items-center p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                    <i class="fas fa-id-card text-2xl text-indigo-600 mb-2"></i>
                    <span class="text-sm font-medium text-slate-700">Update Profile</span>
                </button>
                <button onclick="window.location.href='/modules/finhelp.html'" class="flex flex-col items-center p-4 rounded-lg border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-colors">
                    <i class="fas fa-chart-pie text-2xl text-green-600 mb-2"></i>
                    <span class="text-sm font-medium text-slate-700">Check Finances</span>
                </button>
                <button onclick="window.location.href='/modules/family-hub.html'" class="flex flex-col items-center p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                    <i class="fas fa-users text-2xl text-blue-600 mb-2"></i>
                    <span class="text-sm font-medium text-slate-700">Family Tree</span>
                </button>
                <button onclick="window.location.href='/modules/ekhaya.html'" class="flex flex-col items-center p-4 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
                    <i class="fas fa-home text-2xl text-purple-600 mb-2"></i>
                    <span class="text-sm font-medium text-slate-700">Properties</span>
                </button>
                <button onclick="window.location.href='/quiz.html'" class="flex flex-col items-center p-4 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-colors">
                    <i class="fas fa-brain text-2xl text-amber-600 mb-2"></i>
                    <span class="text-sm font-medium text-slate-700">Take Quiz</span>
                </button>
                <button onclick="window.location.href='/assessment.html'" class="flex flex-col items-center p-4 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-colors">
                    <i class="fas fa-lightbulb text-2xl text-teal-600 mb-2"></i>
                    <span class="text-sm font-medium text-slate-700">Assessment</span>
                </button>
            </div>
        </div>
    `;
}

async function fetchAllModuleData() {
    try {
        // Fetch LifeCV data
        const lifeCvData = getLifeCvData();
        const lifeCvStats = calculateLifeCvStats(lifeCvData);
        
        // Fetch FinHelp data
        const finHelpData = await getDocument('userFinances', currentUser.uid) || {};
        const finHelpStats = calculateFinHelpStats(finHelpData);
        
        // Fetch Family Hub data
        const userData = await getDocument('users', currentUser.uid) || {};
        const familyData = userData.familyId ? await getDocument('families', userData.familyId) : null;
        const familyStats = calculateFamilyStats(familyData);
        
        // Fetch eKhaya data
        const ekhayaStats = await calculateEkhayaStats();
        
        // Fetch CommsHub data
        const commsStats = calculateCommsStats();
        
        // Fetch Assessment data
        const assessmentStats = await calculateAssessmentStats();
        
        // Generate recent activity from all modules
        const recentActivity = await generateCrossModuleActivity();
        
        // Calculate total activities
        const totalActivities = calculateTotalActivities(lifeCvData, finHelpData, familyData, assessmentStats);
        
        return {
            lifeCv: lifeCvStats,
            finHelp: finHelpStats,
            familyHub: familyStats,
            ekhaya: ekhayaStats,
            commsHub: commsStats,
            assessments: assessmentStats,
            notifications: { unreadCount: 0 }, // Will be updated by listenForNotifications
            recentActivity: recentActivity,
            totalActivities: totalActivities
        };
    } catch (error) {
        console.error('Error fetching module data:', error);
        return getDefaultModuleData();
    }
}

async function generateCrossModuleActivity() {
    const activities = [];
    
    try {
        // Get LifeCV entries for recent activity
        const lifeCvData = getLifeCvData();
        if (lifeCvData && typeof lifeCvData === 'object') {
            // Check for recent LifeCV updates
            Object.entries(lifeCvData).forEach(([sectionKey, sectionData]) => {
                if (Array.isArray(sectionData) && sectionData.length > 0) {
                    const latestEntry = sectionData[sectionData.length - 1];
                    if (latestEntry && latestEntry.sourcePlatform) {
                        activities.push({
                            icon: getIconForPlatform(latestEntry.sourcePlatform),
                            color: getColorForPlatform(latestEntry.sourcePlatform),
                            title: `${latestEntry.title || 'New Entry'}`,
                            description: `Added to LifeCV from ${latestEntry.sourcePlatform}`,
                            time: formatTimeAgo(latestEntry.completedAt),
                            module: latestEntry.sourcePlatform
                        });
                    }
                }
            });
        }
        
        // Get user data for other activities
        const userData = await getDocument('users', currentUser.uid) || {};
        
        // Quiz/Assessment activities
        if (userData.quizResults) {
            activities.push({
                icon: 'fas fa-brain',
                color: 'amber',
                title: 'Assessment Completed',
                description: 'Personal assessment quiz completed',
                time: formatTimeAgo(userData.quizResults.completedAt),
                module: 'Hub Assessment'
            });
        }
        
        // FinHelp activities
        const finHelpData = await getDocument('userFinances', currentUser.uid) || {};
        if (finHelpData.personal && finHelpData.personal.expenses && finHelpData.personal.expenses.length > 0) {
            activities.push({
                icon: 'fas fa-chart-pie',
                color: 'green',
                title: 'Financial Data Updated',
                description: 'Expense tracking updated in FinHelp',
                time: '1 day ago',
                module: 'FinHelp'
            });
        }
        
        // Family Hub activities
        if (userData.familyId) {
            const familyData = await getDocument('families', userData.familyId);
            if (familyData) {
                activities.push({
                    icon: 'fas fa-users',
                    color: 'blue',
                    title: 'Family Hub Active',
                    description: `Member of "${familyData.name || 'Family'}"`,
                    time: '2 days ago',
                    module: 'Family Hub'
                });
            }
        }
        
        // Sort by recency and limit to 10 items
        return activities
            .sort((a, b) => new Date(b.time) - new Date(a.time))
            .slice(0, 10);
            
    } catch (error) {
        console.error('Error generating cross-module activity:', error);
        return [];
    }
}

function calculateTotalActivities(lifeCvData, finHelpData, familyData, assessmentStats) {
    let total = 0;
    
    // Count LifeCV entries
    if (lifeCvData && typeof lifeCvData === 'object') {
        Object.values(lifeCvData).forEach(section => {
            if (Array.isArray(section)) {
                total += section.length;
            }
        });
    }
    
    // Count FinHelp activities
    if (finHelpData.personal) {
        total += (finHelpData.personal.expenses || []).length;
        total += (finHelpData.personal.income || []).length;
        total += (finHelpData.personal.assets || []).length;
    }
    
    // Count assessments
    total += assessmentStats.completedCount;
    
    return total;
}

async function calculateAssessmentStats() {
    try {
        const userData = await getDocument('users', currentUser.uid) || {};
        const lifeCvData = getLifeCvData();
        
        let completedCount = 0;
        
        // Count quiz results
        if (userData.quizResults) {
            completedCount++;
        }
        
        // Count assessment entries in LifeCV
        if (lifeCvData && lifeCvData.assessments && Array.isArray(lifeCvData.assessments)) {
            completedCount += lifeCvData.assessments.length;
        }
        
        return {
            completedCount,
            status: completedCount > 0 ? 'Active' : 'Available',
            hasNewRecommendations: completedCount === 0
        };
    } catch (error) {
        console.error('Error calculating assessment stats:', error);
        return {
            completedCount: 0,
            status: 'Available',
            hasNewRecommendations: false
        };
    }
}

function renderCrossModuleInsights(moduleData) {
    const insights = [];
    
    // LifeCV completeness insight
    if (moduleData.lifeCv.completeness < 50) {
        insights.push({
            icon: 'fas fa-exclamation-triangle',
            color: 'amber',
            title: 'Profile Needs Attention',
            description: 'Your LifeCV is less than 50% complete. Consider adding more information.'
        });
    }
    
    // Financial insight
    if (moduleData.finHelp.netWorth < 0) {
        insights.push({
            icon: 'fas fa-chart-line-down',
            color: 'red',
            title: 'Financial Review Needed',
            description: 'Your net worth is negative. Review your financial planning in FinHelp.'
        });
    }
    
    // Positive insights
    if (moduleData.lifeCv.completeness > 80) {
        insights.push({
            icon: 'fas fa-star',
            color: 'green',
            title: 'Strong Profile!',
            description: 'Your LifeCV is comprehensive and well-maintained.'
        });
    }
    
    if (insights.length === 0) {
        return '<p class="text-slate-500">No insights available yet. Use more modules to get personalized insights.</p>';
    }
    
    return insights.map(insight => `
        <div class="flex items-start space-x-3 p-3 bg-${insight.color}-50 rounded-lg">
            <div class="flex-shrink-0">
                <i class="${insight.icon} text-${insight.color}-600"></i>
            </div>
            <div>
                <h4 class="font-medium text-${insight.color}-900">${insight.title}</h4>
                <p class="text-sm text-${insight.color}-700">${insight.description}</p>
            </div>
        </div>
    `).join('');
}

function getIconForPlatform(platform) {
    const icons = {
        'Hub Assessment': 'fas fa-brain',
        'Hub Quiz': 'fas fa-question-circle',
        'FinHelp': 'fas fa-chart-pie',
        'Family Hub': 'fas fa-users',
        'LifeCV': 'fas fa-id-card',
        'eKhaya': 'fas fa-home',
        'CommsHub': 'fas fa-comments'
    };
    return icons[platform] || 'fas fa-circle';
}

function getColorForPlatform(platform) {
    const colors = {
        'Hub Assessment': 'amber',
        'Hub Quiz': 'purple',
        'FinHelp': 'green',
        'Family Hub': 'blue',
        'LifeCV': 'indigo',
        'eKhaya': 'purple',
        'CommsHub': 'teal'
    };
    return colors[platform] || 'slate';
}

function formatTimeAgo(dateString) {
    if (!dateString) return 'Recently';
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return 'Recently';
    } catch (error) {
        return 'Recently';
    }
}

function listenForActivityUpdates() {
    if (!currentUser) return;
    
    // Listen for LifeCV updates
    const lifeCvRef = collection(db, 'users', currentUser.uid, 'lifecv');
    const lifeCvQuery = query(lifeCvRef, orderBy('updatedAt', 'desc'), limit(5));
    
    onSnapshot(lifeCvQuery, (snapshot) => {
        if (!snapshot.empty) {
            updateRecentActivityDisplay();
        }
    }, (error) => {
        console.error('Error listening for LifeCV updates:', error);
    });
}

async function updateRecentActivityDisplay() {
    const recentActivityContainer = document.getElementById('recent-activity');
    if (!recentActivityContainer) return;
    
    try {
        const newActivity = await generateCrossModuleActivity();
        recentActivityContainer.innerHTML = renderRecentActivity(newActivity);
        
        // Update total activities count
        const moduleData = await fetchAllModuleData();
        const totalActivitiesEl = document.getElementById('total-activities');
        if (totalActivitiesEl) {
            totalActivitiesEl.textContent = moduleData.totalActivities;
        }
    } catch (error) {
        console.error('Error updating activity display:', error);
    }
}

// ...existing code continues with other functions...

function calculateLifeCvStats(lifeCvData) {
    if (!lifeCvData || typeof lifeCvData !== 'object') {
        return {
            completeness: 0,
            sectionsCompleted: 0,
            totalSections: 0,
            status: 'Not Started',
            lastUpdated: 'Never',
            hasRecommendations: true
        };
    }
    
    const sections = Object.keys(lifeCvData);
    const completedSections = sections.filter(key => {
        const section = lifeCvData[key];
        if (Array.isArray(section)) return section.length > 0;
        if (typeof section === 'object' && section !== null) {
            return Object.values(section).some(field => field && field.value);
        }
        return false;
    });
    
    const completeness = sections.length > 0 ? Math.round((completedSections.length / sections.length) * 100) : 0;
    
    return {
        completeness,
        sectionsCompleted: completedSections.length,
        totalSections: sections.length,
        status: completeness > 80 ? 'Complete' : completeness > 50 ? 'In Progress' : completeness > 0 ? 'Started' : 'Not Started',
        lastUpdated: 'Recently updated',
        hasRecommendations: completeness < 100
    };
}

function calculateFinHelpStats(finHelpData) {
    const personal = finHelpData.personal || {};
    const totalIncome = (personal.income || []).reduce((sum, item) => sum + (item.monthlyAmount || 0), 0);
    const totalExpenses = (personal.expenses || []).reduce((sum, item) => sum + (item.monthlyAmount || 0), 0);
    const totalAssets = (personal.assets || []).reduce((sum, item) => sum + (item.currentValue || 0), 0);
    const totalLiabilities = (personal.liabilities || []).reduce((sum, item) => sum + (item.currentBalance || 0), 0);
    
    return {
        netWorth: totalAssets - totalLiabilities,
        monthlySavings: totalIncome - totalExpenses,
        status: totalIncome > 0 ? 'Active' : 'Setup Required',
        hasAlerts: totalLiabilities > totalAssets
    };
}

function calculateFamilyStats(familyData) {
    if (!familyData) {
        return {
            memberCount: 0,
            status: 'No Family',
            hasPendingInvitations: false
        };
    }
    
    const memberCount = (familyData.members || []).length;
    const pendingInvitations = Object.keys(familyData.pendingInvitations || {}).length;
    
    return {
        memberCount,
        status: memberCount > 1 ? 'Active Family' : 'Solo Member',
        hasPendingInvitations: pendingInvitations > 0
    };
}

async function calculateEkhayaStats() {
    try {
        const propertiesData = await getDocument('users', currentUser.uid + '_properties') || {};
        const properties = propertiesData.properties || [];
        
        return {
            propertyCount: properties.length,
            status: properties.length > 0 ? 'Active' : 'No Properties',
            hasMaintenanceDue: false // TODO: Implement maintenance tracking
        };
    } catch (error) {
        return {
            propertyCount: 0,
            status: 'No Properties',
            hasMaintenanceDue: false
        };
    }
}

function calculateCommsStats() {
    return {
        unreadMessages: 0, // TODO: Implement message tracking
        status: 'Connected',
        hasUnread: false
    };
}

function renderRecentActivity(activities) {
    if (!activities || activities.length === 0) {
        return '<p class="text-slate-500">No recent activity</p>';
    }
    
    return activities.map(activity => `
        <div class="flex items-start space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
            <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-${activity.color}-100 rounded-full flex items-center justify-center">
                    <i class="${activity.icon} text-${activity.color}-600 text-sm"></i>
                </div>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-900">${activity.title}</p>
                <p class="text-sm text-slate-500">${activity.description}</p>
                <div class="flex items-center justify-between mt-1">
                    <p class="text-xs text-slate-400">${activity.time}</p>
                    <span class="text-xs text-${activity.color}-600 font-medium">${activity.module}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function getDefaultModuleData() {
    return {
        lifeCv: { completeness: 0, sectionsCompleted: 0, totalSections: 0, status: 'Not Started', lastUpdated: 'Never', hasRecommendations: true },
        finHelp: { netWorth: 0, monthlySavings: 0, status: 'Setup Required', hasAlerts: false },
        familyHub: { memberCount: 0, status: 'No Family', hasPendingInvitations: false },
        ekhaya: { propertyCount: 0, status: 'No Properties', hasMaintenanceDue: false },
        commsHub: { unreadMessages: 0, status: 'Connected', hasUnread: false },
        assessments: { completedCount: 0, status: 'Available', hasNewRecommendations: false },
        notifications: { unreadCount: 0 },
        recentActivity: [],
        totalActivities: 0
    };
}

function getKidsDashboardHTML() {
    return `
        <!-- Theme Selector for Kids -->
        <div class="mb-6 flex justify-center">
            <div class="kids-theme-selector flex items-center bg-white p-2 rounded-xl shadow-sm border-2 border-purple-200">
                <button data-theme="rainbow" class="theme-btn active mx-1 px-4 py-2 rounded-lg font-bold text-white bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 hover:scale-105 transition-transform">
                    🌈 Rainbow
                </button>
                <button data-theme="ocean" class="theme-btn mx-1 px-4 py-2 rounded-lg font-bold text-blue-800 bg-gradient-to-r from-blue-200 to-cyan-200 hover:scale-105 transition-transform">
                    🌊 Ocean
                </button>
                <button data-theme="forest" class="theme-btn mx-1 px-4 py-2 rounded-lg font-bold text-green-800 bg-gradient-to-r from-green-200 to-emerald-200 hover:scale-105 transition-transform">
                    🌲 Forest
                </button>
            </div>
        </div>

        <!-- Kids Dashboard Content -->
        <div id="kids-content" class="kids-dashboard-rainbow">
            <!-- Welcome Section -->
            <div class="text-center mb-8 p-6 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 rounded-2xl text-white shadow-lg">
                <div class="text-6xl mb-4">🎉</div>
                <h2 class="text-3xl font-bold mb-2">Welcome, Little Explorer!</h2>
                <p class="text-lg">Let's learn and have fun together!</p>
            </div>

            <!-- Fun Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div class="kids-card bg-gradient-to-br from-yellow-300 to-orange-400 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform">
                    <div class="text-4xl mb-2">⭐</div>
                    <h3 class="font-bold text-lg">Stars Earned</h3>
                    <p class="text-2xl font-bold">15</p>
                </div>
                
                <div class="kids-card bg-gradient-to-br from-green-300 to-blue-400 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform">
                    <div class="text-4xl mb-2">🏆</div>
                    <h3 class="font-bold text-lg">Achievements</h3>
                    <p class="text-2xl font-bold">3</p>
                </div>
                
                <div class="kids-card bg-gradient-to-br from-purple-300 to-pink-400 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform">
                    <div class="text-4xl mb-2">📚</div>
                    <h3 class="font-bold text-lg">Lessons Done</h3>
                    <p class="text-2xl font-bold">8</p>
                </div>
                
                <div class="kids-card bg-gradient-to-br from-red-300 to-yellow-400 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform">
                    <div class="text-4xl mb-2">🎮</div>
                    <h3 class="font-bold text-lg">Games Played</h3>
                    <p class="text-2xl font-bold">12</p>
                </div>
            </div>

            <!-- Learning Activities -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div class="kids-activity-card bg-white p-6 rounded-2xl shadow-lg border-4 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer">
                    <div class="text-5xl mb-4 text-center">🔤</div>
                    <h3 class="text-xl font-bold text-center text-blue-800 mb-2">Learn Letters</h3>
                    <p class="text-center text-gray-600">Practice your ABCs with fun games!</p>
                    <div class="mt-4 text-center">
                        <span class="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Level 2</span>
                    </div>
                </div>
                
                <div class="kids-activity-card bg-white p-6 rounded-2xl shadow-lg border-4 border-green-200 hover:border-green-400 transition-colors cursor-pointer">
                    <div class="text-5xl mb-4 text-center">🔢</div>
                    <h3 class="text-xl font-bold text-center text-green-800 mb-2">Count Numbers</h3>
                    <p class="text-center text-gray-600">Learn to count with colorful objects!</p>
                    <div class="mt-4 text-center">
                        <span class="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Level 1</span>
                    </div>
                </div>
                
                <div class="kids-activity-card bg-white p-6 rounded-2xl shadow-lg border-4 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer">
                    <div class="text-5xl mb-4 text-center">🎨</div>
                    <h3 class="text-xl font-bold text-center text-purple-800 mb-2">Draw & Color</h3>
                    <p class="text-center text-gray-600">Express yourself with colors and shapes!</p>
                    <div class="mt-4 text-center">
                        <span class="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">Creative</span>
                    </div>
                </div>
                
                <div class="kids-activity-card bg-white p-6 rounded-2xl shadow-lg border-4 border-yellow-200 hover:border-yellow-400 transition-colors cursor-pointer">
                    <div class="text-5xl mb-4 text-center">🧩</div>
                    <h3 class="text-xl font-bold text-center text-yellow-800 mb-2">Solve Puzzles</h3>
                    <p class="text-center text-gray-600">Challenge your brain with fun puzzles!</p>
                    <div class="mt-4 text-center">
                        <span class="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">Level 3</span>
                    </div>
                </div>
                
                <div class="kids-activity-card bg-white p-6 rounded-2xl shadow-lg border-4 border-red-200 hover:border-red-400 transition-colors cursor-pointer">
                    <div class="text-5xl mb-4 text-center">🎵</div>
                    <h3 class="text-xl font-bold text-center text-red-800 mb-2">Music Time</h3>
                    <p class="text-center text-gray-600">Learn songs and make music!</p>
                    <div class="mt-4 text-center">
                        <span class="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Fun</span>
                    </div>
                </div>
                
                <div class="kids-activity-card bg-white p-6 rounded-2xl shadow-lg border-4 border-teal-200 hover:border-teal-400 transition-colors cursor-pointer">
                    <div class="text-5xl mb-4 text-center">📖</div>
                    <h3 class="text-xl font-bold text-center text-teal-800 mb-2">Story Time</h3>
                    <p class="text-center text-gray-600">Read amazing stories and adventures!</p>
                    <div class="mt-4 text-center">
                        <span class="inline-block bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">Reading</span>
                    </div>
                </div>
            </div>

            <!-- Progress Section -->
            <div class="bg-white p-6 rounded-2xl shadow-lg mb-8">
                <h3 class="text-2xl font-bold text-center text-gray-800 mb-6">🌟 Your Amazing Progress! 🌟</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="text-center">
                        <div class="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span class="text-white text-2xl font-bold">85%</span>
                        </div>
                        <h4 class="font-bold text-gray-800">Letters Learned</h4>
                        <p class="text-gray-600 text-sm">22 out of 26 letters!</p>
                    </div>
                    
                    <div class="text-center">
                        <div class="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span class="text-white text-2xl font-bold">70%</span>
                        </div>
                        <h4 class="font-bold text-gray-800">Numbers Mastered</h4>
                        <p class="text-gray-600 text-sm">Can count to 70!</p>
                    </div>
                    
                    <div class="text-center">
                        <div class="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span class="text-white text-2xl font-bold">95%</span>
                        </div>
                        <h4 class="font-bold text-gray-800">Creativity Level</h4>
                        <p class="text-gray-600 text-sm">Amazing artist!</p>
                    </div>
                </div>
            </div>

            <!-- Rewards Section -->
            <div class="bg-gradient-to-r from-yellow-300 via-red-300 to-pink-300 p-6 rounded-2xl shadow-lg text-center">
                <h3 class="text-2xl font-bold text-white mb-4">🎁 Your Rewards! 🎁</h3>
                <div class="flex justify-center space-x-4 mb-4">
                    <div class="bg-white p-3 rounded-full">
                        <span class="text-2xl">🏅</span>
                    </div>
                    <div class="bg-white p-3 rounded-full">
                        <span class="text-2xl">🎖️</span>
                    </div>
                    <div class="bg-white p-3 rounded-full">
                        <span class="text-2xl">👑</span>
                    </div>
                </div>
                <p class="text-white font-medium">Keep learning to unlock more rewards!</p>
            </div>
        </div>

        <style>
            .kids-dashboard-rainbow {
                background: linear-gradient(45deg, #ff9a9e 0%, #fecfef 25%, #fecfef 50%, #fecfef 75%, #fecfef 100%);
                min-height: 100vh;
                padding: 20px;
                border-radius: 20px;
            }
            
            .kids-dashboard-ocean {
                background: linear-gradient(45deg, #a8edea 0%, #fed6e3 100%);
                min-height: 100vh;
                padding: 20px;
                border-radius: 20px;
            }
            
            .kids-dashboard-forest {
                background: linear-gradient(45deg, #d299c2 0%, #fef9d7 100%);
                min-height: 100vh;
                padding: 20px;
                border-radius: 20px;
            }
            
            .kids-card {
                animation: bounce 2s infinite;
            }
            
            .kids-activity-card {
                transition: all 0.3s ease;
            }
            
            .kids-activity-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            }
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-10px);
                }
                60% {
                    transform: translateY(-5px);
                }
            }
            
            .theme-btn.active {
                transform: scale(1.1);
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            }
        </style>

        <script>
            // Theme switching functionality
            setTimeout(() => {
                document.querySelectorAll('.theme-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        // Remove active class from all buttons
                        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                        
                        // Add active class to clicked button
                        this.classList.add('active');
                        
                        // Change theme
                        const theme = this.dataset.theme;
                        const content = document.getElementById('kids-content');
                        
                        // Remove all theme classes
                        content.className = content.className.replace(/kids-dashboard-\\w+/g, '');
                        
                        // Add new theme class
                        content.classList.add('kids-dashboard-' + theme);
                        
                        // Update welcome section colors based on theme
                        const welcomeSection = content.querySelector('.text-center.mb-8.p-6');
                        if (theme === 'ocean') {
                            welcomeSection.className = welcomeSection.className.replace(/from-purple-400 via-pink-400 to-red-400/, 'from-blue-400 via-cyan-400 to-teal-400');
                        } else if (theme === 'forest') {
                            welcomeSection.className = welcomeSection.className.replace(/from-purple-400 via-pink-400 to-red-400|from-blue-400 via-cyan-400 to-teal-400/, 'from-green-400 via-emerald-400 to-lime-400');
                        } else {
                            welcomeSection.className = welcomeSection.className.replace(/from-blue-400 via-cyan-400 to-teal-400|from-green-400 via-emerald-400 to-lime-400/, 'from-purple-400 via-pink-400 to-red-400');
                        }
                    });
                });
            }, 100);
        </script>
    `;
}

function calculateLifeCvStrength(lifeCv) {
    if (!lifeCv) return 0;
    const sections = Object.keys(lifeCv);
    const filledSections = sections.filter(key => {
        const section = lifeCv[key];
        if (Array.isArray(section)) return section.length > 0;
        if (typeof section === 'object' && section !== null) {
            return Object.values(section).some(field => field && field.value);
        }
        return false;
    });
    return sections.length > 0 ? Math.round((filledSections.length / sections.length) * 100) : 0;
}

function listenForNotifications() {
    if (!currentUser) return;

    const notificationsList = document.getElementById('notifications-list');
    const notificationCount = document.getElementById('notification-count');
    
    // **FIX:** Corrected Firestore query to listen to a subcollection on the user document.
    // This is more efficient and avoids needing a composite index.
    const notificationsRef = collection(db, 'users', currentUser.uid, 'notifications');
    const q = query(notificationsRef, where('read', '==', false), orderBy('timestamp', 'desc'), limit(5));

    onSnapshot(q, (snapshot) => {
        if (!notificationsList || !notificationCount) return;

        if (snapshot.empty) {
            notificationsList.innerHTML = `<p class="text-slate-500">No new notifications.</p>`;
            notificationCount.textContent = '0';
        } else {
            let notificationsHTML = '';
            snapshot.forEach(doc => {
                const notification = doc.data();
                notificationsHTML += `
                    <div class="flex items-start p-4 bg-slate-50 rounded-lg">
                        <div class="flex-shrink-0">
                            <i class="fas fa-info-circle text-blue-500 text-xl"></i>
                        </div>
                        <div class="ml-4 flex-grow">
                            <p class="font-semibold text-slate-800">${notification.title}</p>
                            <p class="text-sm text-slate-600">${notification.message}</p>
                        </div>
                        <a href="${notification.link || '#'}" class="text-sm font-semibold text-indigo-600 hover:underline">View</a>
                    </div>
                `;
            });
            notificationsList.innerHTML = notificationsHTML;
            notificationCount.textContent = snapshot.size;
        }
    }, (error) => {
        console.error("Error listening for notifications:", error);
        if (notificationsList) {
            notificationsList.innerHTML = `<p class="text-red-500 text-sm">Could not load notifications.</p>`;
        }
    });
}

// Initialize the dashboard when Firebase is ready
document.addEventListener('firebase-ready', () => {
    console.log('Firebase ready event received, initializing dashboard...');
    onAuthStateChanged(auth, (user) => {
        // **FIX:** Only initialize if there is an authenticated user.
        if (user) {
            console.log('User authenticated, initializing dashboard for:', user.email);
            init(user);
        } else {
            console.log('No user authenticated, dashboard will not initialize.');
            isInitialized = false; // Reset initialization state on sign-out
        }
    });
});