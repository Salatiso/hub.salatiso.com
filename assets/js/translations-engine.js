/* ================================================================================= */
/* FILE: assets/js/translations-engine.js                                            */
/* PURPOSE: Handles loading language files and applying translations to the DOM.     */
/* ================================================================================= */

// Available languages for the dropdown
const availableLanguages = {
    'en': 'English',
    'xh': 'isiXhosa',
    'zu': 'isiZulu',
    'af': 'Afrikaans',
    'st': 'Sesotho',
    'nso': 'Sepedi',
    'ts': 'Xitsonga',
    've': 'Tshivenḓa',
    'tn': 'Setswana',
    'ss': 'siSwati',
    'nr': 'isiNdebele',
    'sw': 'Kiswahili',
    'pt': 'Português',
    'fr': 'Français'
};

let currentTranslations = {};

async function loadLanguage(lang = 'en') {
    try {
        // Use a relative path that works from any module page
        const module = await import(`./translations/${lang}.js`);
        currentTranslations = module.default;
        console.log(`Loaded translations for: ${lang}`);
    } catch (error) {
        console.warn(`Translation for '${lang}' not found. Defaulting to 'en'.`, error);
        try {
            const module = await import(`./translations/en.js`);
            currentTranslations = module.default;
        } catch (fallbackError) {
            console.error('Could not load fallback English translations:', fallbackError);
            currentTranslations = {}; // Fallback to empty object
        }
    }
}

function translate(key) {
    return currentTranslations[key] || `[${key}]`; // Return key if not found
}

export function applyTranslations() {
    document.querySelectorAll('[data-translate-key]').forEach(element => {
        const key = element.getAttribute('data-translate-key');
        const translatedText = translate(key);
        
        if (element.placeholder !== undefined) {
            element.placeholder = translatedText;
        } else {
            element.textContent = translatedText;
        }
    });
}

function populateLanguageMenu() {
    const languageMenu = document.getElementById('language-menu');
    if (!languageMenu) return;

    languageMenu.innerHTML = ''; // Clear existing options
    
    const currentLang = localStorage.getItem('preferredLanguage') || 'en';
    
    for (const [code, name] of Object.entries(availableLanguages)) {
        const button = document.createElement('button');
        button.dataset.lang = code;
        button.className = `language-option w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 ${code === currentLang ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : ''}`;
        
        // Add flag emoji or icon based on language
        const flagEmoji = getFlagEmoji(code);
        button.innerHTML = `
            <span class="mr-3">${flagEmoji}</span>
            <span>${name}</span>
            ${code === currentLang ? '<i class="fas fa-check ml-auto"></i>' : ''}
        `;
        
        button.addEventListener('click', async () => {
            const newLang = button.dataset.lang;
            localStorage.setItem('preferredLanguage', newLang);
            await loadLanguage(newLang);
            applyTranslations();
            populateLanguageMenu(); // Refresh to show new selection
            languageMenu.classList.add('hidden');
        });

        languageMenu.appendChild(button);
    }
}

function getFlagEmoji(languageCode) {
    const flags = {
        'en': '🇺🇸',
        'xh': '🇿🇦',
        'zu': '🇿🇦',
        'af': '🇿🇦',
        'st': '🇿🇦',
        'nso': '🇿🇦',
        'ts': '🇿🇦',
        've': '🇿🇦',
        'tn': '🇿🇦',
        'ss': '🇿🇦',
        'nr': '🇿🇦',
        'sw': '🇹🇿',
        'pt': '🇵🇹',
        'fr': '🇫🇷'
    };
    return flags[languageCode] || '🌐';
}

export async function initTranslations() {
    try {
        const savedLang = localStorage.getItem('preferredLanguage') || 'en';
        await loadLanguage(savedLang);
        
        // Wait for DOM to be fully loaded before populating menu
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                populateLanguageMenu();
                applyTranslations();
            });
        } else {
            populateLanguageMenu();
            applyTranslations();
        }
    } catch (error) {
        console.error('Error initializing translations:', error);
    }
}
