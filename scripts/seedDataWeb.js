#!/usr/bin/env node

/**
 * Phase 3.4: Seed Data Script (Firebase Web SDK Version)
 * Creates test data directly in Firestore using Firebase web SDK
 * 
 * Usage: npm run seed-data
 * 
 * This script requires:
 * 1. Firebase project to be initialized
 * 2. Firestore rules to allow writes from this script
 * 3. Node.js with Firebase CLI installed
 */

import * as admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const log = (color, ...args) => console.log(`${color}${args.join(' ')}${colors.reset}`);

// Try to initialize Firebase Admin
try {
  const serviceAccountPath = path.join(__dirname, '..', '.firebase', 'serviceAccountKey.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'lifecv-d2724'
    });
    log(colors.green, '✅ Firebase Admin initialized with service account');
  } else {
    log(colors.yellow, '⚠️  Service account key not found');
    log(colors.yellow, '📝 Instructions to create seed data manually:');
    log(colors.cyan, '\n1. Go to Firebase Console: https://console.firebase.google.com/project/lifecv-d2724');
    log(colors.cyan, '2. Navigate to Firestore Database');
    log(colors.cyan, '3. Download service account key:');
    log(colors.cyan, '   - Project Settings > Service Accounts > Generate New Private Key');
    log(colors.cyan, '   - Save to: .firebase/serviceAccountKey.json');
    log(colors.cyan, '4. Run: npm run seed-data\n');
    
    log(colors.yellow, 'Alternatively, use Firebase Console to create test data manually');
    process.exit(0);
  }
} catch (error) {
  log(colors.red, '❌ Error initializing Firebase:', error.message);
  process.exit(1);
}

const db = admin.firestore();

// Utility functions
const getTimestamp = (daysAgo = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return admin.firestore.Timestamp.fromDate(date);
};

