# Community Hub Integration Guide for Salatiso Ecosystem Apps

---

**Document Version:** 1.2  
**Last Updated:** September 16, 2025  
**LifeSync Version:** 1.0.0  

---

## Overview
This document provides integration specifications for Family Value, Pigeeback, and Ekhaya apps to connect with the LifeSync Community Hub for enhanced community safety features. This integration supports the latest LifeSync features including household types (freestanding, flat single building, flat complex, cluster/townhouse, farm/smallholding, compound, other), scopes (my dwelling, entire property, etc.), GPS-paired addresses, and invite-based member management.

## Integration Architecture

### Shared Components
- **Authentication**: JWT-based SSO across all apps
- **User Profiles**: Unified user identity with LifeCV integration
- **Location Services**: GPS-based proximity alerts
- **Notification Hub**: Centralized multi-channel notifications

### Data Flow
```
Community Hub ↔ App Integration Layer ↔ App Backend
     ↓              ↓              ↓
   Alerts      Verification    App Services
   Households    Trust Scores   Specialized Data
   Members      Validation     Business Logic
```

---

## 1. Family Value Integration

### Purpose
Family Value integrates family member verification and trust quantification into community households, ensuring only verified family members can participate in community safety networks.

### Required API Endpoints

#### Family Verification APIs
```
GET /api/family-value/verification/:userId
```
**Response:**
```json
{
  "userId": "uuid",
  "verified": true,
  "trustScore": 85,
  "relationships": [
    {
      "relativeId": "uuid",
      "relationship": "spouse|sibling|parent|child",
      "verified": true,
      "trustLevel": "high"
    }
  ],
  "lastVerified": "2025-09-14T10:00:00Z"
}
```

#### Household Member Validation
```
POST /api/family-value/household/validate
```
**Request:**
```json
{
  "householdId": "uuid",
  "members": ["uuid1", "uuid2"],
  "communityId": "uuid"
}
```
**Response:**
```json
{
  "valid": true,
  "warnings": [],
  "trustScore": 78,
  "household": {
    "id": "uuid",
    "name": "Smith Family Home",
    "householdType": "freestanding",
    "scope": "my_dwelling",
    "coordinates": {"lat": -26.2041, "lng": 28.0473},
    "inviteLinks": [
      {
        "memberId": "uuid",
        "link": "https://lifesync-lifecv.web.app/join/abc123-john-smith"
      }
    ]
  },
  "recommendations": [
    "Add birth certificates for verification",
    "Complete family tree documentation"
  ]
}
```

### Integration Points

#### Community Hub Hooks
- **Pre-Household Creation**: Validate family relationships
- **Member Addition**: Verify familial connections
- **Alert Permissions**: Family-based access control
- **Trust Scoring**: Influence alert confirmation weights

#### UI Integration
```jsx
// Family Value Trust Badge Component
<FamilyTrustBadge userId={user.id} showScore={true} />

// Household Verification Status
<HouseholdVerificationStatus householdId={household.id} />
```

### Data Synchronization
- **Real-time**: Family relationship updates
- **Batch**: Weekly trust score recalculations
- **Event-driven**: New family member additions

---

## 2. Pigeeback Integration

### Purpose
Pigeeback provides transportation safety monitoring and ride-sharing verification within community safety networks, ensuring safe transportation for community members.

### Required API Endpoints

#### Transportation Safety APIs
```
GET /api/pigeeback/trip/safety/:tripId
```
**Response:**
```json
{
  "tripId": "uuid",
  "safetyScore": 92,
  "route": {
    "start": {"lat": -26.2041, "lng": 28.0473},
    "end": {"lat": -26.1952, "lng": 28.0345},
    "waypoints": []
  },
  "participants": [
    {
      "userId": "uuid",
      "role": "driver|passenger",
      "verified": true,
      "emergencyContact": "+27123456789"
    }
  ],
  "safetyFeatures": {
    "realTimeTracking": true,
    "emergencyButton": true,
    "routeSharing": true
  }
}
```

#### Community Transportation Alerts
```
POST /api/pigeeback/alert/transportation
```
**Request:**
```json
{
  "communityId": "uuid",
  "alertType": "transportation_emergency|route_deviation|safety_concern",
  "tripId": "uuid",
  "location": {"lat": -26.2041, "lng": 28.0473},
  "description": "Vehicle breakdown on main road",
  "severity": "high"
}
```

### Integration Points

