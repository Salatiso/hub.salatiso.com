# LifeSync-React-App Alignment Project Plan (Updated)
## Comprehensive Update to Align with Salatiso-React-App Standards + Enhanced Sidebar Navigation

**Date:** October 26, 2025  
**Version:** 2.0 (UPDATED)  
**Status:** Planning Phase - Ready for Implementation  
**Priority:** Critical - Accessibility, Keyboard Navigation, Sidebar Reorganization, & Feature Parity

---

## EXECUTIVE SUMMARY

This updated document outlines a comprehensive project plan to align LifeSync-React-App with Salatiso ecosystem standards, with expanded scope including:

1. **Enhanced Sidebar Navigation** (NEW PRIMARY FOCUS) - Reorganize per natural user journey
2. **Keyboard Navigation** - Comprehensive accessibility implementation
3. **ARIA & Semantic HTML** - WCAG 2.1 AA compliance
4. **Feature Parity with Salatiso-React-App** - Contacts, Calendar, Assets, Projects, Analytics
5. **Performance Optimization** - React best practices
6. **Context-Aware Features** - Individual, Family, Professional, Communities contexts

**Estimated Timeline:** 12-14 weeks (increased from 8-10 weeks)  
**Complexity:** Very High (scope expansion)  
**Impact:** Critical for accessibility, usability, and ecosystem alignment

---

## CRITICAL ECOSYSTEM PRINCIPLE

> **All novel features are built and tested in Salatiso-React-App first, then rolled to LifeSync as the reference implementation. LifeSync must have 100% feature parity with Salatiso-React-App applicable features.**

This means LifeSync must receive:
- ✅ All Salatiso contact management features
- ✅ All Salatiso calendar features (dual calendar, recurring events, etc.)
- ✅ All Salatiso asset management features
- ✅ All Salatiso project management features
- ✅ All Salatiso analytics & reporting features
- ✅ All Salatiso sidebar organization & navigation patterns
- ✅ All Salatiso accessibility improvements
- ✅ All Salatiso keyboard shortcuts
- ✅ All Salatiso performance optimizations

---

## AUDIT FINDINGS SUMMARY

### Current State Assessment

#### ✅ Strengths
- Strong technical foundation (React 18.2, Vite, Firebase 10.7.1)
- Comprehensive i18n support (17 languages)
- Robust offline capabilities (Dexie, mesh networking)
- Good ecosystem integration specs
- Advanced features: QR codes, geofencing, check-ins, family trees
- GuestContext for offline-first architecture

#### ❌ Critical Gaps (Phase 0 - NOW)
- **Sidebar Navigation:** Flat, not organized by user journey
- **Keyboard Navigation:** ~10% coverage (Required: 100%)
- **ARIA Labels:** ~15% coverage (Required: 90%+)
- **Focus Management:** Minimal (Required: Complete)
- **Semantic HTML:** Partial (Required: Complete)

#### ❌ Feature Gaps (From Salatiso-React-App)
- **Contacts:** Basic contacts exist, missing bulk operations, merge, deduplication
- **Calendar:** Basic calendar exists, missing dual calendar, recurring events, advanced features
- **Assets:** Missing entirely, required for all contexts
- **Projects:** Missing entirely, required for all contexts
- **Analytics:** Missing dashboard analytics and reporting
- **Business Operations:** Missing organogram and business planning UI
- **Family Timeline:** Missing timeline view for family events
- **Career Pathways:** Missing career development tracking
- **Reporting System:** Missing cross-context reporting

#### ⚠️ Important Gaps
- Performance optimization (React.memo, useCallback, useMemo underutilized)
- Skip links and landmark regions
- Keyboard shortcuts guide
- Contact bulk operations
- Advanced calendar features
- Context-aware filtering

---

## DETAILED GAP ANALYSIS (UPDATED)

### 1. SIDEBAR NAVIGATION GAPS (NEW - HIGHEST PRIORITY)

#### Current Structure (LifeSync)
```
❌ Flat navigation:
- Dashboard
- Instant Trust
- Universal Trust
- Emergency Sync
- Household Management
- Incident Reporting
- Ride Sharing
- ... 25+ more flat items
```

#### Required Structure (Salatiso-aligned)
```
✅ Journey-based navigation:
📊 Dashboard (Standalone)

👤 Personal
  ├─ My Profile
  ├─ LifeCV
  ├─ My Contacts
  ├─ My Calendar (Individual context)
  ├─ My Assets
  ├─ My Projects
  └─ Career Pathways ← NEW

👨‍👩‍👧‍👦 Family
  ├─ Family Dashboard
  ├─ Family Tree
  ├─ Family Timeline ← NEW
  ├─ Household Members
  ├─ Family Calendar (Family context)
  ├─ Family Assets
  ├─ Family Projects
  └─ Family Values (external link)

💼 Professional
  ├─ Business Dashboard (external)
  ├─ Business Operations ← NEW
  ├─ Business Organogram ← NEW
  ├─ Business Plan ← NEW
  ├─ Professional Calendar (Professional context)
  ├─ Business Assets
  └─ Business Projects

🌐 Communities [Sonny]
  ├─ My Networks
  ├─ Sonny Network [Mesh]
  ├─ Community Calendar
  ├─ PigeeBack (external)
  ├─ Ekhaya Communities
  └─ LifeSync Groups (external)

🔧 Common Tools
  ├─ Assets Register (all contexts)
  ├─ Reporting ← NEW
  ├─ Analytics ← NEW
  ├─ Toolkit
  ├─ Sazi Academy (external)
  └─ Sync Control [MNI]

💡 Innovation Lab
🧪 Beta Testing
⚙️ Settings
🚪 Logout
```

### 2. FEATURE PARITY GAPS (NEW)

#### Contacts Management

| Feature | Salatiso Status | LifeSync Status | Gap |
|---------|----------------|-----------------|-----|
| Contact CRUD | ✅ Full | ⚠️ Basic | Missing bulk ops |
| Contact Search | ✅ Advanced | ❌ Basic | Missing fuzzy search |
| Contact Filtering | ✅ Advanced | ❌ Basic | Missing multi-field filters |
| Contact Groups | ✅ Full | ❌ None | Completely missing |
| Contact Merge | ✅ Full | ❌ None | Completely missing |
| Contact Deduplication | ✅ Full | ❌ None | Completely missing |
| Bulk Operations | ✅ Full | ❌ None | Delete, tag, export |
| Contact Import | ✅ Multi-source | ⚠️ Basic | Single source |
| Contact Export | ✅ CSV/vCard | ❌ None | Export missing |
| Role Assignment | ✅ Full | ⚠️ Basic | Household focus only |
| Contact Tags | ✅ Full | ❌ None | Tagging system missing |
| Contact History | ✅ Full | ❌ None | Audit trail missing |

