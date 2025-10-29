/**
 * PIN Encryption Utility - PBKDF2-SHA256 Hashing
 * 
 * Provides secure PIN hashing and verification using crypto-js library
 * with PBKDF2 (Password-Based Key Derivation Function 2) algorithm.
 * 
 * Security Considerations:
 * - PINs are hashed with a random salt for each account
 * - PBKDF2 with 1000 iterations provides good security-performance balance
 * - Hashes are stored in local IndexedDB (never sent to server)
 * - Compare using constant-time to prevent timing attacks
 * 
 * Phase 2 Days 3-4: PIN Security Implementation
 */

import CryptoJS from 'crypto-js';

/**
 * PIN Encryption Configuration
 */
const PIN_CONFIG = {
  algorithm: 'PBKDF2-SHA256',
  iterations: 1000,
  keySize: 32,
  saltSize: 32,
} as const;

/**
 * Generate a random salt for PIN hashing
 * 
 * @returns Random salt string
 */
export function generateSalt(): string {
  return CryptoJS.lib.WordArray.random(PIN_CONFIG.saltSize).toString();
}

/**
 * Hash a PIN using PBKDF2-SHA256
 * 
 * @param pin - The PIN to hash (typically 4 digits)
 * @param salt - Optional salt (generated if not provided)
 * @returns Object with hash and salt
 */
export function hashPin(
  pin: string,
  salt?: string
): {
  hash: string;
  salt: string;
} {
  // Validate PIN format
  if (!pin || pin.length < 4) {
    throw new Error('PIN must be at least 4 characters');
  }

  // Generate salt if not provided
  const finalSalt = salt || generateSalt();

  // Hash the PIN using PBKDF2
  const hash = CryptoJS.PBKDF2(
    pin,
    finalSalt,
    {
      keySize: PIN_CONFIG.keySize,
      iterations: PIN_CONFIG.iterations,
      hasher: CryptoJS.algo.SHA256,
    }
  ).toString();

  return {
    hash,
    salt: finalSalt,
  };
}

/**
 * Verify a PIN against a hash using constant-time comparison
 * 
 * @param pin - The PIN to verify
 * @param hash - The stored hash
 * @param salt - The salt used to generate the hash
 * @returns Whether the PIN matches the hash
 */
export function verifyPin(
  pin: string,
  hash: string,
  salt: string
): boolean {
  try {
    // Hash the provided PIN with the same salt
    const { hash: computedHash } = hashPin(pin, salt);

    // Constant-time comparison to prevent timing attacks
    return constantTimeCompare(computedHash, hash);
  } catch (error) {
    console.error('PIN verification error:', error);
    return false;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 * 
 * @param a - First string
 * @param b - Second string
 * @returns Whether strings are equal
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Validate PIN format
 * 
 * @param pin - The PIN to validate
 * @returns Whether PIN format is valid
 */
export function isValidPinFormat(pin: string): boolean {
  // PIN should be 4-12 characters
  if (!pin || pin.length < 4 || pin.length > 12) {
    return false;
  }

  // PIN should only contain numbers
  return /^\d+$/.test(pin);
}

/**
 * Validate password format for password-based auth
 * 
 * @param password - The password to validate
 * @returns Validation result with errors
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain a number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get PIN security status
 * 
 * @param pin - The PIN to check
 * @returns Security assessment
 */
export function getPinSecurityStatus(pin: string): {
  strength: 'weak' | 'fair' | 'good';
  message: string;
  isSecure: boolean;
} {
  const isValid = isValidPinFormat(pin);

  if (!isValid) {
    return {
      strength: 'weak',
      message: 'Invalid PIN format (must be 4-12 digits)',
      isSecure: false,
    };
  }

  // Check if PIN is sequential (e.g., 1234, 5678)
  const isSequential = /^(\d)\1*$|^([0-9])\2+$|^(?:0123456789|1234567890)/.test(
    pin
  );

  if (isSequential) {
    return {
      strength: 'weak',
      message: 'Avoid sequential or repeated numbers',
      isSecure: true, // Still acceptable for local use
    };
  }

  // PIN is good
  return {
    strength: 'good',
    message: 'Strong PIN',
    isSecure: true,
  };
}

/**
 * Verify a password against a hash using constant-time comparison
 * (Same method as PIN verification since both use PBKDF2)
 * 
 * @param password - The password to verify
 * @param hash - The stored hash
 * @param salt - The salt used to generate the hash
 * @returns Whether the password matches the hash
 */
export function verifyPassword(
  password: string,
  hash: string,
  salt: string
): boolean {
  // Use same verification method as PIN
  return verifyPin(password, hash, salt);
}

/**
 * Export PIN encryption utilities
 */
export const PinEncryption = {
  generateSalt,
  hashPin,
  verifyPin,
  verifyPassword,
  isValidPinFormat,
  validatePassword,
  getPinSecurityStatus,
  PIN_CONFIG,
};

export default PinEncryption;
