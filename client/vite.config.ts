import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Backend runs on port 5001
const backendUrl = 'http://localhost:5001';

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
