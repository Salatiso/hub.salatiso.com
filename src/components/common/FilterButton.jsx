import { memo } from 'react';

/**
 * FilterButton Component
 * Reusable filter button with active state styling
 * Memoized to prevent unnecessary re-renders
 */
function FilterButton({
  isActive,
  onClick,
  children,
  activeClass = 'bg-blue-600 text-white',
  inactiveClass = 'bg-gray-200 text-gray-700 hover:bg-gray-300',
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive ? activeClass : inactiveClass
      }`}
      aria-pressed={isActive}
    >
      {children}
    </button>
  );
}

export default memo(FilterButton);
