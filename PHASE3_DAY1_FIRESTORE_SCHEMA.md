# 📊 PHASE 3 DAY 1: Firestore Database Schema Design

**Status:** 🟢 IN PROGRESS  
**Date:** October 29, 2025  
**Objective:** Design complete Firestore schema for cloud sync  

---

## 🎯 Firestore Collections Architecture

### Collection Hierarchy

```
LifeSync Firestore Database
├── users/                          (User accounts & authentication)
│   ├── {userId}
│   │   ├── email: string
│   │   ├── displayName: string
│   │   ├── photoURL: string
│   │   ├── createdAt: timestamp
│   │   ├── lastLogin: timestamp
│   │   ├── isVerified: boolean
│   │   ├── subscriptionTier: 'free' | 'pro' | 'premium'
│   │   └── preferences: object
│   │
│   └── {userId}/verifications/     (Sub-collection)
│       └── {verificationId}
│
├── profiles/                       (User profile data)
│   ├── {profileId}
│   │   ├── userId: string (reference)
│   │   ├── displayName: string
│   │   ├── bio: string
│   │   ├── photoURL: string
│   │   ├── personalInfo: object
│   │   ├── contactInfo: object
│   │   ├── identity: object
│   │   ├── services: object
│   │   ├── createdAt: timestamp
│   │   ├── updatedAt: timestamp
│   │   └── isPublic: boolean
│   │
│   └── {profileId}/activities/     (Sub-collection)
│       └── {activityId}
│
├── verifications/                  (Verification records)
│   ├── {verificationId}
│   │   ├── userId: string (reference)
│   │   ├── type: 'email' | 'phone' | 'identity' | 'service'
│   │   ├── status: 'pending' | 'verified' | 'rejected'
│   │   ├── evidence: object
│   │   ├── verifiedAt: timestamp
│   │   ├── expiresAt: timestamp
│   │   └── metadata: object
│   │
│   └── {verificationId}/history/   (Sub-collection)
│       └── {historyId}
│
├── trust_scores/                   (Trust calculations)
│   ├── {userId}
│   │   ├── totalScore: number (0-100)
│   │   ├── level: 'minimal' | 'basic' | 'verified' | 'trusted'
│   │   ├── categories: object
│   │   │   ├── contact: number
│   │   │   ├── verification: number
│   │   │   ├── identity: number
│   │   │   ├── security: number
│   │   │   └── services: number
│   │   ├── lastUpdated: timestamp
│   │   └── nextRecalc: timestamp
│   │
│   └── {userId}/details/           (Sub-collection)
│       └── {detailId}
│
├── notifications/                  (User notifications)
│   ├── {notificationId}
│   │   ├── userId: string (reference)
│   │   ├── type: 'email' | 'sms' | 'push' | 'in-app'
│   │   ├── title: string
│   │   ├── body: string
│   │   ├── status: 'pending' | 'sent' | 'delivered' | 'failed'
│   │   ├── createdAt: timestamp
│   │   ├── sentAt: timestamp
│   │   ├── readAt: timestamp
│   │   ├── actionUrl: string
│   │   └── metadata: object
│   │
│   └── {notificationId}/logs/      (Sub-collection)
│       └── {logId}
│
├── search_history/                 (Search records)
│   ├── {userId}
│   │   ├── searches: array
│   │   │   ├── query: string
│   │   │   ├── timestamp: timestamp
│   │   │   └── results: number
│   │   └── savedSearches: array
│   │       ├── name: string
│   │       ├── query: string
│   │       └── filters: object
│   │
│   └── (Sub-collections for pagination)
│
├── activity_logs/                  (Audit trail)
│   ├── {userId}
│   │   ├── timestamp: timestamp
│   │   ├── action: string
│   │   ├── collection: string
│   │   ├── document: string
│   │   ├── oldValue: any
│   │   ├── newValue: any
│   │   └── metadata: object
│   │
│   └── (Organized by date for querying)
│
└── analytics/                      (User behavior analytics)
    ├── {userId}
    │   ├── totalSessions: number
    │   ├── totalEvents: number
    │   ├── averageSessionDuration: number
    │   ├── lastActivityAt: timestamp
    │   ├── deviceInfo: object
    │   └── locationInfo: object
    │
    └── (Sub-collections for events)
```

