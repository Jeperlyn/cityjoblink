/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      // --- ADD THIS OBJECT ---
      fontFamily: {
        'krona': ['"Krona One"', 'sans-serif'],
        'lustria': ['"Lustria"', 'serif'],
        'lohit': ['"Lustria"', 'serif'], // 'Lohit' isn't on Google Fonts, so we'll use 'Lustria' as a backup
      },
    }, // <-- The 'extend' object closes here
  }, // <-- The 'theme' object closes here

  plugins: [], // <-- This is the correct location
}