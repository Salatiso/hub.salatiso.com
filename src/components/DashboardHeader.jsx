/**
 * DashboardHeader Component
 * Used on all authenticated pages
 * Features:
 * - Sidebar toggle button
 * - User menu with profile and logout
 * - Theme toggle
 * - Search bar (placeholder for Phase 3)
 * - Notifications (placeholder for Phase 3)
 * - Language selector
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Moon, Sun, Menu, X, LogOut, Settings, User as UserIcon, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import LanguageSelector from './LanguageSelector';

const DashboardHeader = ({ onSidebarToggle, sidebarCollapsed }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowUserMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get user display info
  const userDisplayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';
  const userPhotoURL = user?.photoURL;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo and Sidebar Toggle */}
          <div className="flex items-center space-x-4">
            {/* Sidebar toggle button */}
            <button
              onClick={onSidebarToggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle sidebar"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <Menu className="h-6 w-6" />
              ) : (
                <X className="h-6 w-6" />
              )}
            </button>

            {/* Brand - Hidden on mobile */}
            <Link to="/dashboard" className="hidden sm:flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Heart className="h-6 w-6 text-red-500" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">LifeSync</span>
            </Link>
          </div>

          {/* Center: Search (placeholder for Phase 3) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 placeholder-gray-400 text-sm">
              {t('search_placeholder', 'Search...')}
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Notifications (placeholder) */}
            <div ref={notificationsRef} className="relative hidden sm:block">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {/* Notification badge - can be updated dynamically */}
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Notifications Dropdown (Phase 3) */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-4 z-50">
                  <h3 className="font-semibold mb-3">{t('notifications')}</h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                    {t('no_notifications', 'No new notifications')}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* Language Selector */}
            <LanguageSelector />

            {/* User Menu */}
            {!loading && user && (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="User menu"
                >
                  {userPhotoURL ? (
                    <img 
                      src={userPhotoURL} 
                      alt={userDisplayName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
                      {userDisplayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                    {userDisplayName}
                  </span>
                </button>

                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-[9999] overflow-hidden border border-gray-200 dark:border-gray-600">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{userDisplayName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <UserIcon className="h-4 w-4" />
                        <span>{t('profile')}</span>
                      </Link>

                      <Link
                        to="/hub-settings"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>{t('settings')}</span>
                      </Link>

                      <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{t('logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
