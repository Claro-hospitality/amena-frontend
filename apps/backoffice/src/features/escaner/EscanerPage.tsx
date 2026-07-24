import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ScanLine } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { useAuth } from '../../auth/useAuth'
import { BannersOperativos } from './BannersOperativos'
import { EscanerDialog } from './EscanerDialog'
import { ListaConsumosHoy } from './ListaConsumosHoy'
import { RegistroManual } from './RegistroManual'
import { ResumenTurno } from './ResumenTurno'
import { useConsumosRealtime } from './realtime'

/**
 * Centro de turno del mesero. Arriba: avisos + resumen vivo del día. Al centro: el botón
 * protagonista "Escanear" (la cámara vive en un dialog, no se enciende sola). Debajo: el plan B
 * (registro manual por nombre) y la lista del día. Realtime mantiene todo al día.
 */
export function EscanerPage() {
  const { rol } = useOutletContext<ContextoAcceso>()
  const { session } = useAuth()
  const [dialogAbierto, setDialogAbierto] = useState(false)

  useConsumosRealtime()

  if (rol !== 'mesero' && rol !== 'super_admin' && rol !== 'capitan_meseros') {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  const registradoPor = session?.user?.id ?? ''

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <BannersOperativos />
      <ResumenTurno miUid={registradoPor} />

      <Button
        size="lg"
        className="min-h-20 w-full text-lg"
        onClick={() => setDialogAbierto(true)}
      >
        <ScanLine className="size-6" />
        Escanear QR
      </Button>

      <RegistroManual registradoPor={registradoPor} />

      <ListaConsumosHoy />

      <EscanerDialog
        open={dialogAbierto}
        onOpenChange={setDialogAbierto}
        registradoPor={registradoPor}
      />
    </div>
  )
}
