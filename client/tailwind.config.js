/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wac: {
          bg: '#020617',
          surface: '#0b1120',
          card: '#111827',
          border: '#1e293b',
          accent: '#fbbf24',
          accentHover: '#f59e0b',
          warning: '#f97316',
          text: '#f8fafc',
          textMuted: '#94a3b8',
          textDim: '#64748b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(251, 191, 36, 0.15)',
        'glow-sm': '0 0 10px rgba(251, 191, 36, 0.1)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}
