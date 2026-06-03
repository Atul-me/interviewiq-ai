/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f8ff',
          100: '#eef3ff',
          200: '#dbe5ff',
          300: '#bdcdff',
          400: '#93abff',
          500: '#6380ff', // Vivid Brand Accent
          600: '#3b52f6', // Core Brand Color
          700: '#2839e4',
          800: '#1d27b9',
          900: '#1e2593',
          950: '#111457',
        },
        dark: {
          50: '#f4f5f6',
          100: '#e9ebed',
          200: '#cbd1d6',
          300: '#a3aeb7',
          400: '#768593',
          500: '#5b6977',
          600: '#48535f',
          700: '#3c444f',
          800: '#23282f', // Premium slate/dark grey cards
          900: '#16191d', // Core deep dark background
          950: '#0c0e11',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
    },
  },
  plugins: [],
}
