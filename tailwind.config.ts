import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: '#E8E3DB',
        card: '#FFFFFF',
        sidebar: '#1C1C2E',
        accent: {
          coral: '#F2766B',
          'coral-light': '#FBDED8',
          salmon: '#F5576C',
          peach: '#F97794',
        },
        g: {
          blue: '#4285F4',
          red: '#EA4335',
          yellow: '#FBBC04',
          green: '#34A853',
          purple: '#A142F4',
        },
        churn: {
          critical: '#EA4335',
          high: '#F29900',
          medium: '#FBBC04',
          low: '#34A853',
        },
        text: {
          primary: '#1C1C2E',
          secondary: '#6B6B7B',
          muted: '#A0A0AE',
        },
        border: {
          DEFAULT: '#DDD9D1',
          subtle: '#E8E4DC',
        },
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)',
        'elevated': '0 8px 24px rgba(0,0,0,0.08)',
      },
      gridTemplateColumns: {
        '20': 'repeat(20, minmax(0, 1fr))',
      },
      gridColumn: {
        'span-13': 'span 13 / span 13',
        'span-7': 'span 7 / span 7',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
