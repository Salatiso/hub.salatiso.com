# LifeSync-React-App Alignment Project Plan
## Comprehensive Update to Align with Salatiso-React-App Standards

**Date:** October 26, 2025  
**Version:** 1.0  
**Status:** Planning Phase  
**Priority:** Critical - Accessibility & UX Alignment

---

## EXECUTIVE SUMMARY

This document outlines a comprehensive project plan to align LifeSync-React-App with Salatiso ecosystem standards, particularly focusing on:

1. **Keyboard Navigation** (Primary Focus) - Comprehensive accessibility implementation
2. **ARIA & Semantic HTML** - WCAG 2.1 AA compliance
3. **Dashboard UX Enhancements** - Advanced features from Salatiso-React-App
4. **Performance Optimization** - React best practices
5. **Contact & Calendar Management** - Bulk operations and advanced features

**Estimated Timeline:** 8-10 weeks  
**Complexity:** High  
**Impact:** Critical for accessibility compliance and ecosystem alignment

---

## AUDIT FINDINGS SUMMARY

### Current State Assessment

#### ✅ Strengths
- Strong technical foundation (React 18.2, Vite, Firebase 10.7.1)
- Comprehensive i18n support (17 languages)
- Robust offline capabilities (Dexie, mesh networking)
- Good ecosystem integration specs
- Advanced features: QR codes, geofencing, check-ins, family trees

#### ❌ Critical Gaps
- **Keyboard Navigation:** ~10% coverage (Required: 100%)
- **ARIA Labels:** ~15% coverage (Required: 90%+)
- **Focus Management:** Minimal (Required: Complete)
- **Semantic HTML:** Partial (Required: Complete)
- **Dashboard Features:** Missing bulk operations, shortcuts, advanced filters

#### ⚠️ Important Gaps
- Performance optimization (React.memo, useCallback, useMemo underutilized)
- Skip links and landmark regions
- Keyboard shortcuts guide
- Contact bulk operations
- Advanced calendar features

---

## DETAILED GAP ANALYSIS

### 1. KEYBOARD NAVIGATION GAPS

#### Dashboard Component (`src/components/Dashboard.jsx`)
| Element | Current State | Required State | Lines |
|---------|--------------|----------------|-------|
| Sidebar toggle | onClick only | + onKeyDown (Enter/Space) | 228-232 |
| Tab switcher | onClick only | + onKeyDown + aria-selected | 243-262 |
| Category toggle | onClick only | + onKeyDown + aria-expanded | 268-277 |
| Tool items | Links only | + onKeyDown for actions | 183-216 |
| Quick action cards | No keyboard | + keyboard handlers | 361-418 |

#### Floating Toolbar (`src/components/FloatingToolbar.jsx`)
| Element | Current State | Required State | Lines |
|---------|--------------|----------------|-------|
| Tool buttons | onClick only | + onKeyDown | ~40-50 |
| Modal dialogs | No focus trap | + focus management | ~100-150 |
| Close buttons | Basic | + Escape key handler | ~120-140 |
| ID Validator modal | No keyboard | + Enter for validate | ~60-95 |

#### Sidebar (`src/components/Sidebar.jsx`)
| Element | Current State | Required State | Lines |
|---------|--------------|----------------|-------|
| Navigation container | div | nav with role | 45-46 |
| Menu items | Links only | + aria-current | 58-67 |
| Toggle button | Basic | + aria-expanded | 30-37 |

### 2. ARIA & SEMANTIC HTML GAPS

**Missing Throughout:**
- `aria-label` on icon-only buttons (~50 instances)
- `aria-describedby` on form fields with helpers (~30 instances)
- `aria-live` regions for dynamic content (~10 locations)
- `aria-expanded` on collapsible sections (~25 instances)
- `aria-controls` linking buttons to panels (~20 instances)
- `role` attributes on custom interactive elements (~40 instances)
- Landmark regions (`<nav>`, `<main>`, `<aside>`) (~15 locations)

### 3. FOCUS MANAGEMENT GAPS

**Critical Issues:**
| Issue | Affected Components | Estimated Instances |
|-------|-------------------|---------------------|
| No focus trapping in modals | FloatingToolbar, ContactEditModal, etc. | ~10 modals |
| No focus restoration | All modals | ~10 modals |
| Missing visible focus indicators | Custom buttons, cards | ~100 elements |
| Improper tabIndex usage | Interactive non-button elements | ~50 elements |
| No skip-to-content links | All pages | 29 pages |

