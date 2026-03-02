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
        navy: '#0A1833', // Deep Navy
        charcoal: '#23272F', // Charcoal
        electric: '#00E6FF', // Electric Blue
        accent: '#00E6FF', // Accent (same as electric)
        green: '#00FFB2', // Athletic Green
        white: '#FFFFFF', // Clean White
        gray: {
          50: '#F4F6FA', // Soft Gray
          100: '#E5E7EB',
          200: '#D1D5DB',
          300: '#9CA3AF',
          400: '#6B7280',
          500: '#4B5563',
          600: '#374151',
          700: '#23272F', // Charcoal
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['Montserrat', 'Oswald', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        xl: '1rem',
      },
    },
  },
  plugins: [],
};
