# LifeSync Implementation - Dependency & Component Mapping

**Document Version**: 1.0  
**Date**: October 27, 2025  
**Purpose**: Complete mapping of components, services, and dependencies for LifeSync implementation

---

## 📊 Component Dependency Tree

### Level 1: Foundation & Infrastructure

```
├── Contexts
│   ├── AuthContext ✅ (MNI has this)
│   ├── LifeSyncLayoutContext 🔲 (NEW - to create)
│   └── ThemeContext ✅ (MNI likely has)
│
├── Utilities
│   ├── deviceDetection.ts ✅ (Phase 3B)
│   ├── vcfParser.ts ✅ (Phase 3B)
│   └── DateUtils.ts ✅ (should copy from MNI if exists)
│
├── Config
│   ├── SecurityConfig.ts ✅ (Phase 3B)
│   └── AppConfig.ts ✅ (should copy from MNI)
│
└── Services
    ├── AnalyticsService.ts ✅ (Phase 3B enhanced)
    ├── AuthService.ts ✅ (MNI has)
    ├── ContactsService.ts ✅ (Phase 2 - copy from MNI)
    ├── CalendarService.ts 🔲 (Phase 3 - to create)
    ├── AssetService.ts 🔲 (Phase 4 - to create)
    ├── DuplicateDetectionService.ts ✅ (Phase 2 - copy from MNI)
    └── PresenceService.ts ✅ (Phase 2 - copy from MNI)
```

---

## 📱 Component Hierarchy

### Navigation & Layout (Phase 1)

```
LifeSyncLayout
├── LifeSyncSidebar 🔲
│   ├── SidebarItem (component)
│   ├── SidebarSection (component)
│   └── NotificationBadge (component)
├── EcosystemHeader ✅ (copy from MNI, adapt for LifeSync)
└── Main Content Area
```

### Dashboard (Phase 1 & 8)

```
LifeSyncDashboard
├── WelcomeWidget 🔲
├── ProfileWidget ✅ (may exist in MNI)
├── ContactsWidget 🔲
├── CalendarWidget 🔲
├── AssetsWidget 🔲
├── LifeCVWidget ✅ (will adapt existing LifeCV widget)
├── TrustScoreWidget 🔲
├── ActivityFeed 🔲
└── QuickActionsBar 🔲
```

### Contacts Management (Phase 2)

```
ContactsPage
├── ContactHeader (with filters, search, view toggle)
├── ContactViewSelector
│   ├── GridView
│   │   └── ContactCard ✅ (copy from MNI)
│   ├── ListView
│   │   └── ContactListView ✅ (copy from MNI)
│   └── TableView
│       └── ContactTableView ✅ (copy from MNI)
├── ContactDetailModal ✅
│   ├── BasicInfoTab
│   ├── ContactDetailsTab
│   ├── RelationshipsTab
│   ├── TagsTab
│   └── HistoryTab
├── ContactForm ✅
│   ├── NameFields
│   ├── EmailFields (repeatable)
│   ├── PhoneFields (repeatable)
│   ├── AddressFields (repeatable)
│   ├── OrganizationFields
│   ├── SocialProfileFields
│   └── NotesEditor
├── ImportExport ✅
│   ├── ImportOptions (device-aware)
│   ├── ExportOptions
│   ├── ProgressIndicator
│   └── FilePreview
├── MergeDialog ✅
├── RecycleBin ✅
├── EnhancedCleanupModal ✅
├── ContactBackupRestore ✅
├── InviteModal ✅
└── FamilyTreeImport ✅
```

### Calendar (Phase 3)

```
CalendarPage
├── CalendarHeader (with date navigation, view selector)
├── CalendarViewSelector
│   ├── MonthView 🔲
│   │   └── MonthGrid (with day cells)
│   ├── WeekView 🔲
│   │   └── WeekGrid (with hour slots)
│   ├── DayView 🔲
│   │   └── DayGrid (with hour slots)
│   └── AgendaView 🔲
│       └── EventList
├── CalendarSidebar 🔲
│   ├── MiniCalendar
│   ├── CalendarList
│   │   └── CalendarToggle (per calendar)
│   └── UpcomingEvents
├── EventForm 🔲
│   ├── BasicFields (title, description)
│   ├── DateTimeFields
│   ├── LocationField
│   ├── CategorySelector
│   ├── RecurrenceEditor 🔲
│   ├── AttendeeSelector 🔲
│   ├── NotificationSelector 🔲
│   └── SharingSelector 🔲
└── EventDetail 🔲
```

### Assets Management (Phase 4)

```
AssetsPage
├── AssetHeader (with filters, search, category selector)
├── AssetViewSelector
│   ├── GridView
│   │   └── AssetCard 🔲
│   └── ListView
│       └── AssetItem 🔲
├── AssetForm 🔲
│   ├── BasicFields (name, description)
│   ├── CategorySelector
│   ├── ValueFields (purchase, current)
│   ├── LocationField
│   ├── ConditionRating
│   ├── WarrantyFields
│   ├── MaintenanceSchedule
│   ├── PhotoUpload
│   └── DocumentUpload
├── AssetDetail 🔲
│   ├── PhotoGallery
│   ├── ValueChart
│   ├── MaintenanceLog
│   └── Documents
├── AssetReport 🔲
│   ├── SummaryStats
│   ├── CategoryBreakdown (pie chart)
│   ├── DepreciationTrend
│   └── MaintenanceSchedule
└── MaintenanceManager 🔲
```

### LifeSync-Specific Features (Phase 6)

```
LifeCVPage
├── LifeCVHeader
├── ProfileEditor 🔲
│   ├── PersonalSection
│   ├── ProfessionalSection
│   ├── EducationSection
│   ├── SkillsSection
│   ├── ExperienceSection
│   └── AchievementsSection
├── PublicProfileBuilder 🔲
│   ├── SectionVisibilityToggle
│   ├── ThemeSelector
│   ├── LayoutSelector
│   └── PreviewModal
├── SealDisplay 🔲
│   ├── SealBadges
│   ├── VerificationChain
│   └── SealHistory
└── ExportOptions 🔲

TrustSealPage
├── SealsList 🔲
│   └── SealCard 🔲
├── VerificationStatus 🔲
├── SealAcquisitionGuide 🔲
└── CustomSealManager 🔲

ConnectionsPage
├── ConnectionsList 🔲
│   └── ConnectionCard 🔲
├── ConnectionFilters
├── ConnectionGroups 🔲
├── ConnectionInsights 🔲
└── ActivityFeed 🔲
```

---

## 🔄 Data Flow & Service Integration

### Contact CRUD Flow

```
User Action (UI)
      ↓
ContactForm/ContactCard Component
      ↓
ContactsService.createContact(contact)
      ↓
Input Sanitization (SecurityConfig.sanitizeInput)
      ↓
Validation (SecurityConfig.validateInput)
      ↓
Rate Limiting Check (SecurityConfig.RateLimiter)
      ↓
Firestore Write: /lifesync/{uid}/contacts/{id}
      ↓
Analytics Event (AnalyticsService.trackEvent)
      ↓
UI Update (setState)
      ↓
Success Toast Notification
```

### Import Flow (With Device Detection)

```
User Selects File
      ↓
deviceDetection.isMobileDevice() - Determine UI
      ↓
File Input / Drag-Drop Upload
      ↓
File Validation (SecurityConfig.FILE_UPLOAD_CONFIG)
      ↓
Parse File
  ├─ CSV → Parse as CSV
  ├─ VCF → vcfParser.parseVCFContent()
  └─ JSON → JSON.parse()
      ↓
Convert to Contact[] (parsedContactToContact)
      ↓
Sanitize Each Contact
      ↓
Batch Create in Firestore
      ↓
Backup Created (ContactBackupRestore)
      ↓
Analytics Event Tracked
      ↓
Success Notification with Count
      ↓
Update UI (setContacts)
```

### Search & Filter Flow

```
User Enters Search Term
      ↓
debounce(300ms)
      ↓
SecurityConfig.sanitizeInput() for XSS prevention
      ↓
Rate Limit Check (SearchConfig in SecurityConfig)
      ↓
Client-side Filter + Server Query
      ↓
Results Display
      ↓
Analytics Event (search tracked)
```

---

## 🗄️ Firestore Schema Reference

### Collections Structure

