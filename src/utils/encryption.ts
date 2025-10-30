/**
 * Encryption utilities for LifeSync
 * Provides AES-256 encryption/decryption for sensitive data
 */

import CryptoJS from 'crypto-js';

/**
 * Encrypt data using AES-256
 */
export const encryptData = (data: string, key: string): string => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

/**
 * Decrypt data using AES-256
 */
export const decryptData = (encryptedData: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

/**
 * Generate a key from PIN/password using PBKDF2
 */
export const deriveKey = (pinOrPassword: string, salt?: string): string => {
  const defaultSalt = salt || 'lifesync_salt_2024';
  return CryptoJS.PBKDF2(pinOrPassword, defaultSalt, {
    keySize: 256 / 32,
    iterations: 10000
  }).toString();
};

/**
 * Encrypt sensitive profile data
 */
export const encryptProfileData = (data: any, key: string): string => {
  const jsonData = JSON.stringify(data);
  return encryptData(jsonData, key);
};

/**
 * Decrypt sensitive profile data
 */
export const decryptProfileData = (encryptedData: string, key: string): any => {
  try {
    const decryptedJson = decryptData(encryptedData, key);
    return JSON.parse(decryptedJson);
  } catch (error) {
    console.error('Failed to decrypt profile data:', error);
    return {};
  }
};