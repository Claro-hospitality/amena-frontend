import {
  Blocks,
  Building2,
  CalendarDays,
  ClipboardCheck,
  Home,
  Palette,
  Receipt,
  ScanLine,
  Settings,
  Users,
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
 * - finanzas: consultas de cortes (las facturas se ven en el detalle del corte).
 * - mesero: solo el escáner.
 */
export const navPorRol: Record<RolBackoffice, ItemNav[]> = {
  super_admin: [
    { to: '/inicio', label: 'Inicio', icon: Home },
    { to: '/escaner', label: 'Escáner', icon: ScanLine },
    { to: '/empresas', label: 'Empresas', icon: Building2 },
    { to: '/platillos', label: 'Platillos', icon: UtensilsCrossed },
    { to: '/menu', label: 'Menú', icon: CalendarDays },
    { to: '/consumos', label: 'Consumos', icon: Receipt },
    { to: '/cortes', label: 'Cortes semanales', icon: ClipboardCheck },
    { to: '/usuarios', label: 'Usuarios', icon: Users },
    { to: '/configuracion', label: 'Configuración', icon: Settings },
  ],
  finanzas: [
    { to: '/inicio', label: 'Inicio', icon: Home },
    { to: '/empresas', label: 'Empresas', icon: Building2 },
    { to: '/consumos', label: 'Consumos', icon: Receipt },
    { to: '/cortes', label: 'Cortes semanales', icon: ClipboardCheck },
  ],
  mesero: [{ to: '/escaner', label: 'Escáner', icon: ScanLine }],
  // Consulta: solo lectura de todo lo operativo. Sin escáner, sin configuración, sin usuarios.
  consulta: [
    { to: '/inicio', label: 'Inicio', icon: Home },
    { to: '/empresas', label: 'Empresas', icon: Building2 },
    { to: '/platillos', label: 'Platillos', icon: UtensilsCrossed },
    { to: '/menu', label: 'Menú', icon: CalendarDays },
    { to: '/consumos', label: 'Consumos', icon: Receipt },
    { to: '/cortes', label: 'Cortes semanales', icon: ClipboardCheck },
  ],
  // Capitán de meseros: opera el escáner y ve platillos/menú (lectura). Nada más.
  capitan_meseros: [
    { to: '/inicio', label: 'Inicio', icon: Home },
    { to: '/escaner', label: 'Escáner', icon: ScanLine },
    { to: '/platillos', label: 'Platillos', icon: UtensilsCrossed },
    { to: '/menu', label: 'Menú', icon: CalendarDays },
  ],
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
