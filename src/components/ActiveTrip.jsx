import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Shield, Clock, Phone, MessageSquare, Share2 } from 'lucide-react';
import ShareTrip from './ShareTrip';

const ActiveTrip = ({ tripDetails, onEndTrip, onCheckIn, nextCheckIn }) => {
  const { t } = useTranslation();
  const { riskLevel, eta } = tripDetails;
  const [countdown, setCountdown] = useState(0);
  const [showShareTrip, setShowShareTrip] = useState(false);

  useEffect(() => {
    if (nextCheckIn) {
      const interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((nextCheckIn - now) / 1000));
        setCountdown(remaining);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [nextCheckIn]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const riskStyles = {
    low: {
      bgColor: 'bg-green-100 dark:bg-green-900',
      textColor: 'text-green-800 dark:text-green-200',
      borderColor: 'border-green-500',
    },
    medium: {
      bgColor: 'bg-yellow-100 dark:bg-yellow-900',
      textColor: 'text-yellow-800 dark:text-yellow-200',
      borderColor: 'border-yellow-500',
    },
    high: {
      bgColor: 'bg-red-100 dark:bg-red-900',
      textColor: 'text-red-800 dark:text-red-200',
      borderColor: 'border-red-500',
    },
  };

  const currentRisk = riskStyles[riskLevel] || riskStyles.low;

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-center">{t('followMeHome.active.title')}</h2>
      
      <div className={`p-4 rounded-lg border-2 ${currentRisk.borderColor} ${currentRisk.bgColor} ${currentRisk.textColor} mb-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="mr-2" />
            <span className="font-bold">{t('followMeHome.setup.riskLevel.title')}:</span>
          </div>
          <span className="font-bold capitalize">{t(`followMeHome.setup.riskLevel.${riskLevel}.label`)}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            <Clock className="mr-2" />
            <span className="font-bold">{t('followMeHome.setup.eta.title')}:</span>
          </div>
          <span>{eta} {t('followMeHome.setup.eta.minutes')}</span>
        </div>
        {nextCheckIn && (
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              <Clock className="mr-2" />
              <span className="font-bold">{t('followMeHome.active.nextCheckIn')}:</span>
            </div>
            <span className="font-bold text-lg">{formatTime(countdown)}</span>
          </div>
        )}
      </div>

      {/* Map Placeholder */}
      <div className="mb-6 h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <MapPin className="h-12 w-12 text-gray-400" />
        <p className="text-gray-500 ml-2">{t('followMeHome.active.mapPlaceholder')}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button className="flex items-center justify-center p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          <Phone className="mr-2" /> {t('followMeHome.active.callContact')}
        </button>
        <button className="flex items-center justify-center p-4 bg-green-500 text-white rounded-lg hover:bg-green-600">
          <MessageSquare className="mr-2" /> {t('followMeHome.active.sendMessage')}
        </button>
        <button
          onClick={() => setShowShareTrip(true)}
          className="flex items-center justify-center p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 col-span-2"
        >
          <Share2 className="mr-2" /> {t('followMeHome.share.button')}
        </button>
      </div>

      {/* Check-in button */}
      <div className="text-center mb-6">
        <button 
          onClick={onCheckIn}
          className="bg-blue-600 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          {t('followMeHome.active.checkIn')}
        </button>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t('followMeHome.active.checkInPrompt')}</p>
      </div>

      <div className="text-center mt-8">
        <button 
          onClick={onEndTrip}
          className="bg-red-600 text-white font-bold py-3 px-8 rounded-full hover:bg-red-700 transition-transform transform hover:scale-105"
        >
          {t('followMeHome.endTrip')}
        </button>
      </div>

      {/* Share Trip Modal */}
      {showShareTrip && (
        <ShareTrip
          tripDetails={tripDetails}
          tripState="active"
          onClose={() => setShowShareTrip(false)}
        />
      )}
    </div>
  );
};

export default ActiveTrip;
