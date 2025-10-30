# 🔐 SALATISO ECOSYSTEM UNIFIED AUTHENTICATION CONFIGURATION
## Implementation Guide for Consistent Sign-In Across All Applications
### October 30, 2025

---

## 📋 DOCUMENT PURPOSE

This document provides a standardized authentication configuration pattern that can be implemented across all Salatiso ecosystem applications (web, mobile, desktop) to ensure consistent sign-in behavior, user management, and security.

---

## 🎯 CORE PRINCIPLES

### 1. Single Source of Truth
- One Firebase project for all authentication
- Unified user database in Firestore
- Centralized role and permission management
- Consistent authorization rules

### 2. Multi-Platform Support
- Web applications (Next.js, React)
- Mobile applications (iOS, Android via Flutter/React Native)
- Desktop applications (Electron)
- Progressive Web Apps (PWA)

### 3. Flexible Authentication Methods
- Email/Password
- Google OAuth 2.0
- Family verification codes
- Business access codes
- Emergency access codes

### 4. Granular Role Management
- Role-based access control (RBAC)
- Family hierarchy integration
- Business unit assignments
- Emergency escalation paths

---

## 🔧 AUTHENTICATION CONFIGURATION STRUCTURE

### Part 1: Environment Variables (All Applications)

**File**: `.env.local` (for development) and Firebase console (for production)

```bash
# ===== FIREBASE CONFIGURATION =====
# These values are the same across ALL applications

# Core Firebase
NEXT_PUBLIC_FIREBASE_PROJECT_ID=lifecv-d2724
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD...

# Authentication Domains (Multi-hosting support)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_ALIASES=salatiso-lifecv.web.app,lifecv-d2724.web.app,salatiso-lifecv.firebaseapp.com,lifecv-d2724.firebaseapp.com

# Authorized Family Members (Comma-separated emails)
NEXT_PUBLIC_AUTHORIZED_FAMILY_EMAILS=spiceinc@gmail.com,zenzxru@gmail.com,kwakhomdeni@gmail.com,tina@salatiso.com,mdenit21@gmail.com,visasande@gmail.com,mdenivisa@gmail.com,sazisimdeni@gmail.com,milandep.mdeni@gmail.com,milamdeni@gmail.com,azoramdeni@gmail.com,mdeninotembac@gmail.com

# Debug Mode (disable in production)
NEXT_PUBLIC_AUTH_DEBUG=true  # Set to 'false' in production

# ===== COMMON ACROSS ALL APPS =====
# The values above should be identical in all applications
# Only the hosting URLs might differ per deployment
```

---

## 📱 Implementation Pattern for Different Application Types

### Pattern 1: Next.js Web Application

**Location**: `src/config/firebase.ts`

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration from environment variables
const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: resolveAuthDomain(), // Dynamic domain resolution
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

