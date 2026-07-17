import type { TipoUsuarioPortal } from '../auth/validarAccesoPortal'

export interface ItemNav {
  to: string
  label: string
}

/**
 * Items del header por tipo de usuario (rutas placeholder por ahora).
 * - admin_empresa: administra su empresa y sus colaboradores.
 * - colaborador: ve su QR y su historial de consumos.
 */
export const navPorTipo: Record<TipoUsuarioPortal, ItemNav[]> = {
  admin_empresa: [
    { to: '/inicio', label: 'Inicio' },
    { to: '/colaboradores', label: 'Colaboradores' },
    { to: '/cuotas', label: 'Cuotas' },
  ],
  colaborador: [
    { to: '/inicio', label: 'Inicio' },
    { to: '/menu', label: 'Menú' },
    { to: '/historial', label: 'Historial' },
  ],
}
