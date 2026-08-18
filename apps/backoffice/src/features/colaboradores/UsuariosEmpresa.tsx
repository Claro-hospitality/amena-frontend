import { useMemo, useState } from 'react'
import {
  KeyRound,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Trash2,
  TriangleAlert,
  Users,
  Utensils,
  UtensilsCrossed,
} from 'lucide-react'
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
import { SearchInput } from '@amena/ui/components/ui/search-input'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { Switch } from '@amena/ui/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@amena/ui/components/ui/tooltip'
import { mensajeErrorCorreo } from '@amena/supabase/correo'
import type { Empresa } from '../empresas/api'
import type { UsuarioEmpresa } from './api'
import { ColaboradorFormDialog } from './ColaboradorFormDialog'
import { EditarRolesDialog } from './EditarRolesDialog'
import {
  useEliminarUsuarioPortal,
  useEstablecerComida,
  useEstablecerConsumoLibre,
  useEstablecerEstadoPortal,
  useRestablecerAccesoPortal,
  useUsuariosEmpresa,
} from './queries'

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
  {
    id: 'acceso',
    header: 'Acceso',
    cell: ({ row }) =>
      row.original.activo ? (
        <Badge className="bg-success text-success-foreground">Activo</Badge>
      ) : (
        <Badge variant="outline" className="text-muted-foreground">
          Desactivado
        </Badge>
      ),
  },
]

/**
 * Columna "Consumo libre" — solo cuando la empresa está en modo libre. Muestra un switch
 * por usuario para activar/desactivar su consumo libre (RPC establecer_consumo_libre).
 * `interactivo=false` (finanzas) lo deja de solo lectura.
 */
function columnaConsumoLibre(
  onToggle: (u: UsuarioEmpresa, activo: boolean) => void,
  interactivo: boolean,
  pendiente: boolean
): ColumnDef<UsuarioEmpresa> {
  return {
    id: 'consumo_libre',
    header: 'Consumo libre',
    cell: ({ row }) => (
      <Switch
        checked={row.original.consumoLibre}
        disabled={!interactivo || pendiente}
        onCheckedChange={(v) => onToggle(row.original, v)}
        aria-label={`Consumo libre de ${row.original.nombre}`}
      />
    ),
  }
}

/**
 * Columna de acciones (editar roles + activar/desactivar comida) — solo para quien
 * puede gestionar. Desactivar comida pide confirmación (vía `onDesactivarComida`);
 * activar aplica directo.
 */
