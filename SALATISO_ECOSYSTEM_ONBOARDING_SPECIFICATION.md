# Salatiso Ecosystem Onboarding Specification v2.0

## Overview
This specification defines the standardized onboarding and authentication flow for all Salatiso ecosystem applications. It ensures consistent user experience, security practices, and data management across all services.

## Core Principles

### 1. Offline-First Architecture
- **Primary**: Local accounts with encrypted storage
- **Fallback**: Cloud synchronization when available
- **Mobility**: Portable profiles for cross-device usage

### 2. Multi-Modal Authentication
- **Local Accounts**: PIN/password protected, device-stored
- **Cloud Accounts**: Firebase Auth integration
- **Portable Profiles**: Encrypted export/import via files or cloud storage
- **Third-Party Integration**: Google Drive, OneDrive (where APIs available)

### 3. Progressive Enhancement
- **Base Experience**: Fully functional offline
- **Enhanced Experience**: Cloud sync, multi-device access
- **Premium Features**: Advanced sync, conflict resolution

## Authentication Flow Specification

### Unified Entry Point
All Salatiso applications MUST implement a unified authentication screen with exactly 3 options:

#### Option 1: Cloud Account (Firebase)
```
UI: Blue theme, cloud icon
Title: "Continue with Google"
Description: "Fastest option. Cloud backup & multi-device access."
Features:
- ⚡ One-click signin
- ☁️ Synced across devices
- 🔒 Secure authentication
Action: Firebase OAuth redirect
```

#### Option 2: Local Account
```
UI: Green theme, lock icon
Title: "Continue with Local Account"
Description: "Works offline. PIN-protected. Sync later if you want."
Features:
- 📴 Works without internet
- 🔑 PIN or password protection
- ⬆️ Optional cloud sync
Action: Navigate to local account creation/signin
```

#### Option 3: Import Profile
```
UI: Red theme, folder icon
Title: "Import from Cloud Storage"
Description: "Load a previously exported profile from cloud storage."
Features:
- 📤 Import encrypted profiles
- 🔐 Password protected
- 📱 Cross-device mobility
Action: Open cloud storage selection
```

### Authentication States

#### 1. First-Time User
- Show unified entry point with all 3 options
- Default selection: Local Account (middle option)
- Highlight offline capabilities

#### 2. Returning User with Local Account
- Show unified entry point
- Pre-select Local Account option
- Display "Welcome back" messaging

#### 3. Returning User with Cloud Account
- Attempt automatic signin with Firebase
- Fallback to unified entry point if auto-signin fails

#### 4. Offline User
- All options remain available
- Local Account works fully offline
- Cloud options show "offline" state but remain selectable
- Import options work with cached/saved files

## Data Management Specification

### Profile Storage Architecture

#### Local Storage (Primary)
```typescript
interface LocalProfile {
  id: string;
  profile: UserProfile;
  services: ServiceEnrollment[];
  trustVerification: TrustData;
  syncPreferences: SyncPreferences;
  lastModified: Record<string, number>;
  encryptionKey: string; // PBKDF2 derived
}
```

#### Cloud Storage (Secondary)
```typescript
interface CloudProfile {
  uid: string;
  profile: UserProfile;
  services: ServiceEnrollment[];
  trustVerification: TrustData;
  lastSync: Timestamp;
  deviceId: string;
}
```

### Synchronization Engine

#### Sync Preferences
```typescript
interface SyncPreferences {
  autoSync: boolean;           // Automatic background sync
  manualOnly: boolean;         // Manual sync only
  selectedCategories: string[]; // Which data to sync
  lastSync: number | null;     // Last sync timestamp
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  pendingChanges: number;      // Change counter
}
```

#### Conflict Resolution
- **Strategy**: Last-write-wins with user override
- **Merge Logic**: Field-level conflict resolution
- **User Choice**: Manual resolution for critical conflicts

### Portable Profiles

#### Export Format
```json
{
  "version": "2.0",
  "exportedAt": "2025-01-29T10:00:00Z",
  "application": "LifeSync",
  "profile": { /* encrypted profile data */ },
  "services": { /* encrypted services data */ },
  "metadata": {
    "deviceType": "mobile|desktop",
    "exportMethod": "local|google-drive|onedrive"
  }
}
```

#### Encryption Standard
- **Algorithm**: AES-256-GCM
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Salt**: 32-byte random salt per export
- **File Extension**: `.lifesync`

## Cloud Storage Integration

### Google Drive (Primary Implementation)
```typescript
interface GoogleDriveConfig {
  apiKey: string;
  clientId: string;
  scope: 'https://www.googleapis.com/auth/drive.file';
  folder: 'appDataFolder'; // Private storage
}
```

#### Supported Operations
- ✅ **Upload**: Export profiles to Drive
- ✅ **Download**: Import profiles from Drive
- ✅ **List**: Show available profile files
- ✅ **Update**: Overwrite existing files
- ❌ **Delete**: Manual deletion by user

