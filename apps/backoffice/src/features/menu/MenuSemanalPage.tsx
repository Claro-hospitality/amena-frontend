import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Copy, TriangleAlert } from 'lucide-react'
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
import { aISO, deISO, diasHabiles, etiquetaDia, lunesDeSemana } from '@amena/utils'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { CopiarSemanaDialog } from './CopiarSemanaDialog'
import { DiaColumna } from './DiaColumna'
import { NavegadorSemana } from './NavegadorSemana'
import { useAgregarPlatillo, useMenuSemana, useQuitarMenuDia } from './queries'
import { usePlatillos } from '../platillos/queries'

function moverLunes(lunesISO: string, deltaSemanas: number): string {
  const lunes = deISO(lunesISO)
  lunes.setDate(lunes.getDate() + deltaSemanas * 7)
  return aISO(lunes)
}

export function MenuSemanalPage() {
  const { rol } = useOutletContext<ContextoAcceso>()
  const [lunesISO, setLunesISO] = useState(() => aISO(lunesDeSemana(new Date())))
  const [diaMovil, setDiaMovil] = useState(0)
  const [copiando, setCopiando] = useState(false)

  const { data: menu, isLoading, isError, refetch } = useMenuSemana(lunesISO)
  const { data: catalogo } = usePlatillos()
  const agregar = useAgregarPlatillo(lunesISO)
  const quitar = useQuitarMenuDia(lunesISO)

  if (rol !== 'super_admin') {
    return <p className="p-6 text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  const dias = diasHabiles(deISO(lunesISO))
  const activos = (catalogo ?? []).filter((p) => p.activo)
  const asignadosDe = (fechaISO: string) => (menu ?? []).filter((m) => m.fecha === fechaISO)
  const semanaVacia = (menu ?? []).length === 0

  const irSemana = (delta: number) => {
    setLunesISO((prev) => moverLunes(prev, delta))
    setDiaMovil(0)
  }
  const onAgregar = (fecha: string, platilloId: string) =>
    agregar.mutate(
      { fecha, platilloId },
      { onError: () => toast.error('No se pudo agregar el platillo. Intenta de nuevo.') }
    )
  const onQuitar = (id: string) =>
    quitar.mutate(id, {
      onError: () => toast.error('No se pudo quitar el platillo. Intenta de nuevo.'),
    })

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold">Menú semanal</h1>
          <NavegadorSemana
            lunesISO={lunesISO}
            onAnterior={() => irSemana(-1)}
            onSiguiente={() => irSemana(1)}
          />
        </header>

        {isLoading ? (
          <SemanaSkeleton />
        ) : isError ? (
          <EstadoError onReintentar={() => refetch()} />
        ) : (
          <>
            {semanaVacia && (
              <Empty className="border border-dashed border-border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Copy className="size-6" />
                  </EmptyMedia>
                  <EmptyTitle>Esta semana no tiene menú</EmptyTitle>
                  <EmptyDescription>
                    Agrega platillos a cada día o copia el menú de la semana anterior.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button variant="outline" onClick={() => setCopiando(true)}>
                    <Copy className="size-4" />
                    Copiar semana anterior
                  </Button>
                </EmptyContent>
              </Empty>
            )}

            {/* Desktop: semana completa (lun–vie) */}
            <div className="hidden gap-3 md:grid md:grid-cols-5">
              {dias.map((dia) => {
                const fechaISO = aISO(dia)
                return (
                  <DiaColumna
                    key={fechaISO}
                    fecha={dia}
                    asignados={asignadosDe(fechaISO)}
                    activos={activos}
                    onAgregar={onAgregar}
                    onQuitar={onQuitar}
                  />
                )
              })}
            </div>

            {/* Móvil/tablet: un día navegable */}
            <div className="flex flex-col gap-3 md:hidden">
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDiaMovil((i) => Math.max(0, i - 1))}
                  disabled={diaMovil === 0}
                >
                  <ChevronLeft className="size-4" />
                  Anterior
                </Button>
                <span className="text-sm font-medium capitalize">{etiquetaDia(dias[diaMovil])}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDiaMovil((i) => Math.min(4, i + 1))}
                  disabled={diaMovil === 4}
                >
                  Siguiente
                  <ChevronRight className="size-4" />
                </Button>
              </div>
              <DiaColumna
                fecha={dias[diaMovil]}
                asignados={asignadosDe(aISO(dias[diaMovil]))}
                activos={activos}
                onAgregar={onAgregar}
                onQuitar={onQuitar}
              />
            </div>
          </>
        )}
      </div>

      {copiando && <CopiarSemanaDialog lunesISO={lunesISO} onClose={() => setCopiando(false)} />}
    </TooltipProvider>
  )
}

function SemanaSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-48 w-full" />
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
        <EmptyTitle>No se pudo cargar el menú</EmptyTitle>
        <EmptyDescription>Ocurrió un error al consultar la semana.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={onReintentar}>
          Reintentar
        </Button>
      </EmptyContent>
    </Empty>
  )
}
