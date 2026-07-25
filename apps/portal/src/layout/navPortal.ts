import {
  CalendarDays,
  ClipboardCheck,
  History,
  Home,
  QrCode,
  UtensilsCrossed,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { TipoUsuarioPortal } from '../auth/validarAccesoPortal'

export interface ItemNav {
  to: string
  label: string
  icon: LucideIcon
}

/**
 * Items de navegación por tipo de usuario.
 * - admin_empresa: administra su empresa y sus colaboradores.
 * - colaborador: ve su QR y su historial de consumos.
 */
export const navPorTipo: Record<TipoUsuarioPortal, ItemNav[]> = {
  admin_empresa: [
    { to: '/inicio', label: 'Inicio', icon: Home },
    { to: '/colaboradores', label: 'Colaboradores', icon: Users },
    { to: '/cuotas', label: 'Cuotas', icon: CalendarDays },
    { to: '/cierres', label: 'Cierres', icon: ClipboardCheck },
  ],
  colaborador: [
    { to: '/inicio', label: 'Inicio', icon: Home },
    { to: '/menu', label: 'Menú', icon: UtensilsCrossed },
    { to: '/historial', label: 'Historial', icon: History },
  ],
}

/**
 * Accesos personales del comensal que se añaden a la navegación de un admin_empresa que
 * TAMBIÉN es comensal (tiene QR): el menú del día, su historial de comidas y su credencial.
 * Un admin sin comensal no los ve (no tiene consumos ni QR propios).
 */
export const navComensalExtra: ItemNav[] = [
  { to: '/menu', label: 'Menú', icon: UtensilsCrossed },
  { to: '/historial', label: 'Historial', icon: History },
  { to: '/mi-qr', label: 'Mi QR', icon: QrCode },
]
