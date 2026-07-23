import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ChevronLeft, ChevronRight, TriangleAlert } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@amena/ui/components/ui/empty'
import { TooltipProvider } from '@amena/ui/components/ui/tooltip'
import { toast } from 'sonner'
import { aISO, deISO, diasHabiles, etiquetaMes } from '@amena/utils'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { semanasDelMes } from './logica'
import { useAgregarPlatillo, useMenuRango, useQuitarMenuDia } from './queries'
import { VistaMes } from './VistaMes'
import { usePlatillos } from '../platillos/queries'

function moverMes(mesISO: string, deltaMeses: number): string {
  const d = deISO(mesISO)
  d.setMonth(d.getMonth() + deltaMeses, 1)
  return aISO(d)
}

export function MenuSemanalPage() {
  const { rol } = useOutletContext<ContextoAcceso>()
  const [mesISO, setMesISO] = useState(() => {
    const hoy = new Date()
    return aISO(new Date(hoy.getFullYear(), hoy.getMonth(), 1))
  })

  const semanas = semanasDelMes(deISO(mesISO))
  const desdeMes = aISO(semanas[0])
  const hastaMes = aISO(diasHabiles(semanas[semanas.length - 1])[4])

  const mesQuery = useMenuRango(desdeMes, hastaMes)

  const { data: catalogo } = usePlatillos()
  const agregar = useAgregarPlatillo()
  const quitar = useQuitarMenuDia()

  if (rol !== 'super_admin') {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  const activos = (catalogo ?? []).filter((p) => p.activo)
  const menu = mesQuery.data ?? []

  const onAgregar = (fecha: string, platilloId: number) =>
    agregar.mutate(
      { fecha, platilloId },
      { onError: () => toast.error('No se pudo agregar el platillo. Intenta de nuevo.') }
    )
  const onQuitar = (id: number) =>
    quitar.mutate(id, {
      onError: () => toast.error('No se pudo quitar el platillo. Intenta de nuevo.'),
    })

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4">
        {/* Navegador del mes */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
            Menú mensual
          </h2>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setMesISO((m) => moverMes(m, -1))}
              aria-label="Mes anterior"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-40 text-center text-sm font-medium capitalize">
              {etiquetaMes(deISO(mesISO))}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setMesISO((m) => moverMes(m, 1))}
              aria-label="Mes siguiente"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </header>

        {mesQuery.isLoading ? (
          <MesSkeleton />
        ) : mesQuery.isError ? (
          <EstadoError onReintentar={() => mesQuery.refetch()} />
        ) : (
          <VistaMes
            mes={deISO(mesISO)}
            semanas={semanas}
            menu={menu}
            activos={activos}
            onAgregar={onAgregar}
            onQuitar={onQuitar}
          />
        )}
      </div>
    </TooltipProvider>
  )
}

function MesSkeleton() {
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[720px] grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
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
        <EmptyTitle>No se pudo cargar el menú</EmptyTitle>
        <EmptyDescription>Ocurrió un error al consultar el menú.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={onReintentar}>
          Reintentar
        </Button>
      </EmptyContent>
    </Empty>
  )
}
