import { useEffect, useState } from 'react'
import { CalendarDays, TriangleAlert } from 'lucide-react'
import { cn } from '@amena/ui/lib/utils'
import { Button } from '@amena/ui/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@amena/ui/components/ui/empty'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { aISO, deISO, diasHabiles, etiquetaDia, lunesDeSemana } from '@amena/utils'
import { NavegadorSemana } from '../cuotas/NavegadorSemana'
import { TarjetaPlatillo } from './TarjetaPlatillo'
import { useMenuSemana } from './queries'

function moverLunes(lunesISO: string, delta: number): string {
  const l = deISO(lunesISO)
  l.setDate(l.getDate() + delta * 7)
  return aISO(l)
}

/**
 * Menú semanal (lun–vie) con navegador de semana. Lo usan el Inicio (común a colaborador y
 * admin) — es informativo, sin restricción de rol.
 */
export function MenuSemanal() {
  const [lunesISO, setLunesISO] = useState(() => aISO(lunesDeSemana(new Date())))
  const { data: menu, isLoading, isError, refetch } = useMenuSemana(lunesISO)

  const dias = diasHabiles(deISO(lunesISO))
  const platillosDe = (iso: string) => (menu ?? []).filter((m) => m.fecha === iso)
  const vacia = (menu ?? []).length === 0

  const [diaActivo, setDiaActivo] = useState<string | null>(null)

  // Resalta en la tira el día que está a la vista mientras se hace scroll.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setDiaActivo((visible[0].target as HTMLElement).dataset.dia ?? null)
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: [0, 0.5, 1] }
    )
    for (const el of document.querySelectorAll<HTMLElement>('[data-dia]')) obs.observe(el)
    return () => obs.disconnect()
  }, [menu, lunesISO])

  const irADia = (iso: string) => {
    setDiaActivo(iso)
    document.getElementById(`dia-${iso}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <header className="flex flex-col gap-3">
        <NavegadorSemana
          lunesISO={lunesISO}
          onAnterior={() => setLunesISO((p) => moverLunes(p, -1))}
          onSiguiente={() => setLunesISO((p) => moverLunes(p, 1))}
        />
      </header>

      {/* Fila de días (L M Mi J V): navegación rápida a cada día. */}
      {!vacia && (
        <TiraDias dias={dias} activo={diaActivo} onSeleccionar={irADia} />
      )}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : isError ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TriangleAlert className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No se pudo cargar el menú</EmptyTitle>
            <EmptyDescription>Ocurrió un error al consultar la semana.</EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" onClick={() => refetch()}>
            Reintentar
          </Button>
        </Empty>
      ) : vacia ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarDays className="size-6" />
            </EmptyMedia>
            <EmptyTitle>Sin menú esta semana</EmptyTitle>
            <EmptyDescription>Todavía no se ha publicado el menú de estos días.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-6">
          {dias.map((d) => {
            const platillos = platillosDe(aISO(d))
            return (
              <section
                key={aISO(d)}
                id={`dia-${aISO(d)}`}
                data-dia={aISO(d)}
                className="flex scroll-mt-24 flex-col gap-3"
              >
                <div className="flex items-center gap-2">
                  <span className="h-4 w-1 rounded-full bg-salvia-500" aria-hidden />
                  <h2 className="text-base font-semibold capitalize text-foreground">
                    {etiquetaDia(d)}
                  </h2>
                </div>
                {platillos.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground">
                    Sin platillos este día
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {platillos.map((m, i) => (
                      <TarjetaPlatillo key={`${m.fecha}-${i}`} platillo={m.platillo} />
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

const LETRAS_DIA = ['L', 'M', 'Mi', 'J', 'V']

/** Fila de días hábiles (L–V) fija bajo el encabezado; navega a cada día. */
function TiraDias({
  dias,
  activo,
  onSeleccionar,
}: {
  dias: Date[]
  activo: string | null
  onSeleccionar: (iso: string) => void
}) {
  return (
    <div className="sticky top-14 z-10 -mx-4 flex items-stretch gap-1.5 bg-background/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
      {dias.map((d, i) => {
        const iso = aISO(d)
        const on = iso === activo
        return (
          <button
            key={iso}
            type="button"
            onClick={() => onSeleccionar(iso)}
            aria-current={on ? 'true' : undefined}
            aria-label={etiquetaDia(d)}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 rounded-xl border py-2 transition-colors',
              on
                ? 'border-salvia-500 bg-salvia-500 text-primary-foreground'
                : 'border-border bg-card text-foreground hover:bg-secondary'
            )}
          >
            <span className="text-sm font-semibold leading-none">
              {LETRAS_DIA[i] ?? etiquetaDia(d).charAt(0)}
            </span>
            <span
              className={cn(
                'text-xs leading-none',
                on ? 'text-primary-foreground/85' : 'text-muted-foreground'
              )}
            >
              {d.getDate()}
            </span>
          </button>
        )
      })}
    </div>
  )
}
