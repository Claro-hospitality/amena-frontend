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

/**
 * Cierra la sesión actual **solo en esta app**.
 *
 * `scope: 'local'` no es un detalle: el default de supabase-js es `'global'`, que revoca TODAS
 * las sesiones del usuario en el servidor. Como backoffice y portal comparten el proyecto de
 * Auth, cerrar sesión en uno dejaba al otro con una sesión zombie — la UI se veía logueada
 * (el JWT en localStorage seguía vigente hasta una hora) pero cualquier acción fallaba.
 */
export async function cerrarSesion(): Promise<void> {
  const { error } = await supabase.auth.signOut({ scope: 'local' })
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

/**
 * Verifica el token de un enlace de acceso (tipo `recovery`) y abre la sesión. **Consume el
 * token**: es de un solo uso.
 *
 * Por eso NO se llama al abrir la pantalla, sino al guardar la contraseña. Si se consume al
 * montar, el token lo quema el primero que abra la URL — y en dominios corporativos eso suele
 * ser el escáner de seguridad del correo (Defender, Proofpoint), que "hace clic" en los enlaces
 * para analizarlos. La persona llegaba después y su enlace ya no servía. Es la mitigación que
 * recomienda Supabase: invalidar el token cuando el usuario envía el formulario, no al acceder.
 *
 * Nota: Auth devuelve el MISMO error (`otp_expired`) si el enlace venció, si ya se usó o si es
 * inválido. No se pueden distinguir, así que el mensaje al usuario cubre los tres casos.
 */
export async function verificarTokenAcceso(tokenHash: string): Promise<Session> {
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'recovery',
  })
  if (error) throw error
  if (!data.session) throw new Error('El enlace no es válido.')
  return data.session
}

/**
 * Define la contraseña (primer acceso o restablecimiento) y limpia los flags de
 * "debe definir/cambiar" en el metadata. Requiere sesión activa (tras verificarTokenAcceso).
 */
export async function definirPasswordAcceso(nueva: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: nueva,
    data: { must_change_password: false, debe_definir_password: false },
  })
  if (error) throw error
}

/** En qué app está pidiendo el acceso la persona. */
export type PlataformaAcceso = 'backoffice' | 'portal'

/**
 * Pide para UNO MISMO un enlace de acceso nuevo, cuando el que llegó por correo venció o
 * ya se usó (la pantalla `/definir-contrasena`). No requiere sesión: quien lo pide todavía
 * no puede entrar.
 *
 * La edge function responde SIEMPRE lo mismo exista o no la cuenta — es deliberado, para que
 * nadie pueda usarla para averiguar qué correos están dados de alta. Por eso aquí tampoco hay
 * un "no encontramos esa cuenta": devolvemos el mensaje tal cual para mostrarlo.
 */
export async function solicitarAcceso(
  email: string,
  plataforma: PlataformaAcceso
): Promise<string> {
  const { data, error } = await supabase.functions.invoke('solicitar-acceso', {
    body: { email, plataforma },
  })
  if (error) throw error
  return (
    (data as { mensaje?: string })?.mensaje ??
    'Si esa cuenta existe, te enviamos un enlace nuevo. Revisa tu correo.'
  )
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
