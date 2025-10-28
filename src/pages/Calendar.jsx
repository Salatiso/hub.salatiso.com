import { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock, MapPin, Bell, Repeat2, Users, AlertCircle, Trash2, Edit2, Calendar as CalendarIcon, Zap } from 'lucide-react';
import GuestContext from '../contexts/GuestContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, serverTimestamp, onSnapshot, collection, query, where } from 'firebase/firestore';
import CalendarEvent from '../components/common/CalendarEvent';
import { getPageContainerClasses, getPageHeaderClasses, getPageTitleClasses } from '../utils/layoutHelpers';

/**
 * Advanced Calendar Component
 * Event scheduling and management with:
 * - Month/week/day views
 * - Event categories and color coding
 * - Reminders and recurring events
 * - Conflict detection
 * - Firestore integration for cross-app sync
 * - Real-time updates from other ecosystem apps
 */
export default function Calendar() {
  const { guestData, updateGuestData } = useContext(GuestContext);
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState(guestData?.calendarEvents || []);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    endTime: '',
    location: '',
    description: '',
    attendees: '',
    category: 'personal',
    reminder: '30min',
    recurring: 'none',
    color: 'blue',
  });

  // Load events from Firebase
  useEffect(() => {
    if (!user) return;

    const loadFromFirebase = async () => {
      try {
        setSyncStatus('syncing');
        const docRef = doc(db, 'users', user.uid, 'calendar', 'events');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setEvents(data.events || []);
          setLastSyncTime(data.lastUpdatedAt);
        }
        setSyncStatus('success');
      } catch (error) {
        console.error('Error loading calendar:', error);
        setSyncStatus('error');
      }
    };

    loadFromFirebase();

    // Real-time listener for updates from other apps
    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid, 'calendar', 'events'),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setEvents(data.events || []);
          setLastSyncTime(data.lastUpdatedAt);
        }
      },
      (error) => console.error('Error listening to calendar:', error)
    );

    return unsubscribe;
  }, [user]);

  // Save events to Firestore
  const saveToFirebase = async (updatedEvents) => {
    if (!user) return;
    try {
      setSyncStatus('syncing');
      const docRef = doc(db, 'users', user.uid, 'calendar', 'events');
      await updateDoc(docRef, {
        events: updatedEvents,
        lastUpdatedBy: 'lifesync',
        lastUpdatedAt: serverTimestamp(),
      });
      setLastSyncTime(new Date());
      setSyncStatus('success');
    } catch (error) {
      console.error('Error saving calendar:', error);
      setSyncStatus('error');
    }
  };

  // Save events to GuestContext and Firebase
  const saveEvents = (updatedEvents) => {
    setEvents(updatedEvents);
    updateGuestData(prev => ({
      ...prev,
      calendarEvents: updatedEvents,
    }));
    saveToFirebase(updatedEvents);
  };

  // Add or update event
  const handleSaveEvent = useCallback(() => {
    if (!formData.title || !formData.date) {
      alert('Please fill in title and date');
      return;
    }

    // Check for conflicts
    const conflicts = events.filter(e => 
      e.date === formData.date && 
      e.time && formData.time &&
      !(formData.endTime < e.time || formData.time > (e.endTime || e.time))
    );

    if (conflicts.length > 0 && !editingEvent) {
      alert('⚠️ Time conflict detected with existing event(s)');
      return;
    }

    if (editingEvent) {
      const updated = events.map(e => e.id === editingEvent.id ? {
        ...editingEvent,
        ...formData
      } : e);
      saveEvents(updated);
      setEditingEvent(null);
    } else {
      const newEvent = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      saveEvents([...events, newEvent]);
    }

    setFormData({
      title: '',
      date: '',
      time: '',
      endTime: '',
      location: '',
      description: '',
      attendees: '',
      category: 'personal',
      reminder: '30min',
      recurring: 'none',
      color: 'blue',
    });
    setShowEventForm(false);
  }, [formData, editingEvent, events]);

  // Edit event
  const handleEditEvent = useCallback((event) => {
    setEditingEvent(event);
    setFormData(event);
    setShowEventForm(true);
  }, []);

  // Delete event
  const handleDeleteEvent = useCallback((id) => {
    if (confirm('Delete this event?')) {
      saveEvents(events.filter(e => e.id !== id));
    }
  }, [events]);

  // Get days in month
  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month
  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Get events for date
  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.date === dateStr);
  };

  // Previous month
  const handlePrevMonth = useCallback(() => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  }, [currentDate]);

  // Next month
  const handleNextMonth = useCallback(() => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  }, [currentDate]);

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const days = [];
  const totalDays = daysInMonth(currentDate);
  const firstDay = firstDayOfMonth(currentDate);

  // Fill empty days
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Fill month days
  for (let i = 1; i <= totalDays; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const categoryColors = {
    personal: 'bg-blue-100 text-blue-800 border-blue-300',
    work: 'bg-purple-100 text-purple-800 border-purple-300',
    meeting: 'bg-orange-100 text-orange-800 border-orange-300',
    deadline: 'bg-red-100 text-red-800 border-red-300',
    birthday: 'bg-pink-100 text-pink-800 border-pink-300',
    holiday: 'bg-green-100 text-green-800 border-green-300',
  };

  const sortedEvents = useMemo(() =>
    events.sort((a, b) => new Date(a.date) - new Date(b.date)),
    [events]
  );

  return (
    <div className={getPageContainerClasses()}>
      {/* Header */}
      <div className={getPageHeaderClasses()}>
        <div>
          <h1 className={getPageTitleClasses()}>Calendar</h1>
          {lastSyncTime && (
            <p className="text-sm text-gray-600 mt-1">
              Last synced: {new Date(lastSyncTime).toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={() => { setShowEventForm(!showEventForm); setEditingEvent(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          aria-label="Add new event"
        >
          <Plus className="w-4 h-4" />
          New Event
        </button>
      </div>

      {/* Sync Status */}
      {syncStatus !== 'idle' && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          syncStatus === 'success' ? 'bg-green-50 text-green-700' :
          syncStatus === 'error' ? 'bg-red-50 text-red-700' :
          'bg-blue-50 text-blue-700'
        }`}>
          {syncStatus === 'syncing' && <Zap className="w-4 h-4 animate-spin" />}
          {syncStatus === 'success' && <Check className="w-4 h-4" />}
          {syncStatus === 'error' && <AlertCircle className="w-4 h-4" />}
          <span className="text-sm">
            {syncStatus === 'syncing' ? 'Syncing with Firebase...' :
             syncStatus === 'success' ? 'Synced successfully!' :
             'Sync error - changes saved locally'}
          </span>
        </div>
      )}

      {/* View Mode Selector */}
      <div className="flex gap-2 mb-6">
        {['month', 'week', 'day'].map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === mode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            aria-pressed={viewMode === mode}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      {/* Add/Edit Event Form */}
      {showEventForm && (
        <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
            <button onClick={() => { setShowEventForm(false); setEditingEvent(null); }} aria-label="Close form">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Event Title *"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Event title"
            />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Event date"
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Event category"
            >
              <option value="personal">Personal</option>
              <option value="work">Work</option>
              <option value="meeting">Meeting</option>
              <option value="deadline">Deadline</option>
              <option value="birthday">Birthday</option>
              <option value="holiday">Holiday</option>
            </select>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Event start time"
            />
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({...formData, endTime: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Event end time"
            />
            <input
              type="text"
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Event location"
            />
            <select
              value={formData.reminder}
              onChange={(e) => setFormData({...formData, reminder: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Reminder time"
            >
              <option value="none">No reminder</option>
              <option value="15min">15 minutes before</option>
              <option value="30min">30 minutes before</option>
              <option value="1hour">1 hour before</option>
              <option value="1day">1 day before</option>
            </select>
            <select
              value={formData.recurring}
              onChange={(e) => setFormData({...formData, recurring: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Recurring event"
            >
              <option value="none">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <input
              type="text"
              placeholder="Attendees (comma-separated)"
              value={formData.attendees}
              onChange={(e) => setFormData({...formData, attendees: e.target.value})}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Event attendees"
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              aria-label="Event description"
            />
          </div>
          <div className="flex gap-3 justify-end mt-4">
            <button
              onClick={() => { setShowEventForm(false); setEditingEvent(null); }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              aria-label="Cancel"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEvent}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              aria-label={editingEvent ? "Update event" : "Create event"}
            >
              <Plus className="w-4 h-4" />
              {editingEvent ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Month Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold">{monthName}</h2>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Next month"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-gray-50 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-4 font-bold text-center border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-0">
            {days.map((date, index) => {
              const dayEvents = date ? getEventsForDate(date) : [];
              const isToday = date && date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`min-h-32 p-2 border-r border-b last:border-r-0 ${
                    date ? (isToday ? 'bg-blue-50' : 'bg-white') : 'bg-gray-50'
                  }`}
                >
                  {date && (
                    <>
                      <div className={`font-bold mb-1 ${isToday ? 'text-blue-600 text-lg' : ''}`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-1 text-xs">
                        {dayEvents.slice(0, 3).map(event => (
                          <div
                            key={event.id}
                            className={`${categoryColors[event.category] || categoryColors.personal} p-1 rounded truncate hover:opacity-80 cursor-pointer border`}
                            onClick={() => handleEditEvent(event)}
                            title={event.title}
                          >
                            {event.time && `${event.time} `}{event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-gray-500 px-1">+{dayEvents.length - 3} more</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">
          <CalendarIcon className="w-6 h-6 inline-block mr-2" />
          Upcoming Events ({events.length})
        </h2>
        {events.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
            No events scheduled. <button onClick={() => setShowEventForm(true)} className="text-blue-600 underline">Create one!</button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedEvents.map(event => (
              <CalendarEvent
                key={event.id}
                event={event}
                categoryColors={categoryColors}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
