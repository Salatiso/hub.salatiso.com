# 🔥 Firebase Emulator Quick Start

**Date**: October 28, 2025  
**Status**: ✅ Ready for Testing  

---

## 🚀 **QUICK START (3 Steps)**

### **Step 1: Start Emulator (Terminal 1)**
```powershell
cd D:\WebSites\salatiso-ecosystem\LifeSync-React-App
firebase emulators:start --only auth
```

**Wait for:**
```
✔  All emulators ready! It is now safe to connect your app.
│ View Emulator UI at http://127.0.0.1:4000/
│ Authentication │ 127.0.0.1:9099 │ http://127.0.0.1:4000/auth
```

### **Step 2: Start Dev Server (Terminal 2)**
```powershell
cd D:\WebSites\salatiso-ecosystem\LifeSync-React-App
npm run dev
```

**Wait for:**
```
VITE v4.5.14  ready in XXX ms
➜  Local:   http://localhost:3000/
```

### **Step 3: Test Guest Signup**
1. Visit: **http://localhost:3000/auth?mode=signin**
2. Click: **"Try as Guest (7 days free)"**
3. Enter name and optional email
4. **Done!** ✅

---

## 📊 **WHAT YOU CAN TEST NOW**

### ✅ **Working Features**
- [x] Guest account creation (no signup needed)
- [x] 7-day trial accounts
- [x] Offline mode toggle
- [x] Analytics dashboard
- [x] Feedback system
- [x] Sync preferences
- [x] Real-time collaboration (localStorage)
- [x] Performance monitoring

### 🚫 **Blocked Features** (Need Firebase Production)
- ❌ Google sign-in (requires credentials)
- ❌ Email/password auth (requires production Firebase)
- ❌ Real Firestore data (emulator issue)

---

## 📋 **TROUBLESHOOTING**

### **Problem: "503 Service Unavailable"**
**Solution**: Ensure emulator is running and app sees `VITE_USE_EMULATOR=true`
```powershell
# Verify emulator
netstat -ano | findstr 9099
# Should show: TCP 127.0.0.1:9099 LISTENING
```

### **Problem: "Cannot GET /auth"**
**Solution**: Dev server not running. Restart in separate terminal:
```powershell
npm run dev
```

### **Problem: Guest signup not showing**
**Solution**: Refresh browser after dev server restarts:
```
http://localhost:3000/auth?mode=signin
```

### **Problem: Emulator says "already running"**
**Solution**: Kill existing processes and restart:
```powershell
taskkill /IM node.exe /F
firebase emulators:start --only auth
```

---

## 🔍 **MONITOR EMULATOR**

**View all activity:**  
**http://127.0.0.1:4000/auth**

Shows:
- ✅ User creation events
- ✅ Authentication logs
- ✅ Session data
- ✅ Error messages

---

## 🎯 **NEXT STEPS**

### **For Guest Account Testing:**
1. Create guest account
2. Toggle offline mode
3. Submit feedback
4. View analytics

### **For Production Features:**
1. Use Google OAuth (configure in Firebase Console)
2. Use email auth (configure authorized domains)
3. Use Firestore (upgrade Java emulator)

---

## 🔧 **ENVIRONMENT VARIABLES**

Current `.env` configuration:
```properties
VITE_USE_EMULATOR=true        # Enable emulator mode
VITE_FIREBASE_PROJECT_ID=lifecv-d2724
VITE_FIREBASE_AUTH_DOMAIN=lifecv-d2724.firebaseapp.com
```

---

## 📞 **SUPPORT**

**Emulator not starting?**
- Java: `java -version` (should be 21+)
- Ports: `netstat -ano | findstr 9099`
- Firebase: `firebase -v` (should be 13+)

**App not connecting?**
- Check: `http://localhost:3000/` loads
- Check: `.env` has `VITE_USE_EMULATOR=true`
- Check: Console shows `[Firebase] Connected Auth to emulator`

---

## 🎉 **YOU'RE READY!**

**Start testing your advanced features now!**

1. ✅ Emulator running
2. ✅ Dev server running
3. ✅ Guest signup available
4. ✅ All features accessible

**Visit: http://localhost:3000/auth?mode=signin**

**Click: "Try as Guest (7 days free)"**

**Enjoy testing!** 🚀