### 4. DASHBOARD UX FEATURE GAPS

| Feature | Salatiso Status | LifeSync Status | Priority |
|---------|----------------|-----------------|----------|
| Bulk contact operations | ✅ Implemented | ❌ Missing | HIGH |
| Contact merge/dedup | ✅ Implemented | ❌ Missing | HIGH |
| Advanced filtering | ✅ Implemented | ❌ Missing | HIGH |
| Keyboard shortcuts | ✅ Implemented | ❌ Missing | CRITICAL |
| Shortcuts guide modal | ✅ Implemented | ❌ Missing | HIGH |
| Quick actions palette (Cmd+K) | ✅ Implemented | ❌ Missing | MEDIUM |
| Customizable dashboard | ✅ Implemented | ❌ Missing | LOW |
| Dual calendar system | ✅ Implemented | ⚠️ Basic | MEDIUM |
| Contact groups | ✅ Implemented | ❌ Missing | MEDIUM |

---

## PHASE-BY-PHASE IMPLEMENTATION PLAN

### **PHASE 1: Critical Accessibility Foundation (Weeks 1-3)**

**Objective:** Achieve WCAG 2.1 AA compliance for core navigation and dashboard

#### Week 1: Core Dashboard Keyboard Navigation

**Tasks:**
1. ✅ Create accessibility utilities module (`src/utils/accessibility.js`)
   - Focus trap helper
   - Skip link component
   - Keyboard event handlers
   - ARIA helpers

2. 🔧 Update Dashboard component (`src/components/Dashboard.jsx`)
   - Add keyboard handlers to sidebar toggle
   - Add keyboard handlers to tab switcher
   - Add keyboard handlers to category toggles
   - Add keyboard handlers to tool items
   - Add aria-expanded, aria-controls, aria-label
   - Add role attributes and landmark regions
   - Add focus indicators (CSS)

3. 🔧 Update Sidebar component (`src/components/Sidebar.jsx`)
   - Convert div to semantic nav
   - Add aria-current to active items
   - Add keyboard navigation
   - Add role="navigation"

**Deliverables:**
- [ ] `src/utils/accessibility.js` - Utility functions
- [ ] `src/components/common/SkipLink.jsx` - Skip navigation component
- [ ] Updated Dashboard with full keyboard support
- [ ] Updated Sidebar with semantic HTML
- [ ] CSS focus indicators in `src/index.css`

**Testing:**
- [ ] Keyboard-only navigation test
- [ ] Screen reader test (NVDA/JAWS)
- [ ] Focus visibility test

---

#### Week 2: Floating Toolbar & Modal Accessibility

**Tasks:**
1. 🔧 Update FloatingToolbar (`src/components/FloatingToolbar.jsx`)
   - Add focus trapping to modal dialogs
   - Add Escape key handler for all modals
   - Add keyboard navigation for tools list
   - Add aria-live announcements
   - Add Enter key for ID validator
   - Improve focus restoration

2. 🔧 Create reusable Modal component (`src/components/common/AccessibleModal.jsx`)
   - Focus trap on open
   - Escape key to close
   - Focus restoration on close
   - Proper ARIA attributes
   - Keyboard-friendly close button

3. 🔧 Update existing modals to use AccessibleModal
   - ContactEditModal
   - GuestManagement modal sections
   - Event modals

**Deliverables:**
- [ ] Updated FloatingToolbar with full keyboard support
- [ ] `src/components/common/AccessibleModal.jsx`
- [ ] Refactored existing modals
- [ ] Unit tests for modal accessibility

**Testing:**
- [ ] Focus trap verification
- [ ] Escape key test
- [ ] Focus restoration test
- [ ] Screen reader modal announcements

---

#### Week 3: ARIA Labels & Semantic HTML Audit

**Tasks:**
1. 📋 Conduct full app audit for ARIA gaps
   - Create spreadsheet of all interactive elements
   - Document missing ARIA attributes
   - Prioritize by usage frequency

2. 🔧 Add ARIA labels to all icon-only buttons
   - Dashboard quick actions (~15 buttons)
   - Toolbar tools (~6 buttons)
   - Navigation icons (~20 buttons)
   - Form actions (~20 buttons)

3. 🔧 Add semantic HTML and landmark regions
   - Convert divs to nav/main/aside/article
   - Add section elements with headings
   - Ensure proper heading hierarchy (h1→h2→h3)
   - Add aria-describedby to form fields

