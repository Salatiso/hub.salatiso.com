# Widget Framework - Phase 2.3

## Overview

The Widget Framework provides a consistent, reusable pattern for creating dashboard widgets in LifeSync. All widgets follow a standardized structure for maximum code reuse and maintainability.

## Core Components

### 1. WidgetCard (Base Component)
Location: `src/components/widgets/WidgetCard.jsx`

The foundation component for all widgets with:
- **Header**: Icon + title + actions menu
- **Content**: Flexible content area
- **Actions**: Dropdown menu for widget-specific actions
- **Styling**: Consistent dark mode support and hover effects

#### Props
```javascript
{
  icon: React.Component,      // lucide-react icon component
  title: string,              // Widget title
  children: React.Node,       // Widget content
  actions: Array,             // Action menu items
  className: string,          // Additional CSS classes
  headerClassName: string,    // Header-specific classes
  contentClassName: string,   // Content-specific classes
}
```

#### Action Item Format
```javascript
{
  label: string,              // Action label
  icon: React.Component,      // lucide-react icon
  onClick: Function,          // Click handler
}
```

#### Example Usage
```javascript
import WidgetCard from './WidgetCard';
import { Settings, RefreshCw } from 'lucide-react';

<WidgetCard
  icon={Settings}
  title="My Widget"
  actions={[
    { label: 'Refresh', icon: RefreshCw, onClick: () => {} },
    { label: 'Settings', icon: Settings, onClick: () => {} }
  ]}
>
  {/* Widget content here */}
</WidgetCard>
```

## Widget Pattern

All dashboard widgets follow this standardized pattern:

### 1. File Structure
```
src/components/widgets/
├── WidgetCard.jsx
├── [WidgetName]Widget.jsx     // Actual widget
├── index.js                   // Export index
└── ...
```

### 2. Widget Component Template
```javascript
/**
 * [WidgetName]Widget Component
 * Displays [description of what this widget shows]
 * 
 * Features:
 * - [Feature 1]
 * - [Feature 2]
 */

import { useState } from 'react';
import { [Icons] } from 'lucide-react';
import WidgetCard from './WidgetCard';

const [WidgetName]Widget = () => {
  const [state, setState] = useState(initialValue);

  return (
    <WidgetCard
      icon={PrimaryIcon}
      title="Widget Title"
      actions={[
        {
          label: 'Action',
          icon: ActionIcon,
          onClick: () => { /* Handler */ },
        },
      ]}
    >
      {/* Content goes here */}
    </WidgetCard>
  );
};

export default [WidgetName]Widget;
```

### 3. Widget Characteristics

#### Always Include:
- ✅ Clear JSDoc documentation
- ✅ Descriptive display name and features
- ✅ Consistent file naming (e.g., `ProfileWidget.jsx`)
- ✅ WidgetCard wrapper with icon and title
- ✅ Dark mode support (inherited from WidgetCard)
- ✅ Default export

#### Content Guidelines:
- **Keep it focused**: One primary purpose per widget
- **Use real or mock data**: Display actual data or realistic mock data
- **Show status**: Include indicators (loading, error, success states)
- **Provide actions**: Include actionable buttons or links
- **Responsive design**: Works on mobile, tablet, desktop

#### Action Menu:
- Maximum 3-4 actions per widget
- Use relevant lucide-react icons
- Include primary action as main button
- Secondary actions in menu (... button)

## Widget Types

### 1. **Display Widgets**
Show data without direct editing
- Example: ProfileWidget, HealthWidget
- Content: Read-only information display
- Actions: View more, refresh, export

### 2. **Interactive Widgets**
Allow data input and manipulation
- Example: CalendarWidget (with event add), ContactsWidget
- Content: List + action buttons
- Actions: Add, edit, delete, filter

### 3. **Status Widgets**
Show current status and indicators
- Example: TrustScoreWidget, VerificationWidget
- Content: Status indicators, progress bars
- Actions: Update status, view details

### 4. **Feed Widgets**
Display streams of activity/updates
- Example: ActivityFeedWidget, NotificationsWidget
- Content: Chronological item list
- Actions: Filter, mark as read, archive

## Styling Conventions

### Colors (Tailwind)
```
Primary:    blue-600/blue-700
Success:    green-600/green-700
Warning:    yellow-600/yellow-700
Error:      red-600/red-700
Info:       indigo-600/indigo-700
Neutral:    gray-600/gray-700
```

### Spacing
- **Widget padding**: `p-4`
- **Content gaps**: `space-y-3` or `space-x-3`
- **Item padding**: `px-3 py-2`
- **Card gaps**: `gap-4`

### Common Classes
```javascript
// Container
'bg-white dark:bg-gray-800 rounded-lg shadow'

// Text
'text-gray-900 dark:text-white'

// Button
'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg'

// Hover effect
'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
```

## Data Handling

### Mock Data Pattern
```javascript
// Use realistic mock data
const mockData = [
  { id: 1, name: 'Item 1', status: 'active' },
  { id: 2, name: 'Item 2', status: 'inactive' },
];
```

