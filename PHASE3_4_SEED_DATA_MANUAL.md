# 📋 Phase 3.4 - Seed Data Setup Guide

**Status:** Ready to Execute  
**Objective:** Create realistic test data for all 12 widgets

---

## Quick Start

### Option 1: Use Firebase Console (Fastest for Phase 3.4)

1. Go to [Firebase Console](https://console.firebase.google.com/project/lifecv-d2724)
2. Navigate to **Firestore Database**
3. Create collections and documents following the structure below
4. Data will automatically sync to your development application

### Option 2: Use Firebase CLI + Service Account

```bash
# Download service account key
# Settings > Service Accounts > Generate New Private Key
# Save as: .firebase/serviceAccountKey.json

# Run seed script
npm run seed-data
```

---

## Manual Test Data Creation (Firebase Console)

### 1. Create Test User Profile

**Collection:** `users`  
**Document ID:** Use any ID (e.g., `test_user_001`)

```json
{
  "email": "testuser@lifecycle.app",
  "displayName": "Test User",
  "photoURL": "",
  "completionPercent": 45,
  "sections": 5,
  "views": 12,
  "createdAt": "2025-10-20T00:00:00Z",
  "updatedAt": "2025-10-27T00:00:00Z",
  "role": "user",
  "status": "active"
}
```

### 2. Create Activities Collection

**Sub-collection:** `users/{userId}/activities`

**Activity 1: Connection**
```json
{
  "id": "activity_001",
  "type": "connection",
  "title": "Connected with Sarah Miller",
  "description": "New professional connection added",
  "status": "completed",
  "createdAt": "2025-10-25T00:00:00Z",
  "updatedAt": "2025-10-25T00:00:00Z",
  "category": "networking",
  "icon": "Users"
}
```

**Activity 2: Verification**
```json
{
  "id": "activity_002",
  "type": "verification",
  "title": "Email Verification Completed",
  "description": "Your email address has been verified",
  "status": "completed",
  "createdAt": "2025-10-26T00:00:00Z",
  "updatedAt": "2025-10-26T00:00:00Z",
  "category": "security",
  "icon": "CheckCircle"
}
```

**Activity 3: Task (In Progress)**
```json
{
  "id": "activity_003",
  "type": "task",
  "title": "Profile Completion at 50%",
  "description": "Complete your profile to unlock more features",
  "status": "in_progress",
  "createdAt": "2025-10-22T00:00:00Z",
  "updatedAt": "2025-10-27T00:00:00Z",
  "category": "system",
  "icon": "AlertCircle"
}
```

**Activity 4: Achievement**
```json
{
  "id": "activity_004",
  "type": "achievement",
  "title": "Reached 10 Connections",
  "description": "Congratulations! You've reached a milestone",
  "status": "completed",
  "createdAt": "2025-10-24T00:00:00Z",
  "updatedAt": "2025-10-24T00:00:00Z",
  "category": "milestone",
  "icon": "Trophy"
}
```

**Activity 5: Update**
```json
{
  "id": "activity_005",
  "type": "update",
  "title": "Profile Photo Updated",
  "description": "Your profile photo has been successfully updated",
  "status": "completed",
  "createdAt": "2025-10-26T00:00:00Z",
  "updatedAt": "2025-10-26T00:00:00Z",
  "category": "system",
  "icon": "Camera"
}
```

### 3. Create Notifications Collection

**Sub-collection:** `users/{userId}/notifications`

**Notification 1: High Priority (Unread)**
```json
{
  "id": "notif_001",
  "title": "New Verification Request",
  "message": "Your identity needs verification for enhanced security",
  "type": "verification",
  "read": false,
  "createdAt": "2025-10-27T00:00:00Z",
  "priority": "high",
  "actionUrl": "/dashboard/verification"
}
```

**Notification 2: Low Priority (Read)**
```json
{
  "id": "notif_002",
  "title": "Profile Updated Successfully",
  "message": "Your profile changes have been saved",
  "type": "update",
  "read": true,
  "createdAt": "2025-10-26T00:00:00Z",
  "priority": "low",
  "actionUrl": "/dashboard/profile"
}
```

**Notification 3: Medium Priority (Unread)**
```json
{
  "id": "notif_003",
  "title": "New Connection Request",
  "message": "Sarah Miller wants to connect with you",
  "type": "connection",
  "read": false,
  "createdAt": "2025-10-27T00:00:00Z",
  "priority": "medium",
  "actionUrl": "/dashboard/contacts"
}
```

### 4. Create Contacts Collection

**Sub-collection:** `users/{userId}/contacts`

**Contact 1: Colleague**
```json
{
  "id": "contact_001",
  "name": "Sarah Johnson",
  "email": "sarah.johnson@example.com",
  "phone": "+1-555-0101",
  "relationship": "colleague",
  "company": "Tech Solutions Inc",
  "title": "Senior Developer",
  "addedAt": "2025-08-28T00:00:00Z",
  "lastInteraction": "2025-10-26T00:00:00Z"
}
```

**Contact 2: Mentor**
```json
{
  "id": "contact_002",
  "name": "Michael Chen",
  "email": "michael.chen@example.com",
  "phone": "+1-555-0102",
  "relationship": "mentor",
  "company": "Innovation Labs",
  "title": "CTO",
  "addedAt": "2025-08-28T00:00:00Z",
  "lastInteraction": "2025-10-24T00:00:00Z"
}
```

**Contact 3: Friend**
```json
{
  "id": "contact_003",
  "name": "Emily Rodriguez",
  "email": "emily.rodriguez@example.com",
  "phone": "+1-555-0103",
  "relationship": "friend",
  "company": "Creative Agency",
  "title": "Design Lead",
  "addedAt": "2025-09-12T00:00:00Z",
  "lastInteraction": "2025-10-25T00:00:00Z"
}
```

### 5. Create Calendar Collection

**Sub-collection:** `users/{userId}/calendar`

**Event 1: Past Meeting (Completed)**
```json
{
  "id": "event_001",
  "title": "Team Sync Meeting",
  "description": "Weekly synchronization with the team",
  "startDate": "2025-10-26T14:00:00Z",
  "endDate": "2025-10-26T15:00:00Z",
  "location": "Virtual - Zoom",
  "attendees": 5,
  "status": "completed"
}
```

**Event 2: Upcoming Meeting**
```json
{
  "id": "event_002",
  "title": "Project Kickoff",
  "description": "Kickoff meeting for Q4 project",
  "startDate": "2025-10-30T10:00:00Z",
  "endDate": "2025-10-30T11:30:00Z",
  "location": "Conference Room A",
  "attendees": 12,
  "status": "scheduled"
}
```

**Event 3: Future Meeting**
```json
{
  "id": "event_003",
  "title": "Client Presentation",
  "description": "Present Q3 results to stakeholders",
  "startDate": "2025-11-01T15:00:00Z",
  "endDate": "2025-11-01T16:00:00Z",
  "location": "Virtual - Teams",
  "attendees": 8,
  "status": "scheduled"
}
```

### 6. Create Assets Collection

**Sub-collection:** `users/{userId}/assets`

**Asset 1: Property**
```json
{
  "id": "asset_001",
  "name": "Primary Residence",
  "type": "property",
  "value": 450000,
  "currency": "USD",
  "description": "Family home in suburban area",
  "addedAt": "2024-10-27T00:00:00Z",
  "status": "active"
}
```

**Asset 2: Investment**
```json
{
  "id": "asset_002",
  "name": "Company Stock Options",
  "type": "investment",
  "value": 125000,
  "currency": "USD",
  "description": "Employee stock options vested",
  "addedAt": "2025-04-27T00:00:00Z",
  "status": "active"
}
```

**Asset 3: Retirement**
```json
{
  "id": "asset_003",
  "name": "Retirement Account (401k)",
  "type": "retirement",
  "value": 280000,
  "currency": "USD",
  "description": "Tax-deferred retirement savings",
  "addedAt": "2024-10-27T00:00:00Z",
  "status": "active"
}
```

### 7. Create Goals Collection

**Sub-collection:** `users/{userId}/goals`

**Goal 1: Learning (Active, High Priority)**
```json
{
  "id": "goal_001",
  "title": "Learn Advanced React",
  "description": "Complete advanced React patterns and hooks course",
  "progress": 75,
  "status": "active",
  "createdAt": "2025-09-12T00:00:00Z",
  "targetDate": "2025-11-12T00:00:00Z",
  "priority": "high",
  "category": "education"
}
```

**Goal 2: Financial (Active, Medium Priority)**
```json
{
  "id": "goal_002",
  "title": "Save $50,000",
  "description": "Build emergency fund to $50k",
  "progress": 45,
  "status": "active",
  "createdAt": "2025-07-28T00:00:00Z",
  "targetDate": "2026-08-27T00:00:00Z",
  "priority": "medium",
  "category": "financial",
  "currentSavings": 22500
}
```

**Goal 3: Health (Active, Medium Priority)**
```json
{
  "id": "goal_003",
  "title": "Exercise 4x per week",
  "description": "Maintain consistent fitness routine",
  "progress": 60,
  "status": "active",
  "createdAt": "2025-04-27T00:00:00Z",
  "targetDate": "2026-10-27T00:00:00Z",
  "priority": "medium",
  "category": "health"
}
```

### 8. Create Verifications Collection

**Sub-collection:** `users/{userId}/verifications`

```json
{
  "id": "verify_001",
  "type": "email",
  "status": "verified",
  "value": "testuser@lifecycle.app",
  "verifiedAt": "2025-10-17T00:00:00Z",
  "expiresAt": "2026-10-17T00:00:00Z"
}
```

---

## Testing Steps After Creating Data

### Step 1: Start Development Server
```bash
npm run dev
```

### Step 2: Log in to Application
- Use your Firebase credentials
- Or create a new test account

### Step 3: Verify Each Widget

- **NotificationsWidget**: Should show 3 notifications with unread badges
- **ActivityFeedWidget**: Should display 5 activities with status indicators
- **TrustScoreWidget**: Should calculate score from verifications
- **VerificationWidget**: Should show verification progress
- **ContactsWidget**: Should display 3 contacts
- **CalendarWidget**: Should show upcoming events
- **AssetsWidget**: Should calculate total asset value (~$855k)
- **GoalsWidget**: Should show progress bars for goals
- **HealthWidget**: Should display placeholder health metrics
- **LifeCVWidget**: Should show profile completion (45%)
- **SettingsWidget**: Should be functional
- **DashboardWidget**: Should aggregate statistics

### Step 4: Run Performance Tests
```bash
npm run build
```

---

## Notes

- ⏰ Timestamps use ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ`
- 💵 Total asset value with sample data: **$855,000**
- 📊 Sample activities span 5 days (realistic progression)
- 🎯 Sample notifications mix read/unread for testing
- 📅 Calendar events include past, present, and future

---

## Next Phase (3.5): Search Implementation

After verifying all widgets work with seed data:
1. Implement search across activities, contacts, goals
2. Add filtering and sorting
3. Performance optimization
4. Deploy to production

---

**Estimated Time:** 30-45 minutes for manual data creation via Firebase Console  
**Alternative:** Use seed script if service account is available (5 minutes)
