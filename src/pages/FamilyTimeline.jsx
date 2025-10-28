import { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { Plus, Trash2, Calendar, Heart, AlertCircle, Check, Zap, Edit2, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import GuestContext from '../contexts/GuestContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import TimelineEvent from '../components/family/TimelineEvent';
import { getPageContainerClasses, getPageHeaderClasses, getPageTitleClasses } from '../utils/layoutHelpers';

/**
 * Family Timeline Page - Enhanced with Firestore Integration
 * Timeline of important family events with:
 * - Real-time sync across ecosystem
 * - Event filtering by type
 * - Enhanced event details
 * - Improved timeline visualization
 * - App-origin tracking for cross-app updates
 */
export default function FamilyTimeline() {
  const { guestData, updateGuestData } = useContext(GuestContext);
  const { user } = useAuth();
  const [events, setEvents] = useState(guestData?.familyEvents || []);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
    type: 'milestone',
    participants: '',
    photoUrl: '',
  });

  // Load events from Firestore
  useEffect(() => {
    if (!user) return;

    const loadFromFirebase = async () => {
      try {
        setSyncStatus('syncing');
        const docRef = doc(db, 'users', user.uid, 'family', 'events');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().items) {
          const familyEvents = docSnap.data().items.sort((a, b) => new Date(b.date) - new Date(a.date));
          setEvents(familyEvents);
          updateGuestData(prev => ({ ...prev, familyEvents }));
          setSyncStatus('success');
          setLastSyncTime(new Date());
        }
      } catch (error) {
        console.error('Error loading family events:', error);
        setSyncStatus('error');
      }
    };

    loadFromFirebase();

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid, 'family', 'events'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.items && data.lastUpdatedBy !== 'lifesync') {
          // Cross-app update detected
          const familyEvents = data.items.sort((a, b) => new Date(b.date) - new Date(a.date));
          setEvents(familyEvents);
          updateGuestData(prev => ({ ...prev, familyEvents }));
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  const saveToFirebase = async (familyEvents) => {
    if (!user) return;
    try {
      setSyncStatus('syncing');
      const docRef = doc(db, 'users', user.uid, 'family', 'events');
      await updateDoc(docRef, {
        items: familyEvents,
        lastUpdatedBy: 'lifesync',
        updatedAt: serverTimestamp(),
      });
      setSyncStatus('success');
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      setSyncStatus('error');
    }
  };

  const saveEvents = (updatedEvents) => {
    setEvents(updatedEvents);
    updateGuestData(prev => ({
      ...prev,
      familyEvents: updatedEvents,
    }));
    // Save to Firestore if user is authenticated
    if (user) {
      saveToFirebase(updatedEvents);
    }
  };

  const handleAddEvent = useCallback(() => {
    if (!formData.title || !formData.date) {
      alert('Please fill in title and date');
      return;
    }
    const newEvent = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: 'lifesync',
    };
    if (editingEvent) {
      // Update existing event
      saveEvents(events.map(e => e.id === editingEvent.id ? newEvent : e).sort((a, b) => new Date(b.date) - new Date(a.date)));
      setEditingEvent(null);
    } else {
      // Add new event
      saveEvents([...events, newEvent].sort((a, b) => new Date(b.date) - new Date(a.date)));
    }
    setFormData({
      title: '',
      date: '',
      description: '',
      type: 'milestone',
      participants: '',
      photoUrl: '',
    });
    setShowForm(false);
  }, [formData, editingEvent, events]);

  const handleEditEvent = useCallback((event) => {
    setEditingEvent(event);
    setFormData(event);
    setShowForm(true);
  }, []);

  const handleDeleteEvent = useCallback((id) => {
    if (confirm('Delete this event?')) {
      saveEvents(events.filter(e => e.id !== id));
    }
  }, [events]);

  const eventTypeColors = {
    milestone: 'bg-blue-100 text-blue-800 border-blue-300',
    birthday: 'bg-pink-100 text-pink-800 border-pink-300',
    anniversary: 'bg-red-100 text-red-800 border-red-300',
    celebration: 'bg-green-100 text-green-800 border-green-300',
    memorial: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  const eventTypeEmoji = {
    milestone: '📍',
    birthday: '🎂',
    anniversary: '💕',
    celebration: '🎉',
    memorial: '🕯️',
  };

  const filteredEvents = useMemo(() =>
    filterType === 'all' 
      ? events 
      : events.filter(e => e.type === filterType),
    [filterType, events]
  );

  const eventStats = useMemo(() => ({
    total: events.length,
    birthdays: events.filter(e => e.type === 'birthday').length,
    anniversaries: events.filter(e => e.type === 'anniversary').length,
    celebrations: events.filter(e => e.type === 'celebration').length,
    milestones: events.filter(e => e.type === 'milestone').length,
    memorials: events.filter(e => e.type === 'memorial').length,
  }), [events]);

  return (
    <div className={getPageContainerClasses()}>
      {/* Header */}
      <div className={getPageHeaderClasses()}>
        <div className="flex items-center gap-3">
          <h1 className={getPageTitleClasses()}>Family Timeline</h1>
          {/* Sync Status */}
          <div className="flex items-center gap-2 text-sm">
            {syncStatus === 'syncing' && (
              <div className="flex items-center gap-1 text-blue-600">
                <Zap className="w-4 h-4 animate-spin" />
                Syncing...
              </div>
            )}
            {syncStatus === 'success' && (
              <div className="flex items-center gap-1 text-green-600">
                <Check className="w-4 h-4" />
                Synced
              </div>
            )}
            {syncStatus === 'error' && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertCircle className="w-4 h-4" />
                Error
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            to="/family"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Family
          </Link>
          <button
            onClick={() => {
              if (editingEvent) {
                setEditingEvent(null);
                setFormData({
                  title: '',
                  date: '',
                  description: '',
                  type: 'milestone',
                  participants: '',
                  photoUrl: '',
                });
              }
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            {editingEvent ? 'Cancel' : 'Add Event'}
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      {events.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Events ({events.length})
          </button>
          <button
            onClick={() => setFilterType('milestone')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === 'milestone'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📍 Milestones ({eventStats.milestones})
          </button>
          <button
            onClick={() => setFilterType('birthday')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === 'birthday'
                ? 'bg-pink-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🎂 Birthdays ({eventStats.birthdays})
          </button>
          <button
            onClick={() => setFilterType('anniversary')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === 'anniversary'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            💕 Anniversaries ({eventStats.anniversaries})
          </button>
          <button
            onClick={() => setFilterType('celebration')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === 'celebration'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🎉 Celebrations ({eventStats.celebrations})
          </button>
          <button
            onClick={() => setFilterType('memorial')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === 'memorial'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🕯️ Memorials ({eventStats.memorials})
          </button>
        </div>
      )}

      {/* Add/Edit Event Form */}
      {showForm && (
        <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">
            {editingEvent ? 'Edit Family Event' : 'Add Family Event'}
          </h2>
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
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Event type"
            >
              <option value="milestone">Milestone</option>
              <option value="birthday">Birthday</option>
              <option value="anniversary">Anniversary</option>
              <option value="celebration">Celebration</option>
              <option value="memorial">Memorial</option>
            </select>
            <input
              type="text"
              placeholder="Participants"
              value={formData.participants}
              onChange={(e) => setFormData({...formData, participants: e.target.value})}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Participants"
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              aria-label="Event description"
            />
            <input
              type="url"
              placeholder="Photo URL (optional)"
              value={formData.photoUrl}
              onChange={(e) => setFormData({...formData, photoUrl: e.target.value})}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Photo URL"
            />
          </div>
          <div className="flex gap-3 justify-end mt-4">
            <button
              onClick={() => {
                setShowForm(false);
                setEditingEvent(null);
                setFormData({
                  title: '',
                  date: '',
                  description: '',
                  type: 'milestone',
                  participants: '',
                  photoUrl: '',
                });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddEvent}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              aria-label={editingEvent ? 'Update event' : 'Add event'}
            >
              <Plus className="w-4 h-4" />
              {editingEvent ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      {filteredEvents.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center text-gray-500">
          <p className="text-lg mb-4">
            {filterType === 'all' ? 'No family events yet' : `No ${filterType} events found`}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            aria-label="Add first event"
          >
            <Plus className="w-4 h-4" />
            {filterType === 'all' ? 'Add First Event' : 'Add Event'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Timeline line and events */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-300 to-purple-300"></div>

            {/* Events */}
            {filteredEvents.map((event) => (
              <TimelineEvent
                key={event.id}
                event={event}
                eventTypeEmoji={eventTypeEmoji}
                eventTypeColors={eventTypeColors}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
              />
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      {events.length > 0 && (
        <div className="mt-12 grid grid-cols-3 md:grid-cols-6 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-blue-600">{eventStats.total}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-blue-600">{eventStats.milestones}</div>
            <div className="text-xs text-gray-600">Milestones</div>
          </div>
          <div className="bg-pink-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-pink-600">{eventStats.birthdays}</div>
            <div className="text-xs text-gray-600">Birthdays</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-red-600">{eventStats.anniversaries}</div>
            <div className="text-xs text-gray-600">Anniversaries</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-green-600">{eventStats.celebrations}</div>
            <div className="text-xs text-gray-600">Celebrations</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-gray-600">{eventStats.memorials}</div>
            <div className="text-xs text-gray-600">Memorials</div>
          </div>
        </div>
      )}
    </div>
  );
}
