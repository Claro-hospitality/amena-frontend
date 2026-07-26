import { useNavigate, useOutletContext } from 'react-router-dom'
import { QrCode } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { EstadoHoy } from '../colaborador/EstadoHoy'
import { useEstadoHoy } from '../colaborador/queries'

/**
 * Inicio: para el comensal, el estado de su cuota de hoy + acceso directo a su QR. El menú
 * semanal vive en su propia sección ("Menú"). Un admin que no es comensal ve un saludo breve
 * (su trabajo está en "Empresa").
 */
export function InicioPage() {
  const { esComensal } = useOutletContext<ContextoAcceso>()
  const navigate = useNavigate()
  const { data: estado } = useEstadoHoy()

  if (!esComensal) {
    return (
      <p className="mx-auto w-full max-w-md text-sm text-muted-foreground">
        Gestiona a tu equipo y tus consumos desde la sección{' '}
        <strong className="font-medium text-foreground">Empresa</strong>.
      </p>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5">
      <section className="flex flex-col gap-3">
        {estado && <EstadoHoy estado={estado} />}
        <Button size="lg" className="h-12 w-full" onClick={() => navigate('/mi-qr')}>
          <QrCode className="size-5" />
          Mostrar mi QR
        </Button>
      </section>
    </div>
  )
}
