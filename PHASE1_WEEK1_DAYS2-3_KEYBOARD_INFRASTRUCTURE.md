# PHASE 1 WEEK 1: DAYS 2-3 KEYBOARD INFRASTRUCTURE
## October 27-28, 2025 - Infrastructure & Hooks Creation

**Objective:** Create reusable keyboard management system that all components can leverage

---

## 📋 Day 2-3 Deliverables Overview

### Files to Create (6 files)

```
src/
├── hooks/
│   ├── useKeyboardShortcuts.ts ............ [NEW] Main keyboard handler
│   ├── useFocusManagement.ts ............ [NEW] Focus trap & restoration
│   └── useKeyboardNavigation.ts .......... [NEW] Arrow key navigation
├── contexts/
│   └── KeyboardContext.tsx ............ [NEW] Keyboard state & registry
├── utils/
│   └── keyboardUtils.ts ............ [NEW] Keyboard helper functions
└── types/
    └── keyboard.types.ts ............ [NEW] TypeScript interfaces
```

### Total Code: 400-500 lines
### Time Estimate: 12-16 hours
### Quality Target: 100+ keyboard test cases, 0 ESLint errors

---

## 🎯 File 1: keyboard.types.ts
**Time: 1 hour | Lines: 80-100**

```typescript
// Location: src/types/keyboard.types.ts
// Purpose: Central TypeScript types for all keyboard functionality

export interface KeyboardShortcut {
  key: string; // 'Enter', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape', 'Tab'
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: (e: KeyboardEvent) => void;
  context?: 'global' | 'modal' | 'toolbar' | 'navigation' | 'form';
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export interface KeyboardNavigationItem {
  id: string;
  label: string;
  ref: React.RefObject<HTMLElement>;
  disabled?: boolean;
  children?: KeyboardNavigationItem[];
}

export interface FocusConfig {
  trapFocus?: boolean; // Prevent Tab from leaving component
  initialFocus?: React.RefObject<HTMLElement>;
  restoreFocus?: boolean; // Restore focus on unmount
  focusableSelector?: string;
  escapeToClose?: boolean;
  escapeHandler?: () => void;
}

export interface KeyboardContextType {
  registerShortcut: (id: string, shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (id: string) => void;
  registerFocusTrap: (id: string, config: FocusConfig) => void;
  unregisterFocusTrap: (id: string) => void;
  shortcuts: Map<string, KeyboardShortcut>;
  focusTraps: Map<string, FocusConfig>;
}

export interface KeyboardEventData {
  key: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}
```

**Checklist:**
- [ ] File created with all interfaces
- [ ] Exported for use in other files
- [ ] Well-commented

---

## 🎯 File 2: keyboardUtils.ts
**Time: 2 hours | Lines: 150-200**

