import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, QrCode, TriangleAlert, Users } from 'lucide-react'
import { Badge } from '@amena/ui/components/ui/badge'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@amena/ui/components/ui/table'
import { TooltipProvider } from '@amena/ui/components/ui/tooltip'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import type { Colaborador } from './api'
import { AccionesColaborador, BotonInvitar } from './ColaboradorAcciones'
import { ColaboradorCard } from './ColaboradorCard'
import { ColaboradorFormDialog } from './ColaboradorFormDialog'
import { ConfirmarEstadoColaborador } from './ConfirmarEstadoColaborador'
import { CredencialDialog } from './CredencialDialog'
import { useColaboradores } from './queries'

type Dialogo =
  | { tipo: 'form'; colaborador: Colaborador | null }
  | { tipo: 'credencial'; colaborador: Colaborador }
  | { tipo: 'estado'; colaborador: Colaborador }

export function ColaboradoresPage() {
  const { tipo } = useOutletContext<ContextoAcceso>()
  const { data, isLoading, isError, refetch } = useColaboradores()
  const [busqueda, setBusqueda] = useState('')
  const [dialogo, setDialogo] = useState<Dialogo | null>(null)

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const base = data ?? []
    return q ? base.filter((c) => c.nombre.toLowerCase().includes(q)) : base
  }, [data, busqueda])

  if (tipo !== 'admin_empresa') {
    return <p className="p-6 text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  const verQR = (colaborador: Colaborador) => setDialogo({ tipo: 'credencial', colaborador })
  const editar = (colaborador: Colaborador) => setDialogo({ tipo: 'form', colaborador })
  const cambiarEstado = (colaborador: Colaborador) => setDialogo({ tipo: 'estado', colaborador })
  const nuevo = () => setDialogo({ tipo: 'form', colaborador: null })
  const cerrar = () => setDialogo(null)

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold">Colaboradores</h1>
          <Button onClick={nuevo} className="min-h-11">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Nuevo colaborador</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </header>

        <Input
          placeholder="Buscar por nombre…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="md:max-w-sm"
          aria-label="Buscar colaborador por nombre"
        />

        {isLoading ? (
          <ListaSkeleton />
        ) : isError ? (
          <EstadoError onReintentar={() => refetch()} />
        ) : filtrados.length === 0 ? (
          <ColaboradoresVacio hayBusqueda={busqueda.trim() !== ''} onCrear={nuevo} />
        ) : (
          <>
            {/* Móvil: cards */}
            <div className="flex flex-col gap-3 md:hidden">
              {filtrados.map((colaborador) => (
                <ColaboradorCard
                  key={colaborador.id}
                  colaborador={colaborador}
                  onVerQR={verQR}
                  onEditar={editar}
                  onCambiarEstado={cambiarEstado}
                />
              ))}
            </div>
            {/* md+: tabla */}
            <div className="hidden md:block">
              <TablaColaboradores
                colaboradores={filtrados}
                onVerQR={verQR}
                onEditar={editar}
                onCambiarEstado={cambiarEstado}
              />
            </div>
          </>
        )}
      </div>

      {dialogo?.tipo === 'form' && (
        <ColaboradorFormDialog
          key={dialogo.colaborador?.id ?? 'nuevo'}
          colaborador={dialogo.colaborador}
          onClose={cerrar}
        />
      )}
      {dialogo?.tipo === 'credencial' && (
        <CredencialDialog colaborador={dialogo.colaborador} onClose={cerrar} />
      )}
      {dialogo?.tipo === 'estado' && (
        <ConfirmarEstadoColaborador colaborador={dialogo.colaborador} onClose={cerrar} />
      )}
    </TooltipProvider>
  )
}

function TablaColaboradores({
  colaboradores,
  onVerQR,
  onEditar,
  onCambiarEstado,
}: {
  colaboradores: Colaborador[]
  onVerQR: (c: Colaborador) => void
  onEditar: (c: Colaborador) => void
  onCambiarEstado: (c: Colaborador) => void
}) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acceso</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {colaboradores.map((colaborador) => (
            <TableRow key={colaborador.id} className={colaborador.activo ? undefined : 'opacity-60'}>
              <TableCell className="font-medium">{colaborador.nombre}</TableCell>
              <TableCell className="text-muted-foreground">{colaborador.email ?? '—'}</TableCell>
              <TableCell>
                {colaborador.activo ? (
                  <Badge className="bg-success text-success-foreground">Activo</Badge>
                ) : (
                  <Badge variant="secondary">Inactivo</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline">
                    {colaborador.user_id != null ? 'Con acceso' : 'Sin acceso'}
                  </Badge>
                  <BotonInvitar colaborador={colaborador} />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button variant="outline" size="sm" onClick={() => onVerQR(colaborador)}>
                    <QrCode className="size-4" />
                    Ver QR
                  </Button>
                  <AccionesColaborador
                    colaborador={colaborador}
                    onEditar={onEditar}
                    onCambiarEstado={onCambiarEstado}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function ListaSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full md:h-12" />
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
  hayBusqueda,
  onCrear,
}: {
  hayBusqueda: boolean
  onCrear: () => void
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Users className="size-6" />
        </EmptyMedia>
        <EmptyTitle>{hayBusqueda ? 'Sin resultados' : 'Aún no hay colaboradores'}</EmptyTitle>
        <EmptyDescription>
          {hayBusqueda
            ? 'Ningún colaborador coincide con tu búsqueda.'
            : 'Registra al primer colaborador; su QR queda listo al instante.'}
        </EmptyDescription>
      </EmptyHeader>
      {!hayBusqueda && (
        <EmptyContent>
          <Button onClick={onCrear}>
            <Plus className="size-4" />
            Nuevo colaborador
          </Button>
        </EmptyContent>
      )}
    </Empty>
  )
}
