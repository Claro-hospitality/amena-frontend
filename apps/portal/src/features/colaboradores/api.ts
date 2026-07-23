import { supabase } from '@amena/supabase'
import type { Database } from '@amena/supabase/types'

export type ModoConsumo = Database['public']['Enums']['modo_consumo']

/** Política de consumo de la empresa (solo lectura en el portal). */
export interface PoliticaEmpresa {
  modo_consumo: ModoConsumo
  dias_permitidos: number[]
  limite_diario: number | null
}

/**
 * Colaborador (comensal) aplanado para el portal del admin. La identidad
 * (nombre/email/telefono/user_id) vive en `usuarios_portal_empresarial`; `comensales`
 * aporta `id`, `activo` y `consumo_libre`; el QR es el `qr_token` de su credencial activa.
 */
export interface Colaborador {
  /** id del comensal (int8). */
  id: number
  /** id de usuarios_portal_empresarial (para editar su identidad y el consumo libre). */
  usuario_id: number
  /** cuenta auth enlazada; null = aún sin acceso al portal. */
  user_id: string | null
  activo: boolean
  /** Consumo libre activado para este comensal (solo aplica si la empresa está en modo libre). */
  consumoLibre: boolean
  nombre: string
  email: string | null
  telefono: string | null
  /** contenido del QR (uuid). null si no tiene credencial activa. */
  qr_token: string | null
  empresa: { nombre: string | null } | null
  /** Política de consumo de la empresa del colaborador (solo lectura). */
  politica: PoliticaEmpresa | null
}

/** Datos editables desde el formulario. */
export interface DatosColaborador {
  nombre: string
  email: string | null
}

/** Rol con el que se da de alta una persona del portal. */
export type RolAlta = 'admin' | 'colaborador'

/**
 * Credenciales de acceso resultado del alta (las devuelve `alta-usuario-portal`). Si se creó
 * una cuenta nueva trae `tempPassword` (se muestra UNA sola vez); si el email ya tenía cuenta,
 * `yaTeniaCuenta=true` sin `tempPassword` (usa su contraseña actual).
 */
export interface CredencialesAlta {
  email: string
  yaTeniaCuenta: boolean
  tempPassword?: string
}

/** ¿La empresa del colaborador está en modo de consumo libre? */
export function empresaEnModoLibre(colaborador: Colaborador): boolean {
  return colaborador.politica?.modo_consumo === 'libre'
}

export const SELECT_COMENSAL =
  'id, activo, consumo_libre, usuario:usuarios_portal_empresarial(id, user_id, nombre, email, telefono, empresa:empresas(nombre:nombre_comercial, modo_consumo, dias_permitidos, limite_diario)), credencial:credenciales_qr(qr_token, activo)'

export interface FilaComensal {
  id: number
  activo: boolean
  consumo_libre: boolean
  usuario: {
    id: number
    user_id: string
    nombre: string
    email: string | null
    telefono: string | null
    empresa: {
      nombre: string | null
      modo_consumo: ModoConsumo
      dias_permitidos: number[]
      limite_diario: number | null
    } | null
  } | null
  credencial: { qr_token: string; activo: boolean }[]
}

export function aplanarComensal(fila: FilaComensal): Colaborador {
  const credActiva = fila.credencial.find((c) => c.activo)
  const emp = fila.usuario?.empresa ?? null
  return {
    id: fila.id,
    usuario_id: fila.usuario?.id ?? 0,
    user_id: fila.usuario?.user_id ?? null,
    activo: fila.activo,
    consumoLibre: fila.consumo_libre,
    nombre: fila.usuario?.nombre ?? '',
    email: fila.usuario?.email ?? null,
    telefono: fila.usuario?.telefono ?? null,
    qr_token: credActiva?.qr_token ?? null,
    empresa: emp ? { nombre: emp.nombre } : null,
    politica: emp
      ? {
          modo_consumo: emp.modo_consumo,
          dias_permitidos: emp.dias_permitidos,
          limite_diario: emp.limite_diario,
        }
      : null,
  }
}

