import { useState, useEffect } from 'react';
import { MapPin, Users, Wifi, Bluetooth, Battery, AlertTriangle, CheckCircle } from 'lucide-react';

const EventSyncDashboard = ({ event, onClose }) => {
  const [syncStatus, setSyncStatus] = useState({
    active: false,
    participants: [],
    alerts: [],
    meshNetwork: {
      active: false,
      devices: 0,
      range: 'local',
      strength: 'good'
    },
    location: {
      shared: false,
      updates: [],
      accuracy: 'high'
    }
  });

  const [message, setMessage] = useState('');
  const [alertType, setAlertType] = useState('info');

  useEffect(() => {
    // Simulate real-time sync status updates
    const interval = setInterval(() => {
      setSyncStatus(prev => ({
        ...prev,
        participants: prev.participants.map(p => ({
          ...p,
          lastSeen: Date.now() - Math.random() * 300000, // Random last seen time
          status: Math.random() > 0.1 ? 'online' : 'offline'
        }))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const startSync = () => {
    setSyncStatus(prev => ({
      ...prev,
      active: true,
      meshNetwork: { ...prev.meshNetwork, active: true },
      location: { ...prev.location, shared: true }
    }));
  };

  const stopSync = () => {
    setSyncStatus(prev => ({
      ...prev,
      active: false,
      meshNetwork: { ...prev.meshNetwork, active: false },
      location: { ...prev.location, shared: false }
    }));
  };

  const sendAlert = () => {
    if (!message.trim()) return;

    const alert = {
      id: Date.now(),
      type: alertType,
      message: message.trim(),
      timestamp: Date.now(),
      sender: 'current_user'
    };

    setSyncStatus(prev => ({
      ...prev,
      alerts: [alert, ...prev.alerts]
    }));

    setMessage('');
  };

  const mockParticipants = [
    { id: 1, name: 'John Doe', role: 'attendee', status: 'online', lastSeen: Date.now() - 120000 },
    { id: 2, name: 'Jane Smith', role: 'monitor', status: 'online', lastSeen: Date.now() - 60000 },
    { id: 3, name: 'Mike Johnson', role: 'attendee', status: 'offline', lastSeen: Date.now() - 600000 },
    { id: 4, name: 'Sarah Wilson', role: 'emergency', status: 'online', lastSeen: Date.now() - 30000 }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Event Sync Dashboard</h2>
              <p className="text-gray-600 dark:text-gray-400">{event.title}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          {/* Sync Controls */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Sync Status</h3>
              <div className="flex space-x-2">
                {!syncStatus.active ? (
                  <button
                    onClick={startSync}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Start Sync
                  </button>
                ) : (
                  <button
                    onClick={stopSync}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Stop Sync
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-3 rounded ${syncStatus.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">Sync {syncStatus.active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              <div className={`p-3 rounded ${syncStatus.meshNetwork.active ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                <div className="flex items-center">
                  <Wifi className="w-5 h-5 mr-2" />
                  <span className="font-medium">Mesh {syncStatus.meshNetwork.active ? 'Connected' : 'Offline'}</span>
                </div>
              </div>
              <div className={`p-3 rounded ${syncStatus.location.shared ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span className="font-medium">Location {syncStatus.location.shared ? 'Shared' : 'Private'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Participants */}
            <div className="p-4 bg-white dark:bg-gray-800 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Participants ({mockParticipants.length})
              </h3>
              <div className="space-y-3">
                {mockParticipants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        participant.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <div className="font-medium">{participant.name}</div>
                        <div className="text-sm text-gray-600 capitalize">{participant.role}</div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {participant.status === 'online' ? 'Online' : 'Last seen'}
                      <div>{new Date(participant.lastSeen).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts & Communication */}
            <div className="space-y-4">
              {/* Send Alert */}
              <div className="p-4 bg-white dark:bg-gray-800 border rounded-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Send Alert
                </h3>
                <div className="space-y-3">
                  <select
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="emergency">Emergency</option>
                    <option value="checkin">Check-in Request</option>
                  </select>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Alert message..."
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                  <button
                    onClick={sendAlert}
                    disabled={!message.trim()}
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-gray-400"
                  >
                    Send Alert
                  </button>
                </div>
              </div>

              {/* Recent Alerts */}
              <div className="p-4 bg-white dark:bg-gray-800 border rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {syncStatus.alerts.length === 0 ? (
                    <p className="text-gray-500 text-sm">No alerts sent</p>
                  ) : (
                    syncStatus.alerts.map((alert) => (
                      <div key={alert.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                        <div className="flex justify-between items-start mb-1">
                          <span className={`px-2 py-1 rounded text-xs ${
                            alert.type === 'emergency' ? 'bg-red-100 text-red-800' :
                            alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {alert.type}
                          </span>
                          <span className="text-gray-500">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p>{alert.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mesh Network Status */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-800 dark:text-blue-200">
              <Bluetooth className="w-5 h-5 mr-2" />
              Mesh Network Status
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{syncStatus.meshNetwork.devices}</div>
                <div className="text-sm text-blue-700">Connected Devices</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 capitalize">{syncStatus.meshNetwork.range}</div>
                <div className="text-sm text-blue-700">Network Range</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 capitalize">{syncStatus.meshNetwork.strength}</div>
                <div className="text-sm text-blue-700">Signal Strength</div>
              </div>
              <div className="text-center">
                <Battery className="w-8 h-8 mx-auto text-green-600 mb-1" />
                <div className="text-sm text-blue-700">Battery Optimized</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventSyncDashboard;