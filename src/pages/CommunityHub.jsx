import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import CommunityCreate from '../components/community/CommunityCreate';
import HouseholdCreate from '../components/community/HouseholdCreate';
import AlertCard from '../components/community/AlertCard';
import EventCreateWizard from '../components/events/EventCreateWizard';
import EventApprovalWorkflow from '../components/events/EventApprovalWorkflow';
import EventSyncDashboard from '../components/events/EventSyncDashboard';
import EventLinksModal from '../components/events/EventLinksModal';
import EventFeedbackModal from '../components/events/EventFeedbackModal';
import { SealBadge } from '../components/events/LifeSyncSeal';

const STORAGE_KEY = 'lifesync_communities_v1';
const ALERT_KEY = 'lifesync_alerts_v1';

const load = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
};

const loadAlerts = () => { try { return JSON.parse(localStorage.getItem(ALERT_KEY) || '[]'); } catch { return []; } };

const save = (items) => localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

const CommunityHub = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [communities, setCommunities] = useState(load);
  const [alerts, setAlerts] = useState(loadAlerts);
  const [events, setEvents] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lifesync_events_v1') || '[]'); } catch { return []; }
  });
  const [activeTab, setActiveTab] = useState(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) return tabFromUrl;
    // Set tab based on pathname
    if (location.pathname === '/community-governance') return 'governance';
    if (location.pathname === '/incident-reporting') return 'communications';
    if (location.pathname === '/local-networking') return 'communications';
    if (location.pathname === '/community-support') return 'communications';
    return 'overview';
  });
  const [showEventWizard, setShowEventWizard] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventApproval, setShowEventApproval] = useState(false);
  const [showEventSync, setShowEventSync] = useState(false);
  const [showEventLinks, setShowEventLinks] = useState(false);
  const [showEventFeedback, setShowEventFeedback] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('General');

  useEffect(() => { save(communities); }, [communities]);
  useEffect(() => { localStorage.setItem('lifesync_events_v1', JSON.stringify(events)); }, [events]);

  // Auto-open event creation wizard when deep-linked via action=create on events tab
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    const action = searchParams.get('action');
    if (tabFromUrl === 'events' && action === 'create') {
      setActiveTab('events');
      setShowEventWizard(true);
    }
  }, [searchParams]);

  const handleCreate = useCallback((c) => setCommunities((s) => [c, ...s]), []);

  const handleCreateEvent = useCallback((event) => {
    setEvents(prev => [event, ...prev]);
    localStorage.setItem('lifesync_events_v1', JSON.stringify([event, ...events]));
  }, [events]);

  const handleApproveEvent = useCallback((eventId, approval) => {
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        const updatedEvent = { ...event };
        updatedEvent.governance.approvals = [...(updatedEvent.governance.approvals || []), approval];

        // Check approval type
        if (approval.type === 'approve') {
          // Advance current step along the approvalChain when approved
          const chain = updatedEvent.governance.approvalChain || [];
          const currentIdx = chain.indexOf(updatedEvent.governance.currentStep);
          if (currentIdx >= 0 && currentIdx < chain.length - 1) {
            updatedEvent.governance.currentStep = chain[currentIdx + 1];
          }

          const requiredApprovals = updatedEvent.governance.approvalChain.length;
          const fullApprovals = updatedEvent.governance.approvals.filter(a => a.type === 'approve').length;
          if (fullApprovals >= requiredApprovals) {
            updatedEvent.status = 'approved';
            updatedEvent.seal = {
              granted: true,
              validUntil: new Date(updatedEvent.dates?.[0]?.date + 'T' + updatedEvent.dates?.[0]?.endTime).getTime() || Date.now() + 86400000,
              criteria: ['governance_completed', 'safety_measures', 'emergency_sync']
            };
            // Generate links and QR codes (use existing /seal/:id route)
            const eventUrl = `${window.location.origin}/seal/${updatedEvent.id}`;
            const privateUrl = `${eventUrl}?token=${btoa(updatedEvent.id + '_private')}`;
            const publicUrl = `${eventUrl}?token=${btoa(updatedEvent.id + '_public')}`;
            updatedEvent.links = {
              public: publicUrl,
              private: privateUrl,
              qrPublic: null, // Will be generated on display
              qrPrivate: null
            };
          }
        } else if (approval.type === 'conditions') {
          updatedEvent.status = 'approved_with_conditions';
          updatedEvent.governance.conditions = approval.conditions;
        } else if (approval.type === 'request_info') {
          updatedEvent.status = 'pending_info';
          updatedEvent.governance.requestedInfo = approval.requestInfo;
        }

        return updatedEvent;
      }
      return event;
    }));
  }, []);

  const handleRejectEvent = useCallback((eventId, rejection) => {
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          status: 'rejected',
          governance: {
            ...event.governance,
            rejections: [...(event.governance.rejections || []), rejection]
          }
        };
      }
      return event;
    }));
  }, []);

  const handleEditEvent = useCallback((event) => {
    setEditingEvent(event);
    setShowEventWizard(true);
  }, []);

  const handleUpdateEvent = useCallback((updatedEvent) => {
    setEvents(prev => prev.map(event => 
      event.id === updatedEvent.id ? { ...updatedEvent, lastUpdated: Date.now() } : event
    ));
    setEditingEvent(null);
    setShowEventWizard(false);
  }, []);

  const handleSubmitFeedback = useCallback((eventId, feedbackEntry) => {
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        const updatedEvent = { ...event };
        updatedEvent.feedback = [...(updatedEvent.feedback || []), feedbackEntry];
        return updatedEvent;
      }
      return event;
    }));
  }, []);

  const handleCreateHousehold = useCallback((household) => {
    // For now, add to first community or create a new one
    if (communities.length === 0) {
      const community = { id: 'c_' + Date.now(), name: 'Default Community', description: 'Auto-created', households: [household] };
      setCommunities([community]);
    } else {
      setCommunities((prev) => prev.map((c, i) => i === 0 ? { ...c, households: [...(c.households || []), household] } : c));
    }
  }, [communities.length]);

  const handleConfirm = useCallback((alertId, confirmation) => {
    setAlerts((prev) => prev.map((a) => {
      if (a.id !== alertId) return a;
      const next = { ...a, confirmations: [...(a.confirmations||[]), confirmation] };
      if (next.confirmations.filter(c=>c.verdict==='confirm').length >= 2) next.status = 'confirmed';
      return next;
    }));
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'events', label: 'Events' },
    { id: 'households', label: 'Households' },
    { id: 'governance', label: 'Governance' },
    { id: 'communications', label: 'Communications' },
    { id: 'integrations', label: 'Integrations' }
  ];

  const householdCount = useMemo(() =>
    communities.flatMap(c => c.households || []).length,
    [communities]
  );

  const approvedEventsCount = useMemo(() =>
    events.filter(e => e.status === 'approved').length,
    [events]
  );

  const hubAlertsCount = useMemo(() =>
    alerts.filter(a => a.communityId === 'hub').length,
    [alerts]
  );

  const hubAlerts = useMemo(() =>
    alerts.filter(a => a.communityId === 'hub'),
    [alerts]
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Community Hub</h1>

      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => changeTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Welcome Header */}
          <div className="text-center py-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">🏠</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Home</h1>
                <p className="text-gray-600 dark:text-gray-400">Your family's safety and community hub</p>
              </div>
            </div>
          </div>

          {/* Quick Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{householdCount}</div>
                  <div className="text-green-100">Households</div>
                </div>
                <div className="text-4xl">🏘️</div>
              </div>
              <button
                onClick={() => changeTab('households')}
                className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
              >
                Manage Households →
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{approvedEventsCount}</div>
                  <div className="text-blue-100">Active Events</div>
                </div>
                <div className="text-4xl">🎉</div>
              </div>
              <button
                onClick={() => changeTab('events')}
                className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
              >
                View Events →
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{hubAlertsCount}</div>
                  <div className="text-purple-100">Community Alerts</div>
                </div>
                <div className="text-4xl">🔔</div>
              </div>
              <button
                onClick={() => changeTab('communications')}
                className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
              >
                View Alerts →
              </button>
            </div>

            <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">5</div>
                  <div className="text-orange-100">Integrations</div>
                </div>
                <div className="text-4xl">🔗</div>
              </div>
              <button
                onClick={() => changeTab('integrations')}
                className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
              >
                Manage Integrations →
              </button>
            </div>
          </div>

          {/* Family Safety Status */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Family Safety Status</h2>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">All Systems Active</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600">📡</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Offline Network</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Wi-Fi & Bluetooth Active</div>
                  </div>
                </div>
                <div className="text-xs text-green-600 font-medium">✓ Connected to 12 devices</div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600">🚨</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Emergency Sync</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Rapid response ready</div>
                  </div>
                </div>
                <div className="text-xs text-blue-600 font-medium">✓ Last sync: 2 minutes ago</div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mr-3">
                    <span className="text-purple-600">👥</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Community Trust</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Verified connections</div>
                  </div>
                </div>
                <div className="text-xs text-purple-600 font-medium">✓ 95% trust score</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowEventWizard(true)}
                  className="w-full flex items-center p-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all"
                >
                  <span className="text-xl mr-3">🎉</span>
                  <div className="text-left">
                    <div className="font-medium">Create Family Event</div>
                    <div className="text-sm opacity-90">Plan safe gatherings with LifeSync Seal</div>
                  </div>
                </button>

                <button
                  onClick={() => changeTab('households')}
                  className="w-full flex items-center p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
                >
                  <span className="text-xl mr-3">👨‍👩‍👧‍👦</span>
                  <div className="text-left">
                    <div className="font-medium">Manage Households</div>
                    <div className="text-sm opacity-90">Add family members and set permissions</div>
                  </div>
                </button>

                <button
                  onClick={() => changeTab('communications')}
                  className="w-full flex items-center p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                >
                  <span className="text-xl mr-3">💬</span>
                  <div className="text-left">
                    <div className="font-medium">Send Family Alert</div>
                    <div className="text-sm opacity-90">Communicate safely offline-first</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Activity</h3>
              <div className="space-y-3">
                {events.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs text-white">🎉</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900 dark:text-white">{event.title}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{event.date} • {event.status}</div>
                    </div>
                  </div>
                ))}
                {events.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="text-4xl mb-2">🎯</div>
                    <div>No recent events</div>
                    <div className="text-sm">Create your first family event!</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Community Creation */}
          {communities.length === 0 && (
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-8 text-center text-white">
              <div className="text-6xl mb-4">🌍</div>
              <h2 className="text-2xl font-bold mb-2">Join Your Community</h2>
              <p className="mb-6 opacity-90">Connect with neighbors and build a safer, stronger community together.</p>
              <CommunityCreate onCreate={handleCreate} />
            </div>
          )}
        </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold">LifeSync Seal Events</h2>
              {searchParams.get('action') === 'create' && (
                <span className="ml-3 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 animate-pulse">Wizard open</span>
              )}
            </div>
            <button
              onClick={() => setSearchParams({ tab: 'events', action: 'create' })}
              className={`px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 ${searchParams.get('action') === 'create' ? 'ring-2 ring-offset-2 ring-primary-300' : ''}`}
            >
              Create Event
            </button>
          </div>

          {events.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Your Events</h3>
              {events.map((event) => (
                <div key={event.id} className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{event.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
                    </div>
                    <div className="text-right">
                      <SealBadge event={event} />
                      <div className={`mt-2 px-2 py-1 rounded text-xs ${
                        event.status === 'approved' ? 'bg-green-100 text-green-800' :
                        event.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                        event.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {event.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Dates:</span>
                      {event.dates ? event.dates.map((d, idx) => (
                        <div key={idx} className="ml-2">
                          {d.label && <span>{d.label}: </span>}
                          {d.date} {d.startTime}-{d.endTime}
                        </div>
                      )) : (
                        <div>{event.date} {event.startTime}-{event.endTime}</div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Locations:</span>
                      {event.locations ? event.locations.map((l, idx) => (
                        <div key={idx} className="ml-2">
                          {l.label && <span>{l.label}: </span>}
                          {l.address}
                        </div>
                      )) : (
                        <div>{event.location?.address || 'N/A'}</div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {event.type}
                    </div>
                    <div>
                      <span className="font-medium">Attendees:</span> {event.attendees?.accepted?.length || 0}
                    </div>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    {!isEventCompleted(event) && (
                      <button
                        onClick={() => handleEditEvent(event)}
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
                        onClick={() => openEventApproval(event)}
                        className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                      >
                        Review Approval
                      </button>
                    )}
                    {event.status === 'approved' && (
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEventSync(true);
                        }}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      >
                        Manage Sync
                      </button>
                    )}
                    {event.status === 'approved' && event.links && (
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEventLinks(true);
                        }}
                        className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                      >
                        QR Codes & Links
                      </button>
                    )}
                    {event.status === 'approved' && isEventCompleted(event) && (
                      <button
                        onClick={() => archiveEvent(event.id)}
                        className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                      >
                        Archive
                      </button>
                    )}
                    {event.status === 'archived' && (
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEventFeedback(true);
                        }}
                        className="px-3 py-1 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600"
                      >
                        View Feedback
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-xl">🔒</span>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200">LifeSync Seal</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-300">Trust & Safety Certified</p>
                </div>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                Events with verified safety protocols, governance flows, and emergency sync capabilities.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Child-to-household approval
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Offline mesh communication
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Emergency sync active
                </div>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-4">Event Types</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-sm">Private Events</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Family</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-sm">Community Events</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Street</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-sm">Public Events</span>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Festival</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-sm">Institutional</span>
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">School</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-4">Safety Features</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Governance Flow</p>
                    <p className="text-xs text-gray-600">Child → Parent → Household approval</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-sm">📡</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Offline Mesh</p>
                    <p className="text-xs text-gray-600">Wi-Fi & Bluetooth communication</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 text-sm">🚨</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Emergency Sync</p>
                    <p className="text-xs text-gray-600">Rapid response coordination</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-yellow-50 dark:bg-yellow-900 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Getting Started</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
              Create your first LifeSync Seal event to enable comprehensive safety monitoring and offline communication.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-200 dark:bg-yellow-800 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-yellow-800 dark:text-yellow-200">1</span>
                </div>
                <p>Create Event</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-200 dark:bg-yellow-800 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-yellow-800 dark:text-yellow-200">2</span>
                </div>
                <p>Get Approvals</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-200 dark:bg-yellow-800 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-yellow-800 dark:text-yellow-200">3</span>
                </div>
                <p>Earn Seal</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'households' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <HouseholdCreate onCreate={handleCreateHousehold} />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">All Households</h3>
            {communities.flatMap(c => c.households || []).length === 0 ? (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded">No households yet.</div>
            ) : (
              <div className="space-y-3">
                {communities.flatMap(c => c.households || []).map((h) => (
                  <div key={h.id} className="p-4 bg-white dark:bg-gray-700 rounded shadow-sm">
                    <div className="font-semibold">{h.name}</div>
                    <div className="text-sm text-gray-500">{h.address}</div>
                    {h.description && <div className="text-sm text-gray-600 mt-1">{h.description}</div>}
                    <div className="text-sm text-gray-500 mt-2">Members: {h.members?.length || 0}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'governance' && (
        <div className="space-y-6">
          <div className="p-4 bg-white dark:bg-gray-800 rounded">
            <h3 className="text-lg font-semibold mb-4">Community Governance</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Manage governance structures for households, streets, and neighbourhoods.
              Set up validators, elections, and policies as per the 60% quorum rule.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-white dark:bg-gray-800 rounded">
              <h4 className="font-semibold mb-3 text-blue-600">Household Governance</h4>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <h5 className="font-medium">Constitution</h5>
                  <p className="text-sm text-gray-600">Membership rules, validator thresholds, incident validation</p>
                  <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm">View/Edit</button>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <h5 className="font-medium">Elections</h5>
                  <p className="text-sm text-gray-600">Admin, Moderators, Unit Leads</p>
                  <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm">Manage</button>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <h5 className="font-medium">Sanctions</h5>
                  <p className="text-sm text-gray-600">Warning → Mute → Suspension → Removal</p>
                  <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm">Review</button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded">
              <h4 className="font-semibold mb-3 text-green-600">Street Governance</h4>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <h5 className="font-medium">Street Coordinator</h5>
                  <p className="text-sm text-gray-600">Elected leader for street community</p>
                  <button className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-sm">Elect</button>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <h5 className="font-medium">Responders Roster</h5>
                  <p className="text-sm text-gray-600">Trained responders for emergencies</p>
                  <button className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-sm">Manage</button>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <h5 className="font-medium">Public Page</h5>
                  <p className="text-sm text-gray-600">Street announcements and projects</p>
                  <button className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-sm">Edit</button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded">
              <h4 className="font-semibold mb-3 text-purple-600">Neighbourhood Governance</h4>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <h5 className="font-medium">Federation</h5>
                  <p className="text-sm text-gray-600">Multiple streets forming neighbourhood</p>
                  <button className="mt-2 px-3 py-1 bg-purple-600 text-white rounded text-sm">Federate</button>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <h5 className="font-medium">Cross-Street Escalation</h5>
                  <p className="text-sm text-gray-600">Escalate issues to neighbourhood level</p>
                  <button className="mt-2 px-3 py-1 bg-purple-600 text-white rounded text-sm">Configure</button>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <h5 className="font-medium">Analytics</h5>
                  <p className="text-sm text-gray-600">Participation metrics and coverage</p>
                  <button className="mt-2 px-3 py-1 bg-purple-600 text-white rounded text-sm">View</button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 rounded">
            <h4 className="font-semibold mb-3">Validator System</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <h5 className="font-medium">60% Quorum Rule</h5>
                <p className="text-sm text-gray-600">New members require 60% validator approval</p>
                <div className="mt-2 text-sm">
                  <span className="font-medium">Current Validators:</span> 3
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <h5 className="font-medium">Validator Growth</h5>
                <p className="text-sm text-gray-600">Each validated member becomes a validator</p>
                <button className="mt-2 px-3 py-1 bg-gray-600 text-white rounded text-sm">Manage Validators</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'communications' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-4 bg-white dark:bg-gray-800 rounded">
              <h3 className="font-semibold mb-2">Send Community Alert</h3>
              <select value={category} onChange={(e)=>setCategory(e.target.value)} className="mb-2 p-2 border rounded w-full">
                <option>Medical</option>
                <option>Fire</option>
                <option>Crime</option>
                <option>Infrastructure</option>
                <option>General</option>
              </select>
              <textarea value={message} onChange={(e)=>setMessage(e.target.value)} className="w-full mb-2 p-2 border rounded" placeholder="Describe the situation" />
              <div className="flex justify-end">
                <button onClick={createAlert} className="px-4 py-2 bg-primary-600 text-white rounded">Send Alert</button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
              <div className="space-y-3">
                {hubAlertsCount === 0 ? (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded">No alerts.</div>
                ) : (
                  hubAlerts.map((a) => <AlertCard key={a.id} alert={a} onConfirm={handleConfirm} />)
                )}
              </div>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 rounded">
            <h3 className="text-lg font-semibold mb-4">Offline-First Communications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded">
                <h4 className="font-medium text-blue-800 dark:text-blue-200">Local Wi-Fi</h4>
                <p className="text-sm text-blue-600 dark:text-blue-300">Direct device-to-device via LAN</p>
                <div className="mt-2 text-xs text-green-600">✓ Active</div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900 rounded">
                <h4 className="font-medium text-green-800 dark:text-green-200">Bluetooth LE</h4>
                <p className="text-sm text-green-600 dark:text-green-300">Low-energy mesh networking</p>
                <div className="mt-2 text-xs text-green-600">✓ Active</div>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900 rounded">
                <h4 className="font-medium text-purple-800 dark:text-purple-200">Wi-Fi Direct</h4>
                <p className="text-sm text-purple-600 dark:text-purple-300">High-speed peer-to-peer</p>
                <div className="mt-2 text-xs text-yellow-600">○ Available</div>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900 rounded">
                <h4 className="font-medium text-orange-800 dark:text-orange-200">Mesh Network</h4>
                <p className="text-sm text-orange-600 dark:text-orange-300">Extended range routing</p>
                <div className="mt-2 text-xs text-green-600">✓ Active</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 rounded">
            <h3 className="text-lg font-semibold mb-4">Presence & Connectivity</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded text-center">
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-sm text-gray-600">Local Network</div>
                <div className="text-xs text-green-600">Within range</div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded text-center">
                <div className="text-2xl font-bold text-blue-600">8</div>
                <div className="text-sm text-gray-600">Street Network</div>
                <div className="text-xs text-blue-600">Nearby</div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded text-center">
                <div className="text-2xl font-bold text-gray-600">25</div>
                <div className="text-sm text-gray-600">Online</div>
                <div className="text-xs text-gray-600">Internet connected</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 rounded">
            <h3 className="text-lg font-semibold mb-4">Communication Channels</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <span className="font-medium">Family Channel</span>
                  <span className="text-sm text-gray-600 ml-2">Private family communications</span>
                </div>
                <span className="text-green-600 text-sm">Active</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <span className="font-medium">Household Channel</span>
                  <span className="text-sm text-gray-600 ml-2">Property-wide communications</span>
                </div>
                <span className="text-green-600 text-sm">Active</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <span className="font-medium">Street Channel</span>
                  <span className="text-sm text-gray-600 ml-2">Neighbourhood safety alerts</span>
                </div>
                <span className="text-blue-600 text-sm">Available</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <span className="font-medium">Responder Channel</span>
                  <span className="text-sm text-gray-600 ml-2">Emergency response coordination</span>
                </div>
                <span className="text-yellow-600 text-sm">On Demand</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div className="p-4 bg-white dark:bg-gray-800 rounded">
            <h3 className="text-lg font-semibold mb-4">Ecosystem Integrations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded">
                <h4 className="font-medium text-blue-800 dark:text-blue-200">Sazi Life Academy</h4>
                <p className="text-sm text-blue-600 dark:text-blue-300">Educational resources and courses for community members</p>
                <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm" onClick={() => window.open('https://sazi-life-academy.com', '_blank')}>Access Academy</button>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900 rounded">
                <h4 className="font-medium text-green-800 dark:text-green-200">Bizhub</h4>
                <p className="text-sm text-green-600 dark:text-green-300">Business networking and opportunities within communities</p>
                <button className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-sm" onClick={() => window.open('https://bizhub.salatiso.com', '_blank')}>Open Bizhub</button>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded">
                <h4 className="font-medium text-purple-800 dark:text-purple-200">Family Value</h4>
                <p className="text-sm text-purple-600 dark:text-purple-300">Family formalisation and public presence management</p>
                <button className="mt-2 px-3 py-1 bg-purple-600 text-white rounded text-sm" onClick={() => window.open('https://family-value.salatiso.com', '_blank')}>Manage Family</button>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900 rounded">
                <h4 className="font-medium text-orange-800 dark:text-orange-200">Ekhaya</h4>
                <p className="text-sm text-orange-600 dark:text-orange-300">Household management and governance tools</p>
                <button className="mt-2 px-3 py-1 bg-orange-600 text-white rounded text-sm" onClick={() => window.open('https://ekhaya.salatiso.com', '_blank')}>Household Hub</button>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900 rounded">
                <h4 className="font-medium text-red-800 dark:text-red-200">Pigeeback</h4>
                <p className="text-sm text-red-600 dark:text-red-300">Trust and transport safety verification</p>
                <button className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm" onClick={() => window.open('https://pigeeback.salatiso.com', '_blank')}>Safe Transport</button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 rounded">
            <h3 className="text-lg font-semibold mb-4">Integration Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span>Sazi Life Academy by Salatiso</span>
                <span className="text-green-600">✓ Connected</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span>Bizhub</span>
                <span className="text-green-600">✓ Connected</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span>Family Value</span>
                <span className="text-green-600">✓ Connected</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span>Ekhaya</span>
                <span className="text-green-600">✓ Connected</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span>Pigeeback</span>
                <span className="text-green-600">✓ Connected</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEventWizard && (
        <EventCreateWizard
          onCreate={editingEvent ? handleUpdateEvent : handleCreateEvent}
          onClose={() => {
            setShowEventWizard(false);
            setEditingEvent(null);
            // Clear action=create from URL when wizard closes
            const params = new URLSearchParams(searchParams);
            params.delete('action');
            params.set('tab', 'events');
            setSearchParams(params);
          }}
          existingEvent={editingEvent}
        />
      )}

      {showEventApproval && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Event Approval Workflow</h2>
                <button onClick={() => setShowEventApproval(false)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>
              <EventApprovalWorkflow
                event={selectedEvent}
                onApprove={handleApproveEvent}
                onReject={handleRejectEvent}
                currentUserRole="parent" // In real app, get from auth context
              />
            </div>
          </div>
        </div>
      )}

      {showEventSync && selectedEvent && (
        <EventSyncDashboard
          event={selectedEvent}
          onClose={() => setShowEventSync(false)}
        />
      )}

      {showEventLinks && selectedEvent && (
        <EventLinksModal
          event={selectedEvent}
          onClose={() => setShowEventLinks(false)}
        />
      )}

      {showEventFeedback && selectedEvent && (
        <EventFeedbackModal
          event={selectedEvent}
          onClose={() => setShowEventFeedback(false)}
          onSubmitFeedback={handleSubmitFeedback}
        />
      )}
    </div>
  );
};

export default CommunityHub;
