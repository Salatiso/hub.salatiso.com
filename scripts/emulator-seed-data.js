/**
 * Seed Data Populator for Firebase Emulator
 * 
 * This script creates all test collections and documents in the local
 * Firebase Emulator (NOT production Firebase).
 * 
 * Usage:
 *   1. Make sure emulator is running: firebase emulators:start
 *   2. Make sure dev server is running: npm run dev
 *   3. Open browser console (F12 → Console)
 *   4. Paste this entire script
 *   5. Run it
 */

// ✅ Check if we're using emulator
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('✅ Running on localhost - emulator mode active');
} else {
  console.warn('⚠️  Not on localhost - are you sure emulator is running?');
}

// Import Firestore (assumes it's available from your app)
// This script assumes your app has initialized Firestore already
// See: GuestLogin.tsx or Dashboard.tsx for Firestore setup

// Test data structure
const seedData = {
  'users': {
    'test-user-001': {
      id: 'test-user-001',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date().toISOString(),
      role: 'user',
      verified: true
    }
  },
  'users/test-user-001/activities': {
    'activity_001': {
      id: 'activity_001',
      title: 'Morning Run',
      description: '5km run at Central Park',
      date: '2025-10-30',
      time: '06:30',
      type: 'fitness',
      duration: 35,
      calories: 450
    },
    'activity_002': {
      id: 'activity_002',
      title: 'Team Meeting',
      description: 'Project planning session',
      date: '2025-10-30',
      time: '10:00',
      type: 'work',
      duration: 60,
      participants: 5
    },
    'activity_003': {
      id: 'activity_003',
      title: 'Lunch with Sarah',
      description: 'Italian restaurant downtown',
      date: '2025-10-30',
      time: '12:30',
      type: 'social',
      location: 'Downtown'
    },
    'activity_004': {
      id: 'activity_004',
      title: 'Reading',
      description: "Reading 'Atomic Habits'",
      date: '2025-10-30',
      time: '20:00',
      type: 'personal',
      duration: 45,
      pages: 25
    },
    'activity_005': {
      id: 'activity_005',
      title: 'Code Review',
      description: 'Reviewing PR #234',
      date: '2025-10-30',
      time: '14:00',
      type: 'work',
      duration: 30
    }
  },
  'users/test-user-001/notifications': {
    'notif_001': {
      id: 'notif_001',
      title: 'Meeting Reminder',
      message: 'Team standup in 15 minutes',
      type: 'reminder',
      read: false,
      timestamp: new Date().toISOString(),
      priority: 'high'
    },
    'notif_002': {
      id: 'notif_002',
      title: 'Goal Progress',
      message: 'You completed 80% of your weekly fitness goal!',
      type: 'achievement',
      read: false,
      timestamp: new Date().toISOString(),
      priority: 'medium'
    },
    'notif_003': {
      id: 'notif_003',
      title: 'Asset Alert',
      message: 'Car maintenance scheduled in 2 weeks',
      type: 'alert',
      read: true,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      priority: 'low'
    }
  },
  'users/test-user-001/contacts': {
    'contact_001': {
      id: 'contact_001',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '+1-555-0101',
      relationship: 'colleague',
      company: 'Tech Corp',
      lastContact: '2025-10-28'
    },
    'contact_002': {
      id: 'contact_002',
      name: 'Bob Smith',
      email: 'bob@example.com',
      phone: '+1-555-0102',
      relationship: 'friend',
      birthday: '1990-05-15'
    },
    'contact_003': {
      id: 'contact_003',
      name: 'Carol White',
      email: 'carol@example.com',
      phone: '+1-555-0103',
      relationship: 'family',
      relationship_type: 'sister'
    }
  },
  'users/test-user-001/calendar': {
    'event_001': {
      id: 'event_001',
      title: 'Project Deadline',
      date: '2025-11-15',
      startTime: '09:00',
      endTime: '17:00',
      description: 'Complete project X',
      location: 'Office',
      type: 'work'
    },
    'event_002': {
      id: 'event_002',
      title: 'Family Dinner',
      date: '2025-11-02',
      startTime: '18:00',
      endTime: '20:00',
      description: 'Sunday dinner at home',
      attendees: 4
    },
    'event_003': {
      id: 'event_003',
      title: 'Conference',
      date: '2025-11-10',
      startTime: '08:00',
      endTime: '18:00',
      description: 'Annual tech conference',
      location: 'Convention Center'
    }
  },
  'users/test-user-001/assets': {
    'asset_001': {
      id: 'asset_001',
      name: 'Tesla Model 3',
      type: 'vehicle',
      purchasePrice: 45000,
      currentValue: 38000,
      purchaseDate: '2022-03-15',
      location: 'Garage',
      insurance: 'Active'
    },
    'asset_002': {
      id: 'asset_002',
      name: 'Primary Residence',
      type: 'property',
      purchasePrice: 650000,
      currentValue: 750000,
      purchaseDate: '2018-06-20',
      location: '123 Main St'
    },
    'asset_003': {
      id: 'asset_003',
      name: 'Investment Portfolio',
      type: 'investment',
      purchasePrice: 100000,
      currentValue: 122000,
      purchaseDate: '2020-01-10',
      allocation: '60% stocks, 40% bonds'
    }
  },
  'users/test-user-001/goals': {
    'goal_001': {
      id: 'goal_001',
      title: 'Run 100 miles this year',
      category: 'fitness',
      target: 100,
      current: 45,
      unit: 'miles',
      deadline: '2025-12-31',
      priority: 'high'
    },
    'goal_002': {
      id: 'goal_002',
      title: 'Save $25,000',
      category: 'finance',
      target: 25000,
      current: 12500,
      unit: 'dollars',
      deadline: '2026-03-31'
    },
    'goal_003': {
      id: 'goal_003',
      title: 'Read 12 books',
      category: 'personal',
      target: 12,
      current: 3,
      unit: 'books',
      deadline: '2025-12-31'
    }
  },
  'users/test-user-001/verifications': {
    'verification_001': {
      id: 'verification_001',
      email: {
        verified: true,
        verifiedDate: new Date().toISOString()
      },
      phone: {
        verified: false
      },
      identity: {
        verified: false
      },
      twoFactorEnabled: false
    }
  }
};

console.log('📊 Seed Data Structure Ready');
console.log('Total collections: 8');
console.log('Total documents: 22');
console.log('');
console.log('TO MANUALLY CREATE IN FIRESTORE EMULATOR UI:');
console.log('1. Go to http://localhost:4000');
console.log('2. Click Firestore Database');
console.log('3. Create collections with the data above');
console.log('');
console.log('OR use this command to generate JSON export:');
console.log('JSON.stringify(seedData, null, 2)');
console.log('');

// Export for use
window.seedData = seedData;

console.log('✅ Seed data loaded! Use: window.seedData');
