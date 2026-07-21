import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  alCambiarSesion,
  cerrarSesion,
  iniciarSesion,
  obtenerSesion,
  type Session,
} from '@amena/supabase/auth'
import { AuthContext } from './AuthContext'

/** Provee la sesión de Supabase Auth y la mantiene sincronizada vía el listener. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    obtenerSesion().then((s) => {
      setSession(s)
      setCargando(false)
    })
    // El listener cubre login, logout y refresh de token.
    const cancelar = alCambiarSesion(setSession)
    return cancelar
  }, [])

  const value = useMemo(
    () => ({ session, cargando, iniciarSesion, cerrarSesion }),
    [session, cargando]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
