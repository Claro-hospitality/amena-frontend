import { supabase } from '@amena/supabase'

export type TipoUsuarioPortal = 'admin_empresa' | 'colaborador'

export interface ResultadoAcceso {
  concedido: boolean
  tipo: TipoUsuarioPortal | null
}

/** Contexto que RutaProtegida pasa a las rutas hijas vía <Outlet>. */
export interface ContextoAcceso {
  tipo: TipoUsuarioPortal
}

/**
 * Valida si el usuario autenticado puede entrar al PORTAL y como qué tipo.
 *
 * Usa los helpers SECURITY DEFINER del backend (con auth.uid(), saltándose RLS):
 *   - mis_empresas_admin(): empresas que administra → 'admin_empresa'
 *   - mis_comensales(): comensales enlazados a su cuenta → 'colaborador'
 * Si no aparece en ninguna, se le deniega el acceso.
 */
export async function validarAccesoPortal(): Promise<ResultadoAcceso> {
  const [empresas, comensales] = await Promise.all([
    supabase.rpc('mis_empresas_admin'),
    supabase.rpc('mis_comensales'),
  ])

  if (Array.isArray(empresas.data) && empresas.data.length > 0) {
    return { concedido: true, tipo: 'admin_empresa' }
  }
  if (Array.isArray(comensales.data) && comensales.data.length > 0) {
    return { concedido: true, tipo: 'colaborador' }
  }
  return { concedido: false, tipo: null }
}

/** Ruta inicial (home): ambos tipos entran a /inicio (el contenido se despacha por tipo). */
export function rutaInicial(): string {
  return '/inicio'
}
