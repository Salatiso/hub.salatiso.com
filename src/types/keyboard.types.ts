/**
 * Keyboard System Types
 * Central TypeScript types for all keyboard functionality
 * Supports focus management, keyboard navigation, and accessibility
 */

/**
 * Keyboard shortcut configuration
 * Defines a keyboard event and its handler
 */
export interface KeyboardShortcut {
  key: string; // 'Enter', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape', 'Tab', 'Home', 'End'
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: (e: KeyboardEvent) => void;
  context?: 'global' | 'modal' | 'toolbar' | 'navigation' | 'form';
  preventDefault?: boolean;
  stopPropagation?: boolean;
  description?: string; // For documentation/testing
}

/**
 * Keyboard navigation item for list/menu navigation
 * Used with useKeyboardNavigation hook
 */
export interface KeyboardNavigationItem {
  id: string;
  label: string;
  ref: React.RefObject<HTMLElement>;
  disabled?: boolean;
  children?: KeyboardNavigationItem[];
  onSelect?: () => void;
}

/**
 * Focus management configuration
 * Used with useFocusManagement hook for modals and dialogs
 */
export interface FocusConfig {
  trapFocus?: boolean; // Prevent Tab from leaving component
  initialFocus?: React.RefObject<HTMLElement>;
  restoreFocus?: boolean; // Restore focus on unmount
  focusableSelector?: string;
  escapeToClose?: boolean;
  escapeHandler?: () => void;
  onFocusChange?: (element: HTMLElement | null) => void;
}

/**
 * Keyboard context type for central state management
 */
export interface KeyboardContextType {
  registerShortcut: (id: string, shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (id: string) => void;
  registerFocusTrap: (id: string, config: FocusConfig) => void;
  unregisterFocusTrap: (id: string) => void;
  shortcuts: Map<string, KeyboardShortcut>;
  focusTraps: Map<string, FocusConfig>;
}

/**
 * Parsed keyboard event data
 * Standardized format for keyboard event information
 */
export interface KeyboardEventData {
  key: string;
  code: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

/**
 * Focus navigation configuration
 * For managing focus within lists and menus
 */
export interface FocusNavigationConfig {
  useArrowKeys?: boolean;
  useHomeEnd?: boolean;
  loop?: boolean; // Wrap around at start/end
  onNavigate?: (index: number) => void;
  onSelect?: (item: KeyboardNavigationItem) => void;
}

/**
 * Focusable element information
 */
export interface FocusableElement {
  element: HTMLElement;
  index: number;
  isDisabled: boolean;
}

/**
 * Keyboard event handler options
 */
export interface KeyboardHandlerOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  context?: string;
}
