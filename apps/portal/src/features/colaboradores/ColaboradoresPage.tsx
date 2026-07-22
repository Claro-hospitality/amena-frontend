import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, QrCode, TriangleAlert, Users } from 'lucide-react'
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
import { TooltipProvider } from '@amena/ui/components/ui/tooltip'
import { resumenPoliticaConsumo } from '@amena/utils'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { empresaEnModoLibre, type Colaborador, type PoliticaEmpresa } from './api'
import { AccionesColaborador, BotonInvitar, ToggleConsumoLibre } from './ColaboradorAcciones'
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

  const hayColaboradores = (data ?? []).length > 0
  // Todos los colaboradores del portal pertenecen a la misma empresa: la política es
  // única. Se toma del primero disponible.
  const politica = (data ?? [])[0]?.politica ?? null

  if (tipo !== 'admin_empresa') {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  const verQR = (colaborador: Colaborador) => setDialogo({ tipo: 'credencial', colaborador })
  const editar = (colaborador: Colaborador) => setDialogo({ tipo: 'form', colaborador })
  const cambiarEstado = (colaborador: Colaborador) => setDialogo({ tipo: 'estado', colaborador })
  const nuevo = () => setDialogo({ tipo: 'form', colaborador: null })
  const cerrar = () => setDialogo(null)

  const columnas = crearColumnasColaboradores({ onVerQR: verQR, onEditar: editar, onCambiarEstado: cambiarEstado })

  const buscador = (
    <Input
      placeholder="Buscar por nombre…"
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
      className="md:max-w-sm"
      aria-label="Buscar colaborador por nombre"
    />
  )

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4">
        <header className="flex items-center justify-end gap-4">
          <Button onClick={nuevo} className="min-h-11">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Nuevo colaborador</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </header>

        {politica && <PoliticaVigente politica={politica} />}

        {isLoading ? (
          <ListaSkeleton />
        ) : isError ? (
          <EstadoError onReintentar={() => refetch()} />
        ) : !hayColaboradores ? (
          <ColaboradoresVacio hayBusqueda={false} onCrear={nuevo} />
        ) : (
          <>
            {/* Móvil: buscador + cards */}
            <div className="flex flex-col gap-3 md:hidden">
              {buscador}
              {filtrados.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Ningún colaborador coincide con tu búsqueda.
                </p>
              ) : (
                filtrados.map((colaborador) => (
                  <ColaboradorCard
                    key={colaborador.id}
                    colaborador={colaborador}
                    onVerQR={verQR}
                    onEditar={editar}
                    onCambiarEstado={cambiarEstado}
                  />
                ))
              )}
            </div>
            {/* md+: tabla estándar con el buscador dentro del card */}
            <div className="hidden md:block">
              <DataTable
                columns={columnas}
                data={filtrados}
                rowClassName={(c) => (c.activo ? undefined : 'opacity-60')}
                fillHeight={false}
                toolbar={buscador}
                emptyMessage="Ningún colaborador coincide con tu búsqueda."
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

function crearColumnasColaboradores({
  onVerQR,
  onEditar,
  onCambiarEstado,
}: {
  onVerQR: (c: Colaborador) => void
  onEditar: (c: Colaborador) => void
  onCambiarEstado: (c: Colaborador) => void
}): ColumnDef<Colaborador>[] {
  return [
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => <span className="font-medium">{row.original.nombre}</span>,
    },
    {
      accessorKey: 'email',
      header: 'Correo',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.email ?? '—'}</span>
      ),
    },
    {
      id: 'estado',
      header: 'Estado',
      cell: ({ row }) =>
        row.original.activo ? (
          <Badge className="bg-success text-success-foreground">Activo</Badge>
        ) : (
          <Badge variant="secondary">Inactivo</Badge>
        ),
    },
    {
      id: 'acceso',
      header: 'Acceso',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Badge variant="outline">
            {row.original.user_id != null ? 'Con acceso' : 'Sin acceso'}
          </Badge>
          <BotonInvitar colaborador={row.original} />
        </div>
      ),
    },
    {
      id: 'consumo_libre',
      header: 'Consumo libre',
      cell: ({ row }) =>
        empresaEnModoLibre(row.original) ? (
          <ToggleConsumoLibre colaborador={row.original} />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: 'acciones',
      header: () => <span className="sr-only">Acciones</span>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button variant="outline" size="sm" onClick={() => onVerQR(row.original)}>
            <QrCode className="size-4" />
            Ver QR
          </Button>
          <AccionesColaborador
            colaborador={row.original}
            onEditar={onEditar}
            onCambiarEstado={onCambiarEstado}
          />
        </div>
      ),
    },
  ]
}

/** Resumen (solo lectura) de la política de consumo de la empresa. */
function PoliticaVigente({ politica }: { politica: PoliticaEmpresa }) {
  const libre = politica.modo_consumo === 'libre'
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium">Consumo libre:</span>
        {libre ? (
          <span className="text-muted-foreground">
            Autorizado — {resumenPoliticaConsumo(politica.dias_permitidos, politica.limite_diario)}
          </span>
        ) : (
          <span className="text-muted-foreground">No autorizado</span>
        )}
      </div>
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
