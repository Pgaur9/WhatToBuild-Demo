/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        bungee: ['Bungee', 'sans-serif'],
        rye: ['Rye'],
        rubikDoodle: ['"Rubik Doodle Shadow"', 'system-ui'],
      },
    },
  },
  plugins: [],
}
