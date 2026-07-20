import type { ColumnDef } from '@tanstack/react-table'
import { Pencil, Power, PowerOff } from 'lucide-react'
import { Badge } from '@amena/ui/components/ui/badge'
import { Button } from '@amena/ui/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@amena/ui/components/ui/tooltip'
import { formatearMoneda } from '@amena/utils'
import type { RolBackoffice } from '../../auth/validarAccesoPortal'
import type { Empresa } from './api'

interface OpcionesColumnas {
  rol: RolBackoffice
  onEditar: (empresa: Empresa) => void
  onCambiarEstado: (empresa: Empresa) => void
}

export function crearColumnasEmpresas({
  rol,
  onEditar,
  onCambiarEstado,
}: OpcionesColumnas): ColumnDef<Empresa>[] {
  const columnas: ColumnDef<Empresa>[] = [
    {
      accessorKey: 'nombre_comercial',
      header: 'Nombre comercial',
      cell: ({ row }) => <span className="font-medium">{row.original.nombre_comercial}</span>,
    },
    {
      accessorKey: 'razon_social',
      header: 'Razón social',
      cell: ({ row }) =>
        row.original.razon_social ? (
          row.original.razon_social
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: 'precio_comida',
      header: 'Precio por comida',
      cell: ({ row }) => (
        <span className="font-mono tabular-nums">{formatearMoneda(row.original.precio_comida)}</span>
      ),
    },
    {
      accessorKey: 'ciclo_facturacion',
      header: 'Ciclo',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.ciclo_facturacion === 'mensual' ? 'Mensual' : 'Semanal'}
        </Badge>
      ),
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      cell: ({ row }) =>
        row.original.activo ? (
          <Badge className="bg-success text-success-foreground">Activa</Badge>
        ) : (
          <Badge variant="secondary">Inactiva</Badge>
        ),
    },
  ]

  if (rol === 'super_admin') {
    columnas.push({
      id: 'acciones',
      header: () => <span className="sr-only">Acciones</span>,
      cell: ({ row }) => {
        const empresa = row.original
        return (
          <div className="flex justify-end gap-1">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onEditar(empresa)}
                    aria-label={`Editar ${empresa.nombre_comercial}`}
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
                    aria-label={`${empresa.activo ? 'Desactivar' : 'Reactivar'} ${empresa.nombre_comercial}`}
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
        )
      },
    })
  }

  return columnas
}
