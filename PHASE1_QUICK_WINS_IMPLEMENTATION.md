# Phase 1: Quick Wins Implementation Guide
## Days 1–2: Fix Routes, Rename UI, Unified Entry

**Objectives**:
1. Fix 404 error on "Sign in / Create account"
2. Rename "Guest Account" → "Local Account" in UI
3. Make `/guest-login` the unified entry point for all 3 auth methods
4. Add PIN field to local account signup
5. Redirect to dashboard immediately after local signup

**Estimated Time**: 4–6 hours  
**Files to Touch**: 5–6 files  
**Breaking Changes**: None (all backward compatible)

---

## Task 1: Fix 404 on "Sign in / Create account"

### Issue Diagnosis

Currently: Users clicking "Sign in" or "Create account" see 404 error.

**Root Causes** (check these):
1. Route `/auth` doesn't exist or is not wired in router
2. Navigate path in Auth.jsx button doesn't match route
3. No catch-all redirect for unknown routes

### Solution Steps

#### Step 1A: Check Router Configuration

**File**: `src/App.jsx` (or your main router file)

**Look for** (example):
```jsx
<Routes>
  <Route path="/" element={<Welcome />} />
  <Route path="/guest-login" element={<GuestLogin />} />
  <Route path="/auth" element={<Auth />} />  // ← Should exist
  <Route path="/dashboard" element={<Dashboard />} />
  {/* ... other routes */}
</Routes>
```

**Action**:
- [ ] Confirm `/auth` route exists in router
- [ ] If missing, add: `<Route path="/auth" element={<Auth />} />`

#### Step 1B: Check Navigate Calls in Auth.jsx

**File**: `src/pages/Auth.jsx` (buttons at bottom)

**Look for** (current code around lines 300-320):
```jsx
<button onClick={() => navigate('/guest-login')} ...>
  Try as Guest (7 days free)
</button>

<button onClick={() => navigate('/')} ...>
  Back to Welcome
</button>
```

**Issue**: There may NOT be "Sign in" / "Create account" back buttons. Instead, the issue is likely that from `/auth`, users try to navigate somewhere that doesn't exist.

**Action**:
- [ ] Add catch-all route in App.jsx to redirect unknown routes:

```jsx
// At END of <Routes> (after all other routes)
<Route path="*" element={<Navigate to="/guest-login" replace />} />
```

This prevents 404 and redirects to home.

#### Step 1C: Test Navigation

```bash
npm run dev
```

- [ ] Go to http://localhost:3000/auth
- [ ] Click any button
- [ ] Verify no 404 (should navigate to destination)
- [ ] Try http://localhost:3000/unknown-page
- [ ] Should redirect to /guest-login

**Checklist**:
- [ ] Route `/auth` exists
- [ ] Route `/guest-login` exists  
- [ ] Catch-all `*` redirect added
- [ ] No 404 errors on button clicks

---

## Task 2: Rename "Guest Account" → "Local Account" (UI Copy Only)

### Files to Update

#### File 2A: `src/pages/Auth.jsx`

**Find** (line ~295):
```jsx
<button
  onClick={() => navigate('/guest-login')}
  className="w-full flex items-center justify-center gap-2 px-4 py-3 
             bg-gradient-to-r from-purple-500 to-indigo-500 
             hover:from-purple-600 hover:to-indigo-600 
             text-white rounded-lg transition-all font-medium"
>
  <Users className="w-5 h-5" />
  Try as Guest (7 days free)
</button>
```

**Replace with**:
```jsx
<button
  onClick={() => navigate('/guest-login')}
  className="w-full flex items-center justify-center gap-2 px-4 py-3 
             bg-gradient-to-r from-purple-500 to-indigo-500 
             hover:from-purple-600 hover:to-indigo-600 
             text-white rounded-lg transition-all font-medium"
>
  <Users className="w-5 h-5" />
  Create a Local Account
</button>
```

**Action**:
- [ ] Update button text from "Try as Guest" → "Create a Local Account"

#### File 2B: `src/pages/GuestLogin.tsx`

**Find** (line ~60, header):
```tsx
<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
  Welcome to LifeSync
</h1>
<p className="text-lg text-gray-600 dark:text-gray-400">
  Choose how you'd like to get started
</p>
```

**This part stays the same**, but find the local account card section (line ~90):

