import { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import EmergencyContactManager from './EmergencyContactManager';
import GuestContext from '../contexts/GuestContext';

const TripSetup = ({ onStartTrip }) => {
  const { t } = useTranslation();
  const { guestData } = useContext(GuestContext);
  const [riskLevel, setRiskLevel] = useState('low');
  const [eta, setEta] = useState(30); // in minutes
  const [isContactManagerOpen, setIsContactManagerOpen] = useState(false);

  const handleStartTrip = () => {
    onStartTrip({ riskLevel, eta });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">{t('followMeHome.setup.title')}</h2>

      {/* Risk Level Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2 flex items-center">
          <Shield className="mr-2" /> {t('followMeHome.setup.riskLevel.title')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['low', 'medium', 'high'].map((level) => (
            <button
              key={level}
              onClick={() => setRiskLevel(level)}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                riskLevel === level
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
              }`}
            >
              <span className="block font-bold capitalize">{t(`followMeHome.setup.riskLevel.${level}.label`)}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{t(`followMeHome.setup.riskLevel.${level}.description`)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2 flex items-center">
          <Users className="mr-2" /> {t('followMeHome.setup.contacts.title')}
        </h3>
        <div className="p-4 border rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
          <p className="text-gray-600 dark:text-gray-300 mb-2">{t('followMeHome.setup.contacts.description')}</p>
          <div className="space-y-2">
            {(guestData.emergencyContacts || []).map(c => (
              <div key={c.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-600 p-2 rounded">
                <div>
                  <span className="font-medium">{c.name}</span>
                  {c.relationship && <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({c.relationship})</span>}
                  {c.proximity && <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">~{c.proximity}km</span>}
                </div>
                <div className="flex items-center space-x-1">
                  {c.status === 'accepted' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setIsContactManagerOpen(true)}
            className="text-primary-600 dark:text-primary-400 hover:underline mt-3 text-sm font-bold"
          >
            {t('followMeHome.setup.contacts.manage')}
          </button>
        </div>
      </div>

      {/* ETA */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2 flex items-center">
          <Clock className="mr-2" /> {t('followMeHome.setup.eta.title')}
        </h3>
        <div className="flex items-center">
          <input
            type="range"
            value={eta}
            onChange={(e) => setEta(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            min="5"
            max="180"
            step="5"
          />
          <span className="ml-4 font-bold w-24 text-center">{eta} {t('followMeHome.setup.eta.minutes')}</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('followMeHome.setup.eta.description')}</p>
      </div>

      <div className="text-center mt-8">
        <button 
          onClick={handleStartTrip}
          className="bg-primary-600 text-white font-bold py-3 px-8 rounded-full hover:bg-primary-700 transition-transform transform hover:scale-105 shadow-lg"
        >
          {t('followMeHome.startTrip')}
        </button>
      </div>

      {isContactManagerOpen && <EmergencyContactManager onClose={() => setIsContactManagerOpen(false)} />}
    </div>
  );
};

export default TripSetup;
