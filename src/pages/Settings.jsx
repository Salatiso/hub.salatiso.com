import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Cloud, Smartphone, Shield, Database, Settings as SettingsIcon } from 'lucide-react';
import GuestContext from '../contexts/GuestContext';
import { googleDriveService } from '../services/googleDriveService';
import { guestAccountService } from '../services/guestAccountService';
import { exportPortableProfile, importPortableProfile, downloadPortableProfile, readFileAsText } from '../utils/portableProfile';

const Settings = () => {
  const { guestData } = useContext(GuestContext);
  const navigate = useNavigate();
  const [syncPreferences, setSyncPreferences] = useState({
    autoSync: true,
    manualOnly: false,
    selectedCategories: ['profile', 'services', 'trustVerification']
  });
  const [deviceTier, setDeviceTier] = useState('mobile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [exportPassword, setExportPassword] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [googleDriveSignedIn, setGoogleDriveSignedIn] = useState(false);
  const [showGoogleDriveDialog, setShowGoogleDriveDialog] = useState(false);
  const [googleDriveFiles, setGoogleDriveFiles] = useState([]);

  useEffect(() => {
    loadSettings();
    initializeGoogleDrive();
  }, []);

  const initializeGoogleDrive = async () => {
    try {
      await googleDriveService.initialize();
      setGoogleDriveSignedIn(googleDriveService.isUserSignedIn());
    } catch (error) {
      console.error('Google Drive initialization failed:', error);
    }
  };

  const loadSettings = async () => {
    try {
      // Load sync preferences
      const profiles = await guestAccountService.listLocalProfiles();
      const currentProfile = profiles.find(p => p.displayName === guestData?.profile?.firstName + ' ' + guestData?.profile?.lastName);

      if (currentProfile) {
        const preferences = await syncManager.getSyncPreferences(currentProfile.id);
        setSyncPreferences(preferences);
      }

      // Load device tier
      setDeviceTier(guestData?.profile?.deviceType || 'mobile');
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSyncPreferencesChange = async (updates) => {
    const newPreferences = { ...syncPreferences, ...updates };
    setSyncPreferences(newPreferences);

    try {
      const profiles = await guestAccountService.listLocalProfiles();
      const currentProfile = profiles.find(p => p.displayName === guestData?.profile?.firstName + ' ' + guestData?.profile?.lastName);

      if (currentProfile) {
        await syncManager.updateSyncPreferences(currentProfile.id, newPreferences);
        setMessage('Sync preferences updated successfully');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to update sync preferences:', error);
      setMessage('Failed to update sync preferences');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleManualSync = async () => {
    setIsLoading(true);
    try {
      const profiles = await guestAccountService.listLocalProfiles();
      const currentProfile = profiles.find(p => p.displayName === guestData?.profile?.firstName + ' ' + guestData?.profile?.lastName);

      if (currentProfile) {
        const result = await syncManager.manualSync(currentProfile.id);
        if (result.success) {
          setMessage(`Sync completed successfully. Synced: ${result.syncedCategories.join(', ')}`);
        } else {
          setMessage(`Sync failed: ${result.error}`);
        }
      }
    } catch (error) {
      setMessage('Sync failed');
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleExportProfile = async () => {
    if (!exportPassword) {
      setMessage('Please enter a password for encryption');
      return;
    }

    setIsLoading(true);
    try {
      const profiles = await guestAccountService.listLocalProfiles();
      const currentProfile = profiles.find(p => p.displayName === guestData?.profile?.firstName + ' ' + guestData?.profile?.lastName);

      if (currentProfile) {
        const encryptedData = await exportPortableProfile(currentProfile.id, exportPassword);
        const fileName = `lifesync-profile-${currentProfile.displayName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.lifesync`;
        downloadPortableProfile(encryptedData, fileName);
        setMessage('Profile exported successfully');
        setShowExportDialog(false);
        setExportPassword('');
      } else {
        setMessage('No profile found to export');
      }
    } catch (error) {
      setMessage('Export failed: ' + error.message);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleGoogleDriveSignIn = async () => {
    try {
      await googleDriveService.signIn();
      setGoogleDriveSignedIn(true);
      setMessage('Successfully signed in to Google Drive');
    } catch (error) {
      setMessage('Google Drive sign-in failed: ' + error.message);
    }
    setTimeout(() => setMessage(''), 5000);
  };

  const handleGoogleDriveSignOut = async () => {
    try {
      await googleDriveService.signOut();
      setGoogleDriveSignedIn(false);
      setMessage('Signed out from Google Drive');
    } catch (error) {
      setMessage('Google Drive sign-out failed: ' + error.message);
    }
    setTimeout(() => setMessage(''), 5000);
  };

  const handleExportToGoogleDrive = async () => {
    if (!googleDriveSignedIn) {
      setMessage('Please sign in to Google Drive first');
      return;
    }

    if (!exportPassword) {
      setMessage('Please enter a password for encryption');
      return;
    }

    setIsLoading(true);
    try {
      const profileData = await guestAccountService.getLocalProfileData(currentProfile?.id);
      const encryptedData = await exportPortableProfile(JSON.stringify(profileData), exportPassword);

      const fileName = `lifesync-profile-${currentProfile?.name || 'default'}-${new Date().toISOString().split('T')[0]}.lifesync`;

      // Check if file already exists
      const existingFileId = await googleDriveService.fileExists(fileName);
      if (existingFileId) {
        await googleDriveService.updateFile(existingFileId, encryptedData);
        setMessage('Profile updated on Google Drive successfully');
      } else {
        await googleDriveService.uploadFile(fileName, encryptedData);
        setMessage('Profile exported to Google Drive successfully');
      }

      setShowExportDialog(false);
      setExportPassword('');
    } catch (error) {
      setMessage('Export to Google Drive failed: ' + error.message);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleImportFromGoogleDrive = async () => {
    if (!googleDriveSignedIn) {
      setMessage('Please sign in to Google Drive first');
      return;
    }

    setIsLoading(true);
    try {
      const files = await googleDriveService.listProfileFiles();
      setGoogleDriveFiles(files);
      setShowGoogleDriveDialog(true);
    } catch (error) {
      setMessage('Failed to load Google Drive files: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleDriveFileSelect = async (fileId) => {
    if (!importPassword) {
      setMessage('Please enter the password for decryption');
      return;
    }

    setIsLoading(true);
    try {
      const encryptedData = await googleDriveService.downloadFile(fileId);
      await importPortableProfile(encryptedData, importPassword);
      setMessage('Profile imported from Google Drive successfully. Please refresh the page.');
      setShowGoogleDriveDialog(false);
      setImportPassword('');
    } catch (error) {
      setMessage('Import from Google Drive failed: ' + error.message);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.lifesync')) {
      setSelectedFile(file);
    } else {
      setMessage('Please select a valid .lifesync file');
    }
  };

  const dataCategories = [
    { id: 'profile', label: 'LifeCV & Profile', description: 'Basic profile information and LifeCV data' },
    { id: 'services', label: 'Services & Enrollments', description: 'Service registrations and history' },
    { id: 'trustVerification', label: 'Trust Verification', description: 'Trust scores and verification data' },
    { id: 'contacts', label: 'Contacts & Relationships', description: 'Contact list and relationship data' },
    { id: 'assets', label: 'Assets & Projects', description: 'Asset tracking and project data' }
  ];

  const deviceTiers = [
    { id: 'mobile', label: 'Mobile', description: 'Basic features, optimized for phones' },
    { id: 'tablet', label: 'Tablet', description: 'Enhanced features, optimized for tablets' },
    { id: 'desktop', label: 'Desktop', description: 'Full features, optimized for computers' },
    { id: 'server', label: 'Server', description: 'Maximum features, for dedicated devices' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message}
        </div>
      )}

      {/* Sync Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Cloud className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Sync Settings</h2>
        </div>

        <div className="space-y-6">
          {/* Sync Mode */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Sync Mode</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="syncMode"
                  checked={syncPreferences.autoSync && !syncPreferences.manualOnly}
                  onChange={() => handleSyncPreferencesChange({ autoSync: true, manualOnly: false })}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Automatic Sync</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Sync changes automatically when online</div>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="syncMode"
                  checked={syncPreferences.manualOnly}
                  onChange={() => handleSyncPreferencesChange({ autoSync: false, manualOnly: true })}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Manual Sync Only</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Only sync when you press the sync button</div>
                </div>
              </label>
            </div>
          </div>

          {/* Data Categories */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Data to Sync</h3>
            <div className="space-y-3">
              {dataCategories.map(category => (
                <label key={category.id} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={syncPreferences.selectedCategories.includes(category.id)}
                    onChange={(e) => {
                      const newCategories = e.target.checked
                        ? [...syncPreferences.selectedCategories, category.id]
                        : syncPreferences.selectedCategories.filter(c => c !== category.id);
                      handleSyncPreferencesChange({ selectedCategories: newCategories });
                    }}
                    className="w-4 h-4 text-blue-600 mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{category.label}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{category.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Manual Sync Button */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <button
                onClick={handleManualSync}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                <Cloud className="w-4 h-4" />
                {isLoading ? 'Syncing...' : 'Sync Now'}
              </button>
              {syncPreferences.pendingChanges > 0 && (
                <div className="flex items-center gap-2">
                  <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    {syncPreferences.pendingChanges} pending
                  </div>
                </div>
              )}
            </div>
            {syncPreferences.lastSync && (
              <div className="text-xs text-gray-500 mt-2">
                Last synced: {new Date(syncPreferences.lastSync).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Smartphone className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Performance</h2>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Device Tier</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deviceTiers.map(tier => (
              <label key={tier.id} className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  name="deviceTier"
                  value={tier.id}
                  checked={deviceTier === tier.id}
                  onChange={(e) => setDeviceTier(e.target.value)}
                  className="w-4 h-4 text-green-600 mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{tier.label}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{tier.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Google Drive Integration</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {googleDriveSignedIn ? 'Connected to Google Drive' : 'Connect to store profiles in Google Drive'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {googleDriveSignedIn ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Cloud className="w-5 h-5" />
                  <span className="text-sm font-medium">Connected</span>
                  <button
                    onClick={handleGoogleDriveSignOut}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleDriveSignIn}
                  className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  Connect
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Profile Export</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Export your profile for backup or migration</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowExportDialog(true)}
                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Local
              </button>
              <button
                onClick={handleExportToGoogleDrive}
                disabled={!googleDriveSignedIn}
                className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded"
              >
                Drive
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Profile Import</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Import a previously exported profile</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowImportDialog(true)}
                className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Local
              </button>
              <button
                onClick={handleImportFromGoogleDrive}
                disabled={!googleDriveSignedIn}
                className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded"
              >
                Drive
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Data Management</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Local Storage</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Your data is stored locally on this device</div>
              </div>
              <div className="text-sm text-gray-500">IndexedDB</div>
            </div>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-white mb-2">Data Categories</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Profile & LifeCV
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Services & Enrollments
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Trust Verification
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Contacts & Relationships
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password for Encryption
                </label>
                <input
                  type="password"
                  value={exportPassword}
                  onChange={(e) => setExportPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter a strong password"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleExportProfile}
                  disabled={!exportPassword || isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {isLoading ? 'Exporting...' : 'Export'}
                </button>
                <button
                  onClick={() => setShowExportDialog(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Import Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Profile File
                </label>
                <input
                  type="file"
                  accept=".lifesync"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password for Decryption
                </label>
                <input
                  type="password"
                  value={importPassword}
                  onChange={(e) => setImportPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter the export password"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleImportProfile}
                  disabled={!selectedFile || !importPassword || isLoading}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {isLoading ? 'Importing...' : 'Import'}
                </button>
                <button
                  onClick={() => setShowImportDialog(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Drive File Selection Dialog */}
      {showGoogleDriveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Profile from Google Drive</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password for Decryption
                </label>
                <input
                  type="password"
                  value={importPassword}
                  onChange={(e) => setImportPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter the export password"
                />
              </div>
              <div className="space-y-2">
                {googleDriveFiles.length > 0 ? (
                  googleDriveFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => handleGoogleDriveFileSelect(file.id)}
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{file.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Modified: {new Date(file.modifiedTime).toLocaleString()}
                        </div>
                      </div>
                      <Cloud className="w-5 h-5 text-red-600" />
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No LifeSync profile files found in Google Drive
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowGoogleDriveDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;