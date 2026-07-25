import { useNavigate, useOutletContext } from 'react-router-dom'
import { QrCode } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { EstadoHoy } from '../colaborador/EstadoHoy'
import { MenuSemanal } from '../colaborador/MenuSemanal'
import { useEstadoHoy } from '../colaborador/queries'

/**
 * Inicio común a colaborador y admin: el menú semanal (lun–vie) y, para quien es comensal,
 * el estado de su cuota de hoy con acceso directo a su QR. Un admin que no es comensal ve
 * solo el menú.
 */
export function InicioPage() {
  const { esComensal } = useOutletContext<ContextoAcceso>()
  const navigate = useNavigate()
  const { data: estado } = useEstadoHoy()

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5">
      {esComensal && (
        <section className="flex flex-col gap-3">
          {estado && <EstadoHoy estado={estado} />}
          <Button size="lg" className="h-12 w-full" onClick={() => navigate('/mi-qr')}>
            <QrCode className="size-5" />
            Mostrar mi QR
          </Button>
        </section>
      )}

      <MenuSemanal />
    </div>
  )
}
