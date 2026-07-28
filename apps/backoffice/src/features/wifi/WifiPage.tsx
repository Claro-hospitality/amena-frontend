import type { LucideIcon } from 'lucide-react'
import { Activity, Gauge, Users, Wifi } from 'lucide-react'
import { Badge } from '@amena/ui/components/ui/badge'

/**
 * Sección WiFi (en construcción). Aquí se administrará el acceso a internet de la red de Amena
 * para los CLIENTES del restaurante: dar acceso a quienes llegan, con un uso razonable (sin
 * consumos excesivos). Placeholder visual mientras se desarrolla.
 */
export function WifiPage() {
  return (
    <div className="mx-auto w-full max-w-3xl py-10 sm:py-14">
      {/* Encabezado con medallón y ondas de señal animadas. */}
      <div className="flex flex-col items-center text-center">
        <div className="relative flex size-24 items-center justify-center">
          <span className="absolute size-16 rounded-full bg-primary/25 motion-safe:animate-ping" aria-hidden />
          <span
            className="absolute size-16 rounded-full bg-primary/20 [animation-delay:600ms] motion-safe:animate-ping"
            aria-hidden
          />
          <span className="relative flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Wifi className="size-8" strokeWidth={2} />
          </span>
        </div>

        <Badge className="mt-7 bg-warning/15 text-warning-foreground">Próximamente</Badge>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          Red WiFi para tus clientes
        </h2>
        <p className="mt-3 max-w-xl text-pretty text-muted-foreground">
          Estamos construyendo esta sección. Aquí vas a administrar el acceso a internet de la red de
          Amena para los <strong className="text-foreground">clientes del restaurante</strong>: darles
          acceso al llegar y asegurar un <strong className="text-foreground">uso razonable</strong>, sin
          consumos excesivos.
        </p>
      </div>

      {/* Lo que incluirá, en tarjetas. */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <TarjetaFuncion
          icon={Users}
          titulo="Acceso de clientes"
          desc="Da y revoca acceso a la red a quienes llegan, de forma simple."
        />
        <TarjetaFuncion
          icon={Gauge}
          titulo="Uso razonable"
          desc="Límites de tiempo o de datos para evitar el consumo excesivo."
        />
        <TarjetaFuncion
          icon={Activity}
          titulo="En vivo"
          desc="Mira quién está conectado y el estado de la red al momento."
        />
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        En desarrollo · te avisaremos cuando esté disponible.
      </p>
    </div>
  )
}

function TarjetaFuncion({
  icon: Icon,
  titulo,
  desc,
}: {
  icon: LucideIcon
  titulo: string
  desc: string
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
      <span className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-secondary text-salvia-700">
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <h3 className="font-semibold tracking-tight">{titulo}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  )
}
