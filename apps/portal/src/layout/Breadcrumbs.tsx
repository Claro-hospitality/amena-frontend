import { Fragment } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@amena/ui/components/ui/breadcrumb'
import { construirMigas } from '@amena/utils'
import { RUTAS_BREADCRUMB } from './rutasBreadcrumb'

/**
 * Migas de pan calculadas desde la ruta actual. La última (página actual) se
 * destaca como título de la pantalla; las anteriores son la traza navegable.
 * SOLO se muestra en PC (xl+): el breadcrumb completo (la última miga hace de título).
 * En móvil y tablet (< xl) el encabezado se oculta por completo — ninguna page muestra
 * título en esos tamaños. Al ocultar todo el `nav` (display:none) no queda hueco en el
 * flujo flex del shell (`gap-4`).
 * Sin fondo ni borde: el espaciado y los márgenes los da el contenedor del shell
 * (estandarizado para todas las pages).
 */
export function Breadcrumbs() {
  const { pathname } = useLocation()
  const migas = construirMigas(pathname, RUTAS_BREADCRUMB)

  return (
    <Breadcrumb className="hidden xl:block">
      <BreadcrumbList className="gap-1.5 sm:gap-2">
        {migas.map((miga, i) => (
          <Fragment key={miga.to}>
            <BreadcrumbItem className={miga.esActual ? undefined : 'hidden xl:flex'}>
              {miga.esActual ? (
                <BreadcrumbPage className="text-xl font-semibold tracking-tight text-foreground">
                  {miga.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  className="text-sm font-medium text-muted-foreground"
                  render={<Link to={miga.to}>{miga.label}</Link>}
                />
              )}
            </BreadcrumbItem>
            {i < migas.length - 1 && (
              <BreadcrumbSeparator className="hidden text-muted-foreground/50 xl:block" />
            )}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
