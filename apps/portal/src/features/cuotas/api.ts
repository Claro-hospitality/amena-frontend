import { supabase } from '@amena/supabase'
import type { Database, Json } from '@amena/supabase/types'
import { aISO, deISO, diasHabiles } from '@amena/utils'
import { obtenerMiEmpresaId } from '../../lib/empresaActual'

export type OrigenCuota = Database['public']['Enums']['origen_cuota']

/** Cuota activa de la semana, con el comensal al que pertenece. */
export interface CuotaSemana {
  id: number
  fecha: string
  origen: OrigenCuota
  colaborador: { id: number; nombre: string }
}

/** Consumo (comensal+fecha) para cruzar con las cuotas y para listar los consumos libres. */
export interface ConsumoSemana {
  comensal_id: number
  fecha: string
  colaborador: { id: number; nombre: string }
}

/** Un renglón de la reserva: un comensal y las fechas que tendrá comida. */
export interface ItemReserva {
  comensal_id: number
  fechas: string[]
}

/** Resumen que devuelve la RPC. */
export interface ResumenReserva {
  creadas: number
  reactivadas: number
  ya_existentes: number
}

function rangoSemana(lunesISO: string) {
  const dias = diasHabiles(deISO(lunesISO)).map(aISO)
  return { desde: dias[0], hasta: dias[dias.length - 1] }
}

/**
 * Cuotas activas [lun..vie] de la empresa del admin. Se acota por la empresa vía el join a la
 * identidad (`comensal.usuario.empresa_id`), con `!inner` para excluir cuotas de otras empresas
 * (no basta la RLS: una cuenta con rol de backoffice vería todas).
 */
export async function listarCuotasSemana(lunesISO: string): Promise<CuotaSemana[]> {
  const { desde, hasta } = rangoSemana(lunesISO)
  const empresaId = await obtenerMiEmpresaId()
  const { data, error } = await supabase
    .from('cuotas')
    .select(
      'id, fecha, origen, comensal:comensales!inner(id, usuario:usuarios_portal_empresarial!inner(nombre))'
    )
    .eq('comensal.usuario.empresa_id', empresaId)
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .eq('activo', true)
    .order('fecha')
  if (error) throw error
  return ((data ?? []) as FilaCuota[]).map((c) => ({
    id: c.id,
    fecha: c.fecha,
    origen: c.origen,
    colaborador: { id: c.comensal?.id ?? 0, nombre: c.comensal?.usuario?.nombre ?? '' },
  }))
}

interface FilaCuota {
  id: number
  fecha: string
  origen: OrigenCuota
  comensal: { id: number; usuario: { nombre: string } | null } | null
}

interface FilaConsumo {
  comensal_id: number
  fecha: string
  comensal: { id: number; usuario: { nombre: string } | null } | null
}

/**
 * Consumos [lun..vie] de la empresa del admin, acotados por `empresa_id` (no basta la RLS).
 * Incluye el nombre del comensal para poder listar los consumos LIBRES (sin cuota asociada).
 */
export async function listarConsumosSemana(lunesISO: string): Promise<ConsumoSemana[]> {
  const { desde, hasta } = rangoSemana(lunesISO)
  const empresaId = await obtenerMiEmpresaId()
  const { data, error } = await supabase
    .from('consumos')
    .select('comensal_id, fecha, comensal:comensales(id, usuario:usuarios_portal_empresarial(nombre))')
    .eq('empresa_id', empresaId)
    .gte('fecha', desde)
    .lte('fecha', hasta)
  if (error) throw error
  return ((data ?? []) as FilaConsumo[]).map((c) => ({
    comensal_id: c.comensal_id,
    fecha: c.fecha,
    colaborador: { id: c.comensal?.id ?? c.comensal_id, nombre: c.comensal?.usuario?.nombre ?? '' },
  }))
}

/**
 * Reserva cuotas vía la RPC atómica e idempotente `reservar_cuotas`.
 * `origen` = 'reserva' (viernes) o 'extra' (sobre la marcha).
 */
export async function reservarCuotas(
  empresaId: number,
  reserva: ItemReserva[],
  origen: OrigenCuota = 'reserva'
): Promise<ResumenReserva> {
  const { data, error } = await supabase.rpc('reservar_cuotas', {
    p_empresa_id: empresaId,
    p_reserva: reserva as unknown as Json,
    p_origen: origen,
  })
  if (error) throw error
  return data as unknown as ResumenReserva
}

/* ---------------- Invitados (consumo extra sin usuario, QR de un solo uso) ---------------- */

export type EstadoPase = Database['public']['Enums']['estado_pase_invitado']

/** Un pase de invitado de la semana (para reflejarlo en cuotas). */
export interface PaseSemana {
  id: number
  nombre: string
  apellido: string | null
  fecha: string
  estado: EstadoPase
}

/** Pases de invitado [lun..vie] de la empresa del admin (excluye cancelados). */
export async function listarPasesInvitadoSemana(lunesISO: string): Promise<PaseSemana[]> {
  const { desde, hasta } = rangoSemana(lunesISO)
  const empresaId = await obtenerMiEmpresaId()
  const { data, error } = await supabase
    .from('pases_invitado')
    .select('id, nombre, apellido, fecha, estado')
    .eq('empresa_id', empresaId)
    .neq('estado', 'cancelado')
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .order('fecha')
  if (error) throw error
  return (data ?? []) as PaseSemana[]
}

/** El pase recién creado (incluye el token para el QR). */
export interface PaseInvitadoCreado {
  id: number
  empresa_id: number
  nombre: string
  apellido: string | null
  fecha: string
  qr_token: string
}

/** Crea un invitado + su pase de un solo uso vía la RPC `crear_pase_invitado`. */
export async function crearPaseInvitado(v: {
  empresaId: number
  nombre: string
  apellido: string
  telefono: string
  correo: string
  fecha: string
}): Promise<PaseInvitadoCreado> {
  const { data, error } = await supabase.rpc('crear_pase_invitado', {
    p_empresa_id: v.empresaId,
    p_nombre: v.nombre,
    p_apellido: v.apellido,
    p_telefono: v.telefono,
    p_correo: v.correo,
    p_fecha: v.fecha,
  })
  if (error) throw error
  return (data as unknown as { pase: PaseInvitadoCreado }).pase
}
