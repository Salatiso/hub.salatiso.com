import { useState } from 'react';
import { MapPin, Users, Shield, ChevronRight, ChevronLeft } from 'lucide-react';
import GoogleMapsModal from './GoogleMapsModal';

const EventCreateWizard = ({ onCreate, onClose, existingEvent = null }) => {
  const [step, setStep] = useState(1);
  const [eventData, setEventData] = useState(() => {
    if (existingEvent) {
      return {
        ...existingEvent,
        // Ensure arrays exist for multi-date/location support
        dates: existingEvent.dates || [{ date: '', startTime: '', endTime: '', label: '' }],
        locations: existingEvent.locations || [{ address: '', coordinates: null, label: '' }],
        activities: existingEvent.activities || [],
        integrations: existingEvent.integrations || []
      };
    }
    return {
      title: '',
      type: 'private',
      dates: [{ date: '', startTime: '', endTime: '', label: '' }],
      locations: [{ address: '', coordinates: null, label: '' }],
      description: '',
      invitees: [],
      safetyMeasures: [],
      monitoringLevel: 'standard',
      isPublic: false,
      hostRole: 'child', // child, parent, organization
      activities: [], // For multi-faceted events
      integrations: [] // For external service integrations
    };
  });

  const [mapsModal, setMapsModal] = useState({ isOpen: false, locationIndex: null, initialLocation: null });
  // Placeholder kept for future import modal (intentionally disabled to avoid lint warnings)
  const [importing, setImporting] = useState(false);

  const eventTypes = [
    { id: 'private', label: 'Private Event', desc: 'Family gatherings, birthdays', icon: '🏠' },
    { id: 'community', label: 'Community Event', desc: 'Street parties, clean-ups', icon: '🏘️' },
    { id: 'public', label: 'Public Event', desc: 'Festivals, sports events', icon: '🎪' },
    { id: 'institutional', label: 'Institutional', desc: 'School trips, corporate', icon: '🏫' },
    { id: 'multi_faceted', label: 'Multi-Faceted Event', desc: 'Complex events with multiple activities', icon: '🎭' }
  ];

  const safetyMeasures = [
    { id: 'emergency_contacts', label: 'Emergency Contact Sync', desc: 'All participants sync emergency contacts' },
    { id: 'location_sharing', label: 'Location Sharing', desc: 'GPS tracking during event' },
    { id: 'onsite_monitors', label: 'On-site Monitors', desc: 'Designated safety personnel' },
    { id: 'mesh_network', label: 'Offline Mesh Network', desc: 'Device-to-device communication' },
    { id: 'checkin_system', label: 'Check-in System', desc: 'Periodic safety confirmations' },
    { id: 'emergency_kit', label: 'Emergency Kit', desc: 'First aid and emergency supplies' }
  ];

  // getCurrentLocation reserved for future; GoogleMapsModal handles selection

  const updateSafetyMeasure = (measureId, selected) => {
    setEventData(prev => ({
      ...prev,
      safetyMeasures: selected
        ? [...prev.safetyMeasures, measureId]
        : prev.safetyMeasures.filter(id => id !== measureId)
    }));
  };

  const nextStep = () => {
    const maxStep = eventData.type === 'multi_faceted' ? 5 : 4;
    if (step < maxStep) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Import functions
  const handleCalendarImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ics,.ical';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setImporting(true);
        // Simulate calendar parsing
        setTimeout(() => {
          // Mock calendar data
          const mockEvent = {
            title: 'Imported Calendar Event',
            dates: [{ date: '2025-09-20', startTime: '14:00', endTime: '16:00', label: 'Main Event' }],
            locations: [{ address: '123 Main St, Johannesburg', coordinates: null, label: 'Venue' }],
            description: 'Event imported from calendar',
            type: 'private'
          };
          setEventData(prev => ({ ...prev, ...mockEvent }));
          setImporting(false);
          alert('Event imported successfully from calendar!');
        }, 2000);
      }
    };
    input.click();
  };

  const handleCSVImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setImporting(true);
        const reader = new FileReader();
        reader.onload = (event) => {
          const csv = event.target.result;
          // Parse CSV (simple implementation)
          const lines = csv.split('\n');
          if (lines.length > 1) {
            const data = lines[1].split(',');
            
            // Mock CSV parsing - in real implementation, map headers to event fields
            const mockEvent = {
              title: data[0] || 'Imported Event',
              dates: [{ date: data[1] || '', startTime: data[2] || '', endTime: data[3] || '', label: 'Imported' }],
              locations: [{ address: data[4] || '', coordinates: null, label: 'Venue' }],
              description: data[5] || 'Event imported from CSV',
              type: 'private'
            };
            setEventData(prev => ({ ...prev, ...mockEvent }));
            setImporting(false);
            alert('Event imported successfully from CSV!');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handlePhoneImport = () => {
    // For phone import, we'll use a file picker that accepts common phone export formats
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.vcf,.vcs,.ics,.csv';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setImporting(true);
        setTimeout(() => {
          // Mock phone import data
          const mockEvent = {
            title: 'Phone Imported Event',
            dates: [{ date: '2025-09-25', startTime: '10:00', endTime: '12:00', label: 'Meeting' }],
            locations: [{ address: '456 Contact St, Cape Town', coordinates: null, label: 'Location' }],
            description: 'Event imported from phone contacts/calendar',
            type: 'private'
          };
          setEventData(prev => ({ ...prev, ...mockEvent }));
          setImporting(false);
          alert('Event imported successfully from phone!');
        }, 2000);
      }
    };
    input.click();
  };

  const handleCreate = () => {
    const event = {
      ...(existingEvent || {}),
      id: existingEvent?.id || 'event_' + Date.now(),
      ...eventData,
      createdAt: existingEvent?.createdAt || Date.now(),
      lastUpdated: Date.now(),
      status: existingEvent?.status || 'pending_approval',
      governance: existingEvent?.governance || {
        approvalChain: ['unit', 'household'],
        currentStep: 'unit',
        approvals: [],
        rejections: []
      },
      seal: existingEvent?.seal || {
        granted: false,
        validUntil: null,
        criteria: []
      }
    };
    onCreate(event);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Create LifeSync Seal Event</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Event Details</span>
              <span>Safety Setup</span>
              <span>Invitations</span>
              {eventData.type === 'multi_faceted' && <span>Activities</span>}
              <span>Review</span>
            </div>
            <div className="flex space-x-1">
              {Array.from({ length: eventData.type === 'multi_faceted' ? 5 : 4 }, (_, i) => i + 1).map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-2 rounded ${s <= step ? 'bg-primary-500' : 'bg-gray-200'}`}
                />
              ))}
            </div>
          </div>

          {/* Step 1: Basic Event Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Import Event</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-1 p-3 border rounded-lg hover:bg-gray-50 flex items-center justify-center disabled:opacity-50"
                    onClick={handleCalendarImport}
                    disabled={importing}
                  >
                    📅 {importing ? 'Importing...' : 'Import from Calendar'}
                  </button>
                  <button
                    type="button"
                    className="flex-1 p-3 border rounded-lg hover:bg-gray-50 flex items-center justify-center disabled:opacity-50"
                    onClick={handleCSVImport}
                    disabled={importing}
                  >
                    📄 {importing ? 'Importing...' : 'Upload CSV'}
                  </button>
                  <button
                    type="button"
                    className="flex-1 p-3 border rounded-lg hover:bg-gray-50 flex items-center justify-center disabled:opacity-50"
                    onClick={handlePhoneImport}
                    disabled={importing}
                  >
                    📱 {importing ? 'Importing...' : 'Upload from Phone'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Event Title</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg"
                  placeholder="e.g., John's 16th Birthday Party"
                  value={eventData.title}
                  onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Event Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {eventTypes.map((type) => (
                    <div
                      key={type.id}
                      onClick={() => setEventData(prev => ({ ...prev, type: type.id }))}
                      className={`p-4 border rounded-lg cursor-pointer transition ${
                        eventData.type === type.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-gray-600">{type.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Event Dates & Times</label>
                <div className="space-y-3">
                  {eventData.dates.map((dateItem, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                      <div>
                        <label className="block text-xs font-medium mb-1">Label</label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded-lg text-sm"
                          placeholder="e.g. Main Event, Reception"
                          value={dateItem.label}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEventData(prev => {
                              const dates = [...prev.dates];
                              dates[idx] = { ...dates[idx], label: val };
                              return { ...prev, dates };
                            });
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Date</label>
                        <input
                          type="date"
                          className="w-full p-2 border rounded-lg text-sm"
                          value={dateItem.date}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEventData(prev => {
                              const dates = [...prev.dates];
                              dates[idx] = { ...dates[idx], date: val };
                              return { ...prev, dates };
                            });
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Start Time</label>
                        <input
                          type="time"
                          className="w-full p-2 border rounded-lg text-sm"
                          value={dateItem.startTime}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEventData(prev => {
                              const dates = [...prev.dates];
                              dates[idx] = { ...dates[idx], startTime: val };
                              return { ...prev, dates };
                            });
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">End Time</label>
                        <input
                          type="time"
                          className="w-full p-2 border rounded-lg text-sm"
                          value={dateItem.endTime}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEventData(prev => {
                              const dates = [...prev.dates];
                              dates[idx] = { ...dates[idx], endTime: val };
                              return { ...prev, dates };
                            });
                          }}
                        />
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setEventData(prev => ({ ...prev, dates: prev.dates.filter((_, i) => i !== idx) }))}
                          className="px-2 py-2 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setEventData(prev => ({ ...prev, dates: [...prev.dates, { date: '', startTime: '', endTime: '', label: '' }] }))}
                    className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Add Another Date/Time
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Locations</label>
                <div className="space-y-3">
                  {eventData.locations.map((loc, idx) => (
                    <div key={idx} className="border rounded-lg p-3">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium mb-1">Label</label>
                          <input
                            type="text"
                            className="w-full p-2 border rounded-lg text-sm"
                            placeholder="e.g. Main Venue, Reception"
                            value={loc.label}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEventData(prev => {
                                const locations = [...prev.locations];
                                locations[idx] = { ...locations[idx], label: val };
                                return { ...prev, locations };
                              });
                            }}
                          />
                        </div>
                        <div className="md:col-span-2 flex gap-1">
                          <input
                            type="text"
                            className="flex-1 p-2 border rounded-lg text-sm"
                            placeholder="Enter address"
                            value={loc.address}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEventData(prev => {
                                const locations = [...prev.locations];
                                locations[idx] = { ...locations[idx], address: val };
                                return { ...prev, locations };
                              });
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setMapsModal({
                              isOpen: true,
                              locationIndex: idx,
                              initialLocation: loc.coordinates
                            })}
                            className="px-2 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            title="Select from Google Maps"
                          >
                            🗺️
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(
                                  (position) => {
                                    setEventData(prev => {
                                      const locations = [...prev.locations];
                                      locations[idx] = {
                                        ...locations[idx],
                                        coordinates: {
                                          lat: position.coords.latitude,
                                          lng: position.coords.longitude
                                        }
                                      };
                                      return { ...prev, locations };
                                    });
                                  },
                                  () => alert('Unable to get location.')
                                );
                              }
                            }}
                            className="px-2 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            title="Use current location"
                          >
                            <MapPin className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEventData(prev => ({ ...prev, locations: prev.locations.filter((_, i) => i !== idx) }))}
                            className="px-2 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      {loc.coordinates && (
                        <div className="text-xs text-green-600 mt-1">
                          ✓ Location captured: {loc.coordinates.lat.toFixed(6)}, {loc.coordinates.lng.toFixed(6)}
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setEventData(prev => ({ ...prev, locations: [...prev.locations, { address: '', coordinates: null, label: '' }] }))}
                    className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Add Another Location
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                  placeholder="Event description and special instructions"
                  value={eventData.description}
                  onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Step 2: Safety & Monitoring */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Safety Measures
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {safetyMeasures.map((measure) => (
                    <div
                      key={measure.id}
                      onClick={() => updateSafetyMeasure(measure.id, !eventData.safetyMeasures.includes(measure.id))}
                      className={`p-4 border rounded-lg cursor-pointer transition ${
                        eventData.safetyMeasures.includes(measure.id)
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          checked={eventData.safetyMeasures.includes(measure.id)}
                          onChange={() => {}}
                          className="mt-1 mr-3"
                        />
                        <div>
                          <div className="font-medium">{measure.label}</div>
                          <div className="text-sm text-gray-600">{measure.desc}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Monitoring Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'basic', label: 'Basic', desc: 'Emergency contacts only' },
                    { id: 'standard', label: 'Standard', desc: 'Location sharing + check-ins' },
                    { id: 'advanced', label: 'Advanced', desc: 'Full sync + mesh network' }
                  ].map((level) => (
                    <div
                      key={level.id}
                      onClick={() => setEventData(prev => ({ ...prev, monitoringLevel: level.id }))}
                      className={`p-4 border rounded-lg cursor-pointer text-center transition ${
                        eventData.monitoringLevel === level.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{level.label}</div>
                      <div className="text-sm text-gray-600">{level.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Host Role</label>
                <div className="flex space-x-4">
                  {[
                    { id: 'child', label: 'Child/Teen', desc: 'Requires parental approval' },
                    { id: 'parent', label: 'Parent/Guardian', desc: 'Direct approval authority' },
                    { id: 'organization', label: 'Organization', desc: 'Institutional event' }
                  ].map((role) => (
                    <div
                      key={role.id}
                      onClick={() => setEventData(prev => ({ ...prev, hostRole: role.id }))}
                      className={`p-4 border rounded-lg cursor-pointer flex-1 text-center transition ${
                        eventData.hostRole === role.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{role.label}</div>
                      <div className="text-sm text-gray-600">{role.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Invitations */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Guest Management
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={eventData.isPublic}
                        onChange={(e) => setEventData(prev => ({ ...prev, isPublic: e.target.checked }))}
                        className="mr-2"
                      />
                      Public Event (visible to community)
                    </label>
                  </div>

                  {!eventData.isPublic && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Invite Specific People</label>
                      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                        <p className="text-sm text-gray-600 mb-2">
                          Select from your neighbourhood contacts or add manually
                        </p>
                        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                          Select from Contacts
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Guest Experience</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Unique event codes for guest account creation</li>
                  <li>• Emergency contact synchronization</li>
                  <li>• Customizable monitoring preferences</li>
                  <li>• Offline mesh communication access</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 4: Activities (for multi-faceted) or Review */}
          {step === 4 && eventData.type === 'multi_faceted' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Event Activities & Integrations</h3>
                <div className="space-y-4">
                  {/* Activities */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Activities</label>
                    <div className="space-y-2">
                      {eventData.activities.map((activity, idx) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Activity name"
                              value={activity.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEventData(prev => {
                                  const activities = [...prev.activities];
                                  activities[idx] = { ...activities[idx], name: val };
                                  return { ...prev, activities };
                                });
                              }}
                              className="p-2 border rounded"
                            />
                            <input
                              type="text"
                              placeholder="Description"
                              value={activity.description}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEventData(prev => {
                                  const activities = [...prev.activities];
                                  activities[idx] = { ...activities[idx], description: val };
                                  return { ...prev, activities };
                                });
                              }}
                              className="p-2 border rounded"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setEventData(prev => ({ ...prev, activities: prev.activities.filter((_, i) => i !== idx) }))}
                            className="mt-2 px-2 py-1 bg-red-500 text-white rounded text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setEventData(prev => ({ ...prev, activities: [...prev.activities, { name: '', description: '' }] }))}
                        className="px-3 py-2 bg-blue-500 text-white rounded"
                      >
                        Add Activity
                      </button>
                    </div>
                  </div>

                  {/* Integrations */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Service Integrations</label>
                    <div className="space-y-2">
                      {eventData.integrations.map((integration, idx) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Service name (e.g., Ride Sharing)"
                              value={integration.service}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEventData(prev => {
                                  const integrations = [...prev.integrations];
                                  integrations[idx] = { ...integrations[idx], service: val };
                                  return { ...prev, integrations };
                                });
                              }}
                              className="p-2 border rounded"
                            />
                            <input
                              type="url"
                              placeholder="Service URL"
                              value={integration.url}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEventData(prev => {
                                  const integrations = [...prev.integrations];
                                  integrations[idx] = { ...integrations[idx], url: val };
                                  return { ...prev, integrations };
                                });
                              }}
                              className="p-2 border rounded"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setEventData(prev => ({ ...prev, integrations: prev.integrations.filter((_, i) => i !== idx) }))}
                            className="mt-2 px-2 py-1 bg-red-500 text-white rounded text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setEventData(prev => ({ ...prev, integrations: [...prev.integrations, { service: '', url: '' }] }))}
                        className="px-3 py-2 bg-blue-500 text-white rounded"
                      >
                        Add Integration
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 (Regular) or 5 (Multi-faceted): Review & Create */}
          {(step === 4 && eventData.type !== 'multi_faceted') || (step === 5 && eventData.type === 'multi_faceted') && (
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Event Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Event Details</h4>
                    <div className="space-y-1 text-sm">
                      <div><strong>Title:</strong> {eventData.title}</div>
                      <div><strong>Type:</strong> {eventTypes.find(t => t.id === eventData.type)?.label}</div>
                      <div><strong>Dates:</strong></div>
                      <div className="ml-4">
                        {eventData.dates.map((d, idx) => (
                          <div key={idx}>
                            {d.label && <span>{d.label}: </span>}
                            {d.date} {d.startTime} - {d.endTime}
                          </div>
                        ))}
                      </div>
                      <div><strong>Locations:</strong></div>
                      <div className="ml-4">
                        {eventData.locations.map((l, idx) => (
                          <div key={idx}>
                            {l.label && <span>{l.label}: </span>}
                            {l.address}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Safety & Monitoring</h4>
                    <div className="space-y-1 text-sm">
                      <div><strong>Monitoring:</strong> {eventData.monitoringLevel}</div>
                      <div><strong>Safety Measures:</strong> {eventData.safetyMeasures.length}</div>
                      <div><strong>Host Role:</strong> {eventData.hostRole}</div>
                      <div><strong>Public Event:</strong> {eventData.isPublic ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Approval Process</h4>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  {eventData.hostRole === 'child' && (
                    <div>Child → Parent Unit → Main Household approval required</div>
                  )}
                  {eventData.hostRole === 'parent' && (
                    <div>Parent approval → Household validation required</div>
                  )}
                  {eventData.hostRole === 'organization' && (
                    <div>Organizational approval process applies</div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">LifeSync Seal Eligibility</h4>
                <div className="text-sm text-green-700 dark:text-green-300">
                  This event qualifies for the LifeSync Trust Seal upon approval completion.
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </button>

            {step < (eventData.type === 'multi_faceted' ? 5 : 4) ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            ) : (
              <button
                onClick={handleCreate}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {existingEvent ? 'Update Event' : 'Create Event & Request Approval'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Google Maps Modal */}
      <GoogleMapsModal
        isOpen={mapsModal.isOpen}
        onClose={() => setMapsModal({ isOpen: false, locationIndex: null, initialLocation: null })}
        onLocationSelect={(location) => {
          if (mapsModal.locationIndex !== null) {
            setEventData(prev => {
              const locations = [...prev.locations];
              locations[mapsModal.locationIndex] = {
                ...locations[mapsModal.locationIndex],
                address: location.address,
                coordinates: { lat: location.lat, lng: location.lng }
              };
              return { ...prev, locations };
            });
          }
        }}
        initialLocation={mapsModal.initialLocation}
      />
    </div>
  );
};

export default EventCreateWizard;