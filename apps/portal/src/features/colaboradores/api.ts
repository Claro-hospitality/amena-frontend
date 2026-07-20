import { supabase } from '@amena/supabase'
import type { Database } from '@amena/supabase/types'

/** Colaborador con el nombre de su empresa (join) para la credencial. */
export type Colaborador = Database['public']['Tables']['colaboradores']['Row'] & {
  empresa: { nombre: string } | null
}

/** Datos editables desde el formulario. */
export interface DatosColaborador {
  nombre: string
  email: string | null
}

const SELECT = '*, empresa:empresas(nombre:nombre_comercial)'

/**
 * Colaboradores de la empresa del admin. La RLS ("admin CRUD de su empresa") ya filtra
 * por empresa_id ∈ mis_empresas_admin(), así que NO se filtra empresa manualmente.
 */
export async function listarColaboradores(): Promise<Colaborador[]> {
  const { data, error } = await supabase.from('colaboradores').select(SELECT).order('nombre')
  if (error) throw error
  return data as Colaborador[]
}

/** ID de la empresa que administra el usuario (para el alta de colaboradores). */
export async function obtenerMiEmpresaId(): Promise<string> {
  const { data, error } = await supabase.rpc('mis_empresas_admin')
  if (error) throw error
  const id = data?.[0]
  if (!id) throw new Error('El usuario no administra ninguna empresa')
  return id
}

export async function crearColaborador(
  datos: DatosColaborador & { empresa_id: string }
): Promise<Colaborador> {
  // El id (contenido del QR) y user_id se dejan a la BD: id = gen_random_uuid(), user_id = null.
  const { data, error } = await supabase.from('colaboradores').insert(datos).select(SELECT).single()
  if (error) throw error
  return data as Colaborador
}

export async function actualizarColaborador(
  id: string,
  datos: DatosColaborador
): Promise<Colaborador> {
  const { data, error } = await supabase
    .from('colaboradores')
    .update(datos)
    .eq('id', id)
    .select(SELECT)
    .single()
  if (error) throw error
  return data as Colaborador
}

/** Baja/alta lógica — nunca delete (conserva historial de consumos). */
export async function cambiarEstadoColaborador(id: string, activo: boolean): Promise<Colaborador> {
  const { data, error } = await supabase
    .from('colaboradores')
    .update({ activo })
    .eq('id', id)
    .select(SELECT)
    .single()
  if (error) throw error
  return data as Colaborador
}
