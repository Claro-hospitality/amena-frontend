import { Building2, Home, QrCode, UtensilsCrossed, type LucideIcon } from 'lucide-react'
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

// La navegación a las secciones hijas de Empresa (colaboradores, cuotas, cortes, facturas) vive
// ahora en las tarjetas de la página General (`features/empresa/EmpresaGeneralPage`).
