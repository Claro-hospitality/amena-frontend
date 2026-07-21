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
  const msg = ((error as { message?: string } | null)?.message ?? '').toLowerCase()
  if (msg.includes('no existe')) return 'QR no válido'
  if (msg.includes('empresa') && msg.includes('inactiva')) return 'Empresa inactiva'
  if (msg.includes('inactivo')) return 'Colaborador inactivo'
  if (msg.includes('ya consumió') || msg.includes('ya consumio')) return 'Ya consumió hoy'
  if (msg.includes('cuota')) return 'Sin cuota para hoy'
  return 'No se pudo registrar'
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
