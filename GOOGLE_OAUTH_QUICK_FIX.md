# 🚀 GOOGLE OAUTH LOCALHOST FIX - QUICK GUIDE

**Error:** `auth/requests-from-referer-http://localhost:3000-are-blocked`  
**Status:** ✅ FIXABLE in 5 minutes

---

## ⚡ QUICKEST FIX (5 minutes)

### Step 1: Go to Firebase Console
```
https://console.firebase.google.com/project/lifecv-d2724/authentication/settings/domains
```

### Step 2: Add localhost:3000
- Click **+ Add domain**
- Type: `localhost:3000`
- Click **Add**
- Wait for ✓ verified

---

### Step 3: Configure Google Provider
```
https://console.firebase.google.com/project/lifecv-d2724/authentication/providers
```

1. Click **Google** provider to edit
2. Add to **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   ```
3. Add to **Authorized redirect URIs:**
   ```
   http://localhost:3000/__/auth/handler
   ```
4. **Save**

---

### Step 4: Clear Browser & Retry
1. Hard refresh browser: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
2. Or clear cookies:
   - F12 → Application → Clear Storage
3. Try Google sign in again

---

## ✅ EXPECTED RESULT

After these steps, clicking **"Sign in with Google"** should:
- ✅ Show Google login dialog
- ✅ Not show referer error
- ✅ Allow you to select Google account
- ✅ Sign you in successfully

---

## 🆘 IF STILL NOT WORKING

### Option A: Use Local Account Instead
- Click **"Create Local Account"**
- Enter name and PIN
- Test Phase 3.4 with local account

### Option B: Use Email/Password
- Create test user in Firebase Console
- Use email/password to sign in
- Continue with widget testing

### Option C: Check Firestore Rules
Ensure your security rules allow reads:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

---

## 📝 WHAT THESE CHANGES DO

**Authorized Domains:**
- Tells Firebase which domains are safe for OAuth
- Localhost needs to be explicitly added
- Production domains (without port) also need to be added

**JavaScript Origins:**
- Tells Google OAuth where requests are coming from
- Must match exactly: protocol + domain + port
- `http://localhost:3000` ≠ `localhost:3000`

**Redirect URIs:**
- Where to send user after Google authentication
- Firebase handles this internally
- Pattern: `domain/__/auth/handler`

---

## 🔍 DEBUG TIPS

**Open DevTools Console (F12):**

```javascript
// Check if Firebase is initialized
console.log(firebase.auth().app.options.projectId);
// Should show: lifecv-d2724

// Check current user
console.log(firebase.auth().currentUser);
// null = not signed in, Object = signed in
```

---

## 📱 FOR DIFFERENT PORTS

If using **Vite port 5173** instead of 3000:

Add to Firebase:
- Authorized domain: `localhost:5173`
- JavaScript origin: `http://localhost:5173`
- Redirect URI: `http://localhost:5173/__/auth/handler`

If using **different IP address** for network testing:

Add to Firebase:
- Authorized domain: `192.168.86.250:3000` (or your IP)
- JavaScript origin: `http://192.168.86.250:3000`
- Redirect URI: `http://192.168.86.250:3000/__/auth/handler`

---

## ✨ YOU'VE GOT THIS!

**Just add localhost to Firebase Console and you're done.**

If you have questions, the error message will be much more descriptive now with the enhanced error handling in GuestLogin.tsx.

---

**Still stuck?** Try the Local Account option to continue Phase 3.4 testing! 🎯

