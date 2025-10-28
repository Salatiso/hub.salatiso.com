# Firebase Authentication - Quick Troubleshooting Reference
## Fast Resolution Guide for LifeSync & All Ecosystem Apps

**Use this guide when authentication is failing**

---

## 🚨 IMMEDIATE DIAGNOSTICS

### Step 1: Check Environment Variables
```bash
# In your project root, verify .env.local exists with:
cat .env.local

# You should see:
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
NEXT_PUBLIC_AUTHORIZED_FAMILY_EMAILS=xxx
NEXT_PUBLIC_AUTH_DEBUG=true
```

**If any are missing:**
1. Go to Firebase Console → Settings → Project Settings
2. Copy all credentials
3. Paste into `.env.local`
4. **Restart dev server: npm run dev**

---

### Step 2: Check Firebase Console
```
✓ Firebase Project created: https://console.firebase.google.com/
✓ Authentication enabled:
  - Email/Password provider: ENABLED
  - Google OAuth: ENABLED
✓ Firestore Database: CREATED
```

---

### Step 3: Enable Debug Logging
```bash
# In .env.local, make sure:
NEXT_PUBLIC_AUTH_DEBUG=true

# In browser console, you should see:
[AUTH DEBUG] messages
[AUTH ERROR] messages
```

---

## 🔴 AUTHENTICATION FAILURES

### Failure: "Email not authorized"

**What it means**: User's email is not in the allowed list

**Fix**:
```env
# .env.local - Add the email to the authorized list
NEXT_PUBLIC_AUTHORIZED_FAMILY_EMAILS=email1@gmail.com,email2@gmail.com,newuser@gmail.com
```

Then:
1. Save file
2. Restart dev server: `npm run dev`
3. Try login again

---

### Failure: "Firebase config missing"

**What it means**: Environment variables not loaded

**Fix**:
```bash
# Step 1: Kill dev server (Ctrl+C)
# Step 2: Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Step 3: Clear next cache
rm -rf .next

# Step 4: Restart dev server
npm run dev
```

---

### Failure: "Google popup not appearing"

**What it means**: Google OAuth not properly configured

**Fix**:
1. Go to Firebase Console → Authentication → Settings → Authorized Domains
2. Add your domain:
   - Development: `localhost:3000`
   - Production: `yourdomain.com`
3. Wait 30 minutes for changes to propagate
4. Try again

---

### Failure: "User profile not created after login"

**What it means**: Firestore not accessible or rules blocking writes

**Fix**:

**Check 1: Firestore exists**
1. Firebase Console → Firestore Database
2. Should show "Start Collection"
3. If not, create database in production mode

**Check 2: Security Rules**
```firestore
# Firebase Console → Firestore → Rules

# Paste this:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click "Publish"

---

### Failure: "Wrong password"

**What it means**: Password doesn't match registered password

**Fix**:
1. Go to Firebase Console → Authentication → Users
2. Find the user email
3. Click the three dots → Delete user
4. Create a new test user with known password
5. Try login again

---

### Failure: "Invalid credentials"

**What it means**: Email doesn't exist in Firebase

**Fix**:
1. Firebase Console → Authentication → Users
2. Click "Add user"
3. Enter test email and password
4. Click "Create"
5. Try login with exact email

---

## 🟡 PARTIAL FAILURES

### Problem: Login works, but redirects back to login page

**Cause**: User profile not initializing

**Fix**:
```typescript
// In src/contexts/AuthContext.tsx

// After line: const userProfile = await initializeUserProfile(result.user);

// Add this debug line:
console.log('User profile:', userProfile);

// Check browser console to see if profile has data
```

Then check Firestore:
1. Firebase Console → Firestore → collections → users
2. Should see a document with your uid
3. Should have email, displayName, role, preferences

If missing:
1. Delete the user from Firebase Authentication
2. Delete any partial user documents from Firestore
3. Create new user and try again

---

### Problem: Google login works, email/password doesn't

**Cause**: Email/password provider not enabled

**Fix**:
1. Firebase Console → Authentication → Sign-in method
2. Click "Email/Password"
3. Toggle "Enabled" to ON
4. Click "Save"
5. Try email/password login again

---

### Problem: Can login but see "not authorized" error

**Cause**: Email in Firebase but not in authorized list

**Fix**:
```env
# Get the email from error message
# Example: "Email test@example.com is not authorized"

