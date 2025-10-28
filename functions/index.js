const functions = require('firebase-functions');
const admin = require('firebase-admin');

try {
  admin.initializeApp();
} catch (e) {
  // ignore if already initialized in emulator
}

const db = admin.firestore();

// Helper: evaluate disclosure for LifeCV-like object
function evaluateDisclosure(profile) {
  const basic = profile?.basic || {};
  const privacy = profile?.privacy || {};
  const contacts = profile?.contacts || {};
  const checks = {
    name: !!(basic.fullName || (basic.firstName && basic.lastName)),
    contact: !!((contacts.emails && contacts.emails.length) || (contacts.phones && contacts.phones.length)),
    photo: !!basic.photoUrl,
    gps: !!(privacy.consentGPS || privacy.shareLocation),
    coverage: Array.isArray(profile.coverage?.areas) ? profile.coverage.areas.length > 0 : false,
    services: Array.isArray(profile.services) ? profile.services.length > 0 : false,
    role: !!profile.role
  };
  const present = Object.entries(checks).filter(([, ok]) => ok).map(([k]) => k);
  const missing = Object.keys(checks).filter(k => !present.includes(k));
  const completionPercent = Math.round((present.length / Object.keys(checks).length) * 100);
  return { completionPercent, present, missing };
}

function intersectVisible(selfProfile, partnerProfile) {
  // Return only fields the self has populated (reciprocity). Adjust as policy evolves.
  const result = {};
  if (!selfProfile || !partnerProfile) return result;

  const self = evaluateDisclosure(selfProfile);

  // Basic fields
  result.basic = {};
  if (self.present.includes('name')) {
    result.basic.fullName = partnerProfile?.basic?.fullName || null;
    result.basic.photoUrl = partnerProfile?.basic?.photoUrl || null;
  }
  // Contacts
  result.contacts = {};
  if (self.present.includes('contact')) {
    result.contacts.emails = partnerProfile?.contacts?.emails || [];
    result.contacts.phones = partnerProfile?.contacts?.phones || [];
  }
  // GPS/coverage/services/role as examples
  if (self.present.includes('gps')) {
    result.privacy = { consentGPS: !!partnerProfile?.privacy?.consentGPS };
  }
  if (self.present.includes('coverage')) {
    result.coverage = { areas: partnerProfile?.coverage?.areas || [] };
  }
  if (self.present.includes('services')) {
    result.services = partnerProfile?.services || [];
  }
  if (self.present.includes('role')) {
    result.role = partnerProfile?.role || null;
  }
  return result;
}

exports.computeReciprocity = functions.https.onCall(async (data, context) => {
  const { partnerUid } = data || {};
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }
  if (!partnerUid || typeof partnerUid !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'partnerUid is required');
  }

  const selfUid = context.auth.uid;
  const profilesRef = db.collection('profiles');
  const [selfSnap, partnerSnap] = await Promise.all([
    profilesRef.doc(selfUid).get(),
    profilesRef.doc(partnerUid).get()
  ]);

  if (!selfSnap.exists) {
    throw new functions.https.HttpsError('failed-precondition', 'Your profile is missing');
  }
  if (!partnerSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Partner profile not found');
  }

  const selfProfile = selfSnap.data();
  const partnerProfile = partnerSnap.data();

  const selfEval = evaluateDisclosure(selfProfile);
  const partnerEval = evaluateDisclosure(partnerProfile);
  const overlapPercent = Math.min(selfEval.completionPercent, partnerEval.completionPercent);
  const visiblePartner = intersectVisible(selfProfile, partnerProfile);

  return {
    overlapPercent,
    selfEval,
    partnerEval,
    partnerVisible: visiblePartner
  };
});
