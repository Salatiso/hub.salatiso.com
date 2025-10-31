# 🔥 Firebase Emulator Setup for Phase 3.4

## ✅ Why Use Emulator?

```
❌ Localhost (Security Risk)          ✅ Firebase Emulator (Secure)
├─ Real Firebase credentials         ├─ Local only, no internet
├─ Production data exposed           ├─ Isolated test environment
├─ OAuth complications               ├─ No OAuth needed
├─ Harder to test offline            ├─ Works offline
└─ Real data on your machine          └─ Test data only

⚡ Benefits:
✓ No network calls needed
✓ Faster development
✓ Complete data control
✓ No security exposure
✓ Can commit test data to git
✓ Easy to reset/wipe data
```

---

## 📋 PREREQUISITES

You need:
- ✅ Firebase Emulator installed
- ✅ Node.js (already have)
- ✅ npm (already have)

Check you have emulator:
```powershell
firebase --version
```

Should show something like:
```
Firebase CLI 13.0.0 (or higher)
```

If not, install:
```powershell
npm install -g firebase-tools
```

---

## 🚀 STEP 1: Enable Emulator in Your Code

Check your current `.env.local` or `.env` file. Open the project:

### Create/Update `.env.local` file

In your project root (`d:\WebSites\salatiso-ecosystem\LifeSync-React-App`), create or update `.env.local`:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyBl15V2pM4E6Yeh7YzVEdBjXsH3E2b1Wro
VITE_FIREBASE_AUTH_DOMAIN=lifecv-d2724.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lifecv-d2724
VITE_FIREBASE_STORAGE_BUCKET=lifecv-d2724.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# 🔥 EMULATOR CONFIGURATION (LOCAL TESTING)
VITE_USE_EMULATOR=true
VITE_USE_FIRESTORE_EMULATOR=1
VITE_FIRESTORE_EMULATOR_HOST=localhost
VITE_FIRESTORE_EMULATOR_PORT=8080
VITE_USE_FUNCTIONS_EMULATOR=1
VITE_FUNCTIONS_EMULATOR_HOST=localhost
VITE_FUNCTIONS_EMULATOR_PORT=5001
VITE_USE_STORAGE_EMULATOR=1
VITE_STORAGE_EMULATOR_HOST=localhost
VITE_STORAGE_EMULATOR_PORT=9199
```

**Save the file.**

---

## 🔥 STEP 2: Verify Emulator Configuration

Check your `src/config/firebase.js` file. Look for this code pattern:

```javascript
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR === 'true') {
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    // ... other emulators
  } catch (error) {
    console.warn('[Firebase] Emulator connection failed:', error.message);
  }
}
```

**If this exists:** ✅ Already configured!  
**If not:** Tell me, I'll add it.

---

## 🎯 STEP 3: Start Firebase Emulator Suite

Open PowerShell in your project folder:

```powershell
cd d:\WebSites\salatiso-ecosystem\LifeSync-React-App
firebase emulators:start
```

You should see:
```
⚠️  Google Cloud credentials were found. Using credentials from...
⚠️  Skipping Firebase profile validation
⚠️  It looks like you're using a service account for credential...
ℹ️  Building database indexes...
ℹ️  Started emulator for Auth on port 9099
ℹ️  Started emulator for Firestore on port 8080
ℹ️  Started emulator for Storage on port 9199
ℹ️  Emulator Suite started at http://localhost:4000 (Emulator UI)
✔ All emulators ready! It is now safe to press CTRL + C to stop.
```

**IMPORTANT:** Keep this terminal open while developing!

---

## 💻 STEP 4: Start Your Dev Server (New Terminal)

**Open a NEW PowerShell terminal** (don't close the emulator one):

```powershell
cd d:\WebSites\salatiso-ecosystem\LifeSync-React-App
npm run dev
```

You should see:
```
VITE v4.5.0 ready in 500ms

