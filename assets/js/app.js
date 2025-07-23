/* ================================================================================= */
/* FILE: assets/js/app.js (MASTER ENGINE - FIXED)                                    */
/* PURPOSE: This script builds the UI and handles all core functionality.            */
/* It uses the global 'firebase' object to avoid module conflicts.                   */
/* ================================================================================= */

// Ensure this script runs after the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DEFINE SHARED UI COMPONENTS ---

    // ** FIX: Restored the full sidebar navigation in the correct order. **
    const sidebarHTML = `
    <aside id="app-sidebar" class="w-64 bg-white dark:bg-gray-800 shadow-lg p-4 flex flex-col h-full flex-shrink-0 transition-transform -translate-x-full lg:translate-x-0">
        <!-- Logo & Branding Block -->
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
            <a href="../modules/finhelp.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <i class="fas fa-chart-pie w-6 text-center"></i><span class="ml-3">FinHelp</span>
            </a>
            <a href="../modules/family-hub.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <i class="fas fa-users w-6 text-center"></i><span class="ml-3">Family Hub</span>
            </a>
            <a href="../modules/life-cv.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <i class="fas fa-id-card w-6 text-center"></i><span class="ml-3">LifeCV</span>
            </a>
            <a href="../modules/commshub.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <i class="fas fa-comments w-6 text-center"></i><span class="ml-3">CommsHub</span>
            </a>
            <a href="../modules/publications.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <i class="fas fa-book-open w-6 text-center"></i><span class="ml-3">Publications</span>
            </a>
            <a href="../modules/training.html" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <i class="fas fa-chalkboard-teacher w-6 text-center"></i><span class="ml-3">Training</span>
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
                     <!-- Language options are populated by the translation engine -->
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

    // --- 2. TRANSLATION ENGINE LOGIC ---
    const translationEngine = {
        availableLanguages: { 'en': 'English', 'xh': 'isiXhosa', 'zu': 'isiZulu', 'af': 'Afrikaans', 'st': 'Sesotho', 'nso': 'Sepedi', 'ts': 'Xitsonga', 've': 'Tshivenḓa', 'tn': 'Setswana', 'ss': 'siSwati', 'nr': 'isiNdebele', 'sw': 'Kiswahili', 'pt': 'Português', 'fr': 'Français' },
        currentTranslations: {},
        async loadLanguage(lang = 'en') {
            try {
                // ** FIX: Corrected the path to the translation files. **
                const response = await fetch(`../assets/js/translations/${lang}.js`);
                if (!response.ok) throw new Error(`Failed to load ${lang}.js`);
                const scriptText = await response.text();
                // This is a way to load the translation object from a non-module script
                this.currentTranslations = new Function(`${scriptText}; return translations;`)();
            } catch (error) {
                console.warn(`Translation for '${lang}' not found. Defaulting to 'en'.`, error);
                if (lang !== 'en') {
                    await this.loadLanguage('en');
                }
            }
        },
        translate(key) {
            return this.currentTranslations[key] || `[${key}]`;
        },
        apply() {
            document.querySelectorAll('[data-translate-key]').forEach(element => {
                const key = element.getAttribute('data-translate-key');
                if (element.placeholder) element.placeholder = this.translate(key);
                else element.textContent = this.translate(key);
            });
        },
        populateMenu() {
            const languageMenu = document.getElementById('language-menu');
            if (!languageMenu) return;
            languageMenu.innerHTML = '';
            for (const [code, name] of Object.entries(this.availableLanguages)) {
                const button = document.createElement('button');
                button.dataset.lang = code;
                button.className = 'language-option w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600';
                button.textContent = name;
                button.addEventListener('click', async () => {
                    localStorage.setItem('preferredLanguage', code);
                    await this.loadLanguage(code);
                    this.apply();
                    languageMenu.classList.add('hidden');
                });
                languageMenu.appendChild(button);
            }
        },
        async init() {
            const savedLang = localStorage.getItem('preferredLanguage') || 'en';
            this.populateMenu();
            await this.loadLanguage(savedLang);
            this.apply();
        }
    };

    // --- 3. AUTH & INITIALIZATION LOGIC ---
    function initializePage() {
        if (typeof firebase === 'undefined') {
            console.error("Firebase is not loaded. Make sure the Firebase SDK scripts are included in your HTML before this app.js script.");
            return;
        }

        const auth = firebase.auth();
        let firebaseReadyDispatched = false;

        firebase.auth().onAuthStateChanged(async (user) => {
            const isProtectedPage = !!document.getElementById('app-container');

            if (user) {
                if (isProtectedPage) {
                    await buildAuthenticatedPage(user);
                }
            } else {
                if (isProtectedPage) {
                    window.location.replace(`../login.html`);
                }
            }
            
            if (!firebaseReadyDispatched) {
                document.dispatchEvent(new CustomEvent('firebase-ready'));
                firebaseReadyDispatched = true;
            }
        });
    }

    async function buildAuthenticatedPage(user) {
        injectUI();
        const userEmailEl = document.getElementById('user-email');
        if (userEmailEl) userEmailEl.textContent = user.isAnonymous ? 'Guest User' : user.email;
        setupEventListeners();
        setActiveNavLink();
        await translationEngine.init(); // Initialize translations
        initTheme();
        const appContainer = document.getElementById('app-container');
        if (appContainer) appContainer.style.visibility = 'visible';
    }

    // --- 4. UI & EVENT HANDLERS ---
    function injectUI() {
        const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (sidebarPlaceholder) sidebarPlaceholder.innerHTML = sidebarHTML;
        if (headerPlaceholder) headerPlaceholder.innerHTML = headerHTML;
    }

    function setupEventListeners() {
        const userMenuButton = document.getElementById('user-menu-button');
        const userMenu = document.getElementById('user-menu');
        const themeBtn = document.getElementById('theme-btn');
        const themeMenu = document.getElementById('theme-menu');
        const languageBtn = document.getElementById('language-btn');
        const languageMenu = document.getElementById('language-menu');
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('app-sidebar');

        if (userMenuButton) userMenuButton.addEventListener('click', (e) => { e.stopPropagation(); userMenu.classList.toggle('hidden'); });
        if (themeBtn) themeBtn.addEventListener('click', (e) => { e.stopPropagation(); themeMenu.classList.toggle('hidden'); });
        if (languageBtn) languageBtn.addEventListener('click', (e) => { e.stopPropagation(); languageMenu.classList.toggle('hidden'); });
        if (menuToggle) menuToggle.addEventListener('click', () => sidebar.classList.toggle('-translate-x-full'));
        
        document.addEventListener('click', () => {
            userMenu?.classList.add('hidden');
            themeMenu?.classList.add('hidden');
            languageMenu?.classList.add('hidden');
        });

        document.getElementById('logout-button').addEventListener('click', () => firebase.auth().signOut());
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

    function initTheme() {
        const applyTheme = (theme) => {
            localStorage.setItem('theme', theme);
            document.documentElement.classList.toggle('dark', theme === 'dark');
        };
        document.querySelectorAll('.theme-option').forEach(button => {
            button.addEventListener('click', () => applyTheme(button.dataset.theme));
        });
        applyTheme(localStorage.getItem('theme') || 'dark');
    }

    // --- 5. SCRIPT EXECUTION ---
    initializePage();
});
