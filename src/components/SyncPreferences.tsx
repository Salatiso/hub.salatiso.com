/**
 * Selective Sync Preferences Component
 * User interface for controlling what and when to sync
 *
 * Features:
 * - Global and per-document sync settings
 * - Selective field synchronization
 * - Sync priority control
 * - Custom sync intervals
 * - Bandwidth optimization
 *
 * @component
 */

import React, { useState, useEffect } from 'react';
import { collaborationService, SyncPreference } from '../services/collaborationService';
import { Settings, Save, RotateCw } from 'lucide-react';

interface SyncPreferencesProps {
  documentId?: string;
  onSave?: (preference: SyncPreference) => void;
  className?: string;
}

export const SyncPreferences: React.FC<SyncPreferencesProps> = ({
  documentId,
  onSave,
  className = '',
}) => {
  const [preference, setPreference] = useState<SyncPreference | null>(
    collaborationService.getSyncPreference(documentId) || {
      key: documentId || 'global',
      documentId,
      enabled: true,
      syncInterval: 30000,
      priority: 'normal',
    }
  );

  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    new Set(preference?.selectiveFields || [])
  );

  const [isSaving, setIsSaving] = useState(false);

  const availableFields = [
    'profile',
    'progress',
    'achievements',
    'preferences',
    'location',
    'contacts',
    'calendar',
    'notes',
    'media',
  ];

  const handleToggleSync = () => {
    if (preference) {
      setPreference({
        ...preference,
        enabled: !preference.enabled,
      });
    }
  };

  const handleToggleField = (field: string) => {
    const newFields = new Set(selectedFields);
    if (newFields.has(field)) {
      newFields.delete(field);
    } else {
      newFields.add(field);
    }
    setSelectedFields(newFields);
  };

  const handleSyncIntervalChange = (interval: number) => {
    if (preference) {
      setPreference({
        ...preference,
        syncInterval: interval,
      });
    }
  };

  const handlePriorityChange = (priority: 'low' | 'normal' | 'high') => {
    if (preference) {
      setPreference({
        ...preference,
        priority,
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (preference) {
        const updated: SyncPreference = {
          ...preference,
          selectiveFields: selectedFields.size > 0 ? Array.from(selectedFields) : undefined,
        };
        collaborationService.setSyncPreference(updated);
        onSave?.(updated);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!preference) {
    return null;
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Sync Preferences
        </h2>
      </div>

      {/* Main Sync Toggle */}
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {documentId ? 'Document' : 'Global'} Synchronization
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {preference.enabled
                ? 'Automatic syncing is enabled'
                : 'Automatic syncing is disabled'}
            </p>
          </div>
          <button
            onClick={handleToggleSync}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              preference.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                preference.enabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Sync Interval */}
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Sync Interval
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Real-time', value: 5000 },
            { label: 'Normal (30s)', value: 30000 },
            { label: 'Efficient (60s)', value: 60000 },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => handleSyncIntervalChange(option.value)}
              className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                preference.syncInterval === option.value
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Sync Priority
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {['low', 'normal', 'high'].map(p => (
            <button
              key={p}
              onClick={() => handlePriorityChange(p as 'low' | 'normal' | 'high')}
              className={`px-4 py-3 rounded-lg border-2 transition-colors capitalize ${
                preference.priority === p
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {preference.priority === 'high' && 'High priority: Sync immediately, uses more bandwidth'}
          {preference.priority === 'normal' && 'Normal priority: Regular sync schedule'}
          {preference.priority === 'low' && 'Low priority: Sync only when idle, uses minimal bandwidth'}
        </p>
      </div>

      {/* Selective Field Sync */}
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Fields to Sync
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {selectedFields.size === 0 ? 'Sync all' : `${selectedFields.size} selected`}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availableFields.map(field => (
            <button
              key={field}
              onClick={() => handleToggleField(field)}
              className={`px-3 py-2 rounded-lg border-2 transition-colors capitalize text-sm ${
                selectedFields.has(field)
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {field}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Leave empty to sync all fields
        </p>
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
};

export default SyncPreferences;
