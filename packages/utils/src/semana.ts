import { addDays, format, isBefore, parseISO, startOfDay, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'

/** Lunes (00:00) de la semana que contiene la fecha (las semanas inician en lunes). */
export function lunesDeSemana(fecha: Date): Date {
  return startOfWeek(fecha, { weekStartsOn: 1 })
}

/** Los 5 días hábiles (lunes a viernes) a partir del lunes dado. */
export function diasHabiles(lunes: Date): Date[] {
  return Array.from({ length: 5 }, (_, i) => addDays(lunes, i))
}

/** Rango legible de la semana, p. ej. "13–17 jul 2026". */
export function rangoSemanaLegible(lunes: Date): string {
  const viernes = addDays(lunes, 4)
  return `${format(lunes, 'd', { locale: es })}–${format(viernes, 'd MMM yyyy', { locale: es })}`
}

/** Etiqueta de un día para las columnas del calendario, p. ej. "lunes 13". */
export function etiquetaDia(fecha: Date): string {
  return format(fecha, "EEEE d", { locale: es })
}

/** Nombre del mes con año, p. ej. "julio 2026". */
export function etiquetaMes(fecha: Date): string {
  return format(fecha, 'MMMM yyyy', { locale: es })
}

/** Etiqueta corta de un día para toggles/chips, p. ej. "lun. 13". */
export function etiquetaDiaCorta(fecha: Date): string {
  return format(fecha, 'EEE d', { locale: es })
}

/** ¿La fecha es anterior a hoy? (los días pasados del menú son de solo lectura) */
export function esFechaPasada(fecha: Date, hoy: Date = new Date()): boolean {
  return isBefore(startOfDay(fecha), startOfDay(hoy))
}

/** Date → 'YYYY-MM-DD' (para columnas `date` de Supabase). */
export function aISO(fecha: Date): string {
  return format(fecha, 'yyyy-MM-dd')
}

/** 'YYYY-MM-DD' → Date (medianoche local). */
export function deISO(iso: string): Date {
  return parseISO(iso)
}

/** Hora local corta "HH:mm" (para el ticket del escáner y la lista del día). */
export function horaCorta(fecha: Date): string {
  return format(fecha, 'HH:mm')
}
