# Sonny & LifeSync Technical Specification

**Owner:** MNI Core Infrastructure Council  
**Version:** 1.0.0  
**Date:** October 14, 2025  
**Status:** ✅ Active — Core ecosystem infrastructure

---

## 1. Executive Summary

Sonny is the **offline-first companion communications and safety backbone** of the Salatiso ecosystem. It is not a standalone app but the foundational infrastructure enabling trust, reciprocity, and dignity across all vertical applications (PigeeBack, eKhaya, SafetyHelp, Sazi Life Academy, Flamea, etc.).

At its core are two foundational services:
- **LifeCV** → Portable, verifiable profile of identity, trust score, ratings, and roles
- **LifeSync** → Synchronization engine ensuring reciprocal data exchange, offline-first propagation, and conditional online bridging

---

## 2. Core Principles

### 2.1 Offline-First, Online-Optional
- **Default:** Bluetooth + Wi-Fi mesh
- **Internet:** Only when explicitly chosen or triggered by safety rules
- **No data costs:** Essential communications work without cellular data

### 2.2 Reciprocity by Design
- Every sync is two-way: if I store your safety data, you store mine
- Monitoring roles must be accepted, logged, and renewable
- All exchanges are mutual and consent-based

### 2.3 Trigger-Based Safety Automation
- Users define check-in triggers (trip start, mid-trip intervals, arrival)
- Missed triggers initiate escalation automatically
- Local escalation first (household/community offline), online as fallback

### 2.4 Trust Scoring
- Ratings, LifeCV history, and reciprocity logs build trust scores
- Higher trust = more reliable partners, safer rides, stronger communities
- Trust Score visible across all ecosystem apps

### 2.5 Consent as First Security Layer
- No one is monitored or visible without explicit opt-in
- Consent is time-boxed and renewable
- Immutable consent ledger tracks all permissions

---

## 3. Architecture Overview

### 3.1 Core Services

#### LifeCV Service
- Identity management
- Trust score calculation
- Ratings & endorsements
- Role definitions (household, community, professional)
- Portable profile data structure

#### LifeSync Engine
- Offline-first sync via BLE/Wi-Fi mesh
- Gossip routing for message propagation
- Trigger management and timers
- Escalation logic
- Online bridge activation (when needed)

#### Trigger Manager
- User-defined safety rules
- Interval timers (15 min, 30 min, custom)
- Check-in tracking
- Escalation policies (local → online)
- Reciprocal notification system

#### Consent Ledger
- Immutable log of roles, consents, expirations
- Renewal requests
- Revocation tracking
- Audit trail for trust disputes

---

## 4. Trigger & Check-In System

### 4.1 User-Defined Triggers

#### Trip Start Trigger
- User presses "Start Trip" button
- Arms all defined check-in requirements
- Syncs with reciprocal party (e.g., PigeeBack driver)
- Exchanges safety data bidirectionally

#### Mid-Trip Check-Ins
- Configurable intervals (e.g., every 15 min, at checkpoints)
- Automatic proximity pings to known contacts along route
- Manual "I'm OK" acknowledgments
- Location breadcrumbs (offline cached)

#### Arrival Trigger
- "Arrived" confirmation required at destination
- Household/emergency contacts notified
- Trip completion logged to LifeCV

### 4.2 Escalation Logic

```
IF check-in missed:
  1. Local escalation → Household/community notified offline (mesh)
  2. Wait for secondary confirmation window
  3. IF still unresolved:
     → Device sends data via internet (if available)
     → Driver's details sent to rider's emergency contacts
     → Rider's details sent to driver's emergency contacts
  4. Both sides follow up (assume accident/emergency)
```

### 4.3 Reciprocal Safety Exchange

**Example: PigeeBack Ride**
1. Rider syncs with driver offline (BLE/Wi-Fi)
2. Both phones exchange:
   - LifeCV profiles
   - Emergency contacts
   - Trip details (route, duration, checkpoints)
3. Rider sets check-in triggers (mid-trip + arrival)
4. If rider fails to check in:
   - Rider's emergency contacts receive driver's details
   - Driver's emergency contacts receive rider's details
   - Trust scores updated based on outcome

---

## 5. Trust & Safety Layers

### Layer 1: Consent
- Entry into ecosystem requires explicit consent
- Users define who monitors them and whom they monitor
- Consent can be revoked at any time

