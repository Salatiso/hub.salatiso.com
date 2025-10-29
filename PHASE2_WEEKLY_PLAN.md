# 📅 PHASE 2 WEEKLY PLAN - Detailed Day-by-Day Breakdown

**Week 2 of LifeSync Refactor: Dashboard & Profile Architecture**  
**Dates**: Oct 28 - Nov 8, 2025  
**Status**: Ready to Kickoff  

---

## 🗓️ Week Overview

```
Monday (Oct 28):    Dexie setup & schema design
Tuesday (Oct 29):   Database migration & testing
Wednesday (Oct 30): PIN security implementation
Thursday (Oct 31):  PIN verification & auth integration
Friday (Nov 1):     Task definitions & modal framework
Monday (Nov 4):     Task modals (4/8 built)
Tuesday (Nov 5):    Task modals (remaining 4)
Wednesday (Nov 6):  Dashboard UI & trust score
Thursday (Nov 7):   Testing & polish
Friday (Nov 8):     Phase 2 completion & Phase 3 prep
```

---

## 📋 MONDAY, October 28 - Dexie Setup & Schema Design

### 🎯 Objectives
- [ ] Install Dexie.js
- [ ] Design profile database schema
- [ ] Create TypeScript interfaces
- [ ] Initialize database
- [ ] Write schema documentation

### 📝 Tasks

#### Task 1: Install Dexie (30 min)
```bash
npm install dexie
npm install --save-dev @types/dexie
npm ls                  # Verify no conflicts
```

**Verification**:
- ✅ `node_modules/dexie` exists
- ✅ `package.json` updated
- ✅ No console warnings

---

#### Task 2: Design Profile Schema (1 hour)
**File**: Create `src/db/profileTypes.ts`

```typescript
// Profile schema for Dexie
export interface Profile {
  id: string;                // UUID
  displayName: string;
  email?: string;
  pin?: string;              // Will be hashed in Phase 2b
  avatar?: string;           // URL or base64
  createdAt: number;         // Timestamp
  updatedAt: number;         // Timestamp
  completedTasks: TaskProgress[];
  trustScore: number;        // 0-100
  metadata: {
    isLocal: boolean;
    isSynced: boolean;
    lastSyncAt?: number;
  };
}

export interface TaskProgress {
  taskId: string;
  completed: boolean;
  completedAt?: number;
  data?: Record<string, any>;  // Task-specific data
}

export interface Task {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  estimatedTime: string;
  category: 'personal' | 'verification' | 'security' | 'cv';
}
```

**Deliverable**: ✅ `src/db/profileTypes.ts` (40 lines)

---

#### Task 3: Create Dexie Schema (1.5 hours)
**File**: Create `src/db/profiles.db.ts`

```typescript
import Dexie from 'dexie';
import { Profile } from './profileTypes';

export class ProfileDatabase extends Dexie {
  profiles!: Dexie.Table<Profile, string>;

  constructor() {
    super('LifeSyncDB');
    this.version(1).stores({
      profiles: 'id, email, createdAt',
    });
  }
}

export const db = new ProfileDatabase();
```

**Key Features**:
- ✅ Profiles table
- ✅ Indexed by id, email, createdAt
- ✅ Singleton instance `db` export
- ✅ TypeScript types

**Deliverable**: ✅ `src/db/profiles.db.ts` (25 lines)

---

#### Task 4: Create useLocalProfile Hook (1 hour)
**File**: Create `src/hooks/useLocalProfile.ts`

```typescript
import { useState, useEffect } from 'react';
import { db } from '../db/profiles.db';
import { Profile } from '../db/profileTypes';

export function useLocalProfile(profileId: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const p = await db.profiles.get(profileId);
        setProfile(p || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [profileId]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
    try {
      await db.profiles.update(profile.id, {
        ...updates,
        updatedAt: Date.now(),
      });
      setProfile({ ...profile, ...updates, updatedAt: Date.now() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return { profile, loading, error, updateProfile };
}
```

**Deliverable**: ✅ `src/hooks/useLocalProfile.ts` (45 lines)

---

