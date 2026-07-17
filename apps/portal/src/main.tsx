import '@amena/ui/src/theme.css'
import { Toaster } from '@amena/ui/components/ui/sonner'
import * as Sentry from '@sentry/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthProvider'
import { queryClient } from './lib/queryClient'

// Sentry solo se inicializa si hay DSN. En desarrollo local el DSN está vacío,
// así que queda deshabilitado y no ensucia el proyecto de Sentry. El DSN se
// llena únicamente en producción vía VITE_SENTRY_DSN.
const sentryDsn = import.meta.env.VITE_SENTRY_DSN
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  </StrictMode>,
)
