import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import AlertCard from '../components/community/AlertCard';
import HouseholdCreate from '../components/community/HouseholdCreate';

const COMM_KEY = 'lifesync_communities_v1';
const ALERT_KEY = 'lifesync_alerts_v1';

const loadCommunities = () => { try { return JSON.parse(localStorage.getItem(COMM_KEY) || '[]'); } catch { return []; } };
const loadAlerts = () => { try { return JSON.parse(localStorage.getItem(ALERT_KEY) || '[]'); } catch { return []; } };

const CommunityView = () => {
  const { id } = useParams();
  const [community, setCommunity] = useState(() => loadCommunities().find((c) => c.id === id));
  const [alerts, setAlerts] = useState(() => loadAlerts().filter((a) => a.communityId === id).sort((a,b)=>b.createdAt-a.createdAt));
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('General');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => { const cs = loadCommunities().find((c) => c.id === id); setCommunity(cs); }, [id]);

  useEffect(() => { localStorage.setItem(ALERT_KEY, JSON.stringify(loadAlerts().filter(a=>a.communityId!==id).concat(alerts))); }, [alerts, id]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const createAlert = () => {
    if (!message.trim()) return;
    const a = { id: 'a_' + Date.now(), communityId: id, reporterId: 'local_user', category, message: message.trim(), status: 'pending', confirmations: [], createdAt: Date.now() };
    setAlerts((s) => [a, ...s]);
    setMessage('');
  };

  const handleConfirm = useCallback((alertId, confirmation) => {
    setAlerts((prev) => {
      const arr = prev.map((a) => {
        if (a.id !== alertId) return a;
        const next = { ...a, confirmations: [...(a.confirmations||[]), confirmation] };
        const required = (community && community.settings && community.settings.confirmationsRequired) || 2;
        if (next.confirmations.filter(c=>c.verdict==='confirm').length >= required) next.status = 'confirmed';
        return next;
      });
      return arr;
    });
  }, [community]);

  const handleCreateHousehold = useCallback((household) => {
    setCommunity((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, households: [...(prev.households || []), household] };
      const allCommunities = loadCommunities().map(c => c.id === id ? updated : c);
      localStorage.setItem(COMM_KEY, JSON.stringify(allCommunities));
      return updated;
    });
  }, [id]);

  if (!community) return <div className="p-6">Community not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">{community.name}</h2>
          <p className="text-gray-600">{community.description}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm ${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="p-4 bg-white dark:bg-gray-800 rounded">
          <h3 className="font-semibold mb-2">Report an Alert</h3>
          <select value={category} onChange={(e)=>setCategory(e.target.value)} className="mb-2 p-2 border rounded w-full">
            <option>Medical</option>
            <option>Fire</option>
            <option>Crime</option>
            <option>Infrastructure</option>
            <option>General</option>
          </select>
          <textarea value={message} onChange={(e)=>setMessage(e.target.value)} className="w-full mb-2 p-2 border rounded" placeholder="Describe the situation (short)" />
          <div className="flex justify-end">
            <button onClick={createAlert} className="px-4 py-2 bg-primary-600 text-white rounded">Send Alert</button>
          </div>
        </div>

        <div>
          <HouseholdCreate onCreate={handleCreateHousehold} />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Households ({(community.households || []).length})</h3>
        {(community.households || []).length === 0 ? (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded">No households yet. Create one to get started.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(community.households || []).map((h) => (
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

      <div>
        <h3 className="text-xl font-semibold mb-3">Community Alerts</h3>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded">No alerts for this community.</div>
          ) : (
            alerts.map((a) => <AlertCard key={a.id} alert={a} onConfirm={handleConfirm} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityView;