```
lifesync/
├── {uid}/
│   ├── profile/
│   │   └── {uid} (user profile document)
│   │       ├── displayName: string
│   │       ├── email: string
│   │       ├── photoURL: string
│   │       ├── bio: string
│   │       ├── trustScore: number
│   │       └── seals: Seal[]
│   │
│   ├── contacts/
│   │   └── {contactId} (contact documents)
│   │       ├── name: string
│   │       ├── emails: Email[]
│   │       ├── phones: Phone[]
│   │       ├── addresses: Address[]
│   │       ├── tags: string[]
│   │       ├── deleted: boolean
│   │       ├── deletedAt: Timestamp
│   │       ├── createdAt: Timestamp
│   │       ├── updatedAt: Timestamp
│   │       └── // ... other fields
│   │
│   ├── calendars/
│   │   └── {calendarId}
│   │       ├── name: string
│   │       ├── color: string
│   │       ├── events/
│   │       │   └── {eventId}
│   │       │       ├── title: string
│   │       │       ├── startTime: Timestamp
│   │       │       ├── endTime: Timestamp
│   │       │       ├── recurrence: RecurrenceRule (optional)
│   │       │       ├── attendees: Attendee[]
│   │       │       └── notifications: Notification[]
│   │       └── // ... other fields
│   │
│   ├── assets/
│   │   └── {assetId}
│   │       ├── name: string
│   │       ├── category: string
│   │       ├── value: number
│   │       ├── purchaseDate: Timestamp
│   │       ├── maintenance/
│   │       │   └── {maintenanceId}
│   │       │       ├── date: Timestamp
│   │       │       ├── type: string
│   │       │       └── cost: number
│   │       ├── documents/
│   │       │   └── {documentId}
│   │       │       ├── url: string
│   │       │       ├── name: string
│   │       │       └── type: string
│   │       └── // ... other fields
│   │
│   ├── preferences/
│   │   └── {uid}
│   │       ├── theme: 'light' | 'dark'
│   │       ├── sidebarCollapsed: boolean
│   │       ├── defaultView: string
│   │       └── notifications: NotificationPrefs
│   │
│   └── backups/
│       └── {backupId}
│           ├── type: string
│           ├── timestamp: Timestamp
│           ├── data: object
│           └── status: string
│
└── sharedData/
    ├── publicProfiles/
    │   └── {profileId}
    │       ├── displayName: string
    │       ├── photoURL: string
    │       ├── isPublic: boolean
    │       ├── sections: {[key]: visible}
    │       └── viewCount: number
    │
    └── seals/
        └── {sealId}
            ├── name: string
            ├── grantedTo: string[]
            ├── verificationDate: Timestamp
            └── status: string
```

---

## 🔌 Service Integration Points

### ContactsService Methods

```typescript
// Basic CRUD
getContacts(userId: string): Promise<Contact[]>
getContact(userId: string, contactId: string): Promise<Contact>
createContact(userId: string, contact: Contact): Promise<Contact>
updateContact(userId: string, contactId: string, updates: Partial<Contact>): Promise<void>
deleteContact(userId: string, contactId: string, soft: true): Promise<void>
restoreContact(userId: string, contactId: string): Promise<void>
permanentlyDeleteContact(userId: string, contactId: string): Promise<void>

// Search & Filter
searchContacts(userId: string, query: string): Promise<Contact[]>
filterContacts(userId: string, filters: ContactFilters): Promise<Contact[]>

// Bulk Operations
bulkCreateContacts(userId: string, contacts: Contact[]): Promise<Contact[]>
bulkUpdateContacts(userId: string, updates: {id: string, data: Partial<Contact>}[]): Promise<void>
bulkDeleteContacts(userId: string, contactIds: string[], soft: true): Promise<void>

// Import/Export
importContacts(userId: string, format: 'csv' | 'vcf' | 'json', data: string): Promise<{success: Contact[], failed: ImportError[]}>
exportContacts(userId: string, format: 'csv' | 'vcf' | 'json', contactIds?: string[]): Promise<string>

// Backup/Restore
createBackup(userId: string): Promise<Backup>
restoreFromBackup(userId: string, backupId: string): Promise<void>
getBackups(userId: string): Promise<Backup[]>

// Recycle Bin
getDeletedContacts(userId: string): Promise<Contact[]>
emptyRecycleBin(userId: string, beforeDate?: Timestamp): Promise<number>
```

### CalendarService Methods (To Create)

