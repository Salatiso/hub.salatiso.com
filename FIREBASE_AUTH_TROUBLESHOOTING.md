# Firebase Authentication Troubleshooting Guide

**Error:** Failed to sign in with Google  
**Root Cause:** Referrer URL `http://localhost:5173` is not authorized in Firebase API key  

---

## 🔴 The Error Messages You're Seeing

### Error 1: API 403 Forbidden
```
identitytoolkit.googleapis.com/v1/projects?key=... : 403
```
**Meaning:** Firebase API key is blocking this referrer

### Error 2: Referer Blocked
```
FirebaseError: Error (auth/requests-from-referer-http://localhost:5173-are-blocked.)
```
**Meaning:** This specific URL is blocked

### Error 3: Requests Forbidden
```
"Requests from referer https://lifecv-d2724.firebaseapp.com/ are blocked."
```
**Meaning:** Wrong domain referrer in API key restrictions

---

## ✅ Quick Fix (3 Steps)

### Step 1: Open Firebase Console
```
https://console.firebase.google.com/project/lifecv-d2724/settings/general
```

### Step 2: Go to APIs & Services
```
https://console.developers.google.com/apis/credentials
```

### Step 3: Edit Your API Key
1. Find: `AIzaSyBl15V2pM4E6Yeh7YzVEdBjXsH3E2b1Wro`
2. Click **Edit**
3. Under **HTTP referrers (web sites)**, add:
   ```
   http://localhost:5173/*
   http://localhost:5173/**
   ```
4. Click **Save**

---

## ⏱️ Wait for Propagation
After saving, wait **5-10 minutes** for settings to propagate through Google's servers.

---

## 🔄 Refresh Your App
1. Go to http://localhost:5173
2. Hard refresh: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
3. Or clear cache: DevTools → Application → Clear storage
4. Try Google Sign-In again

---

## 🧪 Test in DevTools

### Open Browser Console (F12)
Check for these messages:

**✅ Good:**
```
Google sign-in successful
User authenticated
```

**❌ Bad:**
```
Requests from referer http://localhost:5173 are blocked
auth/requests-from-referer-http://localhost:5173-are-blocked
```

---

## 🔐 Complete Firebase Configuration

### API Key Referrers
Add all of these to be safe:
```
http://localhost:5173/*
http://localhost:5173/**
http://127.0.0.1:5173/*
http://127.0.0.1:5173/**
```

### OAuth Consent Screen
**Settings → APIs & Services → OAuth consent screen**

Add to **Authorized JavaScript origins:**
```
http://localhost:5173
http://127.0.0.1:5173
```

Add to **Authorized redirect URIs:**
```
http://localhost:5173
http://localhost:5173/
http://localhost:5173/__/auth/callback
```

### Firebase Auth Settings
**Authentication → Settings → Authorized domains**

Add:
```
localhost
127.0.0.1
```

---

## 🛠️ If Still Not Working

### Check 1: API Key in .env
```
VITE_FIREBASE_API_KEY=AIzaSyBl15V2pM4E6Yeh7YzVEdBjXsH3E2b1Wro ✓
```

### Check 2: Auth Domain in .env
```
VITE_FIREBASE_AUTH_DOMAIN=lifecv-d2724.firebaseapp.com ✓
```

### Check 3: Is it the Right Project?
```
VITE_FIREBASE_PROJECT_ID=lifecv-d2724 ✓
```

### Check 4: Clear Everything
```powershell
# Windows
del .env
del node_modules -Recurse -Force
npm install
npm run dev
```

### Check 5: Check Console Errors
1. Open DevTools: **F12**
2. Go to **Console** tab
3. Look for red errors
4. Screenshot and check error message

---

## 🌍 Development vs Production

### Development (localhost)
- API key should allow `http://localhost:*`
- For testing, use Firebase Emulator
- Keep restrictive in production

### Production
- API key restricted to `https://yourdomain.com`
- Only production domain allowed
- No localhost access

---

## 🚀 Better Solution: Use Firebase Emulator

**For complete development isolation:**

### Install Emulator
```bash
npm install -g firebase-tools
firebase login
firebase init emulators
```

### Start Emulator
```bash
firebase emulators:start
```

### Benefits
- ✅ No Firebase project restrictions
- ✅ Fast, local testing
- ✅ No production data at risk
- ✅ Automatic reset on restart

---

## 📞 Still Stuck?

### Collect This Info:
- [ ] Your API Key: `AIzaSyBl15V2pM4E6Yeh7YzVEdBjXsH3E2b1Wro`
- [ ] Your Project ID: `lifecv-d2724`
- [ ] Dev URL: `http://localhost:5173`
- [ ] Error message from console
- [ ] Screenshot of error

### Contact Firebase Support:
1. Go to https://console.firebase.google.com
2. Click **?** → **Get support**
3. Describe the issue

---

## ✨ Once Fixed

You'll be able to:
- ✅ Click Google Sign-In button
- ✅ See Google login popup
- ✅ Sign in with your Google account
- ✅ Access the dashboard
- ✅ See your 13 widgets
- ✅ Use all features

---

**TL;DR:** Add `http://localhost:5173/*` to Firebase API key referrers, wait 5 min, refresh, and try again! 🎯
