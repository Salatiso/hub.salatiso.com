/* ================================================================================= */
/* FILE: assets/js/app.js (MASTER ENGINE - REVISED)                                  */
/* PURPOSE: This script builds the UI, handles auth, theme, and language switching.  */
/* It loads the specific logic for the current page module.                          */
/* ================================================================================= */
import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { initTranslations, applyTranslations } from './translations-engine.js';

// --- 1. DEFINE SHARED UI COMPONENTS ---

const sidebarHTML = `
<aside id="app-sidebar" class="w-64 bg-white dark:bg-gray-800 shadow-lg p-4 flex flex-col h-full flex-shrink-0 transition-transform -translate-x-full lg:translate-x-0">
    <!-- Logo & Branding Block (using your provided SVG) -->
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

    <!-- Navigation -->
    <nav class="flex-grow space-y-2" id="main-nav">
        <a href="../modules/dashboard.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <i class="fas fa-home w-6 text-center"></i><span class="ml-3">Dashboard</span>
        </a>
        <a href="../modules/life-cv.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <i class="fas fa-id-card w-6 text-center"></i><span class="ml-3">LifeCV</span>
        </a>
        <a href="../modules/family-hub.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <i class="fas fa-users w-6 text-center"></i><span class="ml-3">Family Hub</span>
        </a>
        <a href="../modules/training.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <i class="fas fa-chalkboard-teacher w-6 text-center"></i><span class="ml-3">Training</span>
        </a>
        <a href="../modules/publications.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <i class="fas fa-book-open w-6 text-center"></i><span class="ml-3">Publications</span>
        </a>
        <a href="../modules/commshub.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <i class="fas fa-comments w-6 text-center"></i><span class="ml-3">CommsHub</span>
        </a>
        <a href="../quiz.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <i class="fas fa-brain w-6 text-center"></i><span class="ml-3">Holistic Quiz</span>
        </a>
    </nav>
    
    <!-- Footer of Sidebar -->
    <div class="mt-auto text-center text-xs text-gray-400 dark:text-gray-500">
        <p>&copy; 2025 Salatiso. All Rights Reserved.</p>
    </div>
</aside>
`;

const headerHTML = `
<header class="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
    <div class="flex items-center">
        <button id="menu-toggle" class="text-slate-600 dark:text-slate-300 hover:text-slate-900 lg:hidden mr-4">
            <i class="fas fa-bars text-xl"></i>
        </button>
        <div class="relative">
            <input type="text" placeholder="Search..." class="pl-10 pr-4 py-2 border rounded-lg w-64 bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        </div>
    </div>
    <div class="flex items-center space-x-4">
        <!-- Theme Switcher -->
        <div class="relative" id="theme-dropdown-container">
            <button id="theme-btn" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none">
                <i class="fas fa-palette text-xl"></i>
            </button>
            <div id="theme-menu" class="hidden absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 rounded-lg shadow-xl py-2 z-50">
                <button data-theme="dark" class="theme-option w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"><i class="fas fa-moon mr-2"></i>Dark</button>
                <button data-theme="light" class="theme-option w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"><i class="fas fa-sun mr-2"></i>Light</button>
            </div>
        </div>
        <!-- Language Switcher -->
        <div class="relative" id="language-dropdown-container">
            <button id="language-btn" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none">
                <i class="fas fa-language text-xl"></i>
            </button>
            <div id="language-menu" class="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-xl py-2 z-50 max-h-60 overflow-y-auto">
                 <!-- Language options will be populated by translations-engine.js -->
            </div>
        </div>
        <!-- User Menu -->
        <div class="relative" id="user-dropdown-container">
            <button id="user-menu-button" class="flex items-center space-x-2">
                <span id="user-email" class="hidden md:inline text-sm font-medium text-slate-700 dark:text-slate-300"></span>
                <img id="user-avatar" class="h-8 w-8 rounded-full" src="https://placehold.co/40x40/E2E8F0/475569?text=U" alt="User avatar">
            </button>
            <div id="user-menu" class="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-50">
                <a href="../modules/profile.html" class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-600">My Profile</a>
                <button id="logout-button" class="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50">Sign Out</button>
            </div>
        </div>
    </div>
</header>
`;


