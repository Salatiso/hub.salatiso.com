import { memo } from 'react';

/**
 * StatusBadge Component
 * Displays status information with color-coding
 * Memoized to prevent unnecessary re-renders
 */
function StatusBadge({
  status,
  statusColors = {},
  icon: Icon = null,
  showIcon = true,
}) {
  const statusColor = statusColors[status] || 'bg-gray-100 text-gray-800';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${statusColor}`}
    >
      {showIcon && Icon && <Icon className="w-3 h-3 mr-1" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default memo(StatusBadge);
