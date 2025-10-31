# 📸 Step-by-Step: Add localhost:3001 to Firebase OAuth

## 🎯 Goal
Add **http://localhost:3001** to Firebase's authorized domains so Google OAuth works on your dev server.

---

## ✅ Step 1: Verify Dev Server is on 3001

Open PowerShell and check:
```powershell
netstat -ano | findstr ":3001"
```

You should see:
```
TCP    127.0.0.1:3001    0.0.0.0:0    LISTENING    [Process ID]
```

**If you see nothing:** Your dev server isn't running. Start it:
```powershell
npm run dev
```

Wait for: `VITE v4.5.0 ready in XXX ms → Local: http://localhost:3001`

---

## ✅ Step 2: Open Firebase Console

1. Go to: https://console.firebase.google.com
2. **Click** on project: **lifecv-d2724**
3. Look for left sidebar with:
   ```
   Build
   ├─ Firestore Database
   ├─ Realtime Database
   ├─ Storage
   ├─ Authentication  ← CLICK HERE
   ├─ Functions
   └─ Extensions
   ```

---

## ✅ Step 3: Go to Authentication Settings

1. Click **Authentication** in left sidebar
2. At top, click **Settings** tab
3. Scroll down to find one of these sections:
   - **"Authorized domains"** OR
   - **"Authorized redirect URIs"** OR
   - **"Authorized redirect domains"**

Look for:
```
✓ localhost:3000
□ (empty field to add more)
```

---

## ✅ Step 4: Add localhost:3001

### Option A: In Firebase Console (Most Common)
1. Look for input field or "Add domain" button
2. Enter: `http://localhost:3001` or `localhost:3001`
3. Click "Add" or "Save"
4. Wait for confirmation ✓

### Option B: Via Google Cloud Console (If Not in Firebase)
If you can't find it in Firebase Console:

1. Go to: https://console.cloud.google.com
2. Make sure project **lifecv-d2724** is selected (dropdown at top)
3. Click **APIs & Services** → **Credentials**
4. Find a Web Application OAuth 2.0 Client (looks like "Client ID for Web application")
5. Click the edit pencil ✎
6. Look for **"Authorized redirect URIs"**
7. Add new line: `http://localhost:3001`
8. Click **Save**

---

## ✅ Step 5: Clear Browser Cache

Your browser has cached the old OAuth config. Clear it:

### Option A: Quick Clear (Best)
1. Open DevTools: **F12**
2. Go to **Application** tab (or **Storage** in Firefox)
3. Click **"Clear site data"** button at bottom
4. **Completely close** the browser tab

### Option B: Full Clear
1. Ctrl + Shift + Delete (opens clear history)
2. Time range: **All time**
3. ✓ Cookies and other site data
4. ✓ Cached images and files
5. Click **Clear data**

---

## ✅ Step 6: Test Google OAuth

1. Open fresh browser tab
2. Go to: **http://localhost:3001**
3. Click **"Sign in with Google"** button
4. You should see Google login popup

**If it works:** ✅ Success! Close this guide.

**If it still fails:** Continue below...

---

## 🐛 Troubleshooting

### Issue: Still seeing "auth/requests-from-referer-http://localhost:3001-are-blocked"

**Try this:**

1. Open DevTools (F12)
2. Go to **Console** tab
3. Paste and run:
   ```javascript
   // Show what Firebase sees as your domain
   console.log('Current origin:', window.location.origin);
   ```
4. You should see: `http://localhost:3001`

If you see something different (like `localhost:3000` or `127.0.0.1:3001`), that's the problem!

### Issue: Can't find the OAuth settings in Firebase

Try the **Google Cloud Console** approach (Option B above):

1. Go to: https://console.cloud.google.com
2. Select project **lifecv-d2724** (dropdown, top-left)
3. Search for "APIs" in search bar
4. Click **APIs & Services**
5. Click **Credentials** (left sidebar)
6. You should see OAuth 2.0 Client IDs listed
7. Click the one labeled "Web application"
8. Add `http://localhost:3001` to authorized URIs
9. Save and wait 30 seconds

---

## ✅ Working Signal

When you see **this** after clicking "Sign in with Google":
```
✓ Google popup opens
✓ Asks you to select account
✓ Redirects back to app
✓ You're logged in!
```

**Not this:**
```
✗ 403 (Forbidden) error
✗ "auth/requests-from-referer..." error
✗ Nothing happens when you click button
```

---

## 📋 Checklist

- [ ] Dev server running on localhost:3001 (verified with netstat)
- [ ] Opened Firebase Console
- [ ] Found Authentication settings
- [ ] Added http://localhost:3001 to authorized domains
- [ ] Cleared browser cache (DevTools → Application → Clear site data)
- [ ] Closed and reopened browser tab
- [ ] Tried signing in with Google
- [ ] ✅ Got past the OAuth popup!

---

## 🚀 If Everything Works

Delete this file and keep going with seed data creation! You've got this! 💪

```powershell
# Optional: Commit your work
git add .
git commit -m "OAuth: Fixed localhost:3001 OAuth configuration"
```

---

## 💬 Still Not Working?

Take a screenshot of:
1. The DevTools Console (F12 → Console)
2. The specific error message
3. Tell me what you see!

I'll help you debug! 🔍
