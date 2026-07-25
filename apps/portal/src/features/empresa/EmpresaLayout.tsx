import { useEffect, useRef } from 'react'
import { NavLink, Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { FileText } from 'lucide-react'
import { Badge } from '@amena/ui/components/ui/badge'
import { cn } from '@amena/ui/lib/utils'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { navEmpresa } from '../../layout/navPortal'

/**
 * Sección "Empresa" (solo admin): agrupador de gestión con subnavegación interna
 * (Colaboradores, Cuotas, Cortes). Facturas queda como placeholder deshabilitado hasta
 * que aterrice el módulo 4.8. Re-pasa el contexto de acceso a las rutas hijas.
 *
 * La subnav es una sola fila con scroll horizontal (móvil y tablet): la opción activa se
 * desliza a la vista al seleccionarla (revela las que no caben), y un subrayado verde de
 * marca anima su posición con motion.
 */
export function EmpresaLayout() {
  const contexto = useOutletContext<ContextoAcceso>()
  const { pathname } = useLocation()
  const reducirMovimiento = useReducedMotion()
  const refs = useRef<Record<string, HTMLAnchorElement | null>>({})

  // Al cambiar de subruta, desliza la opción activa hacia el centro (revela las que no caben).
  useEffect(() => {
    const activo = navEmpresa.find((i) => pathname.startsWith(i.to))
    // `?.scrollIntoView?.(` — el método no existe en entornos de test (jsdom).
    refs.current[activo?.to ?? '']?.scrollIntoView?.({
      inline: 'center',
      block: 'nearest',
      behavior: reducirMovimiento ? 'auto' : 'smooth',
    })
  }, [pathname, reducirMovimiento])

  // Defensa en profundidad: un colaborador que teclee /empresa vuelve a su inicio.
  if (contexto.tipo !== 'admin_empresa') return <Navigate to="/inicio" replace />

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <nav
        aria-label="Gestión de la empresa"
        className="-mb-px flex items-center gap-1 overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {navEmpresa.map((item) => {
          const Icono = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              ref={(el) => {
                refs.current[item.to] = el
              }}
              className={({ isActive }) =>
                cn(
                  'relative flex shrink-0 items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icono className="size-4" />
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="empresa-subnav-underline"
                      className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-salvia-500"
                      transition={
                        reducirMovimiento
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 420, damping: 34 }
                      }
                    />
                  )}
                </>
              )}
            </NavLink>
          )
        })}

        {/* Facturas: llega en el módulo 4.8. Placeholder no interactivo. */}
        <span
          aria-disabled
          className="flex shrink-0 cursor-not-allowed items-center gap-1.5 px-3 py-2 text-sm font-medium text-muted-foreground/60"
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