#### Task 5: Test Database (1 hour)
**File**: Create `src/db/profiles.db.test.ts`

```typescript
import { db } from './profiles.db';
import { Profile } from './profileTypes';

export async function testDatabaseSetup() {
  try {
    // Test: Create
    const testProfile: Profile = {
      id: 'test-1',
      displayName: 'Test User',
      email: 'test@example.com',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      completedTasks: [],
      trustScore: 0,
      metadata: { isLocal: true, isSynced: false },
    };

    await db.profiles.add(testProfile);
    console.log('✅ Create test passed');

    // Test: Read
    const retrieved = await db.profiles.get('test-1');
    console.log('✅ Read test passed:', retrieved);

    // Test: Update
    await db.profiles.update('test-1', { displayName: 'Updated User' });
    console.log('✅ Update test passed');

    // Test: Delete
    await db.profiles.delete('test-1');
    console.log('✅ Delete test passed');

    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
}
```

**Deliverable**: ✅ `src/db/profiles.db.test.ts` (45 lines)

---

### ✅ Monday End-of-Day Checklist
- [ ] Dexie installed
- [ ] `src/db/profileTypes.ts` created (40 lines)
- [ ] `src/db/profiles.db.ts` created (25 lines)
- [ ] `src/hooks/useLocalProfile.ts` created (45 lines)
- [ ] Database tests written
- [ ] ESLint: 0 errors
- [ ] Build passes
- [ ] **Total new code**: ~155 lines

**Status**: ✅ Dexie infrastructure ready

---

## 📋 TUESDAY, October 29 - Migration & Testing

### 🎯 Objectives
- [ ] Migrate localStorage data to Dexie
- [ ] Create migration utility
- [ ] Test migration on auth
- [ ] Implement profile export/import

### 📝 Tasks

#### Task 1: Create Migration Utility (1.5 hours)
**File**: Create `src/db/migrations.ts`

```typescript
import { db } from './profiles.db';
import { Profile } from './profileTypes';
import { guestAccountService } from '../services/guestAccountService';

export async function migrateLocalStorageToDexie() {
  try {
    // Get guest data from localStorage
    const guestData = guestAccountService.getGuestAccount();
    
    if (!guestData) {
      console.log('No guest account found, skipping migration');
      return;
    }

    // Check if already migrated
    const existing = await db.profiles.get(guestData.id);
    if (existing) {
      console.log('Profile already in Dexie, skipping migration');
      return;
    }

    // Convert to Profile
    const profile: Profile = {
      id: guestData.id,
      displayName: guestData.displayName,
      email: guestData.email,
      pin: guestData.securityPin,  // TODO Phase 2b: hash this
      createdAt: guestData.createdAt,
      updatedAt: guestData.updatedAt || Date.now(),
      completedTasks: [],
      trustScore: 0,
      metadata: {
        isLocal: true,
        isSynced: false,
      },
    };

    // Save to Dexie
    await db.profiles.add(profile);
    console.log('✅ Migration complete');
    
    return profile;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}
```

**Deliverable**: ✅ `src/db/migrations.ts` (50 lines)

---

#### Task 2: Call Migration on App Init (1 hour)
**File**: Update `src/App.jsx`

- After auth state changes, call `migrateLocalStorageToDexie()`
- Handle migration errors gracefully
- Log migration status

**Verification**:
- ✅ Guest account data migrates to Dexie on first dashboard visit
- ✅ Subsequent visits don't re-migrate
- ✅ No console errors

---

#### Task 3: Implement Export/Import (1.5 hours)
**File**: Create `src/db/backupService.ts`

```typescript
import { db } from './profiles.db';

export async function exportProfileData() {
  try {
    const profiles = await db.profiles.toArray();
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      profiles,
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lifesync-backup-${Date.now()}.json`;
    link.click();
    
    return json;
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}

