/* ================================================================================= */
/* FILE: assets/js/translations-engine.js (UPDATED)                                  */
/* PURPOSE: Now includes initialization logic to be called from a central script.    */
/* ================================================================================= */
let currentTranslations = {};

async function loadLanguage(lang = 'en') {
    try {
        const module = await import(`./translations/${lang}.js`);
        currentTranslations = module.default;
    } catch (error) {
        console.warn(`Translation for '${lang}' not found. Defaulting to 'en'.`);
        const module = await import(`./translations/en.js`);
        currentTranslations = module.default;
    }
}

function translate(key) {
    return currentTranslations[key] || `[${key}]`; // Return key if not found for easy debugging
}

function applyTranslations() {
    document.querySelectorAll('[data-translate-key]').forEach(element => {
        const key = element.getAttribute('data-translate-key');
        // Use textContent for most, but check for placeholder attribute too
        if (element.placeholder) {
            element.placeholder = translate(key);
        } else {
            element.textContent = translate(key);
        }
    });
}

export async function initTranslations() {
    // Get saved language or default to 'en'
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    await loadLanguage(savedLang);
    applyTranslations();

    // Find a language switcher on the page and attach event listener
    const switcher = document.getElementById('language-switcher');
    if (switcher) {
        switcher.value = savedLang; // Set dropdown to current language
        switcher.addEventListener('change', async (e) => {
            const newLang = e.target.value;
            localStorage.setItem('preferredLanguage', newLang);
            await loadLanguage(newLang);
            applyTranslations();
        });
    }
}
