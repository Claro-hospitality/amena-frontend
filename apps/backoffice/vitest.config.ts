import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // Env dummy para que el cliente de Supabase se instancie en tests sin .env real
    // (en CI no hay .env.local). Los tests mockean la capa de datos; esto solo evita
    // que createClient lance "supabaseUrl is required" al importar módulos.
    env: {
      VITE_SUPABASE_URL: 'http://localhost:54331',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    },
  },
})