#### Calendar Management

| Feature | Salatiso Status | LifeSync Status | Gap |
|---------|----------------|-----------------|-----|
| Dual Calendar | ✅ Full | ❌ None | Missing alternative calendar |
| Recurring Events | ✅ Full | ❌ None | No recurrence rules |
| Event Recurrence Rules | ✅ Full | ❌ None | No daily/weekly/monthly/yearly |
| Event Exceptions | ✅ Full | ❌ None | No skip single occurrence |
| Context-Aware Calendar | ✅ Full | ⚠️ Partial | Individual context only |
| Calendar Import | ✅ iCal/Google | ⚠️ iCal only | Missing Google sync |
| Calendar Export | ✅ Full | ❌ None | Export missing |
| Calendar Sharing | ✅ Full | ❌ None | Sharing missing |
| Event Reminders | ✅ Multi-channel | ⚠️ Basic | Limited reminders |
| Event Collaboration | ✅ Full | ❌ None | Multi-user events |
| Time Zone Support | ✅ Full | ❌ None | Single timezone |
| Calendar Views | ✅ Month/Week/Day/Agenda | ⚠️ Month only | Limited views |

#### Assets Management

| Feature | Salatiso Status | LifeSync Status | Gap |
|---------|----------------|-----------------|-----|
| Asset Registry | ✅ Full | ❌ MISSING | Complete feature gap |
| Asset Context | ✅ All contexts | ❌ MISSING | Individual/Family/Professional |
| Asset Types | ✅ Full taxonomy | ❌ MISSING | Classification system |
| Asset Tracking | ✅ Location tracking | ❌ MISSING | GPS integration |
| Asset Valuation | ✅ Full | ❌ MISSING | Value tracking |
| Asset Depreciation | ✅ Full | ❌ MISSING | Wear calculation |
| Asset Insurance | ✅ Full | ❌ MISSING | Policy integration |
| Asset Maintenance | ✅ Full | ❌ MISSING | Service schedule |
| Asset History | ✅ Full audit trail | ❌ MISSING | No history |
| Asset Sharing | ✅ Full | ❌ MISSING | Sharing within family/team |
| Asset Reports | ✅ Full | ❌ MISSING | Reporting & analytics |

#### Projects Management

| Feature | Salatiso Status | LifeSync Status | Gap |
|---------|----------------|-----------------|-----|
| Project Creation | ✅ Full | ❌ MISSING | Complete feature gap |
| Project Context | ✅ All contexts | ❌ MISSING | Individual/Family/Professional |
| Project Templates | ✅ Full | ❌ MISSING | Template system |
| Project Planning | ✅ Detailed | ❌ MISSING | Goal/milestone planning |
| Task Management | ✅ Full CRUD | ❌ MISSING | Tasks & subtasks |
| Task Dependencies | ✅ Full | ❌ MISSING | Gantt-like view |
| Team Collaboration | ✅ Full | ❌ MISSING | Assignments, permissions |
| Resource Planning | ✅ Full | ❌ MISSING | Resource allocation |
| Project Budget | ✅ Full | ❌ MISSING | Budget tracking |
| Project Timeline | ✅ Gantt charts | ❌ MISSING | Timeline visualization |
| Project Status | ✅ Full tracking | ❌ MISSING | Progress reporting |
| Project Reports | ✅ Full | ❌ MISSING | Reports & dashboards |

#### Analytics & Reporting

| Feature | Salatiso Status | LifeSync Status | Gap |
|---------|----------------|-----------------|-----|
| Analytics Dashboard | ✅ Full | ❌ MISSING | Complete feature gap |
| Usage Analytics | ✅ Full | ❌ MISSING | Activity tracking |
| Contact Analytics | ✅ Full | ❌ MISSING | Contact metrics |
| Calendar Analytics | ✅ Full | ❌ MISSING | Event metrics |
| Asset Analytics | ✅ Full | ❌ MISSING | Asset metrics |
| Project Analytics | ✅ Full | ❌ MISSING | Project metrics |
| Custom Reports | ✅ Full | ❌ MISSING | Report builder |
| Report Export | ✅ PDF/CSV | ❌ MISSING | Export formats |
| Report Scheduling | ✅ Full | ❌ MISSING | Scheduled reports |
| Data Visualization | ✅ Charts/Graphs | ❌ MISSING | Data viz |

#### Business Operations (Family/Professional)

| Feature | Salatiso Status | LifeSync Status | Gap |
|---------|----------------|-----------------|-----|
| Business Dashboard | ✅ Full | ⚠️ Professional only | Missing Family business |
| Organogram | ✅ Full | ❌ MISSING | Org structure visualization |
| Hierarchy Management | ✅ Full | ❌ MISSING | Role hierarchies |
| Team Management | ✅ Full | ❌ MISSING | Team features |
| Department Management | ✅ Full | ❌ MISSING | Departments/divisions |
| Role Definitions | ✅ Full | ❌ MISSING | Role permissions |
| Business Planning | ✅ Full | ❌ MISSING | Strategic planning tools |
| KPI Tracking | ✅ Full | ❌ MISSING | Key performance indicators |
| Performance Review | ✅ Full | ❌ MISSING | Evaluation system |

#### Timeline Features

| Feature | Salatiso Status | LifeSync Status | Gap |
|---------|----------------|-----------------|-----|
| Family Timeline | ✅ Full | ❌ MISSING | Complete feature gap |
| Milestone Tracking | ✅ Full | ❌ MISSING | Milestone markers |
| Timeline Events | ✅ Full | ❌ MISSING | Event sequencing |
| Event Annotations | ✅ Full | ❌ MISSING | Rich annotations |
| Media Integration | ✅ Full | ❌ MISSING | Photo/video support |
| Timeline Sharing | ✅ Full | ❌ MISSING | Share with family |
| Timeline Export | ✅ Full | ❌ MISSING | Export functionality |

### 3. KEYBOARD NAVIGATION GAPS (EXISTING)

