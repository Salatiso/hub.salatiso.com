/**
 * Validation utilities for LifeCV
 */

export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validatePhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

export function validateUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

export function validateRequired(value) {
    return value !== null && value !== undefined && value.trim() !== '';
}

// Add this function if it doesn't exist, or ensure it's exported if it does exist
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') {
        return String(input);
    }
    
    // Basic HTML sanitization - remove script tags and dangerous attributes
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/javascript:/gi, '')
        .trim();
};