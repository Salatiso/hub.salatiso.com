import { collection, addDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

const SIGNALING_COLLECTION = 'signaling';

export const createSignalingChannel = async () => {
  const channelRef = await addDoc(collection(db, SIGNALING_COLLECTION), { createdAt: new Date() });
  return channelRef.id;
};

export const sendSignal = async (channelId, signal) => {
  const channelRef = collection(db, SIGNALING_COLLECTION, channelId, 'messages');
  await addDoc(channelRef, { ...signal, createdAt: new Date() });
};

export const listenForSignals = (channelId, callback) => {
  const channelRef = collection(db, SIGNALING_COLLECTION, channelId, 'messages');
  const q = query(channelRef, orderBy('createdAt', 'asc'), limit(100));

  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        callback(change.doc.data());
      }
    });
  });
};
