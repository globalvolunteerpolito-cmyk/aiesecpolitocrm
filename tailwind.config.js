/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'aiesec-blue': '#037EF3',
        'aiesec-red': '#F85A40',
      }
    },
  },
  plugins: [],
}