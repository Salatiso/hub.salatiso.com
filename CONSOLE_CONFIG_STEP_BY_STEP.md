# 🔐 Firebase & Google Cloud Console Configuration Steps

**Goal**: Complete manual configuration to enable Google OAuth  
**Estimated Time**: 15 minutes  
**Difficulty**: Easy (copy-paste friendly)

---

## 🔥 Firebase Console Configuration

### Access Firebase Console
1. Open: https://console.firebase.google.com
2. Sign in with your Google account
3. Select project: **lifecv-d2724**
4. Left sidebar → **Authentication**

### Add Authorized Domains

**Path**: Authentication > Settings > Authorized Domains

**Steps**:
1. Click on the **Settings** tab
2. Scroll down to find **"Authorized domains"** section
3. Click the **"Add domain"** button
4. Enter the first domain:
   ```
   localhost:5173
   ```
5. Click **Add**
6. Click **Add domain** again
7. Enter the second domain:
   ```
   127.0.0.1:5173
   ```
8. Click **Add**

**Result**: Your authorized domains list should now include:
```
✓ lifecv-d2724.firebaseapp.com
✓ lifecv-d2724.web.app
✓ localhost:5173          ← YOU ADDED THIS
✓ 127.0.0.1:5173          ← YOU ADDED THIS
```

**Save**: Changes auto-save. You're done with Firebase Console!

---

## ☁️ Google Cloud Console Configuration

### Access Google Cloud Console
1. Open: https://console.cloud.google.com
2. Sign in with your Google account
3. Select project: **lifecv-d2724**

### Update OAuth 2.0 Credentials

**Path**: APIs & Services > Credentials > OAuth 2.0 Client IDs

**Steps**:
1. In left sidebar, click **APIs & Services**
2. Click **Credentials**
3. Under **OAuth 2.0 Client IDs**, find the entry for "Web"
4. Click on it to edit
5. Find the **"Authorized redirect URIs"** section

**Add these redirect URIs** (if not already present):
```
http://localhost:5173/
http://127.0.0.1:5173/
https://lifecv-d2724.firebaseapp.com/
https://lifecv-d2724.web.app/
https://localhost:5173/
```

**Steps to add each**:
1. Click **"Add URI"** button
2. Paste one of the URLs above
3. Click outside the field or press Enter
4. Repeat for each URL
5. Click **Save**

**Result**: Your redirect URIs should include all 5 URLs above

**Also Update Authorized JavaScript Origins**:
1. Find **"Authorized JavaScript origins"** section
2. Add these origins (if not present):
   ```
   http://localhost:5173
   http://127.0.0.1:5173
   https://lifecv-d2724.firebaseapp.com
   https://lifecv-d2724.web.app
   https://localhost:5173
   ```
3. Click **Save**

---

## 🎯 OAuth Consent Screen Configuration

**Path**: APIs & Services > OAuth Consent Screen

**Steps**:
1. In left sidebar, click **APIs & Services**
2. Click **OAuth Consent Screen**
3. Ensure **User Type** is set to: `External`
   - If not, click **Create Consent Screen** button
   - Select **External** → **Create**

**Fill out Required Information**:

**App Name**:
```
LifeSync
```

**User support email**:
```
[Your Gmail or project email]
```

**App logo** (optional):
- Skip for now

**Developer contact information**:
- **Email**: [Your Gmail or project email]

**Save and Continue**

### Add Scopes

1. Click **Add or Remove Scopes**
2. Search for and select:
   - `email`
   - `profile`
3. Click **Update**
4. Click **Save and Continue**

### Add Test Users

1. On **Test users** page, click **Add users**
2. Add these test email addresses:
   ```
   spiceinc@gmail.com
   zenzxru@gmail.com
   kwakhomdeni@gmail.com
   tina@salatiso.com
   mdenit21@gmail.com
   visasande@gmail.com
   mdenivisa@gmail.com
   sazisimdeni@gmail.com
   milandep.mdeni@gmail.com
   milamdeni@gmail.com
   azoramdeni@gmail.com
   mdeninotembac@gmail.com
   ```
3. Click **Add**
4. **Save and Continue**

**Status**: Your OAuth Consent Screen is now configured for testing!

---

## ✅ Verification Checklist

Use this checklist to verify all configurations are correct:

### Firebase Console
- [ ] Navigated to https://console.firebase.google.com
- [ ] Selected lifecv-d2724 project
- [ ] Found Authentication > Settings > Authorized Domains
- [ ] Added `localhost:5173`
- [ ] Added `127.0.0.1:5173`
- [ ] Verified both appear in the authorized domains list
- [ ] Changes appeared immediately (no manual save needed)

### Google Cloud Console - OAuth Credentials
- [ ] Navigated to https://console.cloud.google.com
- [ ] Selected lifecv-d2724 project
- [ ] Went to APIs & Services > Credentials
- [ ] Found OAuth 2.0 Client ID (Web)
- [ ] Edited the client ID
- [ ] Added `http://localhost:5173/` to redirect URIs
- [ ] Added `http://127.0.0.1:5173/` to redirect URIs
- [ ] Added `https://lifecv-d2724.firebaseapp.com/` (verify exists)
- [ ] Added `https://lifecv-d2724.web.app/` (verify exists)
- [ ] Added `https://localhost:5173/` to redirect URIs
- [ ] Added corresponding JavaScript origins
- [ ] Clicked Save

