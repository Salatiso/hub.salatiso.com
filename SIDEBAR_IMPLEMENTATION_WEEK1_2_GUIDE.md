# LifeSync Enhanced Sidebar Navigation - Implementation Quick Start
## Phase 0 Detailed Technical Guide (Weeks 1-2)

**Date:** October 26, 2025  
**Priority:** CRITICAL - Phase 0 Foundation  
**Estimated Effort:** 80 hours over 2 weeks  
**Status:** Ready for Immediate Implementation

---

## 📋 Week 1 Checklist: Foundation & Architecture

### Day 1-2: Setup & Configuration

#### Task 1.1: Create Navigation Config File
**File:** `src/config/navigation.config.ts`

```typescript
// src/config/navigation.config.ts
import {
  BarChart3, User, Users, Heart, Briefcase, MapPin, AlertTriangle,
  Settings, LogOut, Zap, FileText, TrendingUp, Calendar, Package,
  Building, Network, Globe, Lightbulb, Beaker, Phone, ArrowUpRight
} from 'lucide-react';

export interface NavItem {
  label: string;
  icon: string; // Icon name from lucide-react
  path: string;
  badge?: {
    text: string;
    type: 'core' | 'mesh' | 'mni' | 'external' | 'new';
  };
  external?: boolean;
  description?: string;
}

export interface NavSection {
  id: string;
  label: string;
  icon: string;
  items: NavItem[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface BottomItem {
  label: string;
  icon: string;
  path: string;
  action?: string;
  divider?: boolean;
}

// MAIN NAVIGATION STRUCTURE
export const NAV_STRUCTURE: NavSection[] = [
  // Standalone Dashboard
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'BarChart3',
    items: [
      {
        label: 'Dashboard',
        icon: 'BarChart3',
        path: '/dashboard'
      }
    ],
    collapsible: false,
    defaultExpanded: true
  },

  // PERSONAL CONTEXT
  {
    id: 'personal',
    label: 'Personal',
    icon: 'User',
    collapsible: true,
    defaultExpanded: true,
    items: [
      {
        label: 'My Profile',
        icon: 'User',
        path: '/profile',
        description: 'Personal profile and identity'
      },
      {
        label: 'LifeCV',
        icon: 'FileText',
        path: '/lifecv',
        badge: { text: 'Core', type: 'core' },
        description: 'Your LifeCV profile'
      },
      {
        label: 'My Contacts',
        icon: 'Users',
        path: '/contacts',
        description: 'Manage your contacts'
      },
      {
        label: 'My Calendar',
        icon: 'Calendar',
        path: '/calendar?context=individual',
        description: 'Personal events and schedule'
      },
      {
        label: 'My Assets',
        icon: 'Package',
        path: '/assets?context=individual',
        description: 'Personal items and property'
      },
      {
        label: 'My Projects',
        icon: 'Briefcase',
        path: '/projects?context=individual',
        description: 'Personal projects and goals'
      },
      {
        label: 'Career Pathways',
        icon: 'TrendingUp',
        path: '/career-paths',
        description: 'Career development tracking'
      }
    ]
  },

  // FAMILY CONTEXT
  {
    id: 'family',
    label: 'Family',
    icon: 'Users',
    collapsible: true,
    defaultExpanded: false,
    items: [
      {
        label: 'Family Dashboard',
        icon: 'Heart',
        path: '/family',
        description: 'Family overview and status'
      },
      {
        label: 'Family Tree',
        icon: 'Users',
        path: '/family/tree',
        description: 'View your family connections'
      },
      {
        label: 'Family Timeline',
        icon: 'Calendar',
        path: '/family/timeline',
        description: 'Family milestones and history'
      },
      {
        label: 'Household Members',
        icon: 'Home',
        path: '/contacts?filter=household',
        description: 'People in your household'
      },
      {
        label: 'Family Calendar',
        icon: 'Calendar',
        path: '/calendar?context=family',
        description: 'Shared family events'
      },
      {
        label: 'Family Assets',
        icon: 'Package',
        path: '/assets?context=family',
        description: 'Household property and items'
      },
      {
        label: 'Family Projects',
        icon: 'Briefcase',
        path: '/projects?context=family',
        description: 'Family goals and tasks'
      },
      {
        label: 'Family Values',
        icon: 'ArrowUpRight',
        path: 'https://familyvalue-lifecv.web.app/',
        external: true,
        badge: { text: 'External', type: 'external' },
        description: 'Family Value ecosystem app'
      }
    ]
  },

  // PROFESSIONAL CONTEXT
  {
    id: 'professional',
    label: 'Professional',
    icon: 'Briefcase',
    collapsible: true,
    defaultExpanded: false,
    items: [
      {
        label: 'Business Dashboard',
        icon: 'BarChart3',
        path: 'https://bizhelp-lifecv.web.app/',
        external: true,
        badge: { text: 'External', type: 'external' },
        description: 'Business operations'
      },
      {
        label: 'Business Operations',
        icon: 'Briefcase',
        path: '/business/operations',
        description: 'Day-to-day business tasks'
      },
      {
        label: 'Business Organogram',
        icon: 'Network',
        path: '/business/organogram',
        description: 'Organization structure'
      },
      {
        label: 'Business Plan',
        icon: 'FileText',
        path: '/business/plan',
        description: 'Strategic planning'
      },
      {
        label: 'Professional Calendar',
        icon: 'Calendar',
        path: '/calendar?context=professional',
        description: 'Work events and meetings'
      },
      {
        label: 'Business Assets',
        icon: 'Package',
        path: '/assets?context=professional',
        description: 'Company property and equipment'
      },
      {
        label: 'Business Projects',
        icon: 'Briefcase',
        path: '/projects?context=professional',
        description: 'Business initiatives'
      }
    ]
  },

  // COMMUNITIES CONTEXT
  {
    id: 'communities',
    label: 'Communities (Sonny)',
    icon: 'Globe',
    collapsible: true,
    defaultExpanded: false,
    items: [
      {
        label: 'My Networks',
        icon: 'Network',
        path: '/networks',
        description: 'Your personal networks'
      },
      {
        label: 'Sonny Network',
        icon: 'Zap',
        path: '/sonny',
        badge: { text: 'Mesh', type: 'mesh' },
        description: 'Mesh networking community'
      },
      {
        label: 'Community Calendar',
        icon: 'Calendar',
        path: '/calendar?context=community',
        description: 'Community events'
      },
      {
        label: 'PigeeBack',
        icon: 'ArrowUpRight',
        path: 'https://pigeeback-lifecv.web.app/',
        external: true,
        badge: { text: 'External', type: 'external' },
        description: 'Transportation safety'
      },
      {
        label: 'Ekhaya Communities',
        icon: 'Building',
        path: '/communities/ekhaya',
        description: 'Location-based communities'
      },
      {
        label: 'LifeSync Groups',
        icon: 'ArrowUpRight',
        path: 'https://lifesync-lifecv.web.app/',
        external: true,
        badge: { text: 'External', type: 'external' },
        description: 'LifeSync community'
      }
    ]
  },

  // COMMON TOOLS
  {
    id: 'commonTools',
    label: 'Common Tools',
    icon: 'Zap',
    collapsible: true,
    defaultExpanded: false,
    items: [
      {
        label: 'Assets Register',
        icon: 'Package',
        path: '/assets',
        description: 'All assets across contexts'
      },
      {
        label: 'Reporting',
        icon: 'BarChart3',
        path: '/reporting',
        description: 'Generate reports'
      },
      {
        label: 'Analytics',
        icon: 'BarChart3',
        path: '/analytics',
        description: 'View analytics and metrics'
      },
      {
        label: 'Toolkit',
        icon: 'Zap',
        path: '/toolkit',
        description: 'Utilities and tools'
      },
      {
        label: 'Sazi Academy',
        icon: 'ArrowUpRight',
        path: 'https://sazi-life-academy.web.app/',
        external: true,
        badge: { text: 'External', type: 'external' },
        description: 'Educational platform'
      },
      {
        label: 'Sync Control',
        icon: 'Zap',
        path: '/sync-control',
        badge: { text: 'MNI', type: 'mni' },
        description: 'Ecosystem sync control'
      }
    ]
  }
];

// BOTTOM ITEMS (FIXED)
export const BOTTOM_ITEMS: BottomItem[] = [
  {
    label: 'Innovation Lab',
    icon: 'Lightbulb',
    path: '/innovation'
  },
  {
    label: 'Beta Testing',
    icon: 'Beaker',
    path: '/beta'
  },
  {
    label: 'Settings',
    icon: 'Settings',
    path: '/settings'
  },
  {
    label: 'Divider',
    icon: '',
    path: '',
    divider: true
  },
  {
    label: 'Logout',
    icon: 'LogOut',
    path: '/logout',
    action: 'logout'
  }
];

// BADGE STYLES
export const BADGE_STYLES = {
  core: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  mesh: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  mni: 'bg-green-500/20 text-green-400 border border-green-500/30',
  external: 'bg-slate-600/50 text-slate-300 border border-slate-500/30',
  new: 'bg-red-500/20 text-red-400 border border-red-500/30'
};

// COLOR PALETTE
export const COLORS = {
  background: 'bg-slate-800/95',
  border: 'border-slate-700',
  text: {
    primary: 'text-white',
    secondary: 'text-slate-300',
    muted: 'text-slate-400'
  },
  hover: 'hover:bg-slate-700/50',
  active: 'bg-slate-700',
  focus: 'focus:outline-2 focus:outline-offset-2 focus:outline-blue-500'
};
```

