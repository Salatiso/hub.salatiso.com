/* ================================================================================= */
/* FILE: assets/js/app.js (MASTER ENGINE - CORRECTED & STABLE)                       */
/* PURPOSE: This is the single engine for all module pages. It builds the UI,        */
/* handles auth, themes, and translations without using conflicting modules.         */
/* ================================================================================= */

// Import Firebase services
import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { initTranslations, applyTranslations } from './translations-engine.js';

// Add LifeCV imports at the top
import { init as initLifeCV } from './modules/life-cv.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DEFINE SHARED UI COMPONENTS ---

    // **FIX: Sidebar menu restored to the correct, full version.**
    const sidebarHTML = `
    <aside id="app-sidebar" class="w-64 bg-white dark:bg-gray-800 shadow-lg p-4 flex flex-col h-full flex-shrink-0 transition-transform -translate-x-full lg:translate-x-0 z-40">
        <div class="text-center mb-8 pt-4">
            <a href="../modules/dashboard.html" class="inline-block group">
                <svg viewBox="0 0 100 100" class="h-16 w-16 mx-auto text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="8" fill="none"/>
                    <path d="M50 10 L 50 90 M10 50 L 90 50" stroke="#4b5563" stroke-width="2"/>
                    <path d="M50 10 L 40 25 L 60 25 Z" fill="currentColor"/>
                </svg>
                <h1 class="text-2xl font-bold text-gray-800 dark:text-white font-poppins mt-2" data-translate-key="app_title">The Hub</h1>
                <p class="text-gray-600 dark:text-gray-400 text-sm">by Salatiso</p>
            </a>
        </div>
        <nav class="flex-grow space-y-2" id="main-nav">
            <a href="../modules/dashboard.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas fa-home w-6 text-center"></i><span class="ml-3" data-translate-key="nav_dashboard">Dashboard</span></a>
            <a href="../modules/life-cv.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas fa-id-card w-6 text-center"></i><span class="ml-3" data-translate-key="nav_lifecv">LifeCV</span></a>
            <a href="../modules/family-hub.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas fa-users w-6 text-center"></i><span class="ml-3" data-translate-key="nav_family">Family Hub</span></a>
            <a href="../modules/finhelp.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas fa-chart-pie w-6 text-center"></i><span class="ml-3" data-translate-key="nav_finhelp">FinHelp</span></a>
            <a href="../modules/hrhelp.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas fa-briefcase w-6 text-center"></i><span class="ml-3" data-translate-key="nav_hrhelp">HRHelp</span></a>
            <a href="../modules/legalhelp.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas fa-gavel w-6 text-center"></i><span class="ml-3" data-translate-key="nav_legalhelp">LegalHelp</span></a>
            <a href="../modules/docuhelp.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas fa-file-alt w-6 text-center"></i><span class="ml-3" data-translate-key="nav_docuhelp">DocuHelp</span></a>
            <a href="../modules/commshub.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas fa-comments w-6 text-center"></i><span class="ml-3" data-translate-key="nav_commshub">CommsHub</span></a>
            <a href="../modules/publications.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas fa-book-open w-6 text-center"></i><span class="ml-3" data-translate-key="nav_publications">Publications</span></a>
            <a href="../modules/training.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas fa-chalkboard-teacher w-6 text-center"></i><span class="ml-3" data-translate-key="nav_training">Training</span></a>
            <a href="../assessment.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas fa-clipboard-check w-6 text-center"></i><span class="ml-3" data-translate-key="nav_assessment">Assessment</span></a>
            <a href="../quiz.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas fa-brain w-6 text-center"></i><span class="ml-3" data-translate-key="nav_quiz">Holistic Quiz</span></a>
        </nav>
        <div class="mt-auto text-center text-xs text-gray-400 dark:text-gray-500">
            <p data-translate-key="footer_copyright">&copy; 2025 Salatiso. All Rights Reserved.</p>
        </div>
    </aside>
    `;

    const headerHTML = `
    <header class="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
        <div class="flex items-center">
            <button id="menu-toggle" class="text-slate-600 dark:text-slate-300 hover:text-slate-900 lg:hidden mr-4"><i class="fas fa-bars text-xl"></i></button>
            <div class="relative hidden sm:block" id="search-container">
                <input type="text" id="search-input" placeholder="Search..." data-translate-key="search_placeholder" class="pl-10 pr-4 py-2 border rounded-lg w-64 bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <button id="search-button" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors">
                    <i class="fas fa-search"></i>
                </button>
                <div id="search-results" class="hidden absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
                    <!-- Search results will appear here -->
                </div>
            </div>
        </div>
        <div class="flex items-center space-x-4">
            <div class="relative" id="theme-dropdown-container">
                <button id="theme-btn" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="Change Theme">
                    <i class="fas fa-palette text-xl"></i>
                </button>
                <div id="theme-menu" class="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-xl py-2 z-50 border border-gray-200 dark:border-gray-600">
                    <button data-theme="light" class="theme-option w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                        <i class="fas fa-sun mr-3 text-yellow-500"></i>
                        <span data-translate-key="theme_light">Light Theme</span>
                    </button>
                    <button data-theme="dark" class="theme-option w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                        <i class="fas fa-moon mr-3 text-blue-500"></i>
                        <span data-translate-key="theme_dark">Dark Theme</span>
                    </button>
                    <button data-theme="system" class="theme-option w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                        <i class="fas fa-desktop mr-3 text-gray-500"></i>
                        <span data-translate-key="theme_system">System</span>
                    </button>
                </div>
            </div>
            <div class="relative" id="language-dropdown-container">
                <button id="language-btn" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="Change Language">
                    <i class="fas fa-language text-xl"></i>
                </button>
                <div id="language-menu" class="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-xl py-2 z-50 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600">
                    <!-- Language options will be populated by translations-engine.js -->
                </div>
            </div>
            <div class="relative" id="user-dropdown-container">
                <button id="user-menu-button" class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span id="user-email" class="hidden md:inline text-sm font-medium text-slate-700 dark:text-slate-300">Loading...</span>
                    <img id="user-avatar" class="h-8 w-8 rounded-full border-2 border-gray-300 dark:border-gray-600" src="https://placehold.co/40x40/E2E8F0/475569?text=U" alt="User avatar">
                </button>
                <div id="user-menu" class="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-600">
                    <a href="../modules/profile.html" class="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-600">
                        <i class="fas fa-user mr-3"></i>
                        <span data-translate-key="user_profile">My Profile</span>
                    </a>
                    <button id="logout-button" class="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50">
                        <i class="fas fa-sign-out-alt mr-3"></i>
                        <span data-translate-key="user_signout">Sign Out</span>
                    </button>
                </div>
            </div>
        </div>
    </header>
    `;

    // --- 2. SEARCH DATABASE ---
    const searchDatabase = [
        // Pages
        { title: "Dashboard", description: "Main overview of all your tools and data", url: "../modules/dashboard.html", type: "page", icon: "fas fa-home" },
        { title: "LifeCV", description: "Manage your career, education, and life achievements", url: "../modules/life-cv.html", type: "page", icon: "fas fa-id-card" },
        { title: "Family Hub", description: "Family planning, communication, and coordination", url: "../modules/family-hub.html", type: "page", icon: "fas fa-users" },
        { title: "FinHelp", description: "Personal and business financial management", url: "../modules/finhelp.html", type: "page", icon: "fas fa-chart-pie" },
        { title: "HRHelp", description: "Human resources and employment management", url: "../modules/hrhelp.html", type: "page", icon: "fas fa-briefcase" },
        { title: "LegalHelp", description: "Legal document management and legal matter tracking", url: "../modules/legalhelp.html", type: "page", icon: "fas fa-gavel" },
        { title: "DocuHelp", description: "Document creation, templates, and management", url: "../modules/docuhelp.html", type: "page", icon: "fas fa-file-alt" },
        { title: "CommsHub", description: "Communication tools and messaging", url: "../modules/commshub.html", type: "page", icon: "fas fa-comments" },
        { title: "Publications", description: "Access to publications and research materials", url: "../modules/publications.html", type: "page", icon: "fas fa-book-open" },
        { title: "Training", description: "Educational courses and training materials", url: "../modules/training.html", type: "page", icon: "fas fa-chalkboard-teacher" },
        { title: "Assessment", description: "Tool recommendation assessment", url: "../assessment.html", type: "page", icon: "fas fa-clipboard-check" },
        { title: "Personal Quiz", description: "Holistic personal discovery quiz", url: "../quiz.html", type: "page", icon: "fas fa-brain" },
        
        // Features
        { title: "Budget Tracking", description: "Track your income and expenses", url: "../modules/finhelp.html", type: "feature", icon: "fas fa-calculator" },
        { title: "Career Timeline", description: "Document your career progression", url: "../modules/life-cv.html", type: "feature", icon: "fas fa-timeline" },
        { title: "Family Calendar", description: "Shared family scheduling", url: "../modules/family-hub.html", type: "feature", icon: "fas fa-calendar" },
        { title: "Legal Templates", description: "Pre-made legal document templates", url: "../modules/legalhelp.html", type: "feature", icon: "fas fa-file-contract" },
        { title: "Invoice Generator", description: "Create professional invoices", url: "../modules/finhelp.html", type: "feature", icon: "fas fa-file-invoice" },
        { title: "Skills Tracking", description: "Monitor your skill development", url: "../modules/life-cv.html", type: "feature", icon: "fas fa-chart-line" },
        { title: "Goal Setting", description: "Set and track personal goals", url: "../modules/family-hub.html", type: "feature", icon: "fas fa-bullseye" },
        { title: "Document Storage", description: "Secure document storage and organization", url: "../modules/docuhelp.html", type: "feature", icon: "fas fa-cloud" },
        
        // Tools
        { title: "Tax Calculator", description: "Calculate your South African tax obligations", url: "../modules/finhelp.html", type: "tool", icon: "fas fa-percent" },
        { title: "Contract Builder", description: "Build custom contracts and agreements", url: "../modules/legalhelp.html", type: "tool", icon: "fas fa-hammer" },
        { title: "Resume Builder", description: "Create professional resumes", url: "../modules/life-cv.html", type: "tool", icon: "fas fa-file-alt" },
        { title: "Expense Tracker", description: "Track daily expenses and spending patterns", url: "../modules/finhelp.html", type: "tool", icon: "fas fa-money-bill-wave" },
        { title: "Time Tracker", description: "Track time spent on various activities", url: "../modules/hrhelp.html", type: "tool", icon: "fas fa-clock" },
        { title: "Meeting Scheduler", description: "Schedule and manage meetings", url: "../modules/commshub.html", type: "tool", icon: "fas fa-calendar-plus" },
        
        // Help Topics
        { title: "Constitutional Rights", description: "Learn about your constitutional rights in South Africa", url: "../modules/training.html", type: "help", icon: "fas fa-balance-scale" },
        { title: "Financial Planning", description: "Guide to personal financial planning", url: "../modules/finhelp.html", type: "help", icon: "fas fa-piggy-bank" },
        { title: "Legal Procedures", description: "Understanding legal processes and procedures", url: "../modules/legalhelp.html", type: "help", icon: "fas fa-gavel" },
        { title: "Career Development", description: "Tips for advancing your career", url: "../modules/life-cv.html", type: "help", icon: "fas fa-rocket" },
        { title: "Family Communication", description: "Improving family communication strategies", url: "../modules/family-hub.html", type: "help", icon: "fas fa-heart" }
    ];

    // This function injects the HTML into the placeholders
    function loadComponents() {
        const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (sidebarPlaceholder) sidebarPlaceholder.innerHTML = sidebarHTML;
        if (headerPlaceholder) headerPlaceholder.innerHTML = headerHTML;
    }
    
    // --- 3. SEARCH FUNCTIONALITY ---
    function initializeSearch() {
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');
        const searchResults = document.getElementById('search-results');
        
        if (!searchInput || !searchButton || !searchResults) return;

        let searchTimeout;

        // Search function
        function performSearch(query) {
            if (!query || query.trim().length < 2) {
                searchResults.classList.add('hidden');
                return;
            }

            const normalizedQuery = query.toLowerCase().trim();
            const results = searchDatabase.filter(item => 
                item.title.toLowerCase().includes(normalizedQuery) ||
                item.description.toLowerCase().includes(normalizedQuery)
            ).slice(0, 8); // Limit to 8 results

            displaySearchResults(results, normalizedQuery);
        }

        // Display search results
        function displaySearchResults(results, query) {
            if (results.length === 0) {
                searchResults.innerHTML = `
                    <div class="p-4 text-center text-gray-500 dark:text-gray-400">
                        <i class="fas fa-search text-2xl mb-2"></i>
                        <p>No results found for "${query}"</p>
                    </div>
                `;
                searchResults.classList.remove('hidden');
                return;
            }

            const resultsHTML = results.map(result => `
                <a href="${result.url}" class="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0">
                    <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-3">
                        <i class="${result.icon} text-indigo-600 dark:text-indigo-400"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="text-sm font-semibold text-gray-900 dark:text-white truncate">${result.title}</h4>
                        <p class="text-xs text-gray-500 dark:text-gray-400 truncate">${result.description}</p>
                        <span class="inline-block mt-1 px-2 py-1 text-xs rounded-full ${getTypeColor(result.type)}">${capitalizeFirst(result.type)}</span>
                    </div>
                    <i class="fas fa-arrow-right text-gray-400 ml-2"></i>
                </a>
            `).join('');

            searchResults.innerHTML = resultsHTML;
            searchResults.classList.remove('hidden');
        }

        // Helper function to get type-specific colors
        function getTypeColor(type) {
            const colors = {
                'page': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
                'feature': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                'tool': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
                'help': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
            };
            return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }

        // Helper function to capitalize first letter
        function capitalizeFirst(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        // Event listeners
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(e.target.value);
            }, 300); // Debounce search
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch(e.target.value);
            }
            if (e.key === 'Escape') {
                searchResults.classList.add('hidden');
                searchInput.blur();
            }
        });

        searchButton.addEventListener('click', () => {
            performSearch(searchInput.value);
        });

        // Hide search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#search-container')) {
                searchResults.classList.add('hidden');
            }
        });

        // Show recent searches when input is focused (optional)
        searchInput.addEventListener('focus', () => {
            if (!searchInput.value.trim()) {
                // Show popular/recent items
                const popularItems = searchDatabase.filter(item => item.type === 'page').slice(0, 5);
                displaySearchResults(popularItems, '');
            }
        });
    }
    
    // This function handles all event listeners for the components
    function setupEventListeners() {
        // Initialize search first
        initializeSearch();

        // Dropdown menus
        const userMenuButton = document.getElementById('user-menu-button');
        const userMenu = document.getElementById('user-menu');
        const themeBtn = document.getElementById('theme-btn');
        const themeMenu = document.getElementById('theme-menu');
        const languageBtn = document.getElementById('language-btn');
        const languageMenu = document.getElementById('language-menu');
        
        const setupDropdown = (button, menu) => {
            if (button && menu) {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Close other menus
                    document.querySelectorAll('.dropdown-menu').forEach(m => {
                        if (m !== menu) m.classList.add('hidden');
                    });
                    menu.classList.toggle('hidden');
                });
            }
        };

        // Add dropdown-menu class for easier management
        userMenu?.classList.add('dropdown-menu');
        themeMenu?.classList.add('dropdown-menu');
        languageMenu?.classList.add('dropdown-menu');

        setupDropdown(userMenuButton, userMenu);
        setupDropdown(themeBtn, themeMenu);
        setupDropdown(languageBtn, languageMenu);
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#user-dropdown-container')) {
                userMenu?.classList.add('hidden');
            }
            if (!e.target.closest('#theme-dropdown-container')) {
                themeMenu?.classList.add('hidden');
            }
            if (!e.target.closest('#language-dropdown-container')) {
                languageMenu?.classList.add('hidden');
            }
        });

        // Mobile sidebar toggle
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('app-sidebar');
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('-translate-x-full');
            });
        }

        // Logout
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', async () => {
                try {
                    await signOut(auth);
                    window.location.replace('../login.html');
                } catch (error) {
                    console.error('Error signing out:', error);
                }
            });
        }

        // Enhanced theme switching with system preference support
        const applyTheme = (theme) => {
            localStorage.setItem('theme', theme);
            
            if (theme === 'system') {
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.classList.toggle('dark', systemPrefersDark);
            } else {
                document.documentElement.classList.toggle('dark', theme === 'dark');
            }

            // Update active theme button
            document.querySelectorAll('.theme-option').forEach(btn => {
                btn.classList.remove('bg-indigo-100', 'dark:bg-indigo-900', 'text-indigo-700', 'dark:text-indigo-300');
                if (btn.dataset.theme === theme) {
                    btn.classList.add('bg-indigo-100', 'dark:bg-indigo-900', 'text-indigo-700', 'dark:text-indigo-300');
                }
            });
        };

        // Theme switching event listeners
        document.querySelectorAll('.theme-option').forEach(button => {
            button.addEventListener('click', () => {
                applyTheme(button.dataset.theme);
                themeMenu?.classList.add('hidden');
            });
        });

        // Initialize theme
        const savedTheme = localStorage.getItem('theme') || 'system';
        applyTheme(savedTheme);

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (localStorage.getItem('theme') === 'system') {
                applyTheme('system');
            }
        });

        // Highlight active navigation link
        const navLinks = document.querySelectorAll('#main-nav a');
        const currentPage = window.location.pathname.split('/').pop();
        navLinks.forEach(link => {
            if (link.getAttribute('href').endsWith(currentPage)) {
                link.classList.add('bg-indigo-100', 'dark:bg-indigo-900/50', 'text-indigo-700', 'dark:text-indigo-300', 'font-semibold');
            }
        });
    }

    // --- MAIN EXECUTION ---
    loadComponents(); // Build the page structure first
    setupEventListeners(); // Set up event listeners

    // Initialize translations
    initTranslations().then(() => {
        console.log('Translations initialized');
    }).catch(error => {
        console.error('Error initializing translations:', error);
    });

    // The auth state listener is the gatekeeper
    onAuthStateChanged(auth, user => {
        const appContainer = document.getElementById('app-container');
        if (user) {
            // User is signed in.
            const userEmailEl = document.getElementById('user-email');
            if (userEmailEl) {
                userEmailEl.textContent = user.isAnonymous ? 'Guest User' : (user.displayName || user.email);
            }

            // Update user avatar if available
            const userAvatarEl = document.getElementById('user-avatar');
            if (userAvatarEl && user.photoURL) {
                userAvatarEl.src = user.photoURL;
            }

            // Make the main content visible
            if (appContainer) appContainer.style.visibility = 'visible';

            // Signal that Firebase is ready for other scripts
            document.dispatchEvent(new CustomEvent('firebase-ready'));

        } else {
            // No user is signed in. Redirect to login.
            if (appContainer) { // Only redirect if on a protected page
                 window.location.replace('../login.html');
            }
        }
    });

    // Add to the module initialization section
    async function initializeModule(user) {
        const currentModule = getCurrentModule();
        
        try {
            showLoadingState();
            
            switch (currentModule) {
                case 'life-cv':
                    await initLifeCV(user);
                    break;
                // ...existing cases...
            }
            
            hideLoadingState();
            
        } catch (error) {
            console.error(`Error initializing ${currentModule}:`, error);
            showErrorState(error);
        }
    }

});
