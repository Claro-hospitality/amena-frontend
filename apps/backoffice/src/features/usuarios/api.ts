import { supabase } from '@amena/supabase'
import type { Database } from '@amena/supabase/types'

export type RolBackoffice = Database['public']['Enums']['rol_backoffice']

/** Usuario interno del backoffice (con email de auth), como lo devuelve el RPC. */
export interface UsuarioBackoffice {
  user_id: string
  nombre: string
  rol: RolBackoffice
  activo: boolean
  email: string
  debe_cambiar_password: boolean
}

/** Resultado del alta / reset: credenciales para entregar (contraseña temporal una sola vez). */
export interface CredencialesAlta {
  email: string
  yaTeniaCuenta: boolean
  tempPassword?: string
}

export const ETIQUETA_ROL: Record<RolBackoffice, string> = {
  super_admin: 'Super administrador',
  finanzas: 'Finanzas',
  mesero: 'Mesero',
  consulta: 'Consulta',
  capitan_meseros: 'Capitán de meseros',
}

/** Lista los usuarios internos con su email (RPC SECURITY DEFINER, solo super_admin). */
export async function listarUsuarios(): Promise<UsuarioBackoffice[]> {
  const { data, error } = await supabase.rpc('listar_usuarios_backoffice')
  if (error) throw error
  return (data ?? []) as UsuarioBackoffice[]
}

/** Invoca la Edge Function de gestión y normaliza el error (extrae el {error} del body). */
async function invocar(body: Record<string, unknown>): Promise<CredencialesAlta> {
  const { data, error } = await supabase.functions.invoke('alta-usuario-backoffice', { body })
  if (error) {
    let mensaje = 'No se pudo completar la operación. Intenta de nuevo.'
    const resp = (error as { context?: Response }).context
    if (resp && typeof resp.json === 'function') {
      try {
        const b = await resp.json()
        if (b?.error) mensaje = b.error
      } catch {
        /* sin cuerpo JSON */
      }
    }
    throw new Error(mensaje)
  }
  return data as CredencialesAlta
}

export function crearUsuario(datos: {
  nombre: string
  email: string
  rol: RolBackoffice
}): Promise<CredencialesAlta> {
  return invocar({ accion: 'crear', ...datos })
}

export function resetearPassword(userId: string): Promise<CredencialesAlta> {
  return invocar({ accion: 'resetear_password', user_id: userId })
}

export async function cambiarRol(userId: string, rol: RolBackoffice): Promise<void> {
  const { error } = await supabase.rpc('cambiar_rol_backoffice', { p_user_id: userId, p_rol: rol })
  if (error) throw new Error(error.message)
}

export async function establecerEstado(userId: string, activo: boolean): Promise<void> {
  const { error } = await supabase.rpc('establecer_estado_backoffice', {
    p_user_id: userId,
    p_activo: activo,
  })
  if (error) throw new Error(error.message)
}

/** Borrado lógico (solo si el usuario ya está desactivado). Lo oculta de la lista. */
export async function eliminarUsuario(userId: string): Promise<void> {
  const { error } = await supabase.rpc('eliminar_usuario_backoffice', { p_user_id: userId })
  if (error) throw new Error(error.message)
}
