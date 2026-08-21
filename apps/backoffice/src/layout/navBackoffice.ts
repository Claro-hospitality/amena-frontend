import {
  Blocks,
  Building2,
  CalendarDays,
  ClipboardCheck,
  ExternalLink,
  FileText,
  Hash,
  Home,
  LayoutDashboard,
  Palette,
  QrCode,
  Receipt,
  ScanLine,
  Settings,
  Ticket,
  Users,
  UtensilsCrossed,
  Wifi,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import type { RolBackoffice } from '../auth/validarAccesoPortal'

export interface ItemNav {
  to: string
  label: string
  icon: LucideIcon
  /**
   * Se pinta deshabilitado con "Próximamente" y no navega: la pantalla todavía no existe.
   * `to` solo sirve de key en estos casos.
   */
  proximamente?: boolean
  /** `to` es una URL absoluta: se abre en pestaña nueva con <a>, no con el router. */
  externo?: boolean
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
    { to: '/wifi', label: 'WiFi', icon: Wifi },
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
  // Eventos: otro producto (amena.social). Todo su menú vive en el grupo colapsable de abajo,
  // así que no tiene items sueltos.
  eventos: [],
}

/** Grupo de navegación colapsable (un item padre con sub-items). */
export interface GrupoNav {
  label: string
  icon: LucideIcon
  items: ItemNav[]
}

/** Sitio público que administran estos módulos. */
const SITIO_PUBLICO_URL = import.meta.env.VITE_SITIO_PUBLICO_URL ?? 'https://amena.social'

/**
 * Eventos de amena.social: otro producto dentro del mismo backoffice (esquema `eventos` de la
 * base, no `public`). Va en un grupo propio para no mezclar su menú con el de planes de
 * alimentación — y porque "Facturas" y "Escáner" ya significan otra cosa en la raíz.
 */
export const grupoEventos: GrupoNav = {
  label: 'Eventos',
  icon: Ticket,
  items: [
    { to: '/eventos', label: 'Resumen', icon: LayoutDashboard },
    { to: '/eventos/catalogo', label: 'Catálogo', icon: CalendarDays },
    { to: '/eventos/reservaciones', label: 'Reservaciones', icon: Users },
    { to: '/eventos/escanear', label: 'Escanear boleto', icon: QrCode },
    { to: '/eventos/facturas', label: 'Facturas emitidas', icon: FileText, proximamente: true },
    { to: '/eventos/codigos', label: 'Códigos de consumo', icon: Hash, proximamente: true },
    { to: SITIO_PUBLICO_URL, label: 'Ver sitio', icon: ExternalLink, externo: true },
  ],
}

/** Grupos colapsables por rol. Los roles ausentes no ven ninguno. */
export const gruposPorRol: Partial<Record<RolBackoffice, GrupoNav[]>> = {
  super_admin: [grupoEventos],
  eventos: [grupoEventos],
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
