import { memo } from 'react';
import { Home, Users, Edit2, Trash2 } from 'lucide-react';

/**
 * HouseholdCard Component
 * Displays household information card
 * Memoized to prevent unnecessary re-renders
 */
function HouseholdCard({ household, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded">
            <Home className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold">{household.name || 'Household'}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {household.members?.length || 0} members
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(household)}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
            title="Edit household"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(household.id)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            title="Delete household"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {household.members && household.members.length > 0 && (
        <div className="mt-2 flex items-center gap-1">
          <Users className="h-4 w-4 text-gray-500" />
          <div className="flex gap-1">
            {household.members.slice(0, 3).map((member, idx) => (
              <div
                key={idx}
                className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium"
                title={member.name}
              >
                {member.name?.charAt(0) || '?'}
              </div>
            ))}
            {household.members.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium">
                +{household.members.length - 3}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(HouseholdCard);
