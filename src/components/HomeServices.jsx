import { useState, useContext } from 'react';
import {
  Home, Users, Shield,
  CheckCircle, AlertTriangle, UserPlus, Briefcase, Award,
  Star, Globe
} from 'lucide-react';
import GuestContext from '../contexts/GuestContext';
import IDVerification from './IDVerification';
import SafetyInteractionFlow from './SafetyInteractionFlow';

const HomeServices = () => {
  const { guestData, setGuestData } = useContext(GuestContext);
  const [activeTab, setActiveTab] = useState('find-services');
  const [showProviderRegistration, setShowProviderRegistration] = useState(false);
  const [showServiceBooking, setShowServiceBooking] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showVerification, setShowVerification] = useState(false);
  const [showSafetyFlow, setShowSafetyFlow] = useState(false);
  const [currentService, setCurrentService] = useState(null);

  const [providerProfile, setProviderProfile] = useState({
    name: '',
    businessName: '',
    category: '',
    experience: '',
    hourlyRate: '',
    description: '',
    services: [],
    certifications: [],
    nationality: '',
    workPermit: '',
    verified: false,
    trustScore: 0,
    completedJobs: 0,
    rating: 0,
    reviews: []
  });

  const services = [
    {
      id: 1,
      provider: 'Reliable Home Solutions',
      category: 'Cleaning',
      rating: 4.8,
      price: 'R250/hour',
      safetyScore: 96,
      verified: true,
      nationality: 'South African',
      experience: '5 years',
      completedJobs: 150,
      trustScore: 92,
      reviews: 45,
      certifications: ['Cleaning Industry Certification'],
      description: 'Professional cleaning services with attention to detail'
    },
    {
      id: 2,
      provider: 'Professional Maintenance Co.',
      category: 'Repairs & Maintenance',
      rating: 4.9,
      price: 'R350/hour',
      safetyScore: 98,
      verified: true,
      nationality: 'South African',
      experience: '8 years',
      completedJobs: 200,
      trustScore: 95,
      reviews: 67,
      certifications: ['Electrical License', 'Plumbing Certification'],
      description: 'Comprehensive repair and maintenance services'
    },
    {
      id: 3,
      provider: 'Maria Gonzalez',
      category: 'Gardening',
      rating: 4.7,
      price: 'R180/hour',
      safetyScore: 94,
      verified: true,
      nationality: 'Zimbabwean',
      workPermit: 'WP123456',
      experience: '6 years',
      completedJobs: 120,
      trustScore: 88,
      reviews: 32,
      certifications: ['Horticulture Certificate'],
      description: 'Expert gardening and landscaping services'
    }
  ];

  const categories = [
    'Cleaning', 'Repairs & Maintenance', 'Gardening', 'Electrical',
    'Plumbing', 'Painting', 'Carpentry', 'Security', 'Pest Control'
  ];

  const handleProviderRegistration = () => {
    setShowProviderRegistration(true);
  };

  const handleServiceBooking = (service) => {
    setSelectedService(service);
    setShowServiceBooking(true);
  };

  const handleVerificationComplete = (verificationData) => {
    setShowVerification(false);
    // Update provider profile with verification data
    setProviderProfile(prev => ({
      ...prev,
      verified: true,
      trustScore: verificationData.trustScore,
      nationality: verificationData.nationality,
      workPermit: verificationData.workPermit
    }));
  };

  const handleSafetyFlowComplete = (safetyData) => {
    setShowSafetyFlow(false);
    // Start the service sync
    const serviceSync = {
      id: Date.now(),
      serviceId: currentService.id,
      providerId: currentService.provider,
      clientId: guestData.profile?.name || 'Anonymous',
      startTime: Date.now(),
      status: 'active',
      safetyEnhanced: safetyData.safetyEnhanced,
      facialVerification: safetyData.facialVerification,
      trustScore: Math.max(guestData.trustScore || 0, 75)
    };

    const updatedGuestData = {
      ...guestData,
      activeServiceSyncs: [...(guestData.activeServiceSyncs || []), serviceSync]
    };

    setGuestData(updatedGuestData);
  };

  const startServiceSync = (service) => {
    setCurrentService(service);
    setShowSafetyFlow(true);
  };

  const submitProviderProfile = () => {
    // Validate required fields
    if (!providerProfile.name || !providerProfile.businessName || !providerProfile.category) {
      alert('Please fill in all required fields');
      return;
    }

    // Show verification modal
    setShowVerification(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Home className="h-12 w-12 text-primary-500" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Home Services</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                Verified home service providers with safety protocols
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'find-services', label: 'Find Services', icon: Users },
                { id: 'become-provider', label: 'Become a Provider', icon: UserPlus },
                { id: 'my-services', label: 'My Services', icon: Briefcase }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 inline mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Find Services Tab */}
        {activeTab === 'find-services' && (
          <div className="space-y-6">
            {/* Service Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Service Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <button
                    key={category}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  >
                    <div className="text-center">
                      <Home className="h-8 w-8 text-primary-500 mx-auto mb-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{category}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Available Services */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Available Services</h2>
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{service.provider}</h3>
                          {service.verified && (
                            <Shield className="h-5 w-5 text-green-500" title="Verified Provider" />
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">{service.category}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{service.description}</p>

                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm">{service.rating}</span>
                            <span className="text-sm text-gray-500">({service.reviews} reviews)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Shield className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600">{service.safetyScore}% safe</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Award className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-blue-600">{service.trustScore}% trust</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{service.experience} experience</span>
                          <span>{service.completedJobs} jobs completed</span>
                          <span className="flex items-center space-x-1">
                            <Globe className="h-3 w-3" />
                            {service.nationality}
                            {service.workPermit && ' (Work Permit)'}
                          </span>
                        </div>

                        {service.certifications.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Certifications: {service.certifications.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="font-bold text-gray-900 dark:text-white text-lg">{service.price}</div>
                        <button
                          onClick={() => handleServiceBooking(service)}
                          className="mt-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                        >
                          Book Service
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Become a Provider Tab */}
        {activeTab === 'become-provider' && (
          <div className="space-y-6">
            {!showProviderRegistration ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
                <UserPlus className="h-16 w-16 text-primary-500 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Become a Service Provider</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                  Join our verified network of service providers. Build trust with our community through ratings,
                  reviews, and safety protocols. All providers must undergo identity verification and agree to our
                  community safety standards.
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 inline mr-2" />
                  <span className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Important:</strong> By registering as a service provider, you agree to community rating
                    based on safety, authenticity, service quality, and pricing. You must confirm your nationality
                    and work authorization status.
                  </span>
                </div>
                <button
                  onClick={handleProviderRegistration}
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Start Registration
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Provider Registration</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={providerProfile.name}
                      onChange={(e) => setProviderProfile(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={providerProfile.businessName}
                      onChange={(e) => setProviderProfile(prev => ({ ...prev, businessName: e.target.value }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Your business name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Service Category *
                    </label>
                    <select
                      value={providerProfile.category}
                      onChange={(e) => setProviderProfile(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="text"
                      value={providerProfile.experience}
                      onChange={(e) => setProviderProfile(prev => ({ ...prev, experience: e.target.value }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., 5 years"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hourly Rate (ZAR)
                    </label>
                    <input
                      type="text"
                      value={providerProfile.hourlyRate}
                      onChange={(e) => setProviderProfile(prev => ({ ...prev, hourlyRate: e.target.value }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., 250"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nationality
                    </label>
                    <select
                      value={providerProfile.nationality}
                      onChange={(e) => setProviderProfile(prev => ({ ...prev, nationality: e.target.value }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select nationality</option>
                      <option value="South African">South African</option>
                      <option value="Zimbabwean">Zimbabwean</option>
                      <option value="Mozambican">Mozambican</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {providerProfile.nationality && providerProfile.nationality !== 'South African' && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Work Permit Number *
                    </label>
                    <input
                      type="text"
                      value={providerProfile.workPermit}
                      onChange={(e) => setProviderProfile(prev => ({ ...prev, workPermit: e.target.value }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your work permit number"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Required for legal work in South Africa
                    </p>
                  </div>
                )}

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Service Description
                  </label>
                  <textarea
                    value={providerProfile.description}
                    onChange={(e) => setProviderProfile(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={4}
                    placeholder="Describe your services and expertise"
                  />
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => setShowProviderRegistration(false)}
                    className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitProviderProfile}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Continue to Verification
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* My Services Tab */}
        {activeTab === 'my-services' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">My Services</h2>
            {guestData.activeServiceSyncs?.length > 0 ? (
              <div className="space-y-4">
                {guestData.activeServiceSyncs.map((sync) => (
                  <div key={sync.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Service with {sync.providerId}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Started: {new Date(sync.startTime).toLocaleString()}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          {sync.safetyEnhanced && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              <Shield className="h-3 w-3 mr-1" />
                              Safety Enhanced
                            </span>
                          )}
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Trust Score: {sync.trustScore}%
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Active Services</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You don't have any active service syncs at the moment.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Service Booking Modal */}
        {showServiceBooking && selectedService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Book Service</h2>
                  <button
                    onClick={() => setShowServiceBooking(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {selectedService.provider}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedService.category}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="font-bold text-lg">{selectedService.price}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{selectedService.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 inline mr-2" />
                    <span className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Safety Notice:</strong> This service provider has been verified.
                      We recommend starting a safety sync for enhanced protection during the service.
                    </span>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        setShowServiceBooking(false);
                        startServiceSync(selectedService);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      Start Safe Service Sync
                    </button>
                    <button
                      onClick={() => setShowServiceBooking(false)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      Book Without Sync
                    </button>
                  </div>
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
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Provider Verification</h2>
                  <button
                    onClick={() => setShowVerification(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <IDVerification
                  onVerificationComplete={handleVerificationComplete}
                  context="home-services"
                  requireFacial={true}
                  requireNationality={true}
                />
              </div>
            </div>
          </div>
        )}

        {/* Safety Interaction Flow Modal */}
        {showSafetyFlow && currentService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Safety Setup</h2>
                  <button
                    onClick={() => setShowSafetyFlow(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <SafetyInteractionFlow
                  interactionType="home-service"
                  participants={[currentService.provider]}
                  onComplete={handleSafetyFlowComplete}
                  onCancel={() => setShowSafetyFlow(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeServices;
