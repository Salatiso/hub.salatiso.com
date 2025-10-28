// Lightweight parsers for CSV, VCF (vCard), and pasted JSON
// Output normalized to an internal contact schema.

// Contact schema
// {
//   id: string (uuid),
//   name: { formatted: string, given?: string, family?: string, middle?: string },
//   phones: [{ type?: string, value: string }],
//   emails: [{ type?: string, value: string }],
//   addresses: [{ type?: string, street?: string, city?: string, region?: string, postalCode?: string, country?: string }],
//   notes?: string,
//   tags?: string[]
// }

function generateId() {
  return (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
}

export function normalizeContact(partial) {
  const id = partial.id || generateId();
  const name = partial.name || {};
  const formatted = name.formatted || partial.formattedName || [name.given, name.middle, name.family].filter(Boolean).join(' ') || partial.fullName || '';
  return {
    id,
    name: {
      formatted,
      given: name.given || '',
      family: name.family || '',
      middle: name.middle || ''
    },
    phones: Array.isArray(partial.phones) ? partial.phones.filter(Boolean).map(p => ({ type: p.type || '', value: String(p.value || p).trim() })).filter(p => p.value) : [],
    emails: Array.isArray(partial.emails) ? partial.emails.filter(Boolean).map(e => ({ type: e.type || '', value: String(e.value || e).trim() })).filter(e => e.value) : [],
    addresses: Array.isArray(partial.addresses) ? partial.addresses.filter(Boolean).map(a => ({
      type: a.type || '',
      street: a.street || a.streetAddress || '',
      city: a.city || a.locality || '',
      region: a.region || a.state || '',
      postalCode: a.postalCode || a.zip || '',
      country: a.country || ''
    })) : [],
    notes: partial.notes || '',
    tags: Array.isArray(partial.tags) ? partial.tags.filter(Boolean) : []
  };
}

export function parseCSV(text) {
  // Basic CSV parser supporting quoted fields and commas
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = splitCsvLine(lines[0]);
  const rows = lines.slice(1).map(l => splitCsvLine(l));
  const contacts = rows.map(cols => {
    const obj = {};
    header.forEach((h, i) => obj[h.trim().toLowerCase()] = cols[i]?.trim?.() ?? '');
    // Try common column names
    const given = obj['first name'] || obj['firstname'] || obj['given'] || obj['givenname'] || '';
    const family = obj['last name'] || obj['lastname'] || obj['family'] || obj['surname'] || '';
    const middle = obj['middle name'] || obj['middlename'] || '';
    const full = obj['name'] || `${given} ${family}`.trim();
    const phone = obj['phone'] || obj['phone number'] || obj['mobile'] || obj['tel'] || '';
    const email = obj['email'] || obj['e-mail'] || '';
    const street = obj['street'] || obj['street address'] || '';
    const city = obj['city'] || '';
    const region = obj['state'] || obj['province'] || obj['region'] || '';
    const postalCode = obj['zip'] || obj['postal code'] || obj['postcode'] || '';
    const country = obj['country'] || '';
    return normalizeContact({
      name: { formatted: full, given, family, middle },
      phones: phone ? [{ value: phone, type: 'mobile' }] : [],
      emails: email ? [{ value: email, type: 'home' }] : [],
      addresses: (street || city || region || postalCode || country) ? [{ street, city, region, postalCode, country, type: 'home' }] : []
    });
  });
  return contacts;
}

function splitCsvLine(line) {
  const res = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      res.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  res.push(cur);
  return res;
}

export function parseVCF(text) {
  // Minimal vCard 3.0/4.0 parser for FN, N, TEL, EMAIL, ADR
  const cards = text.split(/END:VCARD/i).map(s => s.trim()).filter(Boolean);
  const contacts = [];
  for (const card of cards) {
    const lines = card.split(/\r?\n/);
    const obj = { phones: [], emails: [], addresses: [] };
    for (let raw of lines) {
      raw = raw.trim();
      if (!raw || /^BEGIN:VCARD/i.test(raw)) continue;
      const [left, valueRaw] = raw.split(':');
      if (!left) continue;
      const value = (valueRaw || '').trim();
      const [prop, ...params] = left.split(';');
      const key = prop.toUpperCase();
      const typeParam = params.find(p => p.toUpperCase().startsWith('TYPE='));
      const type = typeParam ? typeParam.split('=')[1] : '';
      switch (key) {
        case 'FN':
          obj.name = obj.name || {}; obj.name.formatted = value; break;
        case 'N': {
          // family;given;additional;prefix;suffix
          const [family, given, middle] = value.split(';');
          obj.name = obj.name || {}; Object.assign(obj.name, { family, given, middle });
          break;
        }
        case 'TEL':
          if (value) obj.phones.push({ type, value });
          break;
        case 'EMAIL':
          if (value) obj.emails.push({ type, value });
          break;
        case 'ADR': {
          // PO Box;extended;street;city;region;postalCode;country
          const parts = value.split(';');
          const addr = { street: parts[2] || '', city: parts[3] || '', region: parts[4] || '', postalCode: parts[5] || '', country: parts[6] || '', type };
          obj.addresses.push(addr);
          break;
        }
        default:
          break;
      }
    }
    contacts.push(normalizeContact(obj));
  }
  return contacts;
}

export function parsePastedJSON(text) {
  try {
    const data = JSON.parse(text);
    if (Array.isArray(data)) return data.map(normalizeContact);
    if (data && typeof data === 'object' && data.contacts && Array.isArray(data.contacts)) return data.contacts.map(normalizeContact);
    return [normalizeContact(data)];
  } catch (e) {
    return [];
  }
}

export function suggestRelationships(contacts, selfProfile = {}) {
  // Heuristics: keywords in names, same last name => family-unknown
  const lastName = (selfProfile.lastName || selfProfile.surname || selfProfile.name?.family || '').toLowerCase();
  return contacts.map(c => {
    const name = (c.name?.formatted || '').toLowerCase();
    const family = (c.name?.family || '').toLowerCase();
    let suggestion = '';
    if (/\b(mom|mother|mama|umama)\b/.test(name)) suggestion = 'mother';
    else if (/\b(dad|father|tata|ubaba)\b/.test(name)) suggestion = 'father';
    else if (/\b(wife|spouse|umfazi)\b/.test(name)) suggestion = 'spouse';
    else if (/\b(husband|indoda)\b/.test(name)) suggestion = 'spouse';
    else if (/\b(son|boy|unyana)\b/.test(name)) suggestion = 'son';
    else if (/\b(daughter|girl|intombi)\b/.test(name)) suggestion = 'daughter';
    else if (/\b(sister|usisi)\b/.test(name)) suggestion = 'sister';
    else if (/\b(brother|ubhuti)\b/.test(name)) suggestion = 'brother';
    else if (family && lastName && family === lastName) suggestion = 'family';
    else suggestion = 'friend';
    return { contactId: c.id, suggestion };
  });
}

export function toFamilyTreeNodes(contacts, relationships) {
  // Build nodes and edges. For simplicity, relationships entries: { fromId, toId, type } where type in ['parent', 'child', 'spouse', 'sibling', 'friend', 'colleague', 'neighbor']
  const nodes = contacts.map(c => ({ id: c.id, label: c.name?.formatted || 'Unnamed', deceased: !!c.deceased, data: c }));
  const edges = relationships.map(r => ({ id: `${r.fromId}-${r.type}-${r.toId}`, from: r.fromId, to: r.toId, type: r.type }));
  return { nodes, edges };
}

export function exampleAIPrompt() {
  return `Convert my contacts to the following JSON array schema. Only output valid JSON without comments.

Schema per contact:
{
  name: { formatted: string, given?: string, family?: string, middle?: string },
  phones?: [{ type?: string, value: string }],
  emails?: [{ type?: string, value: string }],
  addresses?: [{ type?: string, street?: string, city?: string, region?: string, postalCode?: string, country?: string }],
  notes?: string,
  tags?: string[]
}

Example minimal contact:
[
  {
    "name": { "formatted": "Jane Doe", "given": "Jane", "family": "Doe" },
    "phones": [{ "type": "mobile", "value": "+27 82 123 4567" }],
    "emails": [{ "type": "home", "value": "jane@example.com" }]
  }
]`;
}
