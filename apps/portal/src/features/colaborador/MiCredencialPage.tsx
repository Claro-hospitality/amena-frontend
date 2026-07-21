import { useState } from 'react'
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
import { CredencialImprimible } from '../colaboradores/CredencialImprimible'
import { QrPantallaCompleta } from './QrPantallaCompleta'
import { useMiColaborador } from './queries'

/**
 * "Mi QR": la credencial del usuario logueado. Pensada para un admin que además
 * es comensal (el colaborador ya la ve en su Inicio). Muestra el QR y permite
 * ampliarlo a pantalla completa para escanearlo.
 */
export function MiCredencialPage() {
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
