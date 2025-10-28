# 🧪 Phase 1 Testing - Instructions for Both Tester & User

**Date:** October 26, 2025  
**Dev Server:** ✅ Running on http://localhost:5174/ and http://192.168.86.250:5174/  
**Status:** Ready for Testing

---

## 🎯 Testing Objectives

### Agent (Me) - Automated Testing
- ✅ Verify keyboard events fire correctly
- ✅ Verify focus management works
- ✅ Verify state changes on keyboard input
- ✅ Verify ARIA attributes present
- ✅ Verify no console errors

### User (You) - Manual Testing  
- ✅ Test keyboard navigation from user perspective
- ✅ Verify focus indicators visible
- ✅ Verify modals focus trap works
- ✅ Verify announcements clear (if using screen reader)
- ✅ Verify no lag or unresponsiveness

---

## 🚀 Getting Started

### For Agent (Automated)

I will:
1. Simulate keyboard events on components
2. Check state changes and event handlers
3. Verify DOM element focus states
4. Check console for errors
5. Validate ARIA attributes
6. Test focus trap mechanisms

### For User (Manual)

You will:
1. Open http://localhost:5174/ in browser
2. Use keyboard only (no mouse)
3. Test each component's shortcuts
4. Report any issues found
5. Share observations

---

## 🎮 Testing Workflows

### Test 1: FloatingToolbar Keyboard Navigation

**User Steps:**
```
1. Open browser to http://localhost:5174/
2. Press Tab until you reach FloatingToolbar expand button
3. Press Enter or Space to expand
4. You should see toolbar with 6 tools
5. Press Arrow Down - should move to next tool
6. Press Arrow Down 6 times - should loop back to first
7. Press Home - should go to first tool
8. Press End - should go to last tool
9. Press Escape - should minimize toolbar
```

**Agent Will Verify:**
- ✅ Arrow key events captured
- ✅ activeToolIndex state updates
- ✅ Focus ref properly set
- ✅ Event.preventDefault() called
- ✅ No console errors

**Success Criteria:**
- Tool selection announces: "Selected [Tool Name]"
- Focus ring visible on selected tool
- No lag on key press

---

### Test 2: Modal Focus Trap (ID Validator)

**User Steps:**
```
1. In FloatingToolbar, use Arrow Down to focus "ID Validator" tool
2. Press Enter to open modal
3. Tab through modal elements:
   - First Tab: Input field
   - Second Tab: Validate button
   - Third Tab: Close button
   - Fourth Tab: Back to Input (trap confirmed!)
4. Press Escape - modal should close
5. Focus should return to FloatingToolbar
```

**Agent Will Verify:**
- ✅ Modal opens on Enter
- ✅ useFocusManagement hook active
- ✅ Tab cycles within modal
- ✅ Escape closes modal
- ✅ Focus restored to previous element

**Success Criteria:**
- Tab never leaves modal until Escape
- Initial focus in input field
- Escape closes and restores focus

---

### Test 3: Dashboard Tab Navigation

**User Steps:**
```
1. Navigate to Dashboard page
2. Should see "Personal" and "Professional" tabs
3. Press Alt+Tab - should switch tabs
4. Observe "Professional" tab becomes active
5. Press Alt+Tab again - back to "Personal"
6. Notice the first tool changes based on tab
```

**Agent Will Verify:**
- ✅ Alt+Tab event captured
- ✅ activeTab state toggles
- ✅ focusedItemIndex resets
- ✅ New tab tools loaded

**Success Criteria:**
- Tab switches on Alt+Tab
- First tool of new tab announced
- Tools list updates correctly

---

### Test 4: Dashboard Tool Navigation

**User Steps:**
```
1. In Dashboard, Tab to first tool
2. Press Arrow Down repeatedly
3. Tools should navigate sequentially
4. Notice tools in collapsed categories are skipped
5. Press Home - goes to first tool
6. Press End - goes to last tool
7. Press Enter on a tool - navigates to that page
```

**Agent Will Verify:**
- ✅ Arrow key handlers registered
- ✅ focusedItemIndex updates
- ✅ itemRefs properly assigned
- ✅ Focus moves to correct elements
- ✅ Collapsed items skipped

**Success Criteria:**
- Smooth navigation through tools
- Proper focus ring visible
- Announcements: "Item N of X"

---

### Test 5: Category Expansion

**User Steps:**
```
1. In Dashboard, Tab to category header (e.g., "Trust Safety")
2. Press Enter - category expands
3. Tools appear below category
4. Press Enter again - category collapses
5. Tools hide
6. Tab to another category and press Space - should also toggle
```

**Agent Will Verify:**
- ✅ Click handler fires on Enter/Space
- ✅ categoryCollapsed state toggles
- ✅ aria-expanded attribute updates
- ✅ UI updates correctly

**Success Criteria:**
- Enter/Space expand/collapse
- aria-expanded reflects state
- Smooth animation (if any)

---

### Test 6: GuestManagement Buttons

**User Steps:**
```
1. Find GuestManagement component (bottom of FloatingToolbar)
2. Tab through all buttons
3. Each button should have visible focus ring
4. Press Enter on "Download Profile" - download starts
5. Press Enter on "Create Snapshot" - snapshot created
6. Tab to file input label and press Enter - file picker opens
```

**Agent Will Verify:**
- ✅ All buttons focusable (tabIndex 0/-1)
- ✅ Focus rings visible on keyboard focus
- ✅ Click handlers fire on Enter/Space
- ✅ aria-labels present

**Success Criteria:**
- All buttons keyboard accessible
- Focus ring visible always
- Actions execute on Enter/Space

---

## 📋 Detailed Checklist

