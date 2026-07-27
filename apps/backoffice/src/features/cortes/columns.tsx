import type { ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import { Badge } from '@amena/ui/components/ui/badge'
import { Button } from '@amena/ui/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@amena/ui/components/ui/tooltip'
import { deISO, formatearMoneda, rangoSemanaLegible } from '@amena/utils'
import { BadgeEstadoFactura } from '../facturas/BadgeEstadoFactura'
import type { CorteConEmpresa } from './api'
import { BadgeEstadoCorte } from './BadgeEstadoCorte'

export function crearColumnasCortes({
  onVerDetalle,
}: {
  onVerDetalle: (corte: CorteConEmpresa) => void
}): ColumnDef<CorteConEmpresa>[] {
  return [
    {
      accessorKey: 'empresa',
      header: 'Empresa',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.empresa?.nombre ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'semana_inicio',
      header: 'Semana',
      cell: ({ row }) => rangoSemanaLegible(deISO(row.original.semana_inicio)),
    },
    {
      id: 'consumos',
      header: 'Consumos',
      cell: ({ row }) => {
        const c = row.original
        return (
          <div className="flex flex-col gap-0.5 leading-tight">
            <span>
              <span className="font-mono font-medium tabular-nums">{c.consumidas}</span>{' '}
              <span className="text-muted-foreground">consumidas</span>
            </span>
            <span className="text-xs text-muted-foreground">
              <span className="font-mono tabular-nums text-foreground">{c.reservadas}</span>{' '}
              reservadas ·{' '}
              <span className="font-mono tabular-nums text-foreground">{c.extras}</span> extras
            </span>
          </div>
        )
      },
    },
    {
      id: 'facturada',
      header: 'Facturada',
      cell: ({ row }) => {
        const factura = row.original.factura
        return factura ? (
          <BadgeEstadoFactura estado={factura.estado} />
        ) : (
          <Badge variant="secondary">Sin facturar</Badge>
        )
      },
    },
    {
      accessorKey: 'precio_unitario',
      header: 'Precio unitario',
      cell: ({ row }) => (
        <span className="font-mono tabular-nums">
          {formatearMoneda(row.original.precio_unitario)}
        </span>
      ),
    },
    {
      accessorKey: 'monto_total',
      header: 'Total',
      cell: ({ row }) => (
        <span className="font-mono tabular-nums font-semibold text-primary">
          {formatearMoneda(row.original.monto_total)}
        </span>
      ),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => <BadgeEstadoCorte estado={row.original.estado} />,
    },
    {
      id: 'acciones',
      header: () => <span className="sr-only">Acciones</span>,
      cell: ({ row }) => {
        const corte = row.original
        return (
          <div className="flex justify-end">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onVerDetalle(corte)}
                    aria-label={`Ver detalle de ${corte.empresa?.nombre ?? 'corte'}`}
                  >
                    <Eye className="size-4" />
                  </Button>
                }
              />
              <TooltipContent>Ver detalle</TooltipContent>
            </Tooltip>
          </div>
        )
      },
    },
  ]
}
