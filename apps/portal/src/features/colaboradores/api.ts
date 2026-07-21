import { supabase } from '@amena/supabase'

/**
 * Colaborador (comensal) aplanado para el portal del admin. La identidad
 * (nombre/email/telefono/user_id) vive en `usuarios_portal_empresarial`; `comensales`
 * aporta `id` y `activo`; el QR es el `qr_token` de su credencial activa.
 */
export interface Colaborador {
  /** id del comensal (int8). */
  id: number
  /** id de usuarios_portal_empresarial (para editar su identidad). */
  usuario_id: number
  /** cuenta auth enlazada; null = aún sin acceso al portal. */
  user_id: string | null
  activo: boolean
  nombre: string
  email: string | null
  telefono: string | null
  /** contenido del QR (uuid). null si no tiene credencial activa. */
  qr_token: string | null
  empresa: { nombre: string | null } | null
}

/** Datos editables desde el formulario. */
export interface DatosColaborador {
  nombre: string
  email: string | null
}

export const SELECT_COMENSAL =
  'id, activo, usuario:usuarios_portal_empresarial(id, user_id, nombre, email, telefono, empresa:empresas(nombre:nombre_comercial)), credencial:credenciales_qr(qr_token, activo)'

export interface FilaComensal {
  id: number
  activo: boolean
  usuario: {
    id: number
    user_id: string
    nombre: string
    email: string | null
    telefono: string | null
    empresa: { nombre: string | null } | null
  } | null
  credencial: { qr_token: string; activo: boolean }[]
}

export function aplanarComensal(fila: FilaComensal): Colaborador {
  const credActiva = fila.credencial.find((c) => c.activo)
  return {
    id: fila.id,
    usuario_id: fila.usuario?.id ?? 0,
    user_id: fila.usuario?.user_id ?? null,
    activo: fila.activo,
    nombre: fila.usuario?.nombre ?? '',
    email: fila.usuario?.email ?? null,
    telefono: fila.usuario?.telefono ?? null,
    qr_token: credActiva?.qr_token ?? null,
    empresa: fila.usuario?.empresa ?? null,
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
 * Da de alta un colaborador vía la Edge Function `alta-usuario-portal`: crea su
 * identidad en `usuarios_portal_empresarial`, su fila en `comensales` y su credencial
 * QR. La creación real (service role) es del backend; el front solo invoca.
 */
export async function crearColaborador(
  datos: DatosColaborador & { empresa_id: number }
): Promise<void> {
  const { error } = await supabase.functions.invoke('alta-usuario-portal', {
    body: { ...datos, rol: 'colaborador' },
  })
  if (error) {
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
