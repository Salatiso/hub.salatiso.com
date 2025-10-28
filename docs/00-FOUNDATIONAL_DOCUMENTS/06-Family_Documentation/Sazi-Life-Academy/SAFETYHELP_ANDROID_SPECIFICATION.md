# SafetyHelp Android App - Technical Specification
**Version:** 1.0.0  
**Last Updated:** October 6, 2025  
**Project:** SafetyHelp by Salatiso - Workplace Health & Safety Management Platform  
**Web App:** https://safetyhelp-lifecv.web.app/ & https://safetyfirst.help/

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [App Philosophy & Positioning](#app-philosophy--positioning)
3. [Core Features](#core-features)
4. [Phased Development Plan](#phased-development-plan)
5. [Technical Architecture](#technical-architecture)
6. [Data Models](#data-models)
7. [User Flows](#user-flows)
8. [Integration with LifeSync](#integration-with-lifesync)
9. [Offline-First & Mesh Features](#offline-first--mesh-features)
10. [UI/UX Guidelines](#uiux-guidelines)
11. [Document Compilation & Reporting System](#document-compilation--reporting-system)

---

## Executive Summary

### Purpose
SafetyHelp is a workplace health & safety management platform that democratizes OHS (Occupational Health & Safety) compliance. It enables organizations of any size—from individual practitioners to large corporations—to manage safety protocols, incident reporting, employee induction, and emergency response systems.

### Key Differentiators
1. **Free for Personal Use** - Individuals can create safety protocols for their homes/properties at no cost
2. **Public Pages First** - Most content accessible without registration
3. **Guest Account Default** - Users can start immediately; data stored locally; upgrade to full account anytime
4. **Offline-First** - Critical safety information available without internet
5. **Mesh Communication** - Peer-to-peer emergency alerts and incident reporting when networks fail
6. **LifeCV Integration** - Safety officers and trainers build credibility through trust scores
7. **QR-Based Access** - Scan building/workplace seal to access protocols instantly

### Target Users
- **Personal Users:** Homeowners, landlords, property managers (FREE)
- **Small Businesses:** Doctors, dentists, small shops (5-20 employees)
- **Medium Organizations:** Schools, hospitals, manufacturing plants (20-500 employees)
- **Large Enterprises:** Corporate buildings, stadiums, government offices (500+ employees)
- **Event Organizers:** Temporary venues, concerts, sports events
- **Community Groups:** Neighborhood watch, informal settlements, churches

---

## App Philosophy & Positioning

### Free Tier (Personal Use)
**What's Included:**
- Unlimited LifeSeals for personal properties
- QR code generation for gates/entrances
- Custom safety instructions (text, PDF)
- Emergency contact management
- Guest check-in system (offline)
- Basic incident reporting
- Local data storage (no cloud sync)

**Use Cases:**
- Homeowner creates seal with delivery instructions
- Landlord creates seal with tenant emergency contacts
- Vacation home owner leaves instructions for caretakers
- Small business owner posts safety protocols at entrance

### Professional Tier (Paid Service)
**Pricing Model:** Scalable by entity size
- **Community/Street Level:** R50/month (up to 50 households)
- **Small Business:** R200/month (up to 20 employees)
- **Medium Organization:** R1,000/month (up to 500 employees)
- **Enterprise:** Custom pricing (500+ employees)

**Additional Features:**
- Cloud synchronization
- Multi-administrator management
- Role-based access control
- Advanced analytics dashboard
- Compliance reporting
- Integration with external systems (SHEQ software)
- Automated reminders and audits
- Video induction content
- Multi-site management

### Guest vs Registered Users

**Guest Account (Default):**
- No email required to start
- Data stored locally on device
- Access to all public safety pages
- Can scan seals and view protocols
- Can report incidents (stored locally until registration)
- Mesh communication available
- Limited to single device

**Registered Account:**
- Links to LifeCV profile
- Trust score visible
- Multi-device sync
- Cloud backup
- Can create professional seals (paid tier)
- Participate in OHS committees
- Receive certifications
- Access full incident history

---

## Core Features

### 1. Safety Seal System (LifeSeal for Safety)

#### Personal Safety Seals
- **Home Safety Seal:**
  - Display at gate/entrance
  - Customizable instructions for visitors, delivery personnel
  - Emergency contacts (ambulance, fire, police, neighbors)
  - Property hazard warnings (dogs, security, etc.)
  - Evacuation procedures
  - First aid kit location
  
- **QR Code Generation:**
  - Printable A4 poster
  - Weatherproof design
  - Permanent (static URL)
  - Dynamic (time-limited for specific events)
  
- **Information Included:**
  - Property owner name (optional)
  - Emergency contact numbers
  - Gate code / access instructions
  - Delivery drop-off location
  - Parking information
  - Special instructions (e.g., "Use side entrance during renovations")

#### Professional Safety Seals
- **Workplace Seal:**
  - Compliance with OHS Act (South Africa: Act 85 of 1993)
  - Section 8: General duties of employers to their employees
  - Section 9: Duties in respect of persons other than employees
  - Required protocols posted digitally and physically
  
- **Content Included:**
  - Safety induction video/PDF
  - Emergency evacuation map
  - Assembly point locations
  - Fire extinguisher locations
  - First aid room location
  - Incident reporting form (accessible via QR)
  - Contact: Safety Officer, Security, Medical
  - Hazard-specific warnings (chemicals, machinery, heights)
  - PPE requirements
  - COVID-19 protocols (if applicable)

#### Event Safety Seals
- **Temporary Event Seal:**
  - Created for specific date/time
  - Auto-expires after event
  - Stadium, concert, conference safety info
  - Medical tent locations
  - Lost & found contact
  - Event organizer emergency line
  - Crowd management protocols

### 2. Visitor & Employee Management

#### Visitor Check-In Flow
1. **Scan QR Code** at building entrance
2. **View Safety Induction** (auto-plays or manual acknowledgment)
3. **Accept Terms** (liability, safety rules)
4. **Digital Sign-In** (name, company, purpose, time in)
5. **Join Mesh Network** (automatic for emergency communication)
6. **Receive Visitor Badge** (digital, displayed on lock screen widget)
7. **Check-Out** (scan exit QR or auto-check-out after leaving geofence)

#### Employee Onboarding
- **First-Day Induction:**
  - Employee scans workplace seal
  - Watches safety induction videos
  - Completes quiz (pass rate: 80%)
  - Signs off on understanding
  - Receives digital certificate
  
- **Ongoing Access:**
  - Always has access to safety protocols via app
  - Can re-watch training anytime
  - Receives push notifications for protocol updates
  - Mandatory re-induction annually or after incidents

### 3. Incident Reporting System

#### Incident Types
- **Safety:** Injuries, near-misses, unsafe conditions
- **Security:** Theft, unauthorized access, threats
- **Health:** Illness, exposure, mental health concerns
- **Property Damage:** Equipment failure, building damage
- **Environmental:** Spills, pollution, waste issues

#### Reporting Flow
1. **Trigger Report:**
   - Button in app: "Report Incident"
   - Or scan "Incident Report" QR code at workplace
   
2. **Form Fields:**
   - Type (dropdown)
   - Severity (Minor, Moderate, Serious, Critical)
   - Location (GPS auto-captured + manual pin on map)
   - Date/Time (auto-filled, editable)
   - Description (text + voice recording option)
   - Photos (up to 10)
   - Witnesses (search from employee list or add manually)
   - Immediate actions taken
   
3. **Submission:**
   - **Offline:** Stored locally, queued for sync
   - **Online:** Immediately sent to Safety Officer + relevant parties
   - **Mesh Network:** If online unavailable, broadcasts to nearby devices; whoever gets online first syncs to server
   
4. **Tracking:**
   - Reporter receives incident ID
   - Status updates: Reported → Under Investigation → Action Taken → Resolved
   - Timeline of all actions logged
   - Reporter can add follow-up comments
   
5. **Confidentiality:**
   - Option to report anonymously
   - Reporter identity hidden from non-admins if selected

#### Incident Analytics (Admin View)
- Dashboard showing:
  - Incidents by type, severity, location
  - Trends over time
  - Top hazard areas (heat map)
  - Response time metrics
  - Repeat incidents (pattern detection)
- Exportable reports for compliance audits

### 4. OHS Committee & Roles

#### Role Hierarchy
- **Employer/CEO:** Ultimate responsibility (Section 16 of OHS Act)
- **Health & Safety Officer:** Manages OHS program (Section 16A)
- **OHS Committee Members:** Employee representatives (Section 19)
- **Fire Wardens:** Evacuation coordinators
- **First Aiders:** Medical responders
- **Security Personnel:** Access control, incident response
- **Standard Employee:** Follows protocols, reports hazards

#### Role Management
- **Safety Officer Can:**
  - Create/update workplace seals
  - Assign roles (warden, first aider, committee member)
  - Approve/reject incident reports
  - Schedule drills and training
  - Publish safety alerts
  - Access full analytics
  - Manage multiple sites/buildings
  
- **OHS Committee Member Can:**
  - View all incident reports
  - Participate in committee meetings (in-app chat/video)
  - Propose safety improvements
  - Vote on protocol changes (60% majority rule)
  - Audit safety equipment
  
- **Fire Warden Can:**
  - Initiate emergency evacuation alerts
  - Mark zones as cleared
  - Submit evacuation drill reports
  
- **Employee Can:**
  - View safety protocols
  - Report incidents
  - Check in/out of workplace
  - Participate in safety suggestions
  - View their training certificates

#### OHS Committee Features
- **Meeting Scheduler:**
  - Quarterly meetings (compliance requirement)
  - Agenda creation
  - Minutes recording
  - Action items tracking
  
- **Group Chat:**
  - Dedicated channel for committee
  - Offline-capable (mesh network)
  - Share documents, photos
  - Pin important messages
  
- **Voting System:**
  - Proposals for safety improvements
  - 60% majority required to pass
  - Transparent vote counts
  - Audit trail

### 5. Emergency Response System

#### Emergency Activation
- **Panic Button:**
  - Large red button on home screen
  - Hold for 3 seconds to activate
  - Sends distress signal to all nearby users + Safety Officer
  - Shares live GPS location
  - Opens emergency communication channel
  
- **Evacuation Alert:**
  - Fire Warden triggers building-wide alert
  - Push notification: "EVACUATE NOW - Proceed to Assembly Point A"
  - Alarm sound plays on all devices
  - Map shows evacuation routes
  - Real-time headcount tracking
  
- **Automated Triggers:**
  - Geofence breach in restricted areas
  - Device detects fall (if accelerometer data indicates injury)
  - Missed check-in (if employee doesn't check in within 30 min of shift start)

#### Emergency Mesh Network
- **How It Works:**
  - All SafetyHelp users within Bluetooth/WiFi range form mesh
  - Messages relay peer-to-peer (up to 6 hops)
  - No internet required
  - Encrypted end-to-end
  
- **Use Cases:**
  - Building fire → cell towers overloaded → mesh keeps communication alive
  - Factory explosion → power out, no WiFi → mesh allows roll call
  - Stadium stampede → network congestion → mesh lets organizers coordinate
  
- **Mesh Protocol:**
  - Priority messages (emergency) bypass queue
  - Location pings every 30 seconds during active emergency
  - "I'm Safe" button broadcasts status
  - Responders can see live map of all personnel

#### Assembly Point Check-In
- **QR Codes at Assembly Points:**
  - Physical signs at designated safe zones
  - Employees scan to confirm they've evacuated
  - System marks them as "Accounted For"
  - Missing persons list generated automatically
  - Fire Warden can initiate search for missing employees

### 6. Safety Induction & Training

#### Content Types
- **Video Induction:**
  - Welcome message from CEO/Safety Officer
  - Facility tour highlighting hazards
  - Emergency procedures walkthrough
  - PPE demonstration
  - Q&A section
  
- **Interactive Modules:**
  - Quizzes after each section
  - Pass/fail requirements (80%)
  - Retake option if failed
  - Certificate generation upon completion
  
- **PDF Resources:**
  - SOP (Standard Operating Procedures)
  - MSDS (Material Safety Data Sheets)
  - Emergency contact lists
  - First aid guides

#### Content Delivery
- **Offline-First:**
  - Videos/PDFs cached on device after first view
  - Can be accessed anytime without internet
  - Updates downloaded in background when connected
  
- **Multi-Language Support:**
  - South African official languages (11)
  - Subtitles for videos
  - Text-to-speech for low-literacy users
  
- **Accessibility:**
  - Large text mode
  - High contrast mode
  - Audio descriptions
  - Sign language interpretation videos (future)

#### Compliance Tracking
- **For Safety Officer:**
  - Dashboard shows who has completed induction
  - Overdue reminders sent automatically
  - Compliance percentage visible (target: 100%)
  - Exportable reports for audits (Department of Employment & Labour inspections)

### 7. Trust System Integration

#### Safety Professional Credibility
- **LifeCV Profile:**
  - Safety Officers, Trainers, Consultants link their credentials
  - Certifications displayed: SAMTRAC, NEBOSCH, ISO 45001 Lead Auditor, etc.
  - Years of experience
  - Industries worked in
  
- **Trust Score:**
  - Rated by employees/clients after interactions
  - Criteria: Knowledge, Responsiveness, Professionalism, Effectiveness
  - Community endorsements from companies they've served
  - Badge levels: Unverified → Basic → Verified → Trusted → Elite
  
- **Use Case:**
  - Small business looking for Safety Officer consultant
  - Searches SafetyHelp directory
  - Filters by Trust Score (>90%), Industry (Hospitality), Location (Johannesburg)
  - Views consultant's LifeCV, reviews, certifications
  - Books consultation through app

#### Employee Participation Scores
- **Engagement Metrics:**
  - Incident reports submitted
  - Safety suggestions made
  - Training modules completed
  - Drill participation
  - Committee involvement
  
- **Recognition:**
  - "Safety Champion" badge for top contributors
  - Displayed on internal leaderboard
  - Can be added to personal LifeCV

---

## Phased Development Plan

### **PHASE 1: Frontend-First (Weeks 1-8)**
**Goal:** Build fully functional UI with mock data; publish to Play Store as "Early Access"

#### Week 1-2: Core UI Scaffolding
- [ ] Splash screen & onboarding flow
- [ ] Bottom navigation: Home, Seals, Incidents, Protocols, Profile
- [ ] Material 3 theme (SafetyHelp brand colors: Red #D32F2F, Yellow #FBC02D, Green #388E3C)
- [ ] Offline storage setup (Room database with mock data)

#### Week 3-4: Safety Seal Creation & Viewing
- [ ] **Create Personal Seal Screen:**
  - Form: Property name, address, emergency contacts, instructions
  - QR code preview (using ZXing library)
  - Save to device
  - Export as PDF poster (A4, print-ready)
  
- [ ] **Create Professional Seal Screen:** (UI only, payments disabled)
  - Organization details form
  - Role assignment interface
  - Induction content upload (mock)
  - Generate workplace QR
  
- [ ] **Seal Library Screen:**
  - List of user's seals
  - View/Edit/Delete actions
  - Share QR code via SMS, WhatsApp, Email

#### Week 5: Incident Reporting UI
- [ ] Incident report form (all fields)
- [ ] Photo capture/upload
- [ ] Voice recording
- [ ] GPS location picker
- [ ] Witness selector (mock data)
- [ ] Save to local database
- [ ] Incident list view (filterable by type, date)
- [ ] Incident detail view

#### Week 6: Safety Protocols Viewer
- [ ] Protocol library (pre-loaded mock PDFs)
- [ ] PDF viewer integration (Android PdfRenderer or third-party)
- [ ] Video player for induction content
- [ ] Downloadable resource section
- [ ] Search functionality

#### Week 7: Emergency Features UI
- [ ] Panic button on home screen
- [ ] Evacuation alert banner
- [ ] Emergency contacts quick dial
- [ ] "I'm Safe" status button
- [ ] Assembly point check-in (QR scan simulation)

#### Week 8: Testing & Early Access Release
- [ ] Internal testing (dogfooding)
- [ ] Fix critical bugs
- [ ] Play Store Early Access submission
- [ ] Landing page on safetyhelp-lifecv.web.app announcing Android app

**Deliverable:** Users can download, create seals, view mock protocols, submit incident reports (stored locally). No backend yet.

---

### **PHASE 2: Backend Integration & Real Data (Weeks 9-16)**
**Goal:** Connect to Firebase, sync data, enable multi-device, paid tiers

#### Week 9-10: Firebase Setup
- [ ] Firebase project creation: `safetyhelp-android`
- [ ] Authentication integration (Email/Password, Google, Guest)
- [ ] Firestore database schema design:
  ```
  /organizations/{orgId}
    - name, type, sealId, adminIds, subscription
  /seals/{sealId}
    - ownerId, type, qrUrl, instructions, emergencyContacts
  /incidents/{incidentId}
    - orgId, reporterId, type, severity, location, photos[], status
  /users/{userId}
    - linkedLifeCVId, role, orgId, trustScore
  /protocols/{protocolId}
    - orgId, title, contentUrl, version, updatedAt
  ```
  
- [ ] Firebase Storage for:
  - Protocol PDFs/videos
  - Incident photos
  - Induction content
  
- [ ] Firebase Functions for:
  - Send incident email notifications
  - Calculate trust scores
  - Process payments (Stripe/PayFast integration)

#### Week 11-12: Sync Engine
- [ ] SyncManager service (similar to LifeSync)
- [ ] Offline-to-online incident sync
- [ ] Conflict resolution (last-write-wins for most; manual for incidents)
- [ ] Background WorkManager jobs
- [ ] Sync status UI indicators

#### Week 13: User Accounts & LifeCV Linking
- [ ] **Guest-to-Registered Migration:**
  - Prompt: "Register to save your data across devices"
  - Transfer local seals/incidents to cloud
  - Link to existing LifeCV profile (if user already registered on LifeSync)
  
- [ ] **LifeCV Integration API:**
  - Fetch user's certifications, work history
  - Display trust score on profile
  - Allow Safety Officers to showcase credentials

#### Week 14: Payment Integration
- [ ] Subscription tiers UI
- [ ] PayFast payment gateway (South African)
- [ ] Stripe (international)
- [ ] Free tier limits enforcement:
  - Max 1 personal seal
  - No cloud sync
  - Basic features only
- [ ] Upgrade prompts

#### Week 15: Role-Based Access Control
- [ ] Admin dashboard for Safety Officers
- [ ] Role assignment (Warden, First Aider, Committee Member)
- [ ] Permission checks throughout app
- [ ] Multi-site management (for enterprises)

#### Week 16: Testing & Full Release
- [ ] Beta testing with real organizations (3-5 pilot companies)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Play Store full release

**Deliverable:** Fully functional, cloud-synced app with payment system, multi-user organizations, real incident tracking.

---

### **PHASE 3: Mesh Networking & Advanced Features (Weeks 17-24)**
**Goal:** Offline emergency communication, mesh chat, advanced analytics

#### Week 17-18: Bluetooth Mesh Communication
- [ ] BLE GATT service for SafetyHelp
- [ ] Peer discovery within buildings
- [ ] Store-and-forward message routing
- [ ] Emergency message priority queue
- [ ] Encryption (same as LifeSync mesh protocol)

#### Week 19: WiFi Direct Integration
- [ ] Automatic mesh upgrade to WiFi Direct when available
- [ ] Higher bandwidth for photo sharing in incident reports
- [ ] Local content server (router hub support)

#### Week 20: Emergency Group Channels
- [ ] Building-wide emergency channel (all employees auto-joined during alert)
- [ ] OHS Committee private channel
- [ ] Department-specific channels
- [ ] Message types: Text, location pin, status update, photo

#### Week 21-22: Advanced Analytics Dashboard
- [ ] **For Safety Officers:**
  - Incident trends (charts, graphs)
  - Compliance metrics (induction completion %, drill participation)
  - Heat maps (incident hotspots)
  - Predictive analytics (flagging high-risk areas)
  
- [ ] **Export Formats:**
  - PDF reports
  - Excel spreadsheets
  - Integration with SHEQ software (API hooks)

#### Week 23: Community Features
- [ ] **Street/Neighborhood Safety:**
  - Households form community safety group
  - Shared emergency contacts (community watch, police, ambulance)
  - Incident reports visible to all members (opt-in)
  - Community meetings scheduling
  
- [ ] **Trust-Based Trainer Directory:**
  - Safety trainers/consultants create public profiles
  - Organizations search and book consultations
  - Reviews and ratings post-service

#### Week 24: Polish & Optimization
- [ ] Accessibility audit (TalkBack, large text, contrast)
- [ ] Battery optimization for background mesh
- [ ] Localization (11 South African languages)
- [ ] App size reduction (dynamic feature modules)

**Deliverable:** Fully offline-capable emergency communication system, advanced analytics, community safety features.

---

### **PHASE 4: Future Enhancements (Post-Launch)**
- Wearable device support (smartwatches for panic button)
- IoT integration (connect to building sensors: smoke detectors, gas leaks)
- AR evacuation routes (point phone camera, see arrows overlaid)
- Voice assistant ("SafetyBot: What do I do if there's a chemical spill?")
- Gamification (safety challenges, leaderboards)
- Integration with national emergency services (direct 911/10111 alerts)

---

## Technical Architecture

### Platform
- **Language:** Kotlin
- **UI Framework:** Jetpack Compose
- **Min SDK:** 26 (Android 8.0 - covers 95%+ of devices)
- **Target SDK:** 36 (Android 15)

### Architecture Pattern
- **MVVM** with Clean Architecture
- **Repository Pattern** for data abstraction
- **Hilt/Dagger** for dependency injection
- **Unidirectional Data Flow** (UDF)

### Local Storage
- **Room Database** (SQLite)
- **Entities:**
  - `SafetySeal`
  - `Incident`
  - `Protocol`
  - `Organization`
  - `User`
  - `Role`
  - `EmergencyAlert`
  - `MeshMessage`

### Backend Services
- **Firebase Authentication** (Email, Google, Guest)
- **Firestore** (real-time database)
- **Firebase Storage** (files)
- **Firebase Functions** (serverless logic)
- **Firebase Crashlytics** (error tracking)
- **Firebase Analytics** (usage metrics)

### Third-Party Libraries
- **QR Code:** ZXing (com.google.zxing:core:3.5.3)
- **PDF Generation:** iText or Android PdfDocument
- **PDF Viewing:** AndroidPdfViewer or built-in PdfRenderer
- **Video Playback:** ExoPlayer
- **Image Loading:** Coil
- **Networking:** Retrofit + OkHttp
- **Payment:** PayFast SDK, Stripe Android SDK
- **Mesh:** Custom BLE/WiFi Direct implementation (reuse LifeSync code)
- **Maps:** Google Maps SDK (for incident location picker)
- **Camera:** CameraX (for photos in incident reports)

---

## Data Models

### SafetySeal
```kotlin
@Entity(tableName = "safety_seals")
data class SafetySeal(
    @PrimaryKey val sealId: String = UUID.randomUUID().toString(),
    val ownerId: String, // userId or orgId
    val ownerType: SealOwnerType, // PERSONAL, ORGANIZATION, EVENT
    val sealType: SealType, // PERMANENT, DYNAMIC, TEMPORARY
    val displayName: String,
    val propertyType: String?, // HOME, FLAT, OFFICE, FACTORY, etc.
    val address: String,
    val gpsCoordinates: LatLng?,
    val instructions: String?,
    val emergencyContacts: List<EmergencyContact>,
    val hazardWarnings: List<String>?, // "Guard dogs", "Slippery floor"
    val qrCodeUrl: String,
    val permanentQrCode: String, // base64 encoded image
    val dynamicQrCode: String?,
    val nfcTagId: String?,
    val inductionVideoUrl: String?,
    val protocolPdfUrls: List<String>,
    val isActive: Boolean = true,
    val isProfessional: Boolean = false, // true if paid tier
    val createdAt: Long = System.currentTimeMillis(),
    val expiresAt: Long? = null,
    val lastModifiedAt: Long = System.currentTimeMillis()
)

enum class SealOwnerType { PERSONAL, ORGANIZATION, EVENT }
enum class SealType { PERMANENT, DYNAMIC, TEMPORARY }

data class EmergencyContact(
    val name: String,
    val role: String, // "Owner", "Property Manager", "Security"
    val phone: String,
    val email: String? = null,
    val isPrimary: Boolean = false
)
```

### Incident
```kotlin
@Entity(tableName = "incidents")
data class Incident(
    @PrimaryKey val incidentId: String = UUID.randomUUID().toString(),
    val organizationId: String?,
    val sealId: String?,
    val reporterId: String,
    val reporterName: String,
    val isAnonymous: Boolean = false,
    val incidentType: IncidentType,
    val severity: Severity,
    val title: String,
    val description: String,
    val location: LatLng?,
    val locationDescription: String?, // "Workshop Floor 2, near lathe machine"
    val photoUrls: List<String> = emptyList(),
    val voiceRecordingUrl: String? = null,
    val witnessIds: List<String> = emptyList(),
    val immediateActions: String?,
    val status: IncidentStatus = IncidentStatus.REPORTED,
    val assignedToUserId: String? = null,
    val investigationNotes: String? = null,
    val correctiveActions: String? = null,
    val reportedAt: Long = System.currentTimeMillis(),
    val acknowledgedAt: Long? = null,
    val resolvedAt: Long? = null,
    val isSynced: Boolean = false
)

enum class IncidentType {
    SAFETY, SECURITY, HEALTH, PROPERTY_DAMAGE, ENVIRONMENTAL, NEAR_MISS, OTHER
}

enum class Severity {
    MINOR, MODERATE, SERIOUS, CRITICAL
}

enum class IncidentStatus {
    REPORTED, ACKNOWLEDGED, UNDER_INVESTIGATION, ACTION_TAKEN, RESOLVED, CLOSED
}
```

### Organization
```kotlin
@Entity(tableName = "organizations")
data class Organization(
    @PrimaryKey val orgId: String = UUID.randomUUID().toString(),
    val orgName: String,
    val orgType: OrgType,
    val address: String,
    val sealId: String,
    val adminUserIds: List<String>,
    val safetyOfficerId: String?,
    val subscriptionTier: SubscriptionTier,
    val subscriptionExpiresAt: Long?,
    val numberOfEmployees: Int,
    val industry: String?, // "Manufacturing", "Retail", "Healthcare"
    val companyRegistrationNumber: String?,
    val createdAt: Long = System.currentTimeMillis(),
    val isActive: Boolean = true
)

enum class OrgType {
    SMALL_BUSINESS, SCHOOL, HOSPITAL, FACTORY, OFFICE, GOVERNMENT, NGO, OTHER
}

enum class SubscriptionTier {
    FREE_PERSONAL, COMMUNITY, SMALL_BUSINESS, MEDIUM_ORG, ENTERPRISE
}
```

### Role
```kotlin
@Entity(tableName = "roles")
data class Role(
    @PrimaryKey val roleId: String = UUID.randomUUID().toString(),
    val userId: String,
    val organizationId: String,
    val roleType: RoleType,
    val permissions: List<Permission>,
    val assignedBy: String,
    val assignedAt: Long = System.currentTimeMillis(),
    val isActive: Boolean = true
)

enum class RoleType {
    EMPLOYER, SAFETY_OFFICER, OHS_COMMITTEE_MEMBER, FIRE_WARDEN,
    FIRST_AIDER, SECURITY, EMPLOYEE, VISITOR, CONTRACTOR
}

enum class Permission {
    VIEW_PROTOCOLS, REPORT_INCIDENT, VIEW_ALL_INCIDENTS,
    MANAGE_SEALS, ASSIGN_ROLES, TRIGGER_EVACUATION,
    ACCESS_ANALYTICS, MANAGE_TRAINING, APPROVE_INCIDENTS
}
```

---

## User Flows

### Flow 1: Homeowner Creates Personal Safety Seal
1. **Open App** → Welcome screen (no registration required)
2. **Tap "Create Your Safety Seal"** → Guest account auto-created
3. **Select Seal Type** → "Personal Property"
4. **Fill Form:**
   - Property name: "123 Main Street"
   - Address: Auto-fill via Google Places API
   - Emergency contacts: Add 2-3 (name, phone, role)
   - Instructions: "Deliveries to side gate; beware of dog in front yard"
5. **Preview QR Code** → Shows seal page mockup
6. **Save** → Stored locally
7. **Export Options:**
   - Download as PDF poster
   - Share QR via WhatsApp to family/friends
   - Print physical copy for gate

**Result:** QR code is scannable; anyone who scans sees instructions and emergency contacts.

---

### Flow 2: Small Business Owner Sets Up Workplace Seal (Paid Tier)
1. **Open App** → Sign in with email (or register)
2. **Navigate to "Professional Services"** → Prompted to upgrade
3. **Select Plan:** "Small Business (R200/month)"
4. **Payment:** Enter card details → PayFast processes
5. **Create Organization Profile:**
   - Business name: "Dr. Smith's Dental Practice"
   - Type: "Healthcare"
   - Address, phone, email
6. **Create Workplace Seal:**
   - Upload logo
   - Add emergency contacts (reception, security, ambulance)
   - Upload safety induction PDF ("Infection Control Procedures")
   - Record safety video (optional, using in-app camera)
7. **Assign Roles:**
   - Dr. Smith: Safety Officer
   - Receptionist: First Aider
   - Cleaner: Employee
8. **Generate QR Code** → Permanent seal created
9. **Print & Display:** QR poster at entrance

**Result:** Patients scan QR at entrance, view induction video, check in as visitor. Staff access protocols anytime via app.

---

### Flow 3: Employee Reports Incident
1. **Employee is at work** → Notices chemical spill
2. **Opens SafetyHelp App** → Taps "Report Incident" (quick access button)
3. **Fills Form:**
   - Type: "Environmental"
   - Severity: "Serious"
   - Description: "5L of solvent spilled near storage room"
   - Photos: Takes 2 photos with phone camera
   - Location: GPS auto-captured, pins exact spot on map
   - Immediate actions: "Area cordoned off with caution tape"
4. **Submit:**
   - If online: Sent to Safety Officer immediately
   - If offline: Stored locally, queued for sync; broadcasts to nearby mesh devices
5. **Safety Officer Receives Alert:**
   - Push notification: "New incident reported by John Doe"
   - Opens incident details in app
   - Assigns to Maintenance Manager for cleanup
6. **Employee Sees Status Update:**
   - "Under Investigation" → "Action Taken: Spill cleaned, ventilation improved" → "Resolved"

**Result:** Incident documented, appropriate actions taken, compliance maintained.

---

### Flow 4: Emergency Evacuation (Building Fire)
1. **Fire Alarm Triggered** → Smoke detected
2. **Fire Warden Opens App** → Taps "Emergency Evacuation"
3. **Confirmation Dialog:** "Send building-wide alert?"
4. **Tap "Confirm":**
   - All employees receive push notification: "EVACUATE NOW"
   - App plays loud alarm sound
   - Shows map with evacuation routes highlighted
   - Countdown timer starts (for tracking evacuation speed)
5. **Employees Exit Building:**
   - Follow routes on app
   - Arrive at Assembly Point A
6. **Assembly Point Check-In:**
   - Physical QR code sign at assembly point
   - Employees scan to confirm presence
   - App marks them "Accounted For"
7. **Fire Warden Views Dashboard:**
   - Real-time headcount: 48/50 employees checked in
   - Missing: Jane Doe (last seen: 2nd floor) & Mike Smith (unknown)
   - Fire Warden dispatches search team to 2nd floor
8. **All Accounted For:**
   - Fire Warden marks evacuation complete
   - App logs evacuation time: 4 minutes 32 seconds
   - Post-drill report generated automatically

**Result:** Fast, organized evacuation; all personnel accounted for; data for improving future drills.

---

### Flow 5: Visitor Scans Workplace Seal (Offline Mesh Scenario)
**Context:** Factory in remote area; internet down due to storm

1. **Visitor Arrives at Gate** → Scans QR code on sign
2. **App Opens (Offline Mode):**
   - Cached safety induction loads from device storage
   - Video plays: "Welcome to ABC Manufacturing"
3. **Visitor Watches 3-Minute Video:**
   - PPE requirements (hard hat, safety boots)
   - Restricted areas (red zones)
   - Emergency assembly point locations
4. **Acknowledgment:** Taps "I Understand"
5. **Digital Visitor Badge:** Displayed on lock screen
6. **Mesh Network Join:**
   - App connects to factory's WiFi Direct network (broadcast by on-site router)
   - Visitor can now send messages to Security Office via mesh
7. **During Visit:**
   - Visitor needs help → Opens mesh chat → Types "Lost, where is conference room B?"
   - Security responds via mesh: "2nd floor, turn left after stairs"
8. **Check-Out:**
   - Visitor scans exit QR
   - App disconnects from mesh
   - Visit log stored locally, syncs to cloud when internet returns

**Result:** Full visitor management and communication without internet.

---

## Integration with LifeSync

### Master-Subsidiary Relationship
- **LifeSync = Master App** (hub for entire ecosystem)
- **SafetyHelp = Subsidiary App** (specialized for OHS)

### Data Sharing
1. **User Authentication:**
   - Single sign-on: User logs into LifeSync → automatically authenticated in SafetyHelp
   - Shared Firebase Auth UID
   
2. **LifeCV Integration:**
   - SafetyHelp fetches user's professional credentials from LifeSync database
   - Safety Officer's certifications displayed in SafetyHelp
   - Trust score calculated in LifeSync, displayed in SafetyHelp
   
3. **Trust System:**
   - SafetyHelp incident resolutions contribute to user's LifeScore
   - Ratings from employees/clients posted to LifeSync trust system
   
4. **Contact Management:**
   - Emergency contacts added in SafetyHelp auto-sync to LifeSync
   - LifeSync family tree includes workplace colleagues (if user chooses)
   
5. **Mesh Network:**
   - SafetyHelp devices join LifeSync's master mesh protocol
   - Cross-app messaging: Emergency alert from SafetyHelp visible in LifeSync
   
6. **Notifications:**
   - Unified notification system across all ecosystem apps
   - User can control preferences in LifeSync settings

### Deep Linking
- **From LifeSync to SafetyHelp:**
  - User taps "Workplace Safety" in LifeSync → opens SafetyHelp app (or installs if missing)
  
- **From SafetyHelp to LifeSync:**
  - User taps "View LifeCV Profile" → opens LifeSync profile screen
  - User taps "Trust Score Details" → opens LifeSync Trust System

### Shared Components (Code Reuse)
- **TrustScoreCalculator** (from LifeSync)
- **MeshNetworkService** (BLE/WiFi Direct logic)
- **QRCodeGenerator** (same library, same styling)
- **OfflineSyncManager** (sync queue, conflict resolution)
- **CryptoManager** (encryption for mesh messages)

---

## Offline-First & Mesh Features

### Offline Capabilities (No Internet Required)
1. **View Safety Protocols:** All PDFs/videos cached after first download
2. **Report Incidents:** Stored locally, queued for sync
3. **Scan QR Codes:** Works offline; loads cached seal page
4. **Check In/Out:** Logged locally
5. **Emergency Alerts:** Broadcast via Bluetooth mesh
6. **Access Training Materials:** Pre-downloaded content

### Mesh Network Use Cases
1. **Factory Floor Communication:**
   - Supervisors broadcast safety alerts to all workers
   - Workers report hazards via mesh chat
   - No need for cell coverage in metal buildings
   
2. **Stadium Events:**
   - 50,000 attendees; cell towers congested
   - Event organizers use mesh to coordinate security
   - Medical team receives injury reports via mesh
   
3. **Rural Clinics:**
   - Limited internet connectivity
   - Clinic staff access protocols offline
   - Incidents sync when mobile data becomes available
   
4. **Disaster Response:**
   - Earthquake damages infrastructure
   - Rescue workers use mesh to communicate
   - Survivors report location via mesh broadcast

### Mesh Protocol (Technical)
- **Discovery:** BLE advertisements every 5 seconds
- **Pairing:** QR code trust bootstrap (first-time users)
- **Message Format:**
  ```json
  {
    "messageId": "uuid",
    "senderId": "userId",
    "recipientId": "userId_or_broadcast",
    "type": "emergency_alert|chat|incident_report",
    "payload": "encrypted_content",
    "timestamp": 1696579200,
    "hopCount": 2,
    "maxHops": 6,
    "priority": 1  // 1=critical, 5=normal
  }
  ```
- **Routing:** Epidemic with hop limit; deduplication via message ID cache
- **Encryption:** XChaCha20-Poly1305 (same as LifeSync)

---

## UI/UX Guidelines

### Brand Colors
- **Primary:** Safety Red (#D32F2F) - for warnings, emergency buttons
- **Secondary:** Caution Yellow (#FBC02D) - for alerts, pending actions
- **Success:** Safety Green (#388E3C) - for completed tasks, "I'm Safe" status
- **Background:** Light Grey (#F5F5F5)
- **Text:** Dark Grey (#212121)

### Typography
- **Headings:** Roboto Bold
- **Body:** Roboto Regular
- **Emphasis:** Roboto Medium
- **Code/Identifiers:** Roboto Mono

### Iconography
- **Home:** Safety helmet icon
- **Seals:** Shield with checkmark
- **Incidents:** Warning triangle
- **Protocols:** Document icon
- **Emergency:** Red alarm bell (animated pulse)

### Key Screens

#### Home Screen
```
┌─────────────────────────────────┐
│  SafetyHelp        [Menu] [🔔]  │
├─────────────────────────────────┤
│                                 │
│  [EMERGENCY BUTTON - Large Red] │
│      Hold for 3s to activate    │
│                                 │
├─────────────────────────────────┤
│  Quick Actions:                 │
│  [📋 Report Incident]           │
│  [📄 View Protocols]            │
│  [✅ Check In]                  │
├─────────────────────────────────┤
│  Recent Activity:               │
│  • Incident #1234 - Resolved   │
│  • Fire Drill - Completed       │
│  • Training Due - 2 days        │
└─────────────────────────────────┘
```

#### Create Seal Screen
```
┌─────────────────────────────────┐
│  ← Create Safety Seal           │
├─────────────────────────────────┤
│  Property Name                  │
│  [123 Main Street__________]    │
│                                 │
│  Address                        │
│  [Auto-complete__________] 📍   │
│                                 │
│  Emergency Contacts             │
│  • John Doe (Owner) 082...      │
│  • Security Company 087...      │
│  [+ Add Contact]                │
│                                 │
│  Instructions                   │
│  [Deliveries to side gate...]   │
│                                 │
│  [Preview QR Code]              │
│  [Save & Generate Seal]         │
└─────────────────────────────────┘
```

#### Incident Report Screen
```
┌─────────────────────────────────┐
│  ← Report Incident              │
├─────────────────────────────────┤
│  Type: [Safety ▼]               │
│  Severity: ⚫⚫⚫⚪⚪ Serious      │
│                                 │
│  Description                    │
│  [Chemical spill near...]       │
│                                 │
│  Photos (2)                     │
│  [📷][📷]  [+ Add Photo]        │
│                                 │
│  Location                       │
│  📍 Workshop Floor 2            │
│  [View on Map]                  │
│                                 │
│  Witnesses                      │
│  • Jane Doe (Selected)          │
│  [+ Add Witness]                │
│                                 │
│  [Submit Report]                │
└─────────────────────────────────┘
```

### Accessibility Considerations
- **Minimum Touch Target:** 48dp × 48dp
- **Contrast Ratio:** Minimum 4.5:1 (text to background)
- **Screen Reader Support:** All buttons labeled with contentDescription
- **Font Scaling:** Supports system font size settings (up to 200%)
- **Offline Indicator:** Persistent banner when no connectivity
- **Mesh Status:** Icon shows peer count (e.g., "🔗 3 peers connected")

---

## Document Compilation & Reporting System

### Overview
SafetyHelp implements a comprehensive document generation system that creates professional, compliant reports for all safety activities. The system follows the SafetyHelp Master Specification Guide for Reports (v2.0) and integrates with the LifeCV engine for user verification and trust scoring.

### Supported Document Types
- Health and Safety Specifications
- Health and Safety Plans
- Risk Assessments
- Incident Reports (Private + Public Ledger)
- Compliance Reports
- Training Guides & Career Pathway Reports
- Audit Reports (Inspections & Audits)
- Legal Appointment Letters
- Health and Safety Files
- Meeting Minutes and Agendas
- Emergency Response Plans
- Evacuation Plans
- OHS Bulletins
- Public Incident Ledger Summaries
- Corrective Action & Resolution Reports

### Document Structure Standards

#### Multi-Page Documents
1. **Cover Page**
   - Document Title, Reference Number (e.g., SHP-INCIDENT-2025-001)
   - Date of Issue, Project/Site/Entity Name
   - Client/Company/Entity Name, Client Contact Details
   - Compiled By (LifeCV autofilled), Contractor Details
   - User Logo, SafetyHelp Logo, Watermark (branding dependent)
   - LifeCV trust badge for verified users

2. **Table of Contents** (Auto-generated)
3. **Introduction** (Purpose, Regulatory references, Scope)
4. **Compiled By Details** (LifeCV profile data)
5. **Revision History** (Table format)
6. **Content-Specific Sections** (Dynamic per document type)
7. **Signature Page** (Digital signatures supported)
8. **Appendices** (Checklists, evidence, trackers)
9. **Back Page** (About SafetyHelp services)

#### Single-Page Documents
- Omit Cover, TOC, Revision History, Appendices
- Retain Header, Footer, Signature

### Branding Levels

#### Heavily Branded (Free)
- Watermark: "SafetyHelp" (30% opacity)
- Header: SafetyHelp logo + user logo/name
- Footer: "Powered by SafetyHelp" (bold)
- Back Page: Mandatory

#### Lightly Branded (Paid)
- Watermark: "SafetyHelp" (10% opacity)
- Header: User logo/name only
- Footer: "Powered by SafetyHelp" (italicized)
- Back Page: Mandatory

#### No Branding (Subscribers)
- Watermark: None
- Header: User logo/name only
- Footer: "Powered by SafetyHelp" (italicized)
- Back Page: Optional

### Technical Implementation

#### PDF Generation
- **Format:** LaTeX → PDF (via pdfkit)
- **Font:** Noto Serif, 11pt, multilingual support
- **Packages:** geometry, fancyhdr, draftwatermark, tocbibind, tabularx, booktabs, graphicx, hyperref, noto, ifthen
- **Engine:** PDFLaTeX with texlive-full and texlive-fonts-extra

#### Header/Footer Standards
- **Header:** Reference Number (left), User Logo/Company (center), Compiled By (right)
- **Footer:** "Powered by SafetyHelp | Safety Personalized, Compliance Simplified" (left), Contact info (center), Page Number (right)
- **Disclaimer:** "This document is generated by SafetyHelp for OHS compliance. Verify applicability with local regulations."

#### API Integration
- **Endpoints:**
  - `/api/incidents` (incident reports)
  - `/api/audits` (inspections & audits)
  - `/api/meetings` (minutes & agendas)
  - `/api/public-ledger` (public incidents)
  - `/api/users` (LifeCV profiles, trust scores)
- **Logo Handling:** User uploads via `/api/users/upload-logo`, stored in S3
- **Metadata:** Title, author ("SafetyHelp"), date, reference number, trust tier

#### Template System
- **Storage:** `/safetyhelp/assets/templates/`
- **Templates:** `incident-report-template.tex`, `audit-report-template.tex`, etc.
- **Dynamic Content:** Sections adjust based on API data
- **Flexibility:** Content sections populated from database entities

### Android Implementation

#### Wizard-Based Generation
All document generation flows through guided wizards that:
1. Collect required data through step-by-step forms
2. Validate inputs against regulatory requirements
3. Generate preview before final PDF creation
4. Store generated documents locally and sync to cloud
5. Support offline generation with cloud sync when online

#### Integration Points
- **Inspection Wizard:** Generates audit reports with checklist results
- **Incident Wizard:** Creates incident reports with evidence logs
- **Meeting Wizard:** Produces minutes and agendas
- **Risk Assessment Wizard:** Generates risk assessment documents

#### Document Storage
- **Local Storage:** PDFs stored in app directory
- **Cloud Sync:** Automatic upload to user account
- **Version Control:** Revision history tracking
- **Sharing:** QR codes for document access

### LifeCV Integration
- **User Verification:** All documents include compiler's LifeCV profile
- **Trust Scoring:** Trust tier displayed on documents
- **Digital Signatures:** LifeCV-verified signatures
- **Profile Data:** Auto-populated compiler details (name, role, SACPCMP number, contact info)

---

## Success Metrics

### KPIs for Personal Use (Free Tier)
- Downloads: 10,000 in first 3 months
- Active seals: 5,000 (50% activation rate)
- Daily active users (DAU): 1,000
- QR scans per day: 500

### KPIs for Professional Use (Paid Tier)
- Paying organizations: 100 in first 6 months
- Incident reports per month: 2,000
- Average resolution time: <48 hours
- Training completion rate: >90%
- Evacuation drill participation: >95%
- Customer retention: >80% annual renewal

### Trust System Metrics
- Safety professionals with profiles: 200
- Average trust score: 75/100
- Reviews per professional: 15
- Booking conversion rate: 30% (from profile view to consultation)

---

## Compliance & Legal

### South African OHS Act Compliance
- **Section 8:** Employers must provide safe workplace
- **Section 9:** Duty to non-employees (visitors, contractors)
- **Section 37(2):** Mandatory incident recording
- **SafetyHelp ensures:**
  - Digital incident log (tamper-proof timestamps)
  - Induction training tracking (auditable)
  - Evacuation drills documented
  - OHS committee meeting minutes

### Data Protection (POPIA Compliance)
- **Consent:** Users explicitly consent to data collection
- **Purpose Limitation:** Data used only for safety purposes
- **Retention:** Incident records kept for 5 years (legal requirement)
- **Access Rights:** Users can download/delete their data
- **Security:** Encryption at rest and in transit

### Disclaimers
- **Not a Substitute:** App does not replace professional safety audits
- **Emergency Services:** In life-threatening situations, always call 10111/112
- **Accuracy:** Users responsible for accuracy of information in seals

---

## Future Roadmap

### Version 2.0 (Q2 2026)
- Desktop web dashboard for Safety Officers
- Integration with biometric time clocks
- AI-powered hazard detection (computer vision on incident photos)
- Multilingual voice assistant

### Version 3.0 (Q4 2026)
- Smartwatch app (panic button on wrist)
- IoT sensor integration (smoke, CO2, temperature)
- Blockchain-based incident audit trail (immutable records)
- Government partnership (link to Dept of Employment & Labour systems)

---

## Appendix: Marketing Taglines

**For Homeowners:**
"Your Home. Your Rules. Your Safety Seal."

**For Businesses:**
"Compliance Made Simple. Safety Made Smart."

**For Events:**
"Every Event Deserves a Safety Net."

**Overall Brand:**
"SafetyHelp - Because Everyone Deserves to Feel Safe."

---

**END OF SAFETYHELP ANDROID APP SPECIFICATION**

---

## Approval & Sign-Off

**Prepared By:** GitHub Copilot AI Assistant  
**Reviewed By:** Salatiso (Founder)  
**Date:** October 6, 2025  
**Status:** ✅ APPROVED FOR DEVELOPMENT

**Next Steps:**
1. Review and approve this specification
2. Proceed with Phase 1, Week 1 development
3. Daily stand-ups to track progress
4. Weekly demos of completed features

---
