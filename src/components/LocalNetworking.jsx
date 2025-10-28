import { useState, useContext } from 'react';
import { Users, Shield, MapPin, MessageSquare, UserPlus } from 'lucide-react';
import GuestContext from '../contexts/GuestContext';
import { IDVerification } from '@salatiso/lifesync-shared';

const LocalNetworking = () => {
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
        context: 'local-networking',
        timestamp: new Date().toISOString()
      }],
      trustScore: Math.max(guestData.trustScore || 0, verificationData.trustScore)
    };
    setGuestData(updatedGuestData);
  };

  const handleJoinNetwork = (network) => {
    if (!verificationComplete) {
      setShowVerification(true);
      return;
    }
    alert(`Joined ${network.name}`);
  };

  const networks = [
    {
      id: 1,
      name: 'Sandton Safety Network',
      location: 'Sandton, Johannesburg',
      members: 1247,
      safetyScore: 96,
      type: 'Safety & Security',
      joined: true
    },
    {
      id: 2,
      name: 'Centurion Community Watch',
      location: 'Centurion, Pretoria',
      members: 892,
      safetyScore: 94,
      type: 'Community Watch',
      joined: false
    }
  ];

  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Users className="h-12 w-12 text-primary-500" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Local Networking</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                Connect with local safety networks and community groups
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Local Networks</h2>
          <div className="space-y-4">
            {networks.map((network) => (
              <div key={network.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{network.name}</h3>
                    <div className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-gray-600 dark:text-gray-400">{network.location}</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{network.members} members</span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">{network.safetyScore}% safety</span>
                      </div>
                    </div>
                    <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded dark:bg-blue-900 dark:text-blue-200">
                      {network.type}
                    </span>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {network.joined ? (
                      <>
                        <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                          <MessageSquare className="h-4 w-4 inline mr-2" />
                          Chat
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                          View Activity
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleJoinNetwork(network)} className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
                        <UserPlus className="h-4 w-4 inline mr-2" />
                        Join Network
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* ID Verification Modal */}
    {showVerification && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Network Verification</h2>
              <button
                onClick={() => setShowVerification(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <IDVerification
              onVerificationComplete={handleVerificationComplete}
              context="local-networking"
              requireFacial={true}
              requireNationality={false}
            />
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default LocalNetworking;
