import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@amena/ui/components/ui/badge'
import { nombreEmpresa, type Colaborador } from './api'

/** Columnas del listado global de colaboradores (backoffice). */
export const columnasColaboradores: ColumnDef<Colaborador>[] = [
  {
    accessorKey: 'nombre',
    header: 'Nombre',
    cell: ({ row }) => <span className="font-medium">{row.original.nombre}</span>,
  },
  {
    id: 'empresa',
    header: 'Empresa',
    cell: ({ row }) => nombreEmpresa(row.original),
  },
  {
    accessorKey: 'email',
    header: 'Correo',
    cell: ({ row }) =>
      row.original.email ? (
        row.original.email
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: 'activo',
    header: 'Estado',
    cell: ({ row }) =>
      row.original.activo ? (
        <Badge className="bg-success text-success-foreground">Activo</Badge>
      ) : (
        <Badge variant="outline">Inactivo</Badge>
      ),
  },
]
