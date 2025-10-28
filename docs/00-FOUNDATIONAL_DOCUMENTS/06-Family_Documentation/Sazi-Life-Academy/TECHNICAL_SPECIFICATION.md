# LifeSync Android Application - Technical Specification
**Version:** 1.0.0  
**Last Updated:** October 5, 2025  
**Project:** LifeSync - Personal Life Management & Professional CV Platform

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Core Modules](#core-modules)
5. [Data Layer](#data-layer)
6. [UI Layer](#ui-layer)
7. [Authentication & Security](#authentication--security)
8. [Offline-First Architecture](#offline-first-architecture)
9. [Feature Specifications](#feature-specifications)
10. [API & Integration](#api--integration)
11. [Performance & Optimization](#performance--optimization)
12. [Testing Strategy](#testing-strategy)
13. [Deployment](#deployment)

---

## Executive Summary

### Project Overview
LifeSync is a comprehensive Android application that combines professional CV management (LifeCV), family tree tracking, peer-to-peer mesh networking, contact management, and location-based services. The app is built using modern Android development practices with Jetpack Compose, Room database, Firebase backend, and Hilt dependency injection.

### Key Features
- **LifeCV**: Digital resume/CV builder with skills, education, work experience, publications, awards, certifications, and trust scoring
- **Contact Management**: Comprehensive workflow for adding individual contacts, households, and communities with geolocation support
- **Family Tree**: Visual family relationship mapping with merge conflict resolution
- **Mesh Chat**: Offline-capable peer-to-peer messaging using local network
- **Offline-First**: Full functionality without internet connection, with automatic sync when online
- **Trust Score**: Verification and credibility scoring system
- **Multi-Auth**: Firebase authentication with email/password, Google Sign-In, Apple Sign-In, and guest mode

### Target Platform
- **Minimum SDK:** Android 8.0 (API 26)
- **Target SDK:** Android 15 (API 36)
- **Languages:** Kotlin
- **UI Framework:** Jetpack Compose with Material 3

---

## System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  (Jetpack Compose UI + ViewModels + Navigation)             │
├─────────────────────────────────────────────────────────────┤
│                    Domain Layer                              │
│  (Use Cases, Business Logic, Repositories)                  │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                                │
│  ┌───────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │  Local Storage│  │ Firebase Cloud │  │  Mesh Network│  │
│  │  (Room DB)    │  │ (Realtime DB)  │  │  (P2P)       │  │
│  └───────────────┘  └────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Pattern
- **MVVM (Model-View-ViewModel)** with clean architecture principles
- **Unidirectional Data Flow** (UDF)
- **Repository Pattern** for data access abstraction
- **Dependency Injection** via Hilt/Dagger

### Package Structure
```
com.salatiso.lifesync/
├── data/                           # Data layer
│   ├── auth/                       # Authentication logic
│   ├── contacts/importer/          # Contact import utilities
│   ├── local/                      # Local data persistence
│   │   ├── dao/                    # Room DAOs
│   │   ├── entity/                 # Room entities
│   │   ├── converter/              # Type converters
│   │   └── converters/             # Additional converters
│   ├── model/                      # Domain models
│   │   └── enums/                  # Enum types
│   ├── repository/                 # Repository implementations
│   └── sync/                       # Offline sync management
├── di/                             # Dependency injection modules
├── ui/                             # Presentation layer
│   ├── auth/                       # Authentication screens
│   ├── components/                 # Reusable UI components
│   ├── contacts/                   # Contact management
│   ├── home/                       # Home dashboard
│   ├── lifecv/                     # LifeCV module
│   │   ├── awards/
│   │   ├── badges/
│   │   ├── certifications/
│   │   ├── education/
│   │   ├── languages/
│   │   ├── patents/
│   │   ├── profile/
│   │   ├── projects/
│   │   ├── publications/
│   │   ├── recommendations/
│   │   ├── skills/
│   │   ├── trust/
│   │   ├── volunteer/
│   │   └── work/
│   ├── navigation/                 # Navigation graph
│   ├── onboarding/                 # Onboarding flow
│   ├── splash/                     # Splash screen
│   ├── theme/                      # Material Theme
│   └── user/                       # User profile
├── MainActivity.kt                 # Entry point activity
└── LifeSyncApplication.kt          # Application class

com.example.lifesync_android_application/  # Phase 5 features
├── data/
│   ├── local/
│   │   ├── dao/                    # Phase 5 DAOs
│   │   ├── entity/                 # Phase 5 entities
│   │   └── converters/             # Phase 5 converters
│   └── repository/                 # Phase 5 repositories
├── di/                             # Phase 5 DI modules
└── ui/
    ├── components/                 # Phase 5 components
    ├── familytree/                 # Family tree UI
    ├── lifecv/                     # Enhanced LifeCV UI
    └── meshchat/                   # Mesh networking UI
```

---

## Technology Stack

### Core Technologies
| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Language | Kotlin | Latest | Primary development language |
| UI Framework | Jetpack Compose | 2024.09.03 BOM | Declarative UI |
| Design System | Material 3 | Latest | UI components |
| DI | Hilt/Dagger | 2.52 | Dependency injection |
| Database | Room | 2.6.1 | Local persistence |
| Backend | Firebase | 34.3.0 BOM | Cloud services |
| Async | Kotlin Coroutines | 1.7.3 | Asynchronous programming |
| Navigation | Navigation Compose | 2.8.2 | In-app navigation |
| Image Loading | Coil | 2.5.0 | Async image loading |

### Firebase Services
- **Firebase Authentication**: User authentication with multiple providers
- **Firebase Realtime Database**: Cloud data storage and sync
- **Firebase Crashlytics**: Crash reporting and analytics
- **Firebase Analytics**: User behavior tracking

### Android Jetpack Components
- **Lifecycle**: ViewModel, LiveData, Lifecycle-aware components
- **Navigation**: Type-safe navigation with Compose
- **Room**: SQLite abstraction layer
- **WorkManager**: Background task scheduling
- **CameraX**: Camera functionality (v1.5.0)
- **Hilt**: Dependency injection

### Security
- **Google Tink**: Cryptographic library (v1.13.0)
- **Firebase Security Rules**: Server-side data protection

### Development Tools
- **Gradle**: Build system (Kotlin DSL)
- **KSP (Kotlin Symbol Processing)**: Annotation processing
- **ProGuard**: Code obfuscation (release builds)
- **Android Studio**: IDE

---

## Core Modules

### 1. Authentication Module
**Package:** `com.salatiso.lifesync.data.auth`

#### Components
- `AuthRepository`: Handles authentication operations
- `AuthState`: Represents authentication state (Authenticated, Unauthenticated, Loading)
- `AuthViewModel`: Manages auth UI state

#### Authentication Methods
1. **Email/Password**: Traditional email-based authentication
2. **Google Sign-In**: OAuth 2.0 with Google
3. **Apple Sign-In**: OAuth 2.0 with Apple
4. **Anonymous/Guest Mode**: Temporary offline-first access

#### Key Features
- Automatic token refresh
- Session persistence
- Password reset via email
- Email verification
- Guest-to-authenticated user migration

#### Implementation Details
```kotlin
@Singleton
class AuthRepository @Inject constructor(
    private val firebaseAuth: FirebaseAuth,
    private val localUserDao: LocalUserDao
) {
    val currentUser: Flow<FirebaseUser?>
    
    suspend fun signInWithEmail(email: String, password: String): Result<FirebaseUser>
    suspend fun signInWithGoogle(credential: AuthCredential): Result<FirebaseUser>
    suspend fun signUp(email: String, password: String): Result<FirebaseUser>
    suspend fun signOut()
    suspend fun sendPasswordResetEmail(email: String): Result<Unit>
}
```

### 2. LifeCV Module
**Package:** `com.salatiso.lifesync.ui.lifecv`

#### Purpose
Digital CV/Resume builder with blockchain-inspired trust scoring and verification system.

#### Sub-Modules
1. **Profile** (`profile/`)
   - Personal information
   - Contact details
   - Profile photo
   - Bio/summary

2. **Skills** (`skills/`)
   - Technical skills
   - Soft skills
   - Skill level (Beginner, Intermediate, Expert)
   - Years of experience

3. **Work Experience** (`work/`)
   - Job title
   - Company name
   - Employment period
   - Responsibilities
   - Achievements

4. **Education** (`education/`)
   - Degree/certification
   - Institution name
   - Graduation date
   - GPA/honors

5. **Languages** (`languages/`)
   - Language name
   - Proficiency level (Basic, Conversational, Fluent, Native)
   - Certifications

6. **Projects** (`projects/`)
   - Project name
   - Description
   - Technologies used
   - Links (GitHub, demo, etc.)

7. **Publications** (`publications/`)
   - Title
   - Publication type (Journal, Conference, Book, etc.)
   - Authors
   - Publication date
   - DOI/ISBN
   - PDF upload

8. **Awards** (`awards/`)
   - Award name
   - Issuing organization
   - Date received
   - Description

9. **Certifications** (`certifications/`)
   - Certification name
   - Issuing authority
   - Issue date
   - Expiry date
   - Credential ID

10. **Badges** (`badges/`)
    - Digital badges
    - Achievement badges
    - Verification badges

11. **Patents** (`patents/`)
    - Patent title
    - Patent number
    - Filing date
    - Status (Pending, Granted)

12. **Volunteer Experience** (`volunteer/`)
    - Organization
    - Role
    - Period
    - Activities

13. **Recommendations** (`recommendations/`)
    - Recommender name
    - Relationship
    - Recommendation text
    - Date

14. **Trust Score** (`trust/`)
    - Overall trust score (0-100)
    - Component scores
    - Verification badges
    - Trust seals

#### Database Entities
```kotlin
@Entity(tableName = "skills")
data class Skill(
    @PrimaryKey val skillId: String,
    val userId: String,
    val name: String,
    val category: String,
    val proficiency: Int,
    val yearsOfExperience: Int?,
    val lastUsed: Long?,
    val endorsements: Int = 0,
    val isVerified: Boolean = false
)

@Entity(tableName = "work_experience")
data class WorkExperience(
    @PrimaryKey val experienceId: String,
    val userId: String,
    val jobTitle: String,
    val companyName: String,
    val startDate: Long,
    val endDate: Long?,
    val isCurrent: Boolean,
    val description: String?,
    val achievements: List<String>,
    val skills: List<String>
)
```

### 3. Contact Management Module
**Package:** `com.salatiso.lifesync.ui.contacts`

#### Multi-Step Workflow
The contact workflow consists of 6 steps:

1. **Profile Review** - Verify current user profile
2. **Contacts** - Add individual contacts
3. **Households** - Group contacts into households
4. **Communities** - Create/join community groups
5. **Geolocation** - Set location boundaries
6. **Review** - Final review and submission

#### Features
- **Import Sources**:
  - Device contacts (requires permission)
  - CSV file import
  - Manual entry
  
- **Relationship Types**:
  - Family (Father, Mother, Sibling, Spouse, Child, etc.)
  - Friend
  - Colleague
  - Business
  - Romance
  - Acquaintance
  - Other

- **Household Management**:
  - Household name
  - Physical address
  - Google Maps integration
  - Coordinate parsing from Google Maps URLs
  - Members list

- **Community Features**:
  - Community types (Residential, Religious, Professional, Social, etc.)
  - Invitation system with QR codes
  - Access control (Public, Private, Restricted)
  - Member roles

- **Geolocation**:
  - Location capture via GPS
  - Google Maps link parsing
  - Boundary setting (circular or polygonal zones)
  - Zone shape selection (Circle, Rectangle, Polygon, Custom)

#### Key Components
```kotlin
@HiltViewModel
class ContactWorkflowViewModel @Inject constructor(
    private val contactDao: ContactDao,
    private val householdDao: HouseholdDao,
    private val communityDao: CommunityDao,
    private val geoZoneDao: GeoZoneDao
) : ViewModel() {
    val uiState: StateFlow<ContactWorkflowState>
    
    fun saveManualContact(contact: Contact)
    fun importDeviceContacts()
    fun importFromCsv(uri: Uri)
    fun createHousehold(household: Household)
    fun createCommunity(community: Community)
    fun captureLocation(): LatLng
}

data class Contact(
    @PrimaryKey val contactId: String,
    val userId: String,
    val firstName: String,
    val lastName: String?,
    val email: String?,
    val phone: String?,
    val relationshipType: ContactRelationshipType,
    val householdId: String?,
    val communityIds: List<String> = emptyList(),
    val birthday: Long?,
    val notes: String?,
    val importSource: ImportSource,
    val photoUrl: String?,
    val isFavorite: Boolean = false,
    val tags: List<String> = emptyList(),
    val createdAt: Long,
    val updatedAt: Long
)
```

### 4. Family Tree Module
**Package:** `com.example.lifesync_android_application.ui.familytree`

#### Features
- Visual family tree graph
- Add family members with relationships
- Clan name system (3 names: personal, patronymic, matrilineal)
- Generational tracking
- Family lineage (Patrilineal, Matrilineal, Both)
- Merge conflict resolution for duplicate entries
- Export/import family data

#### Database Schema
```kotlin
@Entity(tableName = "family_members")
data class FamilyMemberEntity(
    @PrimaryKey val memberId: String,
    val userId: String,
    val firstName: String,
    val clanName: ClanName,
    val gender: String,
    val birthDate: Long?,
    val deathDate: Long?,
    val isAlive: Boolean,
    val parentIds: List<String>,
    val spouseIds: List<String>,
    val generation: Int,
    val lineage: FamilyLineage,
    val photoUrl: String?,
    val bio: String?,
    val createdAt: Long,
    val updatedAt: Long
)

data class ClanName(
    val personalName: String,
    val patronymicName: String?,
    val matrilinealName: String?
)
```

### 5. Mesh Chat Module
**Package:** `com.example.lifesync_android_application.ui.meshchat`

#### Purpose
Peer-to-peer messaging that works without internet using local WiFi or Bluetooth.

#### Features
- Peer discovery (local network scanning)
- Offline messaging
- Emergency broadcast mode
- Message encryption
- Read receipts
- Typing indicators
- File sharing (future)

#### Architecture
```kotlin
@Entity(tableName = "peer_devices")
data class PeerDeviceEntity(
    @PrimaryKey val peerId: String,
    val deviceName: String,
    val ipAddress: String,
    val port: Int,
    val isOnline: Boolean,
    val lastSeen: Long,
    val publicKey: String?
)

@Entity(tableName = "mesh_messages")
data class MessageEntity(
    @PrimaryKey val messageId: String,
    val senderId: String,
    val receiverId: String,
    val content: String,
    val timestamp: Long,
    val state: MessageState, // SENDING, SENT, DELIVERED, READ, FAILED
    val isEmergency: Boolean = false,
    val encryptedContent: String?
)

@Singleton
class MeshNetworkRepository @Inject constructor(
    private val peerDeviceDao: PeerDeviceDao,
    private val messageDao: MessageDao
) {
    fun discoverPeers(): Flow<List<PeerDeviceEntity>>
    suspend fun sendMessage(message: MessageEntity): Result<Unit>
    suspend fun broadcastEmergency(message: String)
}
```

### 6. Sync Manager
**Package:** `com.salatiso.lifesync.data.sync`

#### Purpose
Manages offline-first architecture with automatic cloud synchronization.

#### Features
- Network connectivity monitoring
- Offline action queuing
- Automatic sync when online
- Conflict resolution
- Sync progress tracking
- Last sync timestamp

#### Implementation
```kotlin
@Singleton
class SyncManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val firebaseAuth: FirebaseAuth,
    private val firebaseDatabase: FirebaseDatabase,
    private val localUserDao: LocalUserDao,
    private val offlineActionDao: OfflineActionDao
) {
    val isOnline: StateFlow<Boolean>
    val isSyncing: StateFlow<Boolean>
    val syncProgress: StateFlow<Float>
    val pendingActionsCount: StateFlow<Int>
    
    suspend fun performFullSync()
    suspend fun syncPendingActions()
    suspend fun syncCurrentUser()
}

@Entity(tableName = "offline_actions")
data class OfflineAction(
    @PrimaryKey val actionId: String,
    val userId: String,
    val actionType: String, // CREATE, UPDATE, DELETE
    val entityType: String, // CONTACT, HOUSEHOLD, etc.
    val entityId: String,
    val jsonData: String,
    val timestamp: Long,
    val syncAttempts: Int = 0,
    val lastAttempt: Long? = null,
    val errorMessage: String? = null
)
```

---

## Data Layer

### Room Database
**Class:** `LifeSyncDatabase`  
**Version:** 6  
**Export Schema:** Yes

#### Entity Categories

##### 1. User & Profile Entities
- `UserProfile` - User account information
- `LocalUser` - Offline cached user data
- `TrustSeal` - Trust verification seals
- `TrustScoreComponent` - Trust score breakdown

##### 2. Contact Entities
- `Contact` - Individual contacts
- `Household` - Household groups
- `Community` - Community groups
- `CommunityInvitation` - Community invitations
- `GeoZone` - Geographic boundaries
- `AttendanceEvent` - Location-based attendance

##### 3. LifeCV Entities
- `Skill` - Skills
- `WorkExperience` - Work history
- `Education` - Educational background
- `Certification` - Certifications
- `Language` - Languages
- `Project` - Projects
- `Publication` - Publications
- `Award` - Awards
- `Badge` - Achievement badges
- `IntellectualProperty` - Patents/IP
- `VolunteerExperience` - Volunteer work
- `Recommendation` - Recommendations

##### 4. Messaging Entities
- `Message` - User messages
- `MessageEntity` - Mesh network messages

##### 5. Sync Entities
- `OfflineAction` - Pending sync actions
- `CacheData` - Cached API responses
- `SyncStatus` - Sync state tracking

##### 6. Phase 5 Entities
- `LifeCVEntity` - Complete CV documents
- `FamilyMemberEntity` - Family tree members
- `PeerDeviceEntity` - Mesh network peers

#### Type Converters
```kotlin
@TypeConverter
class Converters {
    // Safe coordinate parsing (prevents crashes)
    @TypeConverter
    fun toLatLng(value: String?): LatLng? {
        if (value.isNullOrBlank()) return null
        val parts = value.split(",")
        if (parts.size != 2) return null
        val lat = parts[0].toDoubleOrNull() ?: return null
        val lon = parts[1].toDoubleOrNull() ?: return null
        return LatLng(lat, lon)
    }
    
    @TypeConverter
    fun fromList(list: List<String>?): String? = list?.joinToString(",")
    
    @TypeConverter
    fun toList(value: String?): List<String>? = value?.split(",")?.filter { it.isNotBlank() }
}
```

### Firebase Realtime Database Structure
```
lifesync/
├── users/
│   └── {userId}/
│       ├── profile/
│       ├── contacts/
│       ├── households/
│       ├── communities/
│       └── lifecv/
├── communities/
│   └── {communityId}/
│       ├── info/
│       ├── members/
│       └── invitations/
└── sync/
    └── {userId}/
        └── pending_actions/
```

---

## UI Layer

### Navigation Graph
**File:** `Navigation.kt`

#### Routes
```kotlin
sealed class Screen(val route: String) {
    // Auth & Onboarding
    object Splash : Screen("splash")
    object Welcome : Screen("welcome")
    object SignIn : Screen("signin")
    object SignUp : Screen("signup")
    object Onboarding : Screen("onboarding")
    
    // Main App
    object Home : Screen("home")
    object Settings : Screen("settings")
    
    // LifeCV
    object LifeCV : Screen("lifecv")
    object LifeCVProfile : Screen("lifecv/profile")
    object LifeCVSkills : Screen("lifecv/skills")
    object LifeCVWorkExperience : Screen("lifecv/workexperience")
    object LifeCVEducation : Screen("lifecv/education")
    // ... 14 LifeCV sections total
    
    // Contacts
    object LifeCVContacts : Screen("lifecv/contacts")
    
    // Phase 5 Features
    object FamilyTree : Screen("family-tree")
    object MeshChatList : Screen("mesh-chat")
    object MeshChat : Screen("mesh-chat/{peerId}/{peerName}")
    
    // Safety (Placeholder)
    object FollowMeHome : Screen("safety/followmehome")
    object EmergencyContacts : Screen("safety/contacts")
}
```

### Compose Theme
**Package:** `com.salatiso.lifesync.ui.theme`

#### Material 3 Color Scheme
- Dynamic color theming (Android 12+)
- Dark mode support
- Custom color tokens for trust scores

#### Typography
- Display, Headline, Title, Body, Label styles
- Custom font family support (via FontSetupGuide.kt)

### Reusable Components
**Package:** `com.salatiso.lifesync.ui.components`

1. **NavigationDrawer** - Side navigation menu
2. **OfflineSyncBadge** - Visual indicator for sync status
3. **LoadingComponents** - Loading states
4. **FeedbackComponents** - User feedback (snackbars, alerts)
5. **EmptyStateComponents** - Empty state illustrations

---

## Authentication & Security

### Firebase Authentication Configuration
**Project ID:** `lifecv-d2724`  
**Project Number:** `1039752653127`

#### Enabled Sign-In Methods
1. Email/Password
2. Google (OAuth 2.0)
3. Apple (OAuth 2.0)
4. Anonymous (Guest mode)

#### Web Client ID
```xml
<string name="default_web_client_id">
    1039752653127-fj5pifpbvqvj6u1pf9rnv8kq1jkvplhi.apps.googleusercontent.com
</string>
```

#### SHA-1 Certificate Fingerprint
```
66:12:95:CE:97:80:20:E9:82:B0:3F:3E:B1:A1:7C:30:73:91:D6:86
```

### Security Best Practices
1. **Credential Storage**: Never store plaintext passwords
2. **Token Refresh**: Automatic Firebase token refresh
3. **Encryption**: Google Tink for sensitive data
4. **Network Security**: HTTPS only
5. **ProGuard**: Obfuscate code in release builds

### Permissions
```xml
<!-- Required -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Optional (runtime requested) -->
<uses-permission android:name="android.permission.READ_CONTACTS" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
```

---

## Offline-First Architecture

### Strategy
1. **Local-First**: All operations write to Room database first
2. **Background Sync**: Automatic sync when network available
3. **Conflict Resolution**: Last-write-wins with timestamps
4. **Queue Management**: Offline actions stored and replayed

### Sync States
```kotlin
enum class SyncState {
    IDLE,           // No sync in progress
    SYNCING,        // Actively syncing
    SUCCESS,        // Last sync successful
    ERROR,          // Sync error occurred
    PENDING         // Actions pending sync
}
```

### Conflict Resolution
When conflicts occur during sync:
1. Compare timestamps
2. Apply last-write-wins
3. Log conflict for user review
4. Provide manual merge UI for critical data

---

## Feature Specifications

### 1. Contact Workflow - Detailed Spec

#### Step 1: Profile Review
- Display current user information
- Allow profile editing
- Required fields: Name, Email (if authenticated)
- Optional: Phone, Photo

#### Step 2: Contact Entry
- Three input methods:
  - Manual entry form
  - Device contacts import (with permission)
  - CSV file upload
  
- Contact fields:
  - First Name (required)
  - Last Name
  - Email
  - Phone
  - Birthday
  - Relationship type
  - Notes
  - Tags
  
#### Step 3: Household Creation
- Group contacts into households
- Fields:
  - Household name
  - Address
  - Location (via GPS or Google Maps link)
  - Members (select from contacts)
  - Household head
  
#### Step 4: Community Management
- Create or join communities
- Community types:
  - Residential
  - Religious
  - Professional
  - Educational
  - Social
  - Sports/Recreation
  - Volunteer
  - Cultural
  - Political
  - Other
  
- Invitation system:
  - Generate QR code
  - Share invitation link
  - Set expiration date
  - Track invitation status
  
#### Step 5: Geolocation
- Capture current location
- Parse Google Maps link
- Set zone boundaries
- Zone shapes:
  - Circle (radius)
  - Rectangle
  - Polygon (multiple points)
  - Custom (draw on map)
  
#### Step 6: Review & Submit
- Summary of all entries
- Edit any section
- Final validation
- Save to database
- Trigger sync if online

### 2. Trust Score System

#### Calculation Components
```kotlin
data class TrustScoreComponent(
    val componentId: String,
    val userId: String,
    val componentType: String,  // EMAIL_VERIFIED, PHONE_VERIFIED, etc.
    val score: Int,             // 0-100
    val weight: Double,         // 0.0-1.0
    val verifiedAt: Long?,
    val expiresAt: Long?,
    val verificationMethod: String?,
    val verifiedBy: String?
)
```

#### Trust Score Formula
```
totalScore = Σ(componentScore × weight) / Σ(weights)
```

#### Component Types
1. **Identity Verification** (30%)
   - Email verified: 10 points
   - Phone verified: 10 points
   - Government ID verified: 10 points

2. **Professional Verification** (25%)
   - Work email domain verified: 10 points
   - LinkedIn profile linked: 8 points
   - Employer verification: 7 points

3. **Educational Verification** (20%)
   - Institution email verified: 10 points
   - Degree certificate uploaded: 10 points

4. **Community Endorsements** (15%)
   - Peer recommendations: 5 points each (max 15)

5. **Activity & Engagement** (10%)
   - Profile completion: 5 points
   - Regular updates: 5 points

#### Trust Tiers
```kotlin
enum class TrustTier {
    UNVERIFIED,     // 0-20
    BASIC,          // 21-40
    VERIFIED,       // 41-60
    TRUSTED,        // 61-80
    ELITE           // 81-100
}
```

### 3. Mesh Networking Protocol

#### Discovery Protocol
1. Broadcast UDP packets on local network (port 8888)
2. Include device ID, name, and service type
3. Listen for peer broadcasts
4. Maintain peer list with last-seen timestamps
5. Remove inactive peers after 30 seconds

#### Message Protocol
- TCP socket communication (port 8889)
- JSON message format
- Encryption: AES-256-GCM
- Message states: SENDING → SENT → DELIVERED → READ

#### Emergency Broadcast
- High-priority messages
- Broadcast to all discovered peers
- Visual/audio alerts
- Cannot be muted
- Logged for emergency services

---

## API & Integration

### Firebase Realtime Database Rules
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "communities": {
      "$communityId": {
        ".read": "auth != null",
        "members": {
          "$memberId": {
            ".write": "auth.uid === $memberId || data.child('role').val() === 'admin'"
          }
        }
      }
    }
  }
}
```

### REST API Endpoints (Future)
Currently Firebase only, but planned RESTful API:

```
POST   /api/v1/auth/login
POST   /api/v1/auth/register
POST   /api/v1/users/profile
GET    /api/v1/lifecv/{userId}
POST   /api/v1/lifecv/verify
GET    /api/v1/communities
POST   /api/v1/communities/{id}/join
```

---

## Performance & Optimization

### Database Optimization
1. **Indices**: All foreign keys and search fields indexed
2. **Pagination**: LazyColumn with paging for large lists
3. **Query Optimization**: Use Flow for reactive queries
4. **Cache Strategy**: Cache frequently accessed data

### Image Optimization
- Coil for async loading with memory/disk cache
- Image compression for uploads
- Placeholder images while loading

### Network Optimization
- Retrofit with OkHttp caching
- Gzip compression
- Request batching for sync operations

### Memory Management
- ViewModel scope for lifecycle-aware data
- Avoid memory leaks with proper cleanup
- Use `remember` and `LaunchedEffect` correctly

---

## Testing Strategy

### Unit Tests
- Repository tests with MockK
- ViewModel tests with Turbine
- Use case tests
- Converter tests (critical for LatLng parsing)

### Integration Tests
- Room database tests with in-memory database
- Firebase emulator tests
- Repository integration tests

### UI Tests
- Compose UI tests with semantics
- Navigation tests
- End-to-end workflow tests

### Test Coverage Goals
- Unit tests: >80%
- Integration tests: >60%
- UI tests: Critical user paths

---

## Deployment

### Build Variants
```kotlin
buildTypes {
    debug {
        applicationIdSuffix = ".debug"
        debuggable = true
    }
    release {
        minifyEnabled = true
        proguardFiles(
            getDefaultProguardFile("proguard-android-optimize.txt"),
            "proguard-rules.pro"
        )
    }
}
```

### Release Checklist
- [ ] Update version code/name
- [ ] Run full test suite
- [ ] Generate signed APK/AAB
- [ ] Test on multiple devices
- [ ] Update Firebase crashlytics
- [ ] Update Play Store listing
- [ ] Prepare release notes

### CI/CD (Future)
- GitHub Actions for automated builds
- Automated testing on PR
- Automated Play Store deployment

---

## Appendix

### Known Issues & Fixes

#### 1. Coordinate Parsing Crash (Fixed)
**Issue**: App crashed when parsing malformed coordinate strings from database  
**Root Cause**: Unsafe `.toDouble()` calls in Room converters  
**Fix**: Replaced with `.toDoubleOrNull()` and null checks  
**Files Modified**:
- `data/local/converters/Converters.kt` (toLatLng, toLatLngList)
- `ui/contacts/ContactWorkflowScreen.kt` (parseLatLngInput)

#### 2. Guest Mode vs Authenticated User Crash
**Issue**: Authenticated users crashed on sign-in, guest users worked fine  
**Root Cause**: Database contained malformed data from previous tests, triggering converter exceptions  
**Fix**: Defensive parsing in all type converters  
**Prevention**: Add database migration to clean malformed data

### Future Enhancements

1. **Phase 6: Advanced Features**
   - Blockchain verification for trust scores
   - NFC business card exchange
   - AR family tree visualization
   - Voice-to-text CV builder

2. **Phase 7: Social Features**
   - RomanceSync (dating profile)
   - BusinessSync (professional networking)
   - FriendshipSync (friendship management)
   - KinshipSync (extended family tracking)

3. **Phase 8: Safety Features**
   - Follow Me Home (location sharing)
   - Emergency SOS with contacts
   - Safe zone alerts
   - Check-in reminders

---

## Document Control

### Version History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-10-05 | System | Initial comprehensive specification |

### Review & Approval
- **Technical Review**: Pending
- **Security Review**: Pending
- **Final Approval**: Pending

---

**END OF TECHNICAL SPECIFICATION**
