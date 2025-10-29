# 🔐 Firebase Auth Integration - Quick Reference Guide

**Phase 3 Day 2 Deliverable**  
**Last Updated:** October 29, 2025

---

## 📦 What Was Created

### Files Added
```
src/services/FirebaseAuthService.ts    (525 LOC) - Main auth service
src/hooks/useFirebaseAuth.ts           (382 LOC) - React hooks
src/contexts/AuthContextEnhanced.tsx   (170 LOC) - Global context
src/components/AuthGuards.tsx          (530 LOC) - Route protection
```

**Total:** 1,607 lines of production code  
**Quality:** ✅ 0 errors | ✅ 100% TypeScript | ✅ ESLint passing | ✅ Build passing

---

## 🚀 Quick Start: 3-Step Integration

### Step 1: Wrap Your App with AuthProvider
```tsx
// src/main.tsx or src/App.tsx
import { AuthProvider } from './contexts/AuthContextEnhanced';
import { AuthProvider as OldAuthProvider } from './contexts/AuthContext'; // Keep for compatibility

function App() {
  return (
    <AuthProvider>
      <OldAuthProvider>
        {/* Your app routes */}
      </OldAuthProvider>
    </AuthProvider>
  );
}
```

### Step 2: Use Auth in Components
```tsx
import { useAuth } from './contexts/AuthContextEnhanced';
import { useEmailAuth } from './hooks/useFirebaseAuth';

function LoginPage() {
  const { login, loading, error } = useEmailAuth();
  
  const handleLogin = async (email, password) => {
    const response = await login(email, password);
    if (response.success) {
      navigate('/dashboard');
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleLogin(email, password);
    }}>
      {error && <div className="error">{error}</div>}
      <button disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Step 3: Protect Routes
```tsx
import { ProtectedRoute, EmailVerificationGuard } from './components/AuthGuards';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <EmailVerificationGuard>
            <ProfilePage />
          </EmailVerificationGuard>
        } 
      />
    </Routes>
  );
}
```

---

## 📚 Available Hooks

### useEmailAuth()
```typescript
const { login, register, loading, error, setError } = useEmailAuth();

// Login
await login('user@example.com', 'password');

// Register
await register('user@example.com', 'password', 'Display Name');
```

### useSocialAuth()
```typescript
const { 
  signInWithGoogle, 
  signInWithGithub, 
  signInWithFacebook,
  loading, 
  error 
} = useSocialAuth();

await signInWithGoogle();
```

### usePasswordRecovery()
```typescript
const { 
  sendResetEmail, 
  verifyResetCode, 
  confirmReset,
  loading, 
  error, 
  success 
} = usePasswordRecovery();

// Step 1: Request reset
await sendResetEmail('user@example.com');

// Step 2: Verify code (received in email)
await verifyResetCode(resetCode);

// Step 3: Confirm new password
await confirmReset(resetCode, 'newPassword123');
```

### useAccountManagement()
```typescript
const { 
  updateProfile, 
  updateEmail, 
  updatePassword,
  fetchUserInfo,
  userInfo,
  loading, 
  error 
} = useAccountManagement();

// Update profile
await updateProfile('New Name', 'https://photo-url.jpg');

// Update email
await updateEmail('currentPassword', 'newemail@example.com');

// Update password
await updatePassword('email@example.com', 'currentPassword', 'newPassword');

// Fetch latest info
await fetchUserInfo();
console.log(userInfo); // Has uid, email, displayName, emailVerified, etc.
```

### useAccountLinking()
```typescript
const { 
  linkGoogle, 
  linkGithub, 
  unlinkProvider,
  loading, 
  error 
} = useAccountLinking();

// User can use multiple login methods with same account
await linkGoogle();
await unlinkProvider('google.com');
```

### useSession()
```typescript
const { 
  isAuthenticated, 
  currentUser, 
  logout, 
  setSessionConfig,
  getIdToken 
} = useSession();

// Configure session
setSessionConfig({ 
  persistence: 'local', // or 'session'
  rememberMe: true 
});

// Get ID token for API calls
const token = await getIdToken();

// Logout
await logout();
```

### useAuth() [Composite Hook]
```typescript
const {
  emailAuth,      // useEmailAuth
  socialAuth,     // useSocialAuth
  passwordRecovery, // usePasswordRecovery
  accountManagement, // useAccountManagement
  accountLinking, // useAccountLinking
  session         // useSession
} = useAuth();

