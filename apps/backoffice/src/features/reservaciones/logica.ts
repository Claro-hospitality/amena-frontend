import type { EstadoPago } from './api'

/** Iniciales para el avatar, a partir de las dos primeras palabras del nombre. */
export function iniciales(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('')
}

export type FiltroReservacion = 'Todas' | 'Pagadas' | 'Pendientes' | 'Canceladas'

export const FILTROS_RESERVACION: FiltroReservacion[] = [
  'Todas',
  'Pagadas',
  'Pendientes',
  'Canceladas',
]

const FILTRO_A_ESTADO: Record<FiltroReservacion, EstadoPago | null> = {
  Todas: null,
  Pagadas: 'pagada',
  Pendientes: 'pendiente',
  Canceladas: 'cancelada',
}

/** Estado de pago que le toca a cada chip, o `null` para "Todas". */
export function estadoDelFiltro(filtro: FiltroReservacion): EstadoPago | null {
  return FILTRO_A_ESTADO[filtro]
}
