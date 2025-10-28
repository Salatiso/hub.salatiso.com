## Update - 2025-09-17

New callable function: `computeReciprocity`

- Method: Firebase Callable Function
- Auth: Required (Firebase Auth)
- Request: `{ partnerUid: string }`
- Response:
  - `overlapPercent: number` (min of both completion %)
  - `selfEval: { completionPercent: number, present: string[], missing: string[] }`
  - `partnerEval: { completionPercent: number, present: string[], missing: string[] }`
  - `partnerVisible: object` (subset of partner profile gated by reciprocity)

Local development:

- Functions emulator: `5001` (configurable)
- Firestore emulator: `8080` (configurable)
- App connects to emulators when `VITE_USE_FUNCTIONS_EMULATOR=1` and/or `VITE_USE_FIRESTORE_EMULATOR=1`.
# The Hub API Contracts (Draft)

Goal: Enable cross-app profile sync and event interoperability between LifeSync, FamilyValue, PigeeBack, and Ekhaya.

## Auth
- Access Token: OAuth2 bearer or Firebase ID token (tbd)
- Tenant: `salatiso-ecosystem`

## Profiles
- POST `/v1/profiles`
  - body: `shared-profile-schema.json` subset
  - returns: `{ id, createdAt }`
- GET `/v1/profiles/{id}`
- PATCH `/v1/profiles/{id}`
  - partial updates; optimistic concurrency via `If-Match: <etag>`
- GET `/v1/profiles?owner.uid=<uid>`

## Contacts
- POST `/v1/profiles/{id}/contacts`
- PATCH `/v1/profiles/{id}/contacts/{contactId}`
- POST `/v1/invitations`
  - body: `{ profileId, contact, roles[] }`
  - returns: `{ invitationId, status }`
  - side-effect: sends notification to invitee to accept and create a profile if needed

## Events (LifeSync Seal)
- POST `/v1/events`
  - body: `{ ownerId, title, mode, shareLevel, invitees[] }`
- GET `/v1/events/{id}`
- PATCH `/v1/events/{id}`
  - update `status`, `shareLevel`, `invitees`
- POST `/v1/events/{id}/status`
  - body: `{ status: 'planned'|'active'|'ended', timestamp }`
- POST `/v1/events/{id}/locations`
  - body: `{ lat, lng, accuracy, timestamp }`

## Geofences
- POST `/v1/profiles/{id}/geofences`
- GET `/v1/profiles/{id}/geofences`
- PATCH `/v1/profiles/{id}/geofences/{fenceId}`
- DELETE `/v1/profiles/{id}/geofences/{fenceId}`

## Check-ins
- POST `/v1/profiles/{id}/checkins`
- PATCH `/v1/profiles/{id}/checkins/{checkId}`
- POST `/v1/profiles/{id}/checkins/{checkId}/confirm`

## Offline queueing
- Clients SHALL enqueue requests in `IndexedDB` when offline with a FIFO queue per resource type.
- Required headers: `X-Client-Id`, `X-Clock-Skew`.
- Conflict strategy: server is source of truth; clients must reconcile by patching local copies with `updatedAt` and server `etag`.

## Webhooks
- `POST /v1/hooks/events.status.changed`
- `POST /v1/hooks/invitations.accepted`
- `POST /v1/hooks/checkins.overdue`

This is a draft; details may evolve with The Hub implementation. PRs welcome.