4. 🔧 Implement skip links
   - "Skip to main content"
   - "Skip to navigation"
   - Add to all pages via layout component

**Deliverables:**
- [ ] ARIA audit spreadsheet
- [ ] All icon buttons with aria-label
- [ ] Semantic HTML throughout
- [ ] Skip links on all pages
- [ ] Updated `src/App.jsx` with landmark structure

**Testing:**
- [ ] Lighthouse accessibility score (target: 95+)
- [ ] axe DevTools scan (0 violations)
- [ ] Manual screen reader test

---

### **PHASE 2: Advanced Keyboard Features (Weeks 4-5)**

**Objective:** Implement keyboard shortcuts and advanced navigation patterns

#### Week 4: Global Keyboard Shortcuts System

**Tasks:**
1. ✅ Create keyboard shortcuts system
   - `src/hooks/useKeyboardShortcuts.js` - Custom hook
   - `src/contexts/KeyboardShortcutsContext.jsx` - Global context
   - Shortcut registration and conflict detection
   - Platform-aware (Ctrl vs Cmd)

2. 🔧 Implement global shortcuts
   - `Ctrl+K` / `Cmd+K`: Quick actions palette
   - `Ctrl+/` / `Cmd+/`: Show shortcuts guide
   - `Ctrl+B` / `Cmd+B`: Toggle sidebar
   - `Ctrl+Shift+D`: Go to dashboard
   - `Ctrl+Shift+F`: Focus search
   - `Esc`: Close modals/overlays
   - Arrow keys: Navigate lists

3. ✅ Create KeyboardShortcutsGuide modal
   - `src/components/KeyboardShortcutsGuide.jsx`
   - Searchable shortcuts list
   - Grouped by category
   - Print-friendly format

**Deliverables:**
- [ ] `src/hooks/useKeyboardShortcuts.js`
- [ ] `src/contexts/KeyboardShortcutsContext.jsx`
- [ ] `src/components/KeyboardShortcutsGuide.jsx`
- [ ] Integration in App.jsx
- [ ] Documentation in README

**Testing:**
- [ ] All shortcuts work as expected
- [ ] No conflicts between shortcuts
- [ ] Cross-platform testing (Windows/Mac)

---

#### Week 5: Quick Actions Palette (Command Palette)

**Tasks:**
1. ✅ Create QuickActionsPalette component
   - `src/components/QuickActionsPalette.jsx`
   - Fuzzy search for actions/pages
   - Keyboard navigation (up/down arrows)
   - Recent actions history
   - Action categories

2. 🔧 Integrate palette with routing
   - Navigate to any page
   - Execute common actions
   - Open modals
   - Access tools

3. 🔧 Add palette triggers
   - Keyboard shortcut (Ctrl+K)
   - Button in header (optional)
   - FloatingToolbar entry

**Deliverables:**
- [ ] `src/components/QuickActionsPalette.jsx`
- [ ] Fuzzy search implementation
- [ ] Integration with all major routes
- [ ] Customization via user preferences

**Testing:**
- [ ] Search accuracy test
- [ ] Keyboard navigation test
- [ ] Performance test (large action lists)

---

### **PHASE 3: Dashboard UX Enhancements (Weeks 6-7)**

**Objective:** Implement advanced dashboard features from Salatiso-React-App

#### Week 6: Contact Management Bulk Operations

**Tasks:**
1. 🔧 Update contacts data structure
   - Add selection state to contact items
   - Add bulk operation handlers to GuestContext
   - Implement optimistic updates

2. ✅ Create BulkOperationsToolbar component
   - `src/components/contacts/BulkOperationsToolbar.jsx`
   - Select all/none/inverse
   - Delete selected
   - Tag selected
   - Merge duplicates (UI only initially)
   - Export selected

3. 🔧 Update ContactList/ContactGrid views
   - Add checkbox selection
   - Keyboard selection (Space/Shift+arrows)
   - Visual feedback for selection state

4. ✅ Create ContactMergeWizard
   - `src/components/contacts/ContactMergeWizard.jsx`
   - Duplicate detection algorithm
   - Merge preview
   - Field mapping interface

**Deliverables:**
- [ ] `src/components/contacts/BulkOperationsToolbar.jsx`
- [ ] `src/components/contacts/ContactMergeWizard.jsx`
- [ ] Updated GuestContext with bulk operations
- [ ] Keyboard-accessible selection
- [ ] Unit tests for bulk operations

