/**
 * MigrationComponent - UI for localStorage to Dexie Migration
 * 
 * Provides user-friendly interface for migrating legacy profiles
 * with progress tracking, backup options, and confirmation.
 * 
 * Phase 2 Day 2: Migration UI
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader, Download, Trash2 } from 'lucide-react';
import {
  detectLocalStorageProfiles,
  migrateAllProfiles,
  backupLocalStorage,
  clearMigratedProfiles,
  getMigrationStats,
  type IMigrationStats,
} from '../services/migrationService';
import { db, initializeLifeSyncDB } from '../db/profiles.db';

interface MigrationState {
  status: 'idle' | 'detecting' | 'ready' | 'migrating' | 'completed' | 'error';
  profileCount: number;
  stats?: IMigrationStats;
  error?: string;
  dexieProfiles: number;
}

export default function MigrationComponent(): JSX.Element {
  const [state, setState] = useState<MigrationState>({
    status: 'idle',
    profileCount: 0,
    dexieProfiles: 0,
  });

  // Initialize database and detect profiles on mount
  useEffect(() => {
    const init = async (): Promise<void> => {
      try {
        await initializeLifeSyncDB();

        const detected = detectLocalStorageProfiles();
        const migrationStats = await getMigrationStats();

        if (detected.hasLegacyData && migrationStats.dexie === 0) {
          setState((prev) => ({
            ...prev,
            status: 'ready',
            profileCount: detected.profiles.length,
            dexieProfiles: migrationStats.dexie,
          }));
        } else if (!detected.hasLegacyData && migrationStats.dexie > 0) {
          setState((prev) => ({
            ...prev,
            status: 'completed',
            dexieProfiles: migrationStats.dexie,
          }));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Initialization failed';
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: message,
        }));
      }
    };

    init();
  }, []);

  const handleBackupAndMigrate = async (): Promise<void> => {
    setState((prev) => ({ ...prev, status: 'migrating' }));

    try {
      // Backup first
      const backup = backupLocalStorage();

      // Download backup
      const element = document.createElement('a');
      element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(backup)}`);
      element.setAttribute('download', `lifesync-backup-${Date.now()}.json`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      // Migrate
      const stats = await migrateAllProfiles();

      setState((prev) => ({
        ...prev,
        status: 'completed',
        stats,
        profileCount: 0,
        dexieProfiles: stats.succeeded,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Migration failed';
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: message,
      }));
    }
  };

  const handleClearLocalStorage = (): void => {
    if (
      window.confirm(
        'This will permanently delete the localStorage profiles after confirming migration. Continue?'
      )
    ) {
      try {
        clearMigratedProfiles(true);
        setState((prev) => ({
          ...prev,
          profileCount: 0,
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Clear failed';
        setState((prev) => ({
          ...prev,
          error: message,
        }));
      }
    }
  };

  // Ready state - show migration prompt
  if (state.status === 'ready') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-blue-600" />
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">Data Migration</h2>
          <p className="text-gray-600 text-center mb-6">
            We found {state.profileCount} profile(s) in your browser storage.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>What happens:</strong>
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
              <li>✓ Backup your data</li>
              <li>✓ Upgrade to secure PIN storage</li>
              <li>✓ Enable offline access</li>
            </ul>
          </div>

          <button
            onClick={handleBackupAndMigrate}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <Loader className="w-4 h-4" />
            Start Migration
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Your backup will be downloaded before migration starts.
          </p>
        </div>
      </div>
    );
  }

  // Migrating state - show progress
  if (state.status === 'migrating') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-bold mb-2">Migrating your data...</h2>
          <p className="text-gray-600">This may take a moment</p>
        </div>
      </div>
    );
  }

  // Completed state - show success
  if (state.status === 'completed' && state.stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">Migration Complete!</h2>
          <p className="text-gray-600 text-center mb-6">
            Successfully migrated {state.stats.succeeded} profile(s) to secure storage.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 space-y-2">
            <p className="text-sm">
              <span className="text-gray-600">Profiles migrated:</span>
              <span className="ml-2 font-semibold text-green-600">{state.stats.succeeded}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-600">Time taken:</span>
              <span className="ml-2 font-semibold text-green-600">
                {state.stats.duration ? `${state.stats.duration}ms` : 'Done'}
              </span>
            </p>
          </div>

          {state.profileCount > 0 && (
            <button
              onClick={handleClearLocalStorage}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 mb-4 border border-red-200"
            >
              <Trash2 className="w-4 h-4" />
              Clear Old Storage
            </button>
          )}

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
            Continue to App
          </button>
        </div>
      </div>
    );
  }

  // Error state
  if (state.status === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">Migration Error</h2>
          <p className="text-gray-600 text-center mb-6">{state.error}</p>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Already migrated or no data - show success
  if (state.status === 'completed' && state.dexieProfiles > 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">All Set!</h2>
          <p className="text-gray-600 mb-6">
            You have {state.dexieProfiles} profile(s) ready to use.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
            Continue to App
          </button>
        </div>
      </div>
    );
  }

  // Default idle state
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white rounded-lg shadow-xl p-8 text-center">
        <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-gray-600" />
        <h2 className="text-xl font-bold mb-2">Preparing...</h2>
        <p className="text-gray-600">Setting up your profile storage</p>
      </div>
    </div>
  );
}
