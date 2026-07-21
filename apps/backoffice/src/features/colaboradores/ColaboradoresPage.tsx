import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, TriangleAlert, Users } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
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
import { DataTable } from '@amena/ui/components/data-table'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { useEmpresas } from '../empresas/queries'
import { nombreEmpresa } from './api'
import { ColaboradorFormDialog } from './ColaboradorFormDialog'
import { columnasColaboradores } from './columns'
import { useColaboradores } from './queries'

export function ColaboradoresPage() {
  const { rol } = useOutletContext<ContextoAcceso>()
  const { data: colaboradores, isLoading, isError, refetch } = useColaboradores()
  const { data: empresas } = useEmpresas()
  const [busqueda, setBusqueda] = useState('')
  const [dialogoAbierto, setDialogoAbierto] = useState(false)

  const hayColaboradores = (colaboradores ?? []).length > 0

  const filtrados = useMemo(() => {
    const base = colaboradores ?? []
    const q = busqueda.trim().toLowerCase()
    if (!q) return base
    return base.filter((c) =>
      `${c.nombre} ${c.email ?? ''} ${nombreEmpresa(c)}`.toLowerCase().includes(q)
    )
  }, [colaboradores, busqueda])

  if (rol !== 'super_admin') {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  return (
    <div className="flex flex-col gap-4 md:min-h-0 md:flex-1">
      <header className="flex items-center justify-end gap-4">
        <Button onClick={() => setDialogoAbierto(true)}>
          <Plus className="size-4" />
          Nuevo usuario
        </Button>
      </header>

      {isLoading ? (
        <TablaSkeleton />
      ) : isError ? (
        <EstadoError onReintentar={() => refetch()} />
      ) : !hayColaboradores ? (
        <ColaboradoresVacio onCrear={() => setDialogoAbierto(true)} />
      ) : (
        <DataTable
          columns={columnasColaboradores}
          data={filtrados}
          rowClassName={(c) => (c.activo ? undefined : 'opacity-60')}
          toolbar={
            <Input
              placeholder="Buscar por nombre, correo o empresa…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="max-w-sm"
              aria-label="Buscar colaborador"
            />
          }
          emptyMessage="Ningún colaborador coincide con la búsqueda."
        />
      )}

      {dialogoAbierto && (
        <ColaboradorFormDialog empresas={empresas ?? []} onClose={() => setDialogoAbierto(false)} />
      )}
    </div>
  )
}

function TablaSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      {Array.from({ length: 5 }).map((_, i) => (
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

function ColaboradoresVacio({ onCrear }: { onCrear: () => void }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Users className="size-6" />
        </EmptyMedia>
        <EmptyTitle>Aún no hay colaboradores</EmptyTitle>
        <EmptyDescription>Registra el primer colaborador y asígnalo a una empresa.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onCrear}>
          <Plus className="size-4" />
          Nuevo usuario
        </Button>
      </EmptyContent>
    </Empty>
  )
}
