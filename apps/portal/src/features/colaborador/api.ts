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
  platillo: { nombre: string; foto_url: string | null }
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

/** ¿Tengo cuota activa hoy? ¿Ya consumí? */
export async function estadoDeHoy(): Promise<EstadoHoy> {
  const hoy = aISO(new Date())
  const [cuotas, consumos] = await Promise.all([
    supabase.from('cuotas').select('fecha').eq('fecha', hoy).eq('activo', true).limit(1),
    supabase.from('consumos').select('created_at').eq('fecha', hoy).limit(1),
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
    .select('fecha, platillo:platillos(nombre, foto_url)')
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
    .select('fecha, platillo:platillos(nombre, foto_url)')
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .eq('activo', true)
    .order('fecha')
  if (error) throw error
  return (data ?? []) as unknown as PlatilloMenu[]
}

/** Mis cuotas activas de la semana (para el resumen del historial). */
export async function misCuotasSemana(lunesISO: string): Promise<MiCuota[]> {
  const { desde, hasta } = rangoSemana(lunesISO)
  const { data, error } = await supabase
    .from('cuotas')
    .select('fecha, origen, activo')
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .eq('activo', true)
    .order('fecha')
  if (error) throw error
  return (data ?? []) as MiCuota[]
}

/** Mis consumos recientes (orden inverso). */
export async function misConsumos(limite = 30): Promise<MiConsumo[]> {
  const { data, error } = await supabase
    .from('consumos')
    .select('fecha, created_at')
    .order('created_at', { ascending: false })
    .limit(limite)
  if (error) throw error
  return (data ?? []) as MiConsumo[]
}
