/**
 * useFocusManagement Hook
 * Handles focus trapping and restoration for modals and dialogs
 */

import { useEffect, useRef, useCallback } from 'react';
import { FocusConfig } from '../types/keyboard.types';
import {
  getFocusableElements,
  focusFirstElement,
  focusLastElement,
  getCurrentFocusedElement,
  announceToScreenReader,
  isTabKey,
  isEscapeKey,
} from '../utils/keyboardUtils';

/**
 * Hook for managing focus in modals and dialogs
 * Handles focus trapping, focus restoration, and escape key handling
 *
 * @param ref - Reference to the container element (modal, dialog, etc.)
 * @param config - Focus management configuration
 *
 * @example
 * const modalRef = useRef<HTMLDivElement>(null);
 * const closeButtonRef = useRef<HTMLButtonElement>(null);
 *
 * useFocusManagement(modalRef, {
 *   trapFocus: true,
 *   initialFocus: closeButtonRef,
 *   restoreFocus: true,
 *   escapeToClose: true,
 *   escapeHandler: () => closeModal(),
 * });
 *
 * return <div ref={modalRef}>{...}</div>;
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
      if (isEscapeKey(e) && escapeToClose && escapeHandler) {
        e.preventDefault();
        escapeHandler();
        announceToScreenReader('Dialog closed');
      }
    },
    [escapeToClose, escapeHandler]
  );

  // Handle focus trap (keep focus within component)
  const handleTabKey = useCallback((e: KeyboardEvent) => {
    if (!isTabKey(e) || !trapFocus || !ref.current) return;

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
    previouslyFocusedRef.current = getCurrentFocusedElement();

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
  }, [
    trapFocus,
    initialFocus,
    restoreFocus,
    focusableSelector,
    handleEscape,
    handleTabKey,
    ref,
  ]);
};

/**
 * Hook for managing focus navigation in lists and menus
 * Handles arrow key navigation through focusable elements
 *
 * @param containerRef - Reference to the container element
 * @param options - Navigation options
 *
 * @example
 * const containerRef = useRef<HTMLDivElement>(null);
 *
 * useFocusNavigation(containerRef, {
 *   useArrowKeys: true,
 *   useHomeEnd: true,
 *   onNavigate: (index) => console.log('Navigated to', index),
 * });
 *
 * return <div ref={containerRef}>{...items...}</div>;
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
