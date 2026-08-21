import { supabase } from '@amena/supabase'
import type { Database } from '@amena/supabase/types'
import { orIlike } from '@amena/utils'
import { estadoDelFiltro, type FiltroReservacion } from './logica'

/** Las reservaciones viven en el schema `eventos` (ver features/eventos/api.ts). */
const eventosDb = () => supabase.schema('eventos')

type ReservacionRow = Database['eventos']['Tables']['reservaciones']['Row']

// `estado_pago` y `estado_boleto` son CHECK constraints en la base, no enums, así que el
// generador los tipa como `string`. Se estrechan acá para que los badges y filtros no puedan
// referirse a un estado que no existe.
export type EstadoPago = 'pagada' | 'pendiente' | 'cancelada'
export type EstadoBoleto = 'validado' | 'sin usar' | 'cancelado'

/** Datos del evento que viajan embebidos en el join; pueden faltar si el join no resuelve. */
export interface EventoDeReservacion {
  slug: string
  titulo: string
  fecha: string
  hora_inicio: string
}

export type Reservacion = Omit<ReservacionRow, 'estado_pago' | 'estado_boleto'> & {
  estado_pago: EstadoPago
  estado_boleto: EstadoBoleto
  eventos: EventoDeReservacion | null
}

const SELECT_CON_EVENTO = '*, eventos(slug, titulo, fecha, hora_inicio)'

/** Filtros de la pantalla: el chip de estado de pago y el buscador. */
export interface FiltrosReservaciones {
  filtro: FiltroReservacion
  busqueda: string
}

export interface PaginaReservaciones {
  filas: Reservacion[]
  /** Filas que casan con el filtro, no las de esta página. */
  total: number
}

/** Filas por página; espeja el default del DataTable de @amena/ui. */
export const TAMANO_PAGINA = 10

/**
 * Página del listado. Filtro, búsqueda y orden se resuelven en la base: filtrar aquí solo
 * alcanzaría a las filas de la página visible, que es peor que no paginar.
 *
 * La búsqueda va por `or` de tres columnas con el término escapado (ver `orIlike`): el folio y
 * los nombres traen comas y guiones que romperían la condición si viajaran en crudo.
 */
export async function listarReservacionesPagina(
  { filtro, busqueda }: FiltrosReservaciones,
  page = 0,
  pageSize = TAMANO_PAGINA
): Promise<PaginaReservaciones> {
  let consulta = eventosDb()
    .from('reservaciones')
    .select(SELECT_CON_EVENTO, { count: 'exact' })

  const estado = estadoDelFiltro(filtro)
  if (estado) consulta = consulta.eq('estado_pago', estado)

  const termino = busqueda.trim()
  if (termino) consulta = consulta.or(orIlike(['nombre', 'email', 'folio'], termino))

  const desde = page * pageSize
  const { data, error, count } = await consulta
    .order('reservada_el', { ascending: false })
    .range(desde, desde + pageSize - 1)
  if (error) throw error
  return { filas: (data ?? []) as unknown as Reservacion[], total: count ?? 0 }
}

/** Reservaciones no canceladas, para el encabezado. */
export async function contarReservacionesActivas(): Promise<number> {
  const { count, error } = await eventosDb()
    .from('reservaciones')
    .select('*', { count: 'exact', head: true })
    .neq('estado_pago', 'cancelada')
  if (error) throw error
  return count ?? 0
}

/**
 * Boletos ya validados de un evento, para el contador del escáner. Antes se contaba filtrando
 * en memoria el arreglo con TODAS las reservaciones; con el listado paginado ese arreglo ya no
 * existe (y con más de 1000 filas nunca fue confiable).
 */
export async function contarBoletosValidados(eventoId: string): Promise<number> {
  const { count, error } = await eventosDb()
    .from('reservaciones')
    .select('*', { count: 'exact', head: true })
    .eq('evento_id', eventoId)
    .eq('estado_boleto', 'validado')
  if (error) throw error
  return count ?? 0
}

/** `ilike` sin comodines = match exacto pero insensible a mayúsculas (el folio se teclea a mano). */
export async function obtenerReservacionPorFolio(folio: string): Promise<Reservacion | null> {
  const { data, error } = await eventosDb()
    .from('reservaciones')
    .select(SELECT_CON_EVENTO)
    .ilike('folio', folio.trim())
    .maybeSingle()
  if (error) throw error
  return (data as unknown as Reservacion) ?? null
}

export type ResultadoValidacion =
  | { tipo: 'validado'; reservacion: Reservacion }
  | { tipo: 'ya-usado'; reservacion: Reservacion }
  | { tipo: 'no-encontrado' }

/**
 * Marca el boleto como usado. Es LA operación crítica del producto: si el mismo boleto se
 * escanea dos veces (dos meseros en la puerta, o un doble toque), solo la primera debe pasar.
 *
 * Por eso el update va condicionado con `.neq('estado_boleto', 'validado')`: si dos escaneos
 * compiten, la base deja pasar uno solo y al otro le devuelve cero filas → `ya-usado`. NO
 * simplificar a un update directo; el chequeo previo en JS es una cortesía para el mensaje,
 * no la garantía.
 */
export async function validarBoleto(folio: string): Promise<ResultadoValidacion> {
  const actual = await obtenerReservacionPorFolio(folio)
  if (!actual) return { tipo: 'no-encontrado' }
  if (actual.estado_boleto === 'validado') return { tipo: 'ya-usado', reservacion: actual }

  const { data, error } = await eventosDb()
    .from('reservaciones')
    .update({ estado_boleto: 'validado', validada_el: new Date().toISOString() })
    .eq('folio', actual.folio)
    .neq('estado_boleto', 'validado')
    .select(SELECT_CON_EVENTO)
    .maybeSingle()
  if (error) throw error

  if (!data) {
    // Otro escaneo ganó la carrera entre el select y el update.
    const revalidado = await obtenerReservacionPorFolio(folio)
    return { tipo: 'ya-usado', reservacion: revalidado ?? actual }
  }
  return { tipo: 'validado', reservacion: data as unknown as Reservacion }
}
