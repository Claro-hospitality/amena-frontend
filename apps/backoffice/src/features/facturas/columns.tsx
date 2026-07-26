import type { ColumnDef } from '@tanstack/react-table'
import { Copy, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@amena/ui/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@amena/ui/components/ui/tooltip'
import { deISO, etiquetaDia, formatearMoneda, rangoSemanaLegible } from '@amena/utils'
import { descargarArchivoFactura, type FacturaConEmpresa } from './api'
import { BadgeEstadoFactura } from './BadgeEstadoFactura'

function copiar(texto: string) {
  navigator.clipboard?.writeText(texto).then(
    () => toast.success('UUID copiado'),
    () => toast.error('No se pudo copiar'),
  )
}

/** Columnas de la tabla de facturas. `conEmpresa` agrega la columna de empresa (vista global). */
export function crearColumnasFacturas({
  conEmpresa,
}: {
  conEmpresa: boolean
}): ColumnDef<FacturaConEmpresa>[] {
  const cols: ColumnDef<FacturaConEmpresa>[] = []

  if (conEmpresa) {
    cols.push({
      accessorKey: 'empresa',
      header: 'Empresa',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.empresa?.nombre ?? '—'}</span>
      ),
    })
  }

  cols.push(
    {
      accessorKey: 'folio',
      header: 'Folio',
      cell: ({ row }) => (
        <span className="font-mono">
          {row.original.serie}
          {row.original.serie ? '-' : ''}
          {row.original.folio}
        </span>
      ),
    },
    {
      accessorKey: 'facturado_en',
      header: 'Fecha',
      cell: ({ row }) => {
        const iso = row.original.facturado_en ?? row.original.created_at
        return <span>{etiquetaDia(new Date(iso))}</span>
      },
    },
    {
      accessorKey: 'periodo_inicio',
      header: 'Período',
      cell: ({ row }) => rangoSemanaLegible(deISO(row.original.periodo_inicio)),
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => (
        <span className="font-mono font-semibold tabular-nums text-primary">
          {formatearMoneda(row.original.total)}
        </span>
      ),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => <BadgeEstadoFactura estado={row.original.estado} />,
    },
    {
      accessorKey: 'uuid_sat',
      header: 'UUID SAT',
      cell: ({ row }) => {
        const uuid = row.original.uuid_sat
        if (!uuid) return <span className="text-muted-foreground">—</span>
        return (
          <div className="flex items-center gap-1">
            <span className="max-w-[9rem] truncate font-mono text-xs" title={uuid}>
              {uuid}
            </span>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => copiar(uuid)}
                    aria-label="Copiar UUID"
                  >
                    <Copy className="size-3.5" />
                  </Button>
                }
              />
              <TooltipContent>Copiar UUID</TooltipContent>
            </Tooltip>
          </div>
        )
      },
    },
    {
      id: 'acciones',
      header: () => <span className="sr-only">Descargas</span>,
      cell: ({ row }) => {
        const f = row.original
        if (!f.pdf_url && !f.xml_url) return null
        return (
          <div className="flex justify-end gap-1">
            {f.pdf_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => descargarArchivoFactura(f.pdf_url!, `factura-${f.folio}.pdf`)}
              >
                <Download className="size-4" />
                PDF
              </Button>
            )}
            {f.xml_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => descargarArchivoFactura(f.xml_url!, `factura-${f.folio}.xml`)}
              >
                <Download className="size-4" />
                XML
              </Button>
            )}
          </div>
        )
      },
    },
  )

  return cols
}