### Real Data Pattern
```javascript
// In Phase 3, connect to Firebase/API
const [data, setData] = useState([]);

useEffect(() => {
  fetchDataFromAPI().then(setData);
}, []);
```

### State Management
- Use `useState` for local widget state
- Use `useContext` for global data (GuestContext)
- Use `useCallback` for event handlers
- Use `useMemo` for computed values

## Common Widget Patterns

### 1. List + Actions
```javascript
<WidgetCard icon={ListIcon} title="Items">
  <div className="space-y-2">
    {items.map(item => (
      <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
        <span>{item.name}</span>
        <button>→</button>
      </div>
    ))}
  </div>
  <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded">
    View All
  </button>
</WidgetCard>
```

### 2. Stats Display
```javascript
<WidgetCard icon={StatsIcon} title="Statistics">
  <div className="grid grid-cols-3 gap-4">
    {stats.map(stat => (
      <div key={stat.id} className="text-center">
        <div className="text-2xl font-bold">{stat.value}</div>
        <div className="text-sm text-gray-600">{stat.label}</div>
      </div>
    ))}
  </div>
</WidgetCard>
```

### 3. Progress Tracker
```javascript
<WidgetCard icon={ProgressIcon} title="Progress">
  {items.map(item => (
    <div key={item.id} className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{item.name}</span>
        <span className="text-sm">{item.progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full"
          style={{ width: `${item.progress}%` }}
        />
      </div>
    </div>
  ))}
</WidgetCard>
```

### 4. Form Input
```javascript
<WidgetCard icon={FormIcon} title="New Item">
  <form onSubmit={handleSubmit} className="space-y-3">
    <input 
      type="text" 
      placeholder="Name"
      className="w-full px-3 py-2 border rounded"
    />
    <button 
      type="submit"
      className="w-full px-4 py-2 bg-blue-600 text-white rounded"
    >
      Submit
    </button>
  </form>
</WidgetCard>
```

## Export Pattern

### Individual Widget Export
```javascript
// src/components/widgets/ProfileWidget.jsx
export default ProfileWidget;
```

### Central Index Export
```javascript
// src/components/widgets/index.js
export { default as WidgetCard } from './WidgetCard';
export { default as ProfileWidget } from './ProfileWidget';
export { default as HealthWidget } from './HealthWidget';
// ... etc
```

## Testing Widget

### Manual Testing
1. Render widget in Dashboard
2. Check dark mode support
3. Test responsive sizes (mobile, tablet, desktop)
4. Verify actions menu works
5. Check console for errors

### Props Testing
```javascript
// Test with different props
<MyWidget title="Custom Title" />
<MyWidget icon={CustomIcon} />
<MyWidget actions={[...]} />
```

## Best Practices

✅ **Do:**
- Use WidgetCard for all widgets
- Keep widgets focused and simple
- Support dark mode (WidgetCard handles this)
- Use lucide-react icons
- Provide meaningful actions
- Use mock data initially
- Document component purpose

❌ **Don't:**
- Skip WidgetCard wrapper
- Make widgets too complex (split if needed)
- Hardcode colors (use Tailwind classes)
- Forget to export in index.js
- Leave console errors
- Mix real and mock data

## Performance Considerations

- Use `useMemo` for expensive computations
- Use `useCallback` for event handlers
- Lazy load widget content if needed (Phase 3)
- Optimize re-renders with proper dependencies

## Accessibility

- Include `aria-label` on buttons
- Use semantic HTML elements
- Ensure color contrast meets WCAG AA
- Test with keyboard navigation
- Include `title` attributes where helpful

## Example Complete Widget

```javascript
/**
 * StatsWidget Component
 * Displays key statistics and metrics
 */

import { useState, useMemo } from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';
import WidgetCard from './WidgetCard';

const StatsWidget = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data
  const stats = useMemo(() => [
    { id: 1, label: 'Total', value: 1240, change: '+12%' },
    { id: 2, label: 'Active', value: 856, change: '+5%' },
    { id: 3, label: 'Pending', value: 384, change: '-2%' },
  ], []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <WidgetCard
      icon={TrendingUp}
      title="Statistics"
      actions={[
        { label: 'Refresh', icon: RefreshCw, onClick: handleRefresh }
      ]}
    >
      <div className="grid grid-cols-3 gap-4">
        {stats.map(stat => (
          <div key={stat.id} className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </div>
            <div className="text-xs text-green-600 mt-1">
              {stat.change}
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};

export default StatsWidget;
```

---

## Summary

The Widget Framework provides:
- ✅ Consistent component structure
- ✅ Reusable WidgetCard base
- ✅ Dark mode support out-of-the-box
- ✅ Action menu pattern
- ✅ Responsive design
- ✅ Scalable architecture

**All future widgets should follow this pattern.**

---

**Phase 2.3 Status**: Framework Created and Documented
**Ready for**: Phase 2.4 - Core Widgets Implementation
