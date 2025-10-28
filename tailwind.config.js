/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#fef3c7',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          900: '#78350f',
        },
        accent: {
          50: '#ecfdf5',
          100: '#ecfdf5',
          500: '#10b981',
          600: '#059669',
          900: '#064e3b',
        }
      }
    },
  },
  plugins: [],
}
