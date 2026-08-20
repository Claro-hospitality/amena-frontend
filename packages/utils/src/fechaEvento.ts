import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Formatos de fecha con día y año explícitos, para eventos con fecha propia (a diferencia de
 * `semana.ts`, que asume el contexto de una semana de servicio y omite el año).
 *
 * Todas las funciones que reciben `fecha: string` esperan 'YYYY-MM-DD' y la parsean con
 * `parseISO`, que devuelve medianoche LOCAL. Es deliberado: `new Date('2026-01-01')` la
 * interpretaría como UTC y en México mostraría el día anterior.
 */

/** 'YYYY-MM-DD' → Date a medianoche local. */
function deFechaISO(fecha: string): Date {
  return parseISO(fecha)
}

/** "HH:mm:ss" o "HH:mm" → "HH:mm". */
function soloHoraYMinuto(hora: string): string {
  return hora.slice(0, 5)
}

/** Badge compacto con hora, p. ej. "SÁB 15 AGO · 19:00". */
export function fechaBadge(fecha: string, horaInicio: string): string {
  const etiqueta = format(deFechaISO(fecha), 'EEE d MMM', { locale: es })
    .replace(/\./g, '')
    .toUpperCase()
  return `${etiqueta} · ${soloHoraYMinuto(horaInicio)}`
}

/** Fecha larga con año, p. ej. "Sábado 15 de agosto, 2026". */
export function fechaLarga(fecha: string): string {
  const texto = format(deFechaISO(fecha), "EEEE d 'de' MMMM, yyyy", { locale: es })
  return texto[0].toUpperCase() + texto.slice(1)
}

/** Fecha corta con año y hora, p. ej. "Sáb 15 ago 2026 · 19:00 h". */
export function fechaCortaConHora(fecha: string, horaInicio: string): string {
  const etiqueta = format(deFechaISO(fecha), 'EEE d MMM yyyy', { locale: es }).replace(/\./g, '')
  const capitalizada = etiqueta[0].toUpperCase() + etiqueta.slice(1)
  return `${capitalizada} · ${soloHoraYMinuto(horaInicio)} h`
}

/** Rango horario, p. ej. "19:00 — 21:30 h" (o "19:00 h" si no hay hora de fin). */
export function rangoHorario(horaInicio: string, horaFin: string | null): string {
  const inicio = soloHoraYMinuto(horaInicio)
  return horaFin ? `${inicio} — ${soloHoraYMinuto(horaFin)} h` : `${inicio} h`
}

/** Timestamp ISO → "15 ago 2026, 19:04 h" (hora local). */
export function marcaDeTiempo(iso: string): string {
  return format(new Date(iso), "d MMM yyyy, HH:mm 'h'", { locale: es }).replace('.', '')
}
