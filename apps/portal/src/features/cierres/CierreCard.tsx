import { Badge } from '@amena/ui/components/ui/badge'
import { Card, CardContent } from '@amena/ui/components/ui/card'
import { deISO, formatearMoneda, rangoSemanaLegible } from '@amena/utils'
import type { Cierre } from './api'

function BadgeEstado({ estado }: { estado: Cierre['estado'] }) {
  return estado === 'cerrado' ? (
    <Badge className="bg-success text-success-foreground">Cerrado</Badge>
  ) : (
    <Badge variant="secondary">Abierto</Badge>
  )
}

function Metrica({ etiqueta, valor }: { etiqueta: string; valor: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="font-mono text-lg font-semibold tabular-nums">{valor}</span>
      <span className="text-xs text-muted-foreground">{etiqueta}</span>
    </div>
  )
}

/** Card de un cierre semanal (solo lectura): transparencia de "qué me van a cobrar". */
export function CierreCard({ cierre }: { cierre: Cierre }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <header className="flex items-center justify-between gap-2">
          <h3 className="font-medium">{rangoSemanaLegible(deISO(cierre.semana_inicio))}</h3>
          <BadgeEstado estado={cierre.estado} />
        </header>

        <dl className="grid grid-cols-3 gap-2">
          <Metrica etiqueta="Comprometidas" valor={cierre.comprometidas} />
          <Metrica etiqueta="Extras" valor={cierre.extras} />
          <Metrica etiqueta="Consumidas" valor={cierre.consumidas} />
        </dl>

        <div className="flex items-baseline justify-between border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">Monto</span>
          <span className="font-mono text-lg font-semibold tabular-nums">
            {formatearMoneda(cierre.monto_total)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
