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
        // Core palette — black / silver / green
        navy: {
          DEFAULT: '#0B1120',
          light: '#111827',
          dark: '#060A14',
        },
        charcoal: {
          DEFAULT: '#1C2028',
          light: '#252A34',
          dark: '#14171E',
        },
        electric: {
          DEFAULT: '#22C55E',
          dim: '#16A34A',
          bright: '#4ADE80',
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        silver: {
          DEFAULT: '#94A3B8',
          light: '#CBD5E1',
          dark: '#64748B',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
        },
        green: {
          DEFAULT: '#10B981',
          dim: '#059669',
          50: '#ECFDF5',
          400: '#34D399',
          500: '#10B981',
        },
        surface: {
          DEFAULT: '#0F1319',
          hover: '#181D26',
          active: '#1F2533',
        },
        border: {
          DEFAULT: '#252A34',
          light: '#343A48',
        },
        gray: {
          50: '#F4F6FA',
          100: '#E5E7EB',
          200: '#D1D5DB',
          300: '#9CA3AF',
          400: '#6B7280',
          500: '#4B5563',
          600: '#374151',
          700: '#1C2028',
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
        glow: '0 0 20px rgba(34, 197, 94, 0.15), 0 0 40px rgba(34, 197, 94, 0.05)',
        'glow-sm': '0 0 10px rgba(34, 197, 94, 0.1)',
        'glow-lg': '0 0 30px rgba(34, 197, 94, 0.2), 0 0 60px rgba(34, 197, 94, 0.08)',
        'glow-xl': '0 0 50px rgba(34, 197, 94, 0.15), 0 0 100px rgba(34, 197, 94, 0.06)',
        card: '0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(34, 197, 94, 0.06)',
        'card-elevated': '0 12px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
      },
      backgroundImage: {
        'gradient-electric': 'linear-gradient(135deg, #22C55E, #16A34A)',
        'gradient-green': 'linear-gradient(135deg, #10B981, #059669)',
        'gradient-surface': 'linear-gradient(180deg, #0F1319, #0B1120)',
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
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.2)' },
          '50%': { boxShadow: '0 0 16px 4px rgba(34, 197, 94, 0.1)' },
        },
      },
      transitionDuration: {
        '250': '250ms',
      },
    },
  },
  plugins: [],
};
