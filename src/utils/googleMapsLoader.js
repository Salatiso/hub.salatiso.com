/**
 * Lazy Google Maps API Loader
 * 
 * This utility provides lazy-loading of the Google Maps API to prevent
 * unnecessary quota consumption and API errors on app startup.
 * 
 * Previously, Google Maps was being loaded on every app start, causing:
 * - 503 Service Unavailable errors
 * - Rapid quota depletion
 * - Network congestion
 * 
 * Now it loads only when actually needed by components like:
 * - Maps components (MapView, LocationPicker)
 * - Location-based features
 * - Geolocation services
 */

let mapsLoadPromise = null;

/**
 * Lazy load Google Maps API
 * Ensures the API is loaded only once, even if called multiple times
 * 
 * @returns {Promise<void>} Resolves when Google Maps API is ready
 */
export const loadGoogleMapsAPI = () => {
  // Return cached promise if already loading or loaded
  if (mapsLoadPromise) {
    return mapsLoadPromise;
  }

  mapsLoadPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google && window.google.maps) {
      console.log('Google Maps API already loaded');
      resolve();
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('Google Maps API key not found in environment variables');
      reject(new Error('VITE_GOOGLE_MAPS_API_KEY not configured'));
      return;
    }

    try {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      script.id = 'google-maps-script';

      script.onload = () => {
        console.log('Google Maps API loaded successfully');
        resolve();
      };

      script.onerror = (error) => {
        console.error('Failed to load Google Maps API:', error);
        mapsLoadPromise = null; // Reset for retry
        reject(new Error('Failed to load Google Maps API'));
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error('Error setting up Google Maps script:', error);
      mapsLoadPromise = null; // Reset for retry
      reject(error);
    }
  });

  return mapsLoadPromise;
};

/**
 * Check if Google Maps API is loaded
 * 
 * @returns {boolean} True if Google Maps is available
 */
export const isGoogleMapsLoaded = () => {
  return window.google && window.google.maps;
};

/**
 * Get Google Maps instance (must be loaded first)
 * 
 * @returns {Object|null} Google Maps API object or null if not loaded
 */
export const getGoogleMaps = () => {
  if (!isGoogleMapsLoaded()) {
    console.warn('Google Maps not loaded yet. Call loadGoogleMapsAPI() first.');
    return null;
  }
  return window.google.maps;
};
