import { TriangleAlert } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import { Card, CardContent } from '@amena/ui/components/ui/card'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { useFacturasEmpresa } from './queries'
import { TablaFacturas } from './TablaFacturas'

/** Sección de facturas de una empresa (tab del detalle de empresa). Solo lectura + descarga. */
export function FacturasSeccion({ empresaId, fillHeight }: { empresaId: number; fillHeight?: boolean }) {
  const { data, isLoading, isError, refetch } = useFacturasEmpresa(empresaId)

  return (
    <section className={`flex flex-col gap-3 ${fillHeight ? 'min-h-0 flex-1' : ''}`}>
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
        <TablaFacturas facturas={data ?? []} conEmpresa={false} />
      )}
    </section>
  )
}