#### Community Hub Hooks
- **Alert Creation**: Transportation-related alerts
- **Route Monitoring**: Real-time trip safety tracking
- **Emergency Response**: Transportation emergency protocols
- **Community Transport**: Group ride coordination

#### UI Integration
```jsx
// Transportation Safety Monitor
<TransportationMonitor communityId={community.id} />

// Safe Ride Sharing Component
<SafeRideShareButton householdId={household.id} />
```

### Data Synchronization
- **Real-time**: Trip location updates
- **Event-driven**: Emergency alerts
- **Scheduled**: Safety score updates

---

## 3. Ekhaya Integration

### Purpose
Ekhaya provides property management and home security integration, allowing communities to monitor household security and coordinate neighborhood watch activities.

### Required API Endpoints

#### Property Security APIs
```
GET /api/ekhaya/property/security/:propertyId
```
**Response:**
```json
{
  "propertyId": "uuid",
  "householdId": "uuid",
  "securityStatus": "armed|disarmed|breach",
  "devices": [
    {
      "id": "uuid",
      "type": "camera|sensor|alarm",
      "status": "online|offline",
      "lastActivity": "2025-09-14T10:00:00Z"
    }
  ],
  "alerts": [
    {
      "type": "intrusion|fire|flood",
      "severity": "low|medium|high",
      "timestamp": "2025-09-14T09:45:00Z"
    }
  ],
  "neighborhood": {
    "crimeRate": "low",
    "watchActive": true,
    "communityCoverage": 85
  }
}
```

#### Neighborhood Watch Coordination
```
POST /api/ekhaya/neighborhood/watch
```
**Request:**
```json
{
  "communityId": "uuid",
  "action": "activate|deactivate|report",
  "location": {"lat": -26.2041, "lng": 28.0473},
  "description": "Suspicious activity reported",
  "participants": ["uuid1", "uuid2"]
}
```

### Integration Points

#### Community Hub Hooks
- **Property Alerts**: Home security incidents
- **Neighborhood Watch**: Coordinated monitoring
- **Household Security**: Property status integration
- **Emergency Response**: Property-related emergencies

#### UI Integration
```jsx
// Property Security Dashboard
<PropertySecurityDashboard householdId={household.id} />

// Neighborhood Watch Panel
<NeighborhoodWatchPanel communityId={community.id} />
```

### Data Synchronization
- **Real-time**: Security device status
- **Event-driven**: Security alerts
- **Batch**: Neighborhood statistics

---

## Shared Integration Requirements

### Authentication & Authorization
```javascript
// JWT Token Structure
{
  "userId": "uuid",
  "app": "family-value|pigeeback|ekhaya",
  "permissions": ["read", "write", "admin"],
  "communities": ["uuid1", "uuid2"],
  "iat": 1631624400,
  "exp": 1631631600
}
```

### Error Handling
```json
{
  "error": {
    "code": "VALIDATION_ERROR|AUTH_ERROR|NOT_FOUND",
    "message": "Human readable error message",
    "details": {},
    "timestamp": "2025-09-14T10:00:00Z"
  }
}
```

### Rate Limiting
- **Per User**: 1000 requests/hour
- **Per Community**: 10000 requests/hour
- **Emergency**: Unlimited for critical alerts

### Webhook Integration
```javascript
// Community Hub Webhooks
POST /webhooks/community/alert
POST /webhooks/household/update
POST /webhooks/member/verification
```

### Testing Endpoints
```
GET /api/health - Service health check
GET /api/integration/status - Integration status
POST /api/integration/test - Test integration
```

## Implementation Timeline

### Phase 1: Core Integration (Week 1-2)
- Basic API endpoints implementation
- Authentication setup
- Data synchronization

### Phase 2: Advanced Features (Week 3-4)
- Real-time updates
- Webhook integration
- UI components

### Phase 3: Testing & Optimization (Week 5-6)
- Integration testing
- Performance optimization
- Documentation completion

## Support & Documentation

### Developer Resources
- **API Documentation**: `/docs/api/v1`
- **Integration Examples**: `/examples/integration`
- **Webhook Testing**: `/tools/webhook-tester`

### Support Channels
- **Technical Support**: dev-support@salatiso.com
- **Integration Help**: integration@salatiso.com
- **Community Forum**: community.salatiso.com

This integration guide ensures seamless connectivity between the Community Hub and ecosystem apps, enabling comprehensive community safety networks.