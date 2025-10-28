import { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { Plus, Trash2, Users, Home, Heart, AlertCircle, Check, X, Zap, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import GuestContext from '../contexts/GuestContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, serverTimestamp, onSnapshot, collection, writeBatch } from 'firebase/firestore';
import FamilyMemberCard from '../components/family/FamilyMemberCard';
import { getPageContainerClasses, getPageHeaderClasses, getPageTitleClasses } from '../utils/layoutHelpers';

/**
 * Family Page - Enhanced with Firestore Integration
 * Main family dashboard and management with:
 * - Real-time sync across ecosystem
 * - Emergency contact management
 * - Family statistics and overview
 * - Firestore CRUD operations
 * - App-origin tracking for cross-app updates
 */
export default function Family() {
  const { guestData, updateGuestData } = useContext(GuestContext);
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState(guestData?.familyMembers || []);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [filterEmergency, setFilterEmergency] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    address: '',
    isEmergencyContact: false,
  });

  // Load family members from Firestore
  useEffect(() => {
    if (!user) return;

    const loadFromFirebase = async () => {
      try {
        setSyncStatus('syncing');
        const docRef = doc(db, 'users', user.uid, 'family', 'members');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().items) {
          const members = docSnap.data().items;
          setFamilyMembers(members);
          updateGuestData(prev => ({ ...prev, familyMembers: members }));
          setSyncStatus('success');
          setLastSyncTime(new Date());
        }
      } catch (error) {
        console.error('Error loading family members:', error);
        setSyncStatus('error');
      }
    };

    loadFromFirebase();

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid, 'family', 'members'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.items && data.lastUpdatedBy !== 'lifesync') {
          // Cross-app update detected
          const members = data.items;
          setFamilyMembers(members);
          updateGuestData(prev => ({ ...prev, familyMembers: members }));
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  const saveToFirebase = async (members) => {
    if (!user) return;
    try {
      setSyncStatus('syncing');
      const docRef = doc(db, 'users', user.uid, 'family', 'members');
      await updateDoc(docRef, {
        items: members,
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

  const saveFamilyMembers = (updatedMembers) => {
    setFamilyMembers(updatedMembers);
    updateGuestData(prev => ({
      ...prev,
      familyMembers: updatedMembers,
    }));
    // Save to Firestore if user is authenticated
    if (user) {
      saveToFirebase(updatedMembers);
    }
  };

  const handleAddMember = useCallback(() => {
    if (!formData.name) {
      alert('Please enter a name');
      return;
    }
    const newMember = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: 'lifesync',
    };
    if (editingMember) {
      // Update existing member
      saveFamilyMembers(familyMembers.map(m => m.id === editingMember.id ? newMember : m));
      setEditingMember(null);
    } else {
      // Add new member
      saveFamilyMembers([...familyMembers, newMember]);
    }
    setFormData({
      name: '',
      relationship: '',
      dateOfBirth: '',
      phone: '',
      email: '',
      address: '',
      isEmergencyContact: false,
    });
    setShowForm(false);
  }, [formData, editingMember, familyMembers]);

  const handleEditMember = useCallback((member) => {
    setEditingMember(member);
    setFormData(member);
    setShowForm(true);
  }, []);

  const handleDeleteMember = useCallback((id) => {
    if (confirm('Remove this family member?')) {
      saveFamilyMembers(familyMembers.filter(m => m.id !== id));
    }
  }, [familyMembers]);

  const emergencyContacts = useMemo(() => 
    familyMembers.filter(m => m.isEmergencyContact),
    [familyMembers]
  );

  const upcomingBirthdays = useMemo(() =>
    familyMembers
      .filter(m => m.dateOfBirth)
      .sort((a, b) => {
        const aMonth = new Date(a.dateOfBirth).getMonth();
        const bMonth = new Date(b.dateOfBirth).getMonth();
        const currentMonth = new Date().getMonth();
        const aDiff = (aMonth - currentMonth + 12) % 12;
        const bDiff = (bMonth - currentMonth + 12) % 12;
        return aDiff - bDiff;
      })
      .slice(0, 3),
    [familyMembers]
  );

  return (
    <div className={getPageContainerClasses()}>
      {/* Header */}
      <div className={getPageHeaderClasses()}>
        <div className="flex items-center gap-3">
          <h1 className={getPageTitleClasses()}>Family</h1>
          {/* Sync Status Indicator */}
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
                Sync Error
              </div>
            )}
            {lastSyncTime && syncStatus !== 'syncing' && (
              <span className="text-gray-500 text-xs">
                {lastSyncTime.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            to="/family/tree"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Users className="w-4 h-4" />
            Family Tree
          </Link>
          <Link
            to="/family/timeline"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Heart className="w-4 h-4" />
            Timeline
          </Link>
          <button
            onClick={() => {
              if (editingMember) {
                setEditingMember(null);
                setFormData({
                  name: '',
                  relationship: '',
                  dateOfBirth: '',
                  phone: '',
                  email: '',
                  address: '',
                  isEmergencyContact: false,
                });
              }
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            aria-label="Add family member"
          >
            <Plus className="w-4 h-4" />
            {editingMember ? 'Cancel' : 'Add Member'}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-sm font-semibold">Members</span>
          </div>
          <div className="text-2xl font-bold">{familyMembers.length}</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-semibold">Emergency</span>
          </div>
          <div className="text-2xl font-bold">{emergencyContacts.length}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <Home className="w-4 h-4" />
            <span className="text-sm font-semibold">Households</span>
          </div>
          <div className="text-2xl font-bold">1</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-semibold">Birthdays Soon</span>
          </div>
          <div className="text-2xl font-bold">{upcomingBirthdays.length}</div>
        </div>
      </div>

      {/* Add/Edit Member Form */}
      {showForm && (
        <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">
            {editingMember ? 'Edit Family Member' : 'Add Family Member'}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name *"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Family member name"
            />
            <select
              value={formData.relationship}
              onChange={(e) => setFormData({...formData, relationship: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Relationship"
            >
              <option value="">Select Relationship</option>
              <option value="spouse">Spouse</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="child">Child</option>
              <option value="grandparent">Grandparent</option>
              <option value="grandchild">Grandchild</option>
              <option value="relative">Relative</option>
            </select>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Date of birth"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Email"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Phone"
            />
            <input
              type="text"
              placeholder="Address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Address"
            />
            <label className="flex items-center gap-2 col-span-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isEmergencyContact}
                onChange={(e) => setFormData({...formData, isEmergencyContact: e.target.checked})}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Mark as emergency contact</span>
            </label>
          </div>
          <div className="flex gap-3 justify-end mt-4">
            <button
              onClick={() => {
                setShowForm(false);
                setEditingMember(null);
                setFormData({
                  name: '',
                  relationship: '',
                  dateOfBirth: '',
                  phone: '',
                  email: '',
                  address: '',
                  isEmergencyContact: false,
                });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMember}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              aria-label={editingMember ? 'Update member' : 'Add member'}
            >
              <Plus className="w-4 h-4" />
              {editingMember ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {/* Family Members Grid */}
      {familyMembers.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center text-gray-500">
          <p className="text-lg mb-2">No family members added yet</p>
          <p className="text-sm">Add family members to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {familyMembers.map(member => (
            <FamilyMemberCard
              key={member.id}
              member={member}
              onEdit={handleEditMember}
              onDelete={handleDeleteMember}
            />
          ))}
        </div>
      )}

      {/* Emergency Contacts Section */}
      {emergencyContacts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">🚨 Emergency Contacts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyContacts.map(contact => (
              <div key={contact.id} className="bg-red-50 rounded-lg p-4 border-l-4 border-red-600">
                <h3 className="font-bold text-lg mb-2">{contact.name}</h3>
                <div className="space-y-1 text-sm">
                  {contact.phone && <p>📱 {contact.phone}</p>}
                  {contact.email && <p>📧 {contact.email}</p>}
                  {contact.relationship && <p>Relationship: {contact.relationship}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

