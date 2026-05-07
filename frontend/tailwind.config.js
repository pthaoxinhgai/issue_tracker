/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#161b22', // GitHub/Jira dark background
        surface: '#1d2125',    // Slightly lighter surface
        primary: '#579dff',    // Jira-style bright blue
        primaryHover: '#85b8ff',
        border: '#30363d',     // Subtle border color
      }
    },
  },
  plugins: [],
}
