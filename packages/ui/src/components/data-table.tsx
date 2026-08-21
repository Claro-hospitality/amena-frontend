"use client"

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import * as React from "react"

import { Button } from "@amena/ui/components/ui/button"
import { cn } from "@amena/ui/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@amena/ui/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@amena/ui/components/ui/table"

/** Re-export para que las apps definan columnas sin depender directo de react-table. */
export type { ColumnDef } from "@tanstack/react-table"

/** Opciones de tamaño de página del estándar Amena: 10 por defecto, 25 y 50 como máximo. */
const OPCIONES_TAMANO_PAGINA = [10, 25, 50] as const

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** Clase por fila (p. ej. atenuar filas inactivas). */
  rowClassName?: (row: TData) => string | undefined
  /** Contenido dentro del card, arriba de la tabla (buscador y/o filtros). */
  toolbar?: React.ReactNode
  /** Mensaje cuando no hay filas que mostrar (búsqueda/filtro sin coincidencias). */
  emptyMessage?: string
  /**
   * En desktop la tabla ocupa todo el alto disponible y su cuerpo hace scroll
   * interno (el encabezado y la paginación quedan fijos). El contenedor padre
   * debe darle altura (flex-1 / min-h-0). Por defecto activo.
   */
  fillHeight?: boolean
  /** Filas por página iniciales. Por defecto 10. */
  pageSizeInicial?: number
  /**
   * Paginación contra el servidor: la tabla recibe SOLO las filas de la página y el total real
   * de la consulta. Sin esta prop la tabla pagina en el navegador con las filas que se le pasen.
   *
   * Ojo: si se pagina en el servidor, el filtrado y el orden también tienen que estar allá. Si
   * no, se filtraría únicamente la página visible, que es peor que no paginar.
   */
  paginacionServidor?: {
    pageIndex: number
    pageSize: number
    /** Filas que casan con la consulta, no las de esta página. */
    total: number
    onChange: (siguiente: { pageIndex: number; pageSize: number }) => void
  }
  className?: string
}

/**
 * Tabla de datos estándar de Amena (patrón data-table de shadcn sobre
 * @tanstack/react-table). Compartida por ambas apps (@amena/ui).
 *
 * Estándar visual:
 * - Encabezado con superficie propia (`bg-muted`) y pegajoso al hacer scroll.
 * - Toolbar (buscador/filtros) DENTRO del mismo card, sin línea divisora encima.
 * - Desktop: ocupa el alto restante de la pantalla; el cuerpo hace scroll interno.
 * - Paginación con 10 filas por página (opciones 25 y 50).
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  rowClassName,
  toolbar,
  emptyMessage,
  fillHeight = true,
  pageSizeInicial = OPCIONES_TAMANO_PAGINA[0],
  paginacionServidor,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [paginacionLocal, setPaginacionLocal] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSizeInicial,
  })

  const enServidor = paginacionServidor !== undefined
  const pagination: PaginationState = enServidor
    ? { pageIndex: paginacionServidor.pageIndex, pageSize: paginacionServidor.pageSize }
    : paginacionLocal

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      const siguiente = typeof updater === "function" ? updater(pagination) : updater
      if (paginacionServidor) paginacionServidor.onChange(siguiente)
      else setPaginacionLocal(siguiente)
    },
    // Con `manualPagination` react-table no rebana las filas (ya vienen rebanadas) y `rowCount`
    // es lo que le permite saber si hay página siguiente.
    manualPagination: enServidor,
    rowCount: enServidor ? paginacionServidor.total : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const filas = table.getRowModel().rows
  const totalFilas = enServidor
    ? paginacionServidor.total
    : table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize } = table.getState().pagination
  const desde = totalFilas === 0 ? 0 : pageIndex * pageSize + 1
  const hasta = Math.min(desde + filas.length - 1, totalFilas)

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-border bg-card",
        fillHeight && "md:min-h-0 md:flex-1",
        className,
      )}
    >
      {toolbar ? <div className="shrink-0 p-3">{toolbar}</div> : null}

      <div className="min-h-0 flex-1 overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((grupo) => (
              <TableRow key={grupo.id} className="hover:bg-transparent">
                {grupo.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="sticky top-0 z-10 bg-muted text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage ?? "Sin resultados."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalFilas > 0 ? (
        <div className="flex shrink-0 flex-col gap-3 border-t border-border p-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <label htmlFor="datatable-page-size">Filas por página</label>
            <Select
              value={pageSize}
              onValueChange={(valor) => table.setPageSize(Number(valor))}
            >
              <SelectTrigger
                id="datatable-page-size"
                size="sm"
                aria-label="Filas por página"
              >
                <SelectValue>{(valor) => valor as number}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {OPCIONES_TAMANO_PAGINA.map((opcion) => (
                  <SelectItem key={opcion} value={opcion}>
                    {opcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <span className="tabular-nums">
              {desde}–{hasta} de {totalFilas}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Página anterior"
              >
                <ChevronLeftIcon className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Página siguiente"
              >
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
