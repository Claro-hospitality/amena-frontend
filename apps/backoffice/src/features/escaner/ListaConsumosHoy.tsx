import { useMemo, useState } from 'react'
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
import { Input } from '@amena/ui/components/ui/input'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { horaCorta } from '@amena/utils'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { useAuth } from '../../auth/useAuth'
import { useConsumosHoy } from './queries'

export function ListaConsumosHoy() {
  const { rol } = useOutletContext<ContextoAcceso>()
  const { session } = useAuth()
  const { data, isLoading, isError, refetch } = useConsumosHoy()
  const [busqueda, setBusqueda] = useState('')

  const miUid = session?.user?.id ?? ''
  const consumos = useMemo(() => data ?? [], [data])
  const totalDia = consumos.length
  const misEscaneos = useMemo(
    () => consumos.filter((c) => c.registrado_por === miUid).length,
    [consumos, miUid]
  )
  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return consumos
    return consumos.filter((c) => c.comensal_nombre.toLowerCase().includes(q))
  }, [consumos, busqueda])

  if (rol !== 'mesero' && rol !== 'super_admin' && rol !== 'capitan_meseros') {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <header className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon-sm"
          nativeButton={false}
          render={<Link to="/escaner" />}
          aria-label="Volver al escáner"
        >
          <ArrowLeft className="size-4" />
        </Button>
        {!isLoading && !isError && (
          <span className="ml-auto text-sm text-muted-foreground">
            Tus escaneos hoy: <span className="font-semibold text-foreground">{misEscaneos}</span>
            {' · '}Total del día: <span className="font-semibold text-foreground">{totalDia}</span>
          </span>
        )}
      </header>

      {!isLoading && !isError && totalDia > 0 && (
        <Input
          placeholder="Buscar por nombre…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar consumo por nombre de comensal"
        />
      )}

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
      ) : totalDia === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UtensilsCrossed className="size-6" />
            </EmptyMedia>
            <EmptyTitle>Aún no hay comidas hoy</EmptyTitle>
            <EmptyDescription>Los consumos aparecerán aquí conforme escanees.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : filtrados.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Ningún consumo coincide con la búsqueda.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-border overflow-y-auto rounded-lg border border-border">
          {filtrados.map((c) => (
            <li key={c.id} className="flex items-center gap-3 px-4 py-3">
              <span className="w-14 shrink-0 font-mono text-sm tabular-nums text-muted-foreground">
                {horaCorta(new Date(c.created_at))}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{c.comensal_nombre || 'Comensal'}</p>
                <p className="truncate text-xs text-muted-foreground">
                  Registró: {c.mesero_nombre || '—'}
                </p>
              </div>
              {c.empresa_nombre && (
                <span className="min-w-0 max-w-[35%] truncate text-sm text-muted-foreground">
                  {c.empresa_nombre}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
