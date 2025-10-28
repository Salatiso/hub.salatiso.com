import { useState } from 'react';

const AlertCard = ({ alert, onConfirm }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = (verdict) => {
    if (submitting) return;
    setSubmitting(true);
    const confirmation = { userId: 'local_user', time: Date.now(), verdict };
    onConfirm(alert.id, confirmation);
    setTimeout(() => setSubmitting(false), 250);
  };

  const confirmations = alert.confirmations || [];

  return (
    <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm text-gray-500">{new Date(alert.createdAt).toLocaleString()}</div>
          <h4 className="text-lg font-semibold">{alert.category}</h4>
          <div className="text-sm text-gray-600 dark:text-gray-300">Status: <span className="font-medium">{alert.status}</span></div>
        </div>
        <div className="text-sm text-gray-500">Confirms: {confirmations.length}</div>
      </div>

      <p className="mt-2 text-gray-700 dark:text-gray-200">{alert.message}</p>

      <div className="mt-3 flex gap-2">
        <button onClick={() => handleConfirm('confirm')} className="px-3 py-1 bg-green-600 text-white rounded">I confirm</button>
        <button onClick={() => handleConfirm('not_affected')} className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded">Not affected</button>
        <button onClick={() => handleConfirm('need_help')} className="px-3 py-1 bg-yellow-500 text-white rounded">Need help</button>
      </div>
    </div>
  );
};

export default AlertCard;
