import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useState, type ReactNode } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@amena/ui/components/ui/table'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** Clase por fila (p. ej. atenuar filas inactivas). */
  rowClassName?: (row: TData) => string | undefined
  /** Contenido opcional dentro del card, arriba de la tabla (p. ej. un buscador). */
  toolbar?: ReactNode
  /** Mensaje cuando no hay filas que mostrar (búsqueda sin coincidencias, etc.). */
  emptyMessage?: string
}

/**
 * Tabla de datos reutilizable (patrón data-table de shadcn sobre @tanstack/react-table).
 * Contenedor con scroll horizontal para seguir operable en tablet/móvil.
 * (No se usa el componente scroll-area del kit por un bug de import sin usar; ver reporte.)
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  rowClassName,
  toolbar,
  emptyMessage,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const filas = table.getRowModel().rows

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {toolbar ? <div className="border-b border-border p-3">{toolbar}</div> : null}
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((grupo) => (
              <TableRow key={grupo.id}>
                {grupo.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {filas.length ? (
              filas.map((row) => (
                <TableRow key={row.id} className={rowClassName?.(row.original)}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage ?? 'Sin resultados.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
