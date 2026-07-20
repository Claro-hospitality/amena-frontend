import { supabase } from '@amena/supabase'
import type { Database } from '@amena/supabase/types'

/** Colaborador con los datos de su empresa (join) para el listado global. */
export type Colaborador = Database['public']['Tables']['colaboradores']['Row'] & {
  empresa: { nombre_comercial: string | null; razon_social: string } | null
}

export type RolPortal = 'admin' | 'colaborador'

/** Datos del formulario de alta (van a la edge function alta-usuario-portal). */
export interface DatosAlta {
  rol: RolPortal
  empresa_id: string
  nombre: string
  email: string
  telefono: string | null
}

/** Credenciales devueltas UNA sola vez por el alta. */
export interface CredencialesAlta {
  rol: RolPortal
  email: string
  tempPassword: string
}

const SELECT = '*, empresa:empresas(nombre_comercial, razon_social)'

/** Nombre a mostrar de la empresa (comercial, con respaldo a razón social). */
export function nombreEmpresa(colaborador: Colaborador): string {
  return colaborador.empresa?.nombre_comercial ?? colaborador.empresa?.razon_social ?? '—'
}

/**
 * Lista los colaboradores de todas las empresas (RLS "colaboradores: super_admin todo").
 * Los admins de empresa viven en otra tabla y no aparecen aquí.
 */
export async function listarColaboradores(): Promise<Colaborador[]> {
  const { data, error } = await supabase.from('colaboradores').select(SELECT).order('nombre')
  if (error) throw error
  return data as Colaborador[]
}

/**
 * Da de alta un usuario del portal (admin o colaborador) vía la edge function
 * `alta-usuario-portal`: crea su cuenta con contraseña temporal y devuelve las
 * credenciales una sola vez. La creación real (auth + fila del rol) es del backend
 * (service role); el front solo invoca. Solo super_admin (lo valida la función).
 */
export async function altaUsuarioPortal(datos: DatosAlta): Promise<CredencialesAlta> {
  const { data, error } = await supabase.functions.invoke('alta-usuario-portal', { body: datos })
  if (error) {
    // FunctionsHttpError: el body {error} viene en error.context (el Response).
    let mensaje = 'No se pudo dar de alta al usuario. Intenta de nuevo.'
    const resp = (error as { context?: Response }).context
    if (resp && typeof resp.json === 'function') {
      try {
        const body = await resp.json()
        if (body?.error) mensaje = body.error
      } catch {
        /* sin cuerpo JSON: se conserva el mensaje genérico */
      }
    }
    throw new Error(mensaje)
  }
  return data as CredencialesAlta
}
