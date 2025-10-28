/**
 * ModernSidebar Component - Phase 2
 * Organized sidebar with sections:
 * - MAIN (Dashboard, LifeCV, Profile)
 * - PERSONAL (Contacts, Calendar, Assets, Projects, Career Paths)
 * - NETWORK (Communities, Connections, Family)
 * - TRUST & VERIFICATION (Instant Trust, Universal Trust, etc.)
 * - SETTINGS (Hub Settings, Profile Settings, Help)
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Grid3X3,
  FileText,
  User,
  Mail,
  Calendar,
  Package,
  Briefcase,
  TrendingUp,
  Users,
  Network,
  Shield,
  Home,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Heart,
} from 'lucide-react';

const ModernSidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    MAIN: true,
    PERSONAL: true,
    NETWORK: true,
    TRUST: true,
    SETTINGS: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Organized menu structure
  const sections = [
    {
      id: 'MAIN',
      label: 'Main',
      icon: Home,
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: Grid3X3 },
        { name: 'LifeCV', path: '/lifecv', icon: FileText },
        { name: 'Profile', path: '/profile', icon: User },
      ],
    },
    {
      id: 'PERSONAL',
      label: 'Personal',
      icon: Heart,
      items: [
        { name: 'Contacts', path: '/contacts', icon: Mail },
        { name: 'Calendar', path: '/calendar', icon: Calendar },
        { name: 'Assets', path: '/assets', icon: Package },
        { name: 'Projects', path: '/projects', icon: Briefcase },
        { name: 'Career Paths', path: '/career-paths', icon: TrendingUp },
      ],
    },
    {
      id: 'NETWORK',
      label: 'Network',
      icon: Network,
      items: [
        { name: 'Communities', path: '/communities', icon: Users },
        { name: 'Local Networking', path: '/local-networking', icon: Network },
        { name: 'Family', path: '/family', icon: Home },
        { name: 'Follow Me Home', path: '/follow-me-home', icon: Users },
      ],
    },
    {
      id: 'TRUST',
      label: 'Trust & Verification',
      icon: Shield,
      items: [
        { name: 'Instant Trust', path: '/instant-trust', icon: Shield },
        { name: 'Universal Trust', path: '/universal-trust', icon: Shield },
        { name: 'Trust Safety', path: '/trust-safety', icon: Shield },
        { name: 'Emergency Sync', path: '/emergency-sync', icon: Shield },
      ],
    },
    {
      id: 'SETTINGS',
      label: 'Settings',
      icon: Settings,
      items: [
        { name: 'Hub Settings', path: '/hub-settings', icon: Settings },
        { name: 'Safety Help', path: '/safety-help', icon: HelpCircle },
        { name: 'Help & Support', path: '/hub-settings', icon: HelpCircle },
      ],
    },
  ];

  // Collapsed sidebar - just show icons
  if (collapsed) {
    return (
      <div className="fixed left-0 top-0 h-screen w-20 bg-gray-800 border-r border-gray-700 z-40 flex flex-col items-center py-4 space-y-4 shadow-lg">
        {/* Logo */}
        <div className="flex items-center justify-center h-16">
          <Heart className="h-6 w-6 text-red-500" />
        </div>

        {/* Section Icons */}
        <div className="flex-1 flex flex-col space-y-2 w-full">
          {sections.map((section) => (
            <div key={section.id} className="flex flex-col space-y-1 px-2">
              {section.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  title={item.name}
                  className={`flex items-center justify-center p-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors mb-4"
          title="Expand sidebar"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    );
  }

  // Full sidebar
  return (
    <div className="fixed left-0 top-0 h-screen w-72 bg-gray-800 text-white border-r border-gray-700 shadow-lg z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center space-x-2">
          <Heart className="h-6 w-6 text-red-500" />
          <span className="text-xl font-bold">LifeSync</span>
        </div>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
          title="Collapse sidebar"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
        {sections.map((section) => (
          <div key={section.id} className="mb-4">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white transition-colors"
            >
              <div className="flex items-center space-x-2">
                <section.icon className="h-4 w-4" />
                <span>{section.label}</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  expandedSections[section.id] ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>

            {/* Section Items */}
            {expandedSections[section.id] && (
              <div className="mt-2 space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="px-4 py-3 border-t border-gray-700 bg-gray-900 text-xs text-gray-400">
        <p className="truncate">Salatiso Ecosystem</p>
        <p className="text-gray-500 mt-1">v2.0 - Phase 2</p>
      </div>
    </div>
  );
};

export default ModernSidebar;
