# LifeSync Authentication & Onboarding Refactor
## Local-First, Dashboard-Progressive Model

**Status**: Planning & Implementation Roadmap  
**Date**: 2025-01-XX  
**Scope**: Transform signup/onboarding into frictionless entry + progressive dashboard tasks  
**Goal**: Unified auth (Google/Email/Local), immediate dashboard access, offline-first architecture

---

## 📋 Executive Vision

### Current State (As-Is)
- Complex 10-step onboarding blocks entry
- Different flows for guest vs email vs Google
- No local fallback for cloud accounts
- All consents collected upfront (friction)
- Onboarding mandatory before dashboard access

### Target State (To-Be)
- **Unified entry page** with 3 equal choices (Google, Email, Local)
- **Minimal signup** (name + optional email + PIN for local)
- **Immediate dashboard access** (all user types)
- **Progressive tasks** in dashboard (email verify, ID, services, etc.)
- **Service-triggered consents** (GPS/ID only when using that feature)
- **Local-first architecture** with Firebase as fallback/sync
- **Offline-capable** at all times (local IndexedDB + sync queue)
- **Trust-based unlock** (more complete profile = more features/trust)

### Key Design Principles

1. **Frictionless Entry** - No forced consents or long forms
2. **Local = Default** - Local IndexedDB first, cloud as sync layer
3. **Progressive Unlock** - Features require profile completion (task-gated)
4. **Consent on Use** - Only ask for consent when user needs that feature
5. **Offline Always Works** - No feature should require internet to *exist*
6. **Trust Drives Value** - Complete profile = higher trust = more bookings
7. **One Account Per Device** - Supports guest/local with optional cloud link

---

## 🗺️ Unified Architecture

### Entry Flow (New)

```
┌──────────────────────────────────────┐
│        Welcome / Entry Page          │
│      http://localhost:3000/          │
│                                      │
│  Single CTA per option:              │
│  [Continue with Google]              │
│  [Sign in with Email]                │
│  [Create Local Account]              │
└──────────────┬───────────────────────┘
               │
        ┌──────┴──────┬────────────┬──────────────┐
        │             │            │              │
        ▼             ▼            ▼              ▼
    ┌────────┐  ┌──────────┐  ┌────────┐  ┌──────────┐
    │ Google │  │  Email   │  │ Local  │  │ Platform │
    │ OAuth  │  │ Firebase │  │ Device │  │ Fallback │
    │ Sign   │  │ Auth     │  │ PIN    │  │ Store    │
    └───┬────┘  └────┬─────┘  └───┬────┘  └─────┬────┘
        │            │            │             │
        └────────────┴────────────┴─────────────┘
                     │
                ┌────▼─────┐
                │  Dexie   │
                │ IndexedDB│
                │ (Local)  │
                └────┬─────┘
                     │
                ┌────▼─────┐
                │Firestore │
                │ (Cloud)  │
                │ (Sync)   │
                └──────────┘
                     │
        ┌────────────▼──────────────┐
        │     /dashboard            │
        │ (All users immediately)   │
        │ Tasks component shows     │
        │ onboarding as activities  │
        └───────────────────────────┘
```

### Data Model (New)

**Local Profile (IndexedDB)**:
```javascript
{
  "id": "local_profile_main",
  "type": "local",
  "localId": "local_1727376000000",
  "cloudUID": "firebase_uid_abc123" || null,  // Set when linked to cloud
  "syncVersion": 1,
  "lastUpdated": 1727376000000,
  "pendingSync": false,
  
  // Core identity (from signup)
  "displayName": "John Doe",
  "email": "john@example.com",  // optional
  "phone": null,
  
  // Local security
  "localPin": "hashed_4digit_or_password",
  "encryptionKey": "derived_from_pin",
  
  // Profile expansion (dashboard tasks)
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "bio": "",
    "avatar": null,
    "emails": [{ id: 1, address: "john@example.com", label: "Personal", verified: false }],
    "phones": [{ id: 1, number: "+1234567890", label: "Mobile", verified: false }],
    "address": null,
    "deviceType": "mobile"
  },
  
  // Services & trust (dashboard tasks)
  "services": {
    "registered": [],  // ["pigeeback", "delivery", "home-services"]
    "active": []       // Currently offering
  },
  "trust": {
    "score": 0,
    "verifications": {
      "email": false,
      "phone": false,
      "identity": false,
      "address": false
    },
    "ratings": { count: 0, average: 0 }
  },
  
  // Consents (per-service, per-transaction)
  "consents": {
    "terms": { accepted: false, version: "1.0", timestamp: null },
    "privacy": { accepted: false, version: "1.0", timestamp: null },
    "community": { accepted: false, version: "1.0", timestamp: null },
    "gps": {
      "global": false,  // Blanket permission
      "services": {
        "pigeeback": false,  // Per-service
        "delivery": false
      }
    }
  },
  
  // Offline state
  "lastSyncedAt": null,
  "pendingChanges": [],  // [{type: 'update', path: 'profile.firstName', value: 'Jane', timestamp}]
  
  // Metadata
  "createdAt": 1727376000000,
  "accountType": "local" | "email" | "google",
  "accountStatus": "active" | "suspended" | "deleted"
}
```

