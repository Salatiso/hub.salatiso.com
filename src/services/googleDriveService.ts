/**
 * Google Drive Integration for LifeSync
 * Handles profile storage and retrieval from Google Drive
 * Updated to use Google Identity Services API (modern approach)
 */

declare global {
  interface Window {
    google: any;
  }
  interface ImportMeta {
    env: Record<string, string>;
  }
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  modifiedTime: string;
  size: string;
}

export interface GoogleDriveConfig {
  apiKey: string;
  clientId: string;
  scope: string;
  discoveryDocs: string[];
}

class GoogleDriveService {
  private static instance: GoogleDriveService;
  private isInitialized = false;
  private isSignedIn = false;
  private accessToken: string | null = null;
  private userProfile: any = null;

  private config: GoogleDriveConfig;

  private constructor() {
    // Initialize config with import.meta.env (Vite)
    const apiKey = (import.meta.env as any).VITE_GOOGLE_DRIVE_API_KEY || '';
    const clientId = (import.meta.env as any).VITE_GOOGLE_DRIVE_CLIENT_ID || '';

    this.config = {
      apiKey,
      clientId,
      scope: 'https://www.googleapis.com/auth/drive.file',
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
    };
  }

  static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  /**
   * Initialize Google Identity Services
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Check if credentials are configured
    if (!this.config.clientId || !this.config.apiKey) {
      console.warn('Google Drive API credentials not configured. Skipping initialization.');
      return;
    }

    return new Promise((resolve, reject) => {
      // Load Google Identity Services script if not already loaded
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => this.initClient(resolve, reject);
        script.onerror = () => {
          console.error('Failed to load Google Identity Services script');
          reject(new Error('Failed to load Google Identity Services script'));
        };
        document.head.appendChild(script);
      } else {
        this.initClient(resolve, reject);
      }
    });
  }

  private async initClient(resolve: () => void, reject: (error: any) => void) {
    try {
      // Initialize Google Identity Services
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: this.config.clientId,
        scope: this.config.scope,
        callback: (response: any) => {
          if (response.error) {
            console.error('Google OAuth error:', response);
            reject(new Error(response.error));
            return;
          }

          this.accessToken = response.access_token;
          this.isSignedIn = true;
          this.isInitialized = true;

          // Get user profile info
          this.fetchUserProfile();

          resolve();
        }
      });

      // Store client for later use
      (this as any).tokenClient = client;
      this.isInitialized = true;
      resolve();
    } catch (error) {
      reject(error);
    }
  }

  private async fetchUserProfile() {
    if (!this.accessToken) return;

    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      });

      if (response.ok) {
        this.userProfile = await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  }

  /**
   * Sign in to Google
   */
  async signIn(): Promise<void> {
    if (!this.isInitialized) await this.initialize();

    const tokenClient = (this as any).tokenClient;
    if (!tokenClient) {
      throw new Error('Google Identity Services not initialized');
    }

    return new Promise((resolve, reject) => {
      tokenClient.callback = (response: any) => {
        if (response.error) {
          console.error('Sign-in error:', response);
          reject(new Error(response.error));
          return;
        }

        this.accessToken = response.access_token;
        this.isSignedIn = true;

        // Get user profile info
        this.fetchUserProfile();

        resolve();
      };

      tokenClient.requestAccessToken();
    });
  }

  /**
   * Sign out from Google
   */
  async signOut(): Promise<void> {
    if (!this.isSignedIn) return;

    // Revoke the access token
    if (this.accessToken) {
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${this.accessToken}`, {
          method: 'POST',
          headers: {
            'Content-type': 'application/x-www-form-urlencoded'
          }
        });
      } catch (error) {
        console.error('Error revoking token:', error);
      }
    }

    this.accessToken = null;
    this.isSignedIn = false;
    this.userProfile = null;
  }

  /**
   * Check if user is signed in
   */
  isUserSignedIn(): boolean {
    return this.isSignedIn && !!this.accessToken;
  }

  /**
   * Get user profile information
   */
  getUserProfile(): any {
    return this.userProfile;
  }

  /**
   * Upload file to Google Drive
   */
  async uploadFile(fileName: string, content: string, mimeType = 'application/json'): Promise<string> {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('Not signed in to Google Drive');
    }

    const file = new Blob([content], { type: mimeType });
    const metadata = {
      name: fileName,
      mimeType: mimeType,
      parents: ['appDataFolder'] // Use app data folder for private storage
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      },
      body: form
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.id;
  }

  /**
   * Download file from Google Drive
   */
  async downloadFile(fileId: string): Promise<string> {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('Not signed in to Google Drive');
    }

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    return await response.text();
  }

  /**
   * List LifeSync profile files
   */
  async listProfileFiles(): Promise<GoogleDriveFile[]> {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('Not signed in to Google Drive');
    }

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name+contains+'.lifesync'+and+trashed+=+false&spaces=drive&fields=files(id,+name,+modifiedTime,+size)&orderBy=modifiedTime+desc`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`List files failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.files || [];
  }

  /**
   * Delete file from Google Drive
   */
  async deleteFile(fileId: string): Promise<void> {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('Not signed in to Google Drive');
    }

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }
  }

  /**
   * Update existing file
   */
  async updateFile(fileId: string, content: string): Promise<void> {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('Not signed in to Google Drive');
    }

    const file = new Blob([content], { type: 'application/json' });

    const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      },
      body: file
    });

    if (!response.ok) {
      throw new Error(`Update failed: ${response.statusText}`);
    }
  }

  /**
   * Check if a file exists by name
   */
  async fileExists(fileName: string): Promise<string | null> {
    if (!this.isSignedIn || !this.accessToken) return null;

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${fileName}'+and+trashed+=+false&spaces=drive&fields=files(id,+name)`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        }
      );

      if (!response.ok) return null;

      const result = await response.json();
      const files = result.files || [];
      return files.length > 0 ? files[0].id : null;
    } catch (error) {
      return null;
    }
  }
}

export const googleDriveService = GoogleDriveService.getInstance();