# ⚡ Firebase Emulator Quick Start (3 Steps)

**Time Required:** 10 minutes  
**Security:** ✅ All local, no cloud  
**Perfect for:** Safe, isolated development testing

---

## 🎯 THE 3-STEP WORKFLOW

### Step 1️⃣: Start Emulator (Terminal 1)

Open PowerShell in your project folder:

```powershell
cd d:\WebSites\salatiso-ecosystem\LifeSync-React-App
firebase emulators:start
```

**Wait for this message:**
```
✔ All emulators ready! It is now safe to press CTRL + C to stop.
```

**✅ Keep this terminal OPEN** (don't close it!)

---

### Step 2️⃣: Start Dev Server (Terminal 2)

Open a **NEW PowerShell** window:

```powershell
cd d:\WebSites\salatiso-ecosystem\LifeSync-React-App
npm run dev
```

**Wait for this message:**
```
Local: http://localhost:3001 (or 5173/5174)
```

**✅ Keep this terminal OPEN too**

---

### Step 3️⃣: Create Seed Data (Browser)

1. Open **http://localhost:4000** (Emulator UI)
2. Go to **Firestore Database** tab
3. Create 8 collections with 22 documents (see below)

Or use manual creation below ⬇️

---

## 📊 CREATE SEED DATA - EASIEST METHOD

### Option A: Via Emulator UI (Recommended for beginners)

**URL:** http://localhost:4000

1. Click **Firestore Database**
2. Click **Start Collection**
3. Name: `users`
4. Document ID: `test-user-001`
5. Click **Auto ID** then fill fields:
   ```json
   {
     "id": "test-user-001",
     "name": "Test User",
     "email": "test@example.com",
     "createdAt": "2025-10-30T10:00:00Z",
     "role": "user",
     "verified": true
   }
   ```
6. Click **Save**
7. Repeat for other collections...

### Option B: Via JSON Import (Fastest - 2 minutes)

**I can create this! Want a Node.js script that auto-populates all data?**

---

## ✅ VERIFY EMULATOR CONNECTION

### Check Console Messages

1. Go to **http://localhost:3001**
2. Open DevTools: **F12**
3. Go to **Console** tab
4. Look for green messages:

```
✅ [Firebase] Connected to Auth Emulator at http://127.0.0.1:9099
✅ [Firebase] Connected to Firestore Emulator at 127.0.0.1:8080
✅ [Firebase] Connected Storage to emulator at localhost:9199
```

**If you see these:** ✅ **Perfect! You're connected!**

**If not:**
1. Check `.env.local` has `VITE_USE_EMULATOR=true`
2. Refresh page (Ctrl+R)
3. Restart dev server (Ctrl+C, then `npm run dev`)

---

## 📱 CREATE TEST USER

### Option A: Via Emulator UI (Easier)
1. Go to **http://localhost:4000**
2. Click **Authentication**
3. Click **Add User**
4. Email: `test@example.com`
5. Password: `password123`
6. Click **Create**

### Option B: Via App UI
1. Go to **http://localhost:3001**
2. Click **"Create Local Account"**
3. Name: `Test User`
4. PIN: `1234`
5. Sign in

**Use Option A if you want Firebase auth, Option B for simpler testing.**

---

## 🗄️ SEED DATA - 8 COLLECTIONS, 22 DOCUMENTS

Copy-paste into Emulator UI or use auto-populate script.

### Collection: `users`
**Document:** `test-user-001`
```json
{
  "id": "test-user-001",
  "name": "Test User",
  "email": "test@example.com",
  "createdAt": "2025-10-30T10:00:00Z",
  "role": "user",
  "verified": true
}
```

### Collection: `users/test-user-001/activities` (5 docs)
```json
{
  "activity_001": {
    "id": "activity_001",
    "title": "Morning Run",
    "date": "2025-10-30",
    "time": "06:30",
    "type": "fitness",
    "duration": 35,
    "calories": 450
  },
  "activity_002": {
    "id": "activity_002",
    "title": "Team Meeting",
    "date": "2025-10-30",
    "time": "10:00",
    "type": "work",
    "duration": 60
  },
  "activity_003": {
    "id": "activity_003",
    "title": "Lunch with Sarah",
    "date": "2025-10-30",
    "time": "12:30",
    "type": "social"
  },
  "activity_004": {
    "id": "activity_004",
    "title": "Reading",
    "date": "2025-10-30",
    "time": "20:00",
    "type": "personal",
    "duration": 45
  },
  "activity_005": {
    "id": "activity_005",
    "title": "Code Review",
    "date": "2025-10-30",
    "time": "14:00",
    "type": "work"
  }
}
```

### Collection: `users/test-user-001/notifications` (3 docs)
```json
{
  "notif_001": {
    "id": "notif_001",
    "title": "Meeting Reminder",
    "message": "Team standup in 15 minutes",
    "type": "reminder",
    "read": false,
    "priority": "high"
  },
  "notif_002": {
    "id": "notif_002",
    "title": "Goal Progress",
    "message": "You completed 80% of your weekly fitness goal!",
    "type": "achievement",
    "read": false,
    "priority": "medium"
  },
  "notif_003": {
    "id": "notif_003",
    "title": "Asset Alert",
    "message": "Car maintenance scheduled in 2 weeks",
    "type": "alert",
    "read": true,
    "priority": "low"
  }
}
```

### Collection: `users/test-user-001/contacts` (3 docs)
```json
{
  "contact_001": {
    "id": "contact_001",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "phone": "+1-555-0101",
    "relationship": "colleague"
  },
  "contact_002": {
    "id": "contact_002",
    "name": "Bob Smith",
    "email": "bob@example.com",
    "phone": "+1-555-0102",
    "relationship": "friend"
  },
  "contact_003": {
    "id": "contact_003",
    "name": "Carol White",
    "email": "carol@example.com",
    "phone": "+1-555-0103",
    "relationship": "family"
  }
}
```

### Collection: `users/test-user-001/calendar` (3 docs)
```json
{
  "event_001": {
    "id": "event_001",
    "title": "Project Deadline",
    "date": "2025-11-15",
    "startTime": "09:00",
    "type": "work"
  },
  "event_002": {
    "id": "event_002",
    "title": "Family Dinner",
    "date": "2025-11-02",
    "startTime": "18:00"
  },
  "event_003": {
    "id": "event_003",
    "title": "Conference",
    "date": "2025-11-10",
    "startTime": "08:00"
  }
}
```

### Collection: `users/test-user-001/assets` (3 docs)
```json
{
  "asset_001": {
    "id": "asset_001",
    "name": "Tesla Model 3",
    "type": "vehicle",
    "currentValue": 38000
  },
  "asset_002": {
    "id": "asset_002",
    "name": "Primary Residence",
    "type": "property",
    "currentValue": 750000
  },
  "asset_003": {
    "id": "asset_003",
    "name": "Investment Portfolio",
    "type": "investment",
    "currentValue": 122000
  }
}
```

### Collection: `users/test-user-001/goals` (3 docs)
```json
{
  "goal_001": {
    "id": "goal_001",
    "title": "Run 100 miles this year",
    "category": "fitness",
    "target": 100,
    "current": 45
  },
  "goal_002": {
    "id": "goal_002",
    "title": "Save $25,000",
    "category": "finance",
    "target": 25000,
    "current": 12500
  },
  "goal_003": {
    "id": "goal_003",
    "title": "Read 12 books",
    "category": "personal",
    "target": 12,
    "current": 3
  }
}
```

### Collection: `users/test-user-001/verifications` (1 doc)
```json
{
  "verification_001": {
    "id": "verification_001",
    "email": {
      "verified": true
    },
    "phone": {
      "verified": false
    },
    "identity": {
      "verified": false
    },
    "twoFactorEnabled": false
  }
}
```

---

## 🎯 TESTING FLOW

Once data is created:

1. **Sign in** at http://localhost:3001
2. **Check widgets** display data from emulator
3. **Open console** (F12) - look for connection messages
4. **Verify no errors** appear

---

## 🛑 WHEN DONE TESTING

### Stop All Services
```powershell
# Stop dev server (Terminal 2)
Ctrl+C

# Stop emulator (Terminal 1)
Ctrl+C
```

### Restart Next Time
```powershell
# Terminal 1: Start emulator
firebase emulators:start

# Terminal 2: Start dev server
npm run dev
```

---

## 🔒 SECURITY BENEFITS

```
✅ Emulator (What We're Using)
├─ Data only on YOUR machine
├─ No network transmission
├─ No real credentials needed
├─ Perfect for development
└─ 100% secure

❌ Production Firebase (What We Avoid)
├─ Exposes real credentials
├─ Data on Google's servers
├─ OAuth complications
└─ Security risks
```

---

## ❓ TROUBLESHOOTING

### "Port 8080 already in use"
```powershell
netstat -ano | findstr ":8080"
taskkill /PID [PID] /F
```

### "Cannot connect to emulator"
1. Check `.env.local` has emulator settings
2. Check both terminals are open
3. Refresh browser (Ctrl+R)

### "Emulator UI won't open"
Go to: http://localhost:4000

### "Data not saving"
1. Make sure you're signed in
2. Check console for errors (F12)
3. Try creating document directly in Emulator UI

---

## 📋 QUICK CHECKLIST

- [ ] Terminal 1: `firebase emulators:start` running
- [ ] Terminal 2: `npm run dev` running
- [ ] Emulator UI accessible at http://localhost:4000
- [ ] Dev server accessible at http://localhost:3001
- [ ] Created `test-user-001` in Auth Emulator
- [ ] Created 8 collections with 22 documents
- [ ] Signed in at http://localhost:3001
- [ ] Widgets display data from emulator
- [ ] Console shows connection messages
- [ ] No red errors in console

---

## 🚀 YOU'RE READY!

This is the **most secure way** to develop with Firebase. All data stays on your machine, and you have complete control.

**Next steps:**
1. ✅ Create `.env.local` (already done!)
2. ✅ Start emulator: `firebase emulators:start`
3. ✅ Start dev server: `npm run dev`
4. ✅ Create seed data via Emulator UI
5. ✅ Test widgets
6. ✅ Report when ready!

---

**Let me know when emulator is running!** 🔥🚀
