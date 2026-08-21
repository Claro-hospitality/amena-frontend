import { Link } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { Pencil } from 'lucide-react'
import { fechaCorta, formatearMoneda, rangoHorario } from '@amena/utils'
import { Button } from '@amena/ui/components/ui/button'
import type { Evento } from './api'
import { BarraCupo } from './BarraCupo'
import { EstadoEventoBadge } from './EstadoEventoBadge'
import { ocupados } from './logica'

/**
 * Columnas del catálogo, adaptadas del diseño original de amena.social: miniatura de la imagen
 * destacada, categoría como pastilla, fecha y hora en dos líneas, y el cupo con su barra de
 * avance. La densidad importa — es la pantalla desde la que se opera el catálogo completo.
 */
export function crearColumnasEventos(): ColumnDef<Evento>[] {
  return [
    {
      accessorKey: 'titulo',
      header: 'Evento',
      cell: ({ row }) => {
        const e = row.original
        return (
          <div className="flex items-center gap-3">
            <img
              src={e.imagen_url}
              alt={`Imagen de ${e.titulo}`}
              className="size-11 shrink-0 rounded-lg border border-border bg-muted object-cover"
              loading="lazy"
            />
            <div className="flex min-w-0 flex-col items-start gap-1">
              <Link
                to={`/eventos/catalogo/${e.slug}/editar`}
                className="truncate font-semibold hover:underline"
              >
                {e.titulo}
              </Link>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {e.categoria}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'fecha',
      header: 'Fecha y hora',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{fechaCorta(row.original.fecha)}</span>
          <span className="text-xs text-muted-foreground">
            {rangoHorario(row.original.hora_inicio, row.original.hora_fin)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'precio',
      header: 'Precio',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-semibold">
          {formatearMoneda(row.original.precio)}
        </span>
      ),
    },
    {
      id: 'cupo',
      header: 'Cupo',
      cell: ({ row }) => <BarraCupo evento={row.original} />,
    },
    {
      id: 'reservas',
      header: 'Reservas',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-semibold">{ocupados(row.original)}</span>
      ),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => <EstadoEventoBadge estado={row.original.estado} />,
    },
    {
      id: 'acciones',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="icon"
            nativeButton={false}
            aria-label={`Editar ${row.original.titulo}`}
            render={<Link to={`/eventos/catalogo/${row.original.slug}/editar`} />}
          >
            <Pencil className="size-4" />
          </Button>
        </div>
      ),
    },
  ]
}
