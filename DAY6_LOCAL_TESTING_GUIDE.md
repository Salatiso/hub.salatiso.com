# DAY 6 LOCAL TESTING GUIDE

## 🎯 Quick Start

```
Dev Server: http://localhost:5173/
Status: ✅ RUNNING
```

---

## 🧪 TEST SCENARIOS

### Scenario 1: Not Logged In (Guest)

**Steps:**
1. Open http://localhost:5173/
2. Observe top-right header

**Expected:**
- Blue "Login/Signup" button in header
- No user information displayed
- Can view public pages (Home, Contact, Onboarding, Terms)
- Try accessing /dashboard → redirects to /onboarding

**Test Commands:**
```
Navigate to: http://localhost:5173/dashboard
Expected: Redirects to http://localhost:5173/onboarding
```

---

### Scenario 2: Login Process

**Steps:**
1. Open http://localhost:5173/
2. Click "Get Started" button
3. Click "Sign in with Google" button
4. Complete Google authentication
5. Return to app

**Expected:**
- Header now shows "Signed in as [your.email@gmail.com]" button
- Button appears with light blue/primary color background
- User icon visible next to email
- Dropdown chevron (▼) indicator

---

### Scenario 3: User Dropdown Menu

**Steps:**
1. Must be logged in (from Scenario 2)
2. Click "Signed in as..." button in header
3. Observe dropdown menu

**Expected:**
```
┌─────────────────────────────────────┐
│  Signed in as                       │
│  user@example.com                   │
│  Name (if set)                      │
├─────────────────────────────────────┤
│  📊 Dashboard                       │
│  👤 Profile                         │
├─────────────────────────────────────┤
│  🚪 Sign Out                        │
└─────────────────────────────────────┘
```

**Test Each Option:**
- Click "Dashboard" → Navigate to /dashboard
- Click "Profile" → Navigate to /profile
- Click "Sign Out" → Logout & return to "Login/Signup" button

---

### Scenario 4: Dashboard Protection

**Steps (Logged In):**
1. Navigate to http://localhost:5173/dashboard
2. Observe dashboard loads

**Expected:**
- Dashboard page fully loads
- Sidebar with tools appears
- Main content area displays
- Can click on Personal/Professional tabs
- All tools are accessible

**Steps (Logged Out):**
1. Sign out from user menu
2. Try to access http://localhost:5173/dashboard
3. Observe redirect

**Expected:**
- Immediately redirects to http://localhost:5173/onboarding
- Cannot see dashboard content

**Test Protected Routes:**
```
Route                      | Expected When Logged Out
──────────────────────────────────────────────────────
/dashboard                 → /onboarding ✓
/profile                   → /onboarding ✓
/lifecv                    → /onboarding ✓
/contacts                  → /onboarding ✓
/calendar                  → /onboarding ✓
/assets                    → /onboarding ✓
/projects                  → /onboarding ✓
/career-paths              → /onboarding ✓
/family                    → /onboarding ✓
/family-timeline           → /onboarding ✓
```

---

### Scenario 5: Dashboard Layout (No Overlaps)

**Steps:**
1. Log in
2. Go to /dashboard
3. Find the sidebar with categories (Personal tab selected)
4. Click on "Trust Safety" category to expand
5. Scroll down to see next section "Transportation"

**Expected:**
- "Trust Safety" section expands showing items:
  - Instant Trust Verification
  - Universal Trust
  - Emergency Sync
  - Household Management
  - Community Governance
  - Incident Reporting
  
- Proper spacing between "Trust Safety" items
- "Transportation" section appears below with clear separation
- NO overlapping text

**Visual:**
```
BEFORE (BROKEN):           AFTER (FIXED):
┌──────────────────┐       ┌──────────────────┐
│ Trust Safety ▼   │       │ Trust Safety ▼   │
│ • Item 1         │       │ • Item 1         │
│ • Item 2         │       │ • Item 2         │
│ • Item 3         │       │ • Item 3         │
│ ───────────      │       │ • Item 4         │
│ Transportat▼ ◄── OVERLAP │ • Item 5         │
│ • Ride...        │       │ • Item 6         │
│ • Hitchhik │       │ ───────────────── ◄─ Clean Gap
│ • Delivery       │       │ Transportation ▼ │
└──────────────────┘       │ • Ride Sharing   │
                           │ • Hitchhiking    │
                           │ • Delivery       │
                           └──────────────────┘
```

**Test All Sections:**
- [ ] Trust Safety - Expand & collapse
- [ ] Transportation - Expand & collapse
- [ ] Home Services - Expand & collapse
- [ ] Community - Expand & collapse
- [ ] SafetyHelp - Expand & collapse

**Bonus: Professional Tab**
1. Click "Professional" tab
2. Expand "Business Tools" category
3. Expand "Legal & Financial" category
4. Verify no overlap

---

