import type { RolBackoffice } from '../auth/validarAccesoPortal'

export interface ItemNav {
  to: string
  label: string
}

/**
 * Items del sidebar por rol (rutas placeholder por ahora).
 * - super_admin: todo el backoffice.
 * - finanzas: consultas de cierres y facturas.
 * - mesero: solo el escáner.
 */
export const navPorRol: Record<RolBackoffice, ItemNav[]> = {
  super_admin: [
    { to: '/inicio', label: 'Inicio' },
    { to: '/empresas', label: 'Empresas' },
    { to: '/menu', label: 'Menú' },
    { to: '/colaboradores', label: 'Colaboradores' },
    { to: '/cierres', label: 'Cierres' },
    { to: '/facturas', label: 'Facturas' },
  ],
  finanzas: [
    { to: '/inicio', label: 'Inicio' },
    { to: '/empresas', label: 'Empresas' },
    { to: '/cierres', label: 'Cierres' },
    { to: '/facturas', label: 'Facturas' },
  ],
  mesero: [{ to: '/escaner', label: 'Escáner' }],
}
