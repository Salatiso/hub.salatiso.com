# LifeSync Profile & Emergency Contact PRD

## Objective
Enable in-app digital profiles with Guest (local-only) and Registered (Hub) modes, enforce a 7-day guest default, and add robust emergency contact setup compatible across the ecosystem.

## Users & Roles
- Individual (admin of own profile)
- Parent (admin of household; can manage child profiles)
- Guest (temporary access)
- Emergency Contact (accepts role invitations)

## Key Use Cases
1. First-run onboarding: choose Guest vs Registered (Registered after 7 days), provide minimal info and GPS consent
2. Local-only storage with export/import and restore points
3. Add/manage emergency contacts with role assignment, invitations, and acceptance
4. Initiate events: Follow-Me-Home with status sharing and optional group mode
5. Check-ins and geofences (future phases)

## Acceptance Criteria
- Minimal profile saved locally using existing `GuestContext`
- 7-day reminder and upgrade prompt
- Export/import works; restore points list and restore
- Contacts captured with at least one contact method

## Out of Scope (phase 1)
- Cloud APIs integration; encryption of exports; Wi-Fi Direct/mesh
