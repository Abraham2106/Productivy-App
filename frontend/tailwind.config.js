/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        accent: '#2ECC71',
        'accent-dark': '#27AE60',
        'accent-light': '#D4EDDA',
        'nature-green': '#52C41A',
        'dark-card': '#2C3E50',
        'warm-accent': '#95A5A6',
      },
    },
  },
  plugins: [],
}