| Element | Current State | Required State | Lines |
|---------|--------------|----------------|-------|
| Sidebar navigation | No keyboard | Full keyboard support | NEW |
| Dashboard categories | onClick only | + onKeyDown | 268-277 |
| Floating toolbar | Minimal | Full keyboard + focus trap | ~100-150 |
| Modal dialogs | Basic | Focus trap + Escape | ~10 modals |
| Tool items | Links only | onKeyDown handlers | 183-216 |
| Quick action cards | No keyboard | Full keyboard | 361-418 |

### 4. ARIA & SEMANTIC HTML GAPS (EXISTING)

- `aria-label` on icon-only buttons (~50 instances, now +30 new)
- `aria-describedby` on form fields (~30 instances)
- `aria-live` regions for dynamic content (~10 locations)
- `aria-expanded` on collapsible sections (~25 instances, now +15 new)
- `aria-controls` linking buttons to panels (~20 instances)
- `role` attributes on custom interactive elements (~40 instances, now +50 new)
- Landmark regions (`<nav>`, `<main>`, `<aside>`) (~15 locations, now +5 new)

---

## REVISED PHASE-BY-PHASE IMPLEMENTATION PLAN

### **PHASE 0: Sidebar Navigation Architecture (Weeks 1-2) [NEW]**

**Objective:** Reorganize sidebar into context-aware navigation structure supporting user journey

#### Week 1: Sidebar Foundation & Structure

**Tasks:**

1. ✅ Create sidebar navigation config
   - `src/config/navigation.config.ts`
   - Define all sections, items, and contexts
   - Badge system configuration
   - External link markers

2. ✅ Create navigation types and utilities
   - `src/types/navigation.types.ts`
   - `src/utils/navigationHelpers.ts`
   - Context parameter builders
   - Active route detection

3. 🔧 Build new Sidebar component (`src/components/navigation/Sidebar.tsx`)
   - Replace existing flat sidebar
   - Section-based collapsible structure
   - Context-aware routing
   - Badge system integration
   - Responsive behavior (desktop/tablet/mobile)

4. ✅ Create sub-components
   - `src/components/navigation/NavSection.tsx`
   - `src/components/navigation/NavItem.tsx`
   - `src/components/navigation/SectionBadge.tsx`

5. ✅ Create navigation hook
   - `src/hooks/useNavigation.ts`
   - Expanded/collapsed state management
   - localStorage persistence
   - Active item tracking

**Deliverables:**
- [ ] `src/config/navigation.config.ts` - Complete nav structure
- [ ] `src/types/navigation.types.ts` - TypeScript definitions
- [ ] `src/components/navigation/Sidebar.tsx` - Main component
- [ ] `src/components/navigation/NavSection.tsx` - Section component
- [ ] `src/components/navigation/NavItem.tsx` - Item component
- [ ] `src/hooks/useNavigation.ts` - State management hook
- [ ] Updated `src/App.jsx` to use new Sidebar

**Testing:**
- [ ] All sections render correctly
- [ ] All items have correct paths
- [ ] External links open in new tab
- [ ] Responsive behavior works
- [ ] localStorage persistence works

---

#### Week 2: Sidebar Integration & Mobile

**Tasks:**

1. 🔧 Integrate new sidebar into App
   - Update App.jsx layout
   - Update routing for context params
   - Add skip links
   - Add landmark regions

2. ✅ Implement responsive mobile behavior
   - Mobile hamburger menu
   - Drawer overlay
   - Touch-friendly sizing
   - Swipe-to-close gesture

3. 🔧 Add semantic HTML & ARIA
   - `role="navigation"`
   - `aria-label` on sections
   - `aria-expanded` on toggles
   - `aria-current` on active items
   - Proper heading hierarchy

4. 🔧 Implement keyboard navigation
   - Tab through sections
   - Enter/Space to expand/collapse
   - Arrow keys to navigate items
   - Escape to close mobile drawer

5. 🔧 Add calendar context propagation
   - `/intranet/calendar?context=individual`
   - `/intranet/calendar?context=family`
   - `/intranet/calendar?context=professional`
   - `/intranet/calendar?context=community`

6. ✅ Link all destinations
   - Update existing page routes
   - Verify all paths work
   - Test external link handling

**Deliverables:**
- [ ] Integrated sidebar in App.jsx
- [ ] Mobile responsive behavior
- [ ] Full keyboard accessibility
- [ ] ARIA labels and roles
- [ ] Calendar context parameter system
- [ ] All links working and tested

**Testing:**
- [ ] Desktop navigation works
- [ ] Tablet collapse/expand works
- [ ] Mobile drawer works
- [ ] Keyboard navigation complete
- [ ] Screen reader announces sections
- [ ] All links active and working
- [ ] Calendar context preserved

---

### **PHASE 1: Core Accessibility Foundation (Weeks 3-5)**

**Objective:** Achieve WCAG 2.1 AA compliance for core navigation and updated dashboard

#### Week 3: Dashboard & Floating Toolbar Keyboard Navigation

**Tasks:**

1. ✅ Create accessibility utilities module (`src/utils/accessibility.js`)
   - Focus trap helper
   - Skip link component
   - Keyboard event handlers
   - ARIA helpers
   - Focus management utils

2. 🔧 Update Dashboard component (`src/components/Dashboard.jsx`)
   - Add keyboard handlers to all interactive elements
   - Add aria-expanded, aria-controls, aria-label
   - Add role attributes and landmark regions
   - Add focus indicators (CSS)
   - Integrate with new sidebar (remove old nav)

3. 🔧 Update FloatingToolbar (`src/components/FloatingToolbar.jsx`)
   - Add focus trapping to modal dialogs
   - Add Escape key handler for all modals
   - Add keyboard navigation for tools list
   - Add aria-live announcements
   - Improve focus restoration

**Deliverables:**
- [ ] `src/utils/accessibility.js` - Utility functions
- [ ] `src/components/common/SkipLink.jsx` - Skip navigation component
- [ ] `src/components/common/AccessibleModal.jsx` - Modal wrapper
- [ ] Updated Dashboard with full keyboard support
- [ ] Updated FloatingToolbar with accessibility
- [ ] CSS focus indicators in `src/index.css`

**Testing:**
- [ ] Keyboard-only navigation works
- [ ] Screen reader test (NVDA/JAWS)
- [ ] Focus visibility test
- [ ] Focus trap in modals verified

---

#### Week 4: ARIA Labels & Semantic HTML Audit

**Tasks:**

