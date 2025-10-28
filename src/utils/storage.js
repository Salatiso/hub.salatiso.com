// Minimal IndexedDB utility wrappers (no external deps)
// DB: 'lifesync', stores: 'kv', 'outbox'
// kv keys used by new features: 'contacts', 'relationships', 'familyTreeMeta'

const DB_NAME = 'lifesync';
const DB_VERSION = 1;
const STORES = {
  kv: 'kv',
  outbox: 'outbox'
};

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORES.kv)) db.createObjectStore(STORES.kv);
      if (!db.objectStoreNames.contains(STORES.outbox)) db.createObjectStore(STORES.outbox, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function idbGet(key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.kv, 'readonly');
    const store = tx.objectStore(STORES.kv);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function idbSet(key, value) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.kv, 'readwrite');
    const store = tx.objectStore(STORES.kv);
    const req = store.put(value, key);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

export async function outboxEnqueue(record) {
  const db = await openDb();
  const withId = { id: crypto.randomUUID(), enqueuedAt: Date.now(), ...record };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.outbox, 'readwrite');
    const store = tx.objectStore(STORES.outbox);
    const req = store.add(withId);
    req.onsuccess = () => resolve(withId);
    req.onerror = () => reject(req.error);
  });
}

export async function outboxList() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.outbox, 'readonly');
    const store = tx.objectStore(STORES.outbox);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function outboxDelete(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.outbox, 'readwrite');
    const store = tx.objectStore(STORES.outbox);
    const req = store.delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}