**Cloud Profile (Firestore, mirrored from local)**:
```javascript
{
  "uid": "firebase_uid_abc123",
  "localId": "local_1727376000000",
  "syncVersion": 1,
  "lastUpdated": 1727376000000,
  "lastSyncedAt": 1727376000000,
  
  // ... same structure as local profile
  // Authoritative for cloud-linked accounts
}
```

---

## 📊 Task Breakdown: Phase by Phase

### Phase 1: Quick Wins (Days 1–2)

#### 1.1 Fix 404 on Sign In / Register Routes

**Issue**: Clicking "Sign in / Create account" → 404 error

**Root Cause**: Route mismatch or missing route handler

**Solution**:
1. Check App.jsx or Router config — ensure `/auth` and `/auth?mode=signin` routes exist
2. Update Auth.jsx button links to use correct navigate paths
3. Add catch-all route that redirects to `/` or `/guest-login`
4. Test all button navigation flows

**Files**: 
- `src/App.jsx` or routing file
- `src/pages/Auth.jsx`

**Checklist**:
- [ ] Confirm `/auth` route exists and loads Auth.jsx
- [ ] Test "Sign in" button → no 404
- [ ] Test "Create account" button → no 404
- [ ] Add catch-all redirect at end of router
- [ ] Verify guest button still works

---

#### 1.2 Rename "Guest Account" → "Local Account" (UI Only)

**Issue**: "Guest" stigmatizes temporary users; rebrand as "Local account"

**Changes**:
- Auth.jsx: "Try as Guest" → "Create a Local account"
- Auth.jsx: button copy update
- GuestLogin.tsx: title & header copy
- All user-facing text references

**Keep Internal**:
- Function names: `createGuestAccount()` → can stay as-is for now (internal)
- Service: `guestAccountService` → can refactor later
- Context: `GuestContext` → rename in Phase 2

**Files**:
- `src/pages/Auth.jsx`
- `src/pages/GuestLogin.tsx`
- Any other UI text references

**Checklist**:
- [ ] Auth.jsx button text updated
- [ ] GuestLogin.tsx header/copy updated
- [ ] Microcopy under each option added
- [ ] All user-visible text consistent
- [ ] No internal code broken (function names unchanged)

---

#### 1.3 Unified Entry Page: Make /guest-login the Single Starting Point

**Current State**:
- `/auth?mode=signin` = email/password/Google
- `/guest-login` = local account only
- Welcome page has scattered CTAs

**Target State**:
- `/guest-login` = hub for all 3 choices
- Shows Google, Email, Local equally
- Can rename route to `/auth/entry` or keep `/guest-login` as "Choose how to start"

**Changes**:
1. Update GuestLogin.tsx to show all 3 options (currently only shows guest)
2. Move or copy Google/Email options into GuestLogin component
3. Remove redirect loops
4. Update Welcome page to link directly to `/guest-login`

**Files**:
- `src/pages/GuestLogin.tsx` — add Google & Email options
- `src/pages/Welcome.jsx` — update CTA links
- `src/pages/Auth.jsx` — can retire or keep as fallback

**Layout** (New GuestLogin):
```
┌────────────────────────────────────┐
│   Get Started — Choose Your Way    │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ [Google Logo]                │  │
│  │ Continue with Google         │  │
│  │ Cloud backup & multi-device  │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ [Email Icon]                 │  │
│  │ Sign Up with Email           │  │
│  │ Standard account, backup     │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ [Device Icon]                │  │
│  │ Create a Local Account       │  │
│  │ Works offline, upgrade later │  │
│  └──────────────────────────────┘  │
│                                    │
│  [Already have account? Sign in]   │
└────────────────────────────────────┘
```

