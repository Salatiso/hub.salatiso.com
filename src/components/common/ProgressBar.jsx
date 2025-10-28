import { memo } from 'react';

/**
 * ProgressBar Component
 * Displays progress with percentage
 * Memoized to prevent unnecessary re-renders
 */
function ProgressBar({
  progress = 0,
  label = 'Progress',
  showPercentage = true,
  barColor = 'bg-blue-600',
  containerClass = 'w-full',
}) {
  const validProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={containerClass}>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        {showPercentage && (
          <span className="text-sm font-bold">{validProgress}%</span>
        )}
      </div>
      <div className="w-full bg-gray-300 bg-opacity-30 rounded-full h-2">
        <div
          className={`${barColor} h-2 rounded-full transition-all`}
          style={{ width: `${validProgress}%` }}
        />
      </div>
    </div>
  );
}

export default memo(ProgressBar);
