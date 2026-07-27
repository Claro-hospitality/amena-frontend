import { parsearMoneda } from '@amena/utils'
import { z } from 'zod'

// El schema fiscal (razón social, RFC, CFDI, etc.) es regla de negocio compartida con el
// portal → vive en @amena/utils. Se re-exporta aquí para no tocar los call-sites del backoffice.
export { datosFiscalesSchema, type DatosFiscalesFormData } from '@amena/utils'

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
