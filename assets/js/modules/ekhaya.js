import { initializeApp } from '../firebase-config.js';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, getDocs, addDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { GoogleMapsService } from '../utils/google-maps.js';

class EkhayaManager {
    constructor() {
        this.app = null;
        this.db = null;
        this.auth = null;
        this.user = null;
        this.properties = [];
        this.mapsService = new GoogleMapsService();
        
        this.init();
    }

    async init() {
        try {
            this.app = await initializeApp();
            this.db = getFirestore(this.app);
            this.auth = getAuth(this.app);
            
            // Wait for auth state
            this.auth.onAuthStateChanged((user) => {
                if (user) {
                    this.user = user;
                    this.loadProperties();
                    this.initializeUI();
                } else {
                    console.log('User not authenticated');
                    window.location.href = '/login.html';
                }
            });
        } catch (error) {
            console.error('Error initializing eKhaya:', error);
        }
    }

    initializeUI() {
        this.setupEventListeners();
        this.initializeGoogleMaps();
        this.updateDashboardStats();
    }

    setupEventListeners() {
        // Add property button
        const addPropertyBtn = document.getElementById('add-property-btn');
        if (addPropertyBtn) {
            addPropertyBtn.addEventListener('click', () => this.showAddPropertyModal());
        }

        // Modal controls
        const closeModal = document.getElementById('close-modal');
        const cancelProperty = document.getElementById('cancel-property');
        const modal = document.getElementById('add-property-modal');

        if (closeModal) {
            closeModal.addEventListener('click', () => this.hideAddPropertyModal());
        }

        if (cancelProperty) {
            cancelProperty.addEventListener('click', () => this.hideAddPropertyModal());
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideAddPropertyModal();
                }
            });
        }

        // Property form submission
        const propertyForm = document.getElementById('property-form');
        if (propertyForm) {
            propertyForm.addEventListener('submit', (e) => this.handlePropertySubmission(e));
        }
    }

    async initializeGoogleMaps() {
        try {
            await this.mapsService.initialize();
            
            // Setup address autocomplete
            const addressInput = document.getElementById('property-address');
            if (addressInput) {
                this.mapsService.setupAddressAutocomplete(addressInput, (place) => {
                    this.handleAddressSelection(place);
                });
            }
        } catch (error) {
            console.error('Error initializing Google Maps:', error);
        }
    }

    handleAddressSelection(place) {
        const form = document.getElementById('property-form');
        if (!form || !place.address_components) return;

        // Extract address components
        const components = {};
        place.address_components.forEach(component => {
            const types = component.types;
            if (types.includes('locality')) {
                components.city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
                components.province = component.long_name;
            } else if (types.includes('postal_code')) {
                components.postalCode = component.long_name;
            }
        });

        // Fill form fields
        if (components.city) {
            const cityField = form.querySelector('[name="city"]');
            if (cityField) cityField.value = components.city;
        }

        if (components.province) {
            const provinceField = form.querySelector('[name="province"]');
            if (provinceField) {
                // Map full province names to select values
                const provinceMap = {
                    'Gauteng': 'gauteng',
                    'Western Cape': 'western-cape',
                    'KwaZulu-Natal': 'kwazulu-natal',
                    'Eastern Cape': 'eastern-cape',
                    'Free State': 'free-state',
                    'Limpopo': 'limpopo',
                    'Mpumalanga': 'mpumalanga',
                    'North West': 'north-west',
                    'Northern Cape': 'northern-cape'
                };
                const provinceValue = provinceMap[components.province] || '';
                if (provinceValue) {
                    provinceField.value = provinceValue;
                }
            }
        }

        if (components.postalCode) {
            const postalCodeField = form.querySelector('[name="postalCode"]');
            if (postalCodeField) postalCodeField.value = components.postalCode;
        }
    }

    showAddPropertyModal() {
        const modal = document.getElementById('add-property-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    hideAddPropertyModal() {
        const modal = document.getElementById('add-property-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
            
            // Reset form
            const form = document.getElementById('property-form');
            if (form) {
                form.reset();
            }
        }
    }

    async handlePropertySubmission(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const propertyData = {
            name: formData.get('name'),
            type: formData.get('type'),
            address: formData.get('address'),
            city: formData.get('city'),
            province: formData.get('province'),
            postalCode: formData.get('postalCode'),
            bedrooms: parseInt(formData.get('bedrooms')) || 0,
            bathrooms: parseFloat(formData.get('bathrooms')) || 0,
            size: parseInt(formData.get('size')) || 0,
            purchasePrice: parseFloat(formData.get('purchasePrice')) || 0,
            currentValue: parseFloat(formData.get('currentValue')) || 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: this.user.uid
        };

        try {
            await this.addProperty(propertyData);
            this.hideAddPropertyModal();
            this.showSuccessMessage('Property added successfully!');
        } catch (error) {
            console.error('Error adding property:', error);
            this.showErrorMessage('Failed to add property. Please try again.');
        }
    }

    async addProperty(propertyData) {
        try {
            const propertiesRef = collection(this.db, 'users', this.user.uid, 'properties');
            const docRef = await addDoc(propertiesRef, propertyData);
            
            // Add the ID to the property data
            propertyData.id = docRef.id;
            this.properties.push(propertyData);
            
            this.renderProperties();
            this.updateDashboardStats();
            
            return docRef;
        } catch (error) {
            console.error('Error adding property to Firestore:', error);
            throw error;
        }
    }

    async loadProperties() {
        try {
            const propertiesRef = collection(this.db, 'users', this.user.uid, 'properties');
            const querySnapshot = await getDocs(propertiesRef);
            
            this.properties = [];
            querySnapshot.forEach((doc) => {
                this.properties.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            this.renderProperties();
            this.updateDashboardStats();
        } catch (error) {
            console.error('Error loading properties:', error);
        }
    }

    renderProperties() {
        const propertiesGrid = document.getElementById('properties-grid');
        if (!propertiesGrid) return;

        if (this.properties.length === 0) {
            propertiesGrid.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-home text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">No properties added yet</p>
                    <button class="mt-4 text-blue-600 hover:text-blue-700 font-medium" onclick="ekhayaManager.showAddPropertyModal()">
                        Add your first property
                    </button>
                </div>
            `;
            return;
        }

        const propertiesHTML = this.properties.map(property => `
            <div class="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">${property.name}</h3>
                        <p class="text-sm text-gray-600 capitalize">${property.type}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button class="text-blue-600 hover:text-blue-700" onclick="ekhayaManager.editProperty('${property.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-700" onclick="ekhayaManager.deleteProperty('${property.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="space-y-2 text-sm text-gray-600">
                    <p><i class="fas fa-map-marker-alt w-4"></i> ${property.address}, ${property.city}</p>
                    ${property.bedrooms ? `<p><i class="fas fa-bed w-4"></i> ${property.bedrooms} bed${property.bedrooms !== 1 ? 's' : ''}</p>` : ''}
                    ${property.bathrooms ? `<p><i class="fas fa-bath w-4"></i> ${property.bathrooms} bath${property.bathrooms !== 1 ? 's' : ''}</p>` : ''}
                    ${property.size ? `<p><i class="fas fa-ruler-combined w-4"></i> ${property.size} sqm</p>` : ''}
                </div>
                
                ${property.currentValue ? `
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <p class="text-lg font-semibold text-green-600">R${property.currentValue.toLocaleString()}</p>
                        <p class="text-xs text-gray-500">Current Value</p>
                    </div>
                ` : ''}
            </div>
        `).join('');

        propertiesGrid.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${propertiesHTML}
            </div>
        `;
    }

    updateDashboardStats() {
        const totalProperties = this.properties.length;
        const totalValue = this.properties.reduce((sum, property) => sum + (property.currentValue || 0), 0);
        
        // Update DOM elements
        const totalPropertiesEl = document.getElementById('total-properties');
        const totalValueEl = document.getElementById('total-value');
        const maintenanceDueEl = document.getElementById('maintenance-due');
        const totalIssuesEl = document.getElementById('total-issues');

        if (totalPropertiesEl) totalPropertiesEl.textContent = totalProperties;
        if (totalValueEl) totalValueEl.textContent = `R${totalValue.toLocaleString()}`;
        if (maintenanceDueEl) maintenanceDueEl.textContent = '0'; // TODO: Implement maintenance tracking
        if (totalIssuesEl) totalIssuesEl.textContent = '0'; // TODO: Implement issue tracking
    }

    async deleteProperty(propertyId) {
        if (!confirm('Are you sure you want to delete this property?')) {
            return;
        }

        try {
            const propertyRef = doc(this.db, 'users', this.user.uid, 'properties', propertyId);
            await deleteDoc(propertyRef);
            
            // Remove from local array
            this.properties = this.properties.filter(p => p.id !== propertyId);
            
            this.renderProperties();
            this.updateDashboardStats();
            this.showSuccessMessage('Property deleted successfully!');
        } catch (error) {
            console.error('Error deleting property:', error);
            this.showErrorMessage('Failed to delete property. Please try again.');
        }
    }

    editProperty(propertyId) {
        // TODO: Implement property editing
        console.log('Edit property:', propertyId);
        this.showInfoMessage('Property editing feature coming soon!');
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showInfoMessage(message) {
        this.showMessage(message, 'info');
    }

    showMessage(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }
}

// Initialize eKhaya manager
const ekhayaManager = new EkhayaManager();

// Make it globally available for onclick handlers
window.ekhayaManager = ekhayaManager;

export default ekhayaManager;
