import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { KeyRound, Power, Shield, Trash2, TriangleAlert, UserPlus } from 'lucide-react'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@amena/ui/components/ui/dialog'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@amena/ui/components/ui/empty'
import { Field, FieldLabel } from '@amena/ui/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@amena/ui/components/ui/select'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@amena/ui/components/ui/tooltip'
import { toast } from 'sonner'
import { useAuth } from '../../auth/useAuth'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { ETIQUETA_ROL, type RolBackoffice, type UsuarioBackoffice } from './api'
import { UsuarioFormDialog } from './UsuarioFormDialog'
import {
  useCambiarRol,
  useEliminarUsuario,
  useEstablecerEstado,
  useRestablecerAcceso,
  useUsuarios,
} from './queries'

export function UsuariosPage() {
  const { rol } = useOutletContext<ContextoAcceso>()
  const { session } = useAuth()
  const miId = session?.user.id ?? ''
  const { data: usuarios, isLoading, isError, refetch } = useUsuarios()

  const [crear, setCrear] = useState(false)
  const [rolTarget, setRolTarget] = useState<UsuarioBackoffice | null>(null)
  const [estadoTarget, setEstadoTarget] = useState<UsuarioBackoffice | null>(null)
  const [accesoTarget, setAccesoTarget] = useState<UsuarioBackoffice | null>(null)
  const [eliminarTarget, setEliminarTarget] = useState<UsuarioBackoffice | null>(null)

  // Id del último super_admin activo (para bloquear su degradación/desactivación en la UI).
  const ultimoSuperAdminId = useMemo(() => {
    const activos = (usuarios ?? []).filter((u) => u.rol === 'super_admin' && u.activo)
    return activos.length === 1 ? activos[0].user_id : null
  }, [usuarios])

  const columnas = useMemo<ColumnDef<UsuarioBackoffice>[]>(
    () => [
      { accessorKey: 'nombre', header: 'Nombre' },
      { accessorKey: 'email', header: 'Correo' },
      {
        accessorKey: 'rol',
        header: 'Rol',
        cell: ({ row }) => <Badge variant="secondary">{ETIQUETA_ROL[row.original.rol]}</Badge>,
      },
      {
        accessorKey: 'activo',
        header: 'Estado',
        cell: ({ row }) =>
          row.original.activo ? (
            <Badge className="border-transparent bg-success text-success-foreground">Activo</Badge>
          ) : (
            <Badge variant="outline">Inactivo</Badge>
          ),
      },
      {
        id: 'acciones',
        header: '',
        cell: ({ row }) => {
          const u = row.original
          const esYo = u.user_id === miId
          const esUltimoSuper = u.user_id === ultimoSuperAdminId
          return (
            <div className="flex justify-end gap-1">
              <AccionIcono
                etiqueta="Cambiar rol"
                icon={Shield}
                onClick={() => setRolTarget(u)}
                disabled={esYo || esUltimoSuper}
                motivo={
                  esYo
                    ? 'No puedes cambiar tu propio rol'
                    : 'No puedes degradar al último super administrador activo'
                }
              />
              <AccionIcono
                etiqueta={u.activo ? 'Desactivar' : 'Activar'}
                icon={Power}
                onClick={() => setEstadoTarget(u)}
                disabled={u.activo && (esYo || esUltimoSuper)}
                motivo={
                  esYo
                    ? 'No puedes desactivarte a ti mismo'
                    : 'No puedes desactivar al último super administrador activo'
                }
              />
              <AccionIcono
                etiqueta="Restablecer contraseña"
                icon={KeyRound}
                onClick={() => setAccesoTarget(u)}
                disabled={esYo}
                motivo="Para tu propia contraseña usa Mi perfil"
              />
              {/* Eliminar (borrado lógico) solo disponible cuando ya está desactivado. */}
              {!u.activo && (
                <AccionIcono
                  etiqueta="Eliminar"
                  icon={Trash2}
                  onClick={() => setEliminarTarget(u)}
                />
              )}
            </div>
          )
        },
      },
    ],
    [miId, ultimoSuperAdminId]
  )

  if (rol !== 'super_admin') {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4 md:min-h-0 md:flex-1">
        <header className="flex items-center justify-end">
          <Button onClick={() => setCrear(true)}>
            <UserPlus className="size-4" />
            Nuevo usuario
          </Button>
        </header>

        {isLoading ? (
          <TablaSkeleton />
        ) : isError ? (
          <EstadoError onReintentar={() => refetch()} />
        ) : (
          <DataTable
            columns={columnas}
            data={usuarios ?? []}
            emptyMessage="Aún no hay usuarios internos."
          />
        )}
      </div>

      {crear && <UsuarioFormDialog onClose={() => setCrear(false)} />}

      {rolTarget && (
        <CambiarRolDialog usuario={rolTarget} onClose={() => setRolTarget(null)} />
      )}

      {estadoTarget && (
        <ConfirmarEstadoDialog usuario={estadoTarget} onClose={() => setEstadoTarget(null)} />
      )}

      {accesoTarget && (
        <ConfirmarResetDialog usuario={accesoTarget} onClose={() => setAccesoTarget(null)} />
      )}

      {eliminarTarget && (
        <ConfirmarEliminarDialog usuario={eliminarTarget} onClose={() => setEliminarTarget(null)} />
      )}
    </TooltipProvider>
  )
}