**Checklist**:
- [ ] GuestLogin.tsx updated to show all 3 options
- [ ] Google button functional (OAuth flow)
- [ ] Email button functional (leads to email signup form)
- [ ] Local account button functional
- [ ] All CTAs tested and no 404s
- [ ] Welcome page links to `/guest-login`

---

#### 1.4 Make Local Account Creation Minimal & Redirect to Dashboard

**Current Flow**:
1. User clicks "Create Local account"
2. Form: Display name (required) + Email (optional)
3. Create button → `guestAccountService.createGuestAccount()`
4. **Auto-redirect to `/onboarding`** (blocking)

**New Flow**:
1. User clicks "Create Local account"
2. Modal/form: Display name + Email (optional) + **PIN** (4-digit default)
3. Create button → `guestAccountService.createGuestAccount()` + create IndexedDB profile
4. **Auto-redirect to `/dashboard`** (not onboarding)

**Changes**:
- Add PIN input field (4-digit by default)
- Store PIN hash in local profile
- Update `guestAccountService.createGuestAccount()` to:
  - Create IndexedDB profile record
  - Set `accountType: "local"` and `accountStatus: "active"`
  - Return profile object
- Update GuestLogin.tsx to redirect to `/dashboard` instead of `/onboarding`

**Files**:
- `src/pages/GuestLogin.tsx`
- `src/services/guestAccountService.ts` (update to use IndexedDB)

**UI Change** (New local account modal):
```
┌─────────────────────────────┐
│  Create Local Account       │
│                             │
│  Display Name (required)    │
│  [_____________________]   │
│                             │
│  Email (optional)           │
│  [_____________________]   │
│                             │
│  PIN (4-digit)             │
│  [____]                    │
│  ☐ Use password instead    │
│                             │
│  [Start] [Skip for later]  │
└─────────────────────────────┘
```

**Checklist**:
- [ ] GuestLogin.tsx PIN input added
- [ ] PIN hashing/validation implemented
- [ ] Local account redirects to `/dashboard`
- [ ] IndexedDB profile created on signup
- [ ] guestAccountService updated
- [ ] No redirect to onboarding

---

### Phase 2: Dashboard Tasks System (Days 3–5)

#### 2.1 Create DashboardTasks Component

**Purpose**: Replace blocking `/onboarding` with optional, progressive dashboard tasks

**Location**: `src/components/DashboardTasks.jsx` (new file)

**Tasks List** (Mapped from old onboarding):
```javascript
const TASKS = [
  {
    id: 'contact-minimum',
    title: 'Add Contact Information',
    description: 'Add at least one email or phone',
    category: 'required',
    status: 'not-started' | 'in-progress' | 'completed',
    benefit: 'Required for communication',
    icon: 'Phone'
  },
  {
    id: 'email-verify',
    title: 'Verify Email',
    description: 'Confirm your email address',
    category: 'optional',
    benefit: '+10 trust points',
    status: 'not-started'
  },
  {
    id: 'phone-verify',
    title: 'Verify Phone',
    description: 'Confirm your phone number',
    category: 'optional',
    benefit: '+10 trust points',
    status: 'not-started'
  },
  {
    id: 'identity-upload',
    title: 'Upload ID (Optional)',
    description: 'Driver license, passport, etc.',
    category: 'optional',
    benefit: '+20 trust points, unlock services',
    icon: 'Lock'
  },
  {
    id: 'address-confirm',
    title: 'Confirm Address',
    description: 'Add your primary address',
    category: 'optional',
    benefit: '+10 trust points',
    icon: 'MapPin'
  },
  {
    id: 'services-register',
    title: 'Register for Services',
    description: 'Choose services to offer',
    category: 'optional',
    benefit: 'Unlock earning potential',
    icon: 'Briefcase'
  },
  {
    id: 'pin-upgrade',
    title: 'Upgrade Security (Local Accounts)',
    description: 'Change PIN to stronger password',
    category: 'optional',
    benefit: 'Better account protection',
    icon: 'Shield'
  },
  {
    id: 'lifecv-build',
    title: 'Build Your LifeCV',
    description: 'Add experience, education, skills',
    category: 'optional',
    benefit: 'Higher trust & more opportunities',
    icon: 'Award'
  }
];
```

