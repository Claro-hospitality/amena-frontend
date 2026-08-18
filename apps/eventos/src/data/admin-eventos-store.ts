import { supabase } from '../lib/supabase'
import { mapEventoRow, type Categoria, type EstadoEvento, type Evento } from './eventos'

export type AdminEventoInput = {
  slug: string
  categoria: Categoria
  titulo: string
  descripcionCorta: string
  descripcionLarga?: string[]
  incluye?: string[]
  fecha: string
  horaInicio: string
  horaFin?: string
  lugar: string
  precio: number
  cupoTotal: number
  cupoDisponible: number
  estado: EstadoEvento
  imagenUrl: string
}

export async function listAdminEventos(): Promise<Evento[]> {
  const { data, error } = await supabase.from('eventos').select('*').order('fecha', { ascending: true })
  if (error) throw error
  return data.map(mapEventoRow)
}

export async function getAdminEventoBySlug(slug: string): Promise<Evento | undefined> {
  const { data, error } = await supabase.from('eventos').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  return data ? mapEventoRow(data) : undefined
}

export async function upsertAdminEvento(input: AdminEventoInput, existingId?: string): Promise<Evento> {
  const row = {
    slug: input.slug,
    categoria: input.categoria,
    titulo: input.titulo,
    descripcion_corta: input.descripcionCorta,
    descripcion_larga: input.descripcionLarga ?? null,
    incluye: input.incluye ?? null,
    fecha: input.fecha,
    hora_inicio: input.horaInicio,
    hora_fin: input.horaFin ?? null,
    lugar: input.lugar,
    precio: input.precio,
    cupo_total: input.cupoTotal,
    cupo_disponible: input.cupoDisponible,
    estado: input.estado,
    imagen_url: input.imagenUrl,
  }

  const query = existingId
    ? supabase.from('eventos').update(row).eq('id', existingId)
    : supabase.from('eventos').insert(row)

  const { data, error } = await query.select().single()
  if (error) throw error
  return mapEventoRow(data)
}

const DIACRITICOS = new RegExp(
  '[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']',
  'g'
)

export function slugify(titulo: string) {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICOS, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
