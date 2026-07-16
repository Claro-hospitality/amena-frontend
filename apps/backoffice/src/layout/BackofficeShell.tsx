import type { ReactNode } from 'react'
import { Button } from '@amena/ui/components/ui/button'
import { useAuth } from '../auth/useAuth'

/** Shell del backoffice: sidebar (tokens sidebar del tema) + área de contenido. */
export function BackofficeShell({ children }: { children: ReactNode }) {
  const { cerrarSesion } = useAuth()

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="p-4 text-lg font-semibold text-sidebar-primary">Amena</div>
        <nav className="flex-1 px-2">
          {/* TODO(fase-3-sync): items de navegación según usuarios_internos.rol
              (super_admin ve todo; mesero solo escáner; finanzas consultas). */}
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
