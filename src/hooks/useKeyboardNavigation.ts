/**
 * useKeyboardNavigation Hook
 * Manages keyboard navigation in lists and menus with arrow keys and selection
 */

import { useState, useCallback, useEffect } from 'react';
import { KeyboardNavigationItem } from '../types/keyboard.types';
import { isActivationKey, isArrowKey } from '../utils/keyboardUtils';

/**
 * Hook for keyboard navigation in lists and menus
 * Handles arrow keys, home/end, and item selection
 *
 * @param items - Array of navigation items
 * @param options - Navigation options
 * @returns Tuple of [activeId, setActiveId]
 *
 * @example
 * const items = [
 *   { id: '1', label: 'Item 1', ref: ref1 },
 *   { id: '2', label: 'Item 2', ref: ref2 },
 *   { id: '3', label: 'Item 3', ref: ref3 },
 * ];
 *
 * const [activeId, setActiveId] = useKeyboardNavigation(items, {
 *   loop: true,
 *   onSelect: (item) => handleSelect(item),
 * });
 *
 * return items.map((item) => (
 *   <button
 *     key={item.id}
 *     ref={item.ref}
 *     aria-selected={activeId === item.id}
 *     onClick={() => setActiveId(item.id)}
 *   >
 *     {item.label}
 *   </button>
 * ));
 */
export const useKeyboardNavigation = (
  items: KeyboardNavigationItem[],
  options: {
    loop?: boolean;
    onSelect?: (item: KeyboardNavigationItem) => void;
    onNavigate?: (index: number) => void;
  } = {}
): [string | null, (id: string | null) => void] => {
  const { loop = true, onSelect, onNavigate } = options;
  const [activeId, setActiveId] = useState<string | null>(
    items.length > 0 ? items[0].id : null
  );

  // Handle keyboard events
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      const activeIndex = items.findIndex((item) => item.id === activeId);

      if (activeIndex === -1) return;

      let newIndex = activeIndex;
      let handled = false;

      // Arrow keys
      if (isArrowKey(e)) {
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
      if (isActivationKey(e)) {
        const activeItem = items[activeIndex];
        if (activeItem && !activeItem.disabled) {
          if (activeItem.onSelect) {
            activeItem.onSelect();
          }
          onSelect?.(activeItem);
          handled = true;
        }
      }

      if (handled) {
        e.preventDefault();

        const newItem = items[newIndex];
        if (newItem && !newItem.disabled) {
          setActiveId(newItem.id);
          onNavigate?.(newIndex);
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
  }, [items, activeId, loop, onSelect, onNavigate]);

  // Focus the active item
  useEffect(() => {
    const activeItem = items.find((item) => item.id === activeId);
    if (activeItem?.ref?.current instanceof HTMLElement) {
      activeItem.ref.current.focus();
    }
  }, [items, activeId]);

  return [activeId, setActiveId];
};
