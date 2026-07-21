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
        brand: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#16A34A',
          700: '#15803D', // Primary Forest Emerald Accent
          900: '#14532D',
        },
        financial: {
          expense: '#E11D48', // Muted Rose Red
          income: '#10B981',  // Vivid Emerald Green
          savings: '#0284C7', // Deep Sky Blue
          bill: '#D97706',    // Amber Warning
        },
        surface: {
          light: '#F8FAFC',   // Clean Off-White Background
          card: '#FFFFFF',    // Crisp Card Surface
          dark: '#0F172A',    // Deep Slate Dark Mode Surface
        }
      }
    },
  },
  plugins: [],
};

export default config;
