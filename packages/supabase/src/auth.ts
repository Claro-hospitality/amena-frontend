import type { Session } from '@supabase/supabase-js'
import { supabase } from './index'

// Re-export para que las apps consuman el tipo desde @amena/supabase (sin depender
// directamente de @supabase/supabase-js).
export type { Session } from '@supabase/supabase-js'

/**
 * Helpers de autenticación sobre Supabase Auth (auth.users).
 * NO consultan tablas de negocio — solo supabase.auth. La validación de rol/acceso
 * por portal vive en cada app (ver validarAccesoPortal).
 */

/** Inicia sesión con email + contraseña. Lanza el AuthError de Supabase si falla. */
export async function iniciarSesion(email: string, password: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.session
}

/** Cierra la sesión actual. Lanza el AuthError de Supabase si falla. */
export async function cerrarSesion(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Cambia la contraseña del usuario autenticado y limpia el flag
 * `must_change_password` (usuarios dados de alta con contraseña temporal).
 * El listener de sesión (USER_UPDATED) refleja el cambio en las apps.
 */
export async function cambiarPassword(nueva: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: nueva,
    data: { must_change_password: false },
  })
  if (error) throw error
}

/** Devuelve la sesión actual (o null si no hay). */
export async function obtenerSesion(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession()
  return data.session
}

/**
 * Se suscribe a los cambios de sesión (login, logout, refresh de token).
 * Devuelve una función para cancelar la suscripción.
 */
export function alCambiarSesion(
  callback: (session: Session | null) => void
): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
  return () => data.subscription.unsubscribe()
}
