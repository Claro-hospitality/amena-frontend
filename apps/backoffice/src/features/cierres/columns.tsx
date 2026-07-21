import type { ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@amena/ui/components/ui/tooltip'
import { deISO, formatearMoneda, rangoSemanaLegible } from '@amena/utils'
import type { CierreConEmpresa } from './api'
import { BadgeEstadoCierre } from './BadgeEstadoCierre'

export function crearColumnasCierres({
  onVerDetalle,
}: {
  onVerDetalle: (cierre: CierreConEmpresa) => void
}): ColumnDef<CierreConEmpresa>[] {
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
      accessorKey: 'comprometidas',
      header: 'Comprometidas',
      cell: ({ row }) => (
        <span className="font-mono tabular-nums">{row.original.comprometidas}</span>
      ),
    },
    {
      accessorKey: 'extras',
      header: 'Extras',
      cell: ({ row }) => <span className="font-mono tabular-nums">{row.original.extras}</span>,
    },
    {
      accessorKey: 'consumidas',
      header: 'Consumidas',
      cell: ({ row }) => (
        <span className="font-mono tabular-nums">{row.original.consumidas}</span>
      ),
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
      header: 'Monto',
      cell: ({ row }) => (
        <span className="font-mono tabular-nums">{formatearMoneda(row.original.monto_total)}</span>
      ),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => <BadgeEstadoCierre estado={row.original.estado} />,
    },
    {
      id: 'acciones',
      header: () => <span className="sr-only">Acciones</span>,
      cell: ({ row }) => {
        const cierre = row.original
        return (
          <div className="flex justify-end">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onVerDetalle(cierre)}
                    aria-label={`Ver detalle de ${cierre.empresa?.nombre ?? 'cierre'}`}
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
