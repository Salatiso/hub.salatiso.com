import { useState, useContext, useCallback, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, Phone, Mail, MapPin, X } from 'lucide-react';
import GuestContext from '../contexts/GuestContext';
import ContactCard from '../components/common/ContactCard';
import { getPageContainerClasses, getPageHeaderClasses, getPageTitleClasses } from '../utils/layoutHelpers';

/**
 * Contacts Page
 * Manages contacts with full CRUD operations
 * Includes search, filtering, and categorization
 */
export default function Contacts() {
  const { guestData, updateGuestData } = useContext(GuestContext);
  const [contacts, setContacts] = useState(guestData?.contacts || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    category: 'personal',
    notes: '',
  });

  // Save contacts to context
  const saveContacts = (updatedContacts) => {
    setContacts(updatedContacts);
    updateGuestData(prev => ({
      ...prev,
      contacts: updatedContacts,
    }));
  };

  // Add new contact
  const handleAddContact = useCallback(() => {
    if (!formData.firstName || !formData.email) {
      alert('Please fill in at least name and email');
      return;
    }
    const newContact = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString(),
    };
    saveContacts([...contacts, newContact]);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      category: 'personal',
      notes: '',
    });
    setShowAddForm(false);
  }, [formData, contacts]);

  // Update contact
  const handleUpdateContact = useCallback((id) => {
    const updated = contacts.map(c => c.id === id ? { ...c, ...formData } : c);
    saveContacts(updated);
    setEditingId(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      category: 'personal',
      notes: '',
    });
  }, [formData, contacts]);

  // Delete contact
  const handleDeleteContact = useCallback((id) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      saveContacts(contacts.filter(c => c.id !== id));
    }
  }, [contacts]);

  // Start editing
  const handleStartEdit = useCallback((contact) => {
    setFormData(contact);
    setEditingId(contact.id);
    setShowAddForm(false);
  }, []);

  // Cancel editing
  const handleCancel = useCallback(() => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      category: 'personal',
      notes: '',
    });
    setEditingId(null);
    setShowAddForm(false);
  }, []);

  // Filter contacts
  const filteredContacts = useMemo(() => 
    contacts.filter(contact => {
      const searchMatch = `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone.includes(searchTerm);
      const categoryMatch = filterCategory === 'all' || contact.category === filterCategory;
      return searchMatch && categoryMatch;
    }),
    [contacts, searchTerm, filterCategory]
  );

  const personalCount = useMemo(() => 
    contacts.filter(c => c.category === 'personal').length,
    [contacts]
  );

  const workCount = useMemo(() => 
    contacts.filter(c => c.category === 'work').length,
    [contacts]
  );

  const emergencyCount = useMemo(() => 
    contacts.filter(c => c.category === 'emergency').length,
    [contacts]
  );

  return (
    <div className={getPageContainerClasses()}>
      {/* Header */}
      <div className={getPageHeaderClasses()}>
        <h1 className={getPageTitleClasses()}>Contacts</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          aria-label="Add new contact"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Edit Contact' : 'Add New Contact'}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name *"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="First name"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Last name"
            />
            <input
              type="email"
              placeholder="Email *"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Email address"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Phone number"
            />
            <input
              type="text"
              placeholder="Address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Address"
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Contact category"
            >
              <option value="personal">Personal</option>
              <option value="work">Work</option>
              <option value="family">Family</option>
              <option value="emergency">Emergency</option>
            </select>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Contact relationship"
            >
              <option value="">Select Relationship</option>
              <option value="friend">Friend</option>
              <option value="colleague">Colleague</option>
              <option value="family">Family</option>
              <option value="other">Other</option>
            </select>
            <textarea
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              aria-label="Contact notes"
            />
          </div>
          <div className="flex gap-3 justify-end mt-4">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Cancel"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={() => editingId ? handleUpdateContact(editingId) : handleAddContact()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              aria-label={editingId ? 'Update contact' : 'Add contact'}
            >
              <Plus className="w-4 h-4" />
              {editingId ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search contacts"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filter by category"
        >
          <option value="all">All Categories</option>
          <option value="personal">Personal</option>
          <option value="work">Work</option>
          <option value="family">Family</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>

      {/* Contacts List */}
      {filteredContacts.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
          <p className="mb-2">No contacts found</p>
          {searchTerm && <p className="text-sm">Try adjusting your search</p>}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={handleStartEdit}
              onDelete={handleDeleteContact}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{contacts.length}</div>
          <div className="text-sm text-gray-600">Total Contacts</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{personalCount}</div>
          <div className="text-sm text-gray-600">Personal</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{workCount}</div>
          <div className="text-sm text-gray-600">Work</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{emergencyCount}</div>
          <div className="text-sm text-gray-600">Emergency</div>
        </div>
      </div>
    </div>
  );
}
