import { z } from 'zod'

export const eventoSchema = z.object({
  titulo: z.string().trim().min(1, 'El nombre del evento es requerido'),
  descripcion_corta: z.string().trim().min(1, 'La descripción corta es requerida'),
  descripcion_larga: z.string().trim().min(1, 'La descripción completa es requerida'),
  categoria: z.enum(['Cata', 'Taller', 'Cena'], { message: 'Elige una categoría' }),
  fecha: z.string().min(1, 'La fecha es requerida'),
  hora_inicio: z.string().min(1, 'La hora de inicio es requerida'),
  // El input type="time" manda '' cuando está vacío; la columna es nullable.
  hora_fin: z
    .string()
    .transform((v) => (v.trim() === '' ? null : v))
    .nullable(),
  precio: z.coerce.number({ message: 'El precio debe ser un número' }).min(0, 'El precio no puede ser negativo'),
  cupo_total: z.coerce.number({ message: 'El cupo debe ser un número' }).int('El cupo debe ser un número entero').min(1, 'El cupo debe ser al menos 1'),
  lugar: z.string().trim().min(1, 'El lugar es requerido'),
})

export type EventoFormData = z.infer<typeof eventoSchema>

/**
 * La descripción completa se captura como texto libre y se guarda como arreglo de párrafos
 * (columna `text[]`), separados por línea en blanco.
 */
export function aParrafos(texto: string): string[] {
  return texto
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

export function deParrafos(parrafos: string[] | null): string {
  return (parrafos ?? []).join('\n\n')
}
