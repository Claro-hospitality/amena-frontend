import { Link, useOutletContext } from 'react-router-dom'
import { ArrowLeft, TriangleAlert, UtensilsCrossed } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@amena/ui/components/ui/empty'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { horaCorta } from '@amena/utils'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { useConsumosHoy } from './queries'

export function ListaConsumosHoy() {
  const { rol } = useOutletContext<ContextoAcceso>()
  const { data, isLoading, isError, refetch } = useConsumosHoy()

  if (rol !== 'mesero' && rol !== 'super_admin') {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  const consumos = data ?? []

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <header className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" nativeButton={false} render={<Link to="/escaner" />} aria-label="Volver al escáner">
          <ArrowLeft className="size-4" />
        </Button>
        {!isLoading && !isError && (
          <span className="ml-auto text-sm text-muted-foreground">{consumos.length} en total</span>
        )}
      </header>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : isError ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TriangleAlert className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No se pudo cargar</EmptyTitle>
            <EmptyDescription>Ocurrió un error al consultar los consumos.</EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" onClick={() => refetch()}>
            Reintentar
          </Button>
        </Empty>
      ) : consumos.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UtensilsCrossed className="size-6" />
            </EmptyMedia>
            <EmptyTitle>Aún no hay comidas hoy</EmptyTitle>
            <EmptyDescription>Los consumos aparecerán aquí conforme escanees.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex flex-col divide-y divide-border overflow-y-auto rounded-lg border border-border">
          {consumos.map((c) => (
            <li key={c.id} className="flex items-center gap-3 px-4 py-3">
              <span className="w-14 shrink-0 font-mono text-sm tabular-nums text-muted-foreground">
                {horaCorta(new Date(c.created_at))}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">
                {c.comensal?.usuario?.nombre ?? 'Comensal'}
              </span>
              {c.empresa?.nombre && (
                <span className="min-w-0 max-w-[40%] truncate text-sm text-muted-foreground">
                  {c.empresa.nombre}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