### Scenario 6: Responsive Design

**Mobile Testing:**
1. Open Dev Tools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12" preset
4. Navigate to /dashboard

**Expected:**
- Sidebar collapses to narrow view
- Show/hide sidebar toggle works
- Icons visible for categories
- Touch-friendly buttons
- No horizontal scrolling

**Test Screens:**
- [ ] iPhone 12 (390px)
- [ ] iPad (768px)
- [ ] Desktop (1920px)

---

### Scenario 7: Theme Toggle & Language

**Steps:**
1. Open http://localhost:5173/dashboard (logged in)
2. Find theme toggle (Moon/Sun icon) in header
3. Click to toggle dark/light mode
4. Verify colors change

**Expected:**
- Light mode: White background, dark text
- Dark mode: Dark background, light text
- Theme persists on page reload
- All colors readable in both modes

**Language Selector:**
1. Look for language dropdown (usually near theme toggle)
2. Select different language
3. Page text updates

**Test Languages:**
- [ ] English (default)
- [ ] Other available languages

---

## 🐛 Troubleshooting

### Issue: "Signed in as" button not showing
**Solution:**
- Hard refresh: Ctrl+Shift+R
- Check browser console for Firebase errors
- Ensure Google OAuth is configured in Firebase

### Issue: Dashboard redirects to onboarding even when logged in
**Solution:**
- Check if Firebase auth is properly initialized
- Look for errors in browser console
- Try signing out and signing back in

### Issue: Layout still has overlaps
**Solution:**
- Hard refresh the page
- Clear browser cache: Ctrl+Shift+Delete
- Rebuild if running from source: npm run dev

### Issue: Dropdown menu doesn't appear
**Solution:**
- Check that user is actually logged in
- Try clicking the user button again
- Check if any CSS is blocking the dropdown (z-index issue)

---

## ✅ SUCCESS CRITERIA

### All tests pass when:
- [ ] Logged-out users see "Login/Signup" button
- [ ] Logged-in users see "Signed in as [email]" button
- [ ] User dropdown opens and closes properly
- [ ] Dashboard link navigates correctly
- [ ] Profile link navigates correctly
- [ ] Sign Out logs user out
- [ ] Dashboard pages are inaccessible when logged out
- [ ] Dashboard redirects unauth users to onboarding
- [ ] No overlapping text in expanded sections
- [ ] Proper spacing between all categories
- [ ] Responsive design works on mobile
- [ ] Dark/light theme works
- [ ] Build passes with 0 errors

---

## 📊 Test Results Template

Copy and fill out:

```
TEST RESULTS - DAY 6 IMPROVEMENTS
═════════════════════════════════════════════════════════

Tested By: _________________________ Date: _____________

HEADER & AUTHENTICATION
[ ] Not logged in: Shows "Login/Signup" ........................ PASS / FAIL
[ ] Logged in: Shows "Signed in as [email]" ................... PASS / FAIL
[ ] User dropdown opens/closes ................................. PASS / FAIL
[ ] Dashboard link in dropdown works .......................... PASS / FAIL
[ ] Profile link in dropdown works ............................. PASS / FAIL
[ ] Sign Out button logs user out ............................. PASS / FAIL

DASHBOARD PROTECTION
[ ] /dashboard: Accessible when logged in ..................... PASS / FAIL
[ ] /dashboard: Redirects to /onboarding when logged out ...... PASS / FAIL
[ ] /profile: Protected correctly ............................... PASS / FAIL
[ ] /lifecv: Protected correctly ................................ PASS / FAIL
[ ] /contacts: Protected correctly ............................. PASS / FAIL

LAYOUT
[ ] Trust Safety expansion has no overlap ..................... PASS / FAIL
[ ] Transportation expansion has no overlap ................... PASS / FAIL
[ ] Home Services expansion has no overlap .................... PASS / FAIL
[ ] Community expansion has no overlap ......................... PASS / FAIL
[ ] SafetyHelp expansion has no overlap ....................... PASS / FAIL

GENERAL
[ ] Theme toggle works ......................................... PASS / FAIL
[ ] Responsive on mobile ....................................... PASS / FAIL
[ ] No console errors .......................................... PASS / FAIL
[ ] All functions work as expected ............................. PASS / FAIL

NOTES:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## 🚀 Ready to Deploy?

**Checklist:**
```
Before deploying to Firebase:
[ ] All local tests pass
[ ] No console errors
[ ] Build succeeds (npm run build)
[ ] Performance metrics acceptable
[ ] Mobile testing complete
[ ] User can login/logout/navigate
[ ] Protected routes work correctly
[ ] Layout has no overlaps
[ ] Theme switching works
[ ] No breaking changes
```

**Deploy Command:**
```bash
npm run build
firebase deploy --only hosting
```

---

**Questions? Issues? Results to share?**  
Test and let me know how it goes! 🎉

