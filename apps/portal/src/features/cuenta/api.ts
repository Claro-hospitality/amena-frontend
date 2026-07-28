import { supabase } from '@amena/supabase'

/** Datos de perfil del usuario del portal (su propia fila). El email es de solo lectura. */
export interface MiPerfil {
  nombre: string
  email: string
  telefono: string | null
}

/** Lee mi perfil (nombre, email, teléfono) vía la RPC `mi_perfil_portal`. */
export async function obtenerMiPerfil(): Promise<MiPerfil> {
  const { data, error } = await supabase.rpc('mi_perfil_portal')
  if (error) throw error
  const p = (data ?? {}) as { nombre?: string; email?: string; telefono?: string | null }
  return { nombre: p.nombre ?? '', email: p.email ?? '', telefono: p.telefono ?? null }
}

/** Actualiza mi nombre y teléfono vía la RPC `actualizar_mi_perfil_portal` (el email no se toca). */
export async function actualizarMiPerfil(datos: {
  nombre: string
  telefono: string | null
}): Promise<void> {
  const { error } = await supabase.rpc('actualizar_mi_perfil_portal', {
    p_nombre: datos.nombre,
    p_telefono: datos.telefono ?? '',
  })
  if (error) throw new Error(error.message)
}
