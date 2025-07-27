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