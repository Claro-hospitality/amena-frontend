import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ScanLine } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { useAuth } from '../../auth/useAuth'
import { EscanerDialog } from './EscanerDialog'
import { ListaConsumosHoy } from './ListaConsumosHoy'
import { useConsumosRealtime } from './realtime'

/**
 * Sección del escáner. Al entrar muestra la lista de comidas de hoy; la cámara vive en un
 * dialog que se abre con el botón "Escanear" (no se enciende sola, para no sobrecargar la
 * tablet). Realtime mantiene la lista al día.
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
      <Button size="lg" className="min-h-14 w-full text-base" onClick={() => setDialogAbierto(true)}>
        <ScanLine className="size-5" />
        Escanear QR
      </Button>

      <ListaConsumosHoy />

      <EscanerDialog
        open={dialogAbierto}
        onOpenChange={setDialogAbierto}
        registradoPor={registradoPor}
      />
    </div>
  )
}
