# Phase 0 Week 2: Manual Testing Guide (Days 8-9)

**Date:** October 26-27, 2025  
**Status:** ACTIVE TESTING  
**Target:** 100% navigation coverage, accessibility compliance  

---

## 🎯 Testing Objectives

1. **Navigation Accuracy** - Verify all 50+ menu items route correctly
2. **Keyboard Navigation** - Test Tab, Enter, Space, Escape, Arrow keys
3. **Mobile Responsiveness** - Test on various device sizes
4. **Accessibility** - WCAG 2.1 AA compliance verification
5. **External Links** - Verify all ecosystem integrations
6. **State Persistence** - Test localStorage for expanded sections
7. **Focus Management** - Verify focus indicators and trapping

---

## 📋 Test Categories

### Category 1: Navigation Items (50+ items across 5 contexts)

#### 1.1 Dashboard (1 item)
- [ ] Dashboard link routes to `/`
- [ ] Always visible (no expand/collapse)
- [ ] Shows active indicator when on dashboard

#### 1.2 Personal Context (7 items)
- [ ] Section expands/collapses on click
- [ ] My Profile → `/profile`
- [ ] LifeCV → `/lifecv` 
- [ ] Contacts → `/contacts`
- [ ] Calendar → `/calendar?context=personal`
- [ ] Assets → `/assets?context=personal`
- [ ] Projects → `/projects?context=personal`
- [ ] Career → `/career`
- [ ] All links route to correct pages
- [ ] Section state persists after reload

#### 1.3 Family Context (8 items)
- [ ] Section expands/collapses
- [ ] Family Dashboard → `/family`
- [ ] Family Tree → `/family/tree`
- [ ] Timeline → `/family/timeline`
- [ ] Household → `/household`
- [ ] Calendar → `/calendar?context=family`
- [ ] Assets → `/assets?context=family`
- [ ] Projects → `/projects?context=family`
- [ ] Hub → `/hub` (external: ecosystems)
- [ ] All 8 items tested

#### 1.4 Professional Context (7 items)
- [ ] Section expands/collapses
- [ ] Professional Dashboard → `/professional`
- [ ] Operations → `/ops`
- [ ] Organogram → `/organogram`
- [ ] Planning → `/planning`
- [ ] Calendar → `/calendar?context=professional`
- [ ] Assets → `/assets?context=professional`
- [ ] Projects → `/projects?context=professional`
- [ ] All 7 items tested

#### 1.5 Communities Context (7 items)
- [ ] Section expands/collapses
- [ ] Networks → `/networks`
- [ ] Sonny → external link to Sonny
- [ ] Calendar → `/calendar?context=communities`
- [ ] Check-ins → `/checkins`
- [ ] Transport → `/transport`
- [ ] Ekhaya → external link to Ekhaya
- [ ] LifeSync Academy → `/academy`
- [ ] All 7 items tested

#### 1.6 Common Tools (6 items)
- [ ] Section expands/collapses
- [ ] Assets → `/assets`
- [ ] Reporting → `/reporting`
- [ ] Analytics → `/analytics`
- [ ] Toolkit → `/toolkit`
- [ ] Academy → `/academy`
- [ ] Sync → `/sync`
- [ ] All 6 items tested

#### 1.7 Bottom Items (5 items - fixed)
- [ ] Innovation → `/innovation` (badge: NEW)
- [ ] Beta Features → `/beta` (badge: BETA)
- [ ] Settings → `/settings`
- [ ] Help/Support → external link
- [ ] Logout → clears localStorage, logs out user
- [ ] All 5 items tested

---

### Category 2: Keyboard Navigation

#### 2.1 Tab Navigation
- [ ] Tab cycles through all interactive elements
- [ ] Shift+Tab goes backwards
- [ ] Focus visible on all buttons
- [ ] Focus indicator is clear (2px blue outline)
- [ ] No focus trap (can escape with Tab)
- [ ] Tab order is logical (left-to-right, top-to-bottom)

#### 2.2 Enter Key
- [ ] Enter opens collapsed sections
- [ ] Enter follows external links
- [ ] Enter triggers logout confirmation
- [ ] Enter activates navigation items

