import { useContext, useEffect, useMemo, useState } from 'react';
import GuestContext from '../contexts/GuestContext';
import { CalendarClock, Plus, Trash, Edit2, CheckCircle2, AlertTriangle } from 'lucide-react';

const generateId = () => Math.random().toString(36).slice(2, 10);

const CheckIns = () => {
  const { guestData, setGuestData } = useContext(GuestContext);
  const [form, setForm] = useState({ name: '', frequency: 'hourly', timeOfDay: '18:00', contacts: '', graceMinutes: 10 });
  const [editingId, setEditingId] = useState(null);
  const schedules = useMemo(() => guestData.checkIns || [], [guestData.checkIns]);
  const logs = useMemo(() => (guestData.checkInLogs || []).slice().reverse(), [guestData.checkInLogs]);

  useEffect(() => {
    // Lightweight scheduler: stores nextDue timestamps and simulates notifications via UI flags
    const interval = setInterval(() => {
      setGuestData(prev => ({
        ...prev,
        checkIns: (prev.checkIns || []).map(s => {
          const now = Date.now();
          if (!s.nextDue) return s;
          let updated = { ...s };
          if (now >= s.nextDue && s.status !== 'overdue') {
            updated.status = 'overdue';
          }
          // Escalation after grace period
          const graceMs = (s.graceMinutes ?? 10) * 60 * 1000;
          if (now >= s.nextDue + graceMs && !s.lastEscalatedAt) {
            const entry = { id: crypto.randomUUID(), scheduleId: s.id, type: 'escalation', at: now, message: `Missed check-in: ${s.name}` };
            const newLogs = [...(prev.checkInLogs || []), entry].slice(-200);
            // fire-and-forget notification
            if (Notification?.permission === 'granted') {
              new Notification('Check-in escalation', { body: `${s.name} missed; notifying contacts` });
            }
            // Store logs and mark escalation
            setTimeout(() => setGuestData(p => ({ ...p, checkInLogs: newLogs })), 0);
            updated.lastEscalatedAt = now;
          }
          return updated;
        })
      }));
    }, 30000);
    return () => clearInterval(interval);
  }, [setGuestData]);

  const computeNextDue = (schedule) => {
    const now = new Date();
    if (schedule.frequency === 'hourly') return Date.now() + 60 * 60 * 1000;
    if (schedule.frequency === 'daily') {
      const [hh, mm] = (schedule.timeOfDay || '18:00').split(':').map(Number);
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0, 0);
      if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
      return next.getTime();
    }
    if (schedule.frequency === 'weekly') {
      // Default to same day/time next week
      const [hh, mm] = (schedule.timeOfDay || '18:00').split(':').map(Number);
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0, 0);
      next.setDate(next.getDate() + 7);
      return next.getTime();
    }
    return Date.now() + 24 * 60 * 60 * 1000;
  };

  const upsertSchedule = () => {
    if (!form.name) return;
    const id = editingId || generateId();
  const schedule = { id, ...form };
  schedule.contacts = (form.contacts || '').split(',').map(s => s.trim()).filter(Boolean);
    schedule.nextDue = computeNextDue(schedule);
    const next = editingId ? schedules.map(s => s.id === id ? schedule : s) : [schedule, ...schedules];
    setGuestData(prev => ({ ...prev, checkIns: next }));
    setForm({ name: '', frequency: 'hourly', timeOfDay: '18:00', contacts: '', graceMinutes: 10 });
    setEditingId(null);
  };

  const editSchedule = (s) => {
    setForm({ name: s.name, frequency: s.frequency, timeOfDay: s.timeOfDay || '18:00', contacts: (s.contacts || []).join(', '), graceMinutes: s.graceMinutes ?? 10 });
    setEditingId(s.id);
  };

  const deleteSchedule = (id) => {
    setGuestData(prev => ({ ...prev, checkIns: schedules.filter(s => s.id !== id) }));
  };

  const markCheckedIn = (id) => {
    setGuestData(prev => ({
      ...prev,
      checkIns: schedules.map(s => s.id === id ? ({ ...s, status: 'ok', lastCheckedInAt: Date.now(), nextDue: computeNextDue(s), lastEscalatedAt: null }) : s)
    }));
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center"><CalendarClock className="h-6 w-6 mr-2"/>Check-in Scheduler</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <input className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700" placeholder="Schedule name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <select className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700" value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            {form.frequency !== 'hourly' && (
              <input className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700" placeholder="Time of day (HH:MM)" value={form.timeOfDay} onChange={e => setForm({ ...form, timeOfDay: e.target.value })} />
            )}
            <input className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700" placeholder="Contacts (comma separated)" value={form.contacts} onChange={e => setForm({ ...form, contacts: e.target.value })} />
            <input className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700" placeholder="Grace minutes" type="number" value={form.graceMinutes} onChange={e => setForm({ ...form, graceMinutes: Number(e.target.value) })} />
            <button onClick={upsertSchedule} className="px-3 py-2 bg-primary-600 text-white rounded flex items-center"><Plus className="h-4 w-4 mr-1"/>{editingId ? 'Update' : 'Add'} Schedule</button>
          </div>

          <div>
            <div className="font-semibold mb-2">Schedules</div>
            <ul className="space-y-2">
              {schedules.map(s => (
                <li key={s.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-gray-500">{s.frequency}{s.frequency !== 'hourly' ? ` at ${s.timeOfDay}` : ''}</div>
                      {(s.contacts && s.contacts.length > 0) && (
                        <div className="text-xs text-gray-500">Contacts: {s.contacts.join(', ')}</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => editSchedule(s)} className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm flex items-center"><Edit2 className="h-4 w-4 mr-1"/>Edit</button>
                      <button onClick={() => deleteSchedule(s.id)} className="px-2 py-1 bg-red-600 text-white rounded text-sm flex items-center"><Trash className="h-4 w-4 mr-1"/>Delete</button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <div>Next due: {s.nextDue ? new Date(s.nextDue).toLocaleString() : '-'}</div>
                    <div className={"text-xs px-2 py-0.5 rounded " + (s.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')}>{s.status || 'ok'}</div>
                  </div>
                  <div className="mt-2">
                    <button onClick={() => markCheckedIn(s.id)} className="px-2 py-1 bg-green-600 text-white rounded text-sm flex items-center"><CheckCircle2 className="h-4 w-4 mr-1"/>I am safe</button>
                  </div>
                </li>
              ))}
              {schedules.length === 0 && (
                <li className="text-gray-500 flex items-center"><AlertTriangle className="h-4 w-4 mr-2"/>No schedules yet</li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-4">
          <div className="font-semibold mb-2">Escalation Log</div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {logs.map(e => (
              <div key={e.id} className="text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                {new Date(e.at).toLocaleString()} — {e.message}
              </div>
            ))}
            {logs.length === 0 && <div className="text-gray-500 text-sm">No escalations yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckIns;
