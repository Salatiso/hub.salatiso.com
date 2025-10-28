import { memo } from 'react';

/**
 * TabGroup Component
 * Reusable tab navigation component
 * Memoized to prevent unnecessary re-renders
 */
function TabGroup({
  tabs,
  activeTab,
  onChange,
  containerClass = 'bg-gray-100 dark:bg-gray-800 p-1 rounded-lg',
  activeClass = 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm',
  inactiveClass = 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
}) {
  return (
    <div className={containerClass}>
      <div className="flex space-x-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 py-3 px-6 rounded-md text-sm font-medium transition-colors capitalize ${
              activeTab === tab.id ? activeClass : inactiveClass
            }`}
            aria-selected={activeTab === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default memo(TabGroup);