```typescript
// Location: src/utils/keyboardUtils.ts
// Purpose: Reusable keyboard utility functions

import { KeyboardEventData } from '../types/keyboard.types';

/**
 * Parse keyboard event into standardized data
 */
export const parseKeyboardEvent = (e: KeyboardEvent): KeyboardEventData => ({
  key: e.key,
  ctrlKey: e.ctrlKey || e.metaKey, // Treat Cmd as Ctrl on Mac
  shiftKey: e.shiftKey,
  altKey: e.altKey,
  metaKey: e.metaKey,
});

/**
 * Check if keyboard event matches a shortcut pattern
 */
export const eventMatchesShortcut = (
  e: KeyboardEvent,
  key: string,
  modifiers?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  }
): boolean => {
  const keyMatches = e.key === key || e.code === key;
  const ctrlMatches = (modifiers?.ctrl ?? false) === (e.ctrlKey || e.metaKey);
  const shiftMatches = (modifiers?.shift ?? false) === e.shiftKey;
  const altMatches = (modifiers?.alt ?? false) === e.altKey;
  const metaMatches = (modifiers?.meta ?? false) === e.metaKey;

  return keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches;
};

/**
 * Get all focusable elements within container
 */
export const getFocusableElements = (
  container: HTMLElement,
  selector?: string
): HTMLElement[] => {
  const focusableSelector =
    selector ||
    [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      'audio[controls]',
      'video[controls]',
      '[contenteditable]:not([contenteditable="false"])',
    ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelector));
};

/**
 * Focus first focusable element
 */
export const focusFirstElement = (
  container: HTMLElement,
  selector?: string
): boolean => {
  const elements = getFocusableElements(container, selector);
  if (elements.length > 0 && elements[0] instanceof HTMLElement) {
    elements[0].focus();
    return true;
  }
  return false;
};

/**
 * Focus last focusable element
 */
export const focusLastElement = (
  container: HTMLElement,
  selector?: string
): boolean => {
  const elements = getFocusableElements(container, selector);
  if (elements.length > 0 && elements[elements.length - 1] instanceof HTMLElement) {
    elements[elements.length - 1].focus();
    return true;
  }
  return false;
};

/**
 * Move focus to next/previous focusable element
 */
export const moveFocus = (
  container: HTMLElement,
  direction: 'next' | 'prev',
  selector?: string
): boolean => {
  const elements = getFocusableElements(container, selector);
  const activeElement = document.activeElement;

  if (!activeElement || !(activeElement instanceof HTMLElement)) {
    return focusFirstElement(container, selector);
  }

  const currentIndex = elements.indexOf(activeElement as HTMLElement);

  if (currentIndex === -1) {
    return focusFirstElement(container, selector);
  }

  let nextIndex;
  if (direction === 'next') {
    nextIndex = (currentIndex + 1) % elements.length;
  } else {
    nextIndex = (currentIndex - 1 + elements.length) % elements.length;
  }

  if (elements[nextIndex] instanceof HTMLElement) {
    elements[nextIndex].focus();
    return true;
  }

  return false;
};

/**
 * Check if element has focus
 */
export const elementHasFocus = (element: HTMLElement | null): boolean => {
  return element !== null && document.activeElement === element;
};

/**
 * Get previously focused element (for restoration)
 */
export const getPreviouslyFocusedElement = (): HTMLElement | null => {
  return document.activeElement instanceof HTMLElement ? document.activeElement : null;
};

/**
 * Check if element is focusable
 */
export const isFocusable = (element: HTMLElement): boolean => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];

  return focusableSelectors.some(selector => element.matches(selector));
};

/**
 * Announce to screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};
```

**Checklist:**
- [ ] All 11 utility functions created
- [ ] Functions well-documented with JSDoc
- [ ] Error handling included
- [ ] TypeScript types accurate

---

## 🎯 File 3: KeyboardContext.tsx
**Time: 2 hours | Lines: 100-150**

```typescript
// Location: src/contexts/KeyboardContext.tsx
// Purpose: Central keyboard state management

import React, { createContext, useState, useCallback } from 'react';
import { KeyboardContextType, KeyboardShortcut, FocusConfig } from '../types/keyboard.types';

export const KeyboardContext = createContext<KeyboardContextType | undefined>(undefined);

export const KeyboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shortcuts] = useState<Map<string, KeyboardShortcut>>(new Map());
  const [focusTraps] = useState<Map<string, FocusConfig>>(new Map());

  const registerShortcut = useCallback((id: string, shortcut: KeyboardShortcut) => {
    shortcuts.set(id, shortcut);
  }, [shortcuts]);

  const unregisterShortcut = useCallback((id: string) => {
    shortcuts.delete(id);
  }, [shortcuts]);

  const registerFocusTrap = useCallback((id: string, config: FocusConfig) => {
    focusTraps.set(id, config);
  }, [focusTraps]);

  const unregisterFocusTrap = useCallback((id: string) => {
    focusTraps.delete(id);
  }, [focusTraps]);

  const value: KeyboardContextType = {
    registerShortcut,
    unregisterShortcut,
    registerFocusTrap,
    unregisterFocusTrap,
    shortcuts,
    focusTraps,
  };

  return <KeyboardContext.Provider value={value}>{children}</KeyboardContext.Provider>;
};

export const useKeyboardContext = (): KeyboardContextType => {
  const context = React.useContext(KeyboardContext);
  if (!context) {
    throw new Error('useKeyboardContext must be used within KeyboardProvider');
  }
  return context;
};
```

