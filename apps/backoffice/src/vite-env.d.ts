/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  /** DSN de Sentry. Vacío en desarrollo (Sentry deshabilitado); solo se llena en producción. */
  readonly VITE_SENTRY_DSN?: string
  /** Sitio público de eventos (botón "Ver sitio" del menú). Default: https://amena.social */
  readonly VITE_SITIO_PUBLICO_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