### Component: FloatingToolbar
- [ ] **Expand/Minimize**
  - [ ] Tab reaches expand button
  - [ ] Enter/Space expands toolbar
  - [ ] Escape minimizes toolbar
  
- [ ] **Tool Navigation**
  - [ ] Arrow Down moves to next tool
  - [ ] Arrow Up moves to previous tool
  - [ ] Home goes to first tool
  - [ ] End goes to last tool
  - [ ] Navigation loops at boundaries
  
- [ ] **Tool Activation**
  - [ ] Enter activates focused tool
  - [ ] Space activates focused tool
  - [ ] Tool action executes
  - [ ] Focus ring visible on active tool
  
- [ ] **Modal: ID Validator**
  - [ ] Opens on tool activation
  - [ ] Focus moves to input field
  - [ ] Tab cycles within modal
  - [ ] Escape closes modal
  - [ ] Focus returns to toolbar
  
- [ ] **Modal: Guest Management**
  - [ ] Opens on tool activation
  - [ ] Tab cycles within modal
  - [ ] All buttons accessible
  - [ ] Escape closes modal
  - [ ] Focus returns to toolbar
  
- [ ] **ARIA & Accessibility**
  - [ ] Tools have aria-label
  - [ ] Modals have aria-modal
  - [ ] Focus rings visible
  - [ ] Announcements clear (if SR)

### Component: Dashboard
- [ ] **Tab Navigation**
  - [ ] Alt+Tab switches tabs
  - [ ] Tabs marked with aria-selected
  - [ ] First tool of new tab announced
  
- [ ] **Tool Navigation**
  - [ ] Arrow Down/Up work
  - [ ] Home/End work
  - [ ] Announcements: "Item N of X"
  - [ ] Focus ring visible
  
- [ ] **Category Expansion**
  - [ ] Enter toggles expansion
  - [ ] Space toggles expansion
  - [ ] aria-expanded updates
  - [ ] Tools appear/disappear
  
- [ ] **Tool Activation**
  - [ ] Enter navigates to tool
  - [ ] Page transitions smoothly
  - [ ] No focus lost

### Component: GuestManagement
- [ ] **Button Accessibility**
  - [ ] All buttons focusable
  - [ ] Focus rings visible
  - [ ] Enter activates buttons
  - [ ] Space activates buttons
  
- [ ] **File Inputs**
  - [ ] File labels focusable
  - [ ] Enter opens file picker
  - [ ] Focus ring visible on label
  
- [ ] **ARIA Labels**
  - [ ] All buttons labeled
  - [ ] Labels descriptive
  - [ ] File inputs labeled

### Global
- [ ] **No Keyboard Traps** (except modals)
- [ ] **Tab Order Logical**
- [ ] **Focus Always Visible**
- [ ] **No Console Errors**
- [ ] **No Lag on Key Press**
- [ ] **Smooth Navigation**

---

## 🐛 Issue Reporting Template

If you find an issue, please report:

```
## Issue: [Brief Title]

**Component:** [FloatingToolbar/Dashboard/GuestManagement]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Browser:** [Chrome/Firefox/Edge/Safari]

**Keyboard Key(s) Involved:** [Arrow Down, Enter, Alt+Tab, etc.]

**Severity:** [Critical/High/Medium/Low]

**Screenshot/Console Error:** [If applicable]

**Additional Notes:**
[Any other relevant information]
```

---

## ✅ Pass Criteria

### For Agent
- ✅ All event handlers fire
- ✅ State updates correctly
- ✅ Focus refs set properly
- ✅ No console errors
- ✅ ARIA attributes present

### For User
- ✅ Keyboard navigation smooth
- ✅ Focus indicators visible
- ✅ Modal traps work
- ✅ Announcements clear
- ✅ No lag or freezing

### Overall
- ✅ All checkboxes marked
- ✅ No critical issues
- ✅ Ready to deploy

---

## 📊 Testing Progress

| Component | Agent | User | Status |
|-----------|-------|------|--------|
| FloatingToolbar | 🔄 Testing | ⏳ Ready | In Progress |
| Dashboard | 🔄 Testing | ⏳ Ready | In Progress |
| GuestManagement | 🔄 Testing | ⏳ Ready | In Progress |
| Global | 🔄 Testing | ⏳ Ready | In Progress |

---

## 🎯 Timeline

**Agent Testing:** Now → 1 hour  
**User Testing:** After Agent starts → 1-2 hours  
**Results Analysis:** After both complete → 30 mins  
**Issue Fixes (if any):** 1-4 hours  
**Final Deployment:** After fixes → Immediate

---

## 📱 Test Environments

### Agent (Automated)
- Environment: Node.js with React Testing Library
- Focus: Event handlers, state, DOM attributes
- Tools: Console inspection, DOM queries

### User (Manual)
- Browser: Any (Chrome, Firefox, Edge, Safari)
- Focus: User experience, keyboard response
- Tools: Keyboard only, browser dev tools

---

## 🔗 Resources

- **Keyboard Shortcuts Reference:** PHASE1_KEYBOARD_SHORTCUTS.md
- **Component Details:** PHASE1_COMPLETION_SUMMARY.md
- **Test Cases:** src/__tests__/keyboard.test.js
- **Dev Server:** http://localhost:5174/

---

## 💬 Communication

**Agent Status Updates:** I'll log findings here and in console  
**User Feedback:** Please share observations and issues  
**Results Comparison:** We'll compare findings and document

---

## 🚀 Ready to Begin!

**Dev Server:** ✅ Running  
**Test Scripts:** ✅ Ready  
**Documentation:** ✅ Complete  
**Checklist:** ✅ Prepared  

### Next Steps:
1. **Agent:** Start keyboard event simulations
2. **User:** Open browser and start manual testing
3. **Both:** Document findings
4. **Together:** Review results

Let's go! 🎉
