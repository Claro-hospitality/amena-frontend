import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Building2, Plus, TriangleAlert } from 'lucide-react'
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
import { TooltipProvider } from '@amena/ui/components/ui/tooltip'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { DataTable } from '../../components/data-table'
import type { Empresa } from './api'
import { ConfirmarEstadoDialog } from './ConfirmarEstadoDialog'
import { crearColumnasEmpresas } from './columns'
import { EmpresaFormDialog } from './EmpresaFormDialog'
import { useEmpresas } from './queries'

type Dialogo = { tipo: 'form'; empresa: Empresa | null } | { tipo: 'estado'; empresa: Empresa }

export function EmpresasPage() {
  const { rol } = useOutletContext<ContextoAcceso>()
  const { data: empresas, isLoading, isError, refetch } = useEmpresas()
  const [busqueda, setBusqueda] = useState('')
  const [dialogo, setDialogo] = useState<Dialogo | null>(null)

  const puedeGestionar = rol === 'super_admin'

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const base = empresas ?? []
    return q ? base.filter((e) => e.nombre.toLowerCase().includes(q)) : base
  }, [empresas, busqueda])

  const hayEmpresas = (empresas ?? []).length > 0

  const columnas = crearColumnasEmpresas({
    rol,
    onEditar: (empresa) => setDialogo({ tipo: 'form', empresa }),
    onCambiarEstado: (empresa) => setDialogo({ tipo: 'estado', empresa }),
  })

  if (rol !== 'super_admin' && rol !== 'finanzas') {
    return <p className="p-6 text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4 p-6">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold">Empresas</h1>
          {puedeGestionar && (
            <Button onClick={() => setDialogo({ tipo: 'form', empresa: null })}>
              <Plus className="size-4" />
              Nueva empresa
            </Button>
          )}
        </header>

        {isLoading ? (
          <TablaSkeleton />
        ) : isError ? (
          <EstadoError onReintentar={() => refetch()} />
        ) : !hayEmpresas ? (
          <EmpresasVacio
            puedeCrear={puedeGestionar}
            onCrear={() => setDialogo({ tipo: 'form', empresa: null })}
          />
        ) : (
          <DataTable
            columns={columnas}
            data={filtradas}
            rowClassName={(empresa) => (empresa.activo ? undefined : 'opacity-60')}
            toolbar={
              <Input
                placeholder="Buscar por nombre…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="max-w-sm"
                aria-label="Buscar empresa por nombre"
              />
            }
            emptyMessage="Ninguna empresa coincide con tu búsqueda."
          />
        )}
      </div>

      {dialogo?.tipo === 'form' && (
        <EmpresaFormDialog
          key={dialogo.empresa?.id ?? 'nuevo'}
          empresa={dialogo.empresa}
          onClose={() => setDialogo(null)}
        />
      )}
      {dialogo?.tipo === 'estado' && (
        <ConfirmarEstadoDialog empresa={dialogo.empresa} onClose={() => setDialogo(null)} />
      )}
    </TooltipProvider>
  )
}

function TablaSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
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
        <EmptyTitle>No se pudieron cargar las empresas</EmptyTitle>
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

function EmpresasVacio({ puedeCrear, onCrear }: { puedeCrear: boolean; onCrear: () => void }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Building2 className="size-6" />
        </EmptyMedia>
        <EmptyTitle>Aún no hay empresas</EmptyTitle>
        <EmptyDescription>Registra la primera empresa convenio para empezar.</EmptyDescription>
      </EmptyHeader>
      {puedeCrear && (
        <EmptyContent>
          <Button onClick={onCrear}>
            <Plus className="size-4" />
            Nueva empresa
          </Button>
        </EmptyContent>
      )}
    </Empty>
  )
}
