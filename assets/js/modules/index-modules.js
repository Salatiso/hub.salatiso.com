/* ================================================================================= */
/* FILE: assets/js/modules/index-modules.js - Index Modules Page Handler            */
/* PURPOSE: Handles the modules index page functionality                            */
/* ================================================================================= */

import { auth } from '../firebase-config-secure.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Initialize when Firebase is ready
document.addEventListener('firebase-ready', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            init(user);
        } else {
            showAuthRequired();
        }
    });
});

/**
 * Initialize the modules index page
 */
function init(user) {
    console.log('Index Modules: Initializing for user:', user.uid);
    
    // Show the app container
    const appContainer = document.getElementById('app-container');
    if (appContainer) {
        appContainer.style.visibility = 'visible';
    }
    
    // Update user greeting
    updateUserGreeting(user);
    
    // Setup module cards interaction
    setupModuleCards();
    
    // Setup quick actions
    setupQuickActions();
}

/**
 * Update user greeting
 */
function updateUserGreeting(user) {
    const greetingElement = document.querySelector('h1');
    if (greetingElement && user) {
        const displayName = user.displayName || user.email || 'User';
        const firstName = displayName.split(' ')[0];
        greetingElement.textContent = `Welcome to The Hub, ${firstName}`;
    }
}

/**
 * Setup module cards with hover effects and navigation
 */
function setupModuleCards() {
    const moduleCards = document.querySelectorAll('.bg-white.p-6.rounded-lg.shadow-md');
    
    moduleCards.forEach(card => {
        // Add click handlers for module links
        const links = card.querySelectorAll('a[href*="modules/"]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                
                // Show loading state
                showLoadingState(card);
                
                // Navigate to module
                setTimeout(() => {
                    window.location.href = href;
                }, 300);
            });
        });
        
        // Add hover effects
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-2px)';
            card.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        });
    });
}

/**
 * Setup quick actions functionality
 */
function setupQuickActions() {
    // Quick action links
    const quickActions = {
        'finhelp-expense': () => navigateToModule('/modules/finhelp.html', 'expenses'),
        'family-tasks': () => navigateToModule('/modules/family-hub.html', 'tasks'),
        'lifecv-update': () => navigateToModule('/modules/life-cv.html', 'edit'),
        'quiz-start': () => navigateToModule('/quiz.html')
    };
    
    // Attach click handlers
    Object.keys(quickActions).forEach(actionId => {
        const element = document.getElementById(actionId) || 
                       document.querySelector(`[data-action="${actionId}"]`);
        
        if (element) {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                quickActions[actionId]();
            });
        }
    });
}

/**
 * Navigate to a module with optional context
 */
function navigateToModule(url, context = null) {
    // Store context in sessionStorage if provided
    if (context) {
        sessionStorage.setItem('moduleContext', context);
    }
    
    // Show loading indicator
    showGlobalLoading();
    
    // Navigate
    window.location.href = url;
}

/**
 * Show loading state for a card
 */
function showLoadingState(card) {
    const originalContent = card.innerHTML;
    card.dataset.originalContent = originalContent;
    
    card.innerHTML = `
        <div class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span class="ml-3 text-gray-600">Loading...</span>
        </div>
    `;
}

/**
 * Show global loading indicator
 */
function showGlobalLoading() {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'global-loading';
    loadingOverlay.className = 'fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50';
    loadingOverlay.innerHTML = `
        <div class="text-center">
            <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p class="text-lg text-gray-600">Loading module...</p>
        </div>
    `;
    
    document.body.appendChild(loadingOverlay);
}

/**
 * Show authentication required message
 */
function showAuthRequired() {
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="flex items-center justify-center min-h-96">
                <div class="text-center">
                    <i class="fas fa-lock fa-3x text-gray-300 mb-4"></i>
                    <h2 class="text-2xl font-bold text-gray-700 mb-2">Authentication Required</h2>
                    <p class="text-gray-500 mb-4">Please log in to access The Hub modules</p>
                    <a href="login.html" class="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-sign-in-alt mr-2"></i>Log In
                    </a>
                </div>
            </div>
        `;
    }
}

/**
 * Handle module recommendations based on user activity
 */
function showModuleRecommendations(user) {
    // This could be enhanced with user analytics
    const recommendations = [
        {
            module: 'LifeCV',
            reason: 'Complete your professional profile',
            url: '/modules/life-cv.html',
            priority: 'high'
        },
        {
            module: 'FinHelp',
            reason: 'Track your financial goals',
            url: '/modules/finhelp.html',
            priority: 'medium'
        },
        {
            module: 'Family Hub',
            reason: 'Organize family activities',
            url: '/modules/family-hub.html',
            priority: 'low'
        }
    ];
    
    const recommendationsContainer = document.getElementById('recommendations');
    if (recommendationsContainer) {
        recommendationsContainer.innerHTML = recommendations.map(rec => `
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                <div class="flex items-center justify-between">
                    <div>
                        <h4 class="font-semibold text-blue-900">${rec.module}</h4>
                        <p class="text-sm text-blue-700">${rec.reason}</p>
                    </div>
                    <a href="${rec.url}" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                        Start
                    </a>
                </div>
            </div>
        `).join('');
    }
}

// Export for testing
export { init, navigateToModule, showModuleRecommendations };