### Google Cloud Console - OAuth Consent Screen
- [ ] Went to APIs & Services > OAuth Consent Screen
- [ ] Verified User Type is "External"
- [ ] Set App name to "LifeSync"
- [ ] Set User support email
- [ ] Set Developer contact information
- [ ] Added scopes: email, profile
- [ ] Added all test users from .env file
- [ ] Saved all changes

---

## 🧹 Browser Cleanup (Before Testing)

### Clear Cache and Cookies
1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select **All time** from the dropdown
3. Check these boxes:
   - ✓ Cookies and other site data
   - ✓ Cached images and files
4. Click **Clear data**

### Close and Reopen Browser
1. Close all browser tabs
2. Close browser completely
3. Wait 3 seconds
4. Reopen browser

### Hard Refresh
1. Navigate to http://localhost:5173
2. Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
3. Wait for page to fully load

---

## 🧪 Testing Instructions

### Local Testing (Recommended First)

1. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   - Opens at http://localhost:5173

2. **Navigate to App**:
   - Open http://localhost:5173 in your browser
   - Verify page loads without errors

3. **Test Google Sign-In**:
   - Look for "Sign in with Google" button
   - Click the button
   - Should redirect to Google sign-in page
   - Sign in with your test Google account
   - Should redirect back to LifeSync dashboard
   - Profile should display your Google name

4. **Verify No Errors**:
   - Open DevTools: Press `F12`
   - Go to Console tab
   - Should see NO red error messages
   - Should see login success logs

### Staging Testing (After Local Works)

1. **Navigate to Staging URL**:
   - Open https://lifecv-d2724.web.app

2. **Repeat All Local Tests**:
   - Test Google Sign-In
   - Verify profile displays
   - Check for errors

3. **Test on Mobile** (if possible):
   - iPhone or Android device
   - Same test flow
   - Verify works on mobile too

---

## 📊 Common Configuration Issues & Solutions

### Issue 1: "localhost:5173 not found" in Firebase Console

**Solution**:
1. Double-check you're in the right project (lifecv-d2724)
2. Make sure you clicked "Add domain" button
3. Verify spelling: exactly `localhost:5173`
4. Try again with `127.0.0.1:5173`

### Issue 2: OAuth redirect URIs not saving

**Solution**:
1. Make sure you're editing the correct "OAuth 2.0 Client ID"
2. Try one URI at a time
3. Press Enter or click outside field after each
4. Then click "Save" at the bottom
5. Wait 10 seconds before refreshing page

### Issue 3: Still getting "referer blocked" error

**Solution**:
1. Verify ALL steps above are complete
2. Check for typos in domain names
3. Clear browser cache again (Ctrl+Shift+Delete)
4. Hard refresh: Ctrl+Shift+R
5. Wait 5-10 minutes (Firebase cache propagation)
6. Try again

### Issue 4: "Invalid Client" error

**Solution**:
1. Verify Client ID hasn't been deleted
2. Check that you're using the "Web" OAuth 2.0 credentials
3. Not the "Desktop" or "Android" credentials
4. Verify API key in .env is correct

---

## ⏰ Timeline

| Step | Time | Notes |
|------|------|-------|
| Firebase Config | 5 min | Add 2 domains |
| Google Cloud OAuth | 5 min | Add 5 redirect URIs |
| Google Cloud Consent | 3 min | Fill basic info + test users |
| Browser Cleanup | 2 min | Cache clear + hard refresh |
| **TOTAL** | **15 min** | Ready to test! |

---

## 📱 What NOT to Do

❌ Don't edit `firebaseConfig` code directly  
❌ Don't regenerate OAuth credentials (existing ones work fine)  
❌ Don't change Firebase region or project  
❌ Don't delete existing authorized domains  
❌ Don't use `localhost:3000` (app runs on 5173)  
❌ Don't forget to save changes (usually auto-save, but verify)  

---

## ✅ Success Indicators

When everything is configured correctly:

✅ Firebase Console shows `localhost:5173` in Authorized Domains  
✅ Google Cloud Console shows `http://localhost:5173/` in redirect URIs  
✅ OAuth Consent Screen is configured with test users  
✅ Browser cache is cleared  
✅ Dev server is running  
✅ Navigate to localhost:5173 → no "referer blocked" error  
✅ Click "Sign in with Google" → redirects to Google  
✅ After sign-in → redirects back to dashboard  
✅ Console has NO red error messages  

---

## 🔧 Troubleshooting Commands

If you need to verify server is running:
```bash
# Dev server check
npm run dev

# Build check
npm run build

# Port verification (Windows)
netstat -ano | findstr :5173

# Port verification (Mac/Linux)
lsof -i :5173
```

---

## 📞 Getting Help

If something doesn't work:

1. **Check console**: F12 → Console → Look for error messages
2. **Verify all steps**: Go through checklist above
3. **Clear cache**: Ctrl+Shift+Delete → Hard refresh
4. **Wait**: Firebase propagation sometimes takes 5-10 min
5. **Screenshot**: Take screenshot of error, compare with guide

---

## 🎉 You're Ready!

After completing all steps above:

1. ✅ Code is deployed
2. ✅ Dev server is running
3. ✅ Firebase is configured
4. ✅ Google Cloud is configured
5. ✅ Browser cache is cleared
6. ✅ Ready to test!

**Next**: Follow "Testing Instructions" above to verify everything works.

---

**Document Version**: 1.0  
**Created**: October 30, 2025  
**For**: LifeSync React App (lifecv-d2724)  
**Status**: Ready to implement ✅

