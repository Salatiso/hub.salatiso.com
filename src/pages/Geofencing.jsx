import { useContext, useMemo, useState } from 'react';
import GuestContext from '../contexts/GuestContext';
import { MapPin, Plus, Trash, Edit2, Bell } from 'lucide-react';

const generateId = () => Math.random().toString(36).slice(2, 10);

const Geofencing = () => {
  const { guestData, setGuestData } = useContext(GuestContext);
  const [form, setForm] = useState({ name: '', lat: '', lng: '', radius: 300 });
  const [editingId, setEditingId] = useState(null);
  const fences = useMemo(() => guestData.geofences || [], [guestData.geofences]);
  const logs = useMemo(() => (guestData.geofenceLogs || []).slice().reverse(), [guestData.geofenceLogs]);

  const upsertFence = () => {
    if (!form.name || !form.lat || !form.lng || !form.radius) return;
    const id = editingId || generateId();
    const fence = { id, ...form, lat: parseFloat(form.lat), lng: parseFloat(form.lng), radius: parseFloat(form.radius) };
    const next = editingId ? fences.map(f => f.id === id ? fence : f) : [fence, ...fences];
    setGuestData(prev => ({ ...prev, geofences: next }));
    setForm({ name: '', lat: '', lng: '', radius: 300 });
    setEditingId(null);
  };

  const editFence = (f) => {
    setForm({ name: f.name, lat: String(f.lat), lng: String(f.lng), radius: f.radius });
    setEditingId(f.id);
  };

  const deleteFence = (id) => {
    setGuestData(prev => ({ ...prev, geofences: fences.filter(f => f.id !== id) }));
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center"><MapPin className="h-6 w-6 mr-2"/>Geofencing</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <input className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <input className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700" placeholder="Latitude" value={form.lat} onChange={e => setForm({ ...form, lat: e.target.value })} />
              <input className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700" placeholder="Longitude" value={form.lng} onChange={e => setForm({ ...form, lng: e.target.value })} />
            </div>
            <input className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700" placeholder="Radius (m)" type="number" value={form.radius} onChange={e => setForm({ ...form, radius: e.target.value })} />
            <button onClick={upsertFence} className="px-3 py-2 bg-primary-600 text-white rounded flex items-center"><Plus className="h-4 w-4 mr-1"/>{editingId ? 'Update Fence' : 'Add Fence'}</button>
          </div>

          <div>
            <div className="font-semibold mb-2">Fences</div>
            <ul className="space-y-2">
              {fences.map(f => (
                <li key={f.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded flex items-center justify-between">
                  <div>
                    <div className="font-medium">{f.name}</div>
                    <div className="text-xs text-gray-500">lat {f.lat}, lng {f.lng} — {f.radius}m</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editFence(f)} className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm flex items-center"><Edit2 className="h-4 w-4 mr-1"/>Edit</button>
                    <button onClick={() => deleteFence(f.id)} className="px-2 py-1 bg-red-600 text-white rounded text-sm flex items-center"><Trash className="h-4 w-4 mr-1"/>Delete</button>
                  </div>
                </li>
              ))}
              {fences.length === 0 && (
                <li className="text-gray-500">No geofences yet</li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-4">
          <div className="font-semibold mb-2">Recent Events</div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {logs.map(e => (
              <div key={e.id} className="text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className={"px-2 py-0.5 text-xs rounded mr-2 " + (e.type === 'enter' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>{e.type}</span>
                {new Date(e.at).toLocaleString()} — {e.fenceName}
              </div>
            ))}
            {logs.length === 0 && <div className="text-gray-500 text-sm">No events yet</div>}
          </div>
        </div>

        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded text-sm flex items-start">
          <Bell className="h-5 w-5 text-amber-600 mr-2 mt-0.5"/> Background geofence checks run when the page is active. Mobile background service is planned.
        </div>
      </div>
    </div>
  );
};

export default Geofencing;
