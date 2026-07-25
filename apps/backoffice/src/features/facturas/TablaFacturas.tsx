import { useMemo, useState } from 'react'
import { DataTable } from '@amena/ui/components/data-table'
import { Field, FieldLabel } from '@amena/ui/components/ui/field'
import { SearchInput } from '@amena/ui/components/ui/search-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@amena/ui/components/ui/select'
import type { FacturaConEmpresa } from './api'
import { crearColumnasFacturas } from './columns'

const TODOS = 'todos'

function anioDe(f: FacturaConEmpresa): string {
  return String(new Date(f.facturado_en ?? f.created_at).getFullYear())
}

/** Tabla de facturas con búsqueda + filtros de estado y año. `conEmpresa` para la vista global. */
export function TablaFacturas({
  facturas,
  conEmpresa,
}: {
  facturas: FacturaConEmpresa[]
  conEmpresa: boolean
}) {
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState<string>(TODOS)
  const [anio, setAnio] = useState<string>(TODOS)

  const anios = useMemo(() => {
    const set = new Set<string>()
    for (const f of facturas) set.add(anioDe(f))
    return [...set].sort((a, b) => b.localeCompare(a))
  }, [facturas])

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return facturas.filter((f) => {
      if (estado !== TODOS && f.estado !== estado) return false
      if (anio !== TODOS && anioDe(f) !== anio) return false
      if (q) {
        const folio = `${f.serie}-${f.folio}`.toLowerCase()
        const emp = (f.empresa?.nombre ?? '').toLowerCase()
        if (!folio.includes(q) && !emp.includes(q)) return false
      }
      return true
    })
  }, [facturas, busqueda, estado, anio])

  const columnas = useMemo(() => crearColumnasFacturas({ conEmpresa }), [conEmpresa])

  return (
    <DataTable
      columns={columnas}
      data={filtradas}
      fillHeight
      rowClassName={(f) => (f.estado === 'error' ? 'bg-destructive/5' : '')}
      emptyMessage="No hay facturas que coincidan."
      toolbar={
        <div className="flex flex-wrap items-end gap-3">
          <SearchInput
            placeholder={conEmpresa ? 'Buscar folio o empresa…' : 'Buscar folio…'}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="max-w-xs"
            aria-label="Buscar factura"
          />
          <Field className="w-40">
            <FieldLabel htmlFor="f-estado">Estado</FieldLabel>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger id="f-estado" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos</SelectItem>
                <SelectItem value="borrador">Borrador</SelectItem>
                <SelectItem value="emitida">Emitida</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="pagada">Pagada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {anios.length > 1 && (
            <Field className="w-32">
              <FieldLabel htmlFor="f-anio">Año</FieldLabel>
              <Select value={anio} onValueChange={setAnio}>
                <SelectTrigger id="f-anio" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODOS}>Todos</SelectItem>
                  {anios.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        </div>
      }
    />
  )
}
