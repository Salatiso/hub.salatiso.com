import { useState, useContext, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  Car,
  Home as HomeIcon,
  Users,
  Heart,
  Briefcase,
  MapPin,
  AlertTriangle,
  Settings,
  User,
  ChevronRight,
  Grid3X3,
  Zap,
  FileText,
  CreditCard,
  Scale,
  Building,
  Phone,
  Mail,
  Calendar,
  BarChart3,
  BookOpen,
  CalendarClock,
  Plus,
  QrCode
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GuestManagement from './GuestManagement';
import GuestContext from '../contexts/GuestContext';
import { createSealEvent } from '../utils/sealEvents';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { announceToScreenReader } from '../utils/keyboardUtils';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Default open; persist user choice
    const saved = localStorage.getItem('lifesync_dashboard_sidebar_open');
    return saved ? JSON.parse(saved) : true;
  });
  const [categoryCollapsed, setCategoryCollapsed] = useState(() => {
    // Default expanded for all categories; restored from storage if available
    try {
      const saved = localStorage.getItem('lifesync_dashboard_category_collapsed');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  
  // Keyboard navigation state
  const [focusedItemIndex, setFocusedItemIndex] = useState(0);
  const itemRefs = useRef([]);

  // Persist sidebar open/collapsed state
  useEffect(() => {
    try {
      localStorage.setItem('lifesync_dashboard_sidebar_open', JSON.stringify(sidebarOpen));
    } catch {}
  }, [sidebarOpen]);

  // Focus management when active tab or focused index changes
  useEffect(() => {
    if (itemRefs.current[focusedItemIndex]) {
      itemRefs.current[focusedItemIndex]?.focus();
    }
  }, [focusedItemIndex, activeTab]);

  const toggleCategory = (categoryName) => {
    setCategoryCollapsed(prev => {
      const next = { ...prev, [categoryName]: !prev[categoryName] };
      try { localStorage.setItem('lifesync_dashboard_category_collapsed', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const location = useLocation();
  const { t } = useTranslation();
  const { guestData, setGuestData } = useContext(GuestContext);
  const navigate = useNavigate();

  // Keyboard shortcuts for dashboard navigation
  useKeyboardShortcuts([
    {
      key: 'ArrowDown',
      handler: (e) => {
        e.preventDefault();
        setFocusedItemIndex((prev) => {
          const nextIndex = Math.min(prev + 1, itemRefs.current.length - 1);
          itemRefs.current[nextIndex]?.focus();
          announceToScreenReader(`Navigated to item ${nextIndex + 1} of ${itemRefs.current.length}`, 'polite');
          return nextIndex;
        });
      },
      preventDefault: true,
    },
    {
      key: 'ArrowUp',
      handler: (e) => {
        e.preventDefault();
        setFocusedItemIndex((prev) => {
          const nextIndex = Math.max(prev - 1, 0);
          itemRefs.current[nextIndex]?.focus();
          announceToScreenReader(`Navigated to item ${nextIndex + 1} of ${itemRefs.current.length}`, 'polite');
          return nextIndex;
        });
      },
      preventDefault: true,
    },
    {
      key: 'Home',
      handler: (e) => {
        e.preventDefault();
        setFocusedItemIndex(0);
        itemRefs.current[0]?.focus();
        announceToScreenReader('Navigated to first item', 'polite');
      },
      preventDefault: true,
    },
    {
      key: 'End',
      handler: (e) => {
        e.preventDefault();
        const lastIndex = itemRefs.current.length - 1;
        setFocusedItemIndex(lastIndex);
        itemRefs.current[lastIndex]?.focus();
        announceToScreenReader('Navigated to last item', 'polite');
      },
      preventDefault: true,
    },
    {
      key: 'Tab',
      modifiers: { altKey: true },
      handler: (e) => {
        e.preventDefault();
        setActiveTab(activeTab === 'personal' ? 'professional' : 'personal');
        announceToScreenReader(`Switched to ${activeTab === 'personal' ? 'professional' : 'personal'} tab`, 'assertive');
        setFocusedItemIndex(0);
      },
      preventDefault: true,
    }
  ]);

  const personalTools = [
    {
      category: 'Trust Safety',
      icon: Shield,
  collapsed: false,
      items: [
        { name: 'Instant Trust Verification', path: '/instant-trust', icon: Shield, description: 'Multi-step safety verification' },
        { name: 'Universal Trust', path: '/universal-trust', icon: Zap, description: 'Cross-platform trust layer' },
        { name: 'Emergency Sync', path: '/emergency-sync', icon: AlertTriangle, description: 'Emergency response coordination' },
        { name: 'Household Management', path: '/household-management', icon: HomeIcon, description: 'Family safety and communication' },
        { name: 'Community Governance', path: '/community-governance', icon: Users, description: 'Community voting and incident reporting' },
        { name: 'Incident Reporting', path: '/incident-reporting', icon: AlertTriangle, description: 'Multi-party validation system' }
      ]
    },
    {
      category: 'Transportation',
      icon: Car,
  collapsed: false,
      items: [
        { name: 'Ride Sharing', path: '/ride-sharing', icon: Car, description: 'Safe transportation services' },
        { name: 'Hitchhiking Safety', path: '/hitchhiking-safety', icon: MapPin, description: 'GPS-tracked safe rides' },
        { name: 'Delivery Services', path: '/delivery-services', icon: HomeIcon, description: 'Verified parcel delivery' }
      ]
    },
    {
      category: 'Home Services',
      icon: HomeIcon,
  collapsed: false,
      items: [
        { name: 'Home Services', path: '/home-services', icon: HomeIcon, description: 'Verified contractors' },
        { name: 'Property Management', path: '/property-management', icon: Building, description: 'Rental and property services' },
        { name: 'Ekhaya', path: 'https://ekhaya-lifecv.web.app', icon: HomeIcon, external: true, description: 'Location-based services' }
      ]
    },
    {
      category: 'Community',
      icon: Users,
  collapsed: false,
      items: [
        { name: 'Local Networking', path: '/local-networking', icon: Users, description: 'Connect with local professionals' },
        { name: 'Event Safety', path: '/event-safety', icon: Calendar, description: 'Secure event planning' },
        { name: 'Community Support', path: '/community-support', icon: Heart, description: 'Local safety resources' },
        { name: 'Family Tree', path: '/family-tree', icon: Users, description: 'Interactive family tree and timeline' }
      ]
    },
    {
      category: 'SafetyHelp',
      icon: Shield,
  collapsed: false,
      items: [
        { name: 'Safety Dashboard', path: '/safety-help', icon: Shield, description: 'QR safety seals and emergency response' },
        { name: 'Create Safety Seal', path: '/community-governance?tab=events&action=create', icon: QrCode, description: 'Generate QR codes for safety induction' },
        { name: 'Incident Reporting', path: '/incident-reporting', icon: AlertTriangle, description: 'Report safety incidents and emergencies' },
        { name: 'Emergency Assistance', path: '/emergency-assistance', icon: Phone, description: 'Emergency response and support' }
      ]
    }
  ];

  const professionalTools = [
    {
      category: 'Business Tools',
      icon: Briefcase,
      items: [
        { name: 'Professional Dashboard', path: '/professional-dashboard', icon: BarChart3, description: 'Business analytics and management' },
        { name: 'Business Networking', path: '/business-networking', icon: Users, description: 'Professional connections' },
        { name: 'BizHelp', path: 'https://bizhelp-lifecv.web.app', icon: Briefcase, external: true, description: 'Business assistance services' }
      ]
    },
    {
      category: 'Legal & Financial',
      icon: Scale,
      items: [
        { name: 'Legal Help', path: 'https://legalhelp-lifecv.web.app', icon: Scale, external: true, description: 'Legal assistance services' },
        { name: 'Financial Help', path: 'https://finhelp-lifecv.web.app', icon: CreditCard, external: true, description: 'Financial services' },
        { name: 'Document Help', path: 'https://dochelp-lifecv.web.app', icon: FileText, external: true, description: 'Document services' }
      ]
    },
    {
      category: 'Human Resources',
      icon: User,
      items: [
        { name: 'HR Help', path: 'https://hrhelp-lifecv.web.app', icon: User, external: true, description: 'Human resources services' },
        { name: 'Talent Management', path: '/talent-management', icon: Users, description: 'Staffing and recruitment' },
        { name: 'Training & Development', path: '/training-development', icon: BookOpen, description: 'Professional development' }
      ]
    },
    {
      category: 'Communication',
      icon: Phone,
      items: [
        { name: 'Secure Messaging', path: '/secure-messaging', icon: Mail, description: 'Encrypted communication' },
        { name: 'Video Conferencing', path: '/video-conferencing', icon: Phone, description: 'Secure video calls' },
        { name: 'Collaboration Tools', path: '/collaboration-tools', icon: Users, description: 'Team collaboration' }
      ]
    }
  ];

  const currentTools = activeTab === 'personal' ? personalTools : professionalTools;

  let itemCount = 0;

  const renderToolItem = (item, index) => {
    const currentIndex = itemCount++;
    const isActive = location.pathname === item.path;
    const isDisabled = item.disabled;
    const isFocused = focusedItemIndex === currentIndex;
    const content = (
      <div className={`flex items-center space-x-3 p-3 rounded-lg transition-all cursor-pointer focus:outline-none ${
        isDisabled
          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          : isActive
          ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
      } ${isFocused ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}>
        <item.icon className="h-5 w-5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{item.name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{item.description}</div>
        </div>
        {item.external && <ChevronRight className="h-4 w-4 text-gray-400" />}
      </div>
    );

    if (isDisabled) {
      return (
        <div key={item.name} className="block">
          {content}
        </div>
      );
    }

    if (item.external) {
      return (
        <a
          key={item.name}
          ref={(el) => {
            if (el) itemRefs.current[currentIndex] = el;
          }}
          href={item.path}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={isFocused ? 0 : -1}
          onFocus={() => setFocusedItemIndex(currentIndex)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              window.open(item.path, '_blank');
            }
          }}
          aria-label={`${item.name}. ${item.description}. Opens in new window.`}
          className="block focus:outline-none"
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        key={item.name}
        ref={(el) => {
          if (el) itemRefs.current[currentIndex] = el;
        }}
        to={item.path}
        tabIndex={isFocused ? 0 : -1}
        onFocus={() => setFocusedItemIndex(currentIndex)}
        aria-label={`${item.name}. ${item.description}`}
        className="block focus:outline-none"
      >
        {content}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-80' : 'w-16'} bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Grid3X3 className="h-6 w-6 text-primary-500" />
                {sidebarOpen && <span className="font-bold text-lg">Dashboard</span>}
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <ChevronRight className={`h-5 w-5 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          {sidebarOpen && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg" role="tablist">
                <button
                  role="tab"
                  aria-selected={activeTab === 'personal'}
                  aria-controls="personal-panel"
                  onClick={() => {
                    setActiveTab('personal');
                    announceToScreenReader('Personal tab selected', 'assertive');
                    setFocusedItemIndex(0);
                    itemCount = 0;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                      e.preventDefault();
                      setActiveTab('professional');
                      announceToScreenReader('Professional tab selected', 'assertive');
                    }
                  }}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    activeTab === 'personal'
                      ? 'bg-white dark:bg-gray-600 text-primary-700 dark:text-primary-300 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  Personal
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === 'professional'}
                  aria-controls="professional-panel"
                  onClick={() => {
                    setActiveTab('professional');
                    announceToScreenReader('Professional tab selected', 'assertive');
                    setFocusedItemIndex(0);
                    itemCount = 0;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                      e.preventDefault();
                      setActiveTab('personal');
                      announceToScreenReader('Personal tab selected', 'assertive');
                    }
                  }}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    activeTab === 'professional'
                      ? 'bg-white dark:bg-gray-600 text-primary-700 dark:text-primary-300 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  Professional
                </button>
              </div>
            </div>
          )}

          {/* Tools and Services */}
          <div className="flex-1 overflow-y-auto">
            {sidebarOpen ? (
              <div className="p-4 space-y-6">
                {currentTools.map((category) => (
                  <div key={category.category} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                    <button
                      onClick={() => toggleCategory(category.category)}
                      aria-label={`${category.category}. ${categoryCollapsed[category.category] ? 'Collapsed' : 'Expanded'}. Press Enter to toggle.`}
                      aria-expanded={!categoryCollapsed[category.category]}
                      className="flex items-center justify-between w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <div className="flex items-center space-x-2">
                        <category.icon className="h-5 w-5 text-primary-500 flex-shrink-0" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">{category.category}</h3>
                      </div>
                      <ChevronRight className={`h-4 w-4 transition-transform flex-shrink-0 ${categoryCollapsed[category.category] ? '' : 'rotate-90'}`} />
                    </button>
                    {!categoryCollapsed[category.category] && (
                      <div className="mt-3 space-y-2 ml-7">
                        {category.items.map((item, idx) => renderToolItem(item, idx))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2 space-y-3">
                {currentTools.map((category) => (
                  <div key={category.category} className="text-center">
                    <button
                      onClick={() => toggleCategory(category.category)}
                      className="flex items-center justify-center w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                      title={category.category}
                    >
                      <category.icon className="h-6 w-6 text-primary-500 group-hover:scale-110 transition-transform" />
                    </button>
                    {!categoryCollapsed[category.category] && (
                      <div className="mt-2 space-y-1">
                        {category.items.map((item) => (
                          item.disabled ? (
                            <div
                              key={item.name}
                              className="flex items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                              title={item.name}
                            >
                              <item.icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                          ) : (
                            <Link
                              key={item.name}
                              to={item.path}
                              className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              title={item.name}
                            >
                              <item.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </Link>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Guest session & backup/restore panel */}
            <div className="mb-6">
              <GuestManagement />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
              <div className="text-center">
                <Grid3X3 className="h-16 w-16 text-primary-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {activeTab === 'personal' ? 'Personal Dashboard' : 'Professional Dashboard'}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  {activeTab === 'personal'
                    ? 'Access all your personal tools and services for safety, transportation, and community connections.'
                    : 'Manage your professional tools, business networking, and enterprise services.'
                  }
                </p>

                {/* Quick Safety Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold flex items-center"><Shield className="h-5 w-5 mr-2"/>LifeSync Seal</div>
                      <button
                        onClick={() => {
                          const evt = createSealEvent(guestData, setGuestData, { title: 'Follow Me Home', mode: 'group' });
                          navigate(`/seal/${evt.id}`);
                        }}
                        className="px-2 py-1 bg-primary-600 text-white rounded text-sm flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1"/>Create
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Create a shareable safety link for events like walking home, rides, or meetups.</div>
                    {guestData.sealEvents && guestData.sealEvents.length > 0 && (
                      <div className="mt-3 text-sm">
                        <div className="font-medium mb-1">Recent</div>
                        <ul className="space-y-1">
                          {guestData.sealEvents.slice(0,3).map(e => (
                            <li key={e.id}>
                              <Link className="text-primary-600" to={`/seal/${e.id}`}>{e.title} — {e.status}</Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                          <div className="font-semibold flex items-center mb-2"><Settings className="h-5 w-5 mr-2"/>The Hub</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Configure The Hub connection for invitations and contact sync.</div>
                          <Link to="/hub-settings" className="inline-block mt-3 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">Open Settings</Link>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                    <div className="font-semibold flex items-center mb-2"><MapPin className="h-5 w-5 mr-2"/>Geofencing</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Define safe zones and get alerts when entering/leaving.</div>
                    <Link to="/geofencing" className="inline-block mt-3 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">Manage</Link>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                    <div className="font-semibold flex items-center mb-2"><CalendarClock className="h-5 w-5 mr-2"/>Check-ins</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Schedule safety check-ins and confirmations.</div>
                    <Link to="/check-ins" className="inline-block mt-3 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">Manage</Link>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                    <div className="font-semibold flex items-center mb-2"><Users className="h-5 w-5 mr-2"/>Contacts & Family</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Import contacts, tag relationships, and build your family tree.</div>
                    <div className="mt-3 flex gap-2">
                      <Link to="/contacts/import" className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">Import Contacts</Link>
                      <Link to="/family-tree" className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">View Family Tree</Link>
                    </div>
                  </div>
                </div>

                {/* Category Summaries */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {currentTools.slice(0, 6).map((category) => (
                    <div key={category.category} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                      <category.icon className="h-8 w-8 text-primary-500 mb-3" />
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{category.category}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {category.items.length} tools available
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Quick Actions
                  </h2>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Link
                      to="/instant-trust"
                      className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                    >
                      <Shield className="h-5 w-5" />
                      <span>Start Trust Verification</span>
                    </Link>
                    <Link
                      to="/universal-trust"
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <Zap className="h-5 w-5" />
                      <span>Universal Trust</span>
                    </Link>
                    <Link
                      to="/emergency-sync"
                      className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <AlertTriangle className="h-5 w-5" />
                      <span>Emergency Sync</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