/**
 * Colaboradores de la empresa del admin. La RLS ("admin CRUD de su empresa") ya filtra
 * por empresa_id ∈ mis_empresas_admin(). PostgREST no ordena por columnas embebidas →
 * se ordena por nombre en cliente.
 */
export async function listarColaboradores(): Promise<Colaborador[]> {
  const { data, error } = await supabase.from('comensales').select(SELECT_COMENSAL)
  if (error) throw error
  return ((data ?? []) as FilaComensal[])
    .map(aplanarComensal)
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
}

/** ID (int8) de la empresa que administra el usuario (para el alta de colaboradores). */
export async function obtenerMiEmpresaId(): Promise<number> {
  const { data, error } = await supabase.rpc('mis_empresas_admin')
  if (error) throw error
  const id = data?.[0]
  if (id == null) throw new Error('El usuario no administra ninguna empresa')
  return id
}

/**
 * Da de alta una persona del portal (colaborador o admin) vía la Edge Function
 * `alta-usuario-portal`: crea su identidad en `usuarios_portal_empresarial` y su rol; si es
 * colaborador el trigger crea además su comensal + credencial QR. La creación real (service
 * role) es del backend; el front solo invoca. El backend valida que un admin de empresa solo
 * pueda crear en SU empresa. Devuelve las credenciales de acceso (contraseña temporal).
 */
export async function crearColaborador(
  datos: DatosColaborador & { empresa_id: number; rol: RolAlta }
): Promise<CredencialesAlta> {
  const { data, error } = await supabase.functions.invoke('alta-usuario-portal', {
    body: datos,
  })
  if (error) {
    // FunctionsHttpError (p. ej. 403): el body {error} viene en error.context (el Response).
    let mensaje = 'No se pudo dar de alta al colaborador. Intenta de nuevo.'
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

/** Actualiza nombre/email del colaborador (viven en usuarios_portal_empresarial). */
export async function actualizarColaborador(
  usuarioId: number,
  datos: DatosColaborador
): Promise<void> {
  const { error } = await supabase
    .from('usuarios_portal_empresarial')
    .update(datos)
    .eq('id', usuarioId)
  if (error) throw error
}

/** Baja/alta lógica del comensal — nunca delete (conserva historial de consumos). */
export async function cambiarEstadoColaborador(id: number, activo: boolean): Promise<void> {
  const { error } = await supabase.from('comensales').update({ activo }).eq('id', id)
  if (error) throw error
}

/**
 * Activa/desactiva el consumo libre de un comensal vía el RPC `establecer_consumo_libre`.
 * OJO: `p_usuario_id` es el id de `usuarios_portal_empresarial` (NO el id de comensal).
 * El backend valida que la empresa esté en modo libre.
 */
export async function establecerConsumoLibre(usuarioId: number, activo: boolean): Promise<void> {
  const { error } = await supabase.rpc('establecer_consumo_libre', {
    p_usuario_id: usuarioId,
    p_activo: activo,
  })
  if (error) throw error
}

/**
 * Restablece la contraseña de un colaborador vía la Edge Function `resetear-password-portal`:
 * genera una temporal (se muestra UNA sola vez) y exige el cambio al próximo login. El backend
 * valida que el admin solo pueda hacerlo sobre usuarios de SU empresa. `usuarioId` es el id de
 * `usuarios_portal_empresarial` (colaborador.usuario_id).
 */
export async function resetearPasswordColaborador(usuarioId: number): Promise<CredencialesAlta> {
  const { data, error } = await supabase.functions.invoke('resetear-password-portal', {
    body: { usuario_id: usuarioId },
  })
  if (error) {
    let mensaje = 'No se pudo restablecer la contraseña. Intenta de nuevo.'
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
