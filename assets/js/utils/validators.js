/**
 * Validation utilities for LifeCV
 */

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

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export function validatePhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

export const validatePhoneNumber = (phone) => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it's a valid length (10-15 digits)
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
};

export function validateUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

export const validateURL = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

export function validateRequired(value) {
    return value !== null && value !== undefined && value.trim() !== '';
}

export const validateDate = (dateString) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};