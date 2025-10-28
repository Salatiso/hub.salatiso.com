# ⚡ IMMEDIATE ACTION: Start Firebase Emulator to Bypass 503 Errors

**Status:** ✅ Ready to Use  
**Solution:** Firebase Local Emulator (bypasses Google Cloud API)  
**Time to Fix:** 2 minutes  

---

## 🎯 The Problem

You're getting:
```
identitytoolkit.googleapis.com → 503 Service Unavailable
Firebase: Error (auth/network-request-failed)
```

**This is Google Cloud's problem, not your code.**

---

## ✅ The Solution (Already Configured!)

I've set up Firebase Emulator for you. Just run these commands:

### Step 1: Start Firebase Emulator
```powershell
firebase emulators:start
```

**If you get "firebase: command not found":**
```powershell
npm install -g firebase-tools
firebase login
firebase emulators:start
```

### Step 2: Enable Emulator Mode

**Option A: Edit `.env` file**
Open `.env` and change:
```properties
VITE_USE_EMULATOR=true
```

**Option B: Set environment variable**
```powershell
$env:VITE_USE_EMULATOR='true'
```

### Step 3: Restart Dev Server
```powershell
# Ctrl+C to stop current server
npm run dev
```

---

## 🎉 Expected Result

✅ **Console will show:**
```
[Firebase] Connected to Auth Emulator at http://127.0.0.1:9099
[Firebase] Connected to Firestore Emulator at 127.0.0.1:8080
```

✅ **Authentication will work** (no 503 errors)  
✅ **Emulator UI available** at http://127.0.0.1:4000  
✅ **Test accounts** can be created without real Google sign-in  

---

## 🔧 Complete Terminal Commands

**Run in Terminal 1:**
```powershell
cd d:\WebSites\salatiso-ecosystem\LifeSync-React-App
firebase emulators:start
```

**Run in Terminal 2:**
```powershell
cd d:\WebSites\salatiso-ecosystem\LifeSync-React-App

# Set emulator mode
$env:VITE_USE_EMULATOR='true'

# Start dev server
npm run dev
```

**Open Browser:**
```
http://localhost:3000  ← Your app
http://127.0.0.1:4000  ← Emulator UI (view test users)
```

---

## 🎯 What Changed

| File | Change |
|------|--------|
| `firebase.json` | Added auth emulator config (port 9099) |
| `src/config/firebase.js` | Added emulator connection logic |
| `.env` | Added `VITE_USE_EMULATOR=false` (change to true) |

---

## 🚨 Troubleshooting

### "firebase: command not found"
```powershell
npm install -g firebase-tools
firebase login
```

### "Port 9099 already in use"
```powershell
Get-NetTCPConnection -LocalPort 9099 | Stop-Process -Id $_.OwningProcess -Force
firebase emulators:start
```

### "Still getting 503 errors"
Make sure:
1. Emulator is running (check http://127.0.0.1:4000)
2. `.env` has `VITE_USE_EMULATOR=true`
3. Dev server restarted after changing .env
4. Console shows "Connected to Auth Emulator"

---

## 📚 Full Documentation

For complete details, see:
- **FIREBASE_EMULATOR_SOLUTION.md** - Complete setup guide
- **DIAGNOSTIC_503_IDENTITY_TOOLKIT.md** - Google Cloud diagnostics
- **STRATEGY_2_EMULATOR_SETUP.md** - Alternative strategies

---

## 🎯 Summary

**Problem:** Google Cloud Identity Toolkit API returning 503  
**Root Cause:** API quota/rate limiting/service issues  
**Solution:** Use local Firebase Emulator (no Google Cloud calls)  
**Status:** ✅ Configured and ready  

**Start emulator now:**
```powershell
firebase emulators:start
```

**Then set `.env`:**
```
VITE_USE_EMULATOR=true
```

**Then restart dev server:**
```powershell
npm run dev
```

**Result:** ✅ No more 503 errors!
