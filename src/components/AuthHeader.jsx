/**
 * Authentication Header Component
 * Displays sign-in status and quick navigation
 * Shows: Signed in as [Name] | Dashboard | Login/Logout
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Home, LogIn, ChevronDown } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useGuestData } from '../contexts/GuestContext';
import { guestAccountService } from '../services/guestAccountService';

const AuthHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { guestData } = useGuestData();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Determine if user is authenticated
  const isGuest = guestAccountService.isGuestUser();
  const isAuthenticated = user || isGuest;

  // Get user display info
  let userDisplayName = 'Guest';
  let userEmail = '';

  if (isGuest && guestData?.profile) {
    userDisplayName = guestData.profile.firstName && guestData.profile.lastName
      ? `${guestData.profile.firstName} ${guestData.profile.lastName}`
      : 'Guest User';
    userEmail = guestData.profile.emails?.[0]?.address || 'local@lifesync.local';
  } else if (user) {
    userDisplayName = user.displayName || user.email?.split('@')[0] || 'User';
    userEmail = user.email || '';
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      if (isGuest) {
        // Clear guest data
        localStorage.removeItem('lifesync_guest');
        localStorage.removeItem('lifesync_guest_account');
        localStorage.removeItem('lifesync_guest_data');
      } else {
        // Firebase logout
        await signOut(auth);
      }
      setShowMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Ready to get started?</span>
            </div>
            <Link
              to="/guest-login"
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Signed in status */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-0">
              <span className="text-xs font-semibold opacity-90">Signed in as</span>
              <span className="text-sm font-bold truncate max-w-xs">{userDisplayName}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Dashboard shortcut */}
            <Link
              to="/dashboard"
              className="flex items-center gap-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium text-sm"
              title="Go to Dashboard"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            {/* User menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium text-sm"
              >
                <span className="hidden sm:inline">{userDisplayName.split(' ')[0]}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Dropdown menu */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-xl z-50">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="font-semibold text-sm">{userDisplayName}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{userEmail}</div>
                  </div>

                  <div className="py-2">
                    <Link
                      to="/dashboard"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                    >
                      <Home className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm text-red-600 dark:text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthHeader;
