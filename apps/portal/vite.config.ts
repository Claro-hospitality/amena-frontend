import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Expone el dev server en la red local (LAN) para probar desde el teléfono
    // (portal es mobile-first). Vite imprime la URL "Network" al arrancar.
    host: true,
    port: 5173,
    strictPort: true,
  },
})