function resolveAuthDomain() {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`;
  }
  
  // Client-side: determine from current host
  const currentHost = window.location.hostname;
  const aliasList = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_ALIASES?.split(',') || [];
  
  // If current host is in alias list, use it directly
  if (aliasList.includes(currentHost)) {
    return currentHost;
  }
  
  // Otherwise, use first alias in list
  return aliasList[0] || `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`;
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### Pattern 2: React Native / Flutter Mobile App

**Location**: `lib/config/firebase_config.dart` (Flutter) or `config/firebase.js` (React Native)

```dart
// Flutter Example
class FirebaseConfig {
  static const String projectId = 'lifecv-d2724';
  static const String authDomain = 'salatiso-lifecv.web.app';
  
  // These should match the web app configuration
  static final authDomainAliases = [
    'salatiso-lifecv.web.app',
    'lifecv-d2724.web.app',
    'salatiso-lifecv.firebaseapp.com',
    'lifecv-d2724.firebaseapp.com',
  ];
  
  static final authorizedEmails = [
    'spiceinc@gmail.com',
    'zenzxru@gmail.com',
    'kwakhomdeni@gmail.com',
    'tina@salatiso.com',
    // ... rest of authorized emails
  ];
  
  static Future<void> initializeFirebase() async {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  }
}
```

### Pattern 3: Electron Desktop Application

**Location**: `src/config/firebase.ts`

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  projectId: 'lifecv-d2724',
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: 'salatiso-lifecv.firebaseapp.com',
  // ... other config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Electron-specific: Enable persistent login across app restarts
setPersistence(auth, browserLocalPersistence);
```

---

## 👥 Role-Based Access Control (RBAC) Configuration

### Standard Role Definitions

```typescript
// src/types/index.ts - Consistent across all applications

export type UserRole = 
  | 'founder'                    // Founder/Visionary
  | 'parent_company_lead'        // Parent company representative
  | 'general_family_member'      // General family member
  | 'youth_member'               // Youth/next generation
  | 'business_member'            // Business/MNI representative
  | 'emergency_access'           // Emergency access user
  | 'guest';                     // Guest/limited access

export interface User {
  id: string;                           // Firebase UID
  email: string;                        // User email
  displayName: string;                  // Full name
  photoURL?: string;                    // Profile photo
  role: UserRole;                       // Primary role
  createdAt: Date;                      // Account creation
  lastLogin: Date;                      // Last login time
  familyHierarchy?: {
    relationship: 'parent' | 'child' | 'spouse' | 'sibling' | 'other';
    parentIds: string[];                // IDs of parents
    childIds: string[];                 // IDs of children
  };
  preferences: UserPreferences;
  gamification: GamificationProfile;
  mniProfile: MNIProfile;
}
```

### Role Hierarchy

```
┌─────────────────────────────────────────────┐
│           ROLE HIERARCHY                    │
├─────────────────────────────────────────────┤
│ Level 1: founder                            │
│   └─ Full system access                     │
│   └─ Can manage all users                   │
│   └─ Can approve significant decisions      │
│                                             │
│ Level 2: parent_company_lead                │
│   └─ Business unit management               │
│   └─ Strategic oversight                    │
│   └─ Team leadership                        │
│                                             │
│ Level 3: general_family_member              │
│   └─ Dashboard access                       │
│   └─ Personal portfolio management          │
│   └─ Limited family visibility              │
│                                             │
│ Level 4: youth_member                       │
│   └─ Learning platform                      │
│   └─ Career path exploration                │
│   └─ Limited financial access               │
│                                             │
│ Level 5: business_member                    │
│   └─ MNI specific access                    │
│   └─ Business operations                    │
│   └─ Financial reports                      │
│                                             │
│ Level 6: emergency_access                   │
│   └─ Critical information only              │
│   └─ Time-limited access                    │
│   └─ Audit trail enabled                    │
│                                             │
│ Level 7: guest                              │
│   └─ Public information only                │
│   └─ No personal data access                │
└─────────────────────────────────────────────┘
```

---

## 🔐 Authentication Context Implementation

### Unified AuthContext (All Web Apps)

**File**: `src/contexts/AuthContext.tsx`

```typescript
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '@/config/firebase';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFamilyCode: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
}

// Authorized emails (from environment)
const AUTHORIZED_EMAILS = process.env.NEXT_PUBLIC_AUTHORIZED_FAMILY_EMAILS?.split(',') || [];

// Role determination function (consistent across all apps)
const determineUserRole = (email: string): UserRole => {
  const emailLower = email.toLowerCase();
  
  // Founder
  if (emailLower === 'spiceinc@gmail.com') return 'founder';
  
  // Parent Company Lead
  if (emailLower === 'visasande@gmail.com' || emailLower === 'mdenivisa@gmail.com') 
    return 'parent_company_lead';
  
  // Mother (Tina) - Family Steward & Finance Lead
  if (emailLower === 'tina@salatiso.com')
    return 'general_family_member'; // Could be extended to 'family_steward' if role needed
  
  // Youth Members
  if (emailLower.includes('milandep') || emailLower.includes('milamdeni') || 
      emailLower.includes('azora') || emailLower === 'sazisimdeni@gmail.com')
    return 'youth_member';
  
  // General Family
  if (emailLower.includes('kwakho') || emailLower.includes('mdenit') || 
      emailLower.includes('zenzx'))
    return 'general_family_member';
  
  return 'guest';
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const initializeUserProfile = async (firebaseUser: FirebaseUser): Promise<User> => {
    // Same implementation as LifeCV app
    // Uses determineUserRole function above
  };

  const login = async (email: string, password: string) => {
    if (!AUTHORIZED_EMAILS.includes(email.toLowerCase())) {
      throw new Error('Unauthorized email');
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    await signInWithRedirect(auth, googleProvider);
  };

  // Rest of implementation...
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
};
```

---

## 🔒 Firestore Security Rules (Unified)

**File**: `firestore.rules`

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ===== USERS COLLECTION =====
    match /users/{userId} {
      // User can read their own profile
      allow read: if request.auth.uid == userId;
      
      // User can write their own profile
      allow write: if request.auth.uid == userId 
        && request.resource.data.id == request.auth.uid;
      
      // Founder can read all user profiles
      allow read: if isFounder();
    }
    
    // ===== PROJECTS COLLECTION =====
    match /projects/{document=**} {
      // All authenticated users can read
      allow read: if request.auth != null;
      
      // Founder can write
      allow write: if isFounder();
    }
    
    // ===== ROLES MAPPING =====
    match /roles/{roleId} {
      // All authenticated users can read
      allow read: if request.auth != null;
      
      // Only founder can write
      allow write: if isFounder();
    }
    
    // ===== HELPER FUNCTIONS =====
    function isFounder() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.email == 'spiceinc@gmail.com';
    }
    
    function isAuthorizedEmail() {
      let authorized = [
        'spiceinc@gmail.com',
        'tina@salatiso.com',
        'visasande@gmail.com',
        // ... add all authorized emails
      ];
      return request.auth.token.email in authorized;
    }
  }
}
```

---

## 📋 Authorized Users Master List

### Current Authorized Family Members

```
┌─────────────────────────────────┬──────────────────────┬────────────────────┐
│ Name                            │ Email                │ Role               │
├─────────────────────────────────┼──────────────────────┼────────────────────┤
│ Salatiso (Founder)              │ spiceinc@gmail.com   │ founder            │
│ Sazi (Founder)                  │ zenzxru@gmail.com    │ founder            │
│ Tina (Mother)                   │ tina@salatiso.com    │ family_steward     │
│ Kwakho                          │ kwakhomdeni@gmail.com│ general_family     │
│ Visa (Parent Company)           │ visasande@gmail.com  │ parent_company_lead│
│ Visa (Alt Email)                │ mdenivisa@gmail.com  │ parent_company_lead│
│ Sazi Sisimdeni                  │ sazisimdeni@gmail.com│ youth_member       │
│ Milandep Mdeni                  │ milandep.mdeni@gmail │ youth_member       │
│ Milamdeni                        │ milamdeni@gmail.com  │ youth_member       │
│ Azora Mdeni                     │ azoramdeni@gmail.com │ youth_member       │
│ Mdeni Notemba Cert              │ mdeninotembac@gmail  │ general_family     │
│ Mdeni T21                       │ mdenit21@gmail.com   │ general_family     │
└─────────────────────────────────┴──────────────────────┴────────────────────┘
```

### Adding New Users

```typescript
// 1. Add email to AUTHORIZED_EMAILS in .env.local
NEXT_PUBLIC_AUTHORIZED_FAMILY_EMAILS=...existing...,newemail@domain.com

