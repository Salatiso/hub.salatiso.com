// src/hooks/useMediaQuery.ts
import { useState, useEffect } from 'react';

/**
 * Hook to detect if a media query matches
 * @param query - Media query string (e.g., '(max-width: 1024px)')
 * @returns Boolean indicating if query matches
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Add listener
    mediaQuery.addEventListener('change', handleChange);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
};

export default useMediaQuery;
