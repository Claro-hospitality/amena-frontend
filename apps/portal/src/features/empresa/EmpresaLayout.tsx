import { NavLink, Navigate, Outlet, useOutletContext } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { Badge } from '@amena/ui/components/ui/badge'
import { cn } from '@amena/ui/lib/utils'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { navEmpresa } from '../../layout/navPortal'

/**
 * Sección "Empresa" (solo admin): agrupador de gestión con subnavegación interna
 * (Colaboradores, Cuotas, Cierres). Facturas queda como placeholder deshabilitado hasta
 * que aterrice el módulo 4.8. Re-pasa el contexto de acceso a las rutas hijas.
 */
export function EmpresaLayout() {
  const contexto = useOutletContext<ContextoAcceso>()

  // Defensa en profundidad: un colaborador que teclee /empresa vuelve a su inicio.
  if (contexto.tipo !== 'admin_empresa') return <Navigate to="/inicio" replace />

  return (
    <div className="flex flex-col gap-4">
      <nav
        aria-label="Gestión de la empresa"
        className="-mb-px flex flex-wrap items-center gap-1 border-b border-border"
      >
        {navEmpresa.map((item) => {
          const Icono = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )
              }
            >
              <Icono className="size-4" />
              {item.label}
            </NavLink>
          )
        })}

        {/* Facturas: llega en el módulo 4.8. Placeholder no interactivo. */}
        <span
          aria-disabled
          className="flex cursor-not-allowed items-center gap-1.5 border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground/60"
        >
          <FileText className="size-4" />
          Facturas
          <Badge variant="outline" className="ml-1">
            Próximamente
          </Badge>
        </span>
      </nav>

      <Outlet context={contexto} />
    </div>
  )
}
