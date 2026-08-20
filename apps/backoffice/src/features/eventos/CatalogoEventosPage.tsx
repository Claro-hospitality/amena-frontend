import { useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { CalendarDays, Plus, TriangleAlert } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import { DataTable } from '@amena/ui/components/data-table'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@amena/ui/components/ui/empty'
import { SearchInput } from '@amena/ui/components/ui/search-input'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { cn } from '@amena/ui/lib/utils'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { crearColumnasEventos } from './columns'
import { filtrarEventos, puedeVerEventos, type FiltroEvento, FILTROS_EVENTO } from './logica'
import { useEventos } from './queries'

export function CatalogoEventosPage() {
  const { rol } = useOutletContext<ContextoAcceso>()
  const { data, isLoading, isError, refetch } = useEventos()
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<FiltroEvento>('Todos')

  const eventos = useMemo(() => data ?? [], [data])
  const filtrados = useMemo(
    () => filtrarEventos(eventos, filtro, busqueda),
    [eventos, filtro, busqueda]
  )
  const columnas = useMemo(() => crearColumnasEventos(), [])

  if (!puedeVerEventos(rol)) {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  const publicados = eventos.filter((e) => e.estado === 'Publicado').length
  const borradores = eventos.length - publicados

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {publicados} publicados · {borradores} borrador{borradores === 1 ? '' : 'es'}
        </p>
        <Button nativeButton={false} render={<Link to="/eventos/catalogo/nuevo" />}>
          <Plus className="size-4" />
          Nuevo evento
        </Button>
      </header>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : isError ? (
        <EstadoError onReintentar={() => refetch()} />
      ) : eventos.length === 0 ? (
        <CatalogoVacio />
      ) : (
        <DataTable
          columns={columnas}
          data={filtrados}
          emptyMessage="Ningún evento coincide con el filtro."
          toolbar={
            <div className="flex flex-wrap items-center gap-3">
              <SearchInput
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por título…"
                aria-label="Buscar eventos por título"
                className="w-full sm:max-w-xs"
              />
              <div className="flex flex-wrap gap-2">
                {FILTROS_EVENTO.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFiltro(f)}
                    aria-pressed={filtro === f}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm font-medium',
                      filtro === f
                        ? 'border-primary bg-naranja-50 text-naranja-700'
                        : 'border-border bg-card text-muted-foreground hover:bg-secondary/60'
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          }
        />
      )}
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
        <EmptyTitle>No se pudieron cargar los eventos</EmptyTitle>
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

function CatalogoVacio() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CalendarDays className="size-6" />
        </EmptyMedia>
        <EmptyTitle>Aún no hay eventos</EmptyTitle>
        <EmptyDescription>Crea el primer evento para publicarlo en amena.social.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button nativeButton={false} render={<Link to="/eventos/catalogo/nuevo" />}>
          <Plus className="size-4" />
          Nuevo evento
        </Button>
      </EmptyContent>
    </Empty>
  )
}
