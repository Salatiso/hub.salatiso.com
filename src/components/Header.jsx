import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Moon, Sun, Grid3X3, ChevronDown, ChevronUp, Shield, MapPin, Users, Home as HomeIcon, Car, Package, Wrench, Building, Network, Calendar, AlertTriangle, HeartHandshake, Phone, Zap, UserCheck, CheckCircle, LogOut, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import LanguageSelector from './LanguageSelector';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowUserDropdown(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowToolsDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toolsAndServices = [
    {
      category: 'Trust & Safety',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: Grid3X3, description: 'Overview and management', color: 'text-blue-600' },
        { name: 'Instant Trust Verification', path: '/instant-trust', icon: UserCheck, description: 'Multi-step safety verification', color: 'text-blue-600' },
        { name: 'Universal Trust', path: '/universal-trust', icon: Shield, description: 'Cross-platform trust layer', color: 'text-blue-600' },
        { name: 'Emergency Sync', path: '/emergency-sync', icon: Zap, description: 'Emergency response coordination', color: 'text-red-600' },
        { name: 'Household Management', path: '/household-management', icon: HomeIcon, description: 'Family safety and communication', color: 'text-green-600' },
        { name: 'Community Governance', path: '/community-governance', icon: Users, description: 'Community voting and incident reporting', color: 'text-purple-600' },
        { name: 'Incident Reporting', path: '/incident-reporting', icon: AlertTriangle, description: 'Multi-party validation system', color: 'text-orange-600' },
        { name: 'Safety Help', path: '/emergency-assistance', icon: Phone, description: 'Emergency response services', color: 'text-red-600' }
      ]
    },
    {
      category: 'Transportation',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      items: [
        { name: 'Ride Sharing', path: '/ride-sharing', icon: Car, description: 'Safe transportation services', color: 'text-green-600' },
        { name: 'Hitchhiking Safety', path: '/hitchhiking-safety', icon: HeartHandshake, description: 'GPS-tracked safe rides', color: 'text-green-600' },
        { name: 'Delivery Services', path: '/delivery-services', icon: Package, description: 'Verified parcel delivery', color: 'text-blue-600' },
        { name: 'Home Services', path: '/home-services', icon: Wrench, description: 'Verified contractors', color: 'text-orange-600' },
        { name: 'Property Management', path: '/property-management', icon: Building, description: 'Rental and property services', color: 'text-purple-600' },
        { name: 'Ekhaya', path: '/property-management', icon: MapPin, description: 'Location-based services', color: 'text-indigo-600' }
      ]
    },
    {
      category: 'Community',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      items: [
        { name: 'Local Networking', path: '/local-networking', icon: Network, description: 'Connect with local professionals', color: 'text-purple-600' },
        { name: 'Event Safety', path: '/communities?tab=events', icon: Calendar, description: 'Secure event planning', color: 'text-pink-600' },
        { name: 'Community Support', path: '/community-support', icon: Users, description: 'Local safety resources', color: 'text-teal-600' },
        { name: 'Community Hub', path: '/communities', icon: CheckCircle, description: 'Central community platform', color: 'text-emerald-600' }
      ]
    }
  ];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary-500" />
              <div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">LifeSync</span>
                <div className="text-xs text-gray-500 dark:text-gray-400" style={{ lineHeight: '1' }}>by Salatiso</div>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowToolsDropdown(!showToolsDropdown)}
                className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors"
              >
                <Grid3X3 className="h-4 w-4" />
                <span>Tools & Services</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {showToolsDropdown && (
                <div className="absolute top-full left-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 max-h-96 overflow-y-auto">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">LifeSync Ecosystem</h3>
                      <button
                        onClick={() => setSidebarExpanded(!sidebarExpanded)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {sidebarExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>

                    {toolsAndServices.map((category, categoryIndex) => (
                      <div key={categoryIndex} className={`mb-4 last:mb-0 ${category.bgColor} rounded-lg p-3`}>
                        <div className="flex items-center mb-3">
                          <div className={`w-4 h-4 rounded bg-gradient-to-r ${category.color} mr-2`}></div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{category.category}</h3>
                        </div>
                        <div className="space-y-1">
                          {category.items.map((item, itemIndex) => (
                            <Link
                              key={itemIndex}
                              to={item.path}
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
                              onClick={() => setShowToolsDropdown(false)}
                            >
                              <item.icon className={`h-5 w-5 ${item.color} group-hover:scale-110 transition-transform duration-200 flex-shrink-0`} />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-100">
                                  {item.name}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                                  {item.description}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="mt-4 p-3 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg border border-primary-200 dark:border-primary-700">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-5 w-5 text-primary-600" />
                        <div>
                          <div className="text-sm font-medium text-primary-800 dark:text-primary-200">People First</div>
                          <div className="text-xs text-primary-600 dark:text-primary-400">Safety, trust, and community</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Link to="/onboarding" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">
              {t('nav.getStarted') || 'Get Started'}
            </Link>
            {/* Prominent quick-action buttons: Follow Me Home, Incident Reporting, Emergency Assistance */}
            <Link
              to="/follow-me-home"
              className="hidden lg:inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:opacity-95 transition"
            >
              {t('nav.followMeHome') || 'Follow Me Home'}
            </Link>

            <Link
              to="/incident-reporting"
              className="hidden lg:inline-flex items-center px-4 py-2 rounded-md bg-yellow-500 text-white hover:opacity-95 transition"
            >
              {t('nav.incidentReporting') || 'Incident Reporting'}
            </Link>

            <Link
              to="/emergency-assistance"
              className="hidden lg:inline-flex items-center px-4 py-2 rounded-md bg-red-600 text-white hover:opacity-95 transition"
            >
              {t('nav.emergencyAssistance') || 'Emergency Assistance'}
            </Link>

            {/* Add Kids Zone and LifeSync Academy after Emergency Assistance */}
            <Link
              to="/kids-zone"
              className="hidden lg:inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:opacity-95 transition"
            >
              {t('nav.kidsZone') || 'Kids Zone'}
            </Link>

            <Link
              to="/lifesync-academy"
              className="hidden lg:inline-flex items-center px-4 py-2 rounded-md bg-emerald-600 text-white hover:opacity-95 transition"
            >
              {t('nav.lifeSyncAcademy') || 'LifeSync Academy'}
            </Link>

            {/* existing smaller links preserved for medium screens */}
            <div className="inline-flex lg:hidden space-x-4">
              <Link to="/follow-me-home" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">{t('nav.followMeHome') || 'Follow Me Home'}</Link>
              <Link to="/incident-reporting" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">{t('nav.incidentReporting') || 'Incident Reporting'}</Link>
              <Link to="/emergency-assistance" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">{t('nav.emergencyAssistance') || 'Emergency Assistance'}</Link>
              <Link to="/kids-zone" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">{t('nav.kidsZone') || 'Kids Zone'}</Link>
              <Link to="/lifesync-academy" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">{t('nav.lifeSyncAcademy') || 'LifeSync Academy'}</Link>
            </div>
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            {loading ? (
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            ) : user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-primary-100 dark:bg-primary-900/20 hover:bg-primary-200 dark:hover:bg-primary-900/40 transition-colors"
                >
                  <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                    {user.displayName || user.email?.split('@')[0] || 'Account'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </button>
                
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        Signed in as
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 break-words">
                        {user.email}
                      </div>
                      {user.displayName && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {user.displayName}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-2">
                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <Grid3X3 className="h-5 w-5 text-primary-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Dashboard</span>
                      </Link>
                      
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <User className="h-5 w-5 text-blue-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Profile</span>
                      </Link>
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="text-sm font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <a href="https://the-hub-lifecv.web.app/login" className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors">
                {t('nav.loginSignup')}
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