---

#### Task 1.2: Create TypeScript Types File
**File:** `src/types/navigation.types.ts`

```typescript
// src/types/navigation.types.ts
import { LucideIcon } from 'lucide-react';

export interface NavBadge {
  text: string;
  type: 'core' | 'mesh' | 'mni' | 'external' | 'new';
}

export interface NavItem {
  label: string;
  icon: LucideIcon | string;
  path: string;
  badge?: NavBadge;
  external?: boolean;
  description?: string;
}

export interface NavSection {
  id: string;
  label: string;
  icon: LucideIcon | string;
  items: NavItem[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface NavigationState {
  expandedSections: Record<string, boolean>;
  activeItem: string | null;
  mobileOpen: boolean;
}

export interface NavigationContextType {
  state: NavigationState;
  toggleSection: (sectionId: string) => void;
  setActiveItem: (itemPath: string) => void;
  setMobileOpen: (open: boolean) => void;
}
```

---

### Day 3: Create Navigation Hook

#### Task 1.3: Create useNavigation Hook
**File:** `src/hooks/useNavigation.ts`

```typescript
// src/hooks/useNavigation.ts
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { NavigationState } from '../types/navigation.types';

const STORAGE_KEY = 'lifesync_navigation_state';
const DEFAULT_EXPANDED_SECTIONS = {
  dashboard: true,
  personal: true,
  family: false,
  professional: false,
  communities: false,
  commonTools: false
};

export const useNavigation = () => {
  const location = useLocation();
  const [state, setState] = useState<NavigationState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          expandedSections: parsed.expandedSections || DEFAULT_EXPANDED_SECTIONS,
          activeItem: null,
          mobileOpen: false
        };
      }
    } catch (e) {
      console.error('Failed to load navigation state:', e);
    }

    return {
      expandedSections: DEFAULT_EXPANDED_SECTIONS,
      activeItem: null,
      mobileOpen: false
    };
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      expandedSections: state.expandedSections
    }));
  }, [state.expandedSections]);

  // Update active item based on current route
  useEffect(() => {
    setState(prev => ({
      ...prev,
      activeItem: location.pathname
    }));
  }, [location.pathname]);

  const toggleSection = useCallback((sectionId: string) => {
    setState(prev => ({
      ...prev,
      expandedSections: {
        ...prev.expandedSections,
        [sectionId]: !prev.expandedSections[sectionId]
      }
    }));
  }, []);

  const setActiveItem = useCallback((itemPath: string) => {
    setState(prev => ({
      ...prev,
      activeItem: itemPath
    }));
  }, []);

  const setMobileOpen = useCallback((open: boolean) => {
    setState(prev => ({
      ...prev,
      mobileOpen: open
    }));
  }, []);

  return {
    state,
    toggleSection,
    setActiveItem,
    setMobileOpen
  };
};
```