### Layer 2: Reciprocity
- Every monitoring or data exchange is mutual
- No one-sided surveillance
- Data stored on both parties' devices

### Layer 3: Trust Score (LifeCV)
Built from:
- **Ratings:** Rides, visits, community contributions
- **Check-in history:** Reliability of confirmations
- **Reciprocity logs:** Successful mutual exchanges
- **Endorsements:** From trusted nodes

### Layer 4: Escalation & Accountability
- Automatic escalation ensures no one disappears silently
- Reciprocal notifications prevent one-sided blame
- Audit trail for disputes or incidents

---

## 6. Sonny Network Capabilities

### 6.1 Presence & Range Detection
- Automatic detection when known contacts enter range
- Notifications: "Jane is nearby"
- Configurable visibility (friends/family/community/public)

### 6.2 Offline Messaging
- **In-range:** Text, voice, video (WiFi quality dependent)
- **Out-of-range:** Messages parked locally
- **Delivery:** Automatic when contact returns to range

### 6.3 Community Postbox (Gossip Routing)
- User posts announcement to community
- Message propagates peer-to-peer as users move
- Each phone becomes distribution node
- Hop count tracking
- Internet bridge option (if one household has connectivity)

**Example:**
```
Community announcement posted by User A
→ Syncs to Users B, C, D within range
→ User B walks to market, syncs with Users E, F, G
→ User C has internet, bridges message online to remote members
→ Eventually all 100 community members receive message
```

### 6.4 Status Broadcasting
Users set offline status:
- 🟢 Looking for friends
- 💼 Business networking
- ❤️ Romantic connections (consent-based matching)
- 🏠 Housing/roommate search

As users walk, others scan for compatible statuses within range.

---

## 7. Integration with Ecosystem Apps

### 7.1 PigeeBack
- **Uses:** Trigger Manager + Reciprocal Safety Exchange
- **Features:**
  - Trip check-ins
  - Driver-rider sync
  - Emergency escalation
  - Trust score validation before ride acceptance

### 7.2 eKhaya
- **Uses:** LifeCV for household roles + LifeSync for family monitoring
- **Features:**
  - Tenant check-ins
  - Visitor management
  - Property safety zones (geofencing)
  - Community watch coordination

### 7.3 Sazi Life Academy
- **Uses:** Sonny mesh for offline learning + LifeCV for student trust
- **Features:**
  - School wifi mesh network
  - Student-to-student collaboration (offline)
  - Parent monitoring (child safety)
  - Hymn/lesson distribution (offline postbox)

