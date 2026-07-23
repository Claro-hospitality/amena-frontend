import { useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
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
import type { Empresa } from './api'
import { ConfirmarEstadoDialog } from './ConfirmarEstadoDialog'
import { EmpresaCard } from './EmpresaCard'
import { EmpresaFormDialog } from './EmpresaFormDialog'
import { useEmpresas } from './queries'

type Dialogo = { tipo: 'form'; empresa: Empresa | null } | { tipo: 'estado'; empresa: Empresa }

export function EmpresasPage() {
  const { rol } = useOutletContext<ContextoAcceso>()
  const navigate = useNavigate()
  const { data: empresas, isLoading, isError, refetch } = useEmpresas()
  const [busqueda, setBusqueda] = useState('')
  const [dialogo, setDialogo] = useState<Dialogo | null>(null)

  const puedeGestionar = rol === 'super_admin'

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const base = empresas ?? []
    return q
      ? base.filter((e) =>
          `${e.nombre_comercial ?? ''} ${e.razon_social ?? ''}`.toLowerCase().includes(q)
        )
      : base
  }, [empresas, busqueda])

  const hayEmpresas = (empresas ?? []).length > 0

  if (rol !== 'super_admin' && rol !== 'finanzas' && rol !== 'consulta') {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4">
        {puedeGestionar && (
          <header className="flex items-center justify-end gap-4">
            <Button onClick={() => setDialogo({ tipo: 'form', empresa: null })}>
              <Plus className="size-4" />
              Nueva empresa
            </Button>
          </header>
        )}

        {isLoading ? (
          <CardsSkeleton />
        ) : isError ? (
          <EstadoError onReintentar={() => refetch()} />
        ) : !hayEmpresas ? (
          <EmpresasVacio
            puedeCrear={puedeGestionar}
            onCrear={() => setDialogo({ tipo: 'form', empresa: null })}
          />
        ) : (
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Buscar por nombre…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="max-w-sm"
              aria-label="Buscar empresa por nombre"
            />
            {filtradas.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtradas.map((empresa) => (
                  <EmpresaCard
                    key={empresa.id}
                    empresa={empresa}
                    puedeGestionar={puedeGestionar}
                    onVer={(e) => navigate(`/empresas/${e.id}`)}
                    onEditar={(e) => setDialogo({ tipo: 'form', empresa: e })}
                    onCambiarEstado={(e) => setDialogo({ tipo: 'estado', empresa: e })}
                  />
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Ninguna empresa coincide con tu búsqueda.
              </p>
            )}
          </div>
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

function CardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-36 w-full rounded-[min(var(--radius-4xl),24px)]" />
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
