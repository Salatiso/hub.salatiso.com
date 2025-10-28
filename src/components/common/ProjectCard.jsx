import { memo } from 'react';
import { Edit2, Trash2, Calendar, Target, Users } from 'lucide-react';

/**
 * ProjectCard Component
 * Displays a single project in the projects list
 * Memoized to prevent re-renders of unchanged projects
 */
function ProjectCard({
  project,
  statusColors,
  priorityColors,
  onEdit,
  onDelete,
}) {
  return (
    <div
      key={project.id}
      className={`rounded-lg p-6 hover:shadow-md transition-shadow ${
        statusColors[project.status] || statusColors.planned
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold">{project.name}</h3>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                statusColors[project.status] || statusColors.planned
              }`}
            >
              {project.status.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            {project.priority && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  priorityColors[project.priority]
                }`}
              >
                {project.priority.charAt(0).toUpperCase() +
                  project.priority.slice(1)}
              </span>
            )}
          </div>
          {project.description && (
            <p className="text-gray-700 mb-2">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(project)}
            className="p-2 text-blue-600 hover:bg-blue-200 rounded-lg"
            aria-label={`Edit project: ${project.name}`}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="p-2 text-red-600 hover:bg-red-200 rounded-lg"
            aria-label={`Delete project: ${project.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm font-bold">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-300 bg-opacity-30 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        {project.startDate && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Start: {project.startDate}</span>
          </div>
        )}
        {project.endDate && (
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span>End: {project.endDate}</span>
          </div>
        )}
        {project.team && (
          <div className="col-span-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="truncate">Team: {project.team}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ProjectCard);
