import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Users,
  MapPin,
  Clock,
  Shield,
  Star,
  CheckCircle,
  AlertTriangle,
  Navigation,
  Phone,
  MessageSquare,
  UserCheck,
  Route,
  Lock,
  Plus,
  Search,
  Calendar,
  Satellite,
  Signal,
  Battery,
  ExternalLink,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const RideSharing = () => {
  const [activeTab, setActiveTab] = useState('find-ride');
  const [userLocation, setUserLocation] = useState(null);
  const [selectedRide, setSelectedRide] = useState(null);
  const [activeRide, setActiveRide] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lifesync_active_ride')||'null'); } catch { return null; }
  });
  const [showSyncSetup, setShowSyncSetup] = useState(false);
  const [syncConfig, setSyncConfig] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lifesync_ride_sync_config')||'null'); } catch { return null; }
  });
  const [groupMembers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lifesync_ride_group_members')||'[]'); } catch { return []; }
  });
  const [feedbackReports, setFeedbackReports] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lifesync_feedback_reports')||'[]'); } catch { return []; }
  });
  const [escalationStatus, setEscalationStatus] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lifesync_escalation_status')||'{"stage":"idle","lastNotifiedAt":null}'); } catch { return { stage: 'idle', lastNotifiedAt: null }; }
  });
  const [lastMovementAt, setLastMovementAt] = useState(Date.now());
  const [remindersSent, setRemindersSent] = useState(0);
  const [proximityAlerts, setProximityAlerts] = useState([]);
  const [speedLog, setSpeedLog] = useState([]);
  const [connectivityStatus, setConnectivityStatus] = useState('idle'); // idle | connecting | connected | error
  const [isStartingTrip, setIsStartingTrip] = useState(false);
  const [personalSync, setPersonalSync] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem('lifesync_personal_sync')) || {
          enabled: false,
          serviceType: 'none', // none | professional | pigeeback
          vehicleType: 'sedan',
          capacity: 5,
          seats: [],
          additionalPassengers: 0,
          mySeatId: null,
          speedMonitoring: { enabled: false, share: false, intervalSec: 60, saveLog: true },
          seatsGrid: [],
          conduct: { reckless: false, fatigueObserved: false, notes: '' }
        }
      );
    } catch {
      return {
        enabled: false,
        serviceType: 'none',
        vehicleType: 'sedan',
        capacity: 5,
        seats: [],
        additionalPassengers: 0,
        mySeatId: null,
        speedMonitoring: { enabled: false, share: false, intervalSec: 60, saveLog: true },
        seatsGrid: [],
        conduct: { reckless: false, fatigueObserved: false, notes: '' }
      };
    }
  });
  const geoWatchIdRef = useRef(null);
  const stopCheckTimerRef = useRef(null);
  const proximityTimerRef = useRef(null);
  const prevLocRef = useRef(null);
  const speedSampleTimerRef = useRef(null);
  const connectivityTimers = useRef({ p2p: null, internet: null });
  // Initialize i18n (no direct use of t in this component yet)
  useTranslation();

  // Mock data for available rides
  const [availableRides] = useState([
    {
      id: 1,
      driver: {
        name: 'Thabo Mthembu',
        rating: 4.8,
        profileImage: '/api/placeholder/40/40',
        verified: true,
        safetyScore: 95,
        completedRides: 342,
        emergencyContacts: ['+27123456789', '+27876543210']
      },
      vehicle: {
        make: 'Toyota',
        model: 'Corolla',
        year: 2020,
        color: 'Silver',
        licensePlate: 'CA 123-456',
        seats: 4,
        lifesyncSeal: true,
        professionalUse: false
      },
      route: {
        from: 'Sandton City Mall',
        to: 'OR Tambo International Airport',
        distance: '28 km',
        duration: '35 min',
        departureTime: '2025-09-04T15:30:00Z',
        waypoints: ['Midrand', 'Kempton Park']
      },
      pricing: {
        total: 180,
        perSeat: 45,
        currency: 'ZAR'
      },
      availableSeats: 3,
      safetyFeatures: [
        'GPS Tracking',
        'Emergency Button',
        'Identity Verified',
        'Insurance Covered',
        'Group Sync',
        'Proximity Alerts',
        'Auto-Escalation'
      ],
      preferences: ['No Smoking', 'Music OK', 'Conversation Welcome'],
      syncSettings: {
        groupSync: true,
        emergencyContactAccess: 'basic',
        locationSharing: 'trip-duration',
        dataRetention: 'trip-only',
        syncMethod: 'bluetooth+wifi'
      },
      passengerAgreements: {
        termsAccepted: false,
        dataShared: 'minimum'
      }
    },
    {
      id: 2,
      driver: {
        name: 'Sarah Johnson',
        rating: 4.9,
        profileImage: '/api/placeholder/40/40',
        verified: true,
        safetyScore: 98,
        completedRides: 567
      },
      vehicle: {
        make: 'Honda',
        model: 'Civic',
        year: 2019,
        color: 'Blue',
        licensePlate: 'GP 789-012',
        seats: 4
      },
      route: {
        from: 'Rosebank',
        to: 'Pretoria CBD',
        distance: '65 km',
        duration: '1h 15min',
        departureTime: '2025-09-04T16:00:00Z'
      },
      pricing: {
        total: 320,
        perSeat: 80,
        currency: 'ZAR'
      },
      availableSeats: 2,
      safetyFeatures: ['GPS Tracking', 'Emergency Button', 'Identity Verified', 'Insurance Covered'],
      preferences: ['No Smoking', 'Quiet Ride', 'Professional']
    }
  ]);

  // Mock data for user's rides
  const [userRides] = useState([
    {
      id: 'ride-001',
      status: 'upcoming',
      driver: 'Thabo Mthembu',
      from: 'Home',
      to: 'University of Witwatersrand',
      departureTime: '2025-09-05T07:30:00Z',
      price: 35,
      passengerCount: 1
    },
    {
      id: 'ride-002',
      status: 'completed',
      driver: 'Maria Santos',
      from: 'Mall of Africa',
      to: 'Home',
      departureTime: '2025-09-03T18:45:00Z',
      price: 42,
      rating: 5,
      passengerCount: 1
    }
  ]);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Persist sync config and group members
  useEffect(() => {
    if (syncConfig) localStorage.setItem('lifesync_ride_sync_config', JSON.stringify(syncConfig));
  }, [syncConfig]);
  useEffect(() => {
    localStorage.setItem('lifesync_ride_group_members', JSON.stringify(groupMembers));
  }, [groupMembers]);
  useEffect(() => {
    localStorage.setItem('lifesync_feedback_reports', JSON.stringify(feedbackReports));
  }, [feedbackReports]);
  useEffect(() => {
    localStorage.setItem('lifesync_escalation_status', JSON.stringify(escalationStatus));
  }, [escalationStatus]);
  useEffect(() => {
    localStorage.setItem('lifesync_personal_sync', JSON.stringify(personalSync));
  }, [personalSync]);

  // Helpers
  const haversine = (a, b) => {
    if (!a || !b) return Infinity;
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371000; // meters
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const c = 2 * Math.asin(Math.sqrt(sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon));
    return R * c;
  };

  const startTracking = (config) => {
    // Geolocation watch
    if (navigator.geolocation && !geoWatchIdRef.current) {
      geoWatchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy };
          // Update movement timestamp if moved > 15m
          if (!userLocation || haversine(userLocation, loc) > 15) {
            setLastMovementAt(Date.now());
          }
          setUserLocation(loc);
          // Speed estimation & logging (if personal speed monitoring enabled)
          if (personalSync?.speedMonitoring?.enabled) {
            const now = Date.now();
            if (prevLocRef.current) {
              const dtSec = (now - prevLocRef.current.t) / 1000;
              const dM = haversine(prevLocRef.current.loc, loc);
              const mps = dtSec > 0 ? dM / dtSec : 0;
              const kmh = Math.round((mps * 3.6) * 10) / 10;
              const entry = { t: new Date(now).toISOString(), lat: loc.lat, lng: loc.lng, kmh };
              if (personalSync.speedMonitoring.saveLog) {
                setSpeedLog((log) => [...log.slice(-199), entry]);
              }
            }
            prevLocRef.current = { loc, t: now };
          }
        },
        (err) => console.error('Location tracking error:', err),
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
    }
    // Stop detection timer
    if (!stopCheckTimerRef.current) {
      stopCheckTimerRef.current = setInterval(() => {
        const minsStopped = (Date.now() - lastMovementAt) / 60000;
        const threshold = (config?.stopThresholdMin ?? 10);
        if (minsStopped >= threshold && remindersSent < 2) {
          setRemindersSent((r) => r + 1);
          setEscalationStatus({ stage: `reminder-${remindersSent + 1}`, lastNotifiedAt: new Date().toISOString() });
        } else if (minsStopped >= threshold + 5 && remindersSent >= 2 && escalationStatus.stage !== 'escalated') {
          // Escalate to emergency contacts
          setEscalationStatus({ stage: 'escalated', lastNotifiedAt: new Date().toISOString() });
          console.log('Escalating to emergency contacts due to inactivity');
        }
      }, 60000);
    }
    // Proximity timer (only relevant for group full-sync)
    if (!proximityTimerRef.current) {
      proximityTimerRef.current = setInterval(() => {
        if (config?.groupMode === 'full' && userLocation && groupMembers?.length > 0) {
          const thresholdM = config?.proximityThresholdM ?? 100;
          const alerts = [];
          groupMembers.forEach((m) => {
            if (m.location) {
              const d = haversine(userLocation, m.location);
              if (d > thresholdM) alerts.push({ memberId: m.id, name: m.name, distance: Math.round(d) });
            }
          });
          setProximityAlerts(alerts);
        } else {
          setProximityAlerts([]);
        }
      }, 60000);
    }

    // Timer-based speed sample aggregator
    if (personalSync?.speedMonitoring?.enabled && !speedSampleTimerRef.current) {
      const intervalMs = Math.max(10000, (personalSync.speedMonitoring.intervalSec || 60) * 1000);
      speedSampleTimerRef.current = setInterval(() => {
        const now = Date.now();
        if (prevLocRef.current && userLocation) {
          const dtSec = (now - prevLocRef.current.t) / 1000;
          const dM = haversine(prevLocRef.current.loc, userLocation);
          const mps = dtSec > 0 ? dM / dtSec : 0;
          const kmh = Math.round((mps * 3.6) * 10) / 10;
          const entry = { t: new Date(now).toISOString(), lat: userLocation.lat, lng: userLocation.lng, kmh, aggregated: true };
          if (personalSync.speedMonitoring.saveLog) {
            setSpeedLog((log) => [...log.slice(-199), entry]);
          }
        }
      }, intervalMs);
    }
  };

  const stopTracking = () => {
    if (geoWatchIdRef.current && navigator.geolocation) {
      navigator.geolocation.clearWatch(geoWatchIdRef.current);
      geoWatchIdRef.current = null;
    }
    if (stopCheckTimerRef.current) {
      clearInterval(stopCheckTimerRef.current);
      stopCheckTimerRef.current = null;
    }
    if (proximityTimerRef.current) {
      clearInterval(proximityTimerRef.current);
      proximityTimerRef.current = null;
    }
    if (speedSampleTimerRef.current) {
      clearInterval(speedSampleTimerRef.current);
      speedSampleTimerRef.current = null;
    }
  };

  useEffect(() => () => stopTracking(), []);

  // Note: booking/start flow reserved for future wiring; currently using sync setup/start

  const handleEmergencyAlert = () => {
    // Enhanced emergency protocols
    const emergencyData = {
      rideId: activeRide?.id,
      location: userLocation,
      timestamp: new Date().toISOString(),
      contacts: activeRide?.driver.emergencyContacts,
      status: 'alert-initiated'
    };
    
    // Send to emergency contacts
    console.log('Emergency alert:', emergencyData);
    
    // Start escalation protocol
    setTimeout(() => {
      if (!confirm('Are you safe? Emergency will escalate in 30 seconds')) {
        console.log('Escalating to secondary contacts...');
        // Add actual escalation logic here
      }
    }, 30000);
  };

  const handleGroupSync = (ride) => {
    // Implement group sync functionality
    const syncData = {
      rideId: ride.id,
      participants: ride.passengers,
      syncLevel: ride.syncSettings.groupSync ? 'full' : 'driver-only',
      method: ride.syncSettings.syncMethod
    };
    console.log('Initiating group sync:', syncData);
  };

  const handleTripStart = (ride) => {
    setSelectedRide(ride);
    setShowSyncSetup(true);
  };

  const startTripWithConfig = (ride, config) => {
    setIsStartingTrip(true);
    setActiveRide(ride);
    localStorage.setItem('lifesync_active_ride', JSON.stringify(ride));
    setActiveTab('active-ride');
    setSyncConfig(config);
    setRemindersSent(0);
    setEscalationStatus({ stage: 'started', lastNotifiedAt: new Date().toISOString() });
    setLastMovementAt(Date.now());
    startTracking(config);
    // Start connectivity service according to preferences
    try { connectivityService.start(config); } catch (e) { console.warn('Connectivity start error', e); }
    setTimeout(() => setIsStartingTrip(false), 1000); // Simulate loading
  };

  const handleEndTrip = () => {
    // Handshake: confirm end
    const confirmSelf = confirm('End trip for you?');
    if (!confirmSelf) return;
    // In a full implementation we would wait for the other party
    stopTracking();
    try { connectivityService.stop(); } catch (e) { console.warn('Connectivity stop error', e); }
    setActiveRide(null);
    localStorage.setItem('lifesync_active_ride', null);
    setActiveTab('my-rides');
    setProximityAlerts([]);
    setEscalationStatus({ stage: 'completed', lastNotifiedAt: new Date().toISOString() });
    setSpeedLog([]);
  };

  const addEmergencyContact = (contact) => {
    setSyncConfig((cfg) => ({ ...cfg, contacts: [...(cfg?.contacts || []), contact] }));
  };

  const submitAnonymousFeedback = (reason) => {
    const report = { id: 'fb_' + Date.now(), reason, at: new Date().toISOString() };
    setFeedbackReports((prevReports) => {
      const next = [...prevReports, report];
      const base = Math.max(1, (groupMembers.length || 0) || (personalSync?.seats?.filter(s=>s.occupied).length || 1));
      const ratio = next.length / base;
      if (ratio >= 0.7) {
        setEscalationStatus({ stage: 'immediate-action', lastNotifiedAt: new Date().toISOString() });
      } else if (ratio >= 0.2) {
        setEscalationStatus({ stage: 'double-knock', lastNotifiedAt: new Date().toISOString() });
      }
      return next;
    });
  };

  const defaultSyncConfig = {
    role: 'passenger',
    shareLevel: 'minimum', // minimum | standard | full
    groupMode: 'driver-only', // driver-only | full
    stopThresholdMin: 10,
    proximityThresholdM: 100,
    feedbackThreshold: 0.5,
    contacts: [], // {name, phone, role}
    connectivity: {
      preferred: 'p2p', // p2p | internet
      p2p: { bluetooth: true, wifiDirect: true, intervalSec: 60 },
      internet: { enabled: true, intervalSec: 120 }
    }
  };

  // Connectivity service
  const connectivityService = {
    start(config) {
      this.stop(); // Clear any existing
      setConnectivityStatus('connecting');
      const conn = config?.connectivity || defaultSyncConfig.connectivity;
      const preferred = conn.preferred;
      const p2pInterval = conn.p2p?.intervalSec * 1000 || 60000;
      const internetInterval = conn.internet?.intervalSec * 1000 || 120000;

      if (preferred === 'p2p' && (conn.p2p?.bluetooth || conn.p2p?.wifiDirect)) {
        // Start P2P sync
        connectivityTimers.current.p2p = setInterval(() => {
          this.performP2PSync(config);
        }, p2pInterval);
        console.log('P2P connectivity started, interval:', p2pInterval / 1000, 's');
      } else if (preferred === 'internet' && conn.internet?.enabled) {
        // Start internet sync
        connectivityTimers.current.internet = setInterval(() => {
          this.performInternetSync(config);
        }, internetInterval);
        console.log('Internet connectivity started, interval:', internetInterval / 1000, 's');
      } else {
        console.warn('No valid connectivity mode configured');
        setConnectivityStatus('error');
      }
    },
    stop() {
      if (connectivityTimers.current.p2p) {
        clearInterval(connectivityTimers.current.p2p);
        connectivityTimers.current.p2p = null;
        console.log('P2P connectivity stopped');
      }
      if (connectivityTimers.current.internet) {
        clearInterval(connectivityTimers.current.internet);
        connectivityTimers.current.internet = null;
        console.log('Internet connectivity stopped');
      }
      setConnectivityStatus('idle');
    },
    performP2PSync(config) {
      // Simulate P2P sync: Bluetooth/WiFi Direct
      // In real impl: Use Web Bluetooth API or WebRTC for P2P
      console.log('Performing P2P sync:', { config, location: userLocation, groupMembers });
      // Simulate success/failure
      const success = Math.random() > 0.1; // 90% success
      if (success) {
        console.log('P2P sync successful');
        setConnectivityStatus('connected');
        // Update group members or proximity if needed
      } else {
        console.warn('P2P sync failed, falling back to internet if configured');
        setConnectivityStatus('error');
        // Optionally trigger internet sync
      }
    },
  performInternetSync() {
      // Internet sync to Pigeeback backend
      const payload = {
        rideId: activeRide?.id,
        location: userLocation,
        groupMembers,
        feedbackReports,
        timestamp: Date.now()
      };
  console.log('Performing internet sync to Pigeeback:', payload);
      // Simulate fetch
      fetch('https://pigeeback-lifecv.web.app/api/sync', { // Mock URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(response => {
        if (response.ok) {
          console.log('Internet sync successful');
          setConnectivityStatus('connected');
        } else {
          console.warn('Internet sync failed:', response.status);
          setConnectivityStatus('error');
        }
      }).catch(err => {
        console.warn('Internet sync error:', err);
        setConnectivityStatus('error');
      });
    }
  };

  // Vehicle seating templates
  const VEHICLE_TEMPLATES = {
    sedan: {
      capacity: 5,
      seats: [
        [{ id: 'D', label: 'Driver' }, { id: 'F', label: 'Front Passenger' }],
        [{ id: 'B1', label: 'Back Left' }, { id: 'B2', label: 'Back Middle' }, { id: 'B3', label: 'Back Right' }]
      ]
    },
    minibus16: {
      capacity: 16,
      seats: [
        [{ id: 'D', label: 'Driver' }, { id: 'F', label: 'Front Passenger' }],
        [{ id: 'R1L', label: 'Row1-L' }, { id: 'R1M', label: 'Row1-M' }, { id: 'R1R', label: 'Row1-R' }],
        [{ id: 'R2L', label: 'Row2-L' }, { id: 'R2M', label: 'Row2-M' }, { id: 'R2R', label: 'Row2-R' }],
        [{ id: 'R3L', label: 'Row3-L' }, { id: 'R3M', label: 'Row3-M' }, { id: 'R3R', label: 'Row3-R' }],
        [{ id: 'R4L', label: 'Row4-L' }, { id: 'R4M', label: 'Row4-M' }, { id: 'R4R', label: 'Row4-R' }]
      ]
    },
    bus: {
      capacity: 40,
      seats: Array.from({ length: 10 }, (_, r) => [
        { id: `R${r+1}A`, label: `R${r+1}-A` },
        { id: `R${r+1}B`, label: `R${r+1}-B` },
        { id: `R${r+1}C`, label: `R${r+1}-C` },
        { id: `R${r+1}D`, label: `R${r+1}-D` }
      ])
    },
    bakkie: {
      capacity: 5,
      seats: [
        [{ id: 'D', label: 'Driver' }, { id: 'F', label: 'Front Passenger' }],
        [{ id: 'B1', label: 'Back Left' }, { id: 'B2', label: 'Back Middle' }, { id: 'B3', label: 'Back Right' }]
      ]
    },
    truck: {
      capacity: 3,
      seats: [[{ id: 'D', label: 'Driver' }, { id: 'P1', label: 'Passenger 1' }, { id: 'P2', label: 'Passenger 2' }]]
    },
    train: {
      capacity: 20,
      seats: Array.from({ length: 5 }, (_, r) => [
        { id: `R${r+1}L`, label: `Row${r+1}-L` },
        { id: `R${r+1}R`, label: `Row${r+1}-R` }
      ])
    }
  };

  const buildSeatState = (tplKey) => {
    const tpl = VEHICLE_TEMPLATES[tplKey] || VEHICLE_TEMPLATES.sedan;
    const seatsFlat = tpl.seats.flat().map(s => ({ ...s, occupied: false, synced: false }));
    return { capacity: tpl.capacity, seatsGrid: tpl.seats, seatsFlat };
  };

  useEffect(() => {
    if (!personalSync?.seats?.length) {
      const built = buildSeatState(personalSync.vehicleType);
      setPersonalSync(ps => ({ ...ps, capacity: built.capacity, seats: built.seatsFlat, seatsGrid: built.seatsGrid }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SVG icons for vehicle types
  const VehicleIconSvg = ({ type, selected }) => {
    const stroke = selected ? '#2563eb' : '#6b7280';
    const fill = selected ? '#bfdbfe' : 'none';
    switch (type) {
      case 'sedan':
        return (
          <svg width="64" height="32" viewBox="0 0 64 32" aria-hidden>
            <rect x="6" y="12" width="44" height="12" rx="4" fill={fill} stroke={stroke} />
            <polygon points="18,12 30,8 44,12" fill={fill} stroke={stroke} />
            <circle cx="18" cy="26" r="3" fill={stroke} />
            <circle cx="44" cy="26" r="3" fill={stroke} />
          </svg>
        );
      case 'minibus16':
        return (
          <svg width="64" height="32" viewBox="0 0 64 32" aria-hidden>
            <rect x="4" y="8" width="52" height="16" rx="3" fill={fill} stroke={stroke} />
            <rect x="8" y="10" width="10" height="6" fill="white" stroke={stroke} />
            <rect x="20" y="10" width="10" height="6" fill="white" stroke={stroke} />
            <rect x="32" y="10" width="10" height="6" fill="white" stroke={stroke} />
            <rect x="44" y="10" width="10" height="6" fill="white" stroke={stroke} />
            <circle cx="16" cy="26" r="3" fill={stroke} />
            <circle cx="44" cy="26" r="3" fill={stroke} />
          </svg>
        );
      case 'bus':
        return (
          <svg width="64" height="32" viewBox="0 0 64 32" aria-hidden>
            <rect x="3" y="7" width="58" height="18" rx="4" fill={fill} stroke={stroke} />
            <rect x="8" y="10" width="12" height="6" fill="white" stroke={stroke} />
            <rect x="22" y="10" width="12" height="6" fill="white" stroke={stroke} />
            <rect x="36" y="10" width="12" height="6" fill="white" stroke={stroke} />
            <circle cx="16" cy="26" r="3" fill={stroke} />
            <circle cx="48" cy="26" r="3" fill={stroke} />
          </svg>
        );
      case 'bakkie':
        return (
          <svg width="64" height="32" viewBox="0 0 64 32" aria-hidden>
            <rect x="10" y="14" width="24" height="8" fill={fill} stroke={stroke} />
            <rect x="34" y="12" width="20" height="10" fill={fill} stroke={stroke} />
            <circle cx="20" cy="26" r="3" fill={stroke} />
            <circle cx="46" cy="26" r="3" fill={stroke} />
          </svg>
        );
      case 'truck':
        return (
          <svg width="64" height="32" viewBox="0 0 64 32" aria-hidden>
            <rect x="6" y="12" width="30" height="10" fill={fill} stroke={stroke} />
            <rect x="38" y="10" width="20" height="12" fill={fill} stroke={stroke} />
            <circle cx="16" cy="26" r="3" fill={stroke} />
            <circle cx="44" cy="26" r="3" fill={stroke} />
          </svg>
        );
      case 'train':
        return (
          <svg width="64" height="32" viewBox="0 0 64 32" aria-hidden>
            <rect x="6" y="8" width="52" height="16" rx="2" fill={fill} stroke={stroke} />
            <line x1="10" y1="26" x2="54" y2="26" stroke={stroke} />
          </svg>
        );
      default:
        return null;
    }
  };

  // SVG seat map renderer
  const SeatMapSvg = ({ seats, seatsGrid, mySeatId, onToggle, onSetMe }) => {
    // Layout constants
    const cellW = 60, cellH = 32, gap = 8;
    const rows = seatsGrid.length;
    const cols = Math.max(...seatsGrid.map(r => r.length));
    const width = cols * cellW + (cols - 1) * gap + 16;
    const height = rows * cellH + (rows - 1) * gap + 16;
    const seatById = seats.reduce((acc, s) => (acc[s.id] = s, acc), {});
    return (
      <svg width={width} height={height} role="img" aria-label="Seating map">
        {seatsGrid.map((row, rIdx) => row.map((s, cIdx) => {
          const x = 8 + cIdx * (cellW + gap);
          const y = 8 + rIdx * (cellH + gap);
          const state = seatById[s.id] || { occupied: false };
          const isMe = mySeatId === s.id;
          const fill = isMe ? '#bfdbfe' : state.occupied ? '#dcfce7' : '#fff';
          const stroke = isMe ? '#2563eb' : state.occupied ? '#16a34a' : '#6b7280';
          return (
            <g key={s.id} transform={`translate(${x},${y})`}>
              <rect width={cellW} height={cellH} rx="6" fill={fill} stroke={stroke} />
              <text x={8} y={18} fontSize="10" fill="#111827">{s.label}</text>
              {isMe && <text x={cellW-20} y={12} fontSize="10" fill="#2563eb">You</text>}
              <rect width={cellW} height={cellH} rx="6" fill="#0000" onClick={()=>onToggle(s.id)} onContextMenu={(e)=>{e.preventDefault(); onSetMe(s.id);}}/>
            </g>
          );
        }))}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Car className="h-12 w-12 text-primary-500" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Safe Ride Sharing</h1>
                <div className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                  <span>LifeSync Seal Trust & Safety Certified • Powered by </span>
                  <a
                    href="https://pigeeback-lifecv.web.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 underline flex items-center space-x-1 inline-flex"
                  >
                    <span>Pigeeback</span>
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/emergency-assistance"
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Emergency
              </Link>
              <Link
                to="/control-centre"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                title="Professional Control Centre"
              >
                Control Centre
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'find-ride', name: 'Find Ride', icon: Search },
                { id: 'offer-ride', name: 'Offer Ride', icon: Plus },
                { id: 'personal-sync', name: 'Personal Sync', icon: UserCheck },
                { id: 'my-rides', name: 'My Rides', icon: Calendar },
                { id: 'active-ride', name: 'Active Ride', icon: Navigation }
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

        {/* Find Ride Tab */}
        {activeTab === 'find-ride' && (
          <div className="space-y-6">
            {/* Sync Setup Modal */}
            {showSyncSetup && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Trip Sync Setup</h3>
                    <button onClick={() => setShowSyncSetup(false)} className="text-gray-500 hover:text-gray-700">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Handshake principle */}
                  <div className="mb-4 p-3 rounded bg-blue-50 dark:bg-blue-900/20 text-sm text-blue-800 dark:text-blue-200">
                    You will only receive as much information as you share. Choose your share level and group mode.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Your Role</label>
                      <select
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                        value={syncConfig?.role || defaultSyncConfig.role}
                        onChange={(e)=>setSyncConfig({ ...(syncConfig||defaultSyncConfig), role: e.target.value })}
                      >
                        <option value="passenger">Passenger</option>
                        <option value="driver">Driver</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Share Level</label>
                      <select
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                        value={syncConfig?.shareLevel || defaultSyncConfig.shareLevel}
                        onChange={(e)=>setSyncConfig({ ...(syncConfig||defaultSyncConfig), shareLevel: e.target.value })}
                      >
                        <option value="minimum">Minimum (name, contact, live GPS)</option>
                        <option value="standard">Standard (adds vehicle/ID partial)</option>
                        <option value="full">Full (complete profile)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Group Mode</label>
                      <select
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                        value={syncConfig?.groupMode || defaultSyncConfig.groupMode}
                        onChange={(e)=>setSyncConfig({ ...(syncConfig||defaultSyncConfig), groupMode: e.target.value })}
                      >
                        <option value="driver-only">Driver-only (public transport)</option>
                        <option value="full">Full group sync</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Stop Threshold (minutes)</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                        value={syncConfig?.stopThresholdMin ?? defaultSyncConfig.stopThresholdMin}
                        onChange={(e)=>setSyncConfig({ ...(syncConfig||defaultSyncConfig), stopThresholdMin: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Proximity Threshold (meters)</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                        value={syncConfig?.proximityThresholdM ?? defaultSyncConfig.proximityThresholdM}
                        onChange={(e)=>setSyncConfig({ ...(syncConfig||defaultSyncConfig), proximityThresholdM: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Feedback Escalation Threshold</label>
                      <input
                        type="number" step="0.1" min="0" max="1"
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                        value={syncConfig?.feedbackThreshold ?? defaultSyncConfig.feedbackThreshold}
                        onChange={(e)=>setSyncConfig({ ...(syncConfig||defaultSyncConfig), feedbackThreshold: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* Emergency contacts */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Emergency Contacts</h4>
                      <button
                        onClick={()=>addEmergencyContact({ name: 'Mom', phone: '+27123456789', role: 'departure' })}
                        className="text-primary-600 hover:underline"
                      >
                        + Quick add example
                      </button>
                    </div>
                    <div className="mt-2 space-y-2">
                      {(syncConfig?.contacts || []).length === 0 ? (
                        <div className="text-sm text-gray-500">No contacts yet</div>
                      ) : (
                        (syncConfig?.contacts || []).map((c, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded border dark:border-gray-700">
                            <div>
                              <div className="font-medium">{c.name} <span className="text-xs text-gray-500">({c.role})</span></div>
                              <div className="text-sm text-gray-600">{c.phone}</div>
                            </div>
                            <button onClick={()=>setSyncConfig(cfg=>({ ...cfg, contacts: (cfg.contacts||[]).filter((_,i)=>i!==idx) }))} className="text-red-600">
                              Remove
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Connectivity Preferences */}
                  <div className="mt-6">
                    <div className="font-medium mb-2">Connectivity Preferences</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm mb-1">Preferred Channel</label>
                        <select
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                          value={syncConfig?.connectivity?.preferred || 'p2p'}
                          onChange={(e)=>setSyncConfig(cfg=>({ ...(cfg||defaultSyncConfig), connectivity: { ...(cfg?.connectivity||defaultSyncConfig.connectivity), preferred: e.target.value } }))}
                        >
                          <option value="p2p">Peer-to-Peer (Bluetooth/WiFi Direct)</option>
                          <option value="internet">Internet</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm mb-1">P2P Interval (sec)</label>
                        <input type="number" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                          value={syncConfig?.connectivity?.p2p?.intervalSec ?? 60}
                          onChange={(e)=>setSyncConfig(cfg=>({ ...(cfg||defaultSyncConfig), connectivity: { ...(cfg?.connectivity||defaultSyncConfig.connectivity), p2p: { ...(cfg?.connectivity?.p2p||defaultSyncConfig.connectivity.p2p), intervalSec: Math.max(10, Number(e.target.value)||60) } } }))}
                        />
                        <div className="text-xs text-gray-500 mt-1">Lower frequency saves battery</div>
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Internet Interval (sec)</label>
                        <input type="number" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                          value={syncConfig?.connectivity?.internet?.intervalSec ?? 120}
                          onChange={(e)=>setSyncConfig(cfg=>({ ...(cfg||defaultSyncConfig), connectivity: { ...(cfg?.connectivity||defaultSyncConfig.connectivity), internet: { ...(cfg?.connectivity?.internet||defaultSyncConfig.connectivity.internet), intervalSec: Math.max(30, Number(e.target.value)||120) } } }))}
                        />
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">Bluetooth/WiFi Direct are primary by default; Internet used as fallback or per preference.</div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button className="px-4 py-2 rounded border" onClick={()=>setShowSyncSetup(false)}>Cancel</button>
                    <button
                      className="px-4 py-2 rounded bg-primary-600 text-white disabled:opacity-50"
                      disabled={isStartingTrip}
                      onClick={()=>{ setShowSyncSetup(false); startTripWithConfig(selectedRide, syncConfig || defaultSyncConfig); }}
                    >
                      {isStartingTrip ? 'Starting...' : 'Start Trip'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Search Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Find a Ride</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    From
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Departure location"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    To
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Destination"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date & Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="datetime-local"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Passengers
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                    <option value="1">1 passenger</option>
                    <option value="2">2 passengers</option>
                    <option value="3">3 passengers</option>
                    <option value="4">4 passengers</option>
                  </select>
                </div>
              </div>
              <div className="mt-6">
                <button className="w-full md:w-auto px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  Search Rides
                </button>
              </div>
            </div>

            {/* Available Rides */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Available Rides</h3>
              {availableRides.map((ride) => (
                <div key={ride.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={ride.driver.profileImage}
                        alt={ride.driver.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {ride.driver.name}
                          </h4>
                          {ride.driver.verified && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                              {ride.driver.rating}
                            </span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {ride.driver.completedRides} rides
                          </span>
                          <span className="text-gray-400">•</span>
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600 dark:text-green-400">
                              {ride.driver.safetyScore}% safety
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        R{ride.pricing.perSeat}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">per seat</div>
                    </div>
                  </div>

                  {/* Route Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <Route className="h-5 w-5 text-primary-500" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {ride.route.from}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          to {ride.route.to}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-primary-500" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {new Date(ride.route.departureTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {ride.route.duration} • {ride.route.distance}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-primary-500" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {ride.availableSeats} seats available
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {ride.vehicle.make} {ride.vehicle.model}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Safety Features */}
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Safety Features</h5>
                    <div className="flex flex-wrap gap-2">
                      {ride.safetyFeatures.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded dark:bg-green-900 dark:text-green-200"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-primary-600 border border-primary-600 rounded hover:bg-primary-50 transition-colors">
                        View Profile
                      </button>
                      <button className="px-3 py-1 text-primary-600 border border-primary-600 rounded hover:bg-primary-50 transition-colors">
                        Message
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleGroupSync(ride)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Group Sync
                      </button>
                      <button
                        onClick={() => handleTripStart(ride)}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Start Safe Ride
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Offer Ride Tab */}
        {activeTab === 'offer-ride' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Offer a Ride</h2>
              
              {/* Route Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Departure Location
                  </label>
                  <input
                    type="text"
                    placeholder="Where are you leaving from?"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Destination
                  </label>
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Timing and Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Departure Time
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Available Seats
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                    <option value="1">1 seat</option>
                    <option value="2">2 seats</option>
                    <option value="3">3 seats</option>
                    <option value="4">4 seats</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price per Seat (ZAR)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Vehicle Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Make & Model
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Toyota Corolla"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Color
                    </label>
                    <input
                      type="text"
                      placeholder="Vehicle color"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      License Plate
                    </label>
                    <input
                      type="text"
                      placeholder="ABC 123-456"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Safety and Preferences */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Safety & Preferences</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Enable GPS tracking during ride</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Allow emergency contacts to track ride</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">No smoking</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Music allowed</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  Publish Ride
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Personal Sync Tab */}
        {activeTab === 'personal-sync' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Create Personal Sync</h2>

              {/* Service Type */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'none', label: 'No Registered Service' },
                  { key: 'pigeeback', label: 'Pigeeback Service' },
                  { key: 'professional', label: 'Professional (Taxi/Bus/Train)' }
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={()=>setPersonalSync(ps=>({ ...ps, serviceType: opt.key, enabled: true }))}
                    className={`p-4 rounded-lg border transition-colors ${personalSync.serviceType===opt.key?'border-primary-600 bg-primary-50 dark:bg-primary-900/20':'border-gray-300 dark:border-gray-700'}`}
                  >
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-xs text-gray-600">{opt.key==='pigeeback'?'Powered by Pigeeback principles':'Local personal sync'}</div>
                  </button>
                ))}
              </div>

              {/* Vehicle Type Selection */}
              <div className="mb-4">
                <div className="font-medium mb-2">Select Vehicle Type</div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { key: 'sedan', label: 'Sedan' },
                    { key: 'minibus16', label: 'Minibus Taxi' },
                    { key: 'bus', label: 'Bus' },
                    { key: 'bakkie', label: 'Bakkie' },
                    { key: 'truck', label: 'Truck' },
                    { key: 'train', label: 'Train' }
                  ].map(v => (
                    <button
                      key={v.key}
                      onClick={()=>{
                        const built = buildSeatState(v.key);
                        setPersonalSync(ps=>({ ...ps, vehicleType: v.key, capacity: built.capacity, seats: built.seatsFlat, seatsGrid: built.seatsGrid }));
                      }}
                      className={`p-3 rounded border text-sm flex flex-col items-center gap-2 ${personalSync.vehicleType===v.key?'border-primary-600 bg-primary-50 dark:bg-primary-900/20':'border-gray-300 dark:border-gray-700'}`}
                    >
                      <VehicleIconSvg type={v.key} selected={personalSync.vehicleType===v.key} />
                      <div>{v.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Seating Map (SVG) */}
              <div className="mb-6">
                <div className="font-medium mb-2">Seating Map</div>
                <div className="inline-block p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <div className="text-xs text-gray-500 mb-2">Left click: toggle occupied • Right click: set your seat</div>
                  <SeatMapSvg
                    seats={personalSync.seats}
                    seatsGrid={personalSync.seatsGrid.length?personalSync.seatsGrid:buildSeatState(personalSync.vehicleType).seatsGrid}
                    mySeatId={personalSync.mySeatId}
                    onToggle={(seatId)=>setPersonalSync(ps=>({ ...ps, seats: ps.seats.map(s=> s.id===seatId? { ...s, occupied: !s.occupied }: s) }))}
                    onSetMe={(seatId)=>setPersonalSync(ps=>({ ...ps, mySeatId: seatId }))}
                  />
                </div>
              </div>

              {/* Occupancy Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-3 rounded border dark:border-gray-700">
                  <div className="text-sm">Vehicle Capacity</div>
                  <div className="text-xl font-semibold">{personalSync.capacity}</div>
                </div>
                <div className="p-3 rounded border dark:border-gray-700">
                  <div className="text-sm">Occupied Seats</div>
                  <div className="text-xl font-semibold">{personalSync.seats.filter(s=>s.occupied).length}</div>
                </div>
                <div className="p-3 rounded border dark:border-gray-700">
                  <div className="text-sm mb-1">Additional Passengers (standing/aisles)</div>
                  <input type="number" value={personalSync.additionalPassengers} onChange={(e)=>setPersonalSync(ps=>({ ...ps, additionalPassengers: Math.max(0, Number(e.target.value)||0) }))} className="w-full px-2 py-1 rounded border dark:bg-gray-700"/>
                </div>
              </div>

              {personalSync.seats.filter(s=>s.occupied).length + (personalSync.additionalPassengers||0) > personalSync.capacity && (
                <div className="mb-4 p-3 rounded border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 text-sm">
                  Soft warning: Occupancy exceeds recorded capacity. Consider safety risks and legal limits.
                </div>
              )}

              {/* Speed Monitoring */}
              <div className="mb-6">
                <div className="font-medium mb-2">Speed Monitoring (optional)</div>
                <label className="flex items-center gap-2 mb-2">
                  <input type="checkbox" checked={personalSync.speedMonitoring.enabled} onChange={(e)=>setPersonalSync(ps=>({ ...ps, speedMonitoring: { ...ps.speedMonitoring, enabled: e.target.checked } }))} />
                  <span>Enable speed monitoring</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Log Interval (sec)</label>
                    <input type="number" value={personalSync.speedMonitoring.intervalSec} onChange={(e)=>setPersonalSync(ps=>({ ...ps, speedMonitoring: { ...ps.speedMonitoring, intervalSec: Math.max(10, Number(e.target.value)||60) } }))} className="w-full px-2 py-1 rounded border dark:bg-gray-700"/>
                  </div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={personalSync.speedMonitoring.saveLog} onChange={(e)=>setPersonalSync(ps=>({ ...ps, speedMonitoring: { ...ps.speedMonitoring, saveLog: e.target.checked } }))} />
                    <span>Save speed log (local)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={personalSync.speedMonitoring.share} onChange={(e)=>setPersonalSync(ps=>({ ...ps, speedMonitoring: { ...ps.speedMonitoring, share: e.target.checked } }))} />
                    <span>Share speed with contacts (sync rules)</span>
                  </label>
                </div>
              </div>

              {/* Conduct Notes */}
              <div className="mb-6">
                <div className="font-medium mb-2">Vehicle & Driver Conduct</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={personalSync.conduct.reckless} onChange={(e)=>setPersonalSync(ps=>({ ...ps, conduct: { ...ps.conduct, reckless: e.target.checked } }))}/>
                    <span>Reckless driving observed</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={personalSync.conduct.fatigueObserved} onChange={(e)=>setPersonalSync(ps=>({ ...ps, conduct: { ...ps.conduct, fatigueObserved: e.target.checked } }))}/>
                    <span>Driver fatigue observed</span>
                  </label>
                  <div>
                    <label className="block text-sm mb-1">Notes</label>
                    <input type="text" value={personalSync.conduct.notes} onChange={(e)=>setPersonalSync(ps=>({ ...ps, conduct: { ...ps.conduct, notes: e.target.value } }))} className="w-full px-2 py-1 rounded border dark:bg-gray-700"/>
                  </div>
                </div>
              </div>

              {/* Export & Share */}
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded border"
                  onClick={() => {
                    const data = {
                      ts: new Date().toISOString(),
                      serviceType: personalSync.serviceType,
                      vehicleType: personalSync.vehicleType,
                      capacity: personalSync.capacity,
                      occupiedSeats: personalSync.seats.filter(s=>s.occupied).map(s=>s.id),
                      additionalPassengers: personalSync.additionalPassengers,
                      mySeatId: personalSync.mySeatId,
                      speedLog: personalSync.speedMonitoring.enabled ? speedLog : [],
                      conduct: personalSync.conduct
                    };
                    const blob = new Blob([JSON.stringify(data,null,2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = `lifesync-trip-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url);
                  }}
                >
                  Download Snapshot (JSON)
                </button>
                <button
                  className="px-4 py-2 rounded bg-primary-600 text-white"
                  onClick={async () => {
                    const data = {
                      serviceType: personalSync.serviceType,
                      vehicleType: personalSync.vehicleType,
                      capacity: personalSync.capacity,
                      totalPassengers: personalSync.seats.filter(s=>s.occupied).length + (personalSync.additionalPassengers||0)
                    };
                    const text = `LifeSync Trip Snapshot\n${JSON.stringify(data, null, 2)}`;
                    if (navigator.share) {
                      try { await navigator.share({ title: 'LifeSync Trip Snapshot', text }); } catch {}
                    } else if (navigator.clipboard) {
                      await navigator.clipboard.writeText(text);
                      alert('Snapshot copied to clipboard');
                    }
                  }}
                >
                  Quick Share
                </button>
                <button
                  className="px-4 py-2 rounded border"
                  onClick={() => {
                    const subject = encodeURIComponent('LifeSync Trip Snapshot');
                    const body = encodeURIComponent(`Service: ${personalSync.serviceType}\nVehicle: ${personalSync.vehicleType}\nCapacity: ${personalSync.capacity}\nOccupied: ${personalSync.seats.filter(s=>s.occupied).length} (+${personalSync.additionalPassengers})`);
                    window.location.href = `mailto:?subject=${subject}&body=${body}`;
                  }}
                >
                  Share via Email
                </button>
                <button
                  className="px-4 py-2 rounded border"
                  onClick={() => {
                    const url = encodeURIComponent('https://salatiso.com/lifesync');
                    const text = encodeURIComponent(`LifeSync Trip: ${personalSync.vehicleType}, capacity ${personalSync.capacity}`);
                    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`,'_blank');
                  }}
                >
                  Share to X
                </button>
                <button
                  className="px-4 py-2 rounded border"
                  onClick={() => {
                    const url = encodeURIComponent('https://salatiso.com/lifesync');
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`,'_blank');
                  }}
                >
                  Share to Facebook
                </button>
              </div>
            </div>
          </div>
        )}

        {/* My Rides Tab */}
        {activeTab === 'my-rides' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">My Rides</h2>
              
              <div className="space-y-4">
                {userRides.map((ride) => (
                  <div key={ride.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          ride.status === 'upcoming' ? 'bg-blue-500' :
                          ride.status === 'active' ? 'bg-green-500' :
                          'bg-gray-500'
                        }`}></div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {ride.from} → {ride.to}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            with {ride.driver} • {new Date(ride.departureTime).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-white">R{ride.price}</div>
                        <div className={`text-sm capitalize ${
                          ride.status === 'upcoming' ? 'text-blue-600' :
                          ride.status === 'active' ? 'text-green-600' :
                          'text-gray-600'
                        }`}>
                          {ride.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Ride Tab */}
        {activeTab === 'active-ride' && (
          <div className="space-y-6">
            {activeRide ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Active Ride</h2>
                
                {/* Real-time Status */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <Navigation className="h-6 w-6 text-green-600" />
                    <div>
                      <div className="font-medium text-green-900 dark:text-green-100">Ride in Progress</div>
                      <div className="text-sm text-green-700 dark:text-green-300">
                        GPS tracking active • Emergency contacts notified
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connectivity Status */}
                <div className={`border rounded-lg p-4 mb-6 ${
                  connectivityStatus === 'connected' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                  connectivityStatus === 'connecting' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                  connectivityStatus === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                  'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
                }`}>
                  <div className="flex items-center space-x-3">
                    <Signal className={`h-6 w-6 ${
                      connectivityStatus === 'connected' ? 'text-blue-600' :
                      connectivityStatus === 'connecting' ? 'text-yellow-600' :
                      connectivityStatus === 'error' ? 'text-red-600' :
                      'text-gray-600'
                    }`} />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Connectivity Status</div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {connectivityStatus === 'connected' ? 'Connected and syncing' :
                         connectivityStatus === 'connecting' ? 'Connecting...' :
                         connectivityStatus === 'error' ? 'Connection error - check settings' :
                         'Idle'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Driver Info */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src="/api/placeholder/60/60"
                      alt="Driver"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Thabo Mthembu
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">4.8</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Toyota Corolla</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                      <Phone className="h-5 w-5" />
                    </button>
                    <button className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors">
                      <MessageSquare className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Emergency & Group Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={handleEmergencyAlert}
                    className="w-full p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-3"
                  >
                    <AlertTriangle className="h-6 w-6" />
                    <span className="text-lg font-medium">Emergency Alert</span>
                  </button>
                  <button
                    onClick={() => handleGroupSync(activeRide)}
                    className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-3"
                  >
                    <Users className="h-6 w-6" />
                    <span className="text-lg font-medium">Manage Group Sync</span>
                  </button>
                </div>

                {/* Proximity alerts (group) */}
                {proximityAlerts.length > 0 && (
                  <div className="mb-6 p-4 rounded border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700">
                    <div className="font-medium mb-2 text-yellow-800 dark:text-yellow-100">Proximity Alerts</div>
                    <ul className="list-disc list-inside text-sm text-yellow-900 dark:text-yellow-200">
                      {proximityAlerts.map(a => (
                        <li key={a.memberId}>{a.name} is {a.distance}m away from group</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Ride Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Satellite className="h-8 w-8 text-primary-500 mx-auto mb-2" />
                    <div className="font-medium text-gray-900 dark:text-white">GPS Active</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Real-time tracking</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Signal className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="font-medium text-gray-900 dark:text-white">Connected</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Strong signal</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Battery className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <div className="font-medium text-gray-900 dark:text-white">85% Battery</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Device power</div>
                  </div>
                </div>

                {/* Personal Sync Summary (if enabled) */}
                {personalSync.enabled && (
                  <div className="mt-6 p-4 rounded border dark:border-gray-700">
                    <div className="font-medium mb-2">Personal Sync Summary</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">Vehicle: {personalSync.vehicleType} • Service: {personalSync.serviceType}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">Capacity: {personalSync.capacity} • Occupied: {personalSync.seats.filter(s=>s.occupied).length} (+{personalSync.additionalPassengers})</div>
                    {personalSync.speedMonitoring.enabled && (
                      <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">Speed monitor active • Samples: {speedLog.length}</div>
                    )}
                  </div>
                )}

                {/* Anonymous feedback and escalation status */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded border dark:border-gray-700">
                    <div className="font-medium mb-2">Anonymous Safety Feedback</div>
                    <div className="flex flex-wrap gap-2">
                      {['Reckless driving','Driver fatigue','Suspicious passenger','Over capacity'].map((r)=> (
                        <button key={r} onClick={()=>submitAnonymousFeedback(r)} className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">
                          {r}
                        </button>
                      ))}
                    </div>
                    {feedbackReports.length > 0 && (
                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        {feedbackReports.length} report(s) submitted this trip
                      </div>
                    )}
                  </div>
                  <div className="p-4 rounded border dark:border-gray-700">
                    <div className="font-medium mb-2">Escalation Status</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">Stage: {escalationStatus.stage}</div>
                    {escalationStatus.lastNotifiedAt && (
                      <div className="text-xs text-gray-500">Last: {new Date(escalationStatus.lastNotifiedAt).toLocaleTimeString()}</div>
                    )}
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div className="mt-6 p-4 rounded border dark:border-gray-700">
                  <div className="font-medium mb-2">Emergency Contacts</div>
                  {(syncConfig?.contacts || []).length === 0 ? (
                    <div className="text-sm text-gray-500">No contacts configured</div>
                  ) : (
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      {(syncConfig?.contacts || []).map((c, i)=> (
                        <li key={i} className="flex items-center justify-between">
                          <span>{c.name} • {c.role}</span>
                          <a href={`tel:${c.phone}`} className="text-primary-600">{c.phone}</a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* End trip */}
                <div className="mt-6 flex justify-end">
                  <button onClick={handleEndTrip} className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-700">End Trip</button>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
                <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Active Ride</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Book a ride to see real-time tracking and safety features here.
                </p>
                <button
                  onClick={() => setActiveTab('find-ride')}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Find a Ride
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RideSharing;
