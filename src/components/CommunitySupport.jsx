import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, ArrowLeft, Users, MapPin, Phone, MessageSquare, AlertTriangle } from 'lucide-react';
import GuestContext from '../contexts/GuestContext';
import IDVerification from './IDVerification';

const CommunitySupport = () => {
  const { guestData, setGuestData } = useContext(GuestContext);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);

  const handleVerificationComplete = (verificationData) => {
    setVerificationComplete(true);
    setShowVerification(false);
    const updatedGuestData = {
      ...guestData,
      verifications: [...(guestData.verifications || []), {
        ...verificationData,
        context: 'community-support',
        timestamp: new Date().toISOString()
      }],
      trustScore: Math.max(guestData.trustScore || 0, verificationData.trustScore)
    };
    setGuestData(updatedGuestData);
  };

  const handleSupportRequest = (service) => {
    if (!verificationComplete) {
      setShowVerification(true);
      return;
    }
    alert(`Support requested from ${service.name}`);
  };

  const supportServices = [
    {
      id: 1,
      name: 'Emergency Food Bank',
      location: 'Johannesburg Central',
      contact: '+27 11 123 4567',
      type: 'Food Security',
      available: true,
      volunteers: 45,
      safetyVerified: true
    },
    {
      id: 2,
      name: 'Community Health Clinic',
      location: 'Soweto',
      contact: '+27 11 987 6543',
      type: 'Healthcare',
      available: true,
      volunteers: 23,
      safetyVerified: true
    },
    {
      id: 3,
      name: 'Youth Development Center',
      location: 'Alexandra',
      contact: '+27 11 555 0123',
      type: 'Education & Development',
      available: true,
      volunteers: 67,
      safetyVerified: true
    }
  ];

  const emergencySupport = [
    {
      service: 'Emergency Shelter',
      contact: '+27 11 emergency',
      status: 'Available 24/7'
    },
    {
      service: 'Crisis Counseling',
      contact: '+27 11 counseling',
      status: 'Available 24/7'
    },
    {
      service: 'Legal Aid',
      contact: '+27 11 legal',
      status: 'Business Hours'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Heart className="h-12 w-12 text-primary-500" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Community Support</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                Verified community support services and volunteer opportunities
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Support */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-4 flex items-center">
            <AlertTriangle className="h-6 w-6 mr-2" />
            Emergency Support Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {emergencySupport.map((service, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white">{service.service}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{service.contact}</p>
                <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded dark:bg-green-900 dark:text-green-200">
                  {service.status}
                </span>
                <button className="w-full mt-3 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                  Contact Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Community Support Services */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Community Support Services</h2>
          <div className="space-y-6">
            {supportServices.map((service) => (
              <div key={service.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{service.name}</h3>
                      {service.safetyVerified && <Shield className="h-5 w-5 text-green-500" />}
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {service.location}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {service.contact}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {service.volunteers} volunteers
                      </div>
                    </div>
                    <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded dark:bg-blue-900 dark:text-blue-200">
                      {service.type}
                    </span>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button onClick={() => handleSupportRequest(service)} className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
                      Get Support
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                      <Heart className="h-4 w-4 inline mr-1" />
                      Volunteer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 transition-colors text-center">
              <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="font-medium text-gray-900 dark:text-white">Community Chat</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Connect with locals</div>
            </button>
            
            <button className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 transition-colors text-center">
              <Heart className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-medium text-gray-900 dark:text-white">Offer Help</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Volunteer your time</div>
            </button>
            
            <button className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 transition-colors text-center">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="font-medium text-gray-900 dark:text-white">Find Support</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Get help when needed</div>
            </button>
            
            <button className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 transition-colors text-center">
              <Shield className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="font-medium text-gray-900 dark:text-white">Safety Report</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Report community issues</div>
            </button>
          </div>
        </div>
      </div>

      {/* ID Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Support Service Verification</h2>
                <button
                  onClick={() => setShowVerification(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <IDVerification
                onVerificationComplete={handleVerificationComplete}
                context="community-support"
                requireFacial={true}
                requireNationality={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunitySupport;
