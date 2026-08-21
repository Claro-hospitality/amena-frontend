import { supabase } from '@amena/supabase'
import type { Database } from '@amena/supabase/types'
import { aISO, patronIlike } from '@amena/utils'
import { BUCKET_IMAGENES, rutaDesdeUrlPublica } from './imagenEvento'
import { condicionFiltroEvento, type FiltroEvento } from './logica'

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

/** Filas por página; espeja el default del DataTable de @amena/ui. */
export const TAMANO_PAGINA = 10

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

/** Filtros del catálogo, los mismos chips y buscador de la pantalla. */
export interface FiltrosEventos {
  filtro: FiltroEvento
  busqueda: string
}

/** Una página del catálogo y el total que casa con el filtro (no el de la página). */
export interface PaginaEventos {
  filas: Evento[]
  total: number
}

/**
 * Página del catálogo. El filtro, la búsqueda y el orden se resuelven en la base: si se hicieran
 * aquí, filtrarían solo las filas de la página visible.
 */
export async function listarEventosPagina(
  { filtro, busqueda }: FiltrosEventos,
  page = 0,
  pageSize = TAMANO_PAGINA
): Promise<PaginaEventos> {
  let consulta = eventosDb().from('eventos').select('*', { count: 'exact' })

  const condicion = condicionFiltroEvento(filtro, aISO(new Date()))
  if (condicion?.operador === 'eq') consulta = consulta.eq(condicion.columna, condicion.valor)
  if (condicion?.operador === 'lt') consulta = consulta.lt(condicion.columna, condicion.valor)

  const termino = busqueda.trim()
  if (termino) consulta = consulta.ilike('titulo', patronIlike(termino))

  const desde = page * pageSize
  const { data, error, count } = await consulta
    .order('fecha', { ascending: true })
    .range(desde, desde + pageSize - 1)
  if (error) throw error
  return { filas: (data ?? []) as Evento[], total: count ?? 0 }
}

/**
 * Publicados y borradores para el encabezado. Van como conteos y no contando el arreglo de la
 * página, que solo tiene las filas visibles.
 */
export async function contarEventosPorEstado(): Promise<{
  publicados: number
  borradores: number
}> {
  const contar = async (estado: EstadoEvento) => {
    const { count, error } = await eventosDb()
      .from('eventos')
      .select('*', { count: 'exact', head: true })
      .eq('estado', estado)
    if (error) throw error
    return count ?? 0
  }
  const [publicados, borradores] = await Promise.all([contar('Publicado'), contar('Borrador')])
  return { publicados, borradores }
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

/**
 * Sube la imagen destacada al bucket público `eventos` y devuelve su URL pública, que es lo que
 * se guarda en `imagen_url` y lo que pinta la landing.
 *
 * Storage NO se selecciona por schema: `supabase.storage` es su propia API. El `.schema('eventos')`
 * de arriba es solo para PostgREST. Quien puede escribir aquí lo decide la policy del bucket
 * (`eventos.es_admin()`), no esta función.
 */
export async function subirImagenEvento(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const ruta = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage
    .from(BUCKET_IMAGENES)
    .upload(ruta, file, { contentType: file.type })
  if (error) throw error
  return supabase.storage.from(BUCKET_IMAGENES).getPublicUrl(ruta).data.publicUrl
}

/**
 * Borra una imagen del bucket al ser reemplazada. Best effort a propósito: si falla, el guardado
 * del evento NO se cae — un archivo huérfano molesta menos que perder la edición. Las URLs que no
 * son del bucket (las de los eventos que ya existían) se ignoran.
 */
export async function borrarImagenEvento(url: string | null | undefined): Promise<void> {
  const ruta = rutaDesdeUrlPublica(url)
  if (!ruta) return
  await supabase.storage.from(BUCKET_IMAGENES).remove([ruta])
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
