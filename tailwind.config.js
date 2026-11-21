/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: '#1F2937',
          light: '#374151',
          dark: '#111827',
          darker: '#0d1117',
        },
        gold: {
          DEFAULT: '#D4A017',
          light: '#F0C040',
          dark: '#A67C00',
          pale: '#FEF3C7',
        },
      },
      animation: {
        'pulse-gold': 'pulseGold 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212,160,23,0.4)' },
          '50%': { boxShadow: '0 0 0 20px rgba(212,160,23,0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
