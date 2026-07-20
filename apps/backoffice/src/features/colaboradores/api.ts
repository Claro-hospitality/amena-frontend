import { supabase } from '@amena/supabase'
import type { Database } from '@amena/supabase/types'

/** Colaborador con los datos de su empresa (join) para mostrarlos en el listado global. */
export type Colaborador = Database['public']['Tables']['colaboradores']['Row'] & {
  empresa: { nombre_comercial: string | null; razon_social: string } | null
}

/** Datos editables desde el formulario del backoffice. */
export interface DatosColaborador {
  empresa_id: string
  nombre: string
  email: string | null
}

const SELECT = '*, empresa:empresas(nombre_comercial, razon_social)'

/** Nombre a mostrar de la empresa (comercial, con respaldo a razón social). */
export function nombreEmpresa(colaborador: Colaborador): string {
  return colaborador.empresa?.nombre_comercial ?? colaborador.empresa?.razon_social ?? '—'
}

/**
 * Lista TODOS los colaboradores de todas las empresas, ordenados por nombre.
 * La RLS "colaboradores: super_admin todo" da acceso global; para otros roles
 * la UI ya restringe el acceso a esta sección.
 */
export async function listarColaboradores(): Promise<Colaborador[]> {
  const { data, error } = await supabase.from('colaboradores').select(SELECT).order('nombre')
  if (error) throw error
  return data as Colaborador[]
}

export async function crearColaborador(datos: DatosColaborador): Promise<Colaborador> {
  // id (contenido del QR) y user_id los deja la BD: id = gen_random_uuid(), user_id = null
  // (el login del colaborador es opcional; el QR funciona sin cuenta).
  const { data, error } = await supabase.from('colaboradores').insert(datos).select(SELECT).single()
  if (error) throw error
  return data as Colaborador
}
