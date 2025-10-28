import { useState } from 'react';
import { ChevronDown, Wrench, Shield, Users, Car } from 'lucide-react';

const ToolsAndServicesDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  // No translations used here currently

  const toolsAndServices = [
    {
      category: 'Trust & Safety',
      icon: Shield,
      items: [
        { name: 'Instant Trust Verification', path: '/instant-trust', description: 'Quick profile sync for safe interactions' },
        { name: 'Universal Trust Layer', path: '/universal-trust', description: 'Comprehensive trust verification system' },
        { name: 'Emergency Contact Sync', path: '/emergency-sync', description: 'Share location with trusted contacts' },
        { name: 'Live Location Sharing', path: '/location-sharing', description: 'Real-time GPS sharing with safety features' }
      ]
    },
    {
      category: 'Transportation',
      icon: Car,
      items: [
        { name: 'Ride Sharing Safety', path: '/ride-safety', description: 'Safe hitchhiking and ride sharing' },
        { name: 'Parcel Delivery Sync', path: '/parcel-sync', description: 'Secure package delivery coordination' },
        { name: 'Trip Companion Matching', path: '/trip-companion', description: 'Find safe travel companions' }
      ]
    },
    {
      category: 'Services',
      icon: Wrench,
      items: [
        { name: 'Home Service Verification', path: '/home-services', description: 'Verify contractors and service providers' },
        { name: 'Professional Dashboard', path: '/professional-dashboard', description: 'Manage personal and professional services' },
        { name: 'Service Provider Hub', path: '/service-hub', description: 'Connect with verified service providers' }
      ]
    },
    {
      category: 'Community',
      icon: Users,
      items: [
        { name: 'Community Directory', path: '/community-directory', description: 'Find local community resources' },
        { name: 'Skills & Services Exchange', path: '/skills-exchange', description: 'Share skills and services' },
        { name: 'Local Business Network', path: '/business-network', description: 'Connect with local businesses' }
      ]
    }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Wrench className="h-5 w-5" />
        <span>Tools & Services</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tools & Services
            </h3>
            <div className="space-y-4">
              {toolsAndServices.map((category, categoryIndex) => {
                const Icon = category.icon;
                return (
                  <div key={categoryIndex}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon className="h-4 w-4 text-primary-500" />
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {category.category}
                      </h4>
                    </div>
                    <div className="ml-6 space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <a
                          key={itemIndex}
                          href={item.path}
                          className="block p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="font-medium text-gray-900 dark:text-white text-sm">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {item.description}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolsAndServicesDropdown;
