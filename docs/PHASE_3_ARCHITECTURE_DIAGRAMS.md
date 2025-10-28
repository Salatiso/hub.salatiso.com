# Phase 3: Architecture & Data Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      LIFESYNC REACT APP                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            AuthProvider (NEW in Phase 3)                 │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │   Firebase Auth State                              │  │   │
│  │  │   - Listens to onAuthStateChanged                 │  │   │
│  │  │   - Provides useAuth() hook                       │  │   │
│  │  │   - user.uid available globally                   │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│           ↓                                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            ThemeContext                                  │   │
│  │  - Light/Dark mode management                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│           ↓                                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            GuestContext                                  │   │
│  │  - Offline data storage                                 │   │
│  │  - IDB persistence                                      │   │
│  │  - Sync queue management                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│           ↓                                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            KeyboardProvider                              │   │
│  │  - Keyboard accessibility (Phase 1)                     │   │
│  │  - Focus management                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│           ↓                                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            React Router                                  │   │
│  │  - Routes to all pages                                  │   │
│  │  - Navigation system (Phase 0)                          │   │
│  │                                                          │   │
│  │  ┌──────────────┬──────────────┬──────────────┐         │   │
│  │  │   Home       │  Dashboard   │  Profile     │         │   │
│  │  └──────────────┴──────────────┴──────────────┘         │   │
│  │  ┌──────────────┬──────────────┬──────────────┐         │   │
│  │  │   LifeCV     │  Contacts    │  Calendar    │         │   │
│  │  │  (Phase 3) ⭐│  (Phase 2)   │  (Phase 2)   │         │   │
│  │  └──────────────┴──────────────┴──────────────┘         │   │
│  │  ┌──────────────┬──────────────┬──────────────┐         │   │
│  │  │   Assets     │  Projects    │  Career      │         │   │
│  │  │ (Phase 2)    │ (Phase 2)    │ (Phase 2)    │         │   │
│  │  └──────────────┴──────────────┴──────────────┘         │   │
│  │  ┌──────────────┬──────────────┬──────────────┐         │   │
│  │  │   Family     │  Timeline    │ [More pages] │         │   │
│  │  │ (Phase 2)    │ (Phase 2)    │              │         │   │
│  │  └──────────────┴──────────────┴──────────────┘         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
         ↓↓↓  Firebase Integration (Phase 3)  ↓↓↓
┌─────────────────────────────────────────────────────────────────┐
│                   FIREBASE FIRESTORE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  users/{userId}/profile/lifecv                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ - fullName: Salatiso Lonwabo Mdeni                       │  │
│  │ - email, phone, location                                 │  │
│  │ - personalProfile, careerVision, mission                 │  │
│  │ - education: [{school, degree, ...}]                     │  │
│  │ - experience: [{company, title, ...}]                    │  │
│  │ - certifications: [{name, issuer, ...}]                  │  │
│  │ - skills: [{name, type}]                                 │  │
│  │ - lastUpdatedBy: 'lifesync'                              │  │
│  │ - lastUpdatedAt: serverTimestamp                         │  │
│  │ - syncedApps: ['lifesync']                               │  │
│  │ - userId: firebase_auth_uid                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Real-time Listeners Active:                                    │
│  ✓ onSnapshot() triggers on any document change                │
│  ✓ Detects updates from other apps                             │
│  ✓ Updates UI automatically                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
         ↓↓↓  Ecosystem Distribution  ↓↓↓
┌─────────────────────────────────────────────────────────────────┐
│         SALATISO ECOSYSTEM APPLICATIONS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │ salatiso-    │      │ salatiso-    │      │ salatiso-    │  │
│  │  lifecv      │      │  seal        │      │  hub         │  │
│  │ .web.app     │      │ .web.app     │      │ .web.app     │  │
│  │              │      │              │      │              │  │
│  │ Web LifeCV   │      │ Seal Events  │      │ Community    │  │
│  │ Editor       │      │ & Social     │      │ Hub          │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│        ↓                    ↓                     ↓             │
│  Reads/Writes to Firestore ← ← ← ← ← ← ← ← ← ← ←              │
│  Same userId/profile/lifecv document                           │
│                                                                  │
│  All apps see updates in real-time!                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## LifeCV Component Data Flow

