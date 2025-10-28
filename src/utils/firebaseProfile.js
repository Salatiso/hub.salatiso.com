import { db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const COLLECTION = 'profiles';

export async function upsertLifeCVProfile(uid, lifecvObject) {
  if (!uid || !lifecvObject) return;
  const ref = doc(db, COLLECTION, uid);
  await setDoc(ref, lifecvObject, { merge: true });
}

export async function getLifeCVProfile(uid) {
  if (!uid) return null;
  const ref = doc(db, COLLECTION, uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}
