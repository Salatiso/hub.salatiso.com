import { memo } from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * ErrorMessage Component
 * Pure presentational component for displaying error messages
 * Memoized to prevent unnecessary re-renders
 * 
 * @param {string} message - Error message to display
 * @param {Function} onDismiss - Optional dismiss handler
 */
function ErrorMessage({ message, onDismiss }) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-red-800 dark:text-red-300">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-600 hover:text-red-800 flex-shrink-0"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default memo(ErrorMessage);