```
┌────────────────────────────────────────────────────────────────┐
│                   LIFECV COMPONENT                             │
│                   (642 lines)                                  │
└────────────────────────────────────────────────────────────────┘

INITIALIZATION FLOW:
───────────────────

1. Component Mount
   ├─ useAuth() → Get Firebase user
   ├─ useState() → Initialize local state
   └─ useEffect() → Load from Firestore

2. Load from Firestore
   ├─ doc(db, 'users', user.uid, 'profile', 'lifecv')
   ├─ getDoc(docRef)
   │  └─ Set local state: setLifeCV(data)
   └─ Set last sync time

3. Real-Time Listener Setup
   ├─ onSnapshot(docRef, (snapshot) => {
   │  ├─ Check: lastUpdatedBy !== 'lifesync'
   │  ├─ Check: lastUpdatedAt > current time
   │  ├─ If true: Update local state
   │  ├─ Show notification: "Updated from {app}!"
   │  └─ Update appUpdates array
   │ })
   └─ Listener active until component unmounts


STATE MANAGEMENT FLOW:
──────────────────────

User Action             │ State Update            │ UI Feedback
──────────────────────────────────────────────────────────────
Edit Profile           │ setLifeCV({...})        │ Input highlights
Add Education          │ education.push()        │ New card appears
Update Experience      │ experience.map()        │ Card updates live
Delete Certification   │ certifications.filter()│ Card fades away
Click "Sync to Cloud"  │ setSyncing(true)        │ Button disabled
                       │ updateDoc()             │ Spinner shows
                       │ setSyncStatus('success')│ Green alert
Click "Export"         │ generateJSON()          │ File downloads
                       │ downloadFile()          │ Browser dialog


SYNC FLOW:
──────────

SCENARIO A: LOCAL → CLOUD (Manual Sync)
────────────────────────────────────────

User edits profile
        ↓
setLifeCV() updates local state
        ↓
(Visible in UI immediately)
        ↓
User clicks "Sync to Cloud"
        ↓
setSyncing(true)
        ↓
syncToFirebase() executes:
  • doc(db, 'users', user.uid, 'profile', 'lifecv')
  • updateDoc(docRef, {
      ...lifeCV,
      lastUpdatedAt: serverTimestamp(),
      lastUpdatedBy: 'lifesync',
      syncedApps: [...],
      userId: user.uid
    })
        ↓
Firestore Update Complete
        ↓
setSyncStatus('success')
setSyncMessage('✓ Synced successfully!')
        ↓
Display green notification
        ↓
After 3 seconds:
  setSyncStatus('idle')
  Notification disappears
        ↓
Data now available in:
  ├─ Firestore (source of truth)
  ├─ GuestContext (offline copy)
  └─ All ecosystem apps


SCENARIO B: CLOUD ← APP (Auto-Detect)
──────────────────────────────────────

Other app (e.g., salatiso-lifecv) updates:
        ↓
updateDoc(docRef, {
  ...data,
  lastUpdatedBy: 'salatiso-lifecv',
  lastUpdatedAt: serverTimestamp()
})
        ↓
Firestore document changes
        ↓
Real-time Listener (onSnapshot) fires
        ↓
Check conditions:
  ✓ snapshot.exists()
  ✓ lastUpdatedBy !== 'lifesync'
  ✓ lastUpdatedAt > current lifeCV.lastUpdatedAt
        ↓
ALL CONDITIONS MET:
  setLifeCV(snapshot.data())
  setAppUpdates([...prev, {
    app: 'salatiso-lifecv',
    timestamp: now,
    fields: 'Profile updated'
  }])
  setSyncStatus('success')
  setSyncMessage('Updated from salatiso-lifecv!')
        ↓
UI Updates Automatically:
  ├─ Blue info box appears showing app update
  ├─ All fields update with new data
  ├─ User sees notification: "Updated from salatiso-lifecv!"
  └─ After 3 seconds: notification clears


UI STATE FLOWS:
───────────────

TABS FLOW:
User clicks tab
    ↓
setActiveTab(tabName)
    ↓
Tab button highlights
    ↓
Content switches to new tab
    ↓
Tab content: overview | education | experience | certifications | skills


SYNC STATUS FLOW:
Initial:
  syncStatus = 'idle'
  (No alert shown)
        ↓
User clicks "Sync to Cloud":
  syncStatus = 'syncing' → Blue alert + spinner
        ↓
If success:
  syncStatus = 'success' → Green alert + checkmark
  setTimeout(..., 3000) → syncStatus = 'idle'
        ↓
If error:
  syncStatus = 'error' → Red alert + warning icon


EDIT FORM FLOW:
───────────────

For Education Entry:

handleAddEducation()
    ↓
newEducation = {
  id: Date.now(),
  school: 'TUT',
  degree: 'B-Tech',
  field: 'Environmental Health',
  graduationDate: '2008',
  description: ''
}
    ↓
setLifeCV(prev => ({
  ...prev,
  education: [...prev.education, newEducation],
  lastUpdatedAt: Date.now(),
  lastUpdatedBy: 'lifesync'
}))
    ↓
New card rendered in Education tab
    ↓
User can edit inline or delete


JSON EXPORT FLOW:
─────────────────

User clicks "Export"
    ↓
handleExportJSON() executes:
  • JSON.stringify(lifeCV, null, 2)
  • Create Blob
  • Create ObjectURL
  • Create <a> element
  • Set href to URL
  • Set download filename
  • Append to DOM
  • Click link
  • Remove from DOM
    ↓
File downloads:
  lifecv-salatiso-lonwabo-mdeni-2024-12-15.json
```

