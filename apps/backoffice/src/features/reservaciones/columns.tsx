import { Link } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { ChevronRight } from 'lucide-react'
import { formatearMoneda } from '@amena/utils'
import type { Reservacion } from './api'
import { EstadoPagoBadge } from './EstadoPagoBadge'
import { iniciales } from './logica'

export function crearColumnasReservaciones({
  onSeleccionar,
}: {
  onSeleccionar: (reservacion: Reservacion) => void
}): ColumnDef<Reservacion>[] {
  return [
    {
      accessorKey: 'nombre',
      header: 'Asistente',
      cell: ({ row }) => {
        const r = row.original
        return (
          <button
            type="button"
            onClick={() => onSeleccionar(r)}
            className="flex items-center gap-2.5 text-left"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-naranja-100 text-xs font-bold text-naranja-700">
              {iniciales(r.nombre)}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-medium">{r.nombre}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {r.personas} persona{r.personas === 1 ? '' : 's'}
              </span>
            </span>
          </button>
        )
      },
    },
    {
      accessorKey: 'folio',
      header: 'Folio',
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.folio}</span>,
    },
    {
      accessorKey: 'monto',
      header: 'Monto',
      cell: ({ row }) => (
        <span className="font-medium tabular-nums">{formatearMoneda(row.original.monto)}</span>
      ),
    },
    {
      accessorKey: 'estado_pago',
      header: 'Pago',
      cell: ({ row }) => <EstadoPagoBadge estado={row.original.estado_pago} />,
    },
    {
      accessorKey: 'estado_boleto',
      header: 'Boleto',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.estado_boleto}</span>
      ),
    },
    {
      id: 'detalle',
      header: '',
      cell: ({ row }) => (
        <Link
          to={`/eventos/reservaciones/${row.original.folio}`}
          className="flex items-center gap-0.5 text-xs font-semibold text-primary hover:underline"
        >
          Ver detalle
          <ChevronRight className="size-3.5" />
        </Link>
      ),
    },
  ]
}
