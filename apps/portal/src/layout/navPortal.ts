import {
  Building2,
  CalendarDays,
  ClipboardCheck,
  FileText,
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
 * Navegación principal del portal. Todo usuario es primero COMENSAL: ambos roles ven
 * "Inicio", "Menú" y "Mi QR". El admin de empresa intercala "Empresa" (gestión) entre
 * Menú y Mi QR.
 */
export const navPorTipo: Record<TipoUsuarioPortal, ItemNav[]> = {
  colaborador: [
    { to: '/inicio', label: 'Inicio', icon: Home },
    { to: '/menu', label: 'Menú', icon: UtensilsCrossed },
    { to: '/mi-qr', label: 'Mi QR', icon: QrCode },
  ],
  admin_empresa: [
    { to: '/inicio', label: 'Inicio', icon: Home },
    { to: '/menu', label: 'Menú', icon: UtensilsCrossed },
    { to: '/empresa', label: 'Empresa', icon: Building2 },
    { to: '/mi-qr', label: 'Mi QR', icon: QrCode },
  ],
}

/** Subnavegación interna de la sección Empresa (solo admin). Rutas anidadas `/empresa/*`. */
export const navEmpresa: ItemNav[] = [
  { to: '/empresa/colaboradores', label: 'Colaboradores', icon: Users },
  { to: '/empresa/cuotas', label: 'Cuotas', icon: CalendarDays },
  { to: '/empresa/cortes', label: 'Cortes', icon: ClipboardCheck },
  { to: '/empresa/facturas', label: 'Facturas', icon: FileText },
]
