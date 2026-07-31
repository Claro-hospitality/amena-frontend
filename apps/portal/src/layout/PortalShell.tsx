import { useEffect, useRef, useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LogotipoAmena } from '@amena/ui/components/logotipo-amena'
import { useIsMobile } from '@amena/ui/hooks/use-mobile'
import { cn } from '@amena/ui/lib/utils'
import { Breadcrumbs } from './Breadcrumbs'
import { UsuarioMenu } from './UsuarioMenu'
import type { TipoUsuarioPortal } from '../auth/validarAccesoPortal'
import { navPorTipo, type ItemNav } from './navPortal'
import { consumirRecorridoPendiente, useRecorridoPortal } from '../features/recorrido/useRecorridoPortal'

// Guarda a nivel de módulo: garantiza un solo auto-inicio por carga de la app
// (evita que el doble montaje de StrictMode en dev lo dispare dos veces o lo cancele).
let recorridoAutoArrancado = false

/**
 * Shell del portal (mobile-first):
 * - móvil y tablet (< lg): navegación en una píldora inferior fija (icono + etiqueta).
 * - lg+: navegación en línea en el header.
 *
 * Ambos roles ven "Inicio" y "Mi QR"; el admin suma "Empresa". La gestión (colaboradores,
 * cuotas, cortes) vive dentro de la sección Empresa, no en el nav principal.
 */
export function PortalShell({
  tipo,
  children,
}: {
  tipo: TipoUsuarioPortal
  children: ReactNode
}) {
  const items = navPorTipo[tipo]
  const { iniciar } = useRecorridoPortal(tipo)

  // Auto-inicia el recorrido solo si quedó programado al definir la contraseña
  // por primera vez (correo de bienvenida o cambio obligatorio).
  useEffect(() => {
    if (recorridoAutoArrancado) return
    if (!consumirRecorridoPendiente()) return
    recorridoAutoArrancado = true
    iniciar()
  }, [iniciar])

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-border bg-background px-4 py-3 sm:px-6">
        <LogotipoAmena className="h-5 w-auto text-primary" />

        {/* lg+: navegación en línea */}
        <nav className="hidden flex-1 items-center gap-1 lg:flex">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              data-tour={item.tourId}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center lg:ml-0">
          <UsuarioMenu onVerRecorrido={iniciar} />
        </div>
      </header>

      <main className="flex min-w-0 flex-1 flex-col gap-4 px-4 pt-3 pb-24 sm:px-6 lg:pb-6">
        <Breadcrumbs />
        {children}
      </main>

      {/* Móvil y tablet: navegación en píldora inferior */}
      <NavInferior items={items} />
    </div>
  )
}

/**
 * True cuando el usuario hace scroll hacia abajo (para ocultar la píldora en móvil).
 * Vuelve a false al subir o al estar cerca del tope.
 */
function useOcultarAlBajar(umbral = 10) {
  const [oculto, setOculto] = useState(false)
  useEffect(() => {
    let ultimaY = window.scrollY
    const alScroll = () => {
      const y = window.scrollY
      if (y < 40) {
        setOculto(false)
        ultimaY = y
        return
      }
      if (Math.abs(y - ultimaY) < umbral) return
      setOculto(y > ultimaY) // bajando → ocultar; subiendo → mostrar
      ultimaY = y
    }
    window.addEventListener('scroll', alScroll, { passive: true })
    return () => window.removeEventListener('scroll', alScroll)
  }, [umbral])
  return oculto
}

/** Barra de navegación tipo píldora, fija abajo (< lg). En móvil se oculta al bajar (spring). */
function NavInferior({ items }: { items: ItemNav[] }) {
  const oculto = useOcultarAlBajar()
  const esMovil = useIsMobile()
  return (
    <motion.nav
      aria-label="Navegación"
      initial={false}
      // Solo se oculta en móvil; en tablet (≥768) queda fija. Spring = deslizamiento fluido.
      animate={{ y: esMovil && oculto ? '150%' : '0%' }}
      transition={{ type: 'spring', stiffness: 220, damping: 30, mass: 0.9 }}
      className="fixed inset-x-3 bottom-3 z-20 mx-auto flex w-fit items-stretch gap-1 rounded-3xl border border-border/40 bg-card/70 p-1.5 shadow-lg ring-1 ring-foreground/5 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-card/40 lg:hidden"
    >
      {items.map((item) => (
        <ItemPildora key={item.to} item={item} />
      ))}
    </motion.nav>
  )
}

/** Item de la píldora: burbuja deslizante (layoutId), ripple al tocar y pop al activarse. */
function ItemPildora({ item }: { item: ItemNav }) {
  const Icono = item.icon
  const [ripples, setRipples] = useState<number[]>([])
  const idRef = useRef(0)

  return (
    <NavLink
      to={item.to}
      data-tour={item.tourId}
      onClick={() => setRipples((r) => [...r, (idRef.current += 1)])}
      className={({ isActive }) =>
        cn(
          'relative flex w-20 flex-col items-center gap-0.5 overflow-hidden rounded-full px-2 py-1.5 text-[11px] font-semibold',
          isActive ? 'text-primary' : 'text-muted-foreground'
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Burbuja que se desliza entre tabs (shared layout, spring elástico). */}
          {isActive && (
            <motion.span
              layoutId="portal-bn-bubble"
              className="absolute inset-0 rounded-full bg-primary/15 ring-1 ring-primary/25 backdrop-blur-sm"
              transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.9 }}
            />
          )}

          {/* Ripple al tocar (onda expansiva). */}
          <AnimatePresence>
            {ripples.map((id) => (
              <motion.span
                key={id}
                initial={{ scale: 0, opacity: 0.45 }}
                animate={{ scale: 2.2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                onAnimationComplete={() => setRipples((r) => r.filter((x) => x !== id))}
                className="pointer-events-none absolute inset-0 rounded-full bg-primary/20"
              />
            ))}
          </AnimatePresence>

          {/* Pop del ícono + label al activarse. */}
          <motion.div
            animate={isActive ? { scale: [0.85, 1.08, 1] } : { scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative z-10 flex flex-col items-center gap-0.5"
          >
            <Icono className="size-5" strokeWidth={1.5} aria-hidden />
            <span>{item.label}</span>
          </motion.div>
        </>
      )}
    </NavLink>
  )
}
