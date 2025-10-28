/**
 * CalendarWidget Component - Real Data Integration (Phase 3)
 * Displays upcoming events from Firestore
 */

import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Plus, Loader, AlertCircle } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { useUserId } from '../../context/UserContext';
import { useCalendar } from '../../hooks/useFirebaseData';

const CalendarWidget = () => {
  const userId = useUserId();
  const { data: upcomingEvents, loading, error } = useCalendar(userId);

  if (error) {
    return (
      <WidgetCard icon={AlertCircle} title="Calendar">
        <div className="flex items-center justify-center h-40 text-red-600">
          <AlertCircle className="w-8 h-8 mr-2" />
          <p>{error}</p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      icon={Calendar}
      title="Calendar"
      actions={[
        {
          label: 'Add Event',
          icon: Plus,
          onClick: () => window.location.href = '/calendar',
        },
        {
          label: 'Import Calendar',
          icon: Calendar,
          onClick: () => alert('Import feature coming soon'),
        },
      ]}
    >
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Upcoming Events */}
          {upcomingEvents && upcomingEvents.length > 0 ? (
            <>
              {upcomingEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{event.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {event.startDate instanceof Date 
                        ? event.startDate.toLocaleString() 
                        : event.startDate}
                    </p>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 dark:text-gray-400">No upcoming events</p>
            </div>
          )}

          {/* View All Button */}
          <Link
            to="/calendar"
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium mt-2"
          >
            <span>View Calendar</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </WidgetCard>
  );
};

export default CalendarWidget;