```typescript
// Calendar management
getCalendars(userId: string): Promise<Calendar[]>
createCalendar(userId: string, calendar: Calendar): Promise<Calendar>
updateCalendar(userId: string, calendarId: string, updates: Partial<Calendar>): Promise<void>
deleteCalendar(userId: string, calendarId: string): Promise<void>

// Events
getEvents(userId: string, calendarId: string, dateRange?: {start: Date, end: Date}): Promise<Event[]>
createEvent(userId: string, calendarId: string, event: Event): Promise<Event>
updateEvent(userId: string, calendarId: string, eventId: string, updates: Partial<Event>): Promise<void>
deleteEvent(userId: string, calendarId: string, eventId: string): Promise<void>
deleteRecurringSeries(userId: string, calendarId: string, eventId: string): Promise<void>

// Sharing
shareCalendar(userId: string, calendarId: string, sharedWith: {userId: string, permission: string}): Promise<void>
updateCalendarPermission(userId: string, calendarId: string, targetUserId: string, permission: string): Promise<void>
revokeCalendarAccess(userId: string, calendarId: string, targetUserId: string): Promise<void>

// Notifications
setEventNotifications(userId: string, eventId: string, notifications: Notification[]): Promise<void>
```

### AssetService Methods (To Create)

```typescript
// Asset management
getAssets(userId: string): Promise<Asset[]>
createAsset(userId: string, asset: Asset): Promise<Asset>
updateAsset(userId: string, assetId: string, updates: Partial<Asset>): Promise<void>
deleteAsset(userId: string, assetId: string, archive: boolean): Promise<void>

// Valuation
updateAssetValue(userId: string, assetId: string, currentValue: number): Promise<void>
getAssetValue(userId: string): Promise<number>
getAssetValueByCategory(userId: string): Promise<{[category: string]: number}>

// Maintenance
addMaintenance(userId: string, assetId: string, maintenance: Maintenance): Promise<void>
getMaintenanceDue(userId: string, daysAhead: number): Promise<Asset[]>

// Documents
addAssetDocument(userId: string, assetId: string, document: Document): Promise<void>
getAssetDocuments(userId: string, assetId: string): Promise<Document[]>

// Analytics
getAssetReport(userId: string): Promise<AssetReport>
getDepreciationTrend(userId: string, assetId: string): Promise<DepreciationData[]>
```

### AnalyticsService Enhanced (Already Phase 3B)

```typescript
// Event tracking
trackEvent(eventName: string, eventData: Record<string, any>): void
trackPageView(pageName: string): void
trackError(errorCode: string, errorMessage: string): void

// User properties
setUserProperties(properties: Record<string, any>): void
setUserId(userId: string): void

// Batch events
batchTrackEvents(events: TrackingEvent[]): Promise<void>

// Custom dimensions
addCustomDimension(dimensionName: string, value: string): void
```

---

## 📦 External Dependencies

### Required NPM Packages (Likely Already in MNI)

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "firebase": "^10.0.0",
    "framer-motion": "^10.0.0",
    "lucide-react": "^0.263.0",
    "tailwindcss": "^3.0.0",
    "react-hot-toast": "^2.4.0",
    "zustand": "^4.4.0",
    "react-window": "^1.8.0",
    "@hookform/resolvers": "^3.0.0",
    "react-hook-form": "^7.0.0",
    "clsx": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "@testing-library/react": "^14.0.0",
    "vitest": "^0.34.0"
  }
}
```

### Optional Packages to Add (If Not Already Present)

```json
{
  "react-big-calendar": "^1.8.0",      // For calendar component
  "date-fns": "^2.30.0",                // For date manipulation
  "react-datepicker": "^4.0.0",         // For date picker
  "chart.js": "^4.0.0",                 // For asset analytics
  "react-chartjs-2": "^5.0.0",          // React wrapper for charts
  "react-query": "^3.39.0",             // Caching for API calls
  "zustand": "^4.4.0"                   // State management (if not present)
}
```

---

## 🔐 Security & Permissions

### Firestore Security Rules (For LifeSync)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // LifeSync user data
    match /lifesync/{uid} {
      // Users can read/write their own data
      allow read, write: if request.auth.uid == uid;
      
      // Shared contacts - read only for shared users
      match /contacts/{contactId} {
        allow read: if request.auth.uid == uid 
                    || uid in resource.data.sharedWith;
        allow write: if request.auth.uid == uid;
      }
      
      // Shared calendars
      match /calendars/{calendarId} {
        allow read: if request.auth.uid == uid 
                    || calendarId in resource.data.sharedWith;
        match /events/{eventId} {
          allow read: if request.auth.uid == uid;
        }
      }
    }
    
    // Public profiles
    match /sharedData/publicProfiles/{profileId} {
      allow read: if resource.data.isPublic == true;
      allow write: if request.auth.uid == resource.data.userId;
    }
  }
}
```

