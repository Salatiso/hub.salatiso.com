# 🚀 PHASE 2 KICKOFF - DASHBOARD & PROFILE ARCHITECTURE

**Status**: ✅ Phase 1 Complete (0 errors) → Ready for Phase 2  
**Date**: October 28, 2025  
**Duration**: Week 2 (estimated 5-7 days)  
**Priority**: HIGH - Foundation for all future features  

---

## 📊 Phase 1 → Phase 2 Handoff

### Phase 1 Completion Status ✅
```
✅ Unified auth entry point (/guest-login)
✅ 3 auth methods working (Google, Email, Local)
✅ Fast signup: <30 seconds
✅ Dashboard tasks placeholder
✅ Zero ESLint errors
✅ Zero TypeScript errors
✅ Build: PASSING
✅ Tests: 10/10 PASSING
```

### What Phase 2 Builds On
- ✅ GuestLogin.tsx (unified entry complete)
- ✅ DashboardTasks placeholder (ready for expansion)
- ✅ Route structure (/guest-login → /dashboard)
- ✅ guestAccountService with PIN storage
- ✅ Authentication flows established

---

## 🎯 Phase 2 Objectives

**Primary Goal**: Build the core dashboard and profile management system

### Objective 1: Local Profile Store (Dexie.js) ⭐
**Why**: Offline-first architecture requires local IndexedDB storage

**What to Build**:
- [ ] Install Dexie.js dependency
- [ ] Create `src/db/profiles.db.ts` with Dexie schema
- [ ] Create profile table: `id`, `displayName`, `email`, `pin`, `tasks`, `metadata`
- [ ] Create `src/hooks/useLocalProfile.ts` hook
- [ ] Create `src/services/profileService.ts` for CRUD operations
- [ ] Migrate guestAccountService data to Dexie on first run
- [ ] Add IndexedDB export/import for backup

**Dependencies**: None (new feature)  
**Estimate**: 1-2 days  
**Acceptance Criteria**:
- ✅ Profile data persists in IndexedDB
- ✅ Can read/write/update profiles
- ✅ Export and import profiles work
- ✅ Migration from localStorage works

---

### Objective 2: PIN Security - PBKDF2 Hashing ⭐
**Why**: Phase 1 stored PIN as plaintext. Need encryption before sync.

**What to Build**:
- [ ] Install `libsodium.js` or `crypto-js` for hashing
- [ ] Create `src/security/pinEncryption.ts` module
- [ ] Implement PBKDF2 hash: `hashPin(pin) → hash`
- [ ] Implement verify: `verifyPin(pin, hash) → boolean`
- [ ] Update guestAccountService to hash PIN before storing
- [ ] Update local auth flow to verify hashed PIN
- [ ] Add salt generation and storage

**Dependencies**: crypto-js or libsodium  
**Estimate**: 1-2 days  
**Acceptance Criteria**:
- ✅ PIN hashed with PBKDF2
- ✅ Salt generated and stored
- ✅ PIN verification works
- ✅ No plaintext PINs in storage

---

### Objective 3: Task Completion System ⭐
**Why**: Users need to actually complete profile tasks and see progress

**What to Build**:
- [ ] Create 8 task definitions in `src/data/profileTasks.ts`
- [ ] Create `TaskModal` component for each task type
- [ ] Update DashboardTasks to track completion
- [ ] Create `src/components/TaskModals/` directory:
  - [ ] ContactInfoModal
  - [ ] EmailVerificationModal
  - [ ] PhoneVerificationModal
  - [ ] IDUploadModal
  - [ ] AddressConfirmationModal
  - [ ] ServicesRegistrationModal
  - [ ] SecurityUpgradeModal
  - [ ] LifeCVModal
- [ ] Update profileService to save task completion
- [ ] Calculate trust score (0-100 based on tasks)
- [ ] Update DashboardTasks progress bar and count

**Dependencies**: Profile store (Objective 1)  
**Estimate**: 2-3 days  
**Acceptance Criteria**:
- ✅ All 8 task modals render
- ✅ Can complete each task
- ✅ Progress updates in real-time
- ✅ Trust score calculates (8 = 100%)
- ✅ Data persists in Dexie

---

### Objective 4: Enhanced Dashboard UI ⭐
**Why**: Current dashboard is generic. Need specific profile-centric UI.

**What to Build**:
- [ ] Create ProfileCard component showing:
  - Display name
  - Email
  - Current trust score
  - Tasks completed badge
  - Profile photo placeholder
- [ ] Enhance DashboardTasks:
  - Better visual hierarchy
  - Task icons and descriptions
  - Recommended order hints
  - Completion time estimates
- [ ] Create ProfilePreview widget
- [ ] Create TrustScoreWidget showing breakdown
- [ ] Create QuickActionsWidget for common tasks
- [ ] Responsive design for mobile
- [ ] Dark mode support

**Dependencies**: Task system (Objective 3)  
**Estimate**: 1-2 days  
**Acceptance Criteria**:
- ✅ Profile card displays correctly
- ✅ Trust score widget shows breakdown
- ✅ Responsive on mobile/tablet/desktop
- ✅ Dark mode working
- ✅ All widgets load in <2 seconds