**Component Structure**:
```jsx
// src/components/DashboardTasks.jsx

export function DashboardTasks() {
  const [tasks, setTasks] = useState([]);
  const [expanded, setExpanded] = useState(false);
  
  // Load tasks from profile state
  // Calculate progress (e.g., "3 of 8 complete")
  // Show task cards with progress
  // Allow expand/collapse
  // CTA for each task
  
  return (
    <div className="dashboard-tasks-card">
      <header>
        <h3>Complete Your Profile</h3>
        <p>Progress: {completed}/{total} tasks</p>
      </header>
      
      <TaskList tasks={tasks} expanded={expanded} />
      
      <TaskDetailModal task={selectedTask} onComplete={handleTaskComplete} />
    </div>
  );
}
```

**Task Card Template**:
```
┌─────────────────────────────────────┐
│ ✓ Add Contact Information           │
│   Required • +10 trust              │
│                                     │
│   Add at least one email or phone   │
│                                     │
│   [Complete Now] [Dismiss]          │
└─────────────────────────────────────┘
```

**Files to Create**:
- `src/components/DashboardTasks.jsx`
- `src/components/TaskCard.jsx`
- `src/components/TaskDetailModal.jsx`

**Checklist**:
- [ ] DashboardTasks component created
- [ ] Tasks list mapped from old onboarding
- [ ] Progress calculation working
- [ ] Task card UI matches design
- [ ] Dashboard shows task card on first login
- [ ] Tasks update as user completes them

---

#### 2.2 Implement Dexie-Based Local Profile Store

**Purpose**: Replace guestAccountService localStorage with structured IndexedDB storage

**Location**: `src/services/localProfileService.ts` (new file)

**Dexie Schema** (in Onboarding.jsx already, but refine):
```javascript
const db = new Dexie('LifeSyncDB');
db.version(1).stores({
  profiles: '++id, &localId, cloudUID, accountType',
  activities: '++id, userId, timestamp',
  pendingSync: '++id, profileId, type, timestamp',
  consents: '++id, &profileId, &consentId',
  trusts: '++id, &profileId'
});
```

**Service Methods**:
```javascript
export class LocalProfileService {
  // Lifecycle
  async createProfile(displayName, email, pin) {}
  async getProfile(localId) {}
  async updateProfile(localId, updates) {}
  async deleteProfile(localId) {}
  
  // Security
  async validatePin(localId, pin) {}
  async updatePin(localId, oldPin, newPin) {}
  
  // Sync
  async markForSync(localId) {}
  async getPendingChanges(localId) {}
  async clearPendingChanges(localId) {}
  
  // Linking (guest → registered)
  async linkToCloud(localId, cloudUID) {}
  async unlinkFromCloud(localId) {}
  
  // Tasks
  async updateTask(localId, taskId, status) {}
  async getTaskStatus(localId) {}
}
```

**Files to Create**:
- `src/services/localProfileService.ts`

**Integration**:
- Update `guestAccountService` to use `localProfileService` internally
- OR refactor entirely to use new service

**Checklist**:
- [ ] Dexie schema finalized
- [ ] LocalProfileService created
- [ ] Create/read/update/delete working
- [ ] PIN validation working
- [ ] Sync marking working
- [ ] Integrated into signup flow

---

#### 2.3 Update Onboarding.jsx to Optional/Non-Blocking

**Current**:
- `/onboarding` is mandatory route
- Blocks dashboard access
- Heavy 10-step form

**New**:
- Onboarding.jsx converted to settings panel/modal
- Accessible from Dashboard → Settings → Profile Setup
- Tasks appear in DashboardTasks, not as required steps
- Can still be visited but not forced

**Changes**:
1. Wrap Onboarding in a conditional modal (only show if user navigates to it)
2. Move heavy logic to task modals inside DashboardTasks
3. Remove auto-redirect from auth pages
4. Each task (email verify, upload ID, etc.) is a mini-modal, not a step

**Files**:
- `src/pages/Onboarding.jsx` — convert to optional modal/settings
- `src/pages/Dashboard.jsx` — add task card & settings link

**Checklist**:
- [ ] Onboarding no longer blocks entry
- [ ] Onboarding.jsx accessible as optional settings
- [ ] Dashboard Tasks show instead
- [ ] Profile completion still tracked

