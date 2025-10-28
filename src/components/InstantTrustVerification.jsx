import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import GuestContext from '../contexts/GuestContext';
import { auth, googleProvider } from '../firebase';

const InstantTrustVerification = () => {
  const { guestData, setGuestData } = useContext(GuestContext);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [userProfile, setUserProfile] = useState({
    name: '',
    surname: '',
    phone: '',
    vehicleInfo: {
      registration: '',
    },
    disclosureLevel: 1, // 1: Basic, 2: Standard, 3: Full
    shareLocation: true,
    role: 'Passenger',
    servicesRegistered: ['ride-sharing'],
  });

  const [authMethod, setAuthMethod] = useState(null); // 'google' or 'contact'
  const [currentUser, setCurrentUser] = useState(null);

  const disclosureLevels = [
    {
      level: 1,
      title: t('instantTrust.disclosureLevel.basic.title'),
      description: t('instantTrust.disclosureLevel.basic.description'),
      color: 'green',
      risk: t('instantTrust.disclosureLevel.basic.risk')
    },
    {
      level: 2,
      title: t('instantTrust.disclosureLevel.standard.title'),
      description: t('instantTrust.disclosureLevel.standard.description'),
      color: 'yellow',
      risk: t('instantTrust.disclosureLevel.standard.risk')
    },
    {
      level: 3,
      title: t('instantTrust.disclosureLevel.full.title'),
      description: t('instantTrust.disclosureLevel.full.description'),
      color: 'red',
      risk: t('instantTrust.disclosureLevel.full.risk')
    }
  ];

  const handleProfileUpdate = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContinue = () => {
    // Save the instant profile to guestData
    setGuestData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        name: userProfile.name,
        surname: userProfile.surname,
        phone: userProfile.phone,
        vehicleInfo: userProfile.vehicleInfo,
        disclosureLevel: userProfile.disclosureLevel,
        shareLocation: userProfile.shareLocation,
        role: userProfile.role,
        servicesRegistered: userProfile.servicesRegistered,
        authMethod: authMethod,
        // Include Firebase user data if available
        firebaseUser: auth.currentUser ? {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          displayName: auth.currentUser.displayName,
          photoURL: auth.currentUser.photoURL,
        } : null,
      }
    }));
    // Navigate to onboarding
    navigate('/onboarding');
  };

  const handleGoogleSignIn = async () => {
    try {
      setAuthMethod('google');
      
      if (!auth) {
        throw new Error('Firebase auth not initialized');
      }

      const result = await signInWithPopup(auth, googleProvider);
      if (!result?.user) {
        throw new Error('No user returned from Google sign-in');
      }
      
      const user = result.user;

      // Extract user information from Google account
      const displayName = user.displayName || '';
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Populate the form with Google account data
      setUserProfile(prev => ({
        ...prev,
        name: firstName,
        surname: lastName,
        phone: user.phoneNumber || prev.phone, // Google may not always provide phone
      }));

      // Set current user for UI display
      setCurrentUser(user);

      // Show success message
      alert(t('instantTrust.alerts.googleSignInSuccess', { name: displayName }));

    } catch (error) {
      console.error('Google sign-in error:', error);

      let errorMessage = t('instantTrust.alerts.googleSignInError.generic');
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = t('instantTrust.alerts.googleSignInError.popupClosed');
          break;
        case 'auth/popup-blocked':
          errorMessage = t('instantTrust.alerts.googleSignInError.popupBlocked');
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = t('instantTrust.alerts.googleSignInError.cancelled');
          break;
        default:
          errorMessage = t('instantTrust.alerts.googleSignInError.generic');
      }

      alert(errorMessage);
      setAuthMethod(null);
    }
  };

  const handleContactUpload = () => {
    try {
      // TODO: Implement contact upload functionality
      console.log('Initiating contact upload...');
      setAuthMethod('contact');
      // Create a file input for contact upload
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.vcf,.csv,.json';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          // TODO: Parse contact file and populate form
          console.log('Contact file selected:', file.name);
          alert(t('instantTrust.alerts.contactUpload', { fileName: file.name }));
        }
      };
      input.click();
    } catch (error) {
      console.error('Contact upload error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to Dashboard removed: sidebar provides navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <div className="space-y-6">
            <div className="text-center">
              <Users className="h-16 w-16 text-primary-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('instantTrust.createProfile.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {t('instantTrust.createProfile.subtitle')}{' '}
                <Link to="/onboarding" className="text-primary-600 hover:underline">
                  {t('nav.onboarding', 'go to Onboarding')}
                </Link>
                .
              </p>
            </div>

            {/* Authentication Options */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                {t('instantTrust.quickProfile.title')}
              </h3>

              {currentUser && authMethod === 'google' && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="flex items-center space-x-3">
                    {currentUser.photoURL && (
                      <img
                        src={currentUser.photoURL}
                        alt="Profile"
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        {t('instantTrust.quickProfile.signedInAs')} {currentUser.displayName}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-300">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                  onClick={handleGoogleSignIn}
                  disabled={currentUser && authMethod === 'google'}
                  className={`flex items-center justify-center space-x-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    currentUser && authMethod === 'google' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    {currentUser && authMethod === 'google' ? t('instantTrust.quickProfile.signedInWithGoogle') : t('instantTrust.quickProfile.signInWithGoogle')}
                  </span>
                </button>

                <button
                  onClick={handleContactUpload}
                  className="flex items-center justify-center space-x-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('instantTrust.quickProfile.uploadContact')}</span>
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
                {t('instantTrust.quickProfile.manualFill')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('instantTrust.personalInfo.title')}</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('instantTrust.personalInfo.name')}
                  </label>
                  <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) => handleProfileUpdate('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('instantTrust.personalInfo.surname')}
                  </label>
                  <input
                    type="text"
                    value={userProfile.surname}
                    onChange={(e) => handleProfileUpdate('surname', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('instantTrust.personalInfo.phoneNumber')}
                  </label>
                  <input
                    type="tel"
                    value={userProfile.phone}
                    onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <h4 className="font-semibold text-gray-900 dark:text-white">{t('instantTrust.vehicleInfo.title')}</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('instantTrust.vehicleInfo.registrationNumber')}
                  </label>
                  <input
                    type="text"
                    value={userProfile.vehicleInfo.registration}
                    onChange={(e) => handleProfileUpdate('vehicleInfo', { ...userProfile.vehicleInfo, registration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <h4 className="font-semibold text-gray-900 dark:text-white">{t('instantTrust.roleSelection.title')}</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('instantTrust.roleSelection.selectRole')}
                  </label>
                  <select
                    value={userProfile.role}
                    onChange={(e) => handleProfileUpdate('role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Passenger">{t('instantTrust.roleSelection.passenger')}</option>
                    <option value="Driver">{t('instantTrust.roleSelection.driver')}</option>
                    <option value="Service Provider">{t('instantTrust.roleSelection.serviceProvider')}</option>
                    <option value="Community Member">{t('instantTrust.roleSelection.communityMember')}</option>
                  </select>
                </div>

                <h4 className="font-semibold text-gray-900 dark:text-white">{t('instantTrust.services.title')}</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('instantTrust.services.selectServices')}
                  </label>
                  <div className="space-y-2">
                    {[
                      { key: 'rideSharing', value: 'ride-sharing' },
                      { key: 'hitchhikingSafety', value: 'hitchhiking-safety' },
                      { key: 'deliveryServices', value: 'delivery-services' },
                      { key: 'homeServices', value: 'home-services' },
                      { key: 'propertyManagement', value: 'property-management' }
                    ].map(service => (
                      <label key={service.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={userProfile.servicesRegistered.includes(service.value)}
                          onChange={(e) => {
                            const updatedServices = e.target.checked
                              ? [...userProfile.servicesRegistered, service.value]
                              : userProfile.servicesRegistered.filter(s => s !== service.value);
                            handleProfileUpdate('servicesRegistered', updatedServices);
                          }}
                          className="mr-2"
                        />
                        {t(`instantTrust.services.${service.key}`)}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('instantTrust.disclosureLevel.title')}</h3>

                {disclosureLevels.map((level) => (
                  <button
                    key={level.level}
                    onClick={() => handleProfileUpdate('disclosureLevel', level.level)}
                    className={`w-full p-4 border rounded-lg text-left transition-colors ${
                      userProfile.disclosureLevel === level.level
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                        : 'border-gray-200 dark:border-gray-600 hover:border-primary-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {level.title}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        level.color === 'green' ? 'bg-green-100 text-green-800' :
                        level.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {level.risk}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {level.description}
                    </p>
                  </button>
                ))}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="shareLocation"
                    checked={userProfile.shareLocation}
                    onChange={(e) => handleProfileUpdate('shareLocation', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="shareLocation" className="text-sm text-gray-700 dark:text-gray-300">
                    {t('instantTrust.shareLocation')}
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleContinue}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
              >
                {t('instantTrust.buttons.continue')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstantTrustVerification;