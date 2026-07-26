import { horaCorta } from '@amena/utils'
import type { BusquedaComensal } from './api'

const RE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** El contenido del QR debe ser un UUID (el colaborador_id). */
export function esUuidValido(texto: string): boolean {
  return RE_UUID.test(texto.trim())
}

/**
 * Traduce el mensaje de negocio de `registrar_consumo` al texto corto y GIGANTE
 * de la pantalla de rechazo. "El colaborador no existe" se muestra como "QR no válido".
 */
export function mapearMotivoRechazo(error: unknown): string {
  const original = (error as { message?: string } | null)?.message ?? ''
  const msg = original.toLowerCase()
  if (msg.includes('no existe')) return 'QR no válido'
  if (msg.includes('empresa') && msg.includes('inactiva')) return 'Empresa inactiva'
  if (msg.includes('inactivo')) return 'Colaborador inactivo'
  if (msg.includes('ya consumió') || msg.includes('ya consumio')) return 'Ya consumió hoy'
  // Consumo libre: día no permitido y límite diario alcanzado.
  if (msg.includes('día permitido') || msg.includes('dia permitido')) return 'Hoy no es día permitido'
  // El RPC ya trae "(N de M)"; se muestra tal cual, con respaldo si no.
  if (msg.includes('límite diario') || msg.includes('limite diario'))
    return original || 'Límite diario alcanzado'
  if (msg.includes('cuota')) return 'Sin cuota para hoy'
  return 'No se pudo registrar'
}

/**
 * Texto del estado de HOY de un comensal para el registro manual:
 * "Libre: N de M hoy" / "Ya consumió a las HH:MM" / "Con cuota disponible" / "Sin cuota para hoy".
 */
export function estadoComensalTexto(c: BusquedaComensal): string {
  if (c.es_libre) {
    const tope = c.limite_diario == null ? '∞' : String(c.limite_diario)
    return `Libre: ${c.consumos_hoy} de ${tope} hoy`
  }
  if (c.consumio_hoy) {
    const hora = c.ultima_hora ? horaCorta(new Date(c.ultima_hora)) : ''
    return hora ? `Ya consumió a las ${hora}` : 'Ya consumió hoy'
  }
  return c.tiene_cuota ? 'Con cuota disponible' : 'Sin cuota para hoy'
}

/**
 * ¿El registro manual pasaría ahora mismo? Es una previsualización para la UI; la RPC
 * `registrar_consumo_manual` revalida (fuente de verdad) y puede rechazar por una carrera.
 */
export function puedeRegistrar(c: BusquedaComensal): boolean {
  if (c.es_libre) return c.limite_diario == null || c.consumos_hoy < c.limite_diario
  return c.tiene_cuota && !c.consumio_hoy
}

/** Anti-doble-lectura: ignora el mismo QR si se releyó dentro de la ventana. */
export function debeIgnorarLectura(
  id: string,
  ultima: { id: string; ts: number } | null,
  ahoraMs: number,
  ventanaMs = 5000
): boolean {
  return !!ultima && ultima.id === id && ahoraMs - ultima.ts < ventanaMs
}
