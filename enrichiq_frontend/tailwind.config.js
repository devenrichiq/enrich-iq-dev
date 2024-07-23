// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Helvetica', 'sans-serif'],
        // Add more font families if needed
      },
    },
  },
  variants: {},
  plugins: [],
}
