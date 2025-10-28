import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CommunityCreate = ({ onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const handleCreate = () => {
    if (!name.trim()) return;
    const id = 'c_' + Date.now();
    const community = { id, name: name.trim(), description: description.trim(), members: [], households: [], settings: { confirmationsRequired: 2 } };
    onCreate(community);
    navigate(`/community/${id}`);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Create a Community</h3>
      <input className="w-full mb-2 p-2 border rounded" placeholder="Community name" value={name} onChange={(e) => setName(e.target.value)} />
      <textarea className="w-full mb-2 p-2 border rounded" placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="flex justify-end">
        <button onClick={handleCreate} className="px-4 py-2 bg-primary-600 text-white rounded">Create</button>
      </div>
    </div>
  );
};

export default CommunityCreate;
