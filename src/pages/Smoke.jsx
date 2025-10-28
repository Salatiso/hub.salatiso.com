import { useEffect, useState } from 'react';
import { fetchPartnerVisibility } from '../utils/reciprocityApi';

const Smoke = () => {
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle');
  const region = import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'us-central1';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatus('calling');
      try {
        // Intentionally call with a demo UID; expect unauthenticated if not signed in
        const data = await fetchPartnerVisibility('demo-partner-uid');
        if (!cancelled) setResult({ ok: true, data });
      } catch (e) {
        if (!cancelled) setResult({ ok: false, code: e?.code || e?.name, message: e?.message });
      } finally {
        if (!cancelled) setStatus('done');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Smoke Test</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          This page auto-calls the callable function <code>computeReciprocity</code> via <code>fetchPartnerVisibility</code> on mount.
        </p>
        <div className="text-sm text-gray-700 dark:text-gray-200 mb-4">
          <div>Functions region: <span className="font-mono">{region}</span></div>
          <div>Status: <span className="font-mono">{status}</span></div>
        </div>
        <pre className="text-xs bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-100 p-3 rounded overflow-auto">
{JSON.stringify(result, null, 2)}
        </pre>
        <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
          Expected when not signed in: an <code>unauthenticated</code> or <code>permission-denied</code> error, which confirms Functions is reachable.
        </p>
      </div>
    </div>
  );
};

export default Smoke;
