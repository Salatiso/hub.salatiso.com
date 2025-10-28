// src/config/navigation.config.ts
import {
  BarChart3, User, Users, Heart, Briefcase, MapPin, AlertTriangle,
  Settings, LogOut, Zap, FileText, TrendingUp, Calendar, Package,
  Building, Network, Globe, Lightbulb, Beaker, Phone, Home, CheckCircle,
  Shield, MessageSquare, Navigation
} from 'lucide-react';

import { NavItem, NavSection, BottomItem } from '../types/navigation.types';

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
        label: 'Family Value Hub',
        icon: 'Heart',
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
        label: 'Sonny Mesh Network',
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
        label: 'Safety Check-ins',
        icon: 'CheckCircle',
        path: '/safety-checkins',
        description: 'Community safety updates'
      },
      {
        label: 'PigeeBack Transport',
        icon: 'Navigation',
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
        label: 'LifeSync Communities',
        icon: 'Globe',
        path: 'https://lifesync-lifecv.web.app/',
        external: true,
        badge: { text: 'External', type: 'external' },
        description: 'LifeSync community platform'
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
        icon: 'FileText',
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
        icon: 'Lightbulb',
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