function ConfirmarEliminarDialog({
  usuario,
  onClose,
}: {
  usuario: UsuarioBackoffice
  onClose: () => void
}) {
  const eliminar = useEliminarUsuario()
  return (
    <AlertDialog open onOpenChange={(a) => !a && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar a {usuario.nombre}</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará de la lista de usuarios (borrado lógico). El historial se conserva, pero
            esta acción no se puede deshacer desde aquí.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            loading={eliminar.isPending}
            onClick={async () => {
              try {
                await eliminar.mutateAsync(usuario.user_id)
                toast.success('Usuario eliminado')
                onClose()
              } catch (e) {
                toast.error(e instanceof Error ? e.message : 'No se pudo eliminar el usuario.')
              }
            }}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function AccionIcono({
  etiqueta,
  icon: Icono,
  onClick,
  disabled,
  motivo,
}: {
  etiqueta: string
  icon: typeof Shield
  onClick: () => void
  disabled?: boolean
  motivo?: string
}) {
  const boton = (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={etiqueta}
      onClick={onClick}
      disabled={disabled}
    >
      <Icono className="size-4" />
    </Button>
  )
  if (!disabled) {
    return (
      <Tooltip>
        <TooltipTrigger render={boton} />
        <TooltipContent>{etiqueta}</TooltipContent>
      </Tooltip>
    )
  }
  // Deshabilitado: el trigger envuelve un span para que el tooltip funcione sobre el botón inerte.
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex">{boton}</span>} />
      <TooltipContent>{motivo ?? etiqueta}</TooltipContent>
    </Tooltip>
  )
}

function CambiarRolDialog({
  usuario,
  onClose,
}: {
  usuario: UsuarioBackoffice
  onClose: () => void
}) {
  const [rol, setRol] = useState<RolBackoffice>(usuario.rol)
  const cambiar = useCambiarRol()
  return (
    <Dialog open onOpenChange={(a) => !a && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar rol de {usuario.nombre}</DialogTitle>
          <DialogDescription>Define el nuevo rol de este usuario interno.</DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="nuevo-rol">Rol</FieldLabel>
          <Select value={rol} onValueChange={(v) => setRol(v as RolBackoffice)}>
            <SelectTrigger id="nuevo-rol" className="w-full">
              <SelectValue>{(v) => (v ? ETIQUETA_ROL[v as RolBackoffice] : '')}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="super_admin">{ETIQUETA_ROL.super_admin}</SelectItem>
              <SelectItem value="finanzas">{ETIQUETA_ROL.finanzas}</SelectItem>
              <SelectItem value="mesero">{ETIQUETA_ROL.mesero}</SelectItem>
              <SelectItem value="capitan_meseros">{ETIQUETA_ROL.capitan_meseros}</SelectItem>
              <SelectItem value="consulta">{ETIQUETA_ROL.consulta}</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            disabled={rol === usuario.rol}
            loading={cambiar.isPending}
            onClick={async () => {
              try {
                await cambiar.mutateAsync({ userId: usuario.user_id, rol })
                toast.success('Rol actualizado')
                onClose()
              } catch (e) {
                toast.error(e instanceof Error ? e.message : 'No se pudo cambiar el rol.')
              }
            }}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ConfirmarEstadoDialog({
  usuario,
  onClose,
}: {
  usuario: UsuarioBackoffice
  onClose: () => void
}) {
  const estado = useEstablecerEstado()
  const desactivar = usuario.activo
  return (
    <AlertDialog open onOpenChange={(a) => !a && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {desactivar ? 'Desactivar' : 'Activar'} a {usuario.nombre}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {desactivar
              ? 'No podrá iniciar sesión hasta que se le reactive.'
              : 'Podrá volver a iniciar sesión en el backoffice.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            loading={estado.isPending}
            onClick={async () => {
              try {
                await estado.mutateAsync({ userId: usuario.user_id, activo: !usuario.activo })
                toast.success(desactivar ? 'Usuario desactivado' : 'Usuario activado')
                onClose()
              } catch (e) {
                toast.error(e instanceof Error ? e.message : 'No se pudo cambiar el estado.')
              }
            }}
          >
            {desactivar ? 'Desactivar' : 'Activar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function ConfirmarResetDialog({
  usuario,
  onClose,
}: {
  usuario: UsuarioBackoffice
  onClose: () => void
}) {
  const acceso = useRestablecerAcceso()
  return (
    <AlertDialog open onOpenChange={(a) => !a && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restablecer la contraseña de {usuario.nombre}</AlertDialogTitle>
          <AlertDialogDescription>
            Se enviará un correo a {usuario.email} con un enlace para que defina una contraseña
            nueva. Nadie ve ni entrega una contraseña.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            loading={acceso.isPending}
            onClick={async () => {
              try {
                const r = await acceso.mutateAsync({ email: usuario.email, motivo: 'restablecer' })
                if (r.correo_enviado) {
                  toast.success(`Correo enviado a ${usuario.email}.`)
                } else {
                  toast.warning('No se pudo enviar el correo. Intenta de nuevo.')
                }
                onClose()
              } catch (e) {
                toast.error(e instanceof Error ? e.message : 'No se pudo enviar el correo.')
              }
            }}
          >
            Restablecer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function TablaSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
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
        <EmptyTitle>No se pudieron cargar los usuarios</EmptyTitle>
        <EmptyDescription>Ocurrió un error al consultar los datos.</EmptyDescription>
      </EmptyHeader>
      <Button variant="outline" onClick={onReintentar}>
        Reintentar
      </Button>
    </Empty>
  )
}
