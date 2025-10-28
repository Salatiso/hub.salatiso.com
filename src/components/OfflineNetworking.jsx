import { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Wifi, Bluetooth, Network, Battery, Shield } from 'lucide-react';
import GuestContext from '../contexts/GuestContext';

const OfflineNetworking = ({ onClose }) => {
  const { t } = useTranslation();
  const { guestData, setGuestData } = useContext(GuestContext);
  const [activeTab, setActiveTab] = useState('bluetooth');

  const updateOfflineSettings = (key, value) => {
    setGuestData(prev => ({
      ...prev,
      offlineSettings: {
        ...prev.offlineSettings,
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: 'bluetooth', label: t('followMeHome.offline.bluetooth.title'), icon: Bluetooth },
    { id: 'wifi', label: t('followMeHome.offline.wifi.title'), icon: Wifi },
    { id: 'mesh', label: t('followMeHome.offline.mesh.title'), icon: Network },
    { id: 'battery', label: t('followMeHome.offline.battery.title'), icon: Battery },
    { id: 'privacy', label: t('followMeHome.offline.privacy.title'), icon: Shield },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-5/6 m-4 overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 dark:bg-gray-700 p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{t('followMeHome.offline.title')}</h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                ×
              </button>
            </div>
            <nav className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <tab.icon className="mr-3 h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'bluetooth' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('followMeHome.offline.bluetooth.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t('followMeHome.offline.bluetooth.description')}</p>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg dark:border-gray-600">
                    <h4 className="font-medium mb-2">{t('followMeHome.offline.bluetooth.peerSync.title')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('followMeHome.offline.bluetooth.peerSync.description')}</p>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked={guestData.offlineSettings?.bluetoothPeerSync}
                        onChange={(e) => updateOfflineSettings('bluetoothPeerSync', e.target.checked)}
                        className="mr-2"
                      />
                      {t('followMeHome.offline.bluetooth.peerSync.enable')}
                    </label>
                  </div>

                  <div className="p-4 border rounded-lg dark:border-gray-600">
                    <h4 className="font-medium mb-2">{t('followMeHome.offline.bluetooth.range.title')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('followMeHome.offline.bluetooth.range.description')}</p>
                    <select
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      defaultValue={guestData.offlineSettings?.bluetoothRange || 'medium'}
                      onChange={(e) => updateOfflineSettings('bluetoothRange', e.target.value)}
                    >
                      <option value="short">{t('followMeHome.offline.bluetooth.range.short')}</option>
                      <option value="medium">{t('followMeHome.offline.bluetooth.range.medium')}</option>
                      <option value="long">{t('followMeHome.offline.bluetooth.range.long')}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'wifi' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('followMeHome.offline.wifi.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t('followMeHome.offline.wifi.description')}</p>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg dark:border-gray-600">
                    <h4 className="font-medium mb-2">{t('followMeHome.offline.wifi.direct.title')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('followMeHome.offline.wifi.direct.description')}</p>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked={guestData.offlineSettings?.wifiDirect}
                        onChange={(e) => updateOfflineSettings('wifiDirect', e.target.checked)}
                        className="mr-2"
                      />
                      {t('followMeHome.offline.wifi.direct.enable')}
                    </label>
                  </div>

                  <div className="p-4 border rounded-lg dark:border-gray-600">
                    <h4 className="font-medium mb-2">{t('followMeHome.offline.wifi.opportunistic.title')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('followMeHome.offline.wifi.opportunistic.description')}</p>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked={guestData.offlineSettings?.opportunisticForwarding}
                        onChange={(e) => updateOfflineSettings('opportunisticForwarding', e.target.checked)}
                        className="mr-2"
                      />
                      {t('followMeHome.offline.wifi.opportunistic.enable')}
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'mesh' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('followMeHome.offline.mesh.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t('followMeHome.offline.mesh.description')}</p>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg dark:border-gray-600">
                    <h4 className="font-medium mb-2">{t('followMeHome.offline.mesh.routing.title')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('followMeHome.offline.mesh.routing.description')}</p>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="routing"
                          value="single"
                          defaultChecked={guestData.offlineSettings?.meshRouting === 'single'}
                          onChange={(e) => updateOfflineSettings('meshRouting', e.target.value)}
                          className="mr-2"
                        />
                        {t('followMeHome.offline.mesh.routing.single')}
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="routing"
                          value="multi"
                          defaultChecked={guestData.offlineSettings?.meshRouting === 'multi'}
                          onChange={(e) => updateOfflineSettings('meshRouting', e.target.value)}
                          className="mr-2"
                        />
                        {t('followMeHome.offline.mesh.routing.multi')}
                      </label>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg dark:border-gray-600">
                    <h4 className="font-medium mb-2">{t('followMeHome.offline.mesh.community.title')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('followMeHome.offline.mesh.community.description')}</p>
                    <button className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">
                      {t('followMeHome.offline.mesh.community.setup')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'battery' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('followMeHome.offline.battery.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t('followMeHome.offline.battery.description')}</p>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg dark:border-gray-600">
                    <h4 className="font-medium mb-2">{t('followMeHome.offline.battery.adaptive.title')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('followMeHome.offline.battery.adaptive.description')}</p>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked={guestData.offlineSettings?.adaptiveSampling}
                        onChange={(e) => updateOfflineSettings('adaptiveSampling', e.target.checked)}
                        className="mr-2"
                      />
                      {t('followMeHome.offline.battery.adaptive.enable')}
                    </label>
                  </div>

                  <div className="p-4 border rounded-lg dark:border-gray-600">
                    <h4 className="font-medium mb-2">{t('followMeHome.offline.battery.dutyCycling.title')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('followMeHome.offline.battery.dutyCycling.description')}</p>
                    <select
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      defaultValue={guestData.offlineSettings?.dutyCycle || 'balanced'}
                      onChange={(e) => updateOfflineSettings('dutyCycle', e.target.value)}
                    >
                      <option value="aggressive">{t('followMeHome.offline.battery.dutyCycling.aggressive')}</option>
                      <option value="balanced">{t('followMeHome.offline.battery.dutyCycling.balanced')}</option>
                      <option value="conservative">{t('followMeHome.offline.battery.dutyCycling.conservative')}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('followMeHome.offline.privacy.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t('followMeHome.offline.privacy.description')}</p>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg dark:border-gray-600">
                    <h4 className="font-medium mb-2">{t('followMeHome.offline.privacy.encryption.title')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('followMeHome.offline.privacy.encryption.description')}</p>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      ✓ {t('followMeHome.offline.privacy.encryption.status')}
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg dark:border-gray-600">
                    <h4 className="font-medium mb-2">{t('followMeHome.offline.privacy.consent.title')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('followMeHome.offline.privacy.consent.description')}</p>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked={guestData.offlineSettings?.relayConsent}
                        onChange={(e) => updateOfflineSettings('relayConsent', e.target.checked)}
                        className="mr-2"
                      />
                      {t('followMeHome.offline.privacy.consent.enable')}
                    </label>
                  </div>

                  <div className="p-4 border rounded-lg dark:border-gray-600">
                    <h4 className="font-medium mb-2">{t('followMeHome.offline.privacy.dataRetention.title')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('followMeHome.offline.privacy.dataRetention.description')}</p>
                    <select
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      defaultValue={guestData.offlineSettings?.dataRetention || '30days'}
                      onChange={(e) => updateOfflineSettings('dataRetention', e.target.value)}
                    >
                      <option value="7days">{t('followMeHome.offline.privacy.dataRetention.7days')}</option>
                      <option value="30days">{t('followMeHome.offline.privacy.dataRetention.30days')}</option>
                      <option value="90days">{t('followMeHome.offline.privacy.dataRetention.90days')}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineNetworking;