**Checklist:**
- [ ] Context created with proper types
- [ ] Provider component created
- [ ] Custom hook for context access
- [ ] Error handling for usage outside provider

---

## 🎯 File 4: useKeyboardShortcuts.ts
**Time: 3 hours | Lines: 150-180**

```typescript
// Location: src/hooks/useKeyboardShortcuts.ts
// Purpose: Hook for registering and managing keyboard shortcuts

import { useEffect, useRef, useCallback } from 'react';
import { KeyboardShortcut } from '../types/keyboard.types';
import { eventMatchesShortcut } from '../utils/keyboardUtils';

/**
 * Hook for registering keyboard shortcuts with automatic cleanup
 * 
 * @example
 * const shortcuts = [
 *   { key: 'Escape', handler: () => handleClose() },
 *   { key: 'Enter', handler: () => handleSubmit() }
 * ];
 * useKeyboardShortcuts(shortcuts);
 */
export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
): void => {
  const shortcutsRef = useRef(shortcuts);
  const idRef = useRef(`shortcuts-${Math.random().toString(36).substr(2, 9)}`);

  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  // Main keyboard event handler
  const handleKeydown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    for (const shortcut of shortcutsRef.current) {
      if (
        eventMatchesShortcut(e, shortcut.key, {
          ctrl: shortcut.ctrl,
          shift: shortcut.shift,
          alt: shortcut.alt,
          meta: shortcut.meta,
        })
      ) {
        if (shortcut.preventDefault) {
          e.preventDefault();
        }
        if (shortcut.stopPropagation) {
          e.stopPropagation();
        }
        shortcut.handler(e);
        break; // Only handle first matching shortcut
      }
    }
  }, [enabled]);

  // Attach/detach event listener
  useEffect(() => {
    if (enabled && shortcutsRef.current.length > 0) {
      document.addEventListener('keydown', handleKeydown);
      return () => {
        document.removeEventListener('keydown', handleKeydown);
      };
    }
  }, [enabled, handleKeydown]);
};

/**
 * Hook for component-specific keyboard shortcuts
 * Automatically removes shortcuts when component unmounts
 * 
 * @param componentId Unique identifier for this component's shortcuts
 * @param shortcuts Array of keyboard shortcuts to register
 */
export const useComponentKeyboardShortcuts = (
  componentId: string,
  shortcuts: KeyboardShortcut[]
): void => {
  useKeyboardShortcuts(shortcuts);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Shortcuts automatically removed by event listener cleanup
    };
  }, [componentId]);
};
```

**Checklist:**
- [ ] Main hook created with proper cleanup
- [ ] Component-specific hook variant
- [ ] JSDoc with usage examples
- [ ] Ref pattern for stale closures
- [ ] Enabled flag for conditional activation

---

## 🎯 File 5: useFocusManagement.ts
**Time: 3 hours | Lines: 180-220**

