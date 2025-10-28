import { memo } from 'react';

/**
 * StatCard Component
 * Pure presentational component for displaying statistics
 * Memoized to prevent unnecessary re-renders when parent updates
 * 
 * @param {string} title - Card title
 * @param {number|string} value - Statistic value to display
 * @param {Component} icon - Lucide icon component
 * @param {string} color - Tailwind background color class
 */
function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className={`${color} rounded-lg p-4 shadow-md`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

export default memo(StatCard);
