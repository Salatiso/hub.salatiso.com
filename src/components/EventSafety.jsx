import { useState, useContext } from 'react';
import { Calendar, Shield, MapPin, Users, Clock, Star, AlertTriangle } from 'lucide-react';
import GuestContext from '../contexts/GuestContext';
import IDVerification from './IDVerification';

const EventSafety = () => {
  const { guestData, setGuestData } = useContext(GuestContext);
  const [showVerification, setShowVerification] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  // Removed unused verificationComplete state

  const handleVerificationComplete = (verificationData) => {
    setShowVerification(false);
    // Update guest data with verification info
    const updatedGuestData = {
      ...guestData,
      verifications: [...(guestData.verifications || []), {
        ...verificationData,
        context: 'event-safety',
        eventId: selectedEvent?.id,
        timestamp: new Date().toISOString()
      }],
      trustScore: Math.max(guestData.trustScore || 0, verificationData.trustScore)
    };
    setGuestData(updatedGuestData);
  };

  const handleEventRegistration = (event) => {
    setSelectedEvent(event);
    setShowVerification(true);
  };

  const events = [
    {
      id: 1,
      name: 'Jazz Festival 2025',
      location: 'Sandton Convention Centre',
      date: '2025-09-15',
      time: '18:00',
      attendees: 2500,
      safetyRating: 4.8,
      safetyFeatures: ['Security Personnel', 'Emergency Exits', 'Medical Station', 'Safe Transport']
    },
    {
      id: 2,
      name: 'Community Sports Day',
      location: 'Wanderers Stadium',
      date: '2025-09-20',
      time: '09:00',
      attendees: 1200,
      safetyRating: 4.9,
      safetyFeatures: ['First Aid', 'Crowd Control', 'Emergency Response', 'Family Areas']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Calendar className="h-12 w-12 text-primary-500" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Event Safety</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                Safety protocols and coordination for community events
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Upcoming Safe Events</h2>
          <div className="space-y-6">
            {events.map((event) => (
              <div key={event.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{event.name}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {event.location}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {event.time}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{event.attendees} expected</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{event.safetyRating} safety rating</span>
                      </div>
                    </div>
                  </div>
                  <Shield className="h-8 w-8 text-green-500" />
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Safety Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {event.safetyFeatures.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded dark:bg-green-900 dark:text-green-200"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleEventRegistration(event)}
                    className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                  >
                    Register Attendance
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                    Safety Details
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    <AlertTriangle className="h-4 w-4 inline mr-1" />
                    Report Issue
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ID Verification Modal */}
        {showVerification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Event Registration Verification</h2>
                  <button
                    onClick={() => setShowVerification(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <IDVerification
                  onVerificationComplete={handleVerificationComplete}
                  context="event-safety"
                  requireFacial={true}
                  requireNationality={false}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventSafety;
