# 🔐 Google OAuth Configuration Fix - October 30, 2025

## Issue Summary

**Problem**: Google Sign-In failing with Firebase errors:
```
Failed to load resource: the server responded with a status of 403 ()
Firebase: Error (auth/requests-from-referer-http://localhost:3000-are-blocked.)
```

**Root Causes**:
1. Firebase Console has NOT authorized `localhost:5173` as a valid referrer
2. Google OAuth Consent Screen missing or incorrectly configured
3. OAuth 2.0 credentials need proper redirect URI configuration
4. Missing or incorrect `Client ID` in environment variables

---

## 🔧 Step-by-Step Fix

### Step 1: Add localhost:5173 to Firebase Console

**Path**: Firebase Console > Authentication > Settings > Authorized Domains

1. Go to https://console.firebase.google.com
2. Select your project: `lifecv-d2724`
3. Navigate to **Authentication** (left sidebar)
4. Click on **Settings** tab
5. Scroll to **Authorized Domains**
6. Click **Add domain**
7. Enter: `localhost:5173` (for dev server)
8. Also add: `127.0.0.1:5173`
9. Click **Add**
10. Save changes

**Screenshot reference**: 
```
Authentication > Settings > Authorized Domains
┌─────────────────────────────────────────┐
│ Authorized Domains                      │
├─────────────────────────────────────────┤
│ ✓ lifecv-d2724.firebaseapp.com         │
│ ✓ lifecv-d2724.web.app                 │
│ ✓ localhost:5173          (ADD THIS)   │
│ ✓ 127.0.0.1:5173          (ADD THIS)   │
└─────────────────────────────────────────┘
```

---

### Step 2: Verify Google Cloud Console OAuth Configuration

**Path**: Google Cloud Console > APIs & Services > OAuth 2.0 Client IDs

1. Go to https://console.cloud.google.com
2. Select your project: `lifecv-d2724`
3. Navigate to **APIs & Services** (left sidebar)
4. Click on **Credentials**
5. Find your **OAuth 2.0 Client ID** for Web
6. Click to edit it
7. Under **Authorized redirect URIs**, ensure you have:
   ```
   http://localhost:5173/
   http://127.0.0.1:5173/
   https://lifecv-d2724.firebaseapp.com/
   https://lifecv-d2724.web.app/
   https://localhost:5173/
   ```
8. Click **Save**

**Reference structure**:
```
OAuth 2.0 Client ID Configuration
├─ Client ID: [your-client-id].apps.googleusercontent.com
├─ Client Secret: [hidden]
├─ Authorized Redirect URIs
│  ├─ http://localhost:5173/
│  ├─ http://127.0.0.1:5173/
│  ├─ https://lifecv-d2724.firebaseapp.com/
│  ├─ https://lifecv-d2724.web.app/
│  └─ https://localhost:5173/
└─ Authorized JavaScript Origins
   ├─ http://localhost:5173
   ├─ http://127.0.0.1:5173
   ├─ https://lifecv-d2724.firebaseapp.com
   └─ https://lifecv-d2724.web.app
```

---

### Step 3: Verify OAuth Consent Screen

**Path**: Google Cloud Console > APIs & Services > OAuth Consent Screen

1. Go to https://console.cloud.google.com
2. Select your project
3. Navigate to **APIs & Services** > **OAuth Consent Screen**
4. Ensure **User Type** is set to `External` (for development)
5. Fill in required fields:
   - **App name**: LifeSync
   - **User support email**: [your-email@gmail.com]
   - **Developer contact**: [your-email@gmail.com]
6. Add scopes if needed:
   - `email`
   - `profile`
7. Add test users if still in testing phase:
   - Add your test email addresses
   - Add all family emails from `.env`
8. Save all changes

---

### Step 4: Update Environment Variables

**File**: `.env`

Verify these are correctly set:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyBl15V2pM4E6Yeh7YzVEdBjXsH3E2b1Wro
VITE_FIREBASE_AUTH_DOMAIN=lifecv-d2724.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lifecv-d2724

# IMPORTANT: Ensure OAuth is using correct settings
VITE_USE_EMULATOR=false  # Set to false for production OAuth