---

### Phase 3: Local-First + Firebase Sync (Days 6–10)

#### 3.1 Implement Sync Strategy & Conflict Resolution

**Purpose**: Local IndexedDB as default, Firestore as cloud sync layer

**Sync Logic**:
```
┌─────────────┐         ┌──────────────┐
│   Local     │◄───────►│  Firestore   │
│  IndexedDB  │   Sync  │   (Cloud)    │
└─────────────┘         └──────────────┘
   (Always)            (When online)
```

**On Login**:
1. Check for local profile
2. If local + cloud linked, attempt merge
3. Last-write-wins by `lastUpdated` timestamp on each field
4. Upload local-only changes (pending activities)
5. Mark sync complete

**On Profile Update**:
1. Write to local IndexedDB first (optimistic)
2. If online, queue sync job
3. Sync job pulls cloud, merges, uploads
4. Show sync status badge

**Conflict Resolution Logic**:
```javascript
function mergeProfiles(local, cloud) {
  const merged = { ...local };
  
  // For each top-level field
  Object.keys(cloud).forEach(key => {
    if (cloud[key].lastUpdated > local[key].lastUpdated) {
      // Cloud is newer
      merged[key] = cloud[key];
    }
    // else local wins (already in merged)
  });
  
  // Mark any conflicting fields for user review
  if (hasConflicts) {
    merged.pendingReview = [{field: 'emails', local: [...], cloud: [...]}];
  }
  
  return merged;
}
```

**Files to Create/Update**:
- `src/services/syncService.ts` (new)
- `src/utils/mergeStrategies.ts` (new)

**Checklist**:
- [ ] Sync logic implemented
- [ ] Merge algorithm working
- [ ] Conflict detection working
- [ ] Sync status tracked
- [ ] Pending changes queued correctly

---

#### 3.2 Implement Service-Triggered Consents (Not Upfront)

**Principle**: Only ask for consent when user needs that feature

**Example Flows**:

**User tries to list a Ride (Pigeeback)**:
```
Dashboard → Services → Add Ride Listing
  ↓
Check: Does user have GPS consent for 'pigeeback'?
  ├─ NO:
  │  ↓
  │  Consent Modal:
  │  "To publish your ride, we need:"
  │  - Your location during ride (shared with riders)
  │  - Optionally: Driver license photo
  │  [Provide Consent] [Cancel]
  │  ↓
  │  Store: consents.gps.services.pigeeback = true
  │  Store: consents.identity = {accepted: true, timestamp}
  │
  └─ YES: Proceed to listing form
```

**User tries Delivery**:
```
Dashboard → Services → Add Delivery
  ↓
Check: Phone verified?
  ├─ NO:
  │  ↓
  │  "Delivery requires a verified phone for customer contact."
  │  [Verify Now] [Cancel]
  │
  └─ YES: Proceed
```

**Implementation**:
```javascript
// src/hooks/useServiceConsent.js

export function useServiceConsent(serviceId) {
  const [profile, setProfile] = useContext(GuestContext);
  const [showConsentModal, setShowConsentModal] = useState(false);
  
  async function requestConsent(requirements) {
    // requirements = ['gps', 'identity', 'phone-verified']
    
    const missing = requirements.filter(req => {
      if (req === 'gps') return !profile.consents.gps.services[serviceId];
      if (req === 'identity') return !profile.verifications.identity;
      if (req === 'phone-verified') return !profile.phones?.some(p => p.verified);
      return false;
    });
    
    if (missing.length > 0) {
      setShowConsentModal(true);
      return false;  // Block feature
    }
    
    return true;  // Allow feature
  }
  
  return { requestConsent, showConsentModal };
}
```

**Files to Create**:
- `src/hooks/useServiceConsent.js`
- `src/components/ServiceConsentModal.jsx`

**Checklist**:
- [ ] Service consent hook created
- [ ] Modal component for requesting consent
- [ ] Consent stored in profile.consents
- [ ] Services check for required consents before allowing
- [ ] User can grant/deny per service

---

#### 3.3 Implement PIN Security & Encryption

**Purpose**: Secure local account with PIN + encryption

