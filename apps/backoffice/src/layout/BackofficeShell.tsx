import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { LogotipoAmena } from '@amena/ui/components/logotipo-amena'
import { Breadcrumbs } from './Breadcrumbs'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@amena/ui/components/ui/sidebar'
import { useAuth } from '../auth/useAuth'
import type { RolBackoffice } from '../auth/validarAccesoPortal'
import { navPorRol } from './navBackoffice'

/**
 * Shell del backoffice sobre el sidebar del kit (@amena/ui):
 * - Desktop: sidebar persistente, colapsable a íconos.
 * - < md: drawer con trigger hamburguesa en el header móvil.
 * Usa los tokens `--sidebar-*` del tema (los consume el componente).
 */
export function BackofficeShell({ rol, children }: { rol: RolBackoffice; children: ReactNode }) {
  return (
    <SidebarProvider>
      <NavegacionBackoffice rol={rol} />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-border bg-background px-4">
          <SidebarTrigger aria-label="Alternar menú" />
          <LogotipoAmena className="h-5 w-auto text-primary md:hidden" />
        </header>
        <div className="flex min-w-0 flex-1 flex-col gap-5 p-4 md:p-6">
          <Breadcrumbs />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function NavegacionBackoffice({ rol }: { rol: RolBackoffice }) {
  const { cerrarSesion } = useAuth()
  const { isMobile, setOpenMobile } = useSidebar()
  const { pathname } = useLocation()

  const cerrarDrawer = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <LogotipoAmena className="mx-2 my-1 h-5 w-auto text-sidebar-primary group-data-[collapsible=icon]:hidden" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navPorRol[rol].map((item) => {
                const Icono = item.icon
                const activo = pathname === item.to || pathname.startsWith(`${item.to}/`)
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      isActive={activo}
                      tooltip={item.label}
                      render={
                        <Link to={item.to} onClick={cerrarDrawer}>
                          <Icono />
                          <span>{item.label}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Cerrar sesión" onClick={() => cerrarSesion()}>
              <LogOut />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
