import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import TripSetup from '../components/TripSetup';
import ActiveTrip from '../components/ActiveTrip';
import Notification from '../components/Notification';
import ParentalControls from '../components/ParentalControls';
import OfflineNetworking from '../components/OfflineNetworking';
import ShareTrip from '../components/ShareTrip';
import { SafetyInteractionFlow } from '@salatiso/lifesync-shared';

const FollowMeHome = () => {
  const { t } = useTranslation();
  const [tripState, setTripState] = useState('setup'); // 'setup', 'active', 'ended'
  const [tripDetails, setTripDetails] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [nextCheckIn, setNextCheckIn] = useState(null);
  const [tripStartTime, setTripStartTime] = useState(null);
  const [showParentalControls, setShowParentalControls] = useState(false);
  const [showOfflineNetworking, setShowOfflineNetworking] = useState(false);
  const [showShareTrip, setShowShareTrip] = useState(false);
  const [showSafetyEnhancement, setShowSafetyEnhancement] = useState(false);
  const [safetyEnhanced, setSafetyEnhanced] = useState(false);

  const handleStartTrip = useCallback((details) => {
    // First show safety enhancement flow
    setTripDetails(details);
    setShowSafetyEnhancement(true);
  }, []);

  const handleSafetyEnhancementComplete = useCallback((enhanced) => {
    setSafetyEnhanced(enhanced);
    setShowSafetyEnhancement(false);
    
    // Now start the actual trip
    setTripState('active');
    setTripStartTime(Date.now());
    setNextCheckIn(Date.now() + getCheckInInterval(tripDetails.riskLevel) * 1000);
  }, [tripDetails?.riskLevel]);

  const handleEndTrip = useCallback(() => {
    setTripState('ended');
    setTripDetails(null);
    setTripStartTime(null);
    setNextCheckIn(null);
    // Here you would typically show a summary or confirmation screen
    // For now, we'll just reset to the setup screen after a delay
    setTimeout(() => {
      setTripState('setup');
    }, 3000);
  }, []);

  const handleCheckIn = useCallback(() => {
    setNextCheckIn(Date.now() + getCheckInInterval(tripDetails.riskLevel) * 1000);
    addNotification(t('followMeHome.notifications.checkInSuccess'), 'success');
  }, [tripDetails?.riskLevel, t]);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const getCheckInInterval = (riskLevel) => {
    switch (riskLevel) {
      case 'low':
        return 900; // 15 minutes
      case 'medium':
        return 300; // 5 minutes
      case 'high':
        return 120; // 2 minutes
      default:
        return 900;
    }
  };

  useEffect(() => {
    if (tripState === 'active' && nextCheckIn) {
      const interval = setInterval(() => {
        const now = Date.now();
        if (now >= nextCheckIn) {
          addNotification(t('followMeHome.notifications.checkInRequired'), 'warning');
          // For now, auto-advance to next check-in. In a real app, this would require user action.
          setNextCheckIn(now + getCheckInInterval(tripDetails.riskLevel) * 1000);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [tripState, nextCheckIn, tripDetails, t]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">{t('followMeHome.title')}</h1>
      <p className="mb-6 text-center max-w-2xl mx-auto">{t('followMeHome.description')}</p>
      
      {/* Control Buttons */}
      <div className="text-center mb-6 space-x-4">
        <button 
          onClick={() => setShowParentalControls(true)}
          className="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors"
        >
          {t('followMeHome.parental.button')}
        </button>
        <button 
          onClick={() => setShowOfflineNetworking(true)}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('followMeHome.offline.button')}
        </button>
        {(tripState === 'active' || tripState === 'ended') && (
          <button 
            onClick={() => setShowShareTrip(true)}
            className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
          >
            {t('followMeHome.share.button')}
          </button>
        )}
      </div>
      
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        {tripState === 'setup' && <TripSetup onStartTrip={handleStartTrip} />}
        {tripState === 'active' && <ActiveTrip tripDetails={tripDetails} onEndTrip={handleEndTrip} onCheckIn={handleCheckIn} nextCheckIn={nextCheckIn} />}
        {tripState === 'ended' && (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">{t('followMeHome.ended.title')}</h2>
            <p>{t('followMeHome.ended.description')}</p>
          </div>
        )}
      </div>

      {/* Render Notifications */}
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
        />
      ))}

      {/* Parental Controls Modal */}
      {showParentalControls && <ParentalControls onClose={() => setShowParentalControls(false)} />}

      {/* Offline Networking Modal */}
      {showOfflineNetworking && <OfflineNetworking onClose={() => setShowOfflineNetworking(false)} />}

      {/* Share Trip Modal */}
      {showShareTrip && (
        <ShareTrip
          tripDetails={tripDetails}
          tripState={tripState}
          onClose={() => setShowShareTrip(false)}
        />
      )}

      {/* Safety Enhancement Modal */}
      {showSafetyEnhancement && (
        <SafetyInteractionFlow
          tripDetails={tripDetails}
          onComplete={handleSafetyEnhancementComplete}
          onCancel={() => setShowSafetyEnhancement(false)}
        />
      )}

    </div>
  );
};

export default FollowMeHome;
