## Update - 2025-09-17

Enhancements implemented in LifeSync v2.01:

- Onboarding Save & Continue fix with IndexedDB persistence.
- South Africa coverage redesign: Province > City/Town with optional free text and GPS.
- LifeCV adapters (to/from) updated to include role, services, coverage, and normalized contacts.
- Firestore used as the primary profile store (`profiles/{uid}`) with owner-only rules.
- Reciprocity API (Cloud Functions callable: `computeReciprocity`) computes mutual visibility server-side.
- Client integrates reciprocity data and incentives in `Sync` page; partner UID can be entered or scanned.
- Functions & Firestore Emulators supported in dev; app autoconnects with `VITE_USE_*_EMULATOR=1`.
- App hydrates signed-in user profile from Firestore on load to keep local completion in sync.

Emulator quick start (PowerShell):

```
$env:VITE_USE_FUNCTIONS_EMULATOR='1'
$env:VITE_FUNCTIONS_EMULATOR_HOST='localhost'
$env:VITE_FUNCTIONS_EMULATOR_PORT='5001'
$env:VITE_USE_FIRESTORE_EMULATOR='1'
$env:VITE_FIRESTORE_EMULATOR_HOST='localhost'
$env:VITE_FIRESTORE_EMULATOR_PORT='8080'
firebase emulators:start --only functions,firestore
```

# LifeSync Profile Tech Spec

## Data Model (local)
- guestData
  - profile: { fullName, email, phone, consentGPS, mode }
  - emergencyContacts: [ { id, name, phones[], emails[], addresses[], relationship, priority, status, addedAt, proximity } ]
  - syncs: []
  - createdAt, renewals, lastReminder, expired
  - backups: [ { id, createdAt, data } ]

Storage: `localStorage` initially; plan to move to IndexedDB for larger datasets. Export/import as JSON; future AES encryption.

## Routing
- `/onboarding` new page
- Header + Home CTA link

## 7-day Gate
- `App.jsx` already has timers; reuse for reminders. Registered mode remains disabled in UI until day 7.

## Future Integration (Hub)
- POST `/api/lifesync/profile`, `/contacts`, `/event/start` with offline queue
- Merge local to cloud on upgrade; conflict resolution via last-write-wins with user review

## Security
- Add password-based encryption for exports (phase 2)
- Consent flags for GPS and sharing
