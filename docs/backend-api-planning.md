# Backend API Planning for LifeSync Community Safety

## Overview
This document outlines the backend API requirements for the LifeSync Community Safety feature, including persistent storage, authentication, and multi-channel notifications.

## Architecture
- **Frontend**: React with localStorage MVP, transitioning to API-driven
- **Backend**: RESTful API with real-time capabilities
- **Database**: PostgreSQL with JSON fields for flexible community structures
- **Authentication**: JWT-based with role-based access control
- **Notifications**: Multi-channel (SMS, Push, WhatsApp, Email)

## API Endpoints

### Authentication
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
GET /api/auth/me
```

### Communities
```
GET /api/communities - List user's communities
POST /api/communities - Create community
GET /api/communities/:id - Get community details
PUT /api/communities/:id - Update community
DELETE /api/communities/:id - Delete community
POST /api/communities/:id/join - Join community (with invite code)
POST /api/communities/:id/leave - Leave community
```

### Households
```
GET /api/communities/:id/households - List community households
POST /api/communities/:id/households - Create household
GET /api/communities/:id/households/:hid - Get household details
PUT /api/communities/:id/households/:hid - Update household
DELETE /api/communities/:id/households/:hid - Delete household
POST /api/communities/:id/households/:hid/members - Add member
DELETE /api/communities/:id/households/:hid/members/:uid - Remove member
```

### Alerts
```
GET /api/communities/:id/alerts - List community alerts
POST /api/communities/:id/alerts - Create alert
GET /api/communities/:id/alerts/:aid - Get alert details
POST /api/communities/:id/alerts/:aid/confirm - Confirm alert
POST /api/communities/:id/alerts/:aid/resolve - Resolve alert
```

### Notifications
```
GET /api/notifications - List user notifications
POST /api/notifications/:id/read - Mark as read
POST /api/users/preferences - Update notification preferences
```

## Data Models

### Community
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "ownerId": "uuid",
  "settings": {
    "confirmationsRequired": 2,
    "alertRadius": 1000,
    "autoResolveHours": 24
  },
  "inviteCode": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Household
```json
{
  "id": "uuid",
  "communityId": "uuid",
  "name": "string",
  "address": "string",
  "description": "string",
  "location": {
    "lat": "number",
    "lng": "number"
  },
  "members": ["uuid"],
  "createdAt": "timestamp"
}
```

### Alert
```json
{
  "id": "uuid",
  "communityId": "uuid",
  "householdId": "uuid",
  "reporterId": "uuid",
  "category": "Medical|Fire|Crime|Infrastructure|General",
  "message": "string",
  "status": "pending|confirmed|resolved",
  "location": {
    "lat": "number",
    "lng": "number"
  },
  "confirmations": [{
    "userId": "uuid",
    "verdict": "confirm|not_affected|need_help",
    "timestamp": "timestamp"
  }],
  "createdAt": "timestamp",
  "resolvedAt": "timestamp"
}
```

## Notification Channels

### SMS Integration
- Provider: Africa's Talking / Twilio
- Triggers: Alert creation, confirmations, resolutions
- Templates: Localized SMS messages

### Push Notifications
- Provider: Firebase Cloud Messaging
- Triggers: Real-time alerts, confirmations
- Payload: Alert details with deep links

### WhatsApp Business
- Provider: 360Dialog / Twilio
- Triggers: Community-wide alerts
- Templates: Approved message templates

### Email
- Provider: SendGrid / AWS SES
- Triggers: Daily digests, weekly summaries
- Templates: HTML emails with community stats

## Security Considerations

### Authentication
- JWT tokens with 1-hour expiration
- Refresh tokens for session management
- Role-based permissions (owner, admin, member)

### Data Privacy
- POPIA compliance for South African users
- End-to-end encryption for sensitive alerts
- Data retention policies (7 years for safety data)

### Rate Limiting
- Alert creation: 10 per hour per user
- API calls: 1000 per hour per user
- SMS: 5 per day per user (cost control)

## Offline-First Architecture

### Service Worker
- Cache community data for offline access
- Queue alerts for sync when online
- Background sync for confirmations

### Conflict Resolution
- Last-write-wins for simple updates
- Manual merge for conflicting alert confirmations
- Version vectors for complex conflicts

## Integration Points

### Salatiso Ecosystem
- **Ekhaya**: Property management integration
- **Pigeeback**: Transportation safety alerts
- **Family Value**: Family member verification
- **Sazi Academy**: Educational institution alerts
- **BizHelp**: Business continuity alerts

### External Services
- **Emergency Services**: Direct API integration
- **Local Government**: Ward-based community mapping
- **Weather Services**: Natural disaster alerts

## Deployment Plan

### Phase 1: MVP
- Basic CRUD operations
- SMS notifications
- Single region deployment

### Phase 2: Scale
- Multi-region deployment
- Push notifications
- WhatsApp integration

### Phase 3: Advanced
- Real-time WebSocket alerts
- AI-powered alert categorization
- Predictive safety analytics

## Monitoring & Analytics

### Key Metrics
- Alert response times
- Confirmation rates
- User engagement
- System uptime

### Logging
- Structured logging with correlation IDs
- Alert lifecycle tracking
- Performance monitoring

This backend plan provides a solid foundation for scaling the LifeSync Community Safety feature from MVP to production-ready system.