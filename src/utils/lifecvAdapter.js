// LifeCV adapter utilities: map between local LifeSync profile and shared LifeCV schema
// Contracts:
// - toLifeCV(local, opts?): returns object matching docs/shared-profile-schema.json
// - fromLifeCV(lifecv): returns local profile shape suitable for Onboarding.jsx
// - parseResumeJson(json): normalize known resume JSON into lifecv-compatible partial

// Lightweight UUIDv4 generator to avoid extra dependency
function uuidv4() {
  // RFC4122 version 4 compliant
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Helper to safely get first item
const first = (arr) => (Array.isArray(arr) && arr.length ? arr[0] : undefined);

export function toLifeCV(local = {}) {
  const now = new Date().toISOString();
  const id = local.id || uuidv4();

  const fullName = local.fullName || [local.firstName, local.lastName].filter(Boolean).join(' ').trim();
  const email = local.email || first(local.emails)?.address || local?.providerRegistration?.email || '';
  const phone = local.phone || first(local.phones)?.number || local?.providerRegistration?.contactNumber || '';
  const photoUrl = local.photoUrl || '';
  const contactsObj = {
    emails: Array.isArray(local.emails)
      ? local.emails.filter(e => (e.address || '').trim()).map(e => ({ address: e.address, label: e.label || 'Primary' }))
      : (email ? [{ address: email, label: 'Primary' }] : []),
    phones: Array.isArray(local.phones)
      ? local.phones.filter(p => (p.number || '').trim()).map(p => ({ number: p.number, label: p.label || 'Primary' }))
      : (phone ? [{ number: phone, label: 'Primary' }] : [])
  };

  const profile = {
    id,
    kind: 'individual',
    createdAt: local.createdAt || now,
    updatedAt: now,
    appScope: 'lifesync',
    owner: local.owner || { source: 'lifesync', uid: local.owner?.uid },
    basic: {
      fullName: fullName || undefined,
      displayName: local.displayName || undefined,
      email: email || undefined,
      phone: phone || undefined,
      photoUrl: photoUrl || undefined,
      dob: local.dob || undefined
    },
    privacy: {
      shareLocation: !!local.consentGPS,
      shareAvailability: true,
      contactVisibility: 'trusted'
    },
  contacts: contactsObj,
    role: local.role || undefined,
    services: local.servicesRegistered || local.services || [],
    coverage: local.providerRegistration?.coverageAreas?.length
      ? { areas: local.providerRegistration.coverageAreas }
      : undefined,
    events: local.events || [],
    geofences: local.geofences || [],
    checkIns: local.checkIns || []
  };

  return JSON.parse(JSON.stringify(profile));
}

export function fromLifeCV(lifecv = {}) {
  const basic = lifecv.basic || {};
  const nameParts = (basic.fullName || '').trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    id: lifecv.id,
    createdAt: lifecv.createdAt,
    updatedAt: lifecv.updatedAt,
    owner: lifecv.owner,
    firstName,
    lastName,
    fullName: basic.fullName || '',
    emails: Array.isArray(lifecv.contacts?.emails) && lifecv.contacts.emails.length
      ? lifecv.contacts.emails.map((e, idx) => ({ id: idx + 1, address: e.address, label: e.label || 'Primary' }))
      : (basic.email ? [{ id: 1, address: basic.email, label: 'Primary' }] : []),
    phones: Array.isArray(lifecv.contacts?.phones) && lifecv.contacts.phones.length
      ? lifecv.contacts.phones.map((p, idx) => ({ id: idx + 1, number: p.number, label: p.label || 'Primary' }))
      : (basic.phone ? [{ id: 1, number: basic.phone, label: 'Primary' }] : []),
    consentGPS: !!lifecv.privacy?.shareLocation,
    gpsCoordinates: null,
    role: lifecv.role || 'Passenger',
    servicesRegistered: Array.isArray(lifecv.services) ? lifecv.services : [],
    providerRegistration: {
      providerType: 'Individual',
      businessName: '',
      fullName: basic.fullName || '',
      contactNumber: basic.phone || '',
      email: basic.email || '',
      servicesOffered: [],
      coverageAreas: lifecv.coverage?.areas || [],
      pricing: { base: '', perKm: '', express: '' },
      autoUpgrade: true
    }
  };
}

// Accepts various resume JSON formats and returns LifeCV-basic fields plus experience/education if present.
export function parseResumeJson(jsonInput) {
  let data = jsonInput;
  try {
    if (typeof jsonInput === 'string') data = JSON.parse(jsonInput);
  } catch (_) {
    throw new Error('Invalid JSON provided for resume parsing');
  }

  const basics = data.basics || data.basic || {};
  const email = basics.email || basics.mail || basics.contactEmail || undefined;
  const phone = basics.phone || basics.mobile || basics.contactNumber || undefined;
  const fullName = basics.name || [basics.firstName, basics.lastName].filter(Boolean).join(' ').trim() || undefined;

  // Normalize minimal lifecv structure
  const lifecvPartial = {
    basic: {
      fullName,
      email,
      phone,
      photoUrl: basics.image || basics.photo || undefined,
    },
  };

  // Map optional arrays if present (not in shared schema yet, but kept for future extension)
  if (Array.isArray(data.work)) lifecvPartial.work = data.work;
  if (Array.isArray(data.education)) lifecvPartial.education = data.education;
  if (Array.isArray(data.skills)) lifecvPartial.skills = data.skills;

  return lifecvPartial;
}