### 7.4 SafetyHelp / HRHelp
- **Uses:** Workplace OH&S + visitor management + shift check-ins
- **Features:**
  - Employee check-ins (hazardous work)
  - Visitor registration (hospital gates)
  - Emergency mustering (who's still in building)
  - OHS information distribution (offline postbox)

### 7.5 Flamea Sazi
- **Uses:** Community announcements + church hymns + cultural events
- **Features:**
  - Offline hymn distribution
  - Community mobilization
  - Event coordination
  - Trust-based advocacy networks

---

## 8. Data Structures

### 8.1 LifeCV Profile
```json
{
  "userId": "uuid",
  "name": "Full Name",
  "phone": "+27...",
  "email": "...",
  "trustScore": 85,
  "ratings": [...],
  "roles": ["household", "community_steward"],
  "emergencyContacts": [...],
  "consentLedger": [...],
  "checkInHistory": [...]
}
```

### 8.2 Safety Trigger
```json
{
  "triggerId": "uuid",
  "type": "trip|periodic|one-time",
  "startTime": "timestamp",
  "endTime": "timestamp",
  "checkInInterval": 15,
  "route": [...],
  "emergencyContacts": [...],
  "reciprocalParty": "driverId",
  "status": "active|completed|escalated"
}
```

### 8.3 Consent Record
```json
{
  "consentId": "uuid",
  "granter": "userId",
  "recipient": "userId",
  "role": "i_monitor|they_monitor|mutual",
  "scope": "location|messages|check-ins",
  "expiresAt": "timestamp",
  "renewable": true
}
```

---

## 9. Developer APIs

### 9.1 Trigger APIs
```kotlin
// Register trigger
fun registerTrigger(
    type: TriggerType,
    interval: Int,
    escalationPolicy: EscalationPolicy
): Trigger

// Check-in
fun recordCheckIn(triggerId: String, location: Location?)

// Escalate
fun escalate(triggerId: String, level: EscalationLevel)
```

### 9.2 Sync APIs
```kotlin
// Sync profile offline
fun syncProfile(peerId: String, scope: SyncScope)

// Exchange safety data (reciprocal)
fun exchangeSafetyData(peerId: String, tripId: String)

// Get trust score
fun getTrustScore(userId: String): TrustScore
```

### 9.3 Messaging APIs
```kotlin
// Send message (offline/online)
fun sendMessage(recipientId: String, message: Message)

// Post to community postbox
fun postAnnouncement(communityId: String, message: String, ttl: Int)

// Query presence
fun getNearbyUsers(radius: Int): List<User>
```

---

## 10. Example User Journeys

### 10.1 Student Using PigeeBack to School
1. Student starts trip in Sonny → triggers armed
2. Syncs with driver → reciprocal safety data exchanged
3. Mid-trip check-in required → student taps "OK"
4. Arrival check-in required → student taps "Arrived"
5. **If missed:**
   - Household notified offline
   - If unresolved: online escalation
   - Driver's details → student's family
   - Student's details → driver's family
6. Trust scores updated for both

### 10.2 Parent Monitoring Child's Walk Home
1. Parent sets up route with known contacts along path
2. Child activates "walking home" trigger (1km route)
3. As child passes each checkpoint, phones auto-sync
4. Parent receives silent confirmations: "Passed Auntie's house ✓"
5. Child arrives home, taps "Arrived"
6. Parent notified, trip logged to LifeCV

### 10.3 Community Announcement (Offline Postbox)
1. Community leader posts: "Water truck arrives tomorrow 10am"
2. Message syncs to 10 nearby households
3. As residents walk to work/market, message propagates
4. One household has internet → bridges message online
5. 2 hours later, all 50 households have message

### 10.4 Hospital Visitor Management
1. Visitor arrives at gate, scans hospital's Sonny seal (QR)
2. Joins hospital network for duration of visit
3. Receives OHS info, emergency exits, visiting hours (offline)
4. When leaving: visitor rates hospital, hospital rates visitor
5. Out of range: sync automatically turns off
6. **Emergency scenario:** Fire alarm
   - Hospital knows exactly how many visitors still inside
   - Can send evacuation updates via mesh network

---

## 11. Security & Privacy

### 11.1 Data Sovereignty
- All data stored locally on user's device
- Sync only with explicit consent
- User controls what data is shared with whom

### 11.2 Encryption
- All mesh communications encrypted (AES-256)
- LifeCV profiles signed (preventing tampering)
- Consent ledger uses blockchain-like append-only log

### 11.3 Revocation
- Users can revoke consent at any time
- Synced data on other devices becomes read-only
- No new updates received after revocation

### 11.4 Audit Trail
- All consent changes logged
- Check-in history immutable
- Trust disputes resolved via audit review

---

## 12. Roadmap

### Phase 1: Sonny MVP (Q4 2025)
- ✅ Offline chat (text only)
- ✅ Presence detection
- ✅ Trip monitoring (basic triggers)
- ✅ Community postbox (gossip routing)

### Phase 2: Triggers & PigeeBack (Q1 2026)
- ✅ User-defined triggers (trip/periodic/one-time)
- ✅ Reciprocal safety exchange
- ✅ Escalation logic (local → online)
- ✅ Trust score integration

### Phase 3: Ecosystem Apps (Q2 2026)
- ✅ eKhaya visitor management
- ✅ Sazi Life Academy mesh learning
- ✅ SafetyHelp workplace check-ins
- ✅ Flamea Sazi community coordination

### Phase 4: Trust Economy (Q3 2026)
- ✅ LifeCV trust scoring advanced features
- ✅ Endorsements & reputation marketplace
- ✅ Ratings governance (dispute resolution)
- ✅ Professional trust tiers (BizHelp integration)

---

## 13. Success Metrics
- **90%** of ecosystem users adopt Sonny for offline communications
- **75%** reduction in "where are you?" calls during emergencies
- **95%** check-in compliance for high-risk trips (PigeeBack)
- **50+** community networks (schools, churches, townships) using postbox
- **4.5+** average trust score across ecosystem

---

## 14. Review Cycle
Quarterly or upon major safety incident/feedback cycle.

---

*Sonny & LifeSync are the invisible infrastructure making the entire Salatiso ecosystem safe, trusted, and resilient.*
