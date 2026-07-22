import {
  Blocks,
  Building2,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Home,
  Palette,
  ScanLine,
  Settings,
  UtensilsCrossed,
  Wrench,
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
 * - finanzas: consultas de cortes y facturas.
 * - mesero: solo el escáner.
 */
export const navPorRol: Record<RolBackoffice, ItemNav[]> = {
  super_admin: [
    { to: '/inicio', label: 'Inicio', icon: Home },
    { to: '/escaner', label: 'Escáner', icon: ScanLine },
    { to: '/empresas', label: 'Empresas', icon: Building2 },
    { to: '/platillos', label: 'Platillos', icon: UtensilsCrossed },
    { to: '/menu', label: 'Menú', icon: CalendarDays },
    { to: '/cortes', label: 'Cortes', icon: ClipboardCheck },
    { to: '/facturas', label: 'Facturas', icon: FileText },
    { to: '/configuracion', label: 'Configuración', icon: Settings },
  ],
  finanzas: [
    { to: '/inicio', label: 'Inicio', icon: Home },
    { to: '/empresas', label: 'Empresas', icon: Building2 },
    { to: '/cortes', label: 'Cortes', icon: ClipboardCheck },
    { to: '/facturas', label: 'Facturas', icon: FileText },
  ],
  mesero: [{ to: '/escaner', label: 'Escáner', icon: ScanLine }],
}

/** Grupo de navegación colapsable (un item padre con sub-items). */
export interface GrupoNav {
  label: string
  icon: LucideIcon
  items: ItemNav[]
}

/**
 * Sección "Desarrollo" — herramientas internas, submenú desplegable. SOLO se
 * muestra en el entorno de desarrollo (import.meta.env.DEV); nunca en producción.
 * No depende del rol.
 */
export const navDesarrollo: GrupoNav = {
  label: 'Desarrollo',
  icon: Wrench,
  items: [
    { to: '/componentes', label: 'Componentes', icon: Blocks },
    { to: '/branding', label: 'Branding', icon: Palette },
  ],
}
