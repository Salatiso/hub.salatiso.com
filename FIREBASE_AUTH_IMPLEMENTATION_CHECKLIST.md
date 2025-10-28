# Firebase Authentication - Step-by-Step Implementation Checklist
## Copy & Paste Ready - For All Ecosystem Apps

**Print this document and check off each step as you complete it**

---

## ⚙️ PRE-IMPLEMENTATION (COMPLETE FIRST)

### [ ] Step 0.1: Verify Node.js Version
```bash
node --version
# Should output: v16 or higher (v18+ recommended)
```

### [ ] Step 0.2: Install Required Packages
```bash
npm install firebase@^10.5.0
npm install react-hot-toast@^2.4.1
npm install framer-motion@^10.16.0
npm install lucide-react@^0.263.0
```

### [ ] Step 0.3: Get Firebase Credentials
Go to: **https://console.firebase.google.com/**
1. Select your Firebase project
2. Click Settings (gear icon) → Project Settings
3. Scroll to "Your apps" section
4. Copy all credentials shown:
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID

**Store these safely - you'll need them in next step**

### [ ] Step 0.4: Create .env.local File
In your project root directory (same level as package.json):

Create file: `.env.local`

Paste this exactly (replace with YOUR credentials from Step 0.3):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY_HERE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID

NEXT_PUBLIC_AUTH_DEBUG=true
NEXT_PUBLIC_AUTHORIZED_FAMILY_EMAILS=your@email.com,another@email.com
```

**Save the file**

### [ ] Step 0.5: Add to .gitignore
Open `.gitignore` and add this line (if not already there):
```
.env.local
```

**Save the file**

### [ ] Step 0.6: Enable Firebase Authentication
Go to: **https://console.firebase.google.com/**
1. Select your Firebase project
2. Left menu → Authentication
3. Click "Sign-in method" tab
4. Click "Email/Password"
   - Toggle "Enabled" to ON
   - Click "Save"
5. Click "Google"
   - Toggle "Enabled" to ON
   - Click "Save"

**Done**

### [ ] Step 0.7: Create Firestore Database
Go to: **https://console.firebase.google.com/**
1. Select your Firebase project
2. Left menu → Firestore Database
3. Click "Create database"
4. Choose "Production mode"
5. Select your region (closest to you)
6. Click "Create"

**Wait for initialization (2-3 minutes)**

---

## 📁 IMPLEMENTATION FILES

### [ ] Step 1: Create Firebase Config File

**Location**: `src/config/firebase.ts`

Create this file and paste the content from `COMPLETE_FIREBASE_AUTHENTICATION_IMPLEMENTATION.md` → **STEP 1** section

**Verify**: File should be ~50 lines

### [ ] Step 2: Create Authentication Context

**Location**: `src/contexts/AuthContext.tsx`

Create this file and paste the content from `COMPLETE_FIREBASE_AUTHENTICATION_IMPLEMENTATION.md` → **STEP 2** section

**Verify**: File should be ~600 lines

### [ ] Step 3: Add Auth Provider to App

**Location**: `src/pages/_app.tsx` (or your main app file)

Copy this code and add it to wrap your entire app:
```typescript
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default MyApp;
```

**Verify**: AuthProvider wraps Component, Toaster is present

### [ ] Step 4: Create Login Page

**Location**: `src/pages/login.tsx` or `src/pages/auth/login.tsx`

Create this file and paste the content from `COMPLETE_FIREBASE_AUTHENTICATION_IMPLEMENTATION.md` → **STEP 4** section

**Verify**: File should be ~450 lines

### [ ] Step 5: Create Protected Route Component

**Location**: `src/components/ProtectedRoute.tsx`

Create this file and paste the content from `COMPLETE_FIREBASE_AUTHENTICATION_IMPLEMENTATION.md` → **STEP 5** section

**Verify**: File should be ~50 lines

### [ ] Step 6: Set Up Firestore Security Rules

**Location**: Firebase Console → Firestore → Rules

Go to: **https://console.firebase.google.com/**
1. Select your project
2. Left menu → Firestore Database
3. Click "Rules" tab
4. Replace all code with this:

```firestore
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }

    // Deny all other access by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

5. Click "Publish"

**Verify**: Success message appears

---

## 🧪 TESTING PHASE

### [ ] Test 1: Start Dev Server
```bash
npm run dev
# Should show: ready - started server on 0.0.0.0:3000
```

### [ ] Test 2: Check Firebase Connection
```
1. Open http://localhost:3000/login
2. Open browser DevTools (F12)
3. Go to Console tab
4. Look for: "✓ Firebase App initialized"
5. Look for: "[AUTH DEBUG]" messages
```

**If not present**: Check `.env.local` is in project root with all variables

### [ ] Test 3: Google Login Test
```
1. Click "Continue with Google" button
2. Complete Google sign-in
3. Should redirect to dashboard
4. Check console for success messages
5. Check Firestore: should see new user document
```

**If fails**: Check Google OAuth is enabled in Firebase

