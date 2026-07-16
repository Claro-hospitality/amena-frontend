import { createContext } from 'react'
import type { Session } from '@amena/supabase/auth'

export interface ValorAuth {
  /** Sesión de Supabase Auth, o null si no hay. */
  session: Session | null
  /** true mientras se resuelve la sesión inicial. */
  cargando: boolean
  iniciarSesion: (email: string, password: string) => Promise<Session>
  cerrarSesion: () => Promise<void>
}

export const AuthContext = createContext<ValorAuth | null>(null)
