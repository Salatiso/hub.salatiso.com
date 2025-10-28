import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Phone,
  MapPin,
  Users,
  Shield,
  Clock,
  CheckCircle,
  Home,
  Wifi,
  Bluetooth,
  Zap,
  Car,
  Bus,
  UserCheck,
  Satellite,
  Signal,
  BatteryLow,
  QrCode,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const EmergencyReporting = () => {
  const [emergencyType, setEmergencyType] = useState('');
  const [emergencyLevel, setEmergencyLevel] = useState('normal');
  const [pressCount, setPressCount] = useState(0);
  const [pressStartTime, setPressStartTime] = useState(null);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [location, setLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [tripStatus, setTripStatus] = useState('inactive');
  const [tripData, setTripData] = useState(null);
  // Removed unused communicationChannel state
  const [batteryLevel, setBatteryLevel] = useState(85);
  useTranslation();

  const emergencyTypes = [
    { id: 'medical', name: 'Medical Emergency', icon: AlertTriangle, color: 'red', description: 'Heart attack, injury, illness' },
    { id: 'fire', name: 'Fire Emergency', icon: Zap, color: 'orange', description: 'Fire, smoke, electrical issues' },
    { id: 'crime', name: 'Crime/Security', icon: Shield, color: 'red', description: 'Burglary, assault, suspicious activity' },
    { id: 'transport', name: 'Transport Emergency', icon: Car, color: 'red', description: 'Vehicle accident, breakdown, unsafe driving' },
    { id: 'household', name: 'Household Issue', icon: Home, color: 'blue', description: 'Water, electricity, minor repairs' },
    { id: 'community', name: 'Community Alert', icon: Users, color: 'yellow', description: 'Street lights, municipal services' }
  ];

  // Transport Safety Features
  const transportModes = [
    { id: 'private_car', name: 'Private Car/Lift', icon: Car, description: 'Personal vehicle or hitchhiking' },
    { id: 'taxi', name: 'Taxi/Minibus', icon: Bus, description: 'Shared taxi or minibus transport' },
    { id: 'bus', name: 'Bus/Coach', icon: Bus, description: 'Public bus or long-distance coach' },
    { id: 'group_travel', name: 'Group Travel', icon: Users, description: 'School trip, family vacation, tour group' }
  ];

  const communicationChannels = [
    { id: 'wifi', name: 'WiFi Network', icon: Wifi, status: 'active', strength: 4, description: 'Internet connection available' },
    { id: 'bluetooth', name: 'Bluetooth Mesh', icon: Bluetooth, status: 'active', strength: 3, description: 'Local device network' },
    { id: 'cellular', name: 'Cellular Network', icon: Signal, status: 'active', strength: 5, description: 'Mobile network connection' },
    { id: 'satellite', name: 'Satellite Backup', icon: Satellite, status: 'standby', strength: 2, description: 'Emergency satellite connection' }
  ];

  const externalServices = [
    { id: 'matrix', name: 'Matrix Security', phone: '0861 100 911', icon: Shield, status: 'connected' },
    { id: 'secura', name: 'Secura Insurance', phone: '0860 732 872', icon: Shield, status: 'connected' },
    { id: 'aa', name: 'AA Roadside Assist', phone: '0861 000 234', icon: Car, status: 'connected' },
    { id: 'saps', name: 'SAPS Emergency', phone: '10111', icon: AlertTriangle, status: 'available' },
    { id: 'ems', name: 'Emergency Medical', phone: '10177', icon: AlertTriangle, status: 'available' }
  ];

  // Trip sync and handshake system
  const [syncProfile, setSyncProfile] = useState({
    shareLevel: 'minimum', // minimum, standard, full
    sharedInfo: {
      name: true,
      contact: true,
      gps: true,
      id: false,
      address: false,
      emergencyContacts: false
    },
    emergencyContacts: [
      { name: 'Mother - Sarah', phone: '+27123456789', role: 'departure', notifyLevel: 'basic' },
      { name: 'Uncle - Michael', phone: '+27987654321', role: 'destination', notifyLevel: 'extended' }
    ]
  });

  const [tripHandshake] = useState({
    driverProfile: null,
    passengerProfiles: [],
    syncStartTime: null,
    lastCheckIn: null,
    autoCheckInterval: 15, // minutes
    emergencyProtocols: {
      noMovementTime: 10, // minutes before first alert
      escalationSteps: ['gentle_reminder', 'second_reminder', 'emergency_contacts', 'authorities']
    }
  });

  // Emergency button handlers
  const triggerEmergency = (triggerType) => {
    setIsEmergencyActive(true);

    // Determine emergency level based on trigger type
    if (triggerType === 'rapid_press') {
      setEmergencyLevel('critical');
    } else if (pressCount > 10) {
      setEmergencyLevel('community');
    } else {
      setEmergencyLevel('household');
    }

    // Send emergency alerts through available channels
    sendEmergencyAlert(triggerType);
  };

  const sendEmergencyAlert = (triggerType) => {
    const alertData = {
      type: emergencyType || 'general',
      level: emergencyLevel,
      location: location,
      timestamp: new Date().toISOString(),
      triggerMethod: triggerType,
      batteryLevel: batteryLevel,
      availableChannels: communicationChannels.filter(ch => ch.status === 'active')
    };

    // Simulate sending alerts through multiple channels
    console.log('Emergency alert sent:', alertData);
    
    // In real implementation, this would send through:
    // - Household members
    // - Emergency contacts
    // - External services (Matrix, Secura, AA)
    // - Authorities if escalated
  };

  // Transport Safety Functions
  const startTripSync = (mode) => {
    setTripStatus('syncing');
    setActiveTab('transport');
    
    const tripData = {
      mode: mode,
      startTime: new Date().toISOString(),
      startLocation: location,
      participants: [],
      status: 'active',
      checkInInterval: 15 // minutes
    };
    
    setTripData(tripData);
    
    // Start GPS tracking and automatic check-ins
    startTripMonitoring();
  };

  const startTripMonitoring = () => {
    // This would implement:
    // 1. Continuous GPS tracking
    // 2. Automatic check-ins with emergency contacts
    // 3. Speed monitoring (for safety alerts)
    // 4. Inactivity detection (accident/breakdown detection)
    // 5. Communication with other trip participants
    
    console.log('Trip monitoring started');
  };

  const endTripSync = () => {
    setTripStatus('completed');
    setTripData(null);
    
    // Require handshake confirmation from all participants
    // Clear sensitive data after trip completion
    console.log('Trip sync ended - handshake required');
  };

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }

    // Monitor battery level
    if ('getBattery' in navigator) {
      navigator.getBattery().then((battery) => {
        setBatteryLevel(Math.round(battery.level * 100));
        
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }
  }, []);

  const handleEmergencyPress = () => {
    const now = Date.now();
    setPressCount(prev => prev + 1);

    if (!pressStartTime) {
      setPressStartTime(now);
    }

    // Check for long press (5 seconds)
    setTimeout(() => {
      if (pressStartTime && (now - pressStartTime) >= 5000) {
        triggerEmergency('long_press');
      }
    }, 5000);

    // Check for rapid presses (5 presses in quick succession)
    if (pressCount >= 4) {
      triggerEmergency('rapid_press');
    }

    // Reset press count after 3 seconds of inactivity
    setTimeout(() => {
      setPressCount(0);
      setPressStartTime(null);
    }, 3000);
  };

  const getEmergencyLevelColor = (level) => {
    switch (level) {
      case 'critical': return 'bg-red-600 border-red-700';
      case 'community': return 'bg-orange-600 border-orange-700';
      case 'household': return 'bg-yellow-600 border-yellow-700';
      case 'authorities': return 'bg-red-800 border-red-900';
      default: return 'bg-gray-600 border-gray-700';
    }
  };

  const getEmergencyLevelText = (level) => {
    switch (level) {
      case 'critical': return 'CRITICAL - Authorities Notified';
      case 'community': return 'COMMUNITY ALERT - All Neighbors';
      case 'household': return 'HOUSEHOLD ALERT - Family Only';
      case 'authorities': return 'AUTHORITIES ESCALATION';
      default: return 'EMERGENCY ACTIVE';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-red-900/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Emergency & Safety Center</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                Comprehensive safety monitoring, transport coordination, and emergency response
              </p>
              <div className="mt-4 flex space-x-4">
                <Link
                  to="/incident-reporting"
                  className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors text-sm"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Report Non-Emergency Incident</span>
                </Link>
                <Link
                  to="/household-management"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors text-sm"
                >
                  <Home className="h-4 w-4" />
                  <span>Household Management</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Emergency Overview', icon: AlertTriangle },
                { id: 'transport', name: 'Transport Safety', icon: Car },
                { id: 'household', name: 'Household Alerts', icon: Home },
                { id: 'community', name: 'Community Safety', icon: Users },
                { id: 'external', name: 'External Services', icon: Shield }
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

        {/* Emergency Status */}
        {isEmergencyActive && (
          <div className={`mb-8 p-6 rounded-lg border-2 ${getEmergencyLevelColor(emergencyLevel)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="animate-pulse">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{getEmergencyLevelText(emergencyLevel)}</h2>
                  <p className="text-white/90 mt-1">
                    Emergency alert sent to {emergencyLevel === 'household' ? 'family members' :
                                          emergencyLevel === 'community' ? 'entire neighborhood' :
                                          'emergency authorities'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEmergencyActive(false)}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                Cancel Alert
              </button>
            </div>
          </div>
        )}

        {/* Battery Warning */}
        {batteryLevel < 20 && (
          <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <BatteryLow className="h-5 w-5 text-yellow-600" />
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Low Battery Warning</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Battery at {batteryLevel}%. Emergency features may be limited. Please charge your device.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Emergency Button */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Emergency Button</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Press and hold for 5 seconds OR press rapidly 5+ times to trigger emergency
                </p>

                <div className="flex justify-center mb-6">
                  <button
                    onClick={handleEmergencyPress}
                    className={`w-32 h-32 rounded-full border-4 transition-all duration-200 ${
                      isEmergencyActive
                        ? 'bg-red-600 border-red-700 animate-pulse'
                        : 'bg-red-500 border-red-600 hover:bg-red-600 hover:border-red-700'
                    } flex items-center justify-center shadow-lg`}
                  >
                    <AlertTriangle className={`h-12 w-12 text-white ${isEmergencyActive ? 'animate-bounce' : ''}`} />
                  </button>
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <p>Press Count: {pressCount}</p>
                  {pressStartTime && (
                    <p>Hold Time: {Math.floor((Date.now() - pressStartTime) / 1000)}s</p>
                  )}
                  <p className="text-xs">3 presses = Household • 5+ rapid = Community • 10+ = Authorities</p>
                </div>
              </div>
            </div>

            {/* Emergency Types */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Emergency Types</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {emergencyTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setEmergencyType(type.id)}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      emergencyType === type.id
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className={`inline-flex p-3 rounded-lg ${
                      emergencyType === type.id
                        ? 'bg-red-100 dark:bg-red-900'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <type.icon className={`h-6 w-6 ${
                        emergencyType === type.id
                          ? 'text-red-600'
                          : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mt-3">{type.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Communication Channels */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Communication Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {communicationChannels.map((channel) => (
                  <div key={channel.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        channel.status === 'active' ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <channel.icon className={`h-5 w-5 ${
                          channel.status === 'active' ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{channel.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{channel.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 h-4 mx-0.5 rounded ${
                              i < channel.strength ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        channel.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {channel.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location & GPS Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Location & GPS Status</h2>
              {location ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Current Location</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        Accuracy: ±{Math.round(location.accuracy)}m
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-600 dark:text-green-400">GPS tracking active</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Location services unavailable</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Please enable location services for emergency response
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transport Safety Tab */}
        {activeTab === 'transport' && (
          <div className="space-y-8">
            {/* Trip Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Transport Safety</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  tripStatus === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  tripStatus === 'syncing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {tripStatus === 'active' ? 'Trip Active' :
                   tripStatus === 'syncing' ? 'Syncing...' :
                   'No Active Trip'}
                </div>
              </div>

              {tripStatus === 'inactive' && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start a trip sync to enable real-time safety monitoring, GPS sharing, and emergency coordination.
                  </p>
                  
                  {/* Transport Mode Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {transportModes.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => startTripSync(mode.id)}
                        className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 transition-colors text-left"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                            <mode.icon className="h-6 w-6 text-primary-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{mode.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{mode.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Sync Profile Configuration */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Sync Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Information Sharing Level
                        </label>
                        <select
                          value={syncProfile.shareLevel}
                          onChange={(e) => setSyncProfile(prev => ({ ...prev, shareLevel: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                          <option value="minimum">Minimum (Name + Contact + GPS)</option>
                          <option value="standard">Standard (+ Emergency Contacts)</option>
                          <option value="full">Full (+ ID + Address)</option>
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Departure Contact
                          </label>
                          <input
                            type="text"
                            value={syncProfile.emergencyContacts[0]?.name || ''}
                            placeholder="Mother, Father, Guardian"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Destination Contact
                          </label>
                          <input
                            type="text"
                            value={syncProfile.emergencyContacts[1]?.name || ''}
                            placeholder="Uncle, Host, Relative"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(tripStatus === 'active' || tripStatus === 'syncing') && tripData && (
                <div className="space-y-6">
                  {/* Active Trip Info */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Car className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Trip Active</h3>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Started: {new Date(tripData.startTime).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={endTripSync}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        End Trip
                      </button>
                    </div>
                  </div>

                  {/* Trip Participants */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trip Participants</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <UserCheck className="h-5 w-5 text-green-600" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">You (Passenger)</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">GPS sharing active</div>
                          </div>
                        </div>
                        <div className="text-green-600">Connected</div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <QrCode className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">Scan Driver Profile</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Or share QR code for handshake</div>
                          </div>
                        </div>
                        <button className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700">
                          Scan QR
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Safety Monitoring */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Safety Monitoring</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-gray-900 dark:text-white">GPS Tracking</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Real-time location sharing</div>
                        <div className="text-green-600 text-sm mt-1">Active</div>
                      </div>
                      
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-gray-900 dark:text-white">Auto Check-in</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Every {tripHandshake.autoCheckInterval} minutes</div>
                        <div className="text-green-600 text-sm mt-1">Next: 12 min</div>
                      </div>
                      
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Shield className="h-5 w-5 text-yellow-600" />
                          <span className="font-medium text-gray-900 dark:text-white">Emergency Protocol</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Multi-step escalation</div>
                        <div className="text-yellow-600 text-sm mt-1">Standby</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* External Services Tab */}
        {activeTab === 'external' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">External Safety Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {externalServices.map((service) => (
                  <div key={service.id} className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`p-3 rounded-lg ${
                        service.status === 'connected' ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <service.icon className={`h-6 w-6 ${
                          service.status === 'connected' ? 'text-green-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{service.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{service.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        service.status === 'connected'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {service.status}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                          <Phone className="h-4 w-4" />
                        </button>
                        <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                          Test
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyReporting;
