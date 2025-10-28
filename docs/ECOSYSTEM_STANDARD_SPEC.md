# Salatiso Ecosystem Standard Specification (ECO-SPEC v1.0)

Date: 2025-09-19
Scope: LifeSync, The Hub, and companion apps

## 1. Global Navigation & Sidebar
- Sidebar position: left, collapsible, default expanded where applicable
- Toggle affordance: top-left in header
- Visibility: visible on authenticated routes that start with any of the registered dashboard paths per app
- State persistence: `localStorage['lifesync_sidebar_collapsed']` (boolean) or app-specific equivalent
- Accessibility: focus-visible outlines, semantic nav regions

## 1.1 Floating Toolbar (Bottom-right)
- Presence: required in all apps unless explicitly exempted (document exemption and provide alternate access paths).
- Position: bottom-right, `fixed`, `z-50` or above standard content but below full-screen modals.
- Default state: minimized on first load; may persist via `localStorage['salatiso_toolbar_minimized']`.
- Universal default tools (must-have across apps):
	1) Dashboard (route `/dashboard` or equivalent)
	2) ID Validator (modal)
	3) Follow Me Home (route `/follow-me-home` or equivalent)
	4) Instant Trust (route `/instant-trust` or equivalent; external allowed until native)
	5) Incident Reporting (route `/incident-reporting` or equivalent)
	6) Emergency Assistance (route `/emergency-assistance` or equivalent)
- Additional tools: allowed, appended after the defaults; must not remove or rename defaults without spec change.
- Accessibility: keyboard navigable, labels/aria, focus styling; modals trap focus and include clear dismiss.
- i18n: labels use app’s i18n keys with English fallback.
- Extensibility: external links open in a new tab; avoid multi-confirm actions in the toolbar.

## 2. Dashboard Behavior
- Default open by design; user can collapse
- Works across all dashboard items/routes (per-app registered list)
- Loading fallbacks: minimal spinners or text
- No floating third-party promo UI by default

## 3. Contact Form Standard (`/contact`)
- Required route: `/contact`
- Fields: category (enum), subject, full name, email, phone (optional), message, anonymous toggle
- Optional poll: top-5 ranking and evaluation categories
- UX: mobile-first, validated inputs, accessible labels

## 4. Terms of Reciprocity (v4.0)
- Route: `/terms/reciprocity`
- Data: `public/terms/terms.json` (versioned)
- Styles: `public/terms/styles.css`
- Offline: cache-first via `public/terms-sw.js`
- Acceptance storage: `localStorage['salatisoEcosystemTermsAccepted']='true'`
- Decline redirect: `https://www.google.com/search?q=salatiso+lonwabo+mdeni&sei=3pzMaJ6dCZWdkdUP3q6N0Qs`
- Accessibility: accordion with keyboard support, aria attributes
- i18n: `terms.*` keys available across locales; English fallback

## 5. Marketplace & Contacts
- Footer/Contact: include official contact email `hub@salatiso.com` and marketplace link `the-hub-lifecv.web.app`
- Link to Sazi Life Academy where relevant

## 6. Firebase & Environment
- Firebase SDK v10+ modular, lazy-initialize Functions
- Single instance: tooling configuration should dedupe `firebase` (Vite resolve)
- Emulator support via env flags (optional)

## 7. Service Workers
- Terms assets SW only handles `/terms/*` cache-first; keep limited surface area
- Version cache name includes terms version (e.g., `terms-v4.0`)

## 8. Accessibility & Mobile
- Prefer reduced motion, high-contrast focus states, large tap targets
- Ensure route pages are responsive and readable on low-end Android devices

## 9. Telemetry & Privacy
- Beta transparency statement; encourage local-only usage as an option
- Clearly mark optional sync with The Hub

## 10. Implementation Notes
- The Terms acceptance event: dispatch `terms:accepted` with detail `{ version }`
- Uniform storage keys across apps to simplify cross-app checks
- Keep content light and standardized across codebases for portability

## 11. Change Log
- 2025-09-19: Initial specification covering sidebar, dashboard, contact form, terms, and marketplace contact details.
- 2025-09-19 (update): Add Floating Toolbar standard (defaults, behavior, accessibility, and per-app routing guidance).
