import { z } from 'zod'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const colaboradorSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido'),
  // El correo es OBLIGATORIO: es la cuenta de acceso al portal (la Edge Function de alta
  // también lo exige). Vacío → "requerido"; con formato inválido → "Correo inválido".
  email: z
    .string()
    .trim()
    .min(1, 'El correo es requerido')
    .regex(EMAIL, 'Correo inválido'),
})

export type ColaboradorFormData = z.infer<typeof colaboradorSchema>