---

## 📋 Collection Details

### 1. users/ Collection

**Purpose:** Store user account information and authentication metadata

```typescript
interface User {
  // Auth
  email: string;                    // User's email (unique)
  displayName: string;              // Display name
  photoURL: string;                 // Profile photo URL
  
  // Account Status
  isVerified: boolean;              // Email verified
  emailVerifiedAt?: timestamp;      // When email was verified
  phoneVerified: boolean;           // Phone verified
  
  // Subscription
  subscriptionTier: 'free' | 'pro' | 'premium';
  subscriptionStartDate?: timestamp;
  subscriptionEndDate?: timestamp;
  
  // Metadata
  createdAt: timestamp;             // Account creation
  lastLogin: timestamp;             // Last login time
  lastActivityAt: timestamp;        // Last activity
  accountStatus: 'active' | 'suspended' | 'deleted';
  
  // Preferences
  preferences: {
    language: string;
    timezone: string;
    theme: 'light' | 'dark';
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacyLevel: 'public' | 'friends' | 'private';
  };
  
  // Metadata
  version: number;                  // Document version for sync
}
```

**Indexes:**
- email (for login lookups)
- createdAt (for user analytics)
- lastLogin (for active users)
- subscriptionTier (for filtering)

### 2. profiles/ Collection

**Purpose:** Store detailed user profile information

```typescript
interface Profile {
  // Identification
  userId: string;                   // Reference to users/{userId}
  displayName: string;
  bio: string;
  photoURL: string;
  
  // Contact Information
  contactInfo: {
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  
  // Personal Information
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: string;
    maritalStatus?: string;
    occupation?: string;
    company?: string;
  };
  
  // Identity Verification
  identity: {
    idType: 'passport' | 'license' | 'id_card';
    idNumber: string;
    issuingCountry: string;
    expirationDate: timestamp;
    verificationStatus: 'pending' | 'verified' | 'rejected';
  };
  
  // Services Registration
  services: {
    healthInsurance?: {
      provider: string;
      policyNumber: string;
      expirationDate: timestamp;
    };
    emergencyServices?: {
      enabled: boolean;
      preferredContact: string;
    };
  };
  
  // Status
  isPublic: boolean;                // Profile visibility
  isComplete: boolean;              // Profile completion status
  
  // Timestamps
  createdAt: timestamp;
  updatedAt: timestamp;
  version: number;
}
```

**Indexes:**
- userId (for user lookups)
- isPublic (for public profiles)
- updatedAt (for recent updates)

### 3. verifications/ Collection

**Purpose:** Track verification status for different verification types

```typescript
interface Verification {
  // Identification
  userId: string;                   // Reference to users/{userId}
  type: 'email' | 'phone' | 'identity' | 'service';
  
  // Status
  status: 'pending' | 'verified' | 'rejected';
  
  // Data
  value: string;                    // Email, phone, ID number, etc.
  evidence: {
    type: string;
    url: string;                    // URL to evidence/document
    hash: string;                   // Hash for verification
  };
  
  // Timing
  initiatedAt: timestamp;
  verifiedAt?: timestamp;
  expiresAt?: timestamp;            // When verification expires
  
  // Metadata
  verifierNotes?: string;
  rejectionReason?: string;
  attemptCount: number;
  
  version: number;
}
```