**Find**:
```tsx
<button
  onClick={() => setStep('guestSignup')}
  className="group relative overflow-hidden bg-white dark:bg-gray-800 
             rounded-2xl p-8 shadow-lg hover:shadow-2xl 
             transition-all duration-300 transform hover:-translate-y-1 
             border-2 border-transparent hover:border-blue-500"
>
  <div className="relative z-10">
    <div className="text-5xl mb-4">👤</div>
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
      Try as Guest
    </h2>
    <p className="text-gray-600 dark:text-gray-400 mb-6 text-left">
      No signup required. Get 7 days of full access, then renew anytime.
    </p>
    
    <ul className="space-y-2 mb-6 text-left text-sm">
      <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <span>✅</span> Full dashboard access
      </li>
      {/* ... more items */}
    </ul>
```

**Replace with**:
```tsx
<button
  onClick={() => setStep('guestSignup')}
  className="group relative overflow-hidden bg-white dark:bg-gray-800 
             rounded-2xl p-8 shadow-lg hover:shadow-2xl 
             transition-all duration-300 transform hover:-translate-y-1 
             border-2 border-transparent hover:border-blue-500"
>
  <div className="relative z-10">
    <div className="text-5xl mb-4">📱</div>
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
      Create a Local Account
    </h2>
    <p className="text-gray-600 dark:text-gray-400 mb-6 text-left">
      Works without internet. Store your data locally. Upgrade to cloud anytime.
    </p>
    
    <ul className="space-y-2 mb-6 text-left text-sm">
      <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <span>✅</span> Full dashboard access
      </li>
      <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <span>✅</span> Works offline
      </li>
      <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <span>✅</span> Upgrade to cloud later
      </li>
      <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <span>✅</span> 4-digit PIN security
      </li>
    </ul>
```

**Also find the button text** (around line ~150):
```tsx
<button className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 
                   text-white font-bold rounded-lg transition-colors 
                   group-hover:shadow-lg">
  Continue as Guest →
</button>
```

**Replace with**:
```tsx
<button className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 
                   text-white font-bold rounded-lg transition-colors 
                   group-hover:shadow-lg">
  Create Local Account →
</button>
```

**Actions**:
- [ ] Change card title "Try as Guest" → "Create a Local Account"
- [ ] Change copy to "Works without internet..."
- [ ] Update bullet points
- [ ] Change button text "Continue as Guest" → "Create Local Account"

#### File 2C: Check for Other References

**Search** for "guest" or "Guest" in entire project:
```bash
grep -r "Try as Guest\|Try as guest" src/ --include="*.jsx" --include="*.tsx" --include="*.ts" --include="*.js"
```

**Update any UI text found** (not internal function names yet).

**Checklist**:
- [ ] Auth.jsx button text updated
- [ ] GuestLogin.tsx card title updated
- [ ] GuestLogin.tsx card copy updated
- [ ] GuestLogin.tsx button text updated
- [ ] All user-visible "guest" references changed to "local"
- [ ] Internal function names left unchanged (still `guestAccountService`, etc.)

---

## Task 3: Make /guest-login Unified Entry with 3 Options

### Current State

`/guest-login` shows **only** the local account option.

### Target State

`/guest-login` shows **all 3 options** equally:
1. Continue with Google
2. Sign Up with Email
3. Create a Local Account

### Implementation

#### File 3A: `src/pages/GuestLogin.tsx` - Full Refactor

**Current structure** (line ~70):
```tsx
const [step, setStep] = useState<PageStep>('options');
```

The component already has an 'options' step! Currently it shows:
- Try as Guest (button)
- Sign In (button)
- Sign Up (button)

**We need to enhance the 'options' step to include Google & Email signup inline**.

**Find** the section around line ~70-160 where it shows `step === 'options'` JSX:

