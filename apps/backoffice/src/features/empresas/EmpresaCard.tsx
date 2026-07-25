import type { KeyboardEvent } from 'react'
import { Pencil, Power, PowerOff } from 'lucide-react'
import { Badge } from '@amena/ui/components/ui/badge'
import { Button } from '@amena/ui/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@amena/ui/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@amena/ui/components/ui/tooltip'
import { formatearMoneda } from '@amena/utils'
import type { Empresa } from './api'

const nombreEmpresa = (e: Empresa) => e.nombre_comercial ?? 'Empresa'

/**
 * Card de empresa clicable: al pulsarla (click o Enter/Espacio) navega al detalle.
 * Las acciones (editar/estado) detienen la propagación para no navegar.
 */
export function EmpresaCard({
  empresa,
  facturable,
  puedeGestionar,
  onVer,
  onEditar,
  onCambiarEstado,
}: {
  empresa: Empresa
  /** True si la empresa tiene sus datos fiscales completos (es facturable). */
  facturable: boolean
  puedeGestionar: boolean
  onVer: (empresa: Empresa) => void
  onEditar: (empresa: Empresa) => void
  onCambiarEstado: (empresa: Empresa) => void
}) {
  const nombre = nombreEmpresa(empresa)

  const activar = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onVer(empresa)
    }
  }

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-label={`Ver detalle de ${nombre}`}
      onClick={() => onVer(empresa)}
      onKeyDown={activar}
      className={`cursor-pointer shadow-none transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        empresa.activo ? '' : 'opacity-60'
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <CardTitle>{nombre}</CardTitle>
            {facturable ? (
              <Badge className="w-fit bg-success text-success-foreground">Facturable</Badge>
            ) : (
              <Badge variant="secondary" className="w-fit">
                Sin datos fiscales
              </Badge>
            )}
          </div>
          {empresa.activo ? (
            <Badge className="bg-success text-success-foreground">Activa</Badge>
          ) : (
            <Badge variant="secondary">Inactiva</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="font-mono tabular-nums">{formatearMoneda(empresa.precio_comida)}</span>
          <span className="text-muted-foreground">/ comida</span>
          <Badge variant="outline">
            {empresa.ciclo_facturacion === 'mensual' ? 'Mensual' : 'Semanal'}
          </Badge>
          {empresa.modo_consumo === 'libre' && (
            <Badge className="bg-success text-success-foreground">Consumo libre</Badge>
          )}
        </div>

        {puedeGestionar && (
          // Detiene la propagación: pulsar una acción no debe navegar al detalle.
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onEditar(empresa)}
                    aria-label={`Editar ${nombre}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                }
              />
              <TooltipContent>Editar</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onCambiarEstado(empresa)}
                    aria-label={`${empresa.activo ? 'Desactivar' : 'Reactivar'} ${nombre}`}
                  >
                    {empresa.activo ? (
                      <PowerOff className="size-4" />
                    ) : (
                      <Power className="size-4" />
                    )}
                  </Button>
                }
              />
              <TooltipContent>{empresa.activo ? 'Desactivar' : 'Reactivar'}</TooltipContent>
            </Tooltip>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
