import { memo } from 'react';
import { Inbox } from 'lucide-react';

/**
 * EmptyState Component
 * Pure presentational component for displaying empty states
 * Memoized to prevent unnecessary re-renders
 * 
 * @param {string} title - Empty state title
 * @param {string} description - Empty state description (optional)
 * @param {Component} icon - Lucide icon component (optional)
 * @param {ReactNode} children - Additional content/actions (optional)
 */
function EmptyState({ title, description, icon: Icon = Inbox, children }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="flex justify-center mb-4">
        <Icon className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{description}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export default memo(EmptyState);