**Indexes:**
- userId (for user's verifications)
- status (for pending verifications)
- expiresAt (for expiring verifications)
- type (for filtering by type)

### 4. trust_scores/ Collection

**Purpose:** Store calculated trust scores and breakdown

```typescript
interface TrustScore {
  // User Reference
  userId: string;                   // Reference to users/{userId}
  
  // Overall Score
  totalScore: number;               // 0-100
  level: 'minimal' | 'basic' | 'verified' | 'trusted';
  
  // Category Breakdown
  categories: {
    contact: number;                // Address, phone, email
    verification: number;            // Email, phone verified
    identity: number;               // ID verified
    security: number;               // 2FA, recovery codes
    services: number;               // Services registered
  };
  
  // Calculation Details
  completedTasks: string[];         // Array of task IDs
  totalTasks: number;               // 8
  completionPercentage: number;     // 0-100
  
  // Timing
  calculatedAt: timestamp;
  nextRecalc: timestamp;
  
  // Metadata
  version: number;
}
```

**Indexes:**
- userId (for lookups)
- totalScore (for ranking)
- level (for filtering)
- calculatedAt (for history)

### 5. notifications/ Collection

**Purpose:** Store user notifications for all channels

```typescript
interface Notification {
  // User Reference
  userId: string;                   // Reference to users/{userId}
  
  // Content
  type: 'email' | 'sms' | 'push' | 'in-app';
  title: string;
  body: string;
  richContent?: any;
  
  // Routing
  recipient: string;               // Email or phone number
  channel: string;                 // SMS, Email, etc.
  
  // Status
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  
  // Timing
  createdAt: timestamp;
  scheduledFor?: timestamp;        // For scheduled notifications
  sentAt?: timestamp;
  deliveredAt?: timestamp;
  
  // Interaction
  readAt?: timestamp;
  interactedAt?: timestamp;
  actionUrl?: string;
  
  // Error Handling
  failureReason?: string;
  retryCount: number;
  nextRetry?: timestamp;
  
  // Metadata
  source: string;                  // Which service triggered
  tags: string[];
  version: number;
}
```

**Indexes:**
- userId + createdAt (for user's notification feed)
- status (for processing pending notifications)
- scheduledFor (for scheduling notifications)
- sentAt (for delivery tracking)

### 6. search_history/ Collection

**Purpose:** Track search queries and saved searches

```typescript
interface SearchHistory {
  // User Reference
  userId: string;
  
  // Recent Searches
  recentSearches: Array<{
    query: string;
    timestamp: timestamp;
    resultCount: number;
    filters: object;
  }>;
  
  // Saved Searches
  savedSearches: Array<{
    id: string;
    name: string;
    query: string;
    filters: object;
    createdAt: timestamp;
    lastUsed: timestamp;
  }>;
  
  // Statistics
  totalSearches: number;
  lastSearchAt: timestamp;
  version: number;
}
```

**Indexes:**
- userId (for user lookups)
- lastSearchAt (for active users)

### 7. activity_logs/ Collection

**Purpose:** Audit trail for compliance and debugging

```typescript
interface ActivityLog {
  // Identification
  userId: string;
  
  // Action Details
  action: 'create' | 'update' | 'delete' | 'view';
  resourceType: string;             // users, profiles, verifications
  resourceId: string;
  
  // Changes
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  
  // Context
  timestamp: timestamp;
  ipAddress: string;
  userAgent: string;
  
  // Metadata
  version: number;
}
```

**Indexes:**
- userId + timestamp (for user activity)
- timestamp (for compliance audits)

### 8. analytics/ Collection

**Purpose:** User behavior and engagement analytics

```typescript
interface Analytics {
  // User Reference
  userId: string;
  
  // Session Data
  totalSessions: number;
  currentSessionDuration: number;
  averageSessionDuration: number;
  
  // Event Data
  totalEvents: number;
  lastEventAt: timestamp;
  
  // Engagement
  daysActive: number;
  lastActiveDate: timestamp;
  engagementScore: number;
  
  // Device & Location
  devices: Array<{
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    lastUsedAt: timestamp;
  }>;
  
  // Metadata
  version: number;
}
```

**Indexes:**
- lastActiveDate (for active users)
- engagementScore (for top users)

---

## 🔐 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - user data isolation
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // Verifications sub-collection
      match /verifications/{verificationId} {
        allow read, write: if request.auth.uid == userId;
      }
    }
    
    // Profiles collection - user can read public or own
    match /profiles/{profileId} {
      allow read: if resource.data.isPublic == true || request.auth.uid == resource.data.userId;
      allow write: if request.auth.uid == resource.data.userId;
      
      // Activities sub-collection
      match /activities/{activityId} {
        allow read, write: if request.auth.uid == get(/databases/$(database)/documents/profiles/$(profileId)).data.userId;
      }
    }
    
    // Verifications - user can read/write own
    match /verifications/{verificationId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      
      // History sub-collection
      match /history/{historyId} {
        allow read, write: if request.auth.uid == get(/databases/$(database)/documents/verifications/$(verificationId)).data.userId;
      }
    }
    
    // Trust Scores - user can read own
    match /trust_scores/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if false; // Calculated by Cloud Functions only
      
      // Details sub-collection
      match /details/{detailId} {
        allow read: if request.auth.uid == userId;
        allow write: if false;
      }
    }
    
    // Notifications - user can read own
    match /notifications/{notificationId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    // Search History - user can read/write own
    match /search_history/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Activity Logs - user can read own
    match /activity_logs/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if false; // Written by Cloud Functions only
    }
    
    // Analytics - user can read own
    match /analytics/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if false; // Calculated by Cloud Functions only
    }
  }
}
```

---

## 📑 Firestore Indexes

**Composite Indexes Needed:**

```yaml
# For user queries
- collection: users
  fields:
    - { fieldPath: subscriptionTier, order: ASCENDING }
    - { fieldPath: createdAt, order: DESCENDING }

