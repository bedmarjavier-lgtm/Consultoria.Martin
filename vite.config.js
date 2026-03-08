import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Sirve index.html para cualquier ruta no encontrada (SPA routing)
    historyApiFallback: true,
  },
})
