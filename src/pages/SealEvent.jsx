import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { useParams, Link } from 'react-router-dom';
import GuestContext from '../contexts/GuestContext';
import { outboxEnqueue } from '../utils/storage';
import { AlertTriangle, Users, Clock, MapPin, Shield, Copy, Plus, Trash, Check, X } from 'lucide-react';

// Note: event creation utility moved to ../utils/sealEvents to keep this file exporting only a component

const SealEvent = () => {
  const { id } = useParams();
  const { guestData, setGuestData } = useContext(GuestContext);
  const [copied, setCopied] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', contact: '' });
  const bcRef = useRef(null);
  const [currentLoc, setCurrentLoc] = useState(null);
  const [qr, setQr] = useState('');

  const event = useMemo(() => (guestData.sealEvents || []).find(e => e.id === id), [guestData.sealEvents, id]);

  const copyLink = async () => {
    try {
      if (!event?.shareUrl) return;
      await navigator.clipboard.writeText(event.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      // ignore clipboard errors
    }
  };

  const startEvent = () => {
    if (!event) return;
    setGuestData(prev => ({
      ...prev,
      sealEvents: prev.sealEvents.map(e => e.id === event.id ? { ...e, status: 'active', startAt: Date.now(), lastUpdate: Date.now() } : e)
    }));
    outboxEnqueue({ type: 'event.status', path: `/v1/events/${event.id}/status`, body: { status: 'active', timestamp: Date.now() } });
  };

  const endEvent = () => {
    if (!event) return;
    setGuestData(prev => ({
      ...prev,
      sealEvents: prev.sealEvents.map(e => e.id === event.id ? { ...e, status: 'ended', endAt: Date.now(), lastUpdate: Date.now() } : e)
    }));
    outboxEnqueue({ type: 'event.status', path: `/v1/events/${event.id}/status`, body: { status: 'ended', timestamp: Date.now() } });
  };

  const toggleMode = () => {
    if (!event) return;
    setGuestData(prev => ({
      ...prev,
      sealEvents: prev.sealEvents.map(e => e.id === event.id ? { ...e, mode: e.mode === 'group' ? 'solo' : 'group', lastUpdate: Date.now() } : e)
    }));
  };

  const toggleShareLevel = () => {
    if (!event) return;
    const nextLevel = event.shareLevel === 'availability' ? 'location' : 'availability';
    setGuestData(prev => ({
      ...prev,
      sealEvents: prev.sealEvents.map(e => e.id === event.id ? { ...e, shareLevel: nextLevel, lastUpdate: Date.now() } : e)
    }));
    outboxEnqueue({ type: 'event.patch', path: `/v1/events/${event.id}`, body: { shareLevel: nextLevel } });
  };

  const addInvitee = () => {
    if (!event) return;
    if (!inviteForm.name || !inviteForm.contact) return;
    setGuestData(prev => ({
      ...prev,
      sealEvents: prev.sealEvents.map(e => e.id === event.id ? { ...e, invitees: [...(e.invitees || []), { name: inviteForm.name, contact: inviteForm.contact, status: 'pending' }], lastUpdate: Date.now() } : e)
    }));
    setInviteForm({ name: '', contact: '' });
    outboxEnqueue({ type: 'event.patch', path: `/v1/events/${event.id}`, body: { invitees: [...(event.invitees||[]), { name: inviteForm.name, contact: inviteForm.contact, status: 'pending' }] } });
  };

  const removeInvitee = (idx) => {
    if (!event) return;
    setGuestData(prev => ({
      ...prev,
      sealEvents: prev.sealEvents.map(e => e.id === event.id ? { ...e, invitees: (e.invitees || []).filter((_, i) => i !== idx), lastUpdate: Date.now() } : e)
    }));
    outboxEnqueue({ type: 'event.patch', path: `/v1/events/${event.id}`, body: { invitees: (event.invitees||[]).filter((_, i) => i !== idx) } });
  };

  const setInviteeStatus = (idx, status) => {
    if (!event) return;
    setGuestData(prev => ({
      ...prev,
      sealEvents: prev.sealEvents.map(e => e.id === event.id ? { ...e, invitees: (e.invitees || []).map((it, i) => i === idx ? { ...it, status } : it), lastUpdate: Date.now() } : e)
    }));
    const updated = (event.invitees || []).map((it, i) => i === idx ? { ...it, status } : it);
    outboxEnqueue({ type: 'event.patch', path: `/v1/events/${event.id}`, body: { invitees: updated } });
  };

  // Simulate live updates via BroadcastChannel across tabs
  useEffect(() => {
    bcRef.current = new BroadcastChannel(`seal-${id}`);
    bcRef.current.onmessage = (msg) => {
      if (msg?.type === 'update') {
        // trigger re-render, source of truth in localStorage/GuestContext
        setGuestData(prev => ({ ...prev }));
      }
    };
    return () => bcRef.current?.close();
  }, [id, setGuestData]);

  useEffect(() => {
    bcRef.current?.postMessage({ type: 'update', at: Date.now() });
  }, [event?.lastUpdate]);

  // Generate QR code for the share URL
  useEffect(() => {
    if (event?.shareUrl) {
      QRCode.toDataURL(event.shareUrl).then(setQr).catch(() => setQr(''));
    } else {
      setQr('');
    }
  }, [event?.shareUrl]);

  // Show current location when sharing is enabled and GPS consent granted
  useEffect(() => {
    let watchId = null;
    if (event?.shareLevel === 'location' && guestData?.profile?.consentGPS) {
      watchId = navigator.geolocation.watchPosition((pos) => {
        setCurrentLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, at: Date.now() });
      }, () => {}, { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 });
    }
    return () => { if (watchId != null) navigator.geolocation.clearWatch(watchId); };
  }, [event?.shareLevel, guestData?.profile?.consentGPS]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
        {!event && (
          <div>
            <AlertTriangle className="text-yellow-600 mb-2" />
            <div className="font-semibold mb-2">Event not found</div>
            <Link to="/follow-me-home" className="text-primary-600">Create a new event</Link>
          </div>
        )}
        {event && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">LifeSync Seal Link</div>
                <h1 className="text-2xl font-bold">{event.title}</h1>
              </div>
              <Shield className="text-primary-600" />
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded flex items-center justify-between">
              <div className="truncate mr-2 text-sm">{event.shareUrl}</div>
              <button onClick={copyLink} className="px-2 py-1 bg-primary-600 text-white rounded flex items-center text-sm">
                <Copy className="h-4 w-4 mr-1" /> {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            {qr && (
              <div className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded border">
                <img src={qr} alt="Seal share QR" className="w-28 h-28" />
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Scan to open this LifeSync Seal link on a phone.
                  <div>
                    <a
                      href={qr}
                      download={`lifesync-seal-${event.id}.png`}
                      className="inline-block mt-2 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                    >
                      Download QR
                    </a>
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {event.status !== 'active' && (
                <button onClick={startEvent} className="px-3 py-2 bg-green-600 text-white rounded">Start</button>
              )}
              {event.status === 'active' && (
                <button onClick={endEvent} className="px-3 py-2 bg-red-600 text-white rounded">End</button>
              )}
              <button onClick={toggleMode} className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded">Mode: {event.mode}</button>
              <button onClick={toggleShareLevel} className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded">Share: {event.shareLevel}</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="font-semibold mb-1 flex items-center"><Users className="h-4 w-4 mr-1"/>Invitees</div>
                <div className="flex gap-2 mb-2">
                  <input className="flex-1 p-2 rounded bg-white dark:bg-gray-800" placeholder="Name" value={inviteForm.name} onChange={e => setInviteForm({ ...inviteForm, name: e.target.value })} />
                  <input className="flex-1 p-2 rounded bg-white dark:bg-gray-800" placeholder="Contact (email/phone)" value={inviteForm.contact} onChange={e => setInviteForm({ ...inviteForm, contact: e.target.value })} />
                  <button onClick={addInvitee} className="px-2 py-1 bg-primary-600 text-white rounded text-sm flex items-center"><Plus className="h-4 w-4 mr-1"/>Add</button>
                </div>
                <ul className="text-sm space-y-1">
                  {(event.invitees || []).map((i, idx) => (
                    <li key={idx} className="flex items-center justify-between gap-2">
                      <span className="truncate">{i.name} — {i.contact}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs mr-2">{i.status || 'pending'}</span>
                        <button onClick={() => setInviteeStatus(idx, 'accepted')} title="Accept" className="px-1.5 py-1 bg-green-600 text-white rounded text-xs"><Check className="h-3 w-3"/></button>
                        <button onClick={() => setInviteeStatus(idx, 'declined')} title="Decline" className="px-1.5 py-1 bg-yellow-600 text-white rounded text-xs"><X className="h-3 w-3"/></button>
                        <button onClick={() => removeInvitee(idx)} title="Remove" className="px-1.5 py-1 bg-red-600 text-white rounded text-xs"><Trash className="h-3 w-3"/></button>
                      </div>
                    </li>
                  ))}
                  {(!event.invitees || event.invitees.length === 0) && (
                    <li className="text-gray-500">No invitees added</li>
                  )}
                </ul>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="font-semibold mb-1 flex items-center"><Clock className="h-4 w-4 mr-1"/>Status</div>
                <div className="text-sm">{event.status}</div>
                <div className="text-sm">Started: {event.startAt ? new Date(event.startAt).toLocaleString() : '-'}</div>
                <div className="text-sm">Ended: {event.endAt ? new Date(event.endAt).toLocaleString() : '-'}</div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="font-semibold mb-2 flex items-center"><MapPin className="h-4 w-4 mr-1"/>Location Sharing</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {event.shareLevel === 'availability'
                  ? 'Sharing availability/commitment status only.'
                  : 'Sharing real-time location to invitees.'}
              </div>
              {event.shareLevel === 'location' && (
                <div className="mt-2 text-xs">
                  {guestData?.profile?.consentGPS ? (
                    currentLoc ? (
                      <div>Current: lat {currentLoc.lat.toFixed(5)}, lng {currentLoc.lng.toFixed(5)} (±{Math.round(currentLoc.accuracy)}m) — {new Date(currentLoc.at).toLocaleTimeString()}</div>
                    ) : (
                      <div>Waiting for GPS…</div>
                    )
                  ) : (
                    <div className="text-red-600">GPS consent is required for location sharing.</div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SealEvent;