1. 📋 Conduct full app audit for ARIA gaps
   - Spreadsheet of all interactive elements
   - Document missing ARIA attributes
   - Prioritize by usage frequency

2. 🔧 Add ARIA labels to all icon-only buttons
   - Dashboard quick actions
   - Toolbar tools
   - Navigation icons
   - Form actions

3. 🔧 Add semantic HTML and landmark regions
   - Convert divs to nav/main/aside/article
   - Add section elements with headings
   - Ensure proper heading hierarchy
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
- [ ] All ARIA labels verified

---

#### Week 5: Global Keyboard Shortcuts System

**Tasks:**

1. ✅ Create keyboard shortcuts system
   - `src/hooks/useKeyboardShortcuts.js` - Custom hook
   - `src/contexts/KeyboardShortcutsContext.jsx` - Global context
   - Shortcut registration and conflict detection
   - Platform-aware (Ctrl vs Cmd)

2. 🔧 Implement global shortcuts (minimum 15)
   - `Ctrl+K` / `Cmd+K`: Quick actions palette
   - `Ctrl+/` / `Cmd+/`: Show shortcuts guide
   - `Ctrl+B` / `Cmd+B`: Toggle sidebar
   - `Ctrl+Shift+D`: Go to dashboard
   - Plus 10+ more app-specific shortcuts

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
- [ ] Documentation updated

**Testing:**
- [ ] All shortcuts work
- [ ] No conflicts between shortcuts
- [ ] Cross-platform testing (Windows/Mac)
- [ ] Shortcuts guide modal complete

---

### **PHASE 2: Advanced Keyboard & Dashboard Features (Weeks 6-7)**

#### Week 6: Quick Actions Palette & Contact Management

**Tasks:**

1. ✅ Create QuickActionsPalette component
   - `src/components/QuickActionsPalette.jsx`
   - Fuzzy search for actions/pages
   - Keyboard navigation (up/down arrows)
   - Recent actions history
   - Action categories

2. 🔧 Implement Contact Management Bulk Operations
   - `src/components/contacts/BulkOperationsToolbar.jsx`
   - Select all/none/inverse
   - Delete selected
   - Tag selected
   - Merge duplicates
   - Export selected

3. ✅ Create ContactMergeWizard
   - `src/components/contacts/ContactMergeWizard.jsx`
   - Duplicate detection
   - Merge preview
   - Field mapping interface

4. 🔧 Update GuestContext with bulk operations
   - Add bulk delete handler
   - Add bulk tag handler
   - Add merge handler
   - Add export handler

**Deliverables:**
- [ ] `src/components/QuickActionsPalette.jsx`
- [ ] `src/components/contacts/BulkOperationsToolbar.jsx`
- [ ] `src/components/contacts/ContactMergeWizard.jsx`
- [ ] Updated GuestContext
- [ ] Unit tests for bulk operations

**Testing:**
- [ ] Palette search works
- [ ] Bulk delete test
- [ ] Merge contacts test
- [ ] Export test
- [ ] Performance test (1000+ contacts)

---

#### Week 7: Advanced Filtering, Search & Contact Groups

**Tasks:**

1. ✅ Create AdvancedFilter component
   - `src/components/common/AdvancedFilter.jsx`
   - Multi-field filtering
   - Date range filters
   - Tag-based filtering
   - Saved filter presets

2. ✅ Create SearchBar with autocomplete
   - `src/components/common/SearchBar.jsx`
   - Debounced search
   - Keyword highlighting
   - Search history

3. ✅ Create ContactGroups component
   - `src/components/contacts/ContactGroups.jsx`
   - Create/edit/delete groups
   - Drag-and-drop to groups
   - Smart groups (dynamic filters)

4. 🔧 Implement filter state management
   - `src/hooks/useAdvancedFilter.js`
   - Filter persistence
   - Filter sharing via URL params

**Deliverables:**
- [ ] `src/components/common/AdvancedFilter.jsx`
- [ ] `src/components/common/SearchBar.jsx`
- [ ] `src/components/contacts/ContactGroups.jsx`
- [ ] `src/hooks/useAdvancedFilter.js`
- [ ] Integration in Dashboard and lists

**Testing:**
- [ ] Filter accuracy
- [ ] Search performance
- [ ] URL state persistence
- [ ] Group management works

---

### **PHASE 3: Calendar & Assets Management (Weeks 8-9)**

#### Week 8: Advanced Calendar Features

**Tasks:**

1. ✅ Create context-aware Calendar system
   - `src/components/calendar/ContextCalendar.jsx`
   - Individual calendar
   - Family calendar
   - Professional calendar
   - Community calendar

2. ✅ Implement dual calendar system
   - `src/components/calendar/DualCalendar.jsx`
   - Gregorian calendar view
   - Alternative calendar view
   - Sync between both views

3. 🔧 Implement recurring events
   - Recurrence rules (daily, weekly, monthly, yearly)
   - Edit single/all occurrences
   - Exception handling

4. 🔧 Add event import/export
   - iCal (.ics) import
   - Google Calendar sync
   - CSV export
   - Share events via link

5. ✅ Create CalendarViewOptions
   - Month/Week/Day views
   - Agenda view
   - Mini calendar widget

**Deliverables:**
- [ ] `src/components/calendar/ContextCalendar.jsx`
- [ ] `src/components/calendar/DualCalendar.jsx`
- [ ] `src/components/calendar/RecurringEventEditor.jsx`
- [ ] `src/utils/calendarImportExport.js`
- [ ] `src/components/calendar/CalendarViewOptions.jsx`
- [ ] Integration with calendar page

**Testing:**
- [ ] Recurring events work
- [ ] Import/export tested
- [ ] Multi-calendar sync verified
- [ ] All views render correctly

---

#### Week 9: Assets & Projects Management

**Tasks:**

1. ✅ Create Asset Management system (BRAND NEW)
   - `src/components/assets/AssetRegistry.jsx`
   - `src/components/assets/AssetForm.jsx`
   - `src/components/assets/AssetDetails.jsx`
   - Asset creation, edit, delete
   - Multi-context support

2. ✅ Implement asset features
   - Asset types and classification
   - Location tracking
   - Valuation and depreciation
   - Insurance integration
   - Maintenance scheduling
   - Asset sharing within context

3. ✅ Create Projects Management system (BRAND NEW)
   - `src/components/projects/ProjectList.jsx`
   - `src/components/projects/ProjectForm.jsx`
   - `src/components/projects/ProjectDetails.jsx`
   - `src/components/projects/TaskManager.jsx`
   - Project creation, edit, delete
   - Multi-context support

