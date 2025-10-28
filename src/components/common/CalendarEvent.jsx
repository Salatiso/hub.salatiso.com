import { memo } from 'react';
import { Clock, MapPin, Users, Bell, Repeat2, Edit2, Trash2 } from 'lucide-react';

/**
 * CalendarEvent Component
 * Displays a single calendar event in the events list
 * Memoized to prevent re-renders of unchanged events
 */
function CalendarEvent({ event, categoryColors, onEdit, onDelete }) {
  return (
    <div
      key={event.id}
      className={`border-l-4 rounded-lg p-4 hover:shadow-md transition-shadow ${
        categoryColors[event.category] || categoryColors.personal
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold">{event.title}</h3>
            {event.recurring !== 'none' && <Repeat2 className="w-4 h-4" />}
            {event.reminder !== 'none' && <Bell className="w-4 h-4" />}
          </div>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {event.date} {event.time && `${event.time}`}{' '}
              {event.endTime && `- ${event.endTime}`}
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {event.location}
              </div>
            )}
            {event.attendees && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {event.attendees}
              </div>
            )}
          </div>
          {event.description && (
            <p className="mt-2 text-sm">{event.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(event)}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
            aria-label={`Edit event: ${event.title}`}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(event.id)}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
            aria-label={`Delete event: ${event.title}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(CalendarEvent);
