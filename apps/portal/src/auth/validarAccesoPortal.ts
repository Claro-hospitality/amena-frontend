import { supabase } from '@amena/supabase'

export type TipoUsuarioPortal = 'admin_empresa' | 'colaborador'

export interface ResultadoAcceso {
  concedido: boolean
  tipo: TipoUsuarioPortal | null
  /** True si el usuario tiene un comensal (QR) enlazado — aunque entre como admin. */
  esComensal: boolean
}

/** Contexto que RutaProtegida pasa a las rutas hijas vía <Outlet>. */
export interface ContextoAcceso {
  tipo: TipoUsuarioPortal
  /** True si el usuario también es comensal (tiene QR): un admin puede serlo a la vez. */
  esComensal: boolean
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

  const esComensal = Array.isArray(comensales.data) && comensales.data.length > 0

  if (Array.isArray(empresas.data) && empresas.data.length > 0) {
    return { concedido: true, tipo: 'admin_empresa', esComensal }
  }
  if (esComensal) {
    return { concedido: true, tipo: 'colaborador', esComensal: true }
  }
  return { concedido: false, tipo: null, esComensal: false }
}

/**
 * Ruta inicial (home) según el tipo:
 * - colaborador → /mi-qr (es lo que más usa frente al mesero; ahorra un tap).
 * - admin_empresa → /inicio (su vista de contexto operativo).
 */
export function rutaInicial(tipo: TipoUsuarioPortal): string {
  return tipo === 'colaborador' ? '/mi-qr' : '/inicio'
}
