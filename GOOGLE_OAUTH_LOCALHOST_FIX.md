# 🔧 GOOGLE OAUTH FIX - localhost:3000 Blocked

**Issue:** `auth/requests-from-referer-http://localhost:3000-are-blocked`  
**Status:** 🔴 BLOCKING  
**Date:** October 30, 2025

---

## ⚠️ THE PROBLEM

Firebase Security Rules are blocking Google OAuth requests from `http://localhost:3000`.

This happens because:
1. **Google OAuth Provider Configuration** in Firebase Console doesn't include localhost
2. **Authorized Domains** needs to include `localhost`
3. **CORS/Referer restrictions** blocking non-HTTPS development URLs

---

## ✅ THE SOLUTION (2 Steps)

### Step 1: Add Authorized Domain to Firebase Console

**Go to:** https://console.firebase.google.com/project/lifecv-d2724/settings/general

1. Click **Settings** (gear icon) → **Project Settings**
2. Navigate to **Authentication** tab
3. Scroll to **Authorized domains** section
4. Click **Add domain**
5. Add: `localhost:3000`
6. **SAVE** ✅

**Expected:** Domain appears in the list with ✓ verified

---

### Step 2: Configure Google OAuth Provider

**Go to:** https://console.firebase.google.com/project/lifecv-d2724/authentication/providers

1. Find **Google** provider
2. Click to **EDIT**
3. Ensure both **Web SDK Config** shows:
   - Project ID: `lifecv-d2724` ✓
   - Web API Key: `AIzaSyBl15V2pM4E6Yeh7YzVEdBjXsH3E2b1Wro` ✓
4. In **Authorized JavaScript origins**, add:
   - `http://localhost:3000` (for development)
   - `http://localhost:5173` (for Vite dev)
   - `http://192.168.86.250:3000` (for network testing)
5. In **Authorized redirect URIs**, add:
   - `http://localhost:3000/__/auth/handler`
   - `http://localhost:5173/__/auth/handler`
6. **SAVE** ✅

---

### Step 3: Update .env Configuration

**File:** `.env.local`

```env
# Google OAuth Config
VITE_GOOGLE_CLIENT_ID=AIzaSyBl15V2pM4E6Yeh7YzVEdBjXsH3E2b1Wro
VITE_GOOGLE_API_KEY=AIzaSyBl15V2pM4E6Yeh7YzVEdBjXsH3E2b1Wro
VITE_AUTH_REDIRECT_URL=http://localhost:3000/__/auth/handler

# Firebase Config
VITE_FIREBASE_PROJECT_ID=lifecv-d2724
VITE_FIREBASE_AUTH_DOMAIN=lifecv-d2724.firebaseapp.com
```

---

## 🧪 Testing the Fix

### Test 1: Clear Browser Data
1. **Open DevTools** (F12)
2. **Application** tab
3. Clear **Cookies** and **Local Storage** for localhost:3000
4. **Hard refresh** (Ctrl+Shift+R)

### Test 2: Try Google Sign In
1. Go to http://localhost:3000
2. Click **"Sign in with Google"**
3. Expected: Google OAuth popup or redirect
4. ✅ Should NOT see: `auth/requests-from-referer-...are-blocked`

### Test 3: Verify in Console
```javascript
// In browser console:
firebase.auth().currentUser
// Should show user object if signed in
```

---

## 🚀 If Still Not Working

### Option A: Use Email/Password Auth (Faster)
1. Create test account at https://console.firebase.google.com/project/lifecv-d2724/authentication/users
2. Use email/password to log in
3. Continue with Phase 3.4 testing

### Option B: Switch to localhost:5173
If using Vite dev server instead of 3000:
1. Note the exact port shown: `http://localhost:XXXX`
2. Add that port to Authorized Origins in Firebase Console
3. Clear cache and try again

### Option C: Use Local Account
Skip Google OAuth for now:
1. Click **"Create Local Account"**
2. Use PIN-based auth
3. Test widgets with local account

---

## 📋 Troubleshooting Checklist

- [ ] Added `localhost:3000` to Authorized domains
- [ ] Added `http://localhost:3000` to Authorized JavaScript origins
- [ ] Added `http://localhost:3000/__/auth/handler` to Authorized redirect URIs
- [ ] Cleared browser cache/cookies
- [ ] Hard refreshed page (Ctrl+Shift+R)
- [ ] Restarted dev server
- [ ] Waited 2-3 minutes for Firebase changes to propagate

---

## ✨ QUICK START

**Just do this:**

1. Go to Firebase Console Settings
2. Add `localhost:3000` to Authorized Domains
3. Go to Authentication → Providers → Google
4. Add `http://localhost:3000` to JavaScript origins
5. Add `http://localhost:3000/__/auth/handler` to redirect URIs
6. Clear browser cache
7. Hard refresh
8. Try Google sign in again

**That should fix it!** 🎯

