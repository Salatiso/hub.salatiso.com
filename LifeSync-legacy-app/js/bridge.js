export function initializeBridge(config) {
  if (!config || !config.appName || !config.firebaseUrl || !config.description) {
    console.warn('[Bridge] Missing configuration.');
    return;
  }

  const sanitizedFirebase = config.firebaseUrl.replace(/\/+$/, '');
  const loginUrl = (config.loginUrl || `${sanitizedFirebase}/login`).replace(/(?<!:)\/\/+/, '/');
  const contactUrl = config.contactUrl || 'https://bizhelp-lifecv.web.app/contact';
  const cookieName = config.cookieName || `${config.appName.replace(/[^a-z0-9]/gi, '').toLowerCase()}_bridge_choice`;
  const cookieDays = config.cookieDays || 30;
  const badgeLabel = config.badgeLabel || 'New app';
  const toggleLabel = config.toggleLabel || 'Quick tools';
  const crossLinks = Array.isArray(config.crossLinks) ? config.crossLinks.slice(0, config.crossLinkLimit || 2) : [];
  const androidUrl = config.androidUrl;

  const styles = `
    .bridge-overlay { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; padding: 24px; background: linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9)); z-index: 9999; backdrop-filter: blur(12px); }
    .bridge-overlay.hidden { display: none !important; }
    .bridge-content { width: min(90%, 600px); background: #ffffff; color: #0f172a; border-radius: 18px; padding: 48px 40px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.35); }
    @media (max-width: 640px) { .bridge-content { padding: 36px 24px; } }
    .bridge-logo { width: 120px; height: 120px; margin: 0 auto 24px; display: grid; place-items: center; background: linear-gradient(135deg,#1e293b,#3b82f6); color: #fff; border-radius: 24px; font-size: 2.5rem; font-weight: 700; }
    .bridge-logo img { width: 100%; height: 100%; object-fit: contain; border-radius: 20px; background: transparent; }
    .bridge-title { font-family: 'Roboto Slab','Inter',system-ui; font-size: clamp(2rem, 3vw, 2.6rem); font-weight: 700; margin-bottom: 16px; }
    .bridge-description { font-family: 'Inter', system-ui; font-size: 1rem; line-height: 1.7; color: #475569; margin-bottom: 32px; }
    .bridge-buttons { display: flex; gap: 16px; margin-bottom: 24px; }
    .bridge-button { flex: 1; padding: 16px 24px; border-radius: 12px; border: none; font-family: 'Inter', system-ui; font-size: 1.05rem; font-weight: 600; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .bridge-button-primary { background: linear-gradient(135deg, #2563eb, #10b981); color: #fff; box-shadow: 0 12px 30px -10px rgba(37,99,235,0.55); }
    .bridge-button-primary:hover { transform: translateY(-2px); box-shadow: 0 18px 40px -12px rgba(37,99,235,0.65); }
    .bridge-button-secondary { background: #e2e8f0; color: #334155; }
    .bridge-button-secondary:hover { background: #cbd5e1; }
    .bridge-contact a { color: #2563eb; font-weight: 600; text-decoration: none; }
    .bridge-contact a:hover { text-decoration: underline; }
    .bridge-android { margin-bottom: 20px; }
    .bridge-android a { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 999px; background: #111827; color: #fff; text-decoration: none; font-weight: 600; }

    .quick-tools { position: fixed; right: 16px; bottom: 16px; z-index: 9998; }
    .quick-tools-toggle { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg,#2563eb,#10b981); color: #fff; border: none; border-radius: 9999px; padding: 10px 16px; cursor: pointer; box-shadow: 0 10px 28px -10px rgba(37,99,235,0.6); font-weight: 600; }
    .quick-tools-toggle .badge { background: rgba(255,255,255,0.25); padding: 2px 10px; border-radius: 9999px; font-size: 0.7rem; letter-spacing: 0.03em; text-transform: uppercase; }
    .quick-tools-card { display: none; margin-top: 12px; width: min(90vw, 320px); background: #ffffff; border: 1px solid rgba(148,163,184,0.4); border-radius: 14px; box-shadow: 0 25px 50px -12px rgba(15,23,42,0.35); overflow: hidden; }
    .quick-tools.open .quick-tools-card { display: block; }
    .quick-tools-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #f1f5f9; border-bottom: 1px solid rgba(148,163,184,0.4); }
    .quick-tools-body { padding: 14px 16px; display: grid; gap: 10px; }
    .quick-tools .text-secondary { color: #64748b; }
    .qt-link { display: flex; gap: 12px; align-items: center; padding: 12px; border: 1px solid rgba(148,163,184,0.35); border-radius: 10px; text-decoration: none; color: #0f172a; background: #fff; transition: background 0.2s ease, box-shadow 0.2s ease; }
    .qt-link:hover { background: #f8fafc; box-shadow: 0 12px 22px -16px rgba(15,23,42,0.35); }
    .qt-link i { font-size: 1.1rem; }
    .qt-idtool { border-style: dashed; flex-direction: column; align-items: stretch; }
    .qt-idtool .qt-id-row { display: flex; gap: 8px; }
    .qt-idtool input { flex: 1; padding: 8px 10px; border: 1px solid rgba(148,163,184,0.6); border-radius: 6px; font-size: 0.95rem; }
    .qt-idtool button { padding: 8px 14px; background: #1f2937; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
    .qt-idtool button:hover { background: #111827; }
    .qt-idtool .qt-result { font-size: 0.8rem; margin-top: 6px; min-height: 1.2em; }
    @media (max-width: 540px) {
      .quick-tools { right: 12px; bottom: 12px; }
      .quick-tools-card { width: min(94vw, 300px); }
      .bridge-buttons { flex-direction: column; }
      .bridge-button { width: 100%; }
    }
    @media (prefers-color-scheme: dark) {
      .bridge-content { background: #0f172a; color: #e2e8f0; }
      .bridge-description { color: #cbd5f5; }
      .bridge-button-secondary { background: rgba(148,163,184,0.2); color: #e2e8f0; }
      .bridge-button-secondary:hover { background: rgba(148,163,184,0.35); }
      .bridge-contact a { color: #93c5fd; }
      .quick-tools-card { background: #0f172a; border-color: rgba(148,163,184,0.3); }
      .quick-tools-header { background: rgba(30,41,59,0.9); color: #e2e8f0; border-bottom-color: rgba(148,163,184,0.2); }
      .qt-link { background: rgba(15,23,42,0.85); color: #e2e8f0; border-color: rgba(148,163,184,0.25); }
      .qt-link:hover { background: rgba(30,41,59,0.85); }
      .qt-idtool input { background: rgba(15,23,42,0.9); color: #e2e8f0; border-color: rgba(148,163,184,0.35); }
      .qt-idtool button { background: #2563eb; }
    }
  `;

  const injectStyles = () => {
    if (!document.getElementById('bridge-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'bridge-styles';
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);
    }
  };

  const setCookie = (name, value, days) => {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  };

  const getCookie = (name) => {
    return document.cookie.split('; ').reduce((acc, part) => {
      const [key, val] = part.split('=');
      return key === name ? decodeURIComponent(val || '') : acc;
    }, '');
  };

  const goToNewApp = () => {
    setCookie(cookieName, 'new', cookieDays);
    window.location.href = `${sanitizedFirebase}/`;
  };

  const createOverlay = () => {
    let overlay = document.getElementById('bridgeOverlay');
    if (overlay) return overlay;

    const logoMarkup = config.logoPath
      ? `<img src="${config.logoPath}" alt="${config.appName} Logo">`
      : `<span>${config.appName.slice(0, 2).toUpperCase()}</span>`;
    const androidMarkup = androidUrl
      ? `<div class="bridge-android"><a href="${androidUrl}" target="_blank" rel="noopener"><i class="fa-brands fa-google-play"></i><span>Get the Android app</span></a></div>`
      : '';

    overlay = document.createElement('div');
    overlay.id = 'bridgeOverlay';
    overlay.className = 'bridge-overlay';
    overlay.innerHTML = `
      <div class="bridge-content">
        <div class="bridge-logo">${logoMarkup}</div>
        <h1 class="bridge-title">${config.appName}: From Legacy to Ecosystem</h1>
        <p class="bridge-description">${config.description}</p>
        <div class="bridge-buttons">
          <button class="bridge-button bridge-button-primary" data-bridge-action="go-new">Go to New App →</button>
          <button class="bridge-button bridge-button-secondary" data-bridge-action="explore">Explore Legacy Site</button>
        </div>
        ${androidMarkup}
        <div class="bridge-contact">
          <a href="${contactUrl}" target="_blank" rel="noopener">Contact</a>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const goBtn = overlay.querySelector('[data-bridge-action="go-new"]');
    const exploreBtn = overlay.querySelector('[data-bridge-action="explore"]');
    goBtn?.addEventListener('click', goToNewApp);
    exploreBtn?.addEventListener('click', () => {
      setCookie(cookieName, 'legacy', cookieDays);
      overlay.classList.add('hidden');
    });

    return overlay;
  };

  const validateSouthAfricanID = (id) => {
    if (!/^\d{13}$/.test(id)) return { valid: false, reason: 'ID must be 13 digits' };
    const yy = parseInt(id.slice(0, 2), 10);
    const mm = parseInt(id.slice(2, 4), 10);
    const dd = parseInt(id.slice(4, 6), 10);
    const year = yy >= 50 ? 1900 + yy : 2000 + yy;
    const date = new Date(year, mm - 1, dd);
    if (date.getFullYear() !== year || date.getMonth() + 1 !== mm || date.getDate() !== dd) {
      return { valid: false, reason: 'Invalid birth date' };
    }
    const digits = id.split('').map(Number);
    let sum = 0;
    for (let i = 0; i < 13; i++) {
      let d = digits[12 - i];
      if (i % 2 === 1) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
    }
    if (sum % 10 !== 0) return { valid: false, reason: 'Checksum failed' };
    const citizenship = parseInt(id[10], 10);
    if (citizenship !== 0 && citizenship !== 1) return { valid: false, reason: 'Invalid citizenship digit' };
    return { valid: true, reason: 'Valid ID' };
  };

  const createQuickTools = () => {
    let container = document.getElementById('quick-tools');
    if (container) return container;

    const crossLinksMarkup = crossLinks.map(link => `
      <a class="qt-link" href="${link.url}" target="_blank" rel="noopener">
        <i class="${link.icon || 'fa-solid fa-link'} text-slate-500"></i>
        <div>
          <div>${link.label}</div>
          ${link.description ? `<div class="text-xs text-secondary">${link.description}</div>` : ''}
        </div>
      </a>
    `).join('');

    container = document.createElement('div');
    container.id = 'quick-tools';
    container.className = 'quick-tools';
    container.innerHTML = `
      <button id="qt-toggle" class="quick-tools-toggle" aria-expanded="false" aria-controls="qt-card">
        <i class="fa-solid fa-bolt"></i>
        <span>${toggleLabel}</span>
        <span class="badge">${badgeLabel}</span>
      </button>
      <div id="qt-card" class="quick-tools-card" role="dialog" aria-label="Quick tools">
        <div class="quick-tools-header">
          <strong>${config.appName} by Salatiso</strong>
          <button id="qt-close" title="Close" class="text-sm text-secondary"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="quick-tools-body">
          <a class="qt-link" href="${sanitizedFirebase}/" target="_blank" rel="noopener">
            <i class="fa-solid fa-arrow-up-right-from-square text-slate-500"></i>
            <div>
              <div>Open new app</div>
              <div class="text-xs text-secondary">Continue in the modern platform</div>
            </div>
          </a>
          <a class="qt-link" href="${loginUrl}" target="_blank" rel="noopener">
            <i class="fa-solid fa-right-to-bracket text-slate-500"></i>
            <div>
              <div>Login (new app)</div>
              <div class="text-xs text-secondary">Single sign-on across the ecosystem</div>
            </div>
          </a>
          <div class="qt-link qt-idtool">
            <div class="qt-id-row">
              <input id="qt-id-input" type="text" inputmode="numeric" maxlength="13" placeholder="Enter 13-digit ID" aria-label="South African ID number">
              <button id="qt-id-check">Check</button>
            </div>
            <div id="qt-id-result" class="qt-result" aria-live="polite"></div>
          </div>
          ${crossLinksMarkup}
        </div>
      </div>
    `;
    document.body.appendChild(container);

    const toggle = container.querySelector('#qt-toggle');
    const card = container.querySelector('#qt-card');
    const close = container.querySelector('#qt-close');
    const input = container.querySelector('#qt-id-input');
    const check = container.querySelector('#qt-id-check');
    const result = container.querySelector('#qt-id-result');

    const setOpen = (open) => {
      if (open) {
        container.classList.add('open');
        toggle?.setAttribute('aria-expanded', 'true');
      } else {
        container.classList.remove('open');
        toggle?.setAttribute('aria-expanded', 'false');
      }
    };

    setOpen(false);

    toggle?.addEventListener('click', () => setOpen(!container.classList.contains('open')));
    close?.addEventListener('click', () => setOpen(false));

    const runValidation = () => {
      const value = (input?.value || '').trim();
      const outcome = validateSouthAfricanID(value);
      if (result) {
        result.textContent = outcome.valid ? `✓ ${outcome.reason}` : `✗ ${outcome.reason}`;
        result.style.color = outcome.valid ? '#16a34a' : '#dc2626';
      }
    };

    check?.addEventListener('click', runValidation);
    input?.addEventListener('keypress', (evt) => {
      if (evt.key === 'Enter') {
        evt.preventDefault();
        runValidation();
      }
    });

    return container;
  };

  const init = () => {
    injectStyles();
    const overlay = createOverlay();
    createQuickTools();
    const choice = getCookie(cookieName);
    if (choice === 'new') {
      goToNewApp();
      return;
    }
    if (choice === 'legacy') {
      overlay.classList.add('hidden');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}
