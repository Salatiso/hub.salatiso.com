import { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, Clock, Shield, Users, Phone, MessageSquare, Navigation, Camera } from 'lucide-react';

const EmergencyAssistance = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyTimer, setEmergencyTimer] = useState(0);
  const [nearbyResponders, setNearbyResponders] = useState([]);

  const emergencyContacts = [
    { name: 'Police', number: '10111', type: 'police', color: 'blue' },
    { name: 'Medical Emergency', number: '10177', type: 'medical', color: 'red' },
    { name: 'Fire Department', number: '10177', type: 'fire', color: 'orange' },
    { name: 'Community Safety', number: '+27 11 safety', type: 'community', color: 'green' }
  ];

  const nearbyRespondersList = [
    {
      id: 1,
      name: 'Security Patrol Unit 3',
      type: 'Security',
      distance: '0.8km away',
      eta: '3 minutes',
      status: 'Available'
    },
    {
      id: 2,
      name: 'Community Volunteer Sarah M.',
      type: 'Community',
      distance: '1.2km away',
      eta: '5 minutes',
      status: 'Responding'
    },
    {
      id: 3,
      name: 'Medical Response Team',
      type: 'Medical',
      distance: '2.1km away',
      eta: '8 minutes',
      status: 'Standby'
    }
  ];

  useEffect(() => {
    // Simulate getting current location
    navigator.geolocation?.getCurrentPosition((position) => {
      setCurrentLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    });

    setNearbyResponders(nearbyRespondersList);
    // nearbyRespondersList is a static local constant; disabling exhaustive-deps for this effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let interval;
    if (emergencyActive) {
      interval = setInterval(() => {
        setEmergencyTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [emergencyActive]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const activateEmergency = () => {
    setEmergencyActive(true);
    setEmergencyTimer(0);
    // In real app, this would trigger emergency protocols
  };

  const deactivateEmergency = () => {
    setEmergencyActive(false);
    setEmergencyTimer(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Emergency Assistance</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                Immediate help when you need it most
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Status */}
        {emergencyActive && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="animate-pulse">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-900 dark:text-red-100">EMERGENCY ACTIVE</h2>
                  <p className="text-red-700 dark:text-red-300">Duration: {formatTime(emergencyTimer)}</p>
                </div>
              </div>
              <button
                onClick={deactivateEmergency}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel Emergency
              </button>
            </div>
            <div className="mt-4 text-sm text-red-800 dark:text-red-200">
              Help is on the way. Your location has been shared with emergency responders.
            </div>
          </div>
        )}

        {/* Emergency Button */}
        {!emergencyActive && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-6 text-center">
            <button
              onClick={activateEmergency}
              className="w-48 h-48 bg-red-600 hover:bg-red-700 text-white rounded-full text-2xl font-bold mx-auto flex items-center justify-center transition-all transform hover:scale-105 shadow-lg"
            >
              <div>
                <AlertTriangle className="h-16 w-16 mx-auto mb-2" />
                EMERGENCY
              </div>
            </button>
            <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-md mx-auto">
              Press and hold for 3 seconds to activate emergency assistance. Your location will be shared with nearby responders and emergency contacts.
            </p>
          </div>
        )}

        {/* Quick Emergency Contacts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Emergency Contacts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {emergencyContacts.map((contact, index) => (
              <button
                key={index}
                className={`p-4 bg-${contact.color}-50 dark:bg-${contact.color}-900/20 rounded-lg hover:bg-${contact.color}-100 transition-colors text-center`}
              >
                <Phone className={`h-8 w-8 text-${contact.color}-600 mx-auto mb-2`} />
                <div className="font-medium text-gray-900 dark:text-white">{contact.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{contact.number}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Location */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Current Location</h2>
          <div className="flex items-center space-x-4">
            <MapPin className="h-8 w-8 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {currentLocation ? 'Location Detected' : 'Getting location...'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {currentLocation 
                  ? `Lat: ${currentLocation.lat.toFixed(6)}, Lng: ${currentLocation.lng.toFixed(6)}`
                  : 'Please enable location services'
                }
              </div>
            </div>
            <button className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center">
              <Navigation className="h-4 w-4 mr-2" />
              Share Location
            </button>
          </div>
        </div>

        {/* Nearby Responders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Nearby Response Teams</h2>
          <div className="space-y-4">
            {nearbyResponders.map((responder) => (
              <div key={responder.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Shield className="h-8 w-8 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{responder.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{responder.type}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">{responder.distance}</div>
                    <div className="text-sm font-medium">ETA: {responder.eta}</div>
                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                      responder.status === 'Available' ? 'bg-green-100 text-green-800' :
                      responder.status === 'Responding' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {responder.status}
                    </span>
                  </div>
                  <button className="ml-4 px-3 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
                    Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Features */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Emergency Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">Panic Button</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Instant alert to emergency contacts and nearby responders</p>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <MapPin className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">Location Sharing</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Automatic GPS location sharing with response teams</p>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Camera className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">Evidence Capture</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Quick photo/video capture for incident documentation</p>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <MessageSquare className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">Silent Alarm</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Discrete emergency alert without audible notification</p>
            </div>
            
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Users className="h-8 w-8 text-orange-600 mb-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">Community Network</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Integrated with local community safety network</p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Clock className="h-8 w-8 text-gray-600 mb-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">24/7 Monitoring</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Round-the-clock emergency response coordination</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyAssistance;
