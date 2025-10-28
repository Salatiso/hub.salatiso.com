import { memo } from 'react';

/**
 * DetailRow Component
 * Displays a detail row with icon and value
 * Memoized to prevent unnecessary re-renders
 */
function DetailRow({ icon: Icon, label, value, containerClass = '' }) {
  return (
    <div className={`flex items-center gap-2 ${containerClass}`}>
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      {label && <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>}
      {value && <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>}
    </div>
  );
}

export default memo(DetailRow);
