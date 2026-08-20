import { Link } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { fechaBadge, formatearMoneda } from '@amena/utils'
import { cn } from '@amena/ui/lib/utils'
import type { Evento } from './api'
import { ocupados } from './logica'

export function crearColumnasEventos(): ColumnDef<Evento>[] {
  return [
    {
      accessorKey: 'titulo',
      header: 'Evento',
      cell: ({ row }) => (
        <div className="min-w-0">
          <Link
            to={`/eventos/catalogo/${row.original.slug}/editar`}
            className="font-medium hover:underline"
          >
            {row.original.titulo}
          </Link>
          <p className="text-xs text-muted-foreground">{row.original.categoria}</p>
        </div>
      ),
    },
    {
      accessorKey: 'fecha',
      header: 'Fecha y hora',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {fechaBadge(row.original.fecha, row.original.hora_inicio)}
        </span>
      ),
    },
    {
      accessorKey: 'precio',
      header: 'Precio',
      cell: ({ row }) => (
        <span className="tabular-nums">{formatearMoneda(row.original.precio)}</span>
      ),
    },
    {
      id: 'cupo',
      header: 'Cupo',
      cell: ({ row }) => (
        <span className="tabular-nums">
          {ocupados(row.original)} / {row.original.cupo_total}
        </span>
      ),
    },
    {
      id: 'disponibles',
      header: 'Disponibles',
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">{row.original.cupo_disponible}</span>
      ),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => (
        <span
          className={cn(
            'rounded-full px-2.5 py-1 text-xs font-semibold',
            row.original.estado === 'Publicado'
              ? 'bg-salvia-100 text-salvia-700'
              : 'bg-secondary text-muted-foreground'
          )}
        >
          {row.original.estado}
        </span>
      ),
    },
  ]
}
