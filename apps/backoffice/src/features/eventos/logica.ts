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
 * Condición que le toca a cada chip del catálogo cuando el filtrado se hace en la base.
 *
 * `hoyISO` se inyecta (en vez de leer el reloj aquí) para poder testear el corte de "Pasados",
 * igual que hacía el filtrado en memoria que esto reemplaza.
 */
export type CondicionEvento =
  | { columna: 'estado'; operador: 'eq'; valor: string }
  | { columna: 'fecha'; operador: 'lt'; valor: string }
  | null

export function condicionFiltroEvento(filtro: FiltroEvento, hoyISO: string): CondicionEvento {
  switch (filtro) {
    case 'Publicados':
      return { columna: 'estado', operador: 'eq', valor: 'Publicado' }
    case 'Borradores':
      return { columna: 'estado', operador: 'eq', valor: 'Borrador' }
    case 'Pasados':
      return { columna: 'fecha', operador: 'lt', valor: hoyISO }
    case 'Todos':
      return null
  }
}