// --- 2. CORE INITIALIZATION LOGIC ---

// This function runs once the DOM is ready.
document.addEventListener('DOMContentLoaded', () => {
    // This event comes from auth.js, ensuring Firebase is ready first.
    document.addEventListener('firebase-ready', () => {
        onAuthStateChanged(auth, async (user) => {
            const appContainer = document.getElementById('app-container');
            if (!user) {
                // If no user, redirect to login page.
                const currentPage = window.location.pathname + window.location.search;
                window.location.replace(`../login.html?redirectUrl=${encodeURIComponent(currentPage)}`);
                return;
            }

            // If user exists, build the page.
            await buildAuthenticatedPage(user);
        });
    });
});


async function buildAuthenticatedPage(user) {
    injectUI();
    
    // Populate user-specific elements
    const userEmailEl = document.getElementById('user-email');
    const userAvatarEl = document.getElementById('user-avatar');
    if (userEmailEl) userEmailEl.textContent = user.isAnonymous ? 'Guest User' : user.email;
    if (userAvatarEl && user.photoURL) userAvatarEl.src = user.photoURL;

    // Initialize all interactive components
    setupEventListeners(user);
    setActiveNavLink();

    // Load page-specific module logic if it exists
    const pageModuleScript = document.body.dataset.moduleScript;
    if (pageModuleScript) {
        try {
            // Dynamically import the module for the current page
            const pageModule = await import(pageModuleScript);
            if (pageModule.init) {
                pageModule.init(user);
            }
        } catch (error) {
            console.error(`Failed to load page module '${pageModuleScript}':`, error);
        }
    }
    
    // Make the page visible after setup
    const appContainer = document.getElementById('app-container');
    if (appContainer) appContainer.style.visibility = 'visible';
}


// --- 3. UI & EVENT HANDLERS ---

function injectUI() {
    const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (sidebarPlaceholder) sidebarPlaceholder.innerHTML = sidebarHTML;
    if (headerPlaceholder) headerPlaceholder.innerHTML = headerHTML;
}

function setupEventListeners(user) {
    // User menu dropdown
    const userMenuButton = document.getElementById('user-menu-button');
    const userMenu = document.getElementById('user-menu');
    if (userMenuButton) {
        userMenuButton.addEventListener('click', () => userMenu.classList.toggle('hidden'));
    }

    // Theme switcher dropdown
    const themeBtn = document.getElementById('theme-btn');
    const themeMenu = document.getElementById('theme-menu');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => themeMenu.classList.toggle('hidden'));
    }
    
    // Language switcher dropdown
    const languageBtn = document.getElementById('language-btn');
    const languageMenu = document.getElementById('language-menu');
    if (languageBtn) {
        languageBtn.addEventListener('click', () => languageMenu.classList.toggle('hidden'));
    }

    // Global click to hide dropdowns
    document.addEventListener('click', (e) => {
        if (!userMenuButton?.contains(e.target)) userMenu?.classList.add('hidden');
        if (!themeBtn?.contains(e.target)) themeMenu?.classList.add('hidden');
        if (!languageBtn?.contains(e.target)) languageMenu?.classList.add('hidden');
    });

    // Logout button
    document.getElementById('logout-button').addEventListener('click', () => signOut(auth));
    
    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('app-sidebar');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => sidebar.classList.toggle('-translate-x-full'));
    }
    
    // Initialize Theme and Translations
    initTheme();
    initTranslations();
}

function setActiveNavLink() {
    const navLinks = document.querySelectorAll('#main-nav a');
    const currentPage = window.location.pathname.split('/').pop();
    navLinks.forEach(link => {
        if (link.getAttribute('href').endsWith(currentPage)) {
            link.classList.add('bg-indigo-100', 'dark:bg-indigo-900/50', 'text-indigo-700', 'dark:text-indigo-300', 'font-semibold');
        }
    });
}

// --- 4. THEME LOGIC ---
function initTheme() {
    const themeOptions = document.querySelectorAll('.theme-option');
    const applyTheme = (theme) => {
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };
    
    themeOptions.forEach(button => {
        button.addEventListener('click', () => {
            applyTheme(button.dataset.theme);
        });
    });

    // Apply saved theme on load
    const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark
    applyTheme(savedTheme);
}
