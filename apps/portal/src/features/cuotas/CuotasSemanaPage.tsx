import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { CalendarPlus, Plus, TriangleAlert } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@amena/ui/components/ui/empty'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { aISO, deISO, diasHabiles, esFechaPasada, lunesDeSemana } from '@amena/utils'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { AgregarExtraDialog } from './AgregarExtraDialog'
import { DiaResumen } from './DiaResumen'
import { NavegadorSemana } from './NavegadorSemana'
import { useConsumosSemana, useCuotasSemana } from './queries'

function moverLunes(lunesISO: string, deltaSemanas: number): string {
  const lunes = deISO(lunesISO)
  lunes.setDate(lunes.getDate() + deltaSemanas * 7)
  return aISO(lunes)
}

export function CuotasSemanaPage() {
  const { tipo } = useOutletContext<ContextoAcceso>()
  const [lunesISO, setLunesISO] = useState(() => aISO(lunesDeSemana(new Date())))
  const [extraAbierto, setExtraAbierto] = useState(false)

  const { data: cuotas, isLoading, isError, refetch } = useCuotasSemana(lunesISO)
  const { data: consumos } = useConsumosSemana(lunesISO)

  if (tipo !== 'admin_empresa') {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  const dias = diasHabiles(deISO(lunesISO))
  const hayDiasFuturos = dias.some((d) => !esFechaPasada(d))
  const cuotasDe = (iso: string) => (cuotas ?? []).filter((q) => q.fecha === iso)

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link to="/cuotas/declarar" />}
          >
            <CalendarPlus className="size-4" />
            Declarar próxima semana
          </Button>
        </div>
        <NavegadorSemana
          lunesISO={lunesISO}
          onAnterior={() => setLunesISO((p) => moverLunes(p, -1))}
          onSiguiente={() => setLunesISO((p) => moverLunes(p, 1))}
        />
        {hayDiasFuturos && (
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setExtraAbierto(true)}>
              <Plus className="size-4" />
              Agregar extra
            </Button>
          </div>
        )}
      </header>

      {isLoading ? (
        <ListaSkeleton />
      ) : isError ? (
        <EstadoError onReintentar={() => refetch()} />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          {dias.map((d) => (
            <DiaResumen key={aISO(d)} fecha={d} cuotas={cuotasDe(aISO(d))} consumos={consumos ?? []} />
          ))}
        </div>
      )}

      {extraAbierto && (
        <AgregarExtraDialog lunesISO={lunesISO} onClose={() => setExtraAbierto(false)} />
      )}
    </div>
  )
}

function ListaSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
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
        <EmptyTitle>No se pudieron cargar las cuotas</EmptyTitle>
        <EmptyDescription>Ocurrió un error al consultar la semana.</EmptyDescription>
      </EmptyHeader>
      <Button variant="outline" onClick={onReintentar}>
        Reintentar
      </Button>
    </Empty>
  )
}
