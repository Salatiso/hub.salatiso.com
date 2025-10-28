/**
 * GoalsWidget Component - Real Data Integration (Phase 3)
 * Displays personal goals and progress from Firestore
 */

import { Link } from 'react-router-dom';
import { Target, ArrowRight, Plus, Flame, Loader, AlertCircle } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { useUserId } from '../../context/UserContext';
import { useGoals } from '../../hooks/useFirebaseData';

const GoalsWidget = () => {
  const userId = useUserId();
  const { data: goals, loading, error } = useGoals(userId);

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-blue-500',
      paused: 'bg-gray-400',
      completed: 'bg-green-500',
    };
    return colors[status] || colors.active;
  };

  if (error) {
    return (
      <WidgetCard icon={AlertCircle} title="Goals">
        <div className="flex items-center justify-center h-40 text-red-600">
          <AlertCircle className="w-8 h-8 mr-2" />
          <p>{error}</p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      icon={Target}
      title="Goals"
      actions={[
        {
          label: 'New Goal',
          icon: Plus,
          onClick: () => window.location.href = '/goals/new',
        },
        {
          label: 'All Goals',
          icon: Target,
          onClick: () => window.location.href = '/goals',
        },
      ]}
    >
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Goals List */}
          {goals && goals.length > 0 ? (
            <>
              {goals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {goal.title}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      {Math.round(goal.progress || 0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`${getStatusColor(goal.status)} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${goal.progress || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 dark:text-gray-400">No goals yet</p>
            </div>
          )}

          {/* View All Button */}
          <Link
            to="/goals"
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium mt-2"
          >
            <span>View All Goals</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </WidgetCard>
  );
};

export default GoalsWidget;
