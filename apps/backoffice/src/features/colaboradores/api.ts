import { supabase } from '@amena/supabase'

/**
 * Colaborador (comensal) aplanado para el listado global: la identidad (nombre,
 * email, empresa) vive en `usuarios_portal_empresarial`; `comensales` solo aporta
 * `id` y `activo`.
 */
export interface Colaborador {
  id: number
  activo: boolean
  nombre: string
  email: string | null
  empresa_id: number
  empresa: { nombre_comercial: string | null; razon_social: string | null } | null
}

export type RolPortal = 'admin' | 'colaborador'

/** Datos del formulario de alta (van a la edge function alta-usuario-portal). */
export interface DatosAlta {
  rol: RolPortal
  empresa_id: number
  nombre: string
  email: string
  telefono: string | null
}

/**
 * Resultado del alta. Si se creó una cuenta nueva, trae `tempPassword` (una sola vez).
 * Si el email ya tenía cuenta, `yaTeniaCuenta=true` y NO hay `tempPassword` (usa su
 * contraseña actual): solo se enlazó el rol.
 */
export interface CredencialesAlta {
  rol: RolPortal
  email: string
  yaTeniaCuenta: boolean
  tempPassword?: string
}

const SELECT =
  'id, activo, usuario:usuarios_portal_empresarial(nombre, email, empresa_id, empresa:empresas(nombre_comercial, razon_social))'

/** Nombre a mostrar de la empresa (comercial, con respaldo a razón social). */
export function nombreEmpresa(colaborador: Colaborador): string {
  return colaborador.empresa?.nombre_comercial ?? colaborador.empresa?.razon_social ?? '—'
}

/**
 * Lista los comensales de todas las empresas (RLS "super_admin todo"). La identidad
 * viene embebida de `usuarios_portal_empresarial`. Se aplana y se ordena por nombre en
 * cliente (PostgREST no ordena por columnas embebidas).
 */
export async function listarColaboradores(): Promise<Colaborador[]> {
  const { data, error } = await supabase.from('comensales').select(SELECT)
  if (error) throw error
  return (data ?? [])
    .map((c) => ({
      id: c.id,
      activo: c.activo,
      nombre: c.usuario?.nombre ?? '',
      email: c.usuario?.email ?? null,
      empresa_id: c.usuario?.empresa_id ?? 0,
      empresa: c.usuario?.empresa ?? null,
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
}

/**
 * Un usuario del portal de una empresa (admin y/o colaborador) para el listado
 * del detalle de empresa. `esColaborador` se deriva del rol o de tener comensal.
 */
export interface UsuarioEmpresa {
  id: number
  nombre: string
  email: string | null
  activo: boolean
  esAdmin: boolean
  esColaborador: boolean
}

/**
 * Lista TODOS los usuarios del portal de una empresa (admins + colaboradores) con
 * su rol. Filtra por `empresa_id` en `usuarios_portal_empresarial`; embebe sus
 * roles y si tiene comensal. RLS: super_admin ve todo; finanzas ve los usuarios y
 * comensales pero no los roles (por eso `esAdmin` puede quedar en false para finanzas).
 */
export async function listarUsuariosEmpresa(empresaId: number): Promise<UsuarioEmpresa[]> {
  const { data, error } = await supabase
    .from('usuarios_portal_empresarial')
    .select('id, nombre, email, activo, roles:roles_portal_empresarial(rol, activo), comensal:comensales(id)')
    .eq('empresa_id', empresaId)
    .order('nombre')
  if (error) throw error
  return (data ?? []).map((u) => {
    const roles = (u.roles ?? []).filter((r) => r.activo)
    return {
      id: u.id,
      nombre: u.nombre ?? '',
      email: u.email ?? null,
      activo: u.activo,
      esAdmin: roles.some((r) => r.rol === 'admin'),
      esColaborador: roles.some((r) => r.rol === 'colaborador') || u.comensal != null,
    }
  })
}

/**
 * Agrega o quita un rol (admin/colaborador) a un usuario del portal vía el RPC
 * `establecer_rol_portal`. colaborador ON crea/reactiva su comensal + QR; OFF hace
 * baja lógica del comensal (deja de consumir, historial intacto).
 */
export async function establecerRolPortal(
  usuarioId: number,
  rol: RolPortal,
  activo: boolean
): Promise<void> {
  const { error } = await supabase.rpc('establecer_rol_portal', {
    p_usuario_id: usuarioId,
    p_rol: rol,
    p_activo: activo,
  })
  if (error) throw error
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
