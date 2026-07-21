import { z } from 'zod'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const colaboradorSchema = z.object({
  rol: z.enum(['admin', 'colaborador'], { error: 'Selecciona un rol' }),
  empresa_id: z
    .string()
    .min(1, 'Selecciona una empresa')
    .transform((v) => Number(v)),
  nombre: z.string().trim().min(1, 'El nombre es requerido'),
  // El correo es obligatorio: es el usuario con el que entrará al portal.
  email: z.string().trim().min(1, 'El correo es requerido').regex(EMAIL, 'Correo inválido'),
  telefono: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v)),
})

export type ColaboradorFormData = z.infer<typeof colaboradorSchema>
