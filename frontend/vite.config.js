import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitse.dev/config/
export default defineConfig({
  server: {
    allowedHosts: ['8d3f-202-88-229-91.ngrok-free.app'],
    port: 5173,
    host: true,
    strictPort: true,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
})
