/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f1117',
        surface: '#1a1d2e',
        borderC: '#2a2d3e',
        primary: '#6c63ff',
        positive: '#00c896',
        negative: '#ff4d6a',
        warning: '#ffb84d',
        textMain: '#e1e4ed',
        textMuted: '#8b8fa3'
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
