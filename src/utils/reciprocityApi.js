import { httpsCallable } from 'firebase/functions';
import { getFunctionsClient } from '../firebase';

// Calls the Cloud Function to compute reciprocity with a partner.
// Expected params: { partnerUid: string }
export async function fetchPartnerVisibility(partnerUid) {
  if (!partnerUid) throw new Error('partnerUid is required');
  const callable = httpsCallable(getFunctionsClient(), 'computeReciprocity');
  const res = await callable({ partnerUid });
  return res.data;
}

export default { fetchPartnerVisibility };
