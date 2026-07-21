import type { ReactNode } from 'react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { LogotipoAmena } from '@amena/ui/components/logotipo-amena'
import { Button } from '@amena/ui/components/ui/button'
import { Breadcrumbs } from './Breadcrumbs'
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
  esComensal = false,
  children,
}: {
  tipo: TipoUsuarioPortal
  /** Un admin que además es comensal ve un acceso extra a su propio QR. */
  esComensal?: boolean
  children: ReactNode
}) {
  const { cerrarSesion } = useAuth()
  const [drawerAbierto, setDrawerAbierto] = useState(false)
  // El admin que también come ve "Mi QR" (el colaborador ya lo tiene en su Inicio).
  const items =
    tipo === 'admin_empresa' && esComensal
      ? [...navPorTipo[tipo], { to: '/mi-qr', label: 'Mi QR' }]
      : navPorTipo[tipo]

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
      <main className="flex min-w-0 flex-1 flex-col gap-4 px-4 pb-4 pt-3 md:px-6 md:pb-6">
        <Breadcrumbs />
        {children}
      </main>
    </div>
  )
}