## Sync Metadata Tracking

```
┌────────────────────────────────────────────────────────────┐
│        APP ORIGIN TRACKING (lastUpdatedBy)                │
└────────────────────────────────────────────────────────────┘

Scenario 1: LifeSync Creates Entry
───────────────────────────────────
setLifeCV({
  ...entry,
  lastUpdatedBy: 'lifesync',       ← Indicates LifeSync origin
  lastUpdatedAt: Date.now()
})

Result in Firestore:
{
  ...data,
  lastUpdatedBy: 'lifesync',
  lastUpdatedAt: Timestamp
}


Scenario 2: Another App Updates
────────────────────────────────
salatiso-lifecv updates same document:

updateDoc(docRef, {
  ...data,
  lastUpdatedBy: 'salatiso-lifecv'  ← Different origin
  lastUpdatedAt: serverTimestamp()
})

Result in Firestore:
{
  ...data,
  lastUpdatedBy: 'salatiso-lifecv',
  lastUpdatedAt: Timestamp
}

LifeSync detects:
✓ lastUpdatedBy !== 'lifesync'
✓ Knows salatiso-lifecv made the change


Scenario 3: User App History
──────────────────────────────
appUpdates array maintains history:

appUpdates = [
  {
    app: 'lifesync',
    timestamp: 2024-12-15T10:00:00Z,
    fields: 'Personal profile updated'
  },
  {
    app: 'salatiso-lifecv',
    timestamp: 2024-12-15T10:15:00Z,
    fields: 'Career vision updated'
  },
  {
    app: 'salatiso-seal',
    timestamp: 2024-12-15T10:30:00Z,
    fields: 'New certification added'
  }
]

Displayed as:
┌─────────────────────────────────────────┐
│ 📁 Updates from Other Apps              │
│                                         │
│ • lifesync - Personal profile updated   │
│   Dec 15, 2024, 10:00 AM               │
│                                         │
│ • salatiso-lifecv - Career vision       │
│   Dec 15, 2024, 10:15 AM               │
│                                         │
│ • salatiso-seal - New certification     │
│   Dec 15, 2024, 10:30 AM               │
└─────────────────────────────────────────┘
```

## Multi-App Synchronization Timeline

```
Timeline: User Working Across Multiple Apps

TIME    │ TAB 1 (LifeSync)    │ Firestore       │ TAB 2 (salatiso-lifecv)
────────┼─────────────────────┼─────────────────┼────────────────────────
10:00   │ User opens LifeCV   │ Reads profile   │ -
        │ Loads data from DB  │ {lastUpdatedBy: │
        │                     │  'salatiso-     │
        │                     │  lifecv'}       │
────────┼─────────────────────┼─────────────────┼────────────────────────
10:05   │ User edits mission  │ (No change)     │ -
        │ state locally       │                 │
        │ (Not synced yet)    │                 │
────────┼─────────────────────┼─────────────────┼────────────────────────
10:10   │ Clicks "Sync to     │ Updates:        │ (Listening)
        │ Cloud"              │ {mission: ...,  │
        │                     │  lastUpdatedBy: │
        │                     │  'lifesync',    │
        │                     │  lastUpdatedAt: │
        │                     │  2024-12-15...} │
        │                     │                 │ Real-time listener fires
        │                     │                 │ Loads new mission
        │                     │                 │ Shows notification
────────┼─────────────────────┼─────────────────┼────────────────────────
10:15   │ (Showing old data)  │ (Has new data)  │ User edits education
        │                     │                 │ Saves to Firestore
        │                     │ Updates:        │ {education: [...],
        │                     │ {education:..., │  lastUpdatedBy:
        │                     │  lastUpdatedBy: │  'salatiso-lifecv'}
        │                     │  'salatiso-     │
        │                     │  lifecv'}       │
        │                     │                 │
        │ Real-time listener  │                 │
        │ fires               │                 │
        │ Notification:       │                 │
        │ "Updated from       │                 │
        │ salatiso-lifecv"    │                 │
        │ Shows new education │                 │
────────┼─────────────────────┼─────────────────┼────────────────────────
10:20   │ User sees both:     │ Has all data    │ Auto-detects LifeSync's
        │ • New mission       │ from both apps  │ earlier sync
        │ • New education     │                 │ (Maybe via notification)
        │                     │                 │
        │ All data synced!    │ Source of truth │ All data synced!
────────┴─────────────────────┴─────────────────┴────────────────────────

Result: Seamless cross-app synchronization with full app-origin tracking
```