```typescript
// Location: src/hooks/useFocusManagement.ts
// Purpose: Hook for focus trapping and restoration

import { useEffect, useRef, useCallback } from 'react';
import { FocusConfig } from '../types/keyboard.types';
import {
  getFocusableElements,
  focusFirstElement,
  focusLastElement,
  getPreviouslyFocusedElement,
  announceToScreenReader,
} from '../utils/keyboardUtils';

/**
 * Hook for managing focus in modals and dialogs
 * Handles focus trapping and restoration
 * 
 * @example
 * const modalRef = useRef(null);
 * useFocusManagement({
 *   ref: modalRef,
 *   trapFocus: true,
 *   initialFocus: closeBtnRef,
 *   restoreFocus: true
 * });
 */
export const useFocusManagement = (
  ref: React.RefObject<HTMLElement>,
  config: FocusConfig = {}
): void => {
  const {
    trapFocus = false,
    initialFocus = undefined,
    restoreFocus = true,
    focusableSelector = undefined,
    escapeToClose = false,
    escapeHandler = undefined,
  } = config;

  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Handle escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && escapeToClose && escapeHandler) {
        e.preventDefault();
        escapeHandler();
        announceToScreenReader('Dialog closed');
      }
    },
    [escapeToClose, escapeHandler]
  );

  // Handle focus trap (keep focus within component)
  const handleTabKey = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !trapFocus || !ref.current) return;

    const focusableElements = getFocusableElements(ref.current, focusableSelector);

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    // Shift + Tab and focus is on first element
    if (e.shiftKey) {
      if (activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    }
    // Tab and focus is on last element
    else {
      if (activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, [trapFocus, focusableSelector, ref]);

  // Setup on mount
  useEffect(() => {
    if (!ref.current) return;

    // Store previously focused element
    previouslyFocusedRef.current = getPreviouslyFocusedElement();

    // Set initial focus
    if (initialFocus && initialFocus.current) {
      initialFocus.current.focus();
      announceToScreenReader('Focus moved to dialog');
    } else if (trapFocus || initialFocus) {
      focusFirstElement(ref.current, focusableSelector);
      announceToScreenReader('Dialog opened, focus on first element');
    }

    // Add event listeners
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTabKey);

      // Restore focus on unmount
      if (restoreFocus && previouslyFocusedRef.current) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [trapFocus, initialFocus, restoreFocus, focusableSelector, handleEscape, handleTabKey, ref]);
};

/**
 * Hook for managing focus in a list or menu
 * Handles arrow key navigation
 */
export const useFocusNavigation = (
  containerRef: React.RefObject<HTMLElement>,
  options: {
    onNavigate?: (index: number) => void;
    useArrowKeys?: boolean;
    useHomeEnd?: boolean;
  } = {}
): void => {
  const {
    onNavigate,
    useArrowKeys = true,
    useHomeEnd = true,
  } = options;

  const handleKeydown = useCallback(
    (e: KeyboardEvent) => {
      if (!containerRef.current) return;

      const focusableElements = getFocusableElements(containerRef.current);
      const activeElement = document.activeElement;
      const currentIndex = focusableElements.indexOf(activeElement as HTMLElement);

      if (currentIndex === -1) return;

      let newIndex = currentIndex;
      let handled = false;

      if (useArrowKeys) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          newIndex = (currentIndex + 1) % focusableElements.length;
          handled = true;
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          newIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
          handled = true;
        }
      }

      if (useHomeEnd) {
        if (e.key === 'Home') {
          newIndex = 0;
          handled = true;
        } else if (e.key === 'End') {
          newIndex = focusableElements.length - 1;
          handled = true;
        }
      }

      if (handled) {
        e.preventDefault();
        const nextElement = focusableElements[newIndex];
        if (nextElement instanceof HTMLElement) {
          nextElement.focus();
          onNavigate?.(newIndex);
        }
      }
    },
    [containerRef, onNavigate, useArrowKeys, useHomeEnd]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [handleKeydown]);
};
```

**Checklist:**
- [ ] useFocusManagement hook created
- [ ] useFocusNavigation hook created
- [ ] Focus trap logic correct
- [ ] Screen reader announcements included
- [ ] Escape key handling
- [ ] Arrow key navigation
- [ ] Home/End key support

---

## 🎯 File 6: useKeyboardNavigation.ts
**Time: 2 hours | Lines: 120-150**

