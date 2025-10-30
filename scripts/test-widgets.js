/**
 * Phase 3.4 - Widget Testing Helper
 * 
 * Paste this in browser console (F12) to run widget tests
 * This will check if all 12 widgets are rendering and have data
 */

console.log('\n════════════════════════════════════════════════════════');
console.log('🧪 PHASE 3.4: WIDGET TESTING HELPER');
console.log('════════════════════════════════════════════════════════\n');

// Define the 12 widgets to check
const WIDGETS = [
  { name: 'Dashboard Widget', selector: '[data-testid="dashboard-widget"]' },
  { name: 'Profile Widget', selector: '[data-testid="profile-widget"]' },
  { name: 'Notifications Widget', selector: '[data-testid="notifications-widget"]' },
  { name: 'Activity Feed Widget', selector: '[data-testid="activity-feed-widget"]' },
  { name: 'Contacts Widget', selector: '[data-testid="contacts-widget"]' },
  { name: 'Calendar Widget', selector: '[data-testid="calendar-widget"]' },
  { name: 'Trust Score Widget', selector: '[data-testid="trust-score-widget"]' },
  { name: 'Verification Widget', selector: '[data-testid="verification-widget"]' },
  { name: 'Assets Widget', selector: '[data-testid="assets-widget"]' },
  { name: 'Goals Widget', selector: '[data-testid="goals-widget"]' },
  { name: 'Settings Widget', selector: '[data-testid="settings-widget"]' },
  { name: 'Export Widget', selector: '[data-testid="export-widget"]' }
];

// Test results
let passedTests = 0;
let failedTests = 0;
const results = [];

// Check each widget
WIDGETS.forEach((widget, index) => {
  const element = document.querySelector(widget.selector);
  
  if (element) {
    const hasContent = element.textContent.trim().length > 0;
    const hasChildElements = element.children.length > 0;
    
    if (hasContent && hasChildElements) {
      console.log(`✅ ${index + 1}. ${widget.name}: FOUND & POPULATED`);
      results.push({ widget: widget.name, status: 'PASS' });
      passedTests++;
    } else {
      console.log(`⚠️  ${index + 1}. ${widget.name}: FOUND but NO DATA`);
      results.push({ widget: widget.name, status: 'WARN' });
      failedTests++;
    }
  } else {
    console.log(`❌ ${index + 1}. ${widget.name}: NOT FOUND`);
    results.push({ widget: widget.name, status: 'FAIL' });
    failedTests++;
  }
});

console.log('\n════════════════════════════════════════════════════════\n');

// Summary
console.log(`📊 SUMMARY:\n`);
console.log(`✅ Passed: ${passedTests}/12`);
console.log(`❌ Failed: ${failedTests}/12`);
console.log(`⚠️  Warnings: ${12 - passedTests - failedTests}/12\n`);

// Check for console errors
const errors = [];
if (window.error) {
  errors.push('Window error detected');
}

// Check network errors
console.log('🔍 ADDITIONAL CHECKS:\n');

// Check Firebase connection
try {
  if (window.firebase && window.firebase.firestore) {
    console.log('✅ Firebase initialized');
  } else {
    console.log('❌ Firebase not initialized');
  }
} catch (e) {
  console.log('⚠️  Could not check Firebase');
}

// Check if user is authenticated
try {
  if (window.auth && window.auth.currentUser) {
    console.log(`✅ User authenticated: ${window.auth.currentUser.uid}`);
  } else {
    console.log('⚠️  No user authenticated');
  }
} catch (e) {
  console.log('⚠️  Could not check authentication');
}

console.log('\n════════════════════════════════════════════════════════\n');

// Detailed widget checks
console.log('📋 DETAILED WIDGET DATA:\n');

// Check Notifications Widget specifically
const notifWidget = document.querySelector('[data-testid="notifications-widget"]');
if (notifWidget) {
  const notifCount = notifWidget.textContent.match(/\d+/);
  console.log(`Notifications: ${notifCount ? notifCount[0] : 'unknown'} items`);
}

// Check Activities Widget
const activitiesWidget = document.querySelector('[data-testid="activity-feed-widget"]');
if (activitiesWidget) {
  const activities = activitiesWidget.querySelectorAll('[data-testid="activity-item"]');
  console.log(`Activities: ${activities.length} items`);
}

// Check Contacts Widget
const contactsWidget = document.querySelector('[data-testid="contacts-widget"]');
if (contactsWidget) {
  const contacts = contactsWidget.querySelectorAll('[data-testid="contact-item"]');
  console.log(`Contacts: ${contacts.length} items`);
}

// Check Assets Widget
const assetsWidget = document.querySelector('[data-testid="assets-widget"]');
if (assetsWidget) {
  const assets = assetsWidget.querySelectorAll('[data-testid="asset-item"]');
  console.log(`Assets: ${assets.length} items`);
  const totalValue = assetsWidget.textContent.match(/\$[\d,]+/g);
  if (totalValue) {
    console.log(`  Total value: ${totalValue[totalValue.length - 1]}`);
  }
}

// Check Goals Widget
const goalsWidget = document.querySelector('[data-testid="goals-widget"]');
if (goalsWidget) {
  const goals = goalsWidget.querySelectorAll('[data-testid="goal-item"]');
  console.log(`Goals: ${goals.length} items`);
}

console.log('\n════════════════════════════════════════════════════════\n');

// Final status
if (passedTests === 12) {
  console.log('🎉 ALL WIDGETS TESTING PASSED! PHASE 3.4 READY!\n');
  console.log('Next: Run deployment');
  console.log('  npm run build');
  console.log('  npm run lint');
  console.log('  firebase deploy --only hosting:lifecv-d2724\n');
} else {
  console.log('⚠️  Some widgets need attention.\n');
  console.log('Check:');
  console.log('  1. Is Firestore data created? (Firebase Console)');
  console.log('  2. Are document IDs correct? (Case-sensitive)');
  console.log('  3. Open DevTools → Network tab → Check requests');
  console.log('  4. Open DevTools → Console → Look for errors\n');
}

console.log('════════════════════════════════════════════════════════\n');
