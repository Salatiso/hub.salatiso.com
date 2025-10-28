import { useCallback, useEffect, useMemo, useState } from 'react';
import { idbGet, idbSet } from '../utils/storage';
import { toFamilyTreeNodes } from '../utils/contactParsers';
import ReactFlow, { Background, Controls, MiniMap, useEdgesState, useNodesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import ContactEditModal from '../components/family/ContactEditModal';

const CustomNode = ({ data }) => (
  <div style={{ borderRadius: 8, padding: 8, border: '1px solid #CBD5E1', background: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
    {data.image && <img src={data.image} alt={data.label} className="w-10 h-10 rounded-full object-cover" />}
    <div>
      <div>{data.label}</div>
      {data.deceased && <div className="text-xs text-gray-500">Deceased</div>}
    </div>
  </div>
);

const nodeTypes = { custom: CustomNode };

export default function FamilyTree() {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [meta, setMeta] = useState({ paternalClan: [], maternalClan: [], additionalLineages: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    (async () => {
      const [c, r, m] = await Promise.all([idbGet('contacts'), idbGet('relationships'), idbGet('familyTreeMeta')]);
      setContacts(c || []);
      setRelationships(r || []);
      setMeta(m || { paternalClan: [], maternalClan: [], additionalLineages: [] });
    })();
  }, []);

  const tree = toFamilyTreeNodes(contacts, relationships.filter(r => ['parent','child','spouse','sibling'].includes(r.type)).map(r => ({ fromId: 'self', toId: r.contactId, type: r.type })));

  // Build nodes/edges for React Flow
  const initialNodes = useMemo(() => {
    const centerX = 0; const centerY = 0;
    const nodes = tree.nodes.map((n, idx) => ({
      id: n.id,
      type: 'custom',
      position: { x: centerX + (idx % 4) * 250, y: centerY + Math.floor(idx / 4) * 150 },
      data: { 
        label: n.label, 
        deceased: n.deceased,
        image: contacts.find(c => c.id === n.id)?.images?.[0]?.preview || contacts.find(c => c.id === n.id)?.images?.[0]
      },
    }));
    nodes.unshift({ id: 'self', position: { x: centerX - 120, y: centerY - 60 }, data: { label: 'You' }, style: { borderRadius: 8, padding: 8, border: '2px solid #10B981', background: '#ECFDF5' }});
    return nodes;
  }, [tree, contacts]);
  const initialEdges = useMemo(() => tree.edges.map(e => ({ id: e.id, source: e.from, target: e.to, label: e.type })), [tree]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => { setNodes(initialNodes); setEdges(initialEdges); }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onNodeDoubleClick = useCallback((_, node) => {
    const contactToEdit = contacts.find(x => x.id === node.id);
    if (contactToEdit) {
        // Ensure the contact object has all the fields the modal expects
        const fullContact = {
            ...{
                firstName: '', lastName: '', images: [], optionalNameFields: [],
                phones: [], emails: [], dates: [], notes: ''
            },
            ...contactToEdit
        };
        setSelectedContact(fullContact);
        setIsModalOpen(true);
    }
  }, [contacts]);

  const handleSaveContact = useCallback((updatedContact) => {
    const nextContacts = contacts.map(c => c.id === updatedContact.id ? updatedContact : c);
    setContacts(nextContacts);
    idbSet('contacts', nextContacts);
    setIsModalOpen(false);
    setSelectedContact(null);
  }, [contacts]);

  function setDeceased(id, val) {
    const next = contacts.map(c => c.id === id ? { ...c, deceased: val } : c);
    setContacts(next);
    idbSet('contacts', next);
  }

  const [activeTab, setActiveTab] = useState('tree'); // 'tree' | 'timeline' | 'list'

  const timelineEvents = useMemo(() => {
    const items = [];
    for (const c of contacts) {
      if (c.birthDate) items.push({ date: c.birthDate, type: 'birth', label: `${c.name?.formatted || 'Unnamed'} born` });
      if (Array.isArray(c.events)) for (const ev of c.events) {
        if (ev.date) items.push({ date: ev.date, type: ev.type || 'event', label: `${c.name?.formatted || 'Unnamed'}: ${ev.title || ev.type}` });
      }
      if (c.deathDate) items.push({ date: c.deathDate, type: 'death', label: `${c.name?.formatted || 'Unnamed'} passed` });
    }
    return items
      .filter(e => e.date)
      .map(e => ({ ...e, ts: safeParseDate(e.date) }))
      .filter(e => e.ts)
      .sort((a, b) => a.ts - b.ts);
  }, [contacts]);

  function saveMeta(next) {
    setMeta(next);
    idbSet('familyTreeMeta', next);
  }

  const paternalClanStr = (meta.paternalClan || []).join(', ');
  const maternalClanStr = (meta.maternalClan || []).join(', ');
  const additionalStr = (meta.additionalLineages || []).join(', ');

  return (
    <div className="max-w-[1200px] mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t('familyTree.title')}</h1>
          <p className="text-gray-600">{t('familyTree.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button className={`px-3 py-1 rounded ${activeTab==='tree'?'bg-primary-600 text-white':'bg-gray-200'}`} onClick={()=>setActiveTab('tree')}>{t('familyTree.tabs.tree')}</button>
          <button className={`px-3 py-1 rounded ${activeTab==='timeline'?'bg-primary-600 text-white':'bg-gray-200'}`} onClick={()=>setActiveTab('timeline')}>{t('familyTree.tabs.timeline')}</button>
          <button className={`px-3 py-1 rounded ${activeTab==='list'?'bg-primary-600 text-white':'bg-gray-200'}`} onClick={()=>setActiveTab('list')}>{t('familyTree.tabs.list')}</button>
        </div>
      </div>
      <div className="mb-6 p-4 border rounded bg-white dark:bg-gray-800">
        <h2 className="font-semibold mb-2">{t('familyTree.clan.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">{t('familyTree.clan.paternal')}</label>
            <input className="w-full border rounded p-2" value={paternalClanStr} onChange={e => saveMeta({ ...meta, paternalClan: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">{t('familyTree.clan.maternal')}</label>
            <input className="w-full border rounded p-2" value={maternalClanStr} onChange={e => saveMeta({ ...meta, maternalClan: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">{t('familyTree.clan.additional')}</label>
            <input className="w-full border rounded p-2" value={additionalStr} onChange={e => saveMeta({ ...meta, additionalLineages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">{t('familyTree.clan.hint')}</p>
        <div className="mt-4 flex justify-end">
          <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            {t('familyTree.clan.save', 'Save Changes')}
          </button>
        </div>
      </div>
      {activeTab === 'tree' && (
        <div className="h-[520px] border rounded bg-white">
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView onNodeDoubleClick={onNodeDoubleClick} nodeTypes={nodeTypes}>
            <Background />
            <MiniMap />
            <Controls />
          </ReactFlow>
        </div>
      )}
      {activeTab === 'timeline' && (
        <div className="p-4 border rounded bg-white">
          {timelineEvents.length === 0 ? (
            <div className="text-gray-600">{t('familyTree.timeline.empty')}</div>
          ) : (
            <ul className="space-y-2">
              {timelineEvents.map((ev, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-32">{format(ev.ts, 'yyyy-MM-dd')}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100">{ev.type}</span>
                  <span>{ev.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tree.nodes.map(n => (
            <div key={n.id} className="border rounded p-3 bg-white">
              <div className="font-medium">{n.label}</div>
              <div className="text-xs text-gray-500 mb-2">{n.deceased ? t('familyTree.list.deceased') : t('familyTree.list.alive')}</div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!n.deceased} onChange={e => setDeceased(n.id, e.target.checked)} /> {t('familyTree.list.markDeceased')}</label>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && selectedContact && (
        <ContactEditModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            contact={selectedContact}
            onSave={handleSaveContact}
        />
      )}
    </div>
  );
}

function safeParseDate(s) {
  try {
    if (!s) return null;
    const d = parseISO(s);
    if (isNaN(d)) return null;
    return d;
  } catch { return null; }
}