```typescript
// Location: src/hooks/useKeyboardNavigation.ts
// Purpose: Hook for managing keyboard navigation in lists/menus

import { useState, useCallback, useEffect } from 'react';
import { KeyboardNavigationItem } from '../types/keyboard.types';

/**
 * Hook for keyboard navigation in lists and menus
 * Handles arrow keys, home/end, and item selection
 * 
 * @example
 * const items = [
 *   { id: '1', label: 'Item 1', ref: ref1 },
 *   { id: '2', label: 'Item 2', ref: ref2 }
 * ];
 * const [activeId, setActiveId] = useKeyboardNavigation(items);
 */
export const useKeyboardNavigation = (
  items: KeyboardNavigationItem[],
  options: {
    loop?: boolean;
    onSelect?: (item: KeyboardNavigationItem) => void;
  } = {}
): [string | null, (id: string | null) => void] => {
  const { loop = true, onSelect } = options;
  const [activeId, setActiveId] = useState<string | null>(items.length > 0 ? items[0].id : null);

  // Handle keyboard events
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      const activeIndex = items.findIndex(item => item.id === activeId);

      if (activeIndex === -1) return;

      let newIndex = activeIndex;
      let handled = false;

      // Arrow keys
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        newIndex = loop
          ? (activeIndex + 1) % items.length
          : Math.min(activeIndex + 1, items.length - 1);
        handled = true;
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        newIndex = loop
          ? (activeIndex - 1 + items.length) % items.length
          : Math.max(activeIndex - 1, 0);
        handled = true;
      }

      // Home/End keys
      if (e.key === 'Home') {
        newIndex = 0;
        handled = true;
      } else if (e.key === 'End') {
        newIndex = items.length - 1;
        handled = true;
      }

      // Enter/Space to select
      if (e.key === 'Enter' || e.key === ' ') {
        const activeItem = items[activeIndex];
        if (activeItem && !activeItem.disabled) {
          onSelect?.(activeItem);
          handled = true;
        }
      }

      if (handled) {
        e.preventDefault();

        const newItem = items[newIndex];
        if (newItem && !newItem.disabled) {
          setActiveId(newItem.id);
          // Auto-focus the item's ref
          if (newItem.ref?.current instanceof HTMLElement) {
            newItem.ref.current.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [items, activeId, loop, onSelect]);

  // Focus the active item
  useEffect(() => {
    const activeItem = items.find(item => item.id === activeId);
    if (activeItem?.ref?.current instanceof HTMLElement) {
      activeItem.ref.current.focus();
    }
  }, [items, activeId]);

  return [activeId, setActiveId];
};
```

**Checklist:**
- [ ] Hook created with arrow key support
- [ ] Home/End key support
- [ ] Enter/Space selection
- [ ] Loop option
- [ ] OnSelect callback
- [ ] Auto-focus integration

---

## ✅ Implementation Checklist

### File Creation
- [ ] keyboard.types.ts created
- [ ] keyboardUtils.ts created (11 functions)
- [ ] KeyboardContext.tsx created
- [ ] useKeyboardShortcuts.ts created
- [ ] useFocusManagement.ts created
- [ ] useKeyboardNavigation.ts created

### Code Quality
- [ ] All files have ESLint pass
- [ ] All TypeScript types correct
- [ ] All JSDoc comments added
- [ ] All imports/exports correct
- [ ] No unused variables
- [ ] Error handling present

### Testing Ready
- [ ] All functions documented
- [ ] All exports verified
- [ ] KeyboardProvider setup tested
- [ ] All hooks tested in isolation

---

## 📊 Progress Tracking

| File | Lines | Status | Time |
|------|-------|--------|------|
| keyboard.types.ts | 100 | ⬜ Not Started | 1h |
| keyboardUtils.ts | 200 | ⬜ Not Started | 2h |
| KeyboardContext.tsx | 150 | ⬜ Not Started | 2h |
| useKeyboardShortcuts.ts | 180 | ⬜ Not Started | 3h |
| useFocusManagement.ts | 220 | ⬜ Not Started | 3h |
| useKeyboardNavigation.ts | 150 | ⬜ Not Started | 2h |
| **TOTAL** | **~1000** | **⬜ Ready** | **13h** |

---

## 🚀 Next Steps (After Days 2-3)

### Days 4-5: Update FloatingToolbar
Once infrastructure is complete:
1. Import keyboard hooks
2. Add tool navigation (arrow keys, tab)
3. Implement enter/space to activate
4. Add escape to close
5. Add full ARIA labels
6. Add focus indicators
7. 50+ test cases

### Week 2: Dashboard & Modals
1. Update Dashboard.jsx
2. Implement category keyboard nav
3. Tab navigation updates
4. All modals with focus trap
5. 200+ test cases

### Week 3: Testing & Polish
1. Full test coverage (300+)
2. Screen reader testing
3. Performance verification
4. Documentation
5. Final QA

---

## 📝 Success Criteria for Days 2-3

✅ All 6 files created  
✅ 0 ESLint errors  
✅ 0 TypeScript errors  
✅ All types correct  
✅ All functions documented  
✅ Ready for FloatingToolbar integration  
✅ Ready for Phase 1 Weeks 2-3

**Status: Ready to begin Days 2-3 infrastructure creation!**

