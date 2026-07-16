import type { Session } from '@amena/supabase/auth'

export type RolBackoffice = 'super_admin' | 'mesero' | 'finanzas'

export interface ResultadoAcceso {
  concedido: boolean
  rol: RolBackoffice | null
}

/**
 * Valida si el usuario autenticado puede entrar al BACKOFFICE y con qué rol.
 *
 * TODO(fase-3-sync): implementar contra `usuarios_internos` cuando el esquema esté
 * mergeado. Debe (solo lectura, sin escribir):
 *   1. Consultar usuarios_internos por user_id = session.user.id.
 *   2. Verificar activo = true (si es false, acceso denegado).
 *   3. Devolver { concedido: true, rol } con el rol_backoffice real,
 *      o { concedido: false, rol: null } si no existe / está inactivo.
 *
 * Por ahora es un STUB: concede acceso con un rol falso para poder montar todo el
 * flujo (login → validación → shell / pantalla "sin acceso") sin depender del esquema.
 */
export async function validarAccesoPortal(session: Session): Promise<ResultadoAcceso> {
  // STUB — concede acceso a cualquier usuario autenticado con un rol falso.
  // (session.user.id será la clave de la consulta a usuarios_internos al implementar.)
  return session ? { concedido: true, rol: 'super_admin' } : { concedido: false, rol: null }
}
