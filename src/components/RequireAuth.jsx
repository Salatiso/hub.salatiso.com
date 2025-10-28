import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import GuestContext from '../contexts/GuestContext';
import { Lock, User } from 'lucide-react';

const RequireAuth = ({
  children,
  feature = 'this feature',
  fallback = null,
  showUpgrade = true,
  allowGuest = false
}) => {
  const { guestData } = useContext(GuestContext);
  const navigate = useNavigate();

  // Check if user is authenticated (has owner with uid)
  const isAuthenticated = !!(guestData?.owner?.uid);
  const hasGuestSession = !!guestData?.createdAt || guestData?.profile?.mode === 'guest';
  const isAllowed = isAuthenticated || (allowGuest && hasGuestSession);

  // If authenticated, show the feature
  if (isAllowed) {
    return children;
  }

  // If not authenticated and no fallback provided, show upgrade prompt
  if (!fallback && showUpgrade) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 my-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
            <Lock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Sign In Required
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              To access {feature}, you need to create a LifeSync account. Your guest data will be preserved and synced across devices.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/auth')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Sign In / Register
              </button>
              <button
                onClick={() => navigate('/onboarding')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Complete Profile
              </button>
              {allowGuest && (
                <button
                  onClick={() => navigate('/')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Start as Guest
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Return fallback or null
  return fallback;
};

export default RequireAuth;