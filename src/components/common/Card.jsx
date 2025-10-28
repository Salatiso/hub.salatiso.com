import { memo } from 'react';

/**
 * Card Component
 * Base card wrapper with optional header and footer
 * Memoized to prevent unnecessary re-renders
 */
function Card({
  children,
  header,
  footer,
  className = '',
  headerClass = '',
  footerClass = '',
  borderClass = 'border-l-4 border-blue-500',
}) {
  return (
    <div
      className={`rounded-lg p-6 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow ${borderClass} ${className}`}
    >
      {header && (
        <div className={`mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 ${headerClass}`}>
          {header}
        </div>
      )}
      <div>{children}</div>
      {footer && (
        <div className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 ${footerClass}`}>
          {footer}
        </div>
      )}
    </div>
  );
}

export default memo(Card);
