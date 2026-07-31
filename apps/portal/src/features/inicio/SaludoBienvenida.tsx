import { useOutletContext } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { useMiColaborador } from '../colaborador/queries'
import { useMiPerfil } from '../cuenta/queries'
import { useMiEmpresa } from '../empresa/queries'
import { describirClima, emojiPorHora, primerNombre, saludoPorHora } from './logica'
import { useClima } from './queries'

/**
 * Saludo personalizado del Inicio (colaborador y admin): saludo según la hora + nombre + la
 * empresa a la que pertenece, con un resumen de la fecha y el clima actual (si el usuario
 * permite la ubicación). Saludo neutro (sin género) — no hay dato de sexo en la BD.
 */
export function SaludoBienvenida() {
  const { esComensal } = useOutletContext<ContextoAcceso>()
  const { data: perfil } = useMiPerfil()
  const { data: colaborador } = useMiColaborador()
  // La empresa del admin solo se pide si NO es comensal (para comensales viene del colaborador).
  const { data: miEmpresa } = useMiEmpresa({ enabled: !esComensal })
  const { data: clima } = useClima()

  const ahora = new Date()
  const hora = ahora.getHours()
  const nombre = primerNombre(perfil?.nombre)
  const empresa =
    colaborador?.empresa?.nombre ??
    miEmpresa?.empresa?.nombre_comercial ??
    miEmpresa?.datosFiscales?.razon_social ??
    null

  const fecha = ahora.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const fechaCap = fecha.charAt(0).toUpperCase() + fecha.slice(1)
  const c = clima ? describirClima(clima.codigo) : null

  return (
    <section className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
            {saludoPorHora(hora)}
            {nombre ? `, ${nombre}` : ''} {emojiPorHora(hora)}
          </p>
          {empresa && (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-salvia-600">
              <Building2 className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{empresa}</span>
            </p>
          )}
        </div>
        {clima && c && (
          <span className="flex shrink-0 items-center gap-1 text-base font-semibold tabular-nums">
            <span aria-hidden className="text-xl leading-none">
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
