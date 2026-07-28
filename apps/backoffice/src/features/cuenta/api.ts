import { supabase } from '@amena/supabase'
import type { RolBackoffice } from '../../auth/validarAccesoPortal'

/** Perfil del usuario interno actual (nombre + rol), del RPC `mi_perfil_backoffice`. */
export interface MiPerfil {
  nombre: string
  rol: RolBackoffice
}

/**
 * Perfil del usuario autenticado (nombre y rol) vía el RPC SECURITY DEFINER
 * `mi_perfil_backoffice` (resuelve con auth.uid(), saltándose RLS). El correo se toma de
 * la sesión de auth, no de aquí.
 */
export async function obtenerMiPerfil(): Promise<MiPerfil> {
  const { data, error } = await supabase.rpc('mi_perfil_backoffice')
  if (error || !data) throw error ?? new Error('No se pudo cargar tu perfil.')
  const perfil = data as unknown as { nombre: string; rol: RolBackoffice }
  return { nombre: perfil.nombre, rol: perfil.rol }
}

/** Actualiza mi propio nombre vía la RPC `actualizar_mi_perfil_backoffice`. */
export async function actualizarMiNombre(nombre: string): Promise<void> {
  const { error } = await supabase.rpc('actualizar_mi_perfil_backoffice', { p_nombre: nombre })
  if (error) throw new Error(error.message)
}

/**
 * Cambia la contraseña del usuario actual (Supabase Auth) y limpia el flag
 * `debe_cambiar_password` del backoffice. Si se pasa `actual`, primero se verifica
 * re-autenticando (Supabase no valida la contraseña previa en updateUser).
 */
export async function cambiarMiPassword({
  nueva,
  actual,
}: {
  nueva: string
  actual?: string
}): Promise<void> {
  if (actual !== undefined) {
    const { data } = await supabase.auth.getUser()
    const email = data.user?.email
    if (!email) throw new Error('No hay una sesión activa.')
    const { error } = await supabase.auth.signInWithPassword({ email, password: actual })
    if (error) throw new Error('La contraseña actual no es correcta.')
  }
  const { error } = await supabase.auth.updateUser({ password: nueva })
  if (error) throw error
  // Limpia el flag (no-op si el usuario no lo tenía). RPC SECURITY DEFINER.
  await supabase.rpc('confirmar_cambio_password_backoffice')
}
