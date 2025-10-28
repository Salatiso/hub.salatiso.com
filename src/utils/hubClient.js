import { getHubBaseUrl, getHubToken } from '../config/hub';

async function hubFetch(path, { method = 'GET', headers = {}, body, etag } = {}) {
  const base = getHubBaseUrl();
  const token = getHubToken();
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(etag ? { 'If-Match': etag } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const etagResp = res.headers.get('ETag');
  const json = res.status !== 204 ? await res.json().catch(() => ({})) : undefined;
  if (!res.ok) {
    const err = new Error(json?.message || `Hub API ${res.status}`);
    err.status = res.status;
    err.body = json;
    err.etag = etagResp;
    throw err;
  }
  return { data: json, etag: etagResp };
}

export const HubClient = {
  // Profiles
  async getProfile(id) { return hubFetch(`/profiles/${encodeURIComponent(id)}`); },
  async createProfile(payload) { return hubFetch(`/profiles`, { method: 'POST', body: payload }); },
  async patchProfile(id, payload, etag) { return hubFetch(`/profiles/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload, etag }); },

  // Contacts
  async createContact(ownerId, payload) { return hubFetch(`/profiles/${encodeURIComponent(ownerId)}/contacts`, { method: 'POST', body: payload }); },
  async patchContact(ownerId, contactId, payload, etag) { return hubFetch(`/profiles/${encodeURIComponent(ownerId)}/contacts/${encodeURIComponent(contactId)}`, { method: 'PATCH', body: payload, etag }); },

  // Invitations
  async createInvitation(payload) { return hubFetch(`/invitations`, { method: 'POST', body: payload }); },

  // Safety Exchange
  async generateSafetyQr(payload) { return hubFetch(`/safety-exchange/generate-qr`, { method: 'POST', body: payload }); },
  async shareViaMesh(payload) { return hubFetch(`/safety-exchange/mesh-share`, { method: 'POST', body: payload }); },
  async getConsentLedger(userId) { return hubFetch(`/safety-exchange/consent-ledger/${encodeURIComponent(userId)}`); }
};

// Merge-without-overwrite: fill missing local fields from remote, never delete local fields
export function mergeWithoutOverwrite(local, remote) {
  if (!remote || typeof remote !== 'object') return local;
  const out = Array.isArray(local) ? [...local] : { ...local };
  for (const [k, v] of Object.entries(remote)) {
    if (v === null || v === undefined) continue;
    if (out[k] === undefined || out[k] === null || out[k] === '' || (Array.isArray(out[k]) && out[k].length === 0)) {
      out[k] = deepClone(v);
    } else if (isObject(out[k]) && isObject(v)) {
      out[k] = mergeWithoutOverwrite(out[k], v);
    } else if (Array.isArray(out[k]) && Array.isArray(v)) {
      // union arrays by value (naive)
      const set = new Map();
      [...out[k], ...v].forEach(item => set.set(JSON.stringify(item), item));
      out[k] = [...set.values()];
    }
  }
  return out;
}

function isObject(x) { return x && typeof x === 'object' && !Array.isArray(x); }
function deepClone(x) { return x == null ? x : JSON.parse(JSON.stringify(x)); }
