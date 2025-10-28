/**
 * Route Configuration System
 * Defines which routes are public, protected, or semi-protected (allow guest)
 * Used to conditionally render layouts and control sidebar visibility
 * 
 * Route Types:
 * - PUBLIC: No authentication required, no sidebar, clean header
 * - PROTECTED: Requires authentication, full sidebar and dashboard header
 * - SEMI_PROTECTED: Allows guest OR authenticated users, sidebar only for authenticated
 */

// Routes that are completely public - NO sidebar, clean header
export const PUBLIC_ROUTES = [
  '/',
  '/auth',
  '/contact',
  '/onboarding',
  '/terms/reciprocity'
];

// Routes that require authentication - Full sidebar and dashboard features
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/lifecv',
  '/contacts',
  '/calendar',
  '/assets',
  '/projects',
  '/career-paths',
  '/family',
  '/family-timeline'
];

// Routes that allow both guest and authenticated users - Conditional sidebar
export const SEMI_PROTECTED_ROUTES = [
  '/home',
  '/solo',
  '/instant-trust',
  '/seal',
  '/geofencing',
  '/check-ins',
  '/contacts/import',
  '/family-tree',
  '/universal-trust',
  '/emergency-sync',
  '/professional-dashboard',
  '/household-management',
  '/community-governance',
  '/incident-reporting',
  '/ride-sharing',
  '/hitchhiking-safety',
  '/delivery-services',
  '/home-services',
  '/property-management',
  '/local-networking',
  '/event-safety',
  '/emergency-assistance',
  '/kids-zone',
  '/lifesync-academy',
  '/community-support',
  '/safe-transportation',
  '/follow-me-home',
  '/communities',
  '/community',
  '/sync',
  '/report',
  '/control-centre',
  '/hub-settings',
  '/safety-help',
  '/trust-safety',
  '/transportation',
  '/community',
  '/dev/smoke',
  '/join',
  '/safety-exchange'
];

/**
 * Determine if a route is public (no authentication required)
 * @param {string} pathname - Current pathname from useLocation
 * @returns {boolean} true if route is public
 */
export const isPublicRoute = (pathname) => {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
};

/**
 * Determine if a route is protected (requires authentication)
 * @param {string} pathname - Current pathname from useLocation
 * @returns {boolean} true if route is protected
 */
export const isProtectedRoute = (pathname) => {
  return PROTECTED_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
};

/**
 * Determine if a route is semi-protected (allows guest or authenticated)
 * @param {string} pathname - Current pathname from useLocation
 * @returns {boolean} true if route is semi-protected
 */
export const isSemiProtectedRoute = (pathname) => {
  return SEMI_PROTECTED_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
};

/**
 * Determine the layout type for a given route
 * @param {string} pathname - Current pathname from useLocation
 * @param {boolean} isAuthenticated - Whether user is currently authenticated
 * @returns {string} 'public', 'authenticated', or 'semi-protected'
 */
export const getLayoutType = (pathname, isAuthenticated = false) => {
  if (isPublicRoute(pathname)) {
    return 'public';
  }
  if (isProtectedRoute(pathname)) {
    return isAuthenticated ? 'authenticated' : 'public'; // Redirect to public if not auth
  }
  if (isSemiProtectedRoute(pathname)) {
    return isAuthenticated ? 'authenticated' : 'public'; // Show guest-friendly layout
  }
  // Default to authenticated layout for unknown routes
  return isAuthenticated ? 'authenticated' : 'public';
};

/**
 * Routes that should NOT show the sidebar
 * @param {string} pathname - Current pathname from useLocation
 * @returns {boolean} true if sidebar should be hidden
 */
export const shouldHideSidebar = (pathname) => {
  return isPublicRoute(pathname);
};

/**
 * Routes that should always show the sidebar (for authenticated users)
 * @param {string} pathname - Current pathname from useLocation
 * @returns {boolean} true if sidebar should always be visible
 */
export const shouldAlwaysShowSidebar = (pathname) => {
  return isProtectedRoute(pathname);
};

/**
 * Sidebar visibility logic
 * @param {string} pathname - Current pathname from useLocation
 * @param {boolean} isAuthenticated - Whether user is currently authenticated
 * @returns {boolean} true if sidebar should be visible
 */
export const shouldShowSidebar = (pathname, isAuthenticated = false) => {
  if (shouldHideSidebar(pathname)) return false; // Never show on public routes
  if (shouldAlwaysShowSidebar(pathname)) return true; // Always show on protected routes
  if (isSemiProtectedRoute(pathname)) return isAuthenticated; // Show if authenticated
  return false; // Default: don't show
};

/**
 * Get the main content margin class based on sidebar visibility
 * @param {boolean} showSidebar - Whether sidebar is visible
 * @param {boolean} collapsed - Whether sidebar is collapsed
 * @returns {string} Tailwind margin class
 */
export const getMainContentMargin = (showSidebar = true, collapsed = false) => {
  if (!showSidebar) return 'ml-0';
  if (collapsed) return 'ml-20'; // Collapsed sidebar width
  return 'ml-72'; // Full sidebar width (w-72)
};

// Export route configuration for debugging/monitoring
export const ROUTE_CONFIG = {
  public: PUBLIC_ROUTES,
  protected: PROTECTED_ROUTES,
  semiProtected: SEMI_PROTECTED_ROUTES,
  totalRoutes: PUBLIC_ROUTES.length + PROTECTED_ROUTES.length + SEMI_PROTECTED_ROUTES.length
};

export default {
  PUBLIC_ROUTES,
  PROTECTED_ROUTES,
  SEMI_PROTECTED_ROUTES,
  isPublicRoute,
  isProtectedRoute,
  isSemiProtectedRoute,
  getLayoutType,
  shouldHideSidebar,
  shouldAlwaysShowSidebar,
  shouldShowSidebar,
  getMainContentMargin,
  ROUTE_CONFIG
};
