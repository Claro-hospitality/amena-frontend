/**
 * Traduce los fallos de envío de correo a algo que una persona pueda entender y accionar.
 *
 * Sin esto, el error crudo de Postmark llegaba tal cual a la UI. Un admin de empresa veía:
 *   "You tried to send to recipient(s) that have been marked as inactive. Found inactive
 *    addresses: … Inactive recipients are ones that have generated a hard bounce, a spam
 *    complaint, or a manual suppression."
 * En inglés, con jerga de proveedor de correo, y sin decirle qué hacer.
 */

/** Códigos de Postmark que sabemos explicar. Los demás caen en el mensaje genérico. */
const DESTINATARIO_SUPRIMIDO = 406
const CORREO_INVALIDO = 300

/**
 * Postmark suprime una dirección tras un rebote duro o una queja de spam, y a partir de ahí
 * rechaza los envíos localmente. Detectamos el caso por código o, si la función no lo
 * devolvió, por la huella del texto en inglés.
 */
function esDestinatarioSuprimido(codigo: number | null | undefined, crudo: string): boolean {
  if (codigo === DESTINATARIO_SUPRIMIDO) return true
  return /marked as inactive|inactive (addresses|recipients)/i.test(crudo)
}

function esCorreoInvalido(codigo: number | null | undefined, crudo: string): boolean {
  if (codigo === CORREO_INVALIDO) return true
  return /invalid email|error parsing/i.test(crudo)
}

/**
 * Mensaje listo para mostrar. `nombre` es de quien iba a recibir el correo: se incluye para
 * que el admin sepa a quién corregirle la dirección.
 */
export function mensajeErrorCorreo(
  error: string | null | undefined,
  opciones: { codigo?: number | null; nombre?: string } = {}
): string {
  const crudo = error ?? ''
  const dequien = opciones.nombre ? ` de ${opciones.nombre}` : ''

  if (esDestinatarioSuprimido(opciones.codigo, crudo)) {
    return (
      `La dirección de correo${dequien} está bloqueada porque un envío anterior rebotó ` +
      `(la cuenta no existe) o se marcó como spam. Verifica que la dirección sea correcta ` +
      `antes de reintentar.`
    )
  }

  if (esCorreoInvalido(opciones.codigo, crudo)) {
    return `La dirección de correo${dequien} no tiene un formato válido. Corrígela y reintenta.`
  }

  return `No pudimos enviar el correo${dequien}. Vuelve a intentarlo en unos minutos.`
}