export async function importProfileData(file: File) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (data.version !== 1) {
      throw new Error('Unsupported backup version');
    }
    
    for (const profile of data.profiles) {
      await db.profiles.put(profile);
    }
    
    console.log(`✅ Imported ${data.profiles.length} profiles`);
    return data.profiles.length;
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
}
```

**Deliverable**: ✅ `src/db/backupService.ts` (55 lines)

---

#### Task 4: Test Migration (1 hour)
**Scenarios**:
- ✅ Create guest account → migrates to Dexie
- ✅ Export profile → JSON file downloads
- ✅ Import profile → restores to Dexie
- ✅ Multiple profiles → all migrate correctly

---

### ✅ Tuesday End-of-Day Checklist
- [ ] Migration utility created
- [ ] App.jsx updated to call migration
- [ ] Export/import implemented
- [ ] Migration tested end-to-end
- [ ] ESLint: 0 errors
- [ ] Build passes
- [ ] **Total new code this day**: ~105 lines
- [ ] **Cumulative**: ~260 lines

**Status**: ✅ Data persistence foundation ready

---

## 📋 WEDNESDAY, October 30 - PIN Security (PBKDF2)

### 🎯 Objectives
- [ ] Install crypto library
- [ ] Implement PBKDF2 hashing
- [ ] Implement PIN verification
- [ ] Update auth flow to hash PIN

### 📝 Tasks

#### Task 1: Install & Setup Crypto (30 min)
```bash
npm install crypto-js
npm install --save-dev @types/crypto-js
```

---

#### Task 2: Create PIN Encryption Module (1 hour)
**File**: Create `src/security/pinEncryption.ts`

```typescript
import CryptoJS from 'crypto-js';

const SALT_LENGTH = 16;
const ITERATIONS = 1000;

export function generateSalt(): string {
  return CryptoJS.lib.WordArray.random(SALT_LENGTH).toString();
}

export function hashPin(pin: string, salt?: string): { hash: string; salt: string } {
  const pinSalt = salt || generateSalt();
  
  // PBKDF2: 1000 iterations
  const hash = CryptoJS.PBKDF2(pin, pinSalt, {
    keySize: 32 / 4,  // 32 bytes
    iterations: ITERATIONS,
  }).toString();
  
  return { hash, salt: pinSalt };
}

export function verifyPin(pin: string, storedHash: string, salt: string): boolean {
  try {
    const { hash } = hashPin(pin, salt);
    return hash === storedHash;
  } catch (error) {
    console.error('PIN verification failed:', error);
    return false;
  }
}

export function hashPinWithStorage(pin: string): string {
  // Returns: "salt$hash" for easy storage
  const { hash, salt } = hashPin(pin);
  return `${salt}$${hash}`;
}

export function verifyPinFromStorage(pin: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split('$');
    return verifyPin(pin, hash, salt);
  } catch (error) {
    console.error('PIN verification failed:', error);
    return false;
  }
}
```

**Deliverable**: ✅ `src/security/pinEncryption.ts` (50 lines)

---

#### Task 3: Update Profile Service (1 hour)
**File**: Update `src/db/profiles.db.ts` to hash PIN on create

```typescript
import { hashPinWithStorage } from '../security/pinEncryption';

