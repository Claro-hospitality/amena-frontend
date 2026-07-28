import { Check, TriangleAlert, UtensilsCrossed } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@amena/ui/components/ui/empty'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { aISO, deISO, diasHabiles, etiquetaDiaCorta, horaCorta, lunesDeSemana } from '@amena/utils'
import { resumenSemana } from './logica'
import { useMisConsumos, useMisCuotasSemana } from './queries'

/**
 * Historial de comidas del usuario logueado: resumen de la semana ("Te quedan X de Y"),
 * tira de días (asignado •/usado ✓) y lista de consumos. Se muestra bajo la credencial en
 * "Mi QR". Consulta los datos del comensal del usuario actual.
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

  const cargando = cargandoCuotas || cargandoConsumos
  const dias = diasHabiles(deISO(lunesISO))
  const resumen = resumenSemana(dias, cuotas ?? [], consumos ?? [])

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5">
      {cargando ? (
        <>
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-48 w-full" />
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
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold">Mis comidas</h2>
            {(consumos ?? []).length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <UtensilsCrossed className="size-6" />
                  </EmptyMedia>
                  <EmptyTitle>Aún no tienes comidas registradas</EmptyTitle>
                  <EmptyDescription>Tus consumos aparecerán aquí.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
                {(consumos ?? []).map((c, i) => (
                  <li
                    // Índice en el key: dos consumos pueden compartir fecha+created_at (modo libre).
                    key={`${c.fecha}-${c.created_at}-${i}`}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <span className="capitalize">{etiquetaDiaCorta(deISO(c.fecha))}</span>
                    <span className="font-mono text-sm tabular-nums text-muted-foreground">
                      {horaCorta(new Date(c.created_at))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
