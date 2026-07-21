import { parsearMoneda } from '@amena/utils'
import { z } from 'zod'

// RFC mexicano: 3 letras (moral) o 4 (física) + 6 dígitos de fecha + 3 de homoclave (12 o 13).
const RFC_MX = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/

export const empresaSchema = z.object({
  nombre_comercial: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v)),
  razon_social: z.string().trim().min(1, 'La razón social es requerida'),
  rfc: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v.toUpperCase()))
    .refine(
      (v) => v === null || RFC_MX.test(v),
      'RFC inválido (formato mexicano de 12 o 13 caracteres)'
    ),
  precio_comida: z.preprocess(
    (v) => (typeof v === 'string' ? parsearMoneda(v) : v),
    z.number({ error: 'El precio es requerido' }).positive('El precio debe ser mayor a 0')
  ),
  ciclo_facturacion: z.enum(['semanal', 'mensual']).default('mensual'),
})

export type EmpresaFormData = z.infer<typeof empresaSchema>
