// Utility helpers for LifeSync Seal events

const generateId = () => Math.random().toString(36).slice(2, 10);

export const createSealEvent = (guestData, setGuestData, init = {}) => {
  const id = generateId();
  const event = {
    id,
    createdAt: Date.now(),
    owner: guestData?.profile?.fullName || 'Me',
    title: init.title || 'Follow Me Home',
    mode: init.mode || 'group', // 'group' | 'solo'
    status: 'planned', // 'planned' | 'active' | 'ended'
    startAt: init.startAt || Date.now(),
    endAt: null,
    invitees: init.invitees || [], // [{name, contact, status: 'pending'|'accepted'|'declined'}]
    shareLevel: init.shareLevel || 'availability', // 'availability' | 'location'
    lastUpdate: Date.now()
  };
  const url = `${window.location.origin}/seal/${id}`;
  event.shareUrl = url;
  setGuestData(prev => ({ ...prev, sealEvents: [event, ...(prev.sealEvents || [])] }));
  return event;
};
