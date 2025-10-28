import { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

function OfflineBanner({ lastUpdated }) {
  const { t } = useTranslation();
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return (
    <div className="offline" role="status" aria-live="polite">
      <div>{online ? t('terms.offlineAvailable', 'Available offline ✓') : t('terms.offlineUsingCache', 'Offline — using cached content')}</div>
      {lastUpdated && <div className="text-xs">{t('terms.lastUpdated', { date: lastUpdated, defaultValue: 'Last updated: {{date}}' })}</div>}
    </div>
  );
}

function AccordionItem({ id, title, children, defaultOpen = false }) {
  const [expanded, setExpanded] = useState(() => {
    try {
      const saved = sessionStorage.getItem('terms:expanded:' + id);
      return saved !== null ? saved === 'true' : defaultOpen;
    } catch { return defaultOpen; }
  });
  useEffect(() => {
    try { sessionStorage.setItem('terms:expanded:' + id, String(expanded)); } catch {}
  }, [expanded, id]);
  const panelId = 'sec-' + id;
  const headId = 'head-' + id;
  return (
    <section className="accordion" data-acc>
      <h2
        id={headId}
        className="acc-head"
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded((v) => !v); }
        }}
      >
        <span>{title}</span>
        <span className="chev" aria-hidden="true">⌄</span>
      </h2>
      <div id={panelId} role="region" aria-labelledby={headId} className="acc-panel">
        <div>
          {children}
        </div>
      </div>
    </section>
  );
}

function StickyBar({ accepted, onAccept, onDecline }) {
  const { t } = useTranslation();
  return (
    <footer className="sticky-bar" role="contentinfo">
      <div className="sticky-inner">
        <p className="commit">{t('terms.stickyCommit', 'By continuing, you affirm reciprocity and community standards.')}</p>
        <div>
          <button
            id="acceptBtn"
            className="btn btn-primary"
            onClick={onAccept}
            disabled={accepted}
          >{accepted ? t('terms.accepted', 'Accepted') : t('terms.accept', 'Accept & Continue')}</button>
          {!accepted && (
            <button
              id="declineBtn"
              className="btn btn-secondary ml-2"
              onClick={onDecline}
            >{t('terms.decline', 'Decline')}</button>
          )}
        </div>
      </div>
    </footer>
  );
}

export default function TermsOfReciprocity() {
  const { t } = useTranslation();
  const [doc, setDoc] = useState(null);
  const [accepted, setAccepted] = useState(() => {
    try { return localStorage.getItem('salatisoEcosystemTermsAccepted') === 'true'; } catch { return false; }
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/terms/terms.json', { cache: 'force-cache' });
        const json = await res.json();
        if (!active) return;
        setDoc(json);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to load terms.json', e);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/terms-sw.js').catch(() => {});
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = 'en-ZA';
    return () => { document.documentElement.lang = ''; };
  }, []);

  const headerMeta = useMemo(() => {
    if (!doc) return null;
    return `Version ${doc.version} • Beta until ${new Date(doc.betaUntil).toLocaleDateString()}`;
  }, [doc]);

  const handleAccept = useCallback(() => {
    try { localStorage.setItem('salatisoEcosystemTermsAccepted', 'true'); } catch {}
    setAccepted(true);
    window.dispatchEvent(new CustomEvent('terms:accepted', { detail: { version: doc?.version } }));
  }, [doc?.version]);

  const handleDecline = useCallback(() => {
    // Redirect per requirement with sei param
    window.location.href = 'https://www.google.com/search?q=salatiso+lonwabo+mdeni&sei=3pzMaJ6dCZWdkdUP3q6N0Qs';
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-0' : 'ml-0'}`}>
        <Header />
        <main id="terms" className="container flex-1">
          <link rel="stylesheet" href="/terms/styles.css" />
          <header className="page-head">
            <h1>{doc?.title || 'Terms of Reciprocity — Salatiso Ecosystem'}</h1>
            <p className="meta">{headerMeta || 'Version 4.x • Beta'}</p>
            <OfflineBanner lastUpdated={doc?.lastUpdated} />
          </header>

          {!doc && (
            <p>Loading…</p>
          )}

          {doc?.sections?.map((s, idx) => (
            <AccordionItem
              key={s.id}
              id={s.id}
              title={s.title}
              defaultOpen={s.id === 'overview'}
            >
              {s.body?.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </AccordionItem>
          ))}

          <StickyBar accepted={accepted} onAccept={handleAccept} onDecline={handleDecline} />
        </main>
        <Footer />
      </div>
    </div>
  );
}