// Access all auth functionality from single hook
```

---

## 🛡️ Route Protection Components

### ProtectedRoute
```tsx
// Redirects to login if not authenticated
<ProtectedRoute redirectTo="/auth/login">
  <Dashboard />
</ProtectedRoute>
```

### EmailVerificationGuard
```tsx
// Requires user to verify email first
<EmailVerificationGuard redirectTo="/verify-email">
  <PremiumFeature />
</EmailVerificationGuard>

// Allow unverified access but show warning
<EmailVerificationGuard allowUnverified={true}>
  <Profile />
</EmailVerificationGuard>
```

### PublicRoute
```tsx
// Redirects to dashboard if already authenticated
<PublicRoute redirectTo="/dashboard">
  <LoginPage />
</PublicRoute>
```

---

## 🎯 Common Use Cases

### User Registration Flow
```tsx
const { register, error, loading } = useEmailAuth();

const handleRegister = async (email, password, name) => {
  const response = await register(email, password, name);
  
  if (response.success) {
    // User created, verification email sent
    toast.success('Check your email to verify');
    navigate('/check-email');
  } else {
    toast.error(response.error?.displayMessage);
  }
};
```

### Google Sign-In
```tsx
const { signInWithGoogle, error, loading } = useSocialAuth();

const handleGoogleLogin = async () => {
  const response = await signInWithGoogle();
  
  if (response.success) {
    // User profile auto-created in Firestore
    navigate('/dashboard');
  } else {
    toast.error('Google sign-in failed');
  }
};
```

### Password Reset Flow
```tsx
const { sendResetEmail, confirmReset, error } = usePasswordRecovery();

// Step 1: Request reset
const handleForgotPassword = async (email) => {
  const response = await sendResetEmail(email);
  if (response.success) {
    navigate('/reset-password', { state: { email } });
  }
};

// Step 2: Confirm reset (after user clicks email link)
const handleResetPassword = async (code, password) => {
  const response = await confirmReset(code, password);
  if (response.success) {
    navigate('/login');
    toast.success('Password reset successful');
  }
};
```

### Session Management
```tsx
const { setSessionConfig, logout } = useSession();

// Remember me: Keep session alive after browser close
const handleLoginWithRememberMe = async (email, password) => {
  setSessionConfig({ 
    persistence: 'local', 
    rememberMe: true 
  });
  await login(email, password);
};

// Temporary: Clear session on browser close
const handleQuickLogin = async (email, password) => {
  setSessionConfig({ 
    persistence: 'session' 
  });
  await login(email, password);
};
```

### User Profile Display
```tsx
const { user } = useAuth().session;
const { userInfo, fetchUserInfo } = useAccountManagement();

useEffect(() => {
  if (user) {
    fetchUserInfo();
  }
}, [user]);

return (
  <div>
    <img src={userInfo?.photoURL} alt="Profile" />
    <h1>{userInfo?.displayName}</h1>
    <p>{userInfo?.email}</p>
    <span>{userInfo?.emailVerified ? '✅ Verified' : '⏳ Pending'}</span>
  </div>
);
```

---

## 📊 Service Class Methods

### FirebaseAuthService (Direct Use - Advanced)

```typescript
import { firebaseAuthService } from './services/FirebaseAuthService';

// Email/Password
firebaseAuthService.registerWithEmail(email, password, displayName?, photoURL?)
firebaseAuthService.loginWithEmail(email, password)

// Social Auth
firebaseAuthService.signInWithGoogle()
firebaseAuthService.signInWithGithub()
firebaseAuthService.signInWithFacebook()

// Account Linking
firebaseAuthService.linkGoogleAccount()
firebaseAuthService.linkGithubAccount()
firebaseAuthService.unlinkProvider(providerId)

// Password Recovery
firebaseAuthService.sendPasswordResetEmail(email)
firebaseAuthService.verifyPasswordResetCode(code)
firebaseAuthService.confirmPasswordReset(code, newPassword)
firebaseAuthService.updateUserPassword(email, currentPassword, newPassword)

// Email Management
firebaseAuthService.sendVerificationEmail()
firebaseAuthService.updateUserEmail(currentPassword, newEmail)

// User Info
firebaseAuthService.updateUserProfile({ displayName?, photoURL? })
firebaseAuthService.getUserAccountInfo()
firebaseAuthService.getCurrentUser()
firebaseAuthService.getUserIdToken(forceRefresh?)

// Session
firebaseAuthService.logout()
firebaseAuthService.setSessionConfig(config)
firebaseAuthService.getSessionConfig()
```

All methods return `AuthResponse` with `{ success, user?, error? }`

---

## 🔒 Error Handling

### Built-in Error Mapping
```typescript
// Errors automatically converted to user-friendly messages:

