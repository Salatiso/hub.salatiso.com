/**
 * ProfileWidget - Real Data Integration (Phase 3)
 * Displays user profile with real-time data from Firestore
 */

import React from 'react';
import { User, Edit3, Loader, AlertCircle } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { useUser } from '../../context/UserContext';

export default function ProfileWidget() {
  const { userProfile, profileLoading, profileError } = useUser();

  if (profileError) {
    return (
      <WidgetCard icon={AlertCircle} title="Profile" className="col-span-full sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-center h-40">
          <div className="text-center text-red-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">{profileError}</p>
          </div>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard icon={User} title="Profile" className="col-span-full sm:col-span-2 lg:col-span-1">
      {profileLoading ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2">
          <Loader className="w-6 h-6 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Loading profile...</p>
        </div>
      ) : userProfile ? (
        <div className="space-y-4">
          {/* Profile Photo and Basic Info */}
          <div className="flex items-center gap-4">
            {userProfile.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={userProfile.displayName || 'User'}
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {userProfile.displayName || 'User'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{userProfile.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs rounded-full font-medium">
                  {userProfile.verificationStatus || 'unverified'}
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {userProfile.bio && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300 italic">{userProfile.bio}</p>
            </div>
          )}

          {/* Trust Score */}
          {userProfile.trustScore !== undefined && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trust Score</span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {userProfile.trustScore}%
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${userProfile.trustScore}%` }}
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
            <p>Member since: {userProfile.createdAt instanceof Date ? userProfile.createdAt.toLocaleDateString() : 'N/A'}</p>
            <p>Last updated: {userProfile.updatedAt instanceof Date ? userProfile.updatedAt.toLocaleDateString() : 'N/A'}</p>
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
