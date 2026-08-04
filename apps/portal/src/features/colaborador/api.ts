import { supabase } from '@amena/supabase'
import { aISO, deISO, diasHabiles } from '@amena/utils'
import {
  aplanarComensal,
  type Colaborador,
  type FilaComensal,
} from '../colaboradores/api'

export type { Colaborador }

/** Un platillo del menú de un día. */
export interface PlatilloMenu {
  fecha: string
  platillo: { nombre: string; foto_url: string | null; descripcion?: string | null }
}

/** Estado de la comida de hoy del colaborador. */
export interface EstadoHoy {
  tieneCuota: boolean
  consumo: { created_at: string } | null
}

/** Cuota/consumo del colaborador para el historial. */
export interface MiCuota {
  fecha: string
  origen: string
  activo: boolean
}
export interface MiConsumo {
  fecha: string
  created_at: string
}

function rangoSemana(lunesISO: string) {
  const dias = diasHabiles(deISO(lunesISO)).map(aISO)
  return { desde: dias[0], hasta: dias[dias.length - 1] }
}

/** Primer y último día del mes de `mesISO` (cualquier día del mes sirve). */
function rangoMes(mesISO: string) {
  const d = deISO(mesISO)
  const desde = new Date(d.getFullYear(), d.getMonth(), 1)
  const hasta = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return { desde: aISO(desde), hasta: aISO(hasta) }
}

/**
 * Ids de los comensales del usuario logueado (RPC SECURITY DEFINER). Acota las consultas del
 * historial a SUS propios consumos/cuotas: la RLS permisiva deja a un admin ver los de toda
 * su empresa, así que hay que filtrar explícitamente por comensal (ver memoria del portal).
 */
async function misComensalesIds(): Promise<number[]> {
  const { data, error } = await supabase.rpc('mis_comensales')
  if (error) throw error
  return (data ?? []) as number[]
}

// Igual que SELECT_COMENSAL pero con INNER join a la identidad, para poder filtrar el
// comensal por el user_id del usuario logueado (mi propia credencial). Es un literal (no un
// .replace() en runtime) para que supabase-js infiera bien el tipo del resultado.
const SELECT_MI_COMENSAL =
  'id, activo, consumo_libre, usuario:usuarios_portal_empresarial!inner(id, user_id, nombre, email, telefono, empresa:empresas(nombre:nombre_comercial, modo_consumo, dias_permitidos, limite_diario)), credencial:credenciales_qr(qr_token, activo)'

/**
 * Mi propio comensal, filtrado por el user_id del usuario logueado. NO basta con la RLS +
 * `.limit(1)`: un admin ve TODOS los comensales de su empresa ("admin CRUD de su empresa"),
 * así que sin filtrar tomaría el primero de la empresa (no el suyo). Devuelve null si el
 * usuario no tiene comensal (p. ej. admin que no come) → la UI muestra "No tienes credencial".
 */
export async function obtenerMiColaborador(): Promise<Colaborador | null> {
  const { data: auth, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError
  const userId = auth.user?.id
  if (!userId) return null

  const { data, error } = await supabase
    .from('comensales')
    .select(SELECT_MI_COMENSAL)
    .eq('usuario.user_id', userId)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data ? aplanarComensal(data as FilaComensal) : null
}

/**
 * ¿Tengo cuota activa hoy? ¿Ya consumí? Acotado a MIS comensales: la RLS permisiva deja a un
 * admin ver los consumos/cuotas de toda su empresa (y filas de otras empresas en cuentas con
 * doble rol), así que sin filtrar por `comensal_id` el `.limit(1)` tomaría el consumo de otra
 * persona → "Ya comiste hoy" falso. Hay que filtrar explícitamente (ver memoria del portal).
 */
export async function estadoDeHoy(): Promise<EstadoHoy> {
  const hoy = aISO(new Date())
  const ids = await misComensalesIds()
  if (ids.length === 0) return { tieneCuota: false, consumo: null }
  const [cuotas, consumos] = await Promise.all([
    supabase.from('cuotas').select('fecha').in('comensal_id', ids).eq('fecha', hoy).eq('activo', true).limit(1),
    supabase.from('consumos').select('created_at').in('comensal_id', ids).eq('fecha', hoy).limit(1),
  ])
  if (cuotas.error) throw cuotas.error
  if (consumos.error) throw consumos.error
  return {
    tieneCuota: (cuotas.data?.length ?? 0) > 0,
    consumo: consumos.data?.[0] ?? null,
  }
}

/** Platillos del menú de una fecha. */
export async function menuDelDia(fechaISO: string): Promise<PlatilloMenu[]> {
  const { data, error } = await supabase
    .from('menu_dias')
    .select('fecha, platillo:platillos(nombre, foto_url, descripcion)')
    .eq('fecha', fechaISO)
    .eq('activo', true)
  if (error) throw error
  return (data ?? []) as unknown as PlatilloMenu[]
}

/** Platillos del menú de la semana (lun-vie). */
export async function menuSemana(lunesISO: string): Promise<PlatilloMenu[]> {
  const { desde, hasta } = rangoSemana(lunesISO)
  const { data, error } = await supabase
    .from('menu_dias')
    .select('fecha, platillo:platillos(nombre, foto_url, descripcion)')
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .eq('activo', true)
    .order('fecha')
  if (error) throw error
  return (data ?? []) as unknown as PlatilloMenu[]
}

/** Mis cuotas activas de la semana (para el resumen del historial). Acotadas a mis comensales. */
export async function misCuotasSemana(lunesISO: string): Promise<MiCuota[]> {
  const { desde, hasta } = rangoSemana(lunesISO)
  const ids = await misComensalesIds()
  if (ids.length === 0) return []
  const { data, error } = await supabase
    .from('cuotas')
    .select('fecha, origen, activo')
    .in('comensal_id', ids)
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .eq('activo', true)
    .order('fecha')
  if (error) throw error
  return (data ?? []) as MiCuota[]
}

/** Mis consumos recientes (orden inverso). Acotados a mis comensales. */
export async function misConsumos(limite = 30): Promise<MiConsumo[]> {
  const ids = await misComensalesIds()
  if (ids.length === 0) return []
  const { data, error } = await supabase
    .from('consumos')
    .select('fecha, created_at')
    .in('comensal_id', ids)
    .order('created_at', { ascending: false })
    .limit(limite)
  if (error) throw error
  return (data ?? []) as MiConsumo[]
}

/**
 * Mis consumos del mes de `mesISO` (fecha + hora). Para el calendario del historial: marca los
 * días con consumo y, al tocarlos/hover, muestra la hora. Acotado a mis comensales.
 */
export async function misConsumosDelMes(mesISO: string): Promise<MiConsumo[]> {
  const ids = await misComensalesIds()
  if (ids.length === 0) return []
  const { desde, hasta } = rangoMes(mesISO)
  const { data, error } = await supabase
    .from('consumos')
    .select('fecha, created_at')
    .in('comensal_id', ids)
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .order('created_at')
  if (error) throw error
  return (data ?? []) as MiConsumo[]
}
