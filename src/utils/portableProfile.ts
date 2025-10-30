/**
 * Portable Profile Export/Import utilities
 * Handles encrypted profile export and import for offline mobility
 */

import { encryptData, decryptData, deriveKey } from './encryption';
import { guestAccountService } from '../services/guestAccountService';

export interface PortableProfile {
  version: string;
  exportDate: number;
  profile: any;
  profileData: any;
  checksum: string;
}

/**
 * Export a profile to encrypted portable format
 */
export const exportPortableProfile = async (profileId: string, password: string): Promise<string> => {
  try {
    const profiles = await guestAccountService.listLocalProfiles();
    const profile = profiles.find(p => p.id === profileId);

    if (!profile) {
      throw new Error('Profile not found');
    }

    const profileData = await guestAccountService.getLocalProfileData(profileId);

    const portableProfile: PortableProfile = {
      version: '1.0',
      exportDate: Date.now(),
      profile,
      profileData,
      checksum: '' // Will be set after encryption
    };

    // Create checksum of the data
    const dataString = JSON.stringify({ profile, profileData });
    const checksum = btoa(dataString).slice(0, 32); // Simple checksum
    portableProfile.checksum = checksum;

    // Encrypt the entire profile
    const encryptionKey = deriveKey(password);
    const encryptedData = encryptData(JSON.stringify(portableProfile), encryptionKey);

    return encryptedData;
  } catch (error) {
    console.error('Failed to export portable profile:', error);
    throw new Error('Export failed');
  }
};

/**
 * Import a portable profile from encrypted data
 */
export const importPortableProfile = async (encryptedData: string, password: string): Promise<void> => {
  try {
    // Decrypt the data
    const encryptionKey = deriveKey(password);
    const decryptedJson = decryptData(encryptedData, encryptionKey);
    const portableProfile: PortableProfile = JSON.parse(decryptedJson);

    // Validate the profile
    if (!portableProfile.version || !portableProfile.profile || !portableProfile.profileData) {
      throw new Error('Invalid profile format');
    }

    // Check checksum
    const dataString = JSON.stringify({
      profile: portableProfile.profile,
      profileData: portableProfile.profileData
    });
    const expectedChecksum = btoa(dataString).slice(0, 32);

    if (portableProfile.checksum !== expectedChecksum) {
      throw new Error('Profile checksum mismatch - file may be corrupted');
    }

    // Check if profile already exists
    const existingProfiles = await guestAccountService.listLocalProfiles();
    const existingProfile = existingProfiles.find(p => p.displayName === portableProfile.profile.displayName);

    if (existingProfile) {
      // Ask user if they want to overwrite (this would be handled in the UI)
      throw new Error('Profile already exists. Please choose a different name or delete the existing profile.');
    }

    // Create the profile in IndexedDB
    const newProfile = await guestAccountService.createLocalProfile(
      portableProfile.profile.displayName,
      portableProfile.profile.email,
      {
        pin: portableProfile.profile.securityPin,
        usePassword: portableProfile.profile.usePassword,
        firstName: portableProfile.profile.firstName,
        lastName: portableProfile.profile.lastName
      }
    );

    // Import the profile data
    await guestAccountService.updateLocalProfileData(newProfile.id, portableProfile.profileData);

  } catch (error) {
    console.error('Failed to import portable profile:', error);
    throw error;
  }
};

/**
 * Download encrypted profile as file
 */
export const downloadPortableProfile = (encryptedData: string, fileName: string): void => {
  const blob = new Blob([encryptedData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
};

/**
 * Read file content as text
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};