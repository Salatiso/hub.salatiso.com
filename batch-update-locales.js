const fs = require('fs');
const path = require('path');

// Guest translations structure
const guestTranslations = {
  "guest": {
    "account": {
      "title": "Guest Account",
      "subtitle": "Try everything for free, no signup required",
      "tryGuest": "Try as Guest",
      "signIn": "Sign In",
      "signUp": "Sign Up",
      "createAccount": "Create Guest Account",
      "yourName": "Your Name",
      "email": "Email (optional)",
      "emailHint": "We'll use this to help you migrate to a full account later",
      "startTrial": "Your 7-day free trial starts now!",
      "fullAccess": "Full access to all features, data stored locally",
      "createButton": "Create Guest Account",
      "backButton": "Back",
      "whyGuest": "Why Choose Guest?",
      "noCommitment": "No commitment: Try everything for free with no signup",
      "privacyFirst": "Privacy first: Your data stays on your device",
      "flexible": "Flexible: Renew locally forever or upgrade anytime",
      "zeroFriction": "Zero friction: Just enter your name and go",
      "setting": "Setting up your guest account..."
    },
    "status": {
      "badge": "Guest Account",
      "active": "Active",
      "expiringSoon": "Expiring Soon",
      "expired": "Account Expired",
      "daysLeft": "Days Left",
      "hoursLeft": "Hours Left",
      "renewals": "Renewals",
      "fullFeatures": "Full Features Available",
      "accessAll": "Access all dashboard features",
      "learnModules": "Full learning modules",
      "dataStored": "All data saved locally",
      "renewAnytime": "Renew anytime (free)",
      "renewalPrompt": "Your guest account has expired. Renew to continue.",
      "expiringSoonPrompt": "Your guest account expires soon.",
      "remaining": "remaining"
    },
    "benefits": {
      "title": "Upgrade Your Experience",
      "subtitle": "Keep your guest account local forever, or upgrade to sync across devices and unlock premium features.",
      "cloudBackup": "Cloud Backup",
      "cloudBackupDesc": "All your data safely backed up in the cloud",
      "multiDeviceSync": "Multi-Device Sync",
      "multiDeviceSyncDesc": "Access your account on any device, anytime",
      "familyFeatures": "Family Features",
      "familyFeaturesDesc": "Connect with family members and see their progress",
      "advancedAnalytics": "Advanced Analytics",
      "advancedAnalyticsDesc": "Detailed insights into your learning journey",
      "enhancedSecurity": "Enhanced Security",
      "enhancedSecurityDesc": "Password protection and account recovery options",
      "prioritySupport": "Priority Support",
      "prioritySupportDesc": "Get help from our support team when you need it",
      "howItWorks": "How It Works",
      "step1": "Your guest data is saved locally for 7 days",
      "step2": "Renew anytime to keep using locally (free forever)",
      "step3": "Upgrade anytime - all data transfers automatically",
      "step4": "No need to re-enter any information",
      "step5": "Full features unlock immediately",
      "featureComparison": "Feature Comparison",
      "guestColumn": "Guest",
      "fullColumn": "Full Account",
      "upgradeButton": "Upgrade Now",
      "laterButton": "Maybe Later",
      "dontRush": "💡 Keep your guest account local forever. There's no rush to upgrade."
    },
    "faq": {
      "title": "Frequently Asked Questions",
      "q1": "Will I lose my data if I upgrade?",
      "a1": "No! All your guest data is automatically transferred to your full account. Nothing is lost.",
      "q2": "Can I keep using my guest account?",
      "a2": "Absolutely! You can renew your guest account forever. Upgrading is completely optional.",
      "q3": "What happens after 7 days if I don't renew?",
      "a3": "Your account will be marked as expired, but you can still renew it anytime to continue. No data is deleted.",
      "q4": "Do I need to upgrade to use all features?",
      "a4": "No! Guest accounts have full access to all dashboard features. Upgrading adds cloud sync and family features.",
      "q5": "Can I export my guest data?",
      "a5": "Yes! You can export all your guest data as JSON before upgrading.",
      "q6": "Is there a cost to upgrade?",
      "a6": "We'll offer flexible pricing options. You can choose what works for you."
    },
    "upgrade": {
      "title": "Ready to Level Up?",
      "subtitle": "Your data is ready to sync across devices. Upgrade now to keep everything synchronized and unlock premium features.",
      "upgradeNow": "Upgrade Now",
      "features": {
        "fullFeatures": "Full Features",
        "allDashboard": "All dashboard items",
        "localStorage": "Local Storage",
        "sevenDayValidity": "7-day validity",
        "renewFree": "Renew Free",
        "foreverRenewable": "Forever renewable",
        "upgradeEasy": "Upgrade Easy",
        "anyTimeDataTransfers": "Any time, data transfers"
      }
    }
  }
};

const localesDir = './src/locales';
const alreadyUpdated = ['af', 'de', 'en', 'es', 'fr', 'pt', 'sw', 'zu'];
const needsUpdate = ['nr', 'nso', 'ss', 'st', 'tn', 'ts', 've', 'xh', 'zh'];

let updated = 0;
let skipped = 0;

needsUpdate.forEach(locale => {
  const filePath = path.join(localesDir, `${locale}.json`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    // Check if guest section already exists
    if (!data.guest) {
      // Add guest section
      data.guest = guestTranslations.guest;
      
      // Write back to file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`✓ Updated ${locale}.json`);
      updated++;
    } else {
      console.log(`⊘ ${locale}.json already has guest section`);
      skipped++;
    }
  } catch (error) {
    console.error(`✗ Error processing ${locale}.json:`, error.message);
  }
});

console.log(`\n✓ Completed! Updated ${updated} files, skipped ${skipped} files.`);
