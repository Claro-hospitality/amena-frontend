import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Maximize2, QrCode, TriangleAlert } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@amena/ui/components/ui/empty'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { CredencialImprimible } from '../colaboradores/CredencialImprimible'
import { HistorialComidas } from './HistorialComidas'
import { QrPantallaCompleta } from './QrPantallaCompleta'
import { useMiColaborador } from './queries'

/**
 * Página "Mi QR" (ruta /mi-qr), común a colaborador y admin: la credencial QR arriba
 * (protagonista) y, para quien es comensal, su historial de comidas debajo.
 */
export function MiCredencialPage() {
  const { esComensal } = useOutletContext<ContextoAcceso>()
  return (
    <>
      <MiCredencial />
      {esComensal && <HistorialComidas />}
    </>
  )
}

/**
 * Credencial del usuario logueado: QR + "mostrar en grande". Reutilizable en la
 * página /mi-qr y en el Inicio del admin que además es comensal. Si la cuenta no
 * es comensal, muestra un mensaje claro (sin error).
 */
export function MiCredencial() {
  const { data: colaborador, isLoading, isError, refetch } = useMiColaborador()
  const [qrGrande, setQrGrande] = useState(false)

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 text-center">
        <TriangleAlert className="size-8 text-muted-foreground" />
        <p className="text-muted-foreground">No se pudo cargar tu credencial.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    )
  }

  // Un admin que no es comensal no tiene QR: mensaje claro, sin error.
  if (!colaborador) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <QrCode className="size-6" />
          </EmptyMedia>
          <EmptyTitle>No tienes una credencial</EmptyTitle>
          <EmptyDescription>
            Tu cuenta no está registrada como comensal, así que no tiene un QR para consumir.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5">
      <section className="flex flex-col items-center gap-3">
        <CredencialImprimible colaborador={colaborador} />
        <Button
          size="lg"
          className="h-12 w-full"
          onClick={() => setQrGrande(true)}
          disabled={!colaborador.qr_token}
        >
          <Maximize2 className="size-5" />
          Mostrar en grande
        </Button>
      </section>

      {qrGrande && colaborador.qr_token && (
        <QrPantallaCompleta
          valor={colaborador.qr_token}
          nombre={colaborador.nombre}
          onCerrar={() => setQrGrande(false)}
        />
      )}
    </div>
  )
}