const getDate = (daysAgo = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

// Seed data generators
const generateActivities = () => [
  {
    id: 'activity_001',
    type: 'connection',
    title: 'Connected with Sarah Miller',
    description: 'New professional connection added to your network',
    status: 'completed',
    createdAt: getTimestamp(2),
    updatedAt: getTimestamp(2),
    category: 'networking',
    icon: 'Users'
  },
  {
    id: 'activity_002',
    type: 'verification',
    title: 'Email Verification Completed',
    description: 'Your email address has been verified',
    status: 'completed',
    createdAt: getTimestamp(1),
    updatedAt: getTimestamp(1),
    category: 'security',
    icon: 'CheckCircle'
  },
  {
    id: 'activity_003',
    type: 'task',
    title: 'Profile Completion at 50%',
    description: 'Complete your profile to unlock more features',
    status: 'in_progress',
    createdAt: getTimestamp(5),
    updatedAt: getTimestamp(0),
    category: 'system',
    icon: 'AlertCircle'
  },
  {
    id: 'activity_004',
    type: 'achievement',
    title: 'Reached 10 Connections',
    description: 'Congratulations! You\'ve reached a milestone',
    status: 'completed',
    createdAt: getTimestamp(3),
    updatedAt: getTimestamp(3),
    category: 'milestone',
    icon: 'Trophy'
  },
  {
    id: 'activity_005',
    type: 'update',
    title: 'Profile Photo Updated',
    description: 'Your profile photo has been successfully updated',
    status: 'completed',
    createdAt: getTimestamp(1),
    updatedAt: getTimestamp(1),
    category: 'system',
    icon: 'Camera'
  }
];

const generateNotifications = () => [
  {
    id: 'notif_001',
    title: 'New Verification Request',
    message: 'Your identity needs verification for enhanced security',
    type: 'verification',
    read: false,
    createdAt: getTimestamp(0),
    priority: 'high',
    actionUrl: '/dashboard/verification'
  },
  {
    id: 'notif_002',
    title: 'Profile Updated Successfully',
    message: 'Your profile changes have been saved',
    type: 'update',
    read: true,
    createdAt: getTimestamp(1),
    priority: 'low',
    actionUrl: '/dashboard/profile'
  },
  {
    id: 'notif_003',
    title: 'New Connection Request',
    message: 'Sarah Miller wants to connect with you',
    type: 'connection',
    read: false,
    createdAt: getTimestamp(0),
    priority: 'medium',
    actionUrl: '/dashboard/contacts'
  }
];

const generateContacts = () => [
  {
    id: 'contact_001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1-555-0101',
    relationship: 'colleague',
    company: 'Tech Solutions Inc',
    title: 'Senior Developer',
    addedAt: getTimestamp(30),
    lastInteraction: getTimestamp(1)
  },
  {
    id: 'contact_002',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    phone: '+1-555-0102',
    relationship: 'mentor',
    company: 'Innovation Labs',
    title: 'CTO',
    addedAt: getTimestamp(60),
    lastInteraction: getTimestamp(3)
  },
  {
    id: 'contact_003',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    phone: '+1-555-0103',
    relationship: 'friend',
    company: 'Creative Agency',
    title: 'Design Lead',
    addedAt: getTimestamp(45),
    lastInteraction: getTimestamp(2)
  }
];

const generateCalendarEvents = () => [
  {
    id: 'event_001',
    title: 'Team Sync Meeting',
    description: 'Weekly synchronization with the team',
    startDate: getTimestamp(-1),
    endDate: getTimestamp(-1),
    location: 'Virtual - Zoom',
    attendees: 5,
    status: 'completed'
  },
  {
    id: 'event_002',
    title: 'Project Kickoff',
    description: 'Kickoff meeting for Q4 project',
    startDate: getTimestamp(3),
    endDate: getTimestamp(3),
    location: 'Conference Room A',
    attendees: 12,
    status: 'scheduled'
  },
  {
    id: 'event_003',
    title: 'Client Presentation',
    description: 'Present Q3 results to stakeholders',
    startDate: getTimestamp(5),
    endDate: getTimestamp(5),
    location: 'Virtual - Teams',
    attendees: 8,
    status: 'scheduled'
  }
];

const generateAssets = () => [
  {
    id: 'asset_001',
    name: 'Primary Residence',
    type: 'property',
    value: 450000,
    currency: 'USD',
    description: 'Family home in suburban area',
    addedAt: getTimestamp(365),
    status: 'active'
  },
  {
    id: 'asset_002',
    name: 'Company Stock Options',
    type: 'investment',
    value: 125000,
    currency: 'USD',
    description: 'Employee stock options vested',
    addedAt: getTimestamp(180),
    status: 'active'
  },
  {
    id: 'asset_003',
    name: 'Retirement Account (401k)',
    type: 'retirement',
    value: 280000,
    currency: 'USD',
    description: 'Tax-deferred retirement savings',
    addedAt: getTimestamp(365),
    status: 'active'
  }
];

const generateGoals = () => [
  {
    id: 'goal_001',
    title: 'Learn Advanced React',
    description: 'Complete advanced React patterns and hooks course',
    progress: 75,
    status: 'active',
    createdAt: getTimestamp(45),
    targetDate: getTimestamp(-15),
    priority: 'high',
    category: 'education'
  },
  {
    id: 'goal_002',
    title: 'Save $50,000',
    description: 'Build emergency fund to $50k',
    progress: 45,
    status: 'active',
    createdAt: getTimestamp(90),
    targetDate: getTimestamp(275),
    priority: 'medium',
    category: 'financial',
    currentSavings: 22500
  },
  {
    id: 'goal_003',
    title: 'Exercise 4x per week',
    description: 'Maintain consistent fitness routine',
    progress: 60,
    status: 'active',
    createdAt: getTimestamp(180),
    targetDate: getTimestamp(365),
    priority: 'medium',
    category: 'health'
  }
];

async function seedData() {
  try {
    log(colors.cyan, '\n╔════════════════════════════════════════════════════════════╗');
    log(colors.cyan, '║              PHASE 3.4: SEED DATA INITIALIZATION             ║');
    log(colors.cyan, '╚════════════════════════════════════════════════════════════╝\n');

    // Get or create test user
    log(colors.blue, '👤 Creating/Getting test user...');
    
    // We'll create a test UID for demonstration
    const testUserId = 'test_user_phase34_' + Date.now();
    
    // Step 1: Create user profile
    log(colors.blue, '📝 Creating user profile...');
    await db.collection('users').doc(testUserId).set({
      email: 'testuser@lifecycle.app',
      displayName: 'Test User - Phase 3.4',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser',
      completionPercent: 45,
      sections: 5,
      views: 12,
      createdAt: getTimestamp(30),
      updatedAt: getTimestamp(0),
      role: 'user',
      status: 'active'
    });
    log(colors.green, `  ✅ User profile created for ID: ${testUserId}`);

    // Step 2: Seed activities
    log(colors.blue, '🎯 Creating activities...');
    const activities = generateActivities();
    for (const activity of activities) {
      await db.collection('users').doc(testUserId).collection('activities').doc(activity.id).set(activity);
    }
    log(colors.green, `  ✅ Created ${activities.length} activities`);

    // Step 3: Seed notifications
    log(colors.blue, '🔔 Creating notifications...');
    const notifications = generateNotifications();
    for (const notification of notifications) {
      await db.collection('users').doc(testUserId).collection('notifications').doc(notification.id).set(notification);
    }
    log(colors.green, `  ✅ Created ${notifications.length} notifications`);

    // Step 4: Seed contacts
    log(colors.blue, '👥 Creating contacts...');
    const contacts = generateContacts();
    for (const contact of contacts) {
      await db.collection('users').doc(testUserId).collection('contacts').doc(contact.id).set(contact);
    }
    log(colors.green, `  ✅ Created ${contacts.length} contacts`);

    // Step 5: Seed calendar
    log(colors.blue, '📅 Creating calendar events...');
    const events = generateCalendarEvents();
    for (const event of events) {
      await db.collection('users').doc(testUserId).collection('calendar').doc(event.id).set(event);
    }
    log(colors.green, `  ✅ Created ${events.length} calendar events`);

    // Step 6: Seed assets
    log(colors.blue, '💼 Creating assets...');
    const assets = generateAssets();
    for (const asset of assets) {
      await db.collection('users').doc(testUserId).collection('assets').doc(asset.id).set(asset);
    }
    log(colors.green, `  ✅ Created ${assets.length} assets (total value: $855,000)`);

    // Step 7: Seed goals
    log(colors.blue, '🎯 Creating goals...');
    const goals = generateGoals();
    for (const goal of goals) {
      await db.collection('users').doc(testUserId).collection('goals').doc(goal.id).set(goal);
    }
    log(colors.green, `  ✅ Created ${goals.length} goals`);

    // Summary
    log(colors.green, '\n╔════════════════════════════════════════════════════════════╗');
    log(colors.green, '║             ✅ SEED DATA CREATION COMPLETE!                  ║');
    log(colors.green, '╠════════════════════════════════════════════════════════════╣');
    log(colors.green, `║ Test User ID: ${testUserId}`);
    log(colors.green, '║                                                            ║');
    log(colors.green, '║ Data Summary:                                              ║');
    log(colors.green, '║ • 5 activities across various categories                   ║');
    log(colors.green, '║ • 3 notifications (mix of read/unread)                    ║');
    log(colors.green, '║ • 3 contacts with full details                            ║');
    log(colors.green, '║ • 3 calendar events (past/future)                         ║');
    log(colors.green, '║ • 3 assets with $855k total value                         ║');
    log(colors.green, '║ • 3 goals across multiple categories                      ║');
    log(colors.green, '║                                                            ║');
    log(colors.green, '║ Next Steps:                                                ║');
    log(colors.green, '║ 1. Start dev server: npm run dev                          ║');
    log(colors.green, '║ 2. Log in with your Firebase credentials                  ║');
    log(colors.green, '║ 3. Check Firestore console to verify data                ║');
    log(colors.green, '║ 4. Test widgets with real data                            ║');
    log(colors.green, '╚════════════════════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (error) {
    log(colors.red, '❌ Error seeding data:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedData();
