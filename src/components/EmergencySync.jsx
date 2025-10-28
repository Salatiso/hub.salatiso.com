import { useState, useContext } from 'react';
import { AlertTriangle, Phone, MapPin, Shield, Clock, Radio, MessageSquare, Bell, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GuestContext from '../contexts/GuestContext';
import EmergencyContactManager from './EmergencyContactManager';

const EmergencySync = () => {
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [isContactManagerOpen, setIsContactManagerOpen] = useState(false);
  useTranslation();
  const { guestData } = useContext(GuestContext);

  const emergencyProtocols = [
    {
      title: 'Immediate Response',
      description: 'Automatic notification to all emergency contacts with GPS location',
      icon: Radio,
      status: 'Ready',
      color: 'green'
    },
    {
      title: 'Location Tracking',
      description: 'Real-time GPS sharing with emergency services and contacts',
      icon: MapPin,
      status: 'Active',
      color: 'blue'
    },
    {
      title: 'Communication Bridge',
      description: 'Secure communication channel between all parties involved',
      icon: MessageSquare,
      status: 'Ready',
      color: 'green'
    },
    {
      title: 'Safety Monitoring',
      description: 'Continuous monitoring and automatic safety check-ins',
      icon: Shield,
      status: 'Active',
      color: 'blue'
    }
  ];

  const handleEmergencyToggle = () => {
    setEmergencyActive(!emergencyActive);
    // In a real app, this would trigger actual emergency protocols
  };

  const getProtocolColor = (color) => {
    switch (color) {
      case 'green': return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'blue': return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      case 'yellow': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
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
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Emergency Sync</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                Coordinated emergency response and safety monitoring system
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Emergency Status</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {emergencyActive ? 'Emergency protocols are ACTIVE' : 'System is in standby mode'}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg font-semibold ${
              emergencyActive
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}>
              {emergencyActive ? 'EMERGENCY ACTIVE' : 'SYSTEM STANDBY'}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleEmergencyToggle}
              className={`px-8 py-4 rounded-lg font-bold text-white transition-colors ${
                emergencyActive
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {emergencyActive ? 'Deactivate Emergency' : 'Activate Emergency Mode'}
            </button>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4 inline mr-1" />
              Last check-in: 2 minutes ago
            </div>
          </div>
        </div>

        {/* Emergency Protocols */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {emergencyProtocols.map((protocol, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-3 rounded-lg ${getProtocolColor(protocol.color)}`}>
                  <protocol.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{protocol.title}</h3>
                  <div className={`text-sm ${getProtocolColor(protocol.color)} font-medium`}>
                    {protocol.status}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{protocol.description}</p>
            </div>
          ))}
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Emergency Contacts</h2>
            <button
              onClick={() => setIsContactManagerOpen(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Manage Contacts
            </button>
          </div>

          <div className="space-y-4">
            {(guestData.emergencyContacts || []).map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{contact.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{contact.primaryPhone}</div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    contact.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {contact.status === 'accepted' ? 'Accepted' : 'Pending'}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    contact.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    contact.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {contact.priority} Priority
                  </div>
                  {contact.proximity && (
                    <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      ~{contact.proximity}km away
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <Bell className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {(guestData.emergencyContacts || []).length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No emergency contacts added yet</p>
            )}
          </div>
        </div>

        {/* Safety Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Safety Monitoring</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">GPS Location</span>
                <span className="font-semibold text-green-600 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Emergency Contacts</span>
                <span className="font-semibold text-green-600 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  2/3 Online
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Safety Check-ins</span>
                <span className="font-semibold text-green-600 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Auto-enabled
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Communication Channel</span>
                <span className="font-semibold text-green-600 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Secure
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="block w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors text-center font-medium">
                Send Emergency Alert
              </button>
              <button className="block w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium">
                Update Location
              </button>
              <Link
                to="/universal-trust"
                className="block w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors text-center font-medium"
              >
                Access Universal Trust
              </Link>
              <button className="block w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center font-medium">
                View Emergency Log
              </button>
            </div>
          </div>
        </div>

        {/* Emergency Instructions */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mt-8">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Emergency Instructions
              </h3>
              <ul className="text-yellow-700 dark:text-yellow-300 space-y-1 text-sm">
                <li>• Keep your device charged and GPS enabled at all times</li>
                <li>• Regularly update your emergency contacts and their information</li>
                <li>• Test the emergency system monthly to ensure functionality</li>
                <li>• Share your emergency protocols with trusted contacts</li>
                <li>• In case of emergency, stay calm and follow the automated instructions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {isContactManagerOpen && <EmergencyContactManager onClose={() => setIsContactManagerOpen(false)} />}
    </div>
  );
};

export default EmergencySync;