4. ✅ Implement project features
   - Project templates
   - Task management and dependencies
   - Team collaboration
   - Resource planning
   - Budget tracking
   - Gantt-like timeline view
   - Project status tracking

5. 🔧 Update GuestContext
   - Add asset CRUD operations
   - Add project CRUD operations
   - Add bulk operations
   - Add filtering

**Deliverables:**
- [ ] Complete Asset Management system
- [ ] Complete Project Management system
- [ ] Updated GuestContext with new data
- [ ] UI for assets and projects
- [ ] Multi-context routing

**Testing:**
- [ ] Asset CRUD operations
- [ ] Project CRUD operations
- [ ] Multi-context filtering
- [ ] Bulk operations work
- [ ] Performance acceptable

---

### **PHASE 4: Family Timeline, Business Operations & Analytics (Weeks 10-11)**

#### Week 10: Family Features & Business Operations

**Tasks:**

1. ✅ Create Family Timeline component (BRAND NEW)
   - `src/components/family/FamilyTimeline.jsx`
   - Milestone tracking
   - Timeline events
   - Event annotations
   - Media integration (photos/videos)
   - Timeline sharing
   - Timeline export

2. ✅ Create Family Dashboard enhancements
   - `src/components/family/FamilyDashboard.jsx`
   - Family statistics
   - Recent events
   - Family connections
   - Household overview

3. ✅ Create Business Operations components (BRAND NEW)
   - `src/components/business/BusinessDashboard.jsx`
   - `src/components/business/Organogram.jsx`
   - `src/components/business/BusinessPlanning.jsx`
   - Org structure visualization
   - Hierarchy management
   - Department management
   - Role definitions
   - Team management

4. ✅ Create Business Planning features
   - Strategic planning tools
   - KPI tracking
   - Performance reviews
   - Business metrics dashboard

**Deliverables:**
- [ ] `src/components/family/FamilyTimeline.jsx`
- [ ] `src/components/family/FamilyDashboard.jsx`
- [ ] `src/components/business/BusinessDashboard.jsx`
- [ ] `src/components/business/Organogram.jsx`
- [ ] `src/components/business/BusinessPlanning.jsx`
- [ ] Integration with sidebar and routing

**Testing:**
- [ ] Family timeline works
- [ ] Business dashboard works
- [ ] Organogram renders correctly
- [ ] All features functional

---

#### Week 11: Analytics & Reporting

**Tasks:**

1. ✅ Create Analytics Dashboard (BRAND NEW)
   - `src/components/analytics/AnalyticsDashboard.jsx`
   - Usage analytics
   - Contact analytics
   - Calendar analytics
   - Asset analytics
   - Project analytics
   - Activity tracking

2. ✅ Create Reporting System (BRAND NEW)
   - `src/components/reporting/ReportBuilder.jsx`
   - `src/components/reporting/ReportTemplates.jsx`
   - Custom reports
   - Report export (PDF/CSV)
   - Scheduled reports
   - Data visualization

3. ✅ Implement data visualization
   - Charts (line, bar, pie, area)
   - Graphs and trends
   - Heatmaps
   - Custom visualizations

4. 🔧 Create reporting hooks
   - `src/hooks/useReporting.ts`
   - Report generation
   - Data aggregation
   - Export functions

**Deliverables:**
- [ ] `src/components/analytics/AnalyticsDashboard.jsx`
- [ ] `src/components/reporting/ReportBuilder.jsx`
- [ ] `src/components/reporting/ReportTemplates.jsx`
- [ ] Data visualization components
- [ ] `src/hooks/useReporting.ts`
- [ ] Integration in sidebar

**Testing:**
- [ ] Analytics calculations correct
- [ ] Reports generate successfully
- [ ] Export functionality works
- [ ] Charts render correctly

---

### **PHASE 5: Performance & Polish (Week 12)**

#### Week 12: React Performance Optimization

**Tasks:**

1. 🔧 Add React.memo to expensive components
   - Dashboard
   - ContactList items
   - EventCard
   - FamilyTreeNode
   - AssetCard
   - ProjectCard
   - TimelineItem
   - (~25 components total)

2. 🔧 Add useCallback optimizations
   - Event handlers in Dashboard
   - Filter handlers
   - Modal toggle functions
   - Navigation functions
   - Bulk operation handlers
   - (~50 functions total)

3. 🔧 Add useMemo optimizations
   - Filtered/sorted lists
   - Derived state calculations
   - Complex transformations
   - (~30 computations total)

4. 🔧 Implement virtualization for long lists
   - Contact lists (>100 items)
   - Event lists (>100 items)
   - Asset lists
   - Project lists
   - Timeline items

5. 🔧 Code splitting optimization
   - Review and optimize lazy imports
   - Prefetch critical routes
   - Bundle size analysis
   - Reduce main bundle

6. 🔧 Accessibility audit & fixes
   - Run Lighthouse audit
   - Run axe DevTools
   - Fix all violations
   - Document accessibility features

**Deliverables:**
- [ ] React.memo applied (~25 components)
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

### **PHASE 6: Final Integration & Testing (Weeks 13-14)**

#### Week 13: Dashboard Customization & Feature Completion

**Tasks:**

1. ✅ Create DashboardCustomizer
   - `src/components/dashboard/DashboardCustomizer.jsx`
   - Widget library
   - Drag-and-drop layout
   - Save/restore layouts
   - Preset layouts

2. 🔧 Finalize all feature integrations
   - Ensure sidebar links to all features
   - Verify context propagation
   - Test all workflows
   - Fix edge cases

3. 📋 Comprehensive testing
   - End-to-end keyboard navigation
   - Full screen reader testing
   - Cross-browser testing
   - Mobile accessibility testing
   - Performance benchmarking

**Deliverables:**
- [ ] `src/components/dashboard/DashboardCustomizer.jsx`
- [ ] Complete test suite
- [ ] Integration verification
- [ ] All features working

**Testing:**
- [ ] Dashboard customization works
- [ ] All integrations verified
- [ ] Edge cases handled

---

#### Week 14: Documentation & Release

**Tasks:**

1. 📝 Documentation updates
   - Update README with new features
   - Create ACCESSIBILITY.md
   - Create KEYBOARD_SHORTCUTS.md
   - Create FEATURE_GUIDE.md
   - Update CONTRIBUTING.md
   - Create keyboard shortcuts reference card

