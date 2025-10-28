import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Users, Heart, Calendar, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../common/StatCard';

/**
 * Family Dashboard Component
 * Quick overview of family information with:
 * - Family statistics
 * - Quick action buttons
 * - Upcoming birthdays/anniversaries
 * - Emergency contacts
 * - Links to detailed pages
 */
export default function FamilyDashboard() {
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [familyEvents, setFamilyEvents] = useState([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    emergencyContacts: 0,
    recentMembers: [],
    upcomingBirthdays: [],
    upcomingAnniversaries: [],
  });

  // Load family members
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid, 'family', 'members'), (snapshot) => {
      if (snapshot.exists() && snapshot.data().items) {
        setFamilyMembers(snapshot.data().items || []);
      }
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

  // Calculate statistics
  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Recent members (last 3 added)
    const recentMembers = familyMembers
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);

    // Emergency contacts
    const emergencyContacts = familyMembers.filter(m => m.isEmergencyContact);

    // Upcoming birthdays
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

    // Upcoming anniversaries
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
      .slice(0, 2);

    setStats({
      totalMembers: familyMembers.length,
      emergencyContacts: emergencyContacts.length,
      recentMembers,
      upcomingBirthdays,
      upcomingAnniversaries,
    });
  }, [familyMembers, familyEvents]);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Family Members"
          value={stats.totalMembers}
          icon={Users}
          color="bg-blue-50"
        />
        <StatCard
          title="Emergency Contacts"
          value={stats.emergencyContacts}
          icon={AlertCircle}
          color="bg-red-50"
        />
        <StatCard
          title="Family Events"
          value={familyEvents.length}
          icon={Calendar}
          color="bg-purple-50"
        />
      </div>

      {/* Recent Family Members */}
      {stats.recentMembers.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Recent Members</h3>
            <Link to="/family" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.recentMembers.map(member => (
              <div key={member.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{member.name}</h4>
                    {member.relationship && (
                      <p className="text-xs text-gray-600 capitalize mt-1">{member.relationship}</p>
                    )}
                    {member.isEmergencyContact && (
                      <div className="text-xs text-red-600 font-semibold mt-1">🚨 Emergency</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Birthdays */}
      {stats.upcomingBirthdays.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">🎂 Upcoming Birthdays</h3>
            <Link to="/family/timeline" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm">
              Timeline <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.upcomingBirthdays.map((birthday, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-pink-50 rounded-lg border-l-2 border-pink-600">
                <div>
                  <div className="font-semibold text-sm">{birthday.name}</div>
                  <div className="text-xs text-gray-600">
                    {birthday.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-pink-600">{birthday.daysUntil}</div>
                  <div className="text-xs text-gray-600">days away</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Anniversaries */}
      {stats.upcomingAnniversaries.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">💕 Upcoming Anniversaries</h3>
            <Link to="/family/timeline" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm">
              Timeline <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.upcomingAnniversaries.map((anniversary, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-2 border-red-600">
                <div>
                  <div className="font-semibold text-sm">{anniversary.title}</div>
                  <div className="text-xs text-gray-600">
                    {anniversary.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">{anniversary.daysUntil}</div>
                  <div className="text-xs text-gray-600">days away</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Contacts */}
      {stats.emergencyContacts > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-600">
          <h3 className="text-lg font-bold mb-4">🚨 Emergency Contacts</h3>
          <p className="text-sm text-gray-600 mb-4">
            {stats.emergencyContacts} designated emergency contact{stats.emergencyContacts !== 1 ? 's' : ''}
          </p>
          <Link
            to="/family"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <AlertCircle className="w-4 h-4" />
            View All
          </Link>
        </div>
      )}

      {/* Empty State */}
      {stats.totalMembers === 0 && (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">No family members added yet</p>
          <Link
            to="/family"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Users className="w-4 h-4" />
            Go to Family
          </Link>
        </div>
      )}
    </div>
  );
}