---

### Day 4: Create Navigation Components

#### Task 1.4: Create Main Sidebar Component
**File:** `src/components/navigation/Sidebar.tsx`

```typescript
// src/components/navigation/Sidebar.tsx
import { useState } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useNavigation } from '../../hooks/useNavigation';
import { NAV_STRUCTURE, BOTTOM_ITEMS, COLORS } from '../../config/navigation.config';
import NavSection from './NavSection';
import BottomNav from './BottomNav';
import { Menu, X } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const { state, toggleSection, setMobileOpen } = useNavigation();

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Sidebar Overlay (Mobile) */}
      {isMobile && state.mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          ${COLORS.background}
          fixed left-0 top-0 h-screen w-72 border-r ${COLORS.border}
          overflow-y-auto
          transition-transform duration-300 ease-in-out
          z-40
          ${isMobile && !state.mobileOpen ? '-translate-x-full' : 'translate-x-0'}
          ${className}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">LifeSync</h2>
          {isMobile && (
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-700"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5 text-slate-300" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="py-4">
          {NAV_STRUCTURE.map((section) => (
            <NavSection
              key={section.id}
              section={section}
              isExpanded={state.expandedSections[section.id] || false}
              onToggle={() => toggleSection(section.id)}
            />
          ))}
        </nav>

        {/* Bottom Items */}
        <BottomNav items={BOTTOM_ITEMS} onClose={() => setMobileOpen(false)} />
      </aside>
    </>
  );
};

export default Sidebar;
```

