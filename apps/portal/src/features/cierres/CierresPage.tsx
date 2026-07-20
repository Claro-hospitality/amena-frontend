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
import { CierreCard } from './CierreCard'
import { useMisCierres } from './queries'

export function CierresPage() {
  const { tipo } = useOutletContext<ContextoAcceso>()
  const { data: cierres, isLoading, isError, refetch } = useMisCierres()

  if (tipo !== 'admin_empresa') {
    return <p className="p-6 text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <header>
        <h1 className="text-xl font-semibold">Cierres</h1>
        <p className="text-sm text-muted-foreground">
          Resumen semanal de consumo y monto de tu empresa.
        </p>
      </header>

      {isLoading ? (
        <ListaSkeleton />
      ) : isError ? (
        <EstadoError onReintentar={() => refetch()} />
      ) : cierres && cierres.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {cierres.map((c) => (
            <CierreCard key={c.id} cierre={c} />
          ))}
        </div>
      ) : (
        <CierresVacio />
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
        <EmptyTitle>No se pudieron cargar los cierres</EmptyTitle>
        <EmptyDescription>Ocurrió un error al consultar tus cierres.</EmptyDescription>
      </EmptyHeader>
      <Button variant="outline" onClick={onReintentar}>
        Reintentar
      </Button>
    </Empty>
  )
}

function CierresVacio() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ClipboardCheck className="size-6" />
        </EmptyMedia>
        <EmptyTitle>Aún no hay cierres de tu empresa</EmptyTitle>
        <EmptyDescription>
          Aparecerán aquí al terminar cada semana, con el desglose y el monto.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
