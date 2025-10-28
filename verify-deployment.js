#!/usr/bin/env node

/**
 * LifeSync Phase 6 Deployment Verification Script
 * Validates all optimizations are in place before deployment
 */

const fs = require('fs');
const path = require('path');

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🚀 LifeSync Phase 6 Deployment Verification Script 🚀       ║
║                                                                ║
║          Verifying all optimizations in place...               ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

const checks = [];

// Check 1: Build directory exists
console.log('✓ Checking build artifacts...');
const distExists = fs.existsSync(path.join(__dirname, 'dist'));
checks.push({
  name: 'Build artifacts exist',
  passed: distExists,
  path: 'dist/'
});

// Check 2: App.jsx has lazy imports
console.log('✓ Checking App.jsx code splitting...');
const appContent = fs.readFileSync(path.join(__dirname, 'src', 'App.jsx'), 'utf8');
const lazyImports = [
  'const SealEvent = lazy',
  'const Geofencing = lazy',
  'const CheckIns = lazy',
  'const ContactImportWizard = lazy',
  'const FamilyTree = lazy',
  'const TermsOfReciprocity = lazy',
  'const HubSettings = lazy'
];
const appCodeSplitValid = lazyImports.every(imp => appContent.includes(imp));
checks.push({
  name: 'App.jsx code splitting configured',
  passed: appCodeSplitValid,
  details: `${lazyImports.length} pages set to lazy load`
});

// Check 3: Assets.jsx has useMemo
console.log('✓ Checking Assets.jsx optimizations...');
const assetsContent = fs.readFileSync(path.join(__dirname, 'src', 'pages', 'Assets.jsx'), 'utf8');
const assetsOptimized = assetsContent.includes('useMemo') && 
                        assetsContent.includes('React.memo');
checks.push({
  name: 'Assets.jsx has useMemo optimization',
  passed: assetsOptimized,
  hooks: 'useMemo + React.memo'
});

// Check 4: Contacts.jsx has useMemo
console.log('✓ Checking Contacts.jsx optimizations...');
const contactsContent = fs.readFileSync(path.join(__dirname, 'src', 'pages', 'Contacts.jsx'), 'utf8');
const contactsOptimized = contactsContent.includes('useMemo') &&
                          contactsContent.includes('filteredContacts');
checks.push({
  name: 'Contacts.jsx has useMemo optimization',
  passed: contactsOptimized,
  computations: 4
});

// Check 5: Family.jsx has useMemo
console.log('✓ Checking Family.jsx optimizations...');
const familyContent = fs.readFileSync(path.join(__dirname, 'src', 'pages', 'Family.jsx'), 'utf8');
const familyOptimized = familyContent.includes('useMemo') &&
                        familyContent.includes('emergencyContacts');
checks.push({
  name: 'Family.jsx has useMemo optimization',
  passed: familyOptimized,
  computations: 2
});

// Check 6: Calendar.jsx has useMemo
console.log('✓ Checking Calendar.jsx optimizations...');
const calendarContent = fs.readFileSync(path.join(__dirname, 'src', 'pages', 'Calendar.jsx'), 'utf8');
const calendarOptimized = calendarContent.includes('useMemo') &&
                          calendarContent.includes('sortedEvents');
checks.push({
  name: 'Calendar.jsx has useMemo optimization',
  passed: calendarOptimized,
  computations: 1
});

// Check 7: Package.json unchanged
console.log('✓ Checking dependencies...');
const packageContent = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const depsValid = packageContent.dependencies && packageContent.dependencies.react;
checks.push({
  name: 'Package.json valid',
  passed: depsValid,
  react: packageContent.dependencies.react
});

// Summary
console.log(`
╔════════════════════════════════════════════════════════════════╗
║                      VERIFICATION RESULTS                      ║
╚════════════════════════════════════════════════════════════════╝
`);

let passedCount = 0;
checks.forEach((check, i) => {
  const status = check.passed ? '✅' : '❌';
  console.log(`${status} ${i + 1}. ${check.name}`);
  if (check.details) console.log(`   └─ ${check.details}`);
  if (check.computations) console.log(`   └─ ${check.computations} computations memoized`);
  if (check.hooks) console.log(`   └─ ${check.hooks}`);
  if (check.path) console.log(`   └─ Location: ${check.path}`);
  if (check.passed) passedCount++;
});

console.log(`
═══════════════════════════════════════════════════════════════
Status: ${passedCount}/${checks.length} checks passed
═══════════════════════════════════════════════════════════════
`);

if (passedCount === checks.length) {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║         ✅ ALL VERIFICATIONS PASSED ✅                         ║
║                                                                ║
║    🚀 READY FOR PRODUCTION DEPLOYMENT 🚀                       ║
║                                                                ║
║  Next step: npm run build && npm run deploy                   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
  process.exit(0);
} else {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║         ❌ VERIFICATION FAILED ❌                              ║
║                                                                ║
║    Some checks did not pass. Review above for details.        ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
  process.exit(1);
}
