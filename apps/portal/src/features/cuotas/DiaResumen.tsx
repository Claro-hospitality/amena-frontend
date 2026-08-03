import { Badge } from '@amena/ui/components/ui/badge'
import { Card, CardContent } from '@amena/ui/components/ui/card'
import { aISO, esFechaPasada, etiquetaDia } from '@amena/utils'
import type { ConsumoSemana, CuotaSemana, InvitadoSemana } from './api'
import { consumosLibresDelDia, estaConsumida } from './logica'

export function DiaResumen({
  fecha,
  cuotas,
  consumos,
  invitados = [],
}: {
  fecha: Date
  cuotas: CuotaSemana[]
  consumos: ConsumoSemana[]
  invitados?: InvitadoSemana[]
}) {
  const pasado = esFechaPasada(fecha)
  const iso = aISO(fecha)
  const consumidas = cuotas.filter((q) => estaConsumida(q.colaborador.id, iso, consumos)).length
  const disponibles = cuotas.length - consumidas
  // Consumos libres (modo consumo libre): registrados sin cuota que los represente.
  const libres = consumosLibresDelDia(iso, cuotas, consumos)
  const totalLibres = libres.reduce((n, l) => n + l.cantidad, 0)

  return (
    <Card className={pasado ? 'bg-muted/30' : undefined}>
      <CardContent className="flex flex-col gap-2 p-4">
        <header className="flex items-center justify-between gap-2">
          <h3 className="font-medium capitalize">{etiquetaDia(fecha)}</h3>
          {pasado && <span className="text-xs text-muted-foreground">Pasado</span>}
        </header>

        {cuotas.length === 0 && libres.length === 0 && invitados.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sin comidas</p>
        ) : (
          <div className="flex flex-col gap-2">
            {cuotas.length > 0 && (
              <>
                <p className="text-sm text-muted-foreground">
                  {cuotas.length} {cuotas.length === 1 ? 'comida' : 'comidas'} · {consumidas}{' '}
                  consumidas / {disponibles} disponibles
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

            {libres.length > 0 && (
              <>
                <p className="text-sm text-muted-foreground">
                  {totalLibres} {totalLibres === 1 ? 'consumo libre' : 'consumos libres'}
                </p>
                <ul className="flex flex-col gap-1.5">
                  {libres.map((l) => (
                    <li
                      key={l.comensalId}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="min-w-0 truncate">
                        {l.nombre}
                        {l.cantidad > 1 && (
                          <span className="text-muted-foreground"> ·{' '}×{l.cantidad}</span>
                        )}
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <Badge variant="outline">Libre</Badge>
                        <Badge className="border-transparent bg-success text-success-foreground">
                          Consumida
                        </Badge>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {invitados.length > 0 && (
              <>
                <p className="text-sm text-muted-foreground">
                  {invitados.length} {invitados.length === 1 ? 'invitado' : 'invitados'}
                </p>
                <ul className="flex flex-col gap-1.5">
                  {invitados.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="min-w-0 truncate">
                          {p.nombre}
                          {p.apellido ? ` ${p.apellido}` : ''}
                        </span>
                        <Badge variant="secondary" className="shrink-0">
                          Invitado
                        </Badge>
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <Badge className="border-transparent bg-warning text-warning-foreground">
                          Extra
                        </Badge>
                        {p.estado === 'usado' ? (
                          <Badge className="border-transparent bg-success text-success-foreground">
                            Consumida
                          </Badge>
                        ) : (
                          <Badge variant="outline">Disponible</Badge>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
