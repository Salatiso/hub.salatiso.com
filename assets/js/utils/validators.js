/* ================================================================================= */
/* FILE: assets/js/utils/validators.js                                               */
/* PURPOSE: Validation functions for form fields and data                           */
/* ================================================================================= */

/**
 * Validate email address
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number
 */
export function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate URL
 */
export function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate date
 */
export function isValidDate(date) {
    return !isNaN(Date.parse(date));
}

/**
 * Validate required field
 */
export function isRequired(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
}

/**
 * Validate minimum length
 */
export function minLength(value, min) {
    return value && value.toString().length >= min;
}

/**
 * Validate maximum length
 */
export function maxLength(value, max) {
    return !value || value.toString().length <= max;
}

/**
 * Validate numeric value
 */
export function isNumeric(value) {
    return !isNaN(value) && !isNaN(parseFloat(value));
}

/**
 * Validate field based on configuration
 */
export function validateField(field, value) {
    const errors = [];

    // Required validation
    if (field.required && !isRequired(value)) {
        errors.push(`${field.label} is required`);
        return errors; // Return early if required field is empty
    }

    // Skip other validations if field is empty and not required
    if (!isRequired(value)) {
        return errors;
    }

    // Type-specific validations
    switch (field.type) {
        case 'email':
            if (!isValidEmail(value)) {
                errors.push(`${field.label} must be a valid email address`);
            }
            break;
        case 'phone':
            if (!isValidPhone(value)) {
                errors.push(`${field.label} must be a valid phone number`);
            }
            break;
        case 'url':
            if (!isValidURL(value)) {
                errors.push(`${field.label} must be a valid URL`);
            }
            break;
        case 'date':
            if (!isValidDate(value)) {
                errors.push(`${field.label} must be a valid date`);
            }
            break;
        case 'number':
            if (!isNumeric(value)) {
                errors.push(`${field.label} must be a number`);
            }
            break;
    }

    // Length validations
    if (field.minLength && !minLength(value, field.minLength)) {
        errors.push(`${field.label} must be at least ${field.minLength} characters`);
    }

    if (field.maxLength && !maxLength(value, field.maxLength)) {
        errors.push(`${field.label} must be no more than ${field.maxLength} characters`);
    }

    return errors;
}