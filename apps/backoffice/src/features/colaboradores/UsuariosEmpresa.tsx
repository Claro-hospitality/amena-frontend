import { useMemo, useState } from 'react'
import { Pencil, Plus, TriangleAlert, Users, Utensils, UtensilsCrossed } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@amena/ui/components/ui/alert-dialog'
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
import { useEstablecerComida, useUsuariosEmpresa } from './queries'

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
    header: 'Vista',
    cell: ({ row }) => {
      const { rol } = row.original
      if (rol === 'admin') return <Badge variant="outline">Administrador</Badge>
      if (rol === 'colaborador') return <Badge variant="secondary">Colaborador</Badge>
      return <span className="text-muted-foreground">—</span>
    },
  },
  {
    id: 'come',
    header: 'Comensal',
    cell: ({ row }) =>
      row.original.comeActivo ? (
        <Badge className="bg-success text-success-foreground">Activo</Badge>
      ) : (
        <Badge variant="outline" className="text-muted-foreground">
          Inactivo
        </Badge>
      ),
  },
]

/**
 * Columna de acciones (editar roles + activar/desactivar comida) — solo para quien
 * puede gestionar. Desactivar comida pide confirmación (vía `onDesactivarComida`);
 * activar aplica directo.
 */
function columnaAcciones(
  onEditar: (u: UsuarioEmpresa) => void,
  onActivarComida: (u: UsuarioEmpresa) => void,
  onDesactivarComida: (u: UsuarioEmpresa) => void,
  comidaPendiente: boolean
): ColumnDef<UsuarioEmpresa> {
  return {
    id: 'acciones',
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => {
      const u = row.original
      return (
        <div className="flex justify-end gap-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={comidaPendiente}
                  onClick={() => (u.comeActivo ? onDesactivarComida(u) : onActivarComida(u))}
                  aria-label={
                    u.comeActivo
                      ? `Desactivar comida de ${u.nombre}`
                      : `Activar comida de ${u.nombre}`
                  }
                >
                  {u.comeActivo ? (
                    <UtensilsCrossed className="size-4" />
                  ) : (
                    <Utensils className="size-4" />
                  )}
                </Button>
              }
            />
            <TooltipContent>
              {u.comeActivo ? 'Desactivar comida' : 'Activar comida'}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onEditar(u)}
                  aria-label={`Editar roles de ${u.nombre}`}
                >
                  <Pencil className="size-4" />
                </Button>
              }
            />
            <TooltipContent>Editar roles</TooltipContent>
          </Tooltip>
        </div>
      )
    },
  }
}

/**
 * Listado de TODOS los usuarios del portal (admins + colaboradores) de una empresa,
 * con alta que fija la empresa. Vive dentro del detalle de empresa.
 */
export function UsuariosEmpresa({
  empresa,
  puedeGestionar = true,
  fillHeight = false,
}: {
  empresa: Empresa
  /** Solo super_admin puede dar de alta; finanzas ve el listado en modo lectura. */
  puedeGestionar?: boolean
  /** En tab: ocupa el alto restante y la tabla hace scroll interno (sin título propio). */
  fillHeight?: boolean
}) {
  const { data, isLoading, isError, refetch } = useUsuariosEmpresa(empresa.id)
  const establecerComida = useEstablecerComida()
  const [busqueda, setBusqueda] = useState('')
  const [altaAbierta, setAltaAbierta] = useState(false)
  const [editando, setEditando] = useState<UsuarioEmpresa | null>(null)
  const [desactivandoComida, setDesactivandoComida] = useState<UsuarioEmpresa | null>(null)

  const cambiarComida = (u: UsuarioEmpresa, activo: boolean) => {
    establecerComida.mutate(
      { usuarioId: u.id, activo },
      {
        onSuccess: () =>
          toast.success(activo ? `Comida activada para ${u.nombre}` : `Comida desactivada para ${u.nombre}`),
        onError: () => toast.error('No se pudo cambiar la comida. Intenta de nuevo.'),
      }
    )
  }

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const base = data ?? []
    if (!q) return base
    return base.filter((u) => `${u.nombre} ${u.email ?? ''}`.toLowerCase().includes(q))
  }, [data, busqueda])

  const columnas = useMemo(
    () =>
      puedeGestionar
        ? [
            ...columnasBase,
            columnaAcciones(
              setEditando,
              (u) => cambiarComida(u, true),
              setDesactivandoComida,
              establecerComida.isPending
            ),
          ]
        : columnasBase,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [puedeGestionar, establecerComida.isPending]
  )

  const hayUsuarios = (data ?? []).length > 0

  return (
    <section className={`flex flex-col gap-3 ${fillHeight ? 'min-h-0 flex-1' : ''}`}>
      {(!fillHeight || (hayUsuarios && puedeGestionar)) && (
        <div className="flex items-center justify-between gap-4">
          {fillHeight ? (
            <span />
          ) : (
            <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
              Usuarios
            </h2>
          )}
          {hayUsuarios && puedeGestionar && (
            <Button size="sm" onClick={() => setAltaAbierta(true)}>
              <Plus className="size-4" />
              Nuevo usuario
            </Button>
          )}
        </div>
      )}

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
          fillHeight={fillHeight}
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

      <AlertDialog
        open={desactivandoComida != null}
        onOpenChange={(abierto) => {
          if (!abierto) setDesactivandoComida(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Desactivar la comida de {desactivandoComida?.nombre}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Deja de poder consumir; su QR queda inactivo. El historial se conserva.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (desactivandoComida) cambiarComida(desactivandoComida, false)
                setDesactivandoComida(null)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
