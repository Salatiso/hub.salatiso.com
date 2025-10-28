# Phase 2: Testing Guide

## 🧪 Quick Testing Steps

### Step 1: Verify Build ✅
```bash
npm run build
# Expected: ✅ 0 errors
```

### Step 2: Verify Linting ✅
```bash
npm run lint
# Expected: ✅ 0 errors
```

### Step 3: Start Dev Server ✅
```bash
npm run dev
# Expected: Server running on http://localhost:5173
```

### Step 4: Test Each New Page

Navigate to each page and verify:

#### Profile Page (`/profile`)
- [ ] Page loads without errors
- [ ] Can edit profile fields (name, email, bio)
- [ ] Avatar upload works
- [ ] Logout button is visible
- [ ] Changes persist after reload
- [ ] Tab through form fields (keyboard accessible)

#### LifeCV Page (`/lifecv`)
- [ ] Page loads with tabs
- [ ] All 5 tabs clickable (Overview, Education, Experience, Skills, Certifications)
- [ ] Can add education entry
- [ ] Can delete education entry
- [ ] Can add certification
- [ ] Can delete certification
- [ ] Export as JSON button works
- [ ] Statistics display correctly
- [ ] Keyboard navigation works through all tabs

#### Contacts Page (`/contacts`)
- [ ] Page loads with contacts list
- [ ] Can add new contact
- [ ] Can search contacts (live filter)
- [ ] Can filter by category
- [ ] Can edit contact
- [ ] Can delete contact (with confirmation)
- [ ] Email and phone validation works
- [ ] Statistics updated correctly
- [ ] Tab through form fields

#### Calendar Page (`/calendar`)
- [ ] Calendar displays current month
- [ ] Can create new event
- [ ] Event appears on calendar
- [ ] Upcoming events list shows (7 days)
- [ ] Can delete event
- [ ] Date and time validation works
- [ ] Events persist after reload
- [ ] Responsive on mobile

#### Assets Page (`/assets`)
- [ ] Asset list displays
- [ ] Can add asset with type selection
- [ ] Asset value displays and totals calculated
- [ ] Can edit asset
- [ ] Can delete asset
- [ ] Statistics display correct counts
- [ ] Asset types filter works
- [ ] Currency formatting correct

#### Projects Page (`/projects`)
- [ ] Project list displays
- [ ] Can create new project
- [ ] Can select project status (5 options)
- [ ] Progress bar updates (0-100%)
- [ ] Can add team members
- [ ] Statistics show project counts
- [ ] Can delete project
- [ ] Priority levels work

#### Career Paths Page (`/career-paths`)
- [ ] Career list displays chronologically
- [ ] Can add new career entry
- [ ] Can add skills per position
- [ ] Salary tracking works
- [ ] Average salary calculated correctly
- [ ] Can edit entry
- [ ] Can delete entry
- [ ] Statistics display correctly

#### Family Page (`/family`)
- [ ] Family members display
- [ ] Can add family member
- [ ] Relationship types available
- [ ] Can edit member
- [ ] Can delete member
- [ ] Family statistics display
- [ ] Links to Family Tree work
- [ ] Emergency contact option works

#### Family Timeline Page (`/family-timeline`)
- [ ] Timeline displays events
- [ ] Can add new event
- [ ] Event types available (5 options)
- [ ] Events appear on timeline
- [ ] Can delete event
- [ ] Timeline visual displays correctly
- [ ] Statistics show event counts
- [ ] Chronological order maintained

### Step 5: Test Navigation

#### Sidebar Navigation
- [ ] All 8 new menu items visible in sidebar
- [ ] Each menu item navigates to correct page
- [ ] Active menu item highlighted
- [ ] Sidebar collapse/expand works
- [ ] Mobile menu works (if applicable)

#### Direct URL Navigation
- [ ] Type `/profile` in URL bar → Profile page loads
- [ ] Type `/lifecv` in URL bar → LifeCV page loads
- [ ] Type `/contacts` in URL bar → Contacts page loads
- [ ] Type `/calendar` in URL bar → Calendar page loads
- [ ] Type `/assets` in URL bar → Assets page loads
- [ ] Type `/projects` in URL bar → Projects page loads
- [ ] Type `/career-paths` in URL bar → Career Paths page loads
- [ ] Type `/family` in URL bar → Family page loads
- [ ] Type `/family-timeline` in URL bar → Family Timeline page loads
- [ ] Type `/invalid-route` in URL bar → 404 page displays