**Testing:**
- [ ] Bulk delete test
- [ ] Merge contacts test
- [ ] Performance test (1000+ contacts)

---

#### Week 7: Advanced Filtering & Search

**Tasks:**
1. ✅ Create AdvancedFilter component
   - `src/components/common/AdvancedFilter.jsx`
   - Multi-field filtering
   - Date range filters
   - Tag-based filtering
   - Saved filter presets

2. 🔧 Implement filter state management
   - `src/hooks/useAdvancedFilter.js`
   - Filter persistence to localStorage
   - Filter sharing via URL params

3. 🔧 Update Dashboard with filters
   - Apply to contacts list
   - Apply to events list
   - Apply to household members

4. ✅ Create SearchBar component with autocomplete
   - `src/components/common/SearchBar.jsx`
   - Debounced search
   - Keyword highlighting
   - Search history

**Deliverables:**
- [ ] `src/components/common/AdvancedFilter.jsx`
- [ ] `src/components/common/SearchBar.jsx`
- [ ] `src/hooks/useAdvancedFilter.js`
- [ ] Integration in Dashboard and lists
- [ ] Filter documentation

**Testing:**
- [ ] Filter accuracy test
- [ ] Performance test with large datasets
- [ ] URL state persistence test

---

### **PHASE 4: Performance & Polish (Week 8)**

**Objective:** Optimize performance and implement best practices

#### Week 8: React Performance Optimization

**Tasks:**
1. 🔧 Add React.memo to expensive components
   - Dashboard
   - ContactList items
   - EventCard
   - FamilyTreeNode

2. 🔧 Add useCallback optimizations
   - Event handlers in Dashboard
   - Filter handlers
   - Modal toggle functions
   - Navigation functions

3. 🔧 Add useMemo optimizations
   - Filtered/sorted lists
   - Derived state calculations
   - Complex transformations

4. 🔧 Implement virtualization for long lists
   - Install react-window
   - Virtualize contact lists (>100 items)
   - Virtualize event lists
   - Virtualize family tree nodes

5. 🔧 Code splitting optimization
   - Review and optimize lazy imports
   - Prefetch critical routes
   - Bundle size analysis

6. 🔧 Accessibility audit & fixes
   - Run Lighthouse audit
   - Run axe DevTools
   - Fix all violations
   - Document accessibility features

**Deliverables:**
- [ ] React.memo applied (~15 components)
- [ ] useCallback applied (~50 functions)
- [ ] useMemo applied (~30 computations)
- [ ] Virtualized lists
- [ ] Lighthouse score 95+
- [ ] axe DevTools 0 violations

**Testing:**
- [ ] Performance profiling
- [ ] Bundle size analysis
- [ ] Load time benchmarks
- [ ] Accessibility compliance verification

---

### **PHASE 5: Calendar & Additional Features (Weeks 9-10)**

**Objective:** Implement advanced calendar features and remaining gaps

#### Week 9: Calendar Enhancements

**Tasks:**
1. ✅ Create dual calendar system
   - `src/components/calendar/DualCalendar.jsx`
   - Gregorian calendar view
   - Alternative calendar view (configurable)
   - Sync between both views

2. 🔧 Implement recurring events
   - Recurrence rules (daily, weekly, monthly, yearly)
   - Edit single/all occurrences
   - Exception handling

3. 🔧 Add event import/export
   - iCal (.ics) import
   - Google Calendar sync
   - CSV export
   - Share events via link

4. ✅ Create CalendarViewOptions
   - Month/Week/Day views
   - Agenda view
   - Mini calendar widget

**Deliverables:**
- [ ] `src/components/calendar/DualCalendar.jsx`
- [ ] `src/components/calendar/RecurringEventEditor.jsx`
- [ ] `src/utils/calendarImportExport.js`
- [ ] `src/components/calendar/CalendarViewOptions.jsx`
- [ ] Integration with existing event system

**Testing:**
- [ ] Recurring events test
- [ ] Import/export test
- [ ] Multi-calendar sync test

---

#### Week 10: Final Integration & Testing

**Tasks:**
1. 🔧 Contact Groups implementation
   - `src/components/contacts/ContactGroups.jsx`
   - Create/edit/delete groups
   - Drag-and-drop to groups
   - Smart groups (dynamic filters)

