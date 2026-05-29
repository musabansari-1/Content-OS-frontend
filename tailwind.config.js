/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#f5f7fb",
        muted: "#9ca9c3",
        accent: "#f97316",
      },
    },
  },
  plugins: [],
};
