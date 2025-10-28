/**
 * LifeSync Phase 1 - Screen Reader Testing Guide
 * Keyboard Accessibility & ARIA Implementation Verification
 * 
 * This guide provides step-by-step instructions for verifying keyboard
 * and screen reader accessibility across all Phase 1 components.
 */

# Screen Reader Testing Protocol

## Browser Setup

### Windows
- **NVDA (Recommended - Free & Open Source)**
  - Download: https://www.nvaccess.org/
  - Enable: Alt+N from app
  - Command focus: Numpad 7 (or Insert+N)
  
- **JAWS (Commercial)**
  - Trial: 40-minute sessions
  - Enable: Alt+Windows key
  
- **Built-in**: Windows Narrator
  - Enable: Windows key + Enter
  - Limited but functional for testing

### macOS
- **VoiceOver (Built-in)**
  - Enable: Cmd+F5
  - Web rotor: VO+U
  - Used for Mac testing

### Browser Integration
- Chrome: Built-in accessibility
- Firefox: Built-in accessibility  
- Edge: Built-in accessibility
- Safari: VoiceOver integration

---

## Phase 1 Components to Test

### 1. FloatingToolbar Component

#### 1.1 Keyboard Navigation Tests

**Test: Expand minimized toolbar**
```
Setup: Reload page (toolbar starts minimized)
Steps:
1. Press Tab until focus on expand button
2. Press Enter or Space
3. Listen for announcement
Expected: "Toolbar expanded, use arrow keys to navigate tools" announces
Result: ✓ Pass / ✗ Fail
```

**Test: Navigate tools with Arrow Down**
```
Setup: Toolbar expanded with 6 tools
Steps:
1. Press Tab to focus toolbar area
2. Press Arrow Down
3. Continue pressing Arrow Down to cycle through tools
4. Listen to announcements for each tool
Expected: 
- Focus moves through tools
- Each movement announced: "Selected [Tool Name]"
- Last tool loops to first
Result: ✓ Pass / ✗ Fail
```

**Test: Navigate tools with Arrow Up**
```
Setup: Toolbar with focus on second tool
Steps:
1. Press Arrow Up
2. Listen for announcement
Expected:
- Focus moves to first tool
- Announcement: "Selected [Previous Tool Name]"
Result: ✓ Pass / ✗ Fail
```

**Test: Home key moves to first tool**
```
Setup: Toolbar with focus on any tool except first
Steps:
1. Press Home
2. Listen for announcement
Expected:
- Focus moves to first tool
- Announcement made about first tool
Result: ✓ Pass / ✗ Fail
```

**Test: End key moves to last tool**
```
Setup: Toolbar with focus on any tool
Steps:
1. Press End
2. Listen for announcement
Expected:
- Focus moves to last tool (ID Validator)
- Announcement made about last tool
Result: ✓ Pass / ✗ Fail
```

**Test: Enter activates tool**
```
Setup: Toolbar with focus on ID Validator tool
Steps:
1. Press Enter
2. Listen for announcement
Expected:
- Tool is activated
- Announcement: "Activated [Tool Name]"
- Modal appears (for ID Validator)
Result: ✓ Pass / ✗ Fail
```

**Test: Space activates tool**
```
Setup: Toolbar with focus on any tool
Steps:
1. Press Space
2. Listen for announcement
Expected:
- Same as Enter key
- Announcement: "Activated [Tool Name]"
Result: ✓ Pass / ✗ Fail
```

**Test: Escape minimizes toolbar**
```
Setup: Toolbar expanded
Steps:
1. Focus any tool
2. Press Escape
3. Listen for announcement
Expected:
- Toolbar minimizes
- Announcement: "Toolbar minimized"
Result: ✓ Pass / ✗ Fail
```

**Test: Focus indicators visible**
```
Setup: Toolbar expanded
Steps:
1. Tab to focused tool
2. Check for visual focus ring
Expected:
- Focused tool shows blue ring around it
- Ring has good contrast
Result: ✓ Pass / ✗ Fail
```