2. 🔧 Dashboard customization
   - `src/components/dashboard/DashboardCustomizer.jsx`
   - Widget library
   - Drag-and-drop layout
   - Save/restore layouts
   - Preset layouts

3. 📋 Comprehensive testing
   - End-to-end keyboard navigation
   - Full screen reader testing
   - Cross-browser testing
   - Mobile accessibility testing
   - Performance benchmarking

4. 📋 Documentation updates
   - Update README with accessibility features
   - Create ACCESSIBILITY.md
   - Update CONTRIBUTING.md
   - Create keyboard shortcuts reference card

**Deliverables:**
- [ ] `src/components/contacts/ContactGroups.jsx`
- [ ] `src/components/dashboard/DashboardCustomizer.jsx`
- [ ] Complete test suite
- [ ] Updated documentation
- [ ] Release notes

**Testing:**
- [ ] Full regression test
- [ ] Accessibility compliance certification
- [ ] Performance validation
- [ ] User acceptance testing

---

## IMPLEMENTATION GUIDELINES

### Code Standards

**Keyboard Event Handlers:**
```jsx
// ✅ Good: Handle both click and keyboard
const handleAction = (e) => {
  if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    // Perform action
  }
};

<button
  onClick={handleAction}
  onKeyDown={handleAction}
  aria-label="Descriptive label"
  role="button"
  tabIndex={0}
>
  <Icon />
</button>
```

**Focus Management:**
```jsx
// ✅ Good: Trap focus in modal
import { useFocusTrap } from '../hooks/useFocusTrap';

const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  
  useFocusTrap(modalRef, isOpen);
  
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [isOpen]);
  
  const handleEscape = (e) => {
    if (e.key === 'Escape') onClose();
  };
  
  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleEscape}
      tabIndex={-1}
    >
      {children}
    </div>
  );
};
```

**ARIA Best Practices:**
```jsx
// ✅ Good: Comprehensive ARIA
<nav role="navigation" aria-label="Main navigation">
  <ul role="list">
    <li>
      <Link
        to="/dashboard"
        aria-current={location.pathname === '/dashboard' ? 'page' : undefined}
      >
        Dashboard
      </Link>
    </li>
  </ul>
</nav>

<button
  onClick={() => setExpanded(!expanded)}
  aria-expanded={expanded}
  aria-controls="panel-1"
  aria-label="Toggle section visibility"
>
  <ChevronIcon aria-hidden="true" />
</button>

<div
  id="panel-1"
  role="region"
  aria-labelledby="heading-1"
  hidden={!expanded}
>
  {/* Content */}
</div>
```

---

## TESTING STRATEGY

### Accessibility Testing Checklist

**Automated Testing:**
- [ ] Lighthouse accessibility audit (score 95+)
- [ ] axe DevTools scan (0 violations)
- [ ] WAVE browser extension
- [ ] pa11y-ci in CI/CD pipeline

**Manual Testing:**
- [ ] Keyboard-only navigation (unplug mouse)
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] High contrast mode
- [ ] Zoom to 200% (text remains readable)
- [ ] Color contrast validation (4.5:1 for text)

**User Testing:**
- [ ] Test with users who rely on keyboard
- [ ] Test with screen reader users
- [ ] Test with users with motor impairments
- [ ] Gather feedback on shortcuts usability

### Performance Testing Checklist

**Metrics:**
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Lighthouse Performance score 90+
- [ ] Bundle size < 500KB (main chunk)
- [ ] React DevTools Profiler (no unnecessary re-renders)

**Load Testing:**
- [ ] 1000+ contacts performance
- [ ] 500+ events performance
- [ ] Complex family tree (100+ nodes)
- [ ] Simultaneous operations (bulk actions)

---

## SUCCESS CRITERIA

### Phase 1 Success Metrics
- ✅ 100% keyboard navigation coverage for core dashboard
- ✅ Lighthouse accessibility score 90+
- ✅ axe DevTools 0 critical violations
- ✅ All modals have focus trapping
- ✅ All interactive elements have ARIA labels

### Phase 2 Success Metrics
- ✅ Keyboard shortcuts implemented (minimum 10)
- ✅ Quick actions palette functional
- ✅ Shortcuts guide modal complete
- ✅ 95% keyboard navigation coverage app-wide

### Phase 3 Success Metrics
- ✅ Bulk operations for contacts (delete, tag, merge)
- ✅ Advanced filtering on 3+ entity types
- ✅ Contact merge wizard functional
- ✅ Search autocomplete implemented

