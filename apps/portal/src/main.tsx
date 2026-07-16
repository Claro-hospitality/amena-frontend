import '@amena/ui/src/theme.css'
import * as Sentry from '@sentry/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

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
    <App />
  </StrictMode>,
)
