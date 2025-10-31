# 🔧 Google OAuth localhost:3001 Fix

## Problem
```
auth/requests-from-referer-http://localhost:3000-are-blocked
```

Your app is running on **localhost:3001** but Firebase OAuth is configured for **localhost:3000**.

---

## Solution: Update Firebase OAuth Authorized Domains

### Step 1: Go to Firebase Console
1. Open: https://console.firebase.google.com
2. Select project: **lifecv-d2724**
3. Go to: **Build > Authentication > Settings**

### Step 2: Find "Authorized domains"
Look for the section that shows authorized domains/referers:
```
✓ localhost:3000
```

### Step 3: Add localhost:3001
You need to add **localhost:3001** to the authorized domains.

**Method A: Via Firebase Console (If Available)**
1. In Authentication Settings, look for "Authorized redirect URIs"
2. Click "Add URI"
3. Add: `http://localhost:3001`
4. Click Save

**Method B: Via Google Cloud Console (If Needed)**
1. Go to: https://console.cloud.google.com
2. Project: **lifecv-d2724**
3. Go to: **APIs & Services > Credentials**
4. Find OAuth 2.0 Client IDs (type: Web application)
5. Click to edit
6. In "Authorized redirect URIs", add:
   ```
   http://localhost:3001
   ```
7. Click Save

---

## Quick Check: Is Dev Server Running on 3001?

Run this in terminal:
```powershell
netstat -ano | findstr ":3001"
```

Expected output:
```
TCP    127.0.0.1:3001    0.0.0.0:0    LISTENING    12345
```

If you see nothing, the dev server isn't running. Start it:
```powershell
npm run dev
```

---

## After Updating Firebase Console

### Clear Browser Cache
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Clear site data**
4. Close browser tab completely
5. Reopen: http://localhost:3001

### Try Google Sign-In Again
1. Refresh page (F5)
2. Click "Sign in with Google"
3. Should now work!

---

## If Still Not Working

### Check Console for Errors
1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for error messages
4. Tell me what you see

### Verify Port
```powershell
# Check what's on port 3001
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue

# Check what's on port 3000
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
```

### Fallback: Use Local Account
If OAuth is still blocked:
1. Click **"Create Local Account"**
2. Enter any name
3. Enter PIN: **1234**
4. This bypasses OAuth entirely!

---

## Summary

| Before | After |
|--------|-------|
| ❌ OAuth blocked on localhost:3000 | ✅ OAuth works on localhost:3001 |
| ❌ "auth/requests-from-referer..." error | ✅ "Sign in with Google" works |
| ❌ Can't use Google auth | ✅ Full Google auth support |

---

## Next Steps

1. **Add localhost:3001 to Firebase Console**
2. **Refresh browser** (clear cache)
3. **Try Google sign-in again**
4. **Report back**: "Working!" or paste error message

**Time to fix: 2-3 minutes**

---

**Questions? Let me know what you see in the console!** 🚀
