/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#05070d",
          deep: "#03040a",
          elevated: "#0a101c",
        },
        panel: {
          DEFAULT: "#0d1522",
          strong: "#111b2c",
          soft: "#111a26",
        },
        ink: "#f6f3ee",
        muted: "#98a4b8",
        line: {
          DEFAULT: "#2a3344",
          strong: "#3d4a61",
        },
        accent: {
          DEFAULT: "#ff8a3d",
          strong: "#ffab66",
          soft: "#3d2a1c",
          cool: "#7fd3e8",
        },
        violet: "#a78bfa",
        success: "#6fe3b4",
        warning: "#f5b56e",
        danger: "#f57f7f",
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
        "2xl": "30px",
      },
      boxShadow: {
        panel: "0 30px 80px rgba(0, 0, 0, 0.42)",
        soft: "0 16px 48px rgba(0, 0, 0, 0.3)",
        accent: "0 18px 44px rgba(255, 106, 46, 0.32)",
      },
      transitionDuration: {
        DEFAULT: "180ms",
      },
      animation: {
        "fade-in": "fadeIn 0.7s ease both",
        "rise": "rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "drift": "orbDrift 26s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          "from": { opacity: "0" },
          "to": { opacity: "1" },
        },
        rise: {
          "from": { opacity: "0", transform: "translateY(18px)" },
          "to": { opacity: "1", transform: "translateY(0)" },
        },
        orbDrift: {
          "from": { transform: "translate3d(0, 0, 0) scale(1)" },
          "to": { transform: "translate3d(44px, -28px, 0) scale(1.12)" },
        },
      },
    },
  },
  plugins: [],
};
