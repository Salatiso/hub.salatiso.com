import { useContext, useState, useRef } from 'react';
import GuestContext from '../contexts/GuestContext';
import { encryptJSON, decryptJSON } from '../utils/crypto';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { announceToScreenReader } from '../utils/keyboardUtils';

const GuestManagement = () => {
  const { guestData, setGuestData } = useContext(GuestContext);
  const [showRenewal, setShowRenewal] = useState(false);

  const daysRemaining = () => {
    const now = Date.now();
    const thirtyFiveDays = 35 * 24 * 60 * 60 * 1000;
    const elapsed = now - guestData.createdAt;
    const remaining = Math.max(0, thirtyFiveDays - elapsed);
    return Math.ceil(remaining / (24 * 60 * 60 * 1000));
  };

  const handleRenewal = () => {
    if (guestData.renewals >= 3) return;

    setGuestData(prev => ({
      ...prev,
      createdAt: Date.now(),
      renewals: prev.renewals + 1,
      expired: false,
      lastReminder: null
    }));
    setShowRenewal(false);
  };

  const createSnapshot = () => {
    const snapshot = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      data: {
        profile: guestData.profile || {},
        questionnaires: guestData.questionnaires || {},
        syncs: guestData.syncs || [],
        sealEvents: guestData.sealEvents || [],
        geofences: guestData.geofences || [],
        checkIns: guestData.checkIns || [],
        geofenceLogs: guestData.geofenceLogs || [],
        checkInLogs: guestData.checkInLogs || []
      }
    };
    setGuestData(prev => ({
      ...prev,
      backups: [snapshot, ...(prev.backups || [])].slice(0, 10)
    }));
  };

  const restoreSnapshot = (id) => {
    const snap = (guestData.backups || []).find(s => s.id === id);
    if (!snap) return;
    setGuestData(prev => ({
      ...prev,
      profile: { ...(prev.profile||{}), ...(snap.data.profile||{}) },
      questionnaires: { ...(prev.questionnaires||{}), ...(snap.data.questionnaires||{}) },
      syncs: [ ...(snap.data.syncs||[]) ],
      sealEvents: [ ...(snap.data.sealEvents||[]) ],
      geofences: [ ...(snap.data.geofences||[]) ],
      checkIns: [ ...(snap.data.checkIns||[]) ],
      geofenceLogs: [ ...(snap.data.geofenceLogs||[]) ],
      checkInLogs: [ ...(snap.data.checkInLogs||[]) ]
    }));
  };

  const downloadProfile = () => {
    const dataStr = JSON.stringify({
      profile: guestData.profile,
      questionnaires: guestData.questionnaires,
      syncs: guestData.syncs,
      exportedAt: Date.now(),
      version: '1.0'
    }, null, 2);

    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `lifesync-profile-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadEncrypted = async () => {
    const pass = prompt('Enter a passphrase for encryption');
    if (!pass) return;
    const payload = {
      profile: guestData.profile,
      questionnaires: guestData.questionnaires,
      syncs: guestData.syncs,
      sealEvents: guestData.sealEvents,
      geofences: guestData.geofences,
      checkIns: guestData.checkIns,
      exportedAt: Date.now(),
      version: '1.1'
    };
    const bundle = await encryptJSON(payload, pass);
    const blob = new Blob([JSON.stringify(bundle)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lifesync-encrypted-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const uploadEncrypted = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const pass = prompt('Enter the passphrase used for encryption');
    if (!pass) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const bundle = JSON.parse(e.target.result);
        const data = await decryptJSON(bundle, pass);
        setGuestData(prev => ({
          ...prev,
          profile: { ...prev.profile, ...data.profile },
          questionnaires: { ...prev.questionnaires, ...data.questionnaires },
          syncs: [...(prev.syncs || []), ...(data.syncs || [])],
          sealEvents: data.sealEvents || prev.sealEvents,
          geofences: data.geofences || prev.geofences,
          checkIns: data.checkIns || prev.checkIns
        }));
        alert('Encrypted profile imported successfully');
      } catch (err) {
        alert('Failed to decrypt or parse file');
      }
    };
    reader.readAsText(file);
  };

  const uploadProfile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.profile && data.questionnaires && data.syncs) {
          setGuestData(prev => ({
            ...prev,
            profile: { ...prev.profile, ...data.profile },
            questionnaires: { ...prev.questionnaires, ...data.questionnaires },
            syncs: [...(prev.syncs || []), ...(data.syncs || [])]
          }));
          alert('Profile uploaded successfully!');
        } else {
          alert('Invalid profile file format');
        }
      } catch (error) {
        alert('Error reading profile file');
      }
    };
    reader.readAsText(file);
  };

  if (!guestData.expired) {
    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-blue-800 dark:text-blue-200">Guest Session Active</h3>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              {daysRemaining()} days remaining
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
              Renewals used: {guestData.renewals}/3
            </p>
            <div className="text-xs text-blue-500 dark:text-blue-400 mt-1 flex items-center gap-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!guestData.settings?.enableHubSync} onChange={(e) => setGuestData(prev => ({ ...prev, settings: { ...(prev.settings||{}), enableHubSync: e.target.checked } }))} />
                Enable Hub sync (experimental)
              </label>
            </div>
          </div>
          <div className="space-x-2">
            <button
              onClick={downloadProfile}
              aria-label="Download Profile"
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Download Profile
            </button>
            <button
              onClick={downloadEncrypted}
              aria-label="Encrypted Export"
              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Encrypted Export
            </button>
            <label className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 cursor-pointer inline-block focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
              Upload Profile
              <input
                type="file"
                accept=".json"
                onChange={uploadProfile}
                className="hidden"
                aria-label="Upload Profile File"
              />
            </label>
            <label className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 cursor-pointer inline-block focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
              Encrypted Import
              <input
                type="file"
                accept=".json"
                onChange={uploadEncrypted}
                className="hidden"
                aria-label="Encrypted Import File"
              />
            </label>
            <button
              onClick={createSnapshot}
              aria-label="Create Restore Point"
              className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Create Restore Point
            </button>
          </div>
        </div>
        {(guestData.backups && guestData.backups.length > 0) && (
          <div className="mt-3">
            <div className="text-xs font-semibold mb-1">Restore Points</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {guestData.backups.map(s => (
                <div key={s.id} className="flex items-center justify-between text-xs bg-white/60 dark:bg-gray-800/60 p-2 rounded">
                  <div>
                    {s.createdAt}
                  </div>
                  <button
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    onClick={() => restoreSnapshot(s.id)}
                    aria-label={`Restore from ${s.createdAt}`}
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg border border-yellow-200 dark:border-yellow-700">
      <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Guest Session Expired</h3>
      <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-2">
        Your guest session has expired. Choose an option below:
      </p>
      <div className="mt-4 space-y-2">
        <button
          onClick={() => window.location.href = 'https://the-hub-lifecv.web.app/login'}
          aria-label="Create LifeCV Profile"
          className="w-full px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Create LifeCV Profile
        </button>
        {guestData.renewals < 3 && (
          <button
            onClick={handleRenewal}
            aria-label={`Renew Guest Session (${3 - guestData.renewals} remaining)`}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Renew Guest Session ({3 - guestData.renewals} remaining)
          </button>
        )}
        <button
          onClick={downloadProfile}
          aria-label="Download Data for Later"
          className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Download Data for Later
        </button>
      </div>
    </div>
  );
};

export default GuestManagement;