➜  Local:   http://localhost:5173
```

**Note:** Port might be 5173, 5174, or 3001 depending on availability.

---

## ✅ STEP 5: Verify Emulator Connection

Go to http://localhost:3001 (or whatever port shows) and:

1. Open **DevTools** (F12)
2. Go to **Console** tab
3. Look for these messages:

```
✅ Connected to Auth Emulator at http://127.0.0.1:9099
✅ Connected to Firestore Emulator at 127.0.0.1:8080
```

**If you see these:** Everything is working! ✅

**If you don't see these:** 
1. Check `.env.local` was saved
2. Refresh page (Ctrl+R)
3. Check emulator terminal still running
4. Restart dev server (Ctrl+C, then `npm run dev`)

---

## 📊 STEP 6: Access Emulator UI (Optional but Cool!)

Go to: **http://localhost:4000**

This shows:
- All emulator services status
- Real-time Firestore database viewer
- Auth user management
- Storage browser
- Logs

Great for debugging! 🎯

---

## 🎬 STEP 7: Create Test User in Emulator

Two ways to create a test user:

### Option A: Via Emulator UI (Easiest)
1. Open http://localhost:4000
2. Go to **Authentication** tab
3. Click **Add user**
4. Email: `test@example.com`
5. Password: `password123`
6. Click **Create**

### Option B: Via App UI
1. Go to http://localhost:3001
2. Click **"Create Local Account"** (PIN-based, doesn't use Firebase)
3. Or click **"Sign in with Email"** and create account

**Recommendation:** Use Option A (Emulator UI) for consistent test data.

---

## 🗂️ STEP 8: Create Seed Data in Emulator

Now create the 8 Firestore collections with 22 documents. Two options:

### Option A: Firestore Emulator UI (Browser)
1. Go to http://localhost:4000
2. Go to **Firestore Database** tab
3. Click **Start Collection**
4. Enter collection name: `users`
5. Add documents with the JSON data (see PHASE3_4_EXECUTION_START_NOW.md)
6. Repeat for other 7 collections

### Option B: Upload Seed Data via Script (Faster)
I can create a Node.js script that uploads all 22 documents automatically. Want me to?

**For now, let's use Option A.**

---

## 🧪 STEP 9: Test Widgets with Emulator Data

1. Make sure you're signed in (test@example.com or local account)
2. Go to http://localhost:3001
3. All widgets should now display data from the **emulator** (not real Firebase)
4. Check console (F12) for:
   - ✅ Connected to emulators messages
   - ✅ No errors
   - ✅ Data loading messages

---

## 🛑 STOPPING EMULATOR

When done testing:

```powershell
# Stop dev server
Ctrl+C  (in the dev server terminal)

# Stop emulator
Ctrl+C  (in the emulator terminal)
```

---

## 🔄 WORKFLOW: Daily Usage

Each time you develop:

```powershell
# Terminal 1: Start emulator (keep running)
firebase emulators:start

# Terminal 2: Start dev server (keep running)
npm run dev

# Terminal 3: Run other commands as needed
npm run lint
npm run build
```

---

## 💾 IMPORTANT: Emulator Data Persistence

By default, emulator data is **cleared on restart**. To preserve it:

### Option A: Auto-Export on Stop
Add to `firebase.json`:
```json
{
  "emulators": {
    "firestore": {
      "port": 8080,
      "host": "localhost"
    },
    "auth": {
      "port": 9099,
      "host": "localhost"
    },
    "export-on-exit": true,
    "import-on-start": true
  }
}
```

Then specify export path:
```powershell
firebase emulators:start --import ./emulator-data --export-on-exit
```

### Option B: Manual Export
```powershell
firebase emulators:export ./emulator-data
```

Then next time:
```powershell
firebase emulators:start --import ./emulator-data
```

---

## 🐛 TROUBLESHOOTING

### Issue: "Port already in use"
```powershell
# Find process on port 8080
netstat -ano | findstr ":8080"

# Kill it (replace PID with actual number)
taskkill /PID 12345 /F
```

### Issue: "Cannot connect to emulator"
```powershell
# Make sure `.env.local` has:
VITE_USE_EMULATOR=true
VITE_USE_FIRESTORE_EMULATOR=1

# Restart dev server
# Clear browser cache (F12 → Application → Clear site data)
# Refresh page
```

### Issue: "Emulator not starting"
```powershell
# Check Firebase CLI version
firebase --version

# Should be 13.0.0 or higher
# If not, upgrade:
npm install -g firebase-tools@latest
```

### Issue: "Data not persisting"
Use export/import (see above in "Data Persistence")

---

## ✅ VERIFICATION CHECKLIST

Before proceeding to widget testing:

- [ ] `.env.local` created with emulator settings
- [ ] Firebase Emulator Suite started (`firebase emulators:start`)
- [ ] Dev server running on localhost:3001 (or port shown)
- [ ] Can see in console: "Connected to Firestore Emulator"
- [ ] Can see in console: "Connected to Auth Emulator"
- [ ] Emulator UI accessible at http://localhost:4000
- [ ] Created test user (test@example.com)
- [ ] Started creating seed data collections

---

## 🎯 NEXT STEPS

1. ✅ Create `.env.local` with emulator config
2. ✅ Start emulator: `firebase emulators:start`
3. ✅ Start dev server: `npm run dev`
4. ✅ Create test collections and documents
5. ✅ Test widgets with emulator data
6. ✅ Report when ready

---

## 💬 SECURITY NOTES

```
✅ EMULATOR (What we're doing)
├─ Data only on your machine
├─ No network calls
├─ No real Firebase credentials used
├─ Perfect for development
└─ Test with confidence

❌ LOCALHOST + FIREBASE (What we avoided)
├─ Uses real Firebase credentials
├─ Data visible on network
├─ Requires OAuth setup
├─ Security concerns
└─ Not ideal for development
```

**You made the right choice using the emulator!** 🔒

---

Ready? Let's set it up:

1. Create `.env.local` file
2. Tell me when it's saved
3. Start the emulator
4. I'll guide you through seed data creation

Let me know when you're ready! 🚀
