import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Get backend URL from environment or use default
// For Replit: API_URL is set to localhost:5001 via env var
// For local Mac: Default to localhost:5002 (backend default port)
const backendUrl = process.env.API_URL || process.env.VITE_API_URL || 'http://localhost:5002';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.VITE_PORT || '5000'),
    strictPort: false,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
      },
      '/uploads': {
        target: backendUrl,
        changeOrigin: true,
      },
      '/pdfs': {
        target: backendUrl,
        changeOrigin: true,
      },
    },
  },
})
