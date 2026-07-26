import { useOutletContext } from 'react-router-dom'
import { TriangleAlert } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import { Card, CardContent } from '@amena/ui/components/ui/card'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { useFacturas } from './queries'
import { TablaFacturas } from './TablaFacturas'

/** Listado global de facturas (super_admin y finanzas). La RLS del backend hace el filtrado real. */
export function FacturasPage() {
  const { rol } = useOutletContext<ContextoAcceso>()
  const { data, isLoading, isError, refetch } = useFacturas()

  if (rol !== 'super_admin' && rol !== 'finanzas') {
    return <p className="text-sm text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  return (
    <div className="flex flex-col gap-4 md:min-h-0 md:flex-1">
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError ? (
        <Card className="shadow-none">
          <CardContent className="flex flex-col items-start gap-3 p-5">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <TriangleAlert className="size-4" />
              No se pudieron cargar las facturas.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TablaFacturas facturas={data ?? []} conEmpresa />
      )}
    </div>
  )
}
