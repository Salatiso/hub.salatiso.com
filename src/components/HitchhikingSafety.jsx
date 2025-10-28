import { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Navigation,
  Shield,
  Users,
  MapPin,
  Phone,
  AlertTriangle,
  CheckCircle,
  Eye,
  Satellite,
  Signal,
  Battery,
  Timer,
  Bluetooth,
  Wifi,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GuestContext from '../contexts/GuestContext';
import IDVerification from './IDVerification';
// Removed unused FacialRecognition import

const HitchhikingSafety = () => {
  const [activeTab, setActiveTab] = useState('safety-protocols');
  const [hitchSession, setHitchSession] = useState(null);
  const [location, setLocation] = useState(null);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [safetyHandshake, setSafetyHandshake] = useState(null);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  // We don't use t() in this component currently
  useTranslation();
  const { guestData, setGuestData } = useContext(GuestContext);

  // Mock emergency contacts (stable ref to avoid re-creating array)
  const mockEmergencyContactsRef = useRef([
    { name: 'Mom', phone: '+27123456789', relationship: 'Family' },
    { name: 'Best Friend', phone: '+27987654321', relationship: 'Friend' },
    { name: 'Partner', phone: '+27555666777', relationship: 'Partner' }
  ]);

  // Mock safety handshake data
  const mockHandshakeData = {
    driver: {
      name: 'John Doe',
      phone: '+27111222333',
      vehicleInfo: 'White Toyota Corolla - CA 123-456',
      verificationCode: 'SAFE-2025',
      trustScore: 87,
      completedPickups: 156
    },
    passenger: {
      name: 'Sarah Smith',
      phone: '+27444555666',
      destination: 'University of Cape Town',
      verificationCode: 'HIKE-9876',
      trustScore: 92
    }
  };

  useEffect(() => {
    setEmergencyContacts(mockEmergencyContactsRef.current);
    
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, [mockEmergencyContactsRef]);

  const handleVerificationComplete = (verificationData) => {
    setVerificationComplete(true);
    setShowVerification(false);
    // Update guest data with verification info
    const updatedGuestData = {
      ...guestData,
      verifications: [...(guestData.verifications || []), {
        ...verificationData,
        context: 'hitchhiking-safety',
        timestamp: new Date().toISOString()
      }],
      trustScore: Math.max(guestData.trustScore || 0, verificationData.trustScore)
    };
    setGuestData(updatedGuestData);
  };

  const initiateHitchhike = () => {
    if (!verificationComplete) {
      setShowVerification(true);
      return;
    }

    const session = {
      id: `hitch-${Date.now()}`,
      startTime: new Date().toISOString(),
      location: location,
      status: 'seeking-ride',
      emergencyContacts: emergencyContacts,
      safetyFeatures: {
        gpsTracking: true,
        emergencyButton: true,
        autoCheckIn: true,
        communityAlert: true,
        idVerified: verificationComplete
      }
    };

    setHitchSession(session);
    setActiveTab('active-session');

    // Simulate notification to emergency contacts
    alert('Safety session started. Emergency contacts have been notified.');
  };

  const initiateHandshake = () => {
    setSafetyHandshake(mockHandshakeData);
    alert('Safety handshake initiated. Both parties must verify details.');
  };

  const confirmHandshake = (party) => {
    if (safetyHandshake) {
      setSafetyHandshake(prev => ({
        ...prev,
        [`${party}Confirmed`]: true
      }));
    }
  };

  const triggerEmergency = () => {
    alert('EMERGENCY ALERT SENT! Authorities and emergency contacts notified with your location.');
    // In real implementation, this would:
    // 1. Send SMS to emergency contacts
    // 2. Notify authorities with GPS location
    // 3. Trigger community alerts
    // 4. Activate emergency recording
  };

  const endSession = () => {
    setHitchSession(null);
    setSafetyHandshake(null);
    setActiveTab('safety-protocols');
    alert('Hitchhiking session ended safely. Contacts have been notified.');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Navigation className="h-12 w-12 text-primary-500" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Hitchhiking Safety</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                  Advanced safety protocols for secure hitchhiking with community verification
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/emergency-reporting"
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Emergency
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'safety-protocols', name: 'Safety Protocols', icon: Shield },
                { id: 'start-hitchhike', name: 'Start Hitchhike', icon: Navigation },
                { id: 'active-session', name: 'Active Session', icon: Satellite },
                { id: 'community-network', name: 'Community Network', icon: Users }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Safety Protocols Tab */}
        {activeTab === 'safety-protocols' && (
          <div className="space-y-6">
            {/* Safety Guidelines */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Safety Protocols</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Before Hitchhiking */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    Before Hitchhiking
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      Inform emergency contacts of your journey
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      Share your planned route and destination
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      Ensure your phone is fully charged
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      Activate GPS tracking and location sharing
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      Carry emergency whistle and first aid
                    </li>
                  </ul>
                </div>

                {/* During the Ride */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                    <Eye className="h-5 w-5 text-blue-500 mr-2" />
                    During the Ride
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      Initiate safety handshake with driver
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      Verify driver and vehicle details
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      Keep regular check-ins with contacts
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      Trust your instincts about situations
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      Stay alert and avoid distractions
                    </li>
                  </ul>
                </div>

                {/* Emergency Situations */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    Emergency Situations
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      Use emergency button for immediate help
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      Send distress signal to community network
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      Activate automatic audio/video recording
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      Share real-time location with authorities
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      Use Bluetooth mesh if cellular fails
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Safety Features */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Safety Features</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Satellite className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Real-time GPS</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Continuous location tracking with emergency contacts
                  </p>
                </div>
                
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Users className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Safety Handshake</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mutual verification between driver and passenger
                  </p>
                </div>
                
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Emergency Alert</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Instant alerts to contacts, community, and authorities
                  </p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Users className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Community Network</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Connected safety network of verified users
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Start Hitchhike Tab */}
        {activeTab === 'start-hitchhike' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Start Hitchhike Session</h2>
              
              {/* Pre-journey Checklist */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Pre-Journey Safety Checklist</h3>
                <div className="space-y-3">
                  {[
                    'Emergency contacts are updated and notified',
                    'Phone is fully charged (80%+ recommended)',
                    'GPS location services are enabled',
                    'Destination and route planned',
                    'Emergency whistle and basic first aid available'
                  ].map((item, index) => (
                    <label key={index} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Journey Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Your current location"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      value={location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : 'Getting location...'}
                      readOnly
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Destination
                  </label>
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Emergency Contacts */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Emergency Contacts</h3>
                <div className="space-y-3">
                  {emergencyContacts.map((contact, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{contact.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {contact.phone} • {contact.relationship}
                          </div>
                        </div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Session Button */}
              <div className="text-center">
                <button
                  onClick={initiateHitchhike}
                  className="w-full md:w-auto px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-lg font-medium"
                >
                  <Navigation className="h-6 w-6 inline mr-3" />
                  Start Hitchhike Session
                </button>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                  This will activate GPS tracking and notify your emergency contacts
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Active Session Tab */}
        {activeTab === 'active-session' && (
          <div className="space-y-6">
            {hitchSession ? (
              <>
                {/* Session Status */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Active Hitchhike Session</h2>
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Live</span>
                    </div>
                  </div>

                  {/* Session Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Timer className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="font-medium text-gray-900 dark:text-white">Session Time</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(hitchSession.startTime).toLocaleTimeString()}
                      </div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Satellite className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="font-medium text-gray-900 dark:text-white">GPS Tracking</div>
                      <div className="text-sm text-green-600 dark:text-green-400">Active</div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="font-medium text-gray-900 dark:text-white">Safety Status</div>
                      <div className="text-sm text-purple-600 dark:text-purple-400">Protected</div>
                    </div>
                  </div>

                  {/* Safety Handshake */}
                  {!safetyHandshake ? (
                    <div className="text-center mb-6">
                      <button
                        onClick={initiateHandshake}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Users className="h-5 w-5 inline mr-2" />
                        Initiate Safety Handshake
                      </button>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Share verification codes with driver for mutual safety
                      </p>
                    </div>
                  ) : (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Safety Handshake Active</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">Driver Details</h4>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <p><strong>Name:</strong> {safetyHandshake.driver.name}</p>
                            <p><strong>Vehicle:</strong> {safetyHandshake.driver.vehicleInfo}</p>
                            <p><strong>Code:</strong> {safetyHandshake.driver.verificationCode}</p>
                            <p><strong>Trust Score:</strong> {safetyHandshake.driver.trustScore}%</p>
                          </div>
                          <button
                            onClick={() => confirmHandshake('driver')}
                            className={`w-full px-3 py-2 rounded ${
                              safetyHandshake.driverConfirmed
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            } transition-colors`}
                          >
                            {safetyHandshake.driverConfirmed ? 'Verified ✓' : 'Verify Driver'}
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">Your Details</h4>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <p><strong>Name:</strong> {safetyHandshake.passenger.name}</p>
                            <p><strong>Destination:</strong> {safetyHandshake.passenger.destination}</p>
                            <p><strong>Code:</strong> {safetyHandshake.passenger.verificationCode}</p>
                            <p><strong>Trust Score:</strong> {safetyHandshake.passenger.trustScore}%</p>
                          </div>
                          <button
                            onClick={() => confirmHandshake('passenger')}
                            className={`w-full px-3 py-2 rounded ${
                              safetyHandshake.passengerConfirmed
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            } transition-colors`}
                          >
                            {safetyHandshake.passengerConfirmed ? 'Confirmed ✓' : 'Confirm Identity'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Emergency Button */}
                  <div className="text-center mb-6">
                    <button
                      onClick={triggerEmergency}
                      className="w-full p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-3"
                    >
                      <AlertTriangle className="h-6 w-6" />
                      <span className="text-lg font-medium">EMERGENCY ALERT</span>
                    </button>
                  </div>

                  {/* Communication Channels */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Signal className="h-6 w-6 text-green-500 mx-auto mb-1" />
                      <div className="text-xs text-gray-600 dark:text-gray-400">Cellular</div>
                      <div className="text-xs font-medium text-green-600">Strong</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Wifi className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                      <div className="text-xs text-gray-600 dark:text-gray-400">WiFi</div>
                      <div className="text-xs font-medium text-blue-600">Connected</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Bluetooth className="h-6 w-6 text-purple-500 mx-auto mb-1" />
                      <div className="text-xs text-gray-600 dark:text-gray-400">Bluetooth</div>
                      <div className="text-xs font-medium text-purple-600">Mesh Active</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Battery className="h-6 w-6 text-orange-500 mx-auto mb-1" />
                      <div className="text-xs text-gray-600 dark:text-gray-400">Battery</div>
                      <div className="text-xs font-medium text-orange-600">85%</div>
                    </div>
                  </div>

                  {/* End Session */}
                  <div className="text-center">
                    <button
                      onClick={endSession}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      End Session Safely
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
                <Navigation className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Active Session</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start a hitchhike session to access real-time safety features.
                </p>
                <button
                  onClick={() => setActiveTab('start-hitchhike')}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Start Session
                </button>
              </div>
            )}
          </div>
        )}

        {/* Community Network Tab */}
        {activeTab === 'community-network' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Community Safety Network</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Network Stats */}
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Users className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">2,847</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Community Members</div>
                </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Shield className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">98.7%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Safety Success Rate</div>
                </div>
                
                <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Navigation className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">15,392</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Safe Journeys Completed</div>
                </div>
              </div>

              {/* Recent Community Activity */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Community Activity</h3>
                <div className="space-y-3">
                  {[
                    { user: 'Sarah M.', action: 'Completed safe hitchhike', time: '2 minutes ago', type: 'success' },
                    { user: 'John D.', action: 'Verified as trusted driver', time: '15 minutes ago', type: 'verification' },
                    { user: 'Community Alert', action: 'Weather warning: Heavy rain in Gauteng', time: '1 hour ago', type: 'alert' },
                    { user: 'Mary K.', action: 'Helped with emergency response', time: '2 hours ago', type: 'help' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          activity.type === 'success' ? 'bg-green-500' :
                          activity.type === 'verification' ? 'bg-blue-500' :
                          activity.type === 'alert' ? 'bg-yellow-500' :
                          'bg-purple-500'
                        }`}></div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{activity.user}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{activity.action}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ID Verification Modal */}
        {showVerification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Identity Verification</h2>
                  <button
                    onClick={() => setShowVerification(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <IDVerification
                  onVerificationComplete={handleVerificationComplete}
                  context="hitchhiking-safety"
                  requireFacial={true}
                  requireNationality={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HitchhikingSafety;
