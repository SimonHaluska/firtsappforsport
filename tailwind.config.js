const tokens = require('./src/theme/tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: tokens.colors,
      spacing: tokens.spacing,
      borderRadius: tokens.radius,
      fontSize: tokens.fontSize,
      fontWeight: tokens.fontWeight,
    },
  },
  plugins: [],
};
