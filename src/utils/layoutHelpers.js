/**
 * Layout Utilities - Phase 2.2
 * Provides consistent page container and responsive padding helpers
 */

/**
 * Get standard page container classes
 * Provides consistent max-width, padding, and margin for all pages
 * Automatically accounts for sidebar on different screen sizes
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.fullWidth - If true, remove max-width constraints (default: false)
 * @param {boolean} options.noPadding - If true, remove all padding (default: false)
 * @param {string} options.bgColor - Background color class (default: none)
 * @returns {string} Tailwind class string
 */
export const getPageContainerClasses = (options = {}) => {
  const {
    fullWidth = false,
    noPadding = false,
    bgColor = ''
  } = options;

  const baseClasses = [];
  
  // Width constraints
  if (fullWidth) {
    baseClasses.push('w-full');
  } else {
    baseClasses.push('max-w-7xl mx-auto');
  }
  
  // Padding
  if (!noPadding) {
    baseClasses.push('px-4 sm:px-6 lg:px-8');
  }
  
  // Vertical padding
  if (!noPadding) {
    baseClasses.push('py-6 sm:py-8 lg:py-10');
  }
  
  // Background
  if (bgColor) {
    baseClasses.push(bgColor);
  }
  
  return baseClasses.join(' ');
};

/**
 * Get standard page header classes
 * For consistent page titles and descriptions
 */
export const getPageHeaderClasses = () => {
  return 'mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4';
};

/**
 * Get standard page title classes
 */
export const getPageTitleClasses = () => {
  return 'text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white';
};

/**
 * Get standard page description classes
 */
export const getPageDescriptionClasses = () => {
  return 'mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400';
};

/**
 * Get responsive grid container classes
 * Provides responsive column layouts for dashboard widgets and cards
 * 
 * @param {number} defaultCols - Number of columns on mobile (default: 1)
 * @returns {string} Tailwind grid class string
 */
export const getResponsiveGridClasses = (defaultCols = 1) => {
  const colMappings = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };
  
  return `grid ${colMappings[defaultCols] || colMappings[1]} gap-6`;
};

/**
 * Get card wrapper classes
 * Standard styling for card containers
 */
export const getCardClasses = () => {
  return 'bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md dark:hover:shadow-xl transition-shadow';
};

/**
 * Get button group classes
 * For action buttons at the end of forms or headers
 */
export const getButtonGroupClasses = () => {
  return 'flex gap-3 self-start sm:self-auto flex-wrap sm:flex-nowrap';
};

/**
 * Get form container classes
 */
export const getFormContainerClasses = () => {
  return 'space-y-6 sm:space-y-8';
};

/**
 * Get form section classes
 */
export const getFormSectionClasses = () => {
  return 'space-y-4';
};

/**
 * Get responsive sidebar-aware page wrapper
 * This should wrap the entire page content within a page component
 * 
 * @param {Object} options - Configuration options
 * @returns {string} Tailwind class string
 */
export const getResponsivePageWrapper = (options = {}) => {
  const {
    minHeight = 'min-h-screen',
    bgGradient = false,
    bgColor = ''
  } = options;

  const classes = [minHeight];
  
  if (bgGradient) {
    classes.push('bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800');
  } else if (bgColor) {
    classes.push(bgColor);
  } else {
    classes.push('bg-white dark:bg-gray-800');
  }
  
  return classes.join(' ');
};

/**
 * Breakpoint utilities for conditional rendering
 */
export const BREAKPOINTS = {
  mobile: '(max-width: 640px)',
  tablet: '(min-width: 641px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)'
};

/**
 * Spacing utilities
 */
export const SPACING = {
  pageGap: 'gap-6 sm:gap-8 lg:gap-10',
  sectionGap: 'gap-4 sm:gap-6',
  cardGap: 'gap-3 sm:gap-4'
};

/**
 * Example usage in a page component:
 * 
 * import {
 *   getPageContainerClasses,
 *   getPageHeaderClasses,
 *   getPageTitleClasses,
 *   getResponsiveGridClasses,
 *   getCardClasses
 * } from '../utils/layoutHelpers';
 * 
 * const MyPage = () => {
 *   return (
 *     <div className={getPageContainerClasses()}>
 *       <div className={getPageHeaderClasses()}>
 *         <h1 className={getPageTitleClasses()}>Page Title</h1>
 *       </div>
 *       <div className={getResponsiveGridClasses(3)}>
 *         Grid items go here
 *       </div>
 *     </div>
 *   );
 * };
 */

export default {
  getPageContainerClasses,
  getPageHeaderClasses,
  getPageTitleClasses,
  getPageDescriptionClasses,
  getResponsiveGridClasses,
  getCardClasses,
  getButtonGroupClasses,
  getFormContainerClasses,
  getFormSectionClasses,
  getResponsivePageWrapper,
  BREAKPOINTS,
  SPACING
};
