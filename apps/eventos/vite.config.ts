import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Puerto 5176 para poder correr el admin y la landing (5175) al mismo tiempo.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5176,
    strictPort: true,
  },
})
