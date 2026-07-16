import type { ReactNode } from 'react'
import { Button } from '@amena/ui/components/ui/button'
import { useAuth } from '../auth/useAuth'

/** Shell del portal: header simple + área de contenido. */
export function PortalShell({ children }: { children: ReactNode }) {
  const { cerrarSesion } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <span className="text-lg font-semibold text-primary">Amena</span>
        {/* TODO(fase-3-sync): navegación/acciones según tipo de usuario (admin_empresa / colaborador) */}
        <Button variant="outline" size="sm" onClick={() => cerrarSesion()}>
          Cerrar sesión
        </Button>
      </header>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