#### 2.3 Space Key
- [ ] Space expands/collapses sections
- [ ] Space activates buttons
- [ ] Space toggles mobile menu

#### 2.4 Escape Key
- [ ] Escape closes expanded sections (optional)
- [ ] Escape closes mobile menu on small screens
- [ ] Escape closes dropdown menus (if any)

#### 2.5 Arrow Keys
- [ ] Down Arrow expands sections
- [ ] Up Arrow collapses sections
- [ ] Right Arrow expands sections (ARIA-EXPANDED)
- [ ] Left Arrow collapses sections (ARIA-EXPANDED)

#### 2.6 Keyboard Focus Management
- [ ] Focus starts on first nav item
- [ ] Focus moves smoothly between items
- [ ] No hidden focus (all focused elements visible)
- [ ] Can reach all interactive elements via keyboard

---

### Category 3: Mobile Responsiveness

#### 3.1 Hamburger Menu (< 768px)
- [ ] Menu toggle button visible
- [ ] Click toggles drawer open/closed
- [ ] Drawer has backdrop overlay
- [ ] Close button visible in drawer
- [ ] Click outside drawer closes it
- [ ] Escape key closes drawer

#### 3.2 Tablet Layout (768px - 1024px)
- [ ] Sidebar collapses to icon mode
- [ ] Icons have tooltips on hover
- [ ] Still full width on landscape
- [ ] Touch targets are 44px minimum

#### 3.3 Desktop Layout (> 1024px)
- [ ] Full sidebar visible (288px fixed)
- [ ] Main content has ml-72 margin
- [ ] Scrollbar visible for long menus
- [ ] Smooth collapse animation

#### 3.4 Responsive Testing Checklist
- [ ] Test at 320px (mobile)
- [ ] Test at 768px (tablet)
- [ ] Test at 1024px (desktop)
- [ ] Test at 1920px (large desktop)
- [ ] Test landscape vs portrait on mobile
- [ ] Test zoom levels (100%, 150%, 200%)

---

### Category 4: Accessibility (WCAG 2.1 AA)

#### 4.1 ARIA Labels
- [ ] All interactive elements have aria-label or aria-labelledby
- [ ] Section headers have role="button" or semantic tags
- [ ] aria-expanded="true/false" on collapsible sections
- [ ] aria-current="page" on active item
- [ ] External links have aria-label indicating external

#### 4.2 Screen Reader Testing
- [ ] Sidebar announces as navigation landmark
- [ ] Section headers announce collapsible state
- [ ] Menu items announce full path
- [ ] Active page announces as current
- [ ] Badges announce their type/status

#### 4.3 Color Contrast
- [ ] All text has 4.5:1 contrast (WCAG AA)
- [ ] Active state clear without color only
- [ ] Badges are distinguishable

#### 4.4 Focus Indicators
- [ ] All interactive elements have visible focus
- [ ] Focus indicator is ≥ 3px
- [ ] Focus has ≥ 3:1 contrast with background

#### 4.5 Skip Links
- [ ] Skip to main content link works
- [ ] Skip to navigation link works
- [ ] Links are keyboard accessible
- [ ] Links don't appear visually

---

### Category 5: External Links & Integrations

#### 5.1 Ecosystem Links
- [ ] Sonny link opens in new tab
  - Verify: Opens external URL correctly
- [ ] Ekhaya link opens in new tab
  - Verify: Opens external URL correctly
- [ ] Hub link opens in new tab
  - Verify: Opens external URL correctly
- [ ] External links have icon indicator

#### 5.2 External Link Verification
- [ ] External links open in new window (_blank)
- [ ] rel="noopener noreferrer" present
- [ ] User can distinguish external links
- [ ] Title attribute explains external

---

### Category 6: State Persistence

#### 6.1 localStorage Tests
- [ ] Expanded sections persist across reload
- [ ] Mobile drawer state doesn't persist (optional)
- [ ] Active item resets on page navigation
- [ ] Can manually collapse sections
- [ ] Clear localStorage clears all state

