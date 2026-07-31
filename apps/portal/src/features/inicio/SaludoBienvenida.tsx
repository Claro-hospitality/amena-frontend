import { useMiPerfil } from '../cuenta/queries'
import { describirClima, emojiPorHora, primerNombre, saludoPorHora } from './logica'
import { useClima } from './queries'

/**
 * Saludo personalizado del Inicio (colaborador y admin): saludo según la hora + nombre, con un
 * resumen de la fecha y el clima actual (si el usuario permite la ubicación). Saludo neutro
 * (sin género) — no hay dato de sexo en la BD.
 */
export function SaludoBienvenida() {
  const { data: perfil } = useMiPerfil()
  const { data: clima } = useClima()

  const ahora = new Date()
  const nombre = primerNombre(perfil?.nombre)
  const hora = ahora.getHours()
  const fecha = ahora.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const fechaCap = fecha.charAt(0).toUpperCase() + fecha.slice(1)
  const c = clima ? describirClima(clima.codigo) : null

  return (
    <section className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-lg font-semibold leading-tight">
          {saludoPorHora(hora)}
          {nombre ? `, ${nombre}` : ''} {emojiPorHora(hora)}
        </p>
        {clima && c && (
          <span className="flex shrink-0 items-center gap-1 text-sm font-medium tabular-nums">
            <span aria-hidden className="text-base leading-none">
              {c.emoji}
            </span>
            {clima.tempC}°
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {fechaCap}
        {c ? ` · ${c.texto}` : ''}
      </p>
    </section>
  )
}
