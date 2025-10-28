// AES-GCM encryption/decryption helpers using Web Crypto

async function getKeyFromPassphrase(passphrase, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptJSON(obj, passphrase) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await getKeyFromPassphrase(passphrase, salt);
  const data = new TextEncoder().encode(JSON.stringify(obj));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  return {
    v: 1,
    alg: 'AES-GCM',
    iv: Array.from(iv),
    salt: Array.from(salt),
    cipher: Array.from(new Uint8Array(cipher))
  };
}

export async function decryptJSON(bundle, passphrase) {
  const iv = new Uint8Array(bundle.iv);
  const salt = new Uint8Array(bundle.salt);
  const key = await getKeyFromPassphrase(passphrase, salt);
  const cipher = new Uint8Array(bundle.cipher);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
  const text = new TextDecoder().decode(plain);
  return JSON.parse(text);
}
