// Validación fiscal compartida entre apps (backoffice y portal). Vive aquí (paquete común)
// para no duplicar la regla de negocio del RFC/CFDI entre los dos frontends.
import { z } from 'zod'

// RFC mexicano: 3 letras (moral) o 4 (física) + 6 dígitos de fecha + 3 de homoclave (12 o 13).
export const RFC_MX = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/

/** Tasa de IVA trasladado (16%). Espeja IVA_RATE del backend (facturar-corte). */
export const IVA_RATE = 0.16

function redondear2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

/** Subtotal (base gravable), IVA trasladado y total con IVA de un monto. */
export interface DesgloseMontos {
  subtotal: number
  iva: number
  total: number
}

/**
 * Desglosa un monto que YA incluye IVA (el `monto_total` congelado del corte) hacia dentro:
 * `subtotal = total / (1 + IVA_RATE)`, `iva = total − subtotal` (así `subtotal + iva === total`
 * al centavo). Espeja `calcularMontos` del backend (Edge Function `facturar-corte`) para que el
 * desglose de la UI cuadre exactamente con la factura emitida.
 */
export function desglosarMontoConIva(totalConIva: number): DesgloseMontos {
  const total = redondear2(totalConIva)
  const subtotal = redondear2(total / (1 + IVA_RATE))
  const iva = redondear2(total - subtotal)
  return { subtotal, iva, total }
}

/**
 * Datos fiscales de una empresa (tabla `datos_fiscales`, 1:1). Requeridos para facturar.
 * `razon_social` y `email_facturacion` obligatorios; `rfc` formato mexicano (12 moral /
 * 13 física, normalizado a mayúsculas); `codigo_postal_fiscal` exactamente 5 dígitos.
 * TODO: catálogos SAT como Select (regimen_fiscal / uso_cfdi) cuando se cableen.
 */
export const datosFiscalesSchema = z.object({
  razon_social: z.string().trim().min(1, 'La razón social es requerida'),
  rfc: z
    .string()
    .trim()
    .min(1, 'El RFC es requerido')
    .transform((v) => v.toUpperCase())
    .refine((v) => RFC_MX.test(v), 'RFC inválido (formato mexicano de 12 o 13 caracteres)'),
  codigo_postal_fiscal: z
    .string()
    .trim()
    .regex(/^\d{5}$/, 'El código postal debe tener 5 dígitos'),
  regimen_fiscal: z.string().trim().min(1, 'El régimen fiscal es requerido'),
  uso_cfdi: z.string().trim().min(1, 'El uso de CFDI es requerido'),
  email_facturacion: z
    .string()
    .trim()
    .min(1, 'El correo de facturación es requerido')
    .email('Correo electrónico inválido'),
})

export type DatosFiscalesFormData = z.infer<typeof datosFiscalesSchema>

/** Nombre comercial de la empresa: opcional, se recorta y `''` → `null`. */
export const nombreComercialSchema = z.object({
  nombre_comercial: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v)),
})

export type NombreComercialFormData = z.infer<typeof nombreComercialSchema>
