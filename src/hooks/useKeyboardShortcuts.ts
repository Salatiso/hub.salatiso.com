/**
 * useKeyboardShortcuts Hook
 * Registers and manages keyboard shortcuts with automatic cleanup
 */

import { useEffect, useRef, useCallback } from 'react';
import { KeyboardShortcut } from '../types/keyboard.types';
import { eventMatchesShortcut } from '../utils/keyboardUtils';

/**
 * Hook for registering keyboard shortcuts with automatic cleanup
 * Handles keyboard events and calls handlers when shortcuts match
 *
 * @param shortcuts - Array of keyboard shortcuts to handle
 * @param enabled - Whether shortcuts are enabled (default: true)
 *
 * @example
 * const shortcuts = [
 *   {
 *     key: 'Escape',
 *     handler: () => handleClose(),
 *     preventDefault: true,
 *   },
 *   {
 *     key: 'Enter',
 *     handler: () => handleSubmit(),
 *     preventDefault: true,
 *   },
 * ];
 * useKeyboardShortcuts(shortcuts);
 */
export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
): void => {
  const shortcutsRef = useRef(shortcuts);

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
 * @param componentId - Unique identifier for this component's shortcuts
 * @param shortcuts - Array of keyboard shortcuts to register
 * @param enabled - Whether shortcuts are enabled (default: true)
 *
 * @example
 * const modalId = useId();
 * useComponentKeyboardShortcuts(
 *   modalId,
 *   [
 *     {
 *       key: 'Escape',
 *       handler: () => closeModal(),
 *       preventDefault: true,
 *     },
 *   ]
 * );
 */
export const useComponentKeyboardShortcuts = (
  componentId: string,
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
): void => {
  useKeyboardShortcuts(shortcuts, enabled);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Shortcuts automatically removed by event listener cleanup
    };
  }, [componentId]);
};
