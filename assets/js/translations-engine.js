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
        const module = await import(`../assets/js/translations/${lang}.js`);
        currentTranslations = module.default;
    } catch (error) {
        console.warn(`Translation for '${lang}' not found. Defaulting to 'en'.`, error);
        const module = await import(`../assets/js/translations/en.js`);
        currentTranslations = module.default;
    }
}

function translate(key) {
    return currentTranslations[key] || `[${key}]`; // Return key if not found
}

export function applyTranslations() {
    document.querySelectorAll('[data-translate-key]').forEach(element => {
        const key = element.getAttribute('data-translate-key');
        if (element.placeholder) {
            element.placeholder = translate(key);
        } else {
            element.textContent = translate(key);
        }
    });
}

function populateLanguageMenu() {
    const languageMenu = document.getElementById('language-menu');
    if (!languageMenu) return;

    languageMenu.innerHTML = ''; // Clear existing options
    for (const [code, name] of Object.entries(availableLanguages)) {
        const button = document.createElement('button');
        button.dataset.lang = code;
        button.className = 'language-option w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600';
        button.textContent = name;
        
        button.addEventListener('click', async () => {
            const newLang = button.dataset.lang;
            localStorage.setItem('preferredLanguage', newLang);
            await loadLanguage(newLang);
            applyTranslations();
            // Optionally close the menu
            languageMenu.classList.add('hidden');
        });

        languageMenu.appendChild(button);
    }
}

export async function initTranslations() {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    populateLanguageMenu(); // Create the buttons first
    await loadLanguage(savedLang);
    applyTranslations();
}
