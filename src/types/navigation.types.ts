// src/types/navigation.types.ts
import { LucideIcon } from 'lucide-react';

export interface NavBadge {
  text: string;
  type: 'core' | 'mesh' | 'mni' | 'external' | 'new';
}

export interface NavItem {
  label: string;
  icon: string; // Icon name from lucide-react
  path: string;
  badge?: NavBadge;
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
