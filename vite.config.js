// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to backend server
      '/api': {
        target: 'http://localhost:3001', // Pointing to backend server
        changeOrigin: true,              // Needed to avoid CORS issues
        secure: false,                   // Disable SSL verification for localhost
      },
    },
  },
});
