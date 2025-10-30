import { createContext, useState, useEffect, useCallback } from 'react';
import { guestAccountService } from '../services/guestAccountService';

const GuestContext = createContext();

// Enhanced Guest Context with offline capabilities and profile isolation
export const useGuestData = () => {
  const [guestData, setGuestData] = useState(() => {
    // Start with empty state - data will be loaded based on profileId
    return {
      profile: {},
      questionnaires: {},
      syncs: [],
      createdAt: Date.now(),
      renewals: 0,
      lastReminder: null,
      expired: false,
      offlineSettings: {
        bluetoothPeerSync: true,
        bluetoothRange: 'medium',
        wifiDirect: false,
        opportunisticForwarding: false,
        meshRouting: 'single',
        adaptiveSampling: true,
        dutyCycle: 'balanced',
        relayConsent: true,
        dataRetention: '30days'
      },
      // Enhanced offline data slices
      sealEvents: [],
      geofences: [],
      checkIns: [],
      geofenceLogs: [],
      checkInLogs: [],
      settings: { enableHubSync: false },
      // Enhanced profile fields
      deviceType: null,
      trustScore: 0,
      verifications: [],
      // Contacts and relationships
      contacts: [],
      relationships: [],
      // Offline queue for pending operations
      offlineQueue: [],
      // Sync status
      lastSync: null,
      syncStatus: 'idle', // 'idle', 'syncing', 'error'
      // Profile isolation
      profileId: null,
      // Loading state
      isLoading: true
    };
  });

  // Load profile data when profileId changes
  const loadProfileData = useCallback(async (profileId) => {
    if (!profileId) {
      setGuestData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const profileData = await guestAccountService.getLocalProfileData(profileId);
      setGuestData(prev => ({
        ...prev,
        ...profileData,
        profileId,
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to load profile data:', error);
      setGuestData(prev => ({ ...prev, profileId, isLoading: false }));
    }
  }, []);

  // Effect to load data when profileId changes
  useEffect(() => {
    if (guestData.profileId) {
      loadProfileData(guestData.profileId);
    } else {
      // Check if there's a current profile from guestAccountService
      const currentProfile = guestAccountService.getCurrentProfile();
      if (currentProfile) {
        loadProfileData(currentProfile.id);
      } else {
        setGuestData(prev => ({ ...prev, isLoading: false }));
      }
    }
  }, [guestData.profileId, loadProfileData]);

  // Enhanced updateGuestData with profile isolation
  const updateGuestData = useCallback(async (updates) => {
    setGuestData(prev => {
      const newData = { ...prev, ...updates };

      // If profileId is set, save to IndexedDB
      if (newData.profileId) {
        guestAccountService.updateLocalProfileData(newData.profileId, newData)
          .catch(error => console.error('Failed to save profile data:', error));
      }

      return newData;
    });
  }, []);

  // Export profile function
  const exportProfile = useCallback(async () => {
    if (!guestData.profileId) return null;

    try {
      const profileData = await guestAccountService.getLocalProfileData(guestData.profileId);
      return {
        ...profileData,
        exportedAt: Date.now(),
        version: '1.0'
      };
    } catch (error) {
      console.error('Failed to export profile:', error);
      return null;
    }
  }, [guestData.profileId]);

  // Import profile function
  const importProfile = useCallback(async (profileData) => {
    if (!guestData.profileId) return false;

    try {
      await guestAccountService.updateLocalProfileData(guestData.profileId, profileData);
      await loadProfileData(guestData.profileId);
      return true;
    } catch (error) {
      console.error('Failed to import profile:', error);
      return false;
    }
  }, [guestData.profileId, loadProfileData]);

  // Queue offline action
  const queueOfflineAction = useCallback((action) => {
    updateGuestData({
      offlineQueue: [...(guestData.offlineQueue || []), {
        ...action,
        timestamp: Date.now(),
        id: `action_${Date.now()}_${Math.random()}`
      }]
    });
  }, [guestData.offlineQueue, updateGuestData]);

  // Process offline queue
  const processOfflineQueue = useCallback(async () => {
    if (!guestData.offlineQueue || guestData.offlineQueue.length === 0) return;

    const queue = [...guestData.offlineQueue];
    updateGuestData({ offlineQueue: [] });

    for (const action of queue) {
      try {
        // Process each action (implement based on action type)
        console.log('Processing offline action:', action);
      } catch (error) {
        console.error('Failed to process offline action:', error);
        // Re-queue failed actions
        queueOfflineAction(action);
      }
    }
  }, [guestData.offlineQueue, updateGuestData, queueOfflineAction]);

  // Compatibility setter for existing code
  const setGuestDataCompat = useCallback((data) => {
    updateGuestData(data);
  }, [updateGuestData]);

  return {
    guestData,
    updateGuestData,
    setGuestData: updateGuestData,
    exportProfile,
    importProfile,
    queueOfflineAction,
    processOfflineQueue,
    loadProfileData,
    setGuestDataCompat
  };
};

export default GuestContext;
