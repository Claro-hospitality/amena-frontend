import { z } from 'zod'

export const platilloSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido'),
  descripcion: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v)),
})

export type PlatilloFormData = z.infer<typeof platilloSchema>
