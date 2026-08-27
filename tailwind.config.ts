import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        village: {
          blue: "#1E3A8A",
          darkblue: "#0F172A",
          sky: "#38BDF8",
          emerald: "#059669",
          amber: "#D97706",
          orange: "#EA580C",
          earth: "#78350F",
          cream: "#F8FAFC",
          sand: "#FEF3C7",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)",
        glow: "0 0 25px rgba(59, 130, 246, 0.5)",
        card: "0 10px 30px -5px rgba(15, 23, 42, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
