import { Badge } from '@amena/ui/components/ui/badge'
import { Card, CardContent } from '@amena/ui/components/ui/card'
import { aISO, esFechaPasada, etiquetaDia } from '@amena/utils'
import type { ConsumoSemana, CuotaSemana } from './api'
import { estaConsumida } from './logica'

export function DiaResumen({
  fecha,
  cuotas,
  consumos,
}: {
  fecha: Date
  cuotas: CuotaSemana[]
  consumos: ConsumoSemana[]
}) {
  const pasado = esFechaPasada(fecha)
  const iso = aISO(fecha)
  const consumidas = cuotas.filter((q) => estaConsumida(q.colaborador.id, iso, consumos)).length
  const disponibles = cuotas.length - consumidas

  return (
    <Card className={pasado ? 'bg-muted/30' : undefined}>
      <CardContent className="flex flex-col gap-2 p-4">
        <header className="flex items-center justify-between gap-2">
          <h3 className="font-medium capitalize">{etiquetaDia(fecha)}</h3>
          {pasado && <span className="text-xs text-muted-foreground">Pasado</span>}
        </header>

        {cuotas.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sin comidas declaradas</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {cuotas.length} {cuotas.length === 1 ? 'comida' : 'comidas'} · {consumidas} consumidas
              / {disponibles} disponibles
            </p>
            <ul className="flex flex-col gap-1.5">
              {cuotas.map((q) => {
                const consumida = estaConsumida(q.colaborador.id, iso, consumos)
                return (
                  <li key={q.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="min-w-0 truncate">{q.colaborador.nombre}</span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      {q.origen === 'extra' && (
                        <Badge className="border-transparent bg-warning text-warning-foreground">
                          Extra
                        </Badge>
                      )}
                      {consumida ? (
                        <Badge className="border-transparent bg-success text-success-foreground">
                          Consumida
                        </Badge>
                      ) : (
                        <Badge variant="outline">Disponible</Badge>
                      )}
                    </span>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  )
}
