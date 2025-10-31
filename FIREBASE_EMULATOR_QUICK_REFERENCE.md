# ⚡ FIREBASE EMULATOR - QUICK REFERENCE CARD

**Print this or bookmark it!**

---

## 🚀 SUPER QUICK START (Copy & Paste)

### Terminal 1 (Keep Open)
```powershell
cd d:\WebSites\salatiso-ecosystem\LifeSync-React-App
firebase emulators:start
```

### Terminal 2 (Keep Open)
```powershell
cd d:\WebSites\salatiso-ecosystem\LifeSync-React-App
npm run dev
```

### Browser
```
1. Emulator UI:  http://localhost:4000
2. Your App:     http://localhost:3001
```

---

## 📍 ALL SERVICE URLS

| Service | URL | Purpose |
|---------|-----|---------|
| **Your App** | http://localhost:3001 | Main app |
| **Emulator UI** | http://localhost:4000 | Create/view data |
| **Firestore Emulator** | localhost:8080 | Backend |
| **Auth Emulator** | localhost:9099 | Authentication |
| **Storage Emulator** | localhost:9199 | File storage |

---

## 🎯 8 COLLECTIONS, 22 DOCUMENTS

Quick list to create in Emulator UI:

1. `users` (1 doc)
2. `users/test-user-001/activities` (5 docs)
3. `users/test-user-001/notifications` (3 docs)
4. `users/test-user-001/contacts` (3 docs)
5. `users/test-user-001/calendar` (3 docs)
6. `users/test-user-001/assets` (3 docs)
7. `users/test-user-001/goals` (3 docs)
8. `users/test-user-001/verifications` (1 doc)

**Total: 22 documents**

---

## 🧪 12 WIDGETS TO TEST

After seed data is created, verify these display data:

1. ✅ Dashboard Widget
2. ✅ Profile Widget
3. ✅ Notifications Widget
4. ✅ Activity Feed Widget
5. ✅ Contacts Widget
6. ✅ Calendar Widget
7. ✅ Trust Score Widget
8. ✅ Verification Widget
9. ✅ Assets Widget
10. ✅ Goals Widget
11. ✅ Settings Widget
12. ✅ Export Widget

---

## 🛠️ COMMON COMMANDS

| Command | Purpose |
|---------|---------|
| `firebase emulators:start` | Start emulator |
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run lint` | Check code style |
| `firebase deploy` | Deploy to Firebase |
| `Ctrl+C` | Stop current process |

---

## 🐛 QUICK FIXES

| Issue | Solution |
|-------|----------|
| Port 8080 in use | `taskkill /PID [PID] /F` |
| Cannot connect | Check `.env.local` has emulator vars |
| App won't load | Check console (F12) for errors |
| Data not saving | Verify you're signed in |
| Emulator won't start | Update: `npm install -g firebase-tools@latest` |

---

## 📋 DAILY WORKFLOW

```
Morning:
├─ Terminal 1: firebase emulators:start
├─ Terminal 2: npm run dev
├─ Browser 1: http://localhost:4000 (if needed)
└─ Browser 2: http://localhost:3001

Work:
├─ Make code changes
├─ Test in app
├─ Check console (F12)
└─ Repeat!

Evening:
├─ npm run build
├─ npm run lint
├─ firebase deploy (when ready)
└─ Test on staging
```

---

## ✅ SUCCESS SIGNALS

You'll know it's working when:

| Signal | Meaning |
|--------|---------|
| "All emulators ready!" | ✅ Emulator running |
| "Local: http://localhost:3001" | ✅ Dev server ready |
| Console: "Connected to... Emulator" | ✅ App connected |
| Widgets show data | ✅ Everything working! |
| No red errors | ✅ No problems |

---

## 🚫 WARNING SIGNS

If you see these, something's wrong:

| Warning | Fix |
|---------|-----|
| Port already in use | Kill process using port |
| Cannot connect | Check terminals running |
| No emulator messages | Restart dev server |
| Widgets empty | Check data created |
| Red console errors | Read error, ask for help |

---

## 📊 PHASES AT A GLANCE

| Phase | What | Time | Next |
|-------|------|------|------|
| **3.4** | Create seed data + test widgets | 90 min | 🔄 Today |
| **4** | Calendar + Assets | 2 weeks | After 3.4 |
| **5** | Family Timeline + Analytics | 1 week | After 4 |
| **6** | Performance + Production | 2 weeks | After 5 |

**Total: 5 weeks to 100%**

---

## 💾 DATA PERSISTENCE

### Auto-Save (Good for Dev)
```
firebase emulators:start --import ./emulator-data --export-on-exit
```

### Manual Export
```
firebase emulators:export ./emulator-data
```

### Clear All Data
Just stop and restart emulator (data auto-clears unless you export)

---

## 🔐 REMEMBER

```
✅ Local Only
   └─ No internet
   └─ No real Firebase
   └─ No credentials exposed
   └─ 100% SECURE

❌ Never Use Production Firebase For Testing
   └─ Exposes real data
   └─ Costs money
   └─ Security risk
```

---

## 📞 HELP COMMANDS

```powershell
# Check Firebase version
firebase --version

# List emulator ports
firebase emulators:start --verbose

# View emulator logs
firebase emulators:start --debug

# Upgrade Firebase CLI
npm install -g firebase-tools@latest

# Check Node version
node --version
```

---

## 🎯 YOUR NEXT 3 ACTIONS

1. **Right Now:** Copy command from "SUPER QUICK START" above
2. **Terminal 1:** Run emulator command
3. **Terminal 2:** Run dev command
4. **Browser:** Open http://localhost:4000 and http://localhost:3001

**Then:** Create seed data

---

## 📖 FULL GUIDES

Need more help? Check these files:

- `00_FIREBASE_EMULATOR_START_HERE.md` - Start here
- `FIREBASE_EMULATOR_QUICK_START.md` - 3-step guide
- `FIREBASE_EMULATOR_LOCAL_SETUP.md` - Detailed guide
- `FIREBASE_EMULATOR_VISUAL_WORKFLOW.md` - Diagrams

---

## 🎉 YOU'VE GOT THIS!

Everything is configured. Just run the commands and follow the steps.

**Questions? Ask anytime!** 🚀

---

**Bookmark this page for quick reference!** ⭐