### Input Validation (SecurityConfig)

```typescript
// Already implemented in Phase 3B
✅ Email validation: RFC 5322
✅ Phone validation: International format
✅ Name validation: Unicode, special chars allowed
✅ URL validation: Valid URI format
✅ Bio/Notes: HTML sanitization

// XSS Prevention
✅ HTML escaping
✅ Script tag removal
✅ Event handler stripping
✅ Attribute sanitization
```

---

## 📱 Responsive Breakpoints

### Used Throughout Components

```css
/* Mobile First */
Mobile:         < 640px   (sm)
Tablet:         640px - 1023px (md)
Desktop:        >= 1024px (lg)
Large Desktop:  >= 1536px (xl)

/* Common Media Queries in Components */
@media (max-width: 768px) {
  /* Mobile/Tablet styles */
}

@media (min-width: 769px) {
  /* Desktop and above */
}
```

### Component Responsive Behavior

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Sidebar | Hidden (drawer) | Collapsible | Fixed |
| Dashboard | 1 column | 2 columns | 3+ columns |
| Contact List | Full width | 2 per row | 3 per row |
| Calendar | Single day | Week | Month |
| Modals | Full screen | Centered | Centered |

---

## 🧩 Reusable Patterns

### Form Pattern (Used in ContactForm, EventForm, AssetForm)

```typescript
interface FormProps {
  initialData?: T
  onSubmit: (data: T) => Promise<void>
  onCancel: () => void
}

const Form: React.FC<FormProps> = ({initialData, onSubmit, onCancel}) => {
  const [data, setData] = useState<T>(initialData || {})
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Validate
    // Sanitize
    // Submit
    // Show toast
    // Close modal
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {/* Error messages */}
      {/* Submit button */}
    </form>
  )
}
```

### Modal Pattern (Used in ContactDetailModal, EventDetail, AssetDetail)

```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  data: T
}

const Modal: React.FC<ModalProps> = ({isOpen, onClose, data}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <motion.div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{data.name}</h2>
          <button onClick={onClose}>×</button>
        </div>
        <div className="p-6">
          {/* Content */}
        </div>
      </motion.div>
    </div>
  )
}
```

### List Pattern (Used in ContactsList, EventsList, AssetsList)

```typescript
interface ListProps {
  items: T[]
  loading: boolean
  onSelect: (item: T) => void
}

const List: React.FC<ListProps> = ({items, loading, onSelect}) => {
  const [page, setPage] = useState(1)
  const itemsPerPage = 20
  
  const paginated = items.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )

  return (
    <div className="space-y-4">
      {loading ? <LoadingSkeleton /> : null}
      {paginated.map(item => (
        <ItemCard key={item.id} item={item} onClick={onSelect} />
      ))}
      <Pagination 
        page={page}
        totalPages={Math.ceil(items.length / itemsPerPage)}
        onPageChange={setPage}
      />
    </div>
  )
}
```

---

## ✅ Implementation Checklist

### Pre-Implementation
- [ ] Copy all required files from MNI
- [ ] Update Firestore schema
- [ ] Configure Firebase rules
- [ ] Set up authentication
- [ ] Install any missing dependencies

### Per Phase
- [ ] Create all necessary components
- [ ] Implement services
- [ ] Connect to Firestore
- [ ] Add analytics events
- [ ] Test responsiveness
- [ ] Verify security
- [ ] Performance check
- [ ] Accessibility audit

### Post-Implementation
- [ ] Comprehensive testing
- [ ] Documentation updates
- [ ] Code review
- [ ] Staging deployment
- [ ] Production deployment
- [ ] Monitor analytics
- [ ] Gather user feedback

---

**This document serves as a reference throughout implementation.** ✅

**Next: Begin PHASE 1 with LIFESYNC_IMPLEMENTATION_QUICK_REFERENCE.md**

---

**Last Updated**: October 27, 2025  
**Version**: 1.0
