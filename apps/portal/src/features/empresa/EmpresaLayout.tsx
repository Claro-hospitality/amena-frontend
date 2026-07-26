import { useEffect, useRef } from 'react'
import { NavLink, Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@amena/ui/lib/utils'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { navEmpresa } from '../../layout/navPortal'

/**
 * Sección "Empresa" (solo admin): agrupador de gestión con subnavegación tipo "tabs"
 * (segmented control) — contenedor en color secondary y la opción seleccionada como pastilla
 * sólida del secondary principal (verde de marca). Facturas queda como placeholder
 * deshabilitado hasta el módulo 4.8. Re-pasa el contexto de acceso a las rutas hijas.
 *
 * Una sola fila con scroll horizontal (móvil/tablet): la opción activa se desliza a la vista.
 */
export function EmpresaLayout() {
  const contexto = useOutletContext<ContextoAcceso>()
  const { pathname } = useLocation()
  const reducirMovimiento = useReducedMotion()
  const contenedorRef = useRef<HTMLDivElement>(null)

  // Al cambiar de subruta, desliza la opción activa (aria-current) al centro.
  useEffect(() => {
    contenedorRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView?.({
      inline: 'center',
      block: 'nearest',
      behavior: reducirMovimiento ? 'auto' : 'smooth',
    })
  }, [pathname, reducirMovimiento])

  // Defensa en profundidad: un colaborador que teclee /empresa vuelve a su inicio.
  if (contexto.tipo !== 'admin_empresa') return <Navigate to="/inicio" replace />

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {/* Full-bleed: se sale del padding del shell (-mx) para pegarse a los bordes de la
          pantalla. El mask de degradado difumina los extremos → los tabs "desaparecen" hacia
          los lados (ilusión de lejanía). */}
      <div
        ref={contenedorRef}
        className="-mx-4 overflow-x-auto sm:-mx-6 [scrollbar-width:none] [mask-image:linear-gradient(to_right,transparent,black_1.5rem,black_calc(100%_-_1.5rem),transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_1.5rem,black_calc(100%_-_1.5rem),transparent)] [&::-webkit-scrollbar]:hidden"
      >
        <nav
          aria-label="Gestión de la empresa"
          className="flex w-max min-w-full items-center gap-1 bg-secondary px-4 py-1.5 sm:px-6"
        >
          {navEmpresa.map((item) => {
            const Icono = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'relative inline-flex shrink-0 items-center rounded-xl px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-primary-foreground'
                      : 'text-secondary-foreground/80 hover:text-secondary-foreground'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="empresa-tab-pastilla"
                        className="absolute inset-0 rounded-xl bg-salvia-500"
                        transition={
                          reducirMovimiento
                            ? { duration: 0 }
                            : { type: 'spring', stiffness: 480, damping: 34 }
                        }
                      />
                    )}
                    <span className="relative z-10 inline-flex items-center gap-1.5">
                      <Icono className="size-4" strokeWidth={1.75} />
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>

      <Outlet context={contexto} />
    </div>
  )
}
