import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This is the new part:
  server: {
    proxy: {
      // This proxies any request starting with /api
      '/api': {
        target: 'https://ecocartplus-backend.onrender.com', // Your backend server
        changeOrigin: true,
        secure: true, 
      },
    },
  },
})