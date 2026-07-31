import { Check, TriangleAlert } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
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
import { useMisConsumos, useMisCuotasSemana } from './queries'

/**
 * Resumen de la semana del usuario logueado: cuántas comidas le quedan, la tira de días
 * (asignado •/usado ✓) y el desglose por tipo. Se muestra en el Inicio. Datos acotados a los
 * comensales del propio usuario.
 */
export function ResumenSemana() {
  const lunesISO = aISO(lunesDeSemana(new Date()))
  const { data: cuotas, isLoading: cargandoCuotas } = useMisCuotasSemana(lunesISO)
  const { data: consumos, isLoading: cargandoConsumos, isError, refetch } = useMisConsumos()

  const dias = diasHabiles(deISO(lunesISO))
  const resumen = resumenSemana(dias, cuotas ?? [], consumos ?? [])
  const desglose = desgloseSemana(dias, cuotas ?? [], consumos ?? [])

  if (cargandoCuotas || cargandoConsumos) return <Skeleton className="h-56 w-full rounded-xl" />

  if (isError) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlert className="size-6" />
          </EmptyMedia>
          <EmptyTitle>No se pudo cargar</EmptyTitle>
          <EmptyDescription>Ocurrió un error al consultar tu semana.</EmptyDescription>
        </EmptyHeader>
        <Button variant="outline" onClick={() => refetch()}>
          Reintentar
        </Button>
      </Empty>
    )
  }

  return (
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
