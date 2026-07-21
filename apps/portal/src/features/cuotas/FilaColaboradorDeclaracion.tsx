import { Button } from '@amena/ui/components/ui/button'
import { Card, CardContent } from '@amena/ui/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@amena/ui/components/ui/toggle-group'
import { aISO, esFechaPasada, etiquetaDiaCorta } from '@amena/utils'

/**
 * Un colaborador con sus toggles de días (L–V). Las fechas ya declaradas van
 * pre-seleccionadas y deshabilitadas (la RPC no cancela); solo se agregan nuevas.
 */
export function FilaColaboradorDeclaracion({
  colaborador,
  dias,
  yaDeclaradas,
  seleccion,
  onCambio,
}: {
  colaborador: { id: number; nombre: string }
  dias: Date[]
  yaDeclaradas: Set<string>
  seleccion: Set<string>
  onCambio: (fechas: string[]) => void
}) {
  const valor = [...yaDeclaradas, ...seleccion]
  const seleccionables = dias
    .filter((d) => !esFechaPasada(d) && !yaDeclaradas.has(aISO(d)))
    .map(aISO)

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="min-w-0 truncate font-medium">{colaborador.nombre}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCambio(seleccionables)}
            disabled={seleccionables.length === 0}
          >
            Toda la semana
          </Button>
        </div>
        <ToggleGroup
          value={valor}
          onValueChange={(vals) => onCambio(vals.filter((v) => !yaDeclaradas.has(v)))}
          className="flex-wrap"
          aria-label={`Días de ${colaborador.nombre}`}
        >
          {dias.map((d) => {
            const iso = aISO(d)
            const bloqueada = esFechaPasada(d) || yaDeclaradas.has(iso)
            return (
              <ToggleGroupItem
                key={iso}
                value={iso}
                variant="outline"
                disabled={bloqueada}
                aria-label={etiquetaDiaCorta(d)}
                className="h-11 min-w-16 capitalize"
              >
                {etiquetaDiaCorta(d)}
              </ToggleGroupItem>
            )
          })}
        </ToggleGroup>
      </CardContent>
    </Card>
  )
}