**Replace the entire options section** with:
```tsx
{step === 'options' && (
  <div className="max-w-3xl w-full">
    {/* Header */}
    <div className="text-center mb-12">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
        <span className="text-3xl">🚀</span>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
        Get Started with LifeSync
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        Choose how you'd like to begin
      </p>
    </div>

    {/* Three Equal Option Cards */}
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      
      {/* Option 1: Google */}
      <button
        onClick={handleGoogleSignIn}
        className="group relative overflow-hidden bg-white dark:bg-gray-800 
                   rounded-2xl p-8 shadow-lg hover:shadow-2xl 
                   transition-all duration-300 transform hover:-translate-y-1 
                   border-2 border-transparent hover:border-blue-500 h-full"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 
                        to-transparent dark:from-blue-900/20 opacity-0 
                        group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Continue with Google
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
            Cloud backup & multi-device access. Fastest option.
          </p>
          <ul className="space-y-2 mb-6 text-left text-xs">
            <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span>☁️</span> Synced across devices
            </li>
            <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span>⚡</span> One-click signin
            </li>
            <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span>🔒</span> Secure authentication
            </li>
          </ul>
          <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 
                             text-white font-semibold rounded-lg 
                             transition-colors text-sm">
            Continue →
          </button>
        </div>
      </button>

      {/* Option 2: Email */}
      <button
        onClick={() => setStep('emailSignup')}
        className="group relative overflow-hidden bg-white dark:bg-gray-800 
                   rounded-2xl p-8 shadow-lg hover:shadow-2xl 
                   transition-all duration-300 transform hover:-translate-y-1 
                   border-2 border-transparent hover:border-green-500 h-full"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 
                        to-transparent dark:from-green-900/20 opacity-0 
                        group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Sign Up with Email
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
            Standard account. Cloud-backed security.
          </p>
          <ul className="space-y-2 mb-6 text-left text-xs">
            <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span>✉️</span> Email & password login
            </li>
            <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span>☁️</span> Cloud backup
            </li>
            <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span>🔐</span> Encrypted storage
            </li>
          </ul>
          <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 
                             text-white font-semibold rounded-lg 
                             transition-colors text-sm">
            Sign Up →
          </button>
        </div>
      </button>

      {/* Option 3: Local Account */}
      <button
        onClick={() => setStep('localSignup')}
        className="group relative overflow-hidden bg-white dark:bg-gray-800 
                   rounded-2xl p-8 shadow-lg hover:shadow-2xl 
                   transition-all duration-300 transform hover:-translate-y-1 
                   border-2 border-transparent hover:border-purple-500 h-full"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 
                        to-transparent dark:from-purple-900/20 opacity-0 
                        group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10">
          <div className="text-5xl mb-4">📱</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Create a Local Account
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
            Works offline. 4-digit PIN. Upgrade anytime.
          </p>
          <ul className="space-y-2 mb-6 text-left text-xs">
            <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span>📴</span> Works without internet
            </li>
            <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span>🔑</span> PIN-protected
            </li>
            <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span>⬆️</span> Upgrade to cloud later
            </li>
          </ul>
          <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 
                             text-white font-semibold rounded-lg 
                             transition-colors text-sm">
            Create →
          </button>
        </div>
      </button>

    </div>

    {/* Divider */}
    <div className="relative mb-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
          Already have an account?
        </span>
      </div>
    </div>

    {/* Sign In Link */}
    <button
      onClick={() => navigate('/auth?mode=signin')}
      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 
                 transition-colors text-gray-900 dark:text-white font-medium"
    >
      Sign In
    </button>
  </div>
)}
```

#### File 3B: Add Email Signup Step & Handler

**After the 'options' step, add**:

```tsx
{step === 'emailSignup' && (
  <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
    <button
      onClick={() => setStep('options')}
      className="flex items-center gap-2 text-gray-600 dark:text-gray-400 
                 hover:text-gray-800 dark:hover:text-gray-200 mb-6"
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </button>
    
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
      Create Account
    </h2>
    <p className="text-gray-600 dark:text-gray-400 mb-6">
      Sign up with email & password
    </p>
    
    {/* Redirect to /auth?mode=signup */}
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
      Email signup coming soon. <br />
      <button 
        onClick={() => navigate('/auth?mode=signup')}
        className="text-blue-600 hover:underline"
      >
        Go to email signup →
      </button>
    </p>
  </div>
)}

{step === 'localSignup' && (
  // This is your existing guest signup form, just renamed
  // Keep existing code here but rename labels
)}
```

**Actions**:
- [ ] Replace entire 'options' section with 3-card grid
- [ ] Google card has button that calls `handleGoogleSignIn()`
- [ ] Email card has button that navigates to `/auth?mode=signup`
- [ ] Local account card has button that sets step to 'localSignup'
- [ ] Add "Already have account?" with Sign In link

#### File 3C: Add Google Sign-In Handler

**In GuestLogin.tsx, add** (top of component):
```tsx
import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { auth } from '../config/firebase';

// ... inside component:

const handleGoogleSignIn = async () => {
  try {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    await signInWithRedirect(auth, provider);
  } catch (err) {
    setError('Failed to sign in with Google. Please try again.');
    console.error('Google signin error:', err);
  } finally {
    setIsLoading(false);
  }
};
```