---

### Objective 5: Local Sync Infrastructure (Deferred to Phase 2.5)
**Why**: Need offline queue to sync changes when online

**Note**: This will be Phase 2.5 (Sprint extension). Currently deferring to focus on core features.

---

## 🗓️ Phase 2 Timeline

### Day 1-2: Dexie Setup & Migration
```
Mon: Install Dexie, create schema, local profile store
Tue: Migration from localStorage, export/import, testing
```

### Day 3-4: PIN Security
```
Wed: Install crypto library, implement PBKDF2
Thu: Update auth flow, test PIN verification
```

### Day 5-7: Task System
```
Fri: Create task definitions, ProfileService
Mon: Build 8 task modals
Tue: Dashboard integration, trust score calculation
```

### Day 8: Dashboard UI (Sprint extension)
```
Wed: ProfileCard, DashboardTasks enhancements
```

---

## 📁 Files to Create (Phase 2)

### Database Layer
```
src/db/
├── profiles.db.ts              (Dexie schema & init)
├── profileTypes.ts             (TypeScript interfaces)
└── migrations.ts               (localStorage → Dexie migration)
```

### Services
```
src/services/
├── profileService.ts           (CRUD for profiles)
├── taskService.ts              (CRUD for tasks)
└── syncService.ts              (TODO Phase 2.5: offline queue)
```

### Security
```
src/security/
├── pinEncryption.ts            (PBKDF2 hashing)
└── encryption.ts               (TODO Phase 2.5: full encryption)
```

### Components
```
src/components/
├── ProfileCard.tsx             (Profile display)
├── ProfilePreview.tsx          (Mini preview)
├── TrustScoreWidget.tsx        (Score breakdown)
├── QuickActionsWidget.tsx      (CTA buttons)
└── TaskModals/
    ├── ContactInfoModal.tsx
    ├── EmailVerificationModal.tsx
    ├── PhoneVerificationModal.tsx
    ├── IDUploadModal.tsx
    ├── AddressConfirmationModal.tsx
    ├── ServicesRegistrationModal.tsx
    ├── SecurityUpgradeModal.tsx
    └── LifeCVModal.tsx
```

### Hooks
```
src/hooks/
├── useLocalProfile.ts          (Profile context hook)
├── useTaskCompletion.ts        (Task state management)
└── useTrustScore.ts            (Trust score calculation)
```

### Data
```
src/data/
└── profileTasks.ts             (8 task definitions)
```

---

## 🔗 Dependencies to Install

### Phase 2 Required
```bash
npm install dexie              # IndexedDB wrapper
npm install crypto-js          # PBKDF2 hashing (or libsodium.js)
npm install react-hook-form    # Form management for modals
```

### Phase 2.5 (Deferred)
```bash
npm install workbox            # Service worker, offline
npm install axios              # HTTP for sync
```

---

## 📚 Files to Review First

### Understanding Current Auth
1. `src/pages/GuestLogin.tsx` - Current auth entry
2. `src/services/guestAccountService.ts` - Profile creation
3. `src/components/DashboardTasks.jsx` - Placeholder tasks

### Understanding Phase 2 Requirements
1. `PHASE1_IMPLEMENTATION_COMPLETE.md` - What was built
2. `LIFESYNC_PHASED_IMPLEMENTATION_PLAN_V2.md` - Overall vision
3. `REFACTOR_ROADMAP_LOCAL_FIRST_DASHBOARD.md` - Phase 2 details

---

## 🚀 Phase 2 Getting Started Checklist

### Before Starting
- [ ] Verify Phase 1 build passes (`npm run build`)
- [ ] ESLint clean (`npm run lint` → 0 errors)
- [ ] Review DashboardTasks placeholder component
- [ ] Review guestAccountService structure

### Installation
- [ ] Install Dexie: `npm install dexie`
- [ ] Install crypto-js: `npm install crypto-js`
- [ ] Install react-hook-form: `npm install react-hook-form`
- [ ] Verify no dependency conflicts: `npm ls`

### Initialization
- [ ] Create `src/db/` directory
- [ ] Create `src/security/` directory
- [ ] Create `src/components/TaskModals/` directory
- [ ] Create database schema (profiles.db.ts)

### First Task (Dexie Setup)
- [ ] Read Dexie documentation
- [ ] Design profile schema
- [ ] Create TypeScript interfaces
- [ ] Test database initialization

---

## 📊 Success Metrics (Phase 2)

### Functional Metrics
- ✅ All 8 task modals render without error
- ✅ Can complete tasks and see progress update
- ✅ Profile data persists in IndexedDB
- ✅ PIN hashed with PBKDF2
- ✅ Trust score calculates correctly (0-100)
- ✅ Dashboard widgets responsive

### Quality Metrics
- ✅ Zero ESLint errors
- ✅ Zero TypeScript errors
- ✅ Build passes
- ✅ Manual tests 15/15 passing
- ✅ Performance: Dashboard loads in <1 second