2. 📋 Final QA & verification
   - Full regression test
   - Accessibility compliance certification
   - Performance validation
   - User acceptance testing
   - Browser compatibility check

3. 🚀 Release preparation
   - Version bump
   - Changelog preparation
   - Migration guide (if needed)
   - User communication

**Deliverables:**
- [ ] Complete documentation
- [ ] Final test report
- [ ] Release notes
- [ ] User guides

**Testing:**
- [ ] Full regression test
- [ ] Accessibility compliance certification
- [ ] Performance validation

---

## COMPREHENSIVE FEATURE MATRIX (WHAT GETS BUILT)

### By Phase

| Phase | Weeks | Primary Focus | Key Deliverables |
|-------|-------|---------------|------------------|
| **Phase 0** | 1-2 | Sidebar Navigation | New navigation structure, context routing |
| **Phase 1** | 3-5 | Core Accessibility | Keyboard nav, ARIA, focus mgmt, shortcuts |
| **Phase 2** | 6-7 | Dashboard UX | Quick palette, bulk ops, filtering, groups |
| **Phase 3** | 8-9 | Calendar & Assets | Dual calendar, recurring events, asset mgmt |
| **Phase 4** | 10-11 | Timeline & Business | Family timeline, org structure, analytics |
| **Phase 5** | 12 | Performance | Optimization, code splitting, virtualization |
| **Phase 6** | 13-14 | Integration | Dashboard customization, documentation, release |

### Feature Completion

**NEW Features (Salatiso Feature Parity):**
- ✅ Advanced Sidebar Navigation (5 contexts)
- ✅ Contact Groups Management
- ✅ Contact Merge & Deduplication
- ✅ Bulk Contact Operations
- ✅ Advanced Contact Filtering
- ✅ Dual Calendar System
- ✅ Recurring Events
- ✅ Context-Aware Calendar
- ✅ Asset Registry (all contexts)
- ✅ Asset Tracking & Maintenance
- ✅ Projects Management (all contexts)
- ✅ Task Dependencies
- ✅ Family Timeline
- ✅ Business Operations (Organogram, Planning)
- ✅ Analytics Dashboard
- ✅ Reporting System
- ✅ Global Keyboard Shortcuts (15+)
- ✅ Quick Actions Palette (Cmd+K)
- ✅ Dashboard Customization
- ✅ Full WCAG 2.1 AA Compliance

---

## IMPLEMENTATION GUIDELINES

### Code Standards for Sidebar

**Navigation Config Structure:**
```typescript
// src/config/navigation.config.ts
export const NAV_STRUCTURE: NavSection[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'BarChart3',
    path: '/dashboard',
    standalone: true
  },
  {
    id: 'personal',
    label: 'Personal',
    icon: 'User',
    items: [
      { label: 'My Profile', icon: 'User', path: '/profile' },
      { label: 'LifeCV', icon: 'FileText', path: '/lifecv', badge: 'Core' },
      { label: 'My Contacts', icon: 'Users', path: '/contacts' },
      { label: 'My Calendar', icon: 'Calendar', path: '/calendar?context=individual' },
      { label: 'My Assets', icon: 'Package', path: '/assets?context=individual' },
      { label: 'My Projects', icon: 'Briefcase', path: '/projects?context=individual' },
      { label: 'Career Pathways', icon: 'TrendingUp', path: '/career-paths' }
    ]
  },
  // ... other sections
];
```

**Context-Aware Navigation:**
```typescript
// All calendar/asset/project links include context param
const buildContextLink = (path: string, context?: string): string => {
  if (!context) return path;
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}context=${context}`;
};

// Usage in component
<Link to={buildContextLink('/calendar', 'family')}>
  Family Calendar
</Link>
```

### Code Standards for Keyboard Navigation

**Keyboard Event Handlers (UPDATED):**
```jsx
// ✅ Good: Handle both click and keyboard on sidebar
const handleSectionToggle = (e, sectionId) => {
  if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    toggleSection(sectionId);
  }
};

<button
  onClick={(e) => handleSectionToggle(e, id)}
  onKeyDown={(e) => handleSectionToggle(e, id)}
  aria-expanded={expanded}
  aria-controls={`section-${id}`}
  aria-label={`Toggle ${label}`}
  role="button"
  tabIndex={0}
>
  <Icon />
  {label}
