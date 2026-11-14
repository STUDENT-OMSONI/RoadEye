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
        canvas: '#e5e2da',
        canvasMuted: '#dedad0',
        petrol: {
          DEFAULT: '#142430',
          dark: '#0f1b24',
          light: '#1b3040',
        },
        henceOrange: {
          DEFAULT: '#ea580c',
          hover: '#c2410c',
          bright: '#f97316',
        },
        charcoal: '#141d26',
        charcoalMuted: '#586675',
        primary: {
          DEFAULT: '#ea580c',
          hover: '#c2410c',
          blue: '#2563EB',
        },
        accent: {
          DEFAULT: '#ea580c',
          orange: '#ea580c',
        },
        severity: {
          high: '#EF4444',
          medium: '#F59E0B',
          low: '#10B981',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'hence': '0 25px 60px -15px rgba(0, 0, 0, 0.45)',
        'card': '0 10px 30px -8px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}
