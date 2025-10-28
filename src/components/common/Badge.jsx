import { memo } from 'react';

/**
 * Badge Component
 * Simple badge display component
 * Memoized to prevent unnecessary re-renders
 */
function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon = null,
  className = '',
}) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${
        variantClasses[variant]
      } ${sizeClasses[size]} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}

export default memo(Badge);
