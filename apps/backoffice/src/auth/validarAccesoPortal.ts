import { supabase } from '@amena/supabase'

import type { Database } from '@amena/supabase/types'

/** Deriva del enum generado: agregar un rol en el backend lo trae solo. */
export type RolBackoffice = Database['public']['Enums']['rol_backoffice']

export interface ResultadoAcceso {
  concedido: boolean
  rol: RolBackoffice | null
  /** El usuario debe cambiar su contraseña antes de poder usar el backoffice. */
  debeCambiarPassword: boolean
}

/** Contexto que RutaProtegida pasa a las rutas hijas vía <Outlet>. */
export interface ContextoAcceso {
  rol: RolBackoffice
}

interface PerfilBackoffice {
  rol: RolBackoffice
  nombre: string
  debe_cambiar_password: boolean
}

/**
 * Valida si el usuario autenticado puede entrar al BACKOFFICE, con qué rol, y si debe
 * cambiar su contraseña. Usa el RPC SECURITY DEFINER `mi_perfil_backoffice`, que resuelve
 * el perfil con auth.uid() saltándose RLS (la RLS de usuarios_backoffice solo deja leer a
 * super_admin). Devuelve null si el usuario no es interno → acceso denegado.
 */
export async function validarAccesoPortal(): Promise<ResultadoAcceso> {
  const { data, error } = await supabase.rpc('mi_perfil_backoffice')
  if (error || !data) return { concedido: false, rol: null, debeCambiarPassword: false }
  const perfil = data as unknown as PerfilBackoffice
  return {
    concedido: true,
    rol: perfil.rol,
    debeCambiarPassword: Boolean(perfil.debe_cambiar_password),
  }
}

/** Ruta inicial (home) según el rol: el mesero solo escanea, eventos vive en su propio módulo. */
export function rutaInicialPorRol(rol: RolBackoffice): string {
  if (rol === 'mesero') return '/escaner'
  if (rol === 'eventos') return '/eventos'
  return '/inicio'
}
