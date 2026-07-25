import { useOutletContext } from 'react-router-dom'
import { FileText, TriangleAlert } from 'lucide-react'
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
import { FacturaCard } from './FacturaCard'
import { useMisFacturas } from './queries'

/** Facturas de la empresa del admin (solo lectura + descarga). */
export function FacturasEmpresaPage() {
  const { tipo } = useOutletContext<ContextoAcceso>()
  const { data: facturas, isLoading, isError, refetch } = useMisFacturas()

  if (tipo !== 'admin_empresa') {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Facturas emitidas a tu empresa. Descarga el PDF o el XML de cada una.
      </p>

      {isLoading ? (
        <ListaSkeleton />
      ) : isError ? (
        <EstadoError onReintentar={() => refetch()} />
      ) : facturas && facturas.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {facturas.map((f) => (
            <FacturaCard key={f.id} factura={f} />
          ))}
        </div>
      ) : (
        <FacturasVacio />
      )}
    </div>
  )
}

function ListaSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-36 w-full" />
      ))}
    </div>
  )
}

function EstadoError({ onReintentar }: { onReintentar: () => void }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlert className="size-6" />
        </EmptyMedia>
        <EmptyTitle>No se pudieron cargar las facturas</EmptyTitle>
        <EmptyDescription>Ocurrió un error al consultar tus facturas.</EmptyDescription>
      </EmptyHeader>
      <Button variant="outline" onClick={onReintentar}>
        Reintentar
      </Button>
    </Empty>
  )
}

function FacturasVacio() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileText className="size-6" />
        </EmptyMedia>
        <EmptyTitle>Aún no hay facturas de tu empresa</EmptyTitle>
        <EmptyDescription>Aparecerán aquí cuando Amena las emita.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
