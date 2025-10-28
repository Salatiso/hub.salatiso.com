# 🧪 Guest Account System - Testing Guide

**Dev Server:** http://localhost:5173

---

## 📋 Pre-Deployment Testing Checklist

### Phase 1: Guest Account Creation

**Test Steps:**
1. Navigate to http://localhost:5173 (Home page)
2. Look for "Try Free - No Signup" button or link to `/guest-login`
3. Click to go to guest login page
4. You should see two-step flow:
   - **Step 1:** Options screen with "Try as Guest" button
   - **Step 2:** Name and email form

**Expected Behavior:**
- ✅ Can enter name (required)
- ✅ Email is optional
- ✅ "Create Guest Account" button creates account
- ✅ Redirects to dashboard
- ✅ Loading state shows during creation

---

### Phase 2: Dashboard Guest Indicator

**Test Steps:**
1. After guest account creation, you're on `/dashboard`
2. Look at the dashboard header

**Expected Behavior:**
- ✅ Guest status badge visible in top right (compact version)
- ✅ Shows "👤 Guest 7d" with countdown
- ✅ Shows upgrade banner below page title
- ✅ Banner has "Upgrade Now" and "Maybe Later" buttons

---

### Phase 3: Guest Status Display

**Test Steps:**
1. On dashboard, click on guest status badge
2. A card/modal should appear with details

**Expected Behavior:**
- ✅ Shows guest account name
- ✅ Shows expiration status (e.g., "6 days 23 hours remaining")
- ✅ Progress bar showing time remaining (%)
- ✅ "Full Features Available" indicator
- ✅ "Renew" button (free)
- ✅ "Upgrade" button (to create full account)
- ✅ "Sign Out" button

---

### Phase 4: Guest Data Persistence

**Test Steps:**
1. Create guest account
2. Navigate to different pages (e.g., `/solo`, `/instant-trust`)
3. Close browser tab completely
4. Reopen http://localhost:5173
5. Check if guest account still exists

**Expected Behavior:**
- ✅ Guest account persists across browser sessions
- ✅ Status badge still visible
- ✅ Same user name displayed
- ✅ Same expiration time (plus elapsed time)

---

### Phase 5: Guest Account Renewal

**Test Steps:**
1. With active guest account, click "Renew" button
2. Check renewal confirmation

**Expected Behavior:**
- ✅ Expiration time extends by 7 days
- ✅ Renewal count increments
- ✅ No data is lost
- ✅ Can renew multiple times

---

### Phase 6: Guest Account Expiration

**Test Steps:**
1. Open browser dev console
2. Run this to simulate 8-day expiration:
```javascript
const account = JSON.parse(localStorage.getItem('lifesync_guest_account'));
account.expiresAt = Date.now() - 86400000; // Set to 1 day ago
localStorage.setItem('lifesync_guest_account', JSON.stringify(account));
location.reload();
```
3. Check dashboard for expiration state

**Expected Behavior:**
- ✅ Status badge turns red (expired state)
- ✅ Shows "Account Expired"
- ✅ Still shows option to renew
- ✅ Renew button still functional

---

### Phase 7: Translations

**Test Steps:**
1. Change language in app settings (if available) or add `?lang=es` to URL
2. Check guest account pages in different languages

**Expected Behavior:**
- ✅ Spanish: "Cuenta de Invitado" instead of "Guest Account"
- ✅ French: "Compte Invité"
- ✅ German: "Gastkonto"
- ✅ Portuguese: "Conta de Convidado"
- ✅ Afrikaans: "Gasrekening"
- ✅ Zulu: "I-Guest Account"
- ✅ All buttons/text translated

---

### Phase 8: Guest Features Access

**Test Steps:**
1. As guest user, try to access key features:
   - Dashboard (should work)
   - Home page (should work)
   - Solo Experience (should work)
   - FollowMeHome (should work)
   - Check-ins (should work)