#### Keyboard Navigation
- [ ] Tab key moves through form fields
- [ ] Shift+Tab moves back through fields
- [ ] Arrow keys work in dropdowns
- [ ] Enter key submits forms
- [ ] Escape key closes dialogs
- [ ] Focus visible on all interactive elements

### Step 6: Test Data Persistence

For each page:
- [ ] Enter data and save
- [ ] Reload the page (F5 or Cmd+R)
- [ ] Data is still there
- [ ] No console errors

### Step 7: Test Authentication

- [ ] Sign out from Profile page
- [ ] Redirect to login page
- [ ] Cannot access protected pages while logged out
- [ ] Sign back in
- [ ] Can access all pages again

### Step 8: Check Console

- [ ] No red error messages
- [ ] No yellow warning messages (except possible library warnings)
- [ ] Network tab shows successful requests
- [ ] No failed API calls

### Step 9: Test on Mobile

- [ ] Sidebar collapses on small screens
- [ ] Forms are mobile-readable
- [ ] Buttons large enough to tap
- [ ] All pages responsive
- [ ] No horizontal scroll

### Step 10: Browser Compatibility

Test on:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Edge

---

## 📋 Issues Checklist

### If You Find Issues

**Issue: Page doesn't load**
- Check console for errors
- Check if route is correct in URL
- Verify you're logged in
- Try hard refresh (Ctrl+Shift+R)

**Issue: Data doesn't persist**
- Check browser storage is not disabled
- Try clearing localStorage and reload
- Check GuestContext in DevTools

**Issue: Keyboard navigation doesn't work**
- Tab should move through elements
- Shift+Tab should move backward
- Check focus styles are visible

**Issue: 404 on one page but others work**
- Check file exists in `src/pages/`
- Check import in `App.jsx`
- Check route path is correct
- Check page component exports default

**Issue: Sidebar menu item doesn't work**
- Check menu item path matches route
- Check icon is imported
- Check route exists in App.jsx

---

## ✅ Sign-Off Checklist

Before declaring Phase 2 complete:

- [ ] All 9 pages load without errors
- [ ] All 9 pages accessible from sidebar
- [ ] All 9 pages accessible from URL
- [ ] Forms work and save data
- [ ] Keyboard navigation functional
- [ ] Authentication gates working
- [ ] No console errors or warnings
- [ ] 0 build errors
- [ ] 0 ESLint errors
- [ ] 0 TypeScript errors
- [ ] Mobile responsive
- [ ] Browser compatibility verified
- [ ] Data persists after reload
- [ ] 404 page works

---

## 🎯 Success Criteria

**Phase 2 is complete when:**
- ✅ All 9 missing pages created and integrated
- ✅ All 9 routes working without 404 errors
- ✅ All 8 sidebar menu items functional
- ✅ Build passes with 0 errors
- ✅ ESLint passes with 0 errors
- ✅ No console errors during normal usage
- ✅ Authentication gates enforced
- ✅ Keyboard accessibility maintained
- ✅ Data persistence working
- ✅ Ready for user acceptance testing

---

## 📞 Troubleshooting

### Development Environment

```bash
# Clear node modules and reinstall
rm -r node_modules
npm install

# Clear cache and rebuild
npm run build

# Full clean rebuild
npm cache clean --force
rm -r node_modules dist
npm install
npm run build

# Check version
npm -v
node -v
```

### Port Issues

```bash
# If port 5173 is in use, kill the process:
# Windows (PowerShell)
Get-Process | Where-Object {$_.MainWindowTitle -like '*VITE*'} | Stop-Process -Force

# Mac/Linux
lsof -i :5173
kill -9 <PID>
```

### Build Issues

```bash
# Run with verbose output
npm run build -- --debug

# Check TypeScript errors
npx tsc --noEmit

# Run ESLint with detailed report
npm run lint -- --debug
```

---

## 🎉 When Tests Pass

Once all tests pass and checks are complete:

1. **Document Results** - Create a testing report
2. **Commit Code** - Git commit with "Phase 2 complete" message
3. **Tag Release** - Create git tag `phase-2-complete`
4. **Announce** - Let team know Phase 2 is ready
5. **Schedule UAT** - Begin user acceptance testing
6. **Plan Phase 3** - Start planning next phase

---

**Good luck with testing! 🚀**

If you find any issues, they're likely quick fixes. Let me know what you discover!
