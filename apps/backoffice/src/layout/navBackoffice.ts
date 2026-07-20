import {
  Blocks,
  Building2,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Home,
  ScanLine,
  Settings,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import type { RolBackoffice } from '../auth/validarAccesoPortal'

export interface ItemNav {
  to: string
  label: string
  icon: LucideIcon
}

/**
 * Items del sidebar por rol (rutas placeholder por ahora).
 * - super_admin: todo el backoffice.
 * - finanzas: consultas de cierres y facturas.
 * - mesero: solo el escáner.
 */
export const navPorRol: Record<RolBackoffice, ItemNav[]> = {
  super_admin: [
    { to: '/inicio', label: 'Inicio', icon: Home },
    { to: '/escaner', label: 'Escáner', icon: ScanLine },
    { to: '/empresas', label: 'Empresas', icon: Building2 },
    { to: '/platillos', label: 'Platillos', icon: UtensilsCrossed },
    { to: '/menu', label: 'Menú', icon: CalendarDays },
    { to: '/colaboradores', label: 'Colaboradores', icon: Users },
    { to: '/cierres', label: 'Cierres', icon: ClipboardCheck },
    { to: '/facturas', label: 'Facturas', icon: FileText },
    { to: '/configuracion', label: 'Configuración', icon: Settings },
  ],
  finanzas: [
    { to: '/inicio', label: 'Inicio', icon: Home },
    { to: '/empresas', label: 'Empresas', icon: Building2 },
    { to: '/cierres', label: 'Cierres', icon: ClipboardCheck },
    { to: '/facturas', label: 'Facturas', icon: FileText },
  ],
  mesero: [{ to: '/escaner', label: 'Escáner', icon: ScanLine }],
}

/**
 * Sección "Desarrollo" — herramientas internas. SOLO se muestra en el entorno de
 * desarrollo (import.meta.env.DEV); nunca en producción. No depende del rol.
 */
export const navDesarrollo: ItemNav[] = [
  { to: '/componentes', label: 'Componentes', icon: Blocks },
]
