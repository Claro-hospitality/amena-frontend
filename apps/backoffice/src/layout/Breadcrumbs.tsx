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
 * Migas de pan del backoffice, calculadas desde la ruta actual (barra bajo el
 * header). En Inicio no aporta (una sola miga), así que no se renderiza.
 */
export function Breadcrumbs() {
  const { pathname } = useLocation()
  const migas = construirMigas(pathname, RUTAS_BREADCRUMB)
  if (migas.length <= 1) return null

  return (
    <div className="border-b border-border px-4 py-2.5 md:px-6">
      <Breadcrumb>
        <BreadcrumbList>
          {migas.map((miga, i) => (
            <Fragment key={miga.to}>
              <BreadcrumbItem>
                {miga.esActual ? (
                  <BreadcrumbPage>{miga.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link to={miga.to}>{miga.label}</Link>} />
                )}
              </BreadcrumbItem>
              {i < migas.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
