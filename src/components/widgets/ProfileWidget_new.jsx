/**
 * ProfileWidget - Real Data Integration (Phase 3)
 * Displays user profile with real-time data from Firestore or local guest data
 */

import React from 'react';
import { User, Edit3, Loader, AlertCircle } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { useUser } from '../../context/UserContext';
import { useGuestData } from '../../contexts/GuestContext';
import { guestAccountService } from '../../services/guestAccountService';

export default function ProfileWidget() {
  const { userProfile, profileLoading, profileError } = useUser();
  const { guestData } = useGuestData();
  const isGuest = guestAccountService.isGuestUser();

  // Determine what profile to display
  let displayProfile = null;
  let displayLoading = false;
  let displayError = null;
  let displayName = 'User';
  let displayEmail = '';

  if (isGuest) {
    // Use guest profile data
    const guestAccount = guestAccountService.getGuestAccount();
    if (guestAccount) {
      displayName = guestAccount.firstName && guestAccount.lastName 
        ? `${guestAccount.firstName} ${guestAccount.lastName}`
        : guestAccount.displayName || 'Guest User';
      displayEmail = guestAccount.email || 'local@lifesync.local';
      
      displayProfile = {
        displayName: displayName,
        email: displayEmail,
        trustScore: guestData?.trustScore || 0,
        bio: guestData?.profile?.bio || null,
        verificationStatus: guestData?.verifications?.length > 0 ? 'verified' : 'unverified',
        photoURL: null,
        createdAt: new Date(guestAccount.createdAt),
        updatedAt: new Date(guestData?.lastUpdated || guestAccount.createdAt),
      };
    } else {
      displayProfile = {
        displayName: 'Guest User',
        email: 'local@lifesync.local',
        trustScore: 0,
        bio: null,
        verificationStatus: 'unverified',
        photoURL: null,
      };
    }
  } else {
    // Use Firebase profile data
    displayProfile = userProfile;
    displayLoading = profileLoading;
    displayError = profileError;
  }

  if (displayError) {
    return (
      <WidgetCard icon={AlertCircle} title="Profile" className="col-span-full sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-center h-40">
          <div className="text-center text-red-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">{displayError}</p>
          </div>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard icon={User} title="Profile" className="col-span-full sm:col-span-2 lg:col-span-1">
      {displayLoading ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2">
          <Loader className="w-6 h-6 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Loading profile...</p>
        </div>
      ) : displayProfile ? (
        <div className="space-y-4">
          {/* Profile Photo and Basic Info */}
          <div className="flex items-center gap-4">
            {displayProfile.photoURL ? (
              <img
                src={displayProfile.photoURL}
                alt={displayProfile.displayName || 'User'}
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {displayProfile.displayName || 'User'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{displayProfile.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs rounded-full font-medium">
                  {displayProfile.verificationStatus || 'unverified'}
                </span>
                {isGuest && (
                  <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 text-xs rounded-full font-medium">
                    Local
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {displayProfile.bio && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300 italic">{displayProfile.bio}</p>
            </div>
          )}

          {/* Trust Score */}
          {displayProfile.trustScore !== undefined && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trust Score</span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {displayProfile.trustScore}%
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${displayProfile.trustScore}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <a
              href="/profile"
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-200 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors text-sm font-medium"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </a>
          </div>

          {/* Meta Info */}
          <div className="pt-2 text-xs text-gray-400 dark:text-gray-500 space-y-1">
            <p>Member since: {displayProfile.createdAt instanceof Date ? displayProfile.createdAt.toLocaleDateString() : 'N/A'}</p>
            <p>Last updated: {displayProfile.updatedAt instanceof Date ? displayProfile.updatedAt.toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-40 gap-2">
          <User className="w-12 h-12 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No profile data</p>
          <a
            href="/profile"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Create profile
          </a>
        </div>
      )}
    </WidgetCard>
  );
}
