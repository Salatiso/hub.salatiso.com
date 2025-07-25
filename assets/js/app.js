/* ================================================================================= */
/* FILE: assets/js/app.js (MASTER ENGINE - CORRECTED & STABLE)                       */
/* PURPOSE: This is the single engine for all module pages. It builds the UI,        */
/* handles auth, themes, and translations without using conflicting modules.         */
/* ================================================================================= */

// Import Firebase services
import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { initTranslations, applyTranslations } from './translations-engine.js';

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
            <div class="relative hidden sm:block">
                <input type="text" placeholder="Search..." data-translate-key="search_placeholder" class="pl-10 pr-4 py-2 border rounded-lg w-64 bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
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

    // This function injects the HTML into the placeholders
    function loadComponents() {
        const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (sidebarPlaceholder) sidebarPlaceholder.innerHTML = sidebarHTML;
        if (headerPlaceholder) headerPlaceholder.innerHTML = headerHTML;
    }
    
    // This function handles all event listeners for the components
    function setupEventListeners() {
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

});
