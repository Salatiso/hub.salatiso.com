import { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, UserPlus, Mail, Phone, Send, CheckCircle, AlertCircle, Upload, MapPin, Home, Building, MessageSquare, User } from 'lucide-react';
import GuestContext from '../contexts/GuestContext';

const EmergencyContactManager = ({ onClose }) => {
  const { t } = useTranslation();
  const { guestData, setGuestData } = useContext(GuestContext);
  const [activeTab, setActiveTab] = useState('manual');
  const [currentPosition, setCurrentPosition] = useState(null);
  const [newContact, setNewContact] = useState({
    name: {
      formatted: '',
      given: '',
      middle: '',
      family: '',
      prefix: '',
      suffix: '',
      nickname: '',
      phonetic: ''
    },
    phones: [ { type: 'mobile', number: '' } ],
    emails: [''],
    addresses: [ { label: 'Home', line: '', coords: null, status: 'idle' } ],
    relationship: '',
    priority: 'medium',
    jobTitle: '',
    department: '',
    website: '',
    relatedPeople: [],
    customFields: [],
    dates: [],
    files: []
  });

  // Get user's current GPS position to compute distances
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setCurrentPosition(null),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const handleInputChange = (field, value) => {
    setNewContact(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddContact = () => {
    if (!newContact.name) return;
    const hasPhone = (newContact.phones || []).some(p => p.number && p.number.trim());
    const hasEmail = (newContact.emails || []).some(e => e && e.trim());
    if (!hasPhone && !hasEmail) return;

    const contact = {
      id: Date.now(),
      ...newContact,
      status: 'pending', // 'pending', 'accepted', 'declined'
      addedAt: Date.now(),
      lastNotified: null,
      proximity: calculateProximity(newContact)
    };

    setGuestData(prev => ({
      ...prev,
      emergencyContacts: [...(prev.emergencyContacts || []), contact],
    }));

    // Reset form
    setNewContact({
      name: {
        formatted: '',
        given: '',
        middle: '',
        family: '',
        prefix: '',
        suffix: '',
        nickname: '',
        phonetic: ''
      },
      phones: [ { type: 'mobile', number: '' } ],
      emails: [''],
      addresses: [ { label: 'Home', line: '', coords: null, status: 'idle' } ],
      relationship: '',
      priority: 'medium',
      jobTitle: '',
      department: '',
      website: '',
      relatedPeople: [],
      customFields: [],
      dates: [],
      files: []
    });
  };

  const calculateProximity = (contact) => {
    // Compute distance from currentPosition to the nearest address with coords
    if (!currentPosition) return null;
    const addrs = contact.addresses || [];
    const distances = addrs
      .filter(a => a.coords)
      .map(a => haversine(currentPosition, a.coords));
    if (!distances.length) return null;
    return Math.round(Math.min(...distances));
  };

  const haversine = (p1, p2) => {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(p2.lat - p1.lat);
    const dLng = toRad(p2.lng - p1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Geocode an address line using OSM Nominatim with graceful fallback
  const geocodeAddress = async (line) => {
    if (!line || !line.trim()) return null;
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(line)}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!resp.ok) throw new Error('geocode_failed');
      const data = await resp.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      return null;
    } catch (e) {
      // Fallback: deterministic pseudo coordinates (dev only)
      const hash = Array.from(line).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      const lat = -34 + (hash % 1000) / 1000;
      const lng = 18 + (hash % 1000) / 1000;
      return { lat, lng };
    }
  };

  const updateAddressLine = (index, value) => {
    setNewContact(prev => {
      const addresses = [...prev.addresses];
      addresses[index] = { ...addresses[index], line: value, status: value ? 'locating' : 'idle' };
      return { ...prev, addresses };
    });
  };

  const geocodeAddressAtIndex = async (index) => {
    const line = newContact.addresses[index]?.line;
    if (!line) return;
    setNewContact(prev => {
      const addresses = [...prev.addresses];
      addresses[index] = { ...addresses[index], status: 'locating' };
      return { ...prev, addresses };
    });
    const coords = await geocodeAddress(line);
    setNewContact(prev => {
      const addresses = [...prev.addresses];
      addresses[index] = { ...addresses[index], coords: coords, status: coords ? 'ok' : 'error' };
      return { ...prev, addresses };
    });
  };

  const handleUploadContacts = () => {
    // Mock contact upload - in real app would access device contacts
    const mockContacts = [
      {
        id: Date.now() + 1,
        name: 'John Doe',
        primaryPhone: '+1234567890',
        email: 'john@example.com',
        relationship: 'Family',
        priority: 'high',
        status: 'pending',
        addedAt: Date.now(),
        proximity: 5
      },
      {
        id: Date.now() + 2,
        name: 'Jane Smith',
        primaryPhone: '+0987654321',
        email: 'jane@example.com',
        relationship: 'Friend',
        priority: 'medium',
        status: 'pending',
        addedAt: Date.now(),
        proximity: 12
      }
    ];

    setGuestData(prev => ({
      ...prev,
      emergencyContacts: [...(prev.emergencyContacts || []), ...mockContacts],
    }));
  };

  const handleRemoveContact = (id) => {
    setGuestData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter(c => c.id !== id),
    }));
  };

  const simulateHandshake = (id) => {
    setGuestData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map(c =>
        c.id === id ? { ...c, status: 'accepted', lastNotified: Date.now() } : c
      ),
    }));
  };

  const sendNotification = (contact) => {
    // Mock notification sending
    setGuestData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map(c =>
        c.id === contact.id ? { ...c, lastNotified: Date.now() } : c
      ),
    }));
    alert(`Notification sent to ${contact.name}`);
  };

  const sortedContacts = (guestData.emergencyContacts || []).sort((a, b) => {
    // Sort by proximity first, then by priority
    if (a.proximity && b.proximity) {
      return a.proximity - b.proximity;
    }
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-5/6 overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 dark:bg-gray-700 p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{t('followMeHome.contacts.title')}</h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                <X />
              </button>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('manual')}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  activeTab === 'manual' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <UserPlus className="inline mr-2 h-4 w-4" />
                {t('followMeHome.contacts.tabs.addManually')}
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  activeTab === 'upload' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Upload className="inline mr-2 h-4 w-4" />
                {t('followMeHome.contacts.tabs.uploadContacts')}
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  activeTab === 'manage' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <User className="inline mr-2 h-4 w-4" />
                {t('followMeHome.contacts.tabs.manageContacts')} ({sortedContacts.length})
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'manual' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('followMeHome.contacts.add.title')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <input
                        type="text"
                        value={newContact.name.prefix}
                        onChange={(e) => setNewContact(prev => ({ ...prev, name: { ...prev.name, prefix: e.target.value } }))}
                        placeholder="Prefix (e.g. Mr, Dr)"
                        className="p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                      <input
                        type="text"
                        value={newContact.name.given}
                        onChange={(e) => setNewContact(prev => ({ ...prev, name: { ...prev.name, given: e.target.value } }))}
                        placeholder="First name"
                        className="p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        required
                      />
                      <input
                        type="text"
                        value={newContact.name.middle}
                        onChange={(e) => setNewContact(prev => ({ ...prev, name: { ...prev.name, middle: e.target.value } }))}
                        placeholder="Middle name"
                        className="p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                      <input
                        type="text"
                        value={newContact.name.family}
                        onChange={(e) => setNewContact(prev => ({ ...prev, name: { ...prev.name, family: e.target.value } }))}
                        placeholder="Last name"
                        className="p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <input
                        type="text"
                        value={newContact.name.suffix}
                        onChange={(e) => setNewContact(prev => ({ ...prev, name: { ...prev.name, suffix: e.target.value } }))}
                        placeholder="Suffix (e.g. Jr, Sr)"
                        className="p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                      <input
                        type="text"
                        value={newContact.name.nickname}
                        onChange={(e) => setNewContact(prev => ({ ...prev, name: { ...prev.name, nickname: e.target.value } }))}
                        placeholder="Nickname"
                        className="p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                      <input
                        type="text"
                        value={newContact.name.phonetic}
                        onChange={(e) => setNewContact(prev => ({ ...prev, name: { ...prev.name, phonetic: e.target.value } }))}
                        placeholder="Phonetic pronunciation"
                        className="p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('followMeHome.contacts.add.relationshipLabel')}</label>
                    <select
                      value={newContact.relationship}
                      onChange={(e) => handleInputChange('relationship', e.target.value)}
                      className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">{t('followMeHome.contacts.add.relationshipPlaceholder')}</option>
                      <option value="family">{t('followMeHome.contacts.relationship.family')}</option>
                      <option value="friend">{t('followMeHome.contacts.relationship.friend')}</option>
                      <option value="colleague">{t('followMeHome.contacts.relationship.colleague')}</option>
                      <option value="neighbor">{t('followMeHome.contacts.relationship.neighbor')}</option>
                      <option value="other">{t('followMeHome.contacts.relationship.other')}</option>
                    </select>
                  </div>
                  {/* Phones - dynamic */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">{t('followMeHome.contacts.add.phonesLabel')}</label>
                    <div className="space-y-2">
                      {newContact.phones.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <select
                            value={p.type}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewContact(prev => {
                                const phones = [...prev.phones];
                                phones[idx] = { ...phones[idx], type: val };
                                return { ...prev, phones };
                              });
                            }}
                            className="p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                          >
                            <option value="mobile">{t('followMeHome.contacts.add.phoneTypes.mobile')}</option>
                            <option value="home">{t('followMeHome.contacts.add.phoneTypes.home')}</option>
                            <option value="work">{t('followMeHome.contacts.add.phoneTypes.work')}</option>
                            <option value="other">{t('followMeHome.contacts.add.phoneTypes.other')}</option>
                          </select>
                          <input
                            type="tel"
                            value={p.number}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewContact(prev => {
                                const phones = [...prev.phones];
                                phones[idx] = { ...phones[idx], number: val };
                                return { ...prev, phones };
                              });
                            }}
                            placeholder={t('followMeHome.contacts.add.primaryPhonePlaceholder')}
                            className="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => setNewContact(prev => ({ ...prev, phones: prev.phones.filter((_, i) => i !== idx) }))}
                            className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            {t('followMeHome.contacts.add.remove')}
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setNewContact(prev => ({ ...prev, phones: [...prev.phones, { type: 'mobile', number: '' }] }))}
                        className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        {t('followMeHome.contacts.add.addPhone')}
                      </button>
                    </div>
                  </div>

                  {/* Emails - dynamic */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">{t('followMeHome.contacts.add.emailsLabel')}</label>
                    <div className="space-y-2">
                      {newContact.emails.map((em, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="email"
                            value={em}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewContact(prev => {
                                const emails = [...prev.emails];
                                emails[idx] = val;
                                return { ...prev, emails };
                              });
                            }}
                            placeholder={t('followMeHome.contacts.add.emailPlaceholder')}
                            className="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => setNewContact(prev => ({ ...prev, emails: prev.emails.filter((_, i) => i !== idx) }))}
                            className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            {t('followMeHome.contacts.add.remove')}
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setNewContact(prev => ({ ...prev, emails: [...prev.emails, ''] }))}
                        className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        {t('followMeHome.contacts.add.addEmail')}
                      </button>
                    </div>
                  </div>

                  {/* Addresses - dynamic with geocoding */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">{t('followMeHome.contacts.add.addressesLabel')}</label>
                    <div className="space-y-3">
                      {newContact.addresses.map((addr, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
                          <div className="md:col-span-2">
                            <input
                              type="text"
                              value={addr.label}
                              onChange={(e) => {
                                const val = e.target.value;
                                setNewContact(prev => {
                                  const addresses = [...prev.addresses];
                                  addresses[idx] = { ...addresses[idx], label: val };
                                  return { ...prev, addresses };
                                });
                              }}
                              placeholder={t('followMeHome.contacts.add.addressLabelPlaceholder')}
                              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            />
                          </div>
                          <div className="md:col-span-4 flex items-center gap-2">
                            <input
                              type="text"
                              value={addr.line}
                              onChange={(e) => updateAddressLine(idx, e.target.value)}
                              onBlur={() => geocodeAddressAtIndex(idx)}
                              placeholder={t('followMeHome.contacts.add.addressLinePlaceholder')}
                              className="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="text-xs">
                              {addr.status === 'locating' && t('followMeHome.contacts.add.geocoding')}
                              {addr.status === 'ok' && t('followMeHome.contacts.add.geocoded')}
                              {addr.status === 'error' && t('followMeHome.contacts.add.geocodeFailed')}
                            </span>
                            <button
                              type="button"
                              onClick={() => setNewContact(prev => ({ ...prev, addresses: prev.addresses.filter((_, i) => i !== idx) }))}
                              className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              {t('followMeHome.contacts.add.remove')}
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setNewContact(prev => ({ ...prev, addresses: [...prev.addresses, { label: 'Other', line: '', coords: null, status: 'idle' }] }))}
                        className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        {t('followMeHome.contacts.add.addAddress')}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('followMeHome.contacts.add.priorityLabel')}</label>
                    <select
                      value={newContact.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="low">{t('followMeHome.contacts.priority.low')}</option>
                      <option value="medium">{t('followMeHome.contacts.priority.medium')}</option>
                      <option value="high">{t('followMeHome.contacts.priority.high')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Job Title</label>
                    <input
                      type="text"
                      value={newContact.jobTitle}
                      onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                      placeholder="Job title"
                      className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Department</label>
                    <input
                      type="text"
                      value={newContact.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      placeholder="Department"
                      className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <input
                      type="url"
                      value={newContact.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://example.com"
                      className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Related People</label>
                    <div className="space-y-2">
                      {newContact.relatedPeople.map((person, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={person.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewContact(prev => {
                                const relatedPeople = [...prev.relatedPeople];
                                relatedPeople[idx] = { ...relatedPeople[idx], name: val };
                                return { ...prev, relatedPeople };
                              });
                            }}
                            placeholder="Name"
                            className="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                          />
                          <input
                            type="text"
                            value={person.relationship}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewContact(prev => {
                                const relatedPeople = [...prev.relatedPeople];
                                relatedPeople[idx] = { ...relatedPeople[idx], relationship: val };
                                return { ...prev, relatedPeople };
                              });
                            }}
                            placeholder="Relationship"
                            className="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => setNewContact(prev => ({ ...prev, relatedPeople: prev.relatedPeople.filter((_, i) => i !== idx) }))}
                            className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setNewContact(prev => ({ ...prev, relatedPeople: [...prev.relatedPeople, { name: '', relationship: '' }] }))}
                        className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Add Related Person
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Important Dates</label>
                    <div className="space-y-2">
                      {newContact.dates.map((date, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={date.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewContact(prev => {
                                const dates = [...prev.dates];
                                dates[idx] = { ...dates[idx], title: val };
                                return { ...prev, dates };
                              });
                            }}
                            placeholder="Title (e.g. Birthday, Anniversary)"
                            className="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                          />
                          <input
                            type="date"
                            value={date.date}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewContact(prev => {
                                const dates = [...prev.dates];
                                dates[idx] = { ...dates[idx], date: val };
                                return { ...prev, dates };
                              });
                            }}
                            className="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => setNewContact(prev => ({ ...prev, dates: prev.dates.filter((_, i) => i !== idx) }))}
                            className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setNewContact(prev => ({ ...prev, dates: [...prev.dates, { title: '', date: '' }] }))}
                        className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Add Important Date
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Attached Files</label>
                    <div className="space-y-2">
                      {newContact.files.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setNewContact(prev => {
                                  const files = [...prev.files];
                                  files[idx] = file;
                                  return { ...prev, files };
                                });
                              }
                            }}
                            className="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => setNewContact(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== idx) }))}
                            className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setNewContact(prev => ({ ...prev, files: [...prev.files, null] }))}
                        className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Add File
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Custom Fields</label>
                    <div className="space-y-2">
                      {newContact.customFields.map((field, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={field.key}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewContact(prev => {
                                const customFields = [...prev.customFields];
                                customFields[idx] = { ...customFields[idx], key: val };
                                return { ...prev, customFields };
                              });
                            }}
                            placeholder="Field name"
                            className="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                          />
                          <input
                            type="text"
                            value={field.value}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewContact(prev => {
                                const customFields = [...prev.customFields];
                                customFields[idx] = { ...customFields[idx], value: val };
                                return { ...prev, customFields };
                              });
                            }}
                            placeholder="Field value"
                            className="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => setNewContact(prev => ({ ...prev, customFields: prev.customFields.filter((_, i) => i !== idx) }))}
                            className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setNewContact(prev => ({ ...prev, customFields: [...prev.customFields, { key: '', value: '' }] }))}
                        className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Add Custom Field
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleAddContact}
                    className="bg-primary-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {t('followMeHome.contacts.add.button')}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'upload' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('followMeHome.contacts.upload.title')}</h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium mb-2">{t('followMeHome.contacts.uploadSubtitle')}</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {t('followMeHome.contacts.uploadDescription')}
                  </p>
                  <button
                    onClick={handleUploadContacts}
                    className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('followMeHome.contacts.upload.button')}
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {t('followMeHome.contacts.upload.privacy')}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'manage' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('followMeHome.contacts.listTitle')}</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {sortedContacts.length > 0 ? (
                    sortedContacts.map(contact => (
                      <div key={contact.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-lg">{contact.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{contact.relationship}</p>
                            {contact.proximity && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {t('followMeHome.contacts.proximity', { distance: contact.proximity })}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {contact.status === 'pending' && (
                              <button
                                onClick={() => simulateHandshake(contact.id)}
                                className="flex items-center text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded"
                              >
                                <AlertCircle className="mr-1 h-3 w-3" />
                                {t('followMeHome.contacts.status.pending')}
                              </button>
                            )}
                            {contact.status === 'accepted' && (
                              <span className="flex items-center text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                {t('followMeHome.contacts.status.accepted')}
                              </span>
                            )}
                            <button
                              onClick={() => handleRemoveContact(contact.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            {/* Phones (new) or fallback to legacy primary/secondary */}
                            {(contact.phones && contact.phones.length > 0) ? (
                              contact.phones.map((p, i) => (
                                <p key={i} className="flex items-center text-gray-600 dark:text-gray-400">
                                  <Phone className="h-4 w-4 mr-2" />
                                  {p.number} {p.type ? `(${p.type})` : ''}
                                </p>
                              ))
                            ) : (
                              <>
                                {contact.primaryPhone && (
                                  <p className="flex items-center text-gray-600 dark:text-gray-400">
                                    <Phone className="h-4 w-4 mr-2" />
                                    {contact.primaryPhone}
                                  </p>
                                )}
                                {contact.secondaryPhone && (
                                  <p className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
                                    <Phone className="h-4 w-4 mr-2" />
                                    {contact.secondaryPhone}
                                  </p>
                                )}
                              </>
                            )}

                            {/* Emails */}
                            {(contact.emails && contact.emails.length > 0) ? (
                              contact.emails.map((e, i) => (
                                <p key={i} className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
                                  <Mail className="h-4 w-4 mr-2" />
                                  {e}
                                </p>
                              ))
                            ) : (
                              contact.email && (
                                <p className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
                                  <Mail className="h-4 w-4 mr-2" />
                                  {contact.email}
                                </p>
                              )
                            )}
                          </div>
                          <div>
                            {/* Addresses */}
                            {(contact.addresses && contact.addresses.length > 0) ? (
                              contact.addresses.map((a, i) => (
                                <p key={i} className="flex items-center text-gray-600 dark:text-gray-400">
                                  <Home className="h-4 w-4 mr-2" />
                                  {a.label ? `${a.label}: ` : ''}{a.line}
                                </p>
                              ))
                            ) : (
                              <>
                                {contact.homeAddress && (
                                  <p className="flex items-center text-gray-600 dark:text-gray-400">
                                    <Home className="h-4 w-4 mr-2" />
                                    {contact.homeAddress}
                                  </p>
                                )}
                                {contact.workAddress && (
                                  <p className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
                                    <Building className="h-4 w-4 mr-2" />
                                    {contact.workAddress}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {contact.status === 'pending' && (
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={() => sendNotification(contact)}
                              className="flex items-center text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                            >
                              <MessageSquare className="mr-1 h-3 w-3" />
                              {t('followMeHome.contacts.sendNotification')}
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">{t('followMeHome.contacts.noContacts')}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContactManager;