### Phase 4 Success Metrics
- ✅ React.memo applied to 15+ components
- ✅ useCallback/useMemo optimizations in place
- ✅ Virtualization for lists >100 items
- ✅ Lighthouse Performance score 90+
- ✅ Bundle size reduction by 20%

### Phase 5 Success Metrics
- ✅ Dual calendar system implemented
- ✅ Recurring events functional
- ✅ Contact groups implemented
- ✅ Dashboard customization functional
- ✅ Full documentation updated

---

## RISK MITIGATION

### High-Risk Areas

**1. Breaking Changes During Refactoring**
- **Risk:** Accessibility changes break existing functionality
- **Mitigation:** Comprehensive test suite before starting, frequent testing
- **Contingency:** Feature flags for gradual rollout

**2. Performance Degradation**
- **Risk:** Adding accessibility features slows down app
- **Mitigation:** Performance profiling after each phase
- **Contingency:** Lazy loading, code splitting, virtualization

**3. Scope Creep**
- **Risk:** Adding too many features beyond alignment
- **Mitigation:** Strict adherence to project plan, weekly reviews
- **Contingency:** Defer non-critical features to Phase 6 (future)

**4. Browser Compatibility**
- **Risk:** Advanced features don't work on all browsers
- **Mitigation:** Test on Chrome, Firefox, Safari, Edge
- **Contingency:** Progressive enhancement, polyfills

---

## RESOURCE REQUIREMENTS

### Development Resources
- **Primary Developer:** Full-time for 10 weeks
- **UX/Accessibility Consultant:** 2-4 hours/week (optional but recommended)
- **QA Tester:** Part-time weeks 8-10

### Tools & Services
- axe DevTools Pro (optional, ~$50/month)
- Screen reader software (NVDA free, JAWS trial)
- BrowserStack for cross-browser testing (optional)

### Training
- Team training on ARIA and keyboard navigation (4 hours)
- Documentation review sessions (2 hours/week)

---

## MAINTENANCE & ONGOING SUPPORT

### Post-Launch Activities
1. **Monitoring:**
   - Track accessibility metrics monthly
   - Monitor user feedback on keyboard navigation
   - Performance regression testing

2. **Updates:**
   - Review and update ARIA labels quarterly
   - Update keyboard shortcuts as features added
   - Accessibility audit semi-annually

3. **Community:**
   - Publish accessibility guide
   - Share keyboard shortcuts with users
   - Gather feedback from accessibility community

---

## APPENDIX A: File Structure Changes

### New Files to Create

**Utilities & Hooks:**
```
src/
  hooks/
    useKeyboardShortcuts.js          ← Global shortcuts hook
    useFocusTrap.js                  ← Modal focus trapping
    useAdvancedFilter.js             ← Filter state management
  utils/
    accessibility.js                 ← ARIA helpers, focus utils
    calendarImportExport.js          ← Calendar i/o
  contexts/
    KeyboardShortcutsContext.jsx     ← Shortcuts state
```

**Components:**
```
src/
  components/
    common/
      SkipLink.jsx                   ← Skip navigation
      AccessibleModal.jsx            ← Reusable modal
      AdvancedFilter.jsx             ← Filter UI
      SearchBar.jsx                  ← Search with autocomplete
    keyboard/
      KeyboardShortcutsGuide.jsx     ← Shortcuts modal
      QuickActionsPalette.jsx        ← Cmd+K palette
    contacts/
      BulkOperationsToolbar.jsx      ← Bulk actions UI
      ContactMergeWizard.jsx         ← Merge duplicates
      ContactGroups.jsx              ← Contact grouping
    calendar/
      DualCalendar.jsx               ← Dual calendar view
      RecurringEventEditor.jsx       ← Recurring events
      CalendarViewOptions.jsx        ← View switcher
    dashboard/
      DashboardCustomizer.jsx        ← Layout customization
```

**Documentation:**
```
ACCESSIBILITY.md                     ← Accessibility features guide
KEYBOARD_SHORTCUTS.md                ← Quick reference
```

### Files to Modify

**High Priority:**
- `src/components/Dashboard.jsx` (460 lines → ~600 lines)
- `src/components/FloatingToolbar.jsx` (305 lines → ~400 lines)
- `src/components/Sidebar.jsx` (70 lines → ~120 lines)
- `src/App.jsx` (334 lines → ~380 lines)
- `src/index.css` (add focus styles)