**Actions**:
- [ ] Import Google auth functions
- [ ] Import auth from firebase config
- [ ] Add handleGoogleSignIn function
- [ ] Wire to Google button onClick

#### File 3D: Import Missing Icons

**Top of GuestLogin.tsx, ensure imports**:
```tsx
import { ArrowLeft } from 'lucide-react';  // Add if not present
```

**Checklist**:
- [ ] 'options' step shows 3 equal-height cards
- [ ] Google card has working button
- [ ] Email card navigates to `/auth?mode=signup`
- [ ] Local card navigates to 'localSignup' step
- [ ] Back button on email/local signup steps
- [ ] "Already have account?" with Sign In link
- [ ] No UI overlaps or responsive issues

---

## Task 4: Add PIN Field to Local Account Signup

### File 4A: Update GuestLogin.tsx - Local Signup Form

**Find** the section where `step === 'guestSignup'` or `step === 'localSignup'`:

**Current form** (should look like):
```tsx
{step === 'guestSignup' && (
  <div className="...">
    {/* ... header ... */}
    <form onSubmit={handleGuestSignUp}>
      <input
        type="text"
        placeholder="Your name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      
      {error && <div>{error}</div>}
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Local Account'}
      </button>
    </form>
  </div>
)}
```

**Add PIN field**:
```tsx
{step === 'localSignup' && (  // Rename from 'guestSignup' to 'localSignup'
  <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
    <button
      onClick={() => setStep('options')}
      className="flex items-center gap-2 text-gray-600 dark:text-gray-400 
                 hover:text-gray-800 dark:hover:text-gray-200 mb-6"
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </button>
    
    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Create Local Account
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-sm">
        Fast setup. Works offline. Upgrade anytime.
      </p>
    </div>

    <form onSubmit={handleLocalSignUp} className="space-y-4">
      {/* Display Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Display Name *
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="John Doe"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                     rounded-lg bg-white dark:bg-gray-700 
                     text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        />
      </div>

      {/* Email (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email (optional)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                     rounded-lg bg-white dark:bg-gray-700 
                     text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* PIN (New Field) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          4-Digit PIN *
        </label>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value.slice(0, 4))}
          placeholder="••••"
          maxLength="4"
          pattern="[0-9]{4}"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                     rounded-lg bg-white dark:bg-gray-700 
                     text-gray-900 dark:text-white text-center text-2xl
                     focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        />
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          You'll use this to secure your local account
        </p>
      </div>

      {/* Use Password Option */}
      <div>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={usePassword}
            onChange={(e) => setUsePassword(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          Use password instead of PIN
        </label>
      </div>

      {/* Password (if checked) */}
      {usePassword && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password (min 8 characters)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            minLength="8"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                       rounded-lg bg-white dark:bg-gray-700 
                       text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || (!usePassword && pin.length < 4) || (usePassword && password.length < 8)}
        className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 
                   disabled:bg-gray-400 disabled:cursor-not-allowed
                   text-white font-semibold rounded-lg transition-colors"
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </button>

      {/* Skip for Later */}
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 
                   hover:text-gray-800 dark:hover:text-gray-200 
                   border border-gray-300 dark:border-gray-600 rounded-lg
                   transition-colors text-sm"
      >
        Skip for Now
      </button>
    </form>
  </div>
)}
```

#### File 4B: Add State Variables

**Top of GuestLogin component**:
```tsx
const [pin, setPin] = useState('');
const [usePassword, setUsePassword] = useState(false);
const [password, setPassword] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState('');
```

#### File 4C: Update Handler Function

**Find and update** `handleGuestSignUp`:
```tsx
const handleLocalSignUp = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  if (!displayName.trim()) {
    setError('Please enter your name');
    return;
  }

  if (!usePassword && pin.length < 4) {
    setError('Please enter a 4-digit PIN');
    return;
  }

  if (usePassword && password.length < 8) {
    setError('Password must be at least 8 characters');
    return;
  }

  setIsLoading(true);

  try {
    // Hash PIN/password before storing (Phase 2 enhancement)
    const localSecurityValue = usePassword ? password : pin;

    // Create local account with PIN
    guestAccountService.createGuestAccount(
      displayName.trim(),
      email.trim() || undefined,
      {
        pin: localSecurityValue,
        usePassword: usePassword
      }
    );

    onGuestCreated?.(displayName.trim());

    // Redirect to dashboard immediately (NOT onboarding)
    setTimeout(() => {
      navigate('/dashboard');
    }, 500);
  } catch (err) {
    setError('Failed to create account. Please try again.');
    console.error('Local signup error:', err);
  } finally {
    setIsLoading(false);
  }
};
```