#### 1.2 Modal Focus Trap Tests

**Test: ID Validator focus trap**
```
Setup: Toolbar open with ID Validator modal
Steps:
1. Open ID Validator modal (Enter on tool)
2. Press Tab repeatedly
3. Note where focus goes
Expected:
- Focus cycles within modal only
- Never leaves modal (except Escape)
- First Tab goes to ID input field
- Focus order: Input → Validate button → Close button → back to Input
Result: ✓ Pass / ✗ Fail
```

**Test: ID Validator initial focus**
```
Setup: ID Validator modal opens
Steps:
1. Open modal and listen immediately
Expected:
- Focus automatically goes to ID input field
- No announcement of modal title needed (initial focus sufficient)
Result: ✓ Pass / ✗ Fail
```

**Test: Escape closes ID Validator**
```
Setup: ID Validator modal open with input focused
Steps:
1. Type something in input
2. Press Escape
3. Listen for announcement
Expected:
- Modal closes
- Announcement: "ID Validator modal closed"
- Focus returns to toolbar
Result: ✓ Pass / ✗ Fail
```

**Test: Guest Management focus trap**
```
Setup: Toolbar open with Guest Management modal
Steps:
1. Open Guest Management modal
2. Press Tab repeatedly through all fields
3. Tab at end of modal
Expected:
- Focus stays within modal
- All buttons/fields are reachable
- Pressing Escape closes it
Result: ✓ Pass / ✗ Fail
```

#### 1.3 ARIA Labels Tests

**Test: Tool labels announced**
```
Setup: Toolbar expanded
Steps:
1. Focus on each tool
2. Listen to screen reader
Expected:
- Hears: "[Tool Name]. [Description]. [Opens in new window if external]"
- Example: "Instant Trust. Quick trust verification."
Result: ✓ Pass / ✗ Fail
```

**Test: Expand button label**
```
Setup: Minimized toolbar
Steps:
1. Focus expand button
2. Listen to screen reader
Expected:
- Hears: "Expand floating toolbar. Press Enter to expand..."
- Clear instructions about what will happen
Result: ✓ Pass / ✗ Fail
```

**Test: External link distinction**
```
Setup: Toolbar with external tools visible
Steps:
1. Focus Instant Trust tool (external link)
2. Listen to label
Expected:
- Label includes "Opens in new window"
- User knows before activating
Result: ✓ Pass / ✗ Fail
```

**Test: Modal titles accessible**
```
Setup: Modal open
Steps:
1. Listen to what's announced when modal opens
Expected:
- Modal title announced clearly
- "ID Validator Modal" or "Guest Management Modal"
- aria-modal="true" understood by reader
Result: ✓ Pass / ✗ Fail
```

---

### 2. Dashboard Component

#### 2.1 Tab Navigation Tests

**Test: Tab announcement**
```
Setup: Dashboard with tabs visible
Steps:
1. Tab to Personal tab
2. Listen for announcement
Expected:
- Hears: "Personal tab, selected" or similar
- aria-selected="true" recognized
Result: ✓ Pass / ✗ Fail
```

**Test: Tab switching announcement**
```
Setup: Dashboard on Personal tab
Steps:
1. Tab to Professional tab
2. Press Enter or arrow key
3. Listen for announcement
Expected:
- Announcement: "Professional tab selected"
- Focus moves to first tool in Professional tab
Result: ✓ Pass / ✗ Fail
```

**Test: Alt+Tab switches tabs**
```
Setup: Dashboard with focus somewhere
Steps:
1. Press Alt+Tab (with Alt held down)
2. Listen for announcement
Expected:
- Active tab switches
- Announcement made about new tab
- Alt+Tab recognized by handler
Result: ✓ Pass / ✗ Fail
```

#### 2.2 Tool Navigation Tests

**Test: Tool list structure**
```
Setup: Dashboard with tools visible
Steps:
1. Tab to first tool
2. Listen to announcement
Expected:
- Announcement: "Navigation list" or similar
- Role="list" recognized
- Tool announced as list item
Result: ✓ Pass / ✗ Fail
```

