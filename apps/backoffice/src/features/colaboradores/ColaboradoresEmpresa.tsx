import { useMemo, useState } from 'react'
import { Plus, TriangleAlert, Users } from 'lucide-react'
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
import { Input } from '@amena/ui/components/ui/input'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import type { Empresa } from '../empresas/api'
import { ColaboradorFormDialog } from './ColaboradorFormDialog'
import { columnasColaboradores } from './columns'
import { useColaboradoresEmpresa } from './queries'

/** Sin la columna "Empresa": en el detalle de empresa es redundante. */
const columnas = columnasColaboradores.filter((c) => c.id !== 'empresa')

/**
 * Listado de colaboradores (comensales) de UNA empresa, con alta que fija la empresa.
 * Vive dentro de la página de detalle de empresa.
 */
export function ColaboradoresEmpresa({
  empresa,
  puedeGestionar = true,
}: {
  empresa: Empresa
  /** Solo super_admin puede dar de alta; finanzas ve el listado en modo lectura. */
  puedeGestionar?: boolean
}) {
  const { data, isLoading, isError, refetch } = useColaboradoresEmpresa(empresa.id)
  const [busqueda, setBusqueda] = useState('')
  const [altaAbierta, setAltaAbierta] = useState(false)

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const base = data ?? []
    if (!q) return base
    return base.filter((c) => `${c.nombre} ${c.email ?? ''}`.toLowerCase().includes(q))
  }, [data, busqueda])

  const hayColaboradores = (data ?? []).length > 0

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
          Colaboradores
        </h2>
        {hayColaboradores && puedeGestionar && (
          <Button size="sm" onClick={() => setAltaAbierta(true)}>
            <Plus className="size-4" />
            Nuevo usuario
          </Button>
        )}
      </div>

      {isLoading ? (
        <TablaSkeleton />
      ) : isError ? (
        <EstadoError onReintentar={() => refetch()} />
      ) : !hayColaboradores ? (
        <ColaboradoresVacio
          puedeGestionar={puedeGestionar}
          onCrear={() => setAltaAbierta(true)}
        />
      ) : (
        <DataTable
          columns={columnas}
          data={filtrados}
          fillHeight={false}
          rowClassName={(c) => (c.activo ? undefined : 'opacity-60')}
          toolbar={
            <Input
              placeholder="Buscar por nombre o correo…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="max-w-sm"
              aria-label="Buscar colaborador"
            />
          }
          emptyMessage="Ningún colaborador coincide con la búsqueda."
        />
      )}

      {altaAbierta && (
        <ColaboradorFormDialog empresaFija={empresa} onClose={() => setAltaAbierta(false)} />
      )}
    </section>
  )
}

function TablaSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
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
        <EmptyTitle>No se pudieron cargar los colaboradores</EmptyTitle>
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

function ColaboradoresVacio({
  puedeGestionar,
  onCrear,
}: {
  puedeGestionar: boolean
  onCrear: () => void
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Users className="size-6" />
        </EmptyMedia>
        <EmptyTitle>Aún no hay colaboradores</EmptyTitle>
        <EmptyDescription>
          {puedeGestionar
            ? 'Registra al primer colaborador de esta empresa.'
            : 'Esta empresa aún no tiene colaboradores registrados.'}
        </EmptyDescription>
      </EmptyHeader>
      {puedeGestionar && (
        <EmptyContent>
          <Button onClick={onCrear}>
            <Plus className="size-4" />
            Nuevo usuario
          </Button>
        </EmptyContent>
      )}
    </Empty>
  )
}
