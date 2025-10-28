/**
 * Keyboard Utilities
 * Helper functions for keyboard event handling and focus management
 */

import { KeyboardEventData } from '../types/keyboard.types';

/**
 * Parse keyboard event into standardized data
 * @param e - Keyboard event
 * @returns Parsed keyboard event data
 */
export const parseKeyboardEvent = (e: KeyboardEvent): KeyboardEventData => ({
  key: e.key,
  code: e.code,
  ctrlKey: e.ctrlKey || e.metaKey, // Treat Cmd as Ctrl on Mac
  shiftKey: e.shiftKey,
  altKey: e.altKey,
  metaKey: e.metaKey,
});

/**
 * Check if keyboard event matches a shortcut pattern
 * @param e - Keyboard event
 * @param key - Key to match (e.g., 'Enter', 'ArrowUp')
 * @param modifiers - Optional modifiers to check
 * @returns True if event matches pattern
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
 * Get all focusable elements within a container
 * @param container - Container element
 * @param selector - Optional custom selector
 * @returns Array of focusable elements
 */
export const getFocusableElements = (
  container: HTMLElement,
  selector?: string
): HTMLElement[] => {
  if (!container) return [];

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

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (el) => {
      // Ensure element is visible
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    }
  );
};

/**
 * Focus first focusable element in container
 * @param container - Container element
 * @param selector - Optional custom selector
 * @returns True if element was focused
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
 * Focus last focusable element in container
 * @param container - Container element
 * @param selector - Optional custom selector
 * @returns True if element was focused
 */
export const focusLastElement = (
  container: HTMLElement,
  selector?: string
): boolean => {
  const elements = getFocusableElements(container, selector);
  if (elements.length > 0 && elements[elements.length - 1] instanceof HTMLElement) {
    (elements[elements.length - 1] as HTMLElement).focus();
    return true;
  }
  return false;
};

/**
 * Move focus to next or previous focusable element
 * @param container - Container element
 * @param direction - Direction to move ('next' or 'prev')
 * @param selector - Optional custom selector
 * @returns True if focus was moved
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
    (elements[nextIndex] as HTMLElement).focus();
    return true;
  }

  return false;
};

/**
 * Check if element has focus
 * @param element - Element to check
 * @returns True if element has focus
 */
export const elementHasFocus = (element: HTMLElement | null): boolean => {
  return element !== null && document.activeElement === element;
};

/**
 * Get current focused element
 * @returns Currently focused element or null
 */
export const getCurrentFocusedElement = (): HTMLElement | null => {
  return document.activeElement instanceof HTMLElement ? (document.activeElement as HTMLElement) : null;
};

/**
 * Check if element is focusable
 * @param element - Element to check
 * @returns True if element is focusable
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

  return focusableSelectors.some((selector) => element.matches(selector));
};

/**
 * Announce message to screen readers
 * @param message - Message to announce
 * @param priority - Priority level ('polite' or 'assertive')
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void => {
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

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Check if keyboard event is Tab key
 * @param e - Keyboard event
 * @returns True if event is Tab key
 */
export const isTabKey = (e: KeyboardEvent): boolean => {
  return e.key === 'Tab' || e.code === 'Tab';
};

/**
 * Check if keyboard event is Escape key
 * @param e - Keyboard event
 * @returns True if event is Escape key
 */
export const isEscapeKey = (e: KeyboardEvent): boolean => {
  return e.key === 'Escape' || e.code === 'Escape';
};

/**
 * Check if keyboard event is Arrow key
 * @param e - Keyboard event
 * @returns True if event is Arrow key
 */
export const isArrowKey = (e: KeyboardEvent): boolean => {
  return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key);
};

/**
 * Check if keyboard event is Enter or Space
 * @param e - Keyboard event
 * @returns True if event is Enter or Space
 */
export const isActivationKey = (e: KeyboardEvent): boolean => {
  return e.key === 'Enter' || e.key === ' ';
};

/**
 * Announce element change to screen readers
 * @param element - Element that changed
 * @param change - Description of change
 */
export const announceElementChange = (element: HTMLElement, change: string): void => {
  announceToScreenReader(`${element.textContent || ''} ${change}`, 'polite');
};
