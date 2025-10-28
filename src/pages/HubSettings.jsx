import { useEffect, useState, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getHubBaseUrl,
  setHubBaseUrl,
  getHubToken,
  setHubToken,
  hasHubAuth,
} from '../config/hub';
import GuestContext from '../contexts/GuestContext';

export default function HubSettings() {
  const { t } = useTranslation();
  const { guestData, setGuestData } = useContext(GuestContext);
  const [baseUrl, setBaseUrl] = useState('');
  const [token, setToken] = useState('');
  const [saved, setSaved] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [enable, setEnable] = useState(false);

  useEffect(() => {
    setBaseUrl(getHubBaseUrl() || '');
    setToken(getHubToken() || '');
    setAuthed(hasHubAuth());
    setEnable(Boolean(guestData?.settings?.enableHubSync));
    // Re-run when guestData.settings.enableHubSync changes so the toggle reflects latest
  }, [guestData?.settings?.enableHubSync]);

  const onSave = useCallback((e) => {
    e.preventDefault();
    setHubBaseUrl(baseUrl.trim());
    setHubToken(token.trim());
    setSaved(true);
    setAuthed(hasHubAuth());
    // persist enableHubSync in GuestContext
    setGuestData(prev => ({
      ...prev,
      settings: { ...(prev.settings || {}), enableHubSync: enable }
    }));
    setTimeout(() => setSaved(false), 1500);
  }, [baseUrl, token, enable, setGuestData]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('hubSettings.title', 'The Hub settings')}</h1>
      <p className="text-sm text-gray-600 mb-6">{t('hubSettings.subtitle', 'Configure The Hub connection for invitations and contact sync.')}</p>

      <form onSubmit={onSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="baseUrl">
            {t('hubSettings.baseUrl', 'Base URL')}
          </label>
          <input
            id="baseUrl"
            type="url"
            className="w-full border rounded px-3 py-2"
            placeholder="https://hub.example.com/api"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="token">
            {t('hubSettings.token', 'Bearer token')}
          </label>
          <input
            id="token"
            type="password"
            className="w-full border rounded px-3 py-2"
            placeholder={t('hubSettings.tokenPlaceholder', 'Paste your Hub API token')}
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">{t('hubSettings.tokenHint', 'Stored locally in your browser. Never shared without your action.')}</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="enableSync"
            type="checkbox"
            className="h-4 w-4"
            checked={enable}
            onChange={(e) => setEnable(e.target.checked)}
          />
          <label htmlFor="enableSync" className="text-sm">
            {t('hubSettings.enableSync', 'Enable Hub sync (process outbox)')}
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {t('common.save', 'Save')}
          </button>
          {saved && (
            <span className="text-green-700 text-sm">{t('hubSettings.saved', 'Saved')}</span>
          )}
        </div>
      </form>

      <div className="mt-6">
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${authed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {authed ? t('hubSettings.statusAuthed', 'Authenticated: token present') : t('hubSettings.statusNoAuth', 'Not authenticated: token missing')}
        </span>
      </div>

      <div className="mt-8 text-sm text-gray-600">
        <p className="mb-2 font-medium">{t('hubSettings.notesTitle', 'Notes')}</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>{t('hubSettings.noteOutbox', 'When configured, the outbox will sync invitations and contact merges to The Hub.')}</li>
          <li>{t('hubSettings.noteSecurity', 'Your token never leaves your device except when you initiate sync calls to The Hub.')}</li>
        </ul>
      </div>
    </div>
  );
}
