import { deISO } from '@amena/utils'
import type { RolBackoffice } from '../../auth/validarAccesoPortal'
import type { Evento } from './api'

/**
 * Quién ve los módulos de eventos. `super_admin` entra a todo el backoffice; `eventos` es el
 * rol dedicado a este producto. Espeja a `eventos.es_admin()` en la base — pero la UI solo
 * oculta: la frontera real es RLS.
 */
export function puedeVerEventos(rol: RolBackoffice): boolean {
  return rol === 'super_admin' || rol === 'eventos'
}

export type FiltroEvento = 'Todos' | 'Publicados' | 'Borradores' | 'Pasados'

export const FILTROS_EVENTO: FiltroEvento[] = ['Todos', 'Publicados', 'Borradores', 'Pasados']

/** Lugares ocupados de un evento (el cupo disponible es lo que queda). */
export function ocupados(evento: Evento): number {
  return evento.cupo_total - evento.cupo_disponible
}

/**
 * Filtra por estado/fecha y busca por título. `hoy` se inyecta para poder testear el corte de
 * "Pasados" sin depender del reloj.
 */
export function filtrarEventos(
  eventos: Evento[],
  filtro: FiltroEvento,
  busqueda: string,
  hoy: Date = new Date()
): Evento[] {
  const q = busqueda.trim().toLowerCase()
  return eventos.filter((e) => {
    if (filtro === 'Publicados' && e.estado !== 'Publicado') return false
    if (filtro === 'Borradores' && e.estado !== 'Borrador') return false
    if (filtro === 'Pasados' && deISO(e.fecha) >= hoy) return false
    if (q && !e.titulo.toLowerCase().includes(q)) return false
    return true
  })
}
