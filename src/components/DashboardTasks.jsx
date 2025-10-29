/**
 * Dashboard Tasks Component
 * Placeholder for Phase 1 - Shows progress card with task completion status
 * Phase 2: Will be expanded with full task list and modals
 * 
 * @module components/DashboardTasks
 */

import React, { useState } from 'react';

export function DashboardTasks() {
  const [tasksExpanded, setTasksExpanded] = useState(false);

  // Phase 2: Will fetch from profile context
  const completedTasks = 0;
  const totalTasks = 8;
  const progressPercent = (completedTasks / totalTasks) * 100;

  const tasksList = [
    { id: 'contact', title: 'Add Contact Info', icon: '📞' },
    { id: 'email-verify', title: 'Verify Email', icon: '✉️' },
    { id: 'phone-verify', title: 'Verify Phone', icon: '📱' },
    { id: 'identity', title: 'Upload ID (Optional)', icon: '🆔' },
    { id: 'address', title: 'Confirm Address', icon: '📍' },
    { id: 'services', title: 'Register Services', icon: '🎯' },
    { id: 'security', title: 'Upgrade Security', icon: '🔐' },
    { id: 'lifecv', title: 'Build LifeCV', icon: '📄' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setTasksExpanded(!tasksExpanded)}>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            ✨ Complete Your Profile
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Add more details to unlock trust points and features
          </p>
        </div>
        <div className="text-right ml-4 flex-shrink-0">
          <div className="text-2xl font-bold text-purple-600">
            {completedTasks}/{totalTasks}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">tasks</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          {completedTasks === totalTasks
            ? '🎉 Profile complete! You have maximum trust.'
            : `Complete ${totalTasks - completedTasks} more tasks to increase your trust score`}
        </p>
      </div>

      {/* Expandable Task List */}
      {tasksExpanded && (
        <div className="mb-6 space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
          {tasksList.map((task, idx) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-lg">{task.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
              </div>
              <div className="text-gray-400">→</div>
            </div>
          ))}
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={() => setTasksExpanded(!tasksExpanded)}
        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {tasksExpanded ? 'Collapse' : 'View All Tasks'} →
      </button>

      {/* Trust Score Info */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-900 dark:text-blue-100">
          <strong>💡 Pro Tip:</strong> Your trust score increases as you complete tasks. Higher trust = more bookings, better matches, and premium features!
        </p>
      </div>
    </div>
  );
}

export default DashboardTasks;