---

#### Task 1.5: Create NavSection Component
**File:** `src/components/navigation/NavSection.tsx`

```typescript
// src/components/navigation/NavSection.tsx
import { ChevronRight } from 'lucide-react';
import { NavSection as NavSectionType } from '../../types/navigation.types';
import NavItem from './NavItem';
import { COLORS } from '../../config/navigation.config';
import * as Icons from 'lucide-react';

interface NavSectionProps {
  section: NavSectionType;
  isExpanded: boolean;
  onToggle: () => void;
}

export const NavSection: React.FC<NavSectionProps> = ({
  section,
  isExpanded,
  onToggle
}) => {
  const IconComponent = (Icons as any)[section.icon] || Icons.ChevronRight;

  if (!section.collapsible) {
    // Non-collapsible section (like Dashboard)
    return (
      <div className="px-3 py-2">
        {section.items.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="px-2 py-1">
      {/* Section Header/Toggle */}
      <button
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        className={`
          w-full flex items-center gap-2 px-3 py-2 rounded-lg
          ${COLORS.hover}
          transition-colors
          text-sm font-medium
          ${isExpanded ? COLORS.active : COLORS.text.secondary}
        `}
        aria-expanded={isExpanded}
        aria-controls={`section-${section.id}`}
        aria-label={`Toggle ${section.label}`}
      >
        <IconComponent className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1 text-left">{section.label}</span>
        <ChevronRight
          className={`
            w-4 h-4 flex-shrink-0 transition-transform
            ${isExpanded ? 'rotate-90' : ''}
          `}
          aria-hidden="true"
        />
      </button>

      {/* Section Items */}
      {isExpanded && (
        <div
          id={`section-${section.id}`}
          role="region"
          aria-labelledby={`section-${section.id}-heading`}
          className="mt-1 ml-2 space-y-1 border-l border-slate-700"
        >
          {section.items.map((item) => (
            <NavItem key={item.path} item={item} nested />
          ))}
        </div>
      )}
    </div>
  );
};

export default NavSection;
```

---

#### Task 1.6: Create NavItem Component
**File:** `src/components/navigation/NavItem.tsx`

```typescript
// src/components/navigation/NavItem.tsx
import { Link, useLocation } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { NavItem as NavItemType } from '../../types/navigation.types';
import SectionBadge from './SectionBadge';
import { COLORS } from '../../config/navigation.config';
import * as Icons from 'lucide-react';

interface NavItemProps {
  item: NavItemType;
  nested?: boolean;
}

export const NavItem: React.FC<NavItemProps> = ({ item, nested = false }) => {
  const location = useLocation();
  const IconComponent = (Icons as any)[item.icon] || Icons.ChevronRight;

  // Extract path without query params for comparison
  const basePathname = item.path.split('?')[0];
  const isActive = location.pathname === basePathname;

  const itemClasses = `
    flex items-center gap-2 px-3 py-2 rounded-lg
    transition-all duration-150
    ${isActive
      ? `${COLORS.active} ${COLORS.text.primary} font-medium`
      : `${COLORS.text.secondary} ${COLORS.hover}`
    }
    ${nested ? 'ml-4 text-sm' : ''}
    hover:translate-x-0.5
  `;

  const content = (
    <>
      <IconComponent className={`flex-shrink-0 ${nested ? 'w-4 h-4' : 'w-5 h-5'}`} />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && <SectionBadge badge={item.badge} />}
      {item.external && <ExternalLink className="w-3 h-3 flex-shrink-0" />}
    </>
  );

  if (item.external) {
    return (
      <a
        href={item.path}
        target="_blank"
        rel="noopener noreferrer"
        className={itemClasses}
        title={item.description}
        aria-label={`${item.label} (opens in new window)`}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      to={item.path}
      className={itemClasses}
      title={item.description}
      aria-current={isActive ? 'page' : undefined}
    >
      {content}
    </Link>
  );
};

export default NavItem;
```

