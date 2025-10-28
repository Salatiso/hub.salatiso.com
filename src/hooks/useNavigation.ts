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

export default useNavigation;
