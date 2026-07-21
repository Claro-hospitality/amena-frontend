import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, LogOut } from 'lucide-react'
import { LogotipoAmena } from '@amena/ui/components/logotipo-amena'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@amena/ui/components/ui/collapsible'
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@amena/ui/components/ui/sidebar'
import { useAuth } from '../auth/useAuth'
import type { RolBackoffice } from '../auth/validarAccesoPortal'
import { navDesarrollo, navPorRol, type ItemNav } from './navBackoffice'

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
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 px-4 pb-4 pt-3 md:px-6 md:pb-6">
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

  const renderItems = (items: ItemNav[]) =>
    items.map((item) => {
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
    })

  const IconoDesarrollo = navDesarrollo.icon

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <LogotipoAmena className="mx-2 my-1 h-5 w-auto text-sidebar-primary group-data-[collapsible=icon]:hidden" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(navPorRol[rol])}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Solo en desarrollo (import.meta.env.DEV): submenú de herramientas internas. */}
        {import.meta.env.DEV && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <Collapsible defaultOpen>
                  <SidebarMenuItem>
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuButton tooltip={navDesarrollo.label} className="group/desarrollo">
                          <IconoDesarrollo />
                          <span>{navDesarrollo.label}</span>
                          <ChevronRight className="ml-auto transition-transform group-aria-expanded/desarrollo:rotate-90" />
                        </SidebarMenuButton>
                      }
                    />
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {navDesarrollo.items.map((item) => {
                          const Icono = item.icon
                          const activo =
                            pathname === item.to || pathname.startsWith(`${item.to}/`)
                          return (
                            <SidebarMenuSubItem key={item.to}>
                              <SidebarMenuSubButton
                                isActive={activo}
                                render={
                                  <Link to={item.to} onClick={cerrarDrawer}>
                                    <Icono />
                                    <span>{item.label}</span>
                                  </Link>
                                }
                              />
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
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
