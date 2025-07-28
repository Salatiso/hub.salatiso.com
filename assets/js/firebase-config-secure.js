/* ================================================================================= */
/* FILE: assets/js/firebase-config-secure.js - Secure Firebase Configuration        */
/* PURPOSE: Production-ready Firebase setup with security measures                   */
/* ================================================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage, connectStorageEmulator, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
import { CONFIG } from './config.js';

// Validate configuration before initializing Firebase
if (!CONFIG.firebase.apiKey || CONFIG.firebase.apiKey.includes('{{')) {
    throw new Error('Firebase configuration not properly set. Please check server configuration.');
}

// Initialize Firebase with secure configuration
const app = initializeApp(CONFIG.firebase);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Security rules enforcement
const SECURITY_RULES = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'],
    maxRequestsPerMinute: 60,
    sessionTimeout: 24 * 60 * 60 * 1000 // 24 hours
};

// Request rate limiting
const requestCounts = new Map();

function checkRateLimit(userId) {
    const now = Date.now();
    const userRequests = requestCounts.get(userId) || [];
    
    // Remove requests older than 1 minute
    const recentRequests = userRequests.filter(time => now - time < 60000);
    
    if (recentRequests.length >= SECURITY_RULES.maxRequestsPerMinute) {
        throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    recentRequests.push(now);
    requestCounts.set(userId, recentRequests);
}

// Secure file upload utility with validation
export async function uploadFileSecure(file, path, userId) {
    try {
        // Check rate limit
        checkRateLimit(userId);
        
        // Validate file size
        if (file.size > SECURITY_RULES.maxFileSize) {
            throw new Error(`File size exceeds limit of ${SECURITY_RULES.maxFileSize / 1024 / 1024}MB`);
        }
        
        // Validate file type
        if (!SECURITY_RULES.allowedFileTypes.includes(file.type)) {
            throw new Error(`File type ${file.type} not allowed`);
        }
        
        // Sanitize file name
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const timestamp = Date.now();
        const securePath = `users/${userId}/${timestamp}_${sanitizedName}`;
        
        // Upload file
        const storageRef = ref(storage, securePath);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return {
            url: downloadURL,
            path: securePath,
            originalName: file.name,
            size: file.size,
            type: file.type
        };
    } catch (error) {
        console.error('Secure upload error:', error);
        throw error;
    }
}

// Input sanitization utility
export function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim()
        .substring(0, 10000); // Limit length
}

// Validate user session
function validateSession(user) {
    if (!user) {
        throw new Error('User not authenticated');
    }
    
    // Check if session is expired (for anonymous users)
    if (user.isAnonymous) {
        const sessionStart = user.metadata.creationTime;
        const now = Date.now();
        if (now - new Date(sessionStart).getTime() > SECURITY_RULES.sessionTimeout) {
            throw new Error('Session expired. Please sign in again.');
        }
    }
    
    return true;
}

// Enhanced error handling
function handleFirebaseError(error) {
    const errorMessages = {
        'auth/user-not-found': 'No account found with this email address.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/network-request-failed': 'Network error. Please check your connection.',
        'permission-denied': 'You do not have permission to perform this action.',
        'unavailable': 'Service temporarily unavailable. Please try again later.',
        'quota-exceeded': 'Storage quota exceeded. Please contact support.'
    };
    
    const userMessage = errorMessages[error.code] || 'An unexpected error occurred.';
    
    // Log detailed error for debugging (only in development)
    if (CONFIG.app.debug) {
        console.error('Firebase Error Details:', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });
    }
    
    return userMessage;
}

// Initialize security monitoring
function initSecurityMonitoring() {
    // Monitor authentication state changes
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log(`User authenticated: ${user.uid}`);
            
            // Log security events
            if (CONFIG.app.environment === 'production') {
                // In production, you might want to send this to a logging service
                console.log('Security Event: User login', {
                    userId: user.uid,
                    timestamp: new Date().toISOString(),
                    isAnonymous: user.isAnonymous
                });
            }
        }
    });
    
    // Clear rate limiting data periodically
    setInterval(() => {
        const now = Date.now();
        for (const [userId, requests] of requestCounts.entries()) {
            const recentRequests = requests.filter(time => now - time < 60000);
            if (recentRequests.length === 0) {
                requestCounts.delete(userId);
            } else {
                requestCounts.set(userId, recentRequests);
            }
        }
    }, 60000); // Clean up every minute
}

// Initialize security monitoring
initSecurityMonitoring();

console.log('Firebase initialized with security measures');

// Export security utilities
export { SECURITY_RULES, checkRateLimit, handleFirebaseError, validateSession };