---

#### Task 1.7: Create SectionBadge Component
**File:** `src/components/navigation/SectionBadge.tsx`

```typescript
// src/components/navigation/SectionBadge.tsx
import { NavBadge } from '../../types/navigation.types';
import { BADGE_STYLES } from '../../config/navigation.config';

interface SectionBadgeProps {
  badge: NavBadge;
}

export const SectionBadge: React.FC<SectionBadgeProps> = ({ badge }) => {
  const styles = BADGE_STYLES[badge.type] || BADGE_STYLES.external;

  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
        whitespace-nowrap
        ${styles}
      `}
      aria-label={`${badge.text} feature`}
    >
      {badge.text}
    </span>
  );
};

export default SectionBadge;
```

---

### Day 5: Create Bottom Navigation & Utilities

#### Task 1.8: Create BottomNav Component
**File:** `src/components/navigation/BottomNav.tsx`

```typescript
// src/components/navigation/BottomNav.tsx
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { COLORS } from '../../config/navigation.config';
import * as Icons from 'lucide-react';

interface BottomItem {
  label: string;
  icon: string;
  path: string;
  action?: string;
  divider?: boolean;
}

interface BottomNavProps {
  items: BottomItem[];
  onClose?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ items, onClose }) => {
  const navigate = useNavigate();

  const handleItemClick = (item: BottomItem) => {
    if (item.action === 'logout') {
      // Handle logout
      localStorage.clear();
      navigate('/logout');
    } else {
      navigate(item.path);
    }
    onClose?.();
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 border-t border-slate-700 bg-slate-900/50 p-2">
      {items.map((item) => {
        if (item.divider) {
          return (
            <div
              key="divider"
              className="h-px bg-slate-700 my-2"
              aria-hidden="true"
            />
          );
        }

        const IconComponent = (Icons as any)[item.icon] || Icons.ChevronRight;

        return (
          <button
            key={item.path}
            onClick={() => handleItemClick(item)}
            className={`
              w-full flex items-center gap-2 px-3 py-2 rounded-lg
              text-sm font-medium
              ${COLORS.text.secondary} ${COLORS.hover}
              transition-colors
            `}
            aria-label={item.label}
          >
            <IconComponent className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
```

---

#### Task 1.9: Create Navigation Utilities
**File:** `src/utils/navigationHelpers.ts`

```typescript
// src/utils/navigationHelpers.ts

/**
 * Build a context-aware navigation path
 * @param basePath - Base path (e.g., '/calendar', '/assets', '/projects')
 * @param context - Context parameter (e.g., 'individual', 'family', 'professional')
 * @returns Path with context query parameter
 */
export const buildContextPath = (basePath: string, context?: string): string => {
  if (!context) return basePath;

  const separator = basePath.includes('?') ? '&' : '?';
  return `${basePath}${separator}context=${context}`;
};

/**
 * Extract context from URL search params
 * @param searchParams - URLSearchParams object
 * @returns Context value or 'individual' as default
 */
export const getContextFromParams = (
  searchParams: URLSearchParams
): 'individual' | 'family' | 'professional' | 'community' => {
  const context = searchParams.get('context');
  if (['family', 'professional', 'community'].includes(context || '')) {
    return context as any;
  }
  return 'individual';
};

/**
 * Navigate to a context-aware route
 * @param navigate - React Router navigate function
 * @param path - Target path
 * @param context - Optional context
 */
export const navigateToContext = (
  navigate: any,
  path: string,
  context?: string
): void => {
  const contextPath = buildContextPath(path, context);
  navigate(contextPath);
};

/**
 * Check if a path is currently active
 * @param currentPath - Current pathname
 * @param targetPath - Target path to check
 * @returns True if paths match (ignoring query params)
 */
export const isPathActive = (currentPath: string, targetPath: string): boolean => {
  const baseCurrent = currentPath.split('?')[0];
  const baseTarget = targetPath.split('?')[0];
  return baseCurrent === baseTarget;
};
```

---

### Day 6: Create Hook for MediaQuery

#### Task 1.10: Create useMediaQuery Hook
**File:** `src/hooks/useMediaQuery.ts`

```typescript
// src/hooks/useMediaQuery.ts
import { useState, useEffect } from 'react';

/**
 * Hook to detect if a media query matches
 * @param query - Media query string (e.g., '(max-width: 1024px)')
 * @returns Boolean indicating if query matches
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Add listener
    mediaQuery.addEventListener('change', handleChange);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
};
```

---

### Day 7: Create Sidebar Styles

#### Task 1.11: Create Sidebar Styles
**File:** `src/components/navigation/Sidebar.css`

```css
/* src/components/navigation/Sidebar.css */

/* Sidebar base styling */
aside[role="navigation"] {
  scrollbar-width: thin;
  scrollbar-color: rgba(71, 85, 105, 0.5) transparent;
}

aside[role="navigation"]::-webkit-scrollbar {
  width: 6px;
}

aside[role="navigation"]::-webkit-scrollbar-track {
  background: transparent;
}

aside[role="navigation"]::-webkit-scrollbar-thumb {
  background-color: rgba(71, 85, 105, 0.5);
  border-radius: 3px;
}

aside[role="navigation"]::-webkit-scrollbar-thumb:hover {
  background-color: rgba(71, 85, 105, 0.7);
}

/* Navigation items smooth transitions */
a[role="link"],
button[role="button"] {
  transition: all 150ms ease-out;
}

a[role="link"]:hover,
button[role="button"]:hover {
  transform: translateX(2px);
}

/* Focus styles for accessibility */
a[role="link"]:focus-visible,
button[role="button"]:focus-visible {
  outline: 2px solid rgb(59, 130, 246);
  outline-offset: 2px;
}

/* Mobile drawer animation */
@media (max-width: 1023px) {
  aside[role="navigation"] {
    box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  aside[role="navigation"] {
    width: 100vw;
  }
}
```

---

### Day 7 Evening: Testing & Review

#### Task 1.12: Unit Tests
**File:** `src/components/navigation/__tests__/Sidebar.test.tsx`

```typescript
// src/components/navigation/__tests__/Sidebar.test.tsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../Sidebar';

describe('Sidebar Component', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('renders sidebar with all sections', () => {
    renderWithRouter(<Sidebar />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('displays Personal section', () => {
    renderWithRouter(<Sidebar />);
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });

  it('displays Family section', () => {
    renderWithRouter(<Sidebar />);
    expect(screen.getByText('Family')).toBeInTheDocument();
  });

  it('displays Professional section', () => {
    renderWithRouter(<Sidebar />);
    expect(screen.getByText('Professional')).toBeInTheDocument();
  });

  it('displays Communities section', () => {
    renderWithRouter(<Sidebar />);
    expect(screen.getByText('Communities (Sonny)')).toBeInTheDocument();
  });

  it('displays Common Tools section', () => {
    renderWithRouter(<Sidebar />);
    expect(screen.getByText('Common Tools')).toBeInTheDocument();
  });

  it('has proper ARIA labels', () => {
    renderWithRouter(<Sidebar />);
    expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
  });
});
```

---

## 📋 Week 2 Checklist: Integration & Testing

### Day 8-9: App Integration

#### Task 2.1: Update App.jsx to Use New Sidebar

**File:** `src/App.jsx` (Partial Update - Focus on Sidebar Integration)

Replace the old Sidebar import and usage:

```jsx
// OLD (Remove):
// import Sidebar from './components/Sidebar';
// <Sidebar isCollapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />

// NEW (Add):
import Sidebar from './components/navigation/Sidebar';

// In App component JSX:
function App() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        {/* Header, Routes, etc. */}
      </main>
    </div>
  );
}
```

---

#### Task 2.2: Add Skip Links to Layout

**File:** `src/components/common/SkipLink.jsx` (New)

```jsx
// src/components/common/SkipLink.jsx
export const SkipLink = () => {
  return (
    <>
      <a
        href="#main-content"
        className="
          sr-only
          focus:not-sr-only
          focus:absolute
          focus:top-0
          focus:left-0
          focus:z-50
          focus:p-4
          focus:bg-blue-600
          focus:text-white
          focus:rounded-r-lg
        "
      >
        Skip to main content
      </a>
      <a
        href="#main-nav"
        className="
          sr-only
          focus:not-sr-only
          focus:absolute
          focus:top-16
          focus:left-0
          focus:z-50
          focus:p-4
          focus:bg-blue-600
          focus:text-white
          focus:rounded-r-lg
        "
      >
        Skip to navigation
      </a>
    </>
  );
};
```

---

#### Task 2.3: Update Routing for Context Parameters

```jsx
// In App.jsx, ensure calendar route supports context:
<Route path="/calendar" element={<Calendar />} />

// Calendar component will read from useSearchParams()
import { useSearchParams } from 'react-router-dom';

function Calendar() {
  const [searchParams] = useSearchParams();
  const context = searchParams.get('context') || 'individual';
  
  return <CalendarView context={context} />;
}
```

---

### Day 10: Testing & Fixes

#### Task 2.4: Manual Testing Checklist

- [ ] All sidebar sections render
- [ ] All links navigate correctly
- [ ] External links open in new tab
- [ ] Sections collapse/expand
- [ ] State persists in localStorage
- [ ] Mobile hamburger menu works
- [ ] Drawer closes on item click
- [ ] Keyboard navigation works (Tab, Enter, Arrow keys)
- [ ] Screen reader announces sections
- [ ] Focus indicators visible
- [ ] ARIA labels correct
- [ ] Color contrast acceptable

#### Task 2.5: Lighthouse Audit

```bash
npm run build
npx lighthouse https://localhost:5173 --output-path=./lighthouse-report.json
```

---

### Day 11-14: Refinement & Documentation

#### Task 2.6: Update Documentation

**File:** `SIDEBAR_NAVIGATION.md` (New)

Create comprehensive sidebar documentation with:
- Usage guide
- Context parameter system
- Keyboard shortcuts
- Accessibility features
- Custom link patterns
- Badge system
- Mobile behavior

---

## ✅ Week 1-2 Deliverables Checklist

### Configuration & Types
- [ ] `src/config/navigation.config.ts` - Navigation structure
- [ ] `src/types/navigation.types.ts` - TypeScript definitions
- [ ] `src/utils/navigationHelpers.ts` - Utility functions

### Components
- [ ] `src/components/navigation/Sidebar.tsx` - Main component
- [ ] `src/components/navigation/NavSection.tsx` - Section component
- [ ] `src/components/navigation/NavItem.tsx` - Item component
- [ ] `src/components/navigation/SectionBadge.tsx` - Badge component
- [ ] `src/components/navigation/BottomNav.tsx` - Bottom navigation
- [ ] `src/components/common/SkipLink.jsx` - Skip link component

### Hooks
- [ ] `src/hooks/useNavigation.ts` - Navigation state
- [ ] `src/hooks/useMediaQuery.ts` - Media query hook

### Styling
- [ ] `src/components/navigation/Sidebar.css` - Sidebar styles
- [ ] Updates to `src/index.css` for global focus styles

### Testing & Documentation
- [ ] `src/components/navigation/__tests__/Sidebar.test.tsx` - Unit tests
- [ ] `SIDEBAR_NAVIGATION.md` - Documentation
- [ ] Updated `src/App.jsx` - Integration
- [ ] All old sidebar code removed
- [ ] All tests passing
- [ ] Lighthouse a11y score 90+

---

## 🎯 Key Metrics for Success

### Phase 0 (Weeks 1-2) Success Criteria

✅ **Functionality:**
- All 5 context sections render correctly
- All 50+ navigation items have correct links
- Mobile responsive works perfectly
- External links open in new tabs
- localStorage persistence works

✅ **Keyboard Navigation:**
- Tab through all items
- Enter/Space toggles sections
- Arrow keys navigate items
- Escape closes mobile drawer

✅ **Accessibility:**
- All sections have aria-expanded
- All items have aria-current or aria-label
- Focus indicators visible
- Screen reader announces structure
- Lighthouse a11y score 95+

✅ **Code Quality:**
- All tests passing
- TypeScript types correct
- No console errors
- Proper error handling
- Component documentation complete

---

## 🚀 Ready to Start!

This Phase 0 foundation is ready for immediate implementation. Begin with **Day 1 Task 1.1** (Navigation Config) and follow sequentially.

**Estimated Time:** 80 hours over 2 weeks  
**Team:** 1 developer full-time  
**Success Probability:** Very High  

Ready to proceed! 🎯

