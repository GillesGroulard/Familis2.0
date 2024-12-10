/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f3f8',
          100: '#cce7f1',
          200: '#99cfe3',
          300: '#66b7d5',
          400: '#339fc7',
          500: '#056aa0', // Main brand color
          600: '#045f90',
          700: '#034d75',
          800: '#023a5a',
          900: '#01283f',
        }
      }
    },
  },
  plugins: [],
};