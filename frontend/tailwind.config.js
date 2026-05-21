/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        broadcast: "0 24px 70px rgba(0, 0, 0, 0.35)",
      },
      animation: {
        shake: "shake 0.45s ease-in-out",
        pulseGlow: "pulseGlow 1.7s ease-in-out infinite",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-10px)" },
          "50%": { transform: "translateX(10px)" },
          "75%": { transform: "translateX(-6px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 rgba(34, 197, 94, 0)" },
          "50%": { boxShadow: "0 0 32px rgba(34, 197, 94, 0.35)" },
        },
      },
    },
  },
  plugins: [],
};
