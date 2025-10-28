# The Hub - Technical Specification (Aggregate)

Version: 2.1.0
Date: 2025-08-14

This document aggregates module-level specs, architecture, deployment, and integration points for The Hub.

1. Architecture Summary
- Frontend: React 18 + Vite, Tailwind CSS, React Router v6
- Backend: Firebase suite (Auth, Firestore, Functions, Storage)
- Hosting: Firebase Hosting

2. Core Modules & Routes
- /dashboard
- /lifecv
- /finhelp
- /safetyhelp
- /training (Sazi Life Academy)
- /family-value
- /hrhelp, /legalhelp, etc.

3. Data & Sync
- Bi-directional sync for LifeCV and selected modules
- Firestore is the canonical source for user state
- Local storage used for offline session progress caching

4. Auth & Security
- Firebase Auth for user sessions
- Route guards on protected routes
- Firestore security rules required for userTrainings & certificates

5. CI/CD & Deployment
- Build: Vite build
- Deploy: `firebase deploy --only "functions,hosting"`
- Functions: Cloud Functions v2
- Functions runtime: Node.js 20

6. Developer Tools
- Recommended: Node 18+, pnpm or npm, VSCode
- Linting: ESLint config present

7. Observability
- Monitor: Firebase Analytics (optional), Cloud Function logs, Sentry (future)

8. Next Steps
- Migrate course catalog to Firestore
- Add E2E tests for training workflows
- Add analytics events for course completion and certificate generation

Maintained by: Hub Development Team
