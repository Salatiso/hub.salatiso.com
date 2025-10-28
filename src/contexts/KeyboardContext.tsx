/**
 * Keyboard Context
 * Central context for managing keyboard shortcuts and focus traps
 */

import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { KeyboardContextType, KeyboardShortcut, FocusConfig } from '../types/keyboard.types';

/**
 * React Context for keyboard management
 */
export const KeyboardContext = createContext<KeyboardContextType | undefined>(undefined);

/**
 * Keyboard Context Provider Component
 * Wraps application to provide keyboard functionality
 *
 * @example
 * <KeyboardProvider>
 *   <App />
 * </KeyboardProvider>
 */
export const KeyboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [shortcuts] = useState<Map<string, KeyboardShortcut>>(new Map());
  const [focusTraps] = useState<Map<string, FocusConfig>>(new Map());

  /**
   * Register a keyboard shortcut
   */
  const registerShortcut = useCallback((id: string, shortcut: KeyboardShortcut) => {
    shortcuts.set(id, shortcut);
  }, [shortcuts]);

  /**
   * Unregister a keyboard shortcut
   */
  const unregisterShortcut = useCallback((id: string) => {
    shortcuts.delete(id);
  }, [shortcuts]);

  /**
   * Register a focus trap configuration
   */
  const registerFocusTrap = useCallback((id: string, config: FocusConfig) => {
    focusTraps.set(id, config);
  }, [focusTraps]);

  /**
   * Unregister a focus trap configuration
   */
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

  return (
    <KeyboardContext.Provider value={value}>
      {children}
    </KeyboardContext.Provider>
  );
};

/**
 * Hook to access keyboard context
 * Must be used within KeyboardProvider
 *
 * @throws Error if used outside of KeyboardProvider
 * @returns Keyboard context type
 *
 * @example
 * const keyboardContext = useKeyboardContext();
 */
export const useKeyboardContext = (): KeyboardContextType => {
  const context = React.useContext(KeyboardContext);
  if (!context) {
    throw new Error(
      'useKeyboardContext must be used within KeyboardProvider'
    );
  }
  return context;
};
