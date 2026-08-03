import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import { Calendar } from '@amena/ui/components/ui/calendar'
import { Field, FieldLabel } from '@amena/ui/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@amena/ui/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@amena/ui/components/ui/select'
import { cn } from '@amena/ui/lib/utils'
import { deISO } from '@amena/utils'
import { etiquetaRango, rangoPorGranularidad, type Granularidad } from './logica'

const FORMATTERS = {
  formatCaption: (d: Date) => d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }),
  formatWeekdayName: (d: Date) => d.toLocaleDateString('es-MX', { weekday: 'narrow' }),
}

const ETIQUETA_GRANULARIDAD: Record<Granularidad, string> = {
  dia: 'Día',
  semana: 'Semana',
  mes: 'Mes',
}

/** Rango [lunes, domingo] de la semana de `fecha` como fechas (para el modo range del calendario). */
function semanaComoRango(fecha: Date) {
  const { desde, hasta } = rangoPorGranularidad(fecha, 'semana')
  return { from: deISO(desde), to: deISO(hasta) }
}

/**
 * Selector de periodo del filtro de consumos: un Select (Día/Semana/Mes) y, según el elegido,
 * el picker adecuado en un popover — un día (calendario simple), una semana (calendario que
 * resalta la semana completa) o un mes (rejilla de meses).
 */
export function SelectorPeriodo({
  granularidad,
  fecha,
  onGranularidad,
  onFecha,
}: {
  granularidad: Granularidad
  fecha: Date
  onGranularidad: (g: Granularidad) => void
  onFecha: (d: Date) => void
}) {
  const [abierto, setAbierto] = useState(false)
  const hoy = new Date()
  const elegir = (d: Date) => {
    onFecha(d)
    setAbierto(false)
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <Field className="w-32 gap-1">
        <FieldLabel htmlFor="periodo">Periodo</FieldLabel>
        <Select value={granularidad} onValueChange={(v) => onGranularidad(v as Granularidad)}>
          <SelectTrigger id="periodo" className="w-full" aria-label="Tipo de periodo">
            <SelectValue>{(v) => ETIQUETA_GRANULARIDAD[v as Granularidad]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dia">Día</SelectItem>
            <SelectItem value="semana">Semana</SelectItem>
            <SelectItem value="mes">Mes</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field className="gap-1">
        <FieldLabel>{ETIQUETA_GRANULARIDAD[granularidad]}</FieldLabel>
        <Popover open={abierto} onOpenChange={setAbierto}>
          <PopoverTrigger
            render={<Button variant="outline" className="min-w-56 justify-start gap-2 capitalize" />}
          >
            <CalendarDays className="size-4 shrink-0" />
            {etiquetaRango(fecha, granularidad)}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            {granularidad === 'mes' ? (
              <SelectorMes fecha={fecha} hoy={hoy} onSelect={elegir} />
            ) : granularidad === 'semana' ? (
              <Calendar
                mode="range"
                selected={semanaComoRango(fecha)}
                onSelect={() => {}}
                onDayClick={(d) => elegir(d)}
                defaultMonth={fecha}
                disabled={{ after: hoy }}
                showOutsideDays={false}
                formatters={FORMATTERS}
              />
            ) : (
              <Calendar
                mode="single"
                selected={fecha}
                onSelect={(d) => d && elegir(d)}
                defaultMonth={fecha}
                disabled={{ after: hoy }}
                showOutsideDays={false}
                formatters={FORMATTERS}
              />
            )}
          </PopoverContent>
        </Popover>
      </Field>
    </div>
  )
}

/** Rejilla de 12 meses con navegación de año, para elegir un mes específico. */
function SelectorMes({
  fecha,
  hoy,
  onSelect,
}: {
  fecha: Date
  hoy: Date
  onSelect: (d: Date) => void
}) {
  const [anio, setAnio] = useState(fecha.getFullYear())

  return (
    <div className="w-64 p-3">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Año anterior"
          onClick={() => setAnio((a) => a - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-medium tabular-nums">{anio}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Año siguiente"
          disabled={anio >= hoy.getFullYear()}
          onClick={() => setAnio((a) => a + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1">
        {Array.from({ length: 12 }, (_, m) => {
          const futuro = anio > hoy.getFullYear() || (anio === hoy.getFullYear() && m > hoy.getMonth())
          const activo = fecha.getFullYear() === anio && fecha.getMonth() === m
          return (
            <Button
              key={m}
              variant={activo ? 'default' : 'ghost'}
              size="sm"
              disabled={futuro}
              onClick={() => onSelect(new Date(anio, m, 1))}
              className={cn('capitalize', activo && 'pointer-events-none')}
            >
              {new Date(2000, m, 1).toLocaleDateString('es-MX', { month: 'short' })}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
