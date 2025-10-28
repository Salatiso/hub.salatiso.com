import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowLeft, Car, Shield, Users, Clock, Star, AlertTriangle, Phone, MessageSquare } from 'lucide-react';

const SafeTransportation = () => {
  const [selectedTransport, setSelectedTransport] = useState('all');
  
  const transportOptions = [
    {
      id: 1,
      type: 'Verified Taxi',
      driver: 'Sipho Mthembu',
      rating: 4.8,
      safetyScore: 95,
      vehicle: 'Toyota Avanza - CA 123 GP',
      location: '2km away',
      eta: '5 minutes',
      price: 'R25',
      verified: true,
      features: ['GPS Tracking', 'Emergency Button', 'Verified Driver']
    },
    {
      id: 2,
      type: 'Community Shuttle',
      driver: 'Nomsa Dlamini',
      rating: 4.9,
      safetyScore: 98,
      vehicle: 'VW Kombi - GP 456 CA',
      location: '1.5km away',
      eta: '8 minutes',
      price: 'R15',
      verified: true,
      features: ['Multiple Passengers', 'Fixed Route', 'Community Vouched']
    },
    {
      id: 3,
      type: 'Ride Share',
      driver: 'Thabo Mphela',
      rating: 4.7,
      safetyScore: 92,
      vehicle: 'Honda Civic - JHB 789 GP',
      location: '3km away',
      eta: '12 minutes',
      price: 'R18',
      verified: true,
      features: ['Split Cost', 'GPS Tracking', 'Background Check']
    }
  ];

  const emergencyContacts = [
    { name: 'Police Emergency', number: '10111', type: 'emergency' },
    { name: 'Transport Safety Line', number: '+27 11 safety', type: 'safety' },
    { name: 'Community Watch', number: '+27 11 watch', type: 'community' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Car className="h-12 w-12 text-primary-500" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Safe Transportation</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                Verified and community-trusted transport options
              </p>
            </div>
          </div>
        </div>

        {/* Quick Emergency Access */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-900 dark:text-red-100">Emergency Transport Needed?</span>
            </div>
            <div className="flex space-x-2">
              {emergencyContacts.map((contact, index) => (
                <button
                  key={index}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  {contact.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Options */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'taxi', 'shuttle', 'rideshare'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedTransport(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTransport === filter
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Transport Options */}
        <div className="space-y-4 mb-8">
          {transportOptions.map((option) => (
            <div key={option.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{option.type}</h3>
                    {option.verified && <Shield className="h-5 w-5 text-green-500" />}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <Users className="h-4 w-4" />
                        <span>Driver: {option.driver}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <Car className="h-4 w-4" />
                        <span>{option.vehicle}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span>{option.location}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{option.rating}/5.0</span>
                        <div className="flex items-center space-x-1">
                          <Shield className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium text-green-600">{option.safetyScore}% Safe</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>ETA: {option.eta}</span>
                        <span className="font-semibold text-primary-600">{option.price}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {option.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded dark:bg-blue-900 dark:text-blue-200"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
                    Book Ride
                  </button>
                  <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Contact
                  </button>
                  <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Safety Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Transportation Safety Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Shield className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">Verified Drivers</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Background checked and community verified</p>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <MapPin className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">GPS Tracking</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Real-time location sharing for safety</p>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">Emergency Button</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Quick access to emergency services</p>
            </div>
            
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Users className="h-8 w-8 text-orange-600 mb-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">Community Network</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Supported by local safety network</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafeTransportation;