</button>
```

---

## SUCCESS CRITERIA (UPDATED)

### Phase 0 Success Metrics
- ✅ New sidebar renders all 5 contexts
- ✅ All 50+ navigation items working
- ✅ Context params propagate correctly
- ✅ Mobile responsive working
- ✅ All external links open in new tab
- ✅ localStorage state persists

### Phase 1 Success Metrics
- ✅ 100% keyboard navigation coverage
- ✅ Lighthouse accessibility score 95+
- ✅ axe DevTools 0 critical violations
- ✅ All modals have focus trapping
- ✅ All interactive elements have ARIA labels
- ✅ 15+ keyboard shortcuts functional

### Phase 2 Success Metrics
- ✅ Quick palette functional
- ✅ Bulk contact operations working
- ✅ Contact merge working
- ✅ Advanced filtering functional
- ✅ Contact groups working

### Phase 3 Success Metrics
- ✅ Dual calendar implemented
- ✅ Recurring events working
- ✅ Asset management complete
- ✅ Project management complete
- ✅ Multi-context filtering working

### Phase 4 Success Metrics
- ✅ Family timeline functional
- ✅ Business organogram working
- ✅ Analytics dashboard complete
- ✅ Reporting system complete
- ✅ Business planning tools working

### Phase 5 Success Metrics
- ✅ React.memo applied (25+ components)
- ✅ useCallback/useMemo optimizations in place
- ✅ Virtualization for lists
- ✅ Lighthouse Performance score 90+
- ✅ Bundle size <500KB main chunk

### Phase 6 Success Metrics
- ✅ Dashboard customization functional
- ✅ All features integrated
- ✅ Full accessibility compliance
- ✅ Complete documentation
- ✅ 0 critical bugs

---

## RESOURCE REQUIREMENTS (UPDATED)

### Development Resources
- **Primary Developer:** Full-time for 14 weeks
- **Secondary Developer:** Part-time weeks 1-2 (sidebar), weeks 8-11 (features)
- **UX/Accessibility Consultant:** 3-5 hours/week throughout
- **QA Tester:** Part-time weeks 10-14

### Tools & Services
- axe DevTools Pro (optional, ~$50/month)
- Screen reader software (NVDA free, JAWS trial)
- BrowserStack for cross-browser testing (optional)
- Data visualization library (Chart.js, Recharts)
- Calendar library (compatible with recurring events)

---

## MIGRATION PATH FROM OLD TO NEW SIDEBAR

### Week 1-2 Actions

1. **Build new sidebar in parallel** (don't remove old one yet)
2. **Feature flag for new sidebar** - Toggle between old/new
3. **Link all old routes** to new sidebar items
4. **Test all navigation** before switching

### Switch-Over Day

1. **Enable new sidebar** globally
2. **Monitor for issues** in real-time
3. **Have rollback plan** ready
4. **Communicate with users** about changes

### Post-Migration

1. **Remove old sidebar code** (Week 3)
2. **Clean up old config files**
3. **Update docs**
4. **Gather user feedback**

---

## ECOSYSTEM FEATURE ROLLOUT STRATEGY

### LifeSync Feature Adoption Model

1. **Salatiso-React-App develops** new feature (reference impl)
2. **Feature tested & validated** in Salatiso
3. **LifeSync replicates** feature (this project)
4. **Feature deployed** across ecosystem
5. **Other apps** adopt as applicable

### This Project Implements

- ✅ Sidebar from Salatiso (customized for LifeSync domain)
- ✅ Contact features from Salatiso
- ✅ Calendar features from Salatiso
- ✅ Asset management from Salatiso
- ✅ Projects from Salatiso
- ✅ Analytics from Salatiso
- ✅ Keyboard shortcuts pattern from Salatiso
- ✅ Accessibility patterns from Salatiso

### Future Rollout

- **Phase 7 (Future):** Roll features to Family Value app
- **Phase 8 (Future):** Roll features to Pigeeback app
- **Phase 9 (Future):** Roll features to Ekhaya app
- **Phase 10 (Future):** Roll features to other ecosystem apps

---

## RISK MITIGATION (UPDATED)

### High-Risk Areas

**1. Breaking Changes During Sidebar Migration**
- **Risk:** Old sidebar removal breaks routing
- **Mitigation:** Build new sidebar in parallel, feature flag, test thoroughly
- **Contingency:** Keep old sidebar code for 1 week after cutover

**2. Data Migration for New Features**
- **Risk:** Asset/Project data structure changes break existing data
- **Mitigation:** Use migrations, add data validation, test with real data
- **Contingency:** Backup data before migration, rollback capability

**3. Performance Degradation from New Features**
- **Risk:** Adding 100+ new components slows app
- **Mitigation:** Aggressive performance testing, virtualization, code splitting
- **Contingency:** Feature flags to disable new features if needed

**4. Accessibility Compliance Issues**
- **Risk:** Automated fixes introduce new a11y issues
- **Mitigation:** Manual testing with screen readers, external audit
- **Contingency:** External accessibility consultant review

**5. Scope Creep**
- **Risk:** Adding features beyond Salatiso parity
- **Mitigation:** Strict adherence to Salatiso feature list
- **Contingency:** Defer non-critical features to Phase 7+

---

## TESTING STRATEGY (UPDATED)

### Automated Testing

- [ ] Lighthouse accessibility audit (target: 95+)
- [ ] axe DevTools scan (target: 0 violations)
- [ ] WAVE browser extension
- [ ] pa11y-ci in CI/CD pipeline
- [ ] Unit tests for all new components
- [ ] Integration tests for navigation
- [ ] E2E tests for user flows
- [ ] Performance tests (Lighthouse/PageSpeed)

### Manual Testing

- [ ] Keyboard-only navigation (mouse unplugged)
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] High contrast mode testing
- [ ] Zoom to 200% testing
- [ ] Color contrast validation (4.5:1 for text)
- [ ] Browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Mobile device testing (iOS/Android)

### User Testing

- [ ] Test with keyboard-only users
- [ ] Test with screen reader users
- [ ] Test with users with motor impairments
- [ ] Test with users with cognitive disabilities
- [ ] Gather feedback on new features

---

## CONCLUSION

This comprehensive, updated project plan provides a clear roadmap to:

1. **Reorganize sidebar** into context-aware navigation (Weeks 1-2)
2. **Achieve full accessibility compliance** (Weeks 3-5)
3. **Implement advanced UX features** (Weeks 6-7)
4. **Build new feature categories** (Weeks 8-11)
5. **Optimize performance** (Week 12)
6. **Finalize and release** (Weeks 13-14)

**Estimated Effort:** 560-640 hours (14 weeks full-time)  
**Team Size:** 1-2 developers + part-time support  
**Success Probability:** High (given clear requirements and Salatiso reference impl)

**Key Principle:** 100% Feature Parity with Salatiso-React-App where applicable to LifeSync domain

---

## APPENDIX: FILE STRUCTURE CHANGES (UPDATED)

### New Directories

```
src/
├── config/
│   └── navigation.config.ts              ← Sidebar structure
├── hooks/
│   ├── useKeyboardShortcuts.js
│   ├── useFocusTrap.js
│   ├── useAdvancedFilter.js
│   ├── useNavigation.ts                  ← NEW
│   ├── useReporting.ts                   ← NEW
│   └── useAssets.ts                      ← NEW
├── types/
│   └── navigation.types.ts               ← NEW
├── components/
│   ├── navigation/                       ← NEW DIR
│   │   ├── Sidebar.tsx
│   │   ├── NavSection.tsx
│   │   ├── NavItem.tsx
│   │   └── SectionBadge.tsx
│   ├── common/
│   │   ├── SkipLink.jsx
│   │   ├── AccessibleModal.jsx
│   │   ├── AdvancedFilter.jsx
│   │   └── SearchBar.jsx
│   ├── keyboard/                         ← NEW DIR
│   │   ├── KeyboardShortcutsGuide.jsx
│   │   └── QuickActionsPalette.jsx
│   ├── contacts/                         ← UPDATED
│   │   ├── BulkOperationsToolbar.jsx
│   │   ├── ContactMergeWizard.jsx
│   │   └── ContactGroups.jsx
│   ├── calendar/                         ← EXPANDED
│   │   ├── ContextCalendar.jsx           ← NEW
│   │   ├── DualCalendar.jsx
│   │   ├── RecurringEventEditor.jsx
│   │   └── CalendarViewOptions.jsx
│   ├── assets/                           ← NEW DIR
│   │   ├── AssetRegistry.jsx
│   │   ├── AssetForm.jsx
│   │   ├── AssetDetails.jsx
│   │   └── AssetCard.jsx
│   ├── projects/                         ← NEW DIR
│   │   ├── ProjectList.jsx
│   │   ├── ProjectForm.jsx
│   │   ├── ProjectDetails.jsx
│   │   ├── TaskManager.jsx
│   │   └── ProjectCard.jsx
│   ├── family/                           ← EXPANDED
│   │   ├── FamilyTimeline.jsx            ← NEW
│   │   ├── FamilyDashboard.jsx           ← NEW
│   │   └── TimelineItem.jsx
│   ├── business/                         ← NEW DIR
│   │   ├── BusinessDashboard.jsx
│   │   ├── Organogram.jsx
│   │   └── BusinessPlanning.jsx
│   ├── analytics/                        ← NEW DIR
│   │   ├── AnalyticsDashboard.jsx
│   │   └── AnalyticsCard.jsx
│   ├── reporting/                        ← NEW DIR
│   │   ├── ReportBuilder.jsx
│   │   ├── ReportTemplates.jsx
│   │   └── ReportExporter.jsx
│   └── dashboard/
│       └── DashboardCustomizer.jsx       ← NEW
├── utils/
│   ├── accessibility.js
│   ├── navigationHelpers.ts              ← NEW
│   ├── calendarImportExport.js
│   ├── assetHelpers.ts                   ← NEW
│   └── projectHelpers.ts                 ← NEW
└── contexts/
    ├── KeyboardShortcutsContext.jsx
    └── ReportingContext.jsx              ← NEW
