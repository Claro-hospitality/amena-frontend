import { supabase } from '@amena/supabase'

export type RolBackoffice = 'super_admin' | 'mesero' | 'finanzas'

export interface ResultadoAcceso {
  concedido: boolean
  rol: RolBackoffice | null
}

/** Contexto que RutaProtegida pasa a las rutas hijas vía <Outlet>. */
export interface ContextoAcceso {
  rol: RolBackoffice
}

/**
 * Valida si el usuario autenticado puede entrar al BACKOFFICE y con qué rol.
 *
 * Usa los helpers SECURITY DEFINER del backend (es_super_admin / es_finanzas /
 * es_mesero), que resuelven el rol con auth.uid() saltándose RLS. No se consulta
 * usuarios_backoffice directamente porque su RLS solo deja leer a super_admin.
 */
export async function validarAccesoPortal(): Promise<ResultadoAcceso> {
  const [superAdmin, finanzas, mesero] = await Promise.all([
    supabase.rpc('es_super_admin'),
    supabase.rpc('es_finanzas'),
    supabase.rpc('es_mesero'),
  ])

  if (superAdmin.data) return { concedido: true, rol: 'super_admin' }
  if (finanzas.data) return { concedido: true, rol: 'finanzas' }
  if (mesero.data) return { concedido: true, rol: 'mesero' }
  return { concedido: false, rol: null }
}

/** Ruta inicial (home) según el rol: el mesero solo escanea. */
export function rutaInicialPorRol(rol: RolBackoffice): string {
  return rol === 'mesero' ? '/escaner' : '/inicio'
}
