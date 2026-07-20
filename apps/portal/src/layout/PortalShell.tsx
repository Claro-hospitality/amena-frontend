import type { ReactNode } from 'react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { LogotipoAmena } from '@amena/ui/components/logotipo-amena'
import { Button } from '@amena/ui/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@amena/ui/components/ui/sheet'
import { cn } from '@amena/ui/lib/utils'
import { useAuth } from '../auth/useAuth'
import type { TipoUsuarioPortal } from '../auth/validarAccesoPortal'
import { navPorTipo } from './navPortal'

/**
 * Shell del portal (mobile-first):
 * - < md: header compacto con drawer (hamburguesa) para la navegación.
 * - md+: header con la navegación en línea.
 */
export function PortalShell({
  tipo,
  children,
}: {
  tipo: TipoUsuarioPortal
  children: ReactNode
}) {
  const { cerrarSesion } = useAuth()
  const [drawerAbierto, setDrawerAbierto] = useState(false)
  const items = navPorTipo[tipo]

  const claseLink = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
      isActive
        ? 'bg-accent text-accent-foreground'
        : 'text-muted-foreground hover:text-foreground'
    )

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center gap-4 border-b border-border px-4 py-3 sm:px-6">
        <LogotipoAmena className="h-5 w-auto text-primary" />

        {/* md+: navegación en línea */}
        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} className={claseLink}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden md:block">
          <Button variant="outline" size="sm" onClick={() => cerrarSesion()}>
            Cerrar sesión
          </Button>
        </div>

        {/* < md: drawer */}
        <div className="ml-auto md:hidden">
          <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Abrir menú">
                  <Menu />
                </Button>
              }
            />
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menú</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={claseLink}
                    onClick={() => setDrawerAbierto(false)}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <SheetFooter>
                <Button variant="outline" className="w-full" onClick={() => cerrarSesion()}>
                  Cerrar sesión
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
