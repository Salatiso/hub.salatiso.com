# LifeSync Community Hub - Technical Specification

## Overview
The LifeSync Community Hub is a comprehensive platform for household-to-neighbourhood safety and governance, integrating offline-first communications with ecosystem services. This document details the technical implementation of the enhanced guest functionality and household creation features.

## Architecture

### Core Components
- **CommunityHub.jsx**: Main hub interface with tabbed navigation
- **GuestManagement.jsx**: Guest session management component
- **HouseholdCreate.jsx**: Enhanced household creation with GPS and member management
- **AlertCard.jsx**: Community alert system
- **CommunityCreate.jsx**: Basic community creation

### Data Storage
- LocalStorage-based persistence with JSON serialization
- Guest data: `lifesync_guest`
- Community data: `lifesync_communities_v1`
- Alert data: `lifesync_alerts_v1`

## Guest Functionality Enhancements

### Session Management
```javascript
// Guest data structure
{
  profile: {},
  questionnaires: {},
  syncs: [],
  createdAt: Date.now(),
  renewals: 0, // Max 3 renewals
  lastReminder: null,
  expired: false,
  offlineSettings: {
    bluetoothPeerSync: true,
    bluetoothRange: 'medium',
    wifiDirect: false,
    opportunisticForwarding: false,
    meshRouting: 'single',
    adaptiveSampling: true,
    dutyCycle: 'balanced',
    relayConsent: true,
    dataRetention: '30days'
  }
}
```

### Validity & Reminders
- **Duration**: 35 days per session
- **Reminders**: Every 7 days via browser notifications
- **Renewals**: Up to 3 times (35 days each)
- **Expiration**: Graceful handling with options to create profile, renew, or download data

### Profile Management
```javascript
// Download format
{
  profile: guestData.profile,
  questionnaires: guestData.questionnaires,
  syncs: guestData.syncs,
  exportedAt: Date.now(),
  version: '1.0'
}
```

**Features:**
- JSON export/import for profile portability
- Compatible with LifeCV profile creation
- Preserves all user data and sync history

## Household Creation Enhancements

### GPS Integration
```javascript
// Geolocation capture
const getCurrentLocation = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      coordinates: {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
    }
  );
};
```

### Household Data Structure
```javascript
{
  id: 'h_' + Date.now(),
  name: '',
  address: '',
  coordinates: { lat, lng }, // GPS coordinates
  description: '',
  dwellings: 1, // Number of physical dwellings
  families: 1, // Number of families
  units: [
    {
      id: 1,
      type: 'main|rental|guest|other',
      members: 1,
      description: ''
    }
  ],
  members: [
    {
      id: Date.now(),
      name: '',
      phone: '',
      email: '',
      relationship: 'family|tenant|guest|other',
      unit: 1,
      customFields: {}
    }
  ],
  createdAt: Date.now()
}
```

### Contact Import System
**Supported Formats:**
- Outlook CSV: `name,phone,email,relationship`
- Google Contacts CSV: Flexible field mapping
- Custom CSV: User-defined headers

**Import Process:**
```javascript
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const csvText = e.target.result;
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    const members = lines.slice(1).map(line => {
      const values = line.split(',');
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index]?.trim() || '';
        return obj;
      }, {});
    }).filter(member => member.name || member.firstname);
  };
};
```

### Multi-Step Creation Process

#### Step 1: Basic Information
- Household name
- Address (manual + GPS)
- Description

#### Step 2: Household Structure
- Number of dwellings
- Number of families
- Unit configuration (type, capacity, description)

#### Step 3: Member Management
- Individual member addition
- Bulk CSV import
- Contact field customization
- Unit assignment

## Community Hub Features

### Tabbed Interface
- **Overview**: Community listing and creation
- **Households**: Household management
- **Governance**: Multi-level governance (household/street/neighbourhood)
- **Communications**: Alerts and offline networking
- **Integrations**: Ecosystem service connections

### Offline-First Communications
**Connectivity Hierarchy:**
1. Local Wi-Fi LAN
2. Bluetooth LE mesh
3. Wi-Fi Direct
4. Internet (fallback)

**Presence Tracking:**
- Local: Within household mesh
- Street: Extended neighbourhood range
- Online: Internet connectivity

### Governance System
**Validator Quorum:**
- 60% approval rule for new members
- Multi-level validation chains
- Time-based escalation

**Roles:**
- Household Admin
- Moderators
- Unit Leads
- Validators

## Ecosystem Integrations

### Active Integrations
- **Sazi Life Academy**: Educational resources
- **Bizhub**: Business networking
- **Family Value**: Family formalisation
- **Ekhaya**: Household management
- **Pigeeback**: Transport safety

### Integration Architecture
```javascript
// Service connections
const integrations = {
  saziAcademy: { url: 'https://sazi-life-academy.com', status: 'connected' },
  bizhub: { url: 'https://bizhub.salatiso.com', status: 'connected' },
  familyValue: { url: 'https://family-value.salatiso.com', status: 'connected' },
  ekhaya: { url: 'https://ekhaya.salatiso.com', status: 'connected' },
  pigeeback: { url: 'https://pigeeback.salatiso.com', status: 'connected' }
};
```

## Navigation & Routing

### Centralized Routing
```javascript
// App.jsx routing
<Route path="/communities" element={<CommunityHub />} />
<Route path="/community-governance" element={<CommunityHub />} />
<Route path="/incident-reporting" element={<CommunityHub />} />
<Route path="/local-networking" element={<CommunityHub />} />
<Route path="/community-support" element={<CommunityHub />} />
```

### URL-Based Tab Navigation
```javascript
// CommunityHub.jsx
const [activeTab, setActiveTab] = useState(
  searchParams.get('tab') || 'overview'
);

const changeTab = (tab) => {
  setActiveTab(tab);
  setSearchParams({ tab });
};
```

## Security & Privacy

### Data Protection
- End-to-end encryption for communications
- Local storage with user consent
- Profile export for data portability
- No unauthorized data sharing

### Access Control
- Guest session limitations
- Household-based permissions
- Community membership validation
- Emergency contact verification

## Testing & Validation

### Component Testing
- Guest session lifecycle
- GPS coordinate capture
- CSV import parsing
- Multi-step form validation
- Offline communication simulation

### Integration Testing
- Ecosystem service connections
- Cross-platform compatibility
- Mobile responsiveness
- Error handling and recovery

## Future Enhancements

### Planned Features
- LifeSync Seal for event safety
- Advanced governance protocols
- Real-time mesh networking
- Multi-language support
- Cultural adaptation frameworks

### Scalability Considerations
- Backend API integration
- Database migration from localStorage
- Real-time synchronization
- Advanced offline capabilities

## Deployment

### Build Configuration
```json
// vite.config.js
{
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    host: true,
    port: 5174
  }
}
```

### Environment Variables
```bash
VITE_API_BASE_URL=https://api.lifesync.com
VITE_ECOSYSTEM_SERVICES='sazi,bizhub,family-value,ekhaya,pigeeback'
VITE_GUEST_SESSION_DAYS=35
VITE_MAX_RENEWALS=3
```

This technical specification provides the complete implementation details for the enhanced LifeSync Community Hub, ensuring robust guest management and comprehensive household creation capabilities.