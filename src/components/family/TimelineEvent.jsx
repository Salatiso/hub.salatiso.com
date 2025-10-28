import { memo } from 'react';
import { Calendar, Edit2, Trash2 } from 'lucide-react';

/**
 * TimelineEvent Component
 * Displays a single event in the family timeline
 * Memoized to prevent re-renders of unchanged events in list
 */
function TimelineEvent({
  event,
  eventTypeEmoji,
  eventTypeColors,
  onEdit,
  onDelete,
}) {
  return (
    <div key={event.id} className="relative mb-8 ml-20">
      {/* Timeline dot */}
      <div
        className={`absolute -left-16 top-1 w-5 h-5 rounded-full border-4 border-white ${
          event.type === 'birthday'
            ? 'bg-pink-600'
            : event.type === 'anniversary'
              ? 'bg-red-600'
              : event.type === 'celebration'
                ? 'bg-green-600'
                : event.type === 'memorial'
                  ? 'bg-gray-600'
                  : 'bg-blue-600'
        }`}
      />

      {/* Event card */}
      <div
        className={`bg-white rounded-lg shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow ${
          eventTypeColors[event.type]
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-bold">
              {eventTypeEmoji[event.type]} {event.title}
            </h3>
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <Calendar className="w-4 h-4" />
              {new Date(event.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 text-xs rounded-full capitalize font-medium ${
                eventTypeColors[event.type]
              }`}
            >
              {event.type}
            </span>
            <button
              onClick={() => onEdit(event)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              aria-label={`Edit event: ${event.title}`}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(event.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              aria-label={`Delete event: ${event.title}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {event.photoUrl && (
          <img
            src={event.photoUrl}
            alt={event.title}
            className="w-full h-40 object-cover rounded-lg my-3"
          />
        )}

        {event.description && (
          <p className="text-gray-700 mt-2">{event.description}</p>
        )}

        {event.participants && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Participants:</strong> {event.participants}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(TimelineEvent);