// When creating profile with PIN:
export async function createProfileWithPin(
  displayName: string,
  email: string,
  pin: string
) {
  const hashedPin = hashPinWithStorage(pin);
  
  const profile: Profile = {
    id: generateId(),
    displayName,
    email,
    pin: hashedPin,  // Now hashed
    createdAt: Date.now(),
    updatedAt: Date.now(),
    completedTasks: [],
    trustScore: 0,
    metadata: { isLocal: true, isSynced: false },
  };
  
  await db.profiles.add(profile);
  return profile;
}
```

---

#### Task 4: Update GuestLogin Auth Flow (1.5 hours)
**File**: Update `src/pages/GuestLogin.tsx`

Replace PIN storage with hashed version:
```typescript
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
    const localSecurityValue = usePassword ? password : pin;
    
    // NEW: Hash the PIN before storing
    const hashedValue = usePassword 
      ? password  // Password not hashed yet (Phase 2.5)
      : hashPinWithStorage(pin);
    
    guestAccountService.createGuestAccount(displayName.trim(), email.trim() || undefined, {
      pin: hashedValue,
      usePassword: usePassword,
    });
    onGuestCreated?.(displayName.trim());
    setTimeout(() => {
      navigate('/dashboard');
    }, 500);
  } catch (err) {
    setError('Failed to create account. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

---

#### Task 5: Create PIN Encryption Tests (1 hour)
**File**: Create `src/security/pinEncryption.test.ts`

```typescript
import { hashPin, verifyPin, hashPinWithStorage, verifyPinFromStorage } from './pinEncryption';

export function testPinEncryption() {
  console.log('🧪 Testing PIN encryption...');

  // Test 1: Basic hash & verify
  const pin = '1234';
  const { hash, salt } = hashPin(pin);
  
  if (!hash || !salt) {
    throw new Error('Hash or salt missing');
  }
  
  if (!verifyPin(pin, hash, salt)) {
    throw new Error('PIN verification failed');
  }
  
  console.log('✅ Test 1: Basic hash & verify passed');

  // Test 2: Wrong PIN fails
  if (verifyPin('0000', hash, salt)) {
    throw new Error('Wrong PIN should not verify');
  }
  
  console.log('✅ Test 2: Wrong PIN rejection passed');

  // Test 3: Storage format
  const stored = hashPinWithStorage(pin);
  const [storedSalt, storedHash] = stored.split('$');
  
  if (!storedSalt || !storedHash) {
    throw new Error('Storage format invalid');
  }
  
  if (!verifyPinFromStorage(pin, stored)) {
    throw new Error('PIN verification from storage failed');
  }
  
  console.log('✅ Test 3: Storage format passed');

  // Test 4: Different salt = different hash
  const pin2 = '1234';
  const { hash: hash2, salt: salt2 } = hashPin(pin2);
  
  if (hash === hash2) {
    throw new Error('Same PIN with different salt should produce different hash');
  }
  
  console.log('✅ Test 4: Salt uniqueness passed');

  console.log('🎉 All PIN encryption tests passed!');
  return true;
}
```

---

### ✅ Wednesday End-of-Day Checklist
- [ ] crypto-js installed
- [ ] PIN encryption module created (50 lines)
- [ ] Tests written and passing
- [ ] GuestLogin.tsx updated to hash PIN
- [ ] Profile service updated
- [ ] ESLint: 0 errors
- [ ] Build passes
- [ ] **Total new code this day**: ~150 lines
- [ ] **Cumulative**: ~410 lines

**Status**: ✅ PIN security implemented

---

## 📋 THURSDAY, October 31 - PIN Verification & Integration

### 🎯 Objectives
- [ ] Implement PIN verification for login
- [ ] Create sign-in modal for local accounts
- [ ] Test login with PIN verification
- [ ] Update guestAccountService

### 📝 Tasks (Estimated 4-5 hours)

#### Summary
- Create `LocalSignInModal.tsx` component
- Implement PIN verification in GuestLogin
- Update guestAccountService `verifyPin()` method
- Test login flow with PIN verification
- Update documentation

**Deliverable**: ~100 lines of new code

---

## 📋 FRIDAY, November 1 - Task Definitions & Framework

### 🎯 Objectives
- [ ] Define 8 profile tasks
- [ ] Create task modal framework
- [ ] Set up task component structure
- [ ] Create task data service

### 📝 Tasks (Estimated 6 hours)

#### Summary
- Create `src/data/profileTasks.ts` with 8 tasks
- Create `src/components/TaskModals/` directory
- Create BaseTaskModal component template
- Create task service for CRUD
- Set up task completion tracking
- Calculate trust score formula

**Deliverable**: ~200 lines of new code (framework only, modals built next week)

---

## 📋 MONDAY, November 4 - Task Modals (First 4)

### 🎯 Objectives
- [ ] Build ContactInfoModal
- [ ] Build EmailVerificationModal
- [ ] Build PhoneVerificationModal
- [ ] Build IDUploadModal
- [ ] Test all 4 modals

### 📝 Tasks (Estimated 6 hours)

**Deliverable**: ~250 lines (4 task modals)

---

## 📋 TUESDAY, November 5 - Task Modals (Remaining 4)

### 🎯 Objectives
- [ ] Build AddressConfirmationModal
- [ ] Build ServicesRegistrationModal
- [ ] Build SecurityUpgradeModal
- [ ] Build LifeCVModal
- [ ] Test all 8 modals

### 📝 Tasks (Estimated 6 hours)

**Deliverable**: ~250 lines (4 task modals)

---

## 📋 WEDNESDAY, November 6 - Dashboard UI & Trust Score

### 🎯 Objectives
- [ ] Create ProfileCard component
- [ ] Create TrustScoreWidget
- [ ] Enhance DashboardTasks
- [ ] Calculate trust score (0-100)
- [ ] Test trust score calculations

### 📝 Tasks (Estimated 6 hours)

**Deliverable**: ~200 lines of dashboard UI

---

## 📋 THURSDAY, November 7 - Testing & Polish

### 🎯 Objectives
- [ ] End-to-end testing
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Responsive design testing
- [ ] Dark mode verification

### 📝 Tasks (Estimated 4-5 hours)

**Deliverable**: Bug fixes, optimizations

---

## 📋 FRIDAY, November 8 - Phase 2 Completion & Phase 3 Prep

### 🎯 Objectives
- [ ] Final verification & testing
- [ ] Documentation completion
- [ ] Phase 2 sign-off
- [ ] Phase 3 planning

### 📝 Tasks (Estimated 3-4 hours)

**Deliverable**: Phase 2 complete, Phase 3 ready to start

---

## 📊 Weekly Totals

| Day | Tasks | Lines | Status |
|-----|-------|-------|--------|
| Mon | 5 | 155 | ✅ Complete |
| Tue | 4 | 105 | ✅ Complete |
| Wed | 5 | 150 | ✅ Complete |
| Thu | 3 | 100 | ⏳ In Progress |
| Fri | 5 | 200 | ⏳ Upcoming |
| Mon | 4 | 250 | ⏳ Upcoming |
| Tue | 4 | 250 | ⏳ Upcoming |
| Wed | 5 | 200 | ⏳ Upcoming |
| Thu | 4 | 150 | ⏳ Upcoming |
| Fri | 3 | 100 | ⏳ Upcoming |
| **TOTAL** | **42** | **1,610** | **Phase 2** |

---

## 🎯 Success Criteria

### By End of Week 1 (Fri, Nov 1)
- ✅ Dexie database working
- ✅ Migration from localStorage complete
- ✅ PIN hashing with PBKDF2 working
- ✅ PIN verification implemented
- ✅ 8 tasks defined
- ✅ Task modal framework ready
- ✅ 0 ESLint errors
- ✅ Build passing

### By End of Phase 2 (Fri, Nov 8)
- ✅ All 8 task modals built
- ✅ Task completion tracking working
- ✅ Trust score calculation working (0-100)
- ✅ Dashboard UI complete
- ✅ ProfileCard component working
- ✅ Responsive design verified
- ✅ Dark mode verified
- ✅ 15/15 manual tests passing
- ✅ Full documentation complete
- ✅ Ready for Phase 3

---

## 📚 Supporting Documentation

- ✅ `PHASE2_KICKOFF.md` - Overview and objectives
- ⏳ `PHASE2_WEEKLY_PLAN.md` - This document (day-by-day)
- ⏳ `PHASE2_TASK_CHECKLIST.md` - Granular task list
- ⏳ `PHASE2_PROGRESS_LOG.md` - Daily updates
- ⏳ `PHASE2_COMPLETION_REPORT.md` - Final sign-off

---

## 🚀 Ready to Start?

**Next**: Start Day 1 (Monday, Oct 28)
1. Install Dexie: `npm install dexie`
2. Create `src/db/profileTypes.ts`
3. Create `src/db/profiles.db.ts`
4. Create `src/hooks/useLocalProfile.ts`
5. Verify build: `npm run build`

**Timeline**: 10 business days → Phase 2 Complete

**Expected Outcome**: Dashboard with profile management, task completion, trust scoring

---

**Document Status**: ✅ Ready for Phase 2 execution  
**Next Update**: Daily at end-of-day  
**Questions?**: See PHASE2_KICKOFF.md or previous phase documentation
