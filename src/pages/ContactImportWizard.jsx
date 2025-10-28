import { useMemo, useState, useContext, useCallback } from 'react';
import GuestContext from '../contexts/GuestContext';
import { parseCSV, parseVCF, parsePastedJSON, suggestRelationships, toFamilyTreeNodes, exampleAIPrompt, normalizeContact } from '../utils/contactParsers';
import { idbGet, idbSet, outboxEnqueue } from '../utils/storage';
import { Link, useNavigate } from 'react-router-dom';

const StepHeader = ({ step, total, title }) => (
  <div className="mb-6">
    <div className="text-sm text-gray-500">Step {step} of {total}</div>
    <h2 className="text-2xl font-semibold">{title}</h2>
  </div>
);

export default function ContactImportWizard() {
  const navigate = useNavigate();
  const totalSteps = 6;
  const { guestData, setGuestData } = useContext(GuestContext);
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState('file'); // file | paste | phone
  const [file, setFile] = useState(null);
  const [paste, setPaste] = useState('');
  const [parsedContacts, setParsedContacts] = useState([]);
  const [mapError, setMapError] = useState('');
  const [relationshipSuggestions, setRelationshipSuggestions] = useState([]);
  const [relationships, setRelationships] = useState([]); // {contactId, type, targetId?}
  const [selectedForInvite, setSelectedForInvite] = useState({});
  const [shareMatrix, setShareMatrix] = useState({});

  const handleNext = useCallback(() => setStep(s => Math.min(totalSteps, s + 1)), [totalSteps]);
  const handleBack = useCallback(() => setStep(s => Math.max(1, s - 1)), []);
  const pickFromPhone = useCallback(() => pickFromPhoneInternal(setParsedContacts, setRelationshipSuggestions, setRelationships, guestData, setStep, setMapError), [guestData]);

  async function parseInput() {
    setMapError('');
    try {
      let contacts = [];
      if (method === 'file' && file) {
        const text = await file.text();
        if (file.name.toLowerCase().endsWith('.csv')) contacts = parseCSV(text);
        else if (file.name.toLowerCase().endsWith('.vcf') || file.name.toLowerCase().endsWith('.vcard')) contacts = parseVCF(text);
        else if (file.name.toLowerCase().endsWith('.json')) contacts = parsePastedJSON(text);
        else throw new Error('Unsupported file. Use .csv, .vcf, or .json');
      } else if (method === 'paste') {
        contacts = parsePastedJSON(paste);
        if (!contacts.length) throw new Error('Could not parse pasted content. Ensure valid JSON per schema.');
      }
      setParsedContacts(contacts);
      setRelationshipSuggestions(suggestRelationships(contacts, guestData.profile || {}));
      setRelationships(contacts.map(c => ({ contactId: c.id, type: relationshipSuggestions.find(r => r.contactId === c.id)?.suggestion || 'friend' })));
      setStep(3);
    } catch (e) {
      setMapError(e.message);
    }
  }

  function updateRelationship(contactId, type) {
    setRelationships(prev => prev.map(r => r.contactId === contactId ? { ...r, type } : r));
  }

  const tree = useMemo(() => toFamilyTreeNodes(parsedContacts, relationships.filter(r => ['parent','child','spouse','sibling'].includes(r.type)).map(r => ({ fromId: 'self', toId: r.contactId, type: r.type }))), [parsedContacts, relationships]);

  function toggleInvite(id) {
    setSelectedForInvite(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleShare(id, field) {
    setShareMatrix(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: !(prev[id]?.[field]) } }));
  }

  async function saveAll() {
    // Merge into guestData.contacts; add relationships and initial family tree associations
    const existing = (await idbGet('contacts')) || [];
    const merged = mergeContacts(existing, parsedContacts);
    await idbSet('contacts', merged);
    await idbSet('relationships', relationships);
    setGuestData(prev => ({ ...prev, contacts: merged, relationships }));

    // Enqueue invites for sync when enabled
    const invites = Object.entries(selectedForInvite).filter(([, v]) => v).map(([id]) => ({
      type: 'invite', payload: { contactId: id, share: shareMatrix[id] || {} }
    }));
    for (const inv of invites) await outboxEnqueue(inv);

    navigate('/family-tree');
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {step === 1 && (
        <div>
          <StepHeader step={1} total={totalSteps} title="Choose import method" />
          <div className="space-y-4">
            <label className="flex items-center gap-2"><input type="radio" name="method" checked={method==='file'} onChange={() => setMethod('file')} /> File upload (.csv, .vcf, .json)</label>
            <label className="flex items-center gap-2"><input type="radio" name="method" checked={method==='paste'} onChange={() => setMethod('paste')} /> Paste JSON (converted via AI)</label>
            <label className="flex items-center gap-2"><input type="radio" name="method" checked={method==='phone'} onChange={() => setMethod('phone')} /> Pick from phone (where supported)</label>
          </div>
          <div className="mt-6 flex justify-between">
            <Link className="text-gray-600" to="/dashboard">Cancel</Link>
            <button className="btn btn-primary bg-primary-600 text-white px-4 py-2 rounded" onClick={() => setStep(2)}>Next</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <StepHeader step={2} total={totalSteps} title="Provide contacts" />
          {method === 'file' ? (
            <div className="space-y-4">
              <input type="file" accept=".csv,.vcf,.vcard,.json" onChange={e => setFile(e.target.files?.[0] || null)} />
              <p className="text-sm text-gray-600">From phone/computer exports: iOS Contacts → Export vCard (.vcf) or CSV; Android/Google Contacts → Export CSV or vCard.</p>
            </div>
          ) : method === 'paste' ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-700">If your contacts are not already JSON, copy your CSV/VCF into an AI like ChatGPT or Gemini with this prompt, then paste the JSON below.</p>
              <textarea readOnly className="w-full p-3 border rounded text-xs bg-gray-50" rows={8} value={exampleAIPrompt()} />
              <textarea className="w-full p-3 border rounded" rows={10} placeholder="Paste converted JSON here" value={paste} onChange={e => setPaste(e.target.value)} />
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-700">Use your device's contacts picker to select contacts. This requires a secure context (https) and a supported browser.</p>
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={pickFromPhone}>Pick contacts from phone</button>
              <p className="text-xs text-gray-500">If the button doesn't work, use the File upload or Paste JSON methods.</p>
            </div>
          )}
          {mapError && <div className="mt-3 text-red-600">{mapError}</div>}
          <div className="mt-6 flex justify-between">
            <button className="px-3 py-2 rounded border" onClick={handleBack}>Back</button>
            <button className="px-4 py-2 bg-primary-600 text-white rounded" onClick={parseInput} disabled={method==='phone'}>Parse</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <StepHeader step={3} total={totalSteps} title="Review and tag relationships" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-auto">
            {parsedContacts.map(c => (
              <div key={c.id} className="border rounded p-3">
                <div className="font-medium">{c.name?.formatted || 'Unnamed'}</div>
                <div className="text-sm text-gray-600">{c.emails?.[0]?.value || c.phones?.[0]?.value || ''}</div>
                <div className="mt-2">
                  <label className="text-sm text-gray-700">Relationship</label>
                  <select className="mt-1 border rounded p-1 w-full" value={relationships.find(r=>r.contactId===c.id)?.type || 'friend'} onChange={e=>updateRelationship(c.id, e.target.value)}>
                    <option value="spouse">Spouse</option>
                    <option value="mother">Mother</option>
                    <option value="father">Father</option>
                    <option value="son">Son</option>
                    <option value="daughter">Daughter</option>
                    <option value="sibling">Sibling</option>
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                    <option value="family">Family (unspecified)</option>
                    <option value="friend">Friend</option>
                    <option value="colleague">Colleague</option>
                    <option value="neighbor">Neighbor</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <button className="px-3 py-2 rounded border" onClick={handleBack}>Back</button>
            <button className="px-4 py-2 bg-primary-600 text-white rounded" onClick={handleNext}>Next</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <StepHeader step={4} total={totalSteps} title="Preview family tree" />
          <FamilyTreePreview tree={tree} />
          <div className="mt-6 flex justify-between">
            <button className="px-3 py-2 rounded border" onClick={handleBack}>Back</button>
            <button className="px-4 py-2 bg-primary-600 text-white rounded" onClick={handleNext}>Next</button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div>
          <StepHeader step={5} total={totalSteps} title="Select who to invite and what to share" />
          <div className="space-y-3 max-h-[60vh] overflow-auto">
            {parsedContacts.map(c => (
              <div key={c.id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{c.name?.formatted || 'Unnamed'}</div>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!selectedForInvite[c.id]} onChange={()=>toggleInvite(c.id)} /> Invite</label>
                </div>
                {selectedForInvite[c.id] && (
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {['name','address','phones','emails','work','education','clan'].map(field => (
                      <label key={field} className="flex items-center gap-2"><input type="checkbox" checked={!!(shareMatrix[c.id]?.[field])} onChange={()=>toggleShare(c.id, field)} /> Share {field}</label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <button className="px-3 py-2 rounded border" onClick={handleBack}>Back</button>
            <button className="px-4 py-2 bg-primary-600 text-white rounded" onClick={handleNext}>Next</button>
          </div>
        </div>
      )}

      {step === 6 && (
        <div>
          <StepHeader step={6} total={totalSteps} title="Review and save" />
          <ul className="list-disc pl-6 text-gray-700">
            <li>{parsedContacts.length} contacts parsed</li>
            <li>{relationships.length} relationship tags</li>
            <li>{Object.values(selectedForInvite).filter(Boolean).length} invites queued</li>
          </ul>
          <div className="mt-6 flex justify-between">
            <button className="px-3 py-2 rounded border" onClick={handleBack}>Back</button>
            <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={saveAll}>Save and view family tree</button>
          </div>
        </div>
      )}
    </div>
  );
}

function mergeContacts(existing, incoming) {
  const byKey = new Map(existing.map(c => [contactKey(c), c]));
  for (const c of incoming) {
    const key = contactKey(c);
    if (!byKey.has(key)) byKey.set(key, c);
    else {
      // Merge simple arrays by value
      const curr = byKey.get(key);
      curr.phones = mergeUnique(curr.phones, c.phones, (x)=>x.value);
      curr.emails = mergeUnique(curr.emails, c.emails, (x)=>x.value);
      curr.addresses = mergeUnique(curr.addresses, c.addresses, (x)=>`${x.street}|${x.city}|${x.region}|${x.postalCode}|${x.country}`);
    }
  }
  return Array.from(byKey.values());
}

function contactKey(c) {
  const email = c.emails?.[0]?.value?.toLowerCase?.() || '';
  const phone = c.phones?.[0]?.value?.replace(/\D/g,'') || '';
  const name = (c.name?.formatted || '').toLowerCase();
  return `${email}|${phone}|${name}`;
}

function mergeUnique(a = [], b = [], keyFn) {
  const map = new Map(a.map(x => [keyFn(x), x]));
  for (const x of b) map.set(keyFn(x), x);
  return Array.from(map.values());
}

function FamilyTreePreview({ tree }) {
  if (!tree || !tree.nodes) return null;
  return (
    <div className="border rounded p-4">
      <div className="text-sm text-gray-600 mb-2">Simple tree preview (Self at center)</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-auto">
        {tree.nodes.map(n => (
          <div key={n.id} className="p-3 border rounded">
            <div className="font-medium">{n.label}</div>
            <div className="text-xs text-gray-500">{n.deceased ? 'Deceased' : 'Alive'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function pickFromPhoneInternal(setParsedContacts, setRelationshipSuggestions, setRelationships, guestData, setStep, setMapError) {
  try {
    if (!('contacts' in navigator) || !('select' in navigator.contacts)) {
      throw new Error('Contacts Picker API not supported on this device/browser.');
    }
    const props = ['name', 'email', 'tel', 'address'];
    const opts = { multiple: true };
    const results = await navigator.contacts.select(props, opts);
    const contactsRaw = (results || []).map(r => ({
      name: { formatted: Array.isArray(r.name) ? r.name[0] : (r.name || '') },
      emails: Array.isArray(r.email) ? r.email.map(v => ({ value: v })) : (r.email ? [{ value: r.email }] : []),
      phones: Array.isArray(r.tel) ? r.tel.map(v => ({ value: v })) : (r.tel ? [{ value: r.tel }] : []),
      addresses: []
    }));
    const contacts = contactsRaw.map(normalizeContact);
    // reuse normalize logic by going through JSON path
    // But we don't import normalize here; the wizard will handle suggestions.
    setParsedContacts(contacts);
    const suggestions = suggestRelationships(contacts, guestData.profile || {});
    setRelationshipSuggestions(suggestions);
    setRelationships(contacts.map(c => ({ contactId: c.id || (c.name?.formatted || Math.random().toString(36).slice(2)), type: 'friend' })));
    setStep(3);
  } catch (e) {
    setMapError(e.message);
  }
}

