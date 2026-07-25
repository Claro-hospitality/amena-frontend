/**
 * Traduce los errores de negocio de `reservar_cuotas` a mensajes claros en español.
 * La RPC ya lanza en español, pero con ids crudos; aquí damos algo accionable para el admin.
 */
export function mapearErrorReserva(error: unknown): string {
  const e = error as { code?: string; message?: string } | null
  const code = e?.code
  const msg = (e?.message ?? '').toLowerCase()

  if (code === '42501' || msg.includes('no autorizado')) {
    return 'No tienes permiso para reservar cuotas de esta empresa.'
  }
  if (msg.includes('no pertenece')) {
    return 'Un colaborador seleccionado no pertenece a tu empresa. Recarga la página e intenta de nuevo.'
  }
  if (msg.includes('inactivo')) {
    return 'Hay un colaborador inactivo en la reserva. Recarga la lista de colaboradores.'
  }
  if (msg.includes('no existe')) {
    return 'Un colaborador ya no existe. Recarga la lista de colaboradores.'
  }
  if (msg.includes('fin de semana')) {
    return 'Solo se pueden reservar comidas de lunes a viernes.'
  }
  if (msg.includes('ya pasó') || msg.includes('ya paso') || msg.includes('pasada')) {
    return 'No se pueden reservar comidas en fechas pasadas.'
  }
  return 'No se pudo guardar la reserva. Intenta de nuevo.'
}
