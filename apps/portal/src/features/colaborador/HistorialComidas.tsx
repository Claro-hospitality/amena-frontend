import { useState } from 'react'
import { Check, TriangleAlert, UtensilsCrossed } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import { Calendar, CalendarDayButton } from '@amena/ui/components/ui/calendar'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@amena/ui/components/ui/empty'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@amena/ui/components/ui/popover'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { aISO, deISO, diasHabiles, etiquetaDiaCorta, horaCorta, lunesDeSemana } from '@amena/utils'
import { desgloseSemana, resumenSemana } from './logica'
import { useMisConsumos, useMisConsumosDelMes, useMisCuotasSemana } from './queries'

/** Primer día del mes de la fecha dada. */
function primerDiaDelMes(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

// Nombres de mes/día en español sin depender de un locale externo (date-fns no es dep directa
// del portal): se usa Intl vía toLocaleDateString('es-MX').
const FORMATO_ES = {
  formatCaption: (date: Date) =>
    date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }),
  formatMonthCaption: (date: Date) =>
    date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }),
  formatWeekdayName: (date: Date) => date.toLocaleDateString('es-MX', { weekday: 'narrow' }),
}

/**
 * Historial de comidas del usuario logueado (colaborador o admin que además es comensal):
 * resumen de la semana ("Te quedan X de Y") y un CALENDARIO que marca los días en que tuvo
 * consumo, navegable por mes. Los datos se acotan a los comensales del propio usuario.
 */
export function HistorialComidas() {
  const lunesISO = aISO(lunesDeSemana(new Date()))
  const { data: cuotas, isLoading: cargandoCuotas } = useMisCuotasSemana(lunesISO)
  const {
    data: consumos,
    isLoading: cargandoConsumos,
    isError,
    refetch,
  } = useMisConsumos()

  const [mes, setMes] = useState(() => primerDiaDelMes(new Date()))
  const { data: consumosMes } = useMisConsumosDelMes(aISO(mes))

  // Horas de consumo por día (un día puede tener varias en modo libre) + días marcados.
  const horasPorFecha = new Map<string, string[]>()
  for (const c of consumosMes ?? []) {
    const horas = horasPorFecha.get(c.fecha) ?? []
    horas.push(horaCorta(new Date(c.created_at)))
    horasPorFecha.set(c.fecha, horas)
  }
  const diasConConsumo = [...horasPorFecha.keys()].map((f) => deISO(f))

  const textoConsumo = (fechaISO: string): string | null => {
    const horas = horasPorFecha.get(fechaISO)
    if (!horas?.length) return null
    return horas.length === 1 ? `Comiste a las ${horas[0]}` : `Comidas: ${horas.join(', ')}`
  }

  const cargando = cargandoCuotas || cargandoConsumos
  const dias = diasHabiles(deISO(lunesISO))
  const resumen = resumenSemana(dias, cuotas ?? [], consumos ?? [])
  const desglose = desgloseSemana(dias, cuotas ?? [], consumos ?? [])

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5">
      {cargando ? (
        <>
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-72 w-full" />
        </>
      ) : isError ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TriangleAlert className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No se pudo cargar</EmptyTitle>
            <EmptyDescription>Ocurrió un error al consultar tu historial.</EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" onClick={() => refetch()}>
            Reintentar
          </Button>
        </Empty>
      ) : (
        <>
          <section className="flex flex-col gap-3 rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Esta semana</p>
            <p className="text-lg font-semibold">
              Te quedan {resumen.restantes} de {resumen.asignadas}{' '}
              {resumen.asignadas === 1 ? 'comida' : 'comidas'}
            </p>
            <div className="flex justify-between gap-1">
              {resumen.porDia.map((d) => (
                <div key={d.fecha} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs capitalize text-muted-foreground">
                    {etiquetaDiaCorta(deISO(d.fecha)).replace(/\s\d+$/, '')}
                  </span>
                  <span
                    className={`flex size-9 items-center justify-center rounded-full text-xs ${
                      d.usada
                        ? 'bg-success text-success-foreground'
                        : d.asignada
                          ? 'border border-border text-foreground'
                          : 'bg-muted text-muted-foreground'
                    }`}
                    aria-label={d.usada ? 'usada' : d.asignada ? 'asignada' : 'sin comida'}
                  >
                    {d.usada ? <Check className="size-4" /> : d.asignada ? '•' : '–'}
                  </span>
                </div>
              ))}
            </div>

            {/* Desglose de los consumos de la semana por tipo. */}
            <div className="border-t border-border pt-3">
              <p className="mb-2 text-xs text-muted-foreground">
                {desglose.total === 0
                  ? 'Aún no has consumido esta semana.'
                  : `Consumos esta semana: ${desglose.total}`}
              </p>
              {desglose.total > 0 && (
                <div className="flex flex-wrap gap-2">
                  <StatConsumo etiqueta="Programadas" valor={desglose.programado} />
                  <StatConsumo etiqueta="Extras" valor={desglose.extra} />
                  <StatConsumo etiqueta="Libres" valor={desglose.libre} />
                </div>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-base font-semibold">Historial de comidas</h2>
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4">
              {/* Resumen del mes en vista */}
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-salvia-500/15 text-salvia-500">
                  <UtensilsCrossed className="size-5" strokeWidth={1.75} />
                </span>
                <div className="flex flex-col">
                  <span className="text-2xl font-semibold leading-none tabular-nums">
                    {diasConConsumo.length}
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    {diasConConsumo.length === 1 ? 'día con comida' : 'días con comida'} en{' '}
                    <span className="capitalize">
                      {mes.toLocaleDateString('es-MX', { month: 'long' })}
                    </span>
                  </span>
                </div>
                <span className="ml-auto inline-flex items-center gap-1.5 self-start text-xs text-muted-foreground">
                  <span className="size-2.5 rounded-full bg-salvia-500" aria-hidden />
                  Con consumo
                </span>
              </div>

              <div className="border-t border-border" />

              <div className="flex justify-center">
                <Calendar
                  className="bg-transparent [--cell-size:--spacing(10)]"
                  month={mes}
                  onMonthChange={setMes}
                  showOutsideDays={false}
                  formatters={FORMATO_ES}
                  modifiers={{ consumido: diasConConsumo }}
                  modifiersClassNames={{
                    // Verde de marca (secondary). El hover conserva el color (no lo quita).
                    consumido:
                      'bg-salvia-500 text-primary-foreground rounded-full font-semibold hover:bg-salvia-500 hover:text-primary-foreground',
                  }}
                  components={{
                    // Al presionar un día con consumo: card flotante ANCLADA arriba del día
                    // (Popover), con la(s) hora(s). Los demás días son un botón normal.
                    DayButton: (props) => {
                      const t = textoConsumo(aISO(props.day.date))
                      if (!t) return <CalendarDayButton {...props} />
                      return (
                        <Popover>
                          <PopoverTrigger render={<CalendarDayButton {...props} />} />
                          <PopoverContent
                            side="top"
                            sideOffset={8}
                            className="w-auto max-w-[15rem] gap-0 p-3"
                          >
                            <p className="text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
                              {props.day.date.toLocaleDateString('es-MX', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                              })}
                            </p>
                            <p className="mt-1 text-sm text-foreground">{t}</p>
                          </PopoverContent>
                        </Popover>
                      )
                    },
                  }}
                />
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

/** Píldora con la etiqueta del tipo de consumo y su conteo. */
function StatConsumo({ etiqueta, valor }: { etiqueta: string; valor: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
      {etiqueta}
      <span className="font-mono tabular-nums">{valor}</span>
    </span>
  )
}
