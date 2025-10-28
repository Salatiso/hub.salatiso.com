import { memo } from 'react';

/**
 * ActionButtonGroup Component
 * Displays a group of action buttons (edit, delete, etc)
 * Memoized to prevent unnecessary re-renders
 */
function ActionButtonGroup({ actions = [], size = 'md' }) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const buttonSizeClasses = {
    sm: 'p-1 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base',
  };

  return (
    <div className="flex gap-2">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <button
            key={index}
            onClick={action.onClick}
            className={`${buttonSizeClasses[size]} ${action.className || 'text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'}`}
            aria-label={action.label}
            title={action.label}
          >
            <Icon className={sizeClasses[size]} />
          </button>
        );
      })}
    </div>
  );
}

export default memo(ActionButtonGroup);
