/* ================================================================================= */
/* FILE: assets/js/utils/google-maps.js                                             */
/* PURPOSE: Google Maps integration for address search and geocoding                */
/* ================================================================================= */

const GOOGLE_MAPS_API_KEY = "AIzaSyDCaHv8AC2iqwk8ijt377Nfe3gMR54WLX4";
let autocompleteService = null;
let geocoder = null;
let isGoogleMapsLoaded = false;

/**
 * Initialize Google Maps services
 */
export async function initGoogleMaps() {
    if (isGoogleMapsLoaded) return;
    
    try {
        // Load Google Maps API
        await loadGoogleMapsScript();
        
        // Initialize services
        autocompleteService = new google.maps.places.AutocompleteService();
        geocoder = new google.maps.Geocoder();
        
        isGoogleMapsLoaded = true;
        console.log('Google Maps services initialized');
    } catch (error) {
        console.error('Failed to initialize Google Maps:', error);
        throw error;
    }
}

/**
 * Load Google Maps script dynamically
 */
function loadGoogleMapsScript() {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.google && window.google.maps) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Maps script'));
        
        document.head.appendChild(script);
    });
}

/**
 * Search for address suggestions
 */
export async function searchAddresses(query, options = {}) {
    if (!isGoogleMapsLoaded) {
        await initGoogleMaps();
    }
    
    return new Promise((resolve, reject) => {
        const request = {
            input: query,
            componentRestrictions: { country: options.country || 'za' }, // Default to South Africa
            types: options.types || ['address']
        };
        
        autocompleteService.getPlacePredictions(request, (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                const suggestions = predictions.map(prediction => ({
                    placeId: prediction.place_id,
                    description: prediction.description,
                    mainText: prediction.structured_formatting.main_text,
                    secondaryText: prediction.structured_formatting.secondary_text
                }));
                resolve(suggestions);
            } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                resolve([]);
            } else {
                reject(new Error(`Address search failed: ${status}`));
            }
        });
    });
}

/**
 * Get detailed place information including coordinates
 */
export async function getPlaceDetails(placeId) {
    if (!isGoogleMapsLoaded) {
        await initGoogleMaps();
    }
    
    return new Promise((resolve, reject) => {
        const service = new google.maps.places.PlacesService(document.createElement('div'));
        
        service.getDetails({
            placeId: placeId,
            fields: ['formatted_address', 'geometry', 'address_components', 'name']
        }, (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                const result = {
                    formattedAddress: place.formatted_address,
                    coordinates: {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    },
                    addressComponents: place.address_components,
                    name: place.name
                };
                resolve(result);
            } else {
                reject(new Error(`Place details failed: ${status}`));
            }
        });
    });
}

/**
 * Geocode an address to get coordinates
 */
export async function geocodeAddress(address) {
    if (!isGoogleMapsLoaded) {
        await initGoogleMaps();
    }
    
    return new Promise((resolve, reject) => {
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
                const result = results[0];
                resolve({
                    formattedAddress: result.formatted_address,
                    coordinates: {
                        lat: result.geometry.location.lat(),
                        lng: result.geometry.location.lng()
                    },
                    addressComponents: result.address_components
                });
            } else {
                reject(new Error(`Geocoding failed: ${status}`));
            }
        });
    });
}

/**
 * Reverse geocode coordinates to get address
 */
export async function reverseGeocode(lat, lng) {
    if (!isGoogleMapsLoaded) {
        await initGoogleMaps();
    }
    
    return new Promise((resolve, reject) => {
        const latlng = new google.maps.LatLng(lat, lng);
        
        geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
                const result = results[0];
                resolve({
                    formattedAddress: result.formatted_address,
                    addressComponents: result.address_components
                });
            } else {
                reject(new Error(`Reverse geocoding failed: ${status}`));
            }
        });
    });
}

/**
 * Create address autocomplete input
 */
export function createAddressAutocomplete(inputElement, options = {}) {
    if (!inputElement) {
        throw new Error('Input element is required');
    }
    
    const autocompleteOptions = {
        componentRestrictions: { country: options.country || 'za' },
        types: options.types || ['address'],
        ...options
    };
    
    initGoogleMaps().then(() => {
        const autocomplete = new google.maps.places.Autocomplete(inputElement, autocompleteOptions);
        
        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            
            if (place.geometry) {
                const placeData = {
                    formattedAddress: place.formatted_address,
                    coordinates: {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    },
                    addressComponents: place.address_components,
                    name: place.name
                };
                
                // Trigger custom event
                const event = new CustomEvent('addressSelected', {
                    detail: placeData
                });
                inputElement.dispatchEvent(event);
            }
        });
        
        return autocomplete;
    }).catch(error => {
        console.error('Failed to create address autocomplete:', error);
    });
}

/**
 * Get current location
 */
export function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                reject(new Error(`Geolocation error: ${error.message}`));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    });
}

/**
 * Format address components into a readable string
 */
export function formatAddressComponents(components) {
    const addressMap = {};
    
    components.forEach(component => {
        const types = component.types;
        if (types.includes('street_number')) {
            addressMap.streetNumber = component.long_name;
        } else if (types.includes('route')) {
            addressMap.street = component.long_name;
        } else if (types.includes('locality')) {
            addressMap.city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
            addressMap.province = component.long_name;
        } else if (types.includes('country')) {
            addressMap.country = component.long_name;
        } else if (types.includes('postal_code')) {
            addressMap.postalCode = component.long_name;
        }
    });
    
    return addressMap;
}