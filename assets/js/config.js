/* ================================================================================= */
/* FILE: assets/js/config.js - Production Configuration System                       */
/* PURPOSE: Secure configuration management for production deployment                */
/* ================================================================================= */

// Production configuration - API keys should be set via server-side includes
const CONFIG = {
    // Firebase configuration - these will be replaced by server-side script
    firebase: {
        apiKey: "{{FIREBASE_API_KEY}}",
        authDomain: "{{FIREBASE_AUTH_DOMAIN}}",
        projectId: "{{FIREBASE_PROJECT_ID}}",
        storageBucket: "{{FIREBASE_STORAGE_BUCKET}}",
        messagingSenderId: "{{FIREBASE_MESSAGING_SENDER_ID}}",
        appId: "{{FIREBASE_APP_ID}}",
        measurementId: "{{FIREBASE_MEASUREMENT_ID}}"
    },
    
    // Google APIs
    google: {
        mapsApiKey: "{{GOOGLE_MAPS_API_KEY}}",
        searchApiKey: "{{GOOGLE_SEARCH_API_KEY}}",
        searchEngineId: "{{GOOGLE_SEARCH_ENGINE_ID}}"
    },
    
    // Application settings
    app: {
        environment: "{{APP_ENVIRONMENT}}", // production, staging, development
        baseUrl: "{{APP_BASE_URL}}",
        version: "1.0.0",
        debug: false
    },
    
    // Feature flags
    features: {
        enableInternetSearch: true,
        enableAiProcessing: true,
        enableAnalytics: true,
        enableOfflineMode: false
    }
};

// Validation function to ensure all required config is present
function validateConfig() {
    const required = [
        'firebase.apiKey',
        'firebase.authDomain',
        'firebase.projectId',
        'app.environment',
        'app.baseUrl'
    ];
    
    const missing = required.filter(key => {
        const value = key.split('.').reduce((obj, prop) => obj?.[prop], CONFIG);
        return !value || value.includes('{{');
    });
    
    if (missing.length > 0) {
        console.error('Missing required configuration:', missing);
        return false;
    }
    
    return true;
}

// Initialize configuration
function initConfig() {
    if (!validateConfig()) {
        throw new Error('Invalid configuration. Please check server setup.');
    }
    
    // Set global configuration
    window.APP_CONFIG = CONFIG;
    
    console.log(`App initialized in ${CONFIG.app.environment} mode`);
}

// Export for module use
export { CONFIG, validateConfig, initConfig };

// Auto-initialize if not in module context
if (typeof module === 'undefined') {
    document.addEventListener('DOMContentLoaded', initConfig);
}