### OneDrive (Future Implementation)
```typescript
interface OneDriveConfig {
  clientId: string;
  scope: 'Files.ReadWrite.All';
  folder: 'AppRoot'; // App-specific storage
}
```

### Local Device Storage
- **File API**: Direct file upload/download
- **Drag & Drop**: Support for file dropping
- **Validation**: File type and size checking

## UI/UX Standards

### Visual Design
- **Color Scheme**: Blue (Cloud), Green (Local), Red (Import)
- **Icons**: Consistent across all apps
- **Layout**: 3-column grid on desktop, stacked on mobile
- **Animations**: Subtle hover effects, loading states

### Error Handling
- **User-Friendly Messages**: Clear, actionable error text
- **Recovery Options**: Alternative authentication methods
- **Offline Graceful Degradation**: Full functionality offline

### Loading States
- **Skeleton Screens**: Content placeholders during loading
- **Progress Indicators**: For long-running operations
- **Status Messages**: Real-time feedback

## Security Requirements

### Encryption Standards
- **At Rest**: AES-256 for local storage
- **In Transit**: TLS 1.3 for all network communication
- **Key Management**: PBKDF2 for user-derived keys

### Authentication Security
- **PIN Requirements**: Minimum 4 digits
- **Password Requirements**: Minimum 8 characters, complexity rules
- **Session Management**: Automatic logout on inactivity
- **Biometric Support**: Optional device biometrics

### Data Privacy
- **Local First**: Data stays on device by default
- **User Consent**: Explicit opt-in for cloud sync
- **Data Minimization**: Only sync requested data categories
- **Right to Delete**: Complete local and cloud data removal

## Implementation Checklist

### Core Features
- [ ] Unified 3-option authentication screen
- [ ] Local account creation and authentication
- [ ] Firebase OAuth integration
- [ ] Portable profile export/import
- [ ] Google Drive integration
- [ ] Synchronization engine
- [ ] Conflict resolution system

### UI Components
- [ ] Authentication options grid
- [ ] Local account forms (signup/signin)
- [ ] Cloud storage file selection
- [ ] Password input dialogs
- [ ] Sync status indicators
- [ ] Error message displays

### Data Management
- [ ] IndexedDB local storage
- [ ] Firebase cloud storage
- [ ] Encryption utilities
- [ ] Sync preference management
- [ ] Change tracking system

### Security
- [ ] AES-256 encryption implementation
- [ ] PBKDF2 key derivation
- [ ] Secure random salt generation
- [ ] Input validation and sanitization

## Migration Guide

### From v1.0 to v2.0
1. **Update Authentication Flow**: Replace 2-option with 3-option screen
2. **Add Google Drive Support**: Implement Google Drive API integration
3. **Enhance Sync Engine**: Add change counters and conflict resolution
4. **Update Profile Format**: Migrate to v2.0 encrypted format
5. **Add Offline Support**: Ensure full functionality without internet

### Breaking Changes
- Authentication screen layout changed
- Profile export format updated
- Sync preference structure modified
- New required dependencies (Google Drive API)

## Testing Requirements

### Unit Tests
- Authentication flow logic
- Encryption/decryption functions
- Sync engine operations
- Error handling scenarios

### Integration Tests
- End-to-end authentication flows
- Cloud storage operations
- Synchronization scenarios
- Offline functionality

### User Acceptance Tests
- First-time user onboarding
- Returning user authentication
- Profile export/import workflow
- Cross-device synchronization

## Future Enhancements

### Planned Features
- **Biometric Authentication**: Device fingerprint/face unlock
- **Advanced Sync**: Selective sync, scheduled sync
- **Profile Sharing**: Secure profile sharing between users
- **Backup Recovery**: Automated backup and recovery options

### API Expansions
- **Microsoft OneDrive**: Full OneDrive integration
- **Dropbox**: Dropbox API integration
- **iCloud**: iCloud Drive support for iOS devices
- **WebDAV**: Generic WebDAV server support

---

## Implementation Status

### ✅ Completed
- Unified 3-option authentication screen
- Local account system with encryption
- Firebase OAuth integration
- Portable profile export/import
- Google Drive integration
- Sync engine with change tracking
- Conflict resolution system

### 🔄 In Progress
- OneDrive integration planning
- Advanced sync features
- Biometric authentication

### 📋 Planned
- Multi-user device support
- Profile sharing capabilities
- Automated backup systems

---

*This specification is maintained by the Salatiso Ecosystem Team and updated as new requirements emerge. All ecosystem applications must comply with the current version for consistent user experience.*</content>
<parameter name="filePath">d:\WebSites\salatiso-ecosystem\LifeSync-React-App\SALATISO_ECOSYSTEM_ONBOARDING_SPECIFICATION.md