import { useMemo, useState } from 'react'
import { Pencil, Plus, TriangleAlert, Users } from 'lucide-react'
import { Badge } from '@amena/ui/components/ui/badge'
import { Button } from '@amena/ui/components/ui/button'
import { DataTable, type ColumnDef } from '@amena/ui/components/data-table'
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@amena/ui/components/ui/tooltip'
import type { Empresa } from '../empresas/api'
import type { UsuarioEmpresa } from './api'
import { ColaboradorFormDialog } from './ColaboradorFormDialog'
import { EditarRolesDialog } from './EditarRolesDialog'
import { useUsuariosEmpresa } from './queries'

const columnasBase: ColumnDef<UsuarioEmpresa>[] = [
  {
    accessorKey: 'nombre',
    header: 'Nombre',
    cell: ({ row }) => <span className="font-medium">{row.original.nombre}</span>,
  },
  {
    accessorKey: 'email',
    header: 'Correo',
    cell: ({ row }) =>
      row.original.email ? (
        row.original.email
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: 'rol',
    header: 'Rol',
    cell: ({ row }) => {
      const { esAdmin, esColaborador } = row.original
      if (!esAdmin && !esColaborador) return <span className="text-muted-foreground">—</span>
      return (
        <div className="flex flex-wrap gap-1">
          {esAdmin && <Badge variant="outline">Administrador</Badge>}
          {esColaborador && <Badge variant="secondary">Colaborador</Badge>}
        </div>
      )
    },
  },
  {
    accessorKey: 'activo',
    header: 'Estado',
    cell: ({ row }) =>
      row.original.activo ? (
        <Badge className="bg-success text-success-foreground">Activo</Badge>
      ) : (
        <Badge variant="outline">Inactivo</Badge>
      ),
  },
]

/** Columna de acciones (editar roles) — solo para quien puede gestionar. */
function columnaAcciones(
  onEditar: (u: UsuarioEmpresa) => void
): ColumnDef<UsuarioEmpresa> {
  return {
    id: 'acciones',
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onEditar(row.original)}
                aria-label={`Editar roles de ${row.original.nombre}`}
              >
                <Pencil className="size-4" />
              </Button>
            }
          />
          <TooltipContent>Editar roles</TooltipContent>
        </Tooltip>
      </div>
    ),
  }
}

/**
 * Listado de TODOS los usuarios del portal (admins + colaboradores) de una empresa,
 * con alta que fija la empresa. Vive dentro del detalle de empresa.
 */
export function UsuariosEmpresa({
  empresa,
  puedeGestionar = true,
}: {
  empresa: Empresa
  /** Solo super_admin puede dar de alta; finanzas ve el listado en modo lectura. */
  puedeGestionar?: boolean
}) {
  const { data, isLoading, isError, refetch } = useUsuariosEmpresa(empresa.id)
  const [busqueda, setBusqueda] = useState('')
  const [altaAbierta, setAltaAbierta] = useState(false)
  const [editando, setEditando] = useState<UsuarioEmpresa | null>(null)

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const base = data ?? []
    if (!q) return base
    return base.filter((u) => `${u.nombre} ${u.email ?? ''}`.toLowerCase().includes(q))
  }, [data, busqueda])

  const columnas = useMemo(
    () => (puedeGestionar ? [...columnasBase, columnaAcciones(setEditando)] : columnasBase),
    [puedeGestionar]
  )

  const hayUsuarios = (data ?? []).length > 0

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
          Usuarios
        </h2>
        {hayUsuarios && puedeGestionar && (
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
      ) : !hayUsuarios ? (
        <UsuariosVacio puedeGestionar={puedeGestionar} onCrear={() => setAltaAbierta(true)} />
      ) : (
        <DataTable
          columns={columnas}
          data={filtrados}
          fillHeight={false}
          rowClassName={(u) => (u.activo ? undefined : 'opacity-60')}
          toolbar={
            <Input
              placeholder="Buscar por nombre o correo…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="max-w-sm"
              aria-label="Buscar usuario"
            />
          }
          emptyMessage="Ningún usuario coincide con la búsqueda."
        />
      )}

      {altaAbierta && (
        <ColaboradorFormDialog empresaFija={empresa} onClose={() => setAltaAbierta(false)} />
      )}
      {editando && (
        <EditarRolesDialog
          key={editando.id}
          usuario={editando}
          onClose={() => setEditando(null)}
        />
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
        <EmptyTitle>No se pudieron cargar los usuarios</EmptyTitle>
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

function UsuariosVacio({
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
        <EmptyTitle>Aún no hay usuarios</EmptyTitle>
        <EmptyDescription>
          {puedeGestionar
            ? 'Registra al primer usuario (admin o colaborador) de esta empresa.'
            : 'Esta empresa aún no tiene usuarios registrados.'}
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