**Expected Behavior:**
- ✅ All features marked with `allowGuest={true}` are accessible
- ✅ No forced prompts to upgrade
- ✅ Can use offline features without restriction

---

### Phase 9: Responsive Design

**Test Steps:**
1. Open http://localhost:5173 on:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x812)
2. Check guest status badge and forms on each

**Expected Behavior:**
- ✅ Badge scales appropriately on each screen size
- ✅ Form is mobile-friendly
- ✅ No overflow or text cutoff
- ✅ Touch targets are appropriate size

---

### Phase 10: Dark Mode

**Test Steps:**
1. Enable dark mode in app
2. Create guest account in dark mode
3. Navigate around app

**Expected Behavior:**
- ✅ All guest UI elements visible in dark mode
- ✅ Colors have proper contrast
- ✅ Status badge readable
- ✅ Forms are accessible

---

## 🚀 Browser Dev Console Tests

Paste these in browser console to test programmatically:

```javascript
// Check if guest account service works
import { guestAccountService } from './services/guestAccountService';

// Test 1: Create guest account
const account = guestAccountService.createGuestAccount('Test User', 'test@example.com');
console.log('Account created:', account);

// Test 2: Get guest status
const status = guestAccountService.getGuestAccountStatus();
console.log('Guest status:', status);

// Test 3: Check expiration
console.log('Days remaining:', status.daysRemaining);
console.log('Is expired:', status.isExpired);

// Test 4: Renew account
guestAccountService.renewGuestAccount();
console.log('Renewed! New expiry:', guestAccountService.getGuestAccount().expiresAt);

// Test 5: Save and retrieve guest data
guestAccountService.saveGuestData('testKey', { some: 'data' });
const saved = guestAccountService.getGuestData('testKey');
console.log('Saved data:', saved);

// Test 6: Export for migration
const migration = guestAccountService.getDataForMigration();
console.log('Migration data:', migration);

// Test 7: Clear guest account
guestAccountService.clearGuestAccount();
console.log('Guest account cleared');
```

---

## ✅ Deployment Readiness Checklist

- [ ] All features accessible in guest mode
- [ ] Status badge displays correctly
- [ ] Data persists across sessions
- [ ] Renewal works without data loss
- [ ] Expiration handling works
- [ ] Translations complete across all 16 languages
- [ ] Responsive design on all screen sizes
- [ ] Dark mode compatible
- [ ] No console errors
- [ ] Build succeeds without warnings
- [ ] ESLint passes
- [ ] Performance acceptable (page load < 3s)

---

## 🐛 Common Issues & Fixes

### Issue: Guest account not persisting
**Solution:** Check localStorage isn't full or disabled
```javascript
// In console:
localStorage.getItem('lifesync_guest_account')
// Should return JSON object, not null
```

### Issue: Status badge not showing
**Solution:** Verify `isGuest` state in Dashboard
```javascript
// In console:
import { guestAccountService } from './services/guestAccountService';
console.log('Is guest?', guestAccountService.isGuestUser());
```

### Issue: Can't renew account
**Solution:** Check if account is too old (>35 days)
```javascript
// In console:
const account = guestAccountService.getGuestAccount();
const ageMs = Date.now() - account.createdAt;
const ageDays = ageMs / (1000 * 60 * 60 * 24);
console.log('Account age:', ageDays, 'days');
```

---

## 📊 Performance Targets

- Page load: < 3 seconds
- Dashboard load: < 1.5 seconds
- Guest status check: < 100ms
- Data persistence: < 50ms

---

## 🎯 Next Steps After Testing

1. **Fix any issues** found during testing
2. **Get user feedback** on guest flow
3. **Monitor analytics** (if enabled)
4. **Deploy to Firebase** (next phase)
5. **Monitor production** for errors

---

**Created:** October 28, 2025
**Version:** 1.0
**Status:** Ready for testing
