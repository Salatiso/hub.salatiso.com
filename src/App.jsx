import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import SkipLink from './components/common/SkipLink';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './components/layouts/PublicLayout';
import AuthenticatedLayout from './components/layouts/AuthenticatedLayout';
import { isPublicRoute } from './utils/routeConfig';
import './i18n'; // Initialize i18n before any components use it
const SealEvent = lazy(() => import('./pages/SealEvent'));
const Geofencing = lazy(() => import('./pages/Geofencing'));
const CheckIns = lazy(() => import('./pages/CheckIns'));
const ContactImportWizard = lazy(() => import('./pages/ContactImportWizard'));
const FamilyTree = lazy(() => import('./pages/FamilyTree'));
const Home = lazy(() => import('./pages/Home'));
const SoloExperience = lazy(() => import('./pages/SoloExperience'));
const Sync = lazy(() => import('./pages/Sync'));
const CompatibilityReport = lazy(() => import('./pages/CompatibilityReport'));
const InstantTrustVerification = lazy(() => import('./components/InstantTrustVerification'));
const SafetyExchange = lazy(() => import('./pages/SafetyExchange'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UniversalTrust = lazy(() => import('./components/UniversalTrust'));
const EmergencySync = lazy(() => import('./components/EmergencySync'));
const ProfessionalDashboard = lazy(() => import('./components/ProfessionalDashboard'));
const HouseholdManagement = lazy(() => import('./components/HouseholdManagement'));
const RideSharing = lazy(() => import('./components/RideSharing'));
const HitchhikingSafety = lazy(() => import('./components/HitchhikingSafety'));
const DeliveryServices = lazy(() => import('./components/DeliveryServices'));
const HomeServices = lazy(() => import('./components/HomeServices'));
const PropertyManagement = lazy(() => import('./components/PropertyManagement'));
const EventSafety = lazy(() => import('./components/EventSafety'));
const EmergencyAssistance = lazy(() => import('./components/EmergencyAssistance'));
const SafeTransportation = lazy(() => import('./components/SafeTransportation'));
const FollowMeHome = lazy(() => import('./pages/FollowMeHome'));
const CommunityHub = lazy(() => import('./pages/CommunityHub'));
const CommunityView = lazy(() => import('./pages/CommunityView'));
const Contact = lazy(() => import('./pages/Contact'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Join = lazy(() => import('./pages/Join'));
const Smoke = lazy(() => import('./pages/Smoke'));
const Welcome = lazy(() => import('./pages/Welcome'));
const Auth = lazy(() => import('./pages/Auth'));
import GuestContext, { useGuestData } from './contexts/GuestContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { KeyboardProvider } from './contexts/KeyboardContext';
import FloatingToolbar from './components/FloatingToolbar';
const ControlCentre = lazy(() => import('./pages/ControlCentre'));
import LocationWatcher from './components/LocationWatcher';
import { idbGet, idbSet } from './utils/storage';
import LoadingSpinner from './components/LoadingSpinner';
import RequireAuth from './components/RequireAuth';

// Stub implementation for processOutbox
const processOutbox = async () => {
  console.log('Processing outbox...');
  // TODO: Implement actual outbox processing logic
};
const TermsOfReciprocity = lazy(() => import('./pages/TermsOfReciprocity'));
// import ReciprocityFloatingButton from './components/ReciprocityFloatingButton';
const HubSettings = lazy(() => import('./pages/HubSettings'));
const SafetyHelp = lazy(() => import('./pages/SafetyHelp'));
const TrustSafety = lazy(() => import('./pages/TrustSafety'));
const Transportation = lazy(() => import('./pages/Transportation'));
const Community = lazy(() => import('./pages/Community'));
const KidsZone = lazy(() => import('./pages/KidsZone'));
const LifeSyncAcademy = lazy(() => import('./pages/LifeSyncAcademy'));
const Profile = lazy(() => import('./pages/Profile'));
const LifeCV = lazy(() => import('./pages/LifeCV'));
const Contacts = lazy(() => import('./pages/Contacts'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Assets = lazy(() => import('./pages/Assets'));
const Projects = lazy(() => import('./pages/Projects'));
const CareerPaths = lazy(() => import('./pages/CareerPaths'));
const Family = lazy(() => import('./pages/Family'));
const FamilyTimeline = lazy(() => import('./pages/FamilyTimeline'));
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getLifeCVProfile } from './utils/firebaseProfile';
import { fromLifeCV } from './utils/lifecvAdapter';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './context/UserContext';
import { NotificationProvider } from './context/NotificationContext';

// Watches the current route and manages which layout to use
function RouteAwareLayout({ children }) {
  const location = useLocation();
  const isPublic = isPublicRoute(location.pathname);

  if (isPublic) {
    return <PublicLayout>{children}</PublicLayout>;
  }
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}

function App() {
  const { guestData, updateGuestData, exportProfile, importProfile, queueOfflineAction, processOfflineQueue, setGuestData } = useGuestData();

  // Hydrate slices from IDB on first mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      const [sealEvents, geofences, checkIns, geofenceLogs, checkInLogs, contacts, relationships] = await Promise.all([
        idbGet('sealEvents'),
        idbGet('geofences'),
        idbGet('checkIns'),
        idbGet('geofenceLogs'),
        idbGet('checkInLogs'),
        idbGet('contacts'),
        idbGet('relationships')
      ]);
      if (!mounted) return;
      updateGuestData(prev => ({
        ...prev,
        sealEvents: sealEvents || prev.sealEvents,
        geofences: geofences || prev.geofences,
        checkIns: checkIns || prev.checkIns,
        geofenceLogs: geofenceLogs || prev.geofenceLogs,
        checkInLogs: checkInLogs || prev.checkInLogs,
        contacts: contacts || prev.contacts || [],
        relationships: relationships || prev.relationships || [],
        deviceType: prev.deviceType,
        trustScore: prev.trustScore || 0,
        verifications: prev.verifications || []
      }));
    })();
    return () => { mounted = false; };
  }, [updateGuestData]);

  // Hydrate from Firestore when authenticated
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const remote = await getLifeCVProfile(user.uid);
          if (remote) {
            const parsed = fromLifeCV(remote);
            updateGuestData(prev => ({
              ...prev,
              ...parsed,
              verifications: Array.isArray(remote.verifications) ? remote.verifications : (prev.verifications || []),
              deviceType: prev.deviceType
            }));
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to hydrate LifeCV from Firestore', e);
      }
    });
    return () => unsub();
  }, [updateGuestData]);

  // Check for data expiration (35 days) and reminders
  useEffect(() => {
    const now = Date.now();
    const thirtyFiveDays = 35 * 24 * 60 * 60 * 1000;
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    // Check if it's time for a reminder (every 7 days)
    if (!guestData.lastReminder || now - guestData.lastReminder > sevenDays) {
      const daysSinceCreation = Math.floor((now - guestData.createdAt) / (24 * 60 * 60 * 1000));
      if (daysSinceCreation > 0 && daysSinceCreation % 7 === 0 && daysSinceCreation < 35) {
        // Show reminder notification
        if (Notification.permission === 'granted') {
          new Notification('LifeSync Guest Reminder', {
            body: `You've been using LifeSync for ${daysSinceCreation} days. Consider creating a LifeCV profile to save your data permanently.`,
            icon: '/vite.svg'
          });
        }
        updateGuestData(prev => ({ ...prev, lastReminder: now }));
      }
    }

    // Check for expiration
    if (now - guestData.createdAt > thirtyFiveDays) {
      // Instead of auto-deleting, show expiration modal or redirect to renewal page
      // For now, we'll keep the data but mark as expired
      if (!guestData.expired) {
        updateGuestData(prev => ({ ...prev, expired: true }));
      }
    }
  }, [guestData.createdAt, guestData.lastReminder, guestData.expired, updateGuestData]);

  // Minimal redirect helper: if profile not initialized and not on onboarding, some pages can choose to prompt
  // We keep router-level routes intact; individual pages can also gate further if needed.

  return (
    <AuthProvider>
      <UserProvider>
        <NotificationProvider>
          <ThemeProvider>
            <GuestContext.Provider value={{ guestData, updateGuestData, exportProfile, importProfile, queueOfflineAction, processOfflineQueue, setGuestData }}>
              <KeyboardProvider>
                <Router>
              <SkipLink />
              <RouteAwareLayout>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Welcome />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/terms/reciprocity" element={<TermsOfReciprocity />} />
                  <Route path="/safety-exchange" element={<RequireAuth allowGuest feature="Safety Exchange"><SafetyExchange /></RequireAuth>} />

                  {/* Protected: guest or registered */}
                  <Route path="/home" element={<RequireAuth allowGuest feature="Home"><Home /></RequireAuth>} />
                  <Route path="/solo" element={<RequireAuth allowGuest feature="Solo Experience"><SoloExperience /></RequireAuth>} />
                  <Route path="/instant-trust" element={<RequireAuth allowGuest feature="Instant Trust"><InstantTrustVerification /></RequireAuth>} />
                  
                  {/* Protected: registered users only */}
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/seal/:id" element={<RequireAuth allowGuest feature="Seal Event"><SealEvent /></RequireAuth>} />
                  <Route path="/geofencing" element={<RequireAuth allowGuest feature="Geofencing"><Geofencing /></RequireAuth>} />
                  <Route path="/check-ins" element={<RequireAuth allowGuest feature="Check-ins"><CheckIns /></RequireAuth>} />
                  <Route path="/contacts/import" element={<RequireAuth allowGuest feature="Contacts Import"><ContactImportWizard /></RequireAuth>} />
                  <Route path="/family-tree" element={<RequireAuth allowGuest feature="Family Tree"><FamilyTree /></RequireAuth>} />
                  <Route path="/universal-trust" element={<RequireAuth allowGuest feature="Universal Trust"><UniversalTrust /></RequireAuth>} />
                  <Route path="/emergency-sync" element={<RequireAuth allowGuest feature="Emergency Sync"><EmergencySync /></RequireAuth>} />
                  <Route path="/professional-dashboard" element={<RequireAuth allowGuest feature="Professional Dashboard"><ProfessionalDashboard /></RequireAuth>} />
                  <Route path="/household-management" element={<RequireAuth allowGuest feature="Household Management"><HouseholdManagement /></RequireAuth>} />
                  <Route path="/community-governance" element={<RequireAuth allowGuest feature="Community Governance"><CommunityHub /></RequireAuth>} />
                  <Route path="/incident-reporting" element={<RequireAuth allowGuest feature="Incident Reporting"><CommunityHub /></RequireAuth>} />
                  <Route path="/ride-sharing" element={<RequireAuth allowGuest feature="Ride Sharing"><RideSharing /></RequireAuth>} />
                  <Route path="/hitchhiking-safety" element={<RequireAuth allowGuest feature="Hitchhiking Safety"><HitchhikingSafety /></RequireAuth>} />
                  <Route path="/delivery-services" element={<RequireAuth allowGuest feature="Delivery Services"><DeliveryServices /></RequireAuth>} />
                  <Route path="/home-services" element={<RequireAuth allowGuest feature="Home Services"><HomeServices /></RequireAuth>} />
                  <Route path="/property-management" element={<RequireAuth allowGuest feature="Property Management"><PropertyManagement /></RequireAuth>} />
                  <Route path="/local-networking" element={<RequireAuth allowGuest feature="Local Networking"><CommunityHub /></RequireAuth>} />
                  <Route path="/event-safety" element={<RequireAuth allowGuest feature="Event Safety"><EventSafety /></RequireAuth>} />
                  <Route path="/emergency-assistance" element={<RequireAuth allowGuest feature="Emergency Assistance"><EmergencyAssistance /></RequireAuth>} />
                  <Route path="/kids-zone" element={<RequireAuth allowGuest feature="Kids Zone"><KidsZone /></RequireAuth>} />
                  <Route path="/lifesync-academy" element={<RequireAuth allowGuest feature="LifeSync Academy"><LifeSyncAcademy /></RequireAuth>} />
                  <Route path="/community-support" element={<RequireAuth allowGuest feature="Community Support"><CommunityHub /></RequireAuth>} />
                  <Route path="/safe-transportation" element={<RequireAuth allowGuest feature="Safe Transportation"><SafeTransportation /></RequireAuth>} />
                  <Route path="/follow-me-home" element={<RequireAuth allowGuest feature="Follow Me Home"><FollowMeHome /></RequireAuth>} />
                  <Route path="/communities" element={<RequireAuth allowGuest feature="Communities"><CommunityHub /></RequireAuth>} />
                  <Route path="/community/:id" element={<RequireAuth allowGuest feature="Community"><CommunityView /></RequireAuth>} />
                  <Route path="/sync/:syncId" element={<RequireAuth allowGuest feature="Sync"><Sync /></RequireAuth>} />
                  <Route path="/report/:reportId" element={<RequireAuth allowGuest feature="Compatibility Report"><CompatibilityReport /></RequireAuth>} />
                  <Route path="/control-centre" element={<RequireAuth allowGuest feature="Control Centre"><ControlCentre /></RequireAuth>} />
                  <Route path="/hub-settings" element={<RequireAuth allowGuest feature="Hub Settings"><HubSettings /></RequireAuth>} />
                  <Route path="/safety-help" element={<RequireAuth allowGuest feature="Safety Help"><SafetyHelp /></RequireAuth>} />
                  <Route path="/trust-safety" element={<RequireAuth allowGuest feature="Trust & Safety"><TrustSafety /></RequireAuth>} />
                  <Route path="/transportation" element={<RequireAuth allowGuest feature="Transportation"><Transportation /></RequireAuth>} />
                  <Route path="/community" element={<RequireAuth allowGuest feature="Community"><Community /></RequireAuth>} />
                  <Route path="/dev/smoke" element={<RequireAuth allowGuest feature="Dev Smoke"><Smoke /></RequireAuth>} />
                  <Route path="/join/:id" element={<RequireAuth allowGuest feature="Join"><Suspense fallback={<LoadingSpinner />}><Join /></Suspense></RequireAuth>} />
                  
                  {/* Phase 2: Missing Page Routes - Protected (registered users only) */}
                  <Route path="/profile" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><Profile /></Suspense></ProtectedRoute>} />
                  <Route path="/lifecv" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><LifeCV /></Suspense></ProtectedRoute>} />
                  <Route path="/contacts" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><Contacts /></Suspense></ProtectedRoute>} />
                  <Route path="/calendar" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><Calendar /></Suspense></ProtectedRoute>} />
                  <Route path="/assets" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><Assets /></Suspense></ProtectedRoute>} />
                  <Route path="/projects" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><Projects /></Suspense></ProtectedRoute>} />
                  <Route path="/career-paths" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><CareerPaths /></Suspense></ProtectedRoute>} />
                  <Route path="/family" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><Family /></Suspense></ProtectedRoute>} />
                  <Route path="/family-timeline" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><FamilyTimeline /></Suspense></ProtectedRoute>} />
                  
                  {/* 404 Catch-all Route */}
                  <Route path="*" element={<RequireAuth allowGuest feature="Not Found"><div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1><p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p><a href="/dashboard" className="text-blue-600 hover:underline">Return to Dashboard</a></div></div></RequireAuth>} />
                </Routes>
                <LocationWatcher />
              </RouteAwareLayout>
            </Router>
              </KeyboardProvider>
            </GuestContext.Provider>
          </ThemeProvider>
        </NotificationProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
