# 🎯 GOOGLE OAUTH SETUP - VISUAL GUIDE

**Problem:** Can't sign in with Google on localhost  
**Solution:** 3 simple Firebase Console updates  
**Time:** 5 minutes

---

## 🗺️ FIREBASE CONSOLE NAVIGATION

### Step 1: Add Authorized Domain

**URL:** https://console.firebase.google.com/project/lifecv-d2724/authentication/settings/domains

```
┌─ Firebase Console
│  └─ Authentication (left menu)
│     └─ Settings
│        └─ Authorized domains
│           └─ [+ Add domain]
│              └─ Type: localhost:3000
│                 └─ [Add]
│                    └─ ✓ Wait for verified
```

---

### Step 2: Configure Google Provider

**URL:** https://console.firebase.google.com/project/lifecv-d2724/authentication/providers

```
┌─ Firebase Console
│  └─ Authentication (left menu)
│     └─ Providers
│        └─ [Google] (click to edit)
│           ├─ Authorized JavaScript origins
│           │  └─ Add: http://localhost:3000
│           │
│           └─ Authorized redirect URIs
│              └─ Add: http://localhost:3000/__/auth/handler
│
└─ [Save]
```

---

## 📋 EXACT VALUES TO ADD

### Authorized JavaScript Origins (Field 1)
```
http://localhost:3000
```

### Authorized Redirect URIs (Field 2)
```
http://localhost:3000/__/auth/handler
```

---

## ✅ CHECKLIST

After making changes:

- [ ] Navigated to Firebase Console
- [ ] Added `localhost:3000` to Authorized Domains
- [ ] Added `http://localhost:3000` to JavaScript Origins
- [ ] Added `http://localhost:3000/__/auth/handler` to Redirect URIs
- [ ] Clicked Save
- [ ] Waited 1-2 minutes for changes to propagate
- [ ] Cleared browser cache (Ctrl+Shift+R)
- [ ] Tried Google sign in again

---

## 🔄 TEST THE FIX

1. **Open app:** http://localhost:3000
2. **Click:** "Sign in with Google"
3. **Expected:** Google login dialog opens
4. **NOT expected:** Referer error message

---

## 💡 WHY THIS WORKS

| Setting | Why Needed |
|---------|-----------|
| **Authorized Domain** | Tells Firebase which URLs can use its auth |
| **JavaScript Origin** | Tells Google OAuth request is legitimate |
| **Redirect URI** | Where to send user after OAuth completes |

---

## 🚀 IF IT STILL DOESN'T WORK

**Try these in order:**

1. **Hard refresh:** Ctrl+Shift+R
2. **Clear cache:** DevTools → Application → Clear Storage
3. **Use local account:** Click "Create Local Account" instead
4. **Try incognito:** Ctrl+Shift+N (might have cookie issues)
5. **Check console:** F12 → Console → Look for error messages

---

## 📞 COMMON ISSUES & FIXES

### Issue: Still see "requests-from-referer...are-blocked"
**Fix:** 
- Verify you added exactly `http://localhost:3000` (with http://)
- Wait 2-3 minutes for Firebase to sync
- Hard refresh (Ctrl+Shift+R)

### Issue: Google popup doesn't open
**Fix:**
- Check if popups are blocked in browser
- Try different browser
- Try incognito mode

### Issue: Signed in but get permission error
**Fix:**
- Check Firestore security rules (see below)
- Verify user UID matches collection path

---

## 🔐 FIRESTORE RULES CHECK

If you see permission errors after signing in, ensure your rules allow it:

**File:** `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Users can read/write their sub-collections
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

---

## ✨ SUCCESS!

After these steps:
- ✅ Google sign in works
- ✅ No referer errors
- ✅ Can test Phase 3.4 widgets
- ✅ Real Firebase data shows up

---

**Questions?** Check the detailed guide: `GOOGLE_OAUTH_LOCALHOST_FIX.md`

