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
import { Tabs, TabsList, TabsTrigger } from '@amena/ui/components/ui/tabs'
import { TooltipProvider } from '@amena/ui/components/ui/tooltip'
import { toast } from 'sonner'
import {
  aISO,
  deISO,
  diasHabiles,
  etiquetaDia,
  etiquetaMes,
  lunesDeSemana,
  rangoSemanaLegible,
} from '@amena/utils'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { CopiarSemanaDialog } from './CopiarSemanaDialog'
import { DiaColumna } from './DiaColumna'
import { semanasDelMes } from './logica'
import { useAgregarPlatillo, useMenuRango, useMenuSemana, useQuitarMenuDia } from './queries'
import { VistaMes } from './VistaMes'
import { usePlatillos } from '../platillos/queries'

type Vista = 'semana' | 'mes'

function moverLunes(lunesISO: string, deltaSemanas: number): string {
  const lunes = deISO(lunesISO)
  lunes.setDate(lunes.getDate() + deltaSemanas * 7)
  return aISO(lunes)
}

function moverMes(mesISO: string, deltaMeses: number): string {
  const d = deISO(mesISO)
  d.setMonth(d.getMonth() + deltaMeses, 1)
  return aISO(d)
}

export function MenuSemanalPage() {
  const { rol } = useOutletContext<ContextoAcceso>()
  const [vista, setVista] = useState<Vista>('semana')
  const [lunesISO, setLunesISO] = useState(() => aISO(lunesDeSemana(new Date())))
  const [mesISO, setMesISO] = useState(() => {
    const hoy = new Date()
    return aISO(new Date(hoy.getFullYear(), hoy.getMonth(), 1))
  })
  const [diaMovil, setDiaMovil] = useState(0)
  const [copiando, setCopiando] = useState(false)

  const esMes = vista === 'mes'
  const semanas = semanasDelMes(deISO(mesISO))
  const desdeMes = aISO(semanas[0])
  const hastaMes = aISO(diasHabiles(semanas[semanas.length - 1])[4])

  const semanaQuery = useMenuSemana(lunesISO, !esMes)
  const mesQuery = useMenuRango(desdeMes, hastaMes, esMes)
  const activa = esMes ? mesQuery : semanaQuery

  const { data: catalogo } = usePlatillos()
  const agregar = useAgregarPlatillo()
  const quitar = useQuitarMenuDia()

  if (rol !== 'super_admin') {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  const dias = diasHabiles(deISO(lunesISO))
  const activos = (catalogo ?? []).filter((p) => p.activo)
  const menu = activa.data ?? []
  const asignadosDe = (fechaISO: string) => menu.filter((m) => m.fecha === fechaISO)
  const semanaVacia = !esMes && menu.length === 0

  const irSemana = (delta: number) => {
    setLunesISO((prev) => moverLunes(prev, delta))
    setDiaMovil(0)
  }
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
        {/* Filtro de vista + navegador del periodo */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Tabs value={vista} onValueChange={(v) => setVista(v as Vista)}>
            <TabsList>
              <TabsTrigger value="semana">Semana</TabsTrigger>
              <TabsTrigger value="mes">Mes</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            {esMes ? (
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
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => irSemana(-1)}
                  aria-label="Semana anterior"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="min-w-36 text-center text-sm font-medium">
                  {rangoSemanaLegible(deISO(lunesISO))}
                </span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => irSemana(1)}
                  aria-label="Semana siguiente"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </header>

        {activa.isLoading ? (
          <SemanaSkeleton />
        ) : activa.isError ? (
          <EstadoError onReintentar={() => activa.refetch()} />
        ) : esMes ? (
          <VistaMes
            semanas={semanas}
            menu={menu}
            activos={activos}
            onAgregar={onAgregar}
            onQuitar={onQuitar}
          />
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
                <span className="text-sm font-medium capitalize">
                  {etiquetaDia(dias[diaMovil])}
                </span>
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