```

### Files to Create (54 NEW)

**Navigation (7):**
- src/config/navigation.config.ts
- src/types/navigation.types.ts
- src/components/navigation/Sidebar.tsx
- src/components/navigation/NavSection.tsx
- src/components/navigation/NavItem.tsx
- src/components/navigation/SectionBadge.tsx
- src/hooks/useNavigation.ts

**Accessibility (3):**
- src/utils/accessibility.js
- src/components/common/SkipLink.jsx
- src/components/common/AccessibleModal.jsx

**Keyboard Features (3):**
- src/hooks/useKeyboardShortcuts.js
- src/components/KeyboardShortcutsGuide.jsx
- src/components/QuickActionsPalette.jsx

**Contacts (3):**
- src/components/contacts/BulkOperationsToolbar.jsx
- src/components/contacts/ContactMergeWizard.jsx
- src/components/contacts/ContactGroups.jsx

**Calendar (3):**
- src/components/calendar/ContextCalendar.jsx
- src/components/calendar/DualCalendar.jsx
- src/components/calendar/RecurringEventEditor.jsx

**Assets (5):** ← BRAND NEW SYSTEM
- src/components/assets/AssetRegistry.jsx
- src/components/assets/AssetForm.jsx
- src/components/assets/AssetDetails.jsx
- src/components/assets/AssetCard.jsx
- src/hooks/useAssets.ts

**Projects (6):** ← BRAND NEW SYSTEM
- src/components/projects/ProjectList.jsx
- src/components/projects/ProjectForm.jsx
- src/components/projects/ProjectDetails.jsx
- src/components/projects/TaskManager.jsx
- src/components/projects/ProjectCard.jsx
- src/hooks/useProjects.ts

**Family (2):**
- src/components/family/FamilyTimeline.jsx
- src/components/family/FamilyDashboard.jsx

**Business (3):**
- src/components/business/BusinessDashboard.jsx
- src/components/business/Organogram.jsx
- src/components/business/BusinessPlanning.jsx

**Analytics & Reporting (5):** ← BRAND NEW SYSTEM
- src/components/analytics/AnalyticsDashboard.jsx
- src/components/reporting/ReportBuilder.jsx
- src/components/reporting/ReportTemplates.jsx
- src/hooks/useReporting.ts
- src/contexts/ReportingContext.jsx

**Dashboard (1):**
- src/components/dashboard/DashboardCustomizer.jsx

**Documentation (3):**
- SIDEBAR_NAVIGATION.md
- ACCESSIBILITY.md
- KEYBOARD_SHORTCUTS.md

### Files to Modify (20+ CRITICAL)

**High Priority:**
- src/App.jsx (routing + sidebar integration)
- src/components/Dashboard.jsx (sidebar removal, accessibility)
- src/components/FloatingToolbar.jsx (accessibility, keyboard)
- src/components/Sidebar.jsx (→ deprecated, replaced)
- src/contexts/GuestContext.jsx (asset + project support)
- src/index.css (focus styles, new component styles)

**Medium Priority:**
- src/pages/Contact.jsx → src/pages/Contacts.jsx
- src/pages/Calendar.jsx (context support)
- All page components (skip links, ARIA)
- All form components (aria-describedby)
- All modal components (AccessibleModal)

---

## NEXT STEPS

1. ✅ **Review this updated plan** - Feedback on scope/timeline
2. ✅ **Approve Phase 0** - Sidebar navigation work
3. ✅ **Approve resource allocation** - 1-2 developers, 14 weeks
4. ✅ **Set up project tracking** - GitHub Projects or Jira
5. ✅ **Begin Phase 0, Week 1** - Sidebar implementation
6. ✅ **Schedule weekly reviews** - Progress updates

---

**Document Prepared By:** GitHub Copilot  
**Date:** October 26, 2025  
**Version:** 2.0 (UPDATED)  
**Status:** Ready for Review, Approval, and Immediate Implementation  
**Priority:** CRITICAL

---

## QUICK REFERENCE: KEY DIFFERENTIATORS FROM V1.0

| Area | V1.0 | V2.0 (Updated) | Change |
|------|------|----------------|--------|
| **Sidebar** | Not addressed | Full Phase 0 | NEW PHASE |
| **Timeline** | 8 weeks | 14 weeks | +6 weeks |
| **New Features** | 0 | 15+ | Major expansion |
| **Focus** | Keyboard only | Sidebar + Keyboard | Broader scope |
| **Assets** | Not included | Full system (Phase 3) | NEW |
| **Projects** | Not included | Full system (Phase 3) | NEW |
| **Analytics** | Not included | Full system (Phase 4) | NEW |
| **Business Ops** | Mentioned | Full system (Phase 4) | NEW |
| **Family Features** | Mentioned | Timeline system (Phase 4) | Enhanced |
| **Dev Hours** | 400-500h | 560-640h | +40-60h |

