import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'gdg-apl.onrender.com'
    ],
    host: '0.0.0.0',
    port: 5173
  },
  preview: {
    allowedHosts: [
      'gdg-apl.onrender.com'
    ],
    host: '0.0.0.0'
  }
})
