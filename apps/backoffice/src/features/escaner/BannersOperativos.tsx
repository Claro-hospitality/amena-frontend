import { CalendarX, UtensilsCrossed } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@amena/ui/components/ui/alert'
import { useEstadoOperativo } from './queries'

/**
 * Avisos de borde del turno (no intrusivos): sin menú cargado y/o sin cuotas declaradas para
 * hoy. Consulta ligera (`estado_operativo_dia`); si todo está bien no muestra nada.
 */
export function BannersOperativos() {
  const { data } = useEstadoOperativo()
  if (!data || (data.hay_menu && data.hay_cuotas)) return null

  return (
    <div className="flex flex-col gap-2">
      {!data.hay_menu && (
        <Alert variant="warning">
          <UtensilsCrossed />
          <AlertTitle>Hoy no hay menú cargado</AlertTitle>
          <AlertDescription>
            Pide a cocina o al backoffice cargar el menú del día.
          </AlertDescription>
        </Alert>
      )}
      {!data.hay_cuotas && (
        <Alert variant="info">
          <CalendarX />
          <AlertTitle>Hoy no hay cuotas declaradas</AlertTitle>
          <AlertDescription>
            Los QR de modo declaración serán rechazados hasta que se declaren cuotas.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
