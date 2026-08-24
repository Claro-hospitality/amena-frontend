import { useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { ArrowLeft, Building2, Power, PowerOff, TriangleAlert } from 'lucide-react'
import { Badge } from '@amena/ui/components/ui/badge'
import { Button } from '@amena/ui/components/ui/button'
import { Card, CardContent } from '@amena/ui/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@amena/ui/components/ui/empty'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { TooltipProvider } from '@amena/ui/components/ui/tooltip'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { useSetMigasDetalle } from '../../layout/tituloDetalle'
import type { Empresa } from './api'
import { ConfirmarEstadoDialog } from './ConfirmarEstadoDialog'
import { DatosComercialesSection } from './DatosComercialesSection'
import { DatosFiscalesForm } from './DatosFiscalesForm'
import { PoliticaConsumoSection } from './PoliticaConsumoSection'
import { useEmpresas } from './queries'

const nombreEmpresa = (e: Empresa) => e.nombre_comercial ?? 'Empresa'

/**
 * Página de configuración de una empresa (hija del detalle). Reúne la política de consumo
 * y las acciones de Editar / Desactivar. Solo super_admin.
 */
export function ConfigurarEmpresaPage() {
  const { rol } = useOutletContext<ContextoAcceso>()
  const { empresaId } = useParams<{ empresaId: string }>()
  const navigate = useNavigate()
  const id = Number(empresaId)

  const { data: empresas, isLoading, isError, refetch } = useEmpresas()
  const empresa = empresas?.find((e) => e.id === id)

  const [confirmandoEstado, setConfirmandoEstado] = useState(false)

  // Breadcrumb: Empresas › [Empresa] › Configurar.
  useSetMigasDetalle(
    empresa
      ? [
          { label: nombreEmpresa(empresa), to: `/empresas/${id}` },
          { label: 'Configurar', to: `/empresas/${id}/configurar` },
        ]
      : []
  )

  if (rol !== 'super_admin') {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  if (Number.isNaN(id) || (empresas && !empresa)) {
    return <EmpresaNoEncontrada />
  }

  if (isLoading || !empresa) {
    return isError ? <EstadoError onReintentar={() => refetch()} /> : <ConfigSkeleton />
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/empresas/${id}`)}>
            <ArrowLeft className="size-4" />
            Volver al detalle
          </Button>
        </div>

        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight">{nombreEmpresa(empresa)}</h1>
              {empresa.activo ? (
                <Badge className="bg-success text-success-foreground">Activa</Badge>
              ) : (
                <Badge variant="secondary">Inactiva</Badge>
              )}
            </div>
            <span className="text-sm text-muted-foreground">Configuración de la empresa</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={empresa.activo ? 'destructive' : 'default'}
              size="sm"
              onClick={() => setConfirmandoEstado(true)}
            >
              {empresa.activo ? <PowerOff className="size-4" /> : <Power className="size-4" />}
              {empresa.activo ? 'Desactivar' : 'Reactivar'}
            </Button>
          </div>
        </header>

        <DatosComercialesSection empresa={empresa} />

        <Card className="shadow-none">
          <CardContent className="flex flex-col gap-5 p-5">
            <h2 className="text-sm font-semibold tracking-tight">Datos fiscales</h2>
            <DatosFiscalesForm empresaId={empresa.id} />
          </CardContent>
        </Card>

        <PoliticaConsumoSection empresa={empresa} puedeGestionar />
      </div>

      {confirmandoEstado && (
        <ConfirmarEstadoDialog empresa={empresa} onClose={() => setConfirmandoEstado(false)} />
      )}
    </TooltipProvider>
  )
}

function ConfigSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

function EmpresaNoEncontrada() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Building2 className="size-6" />
        </EmptyMedia>
        <EmptyTitle>Empresa no encontrada</EmptyTitle>
        <EmptyDescription>La empresa que buscas no existe o fue removida.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

function EstadoError({ onReintentar }: { onReintentar: () => void }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlert className="size-6" />
        </EmptyMedia>
        <EmptyTitle>No se pudo cargar la empresa</EmptyTitle>
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
