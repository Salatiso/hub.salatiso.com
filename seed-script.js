#!/usr/bin/env node

/**
 * Seed Script for Firebase Firestore
 * Creates test data for Phase 3.4 testing
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, '.firebase', 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service account key not found at:', serviceAccountPath);
  console.error('Please ensure Firebase Admin SDK credentials are available.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'lifecv-d2724'
});

const db = admin.firestore();

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const log = (color, ...args) => console.log(`${color}${args.join(' ')}${colors.reset}`);

// Utility functions
const getTimestamp = (daysAgo = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return admin.firestore.Timestamp.fromDate(date);
};

// Seed data
const seedData = {
  users: {
    'test-user-001': {
      displayName: 'Test User',
      email: 'testuser@lifecycle.app',
      completionPercent: 45,
      sections: 5,
      views: 12,
      createdAt: getTimestamp(7),
      updatedAt: getTimestamp(0),
      role: 'user',
      status: 'active'
    }
  },
  'users/test-user-001/activities': {
    'activity_001': {
      id: 'activity_001',
      type: 'connection',
      title: 'Connected with Sarah Miller',
      description: 'New professional connection added',
      status: 'completed',
      category: 'networking',
      createdAt: getTimestamp(2),
      updatedAt: getTimestamp(2)
    },
    'activity_002': {
      id: 'activity_002',
      type: 'verification',
      title: 'Email Verification Completed',
      description: 'Email verified successfully',
      status: 'completed',
      category: 'security',
      createdAt: getTimestamp(1),
      updatedAt: getTimestamp(1)
    },
    'activity_003': {
      id: 'activity_003',
      type: 'task',
      title: 'Profile 50% Complete',
      description: 'Keep building your profile',
      status: 'in_progress',
      category: 'system',
      createdAt: getTimestamp(5),
      updatedAt: getTimestamp(0)
    },
    'activity_004': {
      id: 'activity_004',
      type: 'achievement',
      title: 'Reached 10 Connections',
      description: 'Milestone achieved!',
      status: 'completed',
      category: 'milestone',
      createdAt: getTimestamp(3),
      updatedAt: getTimestamp(3)
    },
    'activity_005': {
      id: 'activity_005',
      type: 'update',
      title: 'Profile Photo Updated',
      description: 'New photo set',
      status: 'completed',
      category: 'system',
      createdAt: getTimestamp(1),
      updatedAt: getTimestamp(1)
    }
  },
  'users/test-user-001/notifications': {
    'notif_001': {
      id: 'notif_001',
      title: 'Verification Needed',
      message: 'Identity verification required',
      type: 'verification',
      read: false,
      priority: 'high',
      createdAt: getTimestamp(0)
    },
    'notif_002': {
      id: 'notif_002',
      title: 'Profile Updated',
      message: 'Changes saved successfully',
      type: 'update',
      read: true,
      priority: 'low',
      createdAt: getTimestamp(1)
    },
    'notif_003': {
      id: 'notif_003',
      title: 'New Connection',
      message: 'Sarah wants to connect',
      type: 'connection',
      read: false,
      priority: 'medium',
      createdAt: getTimestamp(0)
    }
  },
  'users/test-user-001/contacts': {
    'contact_001': {
      id: 'contact_001',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1-555-0101',
      relationship: 'colleague',
      company: 'Tech Solutions',
      title: 'Senior Developer',
      addedAt: getTimestamp(60),
      lastInteraction: getTimestamp(1)
    },
    'contact_002': {
      id: 'contact_002',
      name: 'Michael Chen',
      email: 'michael@example.com',
      phone: '+1-555-0102',
      relationship: 'mentor',
      company: 'Innovation Labs',
      title: 'CTO',
      addedAt: getTimestamp(60),
      lastInteraction: getTimestamp(3)
    },
    'contact_003': {
      id: 'contact_003',
      name: 'Emily Rodriguez',
      email: 'emily@example.com',
      phone: '+1-555-0103',
      relationship: 'friend',
      company: 'Creative Agency',
      title: 'Design Lead',
      addedAt: getTimestamp(45),
      lastInteraction: getTimestamp(2)
    }
  },
  'users/test-user-001/calendar': {
    'event_001': {
      id: 'event_001',
      title: 'Team Meeting',
      description: 'Weekly sync',
      startDate: getTimestamp(-1),
      endDate: getTimestamp(-1),
      location: 'Virtual',
      attendees: 5,
      status: 'completed'
    },
    'event_002': {
      id: 'event_002',
      title: 'Project Kickoff',
      description: 'Q4 project starts',
      startDate: getTimestamp(3),
      endDate: getTimestamp(3),
      location: 'Conference Room',
      attendees: 12,
      status: 'scheduled'
    },
    'event_003': {
      id: 'event_003',
      title: 'Client Presentation',
      description: 'Q3 results',
      startDate: getTimestamp(5),
      endDate: getTimestamp(5),
      location: 'Virtual',
      attendees: 8,
      status: 'scheduled'
    }
  },
  'users/test-user-001/assets': {
    'asset_001': {
      id: 'asset_001',
      name: 'Primary Residence',
      type: 'property',
      value: 450000,
      currency: 'USD',
      description: 'Home',
      addedAt: getTimestamp(365),
      status: 'active'
    },
    'asset_002': {
      id: 'asset_002',
      name: 'Stock Options',
      type: 'investment',
      value: 125000,
      currency: 'USD',
      description: 'Company options',
      addedAt: getTimestamp(180),
      status: 'active'
    },
    'asset_003': {
      id: 'asset_003',
      name: '401k',
      type: 'retirement',
      value: 280000,
      currency: 'USD',
      description: 'Retirement savings',
      addedAt: getTimestamp(365),
      status: 'active'
    }
  },
  'users/test-user-001/goals': {
    'goal_001': {
      id: 'goal_001',
      title: 'Learn React',
      description: 'Advanced patterns',
      progress: 75,
      status: 'active',
      createdAt: getTimestamp(45),
      targetDate: getTimestamp(-15),
      priority: 'high',
      category: 'education'
    },
    'goal_002': {
      id: 'goal_002',
      title: 'Save $50k',
      description: 'Emergency fund',
      progress: 45,
      status: 'active',
      createdAt: getTimestamp(90),
      targetDate: getTimestamp(275),
      priority: 'medium',
      category: 'financial'
    },
    'goal_003': {
      id: 'goal_003',
      title: 'Exercise 4x/week',
      description: 'Fitness routine',
      progress: 60,
      status: 'active',
      createdAt: getTimestamp(180),
      targetDate: getTimestamp(365),
      priority: 'medium',
      category: 'health'
    }
  },
  'users/test-user-001/verifications': {
    'verify_001': {
      id: 'verify_001',
      type: 'email',
      status: 'verified',
      value: 'testuser@lifecycle.app',
      verifiedAt: getTimestamp(10),
      expiresAt: getTimestamp(-355)
    }
  }
};

// Main seeding function
async function seedDatabase() {
  try {
    log(colors.cyan, '\n╔════════════════════════════════════════════════════════════╗');
    log(colors.cyan, '║                 SEEDING FIRESTORE DATABASE                   ║');
    log(colors.cyan, '╚════════════════════════════════════════════════════════════╝\n');

    let totalDocuments = 0;

    for (const [collectionPath, documents] of Object.entries(seedData)) {
      log(colors.blue, `📝 Seeding collection: ${collectionPath}`);

      for (const [docId, data] of Object.entries(documents)) {
        const docRef = db.doc(`${collectionPath}/${docId}`);
        await docRef.set(data);
        totalDocuments++;
        log(colors.green, `  ✅ Created document: ${docId}`);
      }
    }

    log(colors.green, '\n╔════════════════════════════════════════════════════════════╗');
    log(colors.green, '║                  ✅ SEEDING COMPLETE!                       ║');
    log(colors.green, `║ Total documents created: ${totalDocuments}                     ║`);
    log(colors.green, '║                                                            ║');
    log(colors.green, '║ Test User ID: test-user-001                               ║');
    log(colors.green, '║ Test Email: testuser@lifecycle.app                        ║');
    log(colors.green, '╚════════════════════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (error) {
    log(colors.red, '\n❌ SEEDING FAILED');
    console.error(error);
    process.exit(1);
  }
}

// Run the seed
seedDatabase();