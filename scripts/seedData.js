#!/usr/bin/env node

/**
 * Phase 3.4: Seed Data Script
 * Populates Firestore with comprehensive test data for all 12 widgets
 * 
 * Usage: node scripts/seedData.js
 * 
 * This script will:
 * 1. Create a test user account
 * 2. Populate all collections with realistic sample data
 * 3. Verify data was created successfully
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, '..', '.firebase', 'serviceAccountKey.json');

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
const auth = admin.auth();

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

const getDate = (daysAgo = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

// ============================================================================
// SEED DATA TEMPLATES
// ============================================================================

const seedActivities = (userId) => {
  const activityTypes = ['connection', 'task', 'verification', 'update', 'achievement'];
  const statuses = ['pending', 'in_progress', 'completed'];
  const categories = ['networking', 'system', 'milestone', 'security'];

  const activities = [
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
    },
    {
      id: 'activity_006',
      type: 'connection',
      title: 'Connected with Michael Chen',
      description: 'New professional connection added',
      status: 'completed',
      createdAt: getTimestamp(1),
      updatedAt: getTimestamp(1),
      category: 'networking',
      icon: 'Users'
    },
    {
      id: 'activity_007',
      type: 'task',
      title: 'Pending: Phone Verification',
      description: 'Verify your phone number to enhance security',
      status: 'pending',
      createdAt: getTimestamp(4),
      updatedAt: getTimestamp(4),
      category: 'security',
      icon: 'Phone'
    },
    {
      id: 'activity_008',
      type: 'update',
      title: 'Bio Updated',
      description: 'Your professional bio has been updated',
      status: 'completed',
      createdAt: getTimestamp(0),
      updatedAt: getTimestamp(0),
      category: 'system',
      icon: 'Edit'
    },
    {
      id: 'activity_009',
      type: 'verification',
      title: 'Identity Verification in Progress',
      description: 'Please complete the remaining verification steps',
      status: 'in_progress',
      createdAt: getTimestamp(2),
      updatedAt: getTimestamp(1),
      category: 'security',
      icon: 'AlertCircle'
    },
    {
      id: 'activity_010',
      type: 'connection',
      title: 'Connected with Emily Rodriguez',
      description: 'New professional connection added',
      status: 'completed',
      createdAt: getTimestamp(0),
      updatedAt: getTimestamp(0),
      category: 'networking',
      icon: 'Users'
    }
  ];

  return activities;
};

const seedNotifications = (userId) => {
  const notifications = [
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
    },
    {
      id: 'notif_004',
      title: 'Milestone Achievement',
      message: 'You\'ve reached 10 connections! Great progress!',
      type: 'achievement',
      read: true,
      createdAt: getTimestamp(2),
      priority: 'low',
      actionUrl: '/dashboard'
    },
    {
      id: 'notif_005',
      title: 'Security Alert',
      message: 'New login detected from a new device',
      type: 'security',
      read: true,
      createdAt: getTimestamp(1),
      priority: 'high',
      actionUrl: '/settings/security'
    },
    {
      id: 'notif_006',
      title: 'Upcoming Meeting Reminder',
      message: 'Team Meeting starts in 1 hour',
      type: 'reminder',
      read: false,
      createdAt: getTimestamp(0),
      priority: 'high',
      actionUrl: '/dashboard/calendar'
    }
  ];

  return notifications;
};

const seedContacts = (userId) => {
  const contacts = [
    {
      id: 'contact_001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+1-555-0101',
      relationship: 'colleague',
      company: 'Tech Solutions Inc',
      title: 'Senior Developer',
      addedAt: getTimestamp(30),
      lastInteraction: getTimestamp(1),
      notes: 'Met at tech conference',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
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
      lastInteraction: getTimestamp(3),
      notes: 'Industry mentor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'
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
      lastInteraction: getTimestamp(2),
      notes: 'College friend',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily'
    },
    {
      id: 'contact_004',
      name: 'James Wilson',
      email: 'james.wilson@example.com',
      phone: '+1-555-0104',
      relationship: 'client',
      company: 'Marketing Pro',
      title: 'Marketing Manager',
      addedAt: getTimestamp(90),
      lastInteraction: getTimestamp(5),
      notes: 'Active client',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James'
    },
    {
      id: 'contact_005',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@example.com',
      phone: '+1-555-0105',
      relationship: 'colleague',
      company: 'Tech Solutions Inc',
      title: 'Product Manager',
      addedAt: getTimestamp(20),
      lastInteraction: getTimestamp(0),
      notes: 'Works in product team',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa'
    }
  ];

  return contacts;
};

const seedCalendarEvents = (userId) => {
  const events = [
    {
      id: 'event_001',
      title: 'Team Sync Meeting',
      description: 'Weekly synchronization with the team',
      startDate: getTimestamp(-1),
      endDate: getTimestamp(-1),
      location: 'Virtual - Zoom',
      attendees: 5,
      status: 'completed',
      reminderMinutes: 15,
      color: '#3B82F6'
    },
    {
      id: 'event_002',
      title: 'Project Kickoff',
      description: 'Kickoff meeting for Q4 project',
      startDate: getTimestamp(3),
      endDate: getTimestamp(3),
      location: 'Conference Room A',
      attendees: 12,
      status: 'scheduled',
      reminderMinutes: 30,
      color: '#10B981'
    },
    {
      id: 'event_003',
      title: 'Client Presentation',
      description: 'Present Q3 results to stakeholders',
      startDate: getTimestamp(5),
      endDate: getTimestamp(5),
      location: 'Virtual - Teams',
      attendees: 8,
      status: 'scheduled',
      reminderMinutes: 60,
      color: '#F59E0B'
    },
    {
      id: 'event_004',
      title: 'Professional Development',
      description: 'Advanced React workshop',
      startDate: getTimestamp(7),
      endDate: getTimestamp(7),
      location: 'Online Course',
      attendees: 1,
      status: 'scheduled',
      reminderMinutes: 120,
      color: '#8B5CF6'
    },
    {
      id: 'event_005',
      title: 'Networking Lunch',
      description: 'Lunch with industry peers',
      startDate: getTimestamp(2),
      endDate: getTimestamp(2),
      location: 'Downtown Restaurant',
      attendees: 4,
      status: 'scheduled',
      reminderMinutes: 60,
      color: '#EC4899'
    }
  ];

  return events;
};

const seedAssets = (userId) => {
  const assets = [
    {
      id: 'asset_001',
      name: 'Primary Residence',
      type: 'property',
      value: 450000,
      currency: 'USD',
      description: 'Family home in suburban area',
      addedAt: getTimestamp(365),
      status: 'active',
      location: 'California, USA',
      mortgageRemaining: 250000
    },
    {
      id: 'asset_002',
      name: 'Company Stock Options',
      type: 'investment',
      value: 125000,
      currency: 'USD',
      description: 'Employee stock options vested',
      addedAt: getTimestamp(180),
      status: 'active',
      vestingPercentage: 75
    },
    {
      id: 'asset_003',
      name: 'Retirement Account (401k)',
      type: 'retirement',
      value: 280000,
      currency: 'USD',
      description: 'Tax-deferred retirement savings',
      addedAt: getTimestamp(365),
      status: 'active',
      contributionRate: 6
    },
    {
      id: 'asset_004',
      name: 'Investment Portfolio',
      type: 'investment',
      value: 95000,
      currency: 'USD',
      description: 'Diversified index funds and ETFs',
      addedAt: getTimestamp(90),
      status: 'active',
      allocation: { stocks: 60, bonds: 30, cash: 10 }
    },
    {
      id: 'asset_005',
      name: 'Vehicle',
      type: 'vehicle',
      value: 35000,
      currency: 'USD',
      description: 'Luxury sedan',
      addedAt: getTimestamp(60),
      status: 'active',
      year: 2022,
      make: 'Tesla'
    },
    {
      id: 'asset_006',
      name: 'Savings Account',
      type: 'cash',
      value: 50000,
      currency: 'USD',
      description: 'Emergency fund',
      addedAt: getTimestamp(365),
      status: 'active',
      interestRate: 4.5
    }
  ];

  return assets;
};

const seedGoals = (userId) => {
  const goals = [
    {
      id: 'goal_001',
      title: 'Learn Advanced React',
      description: 'Complete advanced React patterns and hooks course',
      progress: 75,
      status: 'active',
      createdAt: getTimestamp(45),
      targetDate: getTimestamp(-15),
      priority: 'high',
      category: 'education',
      milestones: [
        { title: 'Complete hooks module', completed: true },
        { title: 'Build project', completed: true },
        { title: 'Review advanced patterns', completed: false }
      ]
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
      currentSavings: 22500,
      monthlyTarget: 2000
    },
    {
      id: 'goal_003',
      title: 'Complete Professional Certifications',
      description: 'Earn AWS and Kubernetes certifications',
      progress: 30,
      status: 'active',
      createdAt: getTimestamp(60),
      targetDate: getTimestamp(120),
      priority: 'high',
      category: 'career',
      certifications: [
        { title: 'AWS Solutions Architect', completed: false },
        { title: 'Kubernetes CKAD', completed: false }
      ]
    },
    {
      id: 'goal_004',
      title: 'Exercise 4x per week',
      description: 'Maintain consistent fitness routine',
      progress: 60,
      status: 'active',
      createdAt: getTimestamp(180),
      targetDate: getTimestamp(365),
      priority: 'medium',
      category: 'health',
      weeksActive: 12
    },
    {
      id: 'goal_005',
      title: 'Read 24 Books',
      description: 'Read 2 books per month',
      progress: 33,
      status: 'active',
      createdAt: getTimestamp(90),
      targetDate: getTimestamp(180),
      priority: 'low',
      category: 'personal',
      booksCompleted: 8
    },
    {
      id: 'goal_006',
      title: 'Build Side Project',
      description: 'Launch open source project',
      progress: 20,
      status: 'active',
      createdAt: getTimestamp(30),
      targetDate: getTimestamp(150),
      priority: 'medium',
      category: 'career',
      repository: 'github.com/username/project'
    }
  ];

  return goals;
};

const seedVerifications = (userId) => {
  const verifications = [
    {
      id: 'verify_001',
      type: 'email',
      status: 'verified',
      value: 'testuser@lifecycle.app',
      verifiedAt: getTimestamp(10),
      expiresAt: getTimestamp(365)
    },
    {
      id: 'verify_002',
      type: 'phone',
      status: 'pending',
      value: '+1-555-0000',
      requestedAt: getTimestamp(1),
      expiresAt: getTimestamp(3)
    },
    {
      id: 'verify_003',
      type: 'identity',
      status: 'in_progress',
      value: 'Document upload pending',
      requestedAt: getTimestamp(2),
      expiresAt: getTimestamp(7)
    },
    {
      id: 'verify_004',
      type: 'address',
      status: 'verified',
      value: '123 Main Street, Anytown, CA 12345',
      verifiedAt: getTimestamp(30),
      expiresAt: getTimestamp(365)
    },
    {
      id: 'verify_005',
      type: 'background',
      status: 'verified',
      value: 'Background check cleared',
      verifiedAt: getTimestamp(60),
      expiresAt: getTimestamp(420)
    }
  ];

  return verifications;
};

const seedHealthData = (userId) => {
  const healthEntries = [];

  for (let i = 7; i >= 0; i--) {
    const date = getDate(i);
    healthEntries.push({
      id: `health_${String(i).padStart(3, '0')}`,
      date,
      timestamp: getTimestamp(i),
      heartRate: Math.floor(60 + Math.random() * 30),
      steps: Math.floor(5000 + Math.random() * 8000),
      energyLevel: Math.floor(50 + Math.random() * 50),
      mood: ['great', 'good', 'okay', 'tired'].sort(() => 0.5 - Math.random())[0],
      sleepHours: Math.round((5.5 + Math.random() * 3) * 10) / 10,
      waterIntake: Math.floor(4 + Math.random() * 8),
      exerciseMinutes: Math.floor(Math.random() * 60),
      weight: 170 + (Math.random() - 0.5) * 5
    });
  }

  return healthEntries;
};

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function seedDatabase() {
  try {
    log(colors.cyan, '\n╔════════════════════════════════════════════════════════════╗');
    log(colors.cyan, '║                 PHASE 3.4: SEED DATA START                   ║');
    log(colors.cyan, '╚════════════════════════════════════════════════════════════╝\n');

    // Step 1: Create test user
    log(colors.blue, '📝 Step 1/9: Creating test user account...');
    let testUserId;
    
    try {
      const existingUser = await auth.getUserByEmail('testuser@lifecycle.app').catch(() => null);
      if (existingUser) {
        testUserId = existingUser.uid;
        log(colors.yellow, `  ⚠️  Test user already exists: ${testUserId}`);
      } else {
        const userRecord = await auth.createUser({
          email: 'testuser@lifecycle.app',
          password: 'TestPass123!',
          displayName: 'Test User',
          emailVerified: true
        });
        testUserId = userRecord.uid;
        log(colors.green, `  ✅ Test user created: ${testUserId}`);
      }
    } catch (error) {
      log(colors.red, `  ❌ Error creating user: ${error.message}`);
      throw error;
    }

    // Step 2: Create user profile
    log(colors.blue, '👤 Step 2/9: Creating user profile...');
    try {
      const userProfileRef = db.collection('users').doc(testUserId);
      await userProfileRef.set({
        email: 'testuser@lifecycle.app',
        displayName: 'Test User',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser',
        completionPercent: 45,
        sections: 5,
        views: 12,
        createdAt: getTimestamp(30),
        updatedAt: getTimestamp(0),
        role: 'user',
        status: 'active'
      });
      log(colors.green, `  ✅ User profile created`);
    } catch (error) {
      log(colors.red, `  ❌ Error creating profile: ${error.message}`);
      throw error;
    }

    // Step 3: Seed activities
    log(colors.blue, '🎯 Step 3/9: Seeding activities...');
    try {
      const activitiesCollection = db.collection('users').doc(testUserId).collection('activities');
      const activities = seedActivities(testUserId);
      
      for (const activity of activities) {
        await activitiesCollection.doc(activity.id).set(activity);
      }
      log(colors.green, `  ✅ Created ${activities.length} activities`);
    } catch (error) {
      log(colors.red, `  ❌ Error seeding activities: ${error.message}`);
      throw error;
    }

    // Step 4: Seed notifications
    log(colors.blue, '🔔 Step 4/9: Seeding notifications...');
    try {
      const notificationsCollection = db.collection('users').doc(testUserId).collection('notifications');
      const notifications = seedNotifications(testUserId);
      
      for (const notification of notifications) {
        await notificationsCollection.doc(notification.id).set(notification);
      }
      log(colors.green, `  ✅ Created ${notifications.length} notifications`);
    } catch (error) {
      log(colors.red, `  ❌ Error seeding notifications: ${error.message}`);
      throw error;
    }

    // Step 5: Seed contacts
    log(colors.blue, '👥 Step 5/9: Seeding contacts...');
    try {
      const contactsCollection = db.collection('users').doc(testUserId).collection('contacts');
      const contacts = seedContacts(testUserId);
      
      for (const contact of contacts) {
        await contactsCollection.doc(contact.id).set(contact);
      }
      log(colors.green, `  ✅ Created ${contacts.length} contacts`);
    } catch (error) {
      log(colors.red, `  ❌ Error seeding contacts: ${error.message}`);
      throw error;
    }

    // Step 6: Seed calendar events
    log(colors.blue, '📅 Step 6/9: Seeding calendar events...');
    try {
      const calendarCollection = db.collection('users').doc(testUserId).collection('calendar');
      const events = seedCalendarEvents(testUserId);
      
      for (const event of events) {
        await calendarCollection.doc(event.id).set(event);
      }
      log(colors.green, `  ✅ Created ${events.length} calendar events`);
    } catch (error) {
      log(colors.red, `  ❌ Error seeding calendar: ${error.message}`);
      throw error;
    }

    // Step 7: Seed assets
    log(colors.blue, '💼 Step 7/9: Seeding assets...');
    try {
      const assetsCollection = db.collection('users').doc(testUserId).collection('assets');
      const assets = seedAssets(testUserId);
      
      for (const asset of assets) {
        await assetsCollection.doc(asset.id).set(asset);
      }
      log(colors.green, `  ✅ Created ${assets.length} assets`);
    } catch (error) {
      log(colors.red, `  ❌ Error seeding assets: ${error.message}`);
      throw error;
    }

    // Step 8: Seed goals
    log(colors.blue, '🎯 Step 8/9: Seeding goals...');
    try {
      const goalsCollection = db.collection('users').doc(testUserId).collection('goals');
      const goals = seedGoals(testUserId);
      
      for (const goal of goals) {
        await goalsCollection.doc(goal.id).set(goal);
      }
      log(colors.green, `  ✅ Created ${goals.length} goals`);
    } catch (error) {
      log(colors.red, `  ❌ Error seeding goals: ${error.message}`);
      throw error;
    }

    // Step 9: Seed verifications and health data
    log(colors.blue, '✅ Step 9/9: Seeding verifications and health data...');
    try {
      const verificationsCollection = db.collection('users').doc(testUserId).collection('verifications');
      const verifications = seedVerifications(testUserId);
      
      for (const verification of verifications) {
        await verificationsCollection.doc(verification.id).set(verification);
      }
      log(colors.green, `  ✅ Created ${verifications.length} verifications`);

      const healthCollection = db.collection('users').doc(testUserId).collection('health');
      const healthData = seedHealthData(testUserId);
      
      for (const entry of healthData) {
        await healthCollection.doc(entry.id).set(entry);
      }
      log(colors.green, `  ✅ Created ${healthData.length} health data entries`);
    } catch (error) {
      log(colors.red, `  ❌ Error seeding verifications/health: ${error.message}`);
      throw error;
    }

    // Summary
    log(colors.green, '\n╔════════════════════════════════════════════════════════════╗');
    log(colors.green, '║                  ✅ SEED DATA COMPLETE!                     ║');
    log(colors.green, '╠════════════════════════════════════════════════════════════╣');
    log(colors.green, `║ Test User ID: ${testUserId.substring(0, 50)}`);
    log(colors.green, '║ Test Email: testuser@lifecycle.app                          ║');
    log(colors.green, '║ Test Password: TestPass123!                                 ║');
    log(colors.green, '║                                                            ║');
    log(colors.green, '║ Data Created:                                              ║');
    log(colors.green, '║ • 1 user profile                                           ║');
    log(colors.green, '║ • 10 activities                                            ║');
    log(colors.green, '║ • 6 notifications                                          ║');
    log(colors.green, '║ • 5 contacts                                               ║');
    log(colors.green, '║ • 5 calendar events                                        ║');
    log(colors.green, '║ • 6 assets (total value: $935k)                           ║');
    log(colors.green, '║ • 6 goals (financial, career, health)                     ║');
    log(colors.green, '║ • 5 verifications                                          ║');
    log(colors.green, '║ • 8 days of health data                                    ║');
    log(colors.green, '║                                                            ║');
    log(colors.green, '║ Next Steps:                                                ║');
    log(colors.green, '║ 1. Log in with test account                               ║');
    log(colors.green, '║ 2. Verify all 12 widgets display data correctly           ║');
    log(colors.green, '║ 3. Test widget interactions and real-time updates         ║');
    log(colors.green, '║ 4. Run performance tests                                   ║');
    log(colors.green, '╚════════════════════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (error) {
    log(colors.red, '\n❌ SEED DATA FAILED');
    console.error(error);
    process.exit(1);
  }
}

// Run the seed
seedDatabase();
