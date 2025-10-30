/**
 * Unit Tests for PIN Encryption Module
 * Tests PBKDF2-SHA256 hashing and verification functions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateSalt,
  hashPin,
  verifyPin,
  hashPinWithStorage,
  verifyPinFromStorage,
  isValidPinFormat,
  validatePassword,
  getPinSecurityStatus,
  PIN_CONFIG,
} from '../security/pinEncryption';

describe('PIN Encryption Module', () => {
  describe('PIN_CONFIG', () => {
    it('should have correct PBKDF2 configuration', () => {
      expect(PIN_CONFIG.algorithm).toBe('PBKDF2-SHA256');
      expect(PIN_CONFIG.iterations).toBe(1000);
      expect(PIN_CONFIG.keySize).toBe(32);
      expect(PIN_CONFIG.saltSize).toBe(32);
    });
  });

  describe('generateSalt', () => {
    it('should generate a salt of correct length', () => {
      const salt = generateSalt();
      expect(salt).toBeDefined();
      expect(typeof salt).toBe('string');
      expect(salt.length).toBeGreaterThan(0);
    });

    it('should generate different salts each time', () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      expect(salt1).not.toBe(salt2);
    });
  });

  describe('hashPin', () => {
    it('should hash a PIN and return hash and salt', () => {
      const pin = '1234';
      const result = hashPin(pin);

      expect(result).toHaveProperty('hash');
      expect(result).toHaveProperty('salt');
      expect(typeof result.hash).toBe('string');
      expect(typeof result.salt).toBe('string');
      expect(result.hash.length).toBeGreaterThan(0);
      expect(result.salt.length).toBeGreaterThan(0);
    });

    it('should use provided salt when given', () => {
      const pin = '1234';
      const customSalt = 'customsalt123';
      const result = hashPin(pin, customSalt);

      expect(result.salt).toBe(customSalt);
    });

    it('should reject invalid PINs', () => {
      expect(() => hashPin('')).toThrow('PIN must be at least 4 characters');
      expect(() => hashPin('123')).toThrow('PIN must be at least 4 characters');
    });

    it('should produce different hashes for different PINs', () => {
      const result1 = hashPin('1234');
      const result2 = hashPin('5678');

      expect(result1.hash).not.toBe(result2.hash);
    });

    it('should produce different hashes for same PIN with different salts', () => {
      const pin = '1234';
      const result1 = hashPin(pin, 'salt1');
      const result2 = hashPin(pin, 'salt2');

      expect(result1.hash).not.toBe(result2.hash);
    });
  });

  describe('verifyPin', () => {
    it('should verify correct PIN', () => {
      const pin = '1234';
      const { hash, salt } = hashPin(pin);

      const isValid = verifyPin(pin, hash, salt);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect PIN', () => {
      const pin = '1234';
      const { hash, salt } = hashPin(pin);

      const isValid = verifyPin('5678', hash, salt);
      expect(isValid).toBe(false);
    });

    it('should reject with wrong salt', () => {
      const pin = '1234';
      const { hash } = hashPin(pin);

      const isValid = verifyPin(pin, hash, 'wrongsalt');
      expect(isValid).toBe(false);
    });

    it('should handle invalid inputs gracefully', () => {
      expect(() => verifyPin('', 'hash', 'salt')).toThrow();
      expect(() => verifyPin('1234', '', 'salt')).toThrow();
      expect(() => verifyPin('1234', 'hash', '')).toThrow();
    });
  });

  describe('hashPinWithStorage and verifyPinFromStorage', () => {
    it('should hash and verify PIN in storage format', () => {
      const pin = '1234';
      const stored = hashPinWithStorage(pin);

      expect(typeof stored).toBe('string');
      expect(stored.includes('$')).toBe(true);

      const isValid = verifyPinFromStorage(pin, stored);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect PIN in storage format', () => {
      const pin = '1234';
      const stored = hashPinWithStorage(pin);

      const isValid = verifyPinFromStorage('5678', stored);
      expect(isValid).toBe(false);
    });

    it('should handle malformed storage strings', () => {
      expect(verifyPinFromStorage('1234', 'invalid')).toBe(false);
      expect(verifyPinFromStorage('1234', 'saltonly')).toBe(false);
      expect(verifyPinFromStorage('1234', '$hashonly')).toBe(false);
    });
  });

  describe('isValidPinFormat', () => {
    it('should validate correct PIN formats', () => {
      expect(isValidPinFormat('1234')).toBe(true);
      expect(isValidPinFormat('123456')).toBe(true);
      expect(isValidPinFormat('123456789012')).toBe(true);
    });

    it('should reject invalid PIN formats', () => {
      expect(isValidPinFormat('')).toBe(false);
      expect(isValidPinFormat('123')).toBe(false); // too short
      expect(isValidPinFormat('1234567890123')).toBe(false); // too long
      expect(isValidPinFormat('abcd')).toBe(false); // not numeric
      expect(isValidPinFormat('123a')).toBe(false); // mixed
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should check for uppercase requirement', () => {
      const result = validatePassword('password123');
      expect(result.errors).toContain('Password must contain an uppercase letter');
    });

    it('should check for lowercase requirement', () => {
      const result = validatePassword('PASSWORD123');
      expect(result.errors).toContain('Password must contain a lowercase letter');
    });

    it('should check for number requirement', () => {
      const result = validatePassword('Password');
      expect(result.errors).toContain('Password must contain a number');
    });

    it('should check for minimum length', () => {
      const result = validatePassword('Pass1');
      expect(result.errors).toContain('Password must be at least 8 characters');
    });
  });

  describe('getPinSecurityStatus', () => {
    it('should assess PIN security', () => {
      const result = getPinSecurityStatus('1234');
      expect(result).toHaveProperty('strength');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('isSecure');
    });

    it('should flag sequential PINs as weak', () => {
      const result = getPinSecurityStatus('1234');
      expect(result.strength).toBe('weak');
      expect(result.isSecure).toBe(true); // Still acceptable for local use
    });

    it('should accept good PINs', () => {
      const result = getPinSecurityStatus('4829');
      expect(result.strength).toBe('good');
      expect(result.isSecure).toBe(true);
    });

    it('should reject invalid PINs', () => {
      const result = getPinSecurityStatus('123');
      expect(result.strength).toBe('weak');
      expect(result.isSecure).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should maintain PIN verification across hash/verify cycle', () => {
      const testPins = ['1234', '5678', '9999', '4829'];

      testPins.forEach(pin => {
        const stored = hashPinWithStorage(pin);
        const isValid = verifyPinFromStorage(pin, stored);
        expect(isValid).toBe(true);
      });
    });

    it('should prevent PIN recovery from hash', () => {
      const pin = '1234';
      const { hash, salt } = hashPin(pin);

      // Hash should not contain the original PIN
      expect(hash).not.toContain(pin);
      expect(salt).not.toContain(pin);

      // Should not be able to derive PIN from hash
      expect(hash).not.toBe(pin);
    });

    it('should be resistant to rainbow table attacks', () => {
      const pin = '1234';
      const result1 = hashPin(pin, 'salt1');
      const result2 = hashPin(pin, 'salt2');

      // Same PIN with different salts should produce different hashes
      expect(result1.hash).not.toBe(result2.hash);
      expect(result1.salt).not.toBe(result2.salt);
    });
  });
});