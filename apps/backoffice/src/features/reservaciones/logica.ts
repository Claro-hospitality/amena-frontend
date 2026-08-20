import type { EstadoPago, Reservacion } from './api'

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

/**
 * Filtra por estado de pago y busca en nombre, email y folio. La búsqueda es insensible a
 * mayúsculas en los tres campos (en la app original el email se comparaba sin normalizar, así
 * que "JUAN@x.com" no encontraba nada).
 */
export function filtrarReservaciones(
  reservaciones: Reservacion[],
  filtro: FiltroReservacion,
  busqueda: string
): Reservacion[] {
  const estado = FILTRO_A_ESTADO[filtro]
  const q = busqueda.trim().toLowerCase()
  return reservaciones.filter((r) => {
    if (estado && r.estado_pago !== estado) return false
    if (!q) return true
    return (
      r.nombre.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.folio.toLowerCase().includes(q)
    )
  })
}
