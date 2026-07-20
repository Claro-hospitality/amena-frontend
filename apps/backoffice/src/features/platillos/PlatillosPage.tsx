import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, TriangleAlert, UtensilsCrossed } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@amena/ui/components/ui/empty'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { TooltipProvider } from '@amena/ui/components/ui/tooltip'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import type { Platillo } from './api'
import { ConfirmarEstadoPlatillo } from './ConfirmarEstadoPlatillo'
import { PlatilloCard } from './PlatilloCard'
import { PlatilloFormDialog } from './PlatilloFormDialog'
import { usePlatillos } from './queries'

type Dialogo = { tipo: 'form'; platillo: Platillo | null } | { tipo: 'estado'; platillo: Platillo }

export function PlatillosPage() {
  const { rol } = useOutletContext<ContextoAcceso>()
  const { data, isLoading, isError, refetch } = usePlatillos()
  const [dialogo, setDialogo] = useState<Dialogo | null>(null)

  if (rol !== 'super_admin') {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  const platillos = data ?? []
  const cerrar = () => setDialogo(null)
  const nuevo = () => setDialogo({ tipo: 'form', platillo: null })

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4">
        <header className="flex items-center justify-end gap-4">
          <Button onClick={nuevo}>
            <Plus className="size-4" />
            Nuevo platillo
          </Button>
        </header>

        {isLoading ? (
          <GridSkeleton />
        ) : isError ? (
          <EstadoError onReintentar={() => refetch()} />
        ) : platillos.length === 0 ? (
          <PlatillosVacio onCrear={nuevo} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {platillos.map((platillo) => (
              <PlatilloCard
                key={platillo.id}
                platillo={platillo}
                onEditar={(p) => setDialogo({ tipo: 'form', platillo: p })}
                onCambiarEstado={(p) => setDialogo({ tipo: 'estado', platillo: p })}
              />
            ))}
          </div>
        )}
      </div>

      {dialogo?.tipo === 'form' && (
        <PlatilloFormDialog
          key={dialogo.platillo?.id ?? 'nuevo'}
          platillo={dialogo.platillo}
          onClose={cerrar}
        />
      )}
      {dialogo?.tipo === 'estado' && (
        <ConfirmarEstadoPlatillo platillo={dialogo.platillo} onClose={cerrar} />
      )}
    </TooltipProvider>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-56 w-full" />
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
        <EmptyTitle>No se pudieron cargar los platillos</EmptyTitle>
        <EmptyDescription>Ocurrió un error al consultar los datos.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={onReintentar}>
          Reintentar
        </Button>
      </EmptyContent>
    </Empty>
  )
}

function PlatillosVacio({ onCrear }: { onCrear: () => void }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UtensilsCrossed className="size-6" />
        </EmptyMedia>
        <EmptyTitle>Aún no hay platillos</EmptyTitle>
        <EmptyDescription>Agrega el primer platillo al catálogo para armar menús.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onCrear}>
          <Plus className="size-4" />
          Nuevo platillo
        </Button>
      </EmptyContent>
    </Empty>
  )
}