# For profile queries
- collection: profiles
  fields:
    - { fieldPath: isPublic, order: ASCENDING }
    - { fieldPath: updatedAt, order: DESCENDING }

# For verification tracking
- collection: verifications
  fields:
    - { fieldPath: userId, order: ASCENDING }
    - { fieldPath: status, order: ASCENDING }
    - { fieldPath: expiresAt, order: ASCENDING }

# For notification processing
- collection: notifications
  fields:
    - { fieldPath: userId, order: ASCENDING }
    - { fieldPath: createdAt, order: DESCENDING }
    - { fieldPath: status, order: ASCENDING }

# For analytics
- collection: analytics
  fields:
    - { fieldPath: lastActiveDate, order: DESCENDING }
    - { fieldPath: engagementScore, order: DESCENDING }
```

---

## 🎯 Schema Design Considerations

### Data Normalization
- ✅ User data in `users/` collection
- ✅ Profile details in `profiles/` collection
- ✅ Verification records in `verifications/` collection
- ✅ Trust scores calculated by Cloud Functions

### Real-time Sync
- Sub-collections for nested data
- Timestamps for sync tracking
- Version numbers for conflict detection
- Change logs for audit trail

### Performance
- Indexed commonly queried fields
- Denormalization where necessary
- Batch operations for consistency
- Query optimization with composite indexes

### Security
- Row-level access control via security rules
- User data isolation
- Cloud Functions for privileged operations
- Audit logging for compliance

---

## 📝 Next Steps

1. **Create Firestore Database**
   - Go to Firebase Console
   - Create Firestore database in production mode
   - Enable real-time sync

2. **Deploy Security Rules**
   - Copy security rules from above
   - Deploy via Firebase CLI: `firebase deploy --only firestore:rules`

3. **Create Indexes**
   - Deploy composite indexes
   - Verify in Firestore console

4. **Create Cloud Functions**
   - Set up functions for trust score calculation
   - Set up functions for notifications
   - Set up functions for analytics

5. **Implement FirestoreSyncService**
   - Build sync service using these schemas
   - Implement offline queue
   - Implement conflict resolution

---

**Status:** Schema design complete ✅  
**Next Task:** Build FirestoreSyncService.ts

*Generated: October 29, 2025*
