import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hujra: {
          bg: "#07060d",
          card: "#10101c",
          accent: "#a3e635",
          lime: "#bef264",
          amber: "#fbbf24",
          rose: "#fb7185",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        urdu: ["var(--font-urdu)", "serif"],
      },
      animation: {
        "pulse-ring": "pulse-ring 1.6s cubic-bezier(0.4,0,0.6,1) infinite",
        "toast-in": "toast-in 0.3s cubic-bezier(0.16,1,0.3,1) both",
        "float-y": "float-y 6s ease-in-out infinite",
        "reaction-pop": "reaction-pop 2.6s ease-out both",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(163,230,53,0.45)" },
          "70%": { boxShadow: "0 0 0 12px rgba(163,230,53,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(163,230,53,0)" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateY(10px) scale(0.96)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "float-y": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "reaction-pop": {
          "0%": { opacity: "0", transform: "translateY(4px) scale(0.5)" },
          "15%": { opacity: "1", transform: "translateY(0) scale(1.15)" },
          "30%,75%": { opacity: "1", transform: "translateY(-14px) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(-38px) scale(0.8)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