### [ ] Test 4: Email/Password Test
```
1. Go back to login page
2. Enter test email: test@test.com
3. Enter password: Test123456
4. Click "Sign In"
5. Should show error: "email not found" (expected for first try)
```

**Create test user**:
1. Firebase Console → Authentication → Users
2. Click "Add user"
3. Email: test@test.com
4. Password: Test123456
5. Click "Create"

**Then try login again**: Should work this time

### [ ] Test 5: Authorized Emails Test
```
1. Open .env.local
2. Remove your email from NEXT_PUBLIC_AUTHORIZED_FAMILY_EMAILS
3. Restart dev server
4. Try to login with your email
5. Should see error: "not authorized"
6. Add your email back
7. Restart dev server
8. Try again - should work
```

### [ ] Test 6: Protected Route Test
```
1. Create a test page with ProtectedRoute wrapper
2. Visit page without being logged in
3. Should redirect to /login
4. Login with valid email
5. Should now see the page content
```

**Test code**:
```typescript
// src/pages/test-protected.tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function TestPage() {
  const { user } = useAuth();
  return (
    <ProtectedRoute>
      <div>
        <h1>Protected Page</h1>
        <p>Welcome, {user?.email}</p>
      </div>
    </ProtectedRoute>
  );
}
```

---

## ✅ POST-IMPLEMENTATION VERIFICATION

### [ ] Verification 1: Check All Files Exist
```bash
ls -la src/config/firebase.ts
ls -la src/contexts/AuthContext.tsx
ls -la src/pages/login.tsx
ls -la src/components/ProtectedRoute.tsx
```

All should exist with no errors

### [ ] Verification 2: Check Console Logs
```
[ Login page should show:
  ✓ Firebase App initialized
  [AUTH DEBUG] Auth state listener set up
  [AUTH DEBUG] Authorized emails configured
]
```

### [ ] Verification 3: Check User Creation
```
1. Firestore → Collections → users
2. After successful login
3. Should see document with your UID
4. Document should have: email, displayName, role, preferences
```

### [ ] Verification 4: Check Session Persistence
```
1. Login successfully
2. Refresh page
3. Should NOT go back to login
4. Should stay on dashboard
5. Check localStorage in DevTools
```

### [ ] Verification 5: Check Logout
```
1. Click logout button
2. Should redirect to login
3. Clicking back button should NOT restore session
4. localStorage should be cleared
```

---

## 🐛 IF SOMETHING GOES WRONG

### Symptom: "Firebase config is missing"
**Fix**: 
- [ ] Verify .env.local exists in project root
- [ ] Verify all NEXT_PUBLIC_FIREBASE_* variables present
- [ ] Restart dev server: npm run dev

### Symptom: "Email not authorized"
**Fix**:
- [ ] Add email to NEXT_PUBLIC_AUTHORIZED_FAMILY_EMAILS in .env.local
- [ ] Restart dev server

### Symptom: "User not found" or "wrong password"
**Fix**:
- [ ] Create user in Firebase Console → Authentication → Add user
- [ ] Use exact email and password

### Symptom: "Google popup not appearing"
**Fix**:
- [ ] Check browser popup blocker
- [ ] Ensure localhost:3000 is authorized in Firebase Console
- [ ] Check browser console for errors

### Symptom: "Login works but profile doesn't load"
**Fix**:
- [ ] Check Firestore security rules are published
- [ ] Check users collection has read/write permissions
- [ ] Check browser console for errors

### Symptom: "Keep getting redirected to login"
**Fix**:
- [ ] Clear browser cache and localStorage
- [ ] Verify user profile exists in Firestore
- [ ] Check ProtectedRoute component setup

---

## 📋 FINAL CHECKLIST

Before declaring done:

- [ ] All files created in correct locations
- [ ] All environment variables set
- [ ] Firebase Authentication enabled (Email + Google)
- [ ] Firestore Database created
- [ ] Security rules published
- [ ] Can login with Google
- [ ] Can login with email/password
- [ ] User profile created in Firestore
- [ ] Protected routes work correctly
- [ ] Session persists on page refresh
- [ ] Logout clears session
- [ ] No console errors
- [ ] Ready for production deployment

---

## 🎉 SUCCESS INDICATORS

You'll know it's working when:

✅ Login page loads without errors  
✅ "Continue with Google" button works  
✅ Email/password login works  
✅ User data appears in Firestore  
✅ Dashboard shows after login  
✅ Session persists on refresh  
✅ Logout works correctly  
✅ Protected pages redirect when not logged in  

---

## 📞 SUPPORT REFERENCE

**If you need help**, have ready:
1. Copy of error message from browser console
2. Output of: `echo $NEXT_PUBLIC_FIREBASE_PROJECT_ID`
3. Screenshot of Firebase Console → Authentication
4. List of steps you've completed from this checklist
5. Your .env.local file (with API keys hidden)

---

**Document Version**: 1.0  
**For Use By**: Development Team  
**Applicable To**: All Salatiso Ecosystem Apps  
**Date**: October 28, 2025  

**Print this page and check off each step as you complete it ✓**