// 2. Update determineUserRole() function to recognize new user
const determineUserRole = (email: string): UserRole => {
  const emailLower = email.toLowerCase();
  
  // ... existing roles ...
  
  // New user
  if (emailLower === 'newemail@domain.com') return 'general_family_member';
  
  return 'guest';
};

// 3. Update Firestore rules if needed
// 4. Redeploy application
```

---

## 🚀 Implementation Checklist for New Applications

When implementing authentication in a new Salatiso ecosystem application:

- [ ] Copy `.env` template from LifeCV app
- [ ] Update `NEXT_PUBLIC_FIREBASE_PROJECT_ID` if using different project
- [ ] Copy `AUTHORIZED_EMAILS` list exactly as-is
- [ ] Copy `determineUserRole()` function and customize as needed
- [ ] Copy `AuthContext.tsx` and adapt to app architecture
- [ ] Copy `ProtectedRoute.tsx` for route protection
- [ ] Copy `firestore.rules` to your Firestore config
- [ ] Test with at least one authorized email
- [ ] Test with unauthorized email (should be rejected)
- [ ] Verify role determination works correctly
- [ ] Test login persistence across app restart/reload
- [ ] Enable production mode (set `NEXT_PUBLIC_AUTH_DEBUG=false`)

---

## 🔄 Cross-Platform Synchronization

### Data Sync Between Applications

```
┌──────────────────────────────────────────────────┐
│    User Updates in Any Application               │
├──────────────────────────────────────────────────┤
│ 1. User updates profile in Web App               │
│ 2. Data sent to Firebase Firestore               │
│ 3. Real-time listener triggers on Mobile App     │
│ 4. Mobile App UI updates automatically           │
│ 5. Same sync happens for Desktop App             │
└──────────────────────────────────────────────────┘
```

### Firestore Real-Time Listeners (All Platforms)

```typescript
// This pattern works identically across web, mobile, desktop

import { doc, onSnapshot } from 'firebase/firestore';

