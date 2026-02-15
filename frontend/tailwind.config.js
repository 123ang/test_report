/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        brand: {
          navy: '#3E5667',
          'navy-light': '#4a6577',
          accent: '#6FA8DC',
          'accent-muted': '#8bbae8',
          red: '#E57373',
          'red-muted': '#ef9a9a',
          bg: '#F7F8FA',
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      /* Background system: use with utility classes from index.css (bg-hero, bg-section, bg-soft, bg-cta) */
      backgroundImage: {
        'gradient-cta': 'linear-gradient(135deg, rgb(62 86 103 / 0.08) 0%, rgb(111 168 220 / 0.12) 100%)',
        'gradient-section-fade': 'linear-gradient(to bottom, transparent, rgb(247 248 250 / 0.5))',
      },
    },
  },
  plugins: [],
}