# Add to .env.local:
NEXT_PUBLIC_AUTHORIZED_FAMILY_EMAILS=test@example.com

# Save and restart
npm run dev
```

---

## 📊 VERIFICATION CHECKLIST

Run through this before asking for help:

### Checklist Item 1: Firebase Config
```bash
# Terminal
node -e "
const env = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};
console.log(JSON.stringify(env, null, 2));
"
```

Should show all values (not undefined)

### Checklist Item 2: Auth State
```javascript
// In browser console, after page loads
console.log('Auth loading:', !!window.localStorage.getItem('firebase:authUser:xxx'));
```

### Checklist Item 3: Firestore Access
```javascript
// In browser console
fetch('https://console.firebase.google.com/project/YOUR-PROJECT/firestore').then(r => r.status).then(console.log)
```

Should return 200

### Checklist Item 4: Browser Cache
```bash
# Clear all cache/storage
# Chrome DevTools → Application → Clear site data
# Then refresh page
```

---

## 🔍 DEBUG LOGGING GUIDE

### Enable Full Debug Logging
```env
# .env.local
NEXT_PUBLIC_AUTH_DEBUG=true
NODE_ENV=development
```

### What to Look For in Console

**Good Login Flow**:
```
[AUTH DEBUG] 🔐 Attempting email/password login for: test@gmail.com
[AUTH DEBUG] ✅ Firebase authentication successful for: test@gmail.com
[AUTH DEBUG] 👤 Existing user profile found, updating...
[AUTH DEBUG] ✅ Email authorized, initializing user profile for: test@gmail.com
✓ Firebase App initialized
✓ Firebase authentication successful
User redirected to dashboard
```

**Failed Login Flow**:
```
[AUTH ERROR] ❌ Firebase auth failed: auth/user-not-found
[AUTH ERROR] ❌ User email not authorized: unknown@email.com
[AUTH ERROR] Email not in authorized list
```

---

## ⚡ FASTEST FIXES (Try These First)

### Fix 1: Restart Everything (30 seconds)
```bash
# Kill dev server (Ctrl+C)
# Clear cache
rm -rf .next

# Restart
npm run dev
```

### Fix 2: Clear Browser Storage (30 seconds)
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Fix 3: Re-check .env.local (1 minute)
```bash
# Verify file exists and has all variables
cat .env.local | wc -l  # Should show at least 8 lines

# If less than 8 lines, you're missing variables
```

### Fix 4: Check Email Exists in Firebase (2 minutes)
```
1. Firebase Console → Authentication → Users
2. Search for your test email
3. If not found, click "Add user" to create
```

### Fix 5: Reset Everything (5 minutes)
```bash
# Remove node_modules
rm -rf node_modules

# Remove next cache
rm -rf .next

# Reinstall
npm install

# Start fresh
npm run dev
```

---

## 📞 WHEN TO SEEK HELP

Before reaching out, provide this information:

**Email Subject**: "Firebase Auth Failed - [Error Message]"

**Include**:
1. Error message from browser console
2. Output of: `echo $NEXT_PUBLIC_FIREBASE_PROJECT_ID`
3. Steps you've already tried
4. Browser console logs (copy full output)
5. .env.local variables (sanitize API keys)

---

## 🎯 FASTEST PATH TO WORKING AUTH

If starting from scratch, follow this order (15 minutes total):

```
1. [ ] Copy .env.local template to project root
2. [ ] Fill in Firebase credentials from Console
3. [ ] Copy firebase.ts to src/config/
4. [ ] Copy AuthContext.tsx to src/contexts/
5. [ ] Copy login.tsx to src/pages/
6. [ ] Copy ProtectedRoute.tsx to src/components/
7. [ ] Add AuthProvider to _app.tsx
8. [ ] Restart dev server: npm run dev
9. [ ] Visit http://localhost:3000/login
10. [ ] Try Google login
11. [ ] Check console for [AUTH DEBUG] messages
12. [ ] If error, search this guide for error message
```

---

**Last Updated**: October 28, 2025  
**Applicable To**: LifeSync, Sazi Life Academy, All Ecosystem Apps  
**Firebase Project**: Shared authentication service
