// src/utils/navigationHelpers.ts

/**
 * Build a context-aware navigation path
 * @param basePath - Base path (e.g., '/calendar', '/assets', '/projects')
 * @param context - Context parameter (e.g., 'individual', 'family', 'professional')
 * @returns Path with context query parameter
 */
export const buildContextPath = (basePath: string, context?: string): string => {
  if (!context) return basePath;

  const separator = basePath.includes('?') ? '&' : '?';
  return `${basePath}${separator}context=${context}`;
};

/**
 * Extract context from URL search params
 * @param searchParams - URLSearchParams object
 * @returns Context value or 'individual' as default
 */
export const getContextFromParams = (
  searchParams: URLSearchParams
): 'individual' | 'family' | 'professional' | 'community' => {
  const context = searchParams.get('context');
  if (['family', 'professional', 'community'].includes(context || '')) {
    return context as any;
  }
  return 'individual';
};

/**
 * Navigate to a context-aware route
 * @param navigate - React Router navigate function
 * @param path - Target path
 * @param context - Optional context
 */
export const navigateToContext = (
  navigate: any,
  path: string,
  context?: string
): void => {
  const contextPath = buildContextPath(path, context);
  navigate(contextPath);
};

/**
 * Check if a path is currently active
 * @param currentPath - Current pathname
 * @param targetPath - Target path to check
 * @returns True if paths match (ignoring query params)
 */
export const isPathActive = (currentPath: string, targetPath: string): boolean => {
  const baseCurrent = currentPath.split('?')[0];
  const baseTarget = targetPath.split('?')[0];
  return baseCurrent === baseTarget;
};

/**
 * Check if a URL is external (absolute URL)
 * @param url - URL to check
 * @returns True if URL is external
 */
export const isExternalUrl = (url: string): boolean => {
  try {
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

/**
 * Get icon name safely
 * @param icon - Icon name or component
 * @returns Icon name as string
 */
export const getIconName = (icon: string): string => {
  if (typeof icon === 'string') return icon;
  return 'ChevronRight'; // Fallback
};
