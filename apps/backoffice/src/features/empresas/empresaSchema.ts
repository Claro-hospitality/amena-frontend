import { parsearMoneda } from '@amena/utils'
import { z } from 'zod'

// RFC mexicano: 3 letras (moral) o 4 (física) + 6 dígitos de fecha + 3 de homoclave (12 o 13).
const RFC_MX = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/

export const empresaSchema = z.object({
  nombre_comercial: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v)),
  precio_comida: z.preprocess(
    (v) => (typeof v === 'string' ? parsearMoneda(v) : v),
    z.number({ error: 'El precio es requerido' }).positive('El precio debe ser mayor a 0')
  ),
  ciclo_facturacion: z.enum(['semanal', 'mensual']).default('mensual'),
})

export type EmpresaFormData = z.infer<typeof empresaSchema>

/**
 * Datos fiscales de una empresa (tabla `datos_fiscales`, 1:1). Requeridos para facturar.
 * `razon_social` y `email_facturacion` obligatorios; `rfc` formato mexicano (12 moral /
 * 13 física, normalizado a mayúsculas); `codigo_postal_fiscal` exactamente 5 dígitos.
 * TODO: catálogos SAT como Select cuando llegue el módulo de facturación (regimen_fiscal / uso_cfdi).
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
  // TODO: catálogos SAT como Select cuando llegue el módulo de facturación.
  regimen_fiscal: z.string().trim().min(1, 'El régimen fiscal es requerido'),
  // TODO: catálogos SAT como Select cuando llegue el módulo de facturación.
  uso_cfdi: z.string().trim().min(1, 'El uso de CFDI es requerido'),
  email_facturacion: z
    .string()
    .trim()
    .min(1, 'El correo de facturación es requerido')
    .email('Correo electrónico inválido'),
})

export type DatosFiscalesFormData = z.infer<typeof datosFiscalesSchema>

/**
 * Política de consumo (sección aparte del detalle de empresa). Valida:
 * - dias_permitidos ⊆ {1..5} (ISO dow, solo días hábiles), sin duplicados.
 * - limite_diario: null (ilimitado) o entero > 0.
 * En modo 'libre' exige al menos un día permitido.
 */
export const politicaConsumoSchema = z
  .object({
    modo_consumo: z.enum(['reserva', 'libre']),
    dias_permitidos: z
      .array(z.number().int().min(1, 'Día inválido').max(5, 'Día inválido'))
      .refine((ds) => new Set(ds).size === ds.length, 'Días duplicados'),
    limite_diario: z
      .number()
      .int('El límite debe ser un número entero')
      .positive('El límite debe ser mayor a 0')
      .nullable(),
  })
  .refine((v) => v.modo_consumo === 'reserva' || v.dias_permitidos.length > 0, {
    message: 'En modo libre debes permitir al menos un día',
    path: ['dias_permitidos'],
  })

export type PoliticaConsumoData = z.infer<typeof politicaConsumoSchema>
