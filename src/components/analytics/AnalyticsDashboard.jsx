import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { doc, getDoc, collection, onSnapshot } from 'firebase/firestore';
import { Users, Calendar, DollarSign, CheckCircle, TrendingUp, Clock, AlertCircle, Zap } from 'lucide-react';
import StatCard from '../common/StatCard';

/**
 * Analytics Dashboard Component
 * Comprehensive analytics across all family data with:
 * - Real-time data aggregation from Firestore
 * - Family member analytics
 * - Family event analytics
 * - Period-based filtering
 * - Sync status tracking
 */
export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalMembers: 0,
    emergencyContacts: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    eventsByType: {
      milestone: 0,
      birthday: 0,
      anniversary: 0,
      celebration: 0,
      memorial: 0,
    },
    upcomingBirthdays: [],
    upcomingAnniversaries: [],
  });
  const [period, setPeriod] = useState('all'); // all, month, year
  const [syncStatus, setSyncStatus] = useState('idle');
  const [familyMembers, setFamilyMembers] = useState([]);
  const [familyEvents, setFamilyEvents] = useState([]);

  // Load family members
  useEffect(() => {
    if (!user) return;

    setSyncStatus('syncing');
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid, 'family', 'members'), (snapshot) => {
      if (snapshot.exists() && snapshot.data().items) {
        setFamilyMembers(snapshot.data().items || []);
        setSyncStatus('success');
      }
    }, (error) => {
      console.error('Error loading family members:', error);
      setSyncStatus('error');
    });

    return () => unsubscribe();
  }, [user]);

  // Load family events
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid, 'family', 'events'), (snapshot) => {
      if (snapshot.exists() && snapshot.data().items) {
        setFamilyEvents(snapshot.data().items || []);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Calculate analytics
  useEffect(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter events based on period
    let filteredEvents = familyEvents;
    if (period === 'month') {
      filteredEvents = familyEvents.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
      });
    } else if (period === 'year') {
      filteredEvents = familyEvents.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate.getFullYear() === currentYear;
      });
    }

    // Count events by type
    const eventsByType = {
      milestone: filteredEvents.filter(e => e.type === 'milestone').length,
      birthday: filteredEvents.filter(e => e.type === 'birthday').length,
      anniversary: filteredEvents.filter(e => e.type === 'anniversary').length,
      celebration: filteredEvents.filter(e => e.type === 'celebration').length,
      memorial: filteredEvents.filter(e => e.type === 'memorial').length,
    };

    // Find upcoming events (next 30 days)
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingEvents = familyEvents.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate >= now && eventDate <= thirtyDaysFromNow;
    }).length;

    // Find upcoming birthdays
    const upcomingBirthdays = familyMembers
      .filter(m => m.dateOfBirth && m.dateOfBirth.length === 10)
      .map(m => {
        const birthDate = new Date(m.dateOfBirth);
        const nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
        if (nextBirthday < now) {
          nextBirthday.setFullYear(currentYear + 1);
        }
        return {
          name: m.name,
          date: nextBirthday,
          daysUntil: Math.ceil((nextBirthday - now) / (1000 * 60 * 60 * 24)),
        };
      })
      .filter(b => b.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 3);

    // Find upcoming anniversaries
    const upcomingAnniversaries = familyEvents
      .filter(e => e.type === 'anniversary' && e.date)
      .map(e => {
        const eventDate = new Date(e.date);
        const nextAnniversary = new Date(currentYear, eventDate.getMonth(), eventDate.getDate());
        if (nextAnniversary < now) {
          nextAnniversary.setFullYear(currentYear + 1);
        }
        return {
          title: e.title,
          date: nextAnniversary,
          daysUntil: Math.ceil((nextAnniversary - now) / (1000 * 60 * 60 * 24)),
        };
      })
      .filter(a => a.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 3);

    // Emergency contacts
    const emergencyContacts = familyMembers.filter(m => m.isEmergencyContact).length;

    setAnalytics({
      totalMembers: familyMembers.length,
      emergencyContacts,
      totalEvents: familyEvents.length,
      upcomingEvents,
      eventsByType,
      upcomingBirthdays,
      upcomingAnniversaries,
    });
  }, [familyMembers, familyEvents, period]);

  return (
    <div className="space-y-6">
      {/* Header with Sync Status */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex items-center gap-2">
          {syncStatus === 'syncing' && (
            <div className="flex items-center gap-1 text-blue-600 text-sm">
              <Zap className="w-4 h-4 animate-spin" />
              Updating...
            </div>
          )}
          {syncStatus === 'success' && (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              Live
            </div>
          )}
          {syncStatus === 'error' && (
            <div className="flex items-center gap-1 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              Error
            </div>
          )}
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setPeriod('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            period === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Time
        </button>
        <button
          onClick={() => setPeriod('year')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            period === 'year'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          This Year
        </button>
        <button
          onClick={() => setPeriod('month')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            period === 'month'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          This Month
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Family Members"
          value={analytics.totalMembers}
          icon={Users}
          color="bg-blue-50"
        />
        <StatCard
          title="Emergency Contacts"
          value={analytics.emergencyContacts}
          icon={AlertCircle}
          color="bg-red-50"
        />
        <StatCard
          title="Total Events"
          value={analytics.totalEvents}
          icon={Calendar}
          color="bg-purple-50"
        />
        <StatCard
          title="Upcoming Events (30d)"
          value={analytics.upcomingEvents}
          icon={Clock}
          color="bg-green-50"
        />
      </div>

      {/* Events by Type */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold mb-4">Events by Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-xs text-gray-600 uppercase font-semibold">Milestones</div>
            <div className="text-2xl font-bold text-blue-600 mt-2">{analytics.eventsByType.milestone}</div>
          </div>
          <div className="bg-pink-50 rounded-lg p-4 text-center">
            <div className="text-xs text-gray-600 uppercase font-semibold">Birthdays</div>
            <div className="text-2xl font-bold text-pink-600 mt-2">{analytics.eventsByType.birthday}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-xs text-gray-600 uppercase font-semibold">Anniversaries</div>
            <div className="text-2xl font-bold text-red-600 mt-2">{analytics.eventsByType.anniversary}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-xs text-gray-600 uppercase font-semibold">Celebrations</div>
            <div className="text-2xl font-bold text-green-600 mt-2">{analytics.eventsByType.celebration}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-xs text-gray-600 uppercase font-semibold">Memorials</div>
            <div className="text-2xl font-bold text-gray-600 mt-2">{analytics.eventsByType.memorial}</div>
          </div>
        </div>
      </div>

      {/* Upcoming Birthdays */}
      {analytics.upcomingBirthdays.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">🎂 Upcoming Birthdays</h3>
          <div className="space-y-3">
            {analytics.upcomingBirthdays.map((birthday, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                <div>
                  <div className="font-semibold">{birthday.name}</div>
                  <div className="text-sm text-gray-600">
                    {birthday.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-pink-600">{birthday.daysUntil}</div>
                  <div className="text-xs text-gray-600">days</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Anniversaries */}
      {analytics.upcomingAnniversaries.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">💕 Upcoming Anniversaries</h3>
          <div className="space-y-3">
            {analytics.upcomingAnniversaries.map((anniversary, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <div className="font-semibold">{anniversary.title}</div>
                  <div className="text-sm text-gray-600">
                    {anniversary.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">{anniversary.daysUntil}</div>
                  <div className="text-xs text-gray-600">days</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {analytics.totalMembers === 0 && analytics.totalEvents === 0 && (
        <div className="bg-gray-50 rounded-lg p-12 text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg mb-2">No data yet</p>
          <p className="text-sm">Start adding family members and events to see analytics</p>
        </div>
      )}
    </div>
  );
}