**PIN Storage** (Never in plain text):
```javascript
import crypto from 'crypto';

function hashPin(pin) {
  // PBKDF2 with 100k iterations
  return crypto.pbkdf2Sync(
    pin, 
    'salt_from_device_id', 
    100000, 
    64, 
    'sha256'
  ).toString('hex');
}

function deriveEncryptionKey(pin) {
  // Use pin to derive AES key for encrypting sensitive profile data
  return crypto.pbkdf2Sync(
    pin, 
    'encryption_salt', 
    100000, 
    32, 
    'sha256'
  );
}

function encryptProfileData(data, pin) {
  const key = deriveEncryptionKey(pin);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return { iv: iv.toString('hex'), data: encrypted };
}
```

**PIN Upgrade Option**:
- Default: 4-digit PIN (easier entry)
- Optional: Upgrade to alphanumeric password in Settings
- Store in same way (hash + derive key)

**Re-auth Gate**:
- Sensitive actions require PIN re-entry (every 15 mins or on sensitive edit)
- Prompt: "Enter PIN to confirm"

**Files to Create**:
- `src/utils/encryption.js`
- `src/components/PinPrompt.jsx`

**Checklist**:
- [ ] PIN hashing with PBKDF2
- [ ] Key derivation working
- [ ] Profile data encryption/decryption
- [ ] PIN upgrade option in settings
- [ ] Sensitive action gates working

---

### Phase 4: Guest → Registered Upgrade Path (Days 11–12)

#### 4.1 Add One-Click Upgrade (Local → Cloud)

**Purpose**: Convert local account to cloud-linked without losing data

**Flow**:
```
Dashboard → Settings → Upgrade Account
  ↓
Modal: "Link to Cloud?"
  ├─ [Continue with Google] — Links Google OAuth to local
  ├─ [Sign up with Email] — Converts to email Firebase
  └─ [Cancel]
  ↓
On success: POST /api/linkAccount with local profile
  ↓
Server: Merge local profile into new Firebase user
  ↓
Client: Update local profile with cloudUID
  ↓
Result: Profile now synced to cloud, maintains all data
```

**Route**: `/auth/upgrade` (or modal from Settings)

**Files to Create/Update**:
- `src/pages/UpgradeAccount.jsx` (new page)
- `src/services/syncService.ts` (add linkAccount method)

**Checklist**:
- [ ] Upgrade modal created
- [ ] Google link option working
- [ ] Email signup option working
- [ ] Local profile migrated to cloud
- [ ] No data loss
- [ ] cloudUID set in local profile

---

### Phase 5: Monitoring & Metrics (Days 13–14)

#### 5.1 Add Analytics Tracking

**Track**:
- Which auth path users choose (Google/Email/Local)
- How many complete signup
- How many complete onboarding (now tasks)
- Which tasks are skipped/completed
- Guest → registered conversion rate
- Sync success/failure rates

**Implementation**:
```javascript
// src/services/analyticsService.ts

export function trackAuthPath(path: 'google' | 'email' | 'local') {
  logEvent('auth_path_chosen', { path });
}

export function trackSignupComplete(accountType: string) {
  logEvent('signup_complete', { accountType });
}

export function trackTaskComplete(taskId: string) {
  logEvent('task_complete', { taskId });
}

export function trackSyncResult(success: boolean, error?: string) {
  logEvent('sync_result', { success, error });
}
```

**Checklist**:
- [ ] Analytics service created
- [ ] Tracked events: auth path, signup, task completion, sync
- [ ] Dashboard to view analytics (optional)

---

## 🛠️ Concrete Development Tasks (Prioritized)

### IMMEDIATE (1–2 Days)

```
[ ] Task 1: Fix 404 on "Sign in / Create account" routes
    Files: src/App.jsx (router), src/pages/Auth.jsx
    
[ ] Task 2: Rename "Guest Account" → "Local Account" (UI copy)
    Files: src/pages/Auth.jsx, src/pages/GuestLogin.tsx
    
[ ] Task 3: Make /guest-login unified entry with 3 options
    Files: src/pages/GuestLogin.tsx (refactor to show Google/Email/Local)
    
[ ] Task 4: Add PIN field to local account signup
    Files: src/pages/GuestLogin.tsx
    
[ ] Task 5: Redirect to /dashboard immediately after local signup
    Files: src/pages/GuestLogin.tsx, src/services/guestAccountService.ts
```

### SHORT TERM (3–5 Days)

