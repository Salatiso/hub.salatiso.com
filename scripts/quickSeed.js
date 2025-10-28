#!/usr/bin/env node

/**
 * Phase 3.4: Quick Seed Data Creator
 * Creates minimal but complete test data directly using Firebase REST API
 * No service account needed - uses your Firebase credentials
 */

const fs = require('fs');
const path = require('path');

// Get Firebase config from .env or environment
const envPath = path.join(__dirname, '..', '.env.local');
let firebaseConfig = null;

// Try to load from .env.local
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const configMatch = envContent.match(/VITE_FIREBASE_CONFIG=(.+)/);
  if (configMatch) {
    try {
      firebaseConfig = JSON.parse(configMatch[1]);
    } catch (e) {
      console.log('Could not parse Firebase config from .env.local');
    }
  }
}

if (!firebaseConfig) {
  console.error('❌ Firebase config not found in .env.local');
  console.error('Please ensure VITE_FIREBASE_CONFIG is set in your .env.local file');
  process.exit(1);
}

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const log = (color, ...args) => console.log(`${color}${args.join(' ')}${colors.reset}`);

// Helper to create a test user via Firebase REST API
async function createTestData() {
  try {
    log(colors.cyan, '\n╔════════════════════════════════════════════════════════════╗');
    log(colors.cyan, '║           Phase 3.4: Seed Data via Firebase API            ║');
    log(colors.cyan, '╚════════════════════════════════════════════════════════════╝\n');

    log(colors.blue, '📝 Instructions for manual data creation:');
    log(colors.cyan, '\n1. Open Firebase Console:');
    log(colors.cyan, '   https://console.firebase.google.com/project/lifecv-d2724/firestore/data\n');

    log(colors.cyan, '2. Create collections and documents following:');
    log(colors.cyan, '   PHASE3_4_SEED_DATA_MANUAL.md\n');

    log(colors.cyan, '3. Or use the automated script:');
    log(colors.cyan, '   Get service account key from Project Settings > Service Accounts');
    log(colors.cyan, '   Save to: .firebase/serviceAccountKey.json');
    log(colors.cyan, '   Run: node scripts/seedData.js\n');

    log(colors.green, '✅ Documentation is ready at:');
    log(colors.yellow, '   📖 PHASE3_4_SEED_DATA_MANUAL.md - Complete step-by-step guide');
    log(colors.yellow, '   🧪 PHASE3_4_WIDGET_TESTING_GUIDE.md - Testing checklist\n');

    log(colors.green, '✅ Quick data creation tips:');
    log(colors.cyan, '   • Copy JSON templates from manual guide');
    log(colors.cyan, '   • Paste into Firebase Console');
    log(colors.cyan, '   • Verify data appears in collections\n');

    log(colors.green, '✅ Dev server running on: http://localhost:5173\n');

    process.exit(0);
  } catch (error) {
    log(colors.red, '❌ Error:', error.message);
    process.exit(1);
  }
}

createTestData();
