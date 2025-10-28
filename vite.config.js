import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  root: './',
  resolve: {
    dedupe: ['firebase']
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: false,
    open: 'http://localhost:3000',
    hmr: {
      host: 'localhost',
      port: 3000,
      protocol: 'ws'
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'vite.svg'],
      manifest: {
        name: 'LifeSync',
        short_name: 'LifeSync',
        description: 'Revolutionary compatibility and relationship management platform built on the Salatiso Ecosystem',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        // PWA icons can be added once proper image files are created
        // Place 192x192 and 512x512 PNG files in the public/ directory
        icons: [
          // {
          //   src: 'pwa-192x192.png',
          //   sizes: '192x192',
          //   type: 'image/png'
          // },
          // {
          //   src: 'pwa-512x512.png',
          //   sizes: '512x512',
          //   type: 'image/png'
          // },
          // {
          //   src: 'pwa-512x512.png',
          //   sizes: '512x512',
          //   type: 'image/png',
          //   purpose: 'any maskable'
          // }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
            }
          },
          {
            urlPattern: /\.(?:png|gif|jpg|jpeg|svg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
              },
            },
          }
        ]
      }
    })
  ],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      mangle: {
        keep_fnames: true,
        keep_classnames: true
      }
    },
    rollupOptions: {
      input: './index.html',
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          ui: ['lucide-react'],
          i18n: ['i18next', 'react-i18next']
        }
      }
    }
  }
})