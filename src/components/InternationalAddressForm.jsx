import { useState, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium',
  'Brazil', 'Canada', 'Chile', 'China', 'Colombia', 'Denmark', 'Egypt', 'Finland', 'France',
  'Germany', 'Greece', 'India', 'Indonesia', 'Ireland', 'Italy', 'Japan', 'Jordan', 'Kenya',
  'Malaysia', 'Mexico', 'Morocco', 'Netherlands', 'New Zealand', 'Norway', 'Pakistan', 'Peru',
  'Philippines', 'Poland', 'Portugal', 'Russia', 'Saudi Arabia', 'Singapore', 'South Africa',
  'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Thailand', 'Turkey', 'Ukraine', 'United Arab Emirates',
  'United Kingdom', 'United States', 'Vietnam', 'Zimbabwe'
];

const InternationalAddressForm = ({
  address = {},
  onChange,
  onGPSConfirm,
  showGPSButton = true,
  className = '',
  label = 'Address'
}) => {
  const [localAddress, setLocalAddress] = useState({
    addressLine1: address.addressLine1 || '',
    addressLine2: address.addressLine2 || '',
    city: address.city || '',
    state: address.state || '',
    postalCode: address.postalCode || '',
    country: address.country || '',
    latitude: address.latitude || null,
    longitude: address.longitude || null,
    gpsAccuracy: address.gpsAccuracy || null
  });

  const [gpsSupported, setGpsSupported] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  useEffect(() => {
    setGpsSupported('geolocation' in navigator);
  }, []);

  useEffect(() => {
    if (onChange) {
      onChange(localAddress);
    }
  }, [localAddress, onChange]);

  const handleGPSConfirm = async () => {
    if (!gpsSupported) return;

    setGpsLoading(true);
    setGpsError('');

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        gpsAccuracy: position.coords.accuracy
      };

      setLocalAddress(prev => ({
        ...prev,
        ...coords
      }));

      if (onGPSConfirm) {
        onGPSConfirm(coords);
      }
    } catch (error) {
      console.error('GPS error:', error);
      setGpsError(
        error.code === 1 ? 'Location access denied. Please enable GPS and try again.' :
        error.code === 2 ? 'Location unavailable. Please check your GPS settings.' :
        'Unable to get location. Please try again.'
      );
    } finally {
      setGpsLoading(false);
    }
  };

  const updateField = (field, value) => {
    setLocalAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{label}</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Address Line 1 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Address Line 1 *
          </label>
          <input
            type="text"
            value={localAddress.addressLine1}
            onChange={(e) => updateField('addressLine1', e.target.value)}
            placeholder="Street address, building name"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Address Line 2 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Address Line 2
          </label>
          <input
            type="text"
            value={localAddress.addressLine2}
            onChange={(e) => updateField('addressLine2', e.target.value)}
            placeholder="Apartment, suite, unit, floor (optional)"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* City / Town */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            City / Town *
          </label>
          <input
            type="text"
            value={localAddress.city}
            onChange={(e) => updateField('city', e.target.value)}
            placeholder="Enter city or town"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* State / Province / Region */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            State / Province / Region
          </label>
          <input
            type="text"
            value={localAddress.state}
            onChange={(e) => updateField('state', e.target.value)}
            placeholder="Enter state, province, or region"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Postal Code / ZIP */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Postal Code / ZIP
          </label>
          <input
            type="text"
            value={localAddress.postalCode}
            onChange={(e) => updateField('postalCode', e.target.value)}
            placeholder="Enter postal code or ZIP"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Country *
          </label>
          <select
            value={localAddress.country}
            onChange={(e) => updateField('country', e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select Country</option>
            {COUNTRIES.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {/* GPS Confirmation */}
        {showGPSButton && (
          <div className="border-t pt-4">
            <div className="flex items-start gap-3">
              <Navigation className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white mb-2">
                  Confirm with GPS
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Use your device's GPS to confirm the exact location coordinates for this address.
                </div>

                <button
                  type="button"
                  onClick={handleGPSConfirm}
                  disabled={!gpsSupported || gpsLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {gpsLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      Confirm GPS Location
                    </>
                  )}
                </button>

                {gpsError && (
                  <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {gpsError}
                  </div>
                )}

                {(localAddress.latitude && localAddress.longitude) && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="text-sm text-green-800 dark:text-green-200">
                      <div className="font-medium">GPS Confirmed</div>
                      <div className="mt-1">
                        {localAddress.latitude?.toFixed ? localAddress.latitude.toFixed(6) : localAddress.latitude}, {localAddress.longitude?.toFixed ? localAddress.longitude.toFixed(6) : localAddress.longitude}
                        {localAddress.gpsAccuracy && (
                          <span className="text-xs ml-2">
                            (±{Math.round(localAddress.gpsAccuracy)}m)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {!gpsSupported && (
                  <div className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                    GPS not supported on this device
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternationalAddressForm;