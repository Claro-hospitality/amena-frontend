import { useNavigate, useOutletContext } from 'react-router-dom'
import { QrCode } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { EstadoHoy } from '../colaborador/EstadoHoy'
import { useEstadoHoy } from '../colaborador/queries'
import { SaludoBienvenida } from './SaludoBienvenida'

/**
 * Inicio: saludo personalizado (hora + nombre + clima) para todos. Para el comensal, además el
 * estado de su cuota de hoy + acceso directo a su QR. El menú semanal vive en "Menú"; un admin
 * que no es comensal ve un enlace a "Empresa".
 */
export function InicioPage() {
  const { esComensal } = useOutletContext<ContextoAcceso>()
  const navigate = useNavigate()
  const { data: estado } = useEstadoHoy()

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5">
      <SaludoBienvenida />

      {esComensal ? (
        <>
          {estado && <EstadoHoy estado={estado} />}
          {/* CTA principal anclado abajo: aprovecha la pantalla y queda al alcance del pulgar. */}
          <Button
            size="lg"
            className="mt-auto h-14 w-full text-base"
            onClick={() => navigate('/mi-qr')}
          >
            <QrCode className="size-5" />
            Mostrar mi QR
          </Button>
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
