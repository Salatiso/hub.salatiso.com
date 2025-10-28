/**
 * User Context & Global State Management
 * Manages authenticated user and their data
 */

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import { UserProfile } from '../types/models';
import { firebaseService } from '../services/firebaseService';

interface UserContextType {
  // Authentication
  currentUser: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;

  // User Profile
  userProfile: UserProfile | null;
  profileLoading: boolean;
  profileError: string | null;

  // Actions
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Fetch user profile
        try {
          setProfileLoading(true);
          const profile = await firebaseService.getUserProfile(user.uid);
          setUserProfile(profile);
          setProfileError(null);

          // Set up real-time listener for profile changes
          const profileUnsubscribe = firebaseService.onUserProfileChange(user.uid, (updatedProfile) => {
            setUserProfile(updatedProfile);
          });

          return () => profileUnsubscribe();
        } catch (error) {
          setProfileError(error instanceof Error ? error.message : 'Failed to load profile');
          setUserProfile(null);
        } finally {
          setProfileLoading(false);
        }
      } else {
        setUserProfile(null);
        setProfileLoading(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Logout function
  const logout = async () => {
    try {
      await auth.signOut();
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      setProfileLoading(true);
      await firebaseService.updateUserProfile(currentUser.uid, data);
      setProfileError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setProfileError(errorMessage);
      throw error;
    } finally {
      setProfileLoading(false);
    }
  };

  const value: UserContextType = {
    currentUser,
    loading,
    isAuthenticated: !!currentUser,
    userProfile,
    profileLoading,
    profileError,
    logout,
    updateProfile,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * Hook to use User Context
 */
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}

/**
 * Hook to get current user ID
 */
export function useUserId() {
  const { currentUser } = useUser();
  return currentUser?.uid || null;
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated() {
  const { isAuthenticated } = useUser();
  return isAuthenticated;
}

/**
 * Hook to get user profile
 */
export function useUserProfile() {
  const { userProfile, profileLoading, profileError } = useUser();
  return {
    profile: userProfile,
    loading: profileLoading,
    error: profileError,
  };
}
