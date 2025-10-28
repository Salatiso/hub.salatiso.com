import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Truck,
  MapPin,
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Star,
  Phone,
  MessageSquare,
  UserCheck,
  Calendar,
  Plus,
  Lock,
  Timer,
  Satellite,
  
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GuestContext from '../contexts/GuestContext';
import IDVerification from './IDVerification';

const DeliveryServices = () => {
  const [activeTab, setActiveTab] = useState('request-delivery');
  
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [showVerification, setShowVerification] = useState(false);
  const [showProviderProfile, setShowProviderProfile] = useState(false);
  const [selectedProviderProfile, setSelectedProviderProfile] = useState(null);
  
  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingDelivery, setRatingDelivery] = useState(null);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  
  // Provider registration state
  const [providerForm, setProviderForm] = useState({
    providerType: 'individual',
    businessName: '',
    fullName: '',
    contactNumber: '',
    email: '',
    services: [],
    coverageAreas: [],
    pricing: {
      base: '',
      perKm: '',
      express: ''
    },
    trustLevel: 'individual',
    autoUpgrade: true,
    syncPlatforms: true,
    termsAccepted: false
  });
  
  const [providers, setProviders] = useState(() => {
    const saved = localStorage.getItem('deliveryProviders');
    return saved ? JSON.parse(saved) : [];
  });
  
  useTranslation();
  const { guestData, setGuestData } = useContext(GuestContext);

  // Mock delivery providers data
  const [deliveryProviders] = useState([
    {
      id: 1,
      provider: {
        name: 'Quick Courier Services',
        logo: '/api/placeholder/60/60',
        rating: 4.8,
        completedDeliveries: 1247,
        responseTime: '15-30 min',
        safetyScore: 96
      },
      services: ['Same Day Delivery', 'Express Delivery', 'Fragile Items', 'Document Delivery'],
      coverage: ['Johannesburg', 'Pretoria', 'Sandton', 'Midrand'],
      pricing: {
        base: 45,
        perKm: 8,
        currency: 'ZAR'
      },
      safetyFeatures: {
        tracking: true,
        insurance: true,
        verification: true,
        communityValidation: true
      },
      availability: 'Available',
      estimatedTime: '25 minutes'
    },
    {
      id: 2,
      provider: {
        name: 'Reliable Transport Co.',
        logo: '/api/placeholder/60/60',
        rating: 4.9,
        completedDeliveries: 2156,
        responseTime: '20-40 min',
        safetyScore: 98
      },
      services: ['Bulk Delivery', 'Furniture Transport', 'Appliance Delivery', 'Moving Services'],
      coverage: ['Cape Town', 'Durban', 'Port Elizabeth', 'Stellenbosch'],
      pricing: {
        base: 65,
        perKm: 12,
        currency: 'ZAR'
      },
      safetyFeatures: {
        tracking: true,
        insurance: true,
        verification: true,
        communityValidation: true
      },
      availability: 'Busy - Extended Wait',
      estimatedTime: '45 minutes'
    }
  ]);

  // Mock active deliveries
  const [userDeliveries] = useState([
    {
      id: 'DEL-001',
      status: 'in-transit',
      driver: {
        name: 'Peter Nkomo',
        phone: '+27123456789',
        vehicle: 'Toyota Hiace - GP 456-789',
        rating: 4.7
      },
      pickup: 'Mall of Africa',
      delivery: 'University of Witwatersrand',
      estimatedTime: '25 minutes',
      trackingCode: 'QC-2025-001',
      safetyHandshake: true,
      items: [
        { name: 'Electronics Package', weight: '2.5kg', fragile: true },
        { name: 'Documents Envelope', weight: '0.2kg', fragile: false }
      ],
      cost: 85
    },
    {
      id: 'DEL-002',
      status: 'completed',
      driver: {
        name: 'Sarah Mohamed',
        phone: '+27987654321',
        vehicle: 'Ford Ranger - CA 123-987',
        rating: 4.9
      },
      pickup: 'Home',
      delivery: 'Office Building',
      completedTime: '2025-09-03T14:30:00Z',
      trackingCode: 'RT-2025-002',
      safetyHandshake: true,
      items: [
        { name: 'Office Supplies', weight: '5.0kg', fragile: false }
      ],
      cost: 120,
      customerRating: 5
    }
  ]);

  

  const handleRequestDelivery = (provider) => {
    alert(`Delivery request sent to ${provider.provider.name}. You will receive confirmation shortly.`);
  };

  const handleTrackDelivery = (delivery) => {
    setActiveDelivery(delivery);
    setActiveTab('track-delivery');
  };

  const handleEmergencyAlert = () => {
    alert('Emergency alert sent! Delivery stopped and authorities notified.');
  };

  const handleVerificationComplete = (verificationData) => {
    setShowVerification(false);
    const updatedGuestData = {
      ...guestData,
      verifications: [...(guestData.verifications || []), {
        ...verificationData,
        context: 'delivery-services',
        timestamp: new Date().toISOString()
      }],
      trustScore: Math.max(guestData.trustScore || 0, verificationData.trustScore)
    };
    setGuestData(updatedGuestData);
  };

  const handleDeliveryComplete = (delivery) => {
    setRatingDelivery(delivery);
    setShowRatingModal(true);
  };

  const handleRatingSubmit = () => {
    // Here you would typically send the rating to your backend
    console.log('Rating submitted:', {
      delivery: ratingDelivery,
      rating: deliveryRating,
      comment: ratingComment
    });
    
    // Update the delivery status
    setActiveDelivery(null);
    setRatingDelivery(null);
    setDeliveryRating(0);
    setRatingComment('');
    setShowRatingModal(false);
    
    alert('Thank you for your rating! Your feedback helps improve our delivery service.');
  };

  const handleViewProviderProfile = (provider) => {
    setSelectedProviderProfile(provider);
    setShowProviderProfile(true);
  };

  const calculateEstimatedCost = (distance = 10) => {
    return deliveryProviders.map(provider => ({
      ...provider,
      estimatedCost: provider.pricing.base + (provider.pricing.perKm * distance)
    }));
  };

  // Provider registration functions
  const handleProviderFormChange = (field, value) => {
    setProviderForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleServiceToggle = (service) => {
    setProviderForm(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleCoverageToggle = (area) => {
    setProviderForm(prev => ({
      ...prev,
      coverageAreas: prev.coverageAreas.includes(area)
        ? prev.coverageAreas.filter(a => a !== area)
        : [...prev.coverageAreas, area]
    }));
  };

  const handlePricingChange = (field, value) => {
    setProviderForm(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [field]: value
      }
    }));
  };

  const calculateTrustLevel = (provider) => {
    const { completedDeliveries, rating, endorsements } = provider;
    let trustPercentage = 0;
    let level = 'individual';

    if (completedDeliveries >= 500 && rating >= 4.8) {
      trustPercentage = 100;
      level = 'verified';
    } else if (completedDeliveries >= 200 && rating >= 4.7 && endorsements?.community >= 5) {
      trustPercentage = 75;
      level = 'community';
    } else if (completedDeliveries >= 50 && rating >= 4.5 && endorsements?.street >= 5) {
      trustPercentage = 50;
      level = 'street';
    } else if (completedDeliveries >= 10 && endorsements?.household >= 2) {
      trustPercentage = 25;
      level = 'household';
    }

    return { percentage: trustPercentage, level };
  };

  const handleProviderRegistration = async (e) => {
    e.preventDefault();
    
    if (!providerForm.termsAccepted) {
      alert('Please accept the terms and conditions');
      return;
    }

    const newProvider = {
      id: Date.now().toString(),
      ...providerForm,
      status: 'pending',
      joinedDate: new Date().toISOString(),
      completedDeliveries: 0,
      rating: 0,
      totalRatings: 0,
      trustLevel: calculateTrustLevel({ completedDeliveries: 0, rating: 0 }),
      endorsements: {
        individual: 0,
        household: 0,
        street: 0,
        community: 0
      },
      reviews: []
    };

    const updatedProviders = [...providers, newProvider];
    setProviders(updatedProviders);
    localStorage.setItem('deliveryProviders', JSON.stringify(updatedProviders));

    // Sync with external platforms
    await syncWithExternalPlatforms(newProvider);

    alert('Provider registration submitted! You will be notified once verified.');
    
    // Reset form
    setProviderForm({
      providerType: 'individual',
      businessName: '',
      fullName: '',
      contactNumber: '',
      email: '',
      services: [],
      coverageAreas: [],
      pricing: { base: '', perKm: '', express: '' },
      trustLevel: 'individual',
      autoUpgrade: true,
      syncPlatforms: true,
      termsAccepted: false
    });
  };

  const syncWithExternalPlatforms = async (providerData) => {
    if (!providerData.syncPlatforms) return;
    
    try {
      // Mock API calls to external platforms
      const platforms = ['ekhaya', 'pigeeback', 'family-value'];
      
      for (const platform of platforms) {
        // In a real implementation, these would be actual API calls
        console.log(`Syncing provider ${providerData.fullName} with ${platform} platform`);
        
        // Mock successful sync
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      alert('Provider profile synced with external platforms successfully!');
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Some platform syncs failed. Provider registration completed locally.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Package className="h-12 w-12 text-primary-500" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Safe Delivery Services</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                  Secure delivery coordination with verified providers and real-time tracking
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
                { id: 'request-delivery', name: 'Request Delivery', icon: Plus },
                { id: 'track-delivery', name: 'Track Delivery', icon: Satellite },
                { id: 'my-deliveries', name: 'My Deliveries', icon: Calendar },
                { id: 'providers', name: 'Verified Providers', icon: Shield },
                { id: 'provider-registration', name: 'Become a Provider', icon: UserCheck }
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

        {/* Request Delivery Tab */}
        {activeTab === 'request-delivery' && (
          <div className="space-y-6">
            {/* Delivery Request Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Request Delivery</h2>
              
              {/* Pickup and Delivery Locations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pickup Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Where to pickup from?"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Delivery Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Where to deliver to?"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Package Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Package Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                    <option value="">Select package type</option>
                    <option value="documents">Documents</option>
                    <option value="small-package">Small Package</option>
                    <option value="electronics">Electronics</option>
                    <option value="fragile">Fragile Items</option>
                    <option value="bulk">Bulk Items</option>
                    <option value="furniture">Furniture</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    placeholder="0.0"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Urgency
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                    <option value="standard">Standard (3-6 hours)</option>
                    <option value="express">Express (1-2 hours)</option>
                    <option value="urgent">Urgent (30-60 min)</option>
                    <option value="same-day">Same Day</option>
                  </select>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Special Instructions
                </label>
                <textarea
                  placeholder="Any special handling instructions, delivery notes, or safety requirements..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Safety Options */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Safety Features</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Real-time GPS tracking</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Driver verification and safety handshake</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Package insurance coverage</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Require signature confirmation</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Photo confirmation of delivery</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  Find Delivery Providers
                </button>
              </div>
            </div>

            {/* Available Providers */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Available Delivery Providers</h3>
              {calculateEstimatedCost().map((provider) => (
                <div key={provider.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={provider.provider.logo}
                        alt={provider.provider.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {provider.provider.name}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                              {provider.provider.rating}
                            </span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {provider.provider.completedDeliveries} deliveries
                          </span>
                          <span className="text-gray-400">•</span>
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600 dark:text-green-400">
                              {provider.provider.safetyScore}% safety
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        R{provider.estimatedCost}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">estimated cost</div>
                      <div className={`text-sm mt-1 ${
                        provider.availability.includes('Available') ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {provider.availability}
                      </div>
                    </div>
                  </div>

                  {/* Services and Coverage */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Services</h5>
                      <div className="flex flex-wrap gap-1">
                        {provider.services.slice(0, 3).map((service, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded dark:bg-blue-900 dark:text-blue-200"
                          >
                            {service}
                          </span>
                        ))}
                        {provider.services.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{provider.services.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Coverage Areas</h5>
                      <div className="flex flex-wrap gap-1">
                        {provider.coverage.slice(0, 2).map((area, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded dark:bg-green-900 dark:text-green-200"
                          >
                            {area}
                          </span>
                        ))}
                        {provider.coverage.length > 2 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{provider.coverage.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Safety Features */}
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Safety Features</h5>
                    <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        GPS Tracking
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        Insurance
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        Verified Drivers
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        Community Validated
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>ETA: {provider.estimatedTime}</span>
                    </div>
                    <div className="flex space-x-3">
                      <button className="px-3 py-1 text-primary-600 border border-primary-600 rounded hover:bg-primary-50 transition-colors">
                        View Details
                      </button>
                      <button
                        onClick={() => handleRequestDelivery(provider)}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Request Delivery
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Track Delivery Tab */}
        {activeTab === 'track-delivery' && (
          <div className="space-y-6">
            {activeDelivery ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  Tracking: {activeDelivery.trackingCode}
                </h2>

                {/* Delivery Status */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <Truck className="h-6 w-6 text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-900 dark:text-blue-100">
                        Delivery {activeDelivery.status === 'in-transit' ? 'In Transit' : 'Status Unknown'}
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        ETA: {activeDelivery.estimatedTime} • Driver: {activeDelivery.driver.name}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Driver Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Driver Information</h3>
                    <div className="flex items-center space-x-4">
                      <img
                        src="/api/placeholder/60/60"
                        alt="Driver"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {activeDelivery.driver.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {activeDelivery.driver.vehicle}
                        </div>
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                            {activeDelivery.driver.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Phone className="h-4 w-4 inline mr-2" />
                        Call Driver
                      </button>
                      <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <MessageSquare className="h-4 w-4 inline mr-2" />
                        Message
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delivery Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">From:</span>
                        <span className="text-gray-900 dark:text-white">{activeDelivery.pickup}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">To:</span>
                        <span className="text-gray-900 dark:text-white">{activeDelivery.delivery}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Cost:</span>
                        <span className="text-gray-900 dark:text-white">R{activeDelivery.cost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Items:</span>
                        <span className="text-gray-900 dark:text-white">{activeDelivery.items.length} package(s)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Button */}
                <div className="text-center mb-6">
                  <button
                    onClick={handleEmergencyAlert}
                    className="w-full p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-3"
                  >
                    <AlertTriangle className="h-6 w-6" />
                    <span className="text-lg font-medium">Emergency Alert</span>
                  </button>
                </div>

                {/* Real-time Status */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Satellite className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="font-medium text-gray-900 dark:text-white">GPS Active</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Real-time tracking</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <UserCheck className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <div className="font-medium text-gray-900 dark:text-white">Handshake Verified</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Driver confirmed</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Lock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <div className="font-medium text-gray-900 dark:text-white">Package Secure</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Insurance active</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Timer className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <div className="font-medium text-gray-900 dark:text-white">On Schedule</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{activeDelivery.estimatedTime}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Active Delivery</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Track your deliveries here when you have an active order.
                </p>
                <button
                  onClick={() => setActiveTab('my-deliveries')}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  View My Deliveries
                </button>
              </div>
            )}
          </div>
        )}

        {/* My Deliveries Tab */}
        {activeTab === 'my-deliveries' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">My Deliveries</h2>
              
              <div className="space-y-4">
                {userDeliveries.map((delivery) => (
                  <div key={delivery.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          delivery.status === 'in-transit' ? 'bg-blue-500' :
                          delivery.status === 'completed' ? 'bg-green-500' :
                          'bg-gray-500'
                        }`}></div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {delivery.pickup} → {delivery.delivery}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {delivery.trackingCode} • Driver: {delivery.driver.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-white">R{delivery.cost}</div>
                        <div className={`text-sm capitalize ${
                          delivery.status === 'in-transit' ? 'text-blue-600' :
                          delivery.status === 'completed' ? 'text-green-600' :
                          'text-gray-600'
                        }`}>
                          {delivery.status.replace('-', ' ')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {delivery.items.length} item(s) • {
                          delivery.status === 'completed' 
                            ? `Delivered ${new Date(delivery.completedTime).toLocaleDateString()}`
                            : `ETA: ${delivery.estimatedTime}`
                        }
                      </div>
                      <div className="flex space-x-2">
                        {delivery.status === 'in-transit' && (
                          <button
                            onClick={() => handleTrackDelivery(delivery)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            Track
                          </button>
                        )}
                        {delivery.status === 'completed' && !delivery.customerRating && (
                          <button 
                            onClick={() => handleDeliveryComplete(delivery)}
                            className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                          >
                            Rate Driver
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Providers Tab */}
        {activeTab === 'providers' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Verified Delivery Providers</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {deliveryProviders.map((provider) => (
                  <div key={provider.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={provider.provider.logo}
                        alt={provider.provider.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {provider.provider.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {provider.provider.rating} ({provider.provider.completedDeliveries} deliveries)
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Specialties</h4>
                        <div className="flex flex-wrap gap-1">
                          {provider.services.map((service, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded dark:bg-blue-900 dark:text-blue-200"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Coverage Areas</h4>
                        <div className="flex flex-wrap gap-1">
                          {provider.coverage.map((area, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded dark:bg-green-900 dark:text-green-200"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600 dark:text-green-400">
                            {provider.provider.safetyScore}% Safety Score
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewProviderProfile(provider)}
                            className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors"
                          >
                            View Profile
                          </button>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            From R{provider.pricing.base}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Provider Registration Tab */}
        {activeTab === 'provider-registration' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Become a Delivery Service Provider</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Join our trusted network of delivery providers. Complete your registration and trust verification to start serving customers.
              </p>

              <form onSubmit={handleProviderRegistration} className="space-y-6">
                {/* Personal/Business Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Provider Type
                    </label>
                    <select 
                      value={providerForm.providerType}
                      onChange={(e) => handleProviderFormChange('providerType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="individual">Individual</option>
                      <option value="business">Business</option>
                      <option value="organization">Organization</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Business Name (if applicable)
                    </label>
                    <input
                      type="text"
                      value={providerForm.businessName}
                      onChange={(e) => handleProviderFormChange('businessName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter business name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={providerForm.fullName}
                      onChange={(e) => handleProviderFormChange('fullName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      value={providerForm.contactNumber}
                      onChange={(e) => handleProviderFormChange('contactNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="+27 XX XXX XXXX"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={providerForm.email}
                    onChange={(e) => handleProviderFormChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                {/* Services Offered */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Services Offered
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      'Food Delivery', 'Package Delivery', 'Document Delivery', 'Medical Supplies',
                      'Groceries', 'Electronics', 'Clothing', 'Same-day Delivery', 'Express Delivery'
                    ].map((service) => (
                      <label key={service} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={providerForm.services.includes(service)}
                          onChange={() => handleServiceToggle(service)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Coverage Areas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Coverage Areas
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      'Johannesburg', 'Pretoria', 'Cape Town', 'Durban', 'Sandton', 'Rosebank',
                      'Randburg', 'Midrand', 'Centurion', 'Roodepoort', 'Alberton', 'Germiston'
                    ].map((area) => (
                      <label key={area} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={providerForm.coverageAreas.includes(area)}
                          onChange={() => handleCoverageToggle(area)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Base Delivery Fee (R)
                    </label>
                    <input
                      type="number"
                      value={providerForm.pricing.base}
                      onChange={(e) => handlePricingChange('base', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Per Km Rate (R)
                    </label>
                    <input
                      type="number"
                      value={providerForm.pricing.perKm}
                      onChange={(e) => handlePricingChange('perKm', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="15"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Express Surcharge (R)
                    </label>
                    <input
                      type="number"
                      value={providerForm.pricing.express}
                      onChange={(e) => handlePricingChange('express', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="25"
                    />
                  </div>
                </div>

                {/* Trust Verification Setup */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Trust Verification Setup
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Initial Trust Level
                      </label>
                      <select 
                        value={providerForm.trustLevel}
                        onChange={(e) => handleProviderFormChange('trustLevel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="individual">Individual (0% - Start with personal verification)</option>
                        <option value="household">Household (25% - Family/community endorsement)</option>
                        <option value="street">Street Level (50% - Neighborhood verification)</option>
                        <option value="community">Community (75% - Local area approval)</option>
                        <option value="verified">Fully Verified (100% - Complete ecosystem trust)</option>
                      </select>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Trust Level Progression
                      </h4>
                      <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <p>• <strong>Individual (0%):</strong> Basic ID and contact verification</p>
                        <p>• <strong>Household (25%):</strong> Family member endorsements + 10 completed deliveries</p>
                        <p>• <strong>Street (50%):</strong> 5+ neighbor verifications + 50 deliveries + 4.5+ rating</p>
                        <p>• <strong>Community (75%):</strong> Local business endorsements + 200 deliveries + 4.7+ rating</p>
                        <p>• <strong>Fully Verified (100%):</strong> Ecosystem integration + 500 deliveries + 4.8+ rating</p>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={providerForm.autoUpgrade}
                          onChange={(e) => handleProviderFormChange('autoUpgrade', e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Enable automatic trust level upgrades based on performance
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={providerForm.syncPlatforms}
                          onChange={(e) => handleProviderFormChange('syncPlatforms', e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Sync trust profile with Ekhaya, Pigeeback, and Family Value platforms
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={providerForm.termsAccepted}
                      onChange={(e) => handleProviderFormChange('termsAccepted', e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      required
                    />
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        I agree to the{' '}
                        <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                          Terms of Reciprocity
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                          Privacy Policy
                        </Link>
                        . I understand that my performance will be rated by customers and may affect my trust level.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Save Draft
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Submit Registration
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ID Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Delivery Service Verification</h2>
                <button
                  onClick={() => setShowVerification(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <IDVerification
                onVerificationComplete={handleVerificationComplete}
                context="delivery-services"
                requireFacial={true}
                requireNationality={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delivery Rating Modal */}
      {showRatingModal && ratingDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Rate Your Delivery</h2>
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  How was your delivery with {ratingDelivery.driver.name}?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your rating helps maintain trust in our delivery network
                </p>
              </div>

              {/* Star Rating */}
              <div className="flex justify-center space-x-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setDeliveryRating(star)}
                    className={`text-3xl ${
                      star <= deliveryRating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    ★
                  </button>
                ))}
              </div>

              {/* Rating Labels */}
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {deliveryRating === 1 && "Poor - Major issues"}
                  {deliveryRating === 2 && "Below Average - Some issues"}
                  {deliveryRating === 3 && "Average - Met basic expectations"}
                  {deliveryRating === 4 && "Good - Above average service"}
                  {deliveryRating === 5 && "Excellent - Outstanding service"}
                </p>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                  placeholder="Share your experience..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Skip
                </button>
                <button
                  onClick={handleRatingSubmit}
                  disabled={deliveryRating === 0}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provider Profile Modal */}
      {showProviderProfile && selectedProviderProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">Provider Profile</h2>
                <button
                  onClick={() => setShowProviderProfile(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start space-x-6">
                  <img
                    src={selectedProviderProfile.provider.logo}
                    alt={selectedProviderProfile.provider.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                      {selectedProviderProfile.provider.name}
                    </h3>
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="text-lg font-medium text-gray-900 dark:text-white ml-1">
                          {selectedProviderProfile.provider.rating}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                          ({selectedProviderProfile.provider.completedDeliveries} deliveries)
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-green-500 mr-1" />
                        <span className="text-sm text-green-600 dark:text-green-400">
                          {selectedProviderProfile.provider.safetyScore}% Safety Score
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Member since {new Date().getFullYear() - 1} • Verified Provider
                    </div>
                  </div>
                </div>

                {/* Trust Level */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Trust Verification Level</h4>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span>Community Trust</span>
                        <span>85%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{width: '85%'}}></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">Community</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Level</div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    <strong>Next Level:</strong> Fully Verified (500+ deliveries, 4.8+ rating)
                  </div>
                </div>

                {/* Services & Coverage */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Services Offered</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProviderProfile.services.map((service, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full dark:bg-blue-900 dark:text-blue-200"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Coverage Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProviderProfile.coverage.map((area, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full dark:bg-green-900 dark:text-green-200"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Pricing Structure</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">R{selectedProviderProfile.pricing.base}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Base Fee</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">R{selectedProviderProfile.pricing.perKm}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Per Kilometer</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">R{selectedProviderProfile.pricing.currency === 'ZAR' ? selectedProviderProfile.pricing.express || 25 : 'N/A'}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Express Surcharge</div>
                    </div>
                  </div>
                </div>

                {/* Safety Features */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Safety & Security Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedProviderProfile.safetyFeatures).map(([feature, enabled]) => (
                      <div key={feature} className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {feature.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Recent Reviews</h4>
                  <div className="space-y-3">
                    {[
                      { rating: 5, comment: "Excellent service! Package arrived on time and in perfect condition.", customer: "Sarah M.", date: "2 days ago" },
                      { rating: 4, comment: "Good communication throughout the delivery process.", customer: "John D.", date: "1 week ago" },
                      { rating: 5, comment: "Very professional driver. Would use again.", customer: "Maria K.", date: "2 weeks ago" }
                    ].map((review, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{review.customer}</span>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{review.date}</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowProviderProfile(false)}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleRequestDelivery(selectedProviderProfile)}
                    className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Request Delivery
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryServices;
