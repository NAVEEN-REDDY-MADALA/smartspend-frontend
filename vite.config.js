import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ['smartspend-frontend-production.up.railway.app'],
    port: 4173,
    host: true
  }
})
