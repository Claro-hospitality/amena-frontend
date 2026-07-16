import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Button } from '@amena/ui/components/ui/button'
import { cn } from '@amena/ui/lib/utils'
import { useAuth } from '../auth/useAuth'
import type { RolBackoffice } from '../auth/validarAccesoPortal'
import { navPorRol } from './navBackoffice'

/** Shell del backoffice: sidebar (tokens sidebar del tema) con items según rol. */
export function BackofficeShell({ rol, children }: { rol: RolBackoffice; children: ReactNode }) {
  const { cerrarSesion } = useAuth()

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="p-4 text-lg font-semibold text-sidebar-primary">Amena</div>
        <nav className="flex flex-1 flex-col gap-1 px-2">
          {navPorRol[rol].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4">
          <Button variant="outline" className="w-full" onClick={() => cerrarSesion()}>
            Cerrar sesión
          </Button>
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
