/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#111111",      // Charcoal black
          gray: "#f7f7f7",      // Off-white / light gray background
          light: "#ffffff",     // Pure white
          orange: "#ff5a00",    // Premium high-impact orange accent
          pink: "#fcdad7",      // Soft pink highlight matching secondary image
          accent: "#2c3e50"
        }
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "sans-serif"],
      },
      letterSpacing: {
        widest: ".25em",
        mega: ".35em"
      }
    },
  },
  plugins: [],
}
