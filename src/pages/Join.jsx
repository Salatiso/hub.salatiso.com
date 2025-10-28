import { useParams } from 'react-router-dom';

const Join = () => {
  const { id } = useParams();
  // Minimal placeholder for invite/join flow
  return (
    <div className="max-w-xl mx-auto mt-16 p-8 bg-white dark:bg-gray-800 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Join Household</h1>
      <p className="mb-2">You have been invited to join a household or community.</p>
      <div className="mb-4 text-sm text-gray-600">Invite ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{id}</span></div>
      <p className="mb-6">To continue, please sign in or create a profile. This link will connect you to the household and allow you to sync your information.</p>
      <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Continue</button>
    </div>
  );
};

export default Join;
