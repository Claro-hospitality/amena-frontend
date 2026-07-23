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
import { useTituloDetalle } from './tituloDetalle'

/**
 * Migas de pan calculadas desde la ruta actual. La última (página actual) se
 * destaca como título de la pantalla; las anteriores son la traza navegable.
 * Sin fondo ni borde: el espaciado y los márgenes los da el contenedor del shell
 * (estandarizado para todas las pages).
 */
export function Breadcrumbs() {
  const { pathname } = useLocation()
  const { migas: migasDinamicas } = useTituloDetalle()
  const base = construirMigas(pathname, RUTAS_BREADCRUMB)
  // Si la ruta aporta migas dinámicas (p. ej. nombre de empresa, o [Empresa, Configurar]),
  // se agregan tras las estáticas y la última pasa a ser el paso actual.
  const migas = migasDinamicas.length
    ? [
        ...base.map((m) => ({ ...m, esActual: false })),
        ...migasDinamicas.map((m, i) => ({
          label: m.label,
          to: m.to,
          esActual: i === migasDinamicas.length - 1,
        })),
      ]
    : base

  return (
    <Breadcrumb>
      <BreadcrumbList className="gap-1.5 sm:gap-2">
        {migas.map((miga, i) => (
          <Fragment key={miga.to}>
            <BreadcrumbItem className={miga.esActual ? undefined : 'hidden lg:flex'}>
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
              <BreadcrumbSeparator className="hidden text-muted-foreground/50 lg:block" />
            )}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
