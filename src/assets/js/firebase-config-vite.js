// Firebase Configuration for Vite Build System
// This file uses environment variables that are safely bundled by Vite

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Environment-based configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Application configuration
const appConfig = {
    environment: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
    baseUrl: import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
    rateLimitEnabled: import.meta.env.VITE_RATE_LIMIT_ENABLED === 'true'
};

// Validate configuration
function validateConfig() {
    const requiredKeys = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID'
    ];
    
    const missing = requiredKeys.filter(key => !import.meta.env[key]);
    
    if (missing.length > 0) {
        console.error('Missing required Firebase configuration:', missing);
        throw new Error(`Missing Firebase configuration: ${missing.join(', ')}`);
    }
    
    if (appConfig.debugMode) {
        console.log('Firebase configuration loaded successfully');
        console.log('Environment:', appConfig.environment);
        console.log('Base URL:', appConfig.baseUrl);
    }
}

// Initialize Firebase
let app;
let auth;
let db;
let storage;
let analytics;

try {
    validateConfig();
    
    // Initialize Firebase app
    app = initializeApp(firebaseConfig);
    
    // Initialize services
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    // Initialize Analytics only if supported and enabled
    if (appConfig.enableAnalytics) {
        isSupported().then(supported => {
            if (supported) {
                analytics = getAnalytics(app);
                if (appConfig.debugMode) {
                    console.log('Firebase Analytics initialized');
                }
            }
        });
    }
    
    if (appConfig.debugMode) {
        console.log('Firebase services initialized successfully');
    }
    
} catch (error) {
    console.error('Firebase initialization failed:', error);
    
    // Provide fallback for development
    if (appConfig.environment === 'development') {
        console.warn('Running in development mode without Firebase');
    } else {
        throw error;
    }
}

// Security utilities
const SECURITY_RULES = {
    maxRequestsPerMinute: appConfig.rateLimitEnabled ? 60 : 1000,
    allowedOrigins: [
        appConfig.baseUrl,
        'https://salatiso.com',
        'https://www.salatiso.com',
        'http://localhost:3000',
        'http://localhost:5173' // Vite default dev port
    ]
};

// Rate limiting (simplified for client-side)
const requestCounts = new Map();

function checkRateLimit(userId = 'anonymous') {
    if (!appConfig.rateLimitEnabled) return true;
    
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    
    if (!requestCounts.has(userId)) {
        requestCounts.set(userId, []);
    }
    
    const userRequests = requestCounts.get(userId);
    
    // Remove old requests
    const recentRequests = userRequests.filter(time => time > windowStart);
    requestCounts.set(userId, recentRequests);
    
    if (recentRequests.length >= SECURITY_RULES.maxRequestsPerMinute) {
        console.warn('Rate limit exceeded for user:', userId);
        return false;
    }
    
    // Add current request
    recentRequests.push(now);
    return true;
}

// Enhanced error handling
function handleFirebaseError(error) {
    const errorMessages = {
        'auth/user-not-found': 'User account not found',
        'auth/wrong-password': 'Invalid password',
        'auth/email-already-in-use': 'Email address is already registered',
        'auth/weak-password': 'Password is too weak',
        'auth/invalid-email': 'Invalid email address',
        'auth/network-request-failed': 'Network error. Please check your connection',
        'permission-denied': 'Access denied. Please check your permissions',
        'unavailable': 'Service temporarily unavailable'
    };
    
    const userMessage = errorMessages[error.code] || 'An unexpected error occurred';
    
    if (appConfig.debugMode) {
        console.error('Firebase Error:', error);
    }
    
    return {
        code: error.code,
        message: userMessage,
        originalError: appConfig.debugMode ? error : null
    };
}

// Session validation
function validateSession(user) {
    if (!user) {
        return { valid: false, reason: 'No user session' };
    }
    
    if (!user.emailVerified && appConfig.environment === 'production') {
        return { valid: false, reason: 'Email not verified' };
    }
    
    return { valid: true, user };
}

// Export configuration and services
export {
    app,
    auth,
    db,
    storage,
    analytics,
    appConfig,
    SECURITY_RULES,
    checkRateLimit,
    handleFirebaseError,
    validateSession
};

// Default export for backward compatibility
export default {
    app,
    auth,
    db,
    storage,
    analytics,
    config: appConfig
};