import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Button } from '@amena/ui/components/ui/button'
import { cn } from '@amena/ui/lib/utils'
import { useAuth } from '../auth/useAuth'
import type { TipoUsuarioPortal } from '../auth/validarAccesoPortal'
import { navPorTipo } from './navPortal'

/** Shell del portal: header con navegación según el tipo de usuario. */
export function PortalShell({
  tipo,
  children,
}: {
  tipo: TipoUsuarioPortal
  children: ReactNode
}) {
  const { cerrarSesion } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center gap-6 border-b border-border px-6 py-3">
        <span className="text-lg font-semibold text-primary">Amena</span>
        <nav className="flex flex-1 items-center gap-1">
          {navPorTipo[tipo].map((item) => (
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
        <Button variant="outline" size="sm" onClick={() => cerrarSesion()}>
          Cerrar sesión
        </Button>
      </header>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
