/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core palette
        navy: {
          DEFAULT: '#0A1833',
          light: '#0F2147',
          dark: '#060F22',
        },
        charcoal: {
          DEFAULT: '#23272F',
          light: '#2A3040',
          dark: '#1A1F2E',
        },
        electric: {
          DEFAULT: '#00E6FF',
          dim: '#00B8CC',
          bright: '#33ECFF',
          50: '#E6FCFF',
          100: '#B3F7FF',
          200: '#80F2FF',
          300: '#4DEDFF',
          400: '#1AE8FF',
          500: '#00E6FF',
          600: '#00B8CC',
          700: '#008A99',
          800: '#005C66',
          900: '#002E33',
        },
        green: {
          DEFAULT: '#00FFB2',
          dim: '#00CC8E',
          50: '#E6FFF7',
          400: '#00FFB2',
          500: '#00CC8E',
        },
        surface: {
          DEFAULT: '#141925',
          hover: '#1C2235',
          active: '#242A3C',
        },
        border: {
          DEFAULT: '#2A3040',
          light: '#3A4050',
        },
        gray: {
          50: '#F4F6FA',
          100: '#E5E7EB',
          200: '#D1D5DB',
          300: '#9CA3AF',
          400: '#6B7280',
          500: '#4B5563',
          600: '#374151',
          700: '#23272F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['Montserrat', 'Oswald', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      spacing: {
        sidebar: '260px',
        18: '4.5rem',
        88: '22rem',
        120: '30rem',
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 230, 255, 0.15), 0 0 40px rgba(0, 230, 255, 0.05)',
        'glow-sm': '0 0 10px rgba(0, 230, 255, 0.1)',
        'glow-lg': '0 0 30px rgba(0, 230, 255, 0.2), 0 0 60px rgba(0, 230, 255, 0.08)',
        card: '0 4px 24px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.25)',
      },
      backgroundImage: {
        'gradient-electric': 'linear-gradient(135deg, #00E6FF, #00B8CC)',
        'gradient-green': 'linear-gradient(135deg, #00FFB2, #00CC8E)',
        'gradient-surface': 'linear-gradient(180deg, #141925, #0A1833)',
        'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-in': 'slideIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s infinite',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 230, 255, 0.2)' },
          '50%': { boxShadow: '0 0 16px 4px rgba(0, 230, 255, 0.1)' },
        },
      },
      transitionDuration: {
        '250': '250ms',
      },
    },
  },
  plugins: [],
};
