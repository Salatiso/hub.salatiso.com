import { memo } from 'react';

/**
 * ConnectCard Component
 * Displays a connection card with icon, title, and description
 * Memoized to prevent unnecessary re-renders
 */
function ConnectCard({ icon: Icon, title, description, onClick }) {
  return (
    <div className="rounded-xl border bg-white dark:bg-gray-800 p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <Icon className="h-8 w-8 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 flex-1">
        {description}
      </p>
      <button
        onClick={onClick}
        className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
      >
        Learn More
      </button>
    </div>
  );
}

export default memo(ConnectCard);
