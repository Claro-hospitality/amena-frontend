import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { LogotipoAmena } from '@amena/ui/components/logotipo-amena'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@amena/ui/components/ui/collapsible'
import { Breadcrumbs } from './Breadcrumbs'
import { TituloDetalleProvider } from './TituloDetalleProvider'
import {
  Sidebar,
  SidebarContent,
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
import type { RolBackoffice } from '../auth/validarAccesoPortal'
import {
  gruposPorRol,
  navDesarrollo,
  navPorRol,
  type GrupoNav,
  type ItemNav,
} from './navBackoffice'
import { UsuarioMenu } from './UsuarioMenu'

/**
 * Shell del backoffice sobre el sidebar del kit (@amena/ui):
 * - Desktop: sidebar persistente, colapsable a íconos.
 * - < md: drawer con trigger hamburguesa en el header móvil.
 * Usa los tokens `--sidebar-*` del tema (los consume el componente).
 */
export function BackofficeShell({ rol, children }: { rol: RolBackoffice; children: ReactNode }) {
  return (
    // El color del sidebar (naranja difuminado) se define en sidebar-theme.css (:root),
    // así aplica también al drawer móvil que se renderiza en un portal.
    <SidebarProvider>
      <NavegacionBackoffice rol={rol} />
      <SidebarInset className="min-w-0">
        {/* Colapsar/expandir el menú: botón circular en el borde del sidebar (desktop). */}
        <BotonColapsarSidebar />
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-border bg-background px-4">
          <SidebarTrigger aria-label="Alternar menú" className="md:hidden" />
          <LogotipoAmena className="h-5 w-auto text-primary md:hidden" />
          <div className="ml-auto flex items-center">
            <UsuarioMenu />
          </div>
        </header>
        <TituloDetalleProvider>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 px-4 pb-4 pt-3 md:px-6 md:pb-6">
            <Breadcrumbs />
            {children}
          </div>
        </TituloDetalleProvider>
      </SidebarInset>
    </SidebarProvider>
  )
}

/** Botón circular en el borde del sidebar (desktop) que colapsa/expande, con chevron según el estado. */
function BotonColapsarSidebar() {
  const { state, toggleSidebar } = useSidebar()
  const Chevron = state === 'collapsed' ? ChevronRight : ChevronLeft
  return (
    <button
      type="button"
      aria-label="Comprimir o expandir el menú"
      onClick={toggleSidebar}
      className="absolute -left-3 top-4 z-30 hidden size-6 items-center justify-center rounded-full border border-sidebar-border bg-background text-foreground shadow-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:flex"
    >
      <Chevron className="size-4" />
    </button>
  )
}

function NavegacionBackoffice({ rol }: { rol: RolBackoffice }) {
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

  /**
   * Grupo colapsable con sub-items, como una fila más del menú (no una sección aparte).
   * Devuelve un item suelto a propósito: va dentro del mismo <SidebarMenu> que los items
   * planos. Un item `proximamente` se pinta inerte, sin enlace.
   */
  const renderGrupo = (grupo: GrupoNav) => {
    const IconoGrupo = grupo.icon
    return (
        <Collapsible defaultOpen key={grupo.label}>
          <SidebarMenuItem>
            <CollapsibleTrigger
              render={
                <SidebarMenuButton tooltip={grupo.label} className="group/grupo">
                  <IconoGrupo />
                  <span>{grupo.label}</span>
                  <ChevronRight className="ml-auto transition-transform group-aria-expanded/grupo:rotate-90" />
                </SidebarMenuButton>
              }
            />
            <CollapsibleContent>
              <SidebarMenuSub>
                {grupo.items.map((item) => {
                  const Icono = item.icon
                  const activo = pathname === item.to || pathname.startsWith(`${item.to}/`)
                  return (
                    <SidebarMenuSubItem key={item.to}>
                      {item.proximamente ? (
                        <SidebarMenuSubButton
                          aria-disabled
                          title="Próximamente"
                          className="cursor-not-allowed opacity-50"
                          render={
                            <span>
                              <Icono />
                              <span>{item.label}</span>
                            </span>
                          }
                        />
                      ) : item.externo ? (
                        <SidebarMenuSubButton
                          render={
                            <a href={item.to} target="_blank" rel="noreferrer">
                              <Icono />
                              <span>{item.label}</span>
                            </a>
                          }
                        />
                      ) : (
                        <SidebarMenuSubButton
                          isActive={activo}
                          render={
                            <Link to={item.to} onClick={cerrarDrawer}>
                              <Icono />
                              <span>{item.label}</span>
                            </Link>
                          }
                        />
                      )}
                    </SidebarMenuSubItem>
                  )
                })}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
    )
  }

  const grupos = gruposPorRol[rol] ?? []
  const items = navPorRol[rol]
  // Los grupos colapsables van justo debajo de Inicio. Si el rol no tiene Inicio (p. ej.
  // `eventos`, cuyo menú es solo el grupo), quedan arriba de todo.
  const iInicio = items.findIndex((i) => i.to === '/inicio')
  const corte = iInicio >= 0 ? iInicio + 1 : 0

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <LogotipoAmena className="mx-2 my-1 h-8 w-auto text-sidebar-primary group-data-[collapsible=icon]:hidden" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {/* Los grupos colapsables van en la MISMA lista que los items planos: son una
                fila más del menú, no una sección aparte. */}
            <SidebarMenu>
              {renderItems(items.slice(0, corte))}
              {grupos.map(renderGrupo)}
              {renderItems(items.slice(corte))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Solo en desarrollo (import.meta.env.DEV): submenú de herramientas internas. */}
        {import.meta.env.DEV && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>{renderGrupo(navDesarrollo)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
