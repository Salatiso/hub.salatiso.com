#!/usr/bin/env node
/**
 * Phase 3.4 - Firebase Firestore Connection Validator
 * This script checks if Firebase is properly connected and can access Firestore
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

console.log('\n════════════════════════════════════════════════════════');
console.log('🔍 PHASE 3.4: Firebase Firestore Connection Validator');
console.log('════════════════════════════════════════════════════════\n');

// Check if serviceAccountKey.json exists
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.log('⚠️  Note: serviceAccountKey.json not found.');
  console.log('This script requires Firebase Admin SDK configuration.');
  console.log('For local development, you can test Firestore via:');
  console.log('  1. Firebase Console: https://console.firebase.google.com');
  console.log('  2. Open your project → Firestore Database');
  console.log('  3. Check collections exist:\n');
  
  const collections = [
    'users/{test-user-001}',
    'users/{test-user-001}/activities',
    'users/{test-user-001}/notifications',
    'users/{test-user-001}/contacts',
    'users/{test-user-001}/calendar',
    'users/{test-user-001}/assets',
    'users/{test-user-001}/goals',
    'users/{test-user-001}/verifications'
  ];
  
  collections.forEach((coll, idx) => {
    console.log(`  ${idx + 1}. ${coll}`);
  });
  
  console.log('\n📋 Expected Documents:\n');
  console.log('  activities/: 5 documents');
  console.log('  notifications/: 3 documents');
  console.log('  contacts/: 3 documents');
  console.log('  calendar/: 3 documents');
  console.log('  assets/: 3 documents');
  console.log('  goals/: 3 documents');
  console.log('  verifications/: 1 document');
  console.log('  Total: 22 documents\n');
  
  console.log('✅ After creating all collections and documents:');
  console.log('  1. Go to: http://localhost:3001');
  console.log('  2. Sign in with PIN: 1234');
  console.log('  3. Check if all 12 widgets display data\n');
  
  process.exit(0);
}

// Initialize Firebase Admin SDK
try {
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://lifecv-d2724.firebaseio.com'
  });
  
  console.log('✅ Firebase Admin SDK initialized\n');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:');
  console.error(error.message);
  process.exit(1);
}

// Get Firestore instance
const db = admin.firestore();

async function validateCollections() {
  try {
    console.log('🔍 Checking Firestore Collections...\n');
    
    // Expected structure
    const expectedStructure = {
      'users/test-user-001': {
        docCount: 1,
        name: 'Main user document'
      },
      'users/test-user-001/activities': {
        docCount: 5,
        name: 'Activities subcollection'
      },
      'users/test-user-001/notifications': {
        docCount: 3,
        name: 'Notifications subcollection'
      },
      'users/test-user-001/contacts': {
        docCount: 3,
        name: 'Contacts subcollection'
      },
      'users/test-user-001/calendar': {
        docCount: 3,
        name: 'Calendar events subcollection'
      },
      'users/test-user-001/assets': {
        docCount: 3,
        name: 'Assets subcollection'
      },
      'users/test-user-001/goals': {
        docCount: 3,
        name: 'Goals subcollection'
      },
      'users/test-user-001/verifications': {
        docCount: 1,
        name: 'Verifications subcollection'
      }
    };
    
    let totalDocs = 0;
    let allCollectionsFound = true;
    
    // Check users collection
    const usersRef = db.collection('users');
    const usersSnapshot = await usersRef.get();
    
    if (usersSnapshot.empty) {
      console.log('❌ users collection: NOT FOUND');
      allCollectionsFound = false;
    } else {
      console.log(`✅ users collection: Found (${usersSnapshot.size} documents)\n`);
      
      // Check user document
      const userDoc = await db.collection('users').doc('test-user-001').get();
      
      if (!userDoc.exists) {
        console.log('❌ users/test-user-001: NOT FOUND');
        allCollectionsFound = false;
      } else {
        console.log('✅ users/test-user-001: Found');
        console.log(`   Data: ${JSON.stringify(userDoc.data(), null, 2)}\n`);
        totalDocs += 1;
      }
    }
    
    // Check subcollections
    const subcollections = [
      'activities',
      'notifications',
      'contacts',
      'calendar',
      'assets',
      'goals',
      'verifications'
    ];
    
    for (const subcoll of subcollections) {
      const path = `users/test-user-001/${subcoll}`;
      const ref = db.collection('users').doc('test-user-001').collection(subcoll);
      const snapshot = await ref.get();
      
      if (snapshot.empty) {
        console.log(`❌ ${path}: NOT FOUND (0 documents)`);
        allCollectionsFound = false;
      } else {
        console.log(`✅ ${path}: Found (${snapshot.size} documents)`);
        totalDocs += snapshot.size;
        
        // List documents
        snapshot.forEach(doc => {
          console.log(`   - ${doc.id}`);
        });
        console.log('');
      }
    }
    
    console.log('════════════════════════════════════════════════════════\n');
    console.log('📊 SUMMARY:\n');
    console.log(`Total documents found: ${totalDocs}`);
    console.log(`Expected documents: 22\n`);
    
    if (totalDocs === 22) {
      console.log('✅ ALL DOCUMENTS FOUND! Ready for Phase 3.4 testing!\n');
      console.log('Next steps:');
      console.log('  1. Go to: http://localhost:3001');
      console.log('  2. Sign in with PIN: 1234');
      console.log('  3. Verify all 12 widgets display data');
      console.log('  4. Check console for errors (F12)');
      console.log('  5. Run: npm run build && firebase deploy');
    } else {
      console.log(`⚠️  Only ${totalDocs}/22 documents found.`);
      console.log('Please create the missing documents in Firebase Console.\n');
      
      if (allCollectionsFound) {
        console.log('Missing documents. Create them with the templates in:');
        console.log('  PHASE3_4_EXECUTION_START_NOW.md\n');
      }
    }
    
    console.log('════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error checking Firestore:');
    console.error(error.message);
    process.exit(1);
  } finally {
    // Close app
    await admin.app().delete();
  }
}

// Run validation
validateCollections().catch(error => {
  console.error('❌ Validation failed:');
  console.error(error);
  process.exit(1);
});
