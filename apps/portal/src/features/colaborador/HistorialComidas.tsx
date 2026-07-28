import { useState } from 'react'
import { Check, TriangleAlert } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import { Calendar } from '@amena/ui/components/ui/calendar'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@amena/ui/components/ui/empty'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { aISO, deISO, diasHabiles, etiquetaDiaCorta, lunesDeSemana } from '@amena/utils'
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
  const { data: fechasMes } = useMisConsumosDelMes(aISO(mes))
  const diasConConsumo = (fechasMes ?? []).map((f) => deISO(f))

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

          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Historial de comidas</h2>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-2.5 rounded-full bg-success" aria-hidden />
                Día con consumo
              </span>
            </div>
            <div className="flex justify-center rounded-xl border border-border p-2">
              <Calendar
                month={mes}
                onMonthChange={setMes}
                showOutsideDays={false}
                formatters={FORMATO_ES}
                modifiers={{ consumido: diasConConsumo }}
                modifiersClassNames={{
                  consumido: 'bg-success text-success-foreground rounded-2xl font-semibold',
                }}
              />
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
