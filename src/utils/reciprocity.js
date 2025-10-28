// Lightweight reciprocity utilities to evaluate profile disclosure completeness
// and compute overlap-based visibility. This is client-side guidance; server-side
// enforcement will live in Cloud Functions.

// Evaluate disclosure completeness for a user profile
// input: { profile, servicesRegistered, role }
// returns: {
//   completionPercent: number (0-100),
//   present: string[],
//   missing: string[]
// }
export function evaluateDisclosure({ profile = {}, servicesRegistered = [], role }) {
  const checks = {
    name: !!(
      (profile.firstName && profile.firstName.trim()) ||
      (profile.providerRegistration?.fullName && profile.providerRegistration.fullName.trim()) ||
      profile.fullName
    ),
    contact: !!(
      (Array.isArray(profile.emails) && profile.emails.some(e => (e.address || '').trim())) ||
      (Array.isArray(profile.phones) && profile.phones.some(p => (p.number || '').trim())) ||
      (profile.providerRegistration?.email && profile.providerRegistration.email.trim()) ||
      (profile.providerRegistration?.contactNumber && profile.providerRegistration.contactNumber.trim()) ||
      profile.email || profile.phone
    ),
    photo: Array.isArray(profile.images) ? profile.images.length > 0 : !!profile.photoUrl,
    gps: !!(profile.consentGPS && profile.gpsCoordinates),
    coverage: Array.isArray(profile.providerRegistration?.coverageAreas)
      ? profile.providerRegistration.coverageAreas.length > 0
      : false,
    services: Array.isArray(servicesRegistered) ? servicesRegistered.length > 0 : false,
    role: !!(role && `${role}`.trim())
  };

  const present = Object.entries(checks)
    .filter(([, ok]) => ok)
    .map(([k]) => k);
  const missing = Object.keys(checks).filter(k => !present.includes(k));
  const completionPercent = Math.round((present.length / Object.keys(checks).length) * 100);

  return { completionPercent, present, missing };
}

// Compute mutual overlap visibility given two evaluations.
// If partnerEval is missing, returns { overlapPercent: null } and relies on selfEval.
export function computeOverlap(selfEval, partnerEval) {
  if (!partnerEval) return { overlapPercent: null };
  const overlapPercent = Math.min(selfEval.completionPercent, partnerEval.completionPercent);
  return { overlapPercent };
}

// Generate simple incentives list based on missing fields
export function buildIncentives(missing) {
  const map = {
    name: 'Add your name to personalize your profile',
    contact: 'Add an email or phone so partners can reach you',
    photo: 'Add a profile photo to build trust',
    gps: 'Enable GPS to unlock location-based safety features',
    coverage: 'Add a coverage area (Province > City/Town) to serve your community',
    services: 'Select the services you want to use or provide',
    role: 'Choose your role (Driver, Passenger, Service Provider)'
  };
  return missing.map(k => map[k]).filter(Boolean);
}
