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
let currentLanguage = 'en';
let translationObserver = null;

async function loadLanguage(lang = 'en') {
    try {
        // Use a relative path that works from any module page
        const module = await import(`./translations/${lang}.js`);
        currentTranslations = module.default;
        currentLanguage = lang;
        console.log(`Loaded translations for: ${lang} (${Object.keys(currentTranslations).length} keys)`);
        
        // Store language preference
        localStorage.setItem('preferredLanguage', lang);
        
        // Update HTML lang attribute
        document.documentElement.lang = lang;
        
        return true;
    } catch (error) {
        console.warn(`Translation for '${lang}' not found. Defaulting to 'en'.`, error);
        try {
            const module = await import(`./translations/en.js`);
            currentTranslations = module.default;
            currentLanguage = 'en';
            console.log(`Loaded fallback English translations (${Object.keys(currentTranslations).length} keys)`);
            return true;
        } catch (fallbackError) {
            console.error('Could not load fallback English translations:', fallbackError);
            currentTranslations = {}; // Fallback to empty object
            return false;
        }
    }
}

function translate(key) {
    const translation = currentTranslations[key];
    if (translation) {
        return translation;
    }
    
    // Log missing translations for development
    if (process?.env?.NODE_ENV === 'development') {
        console.warn(`Missing translation for key: ${key} in language: ${currentLanguage}`);
    }
    
    // Return a more user-friendly fallback
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || `[${key}]`;
}

export function applyTranslations() {
    // Apply translations to elements with data-translate-key
    document.querySelectorAll('[data-translate-key]').forEach(element => {
        const key = element.getAttribute('data-translate-key');
        const translatedText = translate(key);
        
        // Handle different types of elements
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            if (element.type === 'submit' || element.type === 'button') {
                element.value = translatedText;
            } else if (element.hasAttribute('placeholder')) {
                element.placeholder = translatedText;
            }
        } else if (element.hasAttribute('title')) {
            element.title = translatedText;
        } else if (element.hasAttribute('alt')) {
            element.alt = translatedText;
        } else {
            // For regular text content, preserve HTML structure
            if (element.children.length === 0) {
                element.textContent = translatedText;
            } else {
                // Handle elements with child nodes more carefully
                const textNodes = Array.from(element.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                if (textNodes.length === 1) {
                    textNodes[0].textContent = translatedText;
                } else {
                    element.innerHTML = translatedText;
                }
            }
        }
    });

    // Apply translations to elements with data-translate-html (for HTML content)
    document.querySelectorAll('[data-translate-html]').forEach(element => {
        const key = element.getAttribute('data-translate-html');
        const translatedHTML = translate(key);
        element.innerHTML = translatedHTML;
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
        button.className = `language-option w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors ${code === currentLang ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : ''}`;
        
        // Add flag emoji or icon based on language
        const flagEmoji = getFlagEmoji(code);
        button.innerHTML = `
            <span class="mr-3 text-lg">${flagEmoji}</span>
            <span class="flex-grow">${name}</span>
            ${code === currentLang ? '<i class="fas fa-check ml-auto text-green-500"></i>' : ''}
        `;
        
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const newLang = button.dataset.lang;
            
            // Show loading state
            button.innerHTML = `
                <span class="mr-3 text-lg">${flagEmoji}</span>
                <span class="flex-grow">${name}</span>
                <i class="fas fa-spinner fa-spin ml-auto"></i>
            `;
            
            try {
                const success = await loadLanguage(newLang);
                if (success) {
                    applyTranslations();
                    populateLanguageMenu(); // Refresh to show new selection
                    languageMenu.classList.add('hidden');
                    
                    // Show success notification
                    showLanguageChangeNotification(name);
                } else {
                    throw new Error('Failed to load language');
                }
            } catch (error) {
                console.error('Error changing language:', error);
                // Restore button state
                populateLanguageMenu();
            }
        });

        languageMenu.appendChild(button);
    }
}

function showLanguageChangeNotification(languageName) {
    // Create and show a brief notification
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform translate-y-full transition-transform';
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-check-circle mr-2"></i>
            <span>Language changed to ${languageName}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-y-full');
    }, 10);
    
    // Animate out and remove
    setTimeout(() => {
        notification.classList.add('translate-y-full');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 2000);
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

// Set up DOM observer to auto-translate new content
function setupTranslationObserver() {
    if (translationObserver) {
        translationObserver.disconnect();
    }
    
    translationObserver = new MutationObserver((mutations) => {
        let needsTranslation = false;
        
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Check if the added node or its descendants have translate keys
                    if (node.hasAttribute?.('data-translate-key') || 
                        node.hasAttribute?.('data-translate-html') ||
                        node.querySelector?.('[data-translate-key], [data-translate-html]')) {
                        needsTranslation = true;
                    }
                }
            });
        });
        
        if (needsTranslation) {
            // Debounce translation application
            clearTimeout(translationObserver.timeout);
            translationObserver.timeout = setTimeout(applyTranslations, 100);
        }
    });
    
    translationObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Export function to get current language
export function getCurrentLanguage() {
    return currentLanguage;
}

// Export function to get translation directly
export function getTranslation(key) {
    return translate(key);
}

// Export function to check if a translation exists
export function hasTranslation(key) {
    return !!currentTranslations[key];
}

// Export function to get all available languages
export function getAvailableLanguages() {
    return { ...availableLanguages };
}

export async function initTranslations() {
    try {
        const savedLang = localStorage.getItem('preferredLanguage') || 'en';
        console.log('Initializing translations with language:', savedLang);
        
        const success = await loadLanguage(savedLang);
        if (!success) {
            console.error('Failed to initialize translations');
            return false;
        }
        
        // Wait for DOM to be fully loaded before populating menu
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                populateLanguageMenu();
                applyTranslations();
                setupTranslationObserver();
            });
        } else {
            populateLanguageMenu();
            applyTranslations();
            setupTranslationObserver();
        }
        
        return true;
    } catch (error) {
        console.error('Error initializing translations:', error);
        return false;
    }
}

// Auto-initialize when the module is imported
if (typeof window !== 'undefined') {
    // Only run in browser environment
    initTranslations();
}
