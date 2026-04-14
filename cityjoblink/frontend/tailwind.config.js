/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom border radius must go here
      borderRadius: {
        'gov': '12px', 
      },
      // Make sure your colors are also inside extend
      colors: {
        'qc-blue': '#0038A8',
        'qc-gold': '#FFD700',
      }
    },
  },
  plugins: [],
}