#### 6.2 Navigation State
- [ ] Active item updates on navigation
- [ ] Correct context path applied
- [ ] URL parameters preserved
- [ ] Back/Forward buttons work

---

### Category 7: Visual & UX

#### 7.1 Styling & Layout
- [ ] Sidebar background color correct (custom or theme)
- [ ] Text colors readable
- [ ] Hover states work on all items
- [ ] Active states clearly visible
- [ ] Smooth animations (expand/collapse)
- [ ] No layout shifts on menu toggle

#### 7.2 Badges
- [ ] Core badge (blue) visible
- [ ] Mesh badge (green) visible
- [ ] MNI badge (orange) visible
- [ ] External badge (purple) visible
- [ ] New badge (red) visible
- [ ] Badges positioned consistently

#### 7.3 Icons
- [ ] All section icons display correctly
- [ ] Chevron rotates on expand/collapse
- [ ] External link icon visible on external items
- [ ] Icons are 20px × 20px (readable)

---

## 🧪 Test Execution Plan

### Day 8 (October 26, 2025)
**Morning Session - Navigation Items & Keyboard (Sections 1-2)**
- Time: 2-3 hours
- Focus: Test all 50+ navigation items (Category 1)
- Focus: Complete keyboard navigation tests (Category 2)
- Log: Create detailed test log

**Afternoon Session - Mobile & Accessibility (Sections 3-4)**
- Time: 2-3 hours
- Focus: Responsive design testing (Category 3)
- Focus: WCAG compliance verification (Category 4)
- Log: Document any issues found

### Day 9 (October 27, 2025)
**Morning Session - External & State (Sections 5-6)**
- Time: 1-2 hours
- Focus: External links & integrations (Category 5)
- Focus: localStorage persistence (Category 6)

**Afternoon Session - Visual & Issue Resolution**
- Time: 2-3 hours
- Focus: Visual/UX testing (Category 7)
- Focus: Fix any issues found from previous days
- Focus: Re-test fixed items
- Log: Create final testing report

---

## 📊 Test Results Template

```markdown
### Test Result: [Test Name]
- **Status:** ✅ PASS / ⚠️ FAIL / ⏭️ SKIP
- **Device:** [Desktop/Tablet/Mobile] [Screen size: 1920/768/320]
- **Browser:** [Chrome/Firefox/Safari/Edge]
- **Notes:** [Any observations]
- **Date:** [YYYY-MM-DD]
```

---

## 🐛 Issue Tracking

### Issue Template
```markdown
**Issue #[N]: [Title]**
- **Category:** [Navigation/Keyboard/Mobile/Accessibility/External/State/Visual]
- **Severity:** [Critical/High/Medium/Low]
- **Device:** [Desktop/Tablet/Mobile]
- **Steps to Reproduce:** [Clear steps]
- **Expected:** [What should happen]
- **Actual:** [What actually happens]
- **Fix Status:** [Not Started/In Progress/Fixed/Verified]
```

---

## ✅ Sign-Off Checklist

When all tests complete, verify:

- [ ] All 50+ navigation items tested (Category 1)
- [ ] All keyboard shortcuts tested (Category 2)
- [ ] Mobile responsive at all breakpoints (Category 3)
- [ ] WCAG 2.1 AA compliance verified (Category 4)
- [ ] All external links working (Category 5)
- [ ] State persistence confirmed (Category 6)
- [ ] Visual/UX polish complete (Category 7)
- [ ] All critical issues fixed
- [ ] All high priority issues fixed
- [ ] Test results documented
- [ ] No regressions from Phase 0 Week 1
- [ ] Ready for Lighthouse audit (Day 10)

---

## 📝 Notes

- **Browser Support:** Test on Chrome (primary), Firefox, Safari, Edge
- **Device Testing:** Desktop, Tablet (iPad), Mobile (iPhone 12/14)
- **Automation:** Consider Cypress/Playwright for future regression testing
- **Documentation:** Each test result should be logged for audit trail

---

**Next:** After testing complete → Lighthouse Audit (Day 10)