**Test: Tool arrow navigation**
```
Setup: Dashboard with tool focused
Steps:
1. Focus a tool
2. Press Arrow Down
3. Continue through multiple tools
Expected:
- Each tool announces when focused
- Arrow keys navigate through list
- Announces: "Item 1 of 20", "Item 2 of 20", etc.
Result: ✓ Pass / ✗ Fail
```

**Test: Home/End navigation**
```
Setup: Dashboard tools visible
Steps:
1. Focus any tool (e.g., item 5)
2. Press Home
3. Listen for announcement
Expected:
- Focus moves to item 1
- Announcement made about first tool
- End key moves to last item
Result: ✓ Pass / ✗ Fail
```

**Test: Tool activation**
```
Setup: Dashboard with tool focused
Steps:
1. Focus a tool like "Instant Trust"
2. Press Enter
3. Listen and observe
Expected:
- Navigation occurs
- Tool page loads
- No errors in keyboard handling
Result: ✓ Pass / ✗ Fail
```

#### 2.3 Category Tests

**Test: Category header structure**
```
Setup: Dashboard with categories
Steps:
1. Tab to category header (e.g., "Trust Safety")
2. Listen to announcement
Expected:
- Announcement: "Category Name button, collapsed/expanded, press Enter to toggle"
- aria-expanded attribute recognized
Result: ✓ Pass / ✗ Fail
```

**Test: Category expansion**
```
Setup: Dashboard with collapsed category
Steps:
1. Focus category header
2. Press Enter
3. Listen for announcement and observe expansion
Expected:
- Category expands
- Items become visible
- Announcement: "Trust Safety expanded"
- aria-expanded changes to true
Result: ✓ Pass / ✗ Fail
```

**Test: Hidden items not in focus order**
```
Setup: Dashboard with collapsed categories
Steps:
1. Press Tab repeatedly through entire dashboard
2. Count how many items heard
Expected:
- Only visible items announced
- Hidden items in collapsed categories skipped
- Focus doesn't jump to hidden items
Result: ✓ Pass / ✗ Fail
```

#### 2.4 Focus Indicators

**Test: Visual focus ring on tools**
```
Setup: Dashboard tools visible
Steps:
1. Tab to a tool
2. Observe the visual indicator
Expected:
- Blue ring visible around focused tool
- Ring has good contrast (meets WCAG AA)
- Ring appears only on keyboard focus (not mouse hover)
Result: ✓ Pass / ✗ Fail
```

**Test: Focus ring on category buttons**
```
Setup: Dashboard with categories
Steps:
1. Tab to category header
2. Observe visual indicator
Expected:
- Focus ring visible on category button
- Ring distinguishable from hover state
Result: ✓ Pass / ✗ Fail
```

---

### 3. GuestManagement Component

#### 3.1 Button Accessibility Tests

**Test: Download button keyboard access**
```
Setup: GuestManagement visible with active session
Steps:
1. Tab to Download Profile button
2. Press Enter
Expected:
- Button focused with visible ring
- Click activates without mouse
- Download triggers
Result: ✓ Pass / ✗ Fail
```

**Test: File input keyboard access**
```
Setup: GuestManagement visible
Steps:
1. Tab to "Upload Profile" label button
2. Press Enter or Space
3. Observe file picker
Expected:
- File input label acts as button
- Keyboard accessible
- File picker opens on key press
Result: ✓ Pass / ✗ Fail
```

**Test: Restore button keyboard access**
```
Setup: GuestManagement with restore points
Steps:
1. Tab to Restore button
2. Press Enter
Expected:
- Restore activates
- Snapshot restoration occurs
- No need for mouse
Result: ✓ Pass / ✗ Fail
```

#### 3.2 Session State Tests

**Test: Active session announcement**
```
Setup: GuestManagement with active session
Steps:
1. Tab to GuestManagement area
2. Listen for initial announcement
Expected:
- Announces: "Guest Session Active"
- Days remaining announced
- Clear session status understood
Result: ✓ Pass / ✗ Fail
```

