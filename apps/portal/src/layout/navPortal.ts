import {
  Building2,
  CalendarDays,
  ClipboardCheck,
  Home,
  QrCode,
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
 * Navegación principal del portal. Todo usuario es primero COMENSAL: ambos roles ven
 * "Inicio" y "Mi QR" (mismo nombre, orden y contenido). El admin de empresa suma
 * "Empresa" (gestión) al final.
 */
export const navPorTipo: Record<TipoUsuarioPortal, ItemNav[]> = {
  colaborador: [
    { to: '/inicio', label: 'Inicio', icon: Home },
    { to: '/mi-qr', label: 'Mi QR', icon: QrCode },
  ],
  admin_empresa: [
    { to: '/inicio', label: 'Inicio', icon: Home },
    { to: '/mi-qr', label: 'Mi QR', icon: QrCode },
    { to: '/empresa', label: 'Empresa', icon: Building2 },
  ],
}

/** Subnavegación interna de la sección Empresa (solo admin). Rutas anidadas `/empresa/*`. */
export const navEmpresa: ItemNav[] = [
  { to: '/empresa/colaboradores', label: 'Colaboradores', icon: Users },
  { to: '/empresa/cuotas', label: 'Cuotas', icon: CalendarDays },
  { to: '/empresa/cortes', label: 'Cortes', icon: ClipboardCheck },
]