```
[ ] Task 6: Create DashboardTasks component with task list
    Files: src/components/DashboardTasks.jsx (new)
    
[ ] Task 7: Update Dashboard.jsx to show tasks card
    Files: src/pages/Dashboard.jsx
    
[ ] Task 8: Refactor guestAccountService to use Dexie/IndexedDB
    Files: src/services/guestAccountService.ts OR new src/services/localProfileService.ts
    
[ ] Task 9: Create sync service (local ↔ Firestore)
    Files: src/services/syncService.ts (new)
    
[ ] Task 10: Implement service-triggered consent modal
    Files: src/components/ServiceConsentModal.jsx (new), src/hooks/useServiceConsent.js (new)
```

### MEDIUM TERM (6–10 Days)

```
[ ] Task 11: Implement PIN encryption/hashing
    Files: src/utils/encryption.js (new)
    
[ ] Task 12: Add PIN re-auth gate for sensitive actions
    Files: src/components/PinPrompt.jsx (new)
    
[ ] Task 13: Create upgrade path (local → cloud)
    Files: src/pages/UpgradeAccount.jsx (new)
    
[ ] Task 14: Implement conflict resolution UI
    Files: src/components/ConflictResolver.jsx
```

### MONITORING (Days 13–14)

```
[ ] Task 15: Add analytics tracking
    Files: src/services/analyticsService.ts (new)
    
[ ] Task 16: Dashboard analytics view (optional)
    Files: src/pages/Analytics.jsx (optional)
```

---

## 📋 Testing Checklist

### Signup Flows

- [ ] Google: Click → OAuth → Dashboard (no onboarding block)
- [ ] Email: Form → Firebase → Dashboard (no onboarding block)
- [ ] Local: Form + PIN → IndexedDB → Dashboard (no onboarding block)

### Task Completion

- [ ] Tasks show in dashboard
- [ ] Task progress calculates correctly
- [ ] Can expand/collapse tasks
- [ ] Complete task updates status
- [ ] Trust score updates based on task completion

### Sync (Local + Cloud)

- [ ] Local changes sync to cloud when online
- [ ] Cloud changes pull to local
- [ ] No data loss on merge
- [ ] Offline still works (all reads/writes to local)

### Service-Triggered Consent

- [ ] Try to use service without consent → Prompt shown
- [ ] Grant consent → Service works
- [ ] Deny consent → Service blocked

### PIN Security

- [ ] PIN hashed on creation
- [ ] PIN validated on sensitive actions
- [ ] Can upgrade to password
- [ ] Re-auth works

### Upgrade Path

- [ ] Local account can upgrade to Google
- [ ] Local account can upgrade to Email
- [ ] Data persists after upgrade
- [ ] cloudUID set correctly

---

## 🎯 Success Criteria

**User Entry**:
✅ 3 equal choices on single page  
✅ Local signup < 30 seconds  
✅ No forced onboarding  
✅ Immediate dashboard access  

**Profile Completion**:
✅ Tasks shown in dashboard card  
✅ Optional completion (not forced)  
✅ Clear benefit for each task  
✅ Trust score visible  

**Offline**:
✅ All local account features work without internet  
✅ Syncs on network restore  
✅ No data loss  

**Security**:
✅ PIN required for local account  
✅ Can upgrade to stronger password  
✅ Sensitive actions re-auth  
✅ Encryption for stored data  

**Conversion**:
✅ Easy upgrade from local → cloud  
✅ No data loss on upgrade  
✅ Can track guest → registered conversion  

---

## 📝 Notes & Caveats

### Browser Limitations (Web App)
- IndexedDB limited to ~50 MB (check quota with `navigator.storage.estimate()`)
- PIN encryption uses Web Crypto API (ES2021, all modern browsers)
- Offline sync limited to small payloads (ID scans may need server-side storage)
- Service worker for offline caching (optional, Phase 2)

### Data Migration
- Existing guest accounts need migration to new Dexie schema
- Add migration script at app boot: `if (oldLocalStorage) migrate()`

### Backward Compatibility
- Old localStorage guests may have data in old format
- Handle gracefully: detect old format, migrate or prompt re-signup

### Future Enhancements
- Push notifications for task reminders
- Automated verification (ID OCR, email link detection)
- Reputation system for service providers
- Real-time sync with Firestore listeners

---

**Document Status**: ✅ Complete implementation roadmap  
**Ready for**: Dev sprint planning  
**Next Step**: Begin Phase 1 (quick wins)

