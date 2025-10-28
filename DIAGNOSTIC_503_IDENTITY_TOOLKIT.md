# 🔍 Immediate Diagnostic: Check Google Cloud APIs

## The 503 Error Explained

Your error:
```
identitytoolkit.googleapis.com/v1/projects?key=AIzaSyBl15V2pM4E6Yeh7YzVEdBjXsH3E2b1Wro:1
Failed to load resource: the server responded with a status of 503 ()
```

**This is NOT a code issue.** This is Google's Identity Toolkit API returning 503 (Service Unavailable).

---

## 🎯 Quick Diagnostic Steps

### Step 1: Check if Identity Toolkit API is Enabled

Open this URL (you'll need to be logged into Google Cloud):
```
https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=lifecv-d2724
```

**Check:**
- Is "Identity Toolkit API" **ENABLED**?
- If not, click "ENABLE"

### Step 2: Check API Status

Open this URL to check Google API status:
```
https://status.cloud.google.com/
```

**Look for:**
- Identity Platform / Identity Toolkit
- Any red indicators or ongoing issues

### Step 3: Check Your API Key

Open this URL:
```
https://console.cloud.google.com/apis/credentials?project=lifecv-d2724
```

**Find your API key:** `AIzaSyBl15V2pM4E6Yeh7YzVEdBjXsH3E2b1Wro`

**Click "Edit" and verify:**

✅ **Application restrictions:**
- Should be: "HTTP referrers (web sites)"

✅ **Website restrictions should include:**
```
http://localhost:3000/*
http://localhost:5173/*
https://lifecv-d2724.web.app/*
https://lifecv-d2724.firebaseapp.com/*
```

✅ **API restrictions:**
- Should include: "Identity Toolkit API"
- Or: "Don't restrict key" (not recommended but works)

### Step 4: Check Quotas

Open this URL:
```
https://console.cloud.google.com/apis/api/identitytoolkit.googleapis.com/quotas?project=lifecv-d2724
```

**Look for:**
- Requests per day: Should not be at 100%
- Requests per minute: Should not be exceeded

### Step 5: Check Billing

Open this URL:
```
https://console.cloud.google.com/billing/linkedaccount?project=lifecv-d2724
```

**Verify:**
- Project has a billing account linked
- Billing account is active (even for free tier)

---

## 🔧 Quick Fixes to Try

### Fix 1: Regenerate API Key

If the key is corrupted or has issues:

1. Go to: https://console.cloud.google.com/apis/credentials?project=lifecv-d2724
2. Create a new API key
3. Configure restrictions:
   - HTTP referrers: `http://localhost:3000/*`
   - APIs: Identity Toolkit API
4. Update `.env` with new key

### Fix 2: Use Different Firebase Project

If this project has issues, you could:
1. Create a new Firebase project temporarily
2. Get new credentials
3. Test if authentication works

### Fix 3: Use Firebase Emulator (No Google Cloud APIs)

As mentioned in the other guide, this bypasses Google Cloud entirely:
```powershell
firebase login
firebase init emulators
firebase emulators:start
```

Then update code to use emulator during development.

---

## 🚨 Common Causes of 503 Errors

### Cause 1: API Not Enabled
**Solution:** Enable Identity Toolkit API in console

### Cause 2: Quota Exceeded
**Solution:** Wait 24 hours or upgrade plan

### Cause 3: Rate Limiting
**Solution:** Wait 1 hour or use emulator

### Cause 4: Billing Issue
**Solution:** Link valid billing account

### Cause 5: Google Service Outage
**Solution:** Check status.cloud.google.com, wait for recovery

### Cause 6: API Key Misconfiguration
**Solution:** Recreate API key with proper settings

---

## 🎯 What I Recommend

Since you're getting consistent 503 errors, here's the priority order:

**Priority 1: Check if API is enabled**
```
https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=lifecv-d2724
```
- If disabled → Enable it
- Wait 5 minutes
- Try again

**Priority 2: Check quotas**
```
https://console.cloud.google.com/apis/api/identitytoolkit.googleapis.com/quotas?project=lifecv-d2724
```
- If exceeded → Wait or upgrade
- If not exceeded → Continue to Priority 3

**Priority 3: Use Firebase Emulator**
```powershell
firebase emulators:start --only auth
```
- Bypasses Google Cloud API entirely
- Guaranteed to work
- Good for development

**Priority 4: Create new API key**
- Last resort if key is corrupted
- Update .env file
- Test again

---

## 📋 Action Items

**What you need to do:**

1. **Check Google Cloud Console** (5 minutes)
   - Verify Identity Toolkit API is enabled
   - Check quotas
   - Verify billing is linked

2. **If still 503 errors:**
   - Set up Firebase Emulator (10 minutes)
   - I'll help configure the code

3. **Long-term fix:**
   - Identify root cause in Google Cloud
   - Configure proper quotas/billing
   - Switch back to production Firebase

---

## 🔗 Quick Links Summary

| Check | URL |
|-------|-----|
| Enable API | https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=lifecv-d2724 |
| API Credentials | https://console.cloud.google.com/apis/credentials?project=lifecv-d2724 |
| Quotas | https://console.cloud.google.com/apis/api/identitytoolkit.googleapis.com/quotas?project=lifecv-d2724 |
| Billing | https://console.cloud.google.com/billing/linkedaccount?project=lifecv-d2724 |
| Google Status | https://status.cloud.google.com/ |

---

Let me know what you find in the Google Cloud Console, and I'll help you fix it!
