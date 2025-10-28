/**
 * WidgetCard Component - Phase 2
 * Base widget wrapper with consistent styling
 * Features:
 * - Card styling with shadow and border
 * - Header with icon and title
 * - Content area
 * - Action button/menu
 * - Dark mode support
 */

import { MoreVertical } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const WidgetCard = ({ 
  icon: Icon,
  title, 
  children, 
  actions = [],
  className = '',
  headerClassName = '',
  contentClassName = '',
}) => {
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef(null);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setShowActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-700 ${headerClassName}`}>
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>

        {/* Actions Menu */}
        {actions.length > 0 && (
          <div ref={actionsRef} className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="More actions"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {/* Actions Dropdown */}
            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-10 overflow-hidden border border-gray-200 dark:border-gray-600">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      action.onClick?.();
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
                  >
                    {action.icon && <action.icon className="h-4 w-4" />}
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`p-4 ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default WidgetCard;
