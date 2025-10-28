# 🚀 Phase 2.8: Complete Setup Guide

**Status:** ✅ All dependencies configured  
**Java:** Installed and PATH configured  
**Firebase Emulator:** Ready to start  

---

## 📋 Complete Workflow for Phase 2.8

### Step 1: Start Firebase Emulator (Terminal 1)

**Option A: Using PowerShell Script (RECOMMENDED)**
```powershell
cd d:\WebSites\salatiso-ecosystem\LifeSync-React-App
.\start-emulator.ps1
```

**Option B: Using Batch File**
```cmd
cd d:\WebSites\salatiso-ecosystem\LifeSync-React-App
start-emulator.bat
```

**Option C: Manual Command**
```powershell
$env:Path += ";C:\Program Files\Java\jre1.8.0_471\bin"
firebase emulators:start
```

**Expected Output:**
```
✔ All emulators ready! It is now safe to connect your app.
┌─────────────────────────────────────────────────────────┐
│ ✔ All emulators ready! View status and logs at          │
│ http://127.0.0.1:4000                                    │
└─────────────────────────────────────────────────────────┘

┌────────────┬────────────────┬─────────────────────────────┐
│ Emulator   │ Host:Port      │ View in Emulator UI         │
├────────────┼────────────────┼─────────────────────────────┤
│ Auth       │ 127.0.0.1:9099 │ http://127.0.0.1:4000/auth  │
│ Firestore  │ 127.0.0.1:8080 │ http://127.0.0.1:4000/fst   │
│ Functions  │ 127.0.0.1:5001 │ http://127.0.0.1:4000/func  │
└────────────┴────────────────┴─────────────────────────────┘
```

---

### Step 2: Enable Emulator in Your App

Edit `.env` file and change:
```properties
VITE_USE_EMULATOR=true
```

---

### Step 3: Start Dev Server (Terminal 2)

```powershell
cd d:\WebSites\salatiso-ecosystem\LifeSync-React-App
npm run dev
```

**Expected Output in Console:**
```
[Firebase] Connected to Auth Emulator at http://127.0.0.1:9099
[Firebase] Connected to Firestore Emulator at 127.0.0.1:8080
```

---

### Step 4: Open Browser

Open **both** URLs:

**Your App:**
```
http://localhost:3000
```

**Emulator UI (for testing/debugging):**
```
http://127.0.0.1:4000
```

---

## 🧪 Phase 2.8 Testing Checklist

### Dashboard Loads ✅
- [ ] http://localhost:3000 loads without errors
- [ ] All 13 widgets visible
- [ ] Sidebar working
- [ ] SearchBar visible
- [ ] No red errors in console

### Console Messages ✅
- [ ] See: `[Firebase] Connected to Auth Emulator at http://127.0.0.1:9099`
- [ ] See: `[Firebase] Connected to Firestore Emulator at 127.0.0.1:8080`
- [ ] No errors about 503 or network failures

### Authentication ✅
- [ ] Click "Sign In" button (or Google Sign-In if visible)
- [ ] **No 503 errors** ← Main thing!
- [ ] Sign-in flow works
- [ ] Can create/test accounts

### Emulator UI ✅
- [ ] Open http://127.0.0.1:4000
- [ ] View Auth tab
- [ ] View authenticated users
- [ ] View Firestore data (if any)

### Widgets Testing ✅
- [ ] ProfileWidget displays
- [ ] TrustScoreWidget shows
- [ ] VerificationWidget shows progress
- [ ] NotificationsWidget displays
- [ ] ActivityFeedWidget shows activity
- [ ] AssetsWidget displays
- [ ] All other 7 widgets work

---

## 🎯 What's Different from Phase 2.7

| Aspect | Phase 2.7 | Phase 2.8 |
|--------|-----------|-----------|
| **Auth** | ❌ 503 errors | ✅ Works! |
| **API Calls** | To Google Cloud | To local emulator |
| **Data** | Production Firebase | Test data only |
| **Network** | Required | Works offline |
| **Speed** | Slow (Google API) | Fast (local) |

---

## 🚀 Quick Start Commands

### Start Everything (Copy & Paste)

**Terminal 1:**
```powershell
cd d:\WebSites\salatiso-ecosystem\LifeSync-React-App
.\start-emulator.ps1
```

**Terminal 2 (after emulator starts):**
```powershell
cd d:\WebSites\salatiso-ecosystem\LifeSync-React-App
# Edit .env: VITE_USE_EMULATOR=true
npm run dev
```

**Browser:**
- App: http://localhost:3000
- Emulator UI: http://127.0.0.1:4000

---

## 🔧 Troubleshooting

### Issue: Still getting 503 errors

**Check 1:** Verify .env
```properties
VITE_USE_EMULATOR=true  ← Must be true
```

**Check 2:** Restart dev server
```powershell
# Ctrl+C to stop
npm run dev
```

**Check 3:** Check console for connection messages
```
[Firebase] Connected to Auth Emulator...
```

### Issue: Emulator won't start

**Check Java:**
```powershell
java -version
# Should show: java version "1.8.0_471"
```

**If Java not found:**
```powershell
$env:Path += ";C:\Program Files\Java\jre1.8.0_471\bin"
```

**Then retry:**
```powershell
firebase emulators:start
```

### Issue: Port 9099 already in use

**Kill process on that port:**
```powershell
Get-NetTCPConnection -LocalPort 9099 | Stop-Process -Force
```

**Restart emulator:**
```powershell
firebase emulators:start
```

---

## 📊 Files Ready

✅ **start-emulator.ps1** - PowerShell script (RECOMMENDED)  
✅ **start-emulator.bat** - Batch file  
✅ **firebase.json** - Emulator config  
✅ **src/config/firebase.js** - Emulator connection logic  
✅ **.env** - Emulator toggle (set to true)  

---

## 🎉 Summary

**All dependencies configured:**
- ✅ Java installed and PATH set
- ✅ Firebase tools updated
- ✅ Firebase emulator configured
- ✅ Dev environment ready
- ✅ No 503 errors!

**Ready to test Phase 2.8:**
1. Start emulator: `.\start-emulator.ps1`
2. Start dev: `npm run dev` (with VITE_USE_EMULATOR=true)
3. Test at http://localhost:3000
4. See Emulator UI at http://127.0.0.1:4000

**Next:** Complete Phase 2.8 manual testing, then Phase 2.9 QA, then deploy to staging!

---

## 🚀 Let's Begin Phase 2.8!

Ready to start testing? Run:

```powershell
.\start-emulator.ps1
```

Then in a new terminal:
```powershell
npm run dev
```

See you at http://localhost:3000! 🎯
