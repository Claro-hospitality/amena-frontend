/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  /** URL absoluta del sitio público (botón "Ver sitio"). Default: https://amena.social */
  readonly VITE_SITIO_PUBLICO_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