### Completion Metrics
- ✅ 4 main objectives complete
- ✅ 14 new components/services created
- ✅ 2,000+ lines of new code
- ✅ Full documentation created

---

## ⚠️ Phase 2 Known Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Dexie quota limits | Data loss on large profiles | Implement cleanup, respect 50MB limit |
| PIN collision | Security gap | Use proper random salt, test collisions |
| Task modal complexity | Development time overrun | Use component templates, shared styles |
| Browser compatibility | iOS Safari Dexie support | Test on iOS, fallback to localStorage |
| Performance | Slow dashboard load | Lazy load task modals, cache responses |

---

## 🔄 Integration Points

### Phase 2 Integrates With
- ✅ **Auth System** (Phase 1): Login creates profile in Dexie
- ✅ **GuestLogin** (Phase 1): After signup, profile stored in DB
- ✅ **Dashboard** (Phase 1): Tasks now linked to profiles
- ✅ **guestAccountService** (Phase 1): Data migrated to Dexie

### What Phase 3 Will Use
- Profile store as foundation
- Task completion history
- Trust score calculations
- User preferences from profile

---

## 📝 Handoff Notes from Phase 1

### What Worked Well
- ✅ Unified entry point clear and simple
- ✅ 3 auth methods equally prominent
- ✅ Fast local account creation (< 30 sec)
- ✅ Dashboard immediately accessible
- ✅ DashboardTasks placeholder set up correctly

### What's Ready for Phase 2
- ✅ Authentication established
- ✅ Route structure solid
- ✅ guestAccountService prepared
- ✅ Dashboard component ready
- ✅ Development environment stable

### What Needs Phase 2
- ⏳ Profile persistence (currently just localStorage)
- ⏳ PIN security (currently plaintext)
- ⏳ Task completion tracking (placeholder now)
- ⏳ Full dashboard UI (generic widgets now)
- ⏳ Trust score system (not implemented)

---

## 🎓 Learning Resources

### Dexie.js
- Docs: https://dexie.org/docs
- Tutorial: https://dexie.org/docs/tutorial
- TypeScript: https://dexie.org/docs/typescript

### PBKDF2 Hashing
- crypto-js: https://cryptojs.gitbook.io/docs/
- libsodium.js: https://github.com/jedisct1/libsodium.js
- Best practices: https://cheatsheetseries.owasp.org/

### React Patterns
- Context API: Context for profile state
- Hooks: useLocalProfile, useTaskCompletion
- Components: Task modals as controlled components

---

## 🎯 Phase 2 Definition of Done

**A task is complete when:**
- ✅ Code written and tested
- ✅ All tests passing (10/10)
- ✅ ESLint passing (0 errors)
- ✅ Build passing
- ✅ No console warnings
- ✅ Components responsive
- ✅ Dark mode working
- ✅ Documentation updated
- ✅ Code reviewed
- ✅ Ready for Phase 3

---

## 🚀 Ready to Start?

### Immediate Next Steps (Do This First)

1. **Install Dependencies**
```bash
npm install dexie crypto-js react-hook-form
npm run lint   # Should be 0 errors
npm run build  # Should pass
```

2. **Review Phase 1 Code**
- Read `src/pages/GuestLogin.tsx` (understand auth flow)
- Read `src/services/guestAccountService.ts` (understand profile structure)
- Read `src/components/DashboardTasks.jsx` (understand task placeholder)

3. **Start Task 1: Dexie Setup**
- Create `src/db/` directory
- Create `profiles.db.ts` with Dexie schema
- Test database initialization

4. **Documentation**
- Create `PHASE2_KICKOFF.md` (this file)
- Create `PHASE2_WEEKLY_PLAN.md` (day-by-day breakdown)
- Create `PHASE2_TASK_CHECKLIST.md` (granular tasks)

---

## 📞 Phase 2 Support

### If You Get Stuck

**Dexie Issues**:
- Read: https://dexie.org/docs/
- Check: https://github.com/dexie/dexie.js/issues

**PIN Security Issues**:
- Read: OWASP crypto cheat sheet
- Test: Use crypto-js playground

**Component Issues**:
- Reference: Phase 1 GuestLogin.tsx refactor
- Check: React component patterns

**Build Issues**:
- Run: `npm run lint && npm run build`
- Check: error message for specifics

---

## ✅ Phase 2 Kickoff Sign-Off

```
Phase 1: ✅ COMPLETE (0 errors, all tests passing)
Phase 2: ✅ READY TO START

Dependencies: Ready to install
Documentation: Ready
File structure: Ready
Timeline: Week 2 (5-7 days estimated)

🚀 LET'S BUILD PHASE 2! 🚀
```

---

**Next Document**: `PHASE2_WEEKLY_PLAN.md` (detailed day-by-day plan)  
**Next Task**: Install dependencies and review Phase 1 code  
**Estimated Duration**: 2 weeks (core features)  
**Expected Completion**: November 10, 2025

---

Let's proceed to Phase 2 with the same quality and attention to detail! 🚀
