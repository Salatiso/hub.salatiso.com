import { useState, useEffect, useRef } from 'react';
import { MapPin, X } from 'lucide-react';

const GoogleMapsModal = ({ isOpen, onClose, onLocationSelect, initialLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (isOpen && window.google && window.google.maps) {
      initializeMap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const initializeMap = () => {
    if (!mapRef.current) return;

    const defaultLocation = initialLocation || { lat: -26.2041, lng: 28.0473 }; // Johannesburg, South Africa

    const map = new window.google.maps.Map(mapRef.current, {
      center: defaultLocation,
      zoom: 12,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });

    const marker = new window.google.maps.Marker({
      position: defaultLocation,
      map: map,
      draggable: true,
    });

    markerRef.current = marker;

    // Update selected location when marker is dragged
    marker.addListener('dragend', (event) => {
      const position = event.latLng;
      setSelectedLocation({
        lat: position.lat(),
        lng: position.lng(),
        address: 'Loading address...'
      });
      geocodePosition(position);
    });

    // Update marker when map is clicked
    map.addListener('click', (event) => {
      const position = event.latLng;
      marker.setPosition(position);
      setSelectedLocation({
        lat: position.lat(),
        lng: position.lng(),
        address: 'Loading address...'
      });
      geocodePosition(position);
    });
  };

  const geocodePosition = (position) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: position }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setSelectedLocation(prev => ({
          ...prev,
          address: results[0].formatted_address
        }));
      }
    });
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const position = results[0].geometry.location;
        const map = mapRef.current ? window.google.maps.Map.prototype : null;
        if (map && markerRef.current) {
          map.setCenter(position);
          markerRef.current.setPosition(position);
          setSelectedLocation({
            lat: position.lat(),
            lng: position.lng(),
            address: results[0].formatted_address
          });
        }
      } else {
        alert('Location not found. Please try a different search term.');
      }
    });
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Select Location</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Search Bar */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Search
            </button>
          </div>

          {/* Map Container */}
          <div
            ref={mapRef}
            className="w-full h-96 border rounded"
            style={{ minHeight: '400px' }}
          >
            {!window.google && (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Google Maps API not loaded.<br />
                    Please add your Google Maps API key to enable map functionality.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Selected Location Info */}
          {selectedLocation && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-sm font-medium">Selected Location:</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedLocation.address}</p>
              <p className="text-xs text-gray-500">
                Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedLocation}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapsModal;