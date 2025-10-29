import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GuestContext from '../contexts/GuestContext';
import { MapPin, Cpu } from 'lucide-react';
import Dexie from 'dexie';
import ProfileVerification from '../components/ProfileVerification';
import InternationalAddressForm from '../components/InternationalAddressForm';
import { auth } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { upsertLifeCVProfile } from '../utils/firebaseProfile';
import { toLifeCV, fromLifeCV, parseResumeJson } from '../utils/lifecvAdapter';

// --- START OF OFFLINE ARCHITECTURE IMPLEMENTATION ---

// 1. Dexie DB Definition
// Establishes the local database schema for offline storage.
const db = new Dexie('LifeSyncDB');
db.version(1).stores({
  settings: '++id, &key, value', // To store app settings like the device tier
  actions_outbox: '++id, type, payload, timestamp, status', // For deferred actions
  content_bundles: '++id, &bundleId, version, data',
  users: '++id, &userId, profile',
  peers: '++id, &peerId, lastSeen',
  messages: '++id, &messageId, sender, payload, timestamp, status',
});

// 2. DeviceContext and Provider
// This context provides information about the device's capabilities and the selected performance tier.
const DeviceContext = createContext();

const TIERS = {
  LITE: {
    name: 'Lite',
    description: 'Core features, offline guides. Minimal storage & battery use. Ideal for low-spec devices.',
    storageThreshold: 300, // MB
  },
  INTERMEDIATE: {
    name: 'Intermediate',
    description: 'Full offline data, P2P sharing. Recommended for most devices.',
    storageThreshold: 1500, // MB
  },
  FULL: {
    name: 'Full',
    description: 'All features, richer media, background services. For high-end devices.',
    storageThreshold: Infinity,
  },
};

const DeviceProvider = ({ children }) => {
  const [tier, setTier] = useState(TIERS.INTERMEDIATE.name);
  const [recommendedTier, setRecommendedTier] = useState(TIERS.INTERMEDIATE.name);
  const [capabilities, setCapabilities] = useState({ storage: 0, ram: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectCapabilities = async () => {
      let detectedTier = TIERS.INTERMEDIATE.name;
      try {
        let storage = 0;
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          const estimate = await navigator.storage.estimate();
          storage = Math.round((estimate.quota || 0) / (1024 * 1024));
        }

        const ram = navigator.deviceMemory || 1;
        setCapabilities({ storage, ram });

        if (storage < TIERS.LITE.storageThreshold || ram < 1) {
          detectedTier = TIERS.LITE.name;
        } else if (storage < TIERS.INTERMEDIATE.storageThreshold || ram < 2) {
          detectedTier = TIERS.INTERMEDIATE.name;
        } else {
          detectedTier = TIERS.FULL.name;
        }

        setRecommendedTier(detectedTier);
        
        const savedTier = await db.settings.get({ key: 'deviceTier' });
        setTier(savedTier ? savedTier.value : detectedTier);

      } catch (error) {
        console.error("Capability detection failed:", error);
        setRecommendedTier(TIERS.INTERMEDIATE.name);
        setTier(TIERS.INTERMEDIATE.name);
      } finally {
        setLoading(false);
      }
    };

    detectCapabilities();
  }, []);

  const selectTier = async (selectedTier) => {
    setTier(selectedTier);
    await db.settings.put({ key: 'deviceTier', value: selectedTier });
  };

  return (
    <DeviceContext.Provider value={{ tier, selectTier, recommendedTier, capabilities, loading }}>
      {children}
    </DeviceContext.Provider>
  );
};

// 3. Tier Selection UI Component
const TierSelector = () => {
    const { tier, selectTier, recommendedTier, capabilities, loading } = useContext(DeviceContext);

    if (loading) {
        return (
            <div className="text-center p-4">
                <p>Analyzing device capabilities...</p>
            </div>
        );
    }

    return (
        <fieldset className="border p-4 rounded-lg mb-6">
            <legend className="font-semibold px-2 flex items-center"><Cpu className="mr-2" /> Device Performance Tier</legend>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                <p>We've analyzed your device to recommend a setting that balances features and performance.</p>
        <p className="mt-1 opacity-80">Detected: Storage ~ {capabilities.storage} GB, Memory ~ {capabilities.ram} GB</p>
                <p className="mt-2">
                    <span className="font-semibold">Recommendation:</span> <span className="font-bold text-primary-600">{recommendedTier}</span>
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.values(TIERS).map(tierInfo => (
                    <div
                        key={tierInfo.name}
                        onClick={() => selectTier(tierInfo.name)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${tier === tierInfo.name ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 shadow-lg' : 'dark:border-gray-700 hover:border-gray-400'}`}
                    >
                        <h3 className="font-bold text-lg">{tierInfo.name} {tierInfo.name === recommendedTier && <span className="text-xs font-normal text-primary-600">(Recommended)</span>}</h3>
                        <p className="text-sm mt-1">{tierInfo.description}</p>
                    </div>
                ))}
            </div>
        </fieldset>
    );
};

// --- END OF OFFLINE ARCHITECTURE IMPLEMENTATION ---


const OnboardingContent = () => {
  const { guestData, updateGuestData, setGuestData } = useContext(GuestContext);
  const { tier } = useContext(DeviceContext);
  const navigate = useNavigate();

  const initialProfileState = {
    firstName: '',
    lastName: '',
    images: [], // Array of file objects or data URLs
    optionalNameFields: [], // { id: 'middleName', value: '' }
    phones: [{ id: 1, number: '', label: 'Mobile' }],
    emails: [{ id: 1, address: '', label: 'Personal' }],
    dates: [],
    work: { title: '', department: '', company: '' },
    relations: [],
    websites: [],
    notes: '',
    customFields: [],
    consentGPS: false,
    gpsCoordinates: null, // { lat, lng, accuracy }
    mode: guestData?.profile?.mode || 'guest',
    deviceType: guestData?.profile?.deviceType || guestData?.deviceType || null,
    providerRegistration: {
      providerType: 'Individual',
      businessName: '',
      fullName: '',
      contactNumber: '',
      email: '',
      servicesOffered: [],
      coverageAreas: [], // { province, cityTown, areaNotes, lat, lng }
      pricing: { base: '', perKm: '', express: '' },
      autoUpgrade: true
    }
  };

  const [profile, setProfile] = useState({
    ...initialProfileState,
    ...(guestData?.profile || {}),
    deviceType: guestData?.profile?.deviceType || guestData?.deviceType || initialProfileState.deviceType,
    providerRegistration: {
      ...initialProfileState.providerRegistration,
      ...(guestData?.profile?.providerRegistration || {}),
    },
  });
  const [servicesRegistered, setServicesRegistered] = useState(guestData?.servicesRegistered || ['ride-sharing']);
  const [role, setRole] = useState(guestData?.role || 'Generic User');
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [gpsSupported, setGpsSupported] = useState(false);
  const [showProfileVerification, setShowProfileVerification] = useState(false);
  const [locError, setLocError] = useState('');

  useEffect(() => {
    setGpsSupported('geolocation' in navigator);
  }, []);

  // Request GPS coordinates when consent is given
  useEffect(() => {
    if (profile.consentGPS && gpsSupported) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          };
          setProfile(p => ({ ...p, gpsCoordinates: coords }));
          setLocError('');
        },
        (err) => {
          console.error('GPS error:', err);
          setLocError('Unable to get GPS location. You can continue, but some features will be limited.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [profile.consentGPS, gpsSupported]);

  // (Removed unused image dropzone and helpers)
  // --- Quick VCF import ---
  const handleVcfUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    // Very lightweight VCF parsing (NAME, EMAIL, TEL)
    const nameMatch = text.match(/FN:(.*)/);
    const emailMatch = text.match(/EMAIL[^:]*:(.*)/);
    const phoneMatch = text.match(/TEL[^:]*:(.*)/);
    const fullName = nameMatch?.[1]?.trim();
    const email = emailMatch?.[1]?.trim();
    const phone = phoneMatch?.[1]?.trim();
    setProfile(p => ({
      ...p,
      firstName: fullName ? fullName.split(' ')[0] : p.firstName,
      lastName: fullName ? fullName.split(' ').slice(1).join(' ') : p.lastName,
      emails: email ? [{ id: 1, address: email, label: 'Personal' }] : p.emails,
      phones: phone ? [{ id: 1, number: phone, label: 'Mobile' }] : p.phones,
    }));
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      if (!auth) {
        throw new Error('Firebase auth not initialized');
      }

      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const res = await signInWithPopup(auth, provider);
      if (!res?.user) {
        throw new Error('No user returned from Google sign-in');
      }
      
      const user = res.user;
      setProfile(p => ({
        ...p,
        firstName: user.displayName ? user.displayName.split(' ')[0] : p.firstName,
        lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : p.lastName,
        providerRegistration: { ...p.providerRegistration, email: user.email || p.providerRegistration.email },
        images: user.photoURL ? [user.photoURL] : p.images,
      }));
      setGuestData(prev => ({ ...prev, owner: { uid: user.uid, source: 'lifesync' } }));
      // Persist minimal LifeCV profile to Firestore
      const lifecv = toLifeCV({ ...profile, owner: { uid: user.uid, source: 'lifesync' }, role, servicesRegistered });
      await upsertLifeCVProfile(user.uid, lifecv);
    } catch (err) {
      console.error('Google sign-in failed', err);
      // Don't throw - let user continue with manual entry
    }
  }, [profile, role, servicesRegistered]);

  // --- Delivery Provider: Services & Coverage helpers ---
  const toggleService = (service) => {
    setProfile(p => {
      const current = p.providerRegistration.servicesOffered;
      const next = current.includes(service)
        ? current.filter(s => s !== service)
        : [...current, service];
      return { ...p, providerRegistration: { ...p.providerRegistration, servicesOffered: next } };
    });
  };



  const saveAndContinue = async () => {
    console.log("Selected Tier:", tier);
    console.log("Saving profile:", profile);
    
    try {
        // Build normalized profile to satisfy downstream requirements
        const primaryEmail = profile.emails?.find(e => (e.address || '').trim())?.address || profile.providerRegistration.email;
        const primaryPhone = profile.phones?.find(pn => (pn.number || '').trim())?.number || profile.providerRegistration.contactNumber;
        const fullName = (profile.firstName && profile.lastName)
          ? `${profile.firstName} ${profile.lastName}`.trim()
          : (profile.providerRegistration.fullName || '').trim();

        const normalizedProfile = {
          ...profile,
          fullName,
          email: primaryEmail || '',
          phone: primaryPhone || '',
        };

        // Persist profile data to local DB for offline access
        await db.users.put({ userId: 'guest', profile: normalizedProfile, servicesRegistered, role });
        console.log("Profile saved to IndexedDB");
        // If authenticated, upsert LifeCV profile to Firestore
        const uid = auth?.currentUser?.uid || guestData?.owner?.uid;
        if (uid) {
          const lifecv = toLifeCV({ ...normalizedProfile, owner: { uid, source: 'lifesync' }, geofences: guestData.geofences, checkIns: guestData.checkIns, role, servicesRegistered, deviceType: profile.deviceType });
          await upsertLifeCVProfile(uid, lifecv);
        }
    } catch (error) {
        console.error("Failed to save profile to IndexedDB", error);
        // Handle error, maybe show a notification to the user
    }

    setGuestData(prev => ({
      ...prev,
      profile: {
      ...profile,
      fullName: (profile.firstName && profile.lastName)
        ? `${profile.firstName} ${profile.lastName}`.trim()
        : (profile.providerRegistration.fullName || '').trim(),
      email: profile.emails?.find(e => (e.address || '').trim())?.address || profile.providerRegistration.email || '',
      phone: profile.phones?.find(pn => (pn.number || '').trim())?.number || profile.providerRegistration.contactNumber || ''
    },
      servicesRegistered,
      role,
      deviceType: profile.deviceType
    }));

    // Show profile verification step before completing
    setShowProfileVerification(true);
  };

  const canContinue = () => {
      // Minimal check aligned with RequireProfile: name + (email or phone)
      // GPS consent is optional but required for safety features
      const fullName = (profile.firstName && profile.lastName) || (profile.providerRegistration.fullName && profile.providerRegistration.fullName.trim());
      const hasContact = (profile.emails?.some(e => (e.address || '').trim())) || (profile.phones?.some(pn => (pn.number || '').trim())) || (!!(profile.providerRegistration.email || '').trim()) || (!!(profile.providerRegistration.contactNumber || '').trim());
      // Allow continuing even without GPS consent - just show warning
      return !!fullName && !!hasContact;
  }

  if (showProfileVerification) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <ProfileVerification
          onVerificationComplete={() => navigate('/')}
          className="mb-8"
        />
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Skip for Now & Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-8">
        <h1 className="text-3xl font-bold mb-4">Create Your Profile</h1>
        
        <TierSelector />

        {/* Quick Sync: role and accelerators */}
        <fieldset className="border p-4 rounded-lg mb-6">
          <legend className="font-semibold px-2">Quick Sync Setup</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm mb-1">Your role</label>
              <select className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600" value={role} onChange={(e)=>setRole(e.target.value)}>
                <option>Generic User</option>
                <option>Parent/Guardian</option>
                <option>Driver</option>
                <option>Passenger</option>
                <option>Service Provider</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Upload contact card (.vcf)</label>
              <input type="file" accept=".vcf,text/vcard" onChange={handleVcfUpload} />
            </div>
            <div>
              <label className="block text-sm mb-1">Google Sign-In</label>
              <button type="button" onClick={handleGoogleSignIn} className="px-3 py-2 rounded bg-red-600 text-white">Sign in with Google</button>
            </div>
          </div>
        </fieldset>

        {/* Emergency & Delivery Services Section */}
        <fieldset className="border p-4 rounded-lg mb-6">
          <legend className="font-semibold px-2">Safe Delivery & Emergency Services</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <button className="btn btn-outline">Request Delivery</button>
            <button className="btn btn-outline">Track Delivery</button>
            <button className="btn btn-outline">My Deliveries</button>
            <button className="btn btn-outline">Verified Providers</button>
            <button className="btn btn-outline">Emergency</button>
          </div>
        </fieldset>

        {/* Service Modules Registration */}
        <fieldset className="border p-4 rounded-lg mb-6">
          <legend className="font-semibold px-2">Register for Services</legend>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[ 'Ride Sharing', 'Delivery', 'Home Services', 'Property', 'Event Safety', 'Follow-me Home', 'Event hosting' ].map(svc => (
              <label key={svc} className="inline-flex items-center gap-2">
                <input type="checkbox" checked={servicesRegistered.includes(svc.toLowerCase().replace(' ', '-'))} onChange={()=> {
                    const serviceId = svc.toLowerCase().replace(' ', '-');
                    setServicesRegistered(prev => prev.includes(serviceId) ? prev.filter(v=>v!==serviceId) : [...prev, serviceId])
                }} /> {svc}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Become a Delivery Service Provider */}
        <fieldset className="border p-4 rounded-lg mb-6">
          <legend className="font-semibold px-2">Become a Delivery Service Provider</legend>
          <p className="mb-2">Join our trusted network of delivery providers. Complete your registration and trust verification to start serving customers.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <select
              className="p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
              value={profile.providerRegistration.providerType}
              onChange={(e) => setProfile(p => ({ ...p, providerRegistration: { ...p.providerRegistration, providerType: e.target.value } }))}
            >
              <option value="Individual">Individual</option>
              <option value="Business">Business</option>
              <option value="Organization">Organization</option>
            </select>
            <input
              className="p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
              placeholder="Business Name (if applicable)"
              value={profile.providerRegistration.businessName}
              onChange={(e) => setProfile(p => ({ ...p, providerRegistration: { ...p.providerRegistration, businessName: e.target.value } }))}
            />
            <input
              className="p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
              placeholder="Full Name"
              value={profile.providerRegistration.fullName}
              onChange={(e) => setProfile(p => ({ ...p, providerRegistration: { ...p.providerRegistration, fullName: e.target.value } }))}
            />
            <input
              className="p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
              placeholder="Contact Number"
              value={profile.providerRegistration.contactNumber}
              onChange={(e) => setProfile(p => ({ ...p, providerRegistration: { ...p.providerRegistration, contactNumber: e.target.value } }))}
            />
            <input
              className="p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
              placeholder="Email Address"
              value={profile.providerRegistration.email}
              onChange={(e) => setProfile(p => ({ ...p, providerRegistration: { ...p.providerRegistration, email: e.target.value } }))}
            />
          </div>
          <div className="mb-2 font-semibold">Services Offered</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {[ 'Ride Sharing','Food Delivery','Package Delivery','Document Delivery','Groceries','Electronics','Clothing','Same-day Delivery','Express Delivery','Event hosting','Other' ].map(s => (
              <label key={s} className="inline-flex items-center gap-2">
                <input type="checkbox" checked={profile.providerRegistration.servicesOffered.includes(s)} onChange={() => toggleService(s)} /> {s}
              </label>
            ))}
          </div>
          <div className="mb-2 font-semibold">Coverage Areas</div>
          <InternationalAddressForm
            onAddressSubmit={(addressData) => {
              const newArea = {
                id: Date.now().toString(),
                ...addressData,
                areaNotes: addressData.areaNotes || '',
                lat: addressData.lat || null,
                lng: addressData.lng || null
              };
              setProfile(p => ({
                ...p,
                providerRegistration: {
                  ...p.providerRegistration,
                  coverageAreas: [...p.providerRegistration.coverageAreas, newArea]
                }
              }));
            }}
            submitButtonText="Add Coverage Area"
            title=""
          />
          {profile.providerRegistration.coverageAreas.length > 0 && (
            <div className="mt-3">
              <div className="text-sm font-medium mb-2">Added Coverage Areas</div>
              <div className="flex flex-wrap gap-2">
                {profile.providerRegistration.coverageAreas.map(a => (
                  <span key={a.id} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {a.country} • {a.city}{a.areaNotes ? ` • ${a.areaNotes}` : ''}{(a.lat && a.lng) ? ` • (${a.lat.toFixed ? a.lat.toFixed(4) : a.lat}, ${a.lng.toFixed ? a.lng.toFixed(4) : a.lng})` : ''}
                    <button type="button" className="ml-1 text-red-600" onClick={() => removeCoverageArea(a.id)} title="Remove">×</button>
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              className="p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
              placeholder="Base Delivery Fee (R)"
              value={profile.providerRegistration.pricing.base}
              onChange={(e) => setProfile(p => ({ ...p, providerRegistration: { ...p.providerRegistration, pricing: { ...p.providerRegistration.pricing, base: e.target.value } } }))}
            />
            <input
              className="p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
              placeholder="Per Km Rate (R)"
              value={profile.providerRegistration.pricing.perKm}
              onChange={(e) => setProfile(p => ({ ...p, providerRegistration: { ...p.providerRegistration, pricing: { ...p.providerRegistration.pricing, perKm: e.target.value } } }))}
            />
            <input
              className="p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
              placeholder="Express Surcharge (R)"
              value={profile.providerRegistration.pricing.express}
              onChange={(e) => setProfile(p => ({ ...p, providerRegistration: { ...p.providerRegistration, pricing: { ...p.providerRegistration.pricing, express: e.target.value } } }))}
            />
          </div>
          <div className="mb-2 font-semibold">Trust Verification Setup</div>
          <div className="mb-2">Initial Trust Level: <b>Individual (0% - Start with personal verification)</b></div>
          <ul className="list-disc pl-6 text-sm mb-2">
            <li>Individual (0%): Basic ID and contact verification</li>
            <li>Household (25%): Family member endorsements + 10 completed deliveries</li>
            <li>Street (50%): 5+ neighbor verifications + 50 deliveries + 4.5+ rating</li>
            <li>Community (75%): Local business endorsements + 200 deliveries + 4.7+ rating</li>
            <li>Fully Verified (100%): Ecosystem integration + 500 deliveries + 4.8+ rating</li>
          </ul>
        </fieldset>

        {/* Data Portability: Import/Export */}
        <fieldset className="border p-4 rounded-lg mb-6">
          <legend className="font-semibold px-2">LifeCV Import / Export</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-2 font-medium">Export LifeCV JSON</div>
              <button type="button" className="px-3 py-2 rounded bg-gray-700 text-white" onClick={() => {
                const lifecv = toLifeCV({ ...profile, servicesRegistered, role, owner: guestData.owner });
                const blob = new Blob([JSON.stringify(lifecv, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'lifecv-profile.json'; a.click(); URL.revokeObjectURL(url);
              }}>Download JSON</button>
            </div>
            <div>
              <div className="mb-2 font-medium">Import from JSON file</div>
              <input type="file" accept="application/json,.json" onChange={async (e)=>{
                const file = e.target.files?.[0]; if (!file) return;
                try {
                  const text = await file.text();
                  const lifecv = JSON.parse(text);
                  const local = fromLifeCV(lifecv);
                  setProfile(p => ({ ...p, ...local }));
                } catch(err){ console.error(err); }
              }} />
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-2 font-medium">Paste resume JSON (from AI assistant)</div>
            <textarea className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600" rows={6} value={importText} onChange={(e)=> setImportText(e.target.value)} placeholder='Paste JSON here...' />
            {importError && <div className="text-sm text-red-600 mt-1">{importError}</div>}
            <div className="mt-2 flex gap-2">
              <button type="button" className="px-3 py-2 rounded bg-primary-600 text-white" onClick={()=>{
                try {
                  const partial = parseResumeJson(importText);
                  if (partial.basic?.fullName) {
                    const parts = partial.basic.fullName.split(' ');
                    setProfile(p=> ({
                      ...p,
                      firstName: parts[0] || p.firstName,
                      lastName: parts.slice(1).join(' ') || p.lastName,
                      providerRegistration: { ...p.providerRegistration, email: partial.basic.email || p.providerRegistration.email, contactNumber: partial.basic.phone || p.providerRegistration.contactNumber }
                    }));
                  }
                  setImportError('');
                } catch (e) { setImportError('Invalid JSON. Please verify.'); }
              }}>Apply</button>
              <button type="button" className="px-3 py-2 rounded border dark:border-gray-600" onClick={()=> setImportText('')}>Clear</button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Tip: Copy your CV text and ask an AI assistant to convert it into a structured JSON suitable for LifeCV upload.</p>
          </div>
        </fieldset>
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary-600 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium">Location consent</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">We need your GPS to enable Follow Me Home, Incident Reporting, and Emergency Assistance.</div>
            <div className="flex items-center gap-3 mt-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={profile.consentGPS} onChange={(e) => setProfile(p => ({ ...p, consentGPS: e.target.checked }))} />
                I agree to share my location while using safety features
              </label>
            </div>
            {locError && (
              <div className="mt-2 text-sm text-red-600">{locError}</div>
            )}
            {profile.gpsCoordinates && (
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                GPS: {profile.gpsCoordinates.lat?.toFixed ? profile.gpsCoordinates.lat.toFixed(5) : profile.gpsCoordinates.lat}, {profile.gpsCoordinates.lng?.toFixed ? profile.gpsCoordinates.lng.toFixed(5) : profile.gpsCoordinates.lng} (±{Math.round(profile.gpsCoordinates.accuracy)}m)
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <button onClick={() => navigate('/')} className="px-6 py-2 rounded-lg border dark:border-gray-600">Cancel</button>
        <button
          disabled={!canContinue()}
          onClick={saveAndContinue}
          className={`px-6 py-2 rounded-lg bg-primary-600 text-white font-semibold ${!canContinue() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-700'}`}
        >
          Save and Continue
        </button>      </div>
    </div>
  );
};

const Onboarding = () => {
    return (
        <DeviceProvider>
            <OnboardingContent />
        </DeviceProvider>
    );
};

export default Onboarding;
