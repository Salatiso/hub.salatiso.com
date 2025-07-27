/* ================================================================================= */
/* FILE: assets/js/utils/helpers.js                                                  */
/* PURPOSE: Contains small, reusable utility functions that can be imported and    */
/* used by any module across the application.                                        */
/* ================================================================================= */

/**
 * Sets a value in a nested object using a dot-notation path.
 * Creates nested objects if they don't exist.
 * @param {object} obj - The object to modify.
 * @param {string} path - The path to the property (e.g., 'a.b.c').
 * @param {*} value - The value to set.
 */
export function setObjectValueByPath(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
            current[keys[i]] = {};
        }
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
}

/**
 * Gets a value from a nested object using a dot-notation path.
 * @param {object} obj - The object to read from.
 * @param {string} path - The path to the property.
 * @returns {*} The value at the specified path, or undefined if not found.
 */
export function getObjectValueByPath(obj, path) {
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}
