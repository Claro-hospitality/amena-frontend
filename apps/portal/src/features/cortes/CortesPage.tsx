import { useOutletContext } from 'react-router-dom'
import { ClipboardCheck, TriangleAlert } from 'lucide-react'
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
import { CorteCard } from './CorteCard'
import { useMisCortes } from './queries'

export function CortesPage() {
  const { tipo } = useOutletContext<ContextoAcceso>()
  const { data: cortes, isLoading, isError, refetch } = useMisCortes()

  if (tipo !== 'admin_empresa') {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Resumen semanal de consumo y monto de tu empresa.
      </p>

      {isLoading ? (
        <ListaSkeleton />
      ) : isError ? (
        <EstadoError onReintentar={() => refetch()} />
      ) : cortes && cortes.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {cortes.map((c) => (
            <CorteCard key={c.id} corte={c} />
          ))}
        </div>
      ) : (
        <CortesVacio />
      )}
    </div>
  )
}

function ListaSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-40 w-full" />
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
        <EmptyTitle>No se pudieron cargar los cortes</EmptyTitle>
        <EmptyDescription>Ocurrió un error al consultar tus cortes.</EmptyDescription>
      </EmptyHeader>
      <Button variant="outline" onClick={onReintentar}>
        Reintentar
      </Button>
    </Empty>
  )
}

function CortesVacio() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ClipboardCheck className="size-6" />
        </EmptyMedia>
        <EmptyTitle>Aún no hay cortes de tu empresa</EmptyTitle>
        <EmptyDescription>
          Aparecerán aquí al terminar cada semana, con el desglose y el monto.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
