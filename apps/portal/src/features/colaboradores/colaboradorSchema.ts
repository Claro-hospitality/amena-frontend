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
  // Rol con el que se da de alta (solo en creación; en edición no se toca). `.catch`
  // (no `.default`) para caer a 'colaborador' tanto si la clave falta como si llega vacía.
  // Un admin de empresa también puede crear otros admins de su empresa (lo valida el backend).
  rol: z.enum(['colaborador', 'admin']).catch('colaborador'),
})

export type ColaboradorFormData = z.infer<typeof colaboradorSchema>