'auth/email-already-in-use' 
  → 'Email is already registered. Please sign in instead.'

'auth/weak-password' 
  → 'Password must be at least 6 characters.'

'auth/user-not-found' 
  → 'User not found. Please check your email.'

'auth/wrong-password' 
  → 'Invalid password. Please try again.'

'auth/too-many-requests' 
  → 'Too many failed login attempts. Please try again later.'

// All other errors show generic message + logged server-side
```

### Error Handling in Components
```tsx
const { error, setError } = useEmailAuth();

useEffect(() => {
  if (error) {
    toast.error(error);
    // Clear error after showing
    setError(null);
  }
}, [error]);
```

---

## 📱 Mobile Considerations

### OAuth Redirect (Instead of Popup)
```typescript
import { useSocialAuth } from './hooks/useFirebaseAuth';

const { handleRedirectResult } = useSocialAuth();

// On mobile, use redirect instead of popup:
firebaseAuthService.signInWithGoogleRedirect();

// Handle result on app load
useEffect(() => {
  firebaseAuthService.handleRedirectResult().then(response => {
    if (response.success) {
      navigate('/dashboard');
    }
  });
}, []);
```

---

## 🔗 Integration with Phase 3 Components

### With Firestore (Phase 3 Day 3-4)
```typescript
const user = useUser();
const { userInfo } = useAccountManagement();

// Firestore collections auto-synced via FirestoreSyncService (Day 4)
import { firebaseService } from './services/firebaseService';

const profile = await firebaseService.getUserProfile(user.uid);
const contacts = await firebaseService.getContacts(user.uid);
```

### With Search Service (Phase 3 Day 5)
```typescript
const user = useUser();
import { searchService } from './services/SearchService'; // Created Day 5

const results = await searchService.search(user.uid, query);
```

### With Analytics (Phase 3 Day 7-8)
```typescript
const user = useUser();

// Analytics auto-tracks auth events
// Custom events in Day 7-8
```

---

## 🐛 Debugging

### Check Current Auth State
```typescript
const { user, loading, isAuthenticated } = useAuth().session;
console.log('User:', user);
console.log('Loading:', loading);
console.log('Authenticated:', isAuthenticated);
```

### Get ID Token
```typescript
const { getIdToken } = useSession();
const token = await getIdToken(true); // Force refresh
console.log('ID Token:', token);
```

### Fetch User Info
```typescript
const { userInfo, fetchUserInfo } = useAccountManagement();
await fetchUserInfo();
console.log('User Info:', userInfo);
```

### Check Session Config
```typescript
import { firebaseAuthService } from './services/FirebaseAuthService';

const config = firebaseAuthService.getSessionConfig();
console.log('Session Config:', config);
```

---

## ✅ Deployment Checklist

- [ ] Replace old AuthContext with new AuthContextEnhanced
- [ ] Update app wrapper to use new AuthProvider
- [ ] Update auth-related routes with new hooks
- [ ] Add ProtectedRoute guards to secure routes
- [ ] Test email/password registration and login
- [ ] Test Google OAuth sign-in
- [ ] Test GitHub OAuth sign-in (if needed)
- [ ] Test password reset flow
- [ ] Test session persistence
- [ ] Test logout functionality
- [ ] Verify Firebase Auth enabled in console
- [ ] Deploy to staging
- [ ] Test in staging environment
- [ ] Deploy to production

---

## 📞 Support & Troubleshooting

### "Firebase app not initialized"
**Solution:** Ensure `AuthProvider` wraps your entire app

### OAuth Popup Blocked
**Solution:** Add to error messages: "Please disable your popup blocker"

### Email Verification Not Received
**Solution:** Check spam folder, resend verification email via `sendVerificationEmail()`

### Session Not Persisting
**Solution:** Configure session: `setSessionConfig({ persistence: 'local' })`

### CORS Issues with OAuth
**Solution:** Add domain to Firebase OAuth settings (console.firebase.google.com)

---

## 📖 Next Steps

**Phase 3 Day 3:** Firestore Database Deployment  
**Phase 3 Day 4:** Real-time Data Sync Implementation  
**Phase 3 Day 5:** Advanced Search Service  

Current Status: ✅ **Day 2 Complete** | 🚀 Ready for Day 3

---

*Quick Reference Guide | Phase 3 Day 2*  
*For full documentation, see PHASE3_DAY2_FIREBASE_AUTH_COMPLETE.md*
