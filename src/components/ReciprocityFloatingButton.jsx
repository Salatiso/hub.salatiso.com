import { useEffect, useRef, useState } from 'react';

const DEFAULT_HUB = 'https://the-hub-lifecv.web.app';

export default function ReciprocityFloatingButton({ hubAuthUrl = DEFAULT_HUB }) {
  const [expanded, setExpanded] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (expanded && panelRef.current && !panelRef.current.contains(e.target)) setExpanded(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [expanded]);

  return (
    <div className="fixed right-4 bottom-20 z-50" aria-live="polite">
      <div className="relative">
        <button
          aria-expanded={expanded}
          aria-controls="reciprocity-panel"
          onClick={() => setExpanded(s => !s)}
          className="px-3 py-2 rounded-full shadow-lg bg-green-500 text-white flex items-center gap-3 transition-all duration-200"
        >
          <div className="flex flex-col leading-tight text-left">
            <span className="text-xs opacity-90">Powered by</span>
            <span className="text-sm font-extrabold">The Hub by Salatiso</span>
          </div>
        </button>

        {expanded && (
          <div
            ref={panelRef}
            id="reciprocity-panel"
            role="dialog"
            aria-modal="false"
            className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[220px]"
          >
            <h3 className="text-gray-800 font-semibold text-center mb-3">Access Your Account</h3>
            <div className="space-y-2">
              <a
                href={`${hubAuthUrl}/login`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-500 text-white text-center py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
              >
                Login
              </a>
              <a
                href={`${hubAuthUrl}/register`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-green-500 text-white text-center py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
              >
                Register
              </a>
            </div>
            <div className="text-center text-sm text-gray-500 mt-3">Powered by The Hub by Salatiso</div>
          </div>
        )}
      </div>
    </div>
  );
}
