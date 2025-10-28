import { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, MapPin, Bell, Smartphone } from 'lucide-react';
import GuestContext from '../contexts/GuestContext';

const ParentalControls = ({ onClose }) => {
  const { t } = useTranslation();
  const { guestData, setGuestData } = useContext(GuestContext);
  const [activeTab, setActiveTab] = useState('children');
  const [newChildName, setNewChildName] = useState('');
  const [newChildDevice, setNewChildDevice] = useState('');

  const handleAddChild = () => {
    if (!newChildName || !newChildDevice) return;

    const newChild = {
      id: Date.now(),
      name: newChildName,
      deviceId: newChildDevice,
      geofences: [],
      lastLocation: null,
      status: 'safe',
    };

    setGuestData(prev => ({
      ...prev,
      children: [...(prev.children || []), newChild],
    }));

    setNewChildName('');
    setNewChildDevice('');
  };

  const handleRemoveChild = (id) => {
    setGuestData(prev => ({
      ...prev,
      children: prev.children.filter(c => c.id !== id),
    }));
  };

  const addGeofence = (childId, geofence) => {
    setGuestData(prev => ({
      ...prev,
      children: prev.children.map(c =>
        c.id === childId
          ? { ...c, geofences: [...c.geofences, { ...geofence, id: Date.now() }] }
          : c
      ),
    }));
  };

  const tabs = [
    { id: 'children', label: t('followMeHome.parental.children.title'), icon: Users },
    { id: 'geofences', label: t('followMeHome.parental.geofences.title'), icon: MapPin },
    { id: 'alerts', label: t('followMeHome.parental.alerts.title'), icon: Bell },
    { id: 'integrations', label: t('followMeHome.parental.integrations.title'), icon: Smartphone },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-5/6 m-4 overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 dark:bg-gray-700 p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{t('followMeHome.parental.title')}</h2>
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
            {activeTab === 'children' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('followMeHome.parental.children.title')}</h3>

                {/* Add Child Form */}
                <div className="mb-6 p-4 border rounded-lg dark:border-gray-600">
                  <h4 className="font-medium mb-2">{t('followMeHome.parental.children.add.title')}</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder={t('followMeHome.parental.children.add.namePlaceholder')}
                      value={newChildName}
                      onChange={(e) => setNewChildName(e.target.value)}
                      className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                    <input
                      type="text"
                      placeholder={t('followMeHome.parental.children.add.devicePlaceholder')}
                      value={newChildDevice}
                      onChange={(e) => setNewChildDevice(e.target.value)}
                      className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <button onClick={handleAddChild} className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">
                    {t('followMeHome.parental.children.add.button')}
                  </button>
                </div>

                {/* Children List */}
                <div className="space-y-3">
                  {(guestData.children || []).length > 0 ? (
                    guestData.children.map(child => (
                      <div key={child.id} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-600">
                        <div>
                          <p className="font-bold">{child.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{child.deviceId}</p>
                          <p className="text-xs text-green-600 dark:text-green-400">{t('followMeHome.parental.children.status.safe')}</p>
                        </div>
                        <button onClick={() => handleRemoveChild(child.id)} className="text-red-500 hover:text-red-700">
                          Remove
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">{t('followMeHome.parental.children.noChildren')}</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'geofences' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('followMeHome.parental.geofences.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t('followMeHome.parental.geofences.description')}</p>

                {(guestData.children || []).map(child => (
                  <div key={child.id} className="mb-6 p-4 border rounded-lg dark:border-gray-600">
                    <h4 className="font-medium mb-2">{child.name}'s Geofences</h4>
                    <div className="space-y-2">
                      {child.geofences?.map(geofence => (
                        <div key={geofence.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <span>{geofence.name} - {geofence.radius}m radius</span>
                          <button className="text-red-500 text-sm">Remove</button>
                        </div>
                      )) || <p className="text-sm text-gray-500">No geofences set</p>}
                    </div>
                    <button
                      onClick={() => addGeofence(child.id, { name: 'Home', radius: 100 })}
                      className="mt-2 text-primary-600 dark:text-primary-400 hover:underline text-sm"
                    >
                      Add Geofence
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'alerts' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('followMeHome.parental.alerts.title')}</h3>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg dark:border-gray-600">
                    <h4 className="font-medium mb-2">{t('followMeHome.parental.alerts.entryExit.title')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('followMeHome.parental.alerts.entryExit.description')}</p>
                    <div className="mt-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        {t('followMeHome.parental.alerts.entryExit.enable')}
                      </label>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg dark:border-gray-600">
                    <h4 className="font-medium mb-2">{t('followMeHome.parental.alerts.irregularActivity.title')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('followMeHome.parental.alerts.irregularActivity.description')}</p>
                    <div className="mt-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        {t('followMeHome.parental.alerts.irregularActivity.enable')}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('followMeHome.parental.integrations.title')}</h3>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg dark:border-gray-600">
                    <h4 className="font-medium mb-2">Google Family Link</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('followMeHome.parental.integrations.familyLink.description')}</p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                      {t('followMeHome.parental.integrations.familyLink.connect')}
                    </button>
                  </div>

                  <div className="p-4 border rounded-lg dark:border-gray-600">
                    <h4 className="font-medium mb-2">Open Source Alternatives</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('followMeHome.parental.integrations.openSource.description')}</p>
                    <div className="space-y-2">
                      <button className="block w-full text-left p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                        KidSafe
                      </button>
                      <button className="block w-full text-left p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                        LittleBrother
                      </button>
                    </div>
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

export default ParentalControls;
