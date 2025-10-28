import { createContext, useState, useEffect, useCallback } from 'react';
import { idbGet, idbSet } from '../utils/storage';

const GuestContext = createContext();

// Enhanced Guest Context with offline capabilities
export const useGuestData = () => {
  const [guestData, setGuestData] = useState(() => {
    const saved = localStorage.getItem('lifesync_guest');
    const base = saved ? JSON.parse(saved) : {};
    return {
      profile: base.profile || {},
      questionnaires: base.questionnaires || {},
      syncs: base.syncs || [],
      createdAt: base.createdAt || Date.now(),
      renewals: base.renewals || 0,
      lastReminder: base.lastReminder || null,
      expired: base.expired || false,
      offlineSettings: base.offlineSettings || {
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
      sealEvents: base.sealEvents || [],
      geofences: base.geofences || [],
      checkIns: base.checkIns || [],
      geofenceLogs: base.geofenceLogs || [],
      checkInLogs: base.checkInLogs || [],
      settings: { enableHubSync: base.settings?.enableHubSync ?? false },
      // Enhanced profile fields
      deviceType: base.deviceType || null,
      trustScore: base.trustScore || 0,
      verifications: base.verifications || [],
      // Contacts and relationships
      contacts: base.contacts || [],
      relationships: base.relationships || [],
      // Offline queue for pending operations
      offlineQueue: base.offlineQueue || [],
      // Sync status
      lastSync: base.lastSync || null,
      syncStatus: base.syncStatus || 'idle' // 'idle', 'syncing', 'error'
    };
  });

  // Enhanced setter with offline persistence
  const updateGuestData = useCallback((updates) => {
    setGuestData(prev => {
      const newData = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };

      // Persist to localStorage
      localStorage.setItem('lifesync_guest', JSON.stringify(newData));

      // Persist heavy slices to IndexedDB
      if (newData.sealEvents) idbSet('sealEvents', newData.sealEvents);
      if (newData.geofences) idbSet('geofences', newData.geofences);
      if (newData.checkIns) idbSet('checkIns', newData.checkIns);
      if (newData.geofenceLogs) idbSet('geofenceLogs', newData.geofenceLogs);
      if (newData.checkInLogs) idbSet('checkInLogs', newData.checkInLogs);
      if (newData.contacts) idbSet('contacts', newData.contacts);
      if (newData.relationships) idbSet('relationships', newData.relationships);
      if (newData.offlineQueue) idbSet('offlineQueue', newData.offlineQueue);

      return newData;
    });
  }, []);

  // Backwards-compatible setter used throughout legacy code paths
  const setGuestDataCompat = useCallback((value) => {
    if (typeof value === 'function') {
      updateGuestData(value);
    } else {
      updateGuestData(() => value);
    }
  }, [updateGuestData]);

  // Hydrate from IndexedDB on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      const [
        sealEvents, geofences, checkIns, geofenceLogs, checkInLogs,
        contacts, relationships, offlineQueue
      ] = await Promise.all([
        idbGet('sealEvents'), idbGet('geofences'), idbGet('checkIns'),
        idbGet('geofenceLogs'), idbGet('checkInLogs'),
        idbGet('contacts'), idbGet('relationships'), idbGet('offlineQueue')
      ]);

      if (!mounted) return;

      updateGuestData(prev => ({
        ...prev,
        sealEvents: sealEvents || prev.sealEvents,
        geofences: geofences || prev.geofences,
        checkIns: checkIns || prev.checkIns,
        geofenceLogs: geofenceLogs || prev.geofenceLogs,
        checkInLogs: checkInLogs || prev.checkInLogs,
        contacts: contacts || prev.contacts || [],
        relationships: relationships || prev.relationships || [],
        offlineQueue: offlineQueue || prev.offlineQueue || []
      }));
    })();
    return () => { mounted = false; };
  }, [updateGuestData]);

  // Export profile functionality
  const exportProfile = useCallback(() => {
    const exportData = {
      profile: guestData.profile,
      deviceType: guestData.deviceType,
      trustScore: guestData.trustScore,
      verifications: guestData.verifications,
      contacts: guestData.contacts,
      relationships: guestData.relationships,
      geofences: guestData.geofences,
      checkIns: guestData.checkIns,
      servicesRegistered: guestData.servicesRegistered,
      role: guestData.role,
      exportedAt: Date.now(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifesync-profile-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [guestData]);

  // Import profile functionality
  const importProfile = useCallback(async (file) => {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      if (!importData.version || !importData.profile) {
        throw new Error('Invalid profile file format');
      }

      updateGuestData(prev => ({
        ...prev,
        profile: { ...prev.profile, ...importData.profile },
        deviceType: importData.deviceType || prev.deviceType,
        trustScore: importData.trustScore || prev.trustScore,
        verifications: importData.verifications || prev.verifications,
        contacts: importData.contacts || prev.contacts,
        relationships: importData.relationships || prev.relationships,
        geofences: importData.geofences || prev.geofences,
        checkIns: importData.checkIns || prev.checkIns,
        servicesRegistered: importData.servicesRegistered || prev.servicesRegistered,
        role: importData.role || prev.role
      }));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [updateGuestData]);

  // Add to offline queue
  const queueOfflineAction = useCallback((action) => {
    const queuedAction = {
      id: Date.now().toString(),
      type: action.type,
      payload: action.payload,
      timestamp: Date.now(),
      status: 'pending'
    };

    updateGuestData(prev => ({
      ...prev,
      offlineQueue: [...(prev.offlineQueue || []), queuedAction]
    }));

    return queuedAction.id;
  }, [updateGuestData]);

  // Process offline queue
  const processOfflineQueue = useCallback(async () => {
    if (!guestData.offlineQueue?.length || guestData.syncStatus === 'syncing') return;

    updateGuestData(prev => ({ ...prev, syncStatus: 'syncing' }));

    try {
      // Process queue items (this would integrate with syncQueue.js)
      const processedIds = [];

      for (const item of guestData.offlineQueue) {
        try {
          // Here you would implement the actual sync logic
          // For now, just mark as completed
          processedIds.push(item.id);
        } catch (error) {
          console.error('Failed to process offline action:', item, error);
        }
      }

      // Remove processed items
      updateGuestData(prev => ({
        ...prev,
        offlineQueue: prev.offlineQueue.filter(item => !processedIds.includes(item.id)),
        lastSync: Date.now(),
        syncStatus: 'idle'
      }));
    } catch (error) {
      updateGuestData(prev => ({ ...prev, syncStatus: 'error' }));
      console.error('Offline queue processing failed:', error);
    }
  }, [guestData.offlineQueue, guestData.syncStatus, updateGuestData]);

  return {
    guestData,
    updateGuestData,
    exportProfile,
    importProfile,
    queueOfflineAction,
    processOfflineQueue,
    setGuestData: setGuestDataCompat
  };
};

export default GuestContext;
