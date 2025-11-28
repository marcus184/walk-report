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
          accent: '#f59e0b',
          accentHover: '#d97706',
          warning: '#ef4444',
          text: '#f8fafc',
          textMuted: '#94a3b8',
          textDim: '#64748b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(245, 158, 11, 0.25)',
        'glow-sm': '0 0 10px rgba(245, 158, 11, 0.15)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}
