import type { Session } from '@supabase/supabase-js'
import { supabase } from './index'

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
