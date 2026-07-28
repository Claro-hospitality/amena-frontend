import { Wifi } from 'lucide-react'
import { Badge } from '@amena/ui/components/ui/badge'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@amena/ui/components/ui/empty'

/**
 * Sección WiFi (en construcción). Aquí se administrará el acceso a internet de la red de Amena
 * para los CLIENTES del restaurante: dar acceso a quienes llegan, con un uso razonable (sin abusos
 * de consumo). Placeholder mientras se desarrolla.
 */
export function WifiPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col py-8">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Wifi className="size-6" />
          </EmptyMedia>
          <Badge className="bg-warning/15 text-warning-foreground">Próximamente</Badge>
          <EmptyTitle>Administración de la red WiFi</EmptyTitle>
          <EmptyDescription>
            Estamos trabajando en esta sección. Aquí vas a poder administrar el acceso a internet de
            la red de Amena para los <strong>clientes del restaurante</strong>: dar acceso a quienes
            llegan y asegurar un <strong>uso razonable</strong> de la red, sin consumos excesivos.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <ul className="mx-auto flex max-w-md flex-col gap-2 text-left text-sm text-muted-foreground">
            <li className="relative pl-5">
              <span className="absolute left-0 top-2 size-1.5 rounded-sm bg-salvia-500" aria-hidden />
              Alta y control de los usuarios/dispositivos conectados a la red.
            </li>
            <li className="relative pl-5">
              <span className="absolute left-0 top-2 size-1.5 rounded-sm bg-salvia-500" aria-hidden />
              Límites de tiempo o de consumo para evitar el uso excesivo.
            </li>
            <li className="relative pl-5">
              <span className="absolute left-0 top-2 size-1.5 rounded-sm bg-salvia-500" aria-hidden />
              Visibilidad de quién está conectado en el momento.
            </li>
          </ul>
        </EmptyContent>
      </Empty>
    </div>
  )
}
