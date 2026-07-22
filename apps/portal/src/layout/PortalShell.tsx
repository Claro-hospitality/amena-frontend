import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { LogOut, QrCode } from 'lucide-react'
import { LogotipoAmena } from '@amena/ui/components/logotipo-amena'
import { Button } from '@amena/ui/components/ui/button'
import { cn } from '@amena/ui/lib/utils'
import { Breadcrumbs } from './Breadcrumbs'
import { useAuth } from '../auth/useAuth'
import type { TipoUsuarioPortal } from '../auth/validarAccesoPortal'
import { navPorTipo, type ItemNav } from './navPortal'

/**
 * Shell del portal (mobile-first):
 * - móvil y tablet (< lg): navegación en una píldora inferior fija (icono + etiqueta).
 * - lg+: navegación en línea en el header.
 */
export function PortalShell({
  tipo,
  esComensal = false,
  children,
}: {
  tipo: TipoUsuarioPortal
  /** Un admin que además es comensal ve un acceso extra a su propio QR. */
  esComensal?: boolean
  children: ReactNode
}) {
  const { cerrarSesion } = useAuth()

  // El admin que también come ve "Mi QR" (el colaborador ya lo tiene en su Inicio).
  const items: ItemNav[] =
    tipo === 'admin_empresa' && esComensal
      ? [...navPorTipo[tipo], { to: '/mi-qr', label: 'Mi QR', icon: QrCode }]
      : navPorTipo[tipo]

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center gap-4 border-b border-border px-4 py-3 sm:px-6">
        <LogotipoAmena className="h-5 w-auto text-primary" />

        {/* lg+: navegación en línea */}
        <nav className="hidden flex-1 items-center gap-1 lg:flex">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto lg:ml-0">
          <Button variant="outline" size="sm" onClick={() => cerrarSesion()}>
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </Button>
        </div>
      </header>

      <main className="flex min-w-0 flex-1 flex-col gap-4 px-4 pt-3 pb-24 sm:px-6 lg:pb-6">
        <Breadcrumbs />
        {children}
      </main>

      {/* Móvil y tablet: navegación en píldora inferior */}
      <NavInferior items={items} />
    </div>
  )
}

/** Barra de navegación tipo píldora, fija abajo. Solo < lg. */
function NavInferior({ items }: { items: ItemNav[] }) {
  return (
    <nav
      aria-label="Navegación"
      className="fixed inset-x-3 bottom-3 z-20 mx-auto flex max-w-md items-stretch justify-around gap-1 rounded-3xl border border-border bg-card p-1.5 lg:hidden"
    >
      {items.map((item) => {
        const Icono = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5 text-[11px] font-medium transition-colors',
                isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
              )
            }
          >
            <Icono className="size-5" aria-hidden />
            <span>{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
