# 🚨 CRITICAL: OAuth 2.0 Client IDs Missing - Recovery Guide

## Situation Summary

**Problem:** OAuth 2.0 Client IDs are completely empty in Google Cloud Console
```
No OAuth clients to display
```

**Scope:** Affecting ALL apps (lifesync, mini, and others)

**Impact:** Login functionality broken across entire ecosystem

**Root Cause:** Unknown - not caused by code changes or Git operations

---

## ⚠️ What We Know

**Confirmed:**
- ✗ OAuth 2.0 Client IDs deleted or corrupted
- ✗ Affects project: `lifecv-d2724` 
- ✗ Also affects: `incident-manager-459121` and other projects
- ✓ API Keys still present (Maps Platform API Key, LifeCV Search)
- ✓ Service Accounts still present
- ✗ OAuth Consent Screen: Status unknown

**Possible Causes:**
1. ❌ Manual deletion in Google Cloud Console
2. ❌ API/CLI command deleted them (unlikely - no matching git history)
3. ❌ Project migration or setting change
4. ❌ Permission change affecting OAuth credentials
5. ❌ Google Cloud scheduled maintenance or policy change

---

## ✅ STEP 1: Verify OAuth Consent Screen Status

**Go to:** https://console.cloud.google.com/apis/consent-screen

1. Select project: `lifecv-d2724`
2. Check: Is the OAuth Consent Screen "CONFIGURED" or "NOT CONFIGURED"?
3. **If NOT CONFIGURED:** You'll need to set it up first before creating OAuth clients

---

## ✅ STEP 2: Recreate OAuth 2.0 Client IDs

**Go to:** https://console.cloud.google.com/apis/credentials

1. **Select project:** `lifecv-d2724`
2. **Click:** "+ CREATE CREDENTIALS" (top button)
3. **Choose:** "OAuth client ID"
4. **Configure:**
   - Application type: **Web application**
   - Name: `LifeSync Web Client` (or descriptive name)
   - **Authorized JavaScript origins:**
     ```
     https://lifesync-lifecv.web.app
     https://lifesync-lifecv.firebaseapp.com
     http://localhost:3000
     ```
   - **Authorized redirect URIs:**
     ```
     https://lifesync-lifecv.web.app/__/auth/callback
     https://lifesync-lifecv.firebaseapp.com/__/auth/callback
     http://localhost:3000/auth/callback
     ```
5. **Click:** "Create"
6. **A popup will show:**
   - Client ID
   - Client Secret
   - **COPY AND SAVE THESE - You can't retrieve them again!**

**Store the Credentials**

Create a secure backup document with:
```
Project: lifecv-d2724
Application: LifeSync Web Client
Client ID: YOUR_OAUTH_CLIENT_ID_HERE
Client Secret: YOUR_OAUTH_CLIENT_SECRET_HERE
Created Date: 28 October 2025, 02:08:16 GMT+2
```

**SAVE THIS SECURELY - Do NOT commit to Git**

---

## ✅ STEP 3: Update Firebase Console with New Client ID

**Go to:** https://console.firebase.google.com/project/lifecv-d2724/authentication/settings

1. **Scroll to:** "Web SDK Configuration" section
2. **Verify:** All Firebase keys are present
3. **If you see the new OAuth Client ID:** Firebase automatically synced it ✓
4. **If not:** You may need to wait 5-10 minutes for sync

---

## ✅ STEP 4: Verify Google+ API is Enabled

**Go to:** https://console.cloud.google.com/apis/library/plus

1. **Select project:** `lifecv-d2724`
2. **Look for:** "Google+ API"
3. **Click:** It
4. **Verify:** Blue "ENABLE" button shows it's enabled (or already enabled)

---

## ✅ STEP 5: Update .env.local if Client ID Changed

**File:** `d:\WebSites\salatiso-ecosystem\LifeSync-React-App\.env.local`

If you generated a new OAuth Client ID, you **may** need to update:
```
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=salatiso-lifecv.web.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=lifecv-d2724
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=lifecv-d2724.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1039752653127
NEXT_PUBLIC_FIREBASE_APP_ID=1:1039752653127:web:54afa09b21c98ef231c462
```

**Note:** These are typically linked through Google Cloud to Firebase automatically, so you usually don't need to change them. But verify they're correct.

---

## ✅ STEP 6: For ALL Other Apps (mini, salatiso-React-App, etc.)

**Repeat the above steps for each affected project:**

Projects affected:
- `incident-manager-459121` (mini app)
- Any other projects missing OAuth clients

For each project:
1. Go to Google Cloud Console
2. Select the project
3. Create new OAuth 2.0 Client ID
4. Add appropriate domains for that app
5. Update Firebase Console
6. Update .env files

---

## 🔄 Testing After Recovery

1. **Rebuild LifeSync:**
   ```bash
   npm run build
   ```

2. **Deploy:**
   ```bash
   npm run deploy
   ```

3. **Test Production Login:**
   - Go to: https://lifesync-lifecv.web.app/auth
   - Click: "Continue with Google"
   - Expected: OAuth popup appears and login works

4. **Wait 5-10 minutes** for Google Cloud propagation

5. **Test Production Mini:**
   - Go to: your-mini-app-url/auth
   - Click: "Continue with Google"
   - Expected: OAuth popup appears and login works

---

## ⚡ Quick Checklist

**Google Cloud Console:**
- [ ] OAuth Consent Screen: CONFIGURED
- [ ] OAuth 2.0 Client IDs: CREATED (not empty)
- [ ] Authorized JavaScript Origins: Set correctly
- [ ] Authorized Redirect URIs: Set correctly
- [ ] Google+ API: ENABLED

**Firebase Console:**
- [ ] Authentication: ENABLED
- [ ] Google Provider: ENABLED
- [ ] OAuth Consent Screen: Linked to Google Cloud project
- [ ] Web SDK Configuration: Showing credentials

**App Configuration:**
- [ ] .env.local: Correct Firebase keys
- [ ] Build: Successful (npm run build)
- [ ] Deploy: Successful (npm run deploy)
- [ ] 5-10 minutes passed since Google Cloud changes

---

## 🆘 If This Doesn't Work

**Provide these details:**
1. Screenshot of Google Cloud Console → APIs & Services → Credentials (showing empty or new clients)
2. Exact error message from browser console (F12) when trying to login
3. Network tab screenshot of the failed request
4. Confirmation that OAuth Consent Screen is "CONFIGURED"
5. List of all affected apps

---

## ⚠️ Important Notes

**OAuth Credentials Security:**
- Never commit Client IDs or Secrets to Git
- Store securely outside repository
- Rotate them periodically
- If leaked, delete and create new ones

**Recovery Timeline:**
- OAuth Client creation: Immediate
- Google Cloud propagation: 5-10 minutes
- Firebase sync: Usually automatic
- Login working: After propagation complete

**Affected Applications (All Need Recovery):**
```
1. lifesync-lifecv.web.app (lifecv-d2724)
2. mini-app (incident-manager-459121)
3. salatiso-lifecv.web.app (shared project)
4. Any other auth-enabled apps on these projects
```

---

**ACTION REQUIRED:**
1. Follow STEP 1-6 above
2. Create new OAuth 2.0 Client IDs for each project
3. Update Firebase Console and .env files
4. Rebuild and deploy each app
5. Test login on each app after 5-10 minute propagation
5. Report results back