**And rename** `handleGuestSignUp` to `handleLocalSignUp` in form submission:
```tsx
<form onSubmit={handleLocalSignUp} className="space-y-4">
```

**Actions**:
- [ ] Add state variables for PIN, password, etc.
- [ ] Add PIN input field (4 digits only)
- [ ] Add checkbox for "Use password instead"
- [ ] Add conditional password field
- [ ] Update handler to accept PIN/password options
- [ ] Validate PIN (4 digits) or password (8+ chars)
- [ ] Pass PIN/password to service

**Checklist**:
- [ ] PIN input visible (4-digit masked)
- [ ] "Use password" checkbox works
- [ ] Password field appears when checked
- [ ] PIN validation (must be 4 digits)
- [ ] Password validation (must be 8+ chars)
- [ ] Button disabled until valid input
- [ ] Form submits correctly

---

## Task 5: Redirect to Dashboard Immediately (Skip Onboarding)

### File 5A: Update guestAccountService.ts

**Find** `createGuestAccount()` function:

**Current** (probably returns GuestAccount):
```typescript
createGuestAccount(displayName: string, email?: string): GuestAccount {
  const now = Date.now();
  const guestAccount: GuestAccount = {
    id: this.generateGuestId(),
    displayName,
    email,
    createdAt: now,
    expiresAt: now + GUEST_VALIDITY_MS,
    renewalCount: 0,
    profileData: {},
  };

  localStorage.setItem(GUEST_ACCOUNT_KEY, JSON.stringify(guestAccount));
  localStorage.setItem(GUEST_DATA_KEY, JSON.stringify({}));

  this.notifyListeners();

  return guestAccount;
}
```

**Update to accept PIN**:
```typescript
createGuestAccount(
  displayName: string, 
  email?: string,
  securityOptions?: { pin?: string; usePassword?: boolean }
): GuestAccount {
  const now = Date.now();
  
  // TODO Phase 2: Hash PIN with PBKDF2 before storing
  const hashedPin = securityOptions?.pin ? this.hashPin(securityOptions.pin) : null;
  
  const guestAccount: GuestAccount = {
    id: this.generateGuestId(),
    displayName,
    email,
    createdAt: now,
    expiresAt: now + GUEST_VALIDITY_MS,
    renewalCount: 0,
    profileData: {},
    securityPin: hashedPin,  // Store hashed (Phase 2 full impl)
    usePassword: securityOptions?.usePassword || false,
  };

  localStorage.setItem(GUEST_ACCOUNT_KEY, JSON.stringify(guestAccount));
  localStorage.setItem(GUEST_DATA_KEY, JSON.stringify({}));

  this.notifyListeners();

  return guestAccount;
}

// TODO Phase 2: Implement proper PIN hashing
private hashPin(pin: string): string {
  // For now, just return as-is (will implement PBKDF2 in Phase 2)
  // Never store plain PIN in production!
  return pin;
}
```

**Actions**:
- [ ] Update signature to accept `securityOptions`
- [ ] Add `securityPin` field to account
- [ ] Add `usePassword` field
- [ ] Store hashed pin (placeholder for Phase 2)

### File 5B: Update Onboarding.jsx to Not Redirect

**Currently**, Auth.jsx or GuestLogin.tsx may redirect to `/onboarding` after signup.

**Find** any redirect to `/onboarding` after guest creation:

**In GuestLogin.tsx handler**:
```typescript
// Current (redirects to onboarding)
setTimeout(() => {
  navigate('/onboarding');
}, 500);
```

**Change to**:
```typescript
// New (redirect to dashboard directly)
setTimeout(() => {
  navigate('/dashboard');
}, 500);
```

**In Auth.jsx** (if any):
```jsx
// Look for:
// navigate('/onboarding')
// Change to:
// navigate('/dashboard')
```

**Actions**:
- [ ] Remove all `/onboarding` redirects after signup
- [ ] All signup methods now redirect to `/dashboard`
- [ ] Keep `/onboarding` route alive for manual access (Phase 2 converts to modal)

