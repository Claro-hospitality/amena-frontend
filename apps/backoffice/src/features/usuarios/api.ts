import { supabase } from '@amena/supabase'
import { invocarFuncion } from '@amena/supabase/funciones'
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

/** Resultado del alta: la persona recibe la invitación por correo (sin contraseña). */
export interface ResultadoAltaUsuario {
  usuario_id: string
  creado: boolean
  correo_enviado: boolean
  correo_error?: string
}

/** invitacion = reenviar el enlace de primer acceso; restablecer = cambiar contraseña. */
export type MotivoAcceso = 'invitacion' | 'restablecer'

/** Resultado de reenviar/restablecer el acceso por correo. */
export interface ResultadoAcceso {
  correo_enviado: boolean
  correo_error?: string
}

export const ETIQUETA_ROL: Record<RolBackoffice, string> = {
  super_admin: 'Super administrador',
  finanzas: 'Finanzas',
  mesero: 'Mesero',
  consulta: 'Consulta',
  capitan_meseros: 'Capitán de meseros',
  eventos: 'Eventos',
}

/**
 * Orden en que se ofrecen los roles al dar de alta o cambiar de rol. Se deriva de
 * ETIQUETA_ROL — que a su vez es `Record<RolBackoffice, string>` — para que un rol nuevo
 * aparezca solo en los selects. Antes la lista estaba escrita a mano en dos diálogos y se
 * desincronizó al agregar `eventos`.
 */
export const ROLES_ASIGNABLES = Object.keys(ETIQUETA_ROL) as RolBackoffice[]

/** Lista los usuarios internos con su email (RPC SECURITY DEFINER, solo super_admin). */
export async function listarUsuarios(): Promise<UsuarioBackoffice[]> {
  const { data, error } = await supabase.rpc('listar_usuarios_backoffice')
  if (error) throw error
  return (data ?? []) as UsuarioBackoffice[]
}

// La invocación de Edge Functions (incluido el manejo del 401 por sesión inválida) vive en
// @amena/supabase/funciones — antes cada api.ts repetía su propio normalizador de errores.
const invocar = invocarFuncion

/** Crea el usuario interno y le envía la invitación por correo (no genera contraseña). */
export function crearUsuario(datos: {
  nombre: string
  email: string
  rol: RolBackoffice
}): Promise<ResultadoAltaUsuario> {
  return invocar<ResultadoAltaUsuario>('alta-usuario-backoffice', datos)
}

/** Reenvía la invitación o manda el correo de restablecimiento (vía restablecer-acceso). */
export function restablecerAcceso(email: string, motivo: MotivoAcceso): Promise<ResultadoAcceso> {
  return invocar<ResultadoAcceso>('restablecer-acceso', {
    email,
    plataforma: 'backoffice',
    motivo,
  })
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
