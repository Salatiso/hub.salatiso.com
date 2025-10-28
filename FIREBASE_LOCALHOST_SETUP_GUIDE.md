# Firebase Google Sign-In Configuration Fix

**Issue:** Firebase is blocking requests from `http://localhost:5173`  
**Cause:** API key restrictions on referrer URLs

---

## 🔧 Solution: Add localhost to Firebase Authorized Referrers

### Step 1: Go to Firebase Console
1. Visit: https://console.firebase.google.com
2. Select your project: **lifecv-d2724**
3. Go to **Settings** ⚙️ → **Project Settings**

### Step 2: Update API Key Restrictions
1. In Project Settings, click the **APIs & services** link or go to:
   - https://console.developers.google.com/apis/credentials
2. Find your API Key: `AIzaSyBl15V2pM4E6Yeh7YzVEdBjXsH3E2b1Wro`
3. Click on it to edit

### Step 3: Add Localhost to Referrer Restrictions
1. Scroll to **HTTP referrers (web sites)**
2. Click **Add an HTTP referrer**
3. Add these URLs:
   - `http://localhost:5173*`
   - `http://localhost:5173/**`
   - `http://127.0.0.1:5173*`

4. Click **Save**

### Step 4: Also Configure Google OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
3. Under **Authorized redirect URIs**, add:
   - `http://localhost:5173/auth/callback`
4. Click **Save and Continue**

### Step 5: Configure Firebase Authentication
1. Go back to Firebase Console
2. Go to **Authentication** → **Settings**
3. Under **Authorized domains**, add:
   - `localhost`
   - `127.0.0.1`
4. Click **Save**

---

## 🚀 After Configuration

Once you've added these, the error should disappear and you'll be able to:
- ✅ Sign in with Google
- ✅ Use Firebase authentication
- ✅ Access the dashboard

### Test Sign-In
1. Refresh the app at http://localhost:5173
2. Click Google Sign-In button
3. Should now work without errors

---

## ⚠️ Important Notes

**Development (localhost:5173):**
- Uses unrestricted API key or localhost referrer
- Emulator can be used for testing

**Production (firebaseapp.com):**
- API key is restricted to production domain only
- Must use appropriate production credentials

**Environment Variables:**
- Currently points to production Firebase project
- For development with emulator, you may want to use `VITE_USE_FUNCTIONS_EMULATOR=1`

---

## 🔑 If You Don't Have Firebase Admin Access

If you cannot access Firebase Console, contact your Firebase project owner to:
1. Add `http://localhost:5173` to API key referrer restrictions
2. Add localhost to OAuth authorized origins
3. Add localhost to Firebase authorized domains

---

## Alternative: Use Firebase Emulator (Recommended for Development)

If you want to avoid configuring the production Firebase project, use the emulator:

### Install Firebase Emulator Suite
```bash
npm install -g firebase-tools
firebase init emulators
```

### Start Emulator
```bash
firebase emulators:start
```

### Update Environment Variables
```
VITE_USE_EMULATOR=1
VITE_FIRESTORE_EMULATOR_HOST=localhost:8080
VITE_AUTH_EMULATOR_URL=http://localhost:9099
```

This creates a safe, isolated development environment without touching production Firebase.

---

## 📋 Checklist

After making changes:
- [ ] Added `http://localhost:5173` to API key referrers
- [ ] Updated OAuth consent screen with localhost origins
- [ ] Updated Firebase authorized domains
- [ ] Refreshed browser (hard refresh: Ctrl+Shift+R)
- [ ] Tried signing in again
- [ ] Google Sign-In now works ✓

---

## 💡 Need Help?

If the issue persists after configuration:
1. **Hard refresh** the page (Ctrl+Shift+R or Cmd+Shift+R)
2. **Clear browser cache** for localhost:5173
3. **Check console** for specific error messages
4. **Verify API key** is the correct one from Firebase project
5. **Wait 5-10 minutes** for Firebase settings to propagate

---

**Your API Key:** `AIzaSyBl15V2pM4E6Yeh7YzVEdBjXsH3E2b1Wro`  
**Your Project ID:** `lifecv-d2724`  
**Your Dev URL:** `http://localhost:5173`  

Get this configured in Firebase Console and Google Sign-In will work! 🎯
