import { useOutletContext } from 'react-router-dom'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { EstadoHoy } from '../colaborador/EstadoHoy'
import { ResumenSemana } from '../colaborador/ResumenSemana'
import { useEstadoHoy } from '../colaborador/queries'
import { SaludoBienvenida } from './SaludoBienvenida'

/**
 * Inicio: saludo personalizado (hora + nombre + empresa + clima) para todos. Para el comensal,
 * además el estado de su cuota de hoy y el resumen de la semana. El QR vive en su pestaña
 * "Mi QR"; un admin que no es comensal ve un enlace a "Empresa".
 */
export function InicioPage() {
  const { esComensal } = useOutletContext<ContextoAcceso>()
  const { data: estado } = useEstadoHoy()

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5">
      <SaludoBienvenida />

      {esComensal ? (
        <>
          {estado && <EstadoHoy estado={estado} />}
          <ResumenSemana />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Gestiona a tu equipo y tus consumos desde la sección{' '}
          <strong className="font-medium text-foreground">Empresa</strong>.
        </p>
      )}
    </div>
  )
}
