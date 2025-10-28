# 🚀 Local Firebase Emulator Setup Guide

## Why Local Firebase Emulator?

**Security Benefits:**
- ✅ No localhost domains in production Firebase
- ✅ Isolated development environment
- ✅ No risk to production data
- ✅ Faster development (no network calls)
- ✅ Test authentication without real Google accounts

**What You Get:**
- Local Firebase Auth (email/password, Google OAuth simulation)
- Local Firestore database
- Local Firebase Hosting
- Local Functions (if needed)

---

## ✅ STEP 1: Install Firebase CLI

**Check if installed:**
```bash
firebase --version
```

**If not installed:**
```bash
npm install -g firebase-tools
```

**Login to Firebase:**
```bash
firebase login
```

---

## ✅ STEP 2: Initialize Firebase in Your Project

**Navigate to your project:**
```bash
cd "d:\WebSites\salatiso-ecosystem\LifeSync-React-App"
```

**Initialize Firebase (if not already done):**
```bash
firebase init
```

**Select services:**
- [ ] Firestore
- [ ] Authentication
- [ ] Hosting
- [ ] Functions (optional)

**Choose existing project:** `lifecv-d2724`

---

## ✅ STEP 3: Configure Firebase Configuration

**File:** `firebase.json`

Make sure it includes:
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "ui": {
      "enabled": true,
      "port": 4000
    },
    "hosting": {
      "port": 5000
    }
  }
}
```

---

## ✅ STEP 4: Update Environment for Local Development

**Create:** `.env.local.development`

```bash
# Local Firebase Emulator Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=demo-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=localhost
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=demo-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:demo

# Emulator URLs
FIREBASE_AUTH_EMULATOR_URL=http://localhost:9099
FIRESTORE_EMULATOR_HOST=localhost:8080

# Disable analytics in development
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Other keys (keep production values)
VITE_GOOGLE_MAPS_API_KEY=your-maps-key
VITE_PIGEEBACK_BASE_URL=https://pigeeback.salatiso.com
VITE_PIGEEBACK_WS_URL=wss://pigeeback.salatiso.com
VITE_HEARTBEAT_URL=https://us-central1-lifecv-d2724.cloudfunctions.net/presenceHeartbeat
VITE_OPENAI_API_KEY=your-openai-key
VITE_WEATHER_API_KEY=your-weather-key
NEXT_PUBLIC_ALLOW_ALL_AUTHENTICATED_USERS=true
```

---

## ✅ STEP 5: Update Firebase Configuration for Emulator

**File:** `src/lib/firebase.js` (or wherever you initialize Firebase)

Add emulator configuration:
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  const auth = getAuth(app);
  const db = getFirestore(app);

  try {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('🔥 Connected to Firebase Emulators');
  } catch (error) {
    console.log('Firebase emulators already connected');
  }
}

export { app };
export const auth = getAuth(app);
export const db = getFirestore(app);
```

---

## ✅ STEP 6: Start Firebase Emulators

**Start all emulators:**
```bash
firebase emulators:start
```

**Expected output:**
```
i  emulators: Starting emulators: auth, firestore, hosting
i  emulators: Detected demo project ID "demo-project", emulated services will use a demo configuration and will behave differently from production
+  emulators: All emulators started, it is now safe to connect.
i  emulators: Emulator UI logging to UI log file: C:\Users\...\firebase-debug.log
┌─────────────────────────────────────────────────────────────┐
│ ✔  All emulators ready! View status and logs at the Emulator UI: http://localhost:4000
│ ✔  View hosting at: http://localhost:5000
└─────────────────────────────────────────────────────────────┘
```

**Ports used:**
- Auth: http://localhost:9099
- Firestore: http://localhost:8080
- Hosting: http://localhost:5000
- UI: http://localhost:4000

---

## ✅ STEP 7: Update Development Scripts

**File:** `package.json`

Add development scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "dev:emulator": "firebase emulators:start --only auth,firestore,hosting",
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:emulator\"",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && firebase deploy --only hosting"
  }
}
```

**Install concurrently (optional):**
```bash
npm install --save-dev concurrently
```

---

## ✅ STEP 8: Test Local Authentication

**Start emulators:**
```bash
firebase emulators:start
```

**In another terminal, start your app:**
```bash
npm run dev
```

**Test authentication:**
1. Go to: http://localhost:3000/auth
2. Click: "Continue with Google"
3. **Emulator UI:** Go to http://localhost:4000/auth
4. **Create test user:** Click "Add user" in Auth emulator
5. **Sign in:** Use the test user credentials

**Expected:** Login works without real Google OAuth!

---

## ✅ STEP 9: Seed Local Data (Optional)

**Create seed data script:** `scripts/seed-emulator.js`

```javascript
const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator, collection, addDoc } = require('firebase/firestore');

const app = initializeApp({
  projectId: 'demo-project'
});

const db = getFirestore(app);
connectFirestoreEmulator(db, 'localhost', 8080);

async function seedData() {
  try {
    // Add sample users
    await addDoc(collection(db, 'users'), {
      email: 'test@example.com',
      displayName: 'Test User',
      createdAt: new Date()
    });

    // Add sample widgets
    await addDoc(collection(db, 'widgets'), {
      type: 'calendar',
      title: 'Sample Calendar',
      userId: 'test-user-id'
    });

    console.log('✅ Data seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

seedData();
```

**Run seeder:**
```bash
node scripts/seed-emulator.js
```

---

## ✅ STEP 10: Development Workflow

**Daily development:**

1. **Start emulators:**
   ```bash
   firebase emulators:start
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Test features locally:**
   - Auth: http://localhost:9099
   - Firestore: http://localhost:8080
   - Hosting: http://localhost:5000
   - UI: http://localhost:4000

4. **When ready for production:**
   - Switch to production `.env.local`
   - Run: `npm run deploy`

---

## 🔧 Troubleshooting

**Emulator won't start:**
```bash
# Kill existing processes
firebase emulators:stop

# Clear emulator data
firebase emulators:clear
```

**Auth not working:**
- Check: http://localhost:4000/auth
- Verify: Emulator is running on port 9099
- Check: Console for connection errors

**Firestore not working:**
- Check: http://localhost:4000/firestore
- Verify: Emulator is running on port 8080
- Check: Rules file exists

**Port conflicts:**
```bash
# Change ports in firebase.json
"emulators": {
  "auth": { "port": 9098 },
  "firestore": { "port": 8081 },
  "hosting": { "port": 5001 },
  "ui": { "port": 4001 }
}
```

---

## 🔒 Security Benefits

**With Local Emulator:**
- ✅ No localhost in production Firebase
- ✅ Isolated development data
- ✅ Test auth without real accounts
- ✅ No production data risk
- ✅ Faster iteration

**Production Deployment:**
- Uses real Firebase project
- Real authentication
- Real data persistence
- Production domains only

---

## 📋 Quick Start Commands

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize in project
firebase init

# Start emulators
firebase emulators:start

# Start development (in another terminal)
npm run dev

# View emulator UI
# http://localhost:4000

# Stop emulators
firebase emulators:stop
```

---

**Tomorrow's Plan:**
1. Set up Firebase Emulator locally
2. Test authentication without production OAuth
3. Continue Phase 3.4 widget development
4. Deploy to production when ready

**Rest well! Tomorrow we'll have a secure, local development environment ready. 🌙**