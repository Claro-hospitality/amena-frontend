import { supabase } from '@amena/supabase'
import type { Database } from '@amena/supabase/types'

/**
 * Los eventos de amena.social viven en el schema `eventos`, no en `public` (que es el negocio
 * de planes de alimentación, y ya tiene su propia tabla `facturas`, distinta de la de acá).
 * `supabase.schema('eventos')` selecciona el schema por request; el cliente sigue siendo uno.
 */
const eventosDb = () => supabase.schema('eventos')

type EventoRow = Database['eventos']['Tables']['eventos']['Row']

// El generador tipa `categoria` y `estado` como `string`: en la base son CHECK constraints,
// no enums, así que no puede estrecharlos. Se declaran acá para que la UI no pueda mandar un
// valor que la base va a rechazar. Si algún día pasan a ser enums, esto sale sobrando.
export type Categoria = 'Cata' | 'Taller' | 'Cena'
export type EstadoEvento = 'Publicado' | 'Borrador'

export const CATEGORIAS: Categoria[] = ['Cata', 'Taller', 'Cena']

export type Evento = Omit<EventoRow, 'categoria' | 'estado'> & {
  categoria: Categoria
  estado: EstadoEvento
}

/** Payload del formulario. Separado del Row: no lleva `id` ni `created_at`. */
export interface DatosEvento {
  slug: string
  categoria: Categoria
  titulo: string
  descripcion_corta: string
  descripcion_larga: string[] | null
  incluye: string[] | null
  fecha: string
  hora_inicio: string
  hora_fin: string | null
  lugar: string
  precio: number
  cupo_total: number
  cupo_disponible: number
  estado: EstadoEvento
  imagen_url: string
}

export async function listarEventos(): Promise<Evento[]> {
  const { data, error } = await eventosDb()
    .from('eventos')
    .select('*')
    .order('fecha', { ascending: true })
  if (error) throw error
  return data as Evento[]
}

export async function obtenerEventoPorSlug(slug: string): Promise<Evento | null> {
  const { data, error } = await eventosDb()
    .from('eventos')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return (data as Evento) ?? null
}

/**
 * Alta y edición. La distinción es el argumento `id`, no el contenido de `datos`: un alta con
 * todos los campos llenos sigue siendo un alta.
 */
export async function guardarEvento(datos: DatosEvento, id?: string): Promise<Evento> {
  const query = id
    ? eventosDb().from('eventos').update(datos).eq('id', id)
    : eventosDb().from('eventos').insert(datos)
  const { data, error } = await query.select().single()
  if (error) throw error
  return data as Evento
}

/** Marcas diacríticas que deja `normalize('NFD')` al separar los acentos de la letra base. */
const DIACRITICOS = /[\u0300-\u036f]/gu

/** "Cata de vinos mexicanos" → "cata-de-vinos-mexicanos". */
export function slugify(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICOS, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export interface ReservacionReciente {
  folio: string
  nombre: string
  personas: number
  monto: number
  estadoPago: string
  eventoTitulo: string
}

export interface ResumenEventos {
  eventosProximos: number
  reservacionesActivas: number
  reservacionesSemana: number
  ingresosMes: number
  boletosValidados: number
  boletosTotales: number
  recientes: ReservacionReciente[]
}

/**
 * RPC SECURITY DEFINER que ya devuelve las llaves en camelCase (viene del proyecto original) y
 * lleva guarda de admin adentro: a quien no lo sea le responde `NO_AUTORIZADO`.
 */
export async function obtenerResumen(): Promise<ResumenEventos> {
  const { data, error } = await eventosDb().rpc('dashboard_stats')
  if (error) throw error
  return data as unknown as ResumenEventos
}
