import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n'

// NOTE: Google Maps API is loaded lazily in components that need it
// This prevents unnecessary quota consumption on app startup
// See: src/utils/googleMapsLoader.js for lazy loading implementation

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
