import { QrCode } from 'lucide-react'
import { Badge } from '@amena/ui/components/ui/badge'
import { Button } from '@amena/ui/components/ui/button'
import { Card, CardContent } from '@amena/ui/components/ui/card'
import { AccionesColaborador, BotonInvitar, ToggleConsumoLibre } from './ColaboradorAcciones'
import { empresaEnModoLibre, type Colaborador } from './api'

/** Tarjeta de colaborador para la vista móvil (mobile-first). */
export function ColaboradorCard({
  colaborador,
  onVerQR,
  onEditar,
  onResetear,
  onToggleAcceso,
  onEliminar,
}: {
  colaborador: Colaborador
  onVerQR: (colaborador: Colaborador) => void
  onEditar: (colaborador: Colaborador) => void
  onResetear: (colaborador: Colaborador) => void
  onToggleAcceso: (colaborador: Colaborador) => void
  onEliminar: (colaborador: Colaborador) => void
}) {
  const conAcceso = colaborador.user_id != null

  return (
    <Card className={colaborador.activo ? undefined : 'opacity-60'}>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{colaborador.nombre}</p>
          {colaborador.email && (
            <p className="truncate text-sm text-muted-foreground">{colaborador.email}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {colaborador.activo ? (
              <Badge className="bg-success text-success-foreground">Activo</Badge>
            ) : (
              <Badge variant="destructive">Inactivo</Badge>
            )}
            {!conAcceso ? (
              <Badge variant="outline">Sin acceso al portal</Badge>
            ) : colaborador.accesoActivo ? (
              <Badge variant="outline">Con acceso</Badge>
            ) : (
              <Badge variant="secondary">Acceso desactivado</Badge>
            )}
            {empresaEnModoLibre(colaborador) && colaborador.consumoLibre && (
              <Badge className="bg-success text-success-foreground">Consumo libre</Badge>
            )}
            <BotonInvitar colaborador={colaborador} />
          </div>
          {empresaEnModoLibre(colaborador) && (
            <div className="mt-3">
              <ToggleConsumoLibre colaborador={colaborador} />
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="min-h-11"
            onClick={() => onVerQR(colaborador)}
          >
            <QrCode className="size-4" />
            Ver QR
          </Button>
          <AccionesColaborador
            colaborador={colaborador}
            onEditar={onEditar}
            onResetear={onResetear}
            onToggleAcceso={onToggleAcceso}
            onEliminar={onEliminar}
          />
        </div>
      </CardContent>
    </Card>
  )
}
