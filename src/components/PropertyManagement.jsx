import { Building, Shield, MapPin, CheckCircle } from 'lucide-react';

const PropertyManagement = () => {
  const properties = [
    {
      id: 1,
      name: 'Sunrise Apartments',
      location: 'Sandton, Johannesburg',
      units: 45,
      safetyScore: 94,
      managementFee: 'R2,500/month',
      verified: true
    },
    {
      id: 2,
      name: 'Green Valley Estate',
      location: 'Centurion, Pretoria',
      units: 120,
      safetyScore: 97,
      managementFee: 'R4,200/month',
      verified: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Building className="h-12 w-12 text-primary-500" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Property Management</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                Comprehensive property management with integrated safety systems
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Managed Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{property.name}</h3>
                    <div className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-gray-600 dark:text-gray-400">{property.location}</span>
                    </div>
                  </div>
                  {property.verified && <CheckCircle className="h-6 w-6 text-green-500" />}
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Units:</span>
                    <span className="text-gray-900 dark:text-white">{property.units}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Safety Score:</span>
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-600">{property.safetyScore}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Management Fee:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{property.managementFee}</span>
                  </div>
                </div>
                
                <div className="mt-6 flex space-x-3">
                  <button className="flex-1 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
                    View Details
                  </button>
                  <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                    Safety Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyManagement;
