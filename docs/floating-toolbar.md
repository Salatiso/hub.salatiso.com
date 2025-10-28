# Floating Toolbar (Bottom-right Collapsible Sidebar)

The floating toolbar is a small, collapsible utility panel that appears at the bottom-right of the app. It provides quick access to common tools and must behave consistently across the Salatiso Ecosystem, mirroring LifeSync’s behavior by default.

- Component: `src/components/FloatingToolbar.jsx`
- Mounted in: `src/App.jsx` (rendered globally under the main layout)
- Positioning: `fixed bottom-4 right-4 z-50` (always visible above page content)

## Standard Behavior (Ecosystem-wide)
- Default state: minimized (shows a round button with an up chevron). Click to expand; click the down chevron to collapse.
- Visibility: shown on all routes unless explicitly disabled for a view (rare). It should not obscure critical UI.
- Z-index: `z-50` so it floats above page content and popovers beneath modals.
- Icons/UI: uses Tailwind CSS utility classes and `lucide-react` icons for consistency.
- i18n: tool labels should be translated using each app’s i18n setup with English fallback.

## Default Tools (must-have)
Across the ecosystem, the toolbar must include these six items by default:
- Dashboard (route: `/dashboard` or app-equivalent)
- ID Validator (opens in-place modal)
- Follow Me Home (route: `/follow-me-home` or app-equivalent)
- Instant Trust (route: `/instant-trust` or app-equivalent; may open an external page if that’s the app’s current integration)
- Incident Reporting (route: `/incident-reporting` or app-equivalent)
- Emergency Assistance (route: `/emergency-assistance` or app-equivalent)

Apps may add more tools after these defaults (e.g., SafetyHelp Hub, Guest Session Manager), but should not remove or rename the defaults without updating ecosystem standards and release notes.

## Per-app Routing Guidance
- LifeSync (this app):
  - Dashboard: `/dashboard`
  - Follow Me Home: `/follow-me-home`
  - Instant Trust: `/instant-trust` (currently supported; may also open a hosted page for cross-app parity)
  - Incident Reporting: `/incident-reporting`
  - Emergency Assistance: `/emergency-assistance`
  - ID Validator: in-app modal (no route change)
- Other apps (e.g., The Hub, Salatiso.com, etc.): map each default item to the closest equivalent route or module. If a feature is not yet available, the item should be present but can show a tooltip “Coming soon” or link to a canonical ecosystem module until native support ships.

## State & Persistence
- Default minimized on first load.
- Optional persistence key (recommended): `localStorage['salatiso_toolbar_minimized'] = 'true'|'false'`.
  - If implemented, restore previous state on app load.
  - If not implemented, default to minimized each session (current LifeSync behavior).

## Extensibility Rules
- Additional tools should appear below the defaults and use consistent icon + label + description patterns.
- External links must open in a new tab.
- Avoid adding actions that require multi-step confirmations; instead, link to a dedicated screen/modal.

## Accessibility
- All interactive controls must be reachable by keyboard (Tab/Shift+Tab), have `aria-label` or visible labels, and use focus-visible outlines.
- Modals (e.g., ID Validator) must trap focus and provide a clear close action; the backdrop must have `aria-hidden` and appropriate roles.

## Enable/Disable
- Enabled by default (rendered as `<FloatingToolbar />` in `App.jsx`).
- To disable globally in an app, comment out or remove both the import and render:
  - `import FloatingToolbar from './components/FloatingToolbar'`
  - `<FloatingToolbar />`
  - If disabled, note this in the app’s change log with a rationale and replacement UX if any.

## Troubleshooting
- If you don’t see it, ensure `FloatingToolbar.jsx` compiles and `App.jsx` includes it.
- Check z-index conflicts with other fixed components; default is `z-50`.
- Verify that per-app routes exist; if a route is missing, add a placeholder route or wire to the canonical ecosystem page.
