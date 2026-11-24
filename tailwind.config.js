/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canteen: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Core Brand Orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        surface: {
          light: '#FAFAF9', // Warm neutral cream
          card: '#FFFFFF',
          dark: '#0F172A',  // Rich TV display slate
          tv: '#020617',
        },
        veg: '#16A34A',     // Green
        nonveg: '#DC2626',  // Red
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        'ready-blink': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)', boxShadow: '0 0 25px rgba(16, 185, 129, 0.8)' },
          '50%': { opacity: '0.4', transform: 'scale(1.03)', boxShadow: '0 0 40px rgba(16, 185, 129, 1)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        }
      },
      animation: {
        'ready-blink': 'ready-blink 1s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
