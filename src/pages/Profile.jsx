import { useState, useEffect, useCallback } from 'react';
import { useContext } from 'react';
import { auth } from '../config/firebase';
import GuestContext from '../contexts/GuestContext';
import { Edit2, Save, X, Upload, LogOut } from 'lucide-react';
import { getPageContainerClasses, getPageTitleClasses, getPageHeaderClasses } from '../utils/layoutHelpers';

/**
 * Profile Page
 * Allows users to view and edit their profile information
 * Includes profile picture, bio, contact information, and account settings
 */
export default function Profile() {
  const { guestData, updateGuestData } = useContext(GuestContext);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: guestData?.firstName || '',
    lastName: guestData?.lastName || '',
    email: auth.currentUser?.email || '',
    phone: guestData?.phone || '',
    bio: guestData?.bio || '',
    location: guestData?.location || '',
    avatar: guestData?.avatar || null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Handle avatar upload
  const handleAvatarChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileData(prev => ({ ...prev, avatar: event.target?.result }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Save profile changes
  const handleSaveProfile = useCallback(async () => {
    setIsSaving(true);
    try {
      updateGuestData(prev => ({
        ...prev,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        bio: profileData.bio,
        location: profileData.location,
        avatar: profileData.avatar,
      }));
      setSaveMessage('Profile saved successfully!');
      setIsEditing(false);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error saving profile');
      console.error('Profile save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [profileData, updateGuestData]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  return (
    <div className={getPageContainerClasses({ fullWidth: false })}>
      {/* Header */}
      <div className={getPageHeaderClasses()}>
        <h1 className={getPageTitleClasses()}>Profile</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            aria-label="Edit profile"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Messages */}
      {saveMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg">
          {saveMessage}
        </div>
      )}

      {/* Profile Content */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center mb-4">
            {profileData.avatar ? (
              <img src={profileData.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                {profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}
              </div>
            )}
          </div>
          {isEditing && (
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>Upload Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                aria-label="Upload profile picture"
              />
            </label>
          )}
        </div>

        {/* Name Section */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="firstName"
                value={profileData.firstName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="First name"
              />
            ) : (
              <p className="px-3 py-2 text-gray-900">{profileData.firstName || 'Not set'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="lastName"
                value={profileData.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Last name"
              />
            ) : (
              <p className="px-3 py-2 text-gray-900">{profileData.lastName || 'Not set'}</p>
            )}
          </div>
        </div>

        {/* Email Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <p className="px-3 py-2 text-gray-900 bg-gray-50 rounded-lg">
            {profileData.email}
          </p>
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        {/* Phone Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          {isEditing ? (
            <input
              type="tel"
              name="phone"
              value={profileData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Phone number"
            />
          ) : (
            <p className="px-3 py-2 text-gray-900">{profileData.phone || 'Not set'}</p>
          )}
        </div>

        {/* Location Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          {isEditing ? (
            <input
              type="text"
              name="location"
              value={profileData.location}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Location"
            />
          ) : (
            <p className="px-3 py-2 text-gray-900">{profileData.location || 'Not set'}</p>
          )}
        </div>

        {/* Bio Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          {isEditing ? (
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Bio"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p className="px-3 py-2 text-gray-900 whitespace-pre-wrap">{profileData.bio || 'Not set'}</p>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setIsEditing(false);
                setProfileData({
                  firstName: guestData?.firstName || '',
                  lastName: guestData?.lastName || '',
                  email: auth.currentUser?.email || '',
                  phone: guestData?.phone || '',
                  bio: guestData?.bio || '',
                  location: guestData?.location || '',
                  avatar: guestData?.avatar || null,
                });
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Cancel editing"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              aria-label="Save profile changes"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Logout Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full justify-center"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
