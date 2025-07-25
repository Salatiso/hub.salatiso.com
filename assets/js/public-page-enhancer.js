/* ================================================================================= */
/* FILE: assets/js/public-page-enhancer.js                                          */
/* PURPOSE: Adds theme switching and translation support to public pages            */
/* ================================================================================= */

import { initTranslations, applyTranslations, getAvailableLanguages } from './translations-engine.js';

class PublicPageEnhancer {
    constructor() {
        this.init();
    }

    async init() {
        this.addEnhancementBar();
        this.setupThemeSystem();
        await this.setupTranslations();
        this.attachEventListeners();
    }

    addEnhancementBar() {
        // Create a floating enhancement bar
        const enhancementBar = document.createElement('div');
        enhancementBar.id = 'enhancement-bar';
        enhancementBar.className = 'fixed top-4 right-4 z-50 flex items-center space-x-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 border border-gray-200 dark:border-gray-600';
        enhancementBar.innerHTML = `
            <!-- Theme Switcher -->
            <div class="relative">
                <button id="public-theme-btn" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title="Change Theme">
                    <i class="fas fa-palette text-lg"></i>
                </button>
                <div id="public-theme-menu" class="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-xl py-2 z-50 border border-gray-200 dark:border-gray-600">
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

            <!-- Language Switcher -->
            <div class="relative">
                <button id="public-language-btn" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title="Change Language">
                    <i class="fas fa-language text-lg"></i>
                </button>
                <div id="public-language-menu" class="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-xl py-2 z-50 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600">
                    <!-- Language options will be populated -->
                </div>
            </div>
        `;

        document.body.appendChild(enhancementBar);
    }

    setupThemeSystem() {
        // Apply theme from localStorage or system preference
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

        // Initialize theme
        const savedTheme = localStorage.getItem('theme') || 'system';
        applyTheme(savedTheme);

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (localStorage.getItem('theme') === 'system') {
                applyTheme('system');
            }
        });

        this.applyTheme = applyTheme;
    }

    async setupTranslations() {
        try {
            await initTranslations();
            this.populateLanguageMenu();
        } catch (error) {
            console.error('Error setting up translations:', error);
        }
    }

    populateLanguageMenu() {
        const languageMenu = document.getElementById('public-language-menu');
        if (!languageMenu) return;

        const availableLanguages = getAvailableLanguages();
        const currentLang = localStorage.getItem('preferredLanguage') || 'en';

        languageMenu.innerHTML = '';

        for (const [code, name] of Object.entries(availableLanguages)) {
            const button = document.createElement('button');
            button.dataset.lang = code;
            button.className = `language-option w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors ${code === currentLang ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : ''}`;
            
            const flagEmoji = this.getFlagEmoji(code);
            button.innerHTML = `
                <span class="mr-3 text-lg">${flagEmoji}</span>
                <span class="flex-grow">${name}</span>
                ${code === currentLang ? '<i class="fas fa-check ml-auto text-green-500"></i>' : ''}
            `;
            
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const newLang = button.dataset.lang;
                localStorage.setItem('preferredLanguage', newLang);
                
                // Reload the page to apply new language
                window.location.reload();
            });

            languageMenu.appendChild(button);
        }
    }

    getFlagEmoji(languageCode) {
        const flags = {
            'en': '🇺🇸', 'xh': '🇿🇦', 'zu': '🇿🇦', 'af': '🇿🇦', 'st': '🇿🇦',
            'nso': '🇿🇦', 'ts': '🇿🇦', 've': '🇿🇦', 'tn': '🇿🇦', 'ss': '🇿🇦',
            'nr': '🇿🇦', 'sw': '🇹🇿', 'pt': '🇵🇹', 'fr': '🇫🇷'
        };
        return flags[languageCode] || '🌐';
    }

    attachEventListeners() {
        // Theme switching
        const themeBtn = document.getElementById('public-theme-btn');
        const themeMenu = document.getElementById('public-theme-menu');
        const languageBtn = document.getElementById('public-language-btn');
        const languageMenu = document.getElementById('public-language-menu');

        // Setup dropdown toggles
        const setupDropdown = (button, menu) => {
            if (button && menu) {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Close other menus
                    const allMenus = [themeMenu, languageMenu];
                    allMenus.forEach(m => {
                        if (m !== menu) m.classList.add('hidden');
                    });
                    menu.classList.toggle('hidden');
                });
            }
        };

        setupDropdown(themeBtn, themeMenu);
        setupDropdown(languageBtn, languageMenu);

        // Theme switching event listeners
        document.querySelectorAll('.theme-option').forEach(button => {
            button.addEventListener('click', () => {
                this.applyTheme(button.dataset.theme);
                themeMenu?.classList.add('hidden');
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#enhancement-bar')) {
                themeMenu?.classList.add('hidden');
                languageMenu?.classList.add('hidden');
            }
        });
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PublicPageEnhancer();
    });
} else {
    new PublicPageEnhancer();
}

export default PublicPageEnhancer;