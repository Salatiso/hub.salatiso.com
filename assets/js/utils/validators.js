/* ================================================================================= */
/* FILE: assets/js/utils/validators.js                                              */
/* PURPOSE: Validation functions for LifeCV fields and data                         */
/* ================================================================================= */

/**
 * Validate field based on type and constraints
 */
export function validateField(value, fieldConfig) {
    const errors = [];
    
    // Required field validation
    if (fieldConfig.required && (!value || value.toString().trim() === '')) {
        errors.push(`${fieldConfig.label} is required`);
        return errors;
    }
    
    // Skip further validation if field is empty and not required
    if (!value || value.toString().trim() === '') {
        return errors;
    }
    
    // Type-specific validation
    switch (fieldConfig.type) {
        case 'email':
            if (!isValidEmail(value)) {
                errors.push(`${fieldConfig.label} must be a valid email address`);
            }
            break;
            
        case 'url':
            if (!isValidUrl(value)) {
                errors.push(`${fieldConfig.label} must be a valid URL`);
            }
            break;
            
        case 'tel':
            if (!isValidPhone(value)) {
                errors.push(`${fieldConfig.label} must be a valid phone number`);
            }
            break;
            
        case 'date':
            if (!isValidDate(value)) {
                errors.push(`${fieldConfig.label} must be a valid date`);
            }
            break;
            
        case 'number':
            if (!isValidNumber(value)) {
                errors.push(`${fieldConfig.label} must be a valid number`);
            }
            break;
            
        case 'text':
        case 'textarea':
            if (fieldConfig.minLength && value.length < fieldConfig.minLength) {
                errors.push(`${fieldConfig.label} must be at least ${fieldConfig.minLength} characters`);
            }
            if (fieldConfig.maxLength && value.length > fieldConfig.maxLength) {
                errors.push(`${fieldConfig.label} must be no more than ${fieldConfig.maxLength} characters`);
            }
            break;
    }
    
    return errors;
}

/**
 * Validate email address
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate URL
 */
export function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate phone number (flexible format)
 */
export function isValidPhone(phone) {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Phone number should have 7-15 digits
    return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

/**
 * Validate date
 */
export function isValidDate(dateString) {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

/**
 * Validate number
 */
export function isValidNumber(value) {
    return !isNaN(value) && !isNaN(parseFloat(value));
}

/**
 * Validate JSON structure for import
 */
export function validateLifeCvJson(jsonData) {
    const errors = [];
    
    if (!jsonData || typeof jsonData !== 'object') {
        errors.push('Invalid JSON structure');
        return errors;
    }
    
    // Check for required sections
    const requiredSections = ['personalInfo'];
    requiredSections.forEach(section => {
        if (!jsonData[section]) {
            errors.push(`Missing required section: ${section}`);
        }
    });
    
    // Validate section structures
    Object.keys(jsonData).forEach(sectionKey => {
        const section = jsonData[sectionKey];
        
        if (Array.isArray(section)) {
            // Validate array items
            section.forEach((item, index) => {
                if (typeof item !== 'object') {
                    errors.push(`Invalid item in ${sectionKey} at index ${index}`);
                } else {
                    // Check if item follows enhanced structure
                    Object.keys(item).forEach(fieldKey => {
                        const field = item[fieldKey];
                        if (typeof field === 'object' && field !== null) {
                            if (!field.hasOwnProperty('value')) {
                                errors.push(`Missing 'value' property in ${sectionKey}[${index}].${fieldKey}`);
                            }
                            if (!field.hasOwnProperty('isPublic')) {
                                errors.push(`Missing 'isPublic' property in ${sectionKey}[${index}].${fieldKey}`);
                            }
                        }
                    });
                }
            });
        } else if (typeof section === 'object' && section !== null) {
            // Validate object structure
            Object.keys(section).forEach(fieldKey => {
                const field = section[fieldKey];
                if (typeof field === 'object' && field !== null) {
                    if (!field.hasOwnProperty('value')) {
                        errors.push(`Missing 'value' property in ${sectionKey}.${fieldKey}`);
                    }
                    if (!field.hasOwnProperty('isPublic')) {
                        errors.push(`Missing 'isPublic' property in ${sectionKey}.${fieldKey}`);
                    }
                }
            });
        }
    });
    
    return errors;
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Validate file type for uploads
 */
export function validateFileType(file, allowedTypes) {
    if (!file || !file.type) return false;
    
    return allowedTypes.some(type => {
        if (type.includes('*')) {
            // Handle wildcard types like 'image/*'
            const baseType = type.split('/')[0];
            return file.type.startsWith(baseType + '/');
        }
        return file.type === type;
    });
}

/**
 * Validate file size
 */
export function validateFileSize(file, maxSizeInMB) {
    if (!file) return false;
    
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
}