function columnaAcciones(
  onEditar: (u: UsuarioEmpresa) => void,
  onActivarComida: (u: UsuarioEmpresa) => void,
  onDesactivarComida: (u: UsuarioEmpresa) => void,
  onResetear: (u: UsuarioEmpresa) => void,
  onToggleAcceso: (u: UsuarioEmpresa) => void,
  onEliminar: (u: UsuarioEmpresa) => void,
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
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onResetear(u)}
                  aria-label={`Restablecer contraseña de ${u.nombre}`}
                >
                  <KeyRound className="size-4" />
                </Button>
              }
            />
            <TooltipContent>Restablecer contraseña</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onToggleAcceso(u)}
                  aria-label={u.activo ? `Desactivar acceso de ${u.nombre}` : `Activar acceso de ${u.nombre}`}
                >
                  {u.activo ? <PowerOff className="size-4" /> : <Power className="size-4" />}
                </Button>
              }
            />
            <TooltipContent>{u.activo ? 'Desactivar acceso' : 'Activar acceso'}</TooltipContent>
          </Tooltip>
          {/* Eliminar (borrado lógico) solo cuando el acceso ya está desactivado. */}
          {!u.activo && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onEliminar(u)}
                    aria-label={`Eliminar a ${u.nombre}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                }
              />
              <TooltipContent>Eliminar</TooltipContent>
            </Tooltip>
          )}
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
  const establecerLibre = useEstablecerConsumoLibre()
  const restablecer = useRestablecerAccesoPortal()
  const empresaEnModoLibre = empresa.modo_consumo === 'libre'
  const cambiarAcceso = useEstablecerEstadoPortal()
  const eliminarPortal = useEliminarUsuarioPortal()
  const [busqueda, setBusqueda] = useState('')
  const [altaAbierta, setAltaAbierta] = useState(false)
  const [editando, setEditando] = useState<UsuarioEmpresa | null>(null)
  const [desactivandoComida, setDesactivandoComida] = useState<UsuarioEmpresa | null>(null)
  const [desactivandoAcceso, setDesactivandoAcceso] = useState<UsuarioEmpresa | null>(null)
  const [eliminando, setEliminando] = useState<UsuarioEmpresa | null>(null)
  const [reseteando, setReseteando] = useState<UsuarioEmpresa | null>(null)

  const toggleAcceso = (u: UsuarioEmpresa) => {
    if (u.activo) {
      setDesactivandoAcceso(u) // desactivar acceso pide confirmación
    } else {
      cambiarAcceso.mutate(
        { usuarioId: u.id, activo: true },
        {
          onSuccess: () => toast.success(`Acceso reactivado para ${u.nombre}`),
          onError: () => toast.error('No se pudo cambiar el acceso. Intenta de nuevo.'),
        }
      )
    }
  }

  const confirmarReset = () => {
    if (!reseteando) return
    const { email, nombre } = reseteando
    if (!email) {
      toast.error('Este usuario no tiene un correo registrado para enviarle el enlace.')
      setReseteando(null)
      return
    }
    restablecer.mutate(email, {
      onSuccess: (r) => {
        setReseteando(null)
        if (r.correo_enviado) {
          toast.success(`Le enviamos a ${nombre} un correo con el enlace para restablecer su contraseña.`)
        } else {
          // El error crudo de Postmark (inglés, jerga de proveedor) no se muestra tal cual.
          toast.error(mensajeErrorCorreo(r.correo_error, { nombre }))
        }
      },
      onError: (e) =>
        toast.error(e instanceof Error ? e.message : 'No se pudo enviar el correo. Intenta de nuevo.'),
    })
  }

  const cambiarComida = (u: UsuarioEmpresa, activo: boolean, onDone?: () => void) => {
    establecerComida.mutate(
      { usuarioId: u.id, activo },
      {
        onSuccess: () => {
          toast.success(activo ? `Comida activada para ${u.nombre}` : `Comida desactivada para ${u.nombre}`)
          onDone?.()
        },
        onError: () => toast.error('No se pudo cambiar la comida. Intenta de nuevo.'),
      }
    )
  }

  const cambiarConsumoLibre = (u: UsuarioEmpresa, activo: boolean) => {
    establecerLibre.mutate(
      { usuarioId: u.id, activo },
      {
        onSuccess: () =>
          toast.success(
            activo ? `Consumo libre activado para ${u.nombre}` : `Consumo libre desactivado para ${u.nombre}`
          ),
        onError: () => toast.error('No se pudo cambiar el consumo libre. Intenta de nuevo.'),
      }
    )
  }

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const base = data ?? []
    if (!q) return base
    return base.filter((u) => `${u.nombre} ${u.email ?? ''}`.toLowerCase().includes(q))
  }, [data, busqueda])

  const columnas = useMemo(() => {
    // La columna de consumo libre solo aparece si la empresa está en modo libre.
    const conLibre = empresaEnModoLibre
      ? [...columnasBase, columnaConsumoLibre(cambiarConsumoLibre, puedeGestionar, establecerLibre.isPending)]
      : columnasBase
    return puedeGestionar
      ? [
          ...conLibre,
          columnaAcciones(
            setEditando,
            (u) => cambiarComida(u, true),
            setDesactivandoComida,
            setReseteando,
            toggleAcceso,
            setEliminando,
            establecerComida.isPending
          ),
        ]
      : conLibre
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puedeGestionar, establecerComida.isPending, empresaEnModoLibre, establecerLibre.isPending])

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
            <SearchInput
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
              loading={establecerComida.isPending}
              onClick={() => {
                if (desactivandoComida)
                  cambiarComida(desactivandoComida, false, () => setDesactivandoComida(null))
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmar desactivar acceso */}
      <AlertDialog
        open={desactivandoAcceso != null}
        onOpenChange={(abierto) => {
          if (!abierto) setDesactivandoAcceso(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar el acceso de {desactivandoAcceso?.nombre}?</AlertDialogTitle>
            <AlertDialogDescription>
              No podrá iniciar sesión en el portal (reversible). El historial se conserva.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              loading={cambiarAcceso.isPending}
              onClick={() => {
                const u = desactivandoAcceso
                if (!u) return
                cambiarAcceso.mutate(
                  { usuarioId: u.id, activo: false },
                  {
                    onSuccess: () => toast.success(`Acceso desactivado para ${u.nombre}`),
                    onError: () => toast.error('No se pudo desactivar el acceso. Intenta de nuevo.'),
                  }
                )
                setDesactivandoAcceso(null)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmar eliminar (borrado lógico) */}
      <AlertDialog
        open={eliminando != null}
        onOpenChange={(abierto) => {
          if (!abierto) setEliminando(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar a {eliminando?.nombre}?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará de la lista (borrado lógico) y se apagará su comida/QR. El historial se
              conserva; no se puede deshacer desde aquí.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              loading={eliminarPortal.isPending}
              onClick={() => {
                const u = eliminando
                if (!u) return
                eliminarPortal.mutate(u.id, {
                  onSuccess: () => toast.success(`${u.nombre} eliminado`),
                  onError: () => toast.error('No se pudo eliminar. Intenta de nuevo.'),
                })
                setEliminando(null)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmar restablecer contraseña */}
      <AlertDialog
        open={reseteando != null}
        onOpenChange={(abierto) => {
          if (!abierto) setReseteando(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Enviar el enlace para restablecer la contraseña de {reseteando?.nombre}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Le enviaremos un correo a{' '}
              <strong className="text-foreground">{reseteando?.email ?? 'su correo'}</strong> con un
              enlace para que defina una nueva contraseña. Su contraseña actual seguirá funcionando
              hasta que la cambie.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarReset} loading={restablecer.isPending}>
              Enviar enlace
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