**Medium Priority:**
- `src/contexts/GuestContext.jsx` (add bulk operations)
- `src/pages/ContactImportWizard.jsx` (integrate new features)
- `src/pages/FamilyTree.jsx` (keyboard navigation)
- `src/pages/CommunityHub.jsx` (ARIA improvements)

**Low Priority:**
- All page components (add skip links, ARIA)
- All form components (aria-describedby)
- All modal components (refactor to AccessibleModal)

---

## APPENDIX B: Keyboard Shortcuts Reference

### Proposed Global Shortcuts

| Shortcut | Action | Scope |
|----------|--------|-------|
| `Ctrl/Cmd + K` | Open quick actions palette | Global |
| `Ctrl/Cmd + /` | Show keyboard shortcuts guide | Global |
| `Ctrl/Cmd + B` | Toggle sidebar | Dashboard |
| `Ctrl/Cmd + Shift + D` | Go to dashboard | Global |
| `Ctrl/Cmd + Shift + F` | Focus search | Global |
| `Esc` | Close modal/palette | Global |
| `?` | Show help | Global |
| `G then H` | Go to home | Global |
| `G then D` | Go to dashboard | Global |
| `G then C` | Go to contacts | Global |
| `Arrow Up/Down` | Navigate lists | Lists |
| `Space` | Select item | Lists |
| `Enter` | Open/activate item | Lists |
| `Shift + Arrow Up/Down` | Multi-select | Lists |
| `Ctrl/Cmd + A` | Select all | Lists |
| `Ctrl/Cmd + D` | Deselect all | Lists |
| `Delete` | Delete selected | Lists |

### Dashboard-Specific Shortcuts

| Shortcut | Action |
|----------|--------|
| `1-9` | Switch to category N |
| `Tab` | Navigate tools |
| `Shift + Tab` | Navigate tools (reverse) |
| `Ctrl/Cmd + N` | New item (context-dependent) |
| `Ctrl/Cmd + E` | Edit item |
| `Ctrl/Cmd + S` | Save changes |

---

## APPENDIX C: ARIA Patterns Reference

### Common ARIA Patterns to Implement

**1. Accordion (Collapsible Sections):**
```jsx
<button
  aria-expanded={isExpanded}
  aria-controls="panel-id"
  onClick={toggle}
>
  Heading
</button>
<div id="panel-id" role="region" aria-labelledby="heading-id" hidden={!isExpanded}>
  Content
</div>
```

**2. Modal Dialog:**
```jsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Title</h2>
  <p id="dialog-description">Description</p>
</div>
```

**3. Tabs:**
```jsx
<div role="tablist" aria-label="Category tabs">
  <button
    role="tab"
    aria-selected={isActive}
    aria-controls="panel-id"
    id="tab-id"
  >
    Tab Label
  </button>
</div>
<div role="tabpanel" aria-labelledby="tab-id" id="panel-id">
  Panel content
</div>
```

**4. Navigation:**
```jsx
<nav role="navigation" aria-label="Main">
  <ul role="list">
    <li>
      <a href="#" aria-current="page">Current Page</a>
    </li>
  </ul>
</nav>
```

**5. Live Regions:**
```jsx
<div role="status" aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

<div role="alert" aria-live="assertive" aria-atomic="true">
  {errorMessage}
</div>
```

---

## CONCLUSION

This comprehensive project plan provides a clear roadmap to align LifeSync-React-App with Salatiso ecosystem standards, with a strong focus on keyboard navigation and accessibility. The phased approach ensures:

1. **Critical accessibility issues addressed first** (Phases 1-2)
2. **UX enhancements aligned with Salatiso** (Phase 3)
3. **Performance optimization** (Phase 4)
4. **Advanced features** (Phase 5)

**Estimated Effort:** 400-500 hours (10 weeks full-time)  
**Priority Order:** Phase 1 > Phase 2 > Phase 4 > Phase 3 > Phase 5  
**Success Probability:** High (given clear requirements and existing strong foundation)

**Next Steps:**
1. Review and approve this plan
2. Set up project tracking (GitHub Projects/Jira)
3. Begin Phase 1, Week 1 implementation
4. Schedule weekly progress reviews
5. Establish QA testing cadence

---

**Document Prepared By:** GitHub Copilot  
**Date:** October 26, 2025  
**Version:** 1.0  
**Status:** Ready for Review and Approval
