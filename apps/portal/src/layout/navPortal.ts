import {
  Building2,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Home,
  Info,
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
  /** Ancla para el recorrido guiado (driver.js): se renderiza como `data-tour`. */
  tourId: string
}

/**
 * Navegación principal del portal. Todo usuario es primero COMENSAL: ambos roles ven
 * "Inicio", "Menú" y "Mi QR". El admin de empresa intercala "Empresa" (gestión) entre
 * Menú y Mi QR.
 */
export const navPorTipo: Record<TipoUsuarioPortal, ItemNav[]> = {
  colaborador: [
    { to: '/inicio', label: 'Inicio', icon: Home, tourId: 'nav-inicio' },
    { to: '/menu', label: 'Menú', icon: UtensilsCrossed, tourId: 'nav-menu' },
    { to: '/mi-qr', label: 'Mi QR', icon: QrCode, tourId: 'nav-mi-qr' },
  ],
  admin_empresa: [
    { to: '/inicio', label: 'Inicio', icon: Home, tourId: 'nav-inicio' },
    { to: '/menu', label: 'Menú', icon: UtensilsCrossed, tourId: 'nav-menu' },
    { to: '/empresa', label: 'Empresa', icon: Building2, tourId: 'nav-empresa' },
    { to: '/mi-qr', label: 'Mi QR', icon: QrCode, tourId: 'nav-mi-qr' },
  ],
}

/**
 * Subnavegación interna de la sección Empresa (solo admin), como tabs. Rutas anidadas `/empresa/*`.
 * "General" (índice `/empresa`) muestra los datos generales de la empresa; el resto son las
 * secciones hijas.
 */
export const navEmpresa: ItemNav[] = [
  { to: '/empresa', label: 'General', icon: Info, tourId: 'emp-general' },
  { to: '/empresa/colaboradores', label: 'Colaboradores', icon: Users, tourId: 'emp-colaboradores' },
  { to: '/empresa/cuotas', label: 'Cuotas', icon: CalendarDays, tourId: 'emp-cuotas' },
  { to: '/empresa/cortes', label: 'Cortes', icon: ClipboardCheck, tourId: 'emp-cortes' },
  { to: '/empresa/facturas', label: 'Facturas', icon: FileText, tourId: 'emp-facturas' },
]
