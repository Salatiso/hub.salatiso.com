/* ================================================================================= */
/* FILE: assets/js/app.js (MASTER ENGINE - CORRECTED & STABLE)                       */
/* PURPOSE: This is the single engine for all module pages. It builds the UI,        */
/* handles auth, themes, and translations without using conflicting modules.         */
/* ================================================================================= */

// Import Firebase services
import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

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
                <h1 class="text-2xl font-bold text-gray-800 dark:text-white font-poppins mt-2">The Hub</h1>
                <p class="text-gray-600 dark:text-gray-400 text-sm">by Salatiso</p>
            </a>
        </div>
        <nav class="flex-grow space-y-2" id="main-nav">
            <a href="../modules/dashboard.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas fa-home w-6 text-center"></i><span class="ml-3">Dashboard</span></a>
            <a href="../modules/life-cv.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas fa-id-card w-6 text-center"></i><span class="ml-3">LifeCV</span></a>
            <a href="../modules/family-hub.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas fa-users w-6 text-center"></i><span class="ml-3">Family Hub</span></a>
            <a href="../modules/finhelp.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas fa-chart-pie w-6 text-center"></i><span class="ml-3">FinHelp</span></a>
            <a href="../modules/hrhelp.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas fa-briefcase w-6 text-center"></i><span class="ml-3">HRHelp</span></a>
            <a href="../modules/legalhelp.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas fa-gavel w-6 text-center"></i><span class="ml-3">LegalHelp</span></a>
            <a href="../modules/docuhelp.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas fa-file-alt w-6 text-center"></i><span class="ml-3">DocuHelp</span></a>
            <a href="../modules/commshub.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas fa-comments w-6 text-center"></i><span class="ml-3">CommsHub</span></a>
            <a href="../modules/publications.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas fa-book-open w-6 text-center"></i><span class="ml-3">Publications</span></a>
            <a href="../modules/training.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas fa-chalkboard-teacher w-6 text-center"></i><span class="ml-3">Training</span></a>
            <a href="../quiz.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><i class="fas fa-brain w-6 text-center"></i><span class="ml-3">Holistic Quiz</span></a>
        </nav>
        <div class="mt-auto text-center text-xs text-gray-400 dark:text-gray-500">
            <p>&copy; 2025 Salatiso. All Rights Reserved.</p>
        </div>
    </aside>
    `;

    const headerHTML = `
    <header class="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
        <div class="flex items-center">
            <button id="menu-toggle" class="text-slate-600 dark:text-slate-300 hover:text-slate-900 lg:hidden mr-4"><i class="fas fa-bars text-xl"></i></button>
            <div class="relative hidden sm:block"><input type="text" placeholder="Search..." class="pl-10 pr-4 py-2 border rounded-lg w-64 bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"><i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i></div>
        </div>
        <div class="flex items-center space-x-4">
            <div class="relative" id="theme-dropdown-container">
                <button id="theme-btn" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"><i class="fas fa-palette text-xl"></i></button>
                <div id="theme-menu" class="hidden absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 rounded-lg shadow-xl py-2 z-50"><button data-theme="dark" class="theme-option w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"><i class="fas fa-moon mr-2"></i>Dark</button><button data-theme="light" class="theme-option w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"><i class="fas fa-sun mr-2"></i>Light</button></div>
            </div>
            <div class="relative" id="language-dropdown-container">
                <button id="language-btn" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"><i class="fas fa-language text-xl"></i></button>
                <div id="language-menu" class="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-xl py-2 z-50 max-h-60 overflow-y-auto"></div>
            </div>
            <div class="relative" id="user-dropdown-container">
                <button id="user-menu-button" class="flex items-center space-x-2"><span id="user-email" class="hidden md:inline text-sm font-medium text-slate-700 dark:text-slate-300"></span><img id="user-avatar" class="h-8 w-8 rounded-full" src="https://placehold.co/40x40/E2E8F0/475569?text=U" alt="User avatar"></button>
                <div id="user-menu" class="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-50"><a href="../modules/profile.html" class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-600">My Profile</a><button id="logout-button" class="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50">Sign Out</button></div>
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
                    menu.classList.toggle('hidden');
                });
            }
        };

        setupDropdown(userMenuButton, userMenu);
        setupDropdown(themeBtn, themeMenu);
        setupDropdown(languageBtn, languageMenu);
        
        document.addEventListener('click', () => {
            userMenu?.classList.add('hidden');
            themeMenu?.classList.add('hidden');
            languageMenu?.classList.add('hidden');
        });

        // Mobile sidebar toggle
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('app-sidebar');
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => sidebar.classList.toggle('-translate-x-full'));
        }

        // Logout
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => signOut(auth));
        }

        // Theme switching
        const applyTheme = (theme) => {
            localStorage.setItem('theme', theme);
            document.documentElement.classList.toggle('dark', theme === 'dark');
        };
        document.querySelectorAll('.theme-option').forEach(button => {
            button.addEventListener('click', () => applyTheme(button.dataset.theme));
        });
        applyTheme(localStorage.getItem('theme') || 'dark'); // Default to dark theme

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

    // Initialize Firebase authentication
    setupEventListeners();

    // The auth state listener is the gatekeeper
    onAuthStateChanged(auth, user => {
        const appContainer = document.getElementById('app-container');
        if (user) {
            // User is signed in.
            const userEmailEl = document.getElementById('user-email');
            if (userEmailEl) userEmailEl.textContent = user.isAnonymous ? 'Guest User' : user.email;

            // Make the main content visible
            if (appContainer) appContainer.style.visibility = 'visible';

            // Signal that Firebase is ready for other scripts (like training-lms.js)
            document.dispatchEvent(new CustomEvent('firebase-ready'));

        } else {
            // No user is signed in. Redirect to login.
            if (appContainer) { // Only redirect if on a protected page
                 window.location.replace('../login.html');
            }
        }
    });

});