**Test: Expired session announcement**
```
Setup: GuestManagement with expired session
Steps:
1. Tab to GuestManagement
2. Listen to announcement
Expected:
- Announces: "Guest Session Expired"
- Renewal button status understood
- Clear what user needs to do
Result: ✓ Pass / ✗ Fail
```

---

## Common Screen Reader Commands

### NVDA (Windows)
- **Insert+Q**: Quit NVDA
- **Insert+Home**: Home (go to first item)
- **Insert+End**: End (go to last item)
- **Insert+F7**: Elements list
- **Insert+F5**: Refresh
- **Up/Down Arrow**: Read previous/next line
- **Ctrl+Home**: Jump to top of page
- **Tab**: Navigate to next interactive element
- **Shift+Tab**: Previous element

### JAWS (Windows)
- **Alt+Windows**: Start JAWS
- **Alt+Windows**: Stop JAWS
- **Alt+Windows+N**: Numpad settings
- **Up/Down Arrow**: Read line
- **Tab**: Next form field
- **V**: Virtual cursor toggle

### Built-in Readers
- **Chrome**: Ctrl+Alt+Z (on some configs)
- **Firefox**: Available through preferences
- **Edge**: Uses Windows Narrator or integrated reader

---

## Testing Checklist

### Keyboard Navigation
- [ ] All tools navigable with arrow keys
- [ ] Home/End work for first/last
- [ ] Tab order logical
- [ ] No keyboard traps (except modals)
- [ ] Escape closes modals
- [ ] Focus always visible
- [ ] No lag when pressing keys

### ARIA & Labels  
- [ ] All buttons have aria-label or text
- [ ] Tools have descriptive labels
- [ ] Modal titles announced
- [ ] Tabs have aria-selected
- [ ] Categories have aria-expanded
- [ ] External links noted in label

### Screen Reader
- [ ] Announcements clear and accurate
- [ ] No duplicate announcements
- [ ] Tool activation announced
- [ ] Tab switches announced
- [ ] Modal open/close announced
- [ ] Focus restoration works

### Focus Management
- [ ] Initial focus correct
- [ ] Focus restoration after modal
- [ ] Focus trap in modals works
- [ ] Focus visible with keyboard only

### Accessibility Standards
- [ ] WCAG 2.1 AA keyboard requirements met
- [ ] Tab order follows visual flow
- [ ] Focus indicators have sufficient contrast
- [ ] No time-dependent keyboard operations

---

## Test Results Summary

### Date: _______________

### Tester: _______________

### Environment: 
- Browser: _______________
- Screen Reader: _______________
- OS: _______________

### Results

| Component | Status | Notes |
|-----------|--------|-------|
| FloatingToolbar Navigation | ✓/✗ | |
| FloatingToolbar Modals | ✓/✗ | |
| FloatingToolbar ARIA | ✓/✗ | |
| Dashboard Tabs | ✓/✗ | |
| Dashboard Tools | ✓/✗ | |
| Dashboard Categories | ✓/✗ | |
| GuestManagement | ✓/✗ | |
| Screen Reader | ✓/✗ | |
| Focus Management | ✓/✗ | |

### Issues Found

1. **Issue:** _______________
   - **Severity:** Critical / High / Medium / Low
   - **Component:** _______________
   - **Steps to Reproduce:** _______________
   - **Expected:** _______________
   - **Actual:** _______________
   - **Fix:** _______________

---

## Sign-Off

- [ ] All keyboard navigation working
- [ ] All ARIA labels present and accurate
- [ ] Screen reader verified working
- [ ] Focus management robust
- [ ] No accessibility violations
- [ ] Ready for next phase

**Tester Signature:** _________________________ **Date:** _____________

---

## Additional Resources

- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- NVDA Documentation: https://www.nvaccess.org/
- axe DevTools: https://www.deque.com/axe/devtools/
- Lighthouse Accessibility: https://developers.google.com/web/tools/lighthouse/
