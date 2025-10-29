import { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getLifeCVProfile } from '../utils/firebaseProfile';
import { fromLifeCV } from '../utils/lifecvAdapter';
import GuestContext from '../contexts/GuestContext';
import { Mail, Lock, User, ArrowLeft, CheckCircle, Users } from 'lucide-react';
import { guestAccountService } from '../services/guestAccountService';

const Auth = () => {
  const { guestData, setGuestData } = useContext(GuestContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'register' : 'signin'); // 'signin' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check for redirect result on component mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          setLoading(true);
          const user = result.user;

          // Try to load existing LifeCV profile
          try {
            const remote = await getLifeCVProfile(user.uid);
            if (remote) {
              const mapped = fromLifeCV(remote);
              setGuestData(prev => ({
                ...prev,
                profile: {
                  ...prev.profile,
                  ...mapped,
                  deviceType: prev.profile?.deviceType || 'mobile'
                },
                owner: { uid: user.uid, source: 'lifesync' },
                role: mapped.role || prev.role,
                servicesRegistered: mapped.servicesRegistered?.length ? mapped.servicesRegistered : prev.servicesRegistered,
              }));
            } else {
              // New user, initialize with basic profile
              setGuestData(prev => ({
                ...prev,
                profile: {
                  ...prev.profile,
                  firstName: user.displayName ? user.displayName.split(' ')[0] : '',
                  lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
                  emails: [{ id: 1, address: user.email, label: 'Personal' }],
                  deviceType: prev.profile?.deviceType || 'mobile'
                },
                owner: { uid: user.uid, source: 'lifesync' }
              }));
            }
          } catch (profileError) {
            console.warn('Failed to load LifeCV profile, using basic profile', profileError);
            // Still proceed with basic profile even if Firestore read fails
            setGuestData(prev => ({
              ...prev,
              profile: {
                ...prev.profile,
                firstName: user.displayName ? user.displayName.split(' ')[0] : '',
                lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
                emails: [{ id: 1, address: user.email, label: 'Personal' }],
                deviceType: prev.profile?.deviceType || 'mobile'
              },
              owner: { uid: user.uid, source: 'lifesync' }
            }));
          }

          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Redirect sign-in error:', err);
        if (err.code !== 'auth/popup-closed-by-user') {
          setError(err.message || 'Failed to complete sign-in. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    checkRedirectResult();
  }, [navigate, setGuestData]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!auth) {
        throw new Error('Firebase auth not initialized');
      }

      const provider = new GoogleAuthProvider();
      // Set scopes for additional data
      provider.addScope('profile');
      provider.addScope('email');
      
      // Use redirect instead of popup to avoid COOP issues
      await signInWithRedirect(auth, provider);
      // After redirect, the user will be handled by getRedirectResult in useEffect
    } catch (err) {
      console.error('Google sign-in failed', err);
      setError(err.message || 'Failed to sign in with Google. Please try again.');
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // CRITICAL: Terms of Reciprocity must be accepted for signup
    if (mode === 'register' && !termsAccepted) {
      setError('You must accept the Terms of Reciprocity to create an account');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (mode === 'register') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      // User will be handled by the auth state change listener in App.jsx
      navigate('/dashboard');
    } catch (err) {
      console.error('Email auth failed', err);
      if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {mode === 'signin' ? 'Welcome back!' : 'Join the LifeSync community'}
          </p>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mb-6 flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or</span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>
          )}

          {/* CRITICAL: Terms of Reciprocity Acceptance - Required for signup */}
          {mode === 'register' && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms-checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  required
                />
                <label htmlFor="terms-checkbox" className="text-sm text-amber-800 dark:text-amber-200 cursor-pointer flex-1">
                  <span className="font-medium">I accept the Terms of Reciprocity</span>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    By creating an account, you agree to the principles of mutual respect, fair exchange, and community responsibility.{' '}
                    <a href="/terms/reciprocity" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900 dark:hover:text-amber-100">
                      Read full terms
                    </a>
                  </p>
                </label>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (mode === 'register' && !termsAccepted)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Mode Toggle */}
        <div className="mt-6 text-center space-y-3">
          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'register' : 'signin');
              setError('');
            }}
            className="w-full text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or</span>
            </div>
          </div>

          {/* Local Account Button */}
          <button
            onClick={() => navigate('/guest-login')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg transition-all font-medium"
          >
            <Users className="w-5 h-5" />
            Create a Local Account
          </button>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Welcome
        </button>
      </div>
    </div>
  );
};

export default Auth;