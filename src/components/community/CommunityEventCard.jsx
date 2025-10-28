import { memo } from 'react';
import { SealBadge } from '../events/LifeSyncSeal';

/**
 * CommunityEventCard Component
 * Displays a single community event
 * Memoized to prevent unnecessary re-renders
 */
function CommunityEventCard({
  event,
  onEdit,
  isEventCompleted,
  onCancel,
}) {
  const statusColor = {
    approved: 'bg-green-100 text-green-800',
    pending_approval: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div key={event.id} className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm border">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold">{event.title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {event.description}
          </p>
        </div>
        <div className="text-right">
          <SealBadge event={event} />
          <div
            className={`mt-2 px-2 py-1 rounded text-xs ${
              statusColor[event.status] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {event.status.replace('_', ' ')}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="font-medium">Dates:</span>
          {event.dates ? (
            event.dates.map((d, idx) => (
              <div key={idx} className="ml-2">
                {d.label && <span>{d.label}: </span>}
                {d.date} {d.startTime}-{d.endTime}
              </div>
            ))
          ) : (
            <div>
              {event.date} {event.startTime}-{event.endTime}
            </div>
          )}
        </div>
        <div>
          <span className="font-medium">Locations:</span>
          {event.locations ? (
            event.locations.map((l, idx) => (
              <div key={idx} className="ml-2">
                {l.label && <span>{l.label}: </span>}
                {l.address}
              </div>
            ))
          ) : (
            <div>{event.location?.address || 'N/A'}</div>
          )}
        </div>
        <div>
          <span className="font-medium">Type:</span> {event.type}
        </div>
        <div>
          <span className="font-medium">Attendees:</span>{' '}
          {event.attendees?.accepted?.length || 0}
        </div>
      </div>
      <div className="mt-3 flex space-x-2">
        {!isEventCompleted(event) && (
          <button
            onClick={() => onEdit(event)}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Edit Event
          </button>
        )}
        <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
          View Details
        </button>
        {(event.status === 'pending_approval' || event.status === 'approved') && (
          <button
            onClick={() => onCancel(event.id)}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Cancel Event
          </button>
        )}
      </div>
    </div>
  );
}

export default memo(CommunityEventCard);
