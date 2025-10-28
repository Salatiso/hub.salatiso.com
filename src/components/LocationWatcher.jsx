import { useContext, useEffect, useRef } from 'react';
import GuestContext from '../contexts/GuestContext';
import { idbGet, idbSet } from '../utils/storage';

const GEO_LOG_KEY = 'geofenceLogs';

function distanceMeters(a, b) {
  const R = 6371000;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const x = dLon * Math.cos((lat1 + lat2) / 2);
  const y = dLat;
  return Math.sqrt(x * x + y * y) * R;
}

export default function LocationWatcher() {
  const { guestData, setGuestData } = useContext(GuestContext);
  const lastPosRef = useRef(null);
  const activeRef = useRef(true);

  // Hydrate logs once
  useEffect(() => {
    let mounted = true;
    (async () => {
      const logs = (await idbGet(GEO_LOG_KEY)) || [];
      if (mounted) setGuestData(prev => ({ ...prev, geofenceLogs: logs }));
    })();
    return () => { mounted = false; };
  }, [setGuestData]);

  // Persist logs when changed
  useEffect(() => {
    if (guestData.geofenceLogs) idbSet(GEO_LOG_KEY, guestData.geofenceLogs);
  }, [guestData.geofenceLogs]);

  useEffect(() => {
    if (!guestData?.profile?.consentGPS) return;
    const interval = setInterval(() => {
      if (!activeRef.current) return;
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
  lastPosRef.current = coords;
        const fences = guestData.geofences || [];
        const now = Date.now();
        const events = [];
        fences.forEach(f => {
          const d = distanceMeters(coords, { lat: f.lat, lng: f.lng });
          const inside = d <= f.radius;
          const wasInside = f._inside || false;
          if (inside !== wasInside) {
            events.push({ id: crypto.randomUUID(), fenceId: f.id, fenceName: f.name, type: inside ? 'enter' : 'exit', at: now });
          }
          f._inside = inside;
        });
        if (events.length) {
          setGuestData(prev => ({ ...prev, geofenceLogs: [...(prev.geofenceLogs || []), ...events].slice(-200) }));
          // Optional: browser notification
          if (Notification?.permission === 'granted') {
            const enters = events.filter(e => e.type === 'enter').length;
            const exits = events.length - enters;
            new Notification('Geofence update', { body: `${enters} enter, ${exits} exit` });
          }
        }
      }, () => {}, { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 });
    }, 30000);
    return () => clearInterval(interval);
  }, [guestData?.profile?.consentGPS, guestData.geofences, setGuestData]);

  return null;
}
