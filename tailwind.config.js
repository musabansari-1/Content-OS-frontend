/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#060b12",
          deep: "#04070d",
          elevated: "#0a121c",
        },
        panel: {
          DEFAULT: "#0e1826",
          strong: "#101c2c",
          soft: "#111a26",
        },
        ink: "#f5f3ef",
        muted: "#9aa6b8",
        line: {
          DEFAULT: "#2a3344",
          strong: "#3a4558",
        },
        accent: {
          DEFAULT: "#ff8a3d",
          strong: "#ff9e59",
          soft: "#3d2a1c",
          cool: "#7ab8c9",
        },
        success: "#6cc8a0",
        warning: "#f2a666",
        danger: "#f08080",
      },
      fontFamily: {
        sans: ["Manrope", "Segoe UI", "sans-serif"],
        display: ["Space Grotesk", "Manrope", "sans-serif"],
      },
      borderRadius: {
        sm: "10px",
        md: "14px",
        lg: "18px",
        xl: "24px",
        "2xl": "32px",
      },
      boxShadow: {
        panel: "0 28px 80px rgba(0, 0, 0, 0.4)",
        soft: "0 16px 48px rgba(0, 0, 0, 0.28)",
        accent: "0 18px 40px rgba(255, 138, 61, 0.28)",
      },
      transitionDuration: {
        DEFAULT: "180ms",
      },
    },
  },
  plugins: [],
};
