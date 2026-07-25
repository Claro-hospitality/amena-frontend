import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { CalendarDays, Plus, QrCode, TriangleAlert, UtensilsCrossed, Users } from 'lucide-react'
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
import { formatearDiasPermitidos } from '@amena/utils'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { empresaEnModoLibre, type Colaborador, type PoliticaEmpresa } from './api'
import { AccionesColaborador, ToggleConsumoLibre } from './ColaboradorAcciones'
import { ColaboradorCard } from './ColaboradorCard'
import { ColaboradorFormDialog } from './ColaboradorFormDialog'
import {
  ConfirmarAccesoColaborador,
  ConfirmarEliminarColaborador,
} from './ConfirmarAccesoColaborador'
import { CredencialDialog } from './CredencialDialog'
import { RestablecerPasswordColaborador } from './RestablecerPasswordColaborador'
import { useColaboradores } from './queries'

type Dialogo =
  | { tipo: 'form'; colaborador: Colaborador | null }
  | { tipo: 'credencial'; colaborador: Colaborador }
  | { tipo: 'reset'; colaborador: Colaborador }
  | { tipo: 'acceso'; colaborador: Colaborador }
  | { tipo: 'eliminar'; colaborador: Colaborador }

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
  const restablecer = (colaborador: Colaborador) => setDialogo({ tipo: 'reset', colaborador })
  const toggleAcceso = (colaborador: Colaborador) => setDialogo({ tipo: 'acceso', colaborador })
  const eliminar = (colaborador: Colaborador) => setDialogo({ tipo: 'eliminar', colaborador })
  const nuevo = () => setDialogo({ tipo: 'form', colaborador: null })
  const cerrar = () => setDialogo(null)

  const columnas = crearColumnasColaboradores({
    onVerQR: verQR,
    onEditar: editar,
    onResetear: restablecer,
    onToggleAcceso: toggleAcceso,
    onEliminar: eliminar,
  })

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
                    onResetear={restablecer}
                    onToggleAcceso={toggleAcceso}
                    onEliminar={eliminar}
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
      {dialogo?.tipo === 'reset' && (
        <RestablecerPasswordColaborador colaborador={dialogo.colaborador} onClose={cerrar} />
      )}
      {dialogo?.tipo === 'acceso' && (
        <ConfirmarAccesoColaborador colaborador={dialogo.colaborador} onClose={cerrar} />
      )}
      {dialogo?.tipo === 'eliminar' && (
        <ConfirmarEliminarColaborador colaborador={dialogo.colaborador} onClose={cerrar} />
      )}
    </TooltipProvider>
  )
}

function crearColumnasColaboradores({
  onVerQR,
  onEditar,
  onResetear,
  onToggleAcceso,
  onEliminar,
}: {
  onVerQR: (c: Colaborador) => void
  onEditar: (c: Colaborador) => void
  onResetear: (c: Colaborador) => void
  onToggleAcceso: (c: Colaborador) => void
  onEliminar: (c: Colaborador) => void
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
          <Badge variant="destructive">Inactivo</Badge>
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
            onResetear={onResetear}
            onToggleAcceso={onToggleAcceso}
            onEliminar={onEliminar}
          />
        </div>
      ),
    },
  ]
}

/** Resumen (solo lectura) de la política de consumo de la empresa. Solo se muestra cuando la
 *  empresa tiene consumo libre; en modo declaración no se muestra nada. */
function PoliticaVigente({ politica }: { politica: PoliticaEmpresa }) {
  // Modo declaración: no se muestra ninguna tarjeta.
  if (politica.modo_consumo !== 'libre') return null

  // Modo libre: card destacado con los tonos de marca (salvia), claro sobre qué habilita.
  const dias = formatearDiasPermitidos(politica.dias_permitidos)
  const diasLabel = dias === 'L-V' ? 'Lunes a viernes' : dias
  const sinLimite = politica.limite_diario == null

  return (
    <div className="rounded-xl border border-salvia-200 bg-salvia-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">Consumo libre activo</h3>
            <Badge className="bg-secondary text-secondary-foreground">Autorizado</Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Tus colaboradores autorizados piden su comida{' '}
            <strong className="font-medium text-foreground">sin declararla por adelantado</strong>,
            dentro de estos límites:
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-salvia-200 bg-card px-3 py-2 text-sm font-medium">
            <CalendarDays className="size-4 text-salvia-600" />
            {diasLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-salvia-200 bg-card px-3 py-2 text-sm font-medium">
            <UtensilsCrossed className="size-4 text-salvia-600" />
            {sinLimite ? 'Comidas ilimitadas' : `Hasta ${politica.limite_diario} al día`}
          </span>
        </div>
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
