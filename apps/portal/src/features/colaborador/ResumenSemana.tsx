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
import { cn } from '@amena/ui/lib/utils'
import {
  aISO,
  deISO,
  diasHabiles,
  etiquetaDiaCorta,
  lunesDeSemana,
  resumenPoliticaConsumo,
} from '@amena/utils'
import { desgloseSemana, resumenSemana, resumenSemanaLibre, type DiaLibre } from './logica'
import { useMiColaborador, useMisConsumos, useMisCuotasSemana } from './queries'

/** Nombre corto del día sin el número, p. ej. "lun. 13" → "lun.". */
function etiquetaDia(fechaISO: string): string {
  return etiquetaDiaCorta(deISO(fechaISO)).replace(/\s\d+$/, '')
}

/**
 * Resumen de la semana del usuario logueado. Dos variantes según su política de consumo:
 * - RESERVA (default): cuántas comidas le quedan, la tira de días (asignado •/usado ✓) y el
 *   desglose por tipo.
 * - CONSUMO LIBRE (empresa en modo libre + comensal con consumo_libre): cuántas comidas lleva
 *   de las esperadas (días permitidos × límite diario), marcando cada día como completo/parcial/
 *   pendiente/faltó, y avisando si dejó pasar algún día permitido.
 * Se muestra en el Inicio. Datos acotados a los comensales del propio usuario.
 */
export function ResumenSemana() {
  const lunesISO = aISO(lunesDeSemana(new Date()))
  const { data: colaborador, isLoading: cargandoColab } = useMiColaborador()
  const { data: cuotas, isLoading: cargandoCuotas } = useMisCuotasSemana(lunesISO)
  const { data: consumos, isLoading: cargandoConsumos, isError, refetch } = useMisConsumos()

  const dias = diasHabiles(deISO(lunesISO))

  if (cargandoColab || cargandoCuotas || cargandoConsumos)
    return <Skeleton className="h-56 w-full rounded-xl" />

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

  // Modo libre efectivo: la empresa está en modo libre Y el comensal lo tiene activado.
  const esLibre = !!colaborador?.consumoLibre && colaborador?.politica?.modo_consumo === 'libre'

  if (esLibre && colaborador?.politica) {
    return (
      <ResumenLibreView
        dias={dias}
        consumos={consumos ?? []}
        diasPermitidos={colaborador.politica.dias_permitidos}
        limiteDiario={colaborador.politica.limite_diario}
      />
    )
  }

  const resumen = resumenSemana(dias, cuotas ?? [], consumos ?? [])
  const desglose = desgloseSemana(dias, cuotas ?? [], consumos ?? [])

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
            <span className="text-xs capitalize text-muted-foreground">{etiquetaDia(d.fecha)}</span>
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

/**
 * Vista del resumen para modo de consumo libre: encabezado con el avance (llevas X de las
 * esperadas), la tira de días con su estado y, si dejó pasar días permitidos, un aviso.
 */
function ResumenLibreView({
  dias,
  consumos,
  diasPermitidos,
  limiteDiario,
}: {
  dias: Date[]
  consumos: { fecha: string; created_at: string }[]
  diasPermitidos: number[]
  limiteDiario: number | null
}) {
  const r = resumenSemanaLibre(dias, consumos, diasPermitidos, limiteDiario)
  const politicaTxt = resumenPoliticaConsumo(diasPermitidos, limiteDiario)
  const hayAviso = r.faltantes > 0 || r.diasFalto > 0

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <div className="flex flex-col gap-0.5">
        <p className="text-sm text-muted-foreground">Esta semana · consumo libre</p>
        <p className="text-lg font-semibold">
          {r.diasPermitidos === 0
            ? 'Sin días de consumo configurados'
            : r.ilimitado
              ? `Llevas ${r.consumidas} ${r.consumidas === 1 ? 'comida' : 'comidas'}`
              : `Llevas ${r.consumidas} de ${r.esperadas} ${r.esperadas === 1 ? 'comida' : 'comidas'}`}
        </p>
        <p className="text-xs text-muted-foreground">{politicaTxt}</p>
      </div>

      <div className="flex justify-between gap-1">
        {r.porDia.map((d) => (
          <div key={d.fecha} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-xs capitalize text-muted-foreground">{etiquetaDia(d.fecha)}</span>
            <CeldaDiaLibre dia={d} limite={limiteDiario} />
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-3">
        {hayAviso ? (
          <p className="flex items-center gap-1.5 text-xs text-warning-foreground">
            <TriangleAlert className="size-3.5 shrink-0" aria-hidden />
            {r.ilimitado
              ? `No consumiste en ${r.diasFalto} ${r.diasFalto === 1 ? 'día permitido' : 'días permitidos'} que ya pasaron.`
              : `Te faltó consumir ${r.faltantes} ${r.faltantes === 1 ? 'comida' : 'comidas'} de días que ya pasaron.`}
          </p>
        ) : r.consumidas > 0 ? (
          <p className="flex items-center gap-1.5 text-xs text-success">
            <Check className="size-3.5 shrink-0" aria-hidden />
            Vas al día con tus comidas.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Aún no has consumido esta semana.</p>
        )}
      </div>
    </section>
  )
}

/** Círculo del día en modo libre, coloreado según su estado. */
function CeldaDiaLibre({ dia, limite }: { dia: DiaLibre; limite: number | null }) {
  const base = 'flex size-9 items-center justify-center rounded-full text-xs font-medium'
  switch (dia.estado) {
    case 'completa':
      return (
        <span className={cn(base, 'bg-success text-success-foreground')} aria-label="completo">
          <Check className="size-4" />
        </span>
      )
    case 'parcial':
      return (
        <span
          className={cn(base, 'border border-warning bg-warning/10 text-warning-foreground tabular-nums')}
          aria-label={`parcial, ${dia.consumidas} de ${limite}`}
        >
          {dia.consumidas}
        </span>
      )
    case 'falto':
      return (
        <span className={cn(base, 'bg-warning text-warning-foreground')} aria-label="faltó consumir">
          –
        </span>
      )
    case 'pendiente':
      return (
        <span className={cn(base, 'border border-border text-foreground')} aria-label="pendiente">
          •
        </span>
      )
    default: // no-aplica
      return (
        <span className={cn(base, 'bg-muted text-muted-foreground')} aria-label="día no permitido">
          –
        </span>
      )
  }
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