export function setupUserListener(userId: string, onUpdate: (user: User) => void) {
  const userRef = doc(db, 'users', userId);
  
  const unsubscribe = onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      onUpdate(doc.data() as User);
    }
  });
  
  return unsubscribe; // Call to stop listening
}
```

---

## 📊 Testing Authentication Across Platforms

### Test Matrix

```
┌──────────────────┬────────┬────────┬────────┬────────┐
│ Test Scenario    │ Web    │ Mobile │ Desktop│ Result │
├──────────────────┼────────┼────────┼────────┼────────┤
│ Email/Password   │ ✅     │ ✅     │ ✅     │ Pass   │
│ Google OAuth     │ ✅     │ ✅     │ ✅     │ Pass   │
│ Family Code      │ ✅     │ ✅     │ ✅     │ Pass   │
│ Role Assignment  │ ✅     │ ✅     │ ✅     │ Pass   │
│ Data Sync        │ ✅     │ ✅     │ ✅     │ Pass   │
│ Session Persist  │ ✅     │ ✅     │ ✅     │ Pass   │
│ Route Protection │ ✅     │ N/A    │ N/A    │ Pass   │
│ Logout           │ ✅     │ ✅     │ ✅     │ Pass   │
└──────────────────┴────────┴────────┴────────┴────────┘
```

---

## 🔐 Security Best Practices

### 1. Environment Variables
- Never commit `.env.local` to version control
- Use `.env.example` as template
- Rotate API keys periodically
- Use different keys for dev/prod

### 2. Firebase Rules
- Always validate `request.auth` exists
- Match UIDs exactly
- Validate email domain for production accounts
- Test rules with Firebase emulator

### 3. Session Management
- Implement logout on all platforms
- Clear cached user data on logout
- Use httpOnly cookies for sensitive tokens (web)
- Implement biometric authentication (mobile)

### 4. Audit Logging
- Log all login attempts
- Track role changes
- Monitor access to sensitive data
- Set up alerts for failed logins

---

## 📱 Platform-Specific Implementation Notes

### Web Applications (Next.js/React)
- Use `ProtectedRoute` wrapper for authenticated pages
- Implement loading states during auth verification
- Clear browser cache when deploying new auth changes
- Use JWT tokens for API calls

### Mobile Applications (Flutter/React Native)
- Use secure storage for refresh tokens
- Implement biometric authentication
- Handle app suspend/resume auth state
- Use deep linking for OAuth redirects

### Desktop Applications (Electron)
- Use native system keychain for credentials
- Implement offline authentication caching
- Handle automatic re-authentication
- Use IPC for secure token passing

---

## 🆘 Troubleshooting Common Issues

### Issue: Users from different applications can't see each other's data
**Solution**: Ensure all apps use the same Firebase project and Firestore database

### Issue: Role assignment inconsistent across platforms
**Solution**: Copy `determineUserRole()` function exactly to all apps

### Issue: Login works on web but not mobile
**Solution**: Verify Firebase configuration and API keys match exactly

### Issue: Data not syncing between apps
**Solution**: Check Firestore real-time listener is set up in all apps

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- Monthly: Review failed login attempts
- Quarterly: Audit user roles and permissions
- Bi-annually: Review and update security rules
- Annually: Rotate API keys and certificates

### Adding New Users
Contact administrator with:
- Full name
- Email address
- Intended role
- Required permissions

### Troubleshooting Resources
- Firebase Console: https://console.firebase.google.com
- Documentation: See `DOCUMENTATION_INDEX_SECURITY_FIX_OCT30.md`
- Error logs: Check browser console and Firebase logs

---

## 📚 Related Documentation

- `SECURITY_FIX_ROUTE_PROTECTION_OCT30.md` - Route protection implementation
- `SECURITY_FIX_ARCHITECTURE_DIAGRAM_OCT30.md` - Architecture diagrams
- `AuthContext.tsx` - Reference implementation
- `firestore.rules` - Security rules reference

---

## ✅ Verification Checklist

- [ ] All authorized emails match across all applications
- [ ] Role determination logic identical in all apps
- [ ] Firebase configuration values identical
- [ ] Firestore rules deployed and tested
- [ ] ProtectedRoute component in place (web apps)
- [ ] Real-time listeners configured (mobile/desktop)
- [ ] Environment variables configured
- [ ] Testing completed across all platforms
- [ ] Documentation updated
- [ ] Team trained on new configuration

---

**Document Version**: 1.0
**Last Updated**: October 30, 2025
**Status**: ✅ Ready for Implementation
**Next Review**: Q1 2026

---

## 🎯 Implementation Support

For implementation questions or issues, refer to:
1. This document (comprehensive guide)
2. AuthContext.tsx (reference implementation)
3. Firebase documentation (https://firebase.google.com/docs)
4. Team lead for approval and deployment
