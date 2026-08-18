import { supabase } from './index'

/**
 * Invocación de Edge Functions con el manejo de errores que necesitan las dos apps.
 *
 * Existe por un bug real de producción: una sesión revocada (te desconectaste en otra pestaña)
 * hacía que las acciones fallaran con "No tienes permiso para esta operación", así que un
 * super_admin creía haber perdido sus permisos. El backend ahora distingue 401 (no sabemos
 * quién eres) de 403 (sabes quién eres, pero no te alcanza el rol) y aquí se actúa en
 * consecuencia: ante un 401 se limpia la sesión local para que la app mande a iniciar sesión.
 */

/** La sesión ya no sirve. Volver a iniciar sesión SÍ resuelve esto. */
export class SesionExpiradaError extends Error {
  /** Marca serializable: sobrevive aunque el error cruce un boundary y pierda el prototipo. */
  readonly esSesionExpirada = true

  constructor(mensaje = 'Tu sesión ya no es válida. Vuelve a iniciar sesión.') {
    super(mensaje)
    this.name = 'SesionExpiradaError'
  }
}

/** ¿Este error es por sesión inválida? Úsalo para decidir si mandar a iniciar sesión. */
export function esSesionExpirada(e: unknown): boolean {
  if (e instanceof SesionExpiradaError) return true
  return (
    typeof e === 'object' &&
    e !== null &&
    (e as { esSesionExpirada?: unknown }).esSesionExpirada === true
  )
}

const MENSAJE_GENERICO = 'No se pudo completar la operación. Intenta de nuevo.'

/** Saca el `{ error }` que devuelven nuestras Edge Functions, sin romperse si no hay body. */
async function mensajeDelCuerpo(resp: Response | undefined): Promise<string | null> {
  if (!resp || typeof resp.json !== 'function') return null
  try {
    const body = await resp.json()
    return typeof body?.error === 'string' ? body.error : null
  } catch {
    return null
  }
}

/**
 * Invoca una Edge Function y normaliza el error.
 *
 * - 401 → limpia la sesión local y lanza `SesionExpiradaError`.
 * - resto → lanza `Error` con el mensaje que mandó la función (o uno genérico).
 */
export async function invocarFuncion<T>(
  nombre: string,
  body: Record<string, unknown>,
  /** Mensaje cuando la función no manda uno propio ("No se pudo facturar el corte…"). */
  siFalla = MENSAJE_GENERICO
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(nombre, { body })
  if (!error) return data as T

  const resp = (error as { context?: Response }).context
  const mensaje = (await mensajeDelCuerpo(resp)) ?? siFalla

  if (resp?.status === 401) {
    // Local: no revoca las sesiones de las otras apps (ver cerrarSesion en auth.ts).
    await supabase.auth.signOut({ scope: 'local' }).catch(() => {})
    throw new SesionExpiradaError(mensaje)
  }

  throw new Error(mensaje)
}