## Component Lifecycle

```
LifeCV Component Lifecycle
───────────────────────────

┌─ MOUNT ─────────────────────────────────────┐
│                                             │
│ 1. Initial render                           │
│    └─ State initialized with empty arrays   │
│                                             │
│ 2. useEffect() dependencies: [user]         │
│    ├─ Wait for user from AuthContext        │
│    ├─ If user exists:                       │
│    │  ├─ doc() reference created            │
│    │  ├─ getDoc() loads initial data        │
│    │  ├─ setLifeCV() populates state        │
│    │  └─ onSnapshot() sets up listener      │
│    └─ If no user: Skip                      │
│                                             │
│ 3. Render with loaded data                  │
│    └─ User sees profile information         │
│                                             │
│ 4. Real-time listener ACTIVE ✓              │
│    └─ Watching Firestore for changes        │
│                                             │
└─────────────────────────────────────────────┘
          ↓ (User interacts)
┌─ UPDATE ────────────────────────────────────┐
│                                             │
│ Event: User edits profile field             │
│ Action: onChange handler fires              │
│ Result: setLifeCV() updates state           │
│ Render: Component re-renders with new data  │
│ Display: User sees their changes            │
│                                             │
│ Event: Real-time listener detects change   │
│         from another app                    │
│ Action: onSnapshot() fires                  │
│ Result: setLifeCV() merges new data         │
│ Render: Component re-renders                │
│ Display: User sees notification             │
│                                             │
│ Event: User clicks "Sync to Cloud"          │
│ Action: syncToFirebase() executes           │
│ Result: updateDoc() writes to Firestore     │
│ Render: Sync status updates                 │
│ Display: Success/error message shown        │
│                                             │
└─────────────────────────────────────────────┘
          ↓ (Component unmounts)
┌─ UNMOUNT ───────────────────────────────────┐
│                                             │
│ 1. unsubscribe() called                     │
│    └─ Real-time listener STOPS ✗            │
│                                             │
│ 2. State cleared                            │
│    └─ Memory cleaned up                     │
│                                             │
│ 3. Data persisted                           │
│    ├─ In Firestore (persistent)             │
│    └─ In GuestContext (offline)             │
│                                             │
└─────────────────────────────────────────────┘
```

## Error Handling Flow

```
Error Scenarios & Recovery
──────────────────────────

┌─ FIRESTORE LOAD ERROR ──────────────────┐
│                                         │
│ Error: getDoc(docRef) fails             │
│ Cause: Network issue or permission      │
│ Response:                               │
│  ├─ console.error() logged              │
│  ├─ Loading state cleared               │
│  ├─ Local state used                    │
│  └─ User can still edit locally         │
│                                         │
│ Recovery:                               │
│  ├─ When sync clicked: Will retry       │
│  └─ Data not lost (in local state)      │
│                                         │
└─────────────────────────────────────────┘

┌─ SYNC FAILURE ──────────────────────────┐
│                                         │
│ Error: updateDoc() fails                │
│ Cause: Network issue or auth denied     │
│ Response:                               │
│  ├─ setSyncStatus('error')              │
│  ├─ setSyncMessage('Failed to sync')    │
│  ├─ Red alert displayed                 │
│  ├─ Data preserved locally              │
│  └─ GuestContext keeps offline copy     │
│                                         │
│ Recovery:                               │
│  ├─ Show retry button                   │
│  └─ User can try again when ready       │
│                                         │
└─────────────────────────────────────────┘

┌─ AUTH ERROR ────────────────────────────┐
│                                         │
│ Error: useAuth() returns null user      │
│ Cause: Not logged in                    │
│ Response:                               │
│  ├─ LifeCV page shows "Not logged in"   │
│  ├─ Redirect to Auth page               │
│  └─ User must authenticate first        │
│                                         │
│ Recovery:                               │
│  ├─ User logs in                        │
│  ├─ AuthContext updates user            │
│  └─ LifeCV loads from Firestore         │
│                                         │
└─────────────────────────────────────────┘
```

---

## Summary

✅ **Phase 3 Architecture:**
- Three-layer system: React → Firebase → Ecosystem
- Real-time synchronization across all apps
- Complete app-origin tracking
- Automatic cross-app update detection
- Seamless offline support via GuestContext

✅ **Ready for Phase 4:**
- Link other pages to LifeCV
- Implement bi-directional sync
- Multi-app integration testing
- Admin dashboard creation