### File 5C: Update Dashboard.jsx to Show Tasks Card

**File**: `src/pages/Dashboard.jsx`

**Add** (somewhere near top of dashboard content):
```jsx
import { DashboardTasks } from '../components/DashboardTasks'; // Add this import

// ... inside Dashboard JSX:

<div className="dashboard-container">
  {/* Existing dashboard header, etc. */}
  
  {/* NEW: Dashboard Tasks Card */}
  <div className="mb-8">
    <DashboardTasks />
  </div>

  {/* Rest of dashboard content */}
</div>
```

**For now**, we can create a placeholder `DashboardTasks` component (will build it fully in Phase 2):

**File**: `src/components/DashboardTasks.jsx` (create new)
```jsx
export function DashboardTasks() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            ✨ Complete Your Profile
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Add more details to unlock trust points and features
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-600">0/8</div>
          <p className="text-xs text-gray-600 dark:text-gray-400">tasks complete</p>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
        <div className="bg-purple-600 h-full" style={{ width: '0%' }}></div>
      </div>
      
      <button className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors">
        Get Started →
      </button>
    </div>
  );
}
```

**Actions**:
- [ ] Create placeholder DashboardTasks component
- [ ] Import and add to Dashboard
- [ ] Shows progress (0/8 for now)
- [ ] CTA button visible

**Checklist**:
- [ ] After local signup, redirects to `/dashboard` (not `/onboarding`)
- [ ] Dashboard shows tasks card
- [ ] No 404 or errors
- [ ] User can interact with dashboard
- [ ] Tasks card shows (placeholder OK for now)

---

## Testing Checklist (Phase 1)

### Routes & Navigation
- [ ] Visit http://localhost:3000/
- [ ] Click "Get Started" → goes to `/guest-login`
- [ ] Click "Sign In" → goes to `/auth?mode=signin` (no 404)
- [ ] Click "Create Account" → shows form or navigates correctly (no 404)
- [ ] Click "Create Local Account" card → shows local signup form
- [ ] Click "Continue with Google" → Google OAuth flow works
- [ ] Click "Sign Up with Email" → navigates to email form

### Local Account Signup
- [ ] Fill display name + PIN → form validates
- [ ] Leave display name blank → error shown
- [ ] PIN < 4 digits → button disabled or error
- [ ] Enter 4-digit PIN → button enabled
- [ ] Check "Use password" → password field appears
- [ ] Submit with valid data → redirects to `/dashboard`
- [ ] Dashboard shows tasks card

### UI Copy
- [ ] No "Guest" text visible (all changed to "Local")
- [ ] Microcopy under each option is clear
- [ ] Button text updated consistently

### No 404s
- [ ] Click all buttons → no 404 errors
- [ ] Try invalid URL (e.g., `/unknown`) → redirects to `/guest-login`

---

## Summary of Changes

### Files Modified
1. `src/App.jsx` — Add catch-all route + confirm `/auth` route exists
2. `src/pages/Auth.jsx` — Update "Guest" button text
3. `src/pages/GuestLogin.tsx` — Major refactor: add Google/Email options, add PIN field
4. `src/services/guestAccountService.ts` — Accept PIN/password options
5. `src/pages/Dashboard.jsx` — Add DashboardTasks placeholder

### Files Created
1. `src/components/DashboardTasks.jsx` — Placeholder tasks card

### Lines of Code Changed
- Auth.jsx: ~10 lines
- GuestLogin.tsx: ~300 lines (major refactor)
- guestAccountService.ts: ~20 lines
- Dashboard.jsx: ~5 lines
- DashboardTasks.jsx: ~40 lines (new)

### Time Estimate
- Reading & understanding: 30 min
- Auth.jsx changes: 10 min
- GuestLogin.tsx refactor: 2–3 hrs
- guestAccountService.ts: 10 min
- Dashboard integration: 15 min
- Testing: 30 min
- **Total**: 4–5 hours

---

## Next Steps (Phase 2)

Once Phase 1 is complete and tested:
1. Create full DashboardTasks component with real task list
2. Implement Dexie-based profile store
3. Add PIN hashing/encryption
4. Build sync service (local ↔ Firestore)
5. Implement service-triggered consents

**See**: `REFACTOR_ROADMAP_LOCAL_FIRST_DASHBOARD.md` for Phase 2–5 details.

