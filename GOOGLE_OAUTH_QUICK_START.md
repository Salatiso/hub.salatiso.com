# ⚡ Google OAuth - Quick Start (After Console Config)

## 🎯 What Was Fixed

**Problem**: Google Sign-In button wasn't working  
**Cause**: Firebase Emulator blocking OAuth + `localhost:5173` not authorized  
**Solution**: Disabled emulator, deployed new build

---

## ⏳ What YOU Need To Do

### Step 1: Firebase Console (5 minutes)
1. Go to https://console.firebase.google.com
2. Select `lifecv-d2724` project
3. Go to **Authentication > Settings > Authorized Domains**
4. Add:
   - `localhost:5173`
   - `127.0.0.1:5173`
5. Save

### Step 2: Google Cloud Console (5 minutes)
1. Go to https://console.cloud.google.com
2. Select `lifecv-d2724` project
3. Go to **APIs & Services > Credentials**
4. Edit your OAuth 2.0 Client ID
5. Add to "Authorized Redirect URIs":
   ```
   http://localhost:5173/
   http://127.0.0.1:5173/
   https://lifecv-d2724.web.app/
   ```
6. Save

### Step 3: Test It (2 minutes)
1. Clear browser cache: `Ctrl+Shift+Delete`
2. Go to `http://localhost:5173`
3. Click "Sign in with Google"
4. Complete Google sign-in flow
5. ✅ Should work!

---

## 📍 Current Status

| Component | Status | URL |
|-----------|--------|-----|
| Dev Server | ✅ Running | http://localhost:5173 |
| Staging | ✅ Deployed | https://lifesync-lifecv.web.app |
| Build | ✅ Complete | 82 files |
| Config | ⏳ Manual | Add `localhost:5173` to Firebase |

---

## 🧪 Quick Test

```
1. Local: http://localhost:5173
   └─ Click "Sign in with Google"
   └─ Should redirect to Google login
   └─ Should return to dashboard
   ✅ Success!

2. Staging: https://lifesync-lifecv.web.app
   └─ Same flow
   └─ Should also work
   ✅ Success!
```

---

## 🔗 Full Guides

- **Detailed Configuration**: `GOOGLE_OAUTH_FIX_GUIDE_OCT30.md`
- **Complete Summary**: `GOOGLE_OAUTH_FIX_SUMMARY_OCT30.md`
- **All Documentation**: Check root folder for `*OCT30*.md` files

---

## ❌ If It Still Doesn't Work

1. **Check console (F12)** for error messages
2. **Verify Firebase domains** added correctly
3. **Verify Google Cloud redirects** added correctly
4. **Hard refresh**: `Ctrl+Shift+R`
5. **Check**: Are you signed into the right Google account?
6. **Wait**: Firebase cache sometimes takes 5-10 minutes

---

## ✅ Success Indicators

When working correctly, you'll see:
- ✅ No 403 errors in console
- ✅ No "referer blocked" messages
- ✅ Redirect to Google login works
- ✅ Redirects back to dashboard
- ✅ Profile shows your Google name
- ✅ Can see dashboard without re-logging

---

**Last Updated**: October 30, 2025  
**Estimated Time to Fix**: 10-15 minutes (manual console work)  
**Estimated Time to Test**: 5 minutes (per environment)
