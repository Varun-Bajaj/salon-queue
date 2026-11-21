/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Cinzel', 'serif'],
        sans: ['Outfit', 'sans-serif'],
        mono: ['Space Grotesk', 'monospace'],
      },
      colors: {
        charcoal: {
          950: '#060709',
          900: '#0B0D12',
          850: '#11141B',
          800: '#171B24',
          700: '#232936',
          600: '#343D4E',
        },
        gold: {
          50: '#FFFDF5',
          100: '#FDF7E7',
          200: '#F9E9BE',
          300: '#F4D88D',
          400: '#ECC354',
          500: '#E5B842', // Signature Royal Gold
          600: '#C99824',
          700: '#A47413',
          800: '#845711',
          900: '#6E4511',
        },
        champagne: '#F7E7CE',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #FBF3D5 0%, #D4A017 45%, #AA7810 100%)',
        'gold-metallic': 'linear-gradient(135deg, #FFF1CA 0%, #D4A017 30%, #F5DF92 50%, #94690C 85%, #E8BE48 100%)',
        'dark-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%)',
        'mesh-glow': 'radial-gradient(circle at 50% 0%, rgba(212, 160, 23, 0.15) 0%, rgba(11, 13, 18, 0) 70%)',
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(229, 184, 66, 0.35)',
        'gold-glow-lg': '0 0 45px -8px rgba(229, 184, 66, 0.55)',
        'inner-gold': 'inset 0 1px 1px 0 rgba(255, 240, 180, 0.25)',
        '3d': '0 20px 30px -10px rgba(0, 0, 0, 0.8), 0 10px 10px -5px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'float 7s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'spin-slow': 'spin 20s linear infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(1deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', filter: 'drop-shadow(0 0 15px rgba(212,160,23,0.3))' },
          '50%': { opacity: '0.8', filter: 'drop-shadow(0 0 30px rgba(212,160,23,0.7))' },
        },
      },
    },
  },
  plugins: [],
}
