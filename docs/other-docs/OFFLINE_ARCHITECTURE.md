# Ecosystem Standard: Offline-First and Mesh-Enabled Architecture

This document provides the technical specification and implementation guide for transitioning all web applications within the Salatiso Ecosystem to an offline-first, mesh-enabled architecture. The goal is to ensure our applications are resilient, accessible, and functional even with intermittent or non-existent internet connectivity.

## 1. Core Principles

- **Offline First**: Core functionality must be available without an internet connection. All user-generated actions should be saved locally and synchronized when a connection is available.
- **Progressive Web App (PWA)**: Every application must be a PWA, enabling installation to the user's device and leveraging service workers for robust caching.
- **Local-First Data**: The primary source of truth for user data is the local device. The backend is treated as a backup and a sync coordinator.
- **Adaptive Tiering**: Applications must detect device capabilities and adapt their feature set and resource consumption accordingly (Lite, Intermediate, Full).
- **Peer-to-Peer (P2P) Connectivity**: Leverage WebRTC and/or Web Bluetooth for direct data exchange between nearby devices without a central server.

## 2. Implementation Guide (Phase 1: MVP)

This guide covers the foundational steps implemented in the `LifeSync-React-App`.

### Step 1: PWA Enablement & Advanced Caching

All Vite-based projects must update their `vite.config.js` to include `vite-plugin-pwa` with a comprehensive Workbox caching strategy.

**Dependencies:**
```bash
npm install vite-plugin-pwa --save-dev
```

**`vite.config.js` Configuration:**

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        // ... App-specific manifest details (name, short_name, icons)
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:png|gif|jpg|jpeg|svg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /.*/, // Fallback for all other requests (APIs, etc.)
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
```

### Step 2: Local Database Setup

We will use `Dexie.js` as a wrapper for IndexedDB to simplify database operations.

**Dependencies:**
```bash
npm install dexie
```

**Database Schema (`src/utils/localDB.js` or similar):**

Create a standardized database schema. All applications should share this core structure.

```javascript
import Dexie from 'dexie';

export const db = new Dexie('EcosystemDB'); // Use a shared DB name or app-specific

db.version(1).stores({
  settings: '++id, &key, value',      // For device tier, user prefs
  users: '++id, &userId, profile',   // For local user profiles
  actions_outbox: '++id, type, payload, timestamp, status', // For deferred server/peer sync
  content_bundles: '++id, &bundleId, version, data', // For offline articles, guides, etc.
  peers: '++id, &peerId, lastSeen', // For P2P networking
  messages: '++id, &messageId, sender, payload, timestamp, status', // For P2P messages
});
```

### Step 3: Capability Detection and Tiering

This logic should be implemented in a shared React Context to be available throughout the application. The onboarding process is the ideal place to introduce this to the user.

**1. Create a `DeviceContext.jsx`:**

This context will perform the capability detection and provide the tier information to its children.

**2. Key Logic for the Provider:**

```javascript
// Inside the DeviceProvider component

useEffect(() => {
  const detectCapabilities = async () => {
    try {
      // Storage detection
      let storage = 0;
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        storage = Math.round((estimate.quota || 0) / (1024 * 1024)); // In MB
      }

      // RAM detection (heuristic)
      const ram = navigator.deviceMemory || 1; // Defaults to 1GB

      // Tier recommendation logic
      let detectedTier = 'Intermediate';
      if (storage < 300 || ram < 1) detectedTier = 'Lite';
      else if (storage > 1500 && ram >= 2) detectedTier = 'Full';

      setRecommendedTier(detectedTier);
      
      // Load saved tier from DB or use the recommendation
      const savedTier = await db.settings.get({ key: 'deviceTier' });
      setTier(savedTier ? savedTier.value : detectedTier);

    } catch (error) {
      console.error("Capability detection failed:", error);
    } 
  };

  detectCapabilities();
}, []);
```

**3. Integrate into the UI:**

During onboarding, present the recommended tier and allow the user to select their preference. Save this choice to the `settings` table in the local database.

```javascript
// In your Onboarding component
const { tier, selectTier, recommendedTier } = useContext(DeviceContext);

// ... UI to show tiers and handle onClick ...

const handleSave = async () => {
  await db.settings.put({ key: 'deviceTier', value: tier });
  // ... continue onboarding
};
```

## Next Steps (Phase 2)

The next phase of this initiative will focus on activating the P2P and mesh-networking capabilities.

- **Connectivity SDK**: Develop a shared module that abstracts WebRTC (`simple-peer`) and Web Bluetooth APIs.
- **Action Outbox Processor**: Create a service to process the `actions_outbox` table, syncing data when a connection (peer or internet) becomes available.
- **Content Bundle Management**: Implement the logic to fetch, store, and render versioned content bundles for fully offline content access.