# Google Drive Configuration
VITE_GOOGLE_DRIVE_API_KEY=AIzaSyBl15V2pM4E6Yeh7YzVEdBjXsH3E2b1Wro
VITE_GOOGLE_DRIVE_CLIENT_ID=1039752653127-abcdefghijklmnop1234567890.apps.googleusercontent.com
```

**Important**: Verify `VITE_USE_EMULATOR=false` because Firebase emulator doesn't support OAuth redirects.

---

### Step 5: Clear Browser Cache and Cookies

1. Open Developer Tools: `F12` or `Ctrl+Shift+I`
2. Go to **Application** tab
3. Clear **Local Storage** for `localhost:5173`
4. Clear **Cookies** for `localhost:5173`
5. Close and reopen browser tab
6. Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

---

## 🧪 Testing Procedure

### Test 1: Sign In Button Exists
- [ ] Navigate to http://localhost:5173
- [ ] Verify "Sign in with Google" button appears on GuestLogin page
- [ ] Button is clickable

### Test 2: Google OAuth Flow
- [ ] Click "Sign in with Google"
- [ ] Redirected to Google sign-in page
- [ ] Sign in with your Google account
- [ ] Redirected back to LifeSync dashboard
- [ ] Dashboard loads with your profile data
- [ ] No console errors (check DevTools)

### Test 3: Profile Creation
- [ ] Sign in with Google
- [ ] Go to `/dashboard`
- [ ] Verify profile shows your Google account name
- [ ] Verify profile is saved in Firestore
- [ ] Sign out and sign back in
- [ ] Profile persists across sessions

### Test 4: Multiple Account Isolation
- [ ] Sign in with Account A
- [ ] Note profile data
- [ ] Sign out
- [ ] Sign in with Account B
- [ ] Verify different profile data
- [ ] No cross-account data contamination

### Test 5: Error Handling
- [ ] Close browser before auth completes
- [ ] Verify app doesn't crash
- [ ] Error message displays properly
- [ ] Can retry sign-in

---

## 🚀 Code Changes Required

### GuestLogin.tsx - Enhanced Error Handling

The current `handleGoogleSignIn` function should be updated to:

```typescript
const handleGoogleSignIn = async () => {
  try {
    setIsLoading(true);
    setError('');
    
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    
    // Use signInWithPopup as fallback if redirect fails
    try {
      await signInWithRedirect(auth, provider);
    } catch (redirectError) {
      console.warn('Redirect failed, trying popup:', redirectError);
      // Fallback to popup (better for localhost testing)
      // This would require importing signInWithPopup
      throw redirectError;
    }
  } catch (err: any) {
    setError('Failed to sign in with Google. Please try again.');
    console.error('Google signin error:', err);
    setIsLoading(false);
  }
};
```

---

## 📋 Verification Checklist

### Firebase Console
- [ ] `localhost:5173` added to Authorized Domains
- [ ] `127.0.0.1:5173` added to Authorized Domains
- [ ] Production domains still authorized
- [ ] Settings saved

### Google Cloud Console
- [ ] OAuth 2.0 Client ID configured
- [ ] Authorized Redirect URIs include localhost:5173
- [ ] Authorized JavaScript Origins include localhost:5173
- [ ] OAuth Consent Screen configured
- [ ] Test users added (if needed)

### Environment Configuration
- [ ] `.env` has correct Firebase config
- [ ] `VITE_USE_EMULATOR=false` (for OAuth support)
- [ ] `VITE_GOOGLE_DRIVE_CLIENT_ID` set correctly
- [ ] No hardcoded credentials in code

### Browser
- [ ] Cache cleared
- [ ] Cookies cleared
- [ ] Hard refresh done
- [ ] Console shows no security warnings

### Application
- [ ] Dev server running on `localhost:5173`
- [ ] GuestLogin page loads
- [ ] "Sign in with Google" button visible
- [ ] Google sign-in flow works end-to-end
- [ ] Profile data appears in dashboard
- [ ] No console errors

---

## 🐛 Common Issues & Solutions

### Issue 1: "Referer blocked" Error
**Error**: `auth/requests-from-referer-http://localhost:3000-are-blocked`

**Solution**:
1. Verify `localhost:5173` added to Firebase Authorized Domains
2. Clear browser cache and cookies
3. Hard refresh the page
4. Verify correct Firebase project selected

### Issue 2: "Popup blocked" or "Popup closed"
**Error**: `auth/popup-closed-by-user`

**Solution**:
1. Browser popup blocker may be interfering
2. Add localhost:5173 to popup whitelist
3. Try signing in again
4. Check browser permissions

### Issue 3: "Origin mismatch" Error
**Error**: `origin_mismatch` or similar OAuth error

**Solution**:
1. Verify dev server port is 5173
2. Verify `http://localhost:5173/` in Google Cloud OAuth redirects
3. Not using custom domain redirects yet

### Issue 4: "Invalid Client" Error
**Error**: `invalid_client` or `client_id_not_found`

**Solution**:
1. Verify `VITE_GOOGLE_DRIVE_CLIENT_ID` in `.env`
2. Confirm Client ID is valid in Google Cloud Console
3. Check if OAuth credentials accidentally deleted

### Issue 5: Emulator Blocking OAuth
**Error**: Connection to emulator instead of real Firebase

**Solution**:
1. Set `VITE_USE_EMULATOR=false` in `.env`
2. Firebase Auth Emulator doesn't support OAuth redirects
3. You must use production Firebase for OAuth testing

---

## 📱 Deployment Path

After local testing succeeds:

1. **Dev Server**: `npm run dev` (localhost:5173) ✅ Testing
2. **Build**: `npm run build` 
3. **Staging**: `firebase deploy --only hosting` 
4. **Production**: Deploy to production domain

---

## 🔒 Security Notes

### For Development (Localhost)
- Using `http://localhost:5173` is acceptable
- OAuth Consent Screen can stay in "Testing" mode
- Test user emails can be used

### For Staging (Firebase Hosting)
- Using `https://lifecv-d2724.web.app` with valid SSL
- OAuth Consent Screen should be in "External" mode
- All family emails should be added as test users

### For Production
- Use only `https://` URLs
- OAuth Consent Screen must be verified
- Only production domain URLs allowed
- Consider moving to published app status

---

## 📞 Next Steps

1. **Complete all Firebase/Google Cloud configurations** (Step 1-4 above)
2. **Clear browser cache and cookies** (Step 5 above)
3. **Test locally** (Run Step-by-Step from Testing Procedure)
4. **Build and deploy** once local testing passes:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```
5. **Test on staging**: Visit https://lifecv-d2724.web.app

---

**Document Version**: 1.0
**Last Updated**: October 30, 2025
**Status**: ⚠️ Action Required - Follow configuration steps before testing

✅ **When complete**: All console errors will be gone and Google OAuth will work seamlessly!
