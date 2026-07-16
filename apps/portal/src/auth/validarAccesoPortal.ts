import type { Session } from '@amena/supabase/auth'

export type TipoUsuarioPortal = 'admin_empresa' | 'colaborador'

export interface ResultadoAcceso {
  concedido: boolean
  tipo: TipoUsuarioPortal | null
}

/**
 * Valida si el usuario autenticado puede entrar al PORTAL (app.amena.com) y como qué.
 *
 * TODO(fase-3-sync): implementar contra `usuarios_empresa` y `colaboradores` cuando el
 * esquema esté mergeado. Debe (solo lectura, sin escribir):
 *   1. Buscar en usuarios_empresa por user_id = session.user.id y activo → 'admin_empresa'.
 *   2. Si no, buscar en colaboradores por user_id = session.user.id (user_id no nulo) y
 *      activo → 'colaborador'.
 *   3. Si no aparece en ninguna → { concedido: false, tipo: null }.
 *
 * Por ahora es un STUB: concede acceso con un tipo falso para poder montar todo el flujo
 * (login → validación → shell / pantalla "sin acceso") sin depender del esquema.
 */
export async function validarAccesoPortal(session: Session): Promise<ResultadoAcceso> {
  // STUB — sustituir el interior cuando existan usuarios_empresa / colaboradores.
  return session ? { concedido: true, tipo: 'admin_empresa' } : { concedido: false, tipo: null }
}
