# Terms of Reciprocity — Salatiso Ecosystem (v4.0)

Version: 4.0  
Effective: Until 31 December 2025 (Beta Phase)

Applies to: LifeSync, Sazi Life Academy, and connected modules (Ekhaya, FamilyValue, PigeeBack, SafetyHelp, BizHelp, DocHelp, FinHelp, Flamea, LegalHelp, HrHelp, PubHelp, The Hub)

## Purpose and origin
- Why this exists: I built these tools for my family—first for my son, my nephews and nieces, my sisters, and as a living legacy to my parents. Over time I learned my family extends beyond blood, so I share these tools with the wider human family.
- From book to tool: The philosophy comes from the Flamea works now made operational as daily tools. Read them on Google Play Books:
  - HomeSchooling Father
  - Beyond Redress
  - Goliath’s Reckoning
  - Link to collection: https://play.google.com/store/books/collection/cluster?gsr=SheCARQKEAoMZ1pjTkVRQUFRQkFKEAkQBA%3D%3D:S:ANO1ljIKslE&hl=en_ZA

## Reciprocity in action
- Meaning: If these tools help you, pay it forward—share them with others who may benefit, contribute feedback, support fellow users, volunteer your time, and, if you’re able, make donations.
- Flow of value: You receive useful features and a trusted network; the community receives your care, insight, and participation.

## Beta, openness, and choice
- Active beta: We’re iterating rapidly until the end of 2025; things may change or break. We will communicate openly.
- Local-first: You are encouraged to save data locally for privacy and resilience.
- Hub optional: You’re free to sync to The Hub for portability, recovery, and cross-app use.
- Free access: All services—personal and professional—are free during beta.

## Mobile-first experience
- Designed for phones: Works on the lowest-end Android upward, with responsive layouts, low bandwidth use, and offline-ready content.
- Touch-friendly: Large tap targets, clear contrast, readable text.
- Auto-sizing: Fonts scale to your screen for comfortable reading.

## One ecosystem, many doors
- Learning core: Sazi Life Academy is the learning heart of the ecosystem.
- Trust and portability: LifeSync, The Hub, and companion apps keep your profile, settings, and trust signals consistent across experiences.

## What we ask from you
- Use features with consent: Especially for status, location, and shared data.
- Keep key info accurate: Emergency contacts, escalation rules, and safety circles.
- Report responsibly: Help us fix issues; don’t exploit bugs.
- Show up: Offer encouragement, share knowledge, and mentor where you can.

## What you can expect from us
- Clear choices: Guest mode for local-only use; optional Hub accounts for sync and recovery.
- Minimal data by default: Only what’s needed for the feature you choose.
- Transparency: Plain-language updates and known-issues logs.
- Portability: Your profile can travel across compatible apps.

## Features and reciprocity
- LifeSync Seal: Share availability or location with invitees you choose; opt out anytime.
- Geofencing & check-ins: You define radius alerts and schedules; we follow your escalation rules if overdue.
- Backups & recovery: Export (optionally encrypted) and restore; Hub improves recovery and interoperability.
- Learning signals: Your Sazi Life participation and contributions can enhance your trust profile across the ecosystem.

## Your data, your control
- Local-only option: Keep data on-device with encrypted export/import.
- Permissions are opt-in: GPS, notifications, contacts—grant only what you need; revoke anytime.
- Sync clarity: When Hub is on, we use conflict-aware sync and show clear status.

## Community standards
- Respect and consent: Share others’ data only with their permission.
- Constructive use: Tools are for safety, coordination, and learning—not surveillance or harm.
- Integrity: Be truthful about your skills, progress, and commitments.

## Updates and acceptance
- Evolving document: We’ll explain what changed and why in plain language.
- Your choice: If an update doesn’t suit you, continue in guest mode or export your data and step away.
- Acceptance: By tapping “Accept,” you affirm reciprocity, community standards, and the spirit of shared growth—from the individual outward to a stronger immediate and extended family.

## Contact
- The Hub: hub@salatiso.com • the-hub-lifecv.web.app

---

## Mobile UI/UX implementation spec (summary)

- Mobile-first, accessible accordion per section (H2/H3) with sticky Accept bar.
- Offline caching via dedicated service worker (`public/terms-sw.js`) with versioned cache `terms-v4.0`.
- Content delivered from JSON (`public/terms/terms.json`).
- Lightweight CSS (`public/terms/styles.css`), <80KB total for the module.
- State persistence:
  - Expanded sections in `sessionStorage`.
  - Acceptance state in `localStorage` under `salatisoEcosystemTermsAccepted`.

Routes: /terms/reciprocity (React page `src/pages/TermsOfReciprocity.jsx`)
Assets: /terms/terms.json, /terms/styles.css
SW:     /terms-sw.js (cache-first for /terms/*)

Release notes:
- v4.0 (2025-09-19): New mobile-first Terms module, offline-capable, ecosystem-wide content alignment.
