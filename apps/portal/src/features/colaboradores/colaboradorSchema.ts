import { z } from 'zod'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const colaboradorSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido'),
  email: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .refine((v) => v === null || EMAIL.test(v), 'Correo inválido'),
})

export type ColaboradorFormData = z.infer<typeof colaboradorSchema>
